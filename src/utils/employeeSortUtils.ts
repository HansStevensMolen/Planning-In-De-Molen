import { Employee, EmployeeAvailability, Shift } from '../types';
import { getEffectiveEmployeeAvailability } from './weekUtils';

/**
 * Garandeert dat elke medewerker in de lijst een uniek ID heeft.
 * Bij dubbele ID's (zoals per ongeluk meervoudige emp1) blijft alleen het eerste/hoofd-item bewaard.
 */
export function deduplicateEmployees<T extends { id: string }>(employees: T[]): T[] {
  if (!Array.isArray(employees)) return [];
  const seen = new Set<string>();
  const result: T[] = [];
  for (const emp of employees) {
    if (emp && emp.id && !seen.has(emp.id)) {
      seen.add(emp.id);
      result.push(emp);
    }
  }
  return result;
}

/**
 * Sorteert medewerkers alfabetisch op voornaam.
 * Bij gelijke voornaam wordt er gesorteerd op achternaam/volledige naam.
 */
export function sortEmployeesByFirstName(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    const aName = (a.name || '').trim();
    const bName = (b.name || '').trim();
    const aFirst = aName.split(/\s+/)[0] || '';
    const bFirst = bName.split(/\s+/)[0] || '';
    
    const firstComp = aFirst.localeCompare(bFirst, 'nl', { sensitivity: 'base' });
    if (firstComp !== 0) {
      return firstComp;
    }
    return aName.localeCompare(bName, 'nl', { sensitivity: 'base' });
  });
}

/**
 * Rangorde statuut volgens bedrijfsnorm:
 * 1. Vaste ('Vast') -> 0
 * 2. Flexi ('Flexi') -> 1
 * 3. Studenten ('Student') -> 2
 * 4. Extra's ('Extra') -> 3
 */
export function getStatuutRank(statuut?: string): number {
  if (!statuut) return 4;
  const s = statuut.trim().toLowerCase();
  if (s.startsWith('vast')) return 0;
  if (s.startsWith('flexi')) return 1;
  if (s.startsWith('stud')) return 2;
  if (s.startsWith('ext')) return 3;
  return 4;
}

/**
 * Sorteert medewerkers op statuut (bovenaan de vaste, dan flexi, dan studenten en extra's),
 * vervolgens alfabetisch op voornaam.
 */
export function sortEmployeesByStatuut(employees: Employee[]): Employee[] {
  return [...employees].sort((a, b) => {
    const rankDiff = getStatuutRank(a.statuut) - getStatuutRank(b.statuut);
    if (rankDiff !== 0) return rankDiff;

    const aName = (a.name || '').trim();
    const bName = (b.name || '').trim();
    const aFirst = aName.split(/\s+/)[0] || '';
    const bFirst = bName.split(/\s+/)[0] || '';
    const firstComp = aFirst.localeCompare(bFirst, 'nl', { sensitivity: 'base' });
    if (firstComp !== 0) return firstComp;
    return aName.localeCompare(bName, 'nl', { sensitivity: 'base' });
  });
}

/**
 * Zet een starttijd (bijv. "11:30", "17:00", "09:00", "11u30", "17u00", "Open") om naar minuten vanaf middernacht
 * voor 100% betrouwbare chronologische sortering.
 */
export function parseStartTimeToMinutes(timeStr?: string, dayIndex?: number): number {
  if (!timeStr) return 999999;
  const cleaned = timeStr.trim().toLowerCase();
  if (cleaned.includes('open')) {
    // Zondag opent In De Molen om 10:00, overige dagen om 11:30
    return dayIndex === 6 ? 10 * 60 : 11 * 60 + 30;
  }
  if (cleaned.includes('sluit')) return 23 * 60;
  const match = cleaned.match(/(\d{1,2})[:uh.]?(\d{2})?/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    return hours * 60 + minutes;
  }
  const single = parseInt(cleaned, 10);
  if (!isNaN(single)) return single * 60;
  return 999999;
}

/**
 * Sorteert medewerkers per dag volgens de gebruikerswens:
 * 1. Wie beschikbaar is ('available' of 'preferred' of reeds ingepland) komt bovenaan.
 * 2. Rangorde statuut: bovenaan de vaste ('Vast'), dan flexi ('Flexi'), dan studenten ('Student') en extra's ('Extra').
 * 3. Sorteer op beginuur (vroegste starttijd eerst, bijv. 11:30 vóór 17:00).
 * 4. Alfabetisch op voornaam bij gelijke starttijd/statuut.
 * 5. Medewerkers die niet-beschikbaar zijn komen onderaan (ook volgens Vast -> Flexi -> Student -> Extra).
 */
export function sortEmployeesByDayAvailability(
  employees: Employee[],
  dayIndex: number,
  weekNumber: number,
  availabilities: EmployeeAvailability[],
  shifts?: Shift[]
): Employee[] {
  return [...employees].sort((a, b) => {
    const aEff = getEffectiveEmployeeAvailability(a, weekNumber, availabilities);
    const bEff = getEffectiveEmployeeAvailability(b, weekNumber, availabilities);

    const aDay = aEff.availability?.days.find(d => d.day === dayIndex);
    const bDay = bEff.availability?.days.find(d => d.day === dayIndex);

    // Controleer of medewerker al een shift heeft op deze dag in deze week
    const aShift = shifts?.find(s => s.employeeId === a.id && (s.weekNumber || 0) === weekNumber && s.day === dayIndex);
    const bShift = shifts?.find(s => s.employeeId === b.id && (s.weekNumber || 0) === weekNumber && s.day === dayIndex);

    const aIsAvail = Boolean(aShift) || (aDay && (aDay.status === 'available' || aDay.status === 'preferred'));
    const bIsAvail = Boolean(bShift) || (bDay && (bDay.status === 'available' || bDay.status === 'preferred'));

    // 1. Wie beschikbaar is ('available' / 'preferred' of reeds ingepland) komt bovenaan
    if (aIsAvail && !bIsAvail) return -1;
    if (!aIsAvail && bIsAvail) return 1;

    // 2. Statuut rangorde: bovenaan de vaste, dan de flexi, dan studenten en extra's
    const aRank = getStatuutRank(a.statuut);
    const bRank = getStatuutRank(b.statuut);
    if (aRank !== bRank) return aRank - bRank;

    // 3. Sorteer op beginuur (vroegste starttijd eerst, bijv. 11:30 vóór 17:00)
    const aTimeStr = aShift?.startTime || aDay?.startTime || a.recurringAvailability?.days.find(d => d.day === dayIndex)?.startTime;
    const bTimeStr = bShift?.startTime || bDay?.startTime || b.recurringAvailability?.days.find(d => d.day === dayIndex)?.startTime;
    const aMinutes = parseStartTimeToMinutes(aTimeStr, dayIndex);
    const bMinutes = parseStartTimeToMinutes(bTimeStr, dayIndex);

    if (aMinutes !== bMinutes) {
      return aMinutes - bMinutes;
    }

    // 4. Alfabetisch op voornaam / naam bij gelijke starttijd
    const aName = (a.name || '').trim();
    const bName = (b.name || '').trim();
    const aFirst = aName.split(/\s+/)[0] || '';
    const bFirst = bName.split(/\s+/)[0] || '';
    const firstComp = aFirst.localeCompare(bFirst, 'nl', { sensitivity: 'base' });
    if (firstComp !== 0) return firstComp;
    return aName.localeCompare(bName, 'nl', { sensitivity: 'base' });
  });
}
