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
  Maximize2
} from 'lucide-react';
import { Employee, Shift, Department, EmployeeStatuut, EmployeeAvailability } from '../types';
import { getWeekMeta, CURRENT_WEEK_NUMBER, getDayDateInfo } from '../utils/weekUtils';
import { timeStringToDecimalHours, calculateShiftDurationHours, isMinorStudent } from '../utils/employeeAgeUtils';
import { sortEmployeesByDayAvailability, deduplicateEmployees } from '../utils/employeeSortUtils';

export interface ScheduleGanttTimelineProps {
  shifts: Shift[];
  employees: Employee[];
  selectedWeek: number;
  onSelectWeek?: (week: number) => void;
  onOpenShiftModal?: (shiftOrNew?: Partial<Shift>) => void;
  onDeleteShift?: (shiftId: string) => void;
  availabilities?: EmployeeAvailability[];
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

// Hours for the timeline ruler and chart
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

export default function ScheduleGanttTimeline({
  shifts,
  employees: rawEmployees,
  selectedWeek,
  onSelectWeek,
  onOpenShiftModal,
  onDeleteShift,
  availabilities = []
}: ScheduleGanttTimelineProps) {
  const employees = useMemo(() => deduplicateEmployees(rawEmployees), [rawEmployees]);
  const [selectedDay, setSelectedDay] = useState<number | 'week'>(() => {
    // Default to today if possible or Monday (0)
    const today = new Date().getDay();
    const mappedDay = today === 0 ? 6 : today - 1; // 0=Maandag ... 6=Zondag
    return mappedDay >= 0 && mappedDay <= 6 ? mappedDay : 0;
  });

  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'all' | Department>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedStatuutFilter, setSelectedStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  const [chartViewType, setChartViewType] = useState<'stacked' | 'area'>('stacked');
  const [hoveredShiftId, setHoveredShiftId] = useState<string | null>(null);

  const weekMeta = useMemo(() => getWeekMeta(selectedWeek), [selectedWeek]);

  // Shifts in the selected week
  const weekShifts = useMemo(() => {
    return shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
  }, [shifts, selectedWeek]);

  // Target requirements per day according to In De Molen standard rules
  const getDailyTargetStaff = (dayIdx: number, hour: number) => {
    // Daytime (before 16:00): 2 staff members
    if (hour < 16) return 2;
    // Evening (16:00 - 00:00):
    // Ma-Di: 4 | Wo-Do: 5 | Vr-Za-Zo: 7
    if (dayIdx <= 1) return 4;
    if (dayIdx <= 3) return 5;
    return 7;
  };

  // Shifts filtered for current view
  const filteredShifts = useMemo(() => {
    return weekShifts.filter(s => {
      if (selectedDay !== 'week' && s.day !== selectedDay) return false;
      if (selectedDeptFilter !== 'all' && (s.department || 'zaal') !== selectedDeptFilter) return false;
      if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) return false;
      if (selectedStatuutFilter !== 'all') {
        const emp = employees.find(e => e.id === s.employeeId);
        if (emp && emp.statuut !== selectedStatuutFilter) return false;
      }
      return true;
    });
  }, [weekShifts, selectedDay, selectedDeptFilter, selectedStatusFilter, selectedStatuutFilter, employees]);

  // Hourly staffing calculation for Recharts
  const hourlyStaffingData = useMemo(() => {
    const dayIndex = typeof selectedDay === 'number' ? selectedDay : 4; // default to Friday if week overview

    return RULER_HOURS.map(hour => {
      const hourStart = hour;
      const hourEnd = hour + 1;
      const hourMid = hour + 0.5;

      // Find all shifts covering this hour
      const activeShiftsThisHour = weekShifts.filter(s => {
        if (selectedDay !== 'week' && s.day !== selectedDay) return false;
        if (selectedDay === 'week' && s.day !== 4) return false; // In week mode, represent a peak day or average

        const startDec = timeStringToDecimalHours(s.startTime, false, s.day, s.notes);
        const endDec = timeStringToDecimalHours(s.endTime, true, s.day, s.notes);

        return startDec < hourEnd && endDec > hourStart;
      });

      // Filter active shifts according to status if needed
      const applicableShifts = activeShiftsThisHour.filter(s => {
        if (selectedDeptFilter !== 'all' && (s.department || 'zaal') !== selectedDeptFilter) return false;
        if (selectedStatusFilter !== 'all' && s.status !== selectedStatusFilter) return false;
        return true;
      });

      const zaalCount = applicableShifts.filter(s => (s.department || 'zaal') === 'zaal').length;
      const keukenCount = applicableShifts.filter(s => s.department === 'keuken').length;
      const draftCount = applicableShifts.filter(s => s.status === 'draft').length;
      const totalCount = zaalCount + keukenCount;

      const activeEmployeeNames = applicableShifts.map(s => {
        const emp = employees.find(e => e.id === s.employeeId);
        return {
          name: emp ? emp.name : 'Onbekend',
          role: s.role || (s.department === 'keuken' ? 'Keuken' : 'Zaal'),
          statuut: emp?.statuut || 'Student',
          startTime: s.startTime,
          endTime: s.endTime,
          isDraft: s.status === 'draft'
        };
      });

      const target = getDailyTargetStaff(dayIndex, hour);

      return {
        hour,
        label: formatHourLabel(hour),
        displayRange: `${formatHourLabel(hour)} - ${formatHourLabel(hour + 1)}`,
        zaal: zaalCount,
        keuken: keukenCount,
        total: totalCount,
        draftCount,
        target,
        deficit: Math.max(0, target - totalCount),
        staff: activeEmployeeNames
      };
    });
  }, [weekShifts, selectedDay, selectedDeptFilter, selectedStatusFilter, employees]);

  // Peak staffing statistics
  const staffingStats = useMemo(() => {
    let peakStaff = 0;
    let peakHour = '19:00';
    let totalScheduledHours = 0;
    let sluitCount = 0;
    let hulpsluitCount = 0;

    hourlyStaffingData.forEach(d => {
      if (d.total > peakStaff) {
        peakStaff = d.total;
        peakHour = d.label;
      }
    });

    filteredShifts.forEach(s => {
      totalScheduledHours += calculateShiftDurationHours(s.startTime, s.endTime, s.day, s.notes);
      const endLower = (s.endTime || '').toLowerCase();
      const notesLower = (s.notes || '').toLowerCase();
      if (endLower.includes('hulpsluit') || notesLower.includes('hulpsluit') || endLower.startsWith('hulp')) {
        hulpsluitCount++;
      } else if (endLower.includes('sluit') || notesLower.includes('sluit')) {
        sluitCount++;
      }
    });

    return {
      peakStaff,
      peakHour,
      totalScheduledHours: Math.round(totalScheduledHours * 10) / 10,
      shiftsCount: filteredShifts.length,
      sluitCount,
      hulpsluitCount
    };
  }, [hourlyStaffingData, filteredShifts]);

  // Scheduled employees for the Gantt rows (ordered Vast -> Closing -> Flexi -> Student)
  const ganttRows = useMemo(() => {
    if (selectedDay === 'week') {
      // Group shifts across week or show scheduled employees
      const activeEmployeeIds = Array.from(new Set(filteredShifts.map(s => s.employeeId)));
      const scheduledEmps = employees.filter(e => activeEmployeeIds.includes(e.id));
      return sortEmployeesByDayAvailability(scheduledEmps, 4, selectedWeek, availabilities);
    }

    const scheduledEmpsThisDay = employees.filter(emp =>
      filteredShifts.some(s => s.employeeId === emp.id)
    );

    // Sort using the user's desired hierarchy: Vast -> Sluit/Hulpsluit -> Flexi -> Student
    return sortEmployeesByDayAvailability(scheduledEmpsThisDay, selectedDay, selectedWeek, availabilities);
  }, [filteredShifts, employees, selectedDay, selectedWeek, availabilities]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6 font-sans">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <BarChart3 size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase">
                  Rooster Tijdlijn & Bezetting per Uur
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200">
                  Gantt-Visualisatie
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Week {selectedWeek} ({weekMeta.dateRange}) • Direct inzicht in piekmomenten, zaal & keukenbezetting
              </p>
            </div>
          </div>
        </div>

        {/* Week Switcher & Action buttons */}
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
              className="px-3 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>Dienst Inplannen</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Day Selector Tabs (Maandag t/m Zondag + Hele Week) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {DAYS_OF_WEEK.map((dayName, idx) => {
          const dayDateInfo = getDayDateInfo(selectedWeek, idx);
          const dayShifts = weekShifts.filter(s => s.day === idx);
          const hasDraft = dayShifts.some(s => s.status === 'draft');
          const isSelected = selectedDay === idx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDay(idx)}
              className={`px-3 py-2 rounded-2xl flex flex-col items-start min-w-[105px] border transition cursor-pointer shrink-0 text-left ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-orange-500/30'
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
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                  isSelected 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {dayShifts.length} sh
                </span>
                {hasDraft && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Bevat concept-diensten" />
                )}
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

          {/* Status */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer shadow-2xs"
          >
            <option value="all">Alle Statussen</option>
            <option value="published">🟢 Gepubliceerd</option>
            <option value="draft">🟡 Concept / Ontwerp</option>
          </select>

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

          {/* Chart Type Toggle */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-bold text-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setChartViewType('stacked')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                chartViewType === 'stacked' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Gestapeld staafdiagram (Zaal + Keuken)"
            >
              Staafdiagram
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('area')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                chartViewType === 'area' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Vloeiend vlakkendiagram"
            >
              Vlakdiagram
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 text-slate-700">
            <TrendingUp size={14} className="text-orange-600" />
            <span className="font-bold">Piek:</span>
            <span className="font-black text-slate-900">{staffingStats.peakStaff} pers.</span>
            <span className="text-slate-400">({staffingStats.peakHour})</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700">
            <Clock size={14} className="text-indigo-600" />
            <span className="font-bold">Totaal:</span>
            <span className="font-black text-slate-900">{staffingStats.totalScheduledHours}u</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300">
            <ShieldCheck size={12} className="text-emerald-700" />
            <span>Sluit: {staffingStats.sluitCount} · Hulp: {staffingStats.hulpsluitCount}</span>
          </div>
        </div>
      </div>

      {/* 4. VISUAL PART 1: RECHARTS HOURLY STAFFING DISTRIBUTION (BEZETTING PER UUR) */}
      <div className="bg-slate-50/70 rounded-3xl p-4 sm:p-5 border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-2">
              <span>Bezetting per Uur (Aanwezige Medewerkers)</span>
              <span className="text-[10px] text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full font-bold">
                Recharts Tijdreeks
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Toont het exacte aantal ingeplande personeelsleden voor elk uur van de dag (10:00 - 02:00).
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-600 inline-block" />
              <span>Zaal</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
              <span>Keuken</span>
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
              <BarChart data={hourlyStaffingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHourlyTooltip />} />
                <ReferenceLine 
                  y={typeof selectedDay === 'number' && selectedDay <= 1 ? 4 : 5} 
                  stroke="#94a3b8" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Avondnorm', position: 'top', fill: '#64748b', fontSize: 9, fontWeight: 700 }} 
                />
                <Bar dataKey="zaal" stackId="a" fill="#ea580c" radius={[0, 0, 0, 0]} name="Zaal" />
                <Bar dataKey="keuken" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Keuken" />
              </BarChart>
            ) : (
              <AreaChart data={hourlyStaffingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotalStaff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHourlyTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ea580c" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorTotalStaff)" 
                  name="Totaal Bezetting"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. VISUAL PART 2: GANTT-STIJL TIJDLIJN ROOSTER GRAFIEK */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight flex items-center gap-2">
              <span>Gantt Rooster Tijdlijn per Medewerker</span>
              <span className="text-[10px] text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full font-bold">
                {ganttRows.length} teamleden ingepland
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Vaste medewerkers bovenaan, daarna wie kan sluiten/hulpsluiten, flexi's en studenten.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[10.5px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-orange-500" />
              <span>Zaal</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Keuken</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-dashed border-amber-500 bg-amber-50" />
              <span>Concept (Ontwerp)</span>
            </span>
          </div>
        </div>

        {/* Gantt View Container with Horizontal Scroll if needed */}
        <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs bg-white">
          <div className="overflow-x-auto min-w-[760px]">
            {/* Timeline Header Ruler (Hours 10:00 to 02:00) */}
            <div className="flex border-b border-slate-200 bg-slate-100/80 sticky top-0 z-10 text-[10.5px] font-black text-slate-700 uppercase">
              {/* Left Column Label */}
              <div className="w-56 min-w-[220px] max-w-[220px] p-3 border-r border-slate-200 shrink-0 bg-slate-100 flex items-center justify-between">
                <span>Medewerker & Statuut</span>
                <Users size={14} className="text-slate-400" />
              </div>

              {/* Time Ruler Columns */}
              <div className="flex-1 grid grid-cols-17 relative">
                {RULER_HOURS.map((h, i) => (
                  <div 
                    key={h} 
                    className={`py-3 px-1 text-center border-r border-slate-200/80 last:border-r-0 truncate ${
                      h >= 16 && h < 24 ? 'bg-amber-50/40 text-amber-950' : h >= 24 ? 'bg-indigo-50/50 text-indigo-950 font-black' : ''
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
                <Clock size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-sm font-bold text-slate-700">
                  Geen ingeplande diensten gevonden voor deze selectie.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Pas de filters aan of plan een nieuwe dienst in via de knop hierboven.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ganttRows.map((emp) => {
                  const empShifts = filteredShifts.filter(s => s.employeeId === emp.id);
                  const totalEmpHours = Math.round(
                    empShifts.reduce((acc, s) => acc + calculateShiftDurationHours(s.startTime, s.endTime, s.day, s.notes), 0) * 10
                  ) / 10;

                  return (
                    <div 
                      key={emp.id} 
                      className="flex hover:bg-slate-50/70 transition-colors group relative"
                    >
                      {/* Left: Employee Card */}
                      <div className="w-56 min-w-[220px] max-w-[220px] p-3 border-r border-slate-200 shrink-0 bg-white group-hover:bg-slate-50/90 flex items-center justify-between gap-2 z-1">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Avatar / Initial */}
                          <div 
                            className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 text-white shadow-2xs"
                            style={{ backgroundColor: emp.color || '#ea580c' }}
                          >
                            {emp.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate leading-tight">
                              {emp.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded ${
                                emp.statuut === 'Vast' 
                                  ? 'bg-indigo-100 text-indigo-900' 
                                  : emp.statuut === 'Flexi' 
                                  ? 'bg-teal-100 text-teal-900' 
                                  : 'bg-blue-100 text-blue-900'
                              }`}>
                                {emp.statuut}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold truncate">
                                {emp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Total hours today */}
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-xs text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-lg">
                            {totalEmpHours}u
                          </span>
                        </div>
                      </div>

                      {/* Right: Gantt Bars in Timeline */}
                      <div className="flex-1 relative h-14 bg-slate-50/30 flex items-center">
                        {/* Vertical hour guidelines */}
                        <div className="absolute inset-0 grid grid-cols-17 pointer-events-none">
                          {RULER_HOURS.map((h) => (
                            <div 
                              key={h} 
                              className={`border-r border-slate-200/50 last:border-r-0 ${
                                h >= 16 && h < 24 ? 'bg-amber-500/[0.02]' : h >= 24 ? 'bg-indigo-500/[0.04]' : ''
                              }`} 
                            />
                          ))}
                        </div>

                        {/* Render Shift Bars for this employee */}
                        {empShifts.map((shift) => {
                          const startDec = timeStringToDecimalHours(shift.startTime, false, shift.day, shift.notes);
                          const endDec = timeStringToDecimalHours(shift.endTime, true, shift.day, shift.notes);

                          // Clamp to timeline range
                          const clampedStart = Math.max(TIMELINE_START, startDec);
                          const clampedEnd = Math.min(TIMELINE_END, endDec);
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
                              onClick={() => onOpenShiftModal && onOpenShiftModal(shift)}
                              onMouseEnter={() => setHoveredShiftId(shift.id)}
                              onMouseLeave={() => setHoveredShiftId(null)}
                              style={{
                                left: `${leftPct}%`,
                                width: `${widthPct}%`
                              }}
                              className={`absolute h-9 rounded-xl flex items-center justify-between px-2.5 transition-all shadow-xs cursor-pointer select-none group/bar ${
                                isDraft
                                  ? 'bg-amber-100/90 text-amber-950 border-2 border-dashed border-amber-400 hover:bg-amber-200'
                                  : isKeuken
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105'
                                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:brightness-105'
                              }`}
                              title={`${emp.name}: ${shift.startTime} - ${shift.endTime} (${durationHours}u) • ${shift.role || (isKeuken ? 'Keuken' : 'Zaal')}${isDraft ? ' [CONCEPT]' : ''}`}
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
                                {isSluit && (
                                  <span className="text-[9px] font-black bg-black/20 text-white px-1.5 py-0.2 rounded uppercase">
                                    Sluit
                                  </span>
                                )}
                                {isDraft && (
                                  <span className="text-[8.5px] font-black bg-amber-400 text-amber-950 px-1 py-0.2 rounded uppercase">
                                    Concept
                                  </span>
                                )}
                                <span className="text-[9.5px] font-black opacity-90 hidden sm:inline">
                                  {Math.round(calculateShiftDurationHours(shift.startTime, shift.endTime, shift.day, shift.notes) * 10) / 10}u
                                </span>
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

// Custom Tooltip component for Recharts
function CustomHourlyTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const staff = data.staff || [];

  return (
    <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-2 border border-slate-700 min-w-[210px] max-w-xs font-sans">
      <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
        <span className="font-black text-amber-400 uppercase tracking-tight text-[11px]">
          🕒 {data.displayRange}
        </span>
        <span className="font-black text-xs bg-slate-800 px-2 py-0.5 rounded-full">
          {data.total} {data.total === 1 ? 'medewerker' : 'medewerkers'}
        </span>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
        <span>Zaal: <strong className="text-orange-400">{data.zaal}</strong></span>
        <span>Keuken: <strong className="text-amber-400">{data.keuken}</strong></span>
        <span>Norm: <strong className="text-slate-400">{data.target}</strong></span>
      </div>

      {staff.length > 0 ? (
        <div className="space-y-1 pt-1 border-t border-slate-800 max-h-36 overflow-y-auto">
          <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
            Aanwezige medewerkers:
          </div>
          {staff.map((s: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <span className="font-bold truncate text-slate-200">
                {s.name} <span className="text-[9.5px] text-slate-400 font-normal">({s.statuut})</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                {s.startTime}-{s.endTime}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 italic">Geen medewerkers actief dit uur.</p>
      )}

      {data.total < data.target && (
        <div className="text-[10px] text-rose-300 bg-rose-950/60 p-1.5 rounded-lg border border-rose-800/60 font-bold">
          ⚠️ Onder bezettingsnorm (-{data.target - data.total} medewerkers nodig)
        </div>
      )}
    </div>
  );
}
