import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Clipboard, 
  Info, 
  Sparkles,
  Users,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  ThumbsUp,
  Star,
  Ban
} from 'lucide-react';
import { Employee, EmployeeAvailability, DayAvailability } from '../types';
import { 
  exportAvailabilityToExcel, 
  exportAvailabilityToCSV, 
  parseAvailabilityFile, 
  parsePastedAvailabilityText, 
  ParsedAvailabilityResult,
  ParsedAvailabilityRow 
} from '../utils/excelAvailabilityUtils';
import { AVAILABLE_WEEKS } from '../utils/weekUtils';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';

interface ExcelAvailabilityBulkModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  availabilities: EmployeeAvailability[];
  currentWeekNumber: number;
  onBulkUpdateAvailability: (
    updatedAvailabilities: { employeeId: string; weekNumber: number; days: DayAvailability[]; notes?: string }[]
  ) => void;
}

export default function ExcelAvailabilityBulkModal({
  isOpen,
  onClose,
  employees,
  availabilities,
  currentWeekNumber,
  onBulkUpdateAvailability
}: ExcelAvailabilityBulkModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'download'>('upload');
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeekNumber);
  const [pasteMode, setPasteMode] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  
  const [parsedResult, setParsedResult] = useState<ParsedAvailabilityResult | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFileName(file.name);

    try {
      const result = await parseAvailabilityFile(file, selectedWeek, employees);
      if (result.rows.length === 0) {
        setErrorMessage('Geen geldige beschikbaarheidsrijen gevonden in dit bestand.');
        setParsedResult(null);
      } else {
        setParsedResult(result);
        if (result.detectedWeekNumber) {
          setSelectedWeek(result.detectedWeekNumber);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Fout bij het verwerken van het Excel-bestand.');
      setParsedResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      setErrorMessage('Plak eerst gekopieerde Excel-gegevens in het tekstvak.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = parsePastedAvailabilityText(pastedText, selectedWeek, employees);
      if (result.rows.length === 0) {
        setErrorMessage('Geen geldige beschikbaarheidsrijen herkend.');
        setParsedResult(null);
      } else {
        setParsedResult(result);
        setFileName('Gekopieerd uit klembord');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Fout bij het interpreteren van de geplakte tekst.');
      setParsedResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyBulk = () => {
    if (!parsedResult || parsedResult.rows.length === 0) return;

    const validRows = parsedResult.rows.filter(
      r => r.matchedEmployee && r.days.length > 0
    );

    if (validRows.length === 0) {
      setErrorMessage('Er zijn geen geldige gekoppelde medewerkers met ingevulde dagen om op te slaan.');
      return;
    }

    const payload = validRows.map(row => ({
      employeeId: row.matchedEmployee!.id,
      weekNumber: row.weekNumber || selectedWeek,
      days: row.days,
      notes: row.notes
    }));

    onBulkUpdateAvailability(payload);

    setSuccessMessage(
      `Succesvol ${payload.length} beschikbaarheden ingelezen en veilig opgeslagen in het rooster en de Google Cloud backup!`
    );
    setParsedResult(null);
  };

  const handleReset = () => {
    setParsedResult(null);
    setFileName('');
    setPastedText('');
    setErrorMessage(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Days list
  const DAYS_DUTCH_SHORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  // Aggregate stats from parsed rows
  const totalAvailableCount = parsedResult?.rows.reduce((acc, r) => acc + r.summary.availableCount, 0) || 0;
  const totalPreferredCount = parsedResult?.rows.reduce((acc, r) => acc + r.summary.preferredCount, 0) || 0;
  const totalUnavailableCount = parsedResult?.rows.reduce((acc, r) => acc + r.summary.unavailableCount, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 text-white p-5 sm:p-6 flex items-center justify-between border-b border-emerald-800/40">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
              <FileSpreadsheet size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">Excel Beschikbaarheden Uploaden</h2>
                <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Bulk Synchronisatie
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Download vooraf ingevulde Excel-sjablonen, bewerk ze en upload alles in 1 klik naar het rooster en Google Cloud.
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Sub-Header Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setActiveTab('upload'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Upload size={14} />
              <span>1. Bestand Uploaden & Toepassen</span>
            </button>
            <button
              onClick={() => { setActiveTab('download'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center space-x-2 cursor-pointer ${
                activeTab === 'download'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              <Download size={14} />
              <span>2. Excel Sjablonen Downloaden</span>
            </button>
          </div>

          {/* Week Selector */}
          <div className="flex items-center space-x-2">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-xs font-black text-slate-700 uppercase">Doelweek:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
            >
              {AVAILABLE_WEEKS.map(w => (
                <option key={w.weekNumber} value={w.weekNumber}>
                  {w.shortLabel} {w.isNext ? '(Volgende Week)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-left">
          
          {/* Success Banner */}
          {successMessage && (
            <div className="bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-2xl p-4 flex items-start space-x-3 animate-fadeIn">
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold">{successMessage}</p>
                <p className="text-xs text-emerald-700 mt-1">
                  Het beheerderoverzicht en de automatische roostering zijn direct bijgewerkt. U kunt dit venster nu veilig sluiten.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black uppercase cursor-pointer transition shadow-xs"
                  >
                    Sluiten & Terug naar Rooster
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer transition"
                  >
                    Nog een bestand uploaden
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-2xl p-4 flex items-start space-x-3 animate-fadeIn">
              <AlertTriangle size={22} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-bold">Validatiefout bij het inlezen:</p>
                <p className="text-xs text-rose-800 mt-0.5">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-600 hover:text-rose-800 text-xs font-bold"
              >
                Sluiten
              </button>
            </div>
          )}

          {/* TAB 1: UPLOAD & IMPORT */}
          {activeTab === 'upload' && !parsedResult && !successMessage && (
            <div className="space-y-5">
              
              {/* Toggle Paste Mode vs Drag-and-Drop */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Bestand Inladen</h3>
                  <p className="text-xs text-slate-500">Sleep uw ingevulde Excel (.xlsx, .xls) of CSV bestand hieronder, of plak de cellen direct.</p>
                </div>
                <button
                  onClick={() => setPasteMode(!pasteMode)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {pasteMode ? <FileSpreadsheet size={14} /> : <Clipboard size={14} />}
                  <span>{pasteMode ? 'Bestand Kiezen' : 'Of Plakken uit Excel'}</span>
                </button>
              </div>

              {!pasteMode ? (
                /* Drag & Drop File Zone */
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-3 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 group flex flex-col items-center justify-center space-y-3 shadow-inner"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-3xl bg-white text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-base font-black text-slate-800">
                      Klik om een Excel-bestand te kiezen, of sleep het hierheen
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Ondersteunt <strong className="text-slate-700">.xlsx</strong> (aanbevolen), <strong className="text-slate-700">.xls</strong> en <strong className="text-slate-700">.csv</strong>
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 rounded-full text-[11px] font-bold text-emerald-700 shadow-xs">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>Automatische kolom- en medewerker-herkenning</span>
                  </div>
                </div>
              ) : (
                /* Paste Text Area */
                <div className="space-y-3">
                  <div className="relative">
                    <textarea
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      placeholder="Plak hier de gekopieerde rijen uit Excel of Google Sheets... (inclusief kolomkoppen 'Naam', 'Maandag', etc.)"
                      rows={8}
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none shadow-inner"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleParsePasted}
                      disabled={isLoading || !pastedText.trim()}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center space-x-2 transition shadow-md cursor-pointer"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : <Clipboard size={14} />}
                      <span>Geplakte Gegevens Analyseren</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Template Download Callout */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase">Heeft u nog geen bestand?</p>
                    <p className="text-xs text-slate-500">
                      Download direct een voorbereid sjabloon met al uw personeel van Week {selectedWeek}.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => exportAvailabilityToExcel(employees, availabilities, selectedWeek, { blankTemplate: false })}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase flex items-center space-x-1.5 transition shadow-xs cursor-pointer shrink-0"
                >
                  <Download size={14} className="text-emerald-600" />
                  <span>Download Stand Week {selectedWeek} (.xlsx)</span>
                </button>
              </div>

            </div>
          )}

          {/* PARSED PREVIEW STATE */}
          {activeTab === 'upload' && parsedResult && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Summary Header */}
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight">
                      Bestand Geanalyseerd: {fileName}
                    </h3>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Gedetecteerd voor <strong className="text-emerald-950">Week {parsedResult.detectedWeekNumber}</strong>. Controleer het live overzicht hieronder alvorens definitief toe te passen.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleReset}
                    className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Ander Bestand
                  </button>
                  <button
                    onClick={handleApplyBulk}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 size={15} />
                    <span>Alles Definitief Opslaan</span>
                  </button>
                </div>
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-slate-400">Gekoppeld Personeel</span>
                  <p className="text-xl font-black text-slate-800 mt-0.5">
                    {parsedResult.totalMatched} <span className="text-xs font-bold text-slate-400">/ {parsedResult.rows.length}</span>
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-emerald-700 flex items-center gap-1">
                    <ThumbsUp size={11} /> Beschikbaar
                  </span>
                  <p className="text-xl font-black text-emerald-900 mt-0.5">{totalAvailableCount} dagen</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1">
                    <Star size={11} /> Voorkeur
                  </span>
                  <p className="text-xl font-black text-amber-900 mt-0.5">{totalPreferredCount} dagen</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 shadow-2xs">
                  <span className="text-[10px] font-black uppercase text-rose-700 flex items-center gap-1">
                    <Ban size={11} /> Niet-beschikbaar
                  </span>
                  <p className="text-xl font-black text-rose-900 mt-0.5">{totalUnavailableCount} dagen</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 font-black uppercase tracking-wider text-[10px] border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-3">Medewerker</th>
                        <th className="p-3">Afdeling</th>
                        {DAYS_DUTCH_SHORT.map((day, idx) => (
                          <th key={idx} className="p-2.5 text-center min-w-[75px]">{day}</th>
                        ))}
                        <th className="p-3">Opmerking</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedResult.rows.map((row, idx) => {
                        const isMatched = row.validationStatus === 'matched';
                        const emp = row.matchedEmployee;

                        return (
                          <tr key={idx} className={`hover:bg-slate-50 transition-colors ${!isMatched ? 'bg-amber-50/40' : ''}`}>
                            <td className="p-3 font-bold text-slate-800">
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 text-white"
                                  style={{ backgroundColor: emp?.color || '#94a3b8' }}
                                >
                                  {row.rawName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="leading-tight">{emp ? emp.name : row.rawName}</p>
                                  {emp && emp.name !== row.rawName && (
                                    <span className="text-[9px] text-slate-400 font-normal">Excel: "{row.rawName}"</span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="p-3">
                              {emp ? (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  emp.department === 'keuken' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                    : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                }`}>
                                  {emp.department === 'keuken' ? 'Keuken' : 'Zaal'}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>

                            {/* 7 Days */}
                            {[0, 1, 2, 3, 4, 5, 6].map(d => {
                              const dayAvail = row.days.find(day => day.day === d);
                              if (!dayAvail) {
                                return (
                                  <td key={d} className="p-2 text-center text-slate-300 font-bold text-[11px]">
                                    -
                                  </td>
                                );
                              }

                              if (dayAvail.status === 'preferred') {
                                return (
                                  <td key={d} className="p-2 text-center">
                                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-amber-100 border border-amber-300 text-amber-900 shadow-2xs">
                                      ⭐ Voorkeur
                                      {dayAvail.startTime && <div className="text-[8px] font-mono lowercase">{dayAvail.startTime}</div>}
                                    </span>
                                  </td>
                                );
                              }

                              if (dayAvail.status === 'unavailable') {
                                return (
                                  <td key={d} className="p-2 text-center">
                                    <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-rose-100 border border-rose-300 text-rose-800">
                                      Niet-beschikbaar
                                    </span>
                                  </td>
                                );
                              }

                              return (
                                <td key={d} className="p-2 text-center">
                                  <span className="inline-block px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-emerald-100 border border-emerald-300 text-emerald-900">
                                    Beschikbaar
                                    {dayAvail.startTime && <div className="text-[8px] font-mono lowercase">{dayAvail.startTime}</div>}
                                  </span>
                                </td>
                              );
                            })}

                            <td className="p-3 text-[11px] text-slate-500 max-w-[150px] truncate" title={row.notes}>
                              {row.notes || '-'}
                            </td>

                            <td className="p-3 text-right">
                              {isMatched ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={11} /> Herkend
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                                  <AlertTriangle size={11} /> Naam onbekend
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  {parsedResult.totalMatched} van {parsedResult.rows.length} personeelsleden worden bijgewerkt voor Week {parsedResult.detectedWeekNumber}.
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={handleApplyBulk}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center space-x-2 shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                    <span>Alles Definitief Opslaan</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DOWNLOAD TEMPLATES */}
          {activeTab === 'download' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Kies uw Excel Download Formaat</h3>
                <p className="text-xs text-slate-500">
                  U kunt een sjabloon downloaden waarin de actuele beschikbaarheden al zijn ingevuld, of een blanco versie om zelf in te vullen.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Card 1: Huidige Stand Excel */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <FileSpreadsheet size={24} />
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-200/80 text-emerald-900 rounded-md text-[10px] font-black uppercase">
                      Aanbevolen
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      Actuele Stand Week {selectedWeek} (.xlsx)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Downloadt een Excel-bestand waarin alle huidige medewerkers staan en hun reeds ingevulde beschikbaarheden al zijn ingevuld.
                    </p>
                  </div>

                  <button
                    onClick={() => exportAvailabilityToExcel(employees, availabilities, selectedWeek, { blankTemplate: false })}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <Download size={15} />
                    <span>Download Stand (.xlsx)</span>
                  </button>
                </div>

                {/* Card 2: Blanco Sjabloon Excel */}
                <div className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                      Sjabloon
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      Blanco Sjabloon Week {selectedWeek} (.xlsx)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Downloadt een leeg Excel-sjabloon met al uw actieve personeelsleden en lege dagvakjes, klaar om blanco in te vullen.
                    </p>
                  </div>

                  <button
                    onClick={() => exportAvailabilityToExcel(employees, availabilities, selectedWeek, { blankTemplate: true })}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <Download size={15} />
                    <span>Download Blanco (.xlsx)</span>
                  </button>
                </div>

                {/* Card 3: CSV Export */}
                <div className="bg-white border-2 border-slate-200 hover:border-slate-300 rounded-3xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-all">
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black uppercase">
                      CSV / Tekst
                    </span>
                    <h4 className="text-base font-black text-slate-900 leading-tight">
                      Universele CSV Export (.csv)
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Semicolon-gescheiden CSV met UTF-8 BOM, direct compatibel met Apple Numbers, Google Sheets en datatools.
                    </p>
                  </div>

                  <button
                    onClick={() => exportAvailabilityToCSV(employees, availabilities, selectedWeek)}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center justify-center space-x-2 transition shadow-xs cursor-pointer active:scale-98"
                  >
                    <Download size={15} />
                    <span>Download CSV (.csv)</span>
                  </button>
                </div>

              </div>

              {/* Instructions & Legend Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles size={16} className="text-emerald-600" />
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                    Hoe het Excel-bestand invullen?
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <span className="font-black text-emerald-700 uppercase flex items-center gap-1">
                      <ThumbsUp size={12} /> Beschikbaar
                    </span>
                    <p className="text-slate-600 mt-1">
                      Typ: <strong className="text-slate-800">Beschikbaar</strong>, <strong className="text-slate-800">Kan</strong>, <strong className="text-slate-800">Ja</strong>, of <strong className="text-slate-800">1</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Optioneel met uren: "Beschikbaar (17:00-23:00)"</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <span className="font-black text-amber-700 uppercase flex items-center gap-1">
                      <Star size={12} /> Voorkeur
                    </span>
                    <p className="text-slate-600 mt-1">
                      Typ: <strong className="text-slate-800">Voorkeur</strong>, <strong className="text-slate-800">Graag</strong>, <strong className="text-slate-800">*</strong>, of <strong className="text-slate-800">P</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Optioneel met uren: "Voorkeur (va. 18u)"</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-3">
                    <span className="font-black text-rose-700 uppercase flex items-center gap-1">
                      <Ban size={12} /> Niet-beschikbaar
                    </span>
                    <p className="text-slate-600 mt-1">
                      Typ: <strong className="text-slate-800">Niet-beschikbaar</strong>, <strong className="text-slate-800">Verhinderd</strong>, <strong className="text-slate-800">Nee</strong>, <strong className="text-slate-800">Niet</strong>, of <strong className="text-slate-800">X</strong>.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">Medewerker is niet beschikbaar om te werken</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  💡 <strong>Tip:</strong> Laat de kolommen "Medewerker_ID" en "Naam" ongewijzigd zodat het systeem bij het uploaden direct elke medewerker foutloos kan koppelen!
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-500 text-xs font-medium">
            <Users size={14} className="text-slate-400" />
            <span>Totaal {employees.filter(e => e.id !== 'emp1').length} actieve personeelsleden in database</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
