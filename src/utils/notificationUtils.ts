import { Employee, Shift, Department } from '../types';
import { getDateOfISOWeek, CURRENT_WEEK_INFO } from './weekUtils';

const DAYS_OF_WEEK = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];

// Helper to calculate date of a day in a given week dynamically
export function getDateForDayAndWeek(dayIndex: number, weekNumber: number, year: number = CURRENT_WEEK_INFO.year): Date {
  const mon = getDateOfISOWeek(weekNumber, year);
  const targetDate = new Date(mon.getTime() + dayIndex * 86400000);
  return targetDate;
}

export function formatIcsDate(date: Date, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hh}${mm}${ss}Z`;
}

/**
 * Generate an .ics calendar file content for a given employee and their shifts in a week.
 * Compatible with Microsoft Outlook, Apple Calendar, and Google Calendar.
 */
export function generateIcsCalendarContent(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number
): string {
  const empShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'published');
  
  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//In De Molen//Personeelsplanning//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Werkrooster In De Molen - ${employee.name}`
  ];

  empShifts.forEach(shift => {
    const shiftDate = getDateForDayAndWeek(shift.day, weekNumber);
    const startIso = formatIcsDate(shiftDate, shift.startTime);
    const endIso = formatIcsDate(shiftDate, shift.endTime);
    const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
    const summary = `Shift In De Molen (${dept}) - ${shift.startTime} tot ${shift.endTime}`;
    const description = `Werkdienst bij Eet-staminée In De Molen\\nAfdeling: ${dept}\\nUren: ${shift.startTime} - ${shift.endTime}\\nOpmerkingen: ${shift.notes || 'Geen'}\\nGelieve tijdig aanwezig te zijn.`;

    ics.push(
      'BEGIN:VEVENT',
      `UID:shift-${shift.id}-w${weekNumber}@indemolen.be`,
      `DTSTAMP:${formatIcsDate(new Date(), '12:00')}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'LOCATION:Eet-staminée In De Molen',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT60M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Herinnering werkdienst In De Molen over 1 uur',
      'END:VALARM',
      'END:VEVENT'
    );
  });

  ics.push('END:VCALENDAR');
  return ics.join('\r\n');
}

/**
 * Trigger client-side download of .ics calendar file
 */
export function downloadIcsFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate direct Google Calendar link for adding a single shift (opens in browser)
 */
export function generateGoogleCalendarUrl(employee: Employee, shift: Shift, weekNumber: number): string {
  const shiftDate = getDateForDayAndWeek(shift.day, weekNumber);
  const startIso = formatIcsDate(shiftDate, shift.startTime);
  const endIso = formatIcsDate(shiftDate, shift.endTime);
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
  const text = encodeURIComponent(`Werkdienst In De Molen (${dept}) ${shift.startTime}-${shift.endTime}`);
  const details = encodeURIComponent(
    `Beste ${employee.name},\n\n` +
    `Je bent ingepland voor een shift bij Eet-staminée In De Molen:\n` +
    `• Afdeling: ${dept}\n` +
    `• Uren: ${shift.startTime} tot ${shift.endTime}\n` +
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
  const shiftDate = getDateForDayAndWeek(shift.day, weekNumber);
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const dateStr = `${shiftDate.getFullYear()}-${pad(shiftDate.getMonth() + 1)}-${pad(shiftDate.getDate())}`;
  const startDt = `${dateStr}T${shift.startTime}:00`;
  const endDt = `${dateStr}T${shift.endTime}:00`;
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
  const subject = encodeURIComponent(`Werkdienst In De Molen (${dept})`);
  const body = encodeURIComponent(`Beste ${employee.name},\nJe bent ingepland voor de dienst ${shift.startTime} - ${shift.endTime} (${dept}) bij Eet-staminée In De Molen.\n${shift.notes ? 'Opmerking: ' + shift.notes : ''}`);
  const location = encodeURIComponent('Eet-staminée In De Molen');

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${subject}&body=${body}&location=${location}&startdt=${startDt}&enddt=${endDt}`;
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
  const empShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'published');
  const cleanPhone = (employee.phone || '').replace(/[^0-9]/g, '');
  // Default to Belgian country code 32 if starts with 0
  let intlPhone = cleanPhone;
  if (intlPhone.startsWith('0')) {
    intlPhone = '32' + intlPhone.substring(1);
  }

  const dept = employee.department === 'keuken' ? 'Keuken' : 'Zaal';

  let message = `*Hallo ${employee.name}!*\n\n`;
  message += `Hier is jouw werkrooster voor *Week ${weekNumber}* bij *Eet-staminée In De Molen* (${dept}):\n\n`;

  if (empShifts.length === 0) {
    message += `_Je hebt deze week geen geplande diensten._\n\n`;
  } else {
    empShifts.forEach(s => {
      const dayName = DAYS_OF_WEEK[s.day];
      const shiftDept = (s.department || employee.department) === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
      message += `• *${dayName}*: ${s.startTime} - ${s.endTime} (${shiftDept})${s.notes ? ` _[${s.notes}]_` : ''}\n`;
    });
    message += `\n*Totaal:* ${empShifts.length} dienst(en)\n\n`;
  }

  message += `Gelieve je shifts te bekijken en te bevestigen via het personeelsportaal.\n`;
  if (appUrl) {
    message += `Link naar portaal: ${appUrl}\n\n`;
  }
  message += `Veel succes en tot snel!\n_Hans Stevens (Beheerder In De Molen)_`;

  return `https://wa.me/${intlPhone ? intlPhone : ''}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate a complete team schedule message for WhatsApp Group (Zaal or Keuken)
 */
export function generateTeamWhatsAppSummary(
  employees: Employee[],
  shifts: Shift[],
  weekNumber: number,
  department: Department | 'alles'
): string {
  const deptTitle = department === 'keuken' ? '🍳 KEUKEN' : department === 'zaal' ? '🍽️ ZAAL' : '🍻 TEAM IN DE MOLEN';
  
  let message = `📋 *PLANNING WEEK ${weekNumber} — ${deptTitle}*\n`;
  message += `Eet-staminée In De Molen\n`;
  message += `══════════════════════════\n\n`;

  const filteredShifts = shifts.filter(s => {
    if (s.status !== 'published') return false;
    const emp = employees.find(e => e.id === s.employeeId);
    const shiftDept = s.department || emp?.department || 'zaal';
    if (department === 'alles') return true;
    return shiftDept === department;
  });

  DAYS_OF_WEEK.forEach((dayName, dayIndex) => {
    const dayShifts = filteredShifts.filter(s => s.day === dayIndex);
    message += `📅 *${dayName.toUpperCase()}*\n`;
    if (dayShifts.length === 0) {
      message += `  _Geen diensten gepland_\n\n`;
    } else {
      dayShifts.forEach(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        const name = emp ? emp.name : 'Medewerker';
        const roleBadge = emp?.experience === 'Verantwoordelijke' ? ' ⭐' : '';
        message += `  • ${name}${roleBadge}: ${s.startTime} - ${s.endTime}${s.notes ? ` (${s.notes})` : ''}\n`;
      });
      message += `\n`;
    }
  });

  message += `══════════════════════════\n`;
  message += `⚠️ Gelieve je diensten z.s.m. te bevestigen in het personeelsportaal.\n`;
  message += `Groeten, Hans`;

  return message;
}

/**
 * Generate mailto link for sending email schedule
 */
export function generateMailtoUrl(
  employee: Employee,
  shifts: Shift[],
  weekNumber: number,
  appUrl?: string
): string {
  const empShifts = shifts.filter(s => s.employeeId === employee.id && s.status === 'published');
  const subject = encodeURIComponent(`Werkrooster Week ${weekNumber} — In De Molen`);
  const dept = employee.department === 'keuken' ? 'Keuken' : 'Zaal';

  let body = `Beste ${employee.name},\n\n`;
  body += `Hierbij ontvang je jouw werkplanning voor Week ${weekNumber} bij Eet-staminée In De Molen (Afdeling: ${dept}):\n\n`;

  if (empShifts.length === 0) {
    body += `Je hebt deze week geen ingeplande diensten.\n\n`;
  } else {
    empShifts.forEach(s => {
      const dayName = DAYS_OF_WEEK[s.day];
      const shiftDept = (s.department || employee.department) === 'keuken' ? 'Keuken' : 'Zaal';
      body += `• ${dayName}: ${s.startTime} - ${s.endTime} (${shiftDept})${s.notes ? ' [' + s.notes + ']' : ''}\n`;
    });
    body += `\nTotaal: ${empShifts.length} dienst(en)\n\n`;
  }

  body += `Gelieve je diensten tijdig te bevestigen via het personeelsportaal.\n`;
  if (appUrl) {
    body += `Portaal URL: ${appUrl}\n\n`;
  }
  body += `Met vriendelijke groeten,\nHans Stevens\nBeheerder Eet-staminée In De Molen`;

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


