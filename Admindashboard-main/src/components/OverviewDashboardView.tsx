import React from 'react';
import {
  Users,
  Building2,
  Package,
  IndianRupee,
  Scale,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronRight,
  ShieldCheck,
  Truck
} from 'lucide-react';
import { useData } from '../services/dataService';
import { AdminTab, MaterialCategory } from '../types';
import { StatusBadge } from './StatusBadge';

interface OverviewProps {
  setActiveTab: (tab: AdminTab) => void;
  selectedCity: string;
}

export const OverviewDashboardView: React.FC<OverviewProps> = ({ setActiveTab, selectedCity }) => {
  const { collectors, recyclers, lots, transactions, handovers, flaggedRecords } = useData();

  // Apply city filter if not 'All'
  const filteredCollectors = selectedCity === 'All'
    ? collectors
    : collectors.filter(c => c.city.toLowerCase() === selectedCity.toLowerCase());

  const filteredLots = selectedCity === 'All'
    ? lots
    : lots.filter(l => l.location.toLowerCase().includes(selectedCity.toLowerCase()));

  const filteredRecyclers = selectedCity === 'All'
    ? recyclers
    : recyclers.filter(r => r.location.toLowerCase().includes(selectedCity.toLowerCase()) || r.service_area.some(a => a.toLowerCase().includes(selectedCity.toLowerCase())));

  // Summary Metrics
  const totalCollectorsCount = filteredCollectors.length;
  const activeCollectorsCount = filteredCollectors.filter(c => c.account_status === 'Active').length;

  const totalRecyclersCount = filteredRecyclers.length;
  const verifiedRecyclersCount = filteredRecyclers.filter(r => r.authorization_status === 'Verified').length;
  const pendingRecyclerVerifications = filteredRecyclers.filter(r => r.authorization_status === 'Pending' || r.authorization_status === 'Needs Update').length;

  const totalLotsCount = filteredLots.length;
  const completedLotsCount = filteredLots.filter(l => l.status === 'Completed').length;
  const inTransitOrHandoverLots = filteredLots.filter(l => l.status === 'In Transit' || l.status === 'Handover Pending').length;

  const totalWeightKg = filteredLots.reduce((acc, curr) => acc + curr.weight_kg, 0);
  const totalWeightTons = (totalWeightKg / 1000).toFixed(2);

  const totalCollectorEarnings = filteredCollectors.reduce((acc, curr) => acc + curr.total_earnings, 0);

  const openIssuesCount = flaggedRecords.filter(f => f.status === 'Open' || f.status === 'Under Investigation').length;

  // Material category breakdown from lots
  const categories: MaterialCategory[] = [
    'PCB',
    'Batteries',
    'Cables',
    'CRT',
    'LCD/LED',
    'Motors/Magnets',
    'Mixed Plastics',
    'Other E-Waste'
  ];

  const categoryWeights = categories.map(cat => {
    const sum = filteredLots
      .filter(l => l.material_category === cat)
      .reduce((acc, l) => acc + l.weight_kg, 0);
    return { category: cat, weightKg: sum };
  });

  const maxCategoryWeight = Math.max(...categoryWeights.map(c => c.weightKg), 1);

  // Lot status distribution
  const lotStatuses = [
    { label: 'Created', count: filteredLots.filter(l => l.status === 'Created').length, color: 'bg-slate-300' },
    { label: 'Finding Recycler', count: filteredLots.filter(l => l.status === 'Finding Recycler').length, color: 'bg-sky-400' },
    { label: 'Offer Received', count: filteredLots.filter(l => l.status === 'Offer Received').length, color: 'bg-indigo-400' },
    { label: 'Accepted', count: filteredLots.filter(l => l.status === 'Accepted').length, color: 'bg-teal-500' },
    { label: 'In Transit', count: filteredLots.filter(l => l.status === 'In Transit').length, color: 'bg-amber-500' },
    { label: 'Handover Pending', count: filteredLots.filter(l => l.status === 'Handover Pending').length, color: 'bg-orange-500' },
    { label: 'Payment Pending', count: filteredLots.filter(l => l.status === 'Payment Pending').length, color: 'bg-yellow-500' },
    { label: 'Completed', count: filteredLots.filter(l => l.status === 'Completed').length, color: 'bg-emerald-600' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome / Context Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-xl p-5 shadow-sm border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> SIH 2026 PS 26229 Live Aggregation Console
          </div>
          <h3 className="text-xl font-bold tracking-tight">
            Formal E-Waste Value Chain Operations
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Coordinating informal collection hubs, authorized CPCB dismantlers, certified weighbridge checkpoints, and automated fair-rate escrow settlements across {selectedCity === 'All' ? 'all regional clusters' : selectedCity}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pendingRecyclerVerifications > 0 && (
            <button
              onClick={() => setActiveTab('recyclers')}
              className="px-3 py-2 bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold rounded-lg hover:bg-amber-500/30 transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{pendingRecyclerVerifications} Recycler Approvals Pending</span>
            </button>
          )}
          {openIssuesCount > 0 && (
            <button
              onClick={() => setActiveTab('flagged')}
              className="px-3 py-2 bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-semibold rounded-lg hover:bg-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{openIssuesCount} Operational Flags</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collectors */}
        <div
          onClick={() => setActiveTab('collectors')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Informal Collectors
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalCollectorsCount}</span>
            <span className="text-xs text-emerald-600 font-medium">
              {activeCollectorsCount} Active
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Aggregators registered</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>

        {/* Authorized Recyclers */}
        <div
          onClick={() => setActiveTab('recyclers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Formal Recyclers
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalRecyclersCount}</span>
            <span className="text-xs text-teal-700 font-medium">
              {verifiedRecyclersCount} CPCB Verified
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{pendingRecyclerVerifications} pending review</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600" />
          </p>
        </div>

        {/* E-Waste Volume */}
        <div
          onClick={() => setActiveTab('lots')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              E-Waste Processed
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalWeightKg.toLocaleString()} kg</span>
            <span className="text-xs text-blue-600 font-medium">
              ({totalWeightTons} MT)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Across {totalLotsCount} lots</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
          </p>
        </div>

        {/* Total Disbursed Earnings */}
        <div
          onClick={() => setActiveTab('transactions')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Collector Earnings
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalCollectorEarnings.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Direct Transfer</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Fair-market price realized</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </p>
        </div>
      </div>

      {/* Grid for Visual Distribution & Pipeline Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Material Stream Volume Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                E-Waste Stream Volume Breakdown
              </h4>
              <p className="text-xs text-slate-500">
                Aggregated weight across mandatory CPCB material categories
              </p>
            </div>
            <button
              onClick={() => setActiveTab('pricing')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Manage Rates</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {categoryWeights.map((item) => {
              const pct = Math.round((item.weightKg / maxCategoryWeight) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.category}</span>
                    <span className="font-semibold text-slate-900">
                      {item.weightKg > 0 ? `${item.weightKg.toFixed(1)} kg` : '0 kg'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Lot Pipeline Status Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Lot Pipeline Status</h4>
                <p className="text-xs text-slate-500">Active lots in lifecycle</p>
              </div>
              <button
                onClick={() => setActiveTab('lots')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                View Lots
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {lotStatuses.map((st) => (
                <div
                  key={st.label}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                    <span className="font-medium text-slate-700">{st.label}</span>
                  </div>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>In-Transit SLA: 24 Hours</span>
            <span className="text-emerald-600 font-semibold">96.4% on time</span>
          </div>
        </div>
      </div>

      {/* Recent High-Priority Lots & Verification Alerts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Active Lots & Traceability Operations
            </h4>
            <p className="text-xs text-slate-500">
              Real-time lots requiring logistics, weighbridge, or recycler actions
            </p>
          </div>
          <button
            onClick={() => setActiveTab('lots')}
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>All Lots Table</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100/70 text-slate-700 uppercase text-[10px] font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Lot ID</th>
                <th className="px-4 py-3">Collector</th>
                <th className="px-4 py-3">Material Stream</th>
                <th className="px-4 py-3">Weight (kg)</th>
                <th className="px-4 py-3">Assigned Recycler</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLots.slice(0, 5).map((lot) => {
                const collector = collectors.find(c => c.collector_id === lot.collector_id);
                const recycler = recyclers.find(r => r.recycler_id === lot.recycler_id);

                return (
                  <tr key={lot.lot_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                      {lot.lot_id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {collector ? collector.name : lot.collector_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800">{lot.material_category}</span>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{lot.material}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {lot.weight_kg.toFixed(1)} kg
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {recycler ? recycler.organization_name : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="lot" status={lot.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {lot.created_at}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setActiveTab('lots')}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
