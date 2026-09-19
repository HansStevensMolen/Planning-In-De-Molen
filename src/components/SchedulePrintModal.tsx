import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  ExternalLink, 
  X, 
  Calendar, 
  Check, 
  FileText, 
  Users, 
  UtensilsCrossed, 
  Utensils, 
  Info,
  Clock,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  FileCheck,
  ZoomIn,
  Sparkles
} from 'lucide-react';
import { Employee, Shift, Department } from '../types';
import { AVAILABLE_WEEKS, getWeekMeta, CURRENT_WEEK_NUMBER, getDayDateInfo, getAutoActiveWeeks, getAutoArchivedWeeks } from '../utils/weekUtils';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';

interface SchedulePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  initialWeek?: number;
  initialDepartment?: Department | 'all';
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

export default function SchedulePrintModal({
  isOpen,
  onClose,
  employees,
  shifts,
  initialWeek = CURRENT_WEEK_NUMBER,
  initialDepartment = 'all'
}: SchedulePrintModalProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>(initialDepartment);
  const [includeDrafts, setIncludeDrafts] = useState<boolean>(true);
  const [showSummaryTable, setShowSummaryTable] = useState<boolean>(true);
  const [showKitchenChecklist, setShowKitchenChecklist] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [customNote, setCustomNote] = useState<string>(
    'Dienst ruilen? Gelieve tijdig door te geven via het personeelsportaal of aan Hans (016/46.13.00).'
  );
  const [printSuccessNotice, setPrintSuccessNotice] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Sync with initial props when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedWeek(initialWeek);
      setSelectedDepartment(initialDepartment);
      setPrintSuccessNotice(null);
    }
  }, [isOpen, initialWeek, initialDepartment]);

  if (!isOpen) return null;

  const weekMeta = getWeekMeta(selectedWeek);

  // Filter shifts for this week and department
  const weekShifts = shifts.filter(s => {
    const sWeek = s.weekNumber || CURRENT_WEEK_NUMBER;
    if (sWeek !== selectedWeek) return false;
    if (!includeDrafts && s.status === 'draft') return false;
    if (selectedDepartment !== 'all' && (s.department || 'zaal') !== selectedDepartment) return false;
    return true;
  });

  // Calculate shift duration in hours
  const calculateShiftHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let startMin = startH * 60 + (startM || 0);
    let endMin = endH * 60 + (endM || 0);
    if (endMin <= startMin) {
      endMin += 24 * 60; // Crosses midnight
    }
    return Math.round(((endMin - startMin) / 60) * 10) / 10;
  };

  // Staff summary for the week
  const employeeStats = employees
    .map(emp => {
      const empShifts = weekShifts.filter(s => s.employeeId === emp.id);
      const totalHours = empShifts.reduce((acc, s) => acc + calculateShiftHours(s.startTime, s.endTime), 0);
      return {
        employee: emp,
        shiftCount: empShifts.length,
        totalHours: Math.round(totalHours * 10) / 10
      };
    })
    .filter(stat => stat.shiftCount > 0)
    .sort((a, b) => b.totalHours - a.totalHours);

  // Helper to determine role badge for kitchen shifts
  const getKitchenRoleBadge = (shift: Shift, emp?: Employee) => {
    const notesLower = (shift.notes || '').toLowerCase();
    const roleLower = (emp?.role || '').toLowerCase();
    
    if (notesLower.includes('chef') || roleLower.includes('chef')) {
      return { text: 'Chef-Kok', style: 'bg-orange-700 text-white border-orange-800' };
    }
    if (notesLower.includes('afwas') || roleLower.includes('afwas')) {
      return { text: 'Afwas', style: 'bg-cyan-700 text-white border-cyan-800' };
    }
    if (notesLower.includes('hulp') || notesLower.includes('koude')) {
      return { text: 'Hulpkok', style: 'bg-amber-600 text-white border-amber-700' };
    }
    if (notesLower.includes('sluit') || shift.endTime >= '23:00') {
      return { text: 'Sluitkeuken', style: 'bg-slate-800 text-white border-slate-900' };
    }
    return { text: 'Kok / Keuken', style: 'bg-orange-600 text-white border-orange-700' };
  };

  // Helper to determine role badge for zaal shifts
  const getZaalRoleBadge = (shift: Shift, emp?: Employee) => {
    const notesLower = (shift.notes || '').toLowerCase();
    if (notesLower.includes('sluit') || shift.endTime >= '23:30') {
      return { text: 'Sluit', style: 'bg-orange-600 text-white border-orange-700' };
    }
    if (notesLower.includes('hulp')) {
      return { text: 'Hulpsluit', style: 'bg-amber-600 text-white border-amber-700' };
    }
    if (notesLower.includes('bar')) {
      return { text: 'Bar', style: 'bg-indigo-600 text-white border-indigo-700' };
    }
    return { text: 'Zaal', style: 'bg-slate-700 text-white border-slate-800' };
  };

  // Trigger print dialog
  const handlePrint = () => {
    try {
      window.print();
      setPrintSuccessNotice('Printopdracht verstuurd. Kies "Opslaan als PDF" in het dialoogvenster om als PDF op te slaan.');
    } catch {
      handleOpenInNewTab();
    }
  };

  // Generate self-contained standalone HTML document with complete CSS styling embedded
  const generateStandaloneHTML = (): string => {
    const printContent = printAreaRef.current ? printAreaRef.current.innerHTML : '';
    const deptTitle = selectedDepartment === 'keuken' 
      ? 'KEUKENROOSTER' 
      : selectedDepartment === 'zaal' 
      ? 'ZAALROOSTER' 
      : 'WEEKROOSTER';

    return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${deptTitle} - Week ${selectedWeek} - Eet-staminée In De Molen</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 10px;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      font-size: ${fontSize === 'large' ? '12px' : '11px'};
      line-height: 1.35;
    }
    .print-container {
      max-width: 100%;
      margin: 0 auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      table-layout: fixed;
    }
    th, td {
      border: 1.5px solid #1e293b;
      vertical-align: top;
      padding: 6px;
      word-wrap: break-word;
    }
    th {
      background-color: #0f172a !important;
      color: #ffffff !important;
      font-weight: 800;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .shift-card {
      border: 1.5px solid #334155;
      border-radius: 6px;
      padding: 5px 6px;
      margin-bottom: 5px;
      background-color: #f8fafc;
      page-break-inside: avoid;
    }
    .shift-card.keuken-card {
      border-left: 4px solid #c2410c;
      background-color: #fff7ed;
    }
    .shift-card.zaal-card {
      border-left: 4px solid #0284c7;
      background-color: #f0f9ff;
    }
    .shift-card.close-card {
      border-left: 4px solid #ea580c;
      background-color: #fffbeb;
    }
    .emp-name {
      font-weight: 900;
      font-size: ${fontSize === 'large' ? '14px' : '12.5px'};
      color: #0f172a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .time-badge {
      font-weight: 800;
      font-size: ${fontSize === 'large' ? '13px' : '11.5px'};
      color: #0f172a;
      margin-top: 2px;
    }
    .role-badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      padding: 1px 5px;
      border-radius: 4px;
      margin-top: 3px;
      background: #0f172a;
      color: #fff;
    }
    .notes {
      font-style: italic;
      font-size: 10px;
      color: #475569;
      margin-top: 2px;
    }
    .header-bar {
      border-bottom: 3px solid #ea580c;
      padding-bottom: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-title {
      font-size: 22px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      color: #0f172a;
      margin: 0;
    }
    .header-sub {
      font-size: 11px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .week-badge {
      background-color: #ea580c !important;
      color: #ffffff !important;
      font-weight: 900;
      font-size: 14px;
      padding: 5px 12px;
      border-radius: 6px;
      text-transform: uppercase;
      display: inline-block;
    }
    .info-bar {
      border: 1.5px solid #cbd5e1;
      background: #f8fafc;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 8px;
      font-size: 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .checklist-box {
      border: 1.5px solid #334155;
      background: #f8fafc;
      border-radius: 6px;
      padding: 6px 10px;
      margin-top: 8px;
      font-size: 10px;
    }
    .footer {
      border-top: 1.5px solid #cbd5e1;
      padding-top: 6px;
      margin-top: 8px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #64748b;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-container">
    ${printContent}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;
  };

  const handleOpenInNewTab = () => {
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      alert('Pop-up geblokkeerd door browser. Klik a.u.b. op "Download HTML/PDF" of sta pop-ups toe.');
    } else {
      setPrintSuccessNotice('Nieuw tabblad geopend! Het printvenster wordt daar direct gestart.');
    }
  };

  const handleDownloadHTML = () => {
    const html = generateStandaloneHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const deptPrefix = selectedDepartment === 'keuken' ? 'Keuken' : selectedDepartment === 'zaal' ? 'Zaal' : 'Totaal';
    a.download = `InDeMolen-${deptPrefix}-Rooster-Week${selectedWeek}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setPrintSuccessNotice('Bestand gedownload! Open het met uw browser en druk op Ctrl+P / Cmd+P om op te slaan als PDF.');
  };

  const isKitchenMode = selectedDepartment === 'keuken';
  const isZaalMode = selectedDepartment === 'zaal';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl max-w-6xl w-full shadow-2xl border-2 border-orange-200 overflow-hidden my-auto max-h-[96vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none">
        
        {/* Modal Top Bar (Controls - Hidden during print) */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md shrink-0">
              <Printer size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-white flex items-center gap-1.5">
                  <span>Print PDF — Weekrooster</span>
                </h2>
                <span className="bg-orange-500/20 text-orange-400 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border border-orange-500/30">
                  Strak A4 Keuken & Kantine Formaat
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Opgemaakt in een strak, print-vriendelijk formaat voor aan de keukenmuur of het prikbord van Café In De Molen.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end md:self-center flex-wrap">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 shadow-lg shadow-orange-950/30 transition active:scale-95 cursor-pointer"
              title="Start direct het afdruk- of PDF-venster"
            >
              <Printer size={16} />
              <span>Print PDF (Afdrukken)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-700"
              title="Open printversie in een nieuw venster"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Nieuw Tabblad</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-slate-700"
              title="Download printbaar HTML bestand (werkt met elke browser)"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download HTML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              title="Sluiten"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback alert if print action clicked */}
        {printSuccessNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-950 print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{printSuccessNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setPrintSuccessNotice(null)}
              className="text-emerald-700 hover:text-emerald-900 font-black cursor-pointer text-[11px]"
            >
              Sluiten ✕
            </button>
          </div>
        )}

        {/* Filter and Configuration Bar (Hidden during print) */}
        <div className="bg-orange-50/70 border-b border-orange-200 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Format preset selector */}
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Formaat:</span>
              <div className="inline-flex rounded-xl bg-white border-2 border-orange-200 p-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDepartment('keuken')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                    selectedDepartment === 'keuken' 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                  title="Strakke opmaak speciaal afgestemd voor in de keuken (koks, afwas & keukentijden)"
                >
                  <ChefHat size={13} />
                  <span>Keuken Formaat</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDepartment('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                    selectedDepartment === 'all' 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                  title="Volledig overzicht met zowel Zaal als Keuken"
                >
                  <UtensilsCrossed size={13} />
                  <span>Volledig (Zaal & Keuken)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDepartment('zaal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-tight transition cursor-pointer flex items-center gap-1 ${
                    selectedDepartment === 'zaal' 
                      ? 'bg-orange-500 text-white shadow-xs' 
                      : 'text-slate-700 hover:bg-orange-50'
                  }`}
                  title="Zaal & bar personeel"
                >
                  <Utensils size={13} />
                  <span>Zaal Formaat</span>
                </button>
              </div>
            </div>

            {/* Week selector */}
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-slate-700 uppercase tracking-wider text-[11px]">Week:</span>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-white border-2 border-orange-200 text-slate-900 rounded-xl px-3 py-1.5 font-black uppercase text-xs focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-xs"
              >
                <optgroup label="Actieve Weken">
                  {getAutoActiveWeeks(CURRENT_WEEK_NUMBER, [], shifts).map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      Week {w.weekNumber} ({w.dateRange}) {w.isCurrent ? '• Huidig' : w.isNext ? '• Volgende' : ''}
                    </option>
                  ))}
                </optgroup>
                {getAutoArchivedWeeks(CURRENT_WEEK_NUMBER, shifts).length > 0 && (
                  <optgroup label="Gearchiveerde Weken">
                    {getAutoArchivedWeeks(CURRENT_WEEK_NUMBER, shifts).map(w => (
                      <option key={w.weekNumber} value={w.weekNumber}>
                        📦 Week {w.weekNumber} ({w.dateRange}) • Archief
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Font size toggle for readability */}
            <div className="flex items-center space-x-1 bg-white border border-orange-200 rounded-xl p-1 shadow-xs">
              <span className="text-[10px] font-black uppercase text-slate-500 px-1.5">Tekst:</span>
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  fontSize === 'normal' ? 'bg-orange-500 text-white' : 'text-slate-700 hover:bg-orange-50'
                }`}
              >
                Normaal
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  fontSize === 'large' ? 'bg-orange-500 text-white' : 'text-slate-700 hover:bg-orange-50'
                }`}
                title="Groot lettertype voor goede leesbaarheid op 1-2 meter afstand aan de keukenmuur"
              >
                Groot (Keukenmuur)
              </button>
            </div>

            {/* Checkbox: kitchen checklist */}
            {selectedDepartment === 'keuken' && (
              <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-800 bg-white border border-orange-200 px-2.5 py-1.5 rounded-xl shadow-xs">
                <input
                  type="checkbox"
                  checked={showKitchenChecklist}
                  onChange={(e) => setShowKitchenChecklist(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Keuken HACCP/Sluitrichtlijnen tonen</span>
              </label>
            )}

            {/* Checkbox: show summary */}
            <label className="flex items-center space-x-1.5 cursor-pointer font-bold text-slate-800 bg-white border border-orange-200 px-2.5 py-1.5 rounded-xl shadow-xs">
              <input
                type="checkbox"
                checked={showSummaryTable}
                onChange={(e) => setShowSummaryTable(e.target.checked)}
                className="rounded text-orange-600 focus:ring-orange-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Urenoverzicht tonen</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-600 font-semibold flex items-center gap-1.5 bg-amber-50/80 border border-amber-200 px-3 py-1.5 rounded-xl">
            <Info size={13} className="text-amber-700 shrink-0" />
            <span>💡 <strong>Tip:</strong> Kies bij de printerinstellingen <strong>'Opslaan als PDF'</strong> en afdrukstand <strong>'Liggend' (Landscape)</strong>.</span>
          </div>
        </div>

        {/* Printable Canvas Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          
          <div 
            ref={printAreaRef}
            id="canteen-print-area"
            className={`bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-300 max-w-5xl mx-auto print:max-w-none print:w-full print:border-none print:shadow-none print:p-0 text-slate-900 font-sans ${
              fontSize === 'large' ? 'text-[12.5px]' : 'text-[11px]'
            }`}
          >
            {/* Header: Café In De Molen Banner */}
            <div className="border-b-4 border-orange-600 pb-3 mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-3xl">
                    {isKitchenMode ? '🍳' : '🍻'}
                  </span>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 m-0">
                      Eet-staminée In De Molen
                    </h1>
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-wider mt-0.5">
                      Tiensesteenweg 323, 3360 Bierbeek • Tel: 016/46.13.00 • Noodcontact Hans
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="bg-orange-600 text-white font-black text-sm sm:text-base px-4 py-1.5 rounded-xl uppercase tracking-tight inline-block shadow-sm">
                  {isKitchenMode 
                    ? `KEUKENROOSTER • WEEK ${selectedWeek}` 
                    : isZaalMode 
                    ? `ZAALROOSTER • WEEK ${selectedWeek}` 
                    : `WEEKROOSTER • WEEK ${selectedWeek}`}
                </div>
                <div className="text-xs font-extrabold text-slate-900 mt-1">
                  Periode: <span className="text-orange-950 font-black">{weekMeta.dateRange}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                  {isKitchenMode 
                    ? '🍳 Bestemd voor: Keuken & Afwas' 
                    : isZaalMode 
                    ? '🍽️ Bestemd voor: Zaalpersoneel & Bar' 
                    : '👥 Volledig Team (Zaal & Keuken)'}
                </div>
              </div>
            </div>

            {/* Keuken Opening & Mededeling balk */}
            <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-2.5 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="font-black uppercase text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded tracking-wider shrink-0">
                  {isKitchenMode ? 'Keuken Dienstinfo' : 'Rooster Info'}
                </span>
                <span className="font-bold text-slate-800 leading-snug">
                  {customNote}
                </span>
              </div>
              <div className="text-[10px] text-slate-600 font-bold shrink-0">
                Elke dag open van 11u30-01u00 • Vr & Za tot 02u00 • Zo van 10u00-00u00
              </div>
            </div>

            {/* Weekly Schedule Grid (7 Days Columns) */}
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border-2 border-slate-900 text-xs">
                <thead>
                  <tr className="bg-slate-950 text-white">
                    {DAYS_OF_WEEK.map((dayName, idx) => {
                      const dayShifts = weekShifts.filter(s => s.day === idx);
                      const dayDateInfo = getDayDateInfo(selectedWeek, idx);
                      return (
                        <th key={dayName} className="border border-slate-700 p-2 text-center w-[14.28%] align-top">
                          <div className="font-black uppercase text-xs tracking-wider flex items-center justify-center gap-1">
                            <span>{dayName}</span>
                          </div>
                          <div className="text-[11px] font-black text-amber-300 mt-0.5">
                            {dayDateInfo.shortDate}
                          </div>
                          <div className="text-[9.5px] text-orange-200 font-bold mt-0.5">
                            {dayShifts.length} {dayShifts.length === 1 ? 'dienst' : 'diensten'}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                      const dayShifts = weekShifts
                        .filter(s => s.day === dayIdx)
                        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

                      const keukenShifts = dayShifts.filter(s => s.department === 'keuken');
                      const zaalShifts = dayShifts.filter(s => (s.department || 'zaal') === 'zaal');

                      return (
                        <td key={dayIdx} className="border border-slate-300 p-1.5 align-top bg-white min-h-[220px]">
                          {dayShifts.length === 0 ? (
                            <div className="p-4 text-center text-slate-400 font-bold italic text-[11px]">
                              Geen diensten
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Keuken shifts */}
                              {(selectedDepartment === 'all' || selectedDepartment === 'keuken') && keukenShifts.length > 0 && (
                                <div className="space-y-1.5">
                                  {selectedDepartment === 'all' && (
                                    <div className="text-[9px] font-black uppercase tracking-wider text-orange-950 bg-orange-100 px-1 py-0.5 rounded text-center border border-orange-200">
                                      🍳 Keuken ({keukenShifts.length})
                                    </div>
                                  )}
                                  {keukenShifts.map((shift) => {
                                    const emp = employees.find(e => e.id === shift.employeeId);
                                    const hours = calculateShiftHours(shift.startTime, shift.endTime);
                                    const roleBadge = getKitchenRoleBadge(shift, emp);

                                    return (
                                      <div
                                        key={shift.id}
                                        className="p-2 rounded-lg border-2 border-orange-200 bg-orange-50/50 text-left leading-tight shadow-2xs"
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className={`font-black text-slate-950 truncate ${
                                            fontSize === 'large' ? 'text-[13.5px]' : 'text-[12px]'
                                          }`}>
                                            {emp?.name || 'Onbekend'}
                                          </span>
                                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 border ${roleBadge.style}`}>
                                            {roleBadge.text}
                                          </span>
                                        </div>
                                        
                                        <div className={`font-black text-slate-850 flex items-center justify-between mt-1 ${
                                          fontSize === 'large' ? 'text-[12px]' : 'text-[10.5px]'
                                        }`}>
                                          <span className="text-orange-950">{shift.startTime} – {shift.endTime}</span>
                                          <span className="text-[9px] text-slate-500 font-bold">({hours}u)</span>
                                        </div>

                                        {shift.notes && (
                                          <div className="text-[9.5px] text-slate-700 italic font-medium truncate mt-0.5 border-t border-orange-100 pt-0.5">
                                            {shift.notes}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Zaal shifts */}
                              {(selectedDepartment === 'all' || selectedDepartment === 'zaal') && zaalShifts.length > 0 && (
                                <div className="space-y-1.5">
                                  {selectedDepartment === 'all' && (
                                    <div className="text-[9px] font-black uppercase tracking-wider text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-center border border-slate-200">
                                      🍽️ Zaal ({zaalShifts.length})
                                    </div>
                                  )}
                                  {zaalShifts.map((shift) => {
                                    const emp = employees.find(e => e.id === shift.employeeId);
                                    const hours = calculateShiftHours(shift.startTime, shift.endTime);
                                    const roleBadge = getZaalRoleBadge(shift, emp);

                                    return (
                                      <div
                                        key={shift.id}
                                        className="p-2 rounded-lg border-2 border-slate-200 bg-slate-50/70 text-left leading-tight shadow-2xs"
                                      >
                                        <div className="flex items-center justify-between gap-1">
                                          <span className={`font-black text-slate-950 truncate ${
                                            fontSize === 'large' ? 'text-[13.5px]' : 'text-[12px]'
                                          }`}>
                                            {emp?.name || 'Onbekend'}
                                          </span>
                                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded shrink-0 border ${roleBadge.style}`}>
                                            {roleBadge.text}
                                          </span>
                                        </div>
                                        
                                        <div className={`font-black text-slate-850 flex items-center justify-between mt-1 ${
                                          fontSize === 'large' ? 'text-[12px]' : 'text-[10.5px]'
                                        }`}>
                                          <span>{shift.startTime} – {shift.endTime}</span>
                                          <span className="text-[9px] text-slate-500 font-bold">({hours}u)</span>
                                        </div>

                                        {shift.notes && (
                                          <div className="text-[9.5px] text-slate-700 italic font-medium truncate mt-0.5 border-t border-slate-200 pt-0.5">
                                            {shift.notes}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Keuken HACCP & Richtlijnen Blok (Voor aan de keukenmuur) */}
            {isKitchenMode && showKitchenChecklist && (
              <div className="border-2 border-slate-300 rounded-xl p-3 bg-slate-50/80 mb-3 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="font-black uppercase tracking-tight text-slate-900 flex items-center gap-1.5 text-[11px]">
                    <span>📋 Keuken HACCP & Sluitingsrichtlijnen (Café In De Molen)</span>
                  </h4>
                  <span className="text-[9px] font-black uppercase bg-orange-100 text-orange-950 border border-orange-200 px-2 py-0.5 rounded">
                    Dagelijkse controle
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-700 font-medium">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-black text-slate-900 block mb-0.5">1. Frigotemperatuur</span>
                    Temperatuurmeting koelingen en diepvries dagelijks registreren in logboek.
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-black text-slate-900 block mb-0.5">2. Kookapparatuur</span>
                    Frituurolie controleren/afdekken, bakplaten en fornuizen controleren bij sluit.
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-black text-slate-900 block mb-0.5">3. Hygiëne & Afwas</span>
                    Werkbladen en snijplanken desinfecteren; vaatwasser leeg en filters schoon.
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-black text-slate-900 block mb-0.5">4. Noodgeval & Wacht</span>
                    Bij ziektes of calamiteiten direct Hans bellen op 016/46.13.00.
                  </div>
                </div>
              </div>
            )}

            {/* Summary Table: Employee Total Hours Breakdown for the Week */}
            {showSummaryTable && employeeStats.length > 0 && (
              <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/70 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-xs uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                    <Users size={14} className="text-orange-600" />
                    <span>Urenoverzicht per Medewerker ({employeeStats.length} personeelsleden)</span>
                  </h3>
                  <span className="text-[10.5px] text-slate-700 font-extrabold">
                    Totaal weekvolume: {Math.round(employeeStats.reduce((acc, curr) => acc + curr.totalHours, 0))} uur
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {employeeStats.map(stat => (
                    <div 
                      key={stat.employee.id} 
                      className="bg-white border border-slate-200 rounded-lg p-1.5 text-left leading-tight"
                    >
                      <div className="font-black text-slate-900 text-[11px] truncate">
                        {stat.employee.name}
                      </div>
                      <div className="text-[10px] text-slate-600 flex items-center justify-between mt-0.5">
                        <span>{stat.shiftCount} {stat.shiftCount === 1 ? 'dienst' : 'diensten'}</span>
                        <span className="font-black text-orange-700">{stat.totalHours}u</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Print Footer */}
            <div className="border-t-2 border-slate-300 pt-2 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-medium">
              <div>
                <strong>Eet-staminée In De Molen</strong> • Café Planning & Communicatie Portaal
              </div>
              <div className="mt-0.5 sm:mt-0 font-bold">
                Afdrukdatum: {new Date().toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Bottom Action Bar (Hidden during print) */}
        <div className="bg-white border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-bold text-slate-800">💡 Tip voor de keuken:</span>
            <span>Gebruik <strong>A4 Liggend (Landscape)</strong> voor een strakke weergave op het magneetbord of de keukenmuur.</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
            >
              Sluiten
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight flex items-center gap-2 shadow-lg shadow-orange-100 transition active:scale-95 cursor-pointer"
            >
              <Printer size={16} />
              <span>Print PDF (Afdrukken)</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
