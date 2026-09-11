import React, { useState } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  MapPin, 
  Layers, 
  Scale, 
  Info, 
  ShieldCheck, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { PriceTrend, FilterState } from '../types';
import { PriceTrendGraph, formatINR } from '../components/Charts';
import { PRICE_TRENDS, MATERIAL_LIST } from '../data/mockData';

interface Props {
  priceTrends: PriceTrend[];
  filters: FilterState;
}

export const PriceTrendsView: React.FC<Props> = ({ priceTrends, filters }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    filters.material && filters.material !== 'All Materials'
      ? filters.material
      : 'Motherboards & High-Grade PCBs'
  );

  const materialsWithData = Array.from(new Set(PRICE_TRENDS.map(p => p.material)));

  // Filter trends for the selected material
  const currentTrends = PRICE_TRENDS.filter(p => p.material === selectedMaterial);
  const locationLabel = currentTrends[0]?.location || 'National Benchmark';

  const chartData = currentTrends.map(p => {
    const monthNames: Record<string, string> = {
      '2025-10': 'Oct 25',
      '2025-11': 'Nov 25',
      '2025-12': 'Dec 25',
      '2026-01': 'Jan 26',
      '2026-02': 'Feb 26',
      '2026-03': 'Mar 26'
    };
    return {
      label: monthNames[p.date_or_month] || p.date_or_month,
      min: p.market_min,
      max: p.market_max,
      avg: p.average_buying_price,
      baseline: p.informal_baseline_price
    };
  });

  const latestTrend = currentTrends[currentTrends.length - 1];
  const earliestTrend = currentTrends[0];
  const priceGrowth = earliestTrend && latestTrend
    ? (((latestTrend.average_buying_price - earliestTrend.average_buying_price) / earliestTrend.average_buying_price) * 100).toFixed(1)
    : '0';

  const collectorPremium = latestTrend && latestTrend.informal_baseline_price
    ? (((latestTrend.average_buying_price - latestTrend.informal_baseline_price) / latestTrend.informal_baseline_price) * 100).toFixed(1)
    : '35';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Fair Price Monitoring & Scrap Index
          </h2>
          <p className="text-xs text-slate-500">
            Transparent market rates: Real-time buying prices (₹/kg) across authorized recyclers vs traditional middleman informal exploitation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            +{collectorPremium}% Fair Trade Realization
          </span>
        </div>
      </div>

      {/* Material Selector Buttons */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Select E-Waste Material Stream for Time-Series Analysis:
        </div>
        <div className="flex flex-wrap gap-2">
          {materialsWithData.map((mat) => (
            <button
              key={mat}
              onClick={() => setSelectedMaterial(mat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMaterial === mat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {mat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Chart */}
      <PriceTrendGraph
        data={chartData}
        materialName={selectedMaterial}
        location={locationLabel}
      />

      {/* Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">Middleman Exploitation Shield</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">
            Informal kabadiwalas traditionally sold PCBs to unregulated scrap traders at depressed rates (₹220-₹245/kg). Kabadiwala Connect's direct recycler matching guarantees verified transparent weighbridge rates (₹380-₹405/kg).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">6-Month Price Growth</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            +{priceGrowth}%
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Sustained demand from formal metallurgical extractors for high-grade circular gold, copper, and cobalt fractions.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">CPCB Minimum Support Advisory</span>
          </div>
          <div className="text-xs text-slate-600 leading-relaxed mt-1">
            Recommended statutory floor price benchmark for {selectedMaterial}: <strong>₹ {latestTrend ? latestTrend.market_min : 300}/kg</strong> to disincentivize informal backyard open burning.
          </div>
        </div>
      </div>

      {/* Material Comparison Price Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">Current Multi-Material Scrap Benchmark Index (March 2026)</h3>
          <p className="text-xs text-slate-500">Benchmark buying price band across regional authorized recycling nodes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Material Fraction</th>
                <th className="py-3 px-4">Benchmark Region</th>
                <th className="py-3 px-4">Informal Scrap Baseline</th>
                <th className="py-3 px-4">Formal Platform Price Range</th>
                <th className="py-3 px-4">Average Realized Buying Price</th>
                <th className="py-3 px-4 text-right">Collector Income Uplift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRICE_TRENDS.filter(p => p.date_or_month === '2026-03').map((item, idx) => {
                const uplift = item.informal_baseline_price
                  ? (((item.average_buying_price - item.informal_baseline_price) / item.informal_baseline_price) * 100).toFixed(0)
                  : '0';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {item.material}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.location}
                    </td>
                    <td className="py-3 px-4 font-mono text-rose-600 font-medium">
                      ₹ {item.informal_baseline_price || '-'}/kg
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      ₹ {item.market_min} - ₹ {item.market_max}/kg
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-sm">
                      ₹ {item.average_buying_price} / kg
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-right text-emerald-800">
                      +{uplift}% Premium
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
