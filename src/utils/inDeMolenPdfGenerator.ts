import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, Shift } from '../types';
import { getDayDateInfo, CURRENT_WEEK_NUMBER } from './weekUtils';

const DAYS_FULL_NL = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

/**
 * Converteert de volledige medewerkersnaam naar de herkenbare korte roepnaam
 * zoals gebruikt op het officiële prikbord- en weekrooster van In De Molen.
 */
export function getShortEmployeeName(emp?: Employee | null, allEmployees?: Employee[]): string {
  if (!emp || !emp.name) return '';
  const raw = emp.name.trim();
  const lower = raw.toLowerCase();

  if (lower.includes('matthias vanparijs') || lower.includes('matthias van parijs')) return 'Matthias VP';
  if (lower.includes('mathias cakoni')) return 'Mathias C';
  if (lower.includes('mirte christiaen')) return 'Mirte C';
  if (lower.includes('juliette vander beken')) return 'Juliette VdB';
  if (lower.includes('patrick gevaert')) return 'Pat';
  if (lower.includes('jonathan gielens')) return 'Jonathan';
  if (lower.includes('noah kuijpers')) return 'Noah';
  if (lower.includes('naomie vandermosten')) return 'Naomie';
  if (lower.includes('emma van den broeck')) return 'Emma';
  if (lower.includes('arthur vander beken')) return 'Arthur';
  if (lower.includes('silvia vanderschrieck')) return 'Silvia';
  if (lower.includes('mégane') || lower.includes('megane')) return 'Mégane';
  if (lower.includes('renée') || lower.includes('renee')) return 'Renée';
  if (lower.includes('haddy')) return 'Haddy';
  if (lower.includes('christophe')) return 'Christophe';
  if (lower.includes('elke')) return 'Elke';
  if (lower.includes('toon')) return 'Toon';
  if (lower.includes('niels')) return 'Niels';
  if (lower.includes('sander')) return 'Sander';
  if (lower.includes('isabel')) return 'Isabel';
  if (lower.includes('lamine')) return 'Lamine';
  if (lower.includes('lien')) return 'Lien';
  if (lower.includes('fien')) return 'Fien';
  if (lower.includes('linne')) return 'Linne';
  if (lower.includes('geertrui')) return 'Geertrui';
  if (lower.includes('alexander')) return 'Alexander';

  // Standaard eerste naam met hoofdletter
  const parts = raw.split(/\s+/);
  const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();

  // Indien er meerdere personen met dezelfde voornaam zijn, voeg achterletter toe
  if (allEmployees && allEmployees.length > 0) {
    const duplicates = allEmployees.filter(
      e => e.id !== emp.id && e.name.trim().toLowerCase().startsWith(parts[0].toLowerCase())
    );
    if (duplicates.length > 0 && parts.length > 1) {
      return `${firstName} ${parts[parts.length - 1].charAt(0).toUpperCase()}`;
    }
  }

  return firstName;
}

/**
 * Converteert een uurtijd naar decimaal uur (bv. "11:30" -> 11.5, "open" -> 11.5 op weekdagen of 10.0 op zo)
 */
export function timeStringToDecimal(timeStr?: string, isEnd = false, day = 0): number {
  if (!timeStr) return isEnd ? 24.0 : 11.5;
  const lower = timeStr.trim().toLowerCase();

  if (lower.includes('open')) {
    return day === 6 ? 10.0 : 11.5;
  }
  if (lower.includes('sluit')) {
    return 24.5; // Loopt door tot na middernacht / sluit
  }
  if (lower.includes('hulpsluit')) {
    return 24.0;
  }

  const match = lower.match(/^(\d{1,2})[:uh.]?(\d{2})?$/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    let dec = h + m / 60;
    // Tijden zoals 00:00, 01:00, 02:00 die in de nacht liggen
    if (isEnd && dec < 6) {
      dec += 24;
    }
    return dec;
  }

  const num = parseFloat(lower.replace(',', '.'));
  if (!isNaN(num)) return num;

  return isEnd ? 24.0 : 11.5;
}

export interface DayTimelineSlot {
  label: string; // Bv. "11.00-11.30", "sluit"
  isSluitRow: boolean;
  startDec: number;
  endDec: number;
}

/**
 * Genereert de standaard 30-minuten tijdsblokken voor een dag.
 * - Zondag start vanaf 09.30-10.00 tot 23.30-00.00 + sluit
 * - Maandag t/m Zaterdag start vanaf 11.00-11.30 tot 23.30-00.00 + sluit
 */
export function generateDayTimeSlots(dayIndex: number, earliestStartDec?: number): DayTimelineSlot[] {
  const slots: DayTimelineSlot[] = [];

  let startH = dayIndex === 6 ? 9.5 : 11.0;
  if (earliestStartDec !== undefined && earliestStartDec < startH) {
    startH = Math.floor(earliestStartDec * 2) / 2; // Rond af naar dichtstbijzijnde half uur
  }

  const endH = 24.0; // 00.00 middernacht

  for (let t = startH; t < endH; t += 0.5) {
    const sH = Math.floor(t);
    const sM = Math.round((t - sH) * 60);
    const eTime = t + 0.5;
    const eH = Math.floor(eTime) % 24;
    const eM = Math.round((eTime - Math.floor(eTime)) * 60);

    const sStr = `${String(sH).padStart(2, '0')}.${String(sM).padStart(2, '0')}`;
    const eStr = `${String(eH).padStart(2, '0')}.${String(eM).padStart(2, '0')}`;

    slots.push({
      label: `${sStr}-${eStr}`,
      isSluitRow: false,
      startDec: t,
      endDec: t + 0.5
    });
  }

  // Voeg als laatste altijd de officiële 'sluit' rij toe
  slots.push({
    label: 'sluit',
    isSluitRow: true,
    startDec: 24.0,
    endDec: 25.0
  });

  return slots;
}

export interface InDeMolenDayGridData {
  dayIndex: number;
  dayName: string;
  dateStr: string; // Bv. "5/10"
  headerTitle: string; // Bv. "Maandag 5/10"
  employees: Employee[];
  displayNames: string[];
  slots: DayTimelineSlot[];
  activeColCount: number;
  activeColSpan: number;
  totalColumns: number;
  rows: {
    slotLabel: string;
    isSluit: boolean;
    cells: string[];
  }[];
}

/**
 * Bouwt het complete raster op voor een dag conform de layout van Café In De Molen.
 */
export function buildInDeMolenDayGridData(
  weekNumber: number,
  dayIndex: number,
  allEmployees: Employee[],
  shifts: Shift[]
): InDeMolenDayGridData {
  const dayName = DAYS_FULL_NL[dayIndex];
  const dateInfo = getDayDateInfo(weekNumber, dayIndex);
  // Format as "5/10", "6/10", "10/10", etc.
  const dateStr = dateInfo.slashDate.replace(/^0/, '').replace(/\/0/, '/');
  
  // Zaterdag & Zondag tonen in het voorbeeld soms "Zaterdag" of "Zaterdag 10/10"
  const headerTitle = `${dayName} ${dateStr}`;

  // Target week met fallback naar huidige week
  const targetWeek = weekNumber || CURRENT_WEEK_NUMBER;

  // Filter shiften voor deze dag en week (zowel draft als published)
  const dayShifts = shifts.filter(
    s => (s.weekNumber !== undefined ? s.weekNumber === targetWeek : targetWeek === CURRENT_WEEK_NUMBER) && 
         Number(s.day) === dayIndex && 
         s.status !== 'archived'
  );

  // Zoek alle unieke medewerkers die deze dag ingepland staan
  const empIdsOnDay = Array.from(new Set(dayShifts.map(s => s.employeeId)));
  const scheduledEmployees = empIdsOnDay
    .map(id => allEmployees.find(e => e.id === id))
    .filter((e): e is Employee => Boolean(e));

  // Sorteer de medewerkers chronologisch op hun vroegste starttijd (Kolom 1 = vroegste starter)
  scheduledEmployees.sort((a, b) => {
    const shiftsA = dayShifts.filter(s => s.employeeId === a.id);
    const shiftsB = dayShifts.filter(s => s.employeeId === b.id);
    const minStartA = Math.min(...shiftsA.map(s => timeStringToDecimal(s.startTime, false, dayIndex)));
    const minStartB = Math.min(...shiftsB.map(s => timeStringToDecimal(s.startTime, false, dayIndex)));

    if (Math.abs(minStartA - minStartB) > 0.01) {
      return minStartA - minStartB;
    }

    // Bij gelijke starttijd: de sluitshift of langste shift eerst
    const aIsSluit = shiftsA.some(s => (s.endTime || '').toLowerCase().includes('sluit'));
    const bIsSluit = shiftsB.some(s => (s.endTime || '').toLowerCase().includes('sluit'));
    if (aIsSluit !== bIsSluit) return aIsSluit ? 1 : -1;

    return a.name.localeCompare(b.name);
  });

  // Bereken vroegste starttijd
  const earliestStart = scheduledEmployees.length > 0
    ? Math.min(...dayShifts.map(s => timeStringToDecimal(s.startTime, false, dayIndex)))
    : undefined;

  const slots = generateDayTimeSlots(dayIndex, earliestStart);

  const displayNames = scheduledEmployees.map(emp => getShortEmployeeName(emp, allEmployees));
  const activeColCount = scheduledEmployees.length;

  // Header oranje banner span en totale tabelkolommen (minstens 12 kolommen zoals in het origineel)
  // Bv. bij 4 medewerkers (Maandag) overspant de oranje banner kolommen 1 t/m 7
  // Bij 9 medewerkers (Vrijdag/Zondag) overspant de oranje banner kolommen 1 t/m 10
  const activeColSpan = Math.max(activeColCount + (activeColCount <= 5 ? 3 : 1), 7);
  const totalColumns = Math.max(activeColSpan + 4, 12);

  const rows = slots.map(slot => {
    const cells: string[] = [];

    // Kolommen voor ingeplande medewerkers
    scheduledEmployees.forEach(emp => {
      const empShifts = dayShifts.filter(s => s.employeeId === emp.id);

      let isWorking = false;

      if (slot.isSluitRow) {
        // Alleen tonen als medewerker effectief de sluitdienst heeft
        isWorking = empShifts.some(
          s => (s.endTime || '').toLowerCase().includes('sluit') || 
               (s.notes || '').toLowerCase().includes('sluit') ||
               timeStringToDecimal(s.endTime, true, dayIndex) >= 24.0
        );
      } else {
        isWorking = empShifts.some(s => {
          const sStart = timeStringToDecimal(s.startTime, false, dayIndex);
          let sEnd = timeStringToDecimal(s.endTime, true, dayIndex);
          const isSluit = (s.endTime || '').toLowerCase().includes('sluit') || (s.notes || '').toLowerCase().includes('sluit');
          const isHulpsluit = (s.endTime || '').toLowerCase().includes('hulpsluit') || (s.notes || '').toLowerCase().includes('hulpsluit');

          if (isSluit) sEnd = 24.5;
          else if (isHulpsluit) sEnd = 24.0;

          // Epsilon voor floating point tolerantie (bv. 11.5 tegenover 11.5000001)
          return (sStart - 0.001) <= slot.startDec && (sEnd + 0.001) >= slot.endDec;
        });
      }

      cells.push(isWorking ? getShortEmployeeName(emp, allEmployees) : '');
    });

    // Vul eventuele lege kolommen aan tot totalColumns - 1
    const paddingNeeded = (totalColumns - 1) - cells.length;
    for (let p = 0; p < paddingNeeded; p++) {
      cells.push('');
    }

    return {
      slotLabel: slot.label,
      isSluit: slot.isSluitRow,
      cells
    };
  });

  return {
    dayIndex,
    dayName,
    dateStr,
    headerTitle,
    employees: scheduledEmployees,
    displayNames,
    slots,
    activeColCount,
    activeColSpan,
    totalColumns,
    rows
  };
}

/**
 * Genereert het complete multi-pagina PDF document in de exacte layout van Café In De Molen:
 * - A4 Liggend (Landscape)
 * - 1 Pagina per dag van de week (Maandag t/m Zondag)
 * - Oranje header banner met dag en datum
 * - Tijdskolommen in 30-minuten intervallen
 * - Medewerkerskolommen met grijze achtergrond en scherpe zwarte rasterlijnen
 */
export function generateInDeMolenPdfDoc(
  weekNumber: number,
  employees: Employee[],
  shifts: Shift[],
  singleDayIndex?: number
): jsPDF {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const daysToRender = singleDayIndex !== undefined ? [singleDayIndex] : [0, 1, 2, 3, 4, 5, 6];

  daysToRender.forEach((dayIdx, pageIndex) => {
    if (pageIndex > 0) {
      doc.addPage('a4', 'landscape');
    }

    const grid = buildInDeMolenDayGridData(weekNumber, dayIdx, employees, shifts);

    // Bouw de header rij conform de layout
    const headerRow: any[] = [
      {
        content: '',
        styles: {
          fillColor: [255, 255, 255],
          lineColor: [0, 0, 0],
          lineWidth: 0.25
        }
      },
      {
        content: grid.headerTitle,
        colSpan: grid.activeColSpan,
        styles: {
          fillColor: [255, 128, 0], // Warm oranje zoals in het origineel
          textColor: [0, 0, 0], // Zwarte tekst
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
          lineColor: [0, 0, 0],
          lineWidth: 0.3
        }
      }
    ];

    // Vul eventuele restkolommen aan met lege witte headercellen
    const remainingHeaderCols = grid.totalColumns - 1 - grid.activeColSpan;
    for (let r = 0; r < remainingHeaderCols; r++) {
      headerRow.push({
        content: '',
        styles: {
          fillColor: [255, 255, 255],
          lineColor: [0, 0, 0],
          lineWidth: 0.25
        }
      });
    }

    // Bouw de body rijen
    const bodyRows = grid.rows.map(r => {
      const rowCells: any[] = [
        // Tijdskolom
        {
          content: r.slotLabel,
          styles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: r.isSluit ? 'bold' : 'normal',
            fontSize: 7.2,
            halign: r.isSluit ? 'center' : 'left',
            valign: 'middle',
            lineColor: [0, 0, 0],
            lineWidth: 0.25
          }
        }
      ];

      // Medewerkers en buffer kolommen
      r.cells.forEach((cellVal, colIdx) => {
        const isActiveArea = colIdx < grid.activeColSpan;

        // Kleuring zoals in het origineel:
        // Actieve kolommen hebben een lichte grijze tint ([225, 228, 232])
        // Lege kolommen rechts zijn wit ([255, 255, 255])
        const fillColor: [number, number, number] = isActiveArea
          ? [228, 230, 234]
          : [255, 255, 255];

        rowCells.push({
          content: cellVal,
          styles: {
            fillColor: fillColor,
            textColor: [0, 0, 0],
            fontStyle: 'normal',
            fontSize: 7.2,
            halign: 'left',
            valign: 'middle',
            cellPadding: { left: 1.5, right: 1, top: 0.6, bottom: 0.6 },
            lineColor: [0, 0, 0],
            lineWidth: 0.25
          }
        });
      });

      return rowCells;
    });

    // Bereken optimale celhoogte zodat alle rijen (inclusief 30 op zondag)
    // perfect binnen de A4 pagina (210mm) vallen zonder overloop
    const minCellHeight = grid.slots.length > 28 ? 4.9 : 5.4;
    const startY = grid.slots.length > 28 ? 10 : 12;

    autoTable(doc, {
      theme: 'grid',
      startY: startY,
      margin: { left: 15, right: 15, top: 10, bottom: 10 },
      styles: {
        lineColor: [0, 0, 0],
        lineWidth: 0.25,
        cellPadding: 0.8,
        minCellHeight: minCellHeight,
        fontSize: 7.2,
        textColor: [0, 0, 0],
        halign: 'left',
        valign: 'middle',
        overflow: 'hidden'
      },
      head: [headerRow],
      body: bodyRows,
      columnStyles: {
        0: { cellWidth: 24, halign: 'left' } // Vaste breedte voor tijdskolom
      },
      tableWidth: 'auto',
      didDrawPage: () => {
        // Zorg dat tabel gecentreerd en strak blijft
      }
    });
  });

  return doc;
}

/**
 * Triggert direct de download van het weekrooster als PDF bestand
 */
export function downloadInDeMolenPdf(
  weekNumber: number,
  employees: Employee[],
  shifts: Shift[],
  singleDayIndex?: number
): void {
  const doc = generateInDeMolenPdfDoc(weekNumber, employees, shifts, singleDayIndex);
  const daySuffix = singleDayIndex !== undefined ? `_${DAYS_FULL_NL[singleDayIndex]}` : '';
  const filename = `InDeMolen_Weekplanning_Week${weekNumber}${daySuffix}.pdf`;
  doc.save(filename);
}
