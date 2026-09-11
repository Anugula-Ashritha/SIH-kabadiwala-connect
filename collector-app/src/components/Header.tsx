import React from 'react';
import { ShieldCheck, MapPin, Bell, WifiOff } from 'lucide-react';
import { Collector } from '../types';

interface HeaderProps {
  collector: Collector;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  isOffline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  collector,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  isOffline = false,
}) => {
  const zoneName = collector.location || 'Mayapuri E-Waste Belt, Delhi';

  return (
    <header className="bg-emerald-800 text-white px-4 pt-4 pb-3 shadow-md sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-700 border-2 border-emerald-400 flex items-center justify-center font-bold text-white text-base shadow-sm">
            {collector.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-base leading-tight text-white">
                Namaste, {collector.name.split(' ')[0]}
              </h1>
              <span className="inline-flex items-center gap-0.5 bg-emerald-900/70 text-emerald-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-emerald-500/40">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Verified
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-200 text-xs mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="truncate max-w-[210px]">{zoneName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOffline && (
            <span
              className="inline-flex items-center gap-1 bg-amber-500/90 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs"
              title="Working in offline mode. New lots will sync when reconnected."
            >
              <WifiOff className="w-3 h-3" />
              Offline
            </span>
          )}

          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-[10px] text-emerald-300 font-medium tracking-wide uppercase">
              SIH 2026
            </span>
            <span className="text-xs text-white/90 font-medium">E-Waste Hub</span>
          </div>

          <button
            type="button"
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-emerald-700/80 hover:bg-emerald-700 flex items-center justify-center text-emerald-100 transition-colors relative"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-amber-400 text-slate-900 text-[9px] font-black rounded-full flex items-center justify-center px-0.5 ring-2 ring-emerald-800">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
