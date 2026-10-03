import { Employee, Shift, Department } from '../types';
import { getDateOfISOWeek, CURRENT_WEEK_INFO, getDayDateInfo, getWeekMeta } from './weekUtils';
import { getShiftTimingDetails } from './employeeAgeUtils';
import { parseStartTimeToMinutes } from './employeeSortUtils';

const DAYS_OF_WEEK = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

// Helper to calculate date of a day in a given week dynamically
export function getDateForDayAndWeek(dayIndex: number, weekNumber: number, year: number = CURRENT_WEEK_INFO.year): Date {
  const mon = getDateOfISOWeek(weekNumber, year);
  const targetDate = new Date(mon.getTime() + dayIndex * 86400000);
  return targetDate;
}

/**
 * Robustly parses a time string into hours and minutes.
 * Handles formats like '16u00', '16:00', '15u30', '18h00', '16', etc.
 */
export function parseTimeParts(timeStr: string, fallbackH: number = 16, fallbackM: number = 0): { hours: number; minutes: number } {
  if (!timeStr) return { hours: fallbackH, minutes: fallbackM };
  const clean = timeStr.trim().toLowerCase();

  const match = clean.match(/^(\d{1,2})[:uh](\d{2})?$/);
  if (match) {
    const h = parseInt(match[1], 10);
    const m = match[2] ? parseInt(match[2], 10) : 0;
    return { hours: isNaN(h) ? fallbackH : h, minutes: isNaN(m) ? fallbackM : m };
  }

  const single = parseInt(clean, 10);
  if (!isNaN(single)) {
    return { hours: single, minutes: 0 };
  }

  return { hours: fallbackH, minutes: fallbackM };
}

/**
 * Accurately determines start and end Date objects for a shift,
 * taking into account custom sluitingstijden (Sluit = official closing + 30 min, Hulpsluit = 00:00)
 * and safely handling midnight rollover (+1 day).
 */
export function getShiftStartAndEndDates(
  shift: Shift,
  weekNumber: number
): { startDate: Date; endDate: Date } {
  const shiftBaseDate = getDateForDayAndWeek(shift.day, weekNumber);

  const startParts = parseTimeParts(shift.startTime || '16:00', 16, 0);
  const startDate = new Date(shiftBaseDate);
  startDate.setHours(startParts.hours, startParts.minutes, 0, 0);

  // Resolve end time string (handling 'Sluit', 'Hulpsluit', etc.)
  const timing = getShiftTimingDetails(shift);
  const endParts = parseTimeParts(timing.calculatedEndTimeStr || shift.endTime || '23:00', 23, 0);

  const endDate = new Date(shiftBaseDate);
  endDate.setHours(endParts.hours, endParts.minutes, 0, 0);

  // If end time is earlier or equal to start time in milliseconds, it crossed midnight (e.g. 16:00 -> 01:30)
  if (endDate.getTime() <= startDate.getTime()) {
    endDate.setDate(endDate.getDate() + 1);
  }

  return { startDate, endDate };
}

/**
 * Format a Date to UTC ISO string suitable for iCalendar (YYYYMMDDTHHmmssZ)
 */
export function formatIcsDateTimeUtc(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hh = pad(date.getUTCHours());
  const mm = pad(date.getUTCMinutes());
  const ss = pad(date.getUTCSeconds());
  return `${year}${month}${day}T${hh}${mm}${ss}Z`;
}

/**
 * Legacy backwards-compatible formatIcsDate helper with robust fallback
 */
export function formatIcsDate(date: Date, timeStr: string): string {
  const parts = parseTimeParts(timeStr, 12, 0);
  const d = new Date(date);
  d.setHours(parts.hours, parts.minutes, 0, 0);
  return formatIcsDateTimeUtc(d);
}

/**
 * Generate an .ics calendar file content for a given employee and their shifts in a week.
 * Compatible with Microsoft Outlook, Apple Calendar, and Google Calendar.
 * Includes native 1-hour alarm notification (-PT60M).
 */
export function generateIcsCalendarContent(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number
): string {
  const empShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'published');
  
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//In De Molen//Personeelsplanning//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Werkrooster In De Molen - ${employee.name}`
  ];

  const nowStamp = formatIcsDateTimeUtc(new Date());

  empShifts.forEach(shift => {
    const { startDate, endDate } = getShiftStartAndEndDates(shift, weekNumber);
    const startIso = formatIcsDateTimeUtc(startDate);
    const endIso = formatIcsDateTimeUtc(endDate);

    const timing = getShiftTimingDetails(shift);
    const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
    const summary = `Shift In De Molen (${dept}) - ${shift.startTime} tot ${shift.endTime}`;
    const timingNote = timing.badgeLabel ? ` [${timing.badgeLabel}]` : '';
    const description = `Werkdienst bij Eet-staminée In De Molen\\nAfdeling: ${dept}\\nUren: ${shift.startTime} - ${shift.endTime}${timingNote}\\nOpmerkingen: ${shift.notes || 'Geen'}\\nGelieve 10 minuten vooraf aanwezig te zijn.`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:shift-${shift.id}-w${weekNumber}@indemolen.be`,
      `DTSTAMP:${nowStamp}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'LOCATION:Eet-staminée In De Molen\\, Bierbeek',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT60M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Herinnering: Je werkdienst bij In De Molen begint over 1 uur!',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Trigger robust client-side download of .ics calendar file across all platforms:
 * 1. Standard direct Blob link download (without target="_blank" which breaks file saving in Chrome/Safari)
 * 2. Fallback: Server-side proxy endpoint (/api/calendar/download-ics)
 * 3. Data URI fallback
 */
export async function downloadIcsFile(filename: string, content: string): Promise<boolean> {
  const normalizedContent = content.replace(/\r?\n/g, '\r\n');
  const safeFilename = filename.endsWith('.ics') ? filename : `${filename}.ics`;

  // 1. Direct Blob download link (Primary & fastest method, standard for desktop & mobile browsers)
  try {
    const blob = new Blob([normalizedContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch (blobErr) {
    console.warn('Blob download link failed, falling back to server download:', blobErr);
  }

  // 2. Fallback: Server-side download endpoint (works in all iframes and mobile webviews)
  try {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/calendar/download-ics';
    form.style.display = 'none';

    const fnInput = document.createElement('input');
    fnInput.type = 'hidden';
    fnInput.name = 'filename';
    fnInput.value = safeFilename;
    form.appendChild(fnInput);

    const contentInput = document.createElement('input');
    contentInput.type = 'hidden';
    contentInput.name = 'content';
    contentInput.value = normalizedContent;
    form.appendChild(contentInput);

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      if (form.parentNode) document.body.removeChild(form);
    }, 1500);
    return true;
  } catch (formErr) {
    console.warn('Form POST download failed, trying data URI:', formErr);
  }

  // 3. Data URI fallback
  try {
    const dataUri = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(normalizedContent);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = safeFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) document.body.removeChild(link);
    }, 1000);
    return true;
  } catch (err) {
    console.error('All ICS download methods failed:', err);
    return false;
  }
}

/**
 * Generate direct Google Calendar link for adding a single shift (opens in browser)
 */
export function generateGoogleCalendarUrl(employee: Employee, shift: Shift, weekNumber: number): string {
  const { startDate, endDate } = getShiftStartAndEndDates(shift, weekNumber);
  const startIso = formatIcsDateTimeUtc(startDate);
  const endIso = formatIcsDateTimeUtc(endDate);

  const timing = getShiftTimingDetails(shift);
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
  const text = encodeURIComponent(`Werkdienst In De Molen (${dept}) ${shift.startTime}-${shift.endTime}`);
  const timingNote = timing.badgeLabel ? `\n• Details: ${timing.badgeLabel}` : '';
  const details = encodeURIComponent(
    `Beste ${employee.name},\n\n` +
    `Je bent ingepland voor een shift bij Eet-staminée In De Molen:\n` +
    `• Afdeling: ${dept}\n` +
    `• Uren: ${shift.startTime} tot ${shift.endTime}` +
    timingNote + '\n' +
    (shift.notes ? `• Opmerking: ${shift.notes}\n` : '') +
    `\nGelieve 10 minuten vooraf aanwezig te zijn.`
  );
  const location = encodeURIComponent('Eet-staminée In De Molen');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

export function openGoogleCalendarForShift(employee: Employee, shift: Shift, weekNumber: number): void {
  const url = generateGoogleCalendarUrl(employee, shift, weekNumber);
  window.open(url, '_blank');
}

/**
 * Generate direct Outlook Web Calendar link for adding a shift
 */
export function generateOutlookWebUrl(employee: Employee, shift: Shift, weekNumber: number): string {
  const { startDate, endDate } = getShiftStartAndEndDates(shift, weekNumber);
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const formatIsoNoZ = (d: Date) => 
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;

  const startDt = formatIsoNoZ(startDate);
  const endDt = formatIsoNoZ(endDate);

  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
  const subject = encodeURIComponent(`Werkdienst In De Molen (${dept})`);
  const body = encodeURIComponent(`Beste ${employee.name},\nJe bent ingepland voor de dienst ${shift.startTime} - ${shift.endTime} (${dept}) bij Eet-staminée In De Molen.\n${shift.notes ? 'Opmerking: ' + shift.notes : ''}\n\nMet vriendelijke groeten,\nHans`);
  const location = encodeURIComponent('Eet-staminée In De Molen');

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&location=${location}&startdt=${startDt}&enddt=${endDt}`;
}

export const PUBLIC_APP_URL = 'https://ais-pre-m2somphks3peywsj3udb6b-287536891405.europe-west3.run.app';

export function getShareableAppUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('ais-dev')) {
      return PUBLIC_APP_URL;
    }
    return window.location.origin;
  }
  return PUBLIC_APP_URL;
}

/**
 * Robustly normalizes Belgian and international phone numbers for WhatsApp
 */
export function cleanBelgianPhoneNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9+]/g, '');
  if (clean.startsWith('+')) clean = clean.substring(1);
  if (clean.startsWith('0032')) clean = '32' + clean.substring(4);
  else if (clean.startsWith('00')) clean = clean.substring(2);
  else if (clean.startsWith('0')) clean = '32' + clean.substring(1);
  else if (clean.length === 9 && clean.startsWith('4')) clean = '32' + clean;
  return clean;
}

/**
 * Generate personal WhatsApp message text with direct clickable link
 * Dagen staan altijd chronologisch in volgorde (Maandag t/m Zondag).
 * Ondertekend met Hans.
 */
export function generateWhatsAppMessageText(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number,
  appUrl?: string
): string {
  // Sorteer shiften altijd chronologisch op dag (0=Maandag -> 6=Zondag) en vervolgens op starttijd
  const empShifts = shifts
    .filter(s => s.employeeId === employee.id && s.status === 'published')
    .sort((a, b) => {
      const dayA = Number(a.day);
      const dayB = Number(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return parseStartTimeToMinutes(a.startTime) - parseStartTimeToMinutes(b.startTime);
    });
  const dept = employee.department === 'keuken' ? 'Keuken' : 'Zaal';
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const meta = getWeekMeta(weekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';

  let message = `*Hallo ${employee.name}!*\n\n`;
  message += `Hier is jouw werkrooster voor *Week ${weekNumber}*${dateRangeStr} (${dept}):\n\n`;

  if (empShifts.length === 0) {
    message += `_Je hebt deze week geen geplande diensten._\n\n`;
  } else {
    // Dagen altijd in chronologische volgorde: Maandag t/m Zondag
    empShifts.forEach(s => {
      const dayIdx = Number(s.day);
      const dayName = DAYS_OF_WEEK[dayIdx] || `Dag ${dayIdx + 1}`;
      const dateInfo = getDayDateInfo(weekNumber, dayIdx);
      const shiftDept = (s.department || employee.department) === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
      message += `• *${dayName} ${dateInfo.shortDate}*: ${s.startTime} - ${s.endTime} (${shiftDept})${s.notes ? ` _[${s.notes}]_` : ''}\n`;
    });
    message += `\n*Totaal:* ${empShifts.length} dienst(en)\n\n`;
  }

  message += `Gelieve je shifts te bekijken en te bevestigen in het personeelsportaal.\n\n`;
  message += `📱 *Klik hier om de app te openen en te bevestigen:*\n`;
  message += `${effectiveAppUrl}\n\n`;
  message += `Veel succes en tot snel!\nGroeten,\nHans`;

  return message;
}

/**
 * Generate personal WhatsApp notification link
 */
export function generateWhatsAppUrl(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number,
  appUrl?: string
): string {
  const intlPhone = cleanBelgianPhoneNumber(employee.phone || '');
  const message = generateWhatsAppMessageText(employee, shifts, weekNumber, appUrl);

  if (intlPhone && intlPhone.length >= 8) {
    return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(message)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a complete team schedule message for WhatsApp Group (Zaal or Keuken)
 * Dagen staan altijd chronologisch in volgorde (Maandag t/m Zondag).
 * Ondertekend met Hans.
 */
export function generateTeamWhatsAppSummary(
  employees: Employee[],
  shifts: Shift[],
  weekNumber: number,
  department: Department | 'alles',
  appUrl?: string
): string {
  const deptTitle = department === 'keuken' ? '🍳 KEUKEN' : department === 'zaal' ? '🍽️ ZAAL' : '🍻 TEAM';
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const meta = getWeekMeta(weekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';
  
  let message = `📋 *PLANNING WEEK ${weekNumber}${dateRangeStr} — ${deptTitle}*\n`;
  message += `══════════════════════════\n\n`;

  const filteredShifts = shifts.filter(s => {
    if (s.status !== 'published') return false;
    const emp = employees.find(e => e.id === s.employeeId);
    const shiftDept = s.department || emp?.department || 'zaal';
    if (department === 'alles') return true;
    return shiftDept === department;
  });

  // Dagen ALTIJD chronologisch in volgorde (Maandag t/m Zondag)
  DAYS_OF_WEEK.forEach((dayName, dayIndex) => {
    const dayShifts = filteredShifts
      .filter(s => Number(s.day) === dayIndex)
      .sort((a, b) => parseStartTimeToMinutes(a.startTime) - parseStartTimeToMinutes(b.startTime));
    const dateInfo = getDayDateInfo(weekNumber, dayIndex);
    message += `📅 *${dayName.toUpperCase()} (${dateInfo.shortDate})*\n`;
    if (dayShifts.length === 0) {
      message += `  _Geen diensten gepland_\n\n`;
    } else {
      dayShifts.forEach(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        const name = emp ? emp.name : 'Medewerker';
        const roleBadge = emp?.experience === 'Verantwoordelijke' ? ' ⭐' : '';
        const deptTag = (s.department || emp?.department) === 'keuken' ? 'Keuken' : 'Zaal';
        message += `  • ${name}${roleBadge}: ${s.startTime} - ${s.endTime} (${deptTag})${s.notes ? ` [${s.notes}]` : ''}\n`;
      });
      message += `\n`;
    }
  });

  message += `══════════════════════════\n`;
  message += `⚠️ Gelieve je diensten z.s.m. te bekijken en te bevestigen:\n`;
  message += `🔗 ${effectiveAppUrl}\n\n`;
  message += `Groeten,\nHans`;

  return message;
}

/**
 * Generate mailto link for sending email schedule
 * Dagen staan altijd chronologisch in volgorde (Maandag t/m Zondag).
 * Ondertekend met Hans.
 */
export function generateMailtoUrl(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number,
  appUrl?: string
): string {
  // Sorteer shiften chronologisch op dag (0=Maandag -> 6=Zondag) en starttijd
  const empShifts = shifts
    .filter(s => s.employeeId === employee.id && s.status === 'published')
    .sort((a, b) => {
      const dayA = Number(a.day);
      const dayB = Number(b.day);
      if (dayA !== dayB) return dayA - dayB;
      return parseStartTimeToMinutes(a.startTime) - parseStartTimeToMinutes(b.startTime);
    });
  const meta = getWeekMeta(weekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';
  const subject = encodeURIComponent(`Werkrooster Week ${weekNumber} — In De Molen`);
  const dept = employee.department === 'keuken' ? 'Keuken' : 'Zaal';

  let body = `Beste ${employee.name},\n\n`;
  body += `Hierbij ontvang je jouw werkplanning voor Week ${weekNumber}${dateRangeStr} (Afdeling: ${dept}):\n\n`;

  if (empShifts.length === 0) {
    body += `Je hebt deze week geen ingeplande diensten.\n\n`;
  } else {
    empShifts.forEach(s => {
      const dayIdx = Number(s.day);
      const dayName = DAYS_OF_WEEK[dayIdx] || `Dag ${dayIdx + 1}`;
      const shiftDept = (s.department || employee.department) === 'keuken' ? 'Keuken' : 'Zaal';
      body += `• ${dayName}: ${s.startTime} - ${s.endTime} (${shiftDept})${s.notes ? ' [' + s.notes + ']' : ''}\n`;
    });
    body += `\nTotaal: ${empShifts.length} dienst(en)\n\n`;
  }

  body += `Gelieve je diensten tijdig te bevestigen via het personeelsportaal.\n`;
  if (appUrl) {
    body += `Portaal URL: ${appUrl}\n\n`;
  }
  body += `Met vriendelijke groeten,\nHans`;

  return `mailto:${employee.email || ''}?subject=${subject}&body=${encodeURIComponent(body)}`;
}

/**
 * Convenient 1-click triggers for exporting to Apple Calendar, Google Calendar, Outlook or universal .ics
 */
export function exportEmployeeToAppleCalendar(employee: Employee, shifts: Shift[], weekNumber: number) {
  const content = generateIcsCalendarContent(employee, shifts, weekNumber);
  downloadIcsFile(`InDeMolen_Apple_Agenda_Week${weekNumber}_${employee.name.replace(/\s+/g, '_')}.ics`, content);
}

export function exportEmployeeToGoogleCalendarICS(employee: Employee, shifts: Shift[], weekNumber: number) {
  const content = generateIcsCalendarContent(employee, shifts, weekNumber);
  downloadIcsFile(`InDeMolen_Google_Agenda_Week${weekNumber}_${employee.name.replace(/\s+/g, '_')}.ics`, content);
}

export function exportEmployeeToOutlook(employee: Employee, shifts: Shift[], weekNumber: number) {
  const content = generateIcsCalendarContent(employee, shifts, weekNumber);
  downloadIcsFile(`InDeMolen_Outlook_Week${weekNumber}_${employee.name.replace(/\s+/g, '_')}.ics`, content);
}

export function exportEmployeeToICS(employee: Employee, shifts: Shift[], weekNumber: number) {
  const content = generateIcsCalendarContent(employee, shifts, weekNumber);
  downloadIcsFile(`werkrooster-week${weekNumber}-${employee.name.replace(/\s+/g, '_')}.ics`, content);
}

/**
 * Convenient 1-click trigger to open WhatsApp Web / Mobile app with schedule
 */
export function openWhatsAppForEmployee(employee: Employee, shifts: Shift[], weekNumber: number, appUrl?: string) {
  const url = generateWhatsAppUrl(employee, shifts, weekNumber, appUrl);
  window.open(url, '_blank');
}

/**
 * Convenient 1-click trigger to open default mail client with schedule
 */
export function openEmailForEmployee(employee: Employee, shifts: Shift[], weekNumber: number, appUrl?: string) {
  const url = generateMailtoUrl(employee, shifts, weekNumber, appUrl);
  window.location.href = url;
}

export function formatPhoneForCall(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '');
}

export function formatPhoneForWhatsApp(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }
  if (cleaned.startsWith('0')) {
    cleaned = '32' + cleaned.slice(1);
  }
  return cleaned;
}


