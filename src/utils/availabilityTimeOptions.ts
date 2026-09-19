/**
 * Availability time helpers for Eet-staminée In De Molen
 * Openingsuren:
 * - Maandag t/m Donderdag: 11u30 tot 01u00
 * - Vrijdag en Zaterdag: 11u30 tot 02u00
 * - Zondag: 10u00 tot 00u00
 *
 * Studenten < 18 jaar:
 * - Mogen niet na 23u00 werken (geen Sluit / Hulpsluit)
 * - Mogen niet langer dan 8u per dag werken
 */

export interface QuickPreset {
  label: string;
  start: string;
  end: string;
  badge?: string;
  description?: string;
}

/**
 * Returns available start time options for a given day.
 * 0 = Monday, ..., 6 = Sunday.
 */
export const getBeginTimes = (day: number): string[] => {
  if (day === 6) { // Zondag (opening 10:00)
    return ['Open', '10u00', '12u00', '14u00', '16u00', '17u00', '18u00'];
  }
  // Maandag t/m Zaterdag (opening 11:30)
  return ['Open', '11u30', '12u00', '14u00', '16u00', '17u00', '18u00'];
};

/**
 * Returns available end time options for a given day and start time.
 * If isMinorStudent is true, hides Sluit and Hulpsluit (since closing is 01:00/02:00/00:00).
 */
export const getEndTimes = (day: number, startTime?: string, isMinorStudent = false): string[] => {
  const isSunday = day === 6;
  const start = (startTime || 'Open').toLowerCase();
  const times: string[] = [];

  // Minor students (<18) may NOT work after 23:00!
  if (isMinorStudent) {
    times.push('23u00');
    times.push('22u00');
    times.push('21u00');
    times.push('18u00');
    return times;
  }

  // Eindopties voor meerderjarigen: Sluit en Hulpsluit vooraan voor snelle selectie
  times.push('Sluit');
  times.push('Hulpsluit');

  // Vaste vertrektijden
  times.push('23u00');
  if (isSunday) {
    times.push('21u00');
  }

  // Vroegere vertrektijd indien men voor 16u00 begint
  const isLateStart = start.includes('16') || start.includes('17') || start.includes('18');
  if (!isLateStart) {
    times.push('18u00');
  }

  return times;
};

/**
 * Normalizes input time strings to standard casing:
 * 'open' -> 'Open', 'sluit' -> 'Sluit', 'hulpsluit' -> 'Hulpsluit'
 */
export const normalizeAvailabilityTime = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'open') return 'Open';
  if (lower === 'sluit') return 'Sluit';
  if (lower === 'hulpsluit') return 'Hulpsluit';
  return trimmed;
};

/**
 * Common quick presets for fast 1-click availability filling
 */
export const getQuickAvailabilityPresets = (day: number, isMinor = false): QuickPreset[] => {
  const isSunday = day === 6;

  if (isMinor) {
    // Presets strictly within legal bounds: max 8h, ending at or before 23:00
    return [
      {
        label: '16u00 - 23u00',
        start: '16u00',
        end: '23u00',
        badge: '🌙 Avond (Max 23u)',
        description: '7 uur avonddienst (conform -18 wetgeving)'
      },
      {
        label: '17u00 - 23u00',
        start: '17u00',
        end: '23u00',
        badge: '⚡ Kort Avond',
        description: '6 uur avonddienst (tot 23u00)'
      },
      {
        label: isSunday ? '10u00 - 18u00' : '11u30 - 18u00',
        start: isSunday ? '10u00' : '11u30',
        end: '18u00',
        badge: '☀️ Dagdienst',
        description: isSunday ? '8 uur dagdienst (10:00 tot 18:00)' : '6.5 uur dagdienst (11:30 tot 18:00)'
      }
    ];
  }

  return [
    {
      label: 'Open - Sluit',
      start: 'Open',
      end: 'Sluit',
      badge: '✨ Volledig',
      description: isSunday ? 'Vanaf 10u00 tot sluit' : 'Vanaf 11u30 tot sluit'
    },
    {
      label: 'Open - Hulpsluit',
      start: 'Open',
      end: 'Hulpsluit',
      badge: '🌓 Hulpsluit',
      description: 'Vanaf opening tot hulpsluiting'
    },
    {
      label: '16u00 - Sluit',
      start: '16u00',
      end: 'Sluit',
      badge: '🌙 Avond',
      description: 'Vanaf 16:00 tot sluiting'
    },
    {
      label: '16u00 - Hulpsluit',
      start: '16u00',
      end: 'Hulpsluit',
      badge: '⚡ Hulp',
      description: 'Vanaf 16:00 tot hulpsluiting'
    },
    {
      label: '16u00 - 23u00',
      start: '16u00',
      end: '23u00',
      badge: '🕐 Tot 23u',
      description: 'Vaste avondshift tot 23:00'
    },
    {
      label: isSunday ? '10u00 - 18u00' : '11u30 - 18u00',
      start: isSunday ? '10u00' : '11u30',
      end: '18u00',
      badge: '☀️ Dagshift',
      description: isSunday ? '10:00 tot 18:00 dagdienst' : '11:30 tot 18:00 dagdienst'
    },
    {
      label: '18u00 - Sluit',
      start: '18u00',
      end: 'Sluit',
      badge: '🍸 Laat',
      description: 'Vanaf 18:00 tot sluiting'
    }
  ];
};
