import { Employee, Shift } from '../types';

/**
 * Calculates exact age in full years based on ISO birthDate (YYYY-MM-DD or parseable date string).
 * Returns null if birthDate is invalid or absent.
 */
export function calculateAge(birthDate?: string | null, referenceDate: Date = new Date()): number | null {
  if (!birthDate || !birthDate.trim()) return null;
  const parsed = new Date(birthDate);
  if (isNaN(parsed.getTime())) return null;

  let age = referenceDate.getFullYear() - parsed.getFullYear();
  const monthDiff = referenceDate.getMonth() - parsed.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < parsed.getDate())) {
    age--;
  }
  return age >= 0 && age < 120 ? age : null;
}

/**
 * Formats birthDate (YYYY-MM-DD) to a friendly Dutch date format (e.g. "14/05/2008").
 */
export function formatBirthDate(birthDate?: string | null): string {
  if (!birthDate || !birthDate.trim()) return '';
  const parsed = new Date(birthDate);
  if (isNaN(parsed.getTime())) return birthDate;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Checks whether an employee is a student.
 */
export function isStudent(employee?: { statuut?: string } | null): boolean {
  if (!employee) return false;
  return (employee.statuut || '').toLowerCase() === 'student';
}

/**
 * Checks whether a student is missing a required birthDate.
 */
export function isStudentMissingBirthDate(employee?: { statuut?: string; birthDate?: string } | null): boolean {
  if (!employee) return false;
  return isStudent(employee) && (!employee.birthDate || !employee.birthDate.trim());
}

/**
 * Checks whether an employee is a minor student (< 18 years old).
 */
export function isMinorStudent(
  employee?: { statuut?: string; birthDate?: string } | null,
  referenceDate: Date = new Date()
): boolean {
  if (!employee || !isStudent(employee)) return false;
  if (!employee.birthDate) return false;
  const age = calculateAge(employee.birthDate, referenceDate);
  return age !== null && age < 18;
}

/**
 * Helper to convert standard time strings to decimal hours (0.0 to 28.0 for night shifts).
 * Resolves 'Open', 'Sluit', 'Hulpsluit' into realistic hours.
 */
export function timeStringToDecimalHours(
  timeStr: string,
  isEnd = false,
  day = 0
): number {
  if (!timeStr) return isEnd ? 23.0 : 11.5;
  const lower = timeStr.trim().toLowerCase();

  // Special named tags
  if (lower.startsWith('open')) {
    // Sunday opens at 10:00, other days at 11:30
    return day === 6 ? 10.0 : 11.5;
  }

  if (lower === 'sluit') {
    // Ma-Do: 01:00 (25.0), Vr-Za: 02:00 (26.0), Zo: 00:00 (24.0)
    if (day === 4 || day === 5) return 26.0;
    if (day === 6) return 24.0;
    return 25.0;
  }

  if (lower === 'hulpsluit') {
    // Hulpsluit is usually 23:30 or 00:00 (23.5 or 24.0)
    return 23.5;
  }

  // Parse strings like "11:30", "11u30", "16:00", "16u00", "01:00", "01u00", "23u00"
  const match = lower.match(/^(\d{1,2})[:u\.]?(\d{2})?/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const decimal = hours + minutes / 60;

    // If it's an end time and in early morning (0:00 - 6:00), it's post-midnight (+24h)
    if (isEnd && hours >= 0 && hours <= 6) {
      return decimal + 24;
    }
    return decimal;
  }

  return isEnd ? 23.0 : 11.5;
}

/**
 * Calculates duration of a shift in hours.
 */
export function calculateShiftDurationHours(startTime: string, endTime: string, day = 0): number {
  const start = timeStringToDecimalHours(startTime, false, day);
  let end = timeStringToDecimalHours(endTime, true, day);

  if (end < start) {
    end += 24;
  }

  const diff = end - start;
  return Math.round(diff * 10) / 10;
}

/**
 * Checks if a given end time extends past 23:00.
 * Belgian labor law for minors (<18): no work past 23:00.
 */
export function isShiftEndingAfter23(endTime: string, day = 0): boolean {
  if (!endTime) return false;
  const lower = endTime.trim().toLowerCase();

  // 'Sluit' and 'Hulpsluit' are always past 23:00 in In De Molen (closing is 01:00, 02:00, or 00:00)
  if (lower === 'sluit' || lower === 'hulpsluit') {
    return true;
  }

  const dec = timeStringToDecimalHours(endTime, true, day);
  // 23:00 is 23.0. Anything > 23.0 (e.g. 23:15, 23:30 = 23.5, 00:00 = 24.0, 01:00 = 25.0) is after 23:00!
  return dec > 23.0;
}

export interface MinorShiftValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
  isMinor: boolean;
  age: number | null;
  shiftHours: number;
}

/**
 * Validates a planned shift against the youth labor law rules:
 * 1. Under-18 students may NOT work after 23:00.
 * 2. Under-18 students may NOT work more than 8 hours per day.
 */
export function validateMinorShift(
  employee?: Employee | null,
  shift?: { startTime?: string; endTime?: string; day?: number },
  existingShiftsOnSameDay: Shift[] = [],
  currentShiftId?: string
): MinorShiftValidationResult {
  const startTime = shift?.startTime || '16u00';
  const endTime = shift?.endTime || '23u00';
  const day = shift?.day !== undefined ? shift.day : 0;
  const shiftHours = calculateShiftDurationHours(startTime, endTime, day);

  if (!employee) {
    return { valid: true, isMinor: false, age: null, shiftHours };
  }

  // Only applies to students
  if (!isStudent(employee)) {
    return { valid: true, isMinor: false, age: null, shiftHours };
  }

  // Check if birthDate is missing
  if (!employee.birthDate || !employee.birthDate.trim()) {
    return {
      valid: true,
      isMinor: false,
      age: null,
      shiftHours,
      warning: `⚠️ Let op: ${employee.name} is student maar heeft nog geen geboortedatum ingevuld. Voer de geboortedatum in om te controleren of de student minderjarig (<18) is.`
    };
  }

  const age = calculateAge(employee.birthDate);
  if (age === null || age >= 18) {
    return { valid: true, isMinor: false, age, shiftHours };
  }

  // --- MINOR STUDENT RESTRICTIONS (Age < 18) ---

  // 1. Restriction: May not work after 23:00
  if (isShiftEndingAfter23(endTime, day)) {
    return {
      valid: false,
      isMinor: true,
      age,
      shiftHours,
      error: `Wettelijke overtreding: ${employee.name} is ${age} jaar (< 18) en mag volgens het arbeidsrecht niet werken na 23u00 (gekozen eindtijd: ${endTime}).`
    };
  }

  // 2. Restriction: May not work more than 8 hours per day
  if (shiftHours > 8) {
    return {
      valid: false,
      isMinor: true,
      age,
      shiftHours,
      error: `Wettelijke overtreding: ${employee.name} is ${age} jaar (< 18) en mag maximaal 8 uur per dag werken (deze dienst duurt ${shiftHours}u).`
    };
  }

  // 3. Restriction: Total hours across multiple shifts on the same day may not exceed 8 hours
  const otherShiftsToday = existingShiftsOnSameDay.filter(
    s => s.employeeId === employee.id && s.day === day && (!currentShiftId || s.id !== currentShiftId)
  );
  const otherHoursToday = otherShiftsToday.reduce(
    (sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime, s.day),
    0
  );

  if (otherHoursToday + shiftHours > 8) {
    return {
      valid: false,
      isMinor: true,
      age,
      shiftHours,
      error: `Wettelijke overtreding: ${employee.name} heeft reeds ${otherHoursToday}u gepland op deze dag. Met deze dienst erbij (${shiftHours}u) wordt de wettelijke limiet van 8u/dag overschreden (${otherHoursToday + shiftHours}u).`
    };
  }

  return { valid: true, isMinor: true, age, shiftHours };
}
