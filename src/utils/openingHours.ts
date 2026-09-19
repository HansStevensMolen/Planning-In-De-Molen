/**
 * Café / Eet-staminée In De Molen - Officiële Openingsuren
 * - Maandag t/m Donderdag: 11u30 tot 01u00
 * - Vrijdag en Zaterdag: 11u30 tot 02u00
 * - Zondag: 10u00 tot 00u00 (0u00)
 */

export interface CafeDayHours {
  day: number; // 0 = Maandag ... 6 = Zondag
  dayName: string;
  openTime: string; // e.g. "11:30" or "10:00"
  closeTime: string; // e.g. "01:00", "02:00", "00:00"
  displayOpen: string; // "11u30" or "10u00"
  displayClose: string; // "01u00", "02u00", "00u00"
  displayFull: string; // "11u30 - 01u00"
}

export const CAFE_OPENING_HOURS: Record<number, CafeDayHours> = {
  0: {
    day: 0,
    dayName: 'Maandag',
    openTime: '11:30',
    closeTime: '01:00',
    displayOpen: '11u30',
    displayClose: '01u00',
    displayFull: '11u30 - 01u00'
  },
  1: {
    day: 1,
    dayName: 'Dinsdag',
    openTime: '11:30',
    closeTime: '01:00',
    displayOpen: '11u30',
    displayClose: '01u00',
    displayFull: '11u30 - 01u00'
  },
  2: {
    day: 2,
    dayName: 'Woensdag',
    openTime: '11:30',
    closeTime: '01:00',
    displayOpen: '11u30',
    displayClose: '01u00',
    displayFull: '11u30 - 01u00'
  },
  3: {
    day: 3,
    dayName: 'Donderdag',
    openTime: '11:30',
    closeTime: '01:00',
    displayOpen: '11u30',
    displayClose: '01u00',
    displayFull: '11u30 - 01u00'
  },
  4: {
    day: 4,
    dayName: 'Vrijdag',
    openTime: '11:30',
    closeTime: '02:00',
    displayOpen: '11u30',
    displayClose: '02u00',
    displayFull: '11u30 - 02u00'
  },
  5: {
    day: 5,
    dayName: 'Zaterdag',
    openTime: '11:30',
    closeTime: '02:00',
    displayOpen: '11u30',
    displayClose: '02u00',
    displayFull: '11u30 - 02u00'
  },
  6: {
    day: 6,
    dayName: 'Zondag',
    openTime: '10:00',
    closeTime: '00:00',
    displayOpen: '10u00',
    displayClose: '00u00',
    displayFull: '10u00 - 00u00'
  }
};

export const getCafeHoursForDay = (day: number): CafeDayHours => {
  return CAFE_OPENING_HOURS[day] || CAFE_OPENING_HOURS[0];
};

export const CAFE_SUMMARY_OPENING_HOURS =
  'Elke dag open van 11u30 tot 01u00 • Vrijdag & Zaterdag tot 02u00 • Zondag van 10u00 tot 00u00';
