import React, { useState } from 'react';

// Format weight nicely (kg or Metric Tons)
export function formatWeight(kg: number): string {
  if (kg >= 1000000) {
    return `${(kg / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })} MT (${kg.toLocaleString('en-IN')} kg)`;
  }
  return `${kg.toLocaleString('en-IN')} kg`;
}

// Format INR nicely (Crores, Lakhs or Thousands)
export function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹ ${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹ ${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹ ${val.toLocaleString('en-IN')}`;
}

interface BarChartItem {
  label: string;
  subLabel?: string;
  value: number;
  value2?: number;
  formattedValue?: string;
  formattedValue2?: string;
  color?: string;
}

export const BarChart: React.FC<{
  data: BarChartItem[];
  title?: string;
  height?: number;
  label1?: string;
  label2?: string;
}> = ({ data, height = 220, label1 = 'Total', label2 = 'Completed' }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 text-sm">No data available for current selection</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 1);

  return (
    <div className="w-full">
      {(label1 || label2) && data.some(d => d.value2 !== undefined) && (
        <div className="flex items-center justify-end gap-5 text-xs text-slate-600 mb-3 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
            <span>{label1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-teal-400 inline-block"></span>
            <span>{label2}</span>
          </div>
        </div>
      )}

      <div style={{ height }} className="relative flex items-end gap-2 pt-6 pb-2 border-b border-slate-200">
        {data.map((item, idx) => {
          const heightPercent1 = Math.max(4, Math.round((item.value / maxValue) * 100));
          const heightPercent2 = item.value2 !== undefined ? Math.max(4, Math.round((item.value2 / maxValue) * 100)) : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {isHovered && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white text-xs py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none transition-all">
                  <div className="font-semibold text-[11px] text-slate-200">{item.label}</div>
                  <div className="text-emerald-300">{item.formattedValue || item.value.toLocaleString()}</div>
                  {item.value2 !== undefined && (
                    <div className="text-teal-200 text-[10px]">{label2}: {item.formattedValue2 || item.value2.toLocaleString()}</div>
                  )}
                </div>
              )}

              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  style={{ height: `${heightPercent1}%` }}
                  className={`w-full max-w-[28px] rounded-t transition-all duration-300 ${
                    item.color || (isHovered ? 'bg-emerald-500' : 'bg-emerald-600')
                  }`}
                />
                {item.value2 !== undefined && (
                  <div
                    style={{ height: `${heightPercent2}%` }}
                    className={`w-full max-w-[28px] rounded-t transition-all duration-300 ${
                      isHovered ? 'bg-teal-300' : 'bg-teal-400'
                    }`}
                  />
                )}
              </div>

              <div className="mt-2 text-center w-full overflow-hidden">
                <div className="text-[11px] font-medium text-slate-700 truncate">{item.label}</div>
                {item.subLabel && <div className="text-[9px] text-slate-400 truncate">{item.subLabel}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface DonutSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  formattedValue?: string;
}

export const DonutChart: React.FC<{
  slices: DonutSlice[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}> = ({ slices, centerLabel, centerValue, size = 180 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  let accumulatedAngle = 0;
  const radius = 70;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
          {slices.map((slice, i) => {
            const pct = total > 0 ? slice.value / total : 0;
            const strokeDasharray = `${pct * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedAngle * circumference;
            accumulatedAngle += pct;
            const isHover = hovered === i;

            return (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHover ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {hovered !== null ? slices[hovered].label.slice(0, 16) : centerLabel || 'Total'}
          </span>
          <span className="text-base font-bold text-slate-900 leading-tight">
            {hovered !== null
              ? `${slices[hovered].percentage.toFixed(1)}%`
              : centerValue || (total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toString())}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 w-full">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between text-xs py-1 px-2 rounded cursor-pointer transition-colors ${
              hovered === idx ? 'bg-slate-100 font-medium' : 'hover:bg-slate-50 text-slate-700'
            }`}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
              <span className="truncate">{slice.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 font-mono text-slate-900">
              <span>{slice.percentage.toFixed(1)}%</span>
              {slice.formattedValue && <span className="text-[11px] text-slate-500">({slice.formattedValue})</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FunnelStep {
  stage: string;
  count: number;
  percentageOfTotal: number;
  description: string;
  color: string;
  statBadge?: string;
}

export const TraceabilityFunnel: React.FC<{ steps: FunnelStep[] }> = ({ steps }) => {
  return (
    <div className="space-y-3 w-full">
      {steps.map((step, idx) => {
        const widthPct = Math.max(18, Math.min(100, step.percentageOfTotal));
        return (
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-slate-900">{step.stage}</span>
                {step.statBadge && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {step.statBadge}
                  </span>
                )}
              </div>
              <div className="text-right font-mono">
                <span className="text-sm font-bold text-slate-900">{step.count.toLocaleString()} lots</span>
                <span className="text-xs text-slate-500 ml-2 font-sans">({step.percentageOfTotal.toFixed(1)}%)</span>
              </div>
            </div>

            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-1.5">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${widthPct}%`, backgroundColor: step.color }}
              />
            </div>

            <p className="text-[11px] text-slate-500">{step.description}</p>
          </div>
        );
      })}
    </div>
  );
};

interface LinePoint {
  label: string; // e.g. "Oct 25"
  min: number;
  max: number;
  avg: number;
  baseline?: number;
}

export const PriceTrendGraph: React.FC<{
  data: LinePoint[];
  materialName: string;
  location: string;
}> = ({ data, materialName, location }) => {
  const [activeIdx, setActiveIdx] = useState<number>(data.length - 1);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 text-sm">No price history available</div>;
  }

  const allVals = data.flatMap(d => [d.min, d.max, d.avg, d.baseline || d.min]);
  const minVal = Math.floor(Math.min(...allVals) * 0.9);
  const maxVal = Math.ceil(Math.max(...allVals) * 1.08);
  const range = maxVal - minVal || 1;

  const current = data[activeIdx] || data[data.length - 1];
  const upliftPercent = current.baseline ? (((current.avg - current.baseline) / current.baseline) * 100).toFixed(1) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-bold text-slate-900">{materialName}</h4>
          <span className="text-xs text-slate-500 font-medium">{location} • Monthly Benchmark (₹/kg)</span>
        </div>
        {upliftPercent && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <span>+{upliftPercent}% Fair Price Premium over Informal Middleman</span>
          </div>
        )}
      </div>

      {/* Metric Cards for Selected Month */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Avg Buying Price</div>
          <div className="text-base font-bold text-emerald-700 font-mono">₹ {current.avg}/kg</div>
          <div className="text-[10px] text-slate-400">Formal platform rate</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Price Spread Range</div>
          <div className="text-base font-bold text-slate-800 font-mono">₹ {current.min} - {current.max}</div>
          <div className="text-[10px] text-slate-400">Min to Max realized</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Informal Scrap Baseline</div>
          <div className="text-base font-bold text-rose-600 font-mono">₹ {current.baseline || '-'}/kg</div>
          <div className="text-[10px] text-slate-400">Unorganized dealer rate</div>
        </div>
        <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Selected Month</div>
          <div className="text-base font-bold text-slate-900 font-mono">{current.label}</div>
          <div className="text-[10px] text-slate-400">Click graph points</div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="h-44 w-full relative">
        <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = 140 - pct * 120;
            const val = Math.round(minVal + pct * range);
            return (
              <g key={i}>
                <line x1="30" y1={y} x2="490" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x="25" y={y + 3} textAnchor="end" className="text-[8px] fill-slate-400 font-mono">
                  ₹{val}
                </text>
              </g>
            );
          })}

          {/* Lines & Shading */}
          {/* Market Spread Area */}
          <polygon
            points={
              data.map((d, i) => {
                const x = 50 + (i / (data.length - 1)) * 420;
                const y = 140 - ((d.max - minVal) / range) * 120;
                return `${x},${y}`;
              }).join(' ') +
              ' ' +
              [...data].reverse().map((d, i) => {
                const origIdx = data.length - 1 - i;
                const x = 50 + (origIdx / (data.length - 1)) * 420;
                const y = 140 - ((d.min - minVal) / range) * 120;
                return `${x},${y}`;
              }).join(' ')
            }
            fill="#ecfdf5"
            opacity="0.8"
          />

          {/* Informal Baseline Line */}
          {data[0]?.baseline && (
            <polyline
              points={data.map((d, i) => {
                const x = 50 + (i / (data.length - 1)) * 420;
                const y = 140 - (((d.baseline || d.min) - minVal) / range) * 120;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Average Platform Line */}
          <polyline
            points={data.map((d, i) => {
              const x = 50 + (i / (data.length - 1)) * 420;
              const y = 140 - ((d.avg - minVal) / range) * 120;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#059669"
            strokeWidth="3"
          />

          {/* Clickable points */}
          {data.map((d, i) => {
            const x = 50 + (i / (data.length - 1)) * 420;
            const y = 140 - ((d.avg - minVal) / range) * 120;
            const isSelected = activeIdx === i;

            return (
              <g key={i} className="cursor-pointer" onClick={() => setActiveIdx(i)}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : 4}
                  fill={isSelected ? '#047857' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y="155"
                  textAnchor="middle"
                  className={`text-[9px] ${isSelected ? 'font-bold fill-slate-900' : 'fill-slate-500'}`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 px-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-emerald-600 rounded"></span> Average Buying Price
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-2 bg-emerald-100 border border-emerald-300 rounded"></span> Fair Price Band (Min-Max)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500"></span> Informal Middleman Baseline
          </span>
        </div>
        <span>Click any point to view monthly specifics</span>
      </div>
    </div>
  );
};
