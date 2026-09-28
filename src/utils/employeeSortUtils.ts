import { Employee, EmployeeAvailability } from '../types';
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
 * Sorteert medewerkers per dag op basis van beschikbaarheid:
 * 1. Wie beschikbaar is (Voorkeur ⭐ of Beschikbaar ✓) komt bovenaan.
 * 2. Binnen de beschikbaren komen de vaste werknemers (Vast) als eerste, gevolgd door Flexi, Student, Extra.
 * 3. Daarna medewerkers zonder opgave.
 * 4. Onderaan medewerkers die niet-beschikbaar zijn (✕).
 * 5. Gelijke scores worden alfabetisch gesorteerd op voornaam.
 */
export function sortEmployeesByDayAvailability(
  employees: Employee[],
  dayIdx: number,
  weekNumber: number,
  availabilities: EmployeeAvailability[]
): Employee[] {
  const getScore = (emp: Employee): number => {
    const effective = getEffectiveEmployeeAvailability(emp, weekNumber, availabilities);
    const dayAvail = effective.availability?.days.find(d => d.day === dayIdx);
    const status = dayAvail?.status;

    const isVast = emp.statuut === 'Vast';
    const isFlexi = emp.statuut === 'Flexi';
    const isStudent = emp.statuut === 'Student';

    // 1. Beschikbaar (bovenaan)
    if (status === 'preferred' || status === 'available') {
      if (isVast) {
        return status === 'preferred' ? 10 : 11; // Vaste medewerkers bovenaan!
      } else if (isFlexi) {
        return status === 'preferred' ? 20 : 21;
      } else if (isStudent) {
        return status === 'preferred' ? 30 : 31;
      } else {
        return status === 'preferred' ? 40 : 41; // Extra
      }
    }

    // 2. Geen opgave / onbekend
    if (!status) {
      if (isVast) return 60;
      if (isFlexi) return 61;
      if (isStudent) return 62;
      return 63;
    }

    // 3. Niet-beschikbaar ('unavailable')
    if (isVast) return 80;
    if (isFlexi) return 81;
    if (isStudent) return 82;
    return 83;
  };

  return [...employees].sort((a, b) => {
    const scoreA = getScore(a);
    const scoreB = getScore(b);
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    const aFirst = (a.name || '').trim().split(/\s+/)[0] || '';
    const bFirst = (b.name || '').trim().split(/\s+/)[0] || '';
    const firstComp = aFirst.localeCompare(bFirst, 'nl', { sensitivity: 'base' });
    if (firstComp !== 0) return firstComp;
    return (a.name || '').localeCompare(b.name || '', 'nl', { sensitivity: 'base' });
  });
}

