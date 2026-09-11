import React from 'react';
import { 
  Scale, 
  TrendingUp, 
  Users, 
  Building2, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  IndianRupee,
  FileText,
  MapPin
} from 'lucide-react';
import { ImpactMetrics, RegionalCollection, MaterialStats } from '../types';
import { BarChart, DonutChart, formatINR, formatWeight } from '../components/Charts';

interface Props {
  impact: ImpactMetrics;
  collections: RegionalCollection[];
  materials: MaterialStats[];
  onNavigate: (tabId: string) => void;
  selectedState: string;
}

export const NationalOverviewView: React.FC<Props> = ({
  impact,
  collections,
  materials,
  onNavigate,
  selectedState
}) => {
  // Aggregate state collections for the bar chart
  const stateSummaryMap: Record<string, { total: number; completed: number }> = {};
  collections.forEach(c => {
    if (!stateSummaryMap[c.state]) {
      stateSummaryMap[c.state] = { total: 0, completed: 0 };
    }
    stateSummaryMap[c.state].total += c.total_weight_kg;
    stateSummaryMap[c.state].completed += c.completed_weight_kg;
  });

  const stateChartData = Object.entries(stateSummaryMap).map(([state, data]) => ({
    label: state.replace('Delhi NCR', 'Delhi').replace('Maharashtra', 'MH').replace('Karnataka', 'KA').replace('Tamil Nadu', 'TN').replace('Telangana', 'TS').replace('Gujarat', 'GJ').replace('West Bengal', 'WB').replace('Uttar Pradesh', 'UP'),
    subLabel: `${Math.round((data.completed / (data.total || 1)) * 100)}% formal`,
    value: Math.round(data.total / 1000), // in MT
    value2: Math.round(data.completed / 1000),
    formattedValue: `${(data.total / 1000).toFixed(1)} MT Gross`,
    formattedValue2: `${(data.completed / 1000).toFixed(1)} MT Verified`
  }));

  const materialSlices = materials.slice(0, 5).map((m, idx) => {
    const colors = ['#059669', '#0d9488', '#0284c7', '#6366f1', '#f59e0b', '#ec4899'];
    return {
      label: m.material,
      value: m.total_weight_kg,
      percentage: m.percentage_of_total,
      color: colors[idx % colors.length],
      formattedValue: `${(m.total_weight_kg / 1000).toFixed(1)} MT`
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Jurisdiction Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-mono">
              CPCB Regulatory Telemetry Active
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mt-1">
            {selectedState === 'All India' ? 'National E-Waste Ecosystem Overview' : `${selectedState} Regional Ecosystem Overview`}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated real-time metrics across informal collection clusters, authorized recyclers, and formal channel diversion.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Generate CPCB Dossier</span>
          </button>
          <button
            onClick={() => onNavigate('traceability')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>View Traceability Funnel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total E-Waste Collected */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Gross E-Waste Monitored</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {formatWeight(impact.total_e_waste_collected)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Handed to Authorized Recyclers:</span>
            <span className="font-semibold text-emerald-700">
              {(impact.total_e_waste_handed_to_authorized_recyclers / 1000).toFixed(1)} MT
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${Math.min(100, impact.formal_channel_rate)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Formal Channel Diversion Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Formal Channel Rate</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono flex items-baseline gap-1">
            <span>{impact.formal_channel_rate}%</span>
            <span className="text-xs font-semibold text-emerald-600 font-sans">verified</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Informal Leakage Prevented:</span>
            <span className="font-semibold text-teal-700">
              {((impact.total_e_waste_handed_to_authorized_recyclers / 1000)).toFixed(1)} MT safe
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Diverted from unauthorized acid burning
          </div>
        </div>

        {/* KPI 3: Direct Economic Transfer */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Value Transferred</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {formatINR(impact.total_transaction_value)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Avg / Active Collector:</span>
            <span className="font-semibold text-blue-700">
              ₹ {impact.average_collector_realized_value.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            100% digital direct payouts to informal bank accounts
          </div>
        </div>

        {/* KPI 4: Active Ecosystem Stakeholders */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Formalized Network</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
            {impact.active_collectors.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500">Authorized Recyclers:</span>
            <span className="font-semibold text-purple-700">{impact.verified_recyclers} units</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {impact.completed_lots.toLocaleString()} total verified lot handovers
          </div>
        </div>

      </div>

      {/* Visual Analytics Row: State Comparison & Material Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* State/Regional Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Regional Collection & Formalization (Metric Tons)</h3>
              <p className="text-xs text-slate-500">Gross Monitored Weight vs Formal Recycler Handover by State</p>
            </div>
            <button
              onClick={() => onNavigate('collection')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <span>Explore All Hubs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BarChart
            data={stateChartData}
            height={220}
            label1="Gross E-Waste Monitored (MT)"
            label2="Formal Handover (MT)"
          />
        </div>

        {/* Material Stream Share Donut (1 col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Material Stream Share</h3>
                <p className="text-xs text-slate-500">By total processed weight (kg)</p>
              </div>
              <button
                onClick={() => onNavigate('materials')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <DonutChart
              slices={materialSlices}
              centerLabel="E-Waste Total"
              centerValue={`${(impact.total_e_waste_collected / 1000).toFixed(0)} MT`}
              size={170}
            />
          </div>

          <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>High-grade PCBs and batteries represent 40.4% of volume and 47.1% of formal payout value.</span>
          </div>
        </div>

      </div>

      {/* Regulatory Alerts & Priority Oversight */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Statutory Regulatory Oversight & Active Verification Queues</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">CPCB Audit Framework 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Traceability Completion</span>
              <span className="text-emerald-700">86.3%</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              9,280 lots fully closed end-to-end with weighbridge verification slips and recycler gatepasses.
            </p>
            <button
              onClick={() => onNavigate('traceability')}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Inspect Funnel</span> &rarr;
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Recycler Capacity Utilization</span>
              <span className="text-blue-700">71.8%</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Formal capacity across 28 registered facilities is 1,890 MT/month against 1,380 MT collected.
            </p>
            <button
              onClick={() => onNavigate('recyclers')}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>View Recycler Directory</span> &rarr;
            </button>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
              <span>Price Stability Advisory</span>
              <span className="text-purple-700">+38% Uplift</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Formal buyer direct bidding eliminated local scrap predatory price gouging across 8 states.
            </p>
            <button
              onClick={() => onNavigate('prices')}
              className="text-xs font-semibold text-purple-700 hover:underline flex items-center gap-1"
            >
              <span>Check Price Trends</span> &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
