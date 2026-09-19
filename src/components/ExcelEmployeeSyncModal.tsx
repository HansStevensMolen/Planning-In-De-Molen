import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ArrowRight, 
  FileText, 
  Clipboard, 
  Info, 
  ShieldAlert, 
  Sparkles,
  Users
} from 'lucide-react';
import { Employee, Shift } from '../types';
import { 
  exportEmployeesToExcel, 
  exportEmployeesToCSV, 
  parseEmployeeFile, 
  parsePastedExcelText, 
  calculateEmployeeDiff, 
  getEmployeeStyling, 
  EmployeeSyncDiff, 
  ParsedEmployeeRow 
} from '../utils/excelEmployeeUtils';
import { deduplicateEmployees } from '../utils/employeeSortUtils';

interface ExcelEmployeeSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  onBulkSyncEmployees: (newEmployees: Employee[], removedIds: string[]) => void;
}

export default function ExcelEmployeeSyncModal({
  isOpen,
  onClose,
  employees,
  shifts,
  onBulkSyncEmployees
}: ExcelEmployeeSyncModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [syncMode, setSyncMode] = useState<'full_sync' | 'additive_only'>('full_sync');
  const [pasteMode, setPasteMode] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');
  
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Process File
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setFileName(file.name);
      const rows = await parseEmployeeFile(file);
      if (rows.length === 0) {
        setErrorMessage('Geen geldige medewerkers gevonden in dit bestand. Controleer of er een kolom "Naam" aanwezig is.');
        setParsedRows(null);
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Kon het Excel- of CSV-bestand niet inlezen. Controleer het bestandsformaat.');
      setParsedRows(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Process Pasted Text
  const handlePastedTextSubmit = () => {
    if (!pastedText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const rows = parsePastedExcelText(pastedText);
      if (rows.length === 0) {
        setErrorMessage('Geen geldige gegevens gevonden in de geplakte tekst. Plak ten minste één regel met een naam.');
        setParsedRows(null);
      } else {
        setFileName('Geplakte Excel rijen');
        setParsedRows(rows);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Fout bij het verwerken van de geplakte tekst.');
      setParsedRows(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate diff if parsed rows available
  const diff: EmployeeSyncDiff | null = parsedRows 
    ? calculateEmployeeDiff(employees, parsedRows)
    : null;

  // Actual deletions to perform based on selected syncMode
  const effectiveDeletions = (syncMode === 'full_sync' && diff) ? diff.toDelete : [];

  // Commit changes
  const handleApplySync = () => {
    if (!diff) return;

    // 1. Build new employee list
    const updatedEmployees: Employee[] = [];
    const now = Date.now();

    // A. Keep unchanged employees (and manager)
    diff.unchanged.forEach(emp => {
      updatedEmployees.push(emp);
    });

    // If additive mode, keep the "toDelete" employees too
    if (syncMode === 'additive_only') {
      diff.toDelete.forEach(emp => {
        updatedEmployees.push(emp);
      });
    }

    // B. Apply updates
    diff.toUpdate.forEach(({ existing, updated }) => {
      updatedEmployees.push({
        ...existing,
        name: updated.name,
        department: updated.department,
        statuut: updated.statuut,
        experience: updated.experience,
        phone: updated.phone || existing.phone,
        email: updated.email || existing.email,
        contractDaysPerWeek: updated.contractDaysPerWeek,
        facebookUrl: updated.facebookUrl !== undefined ? updated.facebookUrl : existing.facebookUrl,
        active: updated.active
      });
    });

    // C. Add new employees
    diff.toAdd.forEach((row, idx) => {
      const globalIdx = updatedEmployees.length + idx;
      const styling = getEmployeeStyling(globalIdx);
      // Ensure new ID never collides with emp1 or existing IDs
      const rawCandidateId = row.id && row.id !== 'emp1' ? row.id : undefined;
      const alreadyHasCandidate = rawCandidateId && updatedEmployees.some(e => e.id === rawCandidateId);
      const newId = (!alreadyHasCandidate && rawCandidateId) ? rawCandidateId : `emp_${now}_${idx}`;

      updatedEmployees.push({
        id: newId,
        name: row.name,
        department: row.department,
        statuut: row.statuut,
        experience: row.experience,
        phone: row.phone || '0471 00 00 00',
        email: row.email || '',
        facebookUrl: row.facebookUrl,
        contractDaysPerWeek: row.contractDaysPerWeek,
        color: styling.color,
        textBgColor: styling.textBgColor,
        textColor: styling.textColor,
        active: row.active !== false,
        firstLoginComplete: true
      });
    });

    // D. Always ensure Hans Stevens (emp1) stays if he was not in unchanged or toUpdate
    if (!updatedEmployees.some(e => e.id === 'emp1')) {
      const hans = employees.find(e => e.id === 'emp1');
      if (hans) {
        updatedEmployees.unshift(hans);
      }
    }

    // E. Strictly deduplicate by ID to guarantee unique keys in all views
    const finalEmployees = deduplicateEmployees(updatedEmployees);

    // Removed IDs
    const removedIds = effectiveDeletions.map(e => e.id);

    // Call parent handler
    onBulkSyncEmployees(finalEmployees, removedIds);

    setSuccessMessage(
      `Personeelslijst succesvol gesynchroniseerd! (+${diff.toAdd.length} toegevoegd, ~${diff.toUpdate.length} bijgewerkt${effectiveDeletions.length > 0 ? `, -${effectiveDeletions.length} verwijderd` : ''}).`
    );
    setParsedRows(null);
    setPastedText('');
    setFileName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-[fadeIn_0.15s_ease-out]">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-2 border-orange-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/25 shadow-inner">
              <FileSpreadsheet className="text-white w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/40 text-emerald-100 border border-emerald-400/30 mb-1">
                <Sparkles size={11} />
                <span>Excel & CSV Synchronisatie</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Personeel Beheren via Excel
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                Gemakkelijk medewerkers toevoegen, bijwerken en verwijderen in batch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="Sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('import'); setSuccessMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-emerald-800 border-t-2 border-l border-r border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={15} />
            <span>Excel / CSV Importeren & Updaten</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('export'); setSuccessMessage(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-tight transition cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-emerald-800 border-t-2 border-l border-r border-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download size={15} />
            <span>Exporteer naar Excel (.xlsx / .csv)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {successMessage && (
            <div className="bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center justify-between gap-3 animate-[fadeIn_0.2s_ease-out]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-black uppercase"
              >
                Sluiten
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 rounded-2xl p-4 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* TAB 1: IMPORT & SYNC */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              {!parsedRows ? (
                <>
                  {/* Mode switch: File upload vs Paste */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black uppercase tracking-tight text-slate-700 flex items-center gap-2">
                      <FileSpreadsheet size={15} className="text-emerald-600" />
                      <span>Stap 1: Kies je invoermethode</span>
                    </div>
                    <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPasteMode(false)}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                          !pasteMode ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Bestand Uploaden (.xlsx / .csv)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPasteMode(true)}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                          pasteMode ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Cellen Plakken vanuit Excel
                      </button>
                    </div>
                  </div>

                  {!pasteMode ? (
                    // Drag & drop file area
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-3"
                    >
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                        <Upload size={28} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800">
                          Sleep hier je bewerkte <span className="text-emerald-700">Excel- of CSV-bestand</span> naartoe
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Of klik om een bestand te kiezen (.xlsx, .xls, .csv)
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 text-[11px] text-emerald-800 bg-white border border-emerald-200 px-3 py-1 rounded-full font-bold">
                        <span>💡 Tip: Download eerst de huidige lijst via het tabblad "Exporteer naar Excel"</span>
                      </div>
                    </div>
                  ) : (
                    // Direct clipboard paste
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                          <Clipboard size={14} className="text-emerald-600" />
                          <span>Plak geselecteerde rijen rechtstreeks uit Excel:</span>
                        </label>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Selecteer in Excel de gewenste rijen/kolommen, druk op <strong>Ctrl+C</strong> (of Cmd+C) en plak ze hieronder:
                        </p>
                      </div>
                      <textarea
                        rows={7}
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Naam&#9;Afdeling&#9;Statuut&#9;Ervaring&#9;Telefoon&#9;Email&#10;Emma Van den Broeck&#9;zaal&#9;Vast&#9;Verantwoordelijke&#9;0471 12 34 56&#9;emma@example.com&#10;Nieuwe Student&#9;zaal&#9;Student&#9;Beginner&#9;0478 99 88 77&#9;..."
                        className="w-full font-mono text-xs p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handlePastedTextSubmit}
                          disabled={!pastedText.trim() || isLoading}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 size={15} />
                          <span>Gegevens Verwerken & Controleren</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Instructions & Help box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-black uppercase text-slate-700 text-[11px]">
                      <Info size={14} className="text-emerald-600 shrink-0" />
                      <span>Hoe werkt synchroniseren met Excel?</span>
                    </div>
                    <ul className="list-disc list-inside text-slate-600 space-y-1 font-medium text-[11.5px] leading-relaxed">
                      <li><strong>Nieuwe personen toevoegen:</strong> Voeg simpelweg een nieuwe rij toe in Excel met de naam, afdeling (Zaal/Keuken) en het statuut (Student, Flexi, Vast, Extra). Laat de ID kolom leeg.</li>
                      <li><strong>Bestaande personen bewerken:</strong> Wijzig de naam, het telefoonnummer of statuut in Excel; de app herkent ze automatisch aan de hand van hun ID of naam.</li>
                      <li><strong>Personen verwijderen:</strong> Haal de rij van de medewerker simpelweg weg uit het Excel-bestand en kies de modus "Volledige synchronisatie".</li>
                    </ul>
                  </div>
                </>
              ) : (
                // PREVIEW DIFF SCREEN
                <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-700 w-5 h-5" />
                        <h3 className="font-black text-sm text-slate-800">
                          Voorbeeld van wijzigingen ({fileName || 'Excel Gegevens'})
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Totaal <strong>{parsedRows.length} medewerkers</strong> gevonden in het bestand.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setParsedRows(null);
                        setFileName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <RefreshCw size={13} />
                      <span>Ander bestand kiezen</span>
                    </button>
                  </div>

                  {/* Sync Mode Selector */}
                  <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 space-y-3">
                    <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 block">
                      Kies hoe verwijderingen moeten worden afgehandeld:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label 
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          syncMode === 'full_sync'
                            ? 'bg-emerald-50/60 border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="radio" 
                            name="syncMode" 
                            checked={syncMode === 'full_sync'} 
                            onChange={() => setSyncMode('full_sync')}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="text-xs font-black text-slate-800 block">
                              Volledige Synchronisatie (Aanbevolen)
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium leading-normal block mt-0.5">
                              Nieuwe toevoegen, gewijzigde updaten én personen die <strong>niet</strong> in de Excel staan <strong>verwijderen</strong>.
                            </span>
                          </div>
                        </div>
                        {diff && diff.toDelete.length > 0 && syncMode === 'full_sync' && (
                          <span className="mt-2 text-[10.5px] font-black text-rose-700 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-md inline-block">
                            ⚠️ {diff.toDelete.length} persoon/personen worden verwijderd
                          </span>
                        )}
                      </label>

                      <label 
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col justify-between ${
                          syncMode === 'additive_only'
                            ? 'bg-emerald-50/60 border-emerald-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input 
                            type="radio" 
                            name="syncMode" 
                            checked={syncMode === 'additive_only'} 
                            onChange={() => setSyncMode('additive_only')}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <span className="text-xs font-black text-slate-800 block">
                              Alleen Toevoegen & Updaten (Veilig)
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium leading-normal block mt-0.5">
                              Voegt nieuwe mensen toe en wijzigt bestaanden, maar <strong>verwijdert niemand</strong> uit de app.
                            </span>
                          </div>
                        </div>
                        <span className="mt-2 text-[10.5px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                          Bestaande teamleden blijven bewaard
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Summary Counters */}
                  {diff && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-center">
                        <span className="text-emerald-700 font-black text-xl block">+{diff.toAdd.length}</span>
                        <span className="text-[10px] font-bold uppercase text-emerald-800">Nieuw toevoegen</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-center">
                        <span className="text-amber-700 font-black text-xl block">~{diff.toUpdate.length}</span>
                        <span className="text-[10px] font-bold uppercase text-amber-800">Aanpassen</span>
                      </div>
                      <div className={`p-3 rounded-xl text-center border ${
                        effectiveDeletions.length > 0 
                          ? 'bg-rose-50 border-rose-200 text-rose-800' 
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <span className="font-black text-xl block">-{effectiveDeletions.length}</span>
                        <span className="text-[10px] font-bold uppercase">Verwijderen</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                        <span className="text-slate-700 font-black text-xl block">={diff.unchanged.length}</span>
                        <span className="text-[10px] font-bold uppercase text-slate-600">Onveranderd</span>
                      </div>
                    </div>
                  )}

                  {/* Details of Changes */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {/* A. TO ADD */}
                    {diff && diff.toAdd.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-800">
                          <Plus size={14} className="stroke-[3]" />
                          <span>Nieuw toe te voegen ({diff.toAdd.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {diff.toAdd.map((row, idx) => (
                            <div key={idx} className="bg-emerald-50/50 border border-emerald-200 p-2.5 rounded-xl text-xs flex justify-between items-center">
                              <div>
                                <span className="font-black text-slate-800 block">{row.name}</span>
                                <span className="text-[10px] text-slate-500 font-bold">
                                  {row.department === 'keuken' ? '🍳 Keuken' : '🍽️ Zaal'} • {row.statuut} • {row.experience}
                                </span>
                              </div>
                              <span className="text-[10px] font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                                Nieuw
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* B. TO UPDATE */}
                    {diff && diff.toUpdate.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-800">
                          <RefreshCw size={14} />
                          <span>Gegevens bijwerken ({diff.toUpdate.length}):</span>
                        </div>
                        <div className="space-y-2">
                          {diff.toUpdate.map(({ existing, updated, changes }, idx) => (
                            <div key={idx} className="bg-amber-50/50 border border-amber-200 p-2.5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-black text-slate-800">{existing.name}</span>
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                                  {changes.length} wijziging(en)
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 space-y-0.5">
                                {changes.map((ch, i) => (
                                  <div key={i} className="flex items-center gap-1.5 font-medium">
                                    <ArrowRight size={10} className="text-amber-600 shrink-0" />
                                    <span>{ch}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* C. TO DELETE */}
                    {effectiveDeletions.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center gap-1.5 text-xs font-black uppercase text-rose-800">
                          <Trash2 size={14} />
                          <span>Worden verwijderd uit het systeem ({effectiveDeletions.length}):</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {effectiveDeletions.map((emp) => {
                            const empShifts = shifts.filter(s => s.employeeId === emp.id);
                            return (
                              <div key={emp.id} className="bg-rose-50/70 border border-rose-200 p-2.5 rounded-xl text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-black text-slate-800 block">{emp.name}</span>
                                  <span className="text-[10px] text-rose-700 font-bold">
                                    {empShifts.length > 0 ? `${empShifts.length} geplande diensten vervallen` : 'Geen actieve diensten'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-black bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full">
                                  Verwijderen
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Apply Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
                    <span className="text-[11px] text-slate-500 font-medium">
                      Beheerder Hans Stevens wordt altijd veilig bewaard.
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedRows(null);
                          setFileName('');
                        }}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer"
                      >
                        Annuleren
                      </button>
                      <button
                        type="button"
                        onClick={handleApplySync}
                        className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 size={16} />
                        <span>Wijzigingen Toepassen ({parsedRows.length} personen)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT TO EXCEL / CSV */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-sm text-slate-800">
                      Huidige personeelslijst downloaden
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Download alle {employees.length} medewerkers in één bestand. Je kunt dit bestand direct openen in <strong>Microsoft Excel</strong>, <strong>Google Sheets</strong> of <strong>Apple Numbers</strong>, bewerken en vervolgens weer importeren om alle wijzigingen in één keer door te voeren.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => exportEmployeesToExcel(employees)}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-tight rounded-xl flex items-center gap-2.5 shadow-md transition cursor-pointer active:scale-95"
                  >
                    <Download size={16} />
                    <span>Download Excel-bestand (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportEmployeesToCSV(employees)}
                    className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-200 text-xs font-black uppercase tracking-tight rounded-xl flex items-center gap-2.5 transition cursor-pointer active:scale-95"
                  >
                    <FileText size={16} className="text-emerald-600" />
                    <span>Download CSV-bestand (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Column structure explanation */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-tight text-slate-700 flex items-center gap-2">
                  <Info size={14} className="text-emerald-600" />
                  <span>Kolomstructuur in het Excel-bestand:</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">ID (Kolom A)</span>
                    <p className="text-[11px] text-slate-500">Uniek nummer van het personeelslid. Laat leeg bij nieuwe personen die je wilt toevoegen.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">Naam (Kolom B)</span>
                    <p className="text-[11px] text-slate-500">Voor- en achternaam van het personeelslid.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">Afdeling (Kolom C)</span>
                    <p className="text-[11px] text-slate-500">Vul in: <code>zaal</code> of <code>keuken</code>.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">Statuut (Kolom D)</span>
                    <p className="text-[11px] text-slate-500">Vul in: <code>Student</code>, <code>Flexi</code>, <code>Vast</code> of <code>Extra</code>.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">Ervaring (Kolom E)</span>
                    <p className="text-[11px] text-slate-500"><code>Beginner</code>, <code>Gemiddeld</code>, <code>Ervaren</code> of <code>Verantwoordelijke</code>.</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="font-black text-slate-800 block">GSM / Telefoon (Kolom F)</span>
                    <p className="text-[11px] text-slate-500">GSM-nummer voor WhatsApp-notificaties (bv. 0471 12 34 56).</p>
                  </div>
                </div>
              </div>

              {/* Tips for editing in Excel */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                <span className="font-black text-emerald-900 uppercase text-[10px] tracking-wide block">
                  💡 Tips voor soepel bewerken in Excel:
                </span>
                <ul className="list-disc list-inside text-slate-700 space-y-1 text-[11.5px] leading-relaxed">
                  <li><strong>Iemand verwijderen:</strong> Verwijder de hele rij in Excel en sla het bestand op. Bij het importeren selecteert de app automatisch de verwijdering.</li>
                  <li><strong>Iemand toevoegen:</strong> Voeg onderaan een nieuwe rij toe met naam en statuut.</li>
                  <li><strong>Gegevens wijzigen:</strong> Pas eenvoudig namen, telefoonnummers of statuten aan in de cellen.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Users size={15} />
            <span>Huidige teamgrootte: <strong>{employees.length} medewerkers</strong></span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
