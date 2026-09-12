import React from 'react';
import {
  Bell,
  Search,
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../services/dataService';
import { AdminTab } from '../types';

interface HeaderProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedCity,
  setSelectedCity,
  globalSearch,
  setGlobalSearch
}) => {
  const { flaggedRecords, resetAllData } = useData();

  const openIssues = flaggedRecords.filter(f => f.status === 'Open' || f.status === 'Under Investigation');

  const titles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Operations Overview',
      subtitle: 'Real-time e-waste aggregation, value-chain flow, and formal recycler matching'
    },
    collectors: {
      title: 'Collector Management',
      subtitle: 'Informal kabadiwala onboarding, digital identity, lots count, and cumulative earnings'
    },
    recyclers: {
      title: 'Recycler Management & CPCB Authorization',
      subtitle: 'Formal recyclers, authorized categories, capacity, and CPCB/SPCB verification review'
    },
    lots: {
      title: 'Lot Management & Aggregation',
      subtitle: 'Track lot lifecycles from creation to recycler offer, transit, and settlement'
    },
    transactions: {
      title: 'Transaction & Financial Settlements',
      subtitle: 'Transparent direct payments, UPI/NEFT disbursements, and fair rate enforcement'
    },
    handover: {
      title: 'Handover & Chain-of-Custody Traceability',
      subtitle: 'Weighbridge confirmation, photo verification records, and digital custody manifest'
    },
    pricing: {
      title: 'Material & Benchmark Price Management',
      subtitle: 'E-waste category catalog, market min-max benchmarks, and floor price controls'
    },
    flagged: {
      title: 'Flagged Records & Exceptions',
      subtitle: 'Audit discrepancies, weight deviations, expired compliance, and dispute resolutions'
    },
    settings: {
      title: 'Admin Profile & System Settings',
      subtitle: 'Operations configuration, cluster management, notification rules, and demo resets'
    }
  };

  const currentTabMeta = titles[activeTab] || titles.overview;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title & Context */}
      <div className="flex flex-col justify-center">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
          {currentTabMeta.title}
        </h2>
        <p className="text-xs text-slate-500 hidden md:block">
          {currentTabMeta.subtitle}
        </p>
      </div>

      {/* Global Actions & Controls */}
      <div className="flex items-center gap-3.5">
        {/* Global Search */}
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search ID, name, city, lot..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <select
            id="city-filter-select"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Operational Regions</option>
            <option value="Chennai">Chennai, TN</option>
            <option value="Bengaluru">Bengaluru, KA</option>
            <option value="Hyderabad">Hyderabad, TG</option>
            <option value="Pune">Pune, MH</option>
            <option value="Coimbatore">Coimbatore, TN</option>
          </select>
        </div>

        {/* Status Indicator / Demo Mode */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Operational Live</span>
        </div>

        {/* Flagged Issues Notification Button */}
        <button
          id="header-flagged-button"
          onClick={() => setActiveTab('flagged')}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title={`${openIssues.length} active exceptions need attention`}
        >
          <Bell className="w-4 h-4" />
          {openIssues.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {openIssues.length}
            </span>
          )}
        </button>

        {/* Data Reset Button */}
        <button
          id="header-reset-data-button"
          onClick={() => {
            if (confirm('Reset mock operational data back to original state?')) {
              resetAllData();
            }
          }}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Reset Mock Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
