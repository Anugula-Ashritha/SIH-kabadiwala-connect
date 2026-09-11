import React from 'react';
import { Filter, X, RotateCcw, Calendar, MapPin, Layers, CheckSquare, Factory } from 'lucide-react';
import { FilterState } from '../types';
import { STATES_AND_CITIES, MATERIAL_LIST } from '../data/mockData';

interface Props {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
}

export const GlobalFilterBar: React.FC<Props> = ({ filters, onFilterChange, onReset }) => {
  const availableCities = filters.state && filters.state !== 'All India' 
    ? (STATES_AND_CITIES[filters.state] || ['All Cities'])
    : ['All Cities'];

  const activeFilterCount = [
    filters.state !== 'All India',
    filters.city !== 'All Cities',
    filters.material !== 'All Materials',
    filters.dateRange !== 'All Time',
    filters.recyclerStatus !== 'All Recyclers',
    filters.lotStatus !== 'All Statuses'
  ].filter(Boolean).length;

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 sticky top-16 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Filter Label */}
        <div className="flex items-center gap-2 text-slate-700 shrink-0">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">Regulatory Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              {activeFilterCount} Active
            </span>
          )}
        </div>

        {/* Dropdowns Grid */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 justify-start md:justify-end">
          
          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-state"
              value={filters.state}
              onChange={(e) => {
                onFilterChange({ state: e.target.value, city: 'All Cities' });
              }}
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:ring-0 cursor-pointer outline-hidden pr-4"
            >
              <option value="All India">All States (India)</option>
              {Object.keys(STATES_AND_CITIES).map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <select
              id="filter-city"
              value={filters.city}
              disabled={filters.state === 'All India'}
              onChange={(e) => onFilterChange({ city: e.target.value })}
              className={`bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer outline-hidden pr-4 ${
                filters.state === 'All India' ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'
              }`}
            >
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Material Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-material"
              value={filters.material}
              onChange={(e) => onFilterChange({ material: e.target.value })}
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:ring-0 cursor-pointer outline-hidden pr-4 max-w-[160px] truncate"
            >
              {MATERIAL_LIST.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-date-range"
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value })}
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:ring-0 cursor-pointer outline-hidden pr-4"
            >
              <option value="All Time">All Time (FY 2025-26)</option>
              <option value="2026-03">March 2026 (Current)</option>
              <option value="2026-02">February 2026</option>
              <option value="2026-01">January 2026</option>
            </select>
          </div>

          {/* Recycler Authorization Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <Factory className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-recycler"
              value={filters.recyclerStatus}
              onChange={(e) => onFilterChange({ recyclerStatus: e.target.value })}
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:ring-0 cursor-pointer outline-hidden pr-4"
            >
              <option value="All Recyclers">All Recyclers</option>
              <option value="CPCB Authorized">CPCB Authorized</option>
              <option value="SPCB Certified">SPCB Certified</option>
              <option value="Under Audit">Under Audit</option>
              <option value="Renewal Due">Renewal Due</option>
            </select>
          </div>

          {/* Lot Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs hover:border-slate-300">
            <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="filter-lot-status"
              value={filters.lotStatus}
              onChange={(e) => onFilterChange({ lotStatus: e.target.value })}
              className="bg-transparent border-none text-xs text-slate-800 font-medium focus:ring-0 cursor-pointer outline-hidden pr-4"
            >
              <option value="All Statuses">All Lot Statuses</option>
              <option value="Matched">Matched</option>
              <option value="Accepted">Accepted</option>
              <option value="Handed Over">Handed Over (In Transit)</option>
              <option value="Completed">Completed & Settled</option>
            </select>
          </div>

          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              id="btn-reset-filters"
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition border border-dashed border-slate-300 font-medium"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
