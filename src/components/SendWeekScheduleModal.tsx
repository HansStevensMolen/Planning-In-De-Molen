import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  Share2, 
  Bell, 
  Printer, 
  Download,
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  Users,
  Check,
  ChevronRight,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Shift, Employee, Notice } from '../types';
import { CURRENT_WEEK_NUMBER, getWeekMeta } from '../utils/weekUtils';
import { downloadInDeMolenPdf } from '../utils/inDeMolenPdfGenerator';

interface SendWeekScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWeeks: number[];
  initialWeek: number;
  shifts: Shift[];
  employees: Employee[];
  onShareWhatsAppSchedule?: (weekNumber: number) => void;
  onOpenNotificationModal: (weekNumber: number) => void;
  onPublishAllDrafts: (weekNumber?: number) => void;
  onPostNotice?: (title: string, content: string, category: 'planning' | 'wijziging' | 'algemeen') => void;
  onOpenPrintModal?: () => void;
}

export default function SendWeekScheduleModal({
  isOpen,
  onClose,
  activeWeeks,
  initialWeek,
  shifts,
  employees,
  onShareWhatsAppSchedule,
  onOpenNotificationModal,
  onPublishAllDrafts,
  onPostNotice,
  onOpenPrintModal
}: SendWeekScheduleModalProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [sentNoticeToast, setSentNoticeToast] = useState<string | null>(null);

  if (!isOpen) return null;

  // Metadata of selected week
  const weekMeta = getWeekMeta(selectedWeek);

  // Shifts stats for the selected week
  const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
  const publishedShifts = weekShifts.filter(s => s.status === 'published');
  const draftShifts = weekShifts.filter(s => s.status === 'draft');
  const confirmedShifts = publishedShifts.filter(s => s.acknowledged);

  // Scheduled employees for this week
  const scheduledEmpIds = Array.from(new Set(publishedShifts.map(s => s.employeeId)));
  const scheduledEmployees = employees.filter(e => scheduledEmpIds.includes(e.id));

  const handleBroadcastNotice = () => {
    if (onPostNotice) {
      const title = `📢 Planning Week ${selectedWeek} (${weekMeta.dateRange}) staat online!`;
      const content = `Beste teamleden, de officiële diensten voor Week ${selectedWeek} (${weekMeta.dateRange}) zijn definitief gepubliceerd. Bekijk je ingeplande uren in het portaal en bevestig je diensten als 'Gezien'!\n\nGroeten,\nHans`;
      onPostNotice(title, content, 'planning');
      setSentNoticeToast(`Notificatie voor Week ${selectedWeek} succesvol geplaatst op het prikbord en verzonden naar het personeel!`);
      setTimeout(() => setSentNoticeToast(null), 4000);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-emerald-300 overflow-hidden text-left animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col cursor-default"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6 relative shrink-0 shadow-md">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition cursor-pointer"
            title="Sluiten"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner shrink-0">
              <Send size={24} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 bg-white/20 px-2.5 py-0.5 rounded-full">
                  Planning Communicatie
                </span>
                <span className="bg-white text-emerald-800 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs">
                  Week {selectedWeek} Geselecteerd
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-1 text-white">
                Shiften Naar Het Personeel Sturen
              </h2>
            </div>
          </div>
          <p className="text-xs text-emerald-100 mt-2 font-medium max-w-xl">
            Kies hieronder van <strong>welke week</strong> je de shiften wilt versturen. Kies vervolgens hoe je het personeel wilt informeren: via WhatsApp, de interactieve notificatiehub of een directe mededeling in het personeelsportaal.
          </p>
        </div>

        {/* Success Toast */}
        {sentNoticeToast && (
          <div className="bg-emerald-50 border-b border-emerald-300 p-3.5 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in slide-in-from-top-2 shrink-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{sentNoticeToast}</span>
          </div>
        )}

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. WEEK KIEZEN */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
                <CalendarIcon size={15} className="text-emerald-600" />
                <span>1. Kies van welke week je de shiften wilt sturen:</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {activeWeeks.length} beschikbare weken
              </span>
            </div>

            {/* Grid of Weeks to choose from */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {activeWeeks.map((weekNum) => {
                const isSelected = selectedWeek === weekNum;
                const m = getWeekMeta(weekNum);
                const wShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === weekNum);
                const pubCount = wShifts.filter(s => s.status === 'published').length;
                const draftCount = wShifts.filter(s => s.status === 'draft').length;
                const isCurrent = weekNum === CURRENT_WEEK_NUMBER;
                const isNext = weekNum === CURRENT_WEEK_NUMBER + 1;

                return (
                  <button
                    key={weekNum}
                    type="button"
                    onClick={() => setSelectedWeek(weekNum)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 active:scale-95 shadow-2xs ${
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-500 ring-2 ring-emerald-200 shadow-sm'
                        : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-xs font-black uppercase ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                        Week {weekNum}
                      </span>
                      {isSelected ? (
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                          ✓
                        </span>
                      ) : isCurrent ? (
                        <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full">
                          Nu
                        </span>
                      ) : isNext ? (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full">
                          Volgende
                        </span>
                      ) : null}
                    </div>

                    <p className="text-[10px] text-slate-500 font-semibold truncate">
                      {m.dateRange}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                        pubCount > 0 ? 'bg-emerald-100 text-emerald-900' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {pubCount} live
                      </span>
                      {draftCount > 0 && (
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded-md">
                          {draftCount} draft
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. STATUS & INZICHT VAN GEKOZEN WEEK */}
          <div className="bg-slate-50 p-4 sm:p-4.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    Week {selectedWeek}: {weekMeta.label}
                  </h3>
                  <span className="text-xs text-slate-600 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {weekMeta.dateRange}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  <strong>{publishedShifts.length}</strong> gepubliceerde diensten verdeeld over <strong>{scheduledEmployees.length}</strong> medewerkers ({confirmedShifts.length} al bevestigd).
                </p>
              </div>

              {draftShifts.length > 0 && (
                <button
                  type="button"
                  onClick={() => onPublishAllDrafts(selectedWeek)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                  title="Publiceer alle ontwerp-diensten zodat personeel ze kan zien"
                >
                  <Sparkles size={14} />
                  <span>Publiceer {draftShifts.length} Concepten Nu</span>
                </button>
              )}
            </div>

            {draftShifts.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Let op:</span> Er staan nog {draftShifts.length} diensten in ontwerp/draft voor Week {selectedWeek}. Medewerkers zien deze pas nadat je ze publiceert!
                </div>
              </div>
            )}
          </div>

          {/* 3. VERZENDOPTIES NAAR HET PERSONEEL */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wide text-slate-800 flex items-center gap-2">
              <Send size={15} className="text-emerald-600" />
              <span>2. Hoe wil je de shiften van Week {selectedWeek} versturen?</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Kanaal A: WhatsApp Teamgroep */}
              <div className="p-4.5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-400 bg-gradient-to-br from-emerald-50/70 via-white to-white transition-all shadow-xs flex flex-col justify-between gap-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <MessageSquare size={16} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-emerald-950">
                      WhatsApp Teamgroep
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Deel Rooster Week {selectedWeek} op WhatsApp
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Stuurt direct een kant-en-klaar overzicht van alle diensten en tijden naar de WhatsApp personeelsgroep of chat.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onShareWhatsAppSchedule) {
                      onShareWhatsAppSchedule(selectedWeek);
                      onClose();
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare size={14} />
                  <span>Stuur Week {selectedWeek} via WhatsApp 💬</span>
                </button>
              </div>

              {/* Kanaal B: Notificatie Hub (Persoonlijke Berichten & Kalenders) */}
              <div className="p-4.5 rounded-2xl border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50/70 via-white to-white transition-all shadow-xs flex flex-col justify-between gap-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-800">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Share2 size={16} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-blue-950">
                      Notificatie Hub (Individueel)
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Persoonlijk Notificeren & Agenda Sync
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Stuur 1-op-1 WhatsApp berichten naar ingeplande medewerkers of exporteer diensten naar Outlook, Google en Apple Agenda.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onOpenNotificationModal(selectedWeek);
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Open Notificatie Hub (Week {selectedWeek}) 📲</span>
                </button>
              </div>

              {/* Kanaal C: Directe Prikbord/Portaal-Notificatie */}
              <div className="p-4.5 rounded-2xl border-2 border-orange-200 hover:border-orange-400 bg-gradient-to-br from-orange-50/70 via-white to-white transition-all shadow-xs flex flex-col justify-between gap-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-orange-800">
                    <div className="w-8 h-8 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bell size={16} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-orange-950">
                      In-App Mededeling & Banner
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Plaats Directe Melding in Portaal
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Plaatst een officiële mededeling op het mededelingenbord en toont een banner op alle telefoons van het personeel.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBroadcastNotice}
                  className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Bell size={14} />
                  <span>Stuur In-App Notificatie (Week {selectedWeek}) 📢</span>
                </button>
              </div>

              {/* Kanaal D: Print Weekrooster PDF */}
              <div className="p-4.5 rounded-2xl border-2 border-slate-200 hover:border-slate-400 bg-gradient-to-br from-slate-50 via-white to-white transition-all shadow-xs flex flex-col justify-between gap-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Download size={16} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-tight text-slate-900">
                      A4 Print / PDF Weekplanning
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    PDF Weekplanning Week {selectedWeek}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Download de weekplanning in de officiële In De Molen layout (7 pagina's A4 Liggend met oranje headers en 30-minuten tijdsblokken).
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const weekShifts = shifts.filter(s => (s.weekNumber || CURRENT_WEEK_NUMBER) === selectedWeek);
                      downloadInDeMolenPdf(selectedWeek, employees, weekShifts);
                      setSentNoticeToast(`PDF Weekplanning voor Week ${selectedWeek} (7 pagina's in officiële layout) is succesvol gedownload!`);
                    }}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    title={`Download direct de complete Week ${selectedWeek} planning als PDF in de officiële In De Molen layout`}
                  >
                    <Download size={14} />
                    <span>Download PDF (Origineel) 📥</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenPrintModal) {
                        onOpenPrintModal();
                        onClose();
                      }
                    }}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-tight rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title="Open het print- en voorvertoningsvenster"
                  >
                    <Printer size={14} />
                    <span>Print / Bekijk 🖨️</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 Je kunt op elk moment opnieuw een andere week selecteren en versturen.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer active:scale-95 shrink-0"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
