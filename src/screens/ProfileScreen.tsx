import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  MapPin,
  Truck,
  Languages,
  LogOut,
  FileText,
  HelpCircle,
  QrCode,
  ShieldAlert,
  Bell,
  Wifi,
  WifiOff,
  Package,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react';
import { Collector } from '../types';
import { offlineStorageService } from '../services/offlineStorageService';

interface ProfileScreenProps {
  collector: Collector;
  onLogout: () => void;
  onOpenSafetyGuidance: () => void;
  onOpenNotifications: () => void;
  isOffline: boolean;
  onToggleOffline: (offline: boolean) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  collector,
  onLogout,
  onOpenSafetyGuidance,
  onOpenNotifications,
  isOffline,
  onToggleOffline,
}) => {
  const [language, setLanguage] = useState<'English' | 'हिंदी'>(
    collector.preferred_language || 'हिंदी'
  );

  const stats = collector.stats || {
    lots_listed: 28,
    lots_completed: 21,
    total_earnings: 42850,
    total_weight_kg: 840,
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Collector Profile</h2>
        <p className="text-xs text-slate-500">SIH 2026 Formal E-Waste Network Credential</p>
      </div>

      {/* Collector ID Digital Card */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white rounded-2xl p-4 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-600/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-200">
              CPCB Certified Collector
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded">
            Member Since {collector.member_since || '2026'}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-xl shadow-md border-2 border-emerald-300">
              {collector.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white">{collector.name}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-xs text-emerald-200 font-mono mt-0.5">{collector.collector_id}</p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-100 mt-1">
                <Phone className="w-3 h-3 text-emerald-300" />
                <span>{collector.phone}</span>
              </div>
            </div>
          </div>

          <div
            className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shadow-inner shrink-0"
            title="Verification QR for Recycler Drop-offs"
          >
            <QrCode className="w-12 h-12 text-slate-900" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-emerald-600/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-emerald-300 block">Registered Zone</span>
            <div className="font-semibold text-white truncate flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="truncate">{collector.location || 'Mayapuri, Delhi'}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-emerald-300 block">Registered Vehicle</span>
            <div className="font-semibold text-white truncate flex items-center gap-1 mt-0.5">
              <Truck className="w-3 h-3 text-emerald-300 shrink-0" />
              <span className="truncate">{collector.vehicle_type || 'Cargo Cart'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collector Formal Statistics */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Lifetime Contributions / कुल आंकड़े
        </h3>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <div className="text-base font-black text-slate-900">{stats.lots_listed}</div>
            <div className="text-[10px] text-slate-500 font-medium">Lots Listed</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
            <div className="text-base font-black text-emerald-800">{stats.lots_completed}</div>
            <div className="text-[10px] text-emerald-700 font-medium">Completed</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
            <div className="text-base font-black text-emerald-800">
              ₹{(stats.total_earnings / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Earnings</div>
          </div>
        </div>
      </div>

      {/* Settings & Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Preferences & Network Controls
        </h3>

        {/* Language selector */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5 text-slate-800">
            <Languages className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold">App Language / भाषा</span>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-xs">
            {(['English', 'हिंदी'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  language === lang
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Offline Mode Simulator (Requirement 10) */}
        <div className="flex items-center justify-between py-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5 text-slate-800">
            {isOffline ? (
              <WifiOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-600" />
            )}
            <div>
              <span className="text-xs font-semibold block">Offline-First Mode</span>
              <span className="text-[10px] text-slate-500">
                {isOffline ? 'Offline active: saves locally' : 'Connected to live network'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isOffline
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isOffline ? 'Offline' : 'Online'}
          </button>
        </div>
      </div>

      {/* Safety & Documentation Links */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs divide-y divide-slate-100">
        {/* Safety Guidance Trigger */}
        <button
          type="button"
          onClick={onOpenSafetyGuidance}
          className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-800 hover:bg-emerald-50/60 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="block font-bold">Safety Guidance / सुरक्षा दिशा-निर्देश</span>
              <span className="text-[10px] text-slate-500">
                Battery handling, PPE, safe storage practices
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            View
          </span>
        </button>

        {/* Notifications Modal Trigger */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Consignment Notifications / सूचनाएं</span>
          </div>
          <span className="text-slate-400">Open</span>
        </button>

        {/* Guidelines PDF */}
        <button
          type="button"
          className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>SIH 2026 E-Waste Rules Guidelines</span>
          </div>
          <span className="text-slate-400">PDF</span>
        </button>

        {/* Helpline */}
        <button
          type="button"
          className="w-full p-3 flex items-center justify-between text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Collector Helpline / सहायता केंद्र</span>
          </div>
          <span className="text-emerald-700 font-bold">1800-E-WASTE</span>
        </button>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={onLogout}
        className="w-full py-3 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Sign Out / लॉग आउट
      </button>
    </div>
  );
};
