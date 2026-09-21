import React, { useState, useMemo } from 'react';
import { Employee, Shift } from '../types';
import { 
  Clock, 
  CheckCheck, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  FileText, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  Printer, 
  Briefcase,
  ShieldCheck,
  Building2,
  Coffee,
  ChefHat
} from 'lucide-react';
import { 
  DAYS_FULL_NL, 
  DAYS_SHORT_NL, 
  getDayDateInfo, 
  getWeekMeta, 
  CURRENT_WEEK_NUMBER,
  AVAILABLE_WEEKS
} from '../utils/weekUtils';
import { calculateShiftDurationHours } from '../utils/employeeAgeUtils';

interface StaffHoursTrackerProps {
  currentEmployee: Employee;
  shifts: Shift[];
  initialWeekNumber?: number;
  onAcknowledgeShift?: (shiftId: string) => void;
}

export default function StaffHoursTracker({
  currentEmployee,
  shifts,
  initialWeekNumber = CURRENT_WEEK_NUMBER,
  onAcknowledgeShift
}: StaffHoursTrackerProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeekNumber);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'week' | 'history'>('week');

  // Filter ONLY published / approved shifts for this employee
  const employeePublishedShifts = useMemo(() => {
    return shifts.filter(s => s.employeeId === currentEmployee.id && s.status === 'published');
  }, [shifts, currentEmployee.id]);

  // Shifts for the selected week
  const weekShifts = useMemo(() => {
    return employeePublishedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
  }, [employeePublishedShifts, selectedWeek]);

  // Available weeks list (include historical, current, and upcoming)
  const availableWeeksList = useMemo(() => {
    // Collect all distinct week numbers present in shifts or AVAILABLE_WEEKS
    const weekSet = new Set<number>();
    AVAILABLE_WEEKS.forEach(w => weekSet.add(w.weekNumber));
    employeePublishedShifts.forEach(s => {
      if (s.weekNumber) weekSet.add(s.weekNumber);
    });
    // Sort ascending
    return Array.from(weekSet).sort((a, b) => a - b);
  }, [employeePublishedShifts]);

  // Compute stats for selected week
  const weekStats = useMemo(() => {
    let totalHours = 0;
    let zaalHours = 0;
    let keukenHours = 0;
    let acknowledgedCount = 0;

    weekShifts.forEach(s => {
      const dur = calculateShiftDurationHours(s.startTime, s.endTime, s.day);
      totalHours += dur;
      if (s.department === 'keuken') {
        keukenHours += dur;
      } else {
        zaalHours += dur;
      }
      if (s.acknowledged) {
        acknowledgedCount += 1;
      }
    });

    const shiftCount = weekShifts.length;
    const avgDuration = shiftCount > 0 ? totalHours / shiftCount : 0;

    return {
      totalHours: Math.round(totalHours * 10) / 10,
      zaalHours: Math.round(zaalHours * 10) / 10,
      keukenHours: Math.round(keukenHours * 10) / 10,
      shiftCount,
      acknowledgedCount,
      avgDuration: Math.round(avgDuration * 10) / 10
    };
  }, [weekShifts]);

  // Compute yearly cumulative hours for Student contingent (600h) or general year tracker
  const yearlyStats = useMemo(() => {
    let totalYearHours = 0;
    const weekTotals: Record<number, number> = {};

    employeePublishedShifts.forEach(s => {
      const w = s.weekNumber || CURRENT_WEEK_NUMBER;
      const dur = calculateShiftDurationHours(s.startTime, s.endTime, s.day);
      totalYearHours += dur;
      weekTotals[w] = (weekTotals[w] || 0) + dur;
    });

    return {
      totalYearHours: Math.round(totalYearHours * 10) / 10,
      weekTotals
    };
  }, [employeePublishedShifts]);

  const selectedWeekMeta = getWeekMeta(selectedWeek);

  // Copy weekly hours summary to clipboard
  const handleCopyWeekSummary = () => {
    const lines: string[] = [];
    lines.push(`📋 URENOVERZICHT IN DE MOLEN • WEEK ${selectedWeek}`);
    lines.push(`Medewerker: ${currentEmployee.name} (${currentEmployee.statuut} • ${currentEmployee.department === 'keuken' ? 'Keuken' : 'Zaal'})`);
    lines.push(`Periode: ${selectedWeekMeta.dateRange}`);
    lines.push(`────────────────────────────────────────`);
    lines.push(`TOTAAL GEWERKT: ${weekStats.totalHours} uren (${weekStats.shiftCount} diensten)`);
    if (weekStats.zaalHours > 0) lines.push(`• Zaal: ${weekStats.zaalHours} uren`);
    if (weekStats.keukenHours > 0) lines.push(`• Keuken: ${weekStats.keukenHours} uren`);
    lines.push(`────────────────────────────────────────`);
    lines.push(`GESPECIFICEERDE DIENSTEN:`);

    if (weekShifts.length === 0) {
      lines.push(`(Geen diensten ingepland in deze week)`);
    } else {
      // Sort by day index
      const sortedShifts = [...weekShifts].sort((a, b) => a.day - b.day);
      sortedShifts.forEach(s => {
        const dayInfo = getDayDateInfo(selectedWeek, s.day);
        const dur = calculateShiftDurationHours(s.startTime, s.endTime, s.day);
        const dept = s.department === 'keuken' ? 'Keuken' : 'Zaal';
        const ack = s.acknowledged ? '✓ Bevestigd' : 'Nog niet bevestigd';
        lines.push(`• ${dayInfo.dayNameFull} ${dayInfo.shortDate}: ${s.startTime} - ${s.endTime} (${dur}u, ${dept}) [${ack}]`);
      });
    }

    lines.push(`────────────────────────────────────────`);
    lines.push(`Gegenereerd via Personeelsportaal In De Molen`);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Quick navigation
  const currentWeekIdx = availableWeeksList.indexOf(selectedWeek);
  const canGoPrev = currentWeekIdx > 0;
  const canGoNext = currentWeekIdx < availableWeeksList.length - 1;

  const handlePrevWeek = () => {
    if (canGoPrev) setSelectedWeek(availableWeeksList[currentWeekIdx - 1]);
  };

  const handleNextWeek = () => {
    if (canGoNext) setSelectedWeek(availableWeeksList[currentWeekIdx + 1]);
  };

  // Student 600h contingent calculations
  const isStudent = currentEmployee.statuut === 'Student';
  const studentLimit = 600;
  const studentRemaining = Math.max(0, studentLimit - yearlyStats.totalYearHours);
  const studentPercentage = Math.min(100, Math.round((yearlyStats.totalYearHours / studentLimit) * 100));

  // Vast contract target
  const isVast = currentEmployee.statuut === 'Vast';
  const contractTargetHours = currentEmployee.contractDaysPerWeek ? currentEmployee.contractDaysPerWeek * 8 : 38;
  const vastDiff = weekStats.totalHours - contractTargetHours;

  return (
    <div className="space-y-5 font-sans text-left animate-in fade-in duration-200">
      
      {/* 1. Header Banner & Quick Highlights */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider mb-2 ring-1 ring-white/30">
              <Clock size={13} className="text-amber-200 animate-pulse" />
              <span>Persoonlijke Uren-Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Gepresteerde Uren • {currentEmployee.name}
            </h2>
            <p className="text-xs text-amber-100 font-medium mt-1 max-w-xl">
              Real-time urenoverzicht berekend op basis van jouw goedgekeurde en gepubliceerde diensten door de beheerder.
            </p>
          </div>

          {/* Quick Stat Pill in Banner */}
          <div className="flex items-center gap-2 shrink-0 bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
            <div className="w-12 h-12 rounded-xl bg-white text-orange-600 flex flex-col items-center justify-center font-black shadow-md">
              <span className="text-lg leading-none">{weekStats.totalHours}</span>
              <span className="text-[9px] uppercase tracking-tight text-slate-500">Uur</span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-200">Week {selectedWeek}</div>
              <div className="text-xs font-bold text-white">{weekStats.shiftCount} diensten gepland</div>
              <div className="text-[10px] text-amber-100/90 flex items-center gap-1 mt-0.5">
                <CheckCheck size={11} className="text-emerald-300" />
                <span>{weekStats.acknowledgedCount}/{weekStats.shiftCount} bevestigd</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation & Week Selector Toolbar */}
      <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Previous / Current / Next Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrevWeek}
            disabled={!canGoPrev}
            className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed text-orange-800 font-bold transition cursor-pointer"
            title="Vorige week"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => setSelectedWeek(CURRENT_WEEK_NUMBER)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
              selectedWeek === CURRENT_WEEK_NUMBER
                ? 'bg-orange-500 text-white shadow-xs'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200'
            }`}
          >
            Huidige Week ({CURRENT_WEEK_NUMBER})
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            disabled={!canGoNext}
            className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 disabled:opacity-30 disabled:cursor-not-allowed text-orange-800 font-bold transition cursor-pointer"
            title="Volgende week"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Available Weeks Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {availableWeeksList.map(wNum => {
            const isSel = selectedWeek === wNum;
            const isCur = wNum === CURRENT_WEEK_NUMBER;
            const weekTotal = yearlyStats.weekTotals[wNum] || 0;

            return (
              <button
                key={wNum}
                type="button"
                onClick={() => setSelectedWeek(wNum)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex flex-col items-center shrink-0 cursor-pointer ${
                  isSel 
                    ? 'bg-orange-500 text-white shadow-sm scale-102' 
                    : 'bg-slate-50 hover:bg-orange-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span>W{wNum}</span>
                  {isCur && <span className={`w-1.5 h-1.5 rounded-full ${isSel ? 'bg-amber-300' : 'bg-orange-500'}`} />}
                </div>
                <span className={`text-[10px] font-bold ${isSel ? 'text-amber-100' : 'text-slate-400'}`}>
                  {weekTotal > 0 ? `${weekTotal}u` : '0u'}
                </span>
              </button>
            );
          })}
        </div>

        {/* View switcher & Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyWeekSummary}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-tight rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Kopieer urenspecificatie van deze week"
          >
            {copySuccess ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copySuccess ? 'Gekopieerd!' : 'Kopiëren'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition cursor-pointer"
            title="Print urenoverzicht"
          >
            <Printer size={15} />
          </button>
        </div>
      </div>

      {/* 3. Detailed Weekly Summary Cards (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Card 1: Total Hours */}
        <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-black uppercase">
            <span>Totaal Uren</span>
            <Clock size={16} className="text-orange-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{weekStats.totalHours}</span>
            <span className="text-xs font-bold text-slate-500 ml-1">uur</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">In Week {selectedWeek} ({selectedWeekMeta.dateRange})</p>
        </div>

        {/* Card 2: Shifts count & Avg */}
        <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-black uppercase">
            <span>Diensten</span>
            <Calendar size={16} className="text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{weekStats.shiftCount}</span>
            <span className="text-xs font-bold text-slate-500 ml-1">shiften</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Gem. {weekStats.avgDuration} uur / dienst</p>
        </div>

        {/* Card 3: Department Breakdown */}
        <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-black uppercase">
            <span>Afdelingen</span>
            <Building2 size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <Coffee size={12} className="text-amber-600" /> Zaal:
              </span>
              <span className="font-black text-slate-800">{weekStats.zaalHours}u</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600 flex items-center gap-1">
                <ChefHat size={12} className="text-orange-600" /> Keuken:
              </span>
              <span className="font-black text-slate-800">{weekStats.keukenHours}u</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex mt-2">
            {weekStats.totalHours > 0 && (
              <>
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${(weekStats.zaalHours / weekStats.totalHours) * 100}%` }} 
                  title={`Zaal: ${weekStats.zaalHours}u`}
                />
                <div 
                  className="bg-orange-600 h-full" 
                  style={{ width: `${(weekStats.keukenHours / weekStats.totalHours) * 100}%` }} 
                  title={`Keuken: ${weekStats.keukenHours}u`}
                />
              </>
            )}
          </div>
        </div>

        {/* Card 4: Status & Statuut Context */}
        <div className="bg-white p-4 rounded-3xl border-2 border-orange-100 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-black uppercase">
            <span>Status</span>
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2">
            <div className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-tight text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
              <CheckCheck size={12} className="stroke-[3]" />
              <span>{weekStats.acknowledgedCount === weekStats.shiftCount && weekStats.shiftCount > 0 ? 'Alles Bevestigd' : `${weekStats.acknowledgedCount}/${weekStats.shiftCount} Gezien`}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Statuut: <strong className="text-slate-700">{currentEmployee.statuut}</strong>
          </p>
        </div>
      </div>

      {/* 4. Statuut-specifieke inzichten (Student 600u contingent of Vast contract) */}
      {isStudent && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-3xl border-2 border-amber-200 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500 text-white rounded-2xl shrink-0 shadow-xs">
                <Sparkles size={16} />
              </span>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-amber-950">
                  Studentencontingent 600 Uur (Belgische Wetgeving)
                </h4>
                <p className="text-xs text-amber-900 font-medium mt-0.5">
                  Als jobstudent mag je tot 600 uur per kalenderjaar werken tegen verlaagde RSZ-bijdragen (2,71%).
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-amber-950">{yearlyStats.totalYearHours} u</span>
              <span className="text-xs text-amber-800 font-bold"> / 600 u gewerkt ({studentPercentage}%)</span>
              <div className="text-[11px] font-black text-emerald-800 mt-0.5">
                {studentRemaining} uur over
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="w-full bg-amber-200/80 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  studentPercentage > 85 ? 'bg-rose-500' : studentPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${studentPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-amber-900 uppercase tracking-tight">
              <span>0 u</span>
              <span>300 u (Helft)</span>
              <span>600 u (Maximum contingent)</span>
            </div>
          </div>
        </div>
      )}

      {isVast && (
        <div className="bg-blue-50/60 p-4 rounded-3xl border-2 border-blue-200 text-xs text-blue-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Briefcase size={18} className="text-blue-600 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-tight">Vast Contract Referentie ({contractTargetHours} uur / week)</p>
              <p className="text-blue-800 mt-0.5">
                Streeflengte voltijds/deeltijds regime. Deze week ingepland: <strong>{weekStats.totalHours} uur</strong>.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
              vastDiff >= 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {vastDiff >= 0 ? `+${vastDiff}u overuren` : `${vastDiff}u saldo`}
            </span>
          </div>
        </div>
      )}

      {/* 5. Dag-voor-dag Specificatie van de Geselecteerde Week */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <Calendar size={16} className="text-orange-500" />
              <span>Dagspecificatie Week {selectedWeek}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Gedetailleerd overzicht van goedgekeurde diensten van maandag tot zondag.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Goedgekeurd door beheerder</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {DAYS_FULL_NL.map((dayName, dayIdx) => {
            const dayInfo = getDayDateInfo(selectedWeek, dayIdx);
            const dayShifts = weekShifts.filter(s => s.day === dayIdx);
            const hasShift = dayShifts.length > 0;
            const dayTotalHours = dayShifts.reduce((acc, s) => acc + calculateShiftDurationHours(s.startTime, s.endTime, s.day), 0);

            return (
              <div 
                key={dayIdx}
                className={`p-3.5 rounded-2xl border-2 transition flex flex-col justify-between min-h-[140px] ${
                  hasShift 
                    ? 'bg-white border-orange-200 shadow-xs hover:border-orange-300' 
                    : 'bg-slate-50/70 border-slate-150 opacity-70'
                }`}
              >
                {/* Day Header */}
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="text-xs font-black uppercase tracking-tight text-slate-800">
                      {DAYS_SHORT_NL[dayIdx]}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {dayInfo.shortDate}
                    </span>
                  </div>

                  {/* Day Content */}
                  <div className="mt-2 space-y-2">
                    {hasShift ? (
                      dayShifts.map(shift => {
                        const shiftDur = calculateShiftDurationHours(shift.startTime, shift.endTime, shift.day);
                        const isKitchen = shift.department === 'keuken';

                        return (
                          <div key={shift.id} className="space-y-1.5">
                            {/* Shift Hours & Department */}
                            <div className="bg-orange-50/80 p-2 rounded-xl border border-orange-150 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black text-slate-800">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                                <span className="text-[11px] font-black text-orange-600">
                                  {shiftDur}u
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[9px]">
                                <span className={`px-1.5 py-0.2 rounded font-black uppercase ${
                                  isKitchen ? 'bg-orange-200 text-orange-950' : 'bg-amber-200 text-amber-950'
                                }`}>
                                  {isKitchen ? 'Keuken' : 'Zaal'}
                                </span>

                                {shift.acknowledged ? (
                                  <span className="text-emerald-800 font-black flex items-center gap-0.5">
                                    <CheckCheck size={10} className="stroke-[3]" />
                                    <span>Gezien</span>
                                  </span>
                                ) : onAcknowledgeShift ? (
                                  <button
                                    type="button"
                                    onClick={() => onAcknowledgeShift(shift.id)}
                                    className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black uppercase text-[8px] transition cursor-pointer"
                                  >
                                    Bevestig
                                  </button>
                                ) : (
                                  <span className="text-slate-400 font-bold">Niet gezien</span>
                                )}
                              </div>
                            </div>

                            {shift.notes && (
                              <p className="text-[10px] text-slate-500 italic truncate" title={shift.notes}>
                                💬 {shift.notes}
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-slate-400">
                        <span className="text-[11px] font-bold block">Geen dienst</span>
                        <span className="text-[9px] text-slate-300 block">Vrij</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day Footer with Day Subtotal */}
                {hasShift && (
                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase">
                    <span>Dag Totaal:</span>
                    <span className="text-orange-600">{Math.round(dayTotalHours * 10) / 10} uur</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Historisch Wekenoverzicht (Vorige & Komende weken vergelijken) */}
      <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-black uppercase tracking-tight text-slate-800 flex items-center gap-1.5">
              <TrendingUp size={15} className="text-orange-500" />
              <span>Wekenoverzicht & Trends</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Overzicht van gewerkte en ingeplande uren over verschillende weken.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold">Jaartotaal tot heden: </span>
            <span className="text-xs font-black text-slate-800">{yearlyStats.totalYearHours} uur</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-black uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Week</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3 text-center">Diensten</th>
                <th className="py-2.5 px-3 text-right">Totaal Uren</th>
                <th className="py-2.5 px-3 text-center">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {availableWeeksList.map(wNum => {
                const wMeta = getWeekMeta(wNum);
                const isSelected = selectedWeek === wNum;
                const isCurrent = wNum === CURRENT_WEEK_NUMBER;
                const shiftsForW = employeePublishedShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === wNum);
                const hoursForW = Math.round(shiftsForW.reduce((acc, s) => acc + calculateShiftDurationHours(s.startTime, s.endTime, s.day), 0) * 10) / 10;

                return (
                  <tr 
                    key={wNum}
                    onClick={() => setSelectedWeek(wNum)}
                    className={`transition cursor-pointer ${
                      isSelected 
                        ? 'bg-orange-50/80 font-bold' 
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800">Week {wNum}</span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded text-[8px] font-black uppercase">
                            Huidig
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{wMeta.dateRange}</td>
                    <td className="py-3 px-3 text-center text-slate-700 font-bold">{shiftsForW.length}</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`font-black ${hoursForW > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                        {hoursForW} u
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWeek(wNum);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition ${
                          isSelected 
                            ? 'bg-orange-500 text-white shadow-2xs' 
                            : 'bg-slate-100 hover:bg-orange-100 text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Geselecteerd' : 'Bekijk'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
