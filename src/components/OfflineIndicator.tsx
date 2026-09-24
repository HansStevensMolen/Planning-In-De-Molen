import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-xl border border-amber-400 animate-in slide-in-from-bottom duration-300">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <WifiOff size={14} className="shrink-0" />
      <span>Offline modus — Lokale gegevens blijven beschikbaar</span>
    </div>
  );
};
