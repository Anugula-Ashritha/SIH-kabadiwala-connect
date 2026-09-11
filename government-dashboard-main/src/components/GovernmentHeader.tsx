import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  UserCheck, 
  LogOut, 
  ChevronDown, 
  FileCheck2, 
  Building2, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { GovtUser } from '../types';
import { GOVT_USERS } from '../data/mockData';

interface Props {
  currentUser: GovtUser;
  onSelectUser: (user: GovtUser) => void;
  onLogout: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const GovernmentHeader: React.FC<Props> = ({
  currentUser,
  onSelectUser,
  onLogout,
  onRefreshData,
  isRefreshing = false
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const alerts = [
    {
      id: 1,
      type: 'success',
      title: 'EPR Target Milestone Achieved',
      desc: 'Maharashtra Region achieved 92.4% formalization diversion for March 2026.',
      time: '12m ago'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Audit Renewal Pending',
      desc: 'Western Metal & Circular Refining Hub (REC-MH-009) inspection due by 31-Mar-2026.',
      time: '2h ago'
    },
    {
      id: 3,
      type: 'info',
      title: 'Digital Gatepass Synced',
      desc: '1,420 automated manifests verified via CPCB central ledger telemetry.',
      time: '5h ago'
    }
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top National Identity Band */}
      <div className="bg-gradient-to-r from-orange-600 via-white to-emerald-600 h-1 w-full"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3.5">
            {/* Government Seal Icon Emblem */}
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center p-1 shadow-inner">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  KABADIWALA CONNECT
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Government Portal
                </span>
                <span className="hidden lg:inline-block text-[10px] text-slate-400 font-mono">
                  PS 26229 • SIH 2026
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Informal E-Waste Collector Formalization & Central Ecosystem Traceability
              </p>
            </div>
          </div>

          {/* Right Utilities & Profile */}
          <div className="flex items-center gap-3">
            {/* Live Data Sync Button */}
            <button
              onClick={onRefreshData}
              title="Refresh telemetry"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">Sync Feed</span>
            </button>

            {/* Regulatory Alerts Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleMenu(false);
                }}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Regulatory Notices"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Regulatory Bulletins</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded">3 Unread</span>
                  </div>
                  <div className="space-y-2">
                    {alerts.map(a => (
                      <div key={a.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-left">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          {a.type === 'warning' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          )}
                          <span>{a.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">{a.desc}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-mono">{a.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                    <span className="text-[10px] text-slate-500">Official Communication Channel • CPCB Telemetry</span>
                  </div>
                </div>
              )}
            </div>

            {/* Officer Profile & Switcher */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRoleMenu(!showRoleMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 text-left p-1.5 rounded-lg hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold ring-2 ring-emerald-500/30">
                  {currentUser.name.charAt(currentUser.name.startsWith('Dr.') ? 4 : 0)}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                    {currentUser.name}
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                    {currentUser.badgeLevel} • {currentUser.jurisdiction}
                  </div>
                </div>
              </button>

              {/* Role Dropdown */}
              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 z-50 p-3">
                  <div className="pb-2.5 mb-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-600 font-medium">{currentUser.designation}</div>
                    <div className="text-[10px] text-emerald-800 bg-emerald-50 inline-block px-1.5 py-0.5 rounded mt-1 font-mono">
                      {currentUser.department}
                    </div>
                  </div>

                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-1">
                    Switch Official Jurisdiction:
                  </div>

                  <div className="space-y-1">
                    {GOVT_USERS.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => {
                          onSelectUser(user);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left p-2 rounded text-xs transition flex items-start justify-between ${
                          currentUser.id === user.id ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{user.name}</div>
                          <div className="text-[10px] text-slate-500">{user.jurisdiction}</div>
                        </div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                          {user.badgeLevel.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">NIC Secured Access</span>
                    <button
                      onClick={onLogout}
                      className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout shortcut */}
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Logout from Government Session"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
