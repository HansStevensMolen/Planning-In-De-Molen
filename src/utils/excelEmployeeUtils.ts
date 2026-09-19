import * as XLSX from 'xlsx';
import { Employee, Department, EmployeeStatuut, ExperienceLevel } from '../types';
import { sortEmployeesByFirstName } from './employeeSortUtils';

export interface ParsedEmployeeRow {
  id?: string;
  name: string;
  department: Department;
  statuut: EmployeeStatuut;
  experience: ExperienceLevel;
  phone: string;
  email: string;
  facebookUrl?: string;
  contractDaysPerWeek?: number;
  active: boolean;
  rawRowIndex?: number;
}

export interface EmployeeSyncDiff {
  toAdd: ParsedEmployeeRow[];
  toUpdate: {
    existing: Employee;
    updated: ParsedEmployeeRow;
    changes: string[];
  }[];
  toDelete: Employee[];
  unchanged: Employee[];
}

const PALETTE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6'];
const PALETTE_BGS = [
  'bg-indigo-50 border-indigo-200 text-indigo-700',
  'bg-pink-50 border-pink-200 text-pink-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-emerald-50 border-emerald-200 text-emerald-700',
  'bg-cyan-50 border-cyan-200 text-cyan-700',
  'bg-violet-50 border-violet-200 text-violet-700',
  'bg-rose-50 border-rose-200 text-rose-700',
  'bg-teal-50 border-teal-200 text-teal-700'
];

export function getEmployeeStyling(index: number) {
  const chosenColor = PALETTE_COLORS[index % PALETTE_COLORS.length];
  const bgStyles = PALETTE_BGS[index % PALETTE_BGS.length];
  const parts = bgStyles.split(' ');
  return {
    color: chosenColor,
    textBgColor: `${parts[0]} ${parts[1]}`,
    textColor: parts[2]
  };
}

/**
 * Normalizes input statuut string to valid EmployeeStatuut
 */
export function normalizeStatuut(val?: any): EmployeeStatuut {
  if (!val) return 'Student';
  const str = String(val).trim().toLowerCase();
  if (str.includes('vast') || str.includes('full') || str.includes('voltijds')) return 'Vast';
  if (str.includes('flexi')) return 'Flexi';
  if (str.includes('extra') || str.includes('interim') || str.includes('gelegenheid')) return 'Extra';
  return 'Student';
}

/**
 * Normalizes department string to 'zaal' | 'keuken'
 */
export function normalizeDepartment(val?: any): Department {
  if (!val) return 'zaal';
  const str = String(val).trim().toLowerCase();
  if (str.includes('keuk') || str.includes('kok') || str.includes('kitchen')) return 'keuken';
  return 'zaal';
}

/**
 * Normalizes experience string to ExperienceLevel
 */
export function normalizeExperience(val?: any): ExperienceLevel {
  if (!val) return 'Gemiddeld';
  const str = String(val).trim().toLowerCase();
  if (str.includes('verantwoor') || str.includes('manager') || str.includes('chef') || str.includes('lead')) return 'Verantwoordelijke';
  if (str.includes('ervaren') || str.includes('senior')) return 'Ervaren';
  if (str.includes('begin') || str.includes('junior') || str.includes('nieuw') || str.includes('stage')) return 'Beginner';
  return 'Gemiddeld';
}

/**
 * Export current employees into a native Excel .xlsx file
 */
export function exportEmployeesToExcel(employees: Employee[], filename = 'personeel_in_de_molen.xlsx') {
  const sorted = sortEmployeesByFirstName(employees);
  const formattedData = sorted.map(emp => ({
    'ID': emp.id,
    'Naam': emp.name,
    'Afdeling': emp.department,
    'Statuut': emp.statuut,
    'Ervaring': emp.experience,
    'GSM_Telefoon': emp.phone || '',
    'Email': emp.email || '',
    'Contractdagen_Vast': emp.contractDaysPerWeek ?? (emp.statuut === 'Vast' ? 5 : ''),
    'Facebook_URL': emp.facebookUrl || '',
    'Actief': emp.active !== false ? 'Ja' : 'Nee'
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for readability in Excel
  worksheet['!cols'] = [
    { wch: 15 }, // ID
    { wch: 26 }, // Naam
    { wch: 12 }, // Afdeling
    { wch: 14 }, // Statuut
    { wch: 18 }, // Ervaring
    { wch: 16 }, // GSM
    { wch: 30 }, // Email
    { wch: 18 }, // Contractdagen
    { wch: 35 }, // Facebook
    { wch: 10 }  // Actief
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Personeel');
  XLSX.writeFile(workbook, filename);
}

/**
 * Export current employees into a CSV with UTF-8 BOM and semicolon (Excel friendly)
 */
export function exportEmployeesToCSV(employees: Employee[], filename = 'personeel_in_de_molen.csv') {
  const headers = ['ID', 'Naam', 'Afdeling', 'Statuut', 'Ervaring', 'GSM_Telefoon', 'Email', 'Contractdagen_Vast', 'Facebook_URL', 'Actief'];
  const sorted = sortEmployeesByFirstName(employees);
  
  const rows = sorted.map(emp => [
    emp.id,
    `"${(emp.name || '').replace(/"/g, '""')}"`,
    emp.department,
    emp.statuut,
    emp.experience,
    `"${(emp.phone || '').replace(/"/g, '""')}"`,
    `"${(emp.email || '').replace(/"/g, '""')}"`,
    emp.contractDaysPerWeek ?? (emp.statuut === 'Vast' ? 5 : ''),
    `"${(emp.facebookUrl || '').replace(/"/g, '""')}"`,
    emp.active !== false ? 'Ja' : 'Nee'
  ].join(';'));

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
 * Parses raw 2D array of strings or row objects into ParsedEmployeeRow[]
 */
export function parseEmployeeDataRows(rawRows: any[][]): ParsedEmployeeRow[] {
  if (!rawRows || rawRows.length === 0) return [];

  // Find header row or assume row 0
  let headerIndex = -1;
  for (let i = 0; i < Math.min(rawRows.length, 5); i++) {
    const row = rawRows[i].map(c => String(c ?? '').trim().toLowerCase());
    if (row.some(c => c.includes('naam') || c.includes('name') || c.includes('medewerker'))) {
      headerIndex = i;
      break;
    }
  }

  const result: ParsedEmployeeRow[] = [];

  if (headerIndex !== -1) {
    const headers = rawRows[headerIndex].map(c => String(c ?? '').trim().toLowerCase());
    const idIdx = headers.findIndex(h => h === 'id' || h.includes('medewerker_id') || h.includes('empid'));
    const nameIdx = headers.findIndex(h => h.includes('naam') || h.includes('name'));
    const deptIdx = headers.findIndex(h => h.includes('afdeling') || h.includes('dept') || h.includes('rol'));
    const statuutIdx = headers.findIndex(h => h.includes('statuut') || h.includes('status') || h.includes('type'));
    const expIdx = headers.findIndex(h => h.includes('ervaring') || h.includes('niveau') || h.includes('level') || h.includes('exp'));
    const phoneIdx = headers.findIndex(h => h.includes('gsm') || h.includes('telefoon') || h.includes('phone') || h.includes('tel') || h.includes('mobiel'));
    const emailIdx = headers.findIndex(h => h.includes('mail'));
    const daysIdx = headers.findIndex(h => h.includes('contract') || h.includes('dagen') || h.includes('uur') || h.includes('regime'));
    const fbIdx = headers.findIndex(h => h.includes('facebook') || h.includes('social') || h.includes('fb'));
    const activeIdx = headers.findIndex(h => h.includes('actief') || h.includes('active'));

    for (let i = headerIndex + 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;
      
      const name = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim() : '';
      if (!name) continue; // skip rows without a name

      const id = idIdx !== -1 && row[idIdx] ? String(row[idIdx]).trim() : undefined;
      const department = normalizeDepartment(deptIdx !== -1 ? row[deptIdx] : undefined);
      const statuut = normalizeStatuut(statuutIdx !== -1 ? row[statuutIdx] : undefined);
      const experience = normalizeExperience(expIdx !== -1 ? row[expIdx] : undefined);
      const phone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : '';
      const email = emailIdx !== -1 && row[emailIdx] ? String(row[emailIdx]).trim() : '';
      const daysVal = daysIdx !== -1 && row[daysIdx] ? parseInt(String(row[daysIdx]).replace(/[^0-9]/g, ''), 10) : undefined;
      const facebookUrl = fbIdx !== -1 && row[fbIdx] ? String(row[fbIdx]).trim() : undefined;
      
      let active = true;
      if (activeIdx !== -1 && row[activeIdx]) {
        const actStr = String(row[activeIdx]).toLowerCase().trim();
        if (actStr === 'nee' || actStr === 'no' || actStr === 'false' || actStr === '0' || actStr === 'inactief') {
          active = false;
        }
      }

      result.push({
        id: id || undefined,
        name,
        department,
        statuut,
        experience,
        phone,
        email,
        contractDaysPerWeek: !isNaN(daysVal as number) ? daysVal : (statuut === 'Vast' ? 5 : undefined),
        facebookUrl: facebookUrl || undefined,
        active,
        rawRowIndex: i + 1
      });
    }
  } else {
    // If no header found, assume standard column order: [Name, Department, Statuut, Experience, Phone, Email]
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0) continue;
      const firstCol = String(row[0] ?? '').trim();
      if (!firstCol) continue;

      result.push({
        name: firstCol,
        department: normalizeDepartment(row[1]),
        statuut: normalizeStatuut(row[2]),
        experience: normalizeExperience(row[3]),
        phone: row[4] ? String(row[4]).trim() : '',
        email: row[5] ? String(row[5]).trim() : '',
        active: true,
        rawRowIndex: i + 1
      });
    }
  }

  return result;
}

/**
 * Parses an uploaded File (.xlsx, .xls, .csv) into ParsedEmployeeRow[]
 */
export async function parseEmployeeFile(file: File): Promise<ParsedEmployeeRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  return parseEmployeeDataRows(rawRows);
}

/**
 * Parses copied clipboard text (from Excel or CSV)
 */
export function parsePastedExcelText(text: string): ParsedEmployeeRow[] {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split(/\r\n|\n|\r/);
  const rawRows: string[][] = lines.map(line => {
    // Check delimiter: tab, semicolon, or comma
    if (line.includes('\t')) {
      return line.split('\t').map(c => c.trim().replace(/^"|"$/g, ''));
    }
    if (line.includes(';')) {
      return line.split(';').map(c => c.trim().replace(/^"|"$/g, ''));
    }
    return line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
  });

  return parseEmployeeDataRows(rawRows);
}

/**
 * Calculates a clean difference between currently registered employees and the parsed Excel rows
 */
export function calculateEmployeeDiff(
  currentEmployees: Employee[],
  parsedRows: ParsedEmployeeRow[]
): EmployeeSyncDiff {
  const toAdd: ParsedEmployeeRow[] = [];
  const toUpdate: {
    existing: Employee;
    updated: ParsedEmployeeRow;
    changes: string[];
  }[] = [];
  const unchanged: Employee[] = [];

  const matchedCurrentIds = new Set<string>();

  for (const row of parsedRows) {
    // 1. Try finding match by ID first
    let match: Employee | undefined;
    if (row.id) {
      match = currentEmployees.find(e => e.id === row.id);
    }
    // 2. Otherwise match by exact or lowercase name
    if (!match) {
      const cleanName = row.name.trim().toLowerCase();
      match = currentEmployees.find(e => e.name.trim().toLowerCase() === cleanName);
    }

    if (match) {
      matchedCurrentIds.add(match.id);
      const changes: string[] = [];

      if (row.name !== match.name) changes.push(`Naam: "${match.name}" ➔ "${row.name}"`);
      if (row.department !== match.department) changes.push(`Afdeling: "${match.department}" ➔ "${row.department}"`);
      if (row.statuut !== match.statuut) changes.push(`Statuut: "${match.statuut}" ➔ "${row.statuut}"`);
      if (row.experience !== match.experience) changes.push(`Ervaring: "${match.experience}" ➔ "${row.experience}"`);
      if (row.phone && row.phone !== match.phone) changes.push(`GSM: "${match.phone || '-'}" ➔ "${row.phone}"`);
      if (row.email && row.email !== match.email) changes.push(`Email: "${match.email || '-'}" ➔ "${row.email}"`);
      if (row.contractDaysPerWeek !== undefined && row.contractDaysPerWeek !== match.contractDaysPerWeek) {
        changes.push(`Dagen/week: "${match.contractDaysPerWeek ?? '-'}" ➔ "${row.contractDaysPerWeek}"`);
      }
      if (row.active !== undefined && row.active !== match.active) {
        changes.push(`Status: ${match.active ? 'Actief' : 'Inactief'} ➔ ${row.active ? 'Actief' : 'Inactief'}`);
      }

      if (changes.length > 0) {
        toUpdate.push({
          existing: match,
          updated: row,
          changes
        });
      } else {
        unchanged.push(match);
      }
    } else {
      toAdd.push(row);
    }
  }

  // Those in currentEmployees not matched in the Excel list are candidates for deletion
  // (Never delete Hans Stevens / emp1)
  const toDelete = currentEmployees.filter(e => !matchedCurrentIds.has(e.id) && e.id !== 'emp1');

  return {
    toAdd,
    toUpdate,
    toDelete,
    unchanged
  };
}
