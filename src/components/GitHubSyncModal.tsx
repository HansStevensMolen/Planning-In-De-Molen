import React, { useState } from 'react';
import { Download, ExternalLink, X, Check, Copy, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const gitCommands = `git remote add origin https://github.com/JOUW-GEBRUIKERSNAAM/cafe-in-de-molen.git\ngit branch -M main\ngit push -u origin main`;

  const handleCopy = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/20">
              🐙
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>GitHub Synchronisatie & Export</span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                Café In De Molen • Volledige broncode back-up & GitHub koppeling
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 text-left">
          
          {/* Snelle Oplossing Banner: Waarom lukt het niet direct? */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-xs space-y-2 text-amber-950 shadow-xs">
            <div className="flex items-center gap-2 font-black uppercase tracking-tight text-amber-900 text-xs">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <span>Waarom lukt de synchronisatie met GitHub soms niet direct?</span>
            </div>
            <p className="text-amber-800 font-medium leading-relaxed">
              In Google AI Studio wordt het GitHub venster geopend via een browser pop-up. Heel vaak blokkeert Google Chrome, Safari of Edge deze pop-up automatisch.
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-1">
              <p className="font-bold text-slate-800 text-[11px]">💡 Snelle browser check:</p>
              <ul className="list-disc list-inside text-[11px] text-slate-700 space-y-0.5">
                <li>Kijk rechtsboven in je browser adresbalk naar een icoontje met een rood kruisje (geblokkeerde pop-up).</li>
                <li>Klik erop en selecteer: <strong>"Pop-ups en omleidingen altijd toestaan van deze site"</strong>.</li>
                <li>Klik daarna opnieuw op de GitHub-knop in de menubalk van AI Studio.</li>
              </ul>
            </div>
          </div>

          {/* Oplossing 1: 1-Klik Download van de volledige codebase ZIP */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-300 rounded-3xl p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">1</span>
                <h4 className="font-black text-sm uppercase tracking-tight text-emerald-950">
                  Directe 1-Klik Download (Veiligste Methode)
                </h4>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300">
                Aanbevolen
              </span>
            </div>
            <p className="text-xs text-emerald-900 font-medium leading-relaxed">
              Je hoeft niet afhankelijk te zijn van browser pop-ups. Download hier met 1 klik een schone, complete ZIP van alle bronbestanden (inclusief server, componenten, types en configuraties, zonder zware node_modules):
            </p>
            <div className="pt-1">
              <a
                href="/api/export-zip"
                download="cafe-in-de-molen-project.zip"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-tight rounded-2xl shadow-md transition active:scale-95 cursor-pointer text-decoration-none"
              >
                <Download size={16} />
                <span>Download Volledige Codebase (.ZIP) 📦</span>
              </a>
            </div>
            <p className="text-[11px] text-emerald-800 italic">
              Deze ZIP kun je vervolgens met 1 klik uploaden op <a href="https://github.com/new" target="_blank" rel="noreferrer" className="underline font-bold text-emerald-950">github.com/new</a> via de knop "uploading an existing file".
            </p>
          </div>

          {/* Oplossing 2: Git Command Line (voor ontwikkelaars) */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-700 text-white font-black text-xs flex items-center justify-center">2</span>
                <h4 className="font-black text-sm uppercase tracking-tight text-slate-800">
                  Via Git Commando's (Indien Git lokaal gebruikt wordt)
                </h4>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 flex items-center gap-1 transition cursor-pointer"
              >
                {copiedCmd ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copiedCmd ? 'Gekopieerd!' : 'Kopieer Commando\'s'}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-2xl font-mono text-[11px] overflow-x-auto select-all border border-slate-700">
              <pre className="whitespace-pre">{gitCommands}</pre>
            </div>
            <p className="text-[11px] text-slate-600">
              Vervang <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">JOUW-GEBRUIKERSNAAM</code> door je eigen GitHub accountnaam.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600 font-bold shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <ShieldCheck size={16} />
            <span>Git repository up-to-date</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black uppercase text-xs transition cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
};
