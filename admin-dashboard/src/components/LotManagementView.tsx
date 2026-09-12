import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  Scale,
  IndianRupee,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  X,
  PlusCircle,
  Truck
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Lot, LotStatus, MaterialCategory } from '../types';
import { StatusBadge } from './StatusBadge';

interface LotManagementProps {
  selectedCity: string;
  globalSearch: string;
}

const ALL_LOT_STATUSES: LotStatus[] = [
  'Created',
  'Finding Recycler',
  'Offer Received',
  'Accepted',
  'In Transit',
  'Handover Pending',
  'Completed',
  'Rejected',
  'Payment Pending'
];

export const LotManagementView: React.FC<LotManagementProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { lots, collectors, recyclers, updateLotStatus } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<LotStatus>('In Transit');
  const [selectedRecyclerId, setSelectedRecyclerId] = useState('');
  const [finalPriceInput, setFinalPriceInput] = useState<number>(0);

  const activeSearch = searchQuery || globalSearch;

  const filtered = lots.filter((lot) => {
    // City filter
    if (selectedCity !== 'All' && !lot.location.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'All' && lot.status !== statusFilter) {
      return false;
    }
    // Category filter
    if (categoryFilter !== 'All' && lot.material_category !== categoryFilter) {
      return false;
    }
    // Search
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const col = collectors.find(c => c.collector_id === lot.collector_id);
      const rec = recyclers.find(r => r.recycler_id === lot.recycler_id);
      const match =
        lot.lot_id.toLowerCase().includes(q) ||
        lot.material.toLowerCase().includes(q) ||
        lot.location.toLowerCase().includes(q) ||
        (col && col.name.toLowerCase().includes(q)) ||
        (rec && rec.organization_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenUpdateModal = (lot: Lot) => {
    setSelectedLot(lot);
    setNewStatus(lot.status);
    setSelectedRecyclerId(lot.recycler_id || '');
    setFinalPriceInput(lot.final_price || lot.quoted_price || 0);
    setIsUpdateModalOpen(true);
  };

  const handleSaveLotStatus = () => {
    if (selectedLot) {
      updateLotStatus(selectedLot.lot_id, newStatus, selectedRecyclerId, finalPriceInput);
      setSelectedLot(prev =>
        prev
          ? {
              ...prev,
              status: newStatus,
              recycler_id: selectedRecyclerId,
              final_price: finalPriceInput
            }
          : null
      );
      setIsUpdateModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="lot-search-input"
            type="text"
            placeholder="Search by lot ID, material, collector or recycler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Lot Status:</span>
            <select
              id="lot-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Lot Statuses ({lots.length})</option>
              {ALL_LOT_STATUSES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Stream:</span>
            <select
              id="lot-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="PCB">PCB</option>
              <option value="Batteries">Batteries</option>
              <option value="Cables">Cables</option>
              <option value="CRT">CRT</option>
              <option value="LCD/LED">LCD/LED</option>
              <option value="Motors/Magnets">Motors/Magnets</option>
              <option value="Mixed Plastics">Mixed Plastics</option>
              <option value="Other E-Waste">Other E-Waste</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {lots.length}
          </div>
        </div>
      </div>

      {/* Lot Status Quick Pipeline Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setStatusFilter('All')}
          className={`px-3 py-1.5 rounded-lg border font-medium transition-colors whitespace-nowrap ${
            statusFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({lots.length})
        </button>
        {ALL_LOT_STATUSES.map(st => {
          const count = lots.filter(l => l.status === st).length;
          if (count === 0 && statusFilter !== st) return null;
          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === st
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{st}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === st ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Lot ID</th>
                <th className="px-4 py-3.5">Collector</th>
                <th className="px-4 py-3.5">Category & Material</th>
                <th className="px-4 py-3.5">Weight</th>
                <th className="px-4 py-3.5">Est. Value (Min-Max)</th>
                <th className="px-4 py-3.5">Quoted / Final</th>
                <th className="px-4 py-3.5">Assigned Recycler</th>
                <th className="px-4 py-3.5">Lifecycle Status</th>
                <th className="px-4 py-3.5">Created Date & Location</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No lots found matching current criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((lot) => {
                  const collector = collectors.find(c => c.collector_id === lot.collector_id);
                  const recycler = recyclers.find(r => r.recycler_id === lot.recycler_id);

                  return (
                    <tr key={lot.lot_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                        {lot.lot_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">
                          {collector ? collector.name : lot.collector_id}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{lot.collector_id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-0.5">
                          {lot.material_category}
                        </div>
                        <p className="text-slate-800 text-[11px] font-medium truncate max-w-xs">{lot.material}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {lot.weight_kg.toFixed(1)} kg
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-500 font-medium">
                          ₹{lot.estimated_min_value.toLocaleString('en-IN')} - ₹{lot.estimated_max_value.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {lot.final_price > 0 ? `₹${lot.final_price.toLocaleString('en-IN')}` : (
                            lot.quoted_price > 0 ? `₹${lot.quoted_price.toLocaleString('en-IN')} (Q)` : 'Pending Offer'
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {recycler ? (
                          <div className="font-medium text-slate-800 max-w-xs truncate" title={recycler.organization_name}>
                            {recycler.organization_name}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge type="lot" status={lot.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-700 whitespace-nowrap">{lot.created_at}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{lot.location}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedLot(lot)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">View</span>
                        </button>
                        <button
                          onClick={() => handleOpenUpdateModal(lot)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="Advance or Update Lot"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Detail Modal */}
      {selectedLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedLot.lot_id}
                    <StatusBadge type="lot" status={selectedLot.status} />
                  </h3>
                  <p className="text-xs text-slate-500">
                    Created on {selectedLot.created_at} • {selectedLot.location}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Weight</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedLot.weight_kg.toFixed(1)} kg</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Category</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">{selectedLot.material_category}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Quoted Price</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    {selectedLot.quoted_price ? `₹${selectedLot.quoted_price.toLocaleString('en-IN')}` : 'Awaiting'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Final Settlement</p>
                  <p className="text-sm font-bold text-emerald-800 mt-0.5">
                    {selectedLot.final_price ? `₹${selectedLot.final_price.toLocaleString('en-IN')}` : 'In Progress'}
                  </p>
                </div>
              </div>

              {/* Material Detail */}
              <div className="border border-slate-200 p-4 rounded-xl space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-500">Material Stream Specs</h4>
                <p className="text-sm font-bold text-slate-900">{selectedLot.material}</p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold">Fair Benchmark Valuation:</span> ₹{selectedLot.estimated_min_value.toLocaleString('en-IN')} to ₹{selectedLot.estimated_max_value.toLocaleString('en-IN')}
                </p>
                {selectedLot.notes && (
                  <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                    Logistics Notes: {selectedLot.notes}
                  </p>
                )}
              </div>

              {/* Collector & Recycler Mapping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Origin Collector</p>
                  <p className="font-bold text-slate-900 text-sm">
                    {collectors.find(c => c.collector_id === selectedLot.collector_id)?.name || selectedLot.collector_id}
                  </p>
                  <p className="text-slate-500">Collector ID: {selectedLot.collector_id}</p>
                  <p className="text-slate-500">Hub: {selectedLot.location}</p>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-lg space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Destination Recycler</p>
                  {selectedLot.recycler_id ? (
                    <>
                      <p className="font-bold text-teal-900 text-sm">
                        {recyclers.find(r => r.recycler_id === selectedLot.recycler_id)?.organization_name || selectedLot.recycler_id}
                      </p>
                      <p className="text-slate-500">Recycler ID: {selectedLot.recycler_id}</p>
                    </>
                  ) : (
                    <p className="text-slate-400 italic">No formal recycler matched yet.</p>
                  )}
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Aggregation Lifecycle Progress</h4>
                <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
                  {['Created', 'Finding Recycler', 'Accepted', 'In Transit', 'Handover Pending', 'Completed'].map((stage, idx) => {
                    const currentIndex = ['Created', 'Finding Recycler', 'Accepted', 'In Transit', 'Handover Pending', 'Completed'].indexOf(selectedLot.status);
                    const isDone = currentIndex >= idx;
                    const isCurrent = selectedLot.status === stage;

                    return (
                      <div
                        key={stage}
                        className={`flex-1 min-w-[100px] text-center p-2 rounded border text-xs ${
                          isCurrent
                            ? 'bg-emerald-600 text-white font-bold border-emerald-700'
                            : isDone
                            ? 'bg-emerald-50 text-emerald-900 font-medium border-emerald-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedLot(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleOpenUpdateModal(selectedLot);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Update Lot Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advance / Update Lot Modal */}
      {isUpdateModalOpen && selectedLot && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Advance Lot Lifecycle Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Lot: <span className="font-semibold text-slate-800">{selectedLot.lot_id}</span> ({selectedLot.material})
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select New Status</label>
                <select
                  id="lot-new-status-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as LotStatus)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                >
                  {ALL_LOT_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Recycler</label>
                <select
                  id="lot-recycler-assign-select"
                  value={selectedRecyclerId}
                  onChange={(e) => setSelectedRecyclerId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                >
                  <option value="">Unassigned</option>
                  {recyclers.map(r => (
                    <option key={r.recycler_id} value={r.recycler_id}>
                      {r.organization_name} ({r.authorization_status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Agreed Price (₹)</label>
                <input
                  type="number"
                  value={finalPriceInput}
                  onChange={(e) => setFinalPriceInput(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Final settlement price"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="save-lot-status-button"
                onClick={handleSaveLotStatus}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Save Lot Progression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
