import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, MessageSquare, ChevronRight, Sparkles } from 'lucide-react';
import { Notice } from '../types';

interface InAppNotificationBannerProps {
  latestNotice: Notice | null;
  onViewNotice?: (notice: Notice) => void;
  onViewSchedule?: () => void;
}

export default function InAppNotificationBanner({
  latestNotice,
  onViewNotice,
  onViewSchedule
}: InAppNotificationBannerProps) {
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!latestNotice) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed in this session
    try {
      const storedDismissed = sessionStorage.getItem('dismissed_notice_id');
      if (storedDismissed === latestNotice.id) {
        setIsVisible(false);
        return;
      }
    } catch {
      // ignore
    }

    if (dismissedId !== latestNotice.id) {
      setIsVisible(true);
    }
  }, [latestNotice, dismissedId]);

  if (!isVisible || !latestNotice) return null;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setDismissedId(latestNotice.id);
    try {
      sessionStorage.setItem('dismissed_notice_id', latestNotice.id);
    } catch {
      // ignore
    }
  };

  const isPlanning = latestNotice.category === 'planning' || latestNotice.category === 'wijziging';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-3 animate-in slide-in-from-top-4 duration-300">
      <div 
        onClick={() => {
          if (isPlanning && onViewSchedule) {
            onViewSchedule();
          } else if (onViewNotice) {
            onViewNotice(latestNotice);
          }
        }}
        className="bg-slate-900/95 text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-orange-500/40 backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-900 transition group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shrink-0 shadow-md">
            {isPlanning ? (
              <Calendar size={18} className="text-white animate-pulse" />
            ) : (
              <Bell size={18} className="text-white animate-bounce" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400">
                {isPlanning ? 'Rooster Update' : 'Nieuw Bericht'}
              </span>
              <span className="text-[9px] text-slate-400">• Zojuist</span>
            </div>
            <p className="text-xs font-bold text-white truncate group-hover:text-orange-200 transition">
              {latestNotice.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold text-orange-300 hidden sm:inline-flex items-center gap-0.5">
            <span>Bekijken</span>
            <ChevronRight size={13} />
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            aria-label="Sluiten"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
