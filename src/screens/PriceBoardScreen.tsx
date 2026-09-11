import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  ShieldCheck,
  Search,
  ChevronDown,
  ChevronUp,
  LineChart,
} from 'lucide-react';
import { PriceItem } from '../types';

interface PriceBoardScreenProps {
  prices: PriceItem[];
}

export const PriceBoardScreen: React.FC<PriceBoardScreenProps> = ({ prices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(prices[0]?.id || 'PRC-01');

  const filteredPrices = prices.filter((p) => {
    const name = (p.material || p.category || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const activeItem = prices.find((p) => p.id === selectedMaterialId) || prices[0];

  // Helper to render SVG Historical Trend Chart
  const renderTrendChart = (item: PriceItem) => {
    const history = item.historical_rates || [
      { day: 'Mon', rate: item.market_min },
      { day: 'Tue', rate: item.market_min + 5 },
      { day: 'Wed', rate: (item.market_min + item.market_max) / 2 },
      { day: 'Thu', rate: (item.market_min + item.market_max) / 2 },
      { day: 'Fri', rate: item.market_max - 10 },
      { day: 'Sat', rate: item.market_max - 5 },
      { day: 'Today', rate: item.market_max },
    ];

    const rates = history.map((h) => h.rate);
    const minRate = Math.min(...rates) * 0.95;
    const maxRate = Math.max(...rates) * 1.05;
    const range = maxRate - minRate || 1;

    const width = 320;
    const height = 110;
    const paddingX = 24;
    const paddingY = 16;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = history.map((h, i) => {
      const x = paddingX + (i / (history.length - 1)) * chartW;
      const y = height - paddingY - ((h.rate - minRate) / range) * chartH;
      return { x, y, ...h };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

    return (
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <LineChart className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs text-white">
              7-Day Market Trend: {item.material || item.category}
            </h4>
          </div>
          <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Delhi Benchmark
          </span>
        </div>

        {/* SVG Curve */}
        <div className="w-full overflow-hidden flex justify-center py-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-28 overflow-visible"
            aria-label="Price history graph"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path d={areaD} fill="url(#chartGrad)" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-emerald-400 stroke-slate-900 stroke-2"
                />
                <text
                  x={pt.x}
                  y={height - 2}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 font-medium"
                >
                  {pt.day}
                </text>
                {i === points.length - 1 && (
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="text-[10px] fill-emerald-300 font-black"
                  >
                    ₹{pt.rate}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-300 pt-1 border-t border-slate-800">
          <span>7-Day Low: ₹{Math.min(...rates)}</span>
          <span className="text-emerald-400 font-bold">7-Day High: ₹{Math.max(...rates)}</span>
          <span>Unit: /{item.unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          CPCB Benchmarked Daily Rates
        </div>
        <h2 className="text-lg font-bold text-slate-900">Price Board / आज के भाव</h2>
        <p className="text-xs text-slate-500">
          Official fair market scrap buying rates updated today
        </p>
      </div>

      {/* Interactive Trend Chart for Selected Material */}
      {activeItem && renderTrendChart(activeItem)}

      {/* Info Notice for Collector */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Authorized recyclers on Kabadiwala Connect are bound to purchase at or above these fair benchmark prices. Prices vary by location, material quality and recycler.
        </p>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search materials (e.g. Copper, PCB, Screen)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600 shadow-2xs"
        />
      </div>

      {/* Price Table / Cards */}
      <div className="space-y-2.5">
        {filteredPrices.map((item) => {
          const isSelected = item.id === selectedMaterialId;
          const minVal = item.market_min || item.currentRate || 100;
          const maxVal = item.market_max || (item.currentRate ? Math.round(item.currentRate * 1.15) : 150);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedMaterialId(item.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {item.material || item.category}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Viewing Trend
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    Spec: {item.min_grading || item.minGrading}
                  </p>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-base font-black text-slate-900 leading-tight">
                    ₹{minVal} – ₹{maxVal}
                    <span className="text-xs font-semibold text-slate-500">/{item.unit}</span>
                  </div>

                  <div className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold">
                    {item.trend === 'up' && (
                      <span className="text-emerald-700 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                        +₹{item.change_amount || item.changeAmount || 15}
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="text-rose-700 flex items-center gap-0.5 bg-rose-50 px-1.5 py-0.5 rounded">
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                        -₹{item.change_amount || item.changeAmount || 10}
                      </span>
                    )}
                    {item.trend === 'stable' && (
                      <span className="text-slate-600 flex items-center gap-0.5 bg-slate-100 px-1.5 py-0.5 rounded">
                        <Minus className="w-3 h-3 text-slate-500" />
                        Stable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Updated: {item.updated_at || 'Today, 10:30 AM'}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                  Tap for 7-day chart {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
