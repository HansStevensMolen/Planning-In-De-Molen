import { Employee, Shift, EmployeeAvailability } from '../types';
import { getEffectiveEmployeeAvailability } from './weekUtils';

export interface ContinuityMatch {
  employeeId: string;
  employee: Employee;
  day: number;
  currentWeekNumber: number;
  previousWeekNumber: number;
  previousShift: Shift;
  currentAvailabilityStatus: 'available' | 'preferred' | 'unavailable' | 'none';
  currentAvailabilityHours?: string;
  isAvailableNow: boolean;
  isAlreadyScheduledThisWeek: boolean;
  alreadyScheduledShift?: Shift;
}

/**
 * Controleert of een medewerker op dezelfde dag in de vorige week werkte
 * én of hij/zij deze week op diezelfde dag beschikbaar is.
 */
export function getContinuityInfo(
  employee: Employee,
  day: number,
  currentWeekNumber: number,
  allShifts: Shift[],
  availabilities: EmployeeAvailability[]
): ContinuityMatch | null {
  if (!employee || !employee.id || employee.id === 'open_shift') return null;

  const previousWeekNumber = currentWeekNumber - 1;
  const previousShift = allShifts.find(
    s => s.employeeId === employee.id && s.day === day && (s.weekNumber || 26) === previousWeekNumber && s.status !== 'archived'
  );

  if (!previousShift) return null;

  const eff = getEffectiveEmployeeAvailability(employee, currentWeekNumber, availabilities);
  const dayAvail = eff.availability?.days.find(d => d.day === day);

  // Als de medewerker Vast is en geen afwezigheid heeft doorgegeven, is hij/zij beschikbaar
  const defaultStatus = employee.statuut === 'Vast' ? 'available' : 'none';
  const currentAvailabilityStatus = dayAvail?.status || defaultStatus;

  // Beschikbaar als status 'available' of 'preferred' is
  const isAvailableNow = currentAvailabilityStatus === 'available' || currentAvailabilityStatus === 'preferred';

  const alreadyScheduledShift = allShifts.find(
    s => s.employeeId === employee.id && s.day === day && (s.weekNumber || 26) === currentWeekNumber && s.status !== 'archived'
  );

  const isAlreadyScheduledThisWeek = Boolean(alreadyScheduledShift);

  const currentAvailabilityHours = dayAvail && (dayAvail.startTime || dayAvail.endTime)
    ? `${dayAvail.startTime || 'Open'} - ${dayAvail.endTime || 'Sluit'}`
    : employee.statuut === 'Vast'
      ? `${previousShift.startTime} - ${previousShift.endTime}`
      : undefined;

  return {
    employeeId: employee.id,
    employee,
    day,
    currentWeekNumber,
    previousWeekNumber,
    previousShift,
    currentAvailabilityStatus,
    currentAvailabilityHours,
    isAvailableNow,
    isAlreadyScheduledThisWeek,
    alreadyScheduledShift
  };
}

/**
 * Geeft alle medewerkers die op een bepaalde dag continuïteit hebben én beschikbaar zijn.
 */
export function getDayContinuityCandidates(
  day: number,
  currentWeekNumber: number,
  employees: Employee[],
  allShifts: Shift[],
  availabilities: EmployeeAvailability[]
): ContinuityMatch[] {
  return employees
    .map(emp => getContinuityInfo(emp, day, currentWeekNumber, allShifts, availabilities))
    .filter((m): m is ContinuityMatch => m !== null && m.isAvailableNow);
}

/**
 * Geeft alle continuïteits-matches voor de gehele week (gesorteerd per dag).
 */
export function getAllWeekContinuityMatches(
  currentWeekNumber: number,
  employees: Employee[],
  allShifts: Shift[],
  availabilities: EmployeeAvailability[]
): {
  allMatches: ContinuityMatch[];
  pendingMatches: ContinuityMatch[];
  scheduledMatches: ContinuityMatch[];
} {
  const allMatches: ContinuityMatch[] = [];

  for (let day = 0; day < 7; day++) {
    const dayMatches = getDayContinuityCandidates(day, currentWeekNumber, employees, allShifts, availabilities);
    allMatches.push(...dayMatches);
  }

  // Sorteren op dag en vervolgens op naam
  allMatches.sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return (a.employee.name || '').localeCompare(b.employee.name || '');
  });

  const pendingMatches = allMatches.filter(m => !m.isAlreadyScheduledThisWeek);
  const scheduledMatches = allMatches.filter(m => m.isAlreadyScheduledThisWeek);

  return {
    allMatches,
    pendingMatches,
    scheduledMatches
  };
}
