import { Employee, EmployeeAvailability, DayAvailability, Shift } from '../types';
import { getEffectiveEmployeeAvailability } from './weekUtils';
import { isMinorStudent, isShiftEndingAfter23 } from './employeeAgeUtils';

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
 * Normaliseert een personeelsnaam voor 100% betrouwbare vergelijking:
 * verwijdert overtollige spaties, zet om naar kleine letters en negeert diakrieten (accenten).
 */
export function normalizeEmployeeName(name?: string): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Voegt twee personeelsrecords van dezelfde persoon intelligent samen zodat er nooit
 * gegevens verloren gaan (zoals telefoon, geboortedatum, email, avatar, etc.).
 */
function mergeEmployeeRecords<T extends { id: string; name?: string }>(canonical: T, duplicate: T): T {
  const c = canonical as any;
  const d = duplicate as any;

  // Kies de beste weergave van de naam (bij voorkeur niet ALL CAPS als er een gemengde variant is)
  let bestName = c.name || d.name || '';
  if (c.name && d.name) {
    const cIsAllUpper = c.name === c.name.toUpperCase() && c.name !== c.name.toLowerCase();
    const dIsAllUpper = d.name === d.name.toUpperCase() && d.name !== d.name.toLowerCase();
    if (cIsAllUpper && !dIsAllUpper) {
      bestName = d.name;
    }
  }

  const merged: any = {
    ...d,
    ...c,
    id: c.id,
    name: bestName,
    department: c.department || d.department || 'zaal',
    statuut: c.statuut || d.statuut || 'Student',
    experience: c.experience || d.experience || 'Gemiddeld',
    contractDaysPerWeek: c.contractDaysPerWeek ?? d.contractDaysPerWeek,
    phone: (c.phone && String(c.phone).trim()) || (d.phone && String(d.phone).trim()) || '',
    email: (c.email && String(c.email).trim()) || (d.email && String(d.email).trim()) || '',
    birthDate: (c.birthDate && String(c.birthDate).trim()) || (d.birthDate && String(d.birthDate).trim()) || undefined,
    facebookUrl: (c.facebookUrl && String(c.facebookUrl).trim()) || (d.facebookUrl && String(d.facebookUrl).trim()) || undefined,
    avatarUrl: c.avatarUrl || d.avatarUrl || undefined,
    color: c.color || d.color,
    textBgColor: c.textBgColor || d.textBgColor,
    textColor: c.textColor || d.textColor,
    pin: (c.pin && c.pin !== '1234') ? c.pin : (d.pin || c.pin || '1234'),
    role: (c.role === 'beheerder' || d.role === 'beheerder') ? 'beheerder' : (c.role || d.role || 'personeel'),
    active: c.active !== false && d.active !== false,
    firstLoginComplete: c.firstLoginComplete || d.firstLoginComplete || false
  };

  return merged as T;
}

/**
 * Garandeert dat elke medewerker in de lijst uniek is, zowel op ID als op (genormaliseerde) volledige naam.
 * Bij dubbele vermeldingen (zoals medewerkers die door een update twee keer geregistreerd raakten)
 * worden de gegevens intelligent samengevoegd en blijft alleen de hoofd-/canonieke medewerker bewaard.
 * Retourneert tevens een `idRemap` mapping (oude dubbele ID -> canonieke ID) zodat gekoppelde shifts en
 * beschikbaarheden automatisch hersteld kunnen worden.
 */
export function deduplicateEmployeesWithRemap<T extends { id: string; name?: string }>(
  employees: T[],
  preferredIds?: Set<string>
): { cleanEmployees: T[]; idRemap: Map<string, string> } {
  if (!Array.isArray(employees)) return { cleanEmployees: [], idRemap: new Map() };

  const idRemap = new Map<string, string>();
  const idMap = new Map<string, T>();
  const nameMap = new Map<string, string>(); // normalizedName -> canonicalId

  for (const emp of employees) {
    if (!emp || !emp.id) continue;

    const normName = emp.name ? normalizeEmployeeName(emp.name) : '';
    const isHans = emp.id === 'emp1' || normName === 'hans stevens';

    // Vind of deze medewerker al bestaat op ID of op naam
    let canonicalId: string | null = null;
    if (isHans) {
      canonicalId = 'emp1';
    } else if (idMap.has(emp.id)) {
      canonicalId = emp.id;
    } else if (normName && nameMap.has(normName)) {
      canonicalId = nameMap.get(normName)!;
    }

    if (canonicalId && idMap.has(canonicalId)) {
      const currentCanonical = idMap.get(canonicalId)!;
      const incomingIsPreferred = preferredIds && preferredIds.has(emp.id);
      const currentIsPreferred = preferredIds && preferredIds.has(currentCanonical.id);

      if (!isHans && incomingIsPreferred && !currentIsPreferred) {
        idRemap.set(currentCanonical.id, emp.id);
        const merged = mergeEmployeeRecords(emp, currentCanonical);
        idMap.delete(currentCanonical.id);
        idMap.set(emp.id, merged);
        if (normName) nameMap.set(normName, emp.id);
      } else {
        if (emp.id !== canonicalId) {
          idRemap.set(emp.id, canonicalId);
        }
        const merged = mergeEmployeeRecords(currentCanonical, emp);
        idMap.set(canonicalId, merged);
      }
    } else {
      const targetId = isHans ? 'emp1' : emp.id;
      if (isHans && emp.id !== 'emp1') {
        idRemap.set(emp.id, 'emp1');
      }
      const finalEmp = isHans && emp.id !== 'emp1' ? { ...emp, id: 'emp1' } : emp;
      idMap.set(targetId, finalEmp);
      if (normName) {
        nameMap.set(normName, targetId);
      }
    }
  }

  return {
    cleanEmployees: Array.from(idMap.values()),
    idRemap
  };
}

/**
 * Garandeert dat elke medewerker in de lijst 100% uniek is.
 * Verwijdert dubbele vermeldingen op basis van zowel ID als volledige naam.
 */
export function deduplicateEmployees<T extends { id: string; name?: string }>(employees: T[]): T[] {
  return deduplicateEmployeesWithRemap(employees).cleanEmployees;
}

/**
 * Werkt shiften bij waarvan het personeels-ID naar een nieuw samengevoegd/canoniek ID verwijst.
 */
export function remapShiftsEmployeeIds(shifts: Shift[], idRemap: Map<string, string>): Shift[] {
  if (!Array.isArray(shifts) || idRemap.size === 0) return shifts;
  return shifts.map(s => {
    if (s.employeeId && idRemap.has(s.employeeId)) {
      return { ...s, employeeId: idRemap.get(s.employeeId)! };
    }
    return s;
  });
}

/**
 * Werkt beschikbaarheden bij waarvan het personeels-ID naar een nieuw samengevoegd/canoniek ID verwijst,
 * en combineert dagen intelligent als er al een beschikbaarheid voor dezelfde week bestond.
 */
export function remapAvailabilitiesEmployeeIds(
  availabilities: EmployeeAvailability[],
  idRemap: Map<string, string>
): EmployeeAvailability[] {
  if (!Array.isArray(availabilities)) return [];
  if (idRemap.size === 0) return availabilities;

  const keyMap = new Map<string, EmployeeAvailability>();
  for (const a of availabilities) {
    if (!a || !a.employeeId) continue;
    const cleanEmpId = idRemap.get(a.employeeId) || a.employeeId;
    const week = a.weekNumber || 1;
    const key = `${cleanEmpId}_${week}`;

    const updatedAvail: EmployeeAvailability = {
      ...a,
      employeeId: cleanEmpId
    };

    if (keyMap.has(key)) {
      const existing = keyMap.get(key)!;
      const existingDays = existing.days || [];
      const incomingDays = updatedAvail.days || [];
      const dayMap = new Map<number, any>();
      existingDays.forEach(d => dayMap.set(d.day, d));
      incomingDays.forEach(d => {
        const prev = dayMap.get(d.day);
        if (!prev || (d.status && d.status !== 'unavailable')) {
          dayMap.set(d.day, d);
        }
      });
      keyMap.set(key, {
        ...existing,
        days: Array.from(dayMap.values()),
        lastUpdated: Math.max(existing.lastUpdated || 0, updatedAvail.lastUpdated || 0)
      });
    } else {
      keyMap.set(key, updatedAvail);
    }
  }

  return Array.from(keyMap.values());
}

/**
 * Voegt een basislijst en een bijgewerkte lijst van medewerkers samen zonder dubbelen te creëren.
 * Matcht zowel op ID als op genormaliseerde naam.
 */
export function mergeAndDeduplicateTeam(
  baseEmployees: Employee[],
  incomingEmployees: Employee[]
): { cleanEmployees: Employee[]; idRemap: Map<string, string> } {
  const preferredIds = new Set(baseEmployees.map(e => e.id));
  const combined = [...baseEmployees, ...incomingEmployees];
  return deduplicateEmployeesWithRemap(combined, preferredIds);
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
/**
 * Bepaalt of een medewerker op een specifieke dag beschikbaar is én tot 'Sluit' of 'Hulpsluit' kan werken.
 * - Wettelijke bescherming: minderjarige studenten (<18) mogen nooit na 23u00 werken (dus géén sluit of hulpsluit).
 * - Controleert:
 *   1. endTime ('Sluit', 'Hulpsluit', '00:00', '01:00', '02:00', '24:00', '00u00', etc.)
 *   2. notes (bevat 'sluit', 'hulpsluit', 'kan sluiten', 'helpen sluiten', etc.)
 *   3. Of de shift-eindtijd na 23u00 valt via isShiftEndingAfter23.
 */
export function canEmployeeWorkSluitOrHulpsluit(
  emp: Employee,
  dayAvail?: DayAvailability
): boolean {
  if (!dayAvail) return false;
  if (dayAvail.status !== 'available' && dayAvail.status !== 'preferred') return false;

  // Wettelijke grens: minderjarige studenten mogen nooit tot sluit of hulpsluit werken
  if (isMinorStudent(emp)) return false;

  const end = (dayAvail.endTime || '').trim().toLowerCase();
  const notes = (dayAvail.notes || '').trim().toLowerCase();

  // 1. Expliciete vermelding van sluit of hulpsluit in eindtijd of opmerkingen
  if (
    end.includes('sluit') ||
    end.includes('hulp') ||
    notes.includes('sluit') ||
    notes.includes('hulp')
  ) {
    return true;
  }

  // 2. Eindtijd die voorbij 23:00 reikt (00:00 middernacht hulpsluit, 01:00/02:00 sluitdienst)
  if (isShiftEndingAfter23(dayAvail.endTime || '', dayAvail.day, dayAvail.notes)) {
    return true;
  }

  return false;
}

/**
 * Berekent de rangorde voor een medewerker bij dag-sortering:
 * - Rang 0: Vaste medewerkers ('Vast') bovenaan
 * - Rang 1: Medewerkers die tot sluit of hulpsluit kunnen werken (niet-vast)
 * - Rang 2: Flexi's (die niet tot sluit/hulpsluit kunnen)
 * - Rang 3: Studenten (die niet tot sluit/hulpsluit kunnen)
 * - Rang 4: Overige (zoals Extra)
 */
export function getDayAvailabilitySortRank(
  emp: Employee,
  dayAvail?: DayAvailability
): number {
  if (emp.statuut === 'Vast') {
    return 0; // Vaste medewerkers altijd bovenaan
  }

  if (canEmployeeWorkSluitOrHulpsluit(emp, dayAvail)) {
    return 1; // Medewerkers die tot sluit of hulpsluit kunnen werken
  }

  if (emp.statuut === 'Flexi') {
    return 2; // Flexi's
  }

  if (emp.statuut === 'Student') {
    return 3; // Studenten
  }

  return 4; // Overige (zoals Extra)
}

/**
 * Sorteert medewerkers per dag volgens de specifieke regels van de beheerder:
 * 1. Wie beschikbaar is ('available' of 'preferred') komt bovenaan.
 * 2. Vaste medewerkers ('Vast') bovenaan (Rang 0).
 * 3. Vervolgens de medewerkers die tot sluit of hulpsluit kunnen werken (Rang 1).
 * 4. Vervolgens de flexi's (Rang 2).
 * 5. Vervolgens de studenten (Rang 3).
 * 6. Overige statuten (Extra) (Rang 4).
 * 7. Binnen dezelfde rang:
 *    - Bij Vast: wie tot sluit/hulpsluit kan eerst
 *    - Bij sluit/hulpsluit: wie volwaardig Sluit kan vóór Hulpsluit
 *    - Alfabetisch op voornaam en naam
 * 8. Medewerkers die niet-beschikbaar zijn komen onderaan, gerangschikt volgens dezelfde statuut-prioriteit (Vast -> Flexi -> Student -> Extra) en alfabetisch.
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

    // Indien beide beschikbaar zijn: sorteer volgens gevraagde rangorde
    if (aIsAvail && bIsAvail) {
      const rankA = getDayAvailabilitySortRank(a, aDay);
      const rankB = getDayAvailabilitySortRank(b, bDay);
      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // Binnen Rang 0 (Vast): degenen die tot sluit/hulpsluit kunnen komen eerst
      if (rankA === 0) {
        const aCanClose = canEmployeeWorkSluitOrHulpsluit(a, aDay);
        const bCanClose = canEmployeeWorkSluitOrHulpsluit(b, bDay);
        if (aCanClose && !bCanClose) return -1;
        if (!aCanClose && bCanClose) return 1;
      }

      // Binnen Rang 1 (sluit/hulpsluit): wie volwaardig Sluit kan vóór Hulpsluit
      if (rankA === 1) {
        const aEnd = (aDay?.endTime || '').toLowerCase();
        const bEnd = (bDay?.endTime || '').toLowerCase();
        const aIsFullSluit = aEnd.includes('sluit') && !aEnd.includes('hulp');
        const bIsFullSluit = bEnd.includes('sluit') && !bEnd.includes('hulp');
        if (aIsFullSluit && !bIsFullSluit) return -1;
        if (!aIsFullSluit && bIsFullSluit) return 1;

        // Flexi voor Student binnen sluit
        const statuutOrder = (s?: string) => (s === 'Flexi' ? 0 : s === 'Student' ? 1 : 2);
        const statDiff = statuutOrder(a.statuut) - statuutOrder(b.statuut);
        if (statDiff !== 0) return statDiff;
      }
    } else {
      // Beide niet-beschikbaar: ook hier vaste eerst, dan flexi's, dan studenten
      const fallbackRank = (s?: string) => {
        if (s === 'Vast') return 0;
        if (s === 'Flexi') return 1;
        if (s === 'Student') return 2;
        return 3;
      };
      const rankDiff = fallbackRank(a.statuut) - fallbackRank(b.statuut);
      if (rankDiff !== 0) return rankDiff;
    }

    // Alfabetisch op voornaam en naam
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
