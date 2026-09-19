import { WeekMeta } from '../types';

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

const DAYS_SHORT_NL = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

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
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon.getTime() + i * 86400000);
    daysFormatted.push(`${DAYS_SHORT_NL[i]} ${d.getUTCDate()} ${MONTHS_SHORT_NL[d.getUTCMonth()]}`);
  }

  return {
    weekNumber,
    label,
    shortLabel: `Week ${weekNumber}`,
    isCurrent,
    isNext,
    isUpcoming,
    dateRange,
    daysFormatted
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
 * Zowel de huidige week (CURRENT_WEEK_NUMBER) als de volgende week (CURRENT_WEEK_NUMBER + 1)
 * liggen vast en kunnen NIET gewijzigd worden door medewerkers.
 * Pas vanaf 2 weken vooruit (weekNumber >= CURRENT_WEEK_NUMBER + 2) kunnen beschikbaarheden worden ingediend of aangepast.
 */
export function isWeekAvailabilityLocked(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER
): boolean {
  return targetWeekNumber <= currentWeekNumber + 1;
}

/**
 * Controleert of een week voorbij de deadline is of vergrendeld is.
 */
export function isAvailabilityPastDeadline(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER
): boolean {
  return targetWeekNumber <= currentWeekNumber + 1;
}

export function getAvailabilityDeadlineInfo(
  targetWeekNumber: number,
  currentWeekNumber: number = CURRENT_WEEK_NUMBER
) {
  const diff = targetWeekNumber - currentWeekNumber;
  const isPast = diff < 0;
  const isCurrent = diff === 0;
  const isNext = diff === 1;
  const isLocked = diff <= 1;

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

  if (isCurrent) {
    return {
      isLocked: true,
      isLate: false,
      isCurrent: true,
      isNext: false,
      weeksBeforeStart: 0,
      badgeText: 'Huidige week (vastgelegd)',
      friendlyMessage: `Huidige week (Week ${targetWeekNumber}): Het werkrooster loopt al. De beschikbaarheden liggen vast en kunnen niet meer gewijzigd worden.`
    };
  }

  if (isNext) {
    return {
      isLocked: true,
      isLate: false,
      isCurrent: false,
      isNext: true,
      weeksBeforeStart: 1,
      badgeText: 'Volgende week (vastgelegd)',
      friendlyMessage: `Volgende week (Week ${targetWeekNumber}): Het werkrooster is reeds definitief opgemaakt. De beschikbaarheden liggen vast en kunnen niet meer gewijzigd worden.`
    };
  }

  return {
    isLocked: false,
    isLate: false,
    isCurrent: false,
    isNext: false,
    weeksBeforeStart: diff,
    badgeText: `Over ${diff} weken (open)`,
    friendlyMessage: `Beschikbaarheid voor Week ${targetWeekNumber} (over ${diff} weken) staat open om in te vullen of aan te passen.`
  };
}
