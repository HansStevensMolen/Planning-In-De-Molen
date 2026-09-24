import React, { useState } from 'react';
import { 
  Smartphone, 
  Apple, 
  X, 
  Check, 
  Copy, 
  Share2, 
  Download, 
  Sparkles, 
  Bell, 
  Zap, 
  CheckCircle2, 
  ExternalLink,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import InDeMolenLogo from './InDeMolenLogo';

interface SmartphoneInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharedUrl?: string;
  defaultTab?: 'android' | 'ios';
}

export default function SmartphoneInstallModal({
  isOpen,
  onClose,
  sharedUrl,
  defaultTab = 'android'
}: SmartphoneInstallModalProps) {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(
    isIOS ? 'ios' : (defaultTab || 'android')
  );
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  const currentUrl = sharedUrl || (typeof window !== 'undefined' ? window.location.href : 'https://in-de-molen.app');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = currentUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      onClose();
    }
  };

  const whatsappText = encodeURIComponent(
    `Hallo collega! ☕ Installeer de "In De Molen" app op je smartphone (Android of iPhone) via deze link:\n${currentUrl}\n\nZo heb je altijd met 1 tik je rooster bij de hand en mis je geen enkele dienst!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border-2 border-orange-100 relative max-h-[92vh] overflow-y-auto"
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
        <div className="flex items-center justify-between gap-3 mb-5 pr-8">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 text-white rounded-2xl shadow-md shadow-orange-500/25 shrink-0">
              <Smartphone size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  PWA • Progressive Web App
                </span>
                {isInstalled && (
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Reeds geïnstalleerd!</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
                App op je Smartphone zetten
              </h2>
              <p className="text-xs text-slate-500">
                Werkt direct op zowel <strong className="text-slate-700">Android</strong> als <strong className="text-slate-700">iPhone / iPad</strong>
              </p>
            </div>
          </div>
          <div className="hidden sm:block shrink-0 bg-white p-1 rounded-xl border border-orange-200 shadow-xs">
            <InDeMolenLogo className="w-20 h-11" />
          </div>
        </div>

        {/* Value Proposition Pills */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 bg-orange-50/70 p-3 rounded-2xl border border-orange-100">
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-xs mb-1">
              <Zap size={16} />
            </div>
            <span className="text-[11px] font-black text-slate-800">Geen App Store</span>
            <span className="text-[10px] text-slate-500">Geen download nodig</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-xs mb-1">
              <Sparkles size={16} />
            </div>
            <span className="text-[11px] font-black text-slate-800">Volledig scherm</span>
            <span className="text-[10px] text-slate-500">Als een echte app</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-xs mb-1">
              <Bell size={16} />
            </div>
            <span className="text-[11px] font-black text-slate-800">Push-meldingen</span>
            <span className="text-[10px] text-slate-500">Herinneringen 24u voor dienst</span>
          </div>
        </div>

        {/* Fast Action: Native Install Button if supported right now */}
        {isInstallable && !isInstalled && (
          <div className="mb-5 p-4 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-lg shadow-orange-500/25 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-black flex items-center gap-1.5">
                <Sparkles size={16} />
                <span>Geschikte browser gedetecteerd!</span>
              </h4>
              <p className="text-xs text-orange-100 mt-0.5">
                Je kunt deze app nu met 1 klik toevoegen aan je startscherm.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNativeInstall}
              disabled={installing}
              className="px-4 py-2.5 bg-white hover:bg-orange-50 text-orange-700 text-xs font-black uppercase rounded-xl transition shadow active:scale-95 shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} />
              <span>{installing ? 'Bezig...' : 'Nu Direct Installeren'}</span>
            </button>
          </div>
        )}

        {/* Operating System Selector Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'android'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone size={16} className={activeTab === 'android' ? 'text-emerald-600' : ''} />
            <span>Android (Samsung / Pixel / etc.)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ios'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Apple size={16} className={activeTab === 'ios' ? 'text-blue-600' : ''} />
            <span>iPhone / iPad (iOS Safari)</span>
          </button>
        </div>

        {/* Android Tab Content */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <span className="p-1.5 bg-emerald-200 text-emerald-800 rounded-lg shrink-0 mt-0.5 font-black text-[11px]">
                🤖
              </span>
              <div>
                <p className="font-bold text-slate-800">
                  Android ondersteunt PWA's 100% automatisch:
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Werkt in Google Chrome, Samsung Internet, Edge, Firefox en Brave.
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Open de app-link op je telefoon</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Open de link in Google Chrome of je standaard browser.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Tik op de 3 puntjes (⋮) of de installatieknop</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Rechtsboven in de adresbalk van Chrome zie je vaak direct een installatie-icoon, of tik op de menu-knop <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">⋮</code>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Kies "App installeren" of "Toevoegen aan startscherm"</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tik op <strong className="text-emerald-700">"Installeren"</strong>. Het "In De Molen" app-icoontje verschijnt binnen enkele seconden op je startscherm!
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* iOS / iPhone Tab Content */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
              <span className="p-1.5 bg-blue-200 text-blue-800 rounded-lg shrink-0 mt-0.5 font-black text-[11px]">
                🍏
              </span>
              <div>
                <p className="font-bold text-slate-800">
                  Instructies voor Apple iPhone & iPad (Safari):
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Apple staat installatie toe via de officiële <strong className="text-blue-800">Safari</strong> browser in 2 eenvoudige tikken.
                </p>
              </div>
            </div>

            <ol className="space-y-3">
              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Open de planning in Safari</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Zorg dat je de link in de officiële <strong className="text-slate-700">Safari</strong> browser van je iPhone opent (niet in WhatsApp in-app browser).
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Tik op de 'Deel'-knop onderaan</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Dit is het vierkantje met het pijltje omhoog ( <span className="font-bold text-blue-700">⎋ / ⇪</span> ) in de menubalk van Safari.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Kies "Zet op beginscherm" (Add to Home Screen)</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Scroll iets naar beneden in het menu en tik op <strong className="text-blue-700">"Zet op beginscherm" ⊞</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                  4
                </span>
                <div className="text-xs text-slate-700">
                  <p className="font-bold text-slate-900">Tik rechtsboven op "Voeg toe"</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Klaar! De app staat nu met het officiële <strong className="text-orange-600">In De Molen</strong> icoontje op je iPhone startscherm.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Share Link & WhatsApp Section */}
        <div className="mt-5 pt-5 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Deel met collega's om op hun telefoon te zetten:</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none focus:border-orange-500"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase rounded-xl flex items-center gap-1.5 shadow transition active:scale-95 shrink-0"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Gekopieerd!' : 'Kopieer'}</span>
            </button>
          </div>

          <a
            href={`https://wa.me/?text=${whatsappText}`}
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <MessageSquare size={16} />
            <span>Stuur App-link via WhatsApp naar het Team 💬</span>
          </a>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black text-xs uppercase transition"
          >
            Begrepen & Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
