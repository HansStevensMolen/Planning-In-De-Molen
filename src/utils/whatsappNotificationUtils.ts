import { Notice, Shift, Employee, Department } from '../types';
import { getShareableAppUrl } from './notificationUtils';
import { getWeekMeta, getDayDateInfo } from './weekUtils';

const SETTINGS_KEY_GROUP_LINK = 'in_de_molen_whatsapp_group_link';
const SETTINGS_KEY_MESSENGER_LINK = 'in_de_molen_messenger_link';
const SETTINGS_KEY_AUTO_PROMPT = 'in_de_molen_whatsapp_auto_prompt';

export function getStoredWhatsAppGroupLink(): string {
  try {
    return localStorage.getItem(SETTINGS_KEY_GROUP_LINK) || '';
  } catch {
    return '';
  }
}

export function setStoredWhatsAppGroupLink(link: string): void {
  try {
    localStorage.setItem(SETTINGS_KEY_GROUP_LINK, link.trim());
  } catch (e) {
    console.warn('Could not store whatsapp group link', e);
  }
}

export function getStoredMessengerLink(): string {
  try {
    return localStorage.getItem(SETTINGS_KEY_MESSENGER_LINK) || '';
  } catch {
    return '';
  }
}

export function setStoredMessengerLink(link: string): void {
  try {
    localStorage.setItem(SETTINGS_KEY_MESSENGER_LINK, link.trim());
  } catch (e) {
    console.warn('Could not store messenger link', e);
  }
}

/**
 * Builds a direct Facebook Messenger link (to a group, user or web chat)
 */
export function buildMessengerUrl(customLinkOrUsername?: string): string {
  if (customLinkOrUsername && customLinkOrUsername.trim()) {
    const raw = customLinkOrUsername.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    // Clean username from facebook.com/username
    const cleaned = raw.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '').replace(/\/$/, '');
    return `https://m.me/${cleaned}`;
  }
  
  const stored = getStoredMessengerLink();
  if (stored) {
    return stored;
  }
  
  return 'https://www.messenger.com/';
}

export function isAutoWhatsAppPromptEnabled(): boolean {
  try {
    const val = localStorage.getItem(SETTINGS_KEY_AUTO_PROMPT);
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setAutoWhatsAppPromptEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SETTINGS_KEY_AUTO_PROMPT, enabled ? 'true' : 'false');
  } catch (e) {
    console.warn('Could not store whatsapp auto prompt setting', e);
  }
}

/**
 * Generate standard WhatsApp web / mobile send URL with prefilled text
 */
export function buildWhatsAppWebShareUrl(text: string, targetPhone?: string): string {
  const cleanPhone = targetPhone ? targetPhone.replace(/[^0-9]/g, '') : '';
  const textEncoded = encodeURIComponent(text);
  
  if (cleanPhone && cleanPhone.length >= 8) {
    let intlPhone = cleanPhone;
    if (intlPhone.startsWith('0')) {
      intlPhone = '32' + intlPhone.slice(1);
    }
    return `https://api.whatsapp.com/send?phone=${intlPhone}&text=${textEncoded}`;
  }
  
  return `https://api.whatsapp.com/send?text=${textEncoded}`;
}

/**
 * Generates WhatsApp message for a schedule update or publish event
 */
export function generateScheduleUpdateWhatsAppText(params: {
  weekNumber: number;
  shiftsCount?: number;
  appUrl?: string;
  notes?: string;
}): string {
  const { weekNumber, shiftsCount, appUrl, notes } = params;
  const meta = getWeekMeta(weekNumber);
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const dateRangeStr = meta?.dateRange ? ` (${meta.dateRange})` : '';

  let msg = `📋 *ROOSTER UPDATE — WEEK ${weekNumber}*\n`;
  msg += `*Eet-staminée In De Molen*\n`;
  msg += `══════════════════════════\n\n`;
  msg += `Hallo team! 👋\n\n`;
  msg += `Het werkrooster voor *Week ${weekNumber}*${dateRangeStr} is zojuist bijgewerkt en officieel geplaatst in het personeelsportaal.\n\n`;

  if (shiftsCount && shiftsCount > 0) {
    msg += `📊 *Aantal ingeplande diensten:* ${shiftsCount}\n`;
  }
  if (notes) {
    msg += `ℹ️ *Toelichting:* ${notes}\n`;
  }

  msg += `\n📱 *Bekijk direct jouw uren & bevestig je diensten:*\n`;
  msg += `👉 ${effectiveAppUrl}\n\n`;
  msg += `⚠️ _Gelieve je diensten z.s.m. te bekijken en in de app aan te duiden als gezien._\n`;
  msg += `Heb je vragen of wens je onderling te ruilen? Gebruik de ruilfunctie in het portaal!\n\n`;
  msg += `Tot snel op de vloer! 🍻\n_Beheerder Hans Stevens_`;

  return msg;
}

/**
 * Generates WhatsApp message for 6-weeks schedule update
 */
export function generateSixWeeksUpdateWhatsAppText(targetWeeks: number[], appUrl?: string): string {
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const firstWeek = targetWeeks[0];
  const lastWeek = targetWeeks[targetWeeks.length - 1];

  let msg = `📅 *6 WEKEN PLANNING GEPUBLICEERD!*\n`;
  msg += `*Eet-staminée In De Molen*\n`;
  msg += `══════════════════════════\n\n`;
  msg += `Hallo iedereen! 👋\n\n`;
  msg += `De planning voor de komende 6 weken (*Week ${firstWeek} t/m Week ${lastWeek}*) staat officieel live in ons personeelsportaal!\n\n`;
  msg += `📱 *Open de app om je shifts te bekijken:*\n`;
  msg += `👉 ${effectiveAppUrl}\n\n`;
  msg += `💡 *Tip:* Je kunt je diensten met 1 klik synchroniseren naar je Google, Apple of Outlook agenda.\n\n`;
  msg += `Groeten,\n_Hans Stevens (Beheerder)_`;

  return msg;
}

/**
 * Generates WhatsApp message for a bulletin notice (mededeling)
 */
export function generateNoticeWhatsAppText(notice: Notice, appUrl?: string): string {
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const categoryEmoji = 
    notice.category === 'belangrijk' ? '🚨' :
    notice.category === 'planning' ? '📅' :
    notice.category === 'wijziging' ? '🔄' : '📢';

  let msg = `${categoryEmoji} *NIEUW BERICHT: ${notice.title.toUpperCase()}*\n`;
  msg += `*Eet-staminée In De Molen*\n`;
  msg += `══════════════════════════\n\n`;
  msg += `${notice.content}\n\n`;
  msg += `──────────────────────────\n`;
  msg += `👤 *Geplaatst door:* ${notice.author}\n`;
  msg += `📅 *Datum:* ${notice.date}\n\n`;
  msg += `📱 *Reageer & lees meer in het personeelsportaal:*\n`;
  msg += `👉 ${effectiveAppUrl}\n\n`;
  msg += `_Eet-staminée In De Molen_`;

  return msg;
}

/**
 * Generates WhatsApp message for an individual shift modification
 */
export function generateShiftModificationWhatsAppText(params: {
  employeeName: string;
  dayName: string;
  dateStr: string;
  startTime: string;
  endTime: string;
  department: string;
  weekNumber: number;
  changeType: 'aangepast' | 'toegevoegd' | 'verwijderd';
  appUrl?: string;
}): string {
  const { employeeName, dayName, dateStr, startTime, endTime, department, weekNumber, changeType, appUrl } = params;
  const effectiveAppUrl = appUrl || getShareableAppUrl();
  const icon = changeType === 'verwijderd' ? '❌' : changeType === 'toegevoegd' ? '➕' : '🔄';

  let msg = `${icon} *ROOSTER ${changeType.toUpperCase()}: WEEK ${weekNumber}*\n`;
  msg += `*Eet-staminée In De Molen*\n`;
  msg += `══════════════════════════\n\n`;
  msg += `Beste ${employeeName},\n\n`;
  
  if (changeType === 'verwijderd') {
    msg += `Je geplande dienst op *${dayName} ${dateStr}* (${startTime} - ${endTime}) is *geannuleerd* door de beheerder.\n\n`;
  } else {
    msg += `Er is een dienst ${changeType} in je rooster voor *Week ${weekNumber}*:\n`;
    msg += `• *Dag:* ${dayName} ${dateStr}\n`;
    msg += `• *Uren:* ${startTime} tot ${endTime}\n`;
    msg += `• *Afdeling:* ${department}\n\n`;
  }

  msg += `📱 *Controleer je actuele rooster in het portaal:*\n`;
  msg += `👉 ${effectiveAppUrl}\n\n`;
  msg += `Met vriendelijke groeten,\n_Hans Stevens (Beheerder)_`;

  return msg;
}
