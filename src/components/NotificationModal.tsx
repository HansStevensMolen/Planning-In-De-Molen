import React, { useState } from 'react';
import { Employee, Shift, Department } from '../types';
import { 
  generateWhatsAppUrl, 
  generateTeamWhatsAppSummary, 
  generateMailtoUrl, 
  generateIcsCalendarContent, 
  downloadIcsFile,
  generateOutlookWebUrl,
  generateGoogleCalendarUrl,
  exportEmployeeToAppleCalendar,
  exportEmployeeToGoogleCalendarICS,
  exportEmployeeToOutlook
} from '../utils/notificationUtils';
import { 
  Send, 
  Calendar as CalendarIcon, 
  Mail, 
  MessageSquare, 
  Check, 
  Copy, 
  Download, 
  ExternalLink, 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Smartphone,
  Share2,
  Users,
  Filter,
  CheckCheck,
  CheckSquare
} from 'lucide-react';
import { sortEmployeesByFirstName } from '../utils/employeeSortUtils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  shifts: Shift[];
  weekNumber: number;
  onMarkNotified: (employeeIds: string[], type: 'email' | 'whatsapp' | 'both') => void;
}

export default function NotificationModal({
  isOpen,
  onClose,
  employees,
  shifts,
  weekNumber,
  onMarkNotified
}: NotificationModalProps) {
  const [activeTab, setActiveTab] = useState<'individual' | 'team_whatsapp' | 'outlook_calendar'>('individual');
  const [deptFilter, setDeptFilter] = useState<'all' | Department>('all');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter published shifts for week
  const publishedShifts = shifts.filter(s => s.status === 'published');
  
  // Get all employees that actually have at least 1 shift scheduled
  const scheduledEmployeeIds = Array.from(new Set(publishedShifts.map(s => s.employeeId)));
  const scheduledEmployees = employees.filter(e => scheduledEmployeeIds.includes(e.id));

  // Filter by selected department if needed
  const displayEmployees = sortEmployeesByFirstName(
    scheduledEmployees.filter(e => {
      if (deptFilter === 'all') return true;
      return (e.department || 'zaal') === deptFilter;
    })
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleDownloadAllIcs = (calendarType: 'google' | 'apple' | 'outlook' | 'universal' = 'universal') => {
    // Generate combined .ics for all scheduled employees
    let combinedContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//In De Molen//Personeelsplanning//NL',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:Volledig Werkrooster In De Molen - Week ${weekNumber}`
    ];

    displayEmployees.forEach(emp => {
      const singleIcs = generateIcsCalendarContent(emp, publishedShifts, weekNumber);
      const eventsOnly = singleIcs.split('\r\n').filter(line => 
        !line.startsWith('BEGIN:VCALENDAR') && 
        !line.startsWith('VERSION:') && 
        !line.startsWith('PRODID:') && 
        !line.startsWith('CALSCALE:') && 
        !line.startsWith('METHOD:') && 
        !line.startsWith('X-WR-CALNAME:') && 
        !line.startsWith('END:VCALENDAR')
      );
      combinedContent.push(...eventsOnly);
    });

    combinedContent.push('END:VCALENDAR');
    const filename = calendarType === 'google'
      ? `InDeMolen_Google_Agenda_Week${weekNumber}.ics`
      : calendarType === 'apple'
      ? `InDeMolen_Apple_Agenda_Week${weekNumber}.ics`
      : calendarType === 'outlook'
      ? `InDeMolen_Outlook_Week${weekNumber}.ics`
      : `InDeMolen_Rooster_Week${weekNumber}_AlleMedewerkers.ics`;
    downloadIcsFile(filename, combinedContent.join('\r\n'));
  };

  const handleBatchNotify = (method: 'email' | 'whatsapp' | 'both') => {
    const ids = displayEmployees.map(e => e.id);
    onMarkNotified(ids, method);
    setBatchSuccessMessage(`Notificaties gemarkeerd als verzonden naar ${ids.length} medewerkers!`);
    setTimeout(() => setBatchSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-orange-200 overflow-hidden my-4 text-left">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
              <Share2 size={24} className="text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-100">
                Communicatie & Notificatie Hub • Week {weekNumber}
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">
                Personeel Informeren (WhatsApp, Google, Apple, Outlook & E-mail)
              </h2>
            </div>
          </div>
          <p className="text-xs text-orange-100 mt-2 max-w-2xl font-medium">
            Laat medewerkers met één klik weten wanneer ze ingepland staan. Stuur directe WhatsApp berichten, exporteer naar Google Agenda, Apple Agenda of Outlook, of verstuur een kant-en-klaar e-mailoverzicht.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="bg-orange-50/70 border-b border-orange-100 p-2 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'individual'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-orange-100/50'
              }`}
            >
              <Smartphone size={14} />
              <span>Per Medewerker (WhatsApp & Mail)</span>
            </button>
            <button
              onClick={() => setActiveTab('team_whatsapp')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'team_whatsapp'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-orange-100/50'
              }`}
            >
              <MessageSquare size={14} />
              <span>WhatsApp Groepsbericht</span>
            </button>
            <button
              onClick={() => setActiveTab('outlook_calendar')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'outlook_calendar'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-orange-100/50'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Agenda (Google, Apple & Outlook)</span>
            </button>
          </div>

          {/* Department filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter size={12} className="text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value as any)}
              className="bg-white border border-orange-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Alle afdelingen ({scheduledEmployees.length})</option>
              <option value="zaal">🍽️ Zaal ({scheduledEmployees.filter(e => (e.department || 'zaal') === 'zaal').length})</option>
              <option value="keuken">🍳 Keuken ({scheduledEmployees.filter(e => e.department === 'keuken').length})</option>
            </select>
          </div>
        </div>

        {batchSuccessMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-extrabold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{batchSuccessMessage}</span>
          </div>
        )}

        {/* Tab 1: Per Medewerker overzicht */}
        {activeTab === 'individual' && (
          <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
            
            {/* Quick Bulk Action bar */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight text-amber-950">
                  ⚡ Snelle Batch Notificatie (Week {weekNumber})
                </h4>
                <p className="text-[11px] text-amber-800 font-medium">
                  Markeer alle {displayEmployees.length} getoonde medewerkers als genotificeerd in het systeemlogboek:
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleBatchNotify('both')}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCheck size={14} />
                  <span>Notificeer Allen</span>
                </button>
              </div>
            </div>

            {/* List of employees */}
            <div className="space-y-2.5">
              {displayEmployees.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                  Geen medewerkers ingepland voor dit filter.
                </div>
              ) : (
                displayEmployees.map(emp => {
                  const empShifts = publishedShifts.filter(s => s.employeeId === emp.id);
                  const isAcknowledged = empShifts.length > 0 && empShifts.every(s => s.acknowledged);
                  const waUrl = generateWhatsAppUrl(emp, publishedShifts, weekNumber, window.location.href);
                  const mailtoUrl = generateMailtoUrl(emp, publishedShifts, weekNumber, window.location.href);
                  const isKitchen = emp.department === 'keuken';

                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-50 hover:bg-orange-50/30 border border-slate-200 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 transition"
                    >
                      <div className="flex items-center space-x-3 min-w-[200px]">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white uppercase shadow-sm border border-white"
                          style={{ backgroundColor: emp.color }}
                        >
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-800">{emp.name}</span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                              isKitchen ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isKitchen ? 'Keuken' : 'Zaal'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>📞 {emp.phone || 'Geen nummer'}</span>
                            <span>✉️ {emp.email || 'Geen mail'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Shifts info & status badge */}
                      <div className="flex items-center gap-3">
                        <div className="text-left md:text-right">
                          <span className="text-xs font-black text-orange-600 block">
                            {empShifts.length} dienst(en)
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {empShifts.map(s => ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'][s.day]).join(', ')}
                          </span>
                        </div>

                        <div>
                          {isAcknowledged ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <Check size={11} className="stroke-[3]" /> Akkoord
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={11} /> Te Bevestigen
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Direct action buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {/* WhatsApp button */}
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                          title="Open WhatsApp chat met vooringevuld werkrooster"
                        >
                          <Smartphone size={13} />
                          <span>WhatsApp</span>
                        </a>

                        {/* Email button */}
                        <a
                          href={mailtoUrl}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                          title="Open e-mail met vooringevuld rooster"
                        >
                          <Mail size={13} />
                          <span>E-mail</span>
                        </a>

                        {/* Calendar .ics download */}
                        <button
                          type="button"
                          onClick={() => {
                            const ics = generateIcsCalendarContent(emp, publishedShifts, weekNumber);
                            downloadIcsFile(`InDeMolen_${emp.name.replace(/\s+/g, '_')}_Week${weekNumber}.ics`, ics);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Download kalenderbestand (.ics) - compatibel met Google Agenda, Apple Agenda en Outlook"
                        >
                          <Download size={13} />
                          <span className="hidden sm:inline">Agenda (.ics)</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* Tab 2: WhatsApp Team Group message */}
        {activeTab === 'team_whatsapp' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-700">
                  Kies afdeling voor groepsbericht:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDeptFilter('zaal')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      deptFilter === 'zaal' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border'
                    }`}
                  >
                    🍽️ Zaal Groep
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptFilter('keuken')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      deptFilter === 'keuken' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border'
                    }`}
                  >
                    🍳 Keuken Groep
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeptFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      deptFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-slate-600 border'
                    }`}
                  >
                    Alles Samen
                  </button>
                </div>
              </div>

              {/* Message preview */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner max-h-72 overflow-y-auto">
                {generateTeamWhatsAppSummary(
                  employees,
                  publishedShifts,
                  weekNumber,
                  deptFilter === 'all' ? 'alles' : deptFilter
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <p className="text-[11px] text-slate-500">
                  💡 Tip: Kopieer dit bericht en plak het direct in jullie WhatsApp team-groep!
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = generateTeamWhatsAppSummary(
                        employees,
                        publishedShifts,
                        weekNumber,
                        deptFilter === 'all' ? 'alles' : deptFilter
                      );
                      handleCopy(msg, 'team_msg');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    {copiedText === 'team_msg' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedText === 'team_msg' ? 'Gekopieerd!' : 'Kopieer voor WhatsApp'}</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      generateTeamWhatsAppSummary(
                        employees,
                        publishedShifts,
                        weekNumber,
                        deptFilter === 'all' ? 'alles' : deptFilter
                      )
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition flex items-center gap-1.5"
                  >
                    <ExternalLink size={14} />
                    <span>Open in WhatsApp Web</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Calendar Integrations (Google, Apple & Outlook) */}
        {activeTab === 'outlook_calendar' && (
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
            
            {/* Intro banner */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-blue-50 border-2 border-orange-200 rounded-2xl p-5">
              <div className="flex items-center space-x-3 text-slate-800">
                <CalendarIcon size={26} className="text-orange-600 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm uppercase tracking-tight text-slate-900">Agenda Koppelingen: Google Agenda, Apple Agenda & Outlook</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Alle werkdiensten van Eet-staminée In De Molen worden geëxporteerd via het universele <strong>.ics (iCalendar)</strong> formaat. Dit formaat wordt native ondersteund door zowel <strong>Google Agenda (Gmail)</strong>, <strong>Apple Agenda (iOS & Mac)</strong> als <strong>Microsoft Outlook</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Dedicated Calendar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card 1: Google Agenda (Gmail) */}
              <div className="bg-white border-2 border-red-100 hover:border-red-300 rounded-2xl p-4.5 shadow-sm space-y-3 text-left transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔴</span>
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-tight">Google Agenda (Gmail)</h5>
                    </div>
                    <span className="text-[9px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-200">Gmail / Android</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Importeer alle shifts in je Google Agenda. Zichtbaar op Android, iPhone (Google Calendar app) en browser.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadAllIcs('google')}
                    className="w-full px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span>Download voor Google Agenda</span>
                  </button>

                  <a
                    href="https://calendar.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Open Google Agenda Web</span>
                  </a>
                </div>
              </div>

              {/* Card 2: Apple Agenda (iPhone / iPad / Mac) */}
              <div className="bg-white border-2 border-slate-200 hover:border-slate-400 rounded-2xl p-4.5 shadow-sm space-y-3 text-left transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🍏</span>
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-tight">Apple Agenda</h5>
                    </div>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-300">iPhone / Mac</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Op iPhone, iPad of Mac opent dit bestand direct de native Apple Agenda app met automatische herinneringen 1 uur vooraf.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadAllIcs('apple')}
                    className="w-full px-3 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span>Download voor Apple Agenda</span>
                  </button>
                  <div className="text-[10px] text-slate-400 font-medium text-center">
                    Tik op iPhone/Mac op "Voeg alle toe"
                  </div>
                </div>
              </div>

              {/* Card 3: Microsoft Outlook */}
              <div className="bg-white border-2 border-blue-100 hover:border-blue-300 rounded-2xl p-4.5 shadow-sm space-y-3 text-left transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔷</span>
                      <h5 className="text-xs font-black uppercase text-slate-900 tracking-tight">Microsoft Outlook</h5>
                    </div>
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">Outlook 365</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Geschikt voor Outlook desktop, Outlook voor Mac en Outlook Web. Synchroniseert shifts direct naar je agenda.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadAllIcs('outlook')}
                    className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-tight shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download size={14} />
                    <span>Download voor Outlook</span>
                  </button>

                  <a
                    href="https://outlook.live.com/calendar/"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-[11px] font-bold tracking-tight transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Open Outlook Web Agenda</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Instruction block for Staff & Manager */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-left">
              <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">Hoe werkt de agenda koppeling voor medewerkers?</h5>
              <ul className="text-xs text-slate-600 space-y-2 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">1.</span>
                  <span>Medewerkers kunnen in hun <strong>Personeelsportaal</strong> met 1 klik hun persoonlijke diensten exporteren naar <strong>Google Agenda</strong>, <strong>Apple Agenda</strong> of <strong>Outlook</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">2.</span>
                  <span>Op <strong>Apple apparaten (iPhone/Mac)</strong> opent het bestand automatisch de ingebouwde Agenda-app.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">3.</span>
                  <span>Voor <strong>Google Agenda (Gmail)</strong> kunnen medewerkers een individuele shift direct openen in Google Calendar of het volledige weekbestand importeren.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">4.</span>
                  <span>Elke shift bevat de afdeling (Zaal/Keuken), start- en eindtijd, restaurantlocatie en een <strong>automatische herinnering 1 uur vooraf</strong>.</span>
                </li>
              </ul>
            </div>

          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-bold">
            Eet-staminée In De Molen • Notificatiesysteem
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
}
