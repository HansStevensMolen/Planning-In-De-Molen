import { WeekMeta, Employee, EmployeeAvailability, DayAvailability, RecurringFrequency, AppSettings } from '../types';

/**
 * Dynamically computes the ISO 8601 week number and year.
 * For mid-September 2026, this resolves accurately to Week 38.
 */
export function getCurrentISOWeek(d: Date = new Date()): { year: number; week: number } {
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.getTime();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.getTime()) / 604800000);
  return { year: target.getUTCFullYear(), week };
}

export const CURRENT_WEEK_INFO = getCurrentISOWeek();
export const CURRENT_WEEK_NUMBER = CURRENT_WEEK_INFO.week; // Week 38
export const NEXT_WEEK_NUMBER = CURRENT_WEEK_NUMBER + 1; // Week 39

const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

const MONTHS_SHORT_NL = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
];

export const DAYS_SHORT_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

/**
 * Returns Monday Date of a given ISO week and year.
 */
export function getDateOfISOWeek(w: number, y: number = CURRENT_WEEK_INFO.year): Date {
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const mon1 = new Date(jan4.getTime() - (day - 1) * 86400000);
  const monW = new Date(mon1.getTime() + (w - 1) * 7 * 86400000);
  return monW;
}

export const DAYS_FULL_NL = [
  'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'
];

export interface DayDateInfo {
  dayIndex: number;
  dayNameFull: string;
  dayNameShort: string;
  shortDate: string;
  fullDate: string;
  slashDate: string;
  formattedWithDay: string;
}

export function getDayDateInfo(
  weekNumber: number,
  dayIndex: number,
  year: number = CURRENT_WEEK_INFO.year
): DayDateInfo {
  const mon = getDateOfISOWeek(weekNumber, year);
  const d = new Date(mon.getTime() + dayIndex * 86400000);
  const dayOfMonth = d.getUTCDate();
  const mShort = MONTHS_SHORT_NL[d.getUTCMonth()];
  const mFull = MONTHS_NL[d.getUTCMonth()];
  const dayNameFull = DAYS_FULL_NL[dayIndex] || `Dag ${dayIndex + 1}`;
  const dayNameShort = DAYS_SHORT_NL[dayIndex] || `D${dayIndex + 1}`;
  const shortDate = `${dayOfMonth} ${mShort}`;
  const fullDate = `${dayOfMonth} ${mFull} ${d.getUTCFullYear()}`;
  const slashDate = `${String(dayOfMonth).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

  return {
    dayIndex,
    dayNameFull,
    dayNameShort,
    shortDate,
    fullDate,
    slashDate,
    formattedWithDay: `${dayNameFull} ${shortDate}`
  };
}

/**
 * Dynamically generates full WeekMeta with precise Dutch dates for ANY week number.
 */
export function generateWeekMeta(
  weekNumber: number,
  currentWeek: number = CURRENT_WEEK_NUMBER,
  year: number = CURRENT_WEEK_INFO.year
): WeekMeta {
  const mon = getDateOfISOWeek(weekNumber, year);
  const sun = new Date(mon.getTime() + 6 * 86400000);

  const isCurrent = weekNumber === currentWeek;
  const isNext = weekNumber === currentWeek + 1;
  const isUpcoming = weekNumber > currentWeek;
  const isArchived = weekNumber < currentWeek;

  let label = `Week ${weekNumber}`;
  if (isCurrent) {
    label += ' (Huidige week)';
  } else if (isNext) {
    label += ' (Volgende week)';
  } else if (isArchived) {
    label += ' (Archief)';
  } else {
    const diff = weekNumber - currentWeek;
    label += ` (Over ${diff} ${diff === 1 ? 'week' : 'weken'})`;
  }

  const dateRange = `${mon.getUTCDate()} ${MONTHS_NL[mon.getUTCMonth()]} – ${sun.getUTCDate()} ${MONTHS_NL[sun.getUTCMonth()]} ${sun.getUTCFullYear()}`;

  const daysFormatted: string[] = [];
  const dayDates: string[] = [];
  const dayDatesFull: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon.getTime() + i * 86400000);
    const dayNr = d.getUTCDate();
    const mShort = MONTHS_SHORT_NL[d.getUTCMonth()];
    const mFull = MONTHS_NL[d.getUTCMonth()];
    daysFormatted.push(`${DAYS_SHORT_NL[i]} ${dayNr} ${mShort}`);
    dayDates.push(`${dayNr} ${mShort}`);
    dayDatesFull.push(`${dayNr} ${mFull}`);
  }

  return {
    weekNumber,
    label,
    shortLabel: `Week ${weekNumber}`,
    isCurrent,
    isNext,
    isUpcoming,
    isArchived,
    dateRange,
    daysFormatted,
    dayDates,
    dayDatesFull
  };
}

/**
 * Beschikbaarheden & planning horizon:
 * De week waar we in zitten (huidige week) + steeds de komende 5 weken (in totaal 6 actieve weken).
 * Voorbeeld voor Week 38: Week 38 (huidig), Week 39, Week 40, Week 41, Week 42, Week 43.
 */
export const AVAILABLE_WEEKS: WeekMeta[] = Array.from({ length: 6 }, (_, i) =>
  generateWeekMeta(CURRENT_WEEK_NUMBER + i)
);

export const AVAILABILITY_WEEKS = AVAILABLE_WEEKS;

/**
 * Archived older weeks: all weeks strictly before CURRENT_WEEK_NUMBER.
 * Preserves historical records (e.g. Week 37, Week 28, Week 27, Week 26).
 */
export const HISTORICAL_WEEKS: WeekMeta[] = [
  generateWeekMeta(37),
  generateWeekMeta(28),
  generateWeekMeta(27),
  generateWeekMeta(26)
];

/**
 * Automatically discovers all past weeks (any week strictly prior to CURRENT_WEEK_NUMBER).
 * Collects past weeks from shifts, availabilities, recent historical weeks, and marks them as archived.
 * Automatically sorts them descending (most recent past week first: Week 37, Week 36, etc.).
 */
export function getAutoArchivedWeeks(
  currentWeek: number = CURRENT_WEEK_NUMBER,
  shifts: { weekNumber?: number }[] = [],
  availabilities: { weekNumber?: number }[] = []
): WeekMeta[] {
  const pastWeekSet = new Set<number>();

  // 1. Scan shifts for past weeks
  shifts.forEach(s => {
    if (typeof s.weekNumber === 'number' && s.weekNumber < currentWeek) {
      pastWeekSet.add(s.weekNumber);
    }
  });

  // 2. Scan availabilities for past weeks
  availabilities.forEach(a => {
    if (typeof a.weekNumber === 'number' && a.weekNumber < currentWeek) {
      pastWeekSet.add(a.weekNumber);
    }
  });

  // 3. Always include immediate past weeks (at least currentWeek - 1, currentWeek - 2, etc.)
  for (let i = 1; i <= 4; i++) {
    const pastW = currentWeek - i;
    if (pastW > 0) {
      pastWeekSet.add(pastW);
    }
  }

  // 4. Include previous recorded history if any
  HISTORICAL_WEEKS.forEach(w => {
    if (w.weekNumber < currentWeek) {
      pastWeekSet.add(w.weekNumber);
    }
  });

  const sorted = Array.from(pastWeekSet).sort((a, b) => b - a);
  return sorted.map(w => generateWeekMeta(w, currentWeek));
}

/**
 * Generates active (non-archived) weeks list:
 * Strictly >= currentWeek.
 * Default horizon is currentWeek + 5 (6 active weeks total) + any extra added future weeks.
 */
export function getAutoActiveWeeks(
  currentWeek: number = CURRENT_WEEK_NUMBER,
  extraWeeks: number[] = [],
  shifts: { weekNumber?: number }[] = []
): WeekMeta[] {
  const activeWeekSet = new Set<number>();

  // Default horizon: current week + 5 weeks (6 active weeks total)
  for (let i = 0; i < 6; i++) {
    activeWeekSet.add(currentWeek + i);
  }

  // Extra future weeks
  extraWeeks.forEach(w => {
    if (w >= currentWeek) activeWeekSet.add(w);
  });

  // Shifts in future weeks
  shifts.forEach(s => {
    if (typeof s.weekNumber === 'number' && s.weekNumber >= currentWeek) {
      activeWeekSet.add(s.weekNumber);
    }
  });

  const sorted = Array.from(activeWeekSet).sort((a, b) => a - b);
  return sorted.map(w => generateWeekMeta(w, currentWeek));
}

/**
 * The 6 upcoming weeks from next week for the 6-weeks auto-planner
 * (e.g. Weeks 39, 40, 41, 42, 43, 44)
 */
export const UPCOMING_SIX_WEEKS_FROM_NEXT: number[] = Array.from(
  { length: 6 },
  (_, i) => NEXT_WEEK_NUMBER + i
);

/**
 * The 6 upcoming weeks starting from current week
 */
export const UPCOMING_SIX_WEEKS_FROM_CURRENT: number[] = Array.from(
  { length: 6 },
  (_, i) => CURRENT_WEEK_NUMBER + i
);

export function getWeekMeta(weekNumber: number): WeekMeta {
  const found =
    AVAILABLE_WEEKS.find((w) => w.weekNumber === weekNumber) ||
    HISTORICAL_WEEKS.find((w) => w.weekNumber === weekNumber);
  if (found) return found;

  // Fallback dynamic generator for any custom or extra added week
  return generateWeekMeta(weekNumber);
}

/**
 * Checks if a week is archived (i.e. strictly prior to current active week)
 */
export function isWeekArchived(weekNumber: number, currentWeek: number = CURRENT_WEEK_NUMBER): boolean {
  return weekNumber < currentWeek;
}

/**
 * Controleert of de beschikbaarheden voor een bepaalde week vergrendeld zijn (niet gewijzigd kunnen worden).
 * Wordt dynamisch per week gecontroleerd aan de hand van de door de beheerder ingestelde vergrendelde weken.
 */
export function isWeekAvailabilityLocked(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER,
  settings?: AppSettings
): boolean {
  // 1. Indien het doorgeven globaal is uitgeschakeld door de beheerder: ALLES vergrendeld
  if (settings && settings.availabilitySubmissionEnabled === false) {
    return true;
  }

  // 2. Gearchiveerde weken uit het verleden zijn altijd vergrendeld
  if (targetWeekNumber < currentWeekNumber) {
    return true;
  }

  // 3. Indien de beheerder een lijst met vergrendelde weken heeft geconfigureerd:
  if (settings && Array.isArray(settings.lockedWeeks)) {
    return settings.lockedWeeks.includes(targetWeekNumber);
  }

  // 4. Standaard fallback indien nog geen instellingen zijn opgeslagen:
  // Huidige week en volgende week zijn standaard vergrendeld
  return targetWeekNumber <= currentWeekNumber + 1;
}

/**
 * Wisselt de status van een week (vergrendeld <-> geopend).
 */
export function toggleWeekInLockedList(
  weekNumber: number,
  currentLockedWeeks: number[] = [CURRENT_WEEK_NUMBER, NEXT_WEEK_NUMBER]
): number[] {
  if (currentLockedWeeks.includes(weekNumber)) {
    return currentLockedWeeks.filter(w => w !== weekNumber);
  } else {
    return [...currentLockedWeeks, weekNumber].sort((a, b) => a - b);
  }
}

/**
 * Controleert of een week voorbij de deadline is of vergrendeld is.
 */
export function isAvailabilityPastDeadline(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER,
  settings?: AppSettings
): boolean {
  return isWeekAvailabilityLocked(targetWeekNumber, currentWeekNumber, settings);
}

export function getAvailabilityDeadlineInfo(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER,
  settings?: AppSettings
) {
  const isLocked = isWeekAvailabilityLocked(targetWeekNumber, currentWeekNumber, settings);
  const diff = targetWeekNumber - currentWeekNumber;
  const isPast = diff < 0;
  const isCurrent = diff === 0;
  const isNext = diff === 1;

  if (isPast) {
    return {
      isLocked: true,
      isLate: true,
      isCurrent: false,
      isNext: false,
      weeksBeforeStart: diff,
      badgeText: 'Gearchiveerd (vast)',
      friendlyMessage: `Week ${targetWeekNumber} ligt in het verleden en kan niet meer gewijzigd worden.`
    };
  }

  if (isLocked) {
    return {
      isLocked: true,
      isLate: false,
      isCurrent,
      isNext,
      weeksBeforeStart: diff,
      badgeText: 'Vergrendeld door beheerder',
      friendlyMessage: `Beschikbaarheid voor Week ${targetWeekNumber} is vergrendeld door de beheerder (Hans Stevens). Je kunt je beschikbaarheid alleen inkijken.`
    };
  }

  return {
    isLocked: false,
    isLate: false,
    isCurrent,
    isNext,
    weeksBeforeStart: diff,
    badgeText: isCurrent ? 'Huidige week (open)' : isNext ? 'Volgende week (open)' : `Over ${diff} weken (open)`,
    friendlyMessage: `Beschikbaarheid voor Week ${targetWeekNumber} staat open om in te vullen of aan te passen.`
  };
}

/**
 * Checks if a recurring availability frequency applies to a given ISO week number.
 * - 'every_week': applies to all weeks
 * - 'even_weeks': applies when weekNumber % 2 === 0
 * - 'odd_weeks': applies when weekNumber % 2 !== 0
 */
export function isRecurringApplicableToWeek(frequency: RecurringFrequency = 'every_week', weekNumber: number): boolean {
  if (frequency === 'every_week') return true;
  if (frequency === 'even_weeks') return weekNumber % 2 === 0;
  if (frequency === 'odd_weeks') return weekNumber % 2 !== 0;
  return false;
}

export interface EffectiveAvailabilityResult {
  availability: EmployeeAvailability | null;
  source: 'weekly' | 'recurring' | 'none';
  label: string;
}

/**
 * Resolves the effective availability for an employee in a given week.
 * Priority:
 * 1. An explicit weekly submission (if present in `availabilities`)
 * 2. An active recurring availability pattern (repeated week-by-week for Flexi, Student, Extra, etc.)
 * 3. None
 */
export function getEffectiveEmployeeAvailability(
  employee: Employee,
  weekNumber: number,
  availabilities: EmployeeAvailability[]
): EffectiveAvailabilityResult {
  // 1. Explicit weekly submission
  const explicit = availabilities.find(a => a.employeeId === employee.id && a.weekNumber === weekNumber);
  if (explicit && explicit.days && explicit.days.length > 0) {
    return {
      availability: explicit,
      source: 'weekly',
      label: `Week ${weekNumber} specifiek ingediend`
    };
  }

  // 2. Active recurring availability (Flexi, Student, Extra)
  const rec = employee.recurringAvailability;
  if (rec && rec.active && rec.days && rec.days.length > 0) {
    if (isRecurringApplicableToWeek(rec.frequency, weekNumber)) {
      const days: DayAvailability[] = rec.days.map(rd => ({
        day: rd.day,
        status: rd.status || 'available',
        startTime: rd.startTime || 'Open',
        endTime: rd.endTime || 'Sluit',
        notes: rd.notes || ''
      }));

      const synthetic: EmployeeAvailability = {
        id: `rec_${employee.id}_wk${weekNumber}`,
        employeeId: employee.id,
        weekNumber: weekNumber,
        days
      };

      const freqLabel = rec.frequency === 'every_week'
        ? 'Wekelijks herhaald'
        : rec.frequency === 'even_weeks'
          ? '2-wekelijks (Even week)'
          : '2-wekelijks (Oneven week)';

      return {
        availability: synthetic,
        source: 'recurring',
        label: `Vaste beschikbaarheid (${freqLabel})`
      };
    }
  }

  return {
    availability: null,
    source: 'none',
    label: 'Niet ingevuld'
  };
}

