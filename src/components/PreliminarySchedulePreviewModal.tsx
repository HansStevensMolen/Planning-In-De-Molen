import React, { useState, useMemo } from 'react';
import { 
  X, 
  Eye, 
  Calendar, 
  Clock, 
  CheckCheck, 
  Printer, 
  User, 
  Users, 
  Sparkles, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle, 
  UtensilsCrossed, 
  Utensils, 
  CheckCircle2, 
  Megaphone,
  Briefcase,
  Layers,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Employee, Shift, Department } from '../types';
import { getWeekMeta, CURRENT_WEEK_NUMBER } from '../utils/weekUtils';
import { calculateShiftDurationHours } from '../utils/employeeAgeUtils';
import { sortEmployeesByFirstName, deduplicateEmployees, parseStartTimeToMinutes } from '../utils/employeeSortUtils';

interface PreliminarySchedulePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  shifts: Shift[];
  employees: Employee[];
  onPublishWeek?: (targetWeek: number) => void;
  onOpenPrintModal?: () => void;
  onClearDraftShifts?: (targetWeek: number) => void;
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

export default function PreliminarySchedulePreviewModal({
  isOpen,
  onClose,
  weekNumber,
  shifts,
  employees: rawEmployees,
  onPublishWeek,
  onOpenPrintModal,
  onClearDraftShifts
}: PreliminarySchedulePreviewModalProps) {
  const employees = useMemo(() => deduplicateEmployees(rawEmployees), [rawEmployees]);
  const [selectedWeek, setSelectedWeek] = useState<number>(weekNumber);
  const [viewMode, setViewMode] = useState<'roster_grid' | 'staff_portal' | 'employee_summary'>('roster_grid');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<'all' | Department>('all');
  const [previewEmployeeId, setPreviewEmployeeId] = useState<string>(() => {
    const nonAdmin = employees.find(e => e.id !== 'emp1' && e.active !== false);
    return nonAdmin ? nonAdmin.id : employees[0]?.id || '';
  });

  const weekMeta = useMemo(() => getWeekMeta(selectedWeek), [selectedWeek]);

  // Shifts for the selected week (ALL shifts: draft + published)
  const allWeekShifts = useMemo(() => {
    return shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
  }, [shifts, selectedWeek]);

  const draftShifts = useMemo(() => {
    return allWeekShifts.filter(s => s.status === 'draft');
  }, [allWeekShifts]);

  const publishedShifts = useMemo(() => {
    return allWeekShifts.filter(s => s.status === 'published');
  }, [allWeekShifts]);

  const openShifts = useMemo(() => {
    return allWeekShifts.filter(s => s.isOpenShift);
  }, [allWeekShifts]);

  // Filtered by department if applicable
  const displayShifts = useMemo(() => {
    if (selectedDeptFilter === 'all') return allWeekShifts;
    return allWeekShifts.filter(s => s.department === selectedDeptFilter);
  }, [allWeekShifts, selectedDeptFilter]);

  // Selected employee for staff portal simulation
  const selectedEmp = useMemo(() => {
    return employees.find(e => e.id === previewEmployeeId) || employees[0];
  }, [employees, previewEmployeeId]);

  // Personal shifts of the selected employee in this preview (includes draft shifts!)
  const selectedEmpShifts = useMemo(() => {
    if (!selectedEmp) return [];
    return allWeekShifts
      .filter(s => s.employeeId === selectedEmp.id)
      .sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        return parseStartTimeToMinutes(a.startTime) - parseStartTimeToMinutes(b.startTime);
      });
  }, [allWeekShifts, selectedEmp]);

  const selectedEmpWeeklyHours = useMemo(() => {
    return Math.round(
      selectedEmpShifts.reduce((acc, sh) => acc + calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day, sh.notes), 0) * 10
    ) / 10;
  }, [selectedEmpShifts]);

  // Summary per employee
  const employeeStats = useMemo(() => {
    return employees
      .filter(e => e.id !== 'emp1' && e.active !== false)
      .map(emp => {
        const empShifts = allWeekShifts.filter(s => s.employeeId === emp.id);
        const draftCount = empShifts.filter(s => s.status === 'draft').length;
        const pubCount = empShifts.filter(s => s.status === 'published').length;
        const totalHours = Math.round(
          empShifts.reduce((acc, sh) => acc + calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day, sh.notes), 0) * 10
        ) / 10;
        return {
          emp,
          shiftsCount: empShifts.length,
          draftCount,
          pubCount,
          totalHours
        };
      })
      .filter(item => selectedDeptFilter === 'all' || item.emp.department === selectedDeptFilter)
      .sort((a, b) => b.shiftsCount - a.shiftsCount);
  }, [employees, allWeekShifts, selectedDeptFilter]);

  if (!isOpen) return null;

  return (
    <div 
      id="preliminary-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="preliminary-preview-modal-content"
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border-2 border-orange-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner shrink-0">
              <Eye size={22} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight truncate">
                  Voorvertoning Voorlopige Planning
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30 shrink-0">
                  Week {selectedWeek}
                </span>
              </div>
              <p className="text-xs text-amber-100 font-medium truncate mt-0.5">
                {weekMeta.dateRange} • Bekijk hoe de planning er compleet uitziet vóór publicatie
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Week Switcher */}
            <div className="flex items-center bg-black/20 rounded-xl p-1 text-white border border-white/20">
              <button
                type="button"
                onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
                className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                title="Vorige week"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-black px-2 uppercase tracking-tight">
                W{selectedWeek}
              </span>
              <button
                type="button"
                onClick={() => setSelectedWeek(prev => prev + 1)}
                className="p-1 rounded-lg hover:bg-white/20 transition cursor-pointer"
                title="Volgende week"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              id="close-preliminary-preview-modal-btn"
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer"
              title="Sluiten"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        <div className={`p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-b ${
          draftShifts.length > 0
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950'
            : 'bg-emerald-50 border-emerald-200 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${draftShifts.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <div>
              <span className="font-black uppercase tracking-tight">
                {draftShifts.length > 0
                  ? `Voorlopige Status: ${draftShifts.length} concept-dienst(en) nog NIET gepubliceerd`
                  : `Volledig Gepubliceerd: Alle ${publishedShifts.length} diensten staan live voor het personeel`}
              </span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {draftShifts.length > 0
                  ? 'Medewerkers zien deze voorlopige planning nog NIET in hun portaal totdat je op "Definitief Publiceren" klikt.'
                  : 'Deze planning is al zichtbaar in het personeelsportaal van alle ingeplande medewerkers.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <Calendar size={13} className="text-orange-600" />
              <span>{allWeekShifts.length} totaal</span>
              <span>•</span>
              <span className="text-emerald-700 font-black">{publishedShifts.length} pub</span>
              <span>•</span>
              <span className="text-amber-700 font-black">{draftShifts.length} concept</span>
            </div>
          </div>
        </div>

        {/* View Mode & Filter Tabs Toolbar */}
        <div className="bg-slate-50 p-3 sm:px-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('roster_grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'roster_grid'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Dagrooster (Alle 7 Dagen)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('staff_portal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'staff_portal'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User size={13} />
              <span>Personeelsportaal Weergave</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('employee_summary')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'employee_summary'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={13} />
              <span>Uren & Medewerkers</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Department selector */}
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
                  selectedDeptFilter === 'zaal' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
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
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* VIEW 1: DAGROOSTER PER DAG (MAANDAG T/M ZONDAG) */}
          {viewMode === 'roster_grid' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">
                  Toont alle <span className="font-black text-slate-900">{displayShifts.length}</span> diensten (concept & gepubliceerd) voor Week {selectedWeek}
                </span>
                <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  Concept shiften gemarkeerd met gele stippellijn
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                  const dateStr = weekMeta.dayDatesFull ? weekMeta.dayDatesFull[dayIdx] : '';
                  const dayShifts = displayShifts
                    .filter(s => s.day === dayIdx)
                    .sort((a, b) => parseStartTimeToMinutes(a.startTime) - parseStartTimeToMinutes(b.startTime));

                  const dayTotalHours = Math.round(
                    dayShifts.reduce((acc, sh) => acc + calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day, sh.notes), 0) * 10
                  ) / 10;

                  const hasDraftOnDay = dayShifts.some(s => s.status === 'draft');

                  return (
                    <div 
                      key={dayIdx} 
                      className={`bg-white rounded-2xl border flex flex-col shadow-xs transition overflow-hidden ${
                        dayShifts.length === 0 
                          ? 'border-slate-200 opacity-75' 
                          : hasDraftOnDay 
                            ? 'border-amber-300 ring-1 ring-amber-200' 
                            : 'border-slate-200'
                      }`}
                    >
                      {/* Day Header */}
                      <div className={`p-3 border-b flex items-center justify-between ${
                        hasDraftOnDay ? 'bg-amber-50/80 border-amber-200' : 'bg-slate-50 border-slate-100'
                      }`}>
                        <div>
                          <div className="font-black text-xs uppercase tracking-tight text-slate-900">
                            {dayName}
                          </div>
                          <div className="text-[10.5px] text-slate-500 font-medium">
                            {dateStr}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block text-[10px] font-black px-1.5 py-0.2 rounded bg-slate-200 text-slate-800">
                            {dayShifts.length} sh
                          </span>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                            {dayTotalHours}u
                          </div>
                        </div>
                      </div>

                      {/* Day Shifts List */}
                      <div className="p-2.5 space-y-2 flex-1">
                        {dayShifts.length === 0 ? (
                          <div className="py-6 text-center text-xs font-bold text-slate-400">
                            Geen diensten ingepland
                          </div>
                        ) : (
                          dayShifts.map((sh) => {
                            const emp = employees.find(e => e.id === sh.employeeId);
                            const isDraft = sh.status === 'draft';
                            const isOpen = sh.isOpenShift;
                            const isConfirmed = sh.acknowledged && sh.status === 'published';

                            return (
                              <div
                                key={sh.id}
                                className={`p-2.5 rounded-xl border text-xs transition ${
                                  isDraft
                                    ? 'bg-amber-50/90 border-dashed border-amber-400 text-amber-950 shadow-2xs'
                                    : isOpen
                                    ? 'bg-amber-100/90 border-amber-400 text-amber-950 ring-1 ring-amber-300'
                                    : isConfirmed
                                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                                    : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div 
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 uppercase shadow-2xs"
                                      style={{ backgroundColor: emp?.color || '#f97316' }}
                                    >
                                      {emp ? emp.name.split(' ').map(n => n[0]).join('') : '?'}
                                    </div>
                                    <span className="font-black text-xs truncate">
                                      {emp ? emp.name : 'Open Dienst'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    {isDraft && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 border border-amber-300">
                                        Concept
                                      </span>
                                    )}
                                    {isOpen && (
                                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-amber-950">
                                        Open
                                      </span>
                                    )}
                                    {isConfirmed && (
                                      <CheckCircle2 size={12} className="text-emerald-600" />
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                                  <span className="flex items-center gap-1 text-slate-900 font-black">
                                    <Clock size={11} className="text-slate-500" />
                                    {sh.startTime} - {sh.endTime}
                                  </span>
                                  <span className="uppercase text-[9.5px] px-1 rounded bg-white/70 border border-slate-200">
                                    {sh.department === 'keuken' ? 'Keuken' : 'Zaal'}
                                  </span>
                                </div>

                                {sh.notes && (
                                  <div className="mt-1 text-[10px] text-slate-500 italic truncate bg-white/60 px-1.5 py-0.5 rounded border border-slate-100">
                                    {sh.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: PERSONEELSPORTAAL VOORVERTONING (BEKIJK ALS MEDEWERKER) */}
          {viewMode === 'staff_portal' && (
            <div className="space-y-4">
              {/* Employee Switcher */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3.5 rounded-2xl border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                    <User size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-tight text-slate-900">
                      Simuleer Medewerkersweergave
                    </div>
                    <div className="text-[11px] text-orange-950">
                      Kies een medewerker om exact te zien hoe hun persoonlijke portaal eruitziet met deze voorlopige planning.
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-64">
                  <select
                    value={previewEmployeeId}
                    onChange={(e) => setPreviewEmployeeId(e.target.value)}
                    className="w-full bg-white border-2 border-orange-300 text-slate-800 font-black rounded-xl px-3 py-2 text-xs uppercase tracking-tight focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer shadow-xs"
                  >
                    {sortEmployeesByFirstName(employees.filter(e => e.id !== 'emp1' && e.active !== false)).map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.statuut} • {emp.department === 'keuken' ? 'Keuken' : 'Zaal'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Portal Simulated View Card */}
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-base shadow-sm uppercase border-2 border-white ring-2 ring-orange-200"
                      style={{ backgroundColor: selectedEmp?.color || '#f97316' }}
                    >
                      {selectedEmp?.avatarUrl ? (
                        <img src={selectedEmp.avatarUrl} alt={selectedEmp.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        selectedEmp?.name.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                          {selectedEmp?.name}
                        </h3>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                          {selectedEmp?.statuut}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Afdeling: {selectedEmp?.department === 'keuken' ? 'Keuken' : 'Zaal'} • Week {selectedWeek} ({weekMeta.dateRange})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-2xl">
                    <Clock size={16} className="text-orange-600" />
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Totaal Ingelast</div>
                      <div className="text-sm font-black text-slate-900 leading-tight">
                        {selectedEmpWeeklyHours} uur <span className="text-xs font-normal text-slate-500">({selectedEmpShifts.length} shiften)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Personal shifts list as in StaffPortal */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 tracking-tight flex items-center gap-2">
                    <Calendar size={14} className="text-orange-600" />
                    <span>Jouw Ingeplande Diensten voor Week {selectedWeek}</span>
                  </h4>

                  {selectedEmpShifts.length === 0 ? (
                    <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300 text-slate-500 space-y-1">
                      <div className="font-black text-sm text-slate-700">Geen diensten ingepland voor deze week</div>
                      <p className="text-xs">
                        {selectedEmp?.name} heeft geen actieve diensten in de voorlopige planning van Week {selectedWeek}.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedEmpShifts.map((sh) => {
                        const dayName = DAYS_OF_WEEK[sh.day];
                        const dateStr = weekMeta.dayDatesFull ? weekMeta.dayDatesFull[sh.day] : '';
                        const isDraft = sh.status === 'draft';
                        const hours = calculateShiftDurationHours(sh.startTime, sh.endTime, sh.day, sh.notes);

                        // Find colleagues on the same day
                        const colleagues = allWeekShifts
                          .filter(cs => cs.day === sh.day && cs.employeeId !== selectedEmp.id && !cs.isOpenShift)
                          .map(cs => employees.find(e => e.id === cs.employeeId)?.name)
                          .filter(Boolean);

                        return (
                          <div
                            key={sh.id}
                            className={`p-4 rounded-2xl border transition space-y-2.5 ${
                              isDraft
                                ? 'bg-amber-50/90 border-dashed border-amber-400'
                                : 'bg-white border-slate-200 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-xs font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                                  <span>{dayName}</span>
                                  <span className="text-[10px] text-slate-400 font-bold">• {dateStr}</span>
                                </div>
                                <div className="text-sm font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
                                  <Clock size={13} className="text-orange-600" />
                                  <span>{sh.startTime} – {sh.endTime}</span>
                                  <span className="text-xs text-slate-400 font-medium font-mono">({hours}u)</span>
                                </div>
                              </div>

                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isDraft
                                  ? 'bg-amber-200 text-amber-900 border border-amber-300'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isDraft ? 'Voorlopig' : 'Gepubliceerd'}
                              </span>
                            </div>

                            {sh.notes && (
                              <div className="bg-white/80 p-2 rounded-xl border border-slate-200 text-xs text-slate-700 font-medium">
                                💬 <em>{sh.notes}</em>
                              </div>
                            )}

                            {/* Colleagues working on the same day */}
                            {colleagues.length > 0 && (
                              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                                <span className="font-bold text-slate-700">Collega's op deze dag:</span> {colleagues.slice(0, 4).join(', ')}
                                {colleagues.length > 4 && ` +${colleagues.length - 4}`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: MEDEWERKERSOVERZICHT & URENTOTAAL */}
          {viewMode === 'employee_summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">
                  Personeelsbezetting & ingeplande uren voor Week {selectedWeek} ({employeeStats.length} medewerkers)
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10.5px] font-black uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-3">Medewerker</th>
                      <th className="px-3 py-3">Statuut</th>
                      <th className="px-3 py-3">Afdeling</th>
                      <th className="px-3 py-3 text-center">Aantal Diensten</th>
                      <th className="px-3 py-3 text-center">Totaal Uren</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {employeeStats.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-bold uppercase">
                          Geen medewerkers gevonden voor dit filter
                        </td>
                      </tr>
                    ) : (
                      employeeStats.map(({ emp, shiftsCount, draftCount, pubCount, totalHours }) => (
                        <tr key={emp.id} className="hover:bg-orange-50/30 transition">
                          <td className="px-3.5 py-2.5">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white uppercase shrink-0"
                                style={{ backgroundColor: emp.color }}
                              >
                                {emp.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-black text-slate-900">{emp.name}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {emp.statuut}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 uppercase text-[10px] font-bold text-slate-600">
                            {emp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                          </td>
                          <td className="px-3 py-2.5 text-center font-black">
                            {shiftsCount}
                          </td>
                          <td className="px-3 py-2.5 text-center font-black text-slate-900 font-mono">
                            {totalHours}u
                          </td>
                          <td className="px-3 py-2.5">
                            {shiftsCount === 0 ? (
                              <span className="text-[10px] font-bold text-slate-400">Niet ingepland</span>
                            ) : draftCount > 0 && pubCount === 0 ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {draftCount} Concept
                              </span>
                            ) : draftCount > 0 ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                {pubCount} Pub / {draftCount} Concept
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                Gepubliceerd 🟢
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 font-medium">
            {draftShifts.length > 0 ? (
              <span className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                <span>Nog {draftShifts.length} concept-dienst(en) wachten op publicatie voor Week {selectedWeek}.</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>Alle diensten voor Week {selectedWeek} zijn definitief gepubliceerd.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end flex-wrap">
            {onOpenPrintModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrintModal();
                }}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-black text-xs uppercase tracking-tight rounded-xl border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Print de voorlopige planning als A4 of PDF"
              >
                <Printer size={15} className="text-slate-500" />
                <span>Print / PDF Voorvertoning</span>
              </button>
            )}

            {draftShifts.length > 0 && onClearDraftShifts && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Weet je zeker dat je alle ${draftShifts.length} ontwerp-shiften voor Week ${selectedWeek} wilt verwijderen?`)) {
                    onClearDraftShifts(selectedWeek);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 border border-rose-300 font-black text-xs uppercase tracking-tight rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Verwijder alle ontwerp-shiften (concept-diensten) van deze week"
              >
                <Trash2 size={15} className="text-rose-600" />
                <span>Ontwerp Wissen ({draftShifts.length})</span>
              </button>
            )}

            {draftShifts.length > 0 && onPublishWeek && (
              <button
                type="button"
                onClick={() => {
                  onPublishWeek(selectedWeek);
                  onClose();
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                title="Geef de voorlopige planning direct vrij voor het personeel"
              >
                <CheckCheck size={16} />
                <span>Definitief Publiceren ({draftShifts.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase tracking-tight rounded-xl transition cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
