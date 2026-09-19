import { Employee } from '../types';

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
