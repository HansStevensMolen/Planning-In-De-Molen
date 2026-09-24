import { Shift, Employee } from '../types';
import { Shift24HourAlert } from '../components/StaffPortal';

export type PushNotificationStatus = 'default' | 'granted' | 'denied' | 'unsupported';

/**
 * Checks if browser Web Notifications are supported.
 */
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Gets the current notification permission status.
 */
export function getPushNotificationPermission(): PushNotificationStatus {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission as PushNotificationStatus;
}

/**
 * Requests browser push notification permission from the user.
 */
export async function requestPushNotificationPermission(): Promise<PushNotificationStatus> {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result as PushNotificationStatus;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Plays a friendly synthesised audio chime using Web Audio API.
 * Guaranteed zero external files or assets.
 */
export function playAlertChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (E5 ~ 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (A5 ~ 880 Hz, slightly higher and bright)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0.22, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.55);
  } catch {
    // Audio might be blocked until user gesture, safely ignore
  }
}

/**
 * Checks if a specific shift notification has already been triggered in this browser session.
 */
export function hasShiftNotificationBeenSent(shiftId: string): boolean {
  try {
    return sessionStorage.getItem(`shift_notif_sent_${shiftId}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks a shift notification as sent in sessionStorage.
 */
export function markShiftNotificationAsSent(shiftId: string): void {
  try {
    sessionStorage.setItem(`shift_notif_sent_${shiftId}`, 'true');
  } catch {}
}

/**
 * Dispatches a native browser Push Notification for an unconfirmed shift within 24h.
 */
export function sendShiftReminderNotification(
  employee: Employee,
  shiftAlert: Shift24HourAlert
): boolean {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const shift = shiftAlert.shift;
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal';

  try {
    const notification = new Notification('🚨 Dienst Herinnering: Nog niet bevestigd!', {
      body: `Beste ${employee.name}, je dienst op ${shiftAlert.dayLabel} (${shift.startTime} - ${shift.endTime}, ${dept}) staat nog NIET op 'Gezien'. Bevestig direct!`,
      icon: '/favicon.ico',
      tag: `unconfirmed-shift-${shift.id}`,
      requireInteraction: true
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    markShiftNotificationAsSent(shift.id);
    return true;
  } catch (err) {
    console.error('Failed to trigger browser notification:', err);
    return false;
  }
}

/**
 * Generates the text for an automated reminder message to show in the portal or share.
 */
export function generateAutomatedReminderText(
  employee: Employee,
  shiftsAlerts: Shift24HourAlert[]
): string {
  const count = shiftsAlerts.length;
  const shiftLines = shiftsAlerts.map(sa => {
    const dept = (sa.shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
    return `• ${sa.dayLabel} (${sa.formattedDate}): ${sa.shift.startTime} - ${sa.shift.endTime} (${dept}) — ${sa.timeRemainingText}`;
  }).join('\n');

  return `Beste ${employee.name},\n\nDit is een automatische herinnering van Café In De Molen:\nJe hebt ${count === 1 ? 'een dienst' : `${count} diensten`} binnen 24 uur die nog niet gemarkeerd zijn als 'Gezien'.\n\n${shiftLines}\n\nGelieve je aanwezigheid zo snel mogelijk te bevestigen in het personeelsportaal zodat het team weet dat je paraat staat!\n\nMet vriendelijke groeten,\nCafé In De Molen`;
}
