import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Check, 
  X, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Users, 
  Phone, 
  CheckCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Employee, Shift } from '../types';
import { DAYS_FULL_NL, getDayDateInfo, getWeekMeta } from '../utils/weekUtils';

export interface ShiftReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  employees: Employee[];
  weekNumber: number;
  onSendSingleReminder: (targetShift: Shift) => void;
  onSendBatchReminders: (shiftsToRemind: Shift[]) => void;
}

export default function ShiftReminderModal({
  isOpen,
  onClose,
  shifts,
  employees,
  weekNumber,
  onSendSingleReminder,
  onSendBatchReminders
}: ShiftReminderModalProps) {
  const [selectedDayFilter, setSelectedDayFilter] = useState<'all' | number>('all');
  const [unconfirmedOnly, setUnconfirmedOnly] = useState<boolean>(true);

  if (!isOpen) return null;

  // Filter shifts for this week assigned to actual employees
  const weekShifts = shifts.filter(s => 
    (s.weekNumber || weekNumber) === weekNumber && 
    s.employeeId && 
    s.employeeId !== 'open_shift' && 
    s.status === 'published'
  );

  const filteredShifts = weekShifts.filter(s => {
    if (selectedDayFilter !== 'all' && s.day !== selectedDayFilter) return false;
    if (unconfirmedOnly && s.acknowledged) return false;
    return true;
  }).sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.startTime.localeCompare(b.startTime);
  });

  const weekMeta = getWeekMeta(weekNumber);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-orange-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white p-5 sm:p-6 relative overflow-hidden shrink-0">
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/30 shadow-inner">
                <Bell size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="bg-white text-orange-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  Beheerder Dashboard
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                  Shift-Herinneringen Ter Voorbereiding
                </h2>
                <p className="text-white/90 text-xs mt-0.5 font-medium">
                  Week {weekNumber} ({weekMeta.dateRange})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Filter dag:</span>
            <select
              value={selectedDayFilter}
              onChange={(e) => setSelectedDayFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-semibold"
            >
              <option value="all">Alle Dagen (Ma - Zo)</option>
              {DAYS_FULL_NL.map((d, idx) => (
                <option key={idx} value={idx}>{d}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={unconfirmedOnly}
              onChange={(e) => setUnconfirmedOnly(e.target.checked)}
              className="rounded text-orange-500 focus:ring-orange-400"
            />
            <span>Alleen nog niet bevestigd ("Gezien")</span>
          </label>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto">
          {filteredShifts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
              Geen diensten gevonden die aan deze criteria voldoen.
            </div>
          ) : (
            filteredShifts.map((shift) => {
              const emp = employees.find(e => e.id === shift.employeeId);
              const dayDate = getDayDateInfo(weekNumber, shift.day);
              const dept = (shift.department || emp?.department) === 'keuken' ? 'Keuken' : 'Zaal';

              return (
                <div
                  key={shift.id}
                  className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-orange-200 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-800 text-xs">
                        {emp?.name || 'Onbekend'}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        dept === 'Keuken' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {dept}
                      </span>
                      {shift.acknowledged ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCheck size={11} />
                          <span>Gezien ✓</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Nog niet gezien
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-bold text-slate-700">{DAYS_FULL_NL[shift.day]} ({dayDate.shortDate}):</span>
                      <span>{shift.startTime} – {shift.endTime}</span>
                    </div>

                    {shift.lastReminderSentAt && (
                      <p className="text-[10px] text-amber-700 font-semibold">
                        Laatste herinnering verstuurd: {new Date(shift.lastReminderSentAt).toLocaleString('nl-BE', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => onSendSingleReminder(shift)}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bell size={12} />
                      <span>{shift.lastReminderSentAt ? 'Herinner opnieuw' : 'Stuur Herinnering'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-bold">
            {filteredShifts.length} {filteredShifts.length === 1 ? 'dienst' : 'diensten'} in selectie
          </span>

          <div className="flex items-center gap-2">
            {filteredShifts.length > 0 && (
              <button
                type="button"
                onClick={() => onSendBatchReminders(filteredShifts)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Send size={13} />
                <span>Verstuur naar alle geselecteerden</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
