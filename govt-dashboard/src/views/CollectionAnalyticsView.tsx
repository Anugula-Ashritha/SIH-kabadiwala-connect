import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Calendar, 
  ArrowUpDown, 
  Search, 
  Scale, 
  IndianRupee, 
  CheckCircle, 
  Download,
  Building,
  TrendingUp
} from 'lucide-react';
import { RegionalCollection, FilterState } from '../types';
import { BarChart, formatINR, formatWeight } from '../components/Charts';

interface Props {
  collections: RegionalCollection[];
  filters: FilterState;
}

export const CollectionAnalyticsView: React.FC<Props> = ({ collections, filters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'total_weight_kg' | 'completed_weight_kg' | 'lots_collected' | 'transaction_value'>('total_weight_kg');
  const [sortAsc, setSortAsc] = useState(false);

  // Group by month for trend chart
  const monthlyTrends = useMemo(() => {
    const map: Record<string, { total: number; completed: number; lots: number; value: number }> = {};
    collections.forEach(c => {
      if (!map[c.month]) {
        map[c.month] = { total: 0, completed: 0, lots: 0, value: 0 };
      }
      map[c.month].total += c.total_weight_kg;
      map[c.month].completed += c.completed_weight_kg;
      map[c.month].lots += c.lots_collected;
      map[c.month].value += c.transaction_value;
    });

    const monthNames: Record<string, string> = {
      '2026-01': 'Jan 2026',
      '2026-02': 'Feb 2026',
      '2026-03': 'Mar 2026'
    };

    return Object.entries(map).map(([month, d]) => ({
      label: monthNames[month] || month,
      value: Math.round(d.total / 1000), // MT
      value2: Math.round(d.completed / 1000),
      formattedValue: `${(d.total / 1000).toFixed(1)} MT (${d.lots} lots)`,
      formattedValue2: `${(d.completed / 1000).toFixed(1)} MT (${formatINR(d.value)})`
    }));
  }, [collections]);

  // Aggregate by City/Cluster
  const citySummary = useMemo(() => {
    const map: Record<string, {
      state: string;
      city: string;
      lots_collected: number;
      total_weight_kg: number;
      completed_weight_kg: number;
      transaction_value: number;
    }> = {};

    collections.forEach(c => {
      const key = `${c.state}__${c.city}`;
      if (!map[key]) {
        map[key] = {
          state: c.state,
          city: c.city,
          lots_collected: 0,
          total_weight_kg: 0,
          completed_weight_kg: 0,
          transaction_value: 0
        };
      }
      map[key].lots_collected += c.lots_collected;
      map[key].total_weight_kg += c.total_weight_kg;
      map[key].completed_weight_kg += c.completed_weight_kg;
      map[key].transaction_value += c.transaction_value;
    });

    return Object.values(map);
  }, [collections]);

  // Filter & sort cities
  const filteredCities = useMemo(() => {
    return citySummary
      .filter(item => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return item.city.toLowerCase().includes(q) || item.state.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        return sortAsc ? valA - valB : valB - valA;
      });
  }, [citySummary, searchQuery, sortField, sortAsc]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const totalGrossKg = collections.reduce((s, c) => s + c.total_weight_kg, 0);
  const totalCompletedKg = collections.reduce((s, c) => s + c.completed_weight_kg, 0);
  const totalLots = collections.reduce((s, c) => s + c.lots_collected, 0);
  const totalValue = collections.reduce((s, c) => s + c.transaction_value, 0);
  const formalCompletionRate = totalGrossKg > 0 ? ((totalCompletedKg / totalGrossKg) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            E-Waste Collection Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Regional aggregation of micro-collector lots, gross tonnage, verified weighbridge weight, and digital disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            Overall Formal Realization: <strong>{formalCompletionRate}%</strong>
          </span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Gross Monitored Weight</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {formatWeight(totalGrossKg)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Aggregated via collector intake</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Verified Recycler Weight</div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatWeight(totalCompletedKg)}
          </div>
          <div className="text-xs text-emerald-600 mt-1">{formalCompletionRate}% formal channel completion</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Aggregated Lots</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {totalLots.toLocaleString()} lots
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Avg ~{totalLots > 0 ? Math.round(totalGrossKg / totalLots) : 0} kg per lot batch
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Disbursed Value</div>
          <div className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            {formatINR(totalValue)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Direct to informal collectors</div>
        </div>
      </div>

      {/* Monthly Collection Trajectory Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Monthly Collection & Formal Handover Trajectory</h3>
            <p className="text-xs text-slate-500">Growth trajectory in Metric Tons (MT) across FY 2025-26</p>
          </div>
          <div className="text-xs font-mono text-slate-500">
            Source: CPCB Central Weighbridge Ingestion API
          </div>
        </div>

        <BarChart
          data={monthlyTrends}
          height={200}
          label1="Gross Intake (MT)"
          label2="Completed Handover (MT)"
        />
      </div>

      {/* City/Cluster Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">State & City Collection Performance Matrix</h3>
            <p className="text-xs text-slate-500">Breakdown of lots, weights, and informal value realizations</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search state or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-60"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">State & City Cluster</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition"
                  onClick={() => handleSort('lots_collected')}
                >
                  <div className="flex items-center gap-1">
                    <span>Lots Collected</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition"
                  onClick={() => handleSort('total_weight_kg')}
                >
                  <div className="flex items-center gap-1">
                    <span>Gross Weight (kg)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition"
                  onClick={() => handleSort('completed_weight_kg')}
                >
                  <div className="flex items-center gap-1">
                    <span>Completed Weight (kg)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Formal Rate</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:bg-slate-200/50 transition text-right"
                  onClick={() => handleSort('transaction_value')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Transaction Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCities.map((item, idx) => {
                const formalRate = item.total_weight_kg > 0 
                  ? ((item.completed_weight_kg / item.total_weight_kg) * 100).toFixed(1) 
                  : '0';
                
                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.city}</div>
                      <div className="text-[11px] text-slate-500">{item.state}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {item.lots_collected.toLocaleString()} lots
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {item.total_weight_kg.toLocaleString('en-IN')} kg
                      <span className="text-[10px] text-slate-400 block font-sans">
                        ({(item.total_weight_kg / 1000).toFixed(1)} MT)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                      {item.completed_weight_kg.toLocaleString('en-IN')} kg
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono text-[11px]">{formalRate}%</span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full" 
                            style={{ width: `${Math.min(100, Number(formalRate))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">
                      {formatINR(item.transaction_value)}
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
