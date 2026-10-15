import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  UtensilsCrossed,
  Utensils,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Bookmark,
  BookmarkCheck,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import { ScheduleTemplate, Shift, Employee, EmployeeAvailability, Department } from '../types';
import { 
  getLocalTemplates, 
  saveTemplate, 
  deleteTemplate, 
  createTemplateFromCurrentShifts, 
  applyTemplateToWeek 
} from '../utils/scheduleTemplateUtils';
import { getWeekMeta, AVAILABLE_WEEKS, CURRENT_WEEK_NUMBER } from '../utils/weekUtils';

const DAYS_OF_WEEK = [
  'Maandag',
  'Dinsdag',
  'Woensdag',
  'Donderdag',
  'Vrijdag',
  'Zaterdag',
  'Zondag'
];

interface ScheduleTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeek: number;
  currentShifts: Shift[];
  employees: Employee[];
  availabilities?: EmployeeAvailability[];
  onApplyTemplate: (newShifts: Shift[], templateName: string, appliedCount: number) => void;
}

export default function ScheduleTemplateModal({
  isOpen,
  onClose,
  currentWeek,
  currentShifts,
  employees,
  availabilities = [],
  onApplyTemplate
}: ScheduleTemplateModalProps) {
  // Tabs: 'apply' (sjabloon inladen), 'save' (huidig rooster opslaan), 'manage' (beheer)
  const [activeTab, setActiveTab] = useState<'apply' | 'save' | 'manage'>('apply');
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(() => getLocalTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const list = getLocalTemplates();
    return list[0]?.id || '';
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'day' | 'weekend' | 'week'>('all');

  // Application Settings
  const [targetWeek, setTargetWeek] = useState<number>(currentWeek);
  const [targetDayOverride, setTargetDayOverride] = useState<number>(5); // default Saturday
  const [applyMode, setApplyMode] = useState<'overwrite' | 'merge'>('overwrite');

  // Save new template state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [saveScope, setSaveScope] = useState<'week' | 'day' | 'weekend'>('day');
  const [saveSourceDay, setSaveSourceDay] = useState<number>(5); // Zaterdag

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Selected template object
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [templates, categoryFilter, searchQuery]);

  // Shifts of current week belonging to selected save scope
  const activeWeekShifts = useMemo(() => {
    return currentShifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === currentWeek);
  }, [currentShifts, currentWeek]);

  const shiftsToSavePreview = useMemo(() => {
    if (saveScope === 'day') {
      return activeWeekShifts.filter(s => s.day === saveSourceDay);
    }
    if (saveScope === 'weekend') {
      return activeWeekShifts.filter(s => s.day >= 4); // Vr, Za, Zo
    }
    return activeWeekShifts;
  }, [activeWeekShifts, saveScope, saveSourceDay]);

  // Handle Apply Template
  const handleApply = () => {
    if (!selectedTemplate) return;

    const dayOverride = selectedTemplate.category === 'day' ? targetDayOverride : undefined;
    const { newShifts, addedCount, warnings } = applyTemplateToWeek(
      selectedTemplate,
      targetWeek,
      applyMode,
      currentShifts,
      employees,
      availabilities,
      dayOverride
    );

    onApplyTemplate(newShifts, selectedTemplate.name, addedCount);
    onClose();
  };

  // Handle Save New Template
  const handleSaveNew = async () => {
    if (!newTemplateName.trim()) {
      setNotificationMsg('⚠️ Vul een naam in voor het sjabloon.');
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    if (shiftsToSavePreview.length === 0) {
      setNotificationMsg(`⚠️ Geen shiften gevonden in Week ${currentWeek} voor deze selectie om op te slaan.`);
      setTimeout(() => setNotificationMsg(null), 3000);
      return;
    }

    const tpl = createTemplateFromCurrentShifts(
      newTemplateName.trim(),
      newTemplateDesc.trim(),
      saveScope,
      shiftsToSavePreview,
      saveScope === 'day' ? saveSourceDay : undefined
    );

    const updated = await saveTemplate(tpl);
    setTemplates(updated);
    setSelectedTemplateId(tpl.id);
    setActiveTab('apply');
    setNotificationMsg(`✅ Sjabloon "${tpl.name}" (${tpl.shifts.length} shiften) succesvol opgeslagen!`);
    setTimeout(() => setNotificationMsg(null), 4000);

    // Reset form
    setNewTemplateName('');
    setNewTemplateDesc('');
  };

  // Handle Delete Template
  const handleDelete = async (id: string, name: string) => {
    const updated = await deleteTemplate(id);
    setTemplates(updated);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(updated[0]?.id || '');
    }
    setNotificationMsg(`🗑️ Sjabloon "${name}" verwijderd.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-5 sm:p-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <BookmarkCheck size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                  Rooster Sjablonen & Presets
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-200">
                  Slim Plannen
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sla veelvoorkomende roosterschema's op en laad ze met één klik in voor een dag, weekend of hele week.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications */}
        {notificationMsg && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-300 text-amber-950 rounded-xl text-xs font-bold animate-in fade-in">
            {notificationMsg}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 mt-4 shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('apply')}
            className={`py-2 px-4 text-xs font-black uppercase tracking-tight border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'apply'
                ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookmarkCheck size={14} />
            <span>Sjabloon Inladen ({templates.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('save')}
            className={`py-2 px-4 text-xs font-black uppercase tracking-tight border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'save'
                ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus size={14} />
            <span>Huidig Rooster Opslaan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`py-2 px-4 text-xs font-black uppercase tracking-tight border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'manage'
                ? 'border-orange-600 text-orange-600 bg-orange-50/50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Beheer Sjablonen</span>
          </button>
        </div>

        {/* TAB 1: SJABLOON INLADEN (APPLY) */}
        {activeTab === 'apply' && (
          <div className="flex-1 overflow-y-auto pt-4 grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Left Column: Template List (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              {/* Search & Category Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Zoek sjabloon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-bold">
                  {(['all', 'day', 'weekend', 'week'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg uppercase tracking-tight transition cursor-pointer shrink-0 ${
                        categoryFilter === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'all' ? 'Alles' : cat === 'day' ? 'Dag' : cat === 'weekend' ? 'Weekend' : 'Hele Week'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Items List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredTemplates.map(tpl => {
                  const isSelected = selectedTemplate?.id === tpl.id;
                  const zaalShifts = tpl.shifts.filter(s => s.department === 'zaal').length;
                  const keukenShifts = tpl.shifts.filter(s => s.department === 'keuken').length;

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer text-left space-y-1.5 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/80 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-black text-xs uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                          <span>{tpl.name}</span>
                          {tpl.isBuiltIn && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                              Basis
                            </span>
                          )}
                        </div>
                        <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                          tpl.category === 'day'
                            ? 'bg-amber-100 text-amber-900'
                            : tpl.category === 'weekend'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}>
                          {tpl.category === 'day' ? 'Dagschema' : tpl.category === 'weekend' ? 'Weekend' : 'Volledig'}
                        </span>
                      </div>

                      {tpl.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {tpl.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-orange-600" />
                          <span>{tpl.shifts.length} shiften</span>
                        </span>
                        <span>•</span>
                        <span className="text-orange-700">Zaal: {zaalShifts}</span>
                        <span>•</span>
                        <span className="text-amber-700">Keuken: {keukenShifts}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Selected Template Preview & Apply Settings (7 cols) */}
            {selectedTemplate && (
              <div className="md:col-span-7 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between border-b border-slate-200 pb-2.5">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-900">
                        {selectedTemplate.name}
                      </h4>
                      <p className="text-[11.5px] text-slate-600 leading-relaxed mt-0.5">
                        {selectedTemplate.description || 'Geen beschrijving beschikbaar.'}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-600 text-white shrink-0">
                      {selectedTemplate.shifts.length} diensten
                    </span>
                  </div>

                  {/* Shifts Preview Table */}
                  <div className="space-y-1.5 max-h-[170px] overflow-y-auto pr-1">
                    <div className="text-[10.5px] font-black uppercase text-slate-400 tracking-wider">
                      Overzicht van op te nemen shiften:
                    </div>
                    <div className="space-y-1">
                      {selectedTemplate.shifts.map((s, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {s.department === 'keuken' ? (
                              <Utensils size={13} className="text-amber-600 shrink-0" />
                            ) : (
                              <UtensilsCrossed size={13} className="text-orange-600 shrink-0" />
                            )}
                            <span className="font-bold text-slate-900 truncate">
                              {DAYS_OF_WEEK[s.day]}: <strong>{s.role || s.department}</strong>
                            </span>
                            {s.notes && (
                              <span className="text-[10px] text-slate-400 truncate hidden sm:inline">
                                ({s.notes})
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg shrink-0">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Week & Day Selection */}
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2.5">
                    <div className="font-black text-xs uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                      <Calendar size={14} className="text-orange-600" />
                      <span>Waar wil je dit sjabloon toepassen?</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10.5px] font-black uppercase text-slate-500 mb-1">
                          Doelweek
                        </label>
                        <select
                          value={targetWeek}
                          onChange={(e) => setTargetWeek(parseInt(e.target.value, 10))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none cursor-pointer"
                        >
                          {AVAILABLE_WEEKS.map(w => (
                            <option key={w.weekNumber} value={w.weekNumber}>
                              Week {w.weekNumber} ({w.dateRange})
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedTemplate.category === 'day' && (
                        <div>
                          <label className="block text-[10.5px] font-black uppercase text-slate-500 mb-1">
                            Doeldag
                          </label>
                          <select
                            value={targetDayOverride}
                            onChange={(e) => setTargetDayOverride(parseInt(e.target.value, 10))}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 focus:outline-none cursor-pointer"
                          >
                            {DAYS_OF_WEEK.map((d, dIdx) => (
                              <option key={dIdx} value={dIdx}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Mode: Overwrite vs Merge */}
                    <div className="pt-1">
                      <label className="block text-[10.5px] font-black uppercase text-slate-500 mb-1">
                        Inlaadmodus
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          onClick={() => setApplyMode('overwrite')}
                          className={`p-2 rounded-xl border text-[11px] font-black uppercase flex items-center gap-2 cursor-pointer transition ${
                            applyMode === 'overwrite'
                              ? 'bg-rose-50 border-rose-400 text-rose-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="applyMode"
                            checked={applyMode === 'overwrite'}
                            onChange={() => setApplyMode('overwrite')}
                            className="text-rose-600 focus:ring-rose-500 cursor-pointer"
                          />
                          <span>Vervang Bestaande</span>
                        </label>

                        <label
                          onClick={() => setApplyMode('merge')}
                          className={`p-2 rounded-xl border text-[11px] font-black uppercase flex items-center gap-2 cursor-pointer transition ${
                            applyMode === 'merge'
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <input
                            type="radio"
                            name="applyMode"
                            checked={applyMode === 'merge'}
                            onChange={() => setApplyMode('merge')}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>Samenvoegen</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 active:scale-98 text-white font-black text-xs uppercase tracking-tight rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={16} />
                  <span>
                    Pas Sjabloon Toe op Week {targetWeek} ({selectedTemplate.shifts.length} shiften als Concept)
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HUIDIG ROOSTER OPSLAAN ALS SJABLOON */}
        {activeTab === 'save' && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-4 max-w-2xl mx-auto w-full">
            <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 text-xs text-orange-950 space-y-1">
              <div className="font-black uppercase tracking-tight flex items-center gap-1.5 text-orange-900">
                <Info size={15} />
                <span>Huidig Rooster van Week {currentWeek} Opslaan</span>
              </div>
              <p className="leading-relaxed">
                Kies welke dag of periode je wilt bewaren als herbruikbaar sjabloon. Alle ingeplande uren, functies en afdelingen worden nauwkeurig vastgelegd.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Naam van het sjabloon *
                </label>
                <input
                  type="text"
                  placeholder="bijv. Volle bezetting zaterdag, Paasmaandag topdrukte, Rustige donderdag..."
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Toelichting / omschrijving (optioneel)
                </label>
                <textarea
                  placeholder="bijv. Extra versterking voor zaal en keuken bij zonnig weer en terrasopen..."
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Scope Selection */}
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                  Wat wil je opslaan van Week {currentWeek}?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSaveScope('day')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                      saveScope === 'day'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Eén Specifieke Dag
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveScope('weekend')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                      saveScope === 'weekend'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Het Weekend (Vr-Zo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSaveScope('week')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-tight transition cursor-pointer ${
                      saveScope === 'week'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    De Hele Week (Ma-Zo)
                  </button>
                </div>
              </div>

              {saveScope === 'day' && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Selecteer Dag van Week {currentWeek}
                  </label>
                  <select
                    value={saveSourceDay}
                    onChange={(e) => setSaveSourceDay(parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    {DAYS_OF_WEEK.map((d, dIdx) => {
                      const count = activeWeekShifts.filter(s => s.day === dIdx).length;
                      return (
                        <option key={dIdx} value={dIdx}>
                          {d} ({count} diensten ingepland)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Preview of shifts to save */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black uppercase tracking-tight text-slate-800">
                    Gevonden Shiften in Rooster
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-200 text-slate-800">
                    {shiftsToSavePreview.length} shiften
                  </span>
                </div>
                {shiftsToSavePreview.length === 0 ? (
                  <p className="text-xs text-rose-600 italic">
                    Er zijn momenteel geen diensten ingevuld voor deze selectie in Week {currentWeek}.
                  </p>
                ) : (
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {shiftsToSavePreview.map((s, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {DAYS_OF_WEEK[s.day]}: {s.role || s.department}
                        </span>
                        <span className="font-mono font-bold text-slate-600">
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Save */}
              <button
                type="button"
                onClick={handleSaveNew}
                disabled={shiftsToSavePreview.length === 0 || !newTemplateName.trim()}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 text-white font-black text-xs uppercase tracking-tight rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>Sla {shiftsToSavePreview.length} Shiften Op als Nieuw Sjabloon</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: BEHEER SJABLONEN */}
        {activeTab === 'manage' && (
          <div className="flex-1 overflow-y-auto pt-4 space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              Overzicht van alle opgeslagen sjablonen. Ingebouwde basissjablonen zijn beveiligd; door jou aangemaakte presets kunnen eenvoudig worden verwijderd.
            </p>

            <div className="space-y-2">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  className="bg-slate-50 hover:bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs uppercase text-slate-900 tracking-tight">
                        {tpl.name}
                      </span>
                      <span className={`text-[9.5px] font-black uppercase px-2 py-0.2 rounded-full ${
                        tpl.category === 'day' ? 'bg-amber-100 text-amber-900' : tpl.category === 'weekend' ? 'bg-purple-100 text-purple-900' : 'bg-blue-100 text-blue-900'
                      }`}>
                        {tpl.category === 'day' ? 'Dag' : tpl.category === 'weekend' ? 'Weekend' : 'Week'}
                      </span>
                      {tpl.isBuiltIn && (
                        <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold uppercase">
                          Systeem
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {tpl.description}
                      </p>
                    )}
                    <div className="text-[10px] text-slate-400 font-bold">
                      {tpl.shifts.length} shiften • Aangemaakt: {new Date(tpl.createdAt).toLocaleDateString('nl-BE')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setActiveTab('apply');
                      }}
                      className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-950 font-black text-xs uppercase tracking-tight rounded-xl transition cursor-pointer"
                    >
                      Inladen
                    </button>

                    {!tpl.isBuiltIn && (
                      <button
                        type="button"
                        onClick={() => handleDelete(tpl.id, tpl.name)}
                        className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                        title="Verwijder dit sjabloon"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
