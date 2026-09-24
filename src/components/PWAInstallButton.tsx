import React, { useState } from 'react';
import { Smartphone, Download, Apple, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import SmartphoneInstallModal from './SmartphoneInstallModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'badge' | 'compact' | 'banner';
  sharedUrl?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
  sharedUrl
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA, hide install prompt
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    // If native Chromium/Android prompt is ready, try direct prompt
    if (isInstallable) {
      setInstalling(true);
      const outcome = await install();
      setInstalling(false);
      if (!outcome) {
        // If dismissed or on desktop, still offer modal
        setShowModal(true);
      }
      return;
    }
    // Otherwise (iOS, Safari, Firefox, or unsupported prompt), show guide modal
    setShowModal(true);
  };

  // Header button variant (prominent yet sleek)
  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          id="btn-pwa-install-header"
          disabled={installing}
          className={`px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black uppercase transition-all tracking-tight active:scale-95 flex items-center space-x-1.5 shadow-md shadow-amber-500/20 cursor-pointer ${className}`}
          title="Zet de app op je smartphone (Android en iPhone / iPad)"
        >
          {isIOS ? (
            <Apple size={15} />
          ) : isInstallable ? (
            <Download size={15} className="animate-bounce" />
          ) : (
            <Smartphone size={15} />
          )}
          <span>{isIOS ? 'App op iPhone 🍏' : 'App op Smartphone 📱'}</span>
        </button>

        <SmartphoneInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sharedUrl={sharedUrl}
          defaultTab={isIOS ? 'ios' : 'android'}
        />
      </>
    );
  }

  // Compact variant for toolbars / portal sections
  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl text-xs font-black uppercase transition flex items-center gap-1.5 border border-orange-300 ${className}`}
          title="Zet als app op je telefoon"
        >
          <Smartphone size={14} className="text-orange-600" />
          <span>App op Telefoon</span>
        </button>

        <SmartphoneInstallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          sharedUrl={sharedUrl}
          defaultTab={isIOS ? 'ios' : 'android'}
        />
      </>
    );
  }

  // Banner variant for portal home or login
  return (
    <>
      <div className={`p-3.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white shadow-md flex items-center justify-between gap-3 ${className}`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl">
            <Smartphone size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black">Zet deze planner als app op je telefoon!</h4>
            <p className="text-[11px] text-orange-100">
              Directe toegang, rooster checken & push-meldingen voor Android & iOS.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="px-3.5 py-2 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs uppercase rounded-xl shadow transition shrink-0 active:scale-95"
        >
          {isIOS ? 'Bekijk iPhone Gids' : isInstallable ? 'Direct Installeren' : 'Bekijk Uitleg'}
        </button>
      </div>

      <SmartphoneInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        sharedUrl={sharedUrl}
        defaultTab={isIOS ? 'ios' : 'android'}
      />
    </>
  );
};
