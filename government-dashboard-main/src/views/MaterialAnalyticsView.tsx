import React from 'react';
import { 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  IndianRupee, 
  Scale, 
  Info, 
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { MaterialStats, FilterState } from '../types';
import { DonutChart, formatINR, formatWeight } from '../components/Charts';

interface Props {
  materials: MaterialStats[];
  filters: FilterState;
}

export const MaterialAnalyticsView: React.FC<Props> = ({ materials, filters }) => {
  const totalWeight = materials.reduce((s, m) => s + m.total_weight_kg, 0);
  const totalValue = materials.reduce((s, m) => s + m.transaction_value, 0);
  const totalLots = materials.reduce((s, m) => s + m.lot_count, 0);

  const colors = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed', '#0d9488', '#ea580c'];

  const donutSlices = materials.map((m, idx) => ({
    label: m.material,
    value: m.total_weight_kg,
    percentage: m.percentage_of_total,
    color: colors[idx % colors.length],
    formattedValue: `${(m.total_weight_kg / 1000).toFixed(1)} MT`
  }));

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Material Flow & Hazard Classification Analytics
          </h2>
          <p className="text-xs text-slate-500">
            CPCB Schedule III Categorization: Breakdown of e-waste material fractions, weight share, buying price/kg, and hazardous substances.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
            7 Official Material Categories
          </span>
        </div>
      </div>

      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Material Volume</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {formatWeight(totalWeight)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Across all logged collector batches</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Transaction Payout</div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatINR(totalValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Verified direct payout to informal collectors</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">High Hazard Material Share</div>
          <div className="text-xl font-extrabold text-amber-700 font-mono mt-1">
            54.6%
          </div>
          <div className="text-xs text-amber-600 mt-1">Lead, Cadmium, Lithium-ion & CRT units diverted</div>
        </div>
      </div>

      {/* Visual Chart & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Material Weight Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Percentage share of gross weight by category</p>
            
            <DonutChart
              slices={donutSlices}
              centerLabel="E-Waste Total"
              centerValue={`${(totalWeight / 1000).toFixed(0)} MT`}
              size={180}
            />
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400 shrink-0" />
            <span>High-grade PCBs and Copper cables generate 65% of all informal recycling revenue.</span>
          </div>
        </div>

        {/* Hazard Regulatory Guidance Card (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>CPCB Schedule III Hazard Severity Protocol</span>
              </h3>
              <span className="text-[10px] font-mono bg-amber-50 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-200">
                Rule 4 Enforced
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Materials flagged as <strong>High Hazard</strong> contain hazardous heavy metals (mercury, cadmium, hexavalent chromium, brominated flame retardants). Kabadiwala Connect enforces mandatory direct channelization of these fractions to R2/CPCB authorized refining centers, strictly bypassing informal unscientific acid leaching.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-red-200 bg-red-50/50">
                <div className="text-[10px] font-bold uppercase text-red-800 mb-0.5">High Hazard</div>
                <div className="text-xs font-semibold text-slate-900">PCBs, Batteries, CRT</div>
                <div className="text-[10px] text-red-700 mt-1">Closed-loop hydrometallurgical refining required</div>
              </div>

              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50">
                <div className="text-[10px] font-bold uppercase text-amber-800 mb-0.5">Medium Hazard</div>
                <div className="text-xs font-semibold text-slate-900">Telecom & IT Peripherals</div>
                <div className="text-[10px] text-amber-700 mt-1">Dismantling & component segregation certified</div>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <div className="text-[10px] font-bold uppercase text-emerald-800 mb-0.5">Low Hazard</div>
                <div className="text-xs font-semibold text-slate-900">Copper Cables, Appliances</div>
                <div className="text-[10px] text-emerald-700 mt-1">Mechanical shredding & clean metal recovery</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Mandatory manifest audit active</span>
            <span className="font-mono text-emerald-700 font-semibold">Zero Illegal Acid Leaching Incidents Reported</span>
          </div>
        </div>

      </div>

      {/* Detailed Material Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Material Stream Detailed Ledger</h3>
          <p className="text-xs text-slate-500">Comprehensive view of weight, lot count, average price, and gross value</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Material Category</th>
                <th className="py-3 px-4">CPCB Code</th>
                <th className="py-3 px-4">Hazard Rating</th>
                <th className="py-3 px-4">Total Weight</th>
                <th className="py-3 px-4">Share (%)</th>
                <th className="py-3 px-4">Avg Price / kg</th>
                <th className="py-3 px-4">Lot Count</th>
                <th className="py-3 px-4 text-right">Transaction Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.material}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                    {item.cpcb_code || 'EW-GEN-00'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.hazard_category === 'High' 
                        ? 'bg-rose-100 text-rose-800'
                        : item.hazard_category === 'Medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.hazard_category || 'Low'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {item.total_weight_kg.toLocaleString('en-IN')} kg
                    <span className="text-[10px] text-slate-400 font-normal block font-sans">
                      ({(item.total_weight_kg / 1000).toFixed(1)} MT)
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {item.percentage_of_total.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    ₹ {item.average_price_per_kg} / kg
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {item.lot_count.toLocaleString()} lots
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">
                    {formatINR(item.transaction_value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
