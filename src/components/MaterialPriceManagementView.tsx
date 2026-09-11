import React, { useState } from 'react';
import {
  IndianRupee,
  Search,
  Filter,
  Layers,
  Edit2,
  Plus,
  TrendingUp,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Tag,
  ShieldCheck,
  Building2,
  X
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Material, Price, MaterialCategory } from '../types';

interface MaterialPriceProps {
  selectedCity: string;
  globalSearch: string;
}

const MANDATORY_CATEGORIES: MaterialCategory[] = [
  'CRT',
  'LCD/LED',
  'PCB',
  'Cables',
  'Batteries',
  'Motors/Magnets',
  'Mixed Plastics',
  'Other E-Waste'
];

export const MaterialPriceManagementView: React.FC<MaterialPriceProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { materials, prices, updatePriceRate, addPriceRate, recyclers } = useData();

  const [activeSubTab, setActiveSubTab] = useState<'prices' | 'materials'>('prices');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [buyingRateInput, setBuyingRateInput] = useState<number>(0);
  const [minRateInput, setMinRateInput] = useState<number>(0);
  const [maxRateInput, setMaxRateInput] = useState<number>(0);

  // Add new price benchmark state
  const [newCategory, setNewCategory] = useState<MaterialCategory>('PCB');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [newLocation, setNewLocation] = useState('Chennai');
  const [newBuyingRate, setNewBuyingRate] = useState<number>(100);
  const [newMinRate, setNewMinRate] = useState<number>(90);
  const [newMaxRate, setNewMaxRate] = useState<number>(120);
  const [newSourceType, setNewSourceType] = useState<Price['source_type']>('CPCB Benchmark');

  const activeSearch = searchQuery || globalSearch;

  // Filter prices
  const filteredPrices = prices.filter((p) => {
    if (selectedCity !== 'All' && !p.location.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'All' && p.material !== categoryFilter) {
      return false;
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        p.price_id.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.source_type.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filter materials
  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'All' && m.category !== categoryFilter) {
      return false;
    }
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        m.material_id.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.subcategory.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenEdit = (price: Price) => {
    setSelectedPrice(price);
    setBuyingRateInput(price.buying_price_per_kg);
    setMinRateInput(price.market_min);
    setMaxRateInput(price.market_max);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (selectedPrice) {
      updatePriceRate(selectedPrice.price_id, buyingRateInput, minRateInput, maxRateInput);
      setIsEditModalOpen(false);
    }
  };

  const handleSaveNew = () => {
    addPriceRate({
      material: newCategory,
      subcategory: newSubcategory || `${newCategory} Standard Assortment`,
      location: newLocation,
      buying_price_per_kg: newBuyingRate,
      market_min: newMinRate,
      market_max: newMaxRate,
      recycler_id: 'All Authorized Recyclers',
      effective_date: new Date().toISOString().substring(0, 10),
      source_type: newSourceType
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Mandatory E-Waste Material Categories (CPCB / SIH 2026)
            </h3>
            <p className="text-xs text-slate-500">
              Regulatory classification for pricing floors, dismantling rules, and recycler authorization
            </p>
          </div>
          <button
            id="add-benchmark-rate-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Price Benchmark</span>
          </button>
        </div>

        {/* 8 Categories Visual Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {MANDATORY_CATEGORIES.map((cat) => {
            const count = prices.filter(p => p.material === cat).length;
            const isSelected = categoryFilter === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(isSelected ? 'All' : cat)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="text-xs font-semibold truncate">{cat}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{count} rates active</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-tabs: Benchmark Rates vs Material Catalog */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 border-b border-slate-200 w-full">
          <button
            onClick={() => setActiveSubTab('prices')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeSubTab === 'prices'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Buying Price Benchmarks & Floors ({filteredPrices.length})
          </button>
          <button
            onClick={() => setActiveSubTab('materials')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeSubTab === 'materials'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Material Entity Catalog ({filteredMaterials.length})
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="price-search-input"
            type="text"
            placeholder="Search material, subcategory, benchmark or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {categoryFilter !== 'All' && (
            <button
              onClick={() => setCategoryFilter('All')}
              className="px-2.5 py-1 text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg"
            >
              Reset Category ({categoryFilter})
            </button>
          )}
          <span className="text-xs text-slate-400 font-medium">
            Showing <span className="font-bold text-slate-800">{activeSubTab === 'prices' ? filteredPrices.length : filteredMaterials.length}</span> entries
          </span>
        </div>
      </div>

      {/* Subtab Content: Prices Table */}
      {activeSubTab === 'prices' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Price ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Subcategory Stream</th>
                  <th className="px-4 py-3.5">Operational Hub</th>
                  <th className="px-4 py-3.5">Buying Price / kg</th>
                  <th className="px-4 py-3.5">Fair Range (Min - Max)</th>
                  <th className="px-4 py-3.5">Source & Benchmark</th>
                  <th className="px-4 py-3.5">Effective Date</th>
                  <th className="px-4 py-3.5 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPrices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      No price benchmarks found.
                    </td>
                  </tr>
                ) : (
                  filteredPrices.map((p) => (
                    <tr key={p.price_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                        {p.price_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                          {p.material}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-900 max-w-xs truncate">
                        {p.subcategory}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{p.location}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900 text-sm whitespace-nowrap">
                        ₹{p.buying_price_per_kg} <span className="text-xs font-normal text-slate-500">/ kg</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        ₹{p.market_min} - ₹{p.market_max} / kg
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {p.source_type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        {p.effective_date}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Adjust Rate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab Content: Materials Table */}
      {activeSubTab === 'materials' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Material ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Subcategory & Description</th>
                  <th className="px-4 py-3.5">Measurement Unit</th>
                  <th className="px-4 py-3.5">Hazardous Classification</th>
                  <th className="px-4 py-3.5">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredMaterials.map((m) => (
                  <tr key={m.material_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-teal-700">
                      {m.material_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold border border-teal-200 text-[11px]">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{m.subcategory}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{m.description}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-medium text-slate-800">
                      {m.unit}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        m.hazardous_rating === 'High'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : m.hazardous_rating === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {m.hazardous_rating || 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {m.active_status ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Active in Aggregator App
                        </span>
                      ) : (
                        <span className="text-slate-400">Disabled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Rate Modal */}
      {isEditModalOpen && selectedPrice && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Adjust Buying Price Benchmark
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedPrice.material} • {selectedPrice.subcategory} ({selectedPrice.location})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Admin Recommended Buying Rate (₹ / kg)</label>
                <input
                  type="number"
                  value={buyingRateInput}
                  onChange={(e) => setBuyingRateInput(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Market Min (₹ / kg)</label>
                  <input
                    type="number"
                    value={minRateInput}
                    onChange={(e) => setMinRateInput(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Market Max (₹ / kg)</label>
                  <input
                    type="number"
                    value={maxRateInput}
                    onChange={(e) => setMaxRateInput(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="save-price-adjust-btn"
                onClick={handleSaveEdit}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Update Benchmark Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Price Benchmark Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Add New Regional E-Waste Price Benchmark
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Establishes the transparent minimum buying rate for informal collectors.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Waste Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MaterialCategory)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                >
                  {MANDATORY_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subcategory Stream Name</label>
                <input
                  type="text"
                  placeholder="e.g. Copper Yoke Coils, LFP Batteries"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Cluster</label>
                  <select
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    <option value="Chennai">Chennai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Coimbatore">Coimbatore</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Benchmark</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as Price['source_type'])}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800"
                  >
                    <option value="CPCB Benchmark">CPCB Benchmark</option>
                    <option value="Recycler Quotation">Recycler Quotation</option>
                    <option value="Admin Floor Price">Admin Floor Price</option>
                    <option value="Spot Market">Spot Market</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Floor Rate (₹)</label>
                  <input
                    type="number"
                    value={newBuyingRate}
                    onChange={(e) => setNewBuyingRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min (₹)</label>
                  <input
                    type="number"
                    value={newMinRate}
                    onChange={(e) => setNewMinRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max (₹)</label>
                  <input
                    type="number"
                    value={newMaxRate}
                    onChange={(e) => setNewMaxRate(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="create-price-rate-btn"
                onClick={handleSaveNew}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Create Benchmark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
