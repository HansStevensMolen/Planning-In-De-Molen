import { Employee, EmployeeAvailability, Shift } from '../types';
import { getEffectiveEmployeeAvailability } from './weekUtils';

/**
 * Normaliseert invoer voor een Facebook-profiel naar een volwaardige werkende Facebook URL.
 * Accepteert gebruikersnamen (bijv. "milan.dresselaers"), @handles of volledige URLs.
 */
export function normalizeFacebookUrl(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('facebook.com/') || trimmed.startsWith('www.facebook.com/')) {
    return `https://${trimmed}`;
  }
  const cleanHandle = trimmed.replace(/^@/, '').replace(/^\/+/, '');
  return `https://www.facebook.com/${cleanHandle}`;
}

/**
 * Sorteert medewerkers op basis van hun planningsstatus in een specifieke week:
 * - scheduledFirst = true: wie al minstens 1 shift heeft komt bovenaan, gerangschikt op aantal shifts (meeste eerst), dan statuut, dan alfabetisch.
 * - scheduledFirst = false: wie nog 0 shifts heeft komt bovenaan, zodat de beheerder direct ziet wie nog ingepland moet worden!
 */
export function sortEmployeesByPlanningStatus(
  employees: Employee[],
  weekNumber: number,
  shifts: Shift[],
  scheduledFirst: boolean
): Employee[] {
  const scheduledCountMap = new Map<string, number>();
  shifts.forEach(s => {
    if ((s.weekNumber || 1) === weekNumber && s.employeeId && s.employeeId !== 'open_shift') {
      scheduledCountMap.set(s.employeeId, (scheduledCountMap.get(s.employeeId) || 0) + 1);
    }
  });

  return [...employees].sort((a, b) => {
    const aCount = scheduledCountMap.get(a.id) || 0;
    const bCount = scheduledCountMap.get(b.id) || 0;
    const aIsSched = aCount > 0;
    const bIsSched = bCount > 0;

    if (scheduledFirst) {
      if (aIsSched && !bIsSched) return -1;
      if (!aIsSched && bIsSched) return 1;
      if (aIsSched && bIsSched && aCount !== bCount) return bCount - aCount;
    } else {
      if (!aIsSched && bIsSched) return -1;
      if (aIsSched && !bIsSched) return 1;
    }

    // Statuut rangorde: Vast (0), Flexi (1), Student (2), Extra (3)
    const statuutRank = (s?: string) => {
      if (s === 'Vast') return 0;
      if (s === 'Flexi') return 1;
      if (s === 'Student') return 2;
      return 3;
    };
    const rankDiff = statuutRank(a.statuut) - statuutRank(b.statuut);
    if (rankDiff !== 0) return rankDiff;

    // Alfabetisch op voornaam
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
 * Sorteert medewerkers per dag:
 * 1. Wie beschikbaar is ('available' of 'preferred') komt bovenaan.
 * 2. Binnen de beschikbaren: vaste werknemers ('Vast') eerst.
 * 3. Vervolgens andere statuten (Flexi, Student, Extra).
 * 4. Alfabetisch op naam.
 * 5. Medewerkers die niet-beschikbaar zijn of niets hebben ingevuld komen onderaan (ook vaste eerst).
 */
export function sortEmployeesByDayAvailability(
  employees: Employee[],
  dayIndex: number,
  weekNumber: number,
  availabilities: EmployeeAvailability[]
): Employee[] {
  return [...employees].sort((a, b) => {
    const aEff = getEffectiveEmployeeAvailability(a, weekNumber, availabilities);
    const bEff = getEffectiveEmployeeAvailability(b, weekNumber, availabilities);

    const aDay = aEff.availability?.days.find(d => d.day === dayIndex);
    const bDay = bEff.availability?.days.find(d => d.day === dayIndex);

    const aIsAvail = aDay && (aDay.status === 'available' || aDay.status === 'preferred');
    const bIsAvail = bDay && (bDay.status === 'available' || bDay.status === 'preferred');

    // 1. Wie beschikbaar is bovenaan
    if (aIsAvail && !bIsAvail) return -1;
    if (!aIsAvail && bIsAvail) return 1;

    // 2. Beginnen met de vaste werknemers
    const aIsVast = a.statuut === 'Vast';
    const bIsVast = b.statuut === 'Vast';
    if (aIsVast && !bIsVast) return -1;
    if (!aIsVast && bIsVast) return 1;

    // 3. Statuut rangorde: Vast (0), Flexi (1), Student (2), Extra (3)
    const statuutRank = (s?: string) => {
      if (s === 'Vast') return 0;
      if (s === 'Flexi') return 1;
      if (s === 'Student') return 2;
      return 3;
    };
    const rankDiff = statuutRank(a.statuut) - statuutRank(b.statuut);
    if (rankDiff !== 0) return rankDiff;

    // 4. Alfabetisch op naam
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
 * Zet een starttijd (bijv. "11:30", "17:00", "09:00", "17u30", "Open") om naar minuten vanaf middernacht
 * voor 100% betrouwbare chronologische sortering.
 */
export function parseStartTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 999999;
  const cleaned = timeStr.trim().toLowerCase();
  if (cleaned.includes('open')) return 11 * 60 + 30; // Typische openingsuur café In De Molen
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
