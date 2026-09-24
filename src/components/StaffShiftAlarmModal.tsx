import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Check, 
  CheckCheck, 
  Clock, 
  Bell, 
  BellRing, 
  Volume2, 
  X, 
  CheckCircle2,
  Copy
} from 'lucide-react';
import { Employee } from '../types';
import { Shift24HourAlert } from './StaffPortal';
import { 
  getPushNotificationPermission, 
  requestPushNotificationPermission, 
  playAlertChime, 
  generateAutomatedReminderText,
  PushNotificationStatus 
} from '../utils/shiftAlarmUtils';

export interface StaffShiftAlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  unconfirmedAlerts: Shift24HourAlert[];
  onAcknowledgeShift: (shiftId: string) => void;
  onAcknowledgeAllShifts?: (shiftIds: string[]) => void;
}

export default function StaffShiftAlarmModal({
  isOpen,
  onClose,
  employee,
  unconfirmedAlerts,
  onAcknowledgeShift,
  onAcknowledgeAllShifts
}: StaffShiftAlarmModalProps) {
  const [copied, setCopied] = useState(false);
  const [notifStatus, setNotifStatus] = useState<PushNotificationStatus>(() => getPushNotificationPermission());

  if (!isOpen || unconfirmedAlerts.length === 0) return null;

  const handleRequestPush = async () => {
    const res = await requestPushNotificationPermission();
    setNotifStatus(res);
    playAlertChime();
  };

  const handleCopyReminder = () => {
    const text = generateAutomatedReminderText(employee, unconfirmedAlerts);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAcknowledgeAll = () => {
    if (onAcknowledgeAllShifts) {
      onAcknowledgeAllShifts(unconfirmedAlerts.map(a => a.shift.id));
    } else {
      unconfirmedAlerts.forEach(a => onAcknowledgeShift(a.shift.id));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-2 border-red-300 overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh]"
      >
        {/* Pulsing Emergency Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          {/* Decorative glowing background blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/15 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75" />
                  <BellRing size={24} className="relative inline-flex stroke-[2.5]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-red-700 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    🚨 Visueel Alarm • Dienst &lt; 24 Uur
                  </span>
                </div>
                <h2 
                  id="reminder-modal-title"
                  className="text-lg sm:text-xl font-black text-white tracking-tight mt-1"
                >
                  Automatische Dienstherinnering
                </h2>
                <p className="text-white/90 text-xs mt-0.5 font-medium">
                  Beste <strong>{employee.name}</strong>, bevestig je shift a.u.b. tijdig op "Gezien".
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer shrink-0"
              title="Sluiten"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Automated Message Box */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-900 uppercase tracking-tight text-[11px]">
              <AlertTriangle size={15} className="text-amber-600 shrink-0" />
              <span>Automatisch Bericht van het Beheersysteem</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              Je staat ingepland voor <strong className="text-slate-900">{unconfirmedAlerts.length} {unconfirmedAlerts.length === 1 ? 'dienst' : 'diensten'}</strong> die binnen de komende 24 uur van start gaat. Deze dienst(en) staat momenteel nog <strong>niet op 'Gezien'</strong>.
            </p>
            <p className="text-slate-600 text-[11px]">
              Door op <strong>"Bevestigen ("Gezien")"</strong> te klikken weet het beheer direct dat je op de hoogte bent en dat de café-bezetting gewaarborgd is.
            </p>
          </div>

          {/* List of shifts requiring confirmation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Nog te bevestigen ({unconfirmedAlerts.length})</span>
              {unconfirmedAlerts.length > 1 && (
                <button
                  type="button"
                  onClick={handleAcknowledgeAll}
                  className="text-orange-600 hover:text-orange-700 font-black normal-case text-xs underline cursor-pointer"
                >
                  Alles in één keer bevestigen ✓
                </button>
              )}
            </div>

            {unconfirmedAlerts.map(({ shift, dayLabel, formattedDate, timeRemainingText, isOngoing, totalHours }) => (
              <div 
                key={shift.id}
                className="bg-white rounded-2xl border-2 border-red-300 p-4 shadow-sm hover:shadow-md transition space-y-3 ring-2 ring-red-100/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">
                        {dayLabel}
                      </span>
                      <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-200">
                        {isOngoing ? '🚨 Nu bezig' : `⏰ ${timeRemainingText}`}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        (shift.department || employee.department) === 'keuken'
                          ? 'bg-orange-100 text-orange-800 border border-orange-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {(shift.department || employee.department) === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-semibold mt-1">
                      {formattedDate} • <strong className="text-slate-800">{shift.startTime} tot {shift.endTime}</strong> ({totalHours} uur)
                    </div>

                    {shift.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg mt-2 border border-slate-200">
                        "{shift.notes}"
                      </p>
                    )}
                  </div>

                  {/* Immediate Confirmation Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onAcknowledgeShift(shift.id);
                      playAlertChime();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 shrink-0 duration-100"
                  >
                    <Check size={16} className="stroke-[3]" />
                    <span>Dienst Bevestigen ("Gezien")</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Push-Notification & Audio Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-slate-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800 block">Push-Notificaties op dit toestel:</span>
                <span className="text-[11px] text-slate-500">
                  {notifStatus === 'granted' 
                    ? '✅ Actief (je ontvangt meldingen voor diensten < 24u)' 
                    : notifStatus === 'denied'
                    ? '❌ Geweigerd in je browser instellingen'
                    : notifStatus === 'unsupported'
                    ? '⚠️ Niet ondersteund in deze browser'
                    : 'ℹ️ Nog niet ingeschakeld'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {notifStatus !== 'granted' && notifStatus !== 'unsupported' && notifStatus !== 'denied' && (
                <button
                  type="button"
                  onClick={handleRequestPush}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <BellRing size={12} />
                  <span>Inschakelen</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => playAlertChime()}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                title="Test het audiosignaal"
              >
                <Volume2 size={12} className="text-slate-500" />
                <span>Test Geluid</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyReminder}
            className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            title="Kopieer de herinneringstekst naar klembord"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copied ? 'Gekopieerd!' : 'Kopieer Herinneringstekst'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unconfirmedAlerts.length > 1 && (
              <button
                type="button"
                onClick={handleAcknowledgeAll}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-sm transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
              >
                <CheckCheck size={15} className="stroke-[3]" />
                <span>Alles Bevestigen</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer active:scale-95"
            >
              Begrepen / Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
