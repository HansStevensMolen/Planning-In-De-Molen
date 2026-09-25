import React, { useState } from 'react';
import { 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  Send, 
  Settings, 
  CheckCircle2, 
  Smartphone,
  Info,
  Facebook
} from 'lucide-react';
import { 
  buildWhatsAppWebShareUrl, 
  getStoredWhatsAppGroupLink, 
  setStoredWhatsAppGroupLink,
  getStoredMessengerLink,
  setStoredMessengerLink,
  buildMessengerUrl,
  isAutoWhatsAppPromptEnabled,
  setAutoWhatsAppPromptEnabled
} from '../utils/whatsappNotificationUtils';

export interface AutoWhatsAppModalData {
  isOpen: boolean;
  type: 'schedule_publish' | 'schedule_update' | 'notice_posted' | 'shift_change';
  title: string;
  subtitle: string;
  defaultMessage: string;
  targetPhone?: string;
  targetName?: string;
}

interface AutoWhatsAppModalProps {
  data: AutoWhatsAppModalData | null;
  onClose: () => void;
}

export default function AutoWhatsAppModal({ data, onClose }: AutoWhatsAppModalProps) {
  if (!data || !data.isOpen) return null;

  const [message, setMessage] = useState(data.defaultMessage);
  const [copied, setCopied] = useState(false);
  const [messengerCopiedToast, setMessengerCopiedToast] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [groupLink, setGroupLink] = useState(getStoredWhatsAppGroupLink());
  const [groupLinkSaved, setGroupLinkSaved] = useState(false);
  const [messengerLink, setMessengerLink] = useState(getStoredMessengerLink());
  const [messengerLinkSaved, setMessengerLinkSaved] = useState(false);
  const [autoPromptEnabled, setAutoPrompt] = useState(isAutoWhatsAppPromptEnabled());

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    const waUrl = buildWhatsAppWebShareUrl(message, data.targetPhone);
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMessenger = () => {
    // Copy text first so user can paste it immediately into Messenger
    navigator.clipboard.writeText(message);
    setMessengerCopiedToast(true);
    setTimeout(() => setMessengerCopiedToast(false), 4000);

    const mUrl = buildMessengerUrl(messengerLink);
    window.open(mUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSaveGroupLink = () => {
    setStoredWhatsAppGroupLink(groupLink);
    setGroupLinkSaved(true);
    setTimeout(() => setGroupLinkSaved(false), 2000);
  };

  const handleSaveMessengerLink = () => {
    setStoredMessengerLink(messengerLink);
    setMessengerLinkSaved(true);
    setTimeout(() => setMessengerLinkSaved(false), 2000);
  };

  const handleToggleAutoPrompt = (checked: boolean) => {
    setAutoPrompt(checked);
    setAutoWhatsAppPromptEnabled(checked);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 text-white p-5 sm:p-6 relative">
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition cursor-pointer"
            aria-label="Sluiten"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
              <CheckCircle2 size={12} className="text-emerald-300" />
              Direct in app geplaatst!
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 tracking-tight">
            <MessageSquare size={22} className="text-emerald-200 shrink-0" />
            <span>{data.title}</span>
          </h3>
          <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Target recipient banner if personal */}
          {data.targetName && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Smartphone size={16} className="text-emerald-600" />
                <span>Gericht aan: <strong>{data.targetName}</strong></span>
              </div>
              {data.targetPhone && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                  {data.targetPhone}
                </span>
              )}
            </div>
          )}

          {/* Toast alert if Messenger was clicked */}
          {messengerCopiedToast && (
            <div className="bg-blue-50 border-2 border-blue-400 text-blue-900 rounded-2xl p-3 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
              <span>
                📋 Bericht gekopieerd! Plak de tekst nu simpelweg in het geopende Messenger venster (Ctrl+V of lang ingedrukt houden).
              </span>
            </div>
          )}

          {/* Message Preview Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <span>Berichttekst</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-150">
                  Kant-en-klaar
                </span>
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 transition cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-emerald-600" />
                    <span className="text-emerald-600 font-bold">Gekopieerd!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Kopieer tekst</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={7}
                className="w-full text-xs font-sans p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-slate-800 leading-relaxed resize-none transition"
                placeholder="Typ een bericht..."
              />
            </div>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <Info size={11} className="text-slate-400" />
              <span>Je kunt deze tekst nog aanpassen voordat je verstuurt.</span>
            </p>
          </div>

          {/* Primary Action Buttons: WhatsApp & Messenger */}
          <div className="space-y-2 pt-1">
            {/* 1. WhatsApp Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-[0.98] cursor-pointer"
            >
              <Send size={18} />
              <span>
                {data.targetName 
                  ? `Stuur via WhatsApp naar ${data.targetName}` 
                  : '📲 Deel via WhatsApp'}
              </span>
              <ExternalLink size={14} className="opacity-70" />
            </button>

            {/* 2. Facebook Messenger Button */}
            <button
              type="button"
              onClick={handleOpenMessenger}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition active:scale-[0.98] cursor-pointer"
            >
              <Facebook size={18} />
              <span>
                {data.targetName
                  ? `Stuur via Messenger naar ${data.targetName}`
                  : '💬 Deel via Facebook Messenger'}
              </span>
              <ExternalLink size={14} className="opacity-70" />
            </button>
          </div>

          {/* Group Links Settings Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-between w-full py-1.5 transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Settings size={13} className="text-slate-400" />
                <span>Vaste groepslinks instellen (WhatsApp & Messenger)</span>
              </span>
              <span className="text-[10px] text-blue-600 font-bold">
                {showSettings ? 'Verberg' : 'Instellen'}
              </span>
            </button>

            {showSettings && (
              <div className="mt-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-150">
                {/* WhatsApp Group Link */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    WhatsApp Groepslink (bijv. https://chat.whatsapp.com/...)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={groupLink}
                      onChange={(e) => setGroupLink(e.target.value)}
                      placeholder="https://chat.whatsapp.com/..."
                      className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-emerald-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGroupLink}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {groupLinkSaved ? 'Opgeslagen!' : 'Opslaan'}
                    </button>
                  </div>
                </div>

                {/* Facebook Messenger Group / Chat Link */}
                <div className="space-y-1 pt-2 border-t border-slate-200">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Facebook Messenger Groep of Pagina (bijv. https://m.me/... of chatlink)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={messengerLink}
                      onChange={(e) => setMessengerLink(e.target.value)}
                      placeholder="https://m.me/..."
                      className="flex-1 text-xs p-2 bg-white border border-slate-200 rounded-xl focus:border-blue-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleSaveMessengerLink}
                      className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {messengerLinkSaved ? 'Opgeslagen!' : 'Opslaan'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Prompt Preference */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center justify-between text-xs">
            <span className="text-slate-600 text-[11px] font-medium pr-2">
              Toon dit venster automatisch bij updates en berichten
            </span>
            <input
              type="checkbox"
              checked={autoPromptEnabled}
              onChange={(e) => handleToggleAutoPrompt(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
