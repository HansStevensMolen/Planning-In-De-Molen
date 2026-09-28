import React, { useState } from 'react';
import { Shift, Employee } from '../types';
import { getDayDateInfo, getWeekMeta, CURRENT_WEEK_NUMBER } from '../utils/weekUtils';
import { 
  Sparkles, 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  AlertCircle
} from 'lucide-react';

interface OpenShiftPopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  shifts: Shift[];
  currentEmployee: Employee;
  onSelfAssignOpenShift: (shiftId: string, employeeId: string) => void;
}

export default function OpenShiftPopUpModal({
  isOpen,
  onClose,
  shifts,
  currentEmployee,
  onSelfAssignOpenShift
}: OpenShiftPopUpModalProps) {
  const [assignedShiftId, setAssignedShiftId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter open shifts that are published and not yet assigned to a specific person
  const openShifts = shifts.filter(s => 
    (s.isOpenShift || s.employeeId === 'open_shift') && 
    s.status === 'published' &&
    (s.weekNumber || CURRENT_WEEK_NUMBER) >= CURRENT_WEEK_NUMBER
  ).sort((a, b) => {
    const wA = a.weekNumber || CURRENT_WEEK_NUMBER;
    const wB = b.weekNumber || CURRENT_WEEK_NUMBER;
    if (wA !== wB) return wA - wB;
    return a.day - b.day;
  });

  const handleClaimShift = (shift: Shift) => {
    setAssignedShiftId(shift.id);
    onSelfAssignOpenShift(shift.id, currentEmployee.id);
    setSuccessMessage(`🎉 Geweldig, ${currentEmployee.name}! Je hebt deze openstaande dienst direct aangenomen en bent ingeroosterd in de planning.`);
    setTimeout(() => {
      setAssignedShiftId(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-amber-300 overflow-hidden text-left animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header with vibrant callout */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <span className="text-2xl animate-bounce">📢</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 bg-white/20 px-2 py-0.5 rounded-full">
                  Personeels Oproep
                </span>
                <span className="bg-white text-orange-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                  {openShifts.length} {openShifts.length === 1 ? 'Open Dienst' : 'Open Diensten'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 text-white">
                Openstaande Dienst Invullen!
              </h2>
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-2 font-medium leading-relaxed">
            Hallo <strong>{currentEmployee.name}</strong>, er zijn openstaande shiften waarvoor nog collega's gezocht worden. Klik direct op de knop om een shift zelf in te vullen!
          </p>
        </div>

        {/* Success toast if shift just claimed */}
        {successMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3.5 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content list */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {openShifts.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-base font-black text-slate-800 uppercase tracking-tight">
                Alles is bezet!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Er zijn momenteel geen openstaande diensten meer. Alle shiften zijn netjes ingevuld door het team.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          ) : (
            openShifts.map((sh) => {
              const weekNum = sh.weekNumber || CURRENT_WEEK_NUMBER;
              const dayDate = getDayDateInfo(weekNum, sh.day);
              const isAssignedJustNow = assignedShiftId === sh.id;

              return (
                <div
                  key={sh.id}
                  className={`p-4 sm:p-4.5 rounded-2xl border-2 transition-all shadow-xs flex flex-col justify-between gap-3 text-left ${
                    isAssignedJustNow
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-200'
                      : 'bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border-amber-200 hover:border-amber-400'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-black text-[10px] uppercase">
                          Week {weekNum}
                        </span>
                        <span className="font-black text-sm text-slate-900">
                          {dayDate.formattedWithDay}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sh.department === 'keuken' 
                          ? 'bg-orange-100 text-orange-900 border border-orange-300' 
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}>
                        {sh.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-black text-amber-950">
                      <Clock size={13} className="text-amber-600 shrink-0" />
                      <span>{sh.startTime} - {sh.endTime}</span>
                      {sh.notes && (
                        <span className="text-[11px] text-slate-600 font-semibold italic truncate">
                          • "{sh.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Big Clickable Action Button */}
                  {isAssignedJustNow ? (
                    <div className="w-full py-2.5 px-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-tight rounded-xl flex items-center justify-center gap-2 shadow-xs">
                      <CheckCircle2 size={16} />
                      <span>✓ Succesvol Aangenomen! Je staat nu in het rooster</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClaimShift(sh)}
                      className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer hover:shadow-lg"
                    >
                      <Sparkles size={15} className="animate-pulse" />
                      <span>⚡ Ik wil deze shift invullen (Direct aannemen)</span>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 Je wordt direct toegevoegd aan het officiële werkrooster.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer active:scale-95 shrink-0"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
