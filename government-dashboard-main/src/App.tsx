import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Layers, 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Award, 
  FileText, 
  LayoutDashboard,
  Menu,
  X,
  MapPin,
  Lock,
  ChevronRight,
  Scale
} from 'lucide-react';
import { GovtUser, FilterState } from './types';
import { GOVT_USERS } from './data/mockData';
import { analyticsService } from './services/analyticsService';
import { GovernmentHeader } from './components/GovernmentHeader';
import { GlobalFilterBar } from './components/GlobalFilterBar';

// Views
import { GovernmentLoginView } from './views/GovernmentLoginView';
import { NationalOverviewView } from './views/NationalOverviewView';
import { CollectionAnalyticsView } from './views/CollectionAnalyticsView';
import { MaterialAnalyticsView } from './views/MaterialAnalyticsView';
import { RecyclerNetworkView } from './views/RecyclerNetworkView';
import { TraceabilityMonitoringView } from './views/TraceabilityMonitoringView';
import { PriceTrendsView } from './views/PriceTrendsView';
import { ImpactDashboardView } from './views/ImpactDashboardView';
import { ReportsExportView } from './views/ReportsExportView';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<GovtUser>(GOVT_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default logged in for immediate review, with full login view switchable

  // Active Screen Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'collection' | 'materials' | 'recyclers' | 'traceability' | 'prices' | 'impact' | 'reports'
  >('overview');

  // Mobile navigation drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global Filter State
  const [filters, setFilters] = useState<FilterState>({
    state: 'All India',
    city: 'All Cities',
    material: 'All Materials',
    dateRange: 'All Time',
    recyclerStatus: 'All Recyclers',
    lotStatus: 'All Statuses'
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      state: 'All India',
      city: 'All Cities',
      material: 'All Materials',
      dateRange: 'All Time',
      recyclerStatus: 'All Recyclers',
      lotStatus: 'All Statuses'
    });
  };

  // Modular Data Retrieval from Analytics Service based on current filters
  const collections = useMemo(() => analyticsService.getRegionalCollections(filters), [filters, isRefreshing]);
  const materials = useMemo(() => analyticsService.getMaterialStats(filters), [filters, isRefreshing]);
  const recyclers = useMemo(() => analyticsService.getRecyclers(filters), [filters, isRefreshing]);
  const traceability = useMemo(() => analyticsService.getTraceabilityStats(filters), [filters, isRefreshing]);
  const priceTrends = useMemo(() => analyticsService.getPriceTrends(filters), [filters, isRefreshing]);
  const impact = useMemo(() => analyticsService.getImpactMetrics(filters), [filters, isRefreshing]);
  const lots = useMemo(() => analyticsService.getAnonymizedLots(filters), [filters, isRefreshing]);

  // Navigation Items
  const navItems = [
    { id: 'overview', label: 'National Overview', icon: LayoutDashboard, badge: null },
    { id: 'collection', label: 'Collection Analytics', icon: BarChart3, badge: `${collections.length} hubs` },
    { id: 'materials', label: 'Material Analytics', icon: Layers, badge: '7 streams' },
    { id: 'recyclers', label: 'Recycler Network', icon: Building2, badge: `${recyclers.length} units` },
    { id: 'traceability', label: 'Traceability & Funnel', icon: ShieldCheck, badge: `${impact.formal_channel_rate}%` },
    { id: 'prices', label: 'Price Trends & Scrap Index', icon: TrendingUp, badge: 'Fair Trade' },
    { id: 'impact', label: 'Impact Dashboard', icon: Award, badge: 'Socio-Econ' },
    { id: 'reports', label: 'Reports & Export', icon: FileText, badge: 'CPCB Form 4' },
  ];

  // If user is not logged in, show Government Login Screen
  if (!isLoggedIn) {
    return (
      <GovernmentLoginView
        onLogin={(user) => {
          setCurrentUser(user);
          // If the user has a state jurisdiction, adjust the state filter automatically!
          if (user.jurisdiction.includes('Maharashtra')) {
            setFilters(prev => ({ ...prev, state: 'Maharashtra', city: 'All Cities' }));
          } else if (user.jurisdiction.includes('Karnataka')) {
            setFilters(prev => ({ ...prev, state: 'Karnataka', city: 'All Cities' }));
          } else if (user.jurisdiction.includes('Delhi')) {
            setFilters(prev => ({ ...prev, state: 'Delhi NCR', city: 'All Cities' }));
          } else {
            setFilters(prev => ({ ...prev, state: 'All India', city: 'All Cities' }));
          }
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. Official Government Header */}
      <GovernmentHeader
        currentUser={currentUser}
        onSelectUser={(user) => {
          setCurrentUser(user);
          if (user.jurisdiction.includes('Maharashtra')) {
            setFilters(prev => ({ ...prev, state: 'Maharashtra', city: 'All Cities' }));
          } else if (user.jurisdiction.includes('Karnataka')) {
            setFilters(prev => ({ ...prev, state: 'Karnataka', city: 'All Cities' }));
          } else if (user.jurisdiction.includes('Delhi')) {
            setFilters(prev => ({ ...prev, state: 'Delhi NCR', city: 'All Cities' }));
          } else {
            setFilters(prev => ({ ...prev, state: 'All India', city: 'All Cities' }));
          }
        }}
        onLogout={() => setIsLoggedIn(false)}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
      />

      {/* 2. Global Regulatory Filter Bar */}
      <GlobalFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* 3. Main Workspace with Sidebar & Dynamic View */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Mobile Navigation Selector Bar */}
        <div className="lg:hidden mb-4 bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase text-slate-500">Screen:</span>
            <span className="text-xs font-bold text-slate-900">
              {navItems.find(n => n.id === activeTab)?.label}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mb-6 bg-white border border-slate-200 rounded-xl p-2 space-y-1 shadow-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop Layout: Sleek Side Nav + View Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Desktop Sidebar Navigation (3 cols) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Government Monitoring Modules
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition group ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-800'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Officer Context Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-xs text-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-emerald-400 font-mono">
                <span>Active Jurisdiction</span>
                <span>CPCB Node</span>
              </div>
              <div className="font-bold text-sm text-white">
                {filters.state === 'All India' ? 'National Portal' : filters.state}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Monitoring {impact.active_collectors.toLocaleString()} informal micro-aggregators and {impact.verified_recyclers} formal facilities.
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Rule 13 Verified</span>
                <span className="text-emerald-400 font-mono">91.0% Formal Rate</span>
              </div>
            </div>

            {/* Switch to Login Screen button */}
            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Switch / Re-login Official</span>
            </button>
          </aside>

          {/* Main Content Area (9 cols) */}
          <main className="lg:col-span-9">
            {activeTab === 'overview' && (
              <NationalOverviewView
                impact={impact}
                collections={collections}
                materials={materials}
                onNavigate={(tab) => setActiveTab(tab as any)}
                selectedState={filters.state}
              />
            )}

            {activeTab === 'collection' && (
              <CollectionAnalyticsView
                collections={collections}
                filters={filters}
              />
            )}

            {activeTab === 'materials' && (
              <MaterialAnalyticsView
                materials={materials}
                filters={filters}
              />
            )}

            {activeTab === 'recyclers' && (
              <RecyclerNetworkView
                recyclers={recyclers}
                filters={filters}
              />
            )}

            {activeTab === 'traceability' && (
              <TraceabilityMonitoringView
                traceability={traceability}
                lots={lots}
                filters={filters}
              />
            )}

            {activeTab === 'prices' && (
              <PriceTrendsView
                priceTrends={priceTrends}
                filters={filters}
              />
            )}

            {activeTab === 'impact' && (
              <ImpactDashboardView
                impact={impact}
                filters={filters}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsExportView
                collections={collections}
                materials={materials}
                recyclers={recyclers}
                impact={impact}
                filters={filters}
                currentUser={currentUser}
              />
            )}
          </main>

        </div>

      </div>

      {/* Official Government Portal Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
            </div>
            <span>
              <strong>Kabadiwala Connect</strong> • SIH 2026 PS 26229 • Government & Regulatory Impact Dashboard
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Compliant with E-Waste (Management) Rules, 2022 • Anonymized Telemetry
          </div>
        </div>
      </footer>

    </div>
  );
}
