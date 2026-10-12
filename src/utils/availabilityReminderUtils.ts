import { Employee, EmployeeAvailability, Notice, AppSettings } from '../types';
import { CURRENT_WEEK_NUMBER, getWeekMeta, getEffectiveEmployeeAvailability, getDateOfISOWeek } from './weekUtils';
import { cleanBelgianPhoneNumber } from './notificationUtils';
import { safeStorage } from './safeStorage';

/**
 * Result of checking which employees need an availability reminder.
 */
export interface AvailabilityReminderCheckResult {
  targetWeekNumber: number;
  targetWeekMeta: ReturnType<typeof getWeekMeta>;
  isReminderDay: boolean; // Is it Wednesday (or configured reminder day)?
  reminderDayName: string;
  missingEmployees: Employee[];
  submittedEmployees: Employee[];
  alreadyRunToday: boolean;
  lastRunDate?: string;
  formattedToday: string;
}

const DAY_NAMES_NL = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];

/**
 * Calculates which week is being planned 2 weeks ahead,
 * and checks which employees haven't filled in their availability yet.
 *
 * Rules:
 * - Planning is prepared 2 weeks ahead (e.g. current week + 2 weeks)
 * - Prepared on Wednesday (day 3)
 * - Excludes Manager (emp1 / open_shift)
 * - Identifies non-vast employees (Flexi, Student, Extra) who haven't explicitly submitted
 *   and don't have recurring availability, or any staff member lacking submission.
 */
export function checkUpcomingAvailabilityReminders(
  employees: Employee[],
  availabilities: EmployeeAvailability[],
  appSettings?: AppSettings,
  currentDate: Date = new Date()
): AvailabilityReminderCheckResult {
  const weeksAhead = appSettings?.reminderWeeksAhead ?? 2;
  const targetWeekNumber = CURRENT_WEEK_NUMBER + weeksAhead;
  const targetWeekMeta = getWeekMeta(targetWeekNumber);

  // Configured reminder day (0=zo, 1=ma, 2=di, 3=woensdag; default 3 = woensdag)
  const configuredDay = appSettings?.reminderDayOfWeek ?? 3;
  const currentDayOfWeek = currentDate.getDay(); // 0-6
  const isReminderDay = currentDayOfWeek === configuredDay;
  const reminderDayName = DAY_NAMES_NL[configuredDay] || 'Woensdag';

  const todayStr = currentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const alreadyRunToday = appSettings?.lastAutoReminderRunDate === todayStr;

  // Filter team members (exclude manager and open_shift)
  const teamEmployees = employees.filter(e => e.active && e.id !== 'emp1' && e.id !== 'open_shift');

  const missingEmployees: Employee[] = [];
  const submittedEmployees: Employee[] = [];

  teamEmployees.forEach(emp => {
    // Check if employee has submitted for target week
    const eff = getEffectiveEmployeeAvailability(emp, targetWeekNumber, availabilities);
    const hasSubmitted = eff.availability !== null && eff.availability.days && eff.availability.days.length > 0;

    if (hasSubmitted) {
      submittedEmployees.push(emp);
    } else {
      missingEmployees.push(emp);
    }
  });

  return {
    targetWeekNumber,
    targetWeekMeta,
    isReminderDay,
    reminderDayName,
    missingEmployees,
    submittedEmployees,
    alreadyRunToday,
    lastRunDate: appSettings?.lastAutoReminderRunDate,
    formattedToday: todayStr
  };
}

/**
 * Generates an automated notice object to notify an individual staff member or the team
 * about missing availability for the upcoming planning week.
 */
export function createAvailabilityReminderNotice(
  targetEmployee: Employee,
  targetWeekNumber: number,
  authorName: string = 'Hans Stevens'
): Omit<Notice, 'id' | 'date'> {
  const meta = getWeekMeta(targetWeekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';

  return {
    title: `⏰ Herinnering: Geef je beschikbaarheid door voor Week ${targetWeekNumber}`,
    content: `Beste ${targetEmployee.name}, vandaag wordt de planning voor Week ${targetWeekNumber}${dateRangeStr} opgesteld. Je hebt je beschikbaarheid voor deze week nog niet doorgegeven. Gelieve dit zo snel mogelijk in te vullen via het personeelsportaal (tabblad 'Beschikbaarheden') zodat we rekening kunnen houden met jouw voorkeuren. Alvast bedankt! - ${authorName}`,
    category: 'belangrijk',
    author: authorName,
    targetEmployeeId: targetEmployee.id
  };
}

/**
 * Generates an automated group broadcast notice when the manager prepares the schedule on Wednesday.
 */
export function createGroupAvailabilityReminderNotice(
  missingCount: number,
  targetWeekNumber: number,
  authorName: string = 'Hans Stevens'
): Omit<Notice, 'id' | 'date'> {
  const meta = getWeekMeta(targetWeekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';

  return {
    title: `📅 Oproep Beschikbaarheden: Planning Week ${targetWeekNumber} wordt vandaag opgesteld!`,
    content: `Beste team, vandaag (woensdag) stellen we de nieuwe weekplanning op voor Week ${targetWeekNumber}${dateRangeStr}. Er zijn momenteel nog ${missingCount} collega's van wie we nog geen beschikbaarheid hebben ontvangen. Heb je jouw vrije dagen en uren nog niet ingevuld? Doe dit dan vandaag nog in het personeelsportaal zodat jouw planning optimaal kan worden meegenomen! Groeten, ${authorName}`,
    category: 'planning',
    author: authorName
  };
}

/**
 * Generates personal WhatsApp message text for missing availability reminder.
 */
export function generateAvailabilityReminderWhatsAppText(
  employee: Employee,
  targetWeekNumber: number,
  appUrl: string = 'https://ais-pre-m2somphks3peywsj3udb6b-287536891405.europe-west3.run.app'
): string {
  const meta = getWeekMeta(targetWeekNumber);
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';

  let message = `*Hallo ${employee.name}!* 👋\n\n`;
  message += `Vandaag wordt de planning opgesteld voor *Week ${targetWeekNumber}*${dateRangeStr}.\n\n`;
  message += `We hebben jouw beschikbaarheid voor deze week nog niet ontvangen. Gelieve dit zo snel mogelijk door te geven zodat we je correct kunnen inplannen!\n\n`;
  message += `📱 *Klik hier om direct je beschikbaarheid door te geven:*\n`;
  message += `${appUrl}\n\n`;
  message += `Alvast bedankt en tot snel!\nGroeten,\nHans`;

  return message;
}

/**
 * Generates a WhatsApp direct link for sending the reminder to the employee.
 */
export function generateAvailabilityReminderWhatsAppUrl(
  employee: Employee,
  targetWeekNumber: number,
  appUrl?: string
): string {
  const intlPhone = cleanBelgianPhoneNumber(employee.phone || '');
  const text = generateAvailabilityReminderWhatsAppText(employee, targetWeekNumber, appUrl);

  if (intlPhone && intlPhone.length >= 8) {
    return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
