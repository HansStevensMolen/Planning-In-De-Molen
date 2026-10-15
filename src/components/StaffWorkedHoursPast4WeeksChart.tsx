import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
import {
  Clock,
  TrendingUp,
  Users,
  Sparkles,
  UtensilsCrossed,
  Filter,
  ArrowUpDown,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, Shift, Department, EmployeeStatuut } from '../types';
import { calculateShiftDurationHours } from '../utils/employeeAgeUtils';
import { getWeekMeta, CURRENT_WEEK_NUMBER } from '../utils/weekUtils';

interface StaffWorkedHoursPast4WeeksChartProps {
  employees: Employee[];
  shifts: Shift[];
  defaultReferenceWeek?: number;
  className?: string;
}

type ChartDisplayMode = 'stacked' | 'grouped' | 'department';
type SortOrder = 'most_hours' | 'least_hours' | 'name' | 'department';

// Palette for the 4 consecutive weeks
const WEEK_COLORS = [
  '#f97316', // Week 1 (oudste van 4): Oranje
  '#3b82f6', // Week 2: Helderblauw
  '#10b981', // Week 3: Smaragdgroen
  '#8b5cf6'  // Week 4 (meest recente): Paars
];

export default function StaffWorkedHoursPast4WeeksChart({
  employees,
  shifts,
  defaultReferenceWeek,
  className = ''
}: StaffWorkedHoursPast4WeeksChartProps) {
  // Determine available reference weeks from shifts
  const availableWeeks = useMemo(() => {
    const weekSet = new Set<number>();
    shifts.forEach(s => {
      if (typeof s.weekNumber === 'number' && s.weekNumber > 0) {
        weekSet.add(s.weekNumber);
      }
    });
    // Ensure default week / current week is in list
    weekSet.add(CURRENT_WEEK_NUMBER);
    if (defaultReferenceWeek) weekSet.add(defaultReferenceWeek);
    return Array.from(weekSet).sort((a, b) => b - a); // descending
  }, [shifts, defaultReferenceWeek]);

  // Selected reference week (the 4th and most recent week in the 4-week window)
  const [selectedEndWeek, setSelectedEndWeek] = useState<number>(() => {
    if (defaultReferenceWeek && availableWeeks.includes(defaultReferenceWeek)) {
      return defaultReferenceWeek;
    }
    // Pick week 41 or the highest week with substantial shifts
    const weekWithMostShifts = availableWeeks.slice().sort((a, b) => {
      const countA = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === a).length;
      const countB = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === b).length;
      return countB - countA;
    })[0];
    return weekWithMostShifts || CURRENT_WEEK_NUMBER;
  });

  // Display and filter states
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('stacked');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');
  const [statuutFilter, setStatuutFilter] = useState<'all' | EmployeeStatuut>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('most_hours');
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(true);
  const [onlyActiveWorked, setOnlyActiveWorked] = useState<boolean>(true);
  const [showTableDetails, setShowTableDetails] = useState<boolean>(false);

  // Compute the 4 weeks in order: [endWeek - 3, endWeek - 2, endWeek - 1, endWeek]
  const past4Weeks = useMemo(() => {
    return [
      selectedEndWeek - 3,
      selectedEndWeek - 2,
      selectedEndWeek - 1,
      selectedEndWeek
    ];
  }, [selectedEndWeek]);

  // Metadata for the 4 weeks
  const past4WeeksMeta = useMemo(() => {
    return past4Weeks.map((wk, idx) => {
      const meta = getWeekMeta(wk);
      return {
        weekNumber: wk,
        key: `week_${wk}`,
        label: `Week ${wk}`,
        dateRange: meta.dateRange,
        shortDate: meta.daysFormatted?.[0] ? `${meta.daysFormatted[0].split(' ')[0]} - ${meta.daysFormatted[meta.daysFormatted.length - 1]?.split(' ')[0]}` : meta.dateRange,
        color: WEEK_COLORS[idx]
      };
    });
  }, [past4Weeks]);

  // Aggregate worked hours per employee over the 4 weeks
  const employeeData = useMemo(() => {
    // Relevant employees filtered
    const filteredEmployees = employees.filter(emp => {
      if (emp.id === 'emp1' && emp.role === 'beheerder') return false; // Hans Stevens (zaakvoerder) buiten beschouwing
      if (!emp.active) return false;
      if (departmentFilter !== 'all' && emp.department !== departmentFilter) return false;
      if (statuutFilter !== 'all' && emp.statuut !== statuutFilter) return false;
      return true;
    });

    return filteredEmployees.map(emp => {
      // Find all shifts for this employee in the 4 weeks
      const empShifts = shifts.filter(s => {
        if (s.employeeId !== emp.id) return false;
        if (!includeDrafts && s.status === 'draft') return false;
        const sWeek = s.weekNumber || CURRENT_WEEK_NUMBER;
        return past4Weeks.includes(sWeek);
      });

      // Calculate hours per week
      let totalHours = 0;
      let zaalHours = 0;
      let keukenHours = 0;
      const weekHours: { [key: string]: number } = {};
      const weekShiftCounts: { [key: string]: number } = {};

      past4Weeks.forEach(wk => {
        const key = `week_${wk}`;
        const shiftsInWeek = empShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === wk);
        let h = 0;
        shiftsInWeek.forEach(s => {
          const duration = calculateShiftDurationHours(s.startTime, s.endTime, s.day, s.notes);
          h += duration;
          if (s.department === 'keuken') {
            keukenHours += duration;
          } else {
            zaalHours += duration;
          }
        });
        h = Math.round(h * 10) / 10;
        weekHours[key] = h;
        weekShiftCounts[key] = shiftsInWeek.length;
        totalHours += h;
      });

      totalHours = Math.round(totalHours * 10) / 10;
      zaalHours = Math.round(zaalHours * 10) / 10;
      keukenHours = Math.round(keukenHours * 10) / 10;
      const avgWeeklyHours = Math.round((totalHours / 4) * 10) / 10;

      return {
        id: emp.id,
        name: emp.name,
        department: emp.department,
        statuut: emp.statuut,
        color: emp.color,
        totalHours,
        avgWeeklyHours,
        zaalHours,
        keukenHours,
        shiftCount: empShifts.length,
        weekHours,
        weekShiftCounts,
        // Spread week properties for Recharts bar keys:
        ...weekHours
      };
    });
  }, [employees, shifts, past4Weeks, includeDrafts, departmentFilter, statuutFilter]);

  // Filter out 0-hour employees if onlyActiveWorked is toggled
  const displayedData = useMemo(() => {
    let result = employeeData;
    if (onlyActiveWorked) {
      result = result.filter(d => d.totalHours > 0);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortOrder === 'most_hours') return b.totalHours - a.totalHours;
      if (sortOrder === 'least_hours') return a.totalHours - b.totalHours;
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      if (sortOrder === 'department') return a.department.localeCompare(b.department);
      return 0;
    });
  }, [employeeData, onlyActiveWorked, sortOrder]);

  // Overall KPI statistics
  const kpis = useMemo(() => {
    const totalTeamHours = Math.round(employeeData.reduce((acc, d) => acc + d.totalHours, 0) * 10) / 10;
    const avgHoursPerWeek = Math.round((totalTeamHours / 4) * 10) / 10;
    const activeStaffCount = employeeData.filter(d => d.totalHours > 0).length;
    const avgHoursPerActiveStaff = activeStaffCount > 0 ? Math.round((totalTeamHours / activeStaffCount) * 10) / 10 : 0;
    const topWorker = [...employeeData].sort((a, b) => b.totalHours - a.totalHours)[0] || null;

    const totalZaal = Math.round(employeeData.reduce((acc, d) => acc + d.zaalHours, 0) * 10) / 10;
    const totalKeuken = Math.round(employeeData.reduce((acc, d) => acc + d.keukenHours, 0) * 10) / 10;
    const zaalPct = totalTeamHours > 0 ? Math.round((totalZaal / totalTeamHours) * 100) : 0;
    const keukenPct = totalTeamHours > 0 ? Math.round((totalKeuken / totalTeamHours) * 100) : 0;

    return {
      totalTeamHours,
      avgHoursPerWeek,
      activeStaffCount,
      totalStaffCount: employeeData.length,
      avgHoursPerActiveStaff,
      topWorker,
      totalZaal,
      totalKeuken,
      zaalPct,
      keukenPct
    };
  }, [employeeData]);

  // CSV Export function
  const handleExportCSV = () => {
    const headers = ['Medewerker', 'Afdeling', 'Statuut', ...past4WeeksMeta.map(m => m.label), 'Totaal 4 Weken (u)', 'Gemiddeld/week (u)'];
    const rows = displayedData.map(d => [
      `"${d.name}"`,
      `"${d.department}"`,
      `"${d.statuut}"`,
      ...past4WeeksMeta.map(m => d.weekHours[m.key] || 0),
      d.totalHours,
      d.avgWeeklyHours
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gewerkte_uren_4_weken_w${past4Weeks[0]}_tot_w${past4Weeks[3]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic height of the chart depending on employee count
  const chartHeight = useMemo(() => {
    return Math.max(480, displayedData.length * 36);
  }, [displayedData.length]);

  return (
    <div className={`bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6 ${className}`}>
      
      {/* Header section with title and week window selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Clock size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">
                  Gewerkte Uren per Medewerker
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-950 border border-orange-200">
                  Afgelopen 4 Weken
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Recharts analyse: verdeling van uren over {past4WeeksMeta.map(m => m.label).join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* 4-Week Reference Window Selector */}
        <div className="flex items-center gap-2 flex-wrap self-start lg:self-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Calendar size={14} className="text-orange-600 shrink-0" />
            <span className="font-bold text-slate-600">Referentieweek:</span>
            <select
              value={selectedEndWeek}
              onChange={(e) => setSelectedEndWeek(parseInt(e.target.value, 10))}
              className="bg-transparent font-black text-slate-900 focus:outline-none cursor-pointer pr-1"
            >
              {availableWeeks.map(wk => (
                <option key={wk} value={wk}>
                  Week {wk} (Venster: W{wk - 3} - W{wk})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Exporteer gewerkte uren per medewerker als CSV"
          >
            <Download size={13} />
            <span>CSV Export</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Totaal Teamuren */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50/60 p-3.5 rounded-2xl border border-orange-200 shadow-2xs">
          <div className="flex items-center justify-between text-orange-600 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-900">Totaal Teamuren</span>
            <Clock size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.totalTeamHours} <span className="text-xs font-bold text-slate-500">uur</span>
          </div>
          <div className="text-[11px] text-orange-900 font-medium mt-0.5">
            Over de afgelopen 4 weken
          </div>
        </div>

        {/* 2. Gemiddeld per Week */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3.5 rounded-2xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900">Gem. per Week</span>
            <TrendingUp size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.avgHoursPerWeek} <span className="text-xs font-bold text-slate-500">u/wk</span>
          </div>
          <div className="text-[11px] text-blue-900 font-medium mt-0.5">
            Totale teamcapaciteit
          </div>
        </div>

        {/* 3. Actieve Medewerkers */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-3.5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">Inzet Personeel</span>
            <Users size={16} />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {kpis.activeStaffCount} <span className="text-xs font-bold text-slate-500">/ {kpis.totalStaffCount}</span>
          </div>
          <div className="text-[11px] text-emerald-900 font-medium mt-0.5">
            Gem. {kpis.avgHoursPerActiveStaff} u / persoon (4w)
          </div>
        </div>

        {/* 4. Top Presteerder */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50/60 p-3.5 rounded-2xl border border-purple-200 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-900">Meeste Uren</span>
            <Sparkles size={16} />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 truncate tracking-tight">
            {kpis.topWorker ? kpis.topWorker.name.split(' ')[0] : 'N.v.t.'}
          </div>
          <div className="text-[11px] text-purple-900 font-semibold truncate mt-0.5">
            {kpis.topWorker ? `${kpis.topWorker.totalHours}u (${kpis.topWorker.avgWeeklyHours}u/wk)` : '0 uur'}
          </div>
        </div>

        {/* 5. Zaal vs Keuken Verhouding */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-slate-50 to-amber-50/40 p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">Zaal vs Keuken</span>
            <UtensilsCrossed size={16} />
          </div>
          <div className="flex items-center justify-between text-xs font-black text-slate-800">
            <span>🍽️ Zaal: {kpis.zaalPct}%</span>
            <span>🍳 Keuk: {kpis.keukenPct}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden flex">
            <div className="bg-orange-500 h-full" style={{ width: `${kpis.zaalPct}%` }} title={`Zaal: ${kpis.totalZaal}u`} />
            <div className="bg-amber-600 h-full" style={{ width: `${kpis.keukenPct}%` }} title={`Keuken: ${kpis.totalKeuken}u`} />
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            {kpis.totalZaal}u zaal • {kpis.totalKeuken}u keuken
          </div>
        </div>
      </div>

      {/* Filter and View Controls Toolbar */}
      <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers size={13} />
            <span>Weergave:</span>
          </span>

          <button
            type="button"
            onClick={() => setDisplayMode('stacked')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] transition cursor-pointer ${
              displayMode === 'stacked'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Gestapelde balken: toont per medewerker de totale 4-weken uren, opgedeeld per week"
          >
            Gestapeld (Totaal)
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('grouped')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] transition cursor-pointer ${
              displayMode === 'grouped'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Gegroepeerde balken: vergelijk de 4 afzonderlijke weken zij-aan-zij per medewerker"
          >
            Gegroepeerd (Vergelijkend)
          </button>

          <button
            type="button"
            onClick={() => setDisplayMode('department')}
            className={`px-3 py-1.5 rounded-xl font-black uppercase text-[11px] transition cursor-pointer ${
              displayMode === 'department'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
            title="Zaal vs Keuken urenverdeling per medewerker over de afgelopen 4 weken"
          >
            Zaal vs Keuken
          </button>
        </div>

        {/* Right: Filters and Sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Alle Afdelingen</option>
            <option value="zaal">🍽️ Zaal</option>
            <option value="keuken">👨‍🍳 Keuken</option>
          </select>

          {/* Statuut Filter */}
          <select
            value={statuutFilter}
            onChange={(e) => setStatuutFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="all">Alle Statuten</option>
            <option value="Vast">Vast personeel</option>
            <option value="Student">Studenten</option>
            <option value="Flexi">Flexi-job</option>
            <option value="Extra">Extra</option>
          </select>

          {/* Sortering */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            <option value="most_hours">Meeste uren eerst (Hoog → Laag)</option>
            <option value="least_hours">Minste uren eerst (Laag → Hoog)</option>
            <option value="name">Naam (A → Z)</option>
            <option value="department">Afdeling</option>
          </select>

          {/* Only Active Worked Checkbox */}
          <label className="flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer select-none ml-1">
            <input
              type="checkbox"
              checked={onlyActiveWorked}
              onChange={(e) => setOnlyActiveWorked(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Alleen actieve (&gt; 0u)</span>
          </label>
        </div>
      </div>

      {/* Week Legend Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-150">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-700 uppercase text-[10.5px]">Legende 4 Weken:</span>
        </div>
        
        {displayMode === 'department' ? (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-orange-600 inline-block" />
              <span className="font-bold text-slate-700">🍽️ Zaal Uren</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
              <span className="font-bold text-slate-700">👨‍🍳 Keuken Uren</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 flex-wrap">
            {past4WeeksMeta.map((meta) => (
              <div key={meta.key} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md inline-block shadow-2xs" style={{ backgroundColor: meta.color }} />
                <span className="font-bold text-slate-800">{meta.label}</span>
                <span className="text-[10px] text-slate-500 font-medium">({meta.shortDate})</span>
              </div>
            ))}
          </div>
        )}

        <div className="text-[11px] text-slate-500 font-medium">
          Totaal getoond: <strong className="text-slate-800">{displayedData.length}</strong> medewerkers
        </div>
      </div>

      {/* Recharts Chart Area */}
      <div className="w-full overflow-x-auto">
        <div style={{ minWidth: '600px', height: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={displayedData}
              margin={{ top: 10, right: 30, left: 110, bottom: 20 }}
              barCategoryGap="16%"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              
              <XAxis 
                type="number" 
                unit="u"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                domain={[0, 'dataMax + 5']}
              />
              
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 700 }}
                interval={0}
                width={105}
              />
              
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = displayedData.find(d => d.name === label);
                  if (!item) return null;

                  return (
                    <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[240px] animate-in fade-in duration-100">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                        <div>
                          <div className="font-black text-sm text-white tracking-tight">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                            {item.department === 'keuken' ? '👨‍🍳 Keuken' : '🍽️ Zaal'} • {item.statuut}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30">
                          {item.totalHours} uur
                        </span>
                      </div>

                      {displayMode === 'department' ? (
                        <div className="space-y-1.5 py-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
                              Zaal:
                            </span>
                            <span className="font-mono font-black">{item.zaalHours} u</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                              Keuken:
                            </span>
                            <span className="font-mono font-black">{item.keukenHours} u</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-1">
                          {past4WeeksMeta.map(meta => {
                            const hours = item.weekHours[meta.key] || 0;
                            const shiftCount = item.weekShiftCounts[meta.key] || 0;
                            return (
                              <div key={meta.key} className="flex items-center justify-between text-[11px]">
                                <span className="flex items-center gap-1.5 text-slate-300">
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: meta.color }} />
                                  <span>{meta.label} <span className="text-[10px] text-slate-500">({meta.shortDate})</span>:</span>
                                </span>
                                <span className="font-mono font-bold text-white">
                                  {hours} u <span className="text-[10px] text-slate-400 font-normal">({shiftCount} sh)</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="border-t border-slate-800 pt-2 mt-2 flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>Gemiddeld per week:</span>
                        <span className="text-emerald-400 font-black">{item.avgWeeklyHours} u/week</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Totaal shifts in periode:</span>
                        <span className="text-white font-bold">{item.shiftCount} diensten</span>
                      </div>
                    </div>
                  );
                }}
              />

              {/* Render Bars based on chosen display mode */}
              {displayMode === 'department' ? (
                <>
                  <Bar 
                    dataKey="zaalHours" 
                    name="Zaal Uren" 
                    stackId="dept" 
                    fill="#ea580c" 
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="keukenHours" 
                    name="Keuken Uren" 
                    stackId="dept" 
                    fill="#d97706" 
                    radius={[0, 6, 6, 0]}
                  />
                </>
              ) : displayMode === 'stacked' ? (
                past4WeeksMeta.map((meta, idx) => (
                  <Bar
                    key={meta.key}
                    dataKey={meta.key}
                    name={meta.label}
                    stackId="total"
                    fill={meta.color}
                    radius={idx === past4WeeksMeta.length - 1 ? [0, 6, 6, 0] : [0, 0, 0, 0]}
                  />
                ))
              ) : (
                past4WeeksMeta.map((meta) => (
                  <Bar
                    key={meta.key}
                    dataKey={meta.key}
                    name={meta.label}
                    fill={meta.color}
                    radius={[0, 4, 4, 0]}
                  />
                ))
              )}

              {/* Reference line for 38h full-time weekly equivalent (152h over 4 weeks) */}
              {displayMode === 'stacked' && (
                <ReferenceLine 
                  x={152} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Full-time 4w norm (152u)', position: 'insideTopRight', fill: '#dc2626', fontSize: 10, fontWeight: 700 }}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Toggle Details Data Table Button */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowTableDetails(prev => !prev)}
          className="text-xs font-black uppercase tracking-tight text-orange-600 hover:text-orange-700 flex items-center gap-1.5 transition cursor-pointer"
        >
          <FileSpreadsheet size={15} />
          <span>{showTableDetails ? 'Verberg Details Tabel' : 'Bekijk Volledige Uren Tabel per Medewerker'}</span>
          {showTableDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <span className="text-[11px] text-slate-400 font-medium">
          Gebaseerd op geregistreerde rooster-shiften van Café In De Molen
        </span>
      </div>

      {/* Detailed Employee Hours Table (Collapsible) */}
      {showTableDetails && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 animate-in fade-in duration-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Medewerker</th>
                <th className="py-3 px-3">Afdeling</th>
                <th className="py-3 px-3">Statuut</th>
                {past4WeeksMeta.map(m => (
                  <th key={m.key} className="py-3 px-3 text-right">
                    {m.label}
                  </th>
                ))}
                <th className="py-3 px-3.5 text-right bg-orange-50/70 text-orange-950 font-black">
                  Totaal 4 Weken
                </th>
                <th className="py-3 px-3 text-right">Gemiddeld/wk</th>
                <th className="py-3 px-3 text-center">Aandeel (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {displayedData.map((emp) => {
                const pctOfTotal = kpis.totalTeamHours > 0 
                  ? Math.round((emp.totalHours / kpis.totalTeamHours) * 1000) / 10 
                  : 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-800 font-black flex items-center justify-center text-[10px] shrink-0">
                        {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <span>{emp.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="capitalize">{emp.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.statuut === 'Vast' ? 'bg-blue-100 text-blue-900' :
                        emp.statuut === 'Student' ? 'bg-amber-100 text-amber-900' :
                        emp.statuut === 'Flexi' ? 'bg-emerald-100 text-emerald-900' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {emp.statuut}
                      </span>
                    </td>
                    {past4WeeksMeta.map(m => {
                      const h = emp.weekHours[m.key] || 0;
                      return (
                        <td key={m.key} className="py-2.5 px-3 text-right font-mono">
                          {h > 0 ? (
                            <span className="font-bold text-slate-800">{h} u</span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3.5 text-right font-mono font-black text-orange-950 bg-orange-50/40">
                      {emp.totalHours} u
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                      {emp.avgWeeklyHours} u/w
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, pctOfTotal * 4)}%` }} 
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 font-mono w-9 text-right">
                          {pctOfTotal}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-3 px-3.5 uppercase" colSpan={3}>
                  Totale Team Capaciteit
                </td>
                {past4WeeksMeta.map(m => {
                  const weekSum = Math.round(displayedData.reduce((acc, d) => acc + (d.weekHours[m.key] || 0), 0) * 10) / 10;
                  return (
                    <td key={m.key} className="py-3 px-3 text-right font-mono font-black">
                      {weekSum} u
                    </td>
                  );
                })}
                <td className="py-3 px-3.5 text-right font-mono font-black text-orange-700 bg-orange-100/60">
                  {kpis.totalTeamHours} u
                </td>
                <td className="py-3 px-3 text-right font-mono font-black text-slate-800">
                  {kpis.avgHoursPerWeek} u/w
                </td>
                <td className="py-3 px-3 text-center font-mono font-black">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

    </div>
  );
}
