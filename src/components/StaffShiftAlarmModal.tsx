import React, { useState, useEffect } from 'react';
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
  alerts?: Shift24HourAlert[];
  unconfirmedAlerts?: Shift24HourAlert[];
  onAcknowledgeShift: (shiftId: string) => void;
  onAcknowledgeAllShifts?: (shiftIds: string[]) => void;
}

export default function StaffShiftAlarmModal({
  isOpen,
  onClose,
  employee,
  alerts,
  unconfirmedAlerts,
  onAcknowledgeShift,
  onAcknowledgeAllShifts
}: StaffShiftAlarmModalProps) {
  const [copied, setCopied] = useState(false);
  const [notifStatus, setNotifStatus] = useState<PushNotificationStatus>(() => getPushNotificationPermission());

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const displayAlerts = (alerts && alerts.length > 0) ? alerts : (unconfirmedAlerts || []);
  const pendingAlerts = displayAlerts.filter(a => !a.shift.acknowledged);

  if (!isOpen || displayAlerts.length === 0) return null;

  const handleRequestPush = async () => {
    const res = await requestPushNotificationPermission();
    setNotifStatus(res);
    playAlertChime();
  };

  const handleCopyReminder = () => {
    const text = generateAutomatedReminderText(employee, displayAlerts);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleAcknowledgeAll = () => {
    if (onAcknowledgeAllShifts) {
      onAcknowledgeAllShifts(pendingAlerts.map(a => a.shift.id));
    } else {
      pendingAlerts.forEach(a => onAcknowledgeShift(a.shift.id));
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-modal-title"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border-2 border-red-300 overflow-hidden animate-in zoom-in-95 duration-200 relative flex flex-col max-h-[90vh] cursor-default"
      >
        {/* Header Bar */}
        <div className={`text-white p-5 sm:p-6 relative overflow-hidden shrink-0 ${
          pendingAlerts.length > 0 
            ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'
        }`}>
          {/* Decorative glowing background blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/15 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-start justify-between relative z-10 gap-3">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <span className="relative flex h-6 w-6">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                  <BellRing size={24} className="relative inline-flex stroke-[2.5]" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white text-slate-900 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                    {pendingAlerts.length > 0 ? '🚨 Dienst < 24 Uur • Bevestiging Vereist' : '⏰ Dienst Herinnering • < 24 Uur'}
                  </span>
                </div>
                <h2 
                  id="reminder-modal-title"
                  className="text-lg sm:text-xl font-black text-white tracking-tight mt-1"
                >
                  {pendingAlerts.length > 0 ? 'Dienstherinnering: Nog te Bevestigen' : 'Je Dienst Begint Binnen 24 Uur!'}
                </h2>
                <p className="text-white/90 text-xs mt-0.5 font-medium">
                  Beste <strong>{employee.name}</strong>, {pendingAlerts.length > 0 ? 'bevestig je shift a.u.b. op "Gezien".' : 'hier is je dienstoverzicht ter voorbereiding.'}
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
              <span>Automatische Dienstherinnering Café In De Molen</span>
            </div>
            <p className="leading-relaxed text-slate-700">
              Je staat ingepland voor <strong className="text-slate-900">{displayAlerts.length} {displayAlerts.length === 1 ? 'dienst' : 'diensten'}</strong> binnen de komende 24 uur.
              {pendingAlerts.length > 0 ? (
                <span> Er staat nog <strong>{pendingAlerts.length} dienst niet op 'Gezien'</strong>. Bevestig hieronder zodat het beheer weet dat je paraat staat!</span>
              ) : (
                <span> Al je diensten zijn reeds bevestigd. Zorg dat je op tijd aanwezig bent in gepaste kledij!</span>
              )}
            </p>
          </div>

          {/* List of shifts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Ingeplande Diensten Binnen 24u ({displayAlerts.length})</span>
              {pendingAlerts.length > 1 && (
                <button
                  type="button"
                  onClick={handleAcknowledgeAll}
                  className="text-orange-600 hover:text-orange-700 font-black normal-case text-xs underline cursor-pointer"
                >
                  Alles in één keer bevestigen ✓
                </button>
              )}
            </div>

            {displayAlerts.map(({ shift, dayLabel, formattedDate, timeRemainingText, isOngoing, totalHours }) => (
              <div 
                key={shift.id}
                className={`bg-white rounded-2xl border-2 p-4 shadow-sm hover:shadow-md transition space-y-3 ${
                  shift.acknowledged 
                    ? 'border-emerald-300 ring-2 ring-emerald-100/60'
                    : 'border-red-300 ring-2 ring-red-100/60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">
                        {dayLabel}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isOngoing
                          ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
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

                  {/* Immediate Confirmation Button or Confirmed Badge */}
                  {shift.acknowledged ? (
                    <div className="px-4 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 font-black text-xs uppercase tracking-tight rounded-xl flex items-center justify-center gap-1.5 shrink-0">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>✓ Reeds Bevestigd ("Gezien")</span>
                    </div>
                  ) : (
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
                  )}
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
