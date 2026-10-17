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

export const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december'
];

export const MONTHS_SHORT_NL = [
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

/**
 * Dedicated week identifier for 'Speciale dagen' (Feestdagen & Eindejaar 2026/2027)
 * Bron: Google Formulier "Speciale drukke dagen eind 2026" (https://forms.gle/gq3jZiGkK8cZsahd7)
 */
export const SPECIAL_DAYS_WEEK_NUMBER = 99;

export interface SpecialDayInfo {
  dayIndex: number;
  title: string;
  dateStr: string;
  dayNameFull: string;
  dayNameShort: string;
  shortDate: string;
  fullDate: string;
  slashDate: string;
  formattedWithDay: string;
  badge: string;
  closingNote?: string;
  formNotes?: string;
}

export const SPECIAL_DAYS_LIST: SpecialDayInfo[] = [
  {
    dayIndex: 0,
    title: 'Allerheiligen',
    dateStr: 'zondag 1 november 2026',
    dayNameFull: 'Zondag 1 november 2026 (Allerheiligen)',
    dayNameShort: 'Zo 1 nov',
    shortDate: '1 nov',
    fullDate: '1 november 2026',
    slashDate: '01/11',
    formattedWithDay: 'Zondag 1 nov (Allerheiligen)',
    badge: 'Allerheiligen',
    formNotes: 'Open vanaf 10u00'
  },
  {
    dayIndex: 1,
    title: 'Wapenstilstand',
    dateStr: 'woensdag 11 november 2026',
    dayNameFull: 'Woensdag 11 november 2026 (Wapenstilstand)',
    dayNameShort: 'Wo 11 nov',
    shortDate: '11 nov',
    fullDate: '11 november 2026',
    slashDate: '11/11',
    formattedWithDay: 'Woensdag 11 nov (Wapenstilstand)',
    badge: 'Wapenstilstand',
    formNotes: 'Open vanaf 10u00'
  },
  {
    dayIndex: 2,
    title: 'Kerstavond',
    dateStr: 'donderdag 24 december 2026',
    dayNameFull: 'Donderdag 24 december 2026 (Kerstavond - dicht om 17u00)',
    dayNameShort: 'Do 24 dec',
    shortDate: '24 dec',
    fullDate: '24 december 2026',
    slashDate: '24/12',
    formattedWithDay: 'Donderdag 24 dec (Kerstavond)',
    badge: 'Kerstavond',
    closingNote: 'Dicht om 17u00',
    formNotes: 'Zaak sluit stipt om 17u00'
  },
  {
    dayIndex: 3,
    title: 'Kerstmis',
    dateStr: 'vrijdag 25 december 2026',
    dayNameFull: 'Vrijdag 25 december 2026 (Kerstmis)',
    dayNameShort: 'Vr 25 dec',
    shortDate: '25 dec',
    fullDate: '25 december 2026',
    slashDate: '25/12',
    formattedWithDay: 'Vrijdag 25 dec (Kerstmis)',
    badge: 'Kerstmis',
    formNotes: 'Open vanaf 11u30'
  },
  {
    dayIndex: 4,
    title: 'Oudejaarsavond',
    dateStr: 'donderdag 31 december 2026',
    dayNameFull: 'Donderdag 31 december 2026 (Oudejaarsavond - dicht om 17u00)',
    dayNameShort: 'Do 31 dec',
    shortDate: '31 dec',
    fullDate: '31 december 2026',
    slashDate: '31/12',
    formattedWithDay: 'Donderdag 31 dec (Oudejaarsavond)',
    badge: 'Oudejaarsavond',
    closingNote: 'Dicht om 17u00',
    formNotes: 'Zaak sluit stipt om 17u00'
  },
  {
    dayIndex: 5,
    title: 'Nieuwjaar',
    dateStr: 'vrijdag 1 januari 2027',
    dayNameFull: 'Vrijdag 1 januari 2027 (Nieuwjaar)',
    dayNameShort: 'Vr 1 jan',
    shortDate: '1 jan',
    fullDate: '1 januari 2027',
    slashDate: '01/01',
    formattedWithDay: 'Vrijdag 1 jan 2027 (Nieuwjaar)',
    badge: 'Nieuwjaar 2027',
    formNotes: 'Open vanaf 11u30'
  },
  {
    dayIndex: 6,
    title: 'Nieuwjaarsweekend',
    dateStr: 'zaterdag 2 januari 2027',
    dayNameFull: 'Zaterdag 2 januari 2027 (Nieuwjaarsweekend)',
    dayNameShort: 'Za 2 jan',
    shortDate: '2 jan',
    fullDate: '2 januari 2027',
    slashDate: '02/01',
    formattedWithDay: 'Zaterdag 2 jan 2027 (Weekend)',
    badge: 'Nieuwjaarsweekend',
    formNotes: 'Open vanaf 11u30'
  }
];

export const SPECIAL_DAYS_META: WeekMeta = {
  weekNumber: SPECIAL_DAYS_WEEK_NUMBER,
  label: 'Speciale dagen',
  shortLabel: 'Speciale dagen',
  isCurrent: false,
  isNext: false,
  isUpcoming: true,
  isArchived: false,
  dateRange: '1 nov 2026 – 1 jan 2027 (Feestdagen & Eindejaar)',
  daysFormatted: [
    'Zo 1 nov: Allerheiligen (open 10u)',
    'Wo 11 nov: Wapenstilstand (open 10u)',
    'Do 24 dec: Kerstavond (dicht 17u)',
    'Vr 25 dec: Kerstmis (open 11u30)',
    'Do 31 dec: Oudejaarsavond (dicht 17u)',
    'Vr 1 jan: Nieuwjaar 2027 (open 11u30)',
    'Za 2 jan: Nieuwjaarsweekend'
  ],
  dayDates: ['1 nov', '11 nov', '24 dec', '25 dec', '31 dec', '1 jan', '2 jan'],
  dayDatesFull: [
    '1 november 2026',
    '11 november 2026',
    '24 december 2026',
    '25 december 2026',
    '31 december 2026',
    '1 januari 2027',
    '2 januari 2027'
  ]
};

export function isSpecialDaysWeek(weekNumber?: number): boolean {
  return weekNumber === SPECIAL_DAYS_WEEK_NUMBER;
}

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
  if (weekNumber === SPECIAL_DAYS_WEEK_NUMBER) {
    const specialDay = SPECIAL_DAYS_LIST[dayIndex] || SPECIAL_DAYS_LIST[0];
    return {
      dayIndex,
      dayNameFull: specialDay.dayNameFull,
      dayNameShort: specialDay.dayNameShort,
      shortDate: specialDay.shortDate,
      fullDate: specialDay.fullDate,
      slashDate: specialDay.slashDate,
      formattedWithDay: specialDay.formattedWithDay
    };
  }

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
    if (w >= currentWeek && w !== SPECIAL_DAYS_WEEK_NUMBER) activeWeekSet.add(w);
  });

  // Shifts in future weeks
  shifts.forEach(s => {
    if (typeof s.weekNumber === 'number' && s.weekNumber >= currentWeek && s.weekNumber !== SPECIAL_DAYS_WEEK_NUMBER) {
      activeWeekSet.add(s.weekNumber);
    }
  });

  const sorted = Array.from(activeWeekSet).sort((a, b) => a - b);
  const result = sorted.map(w => generateWeekMeta(w, currentWeek));

  // Voeg altijd 'Speciale dagen' toe aan de actieve wekenlijst
  result.push(SPECIAL_DAYS_META);

  return result;
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
  if (weekNumber === SPECIAL_DAYS_WEEK_NUMBER) {
    return SPECIAL_DAYS_META;
  }

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
  if (weekNumber === SPECIAL_DAYS_WEEK_NUMBER) {
    return false; // Speciale feestdagen liggen in de toekomst / actief
  }
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

  // Speciale dagen: standaard OPEN zodat personeel direct kan invullen (tenzij beheerder specifiek vergrendelt)
  if (targetWeekNumber === SPECIAL_DAYS_WEEK_NUMBER) {
    if (settings && Array.isArray(settings.lockedWeeks)) {
      return settings.lockedWeeks.includes(SPECIAL_DAYS_WEEK_NUMBER);
    }
    return false;
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
  // Voor Speciale dagen (feestdagen) geldt uitsluitend een expliciete opgave, geen automatische wekelijkse herhaling
  if (weekNumber === SPECIAL_DAYS_WEEK_NUMBER) {
    const explicitSpecial = availabilities.find(a => a.employeeId === employee.id && a.weekNumber === weekNumber);
    if (explicitSpecial && explicitSpecial.days && explicitSpecial.days.length > 0) {
      return {
        availability: explicitSpecial,
        source: 'weekly',
        label: 'Speciale dagen specifiek ingediend'
      };
    }
    return {
      availability: null,
      source: 'none',
      label: 'Nog niet ingediend voor Speciale dagen'
    };
  }

  const rec = employee.recurringAvailability;
  const hasRecurring = Boolean(rec && rec.active && rec.days && rec.days.length > 0);
  const explicit = availabilities.find(a => a.employeeId === employee.id && a.weekNumber === weekNumber);

  // 1. Personeel met actieve vaste beschikbaarheid (Flexi, Student, Extra, Vast)
  // In ALLE weken staan ENKEL de dag(en) van hun vaste beschikbaarheid aangeduid als beschikbaar!
  // Alle overige dagen zijn strikt 'unavailable'.
  // Indien een medewerker zich voor een specifieke week heeft afgemeld op een vaste dag (explicit status === 'unavailable'),
  // dan respecteren we deze afmelding.
  if (hasRecurring) {
    const isApplicable = isRecurringApplicableToWeek(rec!.frequency, weekNumber);

    const days: DayAvailability[] = Array.from({ length: 7 }, (_, dayIdx) => {
      if (!isApplicable) {
        return {
          day: dayIdx,
          status: 'unavailable',
          startTime: 'Open',
          endTime: 'Sluit',
          notes: 'Niet inzetbaar in deze week (vaste cyclus)'
        };
      }

      const rd = rec!.days.find(x => x.day === dayIdx);
      const isFixedDay = Boolean(rd && (rd.status === 'available' || rd.status === 'preferred'));
      const explicitDay = explicit?.days?.find(x => x.day === dayIdx);

      // Als dit een vaste beschikbare dag is:
      if (isFixedDay) {
        // Indien de medewerker zich expliciet heeft afgemeld voor deze dag in deze week:
        if (explicitDay && explicitDay.status === 'unavailable') {
          return {
            day: dayIdx,
            status: 'unavailable',
            startTime: 'Open',
            endTime: 'Sluit',
            notes: explicitDay.notes || 'Afgemeld voor deze vaste dag'
          };
        }
        // Anders beschikbaar volgens vaste beschikbaarheid (of eventueel aangepaste uren van medewerker)
        return {
          day: dayIdx,
          status: (explicitDay?.status === 'preferred' || rd!.status === 'preferred') ? 'preferred' : 'available',
          startTime: explicitDay?.startTime || rd!.startTime || 'Open',
          endTime: explicitDay?.endTime || rd!.endTime || 'Sluit',
          notes: explicitDay?.notes || rd!.notes || ''
        };
      }

      // Indien GEEN vaste dag:
      // In alle weken staan ENKEL de dag(en) van hun vaste beschikbaarheid als beschikbaar aangeduid.
      // Alle overige dagen zijn ALTIJD niet-beschikbaar.
      return {
        day: dayIdx,
        status: 'unavailable',
        startTime: 'Open',
        endTime: 'Sluit',
        notes: explicitDay?.notes || ''
      };
    });

    const freqLabel = rec!.frequency === 'every_week'
      ? 'Wekelijks herhaald'
      : rec!.frequency === 'even_weeks'
        ? '2-wekelijks (Even week)'
        : '2-wekelijks (Oneven week)';

    const hasAnyAfmelding = days.some((d, idx) => {
      const rd = rec!.days.find(x => x.day === idx);
      const isFixed = Boolean(rd && (rd.status === 'available' || rd.status === 'preferred'));
      return isFixed && d.status === 'unavailable';
    });

    return {
      availability: {
        id: explicit?.id || `rec_${employee.id}_wk${weekNumber}`,
        employeeId: employee.id,
        weekNumber: weekNumber,
        days
      },
      source: explicit ? 'weekly' : 'recurring',
      label: hasAnyAfmelding
        ? `Vaste beschikbaarheid (met afmelding)`
        : `Vaste beschikbaarheid (${freqLabel})`
    };
  }

  // 2. Expliciete wekelijkse indiening voor personeel zonder vaste beschikbaarheid
  if (explicit && explicit.days && explicit.days.length > 0) {
    return {
      availability: explicit,
      source: 'weekly',
      label: `Week ${weekNumber} specifiek ingediend`
    };
  }

  return {
    availability: null,
    source: 'none',
    label: 'Niet ingevuld'
  };
}

