/**
 * Availability time helpers for Eet-staminée In De Molen
 * Enforces standardized options:
 * - Start time (beginuur): 'Open' (or specific hours like 12u00, 14u00, 16u00, 17u00, 18u00)
 * - End time (einduur): 'Sluit', 'Hulpsluit' (or specific departure hours like 18u00, 21u00, 23u00)
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
  if (day === 6) { // Zondag / Feestdagen (opening va. 10:00)
    return ['Open', 'Open (10u00)', '12u00', '14u00', '16u00', '17u00', '18u00'];
  }
  return ['Open', '14u00', '16u00', '17u00', '18u00']; // Maandag t/m Zaterdag
};

/**
 * Returns available end time options for a given day and start time.
 * Specifically provides 'Sluit' and 'Hulpsluit' as first-class options.
 */
export const getEndTimes = (day: number, startTime?: string): string[] => {
  const isSunday = day === 6;
  const start = (startTime || 'Open').toLowerCase();
  const times: string[] = [];

  // Eindopties: Sluit en Hulpsluit vooraan voor snelle selectie
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
export const getQuickAvailabilityPresets = (day: number): QuickPreset[] => {
  const isSunday = day === 6;
  return [
    {
      label: 'Open - Sluit',
      start: 'Open',
      end: 'Sluit',
      badge: '✨ Volledig',
      description: isSunday ? 'Vanaf 10u00 tot sluit' : 'Vanaf opening tot sluit'
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
      label: isSunday ? 'Open - 18u00' : 'Open - 18u00',
      start: 'Open',
      end: '18u00',
      badge: '☀️ Dagshift',
      description: isSunday ? '10:00 tot 18:00 dagdienst' : 'Opening tot 18:00 dagdienst'
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
