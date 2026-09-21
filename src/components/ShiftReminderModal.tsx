import React, { useState } from 'react';
import { Employee, Shift, Department } from '../types';
import { 
  X, 
  Bell, 
  BellRing, 
  Check, 
  Clock, 
  MessageCircle, 
  Send, 
  Users, 
  Copy, 
  CheckCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DAYS_FULL_NL, getDayDateInfo } from '../utils/weekUtils';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';

interface ShiftReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  employees: Employee[];
  weekNumber: number;
  onSendSingleReminder: (shift: Shift) => void;
  onSendBatchReminders: (shifts: Shift[]) => void;
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
  // Compute default day to tomorrow (or today if Sunday)
  const now = new Date();
  const currentDayIdx = (now.getDay() + 6) % 7; // 0 = Ma, 6 = Zo
  const tomorrowDayIdx = (currentDayIdx + 1) % 7;

  const [selectedDay, setSelectedDay] = useState<number>(tomorrowDayIdx);
  const [copiedShiftId, setCopiedShiftId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Shifts for selected week and day
  const dayShifts = shifts.filter(s => 
    (s.weekNumber || weekNumber) === weekNumber && 
    s.day === selectedDay &&
    !s.isOpenShift
  );

  const dayDateInfo = getDayDateInfo(weekNumber, selectedDay);
  const isTomorrow = selectedDay === tomorrowDayIdx;
  const isToday = selectedDay === currentDayIdx;

  const remindedCount = dayShifts.filter(s => s.lastReminderSentAt).length;
  const pendingCount = dayShifts.length - remindedCount;

  const handleCopyMessage = (shift: Shift, emp: Employee) => {
    const deptLabel = shift.department === 'keuken' ? 'Keuken' : 'Zaal';
    const text = `Hallo ${emp.name}! 👋\n\nDit is een herinnering vanuit In De Molen voor je geplande shift:\n📅 ${DAYS_FULL_NL[shift.day]} ${dayDateInfo.shortDate}\n⏰ ${shift.startTime} - ${shift.endTime} (${deptLabel})\n\nGraag tot dan!`;
    navigator.clipboard.writeText(text);
    setCopiedShiftId(shift.id);
    setTimeout(() => setCopiedShiftId(null), 2500);
  };

  const getWhatsAppUrl = (shift: Shift, emp: Employee) => {
    if (!emp.phone) return null;
    const raw = emp.phone.replace(/[^0-9]/g, '');
    const intlPhone = (raw.startsWith('0') && raw.length === 10) ? '32' + raw.substring(1) : raw;
    const deptLabel = shift.department === 'keuken' ? 'Keuken' : 'Zaal';
    const text = encodeURIComponent(
      `Hallo ${emp.name}! 👋\n\nHerinnering vanuit In De Molen voor je dienst:\n📅 ${DAYS_FULL_NL[shift.day]} ${dayDateInfo.shortDate}\n⏰ ${shift.startTime} - ${shift.endTime} (${deptLabel})\n\nGelieve je aanwezigheid tijdig te bevestigen in het personeelsportaal. Tot dan!`
    );
    return `https://wa.me/${intlPhone}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-orange-250 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner ring-1 ring-white/30">
              <BellRing size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <span>Shift-Herinneringen Komende Werkdag</span>
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Stuur met 1 klik een herinnering naar ingeplande medewerkers ter voorbereiding op hun dienst.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>
        </div>

        {/* Day Selector Tabs */}
        <div className="px-6 py-3 bg-orange-50/60 border-b border-orange-150 flex items-center gap-1.5 overflow-x-auto">
          {DAYS_FULL_NL.map((dName, dIdx) => {
            const dInfo = getDayDateInfo(weekNumber, dIdx);
            const countForDay = shifts.filter(s => (s.weekNumber || weekNumber) === weekNumber && s.day === dIdx && !s.isOpenShift).length;
            const isSel = selectedDay === dIdx;
            const isTom = dIdx === tomorrowDayIdx;
            const isTod = dIdx === currentDayIdx;

            return (
              <button
                key={dIdx}
                type="button"
                onClick={() => setSelectedDay(dIdx)}
                className={`px-3 py-2 rounded-2xl text-xs font-black uppercase tracking-tight transition flex flex-col items-center shrink-0 cursor-pointer ${
                  isSel 
                    ? 'bg-orange-500 text-white shadow-md scale-102' 
                    : 'bg-white hover:bg-orange-100/80 text-slate-700 border border-orange-200/80'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>{dName.slice(0, 2)}</span>
                  {isTom && (
                    <span className={`text-[8px] px-1 py-0.2 rounded font-black ${isSel ? 'bg-amber-300 text-amber-950' : 'bg-amber-200 text-amber-900'}`}>
                      Morgen
                    </span>
                  )}
                  {isTod && (
                    <span className={`text-[8px] px-1 py-0.2 rounded font-black ${isSel ? 'bg-emerald-300 text-emerald-950' : 'bg-emerald-100 text-emerald-900'}`}>
                      Vandaag
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isSel ? 'text-orange-150' : 'text-slate-400'}`}>
                  {dInfo.shortDate} ({countForDay})
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Header for Selected Day */}
        <div className="px-6 py-3 bg-white border-b border-orange-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {DAYS_FULL_NL[selectedDay]} {dayDateInfo.shortDate}
              </span>
              {isTomorrow && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-amber-100 text-amber-950 border border-amber-300">
                  ⭐️ Komende werkdag
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {dayShifts.length} ingeplande medewerker(s) • {remindedCount} al herinnerd • {pendingCount} nog te herinneren
            </p>
          </div>

          {dayShifts.length > 0 && pendingCount > 0 && (
            <button
              type="button"
              onClick={() => onSendBatchReminders(dayShifts.filter(s => !s.lastReminderSentAt))}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              title="Stuur met 1 klik een herinnering naar alle medewerkers die nog geen herinnering ontvingen"
            >
              <BellRing size={14} className="stroke-[2.5]" />
              <span>Stuur naar Allen ({pendingCount})</span>
            </button>
          )}
        </div>

        {/* Shift List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-50/50">
          {dayShifts.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-3xl border-2 border-dashed border-orange-200 text-slate-400">
              <Calendar size={32} className="mx-auto mb-2 text-orange-300 opacity-60" />
              <p className="font-bold text-xs uppercase tracking-tight">Geen diensten ingepland voor {DAYS_FULL_NL[selectedDay]}</p>
              <p className="text-xs text-slate-400 mt-1">Selecteer een andere dag in de balk hierboven.</p>
            </div>
          ) : (
            dayShifts.map((shift) => {
              const emp = employees.find(e => e.id === shift.employeeId);
              if (!emp) return null;

              const isReminded = Boolean(shift.lastReminderSentAt);
              const waUrl = getWhatsAppUrl(shift, emp);

              return (
                <div 
                  key={shift.id}
                  className={`bg-white p-4 rounded-2xl border-2 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isReminded 
                      ? 'border-amber-200 bg-amber-50/20' 
                      : 'border-orange-100 hover:border-orange-200'
                  }`}
                >
                  {/* Left: Employee and shift details */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shadow-xs ring-2 ring-orange-200 shrink-0"
                      style={{ backgroundColor: emp.color }}
                    >
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-xs text-slate-800 uppercase tracking-tight">{emp.name}</span>
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide">
                          {emp.department === 'keuken' ? 'Keuken' : 'Zaal'} • {emp.statuut}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          <Clock size={11} className="text-orange-500" />
                          <span>{shift.startTime} - {shift.endTime}</span>
                        </span>

                        {shift.acknowledged ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-250">
                            <CheckCheck size={10} className="stroke-[3]" />
                            <span>Gezien</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Nog niet bevestigd
                          </span>
                        )}

                        {isReminded && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <Bell size={9} className="fill-amber-600 text-amber-700" />
                            <span>Herinnerd om {new Date(shift.lastReminderSentAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(shift, emp)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition cursor-pointer text-xs font-bold"
                      title="Kopieer herinneringstekst naar klembord"
                    >
                      {copiedShiftId === shift.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>

                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title={`Stuur herinnering via WhatsApp naar ${emp.phone}`}
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => onSendSingleReminder(shift)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-tight shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                        isReminded 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300' 
                          : 'bg-amber-500 hover:bg-amber-600 text-white'
                      }`}
                      title="Stuur met 1 klik een herinnering naar het medewerkersportaal"
                    >
                      <Bell size={13} className={isReminded ? 'fill-amber-600 text-amber-700' : 'stroke-[2.5]'} />
                      <span>{isReminded ? 'Opnieuw Sturen' : 'Stuur Herinnering'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-orange-150 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Herinneringen verschijnen direct als prioriteitsbericht in het medewerkersportaal.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
