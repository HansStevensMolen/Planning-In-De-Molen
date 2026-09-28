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
 *
 * Bedrijfsnormen Café In De Molen:
 * - Officiële sluitingsuren: Ma-Do om 01u00, Vr-Za om 02u00, Zo om 00u00.
 * - Hulpsluit: stopt meestal om 00u00 (24.0).
 * - Sluit: degene die sluit is meestal nog een half uur na sluitingstijd aan het werk (+30 min):
 *   - Ma t/m Do: 01u00 + 30m = 01u30 (25.5)
 *   - Vr en Za: 02u00 + 30m = 02u30 (26.5)
 *   - Zo: 00u00 + 30m = 00u30 (24.5)
 */
export function timeStringToDecimalHours(
  timeStr: string,
  isEnd = false,
  day = 0,
  notes?: string
): number {
  if (!timeStr) return isEnd ? 23.0 : 11.5;
  const lower = timeStr.trim().toLowerCase();
  const notesLower = (notes || '').trim().toLowerCase();

  // Special named tags
  if (lower.startsWith('open')) {
    // Sunday opens at 10:00, other days at 11:30
    return day === 6 ? 10.0 : 11.5;
  }

  // Hulpsluit: stopt meestal om 00u00 (24.0)
  const isHulpsluit = lower === 'hulpsluit' || lower.startsWith('hulp') || (isEnd && notesLower.includes('hulpsluit'));
  if (isHulpsluit) {
    return 24.0;
  }

  // Sluit: degene die sluit is meestal nog een half uur na sluitingstijd aan het werk (+30m):
  // Maandag t/m Donderdag (0..3): sluiting 01u00 + 30m = 01u30 (25.5u)
  // Vrijdag & Zaterdag (4..5): sluiting 02u00 + 30m = 02u30 (26.5u)
  // Zondag (6): sluiting 00u00 + 30m = 00u30 (24.5u)
  const isSluit = lower === 'sluit' || (isEnd && !isHulpsluit && notesLower.includes('sluit'));
  if (isSluit) {
    if (day === 4 || day === 5) return 26.5; // Vr, Za: 02:30
    if (day === 6) return 24.5;              // Zo: 00:30
    return 25.5;                             // Ma-Do: 01:30
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
 * Officiële sluitingstijden Café In De Molen:
 * - Maandag t/m Donderdag (0..3): 01u00
 * - Vrijdag en Zaterdag (4..5): 02u00
 * - Zondag (6): 00u00
 */
export function getOfficialClosingTime(day = 0): { timeStr: string; decimalHours: number } {
  if (day === 4 || day === 5) return { timeStr: '02u00', decimalHours: 26.0 };
  if (day === 6) return { timeStr: '00u00', decimalHours: 24.0 };
  return { timeStr: '01u00', decimalHours: 25.0 };
}

/**
 * Berekende werkelijke eindtijd voor de Sluit-rol (inclusief 30 min nawerk na sluitingstijd):
 * - Ma t/m Do: 01u30 (25.5)
 * - Vr en Za: 02u30 (26.5)
 * - Zo: 00u30 (24.5)
 */
export function getSluitActualEndTime(day = 0): { timeStr: string; decimalHours: number } {
  if (day === 4 || day === 5) return { timeStr: '02u30', decimalHours: 26.5 };
  if (day === 6) return { timeStr: '00u30', decimalHours: 24.5 };
  return { timeStr: '01u30', decimalHours: 25.5 };
}

/**
 * Berekende werkelijke eindtijd voor de Hulpsluit-rol:
 * Hulpsluit stopt meestal om 00u00 (24.0)
 */
export function getHulpsluitActualEndTime(_day = 0): { timeStr: string; decimalHours: number } {
  return { timeStr: '00u00', decimalHours: 24.0 };
}

/**
 * Geeft gedetailleerde toelichting op de urenberekening voor een shift
 */
export function getShiftTimingDetails(shift: {
  startTime: string;
  endTime: string;
  day?: number;
  notes?: string;
}): {
  isSluit: boolean;
  isHulpsluit: boolean;
  calculatedEndTimeStr: string;
  durationHours: number;
  badgeLabel?: string;
  explanation?: string;
} {
  const day = shift.day !== undefined ? shift.day : 0;
  const lowerEnd = (shift.endTime || '').trim().toLowerCase();
  const notesLower = (shift.notes || '').trim().toLowerCase();

  const isHulpsluit = lowerEnd === 'hulpsluit' || lowerEnd.startsWith('hulp') || notesLower.includes('hulpsluit');
  const isSluit = !isHulpsluit && (lowerEnd === 'sluit' || notesLower.includes('sluit'));

  const durationHours = calculateShiftDurationHours(shift.startTime, shift.endTime, day, shift.notes);

  if (isHulpsluit) {
    return {
      isSluit: false,
      isHulpsluit: true,
      calculatedEndTimeStr: '00u00',
      durationHours,
      badgeLabel: 'Hulpsluit (tot 00u00)',
      explanation: 'Hulpsluit stopt meestal om 00u00'
    };
  }

  if (isSluit) {
    const sluitInfo = getSluitActualEndTime(day);
    const officialClosing = getOfficialClosingTime(day);
    return {
      isSluit: true,
      isHulpsluit: false,
      calculatedEndTimeStr: sluitInfo.timeStr,
      durationHours,
      badgeLabel: `Sluit (+30m = ${sluitInfo.timeStr})`,
      explanation: `Sluitdienst: café sluit om ${officialClosing.timeStr} + 30 min nawerk = berekend tot ${sluitInfo.timeStr}`
    };
  }

  return {
    isSluit: false,
    isHulpsluit: false,
    calculatedEndTimeStr: shift.endTime,
    durationHours
  };
}

/**
 * Calculates duration of a shift in hours.
 * Accurately accounts for Hulpsluit (stopping at 00:00) and Sluit (+30 min after closing time).
 */
export function calculateShiftDurationHours(
  startTime: string,
  endTime: string,
  day = 0,
  notes?: string
): number {
  const start = timeStringToDecimalHours(startTime, false, day, notes);
  let end = timeStringToDecimalHours(endTime, true, day, notes);

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
export function isShiftEndingAfter23(endTime: string, day = 0, notes?: string): boolean {
  if (!endTime) return false;
  const lower = endTime.trim().toLowerCase();
  const notesLower = (notes || '').trim().toLowerCase();

  // 'Sluit' and 'Hulpsluit' are always past 23:00 in In De Molen (closing is 01:00, 02:00, or 00:00)
  if (lower === 'sluit' || lower === 'hulpsluit' || notesLower.includes('sluit') || notesLower.includes('hulpsluit')) {
    return true;
  }

  const dec = timeStringToDecimalHours(endTime, true, day, notes);
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
  shift?: { startTime?: string; endTime?: string; day?: number; notes?: string },
  existingShiftsOnSameDay: Shift[] = [],
  currentShiftId?: string
): MinorShiftValidationResult {
  const startTime = shift?.startTime || '16u00';
  const endTime = shift?.endTime || '23u00';
  const day = shift?.day !== undefined ? shift.day : 0;
  const shiftHours = calculateShiftDurationHours(startTime, endTime, day, shift?.notes);

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
  if (isShiftEndingAfter23(endTime, day, shift?.notes)) {
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
    (sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime, s.day, s.notes),
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

export interface WeeklyHoursComplianceResult {
  hours: number;
  isOvertime: boolean; // > 45u
  isVastUnderhours: boolean; // statuut === 'Vast' && < 42u
  isVastOptimal: boolean; // statuut === 'Vast' && >= 42u && <= 45u
  excessHours: number; // hours > 45
  shortageHours: number; // 42 - hours for Vast
  message?: string;
}

/**
 * Calculates total planned hours for an employee in a given week.
 */
export function calculateEmployeeWeeklyHours(
  employeeId: string,
  weekNumber: number,
  shifts: Shift[]
): number {
  if (!employeeId || employeeId === 'open_shift') return 0;
  const empShifts = shifts.filter(
    s => s.employeeId === employeeId && (s.weekNumber || 26) === weekNumber
  );
  const total = empShifts.reduce(
    (sum, s) => sum + calculateShiftDurationHours(s.startTime, s.endTime, s.day, s.notes),
    0
  );
  return Math.round(total * 10) / 10;
}

/**
 * Evaluates weekly hours compliance:
 * 1. Warning when any employee is planned for > 45 hours (to prevent overtime).
 * 2. Warning when a permanent employee ('Vast') does not reach 42 hours per week.
 */
export function checkWeeklyHoursCompliance(
  employee: Employee | null | undefined,
  weeklyHours: number
): WeeklyHoursComplianceResult {
  const roundedHours = Math.round(weeklyHours * 10) / 10;
  const isOvertime = roundedHours > 45;
  const isVast = employee?.statuut === 'Vast';
  const isVastUnderhours = isVast && roundedHours < 42;
  const isVastOptimal = isVast && roundedHours >= 42 && roundedHours <= 45;
  const excessHours = isOvertime ? Math.round((roundedHours - 45) * 10) / 10 : 0;
  const shortageHours = isVastUnderhours ? Math.round((42 - roundedHours) * 10) / 10 : 0;

  let message: string | undefined;
  if (isOvertime) {
    message = `Overwerk waarschuwing: ${employee?.name || 'Medewerker'} heeft al ${roundedHours}u ingepland in deze week (> 45u limiet om overwerk te voorkomen, +${excessHours}u te veel).`;
  } else if (isVastUnderhours) {
    message = `Contractnorm waarschuwing: ${employee?.name || 'Vaste medewerker'} heeft ${roundedHours}u ingepland en geraakt nog niet aan de contractnorm van 42u per week (tekort van ${shortageHours}u).`;
  } else if (isVastOptimal) {
    message = `${employee?.name || 'Vaste medewerker'} zit met ${roundedHours}u op de contractnorm van 42-45u per week.`;
  }

  return {
    hours: roundedHours,
    isOvertime,
    isVastUnderhours,
    isVastOptimal,
    excessHours,
    shortageHours,
    message
  };
}
