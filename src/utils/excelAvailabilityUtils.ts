import * as XLSX from 'xlsx';
import { Employee, EmployeeAvailability, DayAvailability } from '../types';
import { sortEmployeesByFirstName } from './employeeSortUtils';

export interface ParsedAvailabilityRow {
  rawId?: string;
  rawName: string;
  matchedEmployee?: Employee;
  weekNumber: number;
  days: DayAvailability[];
  notes?: string;
  rawDepartment?: string;
  validationStatus: 'matched' | 'unmatched_name' | 'empty_days';
  summary: {
    availableCount: number;
    preferredCount: number;
    unavailableCount: number;
  };
}

export interface ParsedAvailabilityResult {
  fileName?: string;
  detectedWeekNumber: number;
  rows: ParsedAvailabilityRow[];
  totalMatched: number;
  totalUnmatched: number;
  errors: string[];
}

const DAYS_DUTCH = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

/**
 * Normalizes a single time fragment like "17u30", "17u", "17:30", "17.30", "18" into "HH:MM"
 */
function normalizeTimeFragment(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed === 'sluit' || trimmed === 'hulpsluit' || trimmed === 'open') {
    return trimmed;
  }

  // e.g. 17u30, 9u, 17u
  if (trimmed.includes('u')) {
    const parts = trimmed.split('u');
    const h = (parseInt(parts[0], 10) || 0).toString().padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    return `${h}:${m}`;
  }

  // e.g. 17.30 or 17.00
  if (trimmed.includes('.')) {
    const parts = trimmed.split('.');
    const h = (parseInt(parts[0], 10) || 0).toString().padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    return `${h}:${m}`;
  }

  // e.g. 17:30
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    const h = (parseInt(parts[0], 10) || 0).toString().padStart(2, '0');
    const m = (parts[1] || '00').padStart(2, '0');
    return `${h}:${m}`;
  }

  // Pure number e.g. "18"
  const num = parseInt(trimmed, 10);
  if (!isNaN(num) && num >= 0 && num <= 24) {
    return `${num.toString().padStart(2, '0')}:00`;
  }

  return trimmed;
}

/**
 * Extracts time ranges or single times, with special support for hours between parentheses:
 * e.g. "(17:00 - 23:00)", "Ja (17u - 23u)", "(17u30 - 23u)", "(17u - sluit)", "(va 18u)", "(tot 22u)", "(18u)"
 */
function extractTimes(text: string): { startTime?: string; endTime?: string; noteText?: string } {
  const clean = text.trim();
  if (!clean) return {};

  // First, look specifically inside parentheses/brackets like "(17:00 - 23:00)" or "[18u - sluit]"
  const parenMatches = clean.match(/[\(\[](.*?)[\)\]]/g);
  const targetsToInspect: string[] = [];
  if (parenMatches && parenMatches.length > 0) {
    parenMatches.forEach(pm => {
      targetsToInspect.push(pm.replace(/[\(\[\]\)]/g, '').trim());
    });
  }
  targetsToInspect.push(clean);

  for (const target of targetsToInspect) {
    // Pattern 1: Time range with separator ( - , tot, t/m, -> )
    // e.g. 17:00 - 23:00, 17u30 - 23u, 17.30-23.00, 17u - sluit, 11u30 - 18u, open - 17u
    const rangeRegex = /([0-2]?[0-9](?:[:.][0-5][0-9]|u(?:[0-5][0-9])?)?|open)\s*(?:-|–|—|tot|totenmet|t\/m|->)\s*([0-2]?[0-9](?:[:.][0-5][0-9]|u(?:[0-5][0-9])?)?|sluit|hulpsluit)/i;
    const rangeMatch = target.match(rangeRegex);
    if (rangeMatch) {
      const rawStart = rangeMatch[1];
      const rawEnd = rangeMatch[2];
      const startTime = normalizeTimeFragment(rawStart);
      const endTime = normalizeTimeFragment(rawEnd);
      return { startTime, endTime, noteText: target };
    }

    // Pattern 2: "va." or "vanaf" or "na" with time
    // e.g. va 18u, vanaf 17:30, va. 18:00, na 17u
    const vaRegex = /(?:va\.?|vanaf|na|from)\s*([0-2]?[0-9](?:[:.][0-5][0-9]|u(?:[0-5][0-9])?)?)/i;
    const vaMatch = target.match(vaRegex);
    if (vaMatch) {
      const startTime = normalizeTimeFragment(vaMatch[1]);
      return { startTime, noteText: target };
    }

    // Pattern 3: "tot" with time or "tot sluit"
    // e.g. tot 22u, tot 23:00, tot sluit
    const totRegex = /(?:tot|until|before)\s*([0-2]?[0-9](?:[:.][0-5][0-9]|u(?:[0-5][0-9])?)?|sluit|hulpsluit)/i;
    const totMatch = target.match(totRegex);
    if (totMatch) {
      const endTime = normalizeTimeFragment(totMatch[1]);
      return { endTime, noteText: target };
    }

    // Pattern 4: Single time expression inside target e.g. "18u", "17:30", "18:00", "sluit"
    const singleTimeRegex = /\b([0-2]?[0-9](?:[:.][0-5][0-9]|u(?:[0-5][0-9])?)|sluit|hulpsluit)\b/i;
    const singleMatch = target.match(singleTimeRegex);
    if (singleMatch && (target === singleMatch[1] || targetsToInspect.length > 1)) {
      const startTime = normalizeTimeFragment(singleMatch[1]);
      return { startTime, noteText: target };
    }
  }

  return {};
}

/**
 * Parses a single day cell value from Excel into a DayAvailability object
 */
export function parseDayCellValue(val: any, dayIndex: number): DayAvailability | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str) return null;

  const lower = str.toLowerCase();
  const times = extractTimes(str);

  // Determine status
  let status: 'available' | 'unavailable' | 'preferred' = 'available';

  if (
    lower.includes('voorkeur') || 
    lower.includes('graag') || 
    lower.includes('prefer') || 
    lower.includes('ster') || 
    lower.includes('⭐') || 
    lower === '*' || 
    lower === 'p'
  ) {
    status = 'preferred';
  } else if (
    // If it says "niet tot 18u" or "nee tot 18u", it means they ARE available from 18u!
    lower.includes('niet tot') || 
    lower.includes('nee tot') ||
    lower.includes('kan niet tot')
  ) {
    status = 'available';
  } else if (
    lower.includes('verhinderd') || 
    lower.includes('niet') || 
    lower.includes('nee') || 
    lower.includes('unavail') || 
    lower.includes('bezet') || 
    lower.includes('vrij') || 
    lower.includes('verlof') || 
    lower.includes('ziek') || 
    lower === 'x' || 
    lower === '0' || 
    lower === '-'
  ) {
    // If there are specific hours given with "niet", e.g. "niet (18u-23u)", still keep unavailable or note
    status = 'unavailable';
  } else if (
    lower.includes('kan') || 
    lower.includes('ja') || 
    lower.includes('beschik') || 
    lower.includes('avail') || 
    lower.includes('ok') || 
    lower === 'v' || 
    lower === '1' || 
    lower === 'j' ||
    times.startTime !== undefined ||
    times.endTime !== undefined
  ) {
    status = 'available';
  }

  const dayResult: DayAvailability = {
    day: dayIndex,
    status
  };

  if (times.startTime) {
    dayResult.startTime = times.startTime;
  }
  if (times.endTime) {
    dayResult.endTime = times.endTime;
  }
  if (str) {
    dayResult.notes = str;
  }

  return dayResult;
}

/**
 * Generates and downloads a rich Excel (.xlsx) file with current staff availability
 * or blank template for a specific week number.
 */
export function exportAvailabilityToExcel(
  employees: Employee[],
  availabilities: EmployeeAvailability[],
  weekNumber: number,
  options: { blankTemplate?: boolean; filename?: string } = {}
) {
  const staff = sortEmployeesByFirstName(employees.filter(e => e.id !== 'emp1')); // Staff only
  const isBlank = !!options.blankTemplate;

  // 1. Prepare Main Sheet Data
  const headers = [
    'Medewerker_ID',
    'Naam',
    'Afdeling',
    'Statuut',
    'Week',
    'Maandag',
    'Dinsdag',
    'Woensdag',
    'Donderdag',
    'Vrijdag',
    'Zaterdag',
    'Zondag',
    'Opmerkingen'
  ];

  const dataRows: any[][] = [];

  staff.forEach(emp => {
    const empAvail = !isBlank 
      ? availabilities.find(a => a.employeeId === emp.id && a.weekNumber === weekNumber)
      : null;

    const row: any[] = [
      emp.id,
      emp.name,
      emp.department,
      emp.statuut,
      weekNumber
    ];

    // For each day 0..6
    for (let d = 0; d < 7; d++) {
      if (isBlank || !empAvail) {
        row.push(''); // Empty cell ready for input
      } else {
        const dayObj = empAvail.days.find(day => day.day === d);
        if (!dayObj) {
          row.push('');
        } else if (dayObj.status === 'preferred') {
          const time = (dayObj.startTime || dayObj.endTime) 
            ? ` (${dayObj.startTime || ''}${dayObj.endTime ? ` - ${dayObj.endTime}` : ''})`
            : '';
          row.push(`Voorkeur${time}`);
        } else if (dayObj.status === 'unavailable') {
          row.push('Niet-beschikbaar');
        } else {
          // available
          const time = (dayObj.startTime || dayObj.endTime) 
            ? ` (${dayObj.startTime || ''}${dayObj.endTime ? ` - ${dayObj.endTime}` : ''})`
            : '';
          row.push(`Beschikbaar${time}`);
        }
      }
    }

    // Notes
    row.push(empAvail?.days.map(d => d.notes).filter(Boolean).join('; ') || '');
    dataRows.push(row);
  });

  // 2. Create Sheet 1: Availability
  const wsAvailability = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Set column widths
  wsAvailability['!cols'] = [
    { wch: 15 }, // Medewerker_ID
    { wch: 24 }, // Naam
    { wch: 12 }, // Afdeling
    { wch: 12 }, // Statuut
    { wch: 8 },  // Week
    { wch: 18 }, // Maandag
    { wch: 18 }, // Dinsdag
    { wch: 18 }, // Woensdag
    { wch: 18 }, // Donderdag
    { wch: 18 }, // Vrijdag
    { wch: 18 }, // Zaterdag
    { wch: 18 }, // Zondag
    { wch: 30 }  // Opmerkingen
  ];

  // 3. Create Sheet 2: Legenda & Instructies
  const instructionsData = [
    ['INSTRUCTIES & LEGENDA — BESCHIKBAARHEDEN UPLOADEN (CAFÉ IN DE MOLEN)'],
    [''],
    ['HOE WERKT HET?'],
    ['1. Vul in de kolommen "Maandag" t/m "Zondag" per medewerker de beschikbaarheid in.'],
    ['2. Laat de kolom "Medewerker_ID" en "Naam" intact zodat het systeem de juiste collega herkent.'],
    ['3. Sla het bestand op en upload het via de knop "Upload Excel Bestand" in het beheerdersportaal.'],
    [''],
    ['TOEGESTANE WAARDEN PER DAG:'],
    ['Status', 'Wat u kunt intypen', 'Betekenis'],
    ['Beschikbaar', 'Beschikbaar, Kan, Ja, V, 1', 'Medewerker is beschikbaar om ingepland te worden.'],
    ['Voorkeur', 'Voorkeur, Graag, *, P, Ster', 'Medewerker wil hier bij voorkeur heel graag werken.'],
    ['Niet-beschikbaar', 'Niet-beschikbaar, Verhinderd, Nee, Niet, X, 0, Verlof', 'Medewerker kan pertinent NIET werken.'],
    ['Leeg laten', '(leeg)', 'Wordt overgeslagen of behoudt huidige instelling.'],
    [''],
    ['TIJDEN & SHIFTS SPECIFICEREN (OPTIONEEL):'],
    ['U kunt direct tijdrestricties toevoegen tussen haakjes of erbij typen, zoals:'],
    ['• "Beschikbaar (17:00 - 23:00)"'],
    ['• "Beschikbaar vanaf 18:00" of "va. 18u"'],
    ['• "Voorkeur (vanaf 10:00)" (zondag opening)'],
    ['• "Niet-beschikbaar (tot 19:00)"'],
    [''],
    ['AUTOMATISCHE CLOUD BACKUP:'],
    ['Zodra u het bestand uploadt, worden alle beschikbaarheden direct verwerkt en tevens veilig opgeslagen in Google Cloud Firestore!']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [
    { wch: 25 },
    { wch: 45 },
    { wch: 70 }
  ];

  // 4. Build Workbook
  const wb = XLSX.utils.book_new();
  const sheetTitle = `Beschikbaarheid_W${weekNumber}`;
  XLSX.utils.book_append_sheet(wb, wsAvailability, sheetTitle);
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructies & Legenda');

  // 5. Download
  const filename = options.filename || `beschikbaarheden_week_${weekNumber}_in_de_molen.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Exports to CSV with UTF-8 BOM and semicolon delimiters
 */
export function exportAvailabilityToCSV(
  employees: Employee[],
  availabilities: EmployeeAvailability[],
  weekNumber: number,
  filename = `beschikbaarheden_week_${weekNumber}_in_de_molen.csv`
) {
  const staff = sortEmployeesByFirstName(employees.filter(e => e.id !== 'emp1'));
  const headers = ['Medewerker_ID', 'Naam', 'Afdeling', 'Statuut', 'Week', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag', 'Opmerkingen'];
  
  const rows = staff.map(emp => {
    const empAvail = availabilities.find(a => a.employeeId === emp.id && a.weekNumber === weekNumber);
    
    const dayCols = [];
    for (let d = 0; d < 7; d++) {
      const dayObj = empAvail?.days.find(day => day.day === d);
      if (!dayObj) {
        dayCols.push('');
      } else if (dayObj.status === 'preferred') {
        const time = (dayObj.startTime || dayObj.endTime) ? ` (${dayObj.startTime || ''}-${dayObj.endTime || ''})` : '';
        dayCols.push(`"Voorkeur${time}"`);
      } else if (dayObj.status === 'unavailable') {
        dayCols.push('"Niet-beschikbaar"');
      } else {
        const time = (dayObj.startTime || dayObj.endTime) ? ` (${dayObj.startTime || ''}-${dayObj.endTime || ''})` : '';
        dayCols.push(`"Beschikbaar${time}"`);
      }
    }

    return [
      emp.id,
      `"${(emp.name || '').replace(/"/g, '""')}"`,
      emp.department,
      emp.statuut,
      weekNumber,
      ...dayCols,
      `"${(empAvail?.days.map(d => d.notes).filter(Boolean).join('; ') || '').replace(/"/g, '""')}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw array of rows from Excel into ParsedAvailabilityResult
 */
export function parseAvailabilityDataRows(
  rawRows: any[][],
  defaultWeekNumber: number,
  registeredEmployees: Employee[]
): ParsedAvailabilityResult {
  if (!rawRows || rawRows.length === 0) {
    return {
      detectedWeekNumber: defaultWeekNumber,
      rows: [],
      totalMatched: 0,
      totalUnmatched: 0,
      errors: ['Geen gegevensrijen gevonden in het bestand.']
    };
  }

  // Find header row (looks for "naam", "name", "maandag", or "medewerker")
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
    const row = rawRows[i].map(c => String(c ?? '').trim().toLowerCase());
    if (
      row.some(c => c.includes('naam') || c.includes('name') || c.includes('medewerker')) &&
      row.some(c => c.includes('maandag') || c.includes('dinsdag') || c.includes('mon') || c.includes('zaal') || c.includes('keuken'))
    ) {
      headerIndex = i;
      break;
    }
  }

  // Fallback: if first row has "naam" or "medewerker"
  if (headerIndex === -1) {
    const r0 = rawRows[0].map(c => String(c ?? '').trim().toLowerCase());
    if (r0.some(c => c.includes('naam') || c.includes('name') || c.includes('medewerker') || c.includes('id'))) {
      headerIndex = 0;
    }
  }

  if (headerIndex === -1) {
    return {
      detectedWeekNumber: defaultWeekNumber,
      rows: [],
      totalMatched: 0,
      totalUnmatched: 0,
      errors: ['De kolomkoppen konden niet worden gevonden. Zorg dat de kolommen "Naam" en "Maandag" t/m "Zondag" aanwezig zijn.']
    };
  }

  const headers = rawRows[headerIndex].map(c => String(c ?? '').trim().toLowerCase());
  
  const idIdx = headers.findIndex(h => h === 'id' || h.includes('medewerker_id') || h.includes('empid'));
  const nameIdx = headers.findIndex(h => h.includes('naam') || h.includes('name'));
  const deptIdx = headers.findIndex(h => h.includes('afdeling') || h.includes('dept'));
  const weekIdx = headers.findIndex(h => h.includes('week'));
  const notesIdx = headers.findIndex(h => h.includes('opmerking') || h.includes('notitie') || h.includes('notes'));

  // Day columns matching (Maandag=0 ... Zondag=6)
  const dayIndices: number[] = [];
  const dayNamesDutch = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
  const dayNamesShort = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];

  for (let d = 0; d < 7; d++) {
    const fullName = dayNamesDutch[d];
    const shortName = dayNamesShort[d];
    
    let foundIdx = headers.findIndex(h => h.startsWith(fullName) || h.includes(fullName));
    if (foundIdx === -1) {
      foundIdx = headers.findIndex(h => h === shortName || h.startsWith(`${shortName}_`));
    }
    dayIndices.push(foundIdx);
  }

  const parsedRows: ParsedAvailabilityRow[] = [];
  let detectedWeek = defaultWeekNumber;
  const errors: string[] = [];

  for (let r = headerIndex + 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawId = idIdx !== -1 && row[idIdx] ? String(row[idIdx]).trim() : undefined;
    const rawName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';

    if (!rawId && !rawName) continue; // skip completely empty rows

    // Detect row week
    let rowWeek = defaultWeekNumber;
    if (weekIdx !== -1 && row[weekIdx]) {
      const parsedWk = parseInt(String(row[weekIdx]).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedWk) && parsedWk > 0 && parsedWk <= 53) {
        rowWeek = parsedWk;
        detectedWeek = parsedWk;
      }
    }

    // Match employee
    let matchedEmp: Employee | undefined = undefined;
    if (rawId) {
      matchedEmp = registeredEmployees.find(e => e.id.toLowerCase() === rawId.toLowerCase());
    }
    if (!matchedEmp && rawName) {
      const cleanName = rawName.toLowerCase().trim();
      matchedEmp = registeredEmployees.find(e => e.name.toLowerCase().trim() === cleanName);
      if (!matchedEmp) {
        // Try matching by first name
        matchedEmp = registeredEmployees.find(e => {
          const empFirstName = e.name.split(/\s+/)[0].toLowerCase();
          const rowFirstName = cleanName.split(/\s+/)[0];
          return empFirstName === rowFirstName && empFirstName.length >= 2;
        });
      }
    }

    // Parse days
    const days: DayAvailability[] = [];
    let availableCount = 0;
    let preferredCount = 0;
    let unavailableCount = 0;

    for (let d = 0; d < 7; d++) {
      const colIdx = dayIndices[d];
      if (colIdx !== -1 && colIdx < row.length) {
        const cellVal = row[colIdx];
        const dayAvail = parseDayCellValue(cellVal, d);
        if (dayAvail) {
          days.push(dayAvail);
          if (dayAvail.status === 'preferred') preferredCount++;
          else if (dayAvail.status === 'unavailable') unavailableCount++;
          else availableCount++;
        }
      }
    }

    const rowNotes = notesIdx !== -1 && row[notesIdx] ? String(row[notesIdx]).trim() : undefined;

    let validationStatus: 'matched' | 'unmatched_name' | 'empty_days' = 'matched';
    if (!matchedEmp) {
      validationStatus = 'unmatched_name';
    } else if (days.length === 0) {
      validationStatus = 'empty_days';
    }

    parsedRows.push({
      rawId,
      rawName: rawName || matchedEmp?.name || rawId || 'Onbekend',
      matchedEmployee: matchedEmp,
      weekNumber: rowWeek,
      days,
      notes: rowNotes,
      rawDepartment: deptIdx !== -1 ? String(row[deptIdx] || '') : undefined,
      validationStatus,
      summary: {
        availableCount,
        preferredCount,
        unavailableCount
      }
    });
  }

  const totalMatched = parsedRows.filter(r => r.validationStatus === 'matched').length;
  const totalUnmatched = parsedRows.filter(r => r.validationStatus === 'unmatched_name').length;

  return {
    detectedWeekNumber: detectedWeek,
    rows: parsedRows,
    totalMatched,
    totalUnmatched,
    errors
  };
}

/**
 * Parses an uploaded Excel or CSV file
 */
export async function parseAvailabilityFile(
  file: File,
  defaultWeekNumber: number,
  registeredEmployees: Employee[]
): Promise<ParsedAvailabilityResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({
            detectedWeekNumber: defaultWeekNumber,
            rows: [],
            totalMatched: 0,
            totalUnmatched: 0,
            errors: ['Kon het bestand niet inlezen.']
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary', raw: false });
        
        // Pick the first sheet that doesn't start with "instructies"
        let sheetName = workbook.SheetNames[0];
        for (const name of workbook.SheetNames) {
          if (!name.toLowerCase().includes('instruct') && !name.toLowerCase().includes('legend')) {
            sheetName = name;
            break;
          }
        }

        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) {
          resolve({
            detectedWeekNumber: defaultWeekNumber,
            rows: [],
            totalMatched: 0,
            totalUnmatched: 0,
            errors: ['Geen geldig tabblad gevonden in het Excel-bestand.']
          });
          return;
        }

        const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1, defval: '' });
        const result = parseAvailabilityDataRows(rawRows, defaultWeekNumber, registeredEmployees);
        result.fileName = file.name;
        resolve(result);
      } catch (err: any) {
        reject(new Error(`Fout bij verwerken Excel-bestand: ${err.message || err}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Er is een fout opgetreden bij het lezen van het bestand.'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Parses copied-and-pasted tabular data (tab-separated or semicolon-separated)
 */
export function parsePastedAvailabilityText(
  text: string,
  defaultWeekNumber: number,
  registeredEmployees: Employee[]
): ParsedAvailabilityResult {
  if (!text || !text.trim()) {
    return {
      detectedWeekNumber: defaultWeekNumber,
      rows: [],
      totalMatched: 0,
      totalUnmatched: 0,
      errors: ['Geen tekst geplakt.']
    };
  }

  const lines = text.trim().split(/\r?\n/);
  const delimiter = lines[0].includes('\t') ? '\t' : (lines[0].includes(';') ? ';' : ',');

  const rawRows = lines.map(line => {
    return line.split(delimiter).map(cell => cell.replace(/^"(.*)"$/, '$1').trim());
  });

  return parseAvailabilityDataRows(rawRows, defaultWeekNumber, registeredEmployees);
}
