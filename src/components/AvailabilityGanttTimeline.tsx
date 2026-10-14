import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import {
  Clock,
  Calendar,
  Users,
  UtensilsCrossed,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Filter,
  Plus,
  Trash2,
  Edit,
  Layers,
  BarChart3,
  Moon,
  Sun,
  ShieldCheck,
  CheckCheck,
  Zap,
  UserCheck,
  UserX,
  AlertTriangle,
  Info,
  CalendarCheck2
} from 'lucide-react';
import { Employee, Shift, Department, EmployeeStatuut, EmployeeAvailability, DayAvailability } from '../types';
import { getWeekMeta, CURRENT_WEEK_NUMBER, getDayDateInfo, getEffectiveEmployeeAvailability } from '../utils/weekUtils';
import { timeStringToDecimalHours, calculateShiftDurationHours, isMinorStudent } from '../utils/employeeAgeUtils';
import { sortEmployeesByDayAvailability, deduplicateEmployees, canEmployeeWorkSluitOrHulpsluit } from '../utils/employeeSortUtils';

export interface AvailabilityGanttTimelineProps {
  shifts: Shift[];
  employees: Employee[];
  selectedWeek: number;
  availabilities: EmployeeAvailability[];
  onSelectWeek?: (week: number) => void;
  onOpenShiftModal?: (shiftOrNew?: Partial<Shift>) => void;
  onQuickCreateShift?: (shiftData: Partial<Shift>) => void;
  onDeleteShift?: (shiftId: string) => void;
  onSwitchToScheduleView?: () => void;
}

const DAYS_OF_WEEK = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

// Timeline boundaries: 10:00 to 02:30 (next day, i.e. 26.5 decimal)
const TIMELINE_START = 10.0;
const TIMELINE_END = 27.0; // 03:00 to give breathing room for 02:30 closing shifts
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START;

// Hours for the timeline ruler and chart (10:00 to 02:00)
const RULER_HOURS = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
];

function formatHourLabel(h: number): string {
  if (h === 24) return '00:00';
  if (h === 25) return '01:00';
  if (h === 26) return '02:00';
  if (h === 27) return '03:00';
  return `${h.toString().padStart(2, '0')}:00`;
}

export default function AvailabilityGanttTimeline({
  shifts,
  employees: rawEmployees,
  selectedWeek,
  availabilities = [],
  onSelectWeek,
  onOpenShiftModal,
  onQuickCreateShift,
  onDeleteShift,
  onSwitchToScheduleView
}: AvailabilityGanttTimelineProps) {
  const employees = useMemo(() => deduplicateEmployees(rawEmployees), [rawEmployees]);
  
  // Selected day tab (0=Maandag ... 6=Zondag, or 'week')
  const [selectedDay, setSelectedDay] = useState<number | 'week'>(() => {
    const today = new Date().getDay();
    const mappedDay = today === 0 ? 6 : today - 1; // 0=Maandag ... 6=Zondag
    return mappedDay >= 0 && mappedDay <= 6 ? mappedDay : 0;
  });

  // Filters
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'all' | Department>('all');
  const [selectedStatuutFilter, setSelectedStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  const [scheduledFilter, setScheduledFilter] = useState<'all' | 'unscheduled_only' | 'scheduled_only'>('all');
  const [chartViewType, setChartViewType] = useState<'stacked' | 'area'>('stacked');
  const [hoveredEmpId, setHoveredEmpId] = useState<string | null>(null);

  const weekMeta = useMemo(() => getWeekMeta(selectedWeek), [selectedWeek]);

  // All shifts belonging to the active week
  const weekShifts = useMemo(() => {
    return shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
  }, [shifts, selectedWeek]);

  // Target requirements per day according to In De Molen standard rules
  const getDailyTargetStaff = (dayIdx: number, hour: number) => {
    if (hour < 16) return 2; // Daytime: 2 staff members
    if (dayIdx <= 1) return 4; // Ma-Di: 4 staff
    if (dayIdx <= 3) return 5; // Wo-Do: 5 staff
    return 7; // Vr-Za-Zo: 7 staff
  };

  // Compute availability window for an employee on a given day
  const getEmployeeDayWindow = (emp: Employee, dayIdx: number) => {
    const eff = getEffectiveEmployeeAvailability(emp, selectedWeek, availabilities);
    const dayAvail = eff.availability?.days?.find(d => d.day === dayIdx);
    
    const isAvail = dayAvail && (dayAvail.status === 'available' || dayAvail.status === 'preferred');
    const isPreferred = dayAvail?.status === 'preferred';
    const isUnavailable = dayAvail?.status === 'unavailable';

    // Start time resolution
    let startStr = dayAvail?.startTime || (dayIdx === 6 ? '10:00' : dayIdx >= 4 ? '11:00' : '16:00');
    if (!dayAvail?.startTime) {
      if (emp.statuut === 'Vast') startStr = '11:00';
      else startStr = '16:00';
    }

    // End time resolution
    let endStr = dayAvail?.endTime || 'Sluit';
    if (isMinorStudent(emp)) {
      endStr = '23:00'; // Belgian law: no minor work past 23:00
    }

    const startDec = timeStringToDecimalHours(startStr, false, dayIdx, dayAvail?.notes);
    let endDec = timeStringToDecimalHours(endStr, true, dayIdx, dayAvail?.notes);
    if (isMinorStudent(emp) && endDec > 23.0) {
      endDec = 23.0;
    }

    // Existing shifts for this employee on this day
    const empDayShifts = weekShifts.filter(s => s.employeeId === emp.id && s.day === dayIdx);
    const isScheduled = empDayShifts.length > 0;

    const canClose = canEmployeeWorkSluitOrHulpsluit(emp, dayAvail);

    return {
      isAvail: !!isAvail,
      isPreferred,
      isUnavailable,
      dayAvail,
      startStr,
      endStr,
      startDec,
      endDec,
      empDayShifts,
      isScheduled,
      canClose,
      notes: dayAvail?.notes || ''
    };
  };

  // Recharts Hourly Available Staffing Capacity data
  const hourlyAvailabilityData = useMemo(() => {
    const dayIndex = typeof selectedDay === 'number' ? selectedDay : 4; // default to Friday if week overview

    return RULER_HOURS.map(hour => {
      const hourStart = hour;
      const hourEnd = hour + 1;

      // Find all employees available covering this hour
      const availableEmployeesThisHour = employees.filter(emp => {
        if (emp.id === 'emp1' && emp.role === 'beheerder') return false; // Exclude pure admin unless staff
        if (selectedDeptFilter !== 'all' && emp.department !== selectedDeptFilter) return false;
        if (selectedStatuutFilter !== 'all' && emp.statuut !== selectedStatuutFilter) return false;

        const info = getEmployeeDayWindow(emp, dayIndex);
        if (!info.isAvail) return false;

        return info.startDec < hourEnd && info.endDec > hourStart;
      });

      // Split into: ALREADY SCHEDULED this hour vs STILL FREE (available to schedule)
      const scheduledThisHour = availableEmployeesThisHour.filter(emp => {
        const empShifts = weekShifts.filter(s => s.employeeId === emp.id && s.day === dayIndex);
        return empShifts.some(s => {
          const sStart = timeStringToDecimalHours(s.startTime, false, dayIndex, s.notes);
          const sEnd = timeStringToDecimalHours(s.endTime, true, dayIndex, s.notes);
          return sStart < hourEnd && sEnd > hourStart;
        });
      });

      const freeToScheduleThisHour = availableEmployeesThisHour.filter(emp => {
        return !scheduledThisHour.some(sEmp => sEmp.id === emp.id);
      });

      const target = getDailyTargetStaff(dayIndex, hour);
      const totalAvailable = availableEmployeesThisHour.length;
      const scheduledCount = scheduledThisHour.length;
      const freeCount = freeToScheduleThisHour.length;

      return {
        hour,
        label: formatHourLabel(hour),
        displayRange: `${formatHourLabel(hour)} - ${formatHourLabel(hour + 1)}`,
        totalAvailable,
        scheduledCount,
        freeCount,
        target,
        deficit: Math.max(0, target - scheduledCount),
        availableStaff: availableEmployeesThisHour.map(e => {
          const isSched = scheduledThisHour.some(s => s.id === e.id);
          const s = weekShifts.find(sh => sh.employeeId === e.id && sh.day === dayIndex);
          return {
            id: e.id,
            name: e.name,
            statuut: e.statuut,
            department: e.department,
            isScheduled: isSched,
            shiftTimes: s ? `${s.startTime}-${s.endTime}` : null
          };
        })
      };
    });
  }, [employees, weekShifts, selectedDay, selectedDeptFilter, selectedStatuutFilter, availabilities]);

  // Overall Statistics for this day
  const dayStats = useMemo(() => {
    const dayIndex = typeof selectedDay === 'number' ? selectedDay : 4;
    let availableCount = 0;
    let scheduledCount = 0;
    let closingCount = 0;
    let totalAvailHours = 0;

    employees.forEach(emp => {
      if (emp.id === 'emp1' && emp.role === 'beheerder') return;
      if (selectedDeptFilter !== 'all' && emp.department !== selectedDeptFilter) return;
      if (selectedStatuutFilter !== 'all' && emp.statuut !== selectedStatuutFilter) return;

      const info = getEmployeeDayWindow(emp, dayIndex);
      if (info.isAvail) {
        availableCount++;
        totalAvailHours += Math.max(0, info.endDec - info.startDec);
        if (info.isScheduled) scheduledCount++;
        if (info.canClose) closingCount++;
      }
    });

    return {
      availableCount,
      scheduledCount,
      unscheduledCount: Math.max(0, availableCount - scheduledCount),
      closingCount,
      totalAvailHours: Math.round(totalAvailHours)
    };
  }, [employees, weekShifts, selectedDay, selectedDeptFilter, selectedStatuutFilter, availabilities]);

  // Employees to render in the Gantt Rows
  const ganttRows = useMemo(() => {
    const dayIndex = typeof selectedDay === 'number' ? selectedDay : 4;

    // Filter employees
    const filtered = employees.filter(emp => {
      if (emp.id === 'emp1' && emp.role === 'beheerder') return false;
      if (selectedDeptFilter !== 'all' && emp.department !== selectedDeptFilter) return false;
      if (selectedStatuutFilter !== 'all' && emp.statuut !== selectedStatuutFilter) return false;

      const info = getEmployeeDayWindow(emp, dayIndex);

      if (scheduledFilter === 'unscheduled_only') {
        return info.isAvail && !info.isScheduled;
      }
      if (scheduledFilter === 'scheduled_only') {
        return info.isScheduled;
      }

      // Default: show all available, or with preference
      return info.isAvail || info.empDayShifts.length > 0;
    });

    // Sort using the manager's hierarchy:
    // 1. Vast
    // 2. Sluit of hulpsluit
    // 3. Flexi
    // 4. Student
    // 5. Extra
    return sortEmployeesByDayAvailability(filtered, dayIndex, selectedWeek, availabilities);
  }, [employees, selectedDay, selectedWeek, availabilities, selectedDeptFilter, selectedStatuutFilter, scheduledFilter, weekShifts]);

  // Handler: Direct quick 1-click draft shift creation
  const handleQuickAdd = (emp: Employee, dayIdx: number, defaultStart: string, defaultEnd: string) => {
    if (onQuickCreateShift) {
      onQuickCreateShift({
        employeeId: emp.id,
        day: dayIdx,
        weekNumber: selectedWeek,
        department: emp.department || 'zaal',
        startTime: defaultStart,
        endTime: defaultEnd,
        status: 'draft',
        acknowledged: false,
        role: emp.department === 'keuken' ? 'Keuken' : 'Zaal'
      });
    } else if (onOpenShiftModal) {
      onOpenShiftModal({
        employeeId: emp.id,
        day: dayIdx,
        weekNumber: selectedWeek,
        department: emp.department || 'zaal',
        startTime: defaultStart,
        endTime: defaultEnd,
        status: 'draft',
        acknowledged: false,
        role: emp.department === 'keuken' ? 'Keuken' : 'Zaal'
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6 font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <CalendarCheck2 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Beschikbaarheden Tijdlijn & Roosterplanner
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Direct Inplannen
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Week {selectedWeek} ({weekMeta.dateRange}) • Bekijk wanneer medewerkers kunnen werken en plan met één klik diensten in
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {onSelectWeek && (
            <div className="flex items-center bg-slate-100 rounded-xl p-1 text-slate-700">
              <button
                type="button"
                onClick={() => onSelectWeek(Math.max(1, selectedWeek - 1))}
                className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Vorige week"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black px-2.5 uppercase tracking-tight">
                Week {selectedWeek}
              </span>
              <button
                type="button"
                onClick={() => onSelectWeek(selectedWeek + 1)}
                className="p-1 rounded-lg hover:bg-white text-slate-600 hover:text-slate-900 transition cursor-pointer"
                title="Volgende week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {onSwitchToScheduleView && (
            <button
              type="button"
              onClick={onSwitchToScheduleView}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs uppercase tracking-tight rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Schakel naar de weergave met alleen ingeplande diensten"
            >
              <BarChart3 size={15} className="text-indigo-600" />
              <span>Rooster Tijdlijn</span>
            </button>
          )}

          {onOpenShiftModal && (
            <button
              type="button"
              onClick={() => {
                onOpenShiftModal({
                  weekNumber: selectedWeek,
                  day: typeof selectedDay === 'number' ? selectedDay : 4,
                  department: selectedDeptFilter === 'all' ? 'zaal' : selectedDeptFilter,
                  status: 'draft',
                  acknowledged: false
                });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-95 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} className="stroke-[3]" />
              <span>Handmatig Inplannen</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Day Selector Tabs (Maandag t/m Zondag + Hele Week) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {DAYS_OF_WEEK.map((dayName, idx) => {
          const dayDateInfo = getDayDateInfo(selectedWeek, idx);
          
          // Count available vs scheduled on this day
          let availCount = 0;
          let schedCount = 0;
          employees.forEach(emp => {
            if (emp.id === 'emp1' && emp.role === 'beheerder') return;
            const w = getEmployeeDayWindow(emp, idx);
            if (w.isAvail) {
              availCount++;
              if (w.isScheduled) schedCount++;
            }
          });

          const isSelected = selectedDay === idx;
          const isComplete = schedCount >= 4; // evening requirement

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDay(idx)}
              className={`px-3 py-2 rounded-2xl flex flex-col items-start min-w-[110px] border transition cursor-pointer shrink-0 text-left ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-amber-500/40'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {dayName.slice(0, 2)}
                </span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {dayDateInfo.shortDate}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                  isSelected 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-amber-100 text-amber-950 border border-amber-200'
                }`} title={`${availCount} medewerkers beschikbaar`}>
                  {availCount} vrij
                </span>
                <span className={`text-[9.5px] font-bold ${isSelected ? 'text-slate-300' : 'text-slate-500'}`} title={`${schedCount} reeds ingepland`}>
                  ({schedCount} pl)
                </span>
              </div>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setSelectedDay('week')}
          className={`px-3 py-2 rounded-2xl flex flex-col items-start min-w-[110px] border transition cursor-pointer shrink-0 text-left ${
            selectedDay === 'week'
              ? 'bg-purple-900 text-white border-purple-900 shadow-sm ring-2 ring-purple-400/40'
              : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] font-black uppercase tracking-tight">Hele Week</span>
            <Layers size={13} className="text-purple-400" />
          </div>
          <span className="text-[10px] font-bold mt-1 text-purple-200">
            Alle 7 Dagen
          </span>
        </button>
      </div>

      {/* 3. Filter Bar & Quick Stats */}
      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold text-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedDeptFilter('all')}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-tight transition cursor-pointer ${
                selectedDeptFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Alles
            </button>
            <button
              type="button"
              onClick={() => setSelectedDeptFilter('zaal')}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-tight transition cursor-pointer ${
                selectedDeptFilter === 'zaal' ? 'bg-orange-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Zaal
            </button>
            <button
              type="button"
              onClick={() => setSelectedDeptFilter('keuken')}
              className={`px-2.5 py-1 rounded-lg uppercase tracking-tight transition cursor-pointer ${
                selectedDeptFilter === 'keuken' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Keuken
            </button>
          </div>

          {/* Statuut */}
          <select
            value={selectedStatuutFilter}
            onChange={(e) => setSelectedStatuutFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">Alle Statuten</option>
            <option value="Vast">Vast</option>
            <option value="Flexi">Flexi</option>
            <option value="Student">Student</option>
            <option value="Extra">Extra</option>
          </select>

          {/* Planning Status Filter (Belangrijk voor plannen!) */}
          <select
            value={scheduledFilter}
            onChange={(e) => setScheduledFilter(e.target.value as any)}
            className="bg-white border border-amber-300 rounded-xl px-2.5 py-1 text-xs font-bold text-amber-950 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">Iedereen tonen</option>
            <option value="unscheduled_only">⏳ Alleen NOG VRIJ om in te plannen</option>
            <option value="scheduled_only">✅ Alleen reeds ingepland</option>
          </select>

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold text-slate-700 shadow-2xs hidden sm:flex">
            <button
              type="button"
              onClick={() => setChartViewType('stacked')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                chartViewType === 'stacked' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Gestapeld staafdiagram (Ingepland vs Vrij)"
            >
              Staafdiagram
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('area')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                chartViewType === 'area' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Vloeiend vlakdiagram"
            >
              Vlakdiagram
            </button>
          </div>
        </div>

        {/* Quick KPI stats for this day */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Users size={14} className="text-amber-600" />
            <span className="font-bold">Beschikbaar:</span>
            <span className="font-black text-slate-900">{dayStats.availableCount} pers.</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300">
            <CheckCircle2 size={12} className="text-emerald-700" />
            <span>Ingepland: {dayStats.scheduledCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-950 border border-amber-300">
            <Sparkles size={12} className="text-amber-700" />
            <span>Nog te plannen: {dayStats.unscheduledCount}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-indigo-100 text-indigo-950 border border-indigo-300">
            <ShieldCheck size={12} className="text-indigo-700" />
            <span>Sluitkrachten: {dayStats.closingCount}</span>
          </div>
        </div>
      </div>

      {/* 4. VISUAL PART 1: RECHARTS HOURLY AVAILABILITY CAPACITY (CAPACITEIT PER UUR) */}
      <div className="bg-amber-50/40 rounded-3xl p-4 sm:p-5 border border-amber-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-amber-950 tracking-tight flex items-center gap-2">
              <span>Beschikbaarheidscapaciteit per Uur (10:00 - 02:00)</span>
              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                Recharts Tijdreeks
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 font-medium">
              Toont hoeveel personeelsleden er per uur beschikbaar zijn, hoeveel er al zijn ingepland, en hoeveel extra krachten je nog kunt inzetten.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
              <span>Reeds Ingepland</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
              <span>Nog Vrij om in te plannen</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-500 inline-block" />
              <span>Doelbezetting (Norm)</span>
            </div>
          </div>
        </div>

        {/* Recharts Component */}
        <div className="h-56 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartViewType === 'stacked' ? (
              <BarChart data={hourlyAvailabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#78350f' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#78350f' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHourlyAvailabilityTooltip />} />
                <ReferenceLine 
                  y={typeof selectedDay === 'number' && selectedDay <= 1 ? 4 : 5} 
                  stroke="#9a3412" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Avondnorm', position: 'top', fill: '#9a3412', fontSize: 9, fontWeight: 700 }} 
                />
                <Bar dataKey="scheduledCount" stackId="a" fill="#16a34a" radius={[0, 0, 0, 0]} name="Ingepland" />
                <Bar dataKey="freeCount" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Nog Vrij" />
              </BarChart>
            ) : (
              <AreaChart data={hourlyAvailabilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalAvail" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#78350f' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#78350f' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHourlyAvailabilityTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="totalAvailable" 
                  stroke="#d97706" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorTotalAvail)" 
                  name="Totaal Beschikbaar"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. VISUAL PART 2: GANTT-STIJL BESCHIKBAARHEDEN TIJDLIJN MET DIRECTE INPLANKNOP */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-2">
              <span>Gantt Beschikbaarheid per Medewerker & Direct Inplannen</span>
              <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                {ganttRows.length} teamleden getoond
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Vaste medewerkers bovenaan, daarna wie kan sluiten/hulpsluiten, flexi's en studenten. Klik op een balk of knop om direct in te plannen.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-200 border border-amber-400" />
              <span>Beschikbaar Tijdvenster</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-600 text-white" />
              <span>Al Ingeplande Shift</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-500 bg-amber-100" />
              <span>Concept Shift</span>
            </span>
          </div>
        </div>

        {/* Gantt View Container with Horizontal Scroll if needed */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto min-w-[840px]">
            {/* Timeline Header Ruler (Hours 10:00 to 02:00) */}
            <div className="flex border-b border-slate-200 bg-slate-100/90 sticky top-0 z-10 text-[10.5px] font-black text-slate-700 uppercase">
              {/* Left Column Label */}
              <div className="w-64 min-w-[250px] max-w-[250px] p-3 border-r border-slate-200 shrink-0 bg-slate-100 flex items-center justify-between">
                <span>Medewerker & Inplannen</span>
                <Users size={14} className="text-slate-400" />
              </div>

              {/* Time Ruler Columns */}
              <div className="flex-1 grid grid-cols-17 relative">
                {RULER_HOURS.map((h) => (
                  <div 
                    key={h} 
                    className={`py-3 px-1 text-center border-r border-slate-200/80 last:border-r-0 truncate ${
                      h >= 16 && h < 24 ? 'bg-amber-50/50 text-amber-950 font-black' : h >= 24 ? 'bg-indigo-50/60 text-indigo-950 font-black' : ''
                    }`}
                  >
                    <span>{formatHourLabel(h)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gantt Rows */}
            {ganttRows.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <Users size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-bold text-slate-600">
                  Geen medewerkers gevonden die voldoen aan de geselecteerde filters.
                </p>
                <p className="text-[11px] text-slate-400">
                  Kies een andere dag of selecteer "Iedereen tonen".
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ganttRows.map((emp) => {
                  const dayIdx = typeof selectedDay === 'number' ? selectedDay : 4;
                  const windowInfo = getEmployeeDayWindow(emp, dayIdx);
                  const isMinor = isMinorStudent(emp);
                  const isHovered = hoveredEmpId === emp.id;

                  // Convert availability window to % positions
                  const availStart = Math.max(TIMELINE_START, windowInfo.startDec);
                  const availEnd = Math.min(TIMELINE_END, windowInfo.endDec);
                  const availDuration = Math.max(0.5, availEnd - availStart);
                  const availLeftPct = ((availStart - TIMELINE_START) / TOTAL_HOURS) * 100;
                  const availWidthPct = Math.max(3, (availDuration / TOTAL_HOURS) * 100);

                  return (
                    <div
                      key={emp.id}
                      onMouseEnter={() => setHoveredEmpId(emp.id)}
                      onMouseLeave={() => setHoveredEmpId(null)}
                      className={`flex items-center transition-colors ${
                        isHovered ? 'bg-orange-50/40' : 'hover:bg-slate-50/60'
                      }`}
                    >
                      {/* Left Column: Employee details + Action button */}
                      <div className="w-64 min-w-[250px] max-w-[250px] p-3 border-r border-slate-100 shrink-0 bg-white space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-950 font-black text-xs flex items-center justify-center shrink-0">
                              {emp.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-black text-xs text-slate-900 truncate block">
                                {emp.name}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                  emp.statuut === 'Vast'
                                    ? 'bg-indigo-100 text-indigo-900'
                                    : emp.statuut === 'Flexi'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {emp.statuut}
                                </span>
                                {windowInfo.canClose && (
                                  <span className="text-[8.5px] font-black uppercase px-1 py-0.2 rounded bg-purple-100 text-purple-900 border border-purple-200">
                                    Sluit
                                  </span>
                                )}
                                {isMinor && (
                                  <span className="text-[8.5px] font-black uppercase px-1 py-0.2 rounded bg-rose-100 text-rose-900" title="Minderjarig student: max tot 23:00">
                                    &lt;18
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Plan Button */}
                          {!windowInfo.isScheduled ? (
                            <button
                              type="button"
                              onClick={() => {
                                if (onOpenShiftModal) {
                                  onOpenShiftModal({
                                    employeeId: emp.id,
                                    day: dayIdx,
                                    weekNumber: selectedWeek,
                                    department: emp.department || 'zaal',
                                    startTime: windowInfo.startStr,
                                    endTime: windowInfo.endStr,
                                    status: 'draft',
                                    acknowledged: false,
                                    role: emp.department === 'keuken' ? 'Keuken' : 'Zaal'
                                  });
                                }
                              }}
                              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-[10.5px] uppercase tracking-tight rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                              title={`Plan direct een dienst in voor ${emp.name} (${windowInfo.startStr} - ${windowInfo.endStr})`}
                            >
                              <Plus size={13} className="stroke-[3]" />
                              <span>Plan In</span>
                            </button>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg text-[9.5px] font-black uppercase bg-emerald-100 text-emerald-950 border border-emerald-300 shrink-0">
                              ✓ Ingepland
                            </span>
                          )}
                        </div>

                        {/* Notes or timing detail */}
                        {windowInfo.notes ? (
                          <p className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 truncate" title={windowInfo.notes}>
                            💬 {windowInfo.notes}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 font-medium truncate">
                            Vrij: {windowInfo.startStr} - {windowInfo.endStr}
                          </p>
                        )}
                      </div>

                      {/* Right Timeline Grid: Availability Window + Active Shifts */}
                      <div className="flex-1 h-14 relative flex items-center overflow-hidden">
                        {/* 17 hour grid guidelines */}
                        <div className="absolute inset-0 grid grid-cols-17 pointer-events-none">
                          {RULER_HOURS.map((h) => (
                            <div 
                              key={h} 
                              className={`border-r border-slate-100 last:border-r-0 ${
                                h >= 16 && h < 24 ? 'bg-amber-50/20' : h >= 24 ? 'bg-indigo-50/25' : ''
                              }`} 
                            />
                          ))}
                        </div>

                        {/* 1. Availability Window Bar (Background) */}
                        {windowInfo.isAvail && (
                          <div
                            onClick={() => {
                              if (!windowInfo.isScheduled && onOpenShiftModal) {
                                onOpenShiftModal({
                                  employeeId: emp.id,
                                  day: dayIdx,
                                  weekNumber: selectedWeek,
                                  department: emp.department || 'zaal',
                                  startTime: windowInfo.startStr,
                                  endTime: windowInfo.endStr,
                                  status: 'draft',
                                  acknowledged: false,
                                  role: emp.department === 'keuken' ? 'Keuken' : 'Zaal'
                                });
                              }
                            }}
                            style={{
                              left: `${availLeftPct}%`,
                              width: `${availWidthPct}%`
                            }}
                            className={`absolute h-10 rounded-2xl flex items-center justify-between px-3 border transition cursor-pointer select-none ${
                              windowInfo.isScheduled
                                ? 'bg-amber-50/50 border-amber-200/60 opacity-60'
                                : 'bg-gradient-to-r from-amber-100/90 to-orange-100/90 border-2 border-dashed border-amber-400 hover:border-orange-500 hover:bg-amber-100 hover:shadow-sm'
                            }`}
                            title={`Beschikbaar: ${windowInfo.startStr} tot ${windowInfo.endStr} • Klik om direct een shift in te plannen voor ${emp.name}`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Sparkles size={12} className="text-amber-700 shrink-0" />
                              <span className="text-[10px] font-black text-amber-950 truncate">
                                Beschikbaar: {windowInfo.startStr} - {windowInfo.endStr}
                              </span>
                            </div>

                            {!windowInfo.isScheduled && (
                              <span className="text-[9.5px] font-black uppercase text-orange-700 bg-white/80 px-2 py-0.5 rounded-lg shadow-2xs border border-orange-200 hidden sm:inline">
                                + Klik om in te plannen
                              </span>
                            )}
                          </div>
                        )}

                        {/* 2. Scheduled Shift Bars on top (Foreground) */}
                        {windowInfo.empDayShifts.map((shift) => {
                          const sStart = timeStringToDecimalHours(shift.startTime, false, shift.day, shift.notes);
                          const sEnd = timeStringToDecimalHours(shift.endTime, true, shift.day, shift.notes);

                          const clampedStart = Math.max(TIMELINE_START, sStart);
                          const clampedEnd = Math.min(TIMELINE_END, sEnd);
                          const durationHours = Math.max(0.5, clampedEnd - clampedStart);

                          const leftPct = ((clampedStart - TIMELINE_START) / TOTAL_HOURS) * 100;
                          const widthPct = Math.max(2.5, (durationHours / TOTAL_HOURS) * 100);

                          const isDraft = shift.status === 'draft';
                          const isKeuken = shift.department === 'keuken';
                          const endLower = (shift.endTime || '').toLowerCase();
                          const isSluit = endLower.includes('sluit') || (shift.notes || '').toLowerCase().includes('sluit');

                          return (
                            <div
                              key={shift.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onOpenShiftModal) onOpenShiftModal(shift);
                              }}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`
                              }}
                              className={`absolute h-9 rounded-xl flex items-center justify-between px-2.5 transition-all shadow-sm cursor-pointer select-none group/shift ${
                                isDraft
                                  ? 'bg-amber-200 text-amber-950 border-2 border-dashed border-amber-500 hover:bg-amber-300'
                                  : isKeuken
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105'
                                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white hover:brightness-105'
                              }`}
                              title={`Ingeplande Dienst: ${shift.startTime} - ${shift.endTime} (${durationHours}u) • ${shift.role || (isKeuken ? 'Keuken' : 'Zaal')}${isDraft ? ' [CONCEPT]' : ''} • Klik om te bewerken`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                                {isKeuken ? (
                                  <Utensils size={12} className="shrink-0 opacity-80" />
                                ) : (
                                  <UtensilsCrossed size={12} className="shrink-0 opacity-80" />
                                )}
                                <span className="text-[11px] font-black truncate leading-none">
                                  {shift.startTime} - {shift.endTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                {isDraft && (
                                  <span className="text-[8.5px] font-black bg-amber-400 text-amber-950 px-1 py-0.2 rounded uppercase">
                                    Concept
                                  </span>
                                )}
                                {isSluit && (
                                  <span className="text-[8.5px] font-black bg-black/20 text-white px-1 py-0.2 rounded uppercase">
                                    Sluit
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom Tooltip component for Recharts Availability
function CustomHourlyAvailabilityTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const staff = data.availableStaff || [];

  return (
    <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-2.5 border border-slate-700 min-w-[240px] max-w-sm font-sans">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2">
        <span className="font-black text-amber-400 uppercase tracking-tight text-[11px]">
          🕒 {data.displayRange}
        </span>
        <span className="font-black text-xs bg-slate-800 px-2 py-0.5 rounded-full">
          {data.totalAvailable} beschikbaar
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/60 p-2 rounded-xl">
        <div className="text-emerald-400 font-bold">
          ✓ Al Ingepland: <strong>{data.scheduledCount}</strong>
        </div>
        <div className="text-amber-400 font-bold">
          ⚡ Nog Vrij: <strong>{data.freeCount}</strong>
        </div>
        <div className="text-slate-300 font-bold">
          Norm: <strong>{data.target}</strong>
        </div>
        <div className={data.scheduledCount >= data.target ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
          {data.scheduledCount >= data.target ? '✓ Norm behaald' : `⚠️ -${data.target - data.scheduledCount} nodig`}
        </div>
      </div>

      {staff.length > 0 ? (
        <div className="space-y-1.5 pt-1 border-t border-slate-800 max-h-40 overflow-y-auto">
          <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
            Beschikbare teamleden dit uur:
          </div>
          {staff.map((s: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <span className="font-bold truncate text-slate-200">
                {s.name} <span className="text-[9.5px] text-slate-400 font-normal">({s.statuut})</span>
              </span>
              <span className={`text-[9.5px] px-1.5 py-0.2 rounded font-black uppercase shrink-0 ml-2 ${
                s.isScheduled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {s.isScheduled ? 'Ingepland' : 'Vrij'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic">Geen medewerkers beschikbaar dit uur.</p>
      )}
    </div>
  );
}
