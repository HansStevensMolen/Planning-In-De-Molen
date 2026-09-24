import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Filter,
  BarChart3,
  Layers,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  Employee,
  Shift,
  EmployeeAvailability,
  Department,
  EmployeeStatuut
} from '../types';
import {
  getEffectiveEmployeeAvailability,
  getDayDateInfo
} from '../utils/weekUtils';

const DAYS_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const DAYS_FULL = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

interface StaffAvailabilityChartProps {
  employees: Employee[];
  shifts: Shift[];
  availabilities: EmployeeAvailability[];
  weekNumber: number;
  onSelectEmployeeDetail?: (employee: Employee, weekNumber: number) => void;
  className?: string;
}

type ChartViewType = 'status' | 'department' | 'coverage';

export default function StaffAvailabilityChart({
  employees,
  shifts,
  availabilities,
  weekNumber,
  onSelectEmployeeDetail,
  className = ''
}: StaffAvailabilityChartProps) {
  // Chart view modes
  const [viewType, setChartViewType] = useState<ChartViewType>('status');
  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');
  const [statuutFilter, setStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  // Selected day for drill-down inspection (0 = Maandag, ..., 6 = Zondag, or null)
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  // Relevant active staff (excluding pure manager hans emp1 unless desired)
  const relevantEmployees = useMemo(() => {
    return employees.filter(e => {
      if (e.id === 'emp1' && e.role === 'beheerder') return false; // Hans Stevens
      if (!e.active) return false;
      if (departmentFilter !== 'all' && e.department !== departmentFilter) return false;
      if (statuutFilter !== 'all' && e.statuut !== statuutFilter) return false;
      return true;
    });
  }, [employees, departmentFilter, statuutFilter]);

  // Aggregate day-by-day availability and scheduled shifts
  const chartData = useMemo(() => {
    return DAYS_SHORT.map((shortDay, dayIdx) => {
      const dateInfo = getDayDateInfo(weekNumber, dayIdx);

      const availableList: {
        emp: Employee;
        status: 'available' | 'preferred';
        notes?: string;
        time?: string;
        source: 'weekly' | 'recurring';
      }[] = [];

      const unavailableList: {
        emp: Employee;
        notes?: string;
        source: 'weekly' | 'recurring';
      }[] = [];

      const unsubmittedList: Employee[] = [];

      // Calculate availability for each employee on this day
      relevantEmployees.forEach(emp => {
        const effective = getEffectiveEmployeeAvailability(emp, weekNumber, availabilities);
        const dayAvail = effective.availability?.days?.find(d => d.day === dayIdx);

        if (!dayAvail) {
          unsubmittedList.push(emp);
          return;
        }

        if (dayAvail.status === 'available') {
          availableList.push({
            emp,
            status: 'available',
            notes: dayAvail.notes,
            time: dayAvail.startTime && dayAvail.endTime ? `${dayAvail.startTime} - ${dayAvail.endTime}` : undefined,
            source: effective.source === 'recurring' ? 'recurring' : 'weekly'
          });
        } else if (dayAvail.status === 'preferred') {
          availableList.push({
            emp,
            status: 'preferred',
            notes: dayAvail.notes,
            time: dayAvail.startTime && dayAvail.endTime ? `${dayAvail.startTime} - ${dayAvail.endTime}` : undefined,
            source: effective.source === 'recurring' ? 'recurring' : 'weekly'
          });
        } else if (dayAvail.status === 'unavailable') {
          unavailableList.push({
            emp,
            notes: dayAvail.notes,
            source: effective.source === 'recurring' ? 'recurring' : 'weekly'
          });
        } else {
          unsubmittedList.push(emp);
        }
      });

      // Scheduled shifts for this day and week
      const dayShifts = shifts.filter(s => {
        const sWeek = s.weekNumber !== undefined ? s.weekNumber : weekNumber;
        if (sWeek !== weekNumber || s.day !== dayIdx) return false;
        if (departmentFilter !== 'all' && s.department !== departmentFilter) return false;
        return true;
      });

      // Breakdown by department
      const zaalAvailable = availableList.filter(item => item.emp.department === 'zaal').length;
      const keukenAvailable = availableList.filter(item => item.emp.department === 'keuken').length;
      const zaalShifts = dayShifts.filter(s => s.department === 'zaal').length;
      const keukenShifts = dayShifts.filter(s => s.department === 'keuken').length;

      // Status breakdown
      const pureAvailableCount = availableList.filter(i => i.status === 'available').length;
      const preferredCount = availableList.filter(i => i.status === 'preferred').length;
      const totalAvailable = pureAvailableCount + preferredCount;
      const unavailableCount = unavailableList.length;
      const scheduledCount = dayShifts.length;

      // Coverage delta: total available minus shifts needed
      const coverageDelta = totalAvailable - scheduledCount;

      return {
        dayIdx,
        shortDay,
        fullDay: DAYS_FULL[dayIdx],
        dateStr: dateInfo.shortDate,
        label: `${shortDay} ${dateInfo.shortDate}`,
        // Metrics
        pureAvailableCount,
        preferredCount,
        totalAvailable,
        unavailableCount,
        unsubmittedCount: unsubmittedList.length,
        scheduledCount,
        // Department specifics
        zaalAvailable,
        keukenAvailable,
        zaalShifts,
        keukenShifts,
        coverageDelta,
        // Lists for details / tooltips
        availableList,
        unavailableList,
        unsubmittedList,
        dayShifts
      };
    });
  }, [relevantEmployees, weekNumber, availabilities, shifts, departmentFilter]);

  // Key KPI summaries
  const kpis = useMemo(() => {
    if (chartData.length === 0) {
      return {
        peakDay: null,
        lowestDay: null,
        avgAvailable: 0,
        totalShifts: 0,
        totalAvailableUnique: 0
      };
    }

    let peak = chartData[0];
    let lowest = chartData[0];
    let sumAvailable = 0;
    let sumShifts = 0;

    chartData.forEach(d => {
      if (d.totalAvailable > peak.totalAvailable) peak = d;
      if (d.totalAvailable < lowest.totalAvailable) lowest = d;
      sumAvailable += d.totalAvailable;
      sumShifts += d.scheduledCount;
    });

    const avgAvailable = (sumAvailable / chartData.length).toFixed(1);

    return {
      peakDay: peak,
      lowestDay: lowest,
      avgAvailable,
      totalShifts: sumShifts
    };
  }, [chartData]);

  // Selected day details object
  const activeDayData = useMemo(() => {
    if (selectedDayIdx === null) return null;
    return chartData.find(d => d.dayIdx === selectedDayIdx) || null;
  }, [chartData, selectedDayIdx]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const dayItem = chartData.find(d => d.label === label);
    if (!dayItem) return null;

    return (
      <div className="bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md text-xs min-w-[220px] max-w-[280px] pointer-events-none z-50">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
          <div className="font-black text-amber-400 text-sm flex items-center gap-1.5">
            <Calendar size={13} />
            <span>{dayItem.fullDay}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            {dayItem.dateStr}
          </span>
        </div>

        <div className="space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={12} /> Beschikbaar:
            </span>
            <span className="font-black text-sm">{dayItem.totalAvailable}</span>
          </div>

          {dayItem.preferredCount > 0 && (
            <div className="flex items-center justify-between text-blue-300 text-[11px] pl-3">
              <span>Waarvan voorkeur:</span>
              <span className="font-bold">{dayItem.preferredCount}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-rose-400 font-bold">
            <span className="flex items-center gap-1">
              <XCircle size={12} /> Niet beschikbaar:
            </span>
            <span className="font-black text-sm">{dayItem.unavailableCount}</span>
          </div>

          <div className="flex items-center justify-between text-orange-400 font-bold">
            <span className="flex items-center gap-1">
              <Clock size={12} /> Ingeplande shifts:
            </span>
            <span className="font-black text-sm">{dayItem.scheduledCount}</span>
          </div>
        </div>

        {/* Available names preview */}
        {dayItem.availableList.length > 0 && (
          <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider block">
              Inzetbaar ({dayItem.availableList.length}):
            </span>
            <p className="text-slate-300 leading-snug line-clamp-2">
              {dayItem.availableList.map(a => a.emp.name.split(' ')[0]).join(', ')}
            </p>
          </div>
        )}

        <div className="mt-2 pt-1.5 text-[9px] text-amber-300/80 italic text-center border-t border-slate-800/60">
          💡 Klik op de balk voor alle details
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-3xl border-2 border-orange-100 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Header bar */}
      <div className="p-5 border-b border-orange-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-orange-50/50 via-amber-50/30 to-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black shadow-xs">
              <BarChart3 size={16} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm md:text-base tracking-tight flex items-center gap-2">
                <span>Beschikbaarheid Personeel per Dag</span>
                <span className="text-xs bg-orange-100 text-orange-950 font-black px-2.5 py-0.5 rounded-full border border-orange-200">
                  Week {weekNumber}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Visueel overzicht van inzetbare krachten per weekdag met Recharts
              </p>
            </div>
          </div>
        </div>

        {/* View type & filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher buttons */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              type="button"
              onClick={() => setChartViewType('status')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                viewType === 'status'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toon beschikbaar vs niet beschikbaar per dag"
            >
              <Users size={12} />
              <span>Status</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('department')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                viewType === 'department'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toon verdeling tussen Zaal en Keuken"
            >
              <Layers size={12} />
              <span>Zaal / Keuken</span>
            </button>
            <button
              type="button"
              onClick={() => setChartViewType('coverage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                viewType === 'coverage'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toon capaciteit vs ingeplande shifts"
            >
              <TrendingUp size={12} />
              <span>Dekking</span>
            </button>
          </div>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Alle Afdelingen</option>
            <option value="zaal">🍽️ Zaal</option>
            <option value="keuken">🍳 Keuken</option>
          </select>

          {/* Statuut filter */}
          <select
            value={statuutFilter}
            onChange={(e) => setStatuutFilter(e.target.value as any)}
            className="bg-white border-2 border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-black uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Alle Statuten</option>
            <option value="Student">Student</option>
            <option value="Flexi">Flexi</option>
            <option value="Vast">Vast</option>
            <option value="Extra">Extra</option>
          </select>
        </div>
      </div>

      {/* KPI highlight ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50/70 border-b border-orange-100 text-left">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Piekdag (Meeste krachten)
            </span>
            <div className="font-black text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
              <span>{kpis.peakDay ? kpis.peakDay.fullDay : '-'}</span>
              {kpis.peakDay && (
                <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-md">
                  {kpis.peakDay.totalAvailable} pers.
                </span>
              )}
            </div>
          </div>
          <span className="text-xl">🌟</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Knelpunt (Minste krachten)
            </span>
            <div className="font-black text-slate-800 text-sm mt-0.5 flex items-center gap-1.5">
              <span>{kpis.lowestDay ? kpis.lowestDay.fullDay : '-'}</span>
              {kpis.lowestDay && (
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
                  {kpis.lowestDay.totalAvailable} pers.
                </span>
              )}
            </div>
          </div>
          <span className="text-xl">⚠️</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Gem. Beschikbaar / Dag
            </span>
            <div className="font-black text-slate-800 text-sm mt-0.5">
              {kpis.avgAvailable} <span className="text-xs font-bold text-slate-400">medewerkers</span>
            </div>
          </div>
          <span className="text-xl">👥</span>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Ingeplande Diensten
            </span>
            <div className="font-black text-orange-600 text-sm mt-0.5">
              {kpis.totalShifts} <span className="text-xs font-bold text-slate-400">shiften</span>
            </div>
          </div>
          <span className="text-xl">📋</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-4 sm:p-6 space-y-4">
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewType === 'status' ? (
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const dayIdx = e.activePayload[0].payload.dayIdx;
                    setSelectedDayIdx(prev => prev === dayIdx ? null : dayIdx);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 700 }}
                />
                <Bar
                  dataKey="pureAvailableCount"
                  name="Beschikbaar"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-avail-${entry.dayIdx}`}
                      fill={selectedDayIdx === entry.dayIdx ? '#059669' : '#10b981'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="preferredCount"
                  name="Met Voorkeur"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  barSize={20}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-pref-${entry.dayIdx}`}
                      fill={selectedDayIdx === entry.dayIdx ? '#2563eb' : '#60a5fa'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="unavailableCount"
                  name="Niet Beschikbaar"
                  fill="#f43f5e"
                  radius={[6, 6, 0, 0]}
                  barSize={16}
                  cursor="pointer"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`cell-unavail-${entry.dayIdx}`}
                      fill={selectedDayIdx === entry.dayIdx ? '#e11d48' : '#fda4af'}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="scheduledCount"
                  name="Ingeplande Diensten"
                  stroke="#ea580c"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#ea580c' }}
                  activeDot={{ r: 6, fill: '#ea580c' }}
                />
              </ComposedChart>
            ) : viewType === 'department' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const dayIdx = e.activePayload[0].payload.dayIdx;
                    setSelectedDayIdx(prev => prev === dayIdx ? null : dayIdx);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 700 }}
                />
                <Bar
                  dataKey="zaalAvailable"
                  name="🍽️ Zaal Beschikbaar"
                  fill="#3b82f6"
                  stackId="availDept"
                  radius={[0, 0, 0, 0]}
                  barSize={24}
                  cursor="pointer"
                />
                <Bar
                  dataKey="keukenAvailable"
                  name="🍳 Keuken Beschikbaar"
                  fill="#f97316"
                  stackId="availDept"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                  cursor="pointer"
                />
              </BarChart>
            ) : (
              <ComposedChart
                data={chartData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload.length > 0) {
                    const dayIdx = e.activePayload[0].payload.dayIdx;
                    setSelectedDayIdx(prev => prev === dayIdx ? null : dayIdx);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 12, fontSize: 11, fontWeight: 700 }}
                />
                <Bar
                  dataKey="totalAvailable"
                  name="Totaal Beschikbaar"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  barSize={22}
                  cursor="pointer"
                />
                <Bar
                  dataKey="scheduledCount"
                  name="Ingeplande Shifts"
                  fill="#f97316"
                  radius={[6, 6, 0, 0]}
                  barSize={22}
                  cursor="pointer"
                />
              </ComposedChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Day selection buttons for quick interactive drill-down */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-tight flex items-center gap-1">
            <Info size={12} className="text-orange-500" />
            <span>Klik op een dag voor personeelsdetails:</span>
          </span>

          <div className="flex flex-wrap items-center gap-1">
            {chartData.map((d) => {
              const isSelected = selectedDayIdx === d.dayIdx;
              return (
                <button
                  key={d.dayIdx}
                  type="button"
                  onClick={() => setSelectedDayIdx(prev => prev === d.dayIdx ? null : d.dayIdx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs ring-2 ring-orange-200'
                      : 'bg-slate-50 hover:bg-orange-50/60 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{d.shortDay}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {d.totalAvailable}
                  </span>
                </button>
              );
            })}
            {selectedDayIdx !== null && (
              <button
                type="button"
                onClick={() => setSelectedDayIdx(null)}
                className="px-2 py-1 text-slate-400 hover:text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Sluiten ✕
              </button>
            )}
          </div>
        </div>

        {/* Drill-down panel when a day is selected */}
        {activeDayData && (
          <div className="mt-3 p-4 bg-orange-50/40 rounded-2xl border-2 border-orange-200 text-left animate-in fade-in slide-in-from-top-2 duration-150 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                  {activeDayData.shortDay}
                </span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">
                    {activeDayData.fullDay} ({activeDayData.dateStr})
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {activeDayData.totalAvailable} beschikbaar • {activeDayData.unavailableCount} afwezig • {activeDayData.scheduledCount} ingepland
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayIdx(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
              >
                Sluit weergave ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Available List */}
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-emerald-950 uppercase tracking-tight border-b border-emerald-100 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Inzetbaar ({activeDayData.availableList.length})</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    Zaal: {activeDayData.zaalAvailable} • Keuken: {activeDayData.keukenAvailable}
                  </span>
                </div>

                {activeDayData.availableList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">Geen medewerkers beschikbaar op deze dag.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {activeDayData.availableList.map(({ emp, status, notes, time, source }) => (
                      <div
                        key={emp.id}
                        onClick={() => onSelectEmployeeDetail && onSelectEmployeeDetail(emp, weekNumber)}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between transition border cursor-pointer ${
                          status === 'preferred'
                            ? 'bg-blue-50/60 hover:bg-blue-100/70 border-blue-200 text-blue-950'
                            : 'bg-emerald-50/40 hover:bg-emerald-100/60 border-emerald-200 text-emerald-950'
                        }`}
                        title="Klik om beschikbaarheid van deze medewerker te bekijken"
                      >
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-xs">
                            <span>{emp.name}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                              emp.department === 'keuken' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {emp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                            </span>
                            <span className="text-[9px] text-slate-500 font-semibold">
                              ({emp.statuut})
                            </span>
                            {source === 'recurring' && (
                              <span className="text-[8.5px] bg-slate-100 text-slate-600 px-1 rounded font-bold" title="Vaste wekelijkse beschikbaarheid">
                                🔁 Vast
                              </span>
                            )}
                          </div>
                          {notes && (
                            <p className="text-[10px] text-slate-600 italic mt-0.5 line-clamp-1">
                              "{notes}"
                            </p>
                          )}
                        </div>

                        {time && (
                          <span className="text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {time}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Unavailable / Planned Column */}
              <div className="space-y-3">
                {/* Unavailable list */}
                <div className="bg-white p-3 rounded-xl border border-rose-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-rose-950 uppercase tracking-tight border-b border-rose-100 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <XCircle size={13} className="text-rose-600" />
                      <span>Niet Beschikbaar ({activeDayData.unavailableList.length})</span>
                    </span>
                  </div>

                  {activeDayData.unavailableList.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">Niemand heeft zich expliciet afgemeld.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                      {activeDayData.unavailableList.map(({ emp, notes }) => (
                        <div
                          key={emp.id}
                          className="p-1.5 bg-rose-50/50 rounded-lg text-xs flex items-center justify-between border border-rose-150"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-rose-950">{emp.name}</span>
                            <span className="text-[9px] text-slate-500">({emp.department})</span>
                          </div>
                          {notes && (
                            <span className="text-[10px] text-rose-700 italic max-w-[140px] truncate">
                              {notes}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Scheduled Shifts for this day */}
                <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between text-xs font-black text-orange-950 uppercase tracking-tight border-b border-orange-100 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-orange-600" />
                      <span>Reeds Ingepland ({activeDayData.dayShifts.length})</span>
                    </span>
                  </div>

                  {activeDayData.dayShifts.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-1">Nog geen shiften ingeroosterd op deze dag.</p>
                  ) : (
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {activeDayData.dayShifts.map((s) => {
                        const assignedEmp = employees.find(e => e.id === s.employeeId);
                        const isPublished = s.status === 'published';
                        return (
                          <div
                            key={s.id}
                            className="p-1.5 bg-orange-50/50 rounded-lg text-xs flex items-center justify-between border border-orange-200/80"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">
                                {assignedEmp ? assignedEmp.name : (s.isOpenShift ? '📢 Open Dienst' : 'Onbekend')}
                              </span>
                              <span className={`text-[8.5px] px-1 py-0.2 rounded font-black uppercase ${
                                s.department === 'keuken' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {s.department === 'keuken' ? 'Keuken' : 'Zaal'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {s.startTime} - {s.endTime}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
