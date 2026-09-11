import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ReceiptText,
  Truck,
  IndianRupee,
  AlertTriangle,
  Settings,
  LogOut,
  Recycle,
  ShieldCheck
} from 'lucide-react';
import { AdminTab } from '../types';
import { useData } from '../services/dataService';

interface SidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { admin, logout, flaggedRecords, lots, recyclers } = useData();

  const openIssuesCount = flaggedRecords.filter(f => f.status === 'Open' || f.status === 'Under Investigation').length;
  const pendingRecyclerVerifications = recyclers.filter(r => r.authorization_status === 'Pending' || r.authorization_status === 'Needs Update').length;
  const inProgressLotsCount = lots.filter(l => l.status === 'In Transit' || l.status === 'Handover Pending').length;

  const navItems: { id: AdminTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'collectors', label: 'Collector Management', icon: Users },
    { id: 'recyclers', label: 'Recycler Management', icon: Building2, badge: pendingRecyclerVerifications, badgeColor: 'bg-amber-500 text-white' },
    { id: 'lots', label: 'Lot Management', icon: Package, badge: inProgressLotsCount, badgeColor: 'bg-emerald-600 text-white' },
    { id: 'transactions', label: 'Transaction Management', icon: ReceiptText },
    { id: 'handover', label: 'Handover & Traceability', icon: Truck },
    { id: 'pricing', label: 'Material & Prices', icon: IndianRupee },
    { id: 'flagged', label: 'Flagged Records / Issues', icon: AlertTriangle, badge: openIssuesCount, badgeColor: 'bg-rose-500 text-white' },
    { id: 'settings', label: 'Admin Profile & Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50 text-white">
            <Recycle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight">
              Kabadiwala Connect
            </h1>
            <p className="text-xs text-emerald-400 font-medium">
              Operational Admin Console
            </p>
          </div>
        </div>

        <div className="mt-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-[11px] text-emerald-300">
          <span className="font-semibold">SIH 2026 • PS 26229</span>
          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-900/60 px-1.5 py-0.5 rounded text-emerald-200">
            <ShieldCheck className="w-3 h-3" /> E-Waste Chain
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Operational Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    item.badgeColor || 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-700/80 border border-emerald-500/40 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
              {admin.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{admin.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{admin.role}</p>
            </div>
          </div>
          <button
            id="admin-logout-button"
            onClick={logout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
