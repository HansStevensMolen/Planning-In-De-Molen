import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  MessageSquare, 
  ShieldCheck, 
  Cloud, 
  Users, 
  Smartphone, 
  Calendar,
  X,
  RefreshCw,
  Info,
  Apple,
  Download
} from 'lucide-react';
import SmartphoneInstallModal from './SmartphoneInstallModal';

interface ShareTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl: string;
  cloudSyncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  lastSyncTime?: string | null;
  onForceCloudSync?: () => Promise<void>;
  employeesCount: number;
  shiftsCount: number;
}

export default function ShareTeamModal({
  isOpen,
  onClose,
  sharedUrl,
  cloudSyncStatus,
  lastSyncTime,
  onForceCloudSync,
  employeesCount,
  shiftsCount
}: ShareTeamModalProps) {
  const [copied, setCopied] = useState(false);
  const [syncingManual, setSyncingManual] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [showSmartphoneModal, setShowSmartphoneModal] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = sharedUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hallo team In De Molen! ☕\n\nHier is de link naar ons digitale weekrooster en personeelsportaal:\n${sharedUrl}\n\n👉 Bekijk je ingeplande diensten voor de komende weken.\n👉 Bevestig je diensten als 'Gezien'.\n👉 Geef je beschikbaarheden tijdig door!\n\nGroeten,\nHans`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  const handleManualSync = async () => {
    if (!onForceCloudSync) return;
    try {
      setSyncingManual(true);
      setSyncSuccessMsg(null);
      await onForceCloudSync();
      setSyncSuccessMsg('Alle roosters en personeelsgegevens succesvol geüpload naar Google Cloud!');
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingManual(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border-2 border-orange-100 relative max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-md shadow-orange-500/20">
            <Share2 size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
              Delen met het Team & Cloud Opslag
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Hoe teamleden de planning bekijken en hoe gegevens veilig bewaard blijven
            </p>
          </div>
        </div>

        {/* Cloud Status Card */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Cloud size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black text-emerald-950 uppercase tracking-tight">
                    Google Cloud Firestore Verbonden
                  </span>
                </div>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Alle gegevens ({employeesCount} personeelsleden, {shiftsCount} diensten) worden veilig gesynchroniseerd.
                  {lastSyncTime && <span className="font-semibold ml-1">• Laatste sync: {lastSyncTime}</span>}
                </p>
              </div>
            </div>

            {onForceCloudSync && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncingManual}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition active:scale-95 shrink-0 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={syncingManual ? 'animate-spin' : ''} />
                <span>{syncingManual ? 'Synchroniseren...' : 'Nu Synchroniseren'}</span>
              </button>
            )}
          </div>

          {syncSuccessMsg && (
            <div className="mt-2.5 text-xs text-emerald-800 font-semibold flex items-center gap-1.5 bg-emerald-100/70 px-2.5 py-1.5 rounded-lg">
              <Check size={14} className="text-emerald-700 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* AI Studio Publication Notice Banner */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-5 text-amber-950">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-sm mt-0.5">
              💡
            </div>
            <div className="space-y-1.5 text-xs leading-relaxed">
              <div className="font-black uppercase tracking-tight text-amber-900 text-sm flex items-center gap-2">
                <span>Hoe zet u deze link online voor het team?</span>
                <span className="bg-amber-200 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">1-Klik Publiceren</span>
              </div>
              <p className="text-amber-900 font-medium">
                De app bevindt zich nu in uw persoonlijke werkomgeving. Om de deelbare link voor iedereen toegankelijk te maken:
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-1 text-amber-950 font-semibold">
                <li>
                  Klik <strong>rechtsboven in het scherm van Google AI Studio</strong> op de knop <strong className="bg-white border border-amber-300 px-1.5 py-0.5 rounded text-slate-800">"Share"</strong> (of "Delen").
                </li>
                <li>
                  Selecteer <strong>"Share app"</strong> en bevestig.
                </li>
                <li>
                  Google publiceert de app dan direct naar het web. Vanaf dat moment werkt onderstaande link voor ieder teamlid op elke smartphone of pc!
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Share Link Section */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center justify-between">
            <span>Deelbare Team-Link (Directe Toegang)</span>
            <span className="text-[11px] font-normal text-slate-400">Voor smartphone, tablet & pc</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={sharedUrl}
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2.5 text-xs md:text-sm font-mono text-slate-700 select-all focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Gekopieerd!' : 'Kopieer'}</span>
            </button>
            <a
              href={sharedUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition shrink-0"
              title="Open link in nieuw venster"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
            <span>🔗 Directe link: <span className="font-mono text-slate-700 font-bold">{sharedUrl}</span></span>
            <a 
              href={sharedUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="text-orange-600 hover:text-orange-700 font-bold hover:underline flex items-center gap-1"
            >
              <span>Test link in nieuw tabblad</span>
              <ExternalLink size={11} />
            </a>
          </p>
        </div>

        {/* WhatsApp Instant Share Button & Smartphone PWA Guide */}
        <div className="mb-6 space-y-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <MessageSquare size={18} />
            <span>Deel direct in de Team WhatsApp-Groep 💬</span>
          </a>

          <button
            type="button"
            onClick={() => setShowSmartphoneModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase rounded-2xl flex items-center justify-between shadow-md shadow-orange-500/15 transition active:scale-95 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Smartphone size={17} />
              <span>Hoe zet personeel dit als app op hun smartphone? (Android & iOS)</span>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px] tracking-normal font-bold">
              Bekijk Gids 📲
            </span>
          </button>
        </div>

        {/* Step-by-Step Explanation for Team Members */}
        <div className="bg-slate-50 rounded-2xl p-4 md:p-5 border border-slate-200 space-y-3.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Info size={14} className="text-orange-600" />
            <span>Hoe werkt het in de praktijk?</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs">
                1
              </div>
              <h4 className="text-xs font-black text-slate-800">Team opent de link</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Elk teamlid kan de link op hun smartphone openen zonder dat zij iets hoeven te installeren.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs">
                2
              </div>
              <h4 className="text-xs font-black text-slate-800">Personeel Portal</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Zij selecteren hun eigen naam. Daar zien ze hun uren, bevestigen ze diensten en vullen ze beschikbaarheid in.
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-black text-xs">
                3
              </div>
              <h4 className="text-xs font-black text-slate-800">Beheerder Beveiligd</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Het beheerpaneel is vergrendeld met je manager-e-mail en pincode <code className="font-mono text-orange-600 bg-orange-50 px-1 py-0.5 rounded">1234</code>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>
              <strong>Gegevensveiligheid:</strong> Alle wijzigingen worden automatisch realtime in de Cloud opgeslagen. Geen risico op dataverlies bij het wissen van browsergeschiedenis.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase rounded-xl transition active:scale-95"
          >
            Sluiten
          </button>
        </div>

        {/* Smartphone Install Guide Modal */}
        <SmartphoneInstallModal
          isOpen={showSmartphoneModal}
          onClose={() => setShowSmartphoneModal(false)}
          sharedUrl={sharedUrl}
        />
      </div>
    </div>
  );
}
