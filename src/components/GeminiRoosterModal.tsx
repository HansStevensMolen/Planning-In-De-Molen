import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Calendar,
  Check,
  AlertTriangle,
  Clock,
  Users,
  X,
  RefreshCw,
  Send,
  Sliders,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Employee, Shift, EmployeeAvailability, WeekMeta } from '../types';
import {
  generateScheduleWithGemini,
  GeminiRoosterProposalResponse
} from '../services/geminiRoosterService';

interface GeminiRoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  availabilities: EmployeeAvailability[];
  availableWeeks: WeekMeta[];
  defaultWeekNumber: number;
  onApplyProposal: (shifts: Shift[], publishImmediately: boolean, weekNumber: number, aiSummary?: string) => void;
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

export const GeminiRoosterModal: React.FC<GeminiRoosterModalProps> = ({
  isOpen,
  onClose,
  employees,
  availabilities,
  availableWeeks,
  defaultWeekNumber,
  onApplyProposal
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(defaultWeekNumber);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [departmentFocus, setDepartmentFocus] = useState<'all' | 'zaal' | 'keuken'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [proposal, setProposal] = useState<GeminiRoosterProposalResponse | null>(null);
  const [activeDayTab, setActiveDayTab] = useState<number>(0);

  if (!isOpen) return null;

  const activeEmployees = employees.filter(e => e.active !== false);
  const weekAvailabilities = availabilities.filter(a => a.weekNumber === selectedWeek);
  const submittedEmployeeIds = new Set(weekAvailabilities.map(a => a.employeeId));

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateScheduleWithGemini(
        selectedWeek,
        activeEmployees,
        availabilities,
        customInstructions.trim() || undefined,
        departmentFocus
      );
      setProposal(res);
      setActiveDayTab(0);
    } catch (err) {
      console.error('Failed to generate with Gemini:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (publishImmediately: boolean) => {
    if (!proposal || !proposal.shifts || proposal.shifts.length === 0) return;
    onApplyProposal(proposal.shifts, publishImmediately, selectedWeek, proposal.summary);
    onClose();
  };

  // Group shifts by day for easy inspection
  const shiftsByDay = DAYS_OF_WEEK.map((_, dayIdx) => {
    return (proposal?.shifts || []).filter(s => s.day === dayIdx);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-linear-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Gemini AI Roostervoorstel
                </h3>
                <span className="px-2 py-0.5 bg-white/25 text-[10px] font-black uppercase rounded-full tracking-wider">
                  Server-side AI
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                Genereert een slim voorstel op basis van bezettingsregels en ingevulde beschikbaarheden
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Configuration Banner */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                    Selecteer Doelweek
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => {
                      setSelectedWeek(Number(e.target.value));
                      setProposal(null);
                    }}
                    className="mt-1 bg-white border border-orange-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  >
                    {availableWeeks.map(w => (
                      <option key={w.weekNumber} value={w.weekNumber}>
                        Week {w.weekNumber} ({w.dateRange}) {w.isNext ? '• Volgende week' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Availability Stats Badge */}
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-orange-200 text-xs text-slate-700">
                <Users className="w-4 h-4 text-orange-600" />
                <span>
                  <strong>{submittedEmployeeIds.size}</strong> van <strong>{activeEmployees.length}</strong> medewerkers hebben beschikbaarheid ingevuld
                </span>
              </div>
            </div>

            {/* Department Focus & Custom Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-orange-200/60">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-orange-600" /> Focus Afdeling
                </label>
                <select
                  value={departmentFocus}
                  onChange={(e) => setDepartmentFocus(e.target.value as any)}
                  className="w-full bg-white border border-orange-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="all">Volledig Rooster (Zaal & Keuken)</option>
                  <option value="zaal">Alleen Zaalpersoneel</option>
                  <option value="keuken">Alleen Keukenpersoneel</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Extra Instructies voor Gemini (optioneel)
                </label>
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Bijv. 'Matthias sluit op zaterdag', 'Geef studenten voorrang op zondag', ..."
                  className="w-full bg-white border border-orange-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Trigger Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isLoading}
                className="px-5 py-3 bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black uppercase rounded-xl shadow-md shadow-orange-600/20 active:scale-95 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gemini AI berekent rooster voorstel...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Genereer Voorstel met Gemini AI ✨
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 animate-pulse shadow-inner">
                <Bot className="w-8 h-8 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-800">
                  Gemini AI analyseert personeelsplanning...
                </h4>
                <p className="text-xs text-slate-500 max-w-md">
                  We combineren contracten, sluit-vereisten (1 sluit + 1 hulpsluit) en ingezonden beschikbaarheden tot het best mogelijke rooster.
                </p>
              </div>
            </div>
          )}

          {/* Results Display */}
          {!isLoading && proposal && (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Summary & Reasoning Cards */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900">
                        AI Toelichting & Verantwoording
                      </h4>
                      {proposal.model && (
                        <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                          {proposal.model}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {proposal.summary}
                    </p>
                  </div>
                </div>

                {proposal.reasoning && proposal.reasoning.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                    {proposal.reasoning.map((reason, rIdx) => (
                      <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {proposal.warnings && proposal.warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Aandachtspunten / Knelpunten:
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900/90 pl-1">
                      {proposal.warnings.map((warn, wIdx) => (
                        <li key={wIdx}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Proposed Shifts Navigation by Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-600" />
                    Diensten per dag ({proposal.shifts.length} diensten in totaal)
                  </h4>
                </div>

                {/* Day Tabs */}
                <div className="grid grid-cols-7 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                  {DAYS_OF_WEEK.map((dayName, dIdx) => {
                    const count = shiftsByDay[dIdx]?.length || 0;
                    const isActive = activeDayTab === dIdx;
                    return (
                      <button
                        key={dayName}
                        type="button"
                        onClick={() => setActiveDayTab(dIdx)}
                        className={`py-2 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center ${
                          isActive
                            ? 'bg-white shadow-xs text-orange-600 font-black'
                            : 'text-slate-600 hover:text-slate-900 font-bold hover:bg-white/50'
                        }`}
                      >
                        <span className="text-[10px] uppercase truncate w-full">
                          {dayName.slice(0, 2)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black mt-0.5 ${
                          isActive ? 'bg-orange-100 text-orange-700' : 'bg-slate-200/80 text-slate-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Shifts List for the active day */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-black text-slate-800">
                      {DAYS_OF_WEEK[activeDayTab]}
                    </span>
                    <span className="text-slate-500">
                      {shiftsByDay[activeDayTab]?.length || 0} geplande diensten
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {shiftsByDay[activeDayTab]?.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Geen diensten ingepland voor deze dag.
                      </div>
                    ) : (
                      shiftsByDay[activeDayTab].map((shift, sIdx) => {
                        const emp = employees.find(e => e.id === shift.employeeId);
                        const isSluit = shift.notes?.toLowerCase().includes('sluit') && !shift.notes?.toLowerCase().includes('hulp');
                        const isHulpsluit = shift.notes?.toLowerCase().includes('hulpsluit');
                        const isDay = shift.notes?.toLowerCase().includes('dag') || shift.notes?.toLowerCase().includes('overdag');

                        return (
                          <div
                            key={shift.id || sIdx}
                            className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 transition text-xs gap-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
                                style={{
                                  backgroundColor: emp?.color ? `${emp.color}20` : '#ffedd5',
                                  color: emp?.color || '#ea580c'
                                }}
                              >
                                {emp?.name?.charAt(0) || '?'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">
                                  {emp?.name || 'Onbekend'}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                                  <span>{shift.notes || 'Dienst'}</span>
                                  <span>•</span>
                                  <span className="capitalize">{shift.department}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {isSluit && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200">
                                  Sluit 🔒
                                </span>
                              )}
                              {isHulpsluit && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700 border border-amber-200">
                                  Hulpsluit 🗝️
                                </span>
                              )}
                              {isDay && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-700 border border-blue-200">
                                  Overdag ☀️
                                </span>
                              )}
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {shift.startTime} - {shift.endTime}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {proposal ? (
              <span>
                Voorstel gegenereerd voor <strong>Week {selectedWeek}</strong> ({proposal.shifts.length} diensten).
              </span>
            ) : (
              <span>Kies een week en klik op 'Genereer Voorstel'.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
            >
              Sluiten
            </button>

            {proposal && (
              <>
                <button
                  type="button"
                  onClick={() => handleApply(false)}
                  className="px-4 py-2.5 bg-white border-2 border-orange-300 hover:bg-orange-50 text-orange-700 text-xs font-black uppercase rounded-xl transition active:scale-95 cursor-pointer shadow-xs"
                >
                  Toepassen als Ontwerp (Draft)
                </button>
                <button
                  type="button"
                  onClick={() => handleApply(true)}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-black uppercase rounded-xl transition cursor-pointer shadow-md shadow-orange-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Toepassen & Publiceren
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
