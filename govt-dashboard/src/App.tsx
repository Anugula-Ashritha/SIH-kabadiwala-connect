import React, { useState, useMemo, useEffect } from 'react';
import { BarChart3, Layers, Building2, ShieldCheck, TrendingUp, Award, FileText, LayoutDashboard, Menu, X, Lock } from 'lucide-react';
import { GovtUser, FilterState } from './types';
import { GOVT_USERS } from './data/mockData';
import { analyticsService } from './services/analyticsService';
import { GovernmentHeader } from './components/GovernmentHeader';
import { GlobalFilterBar } from './components/GlobalFilterBar';
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
  const [currentUser, setCurrentUser] = useState<GovtUser>(GOVT_USERS[0]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview'|'collection'|'materials'|'recyclers'|'traceability'|'prices'|'impact'|'reports'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({ state:'All India', city:'All Cities', material:'All Materials', dateRange:'All Time', recyclerStatus:'All Recyclers', lotStatus:'All Statuses' });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = async () => {
    setIsRefreshing(true);
    try { await analyticsService.refresh(); } catch (e) { console.error('Government dashboard refresh failed', e); }
    finally { setIsRefreshing(false); }
  };

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const handleFilterChange = (newFilters: Partial<FilterState>) => setFilters(prev => ({ ...prev, ...newFilters }));
  const handleResetFilters = () => setFilters({ state:'All India', city:'All Cities', material:'All Materials', dateRange:'All Time', recyclerStatus:'All Recyclers', lotStatus:'All Statuses' });
  const collections = useMemo(() => analyticsService.getRegionalCollections(filters), [filters, isRefreshing]);
  const materials = useMemo(() => analyticsService.getMaterialStats(filters), [filters, isRefreshing]);
  const recyclers = useMemo(() => analyticsService.getRecyclers(filters), [filters, isRefreshing]);
  const traceability = useMemo(() => analyticsService.getTraceabilityStats(filters), [filters, isRefreshing]);
  const priceTrends = useMemo(() => analyticsService.getPriceTrends(filters), [filters, isRefreshing]);
  const impact = useMemo(() => analyticsService.getImpactMetrics(filters), [filters, isRefreshing]);
  const lots = useMemo(() => analyticsService.getAnonymizedLots(filters), [filters, isRefreshing]);

  const navItems = [
    { id:'overview', label:'National Overview', icon:LayoutDashboard, badge:null },
    { id:'collection', label:'Collection Analytics', icon:BarChart3, badge:`${collections.length} hubs` },
    { id:'materials', label:'Material Analytics', icon:Layers, badge:`${materials.length} streams` },
    { id:'recyclers', label:'Recycler Network', icon:Building2, badge:`${recyclers.length} units` },
    { id:'traceability', label:'Traceability & Funnel', icon:ShieldCheck, badge:`${impact.formal_channel_rate}%` },
    { id:'prices', label:'Price Trends & Scrap Index', icon:TrendingUp, badge:'Fair Trade' },
    { id:'impact', label:'Impact Dashboard', icon:Award, badge:'Socio-Econ' },
    { id:'reports', label:'Reports & Export', icon:FileText, badge:'CPCB Form 4' }
  ];

  if (!isLoggedIn) return <GovernmentLoginView onLogin={(user) => { setCurrentUser(user); setIsLoggedIn(true); }} />;

  return <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
    <GovernmentHeader currentUser={currentUser} onSelectUser={setCurrentUser} onLogout={() => setIsLoggedIn(false)} onRefreshData={refresh} isRefreshing={isRefreshing} />
    <GlobalFilterBar filters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="lg:hidden mb-4 bg-white border border-slate-200 rounded-xl p-2.5 flex items-center justify-between shadow-xs"><div className="flex items-center gap-2"><span className="text-xs font-bold uppercase text-slate-500">Screen:</span><span className="text-xs font-bold text-slate-900">{navItems.find(n => n.id === activeTab)?.label}</span></div><button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1.5 rounded-lg bg-slate-100 text-slate-700">{mobileMenuOpen ? <X className="w-4 h-4"/> : <Menu className="w-4 h-4"/>}</button></div>
      {mobileMenuOpen && <div className="lg:hidden mb-6 bg-white border border-slate-200 rounded-xl p-2 space-y-1 shadow-md">{navItems.map(item => <button key={item.id} onClick={() => { setActiveTab(item.id as any); setMobileMenuOpen(false); }} className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold ${activeTab === item.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><span>{item.label}</span><span className="text-[10px]">{item.badge}</span></button>)}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 sticky top-36"><div className="bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs space-y-1"><div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Government Monitoring Modules</div>{navItems.map(item => { const Icon=item.icon; return <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold ${activeTab === item.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`}><span className="flex items-center gap-2.5"><Icon className="w-4 h-4"/>{item.label}</span><span className="text-[10px]">{item.badge}</span></button>; })}</div><button onClick={() => setIsLoggedIn(false)} className="mt-4 w-full py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5"><Lock className="w-3.5 h-3.5"/>Switch / Re-login Official</button></aside>
        <main className="lg:col-span-9">
          {activeTab==='overview' && <NationalOverviewView impact={impact} collections={collections} materials={materials} onNavigate={tab => setActiveTab(tab as any)} selectedState={filters.state}/>} 
          {activeTab==='collection' && <CollectionAnalyticsView collections={collections} filters={filters}/>} 
          {activeTab==='materials' && <MaterialAnalyticsView materials={materials} filters={filters}/>} 
          {activeTab==='recyclers' && <RecyclerNetworkView recyclers={recyclers} filters={filters}/>} 
          {activeTab==='traceability' && <TraceabilityMonitoringView traceability={traceability} lots={lots} filters={filters}/>} 
          {activeTab==='prices' && <PriceTrendsView priceTrends={priceTrends} filters={filters}/>} 
          {activeTab==='impact' && <ImpactDashboardView impact={impact} filters={filters}/>} 
          {activeTab==='reports' && <ReportsExportView collections={collections} materials={materials} recyclers={recyclers} impact={impact} filters={filters} currentUser={currentUser}/>} 
        </main>
      </div>
    </div>
    <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between"><span><strong>Kabadiwala Connect</strong> • SIH 2026 PS 26229</span><span>Live backend telemetry</span></div></footer>
  </div>;
}
