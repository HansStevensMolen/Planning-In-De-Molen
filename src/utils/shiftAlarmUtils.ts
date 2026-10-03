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
 * Dispatches an automated native browser Push Notification for ANY scheduled shift starting within 24 hours.
 */
export function sendUpcomingShiftNotification(
  employee: Employee,
  shiftAlert: Shift24HourAlert
): boolean {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const shift = shiftAlert.shift;
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
  const ackText = shift.acknowledged ? 'Dienst staat op akkoord.' : 'Bevestig even als gezien in het portaal!';

  try {
    const title = shiftAlert.isOngoing 
      ? `☕ In De Molen: Je dienst is NU actief!`
      : `⏰ Dienst Herinnering: Begint binnen 24 uur!`;

    const notification = new Notification(title, {
      body: `Beste ${employee.name}, herinnering voor je shift op ${shiftAlert.dayLabel} (${shift.startTime} - ${shift.endTime}, ${dept}). ${shiftAlert.timeRemainingText}. ${ackText}`,
      icon: '/favicon.ico',
      tag: `upcoming-shift-24h-${shift.id}`,
      requireInteraction: false
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
 * Dispatches an urgent native browser Push Notification for a shift starting within 1 hour.
 * Supports both standard desktop Notification API and mobile Service Worker notifications on smartphones.
 */
export function send1HourShiftNotification(
  employee: Employee,
  shiftAlert: Shift24HourAlert
): boolean {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const shift = shiftAlert.shift;
  const dept = (shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken 🍳' : 'Zaal 🍽️';
  const title = `⏰ In De Molen: Je dienst begint over 1 uur!`;
  const bodyText = `Beste ${employee.name}, je shift (${dept}) start om ${shift.startTime}. ${shiftAlert.timeRemainingText}. Zorg dat je tijdig aanwezig bent!`;

  try {
    // 1. Mobile ServiceWorker Notification (Reliable for Android smartphones & iOS PWA on smartphone)
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        if (reg && reg.showNotification) {
          reg.showNotification(title, {
            body: bodyText,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: `shift-1hour-alarm-${shift.id}`,
            renotify: true,
            vibrate: [200, 100, 200]
          } as any);
        }
      }).catch(() => {});
    }

    // 2. Standard Web Notification API for desktop/browsers
    try {
      const notification = new Notification(title, {
        body: bodyText,
        icon: '/favicon.ico',
        tag: `shift-1hour-alarm-${shift.id}`,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // In mobile Chrome new Notification() may throw Illegal constructor, handled by serviceWorker above
    }

    sessionStorage.setItem(`shift_1h_notif_sent_${shift.id}`, 'true');
    playAlertChime();
    return true;
  } catch (err) {
    console.error('Failed to trigger 1-hour shift notification:', err);
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
  const sortedAlerts = [...shiftsAlerts].sort((a, b) => {
    if (Number(a.shift.day) !== Number(b.shift.day)) return Number(a.shift.day) - Number(b.shift.day);
    return (a.shift.startTime || '').localeCompare(b.shift.startTime || '');
  });
  const shiftLines = sortedAlerts.map(sa => {
    const dept = (sa.shift.department || employee.department || 'zaal') === 'keuken' ? 'Keuken' : 'Zaal';
    return `• ${sa.dayLabel} (${sa.formattedDate}): ${sa.shift.startTime} - ${sa.shift.endTime} (${dept}) — ${sa.timeRemainingText}`;
  }).join('\n');

  return `Beste ${employee.name},\n\nDit is een herinnering vanuit Hans:\nJe hebt ${count === 1 ? 'een dienst' : `${count} diensten`} binnen 24 uur die nog niet gemarkeerd zijn als 'Gezien'.\n\n${shiftLines}\n\nGelieve je aanwezigheid zo snel mogelijk te bevestigen in het personeelsportaal zodat het team weet dat je paraat staat!\n\nMet vriendelijke groeten,\nHans`;
}
