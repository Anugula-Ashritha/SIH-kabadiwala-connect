import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  Package,
  Eye,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Collector, CollectorAccountStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface CollectorManagementProps {
  selectedCity: string;
  globalSearch: string;
}

export const CollectorManagementView: React.FC<CollectorManagementProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { collectors, updateCollectorStatus, lots } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<CollectorAccountStatus>('Active');

  const activeSearch = searchQuery || globalSearch;

  // Filter collectors
  const filtered = collectors.filter((col) => {
    // City filter
    if (selectedCity !== 'All' && col.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'All' && col.account_status !== statusFilter) {
      return false;
    }
    // Language filter
    if (languageFilter !== 'All' && col.preferred_language !== languageFilter) {
      return false;
    }
    // Search query
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        col.collector_id.toLowerCase().includes(q) ||
        col.name.toLowerCase().includes(q) ||
        col.phone.toLowerCase().includes(q) ||
        col.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenEdit = (col: Collector) => {
    setSelectedCollector(col);
    setEditStatus(col.account_status);
    setIsEditModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (selectedCollector) {
      updateCollectorStatus(selectedCollector.collector_id, editStatus);
      setSelectedCollector(prev => (prev ? { ...prev, account_status: editStatus } : null));
      setIsEditModalOpen(false);
    }
  };

  // Collector's lots if detail is open
  const collectorLots = selectedCollector
    ? lots.filter(l => l.collector_id === selectedCollector.collector_id)
    : [];

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="collector-search-input"
            type="text"
            placeholder="Search by ID, name, phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Status:</span>
            <select
              id="collector-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Review">Under Review</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Language:</span>
            <select
              id="collector-language-filter"
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Languages</option>
              <option value="Tamil">Tamil</option>
              <option value="Kannada">Kannada</option>
              <option value="Telugu">Telugu</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {collectors.length}
          </div>
        </div>
      </div>

      {/* Collectors Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Collector ID</th>
                <th className="px-4 py-3.5">Name & Area</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">City</th>
                <th className="px-4 py-3.5">Lang</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5">Lots (Total / Done)</th>
                <th className="px-4 py-3.5">Total Earnings</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                    No collectors match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((col) => (
                  <tr key={col.collector_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">
                      {col.collector_id}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{col.name}</div>
                      <div className="text-[11px] text-slate-500">{col.ward_or_area || 'Standard Ward'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-800">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{col.phone}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{col.upi_id || 'UPI Not Linked'}</div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {col.city}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {col.preferred_language}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {col.registration_date}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {col.completed_lots} <span className="text-slate-400 font-normal">/ {col.total_lots}</span>
                      </div>
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{
                            width: `${col.total_lots > 0 ? (col.completed_lots / col.total_lots) * 100 : 0}%`
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ₹{col.total_earnings.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge type="collector" status={col.account_status} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {col.last_active}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCollector(col)}
                        title="View Full Profile & Lot History"
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">View</span>
                      </button>
                      <button
                        onClick={() => handleOpenEdit(col)}
                        title="Change Account Status"
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collector Details Drawer / Modal */}
      {selectedCollector && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                  {selectedCollector.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {selectedCollector.name}
                    <StatusBadge type="collector" status={selectedCollector.account_status} />
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID: <span className="font-mono font-bold text-emerald-700">{selectedCollector.collector_id}</span> • Registered {selectedCollector.registration_date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCollector(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Earnings</p>
                  <p className="text-sm font-bold text-emerald-700 mt-0.5">
                    ₹{selectedCollector.total_earnings.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Lots Completed</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedCollector.completed_lots} / {selectedCollector.total_lots}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">City / Cluster</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedCollector.city}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Language</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedCollector.preferred_language}</p>
                </div>
              </div>

              {/* Contact & KYC details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 p-3.5 rounded-lg space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" /> Digital Contact & Banking
                  </h4>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Phone:</span> {selectedCollector.phone}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">UPI VPA:</span> {selectedCollector.upi_id || 'Not provided'}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Ward / Area:</span> {selectedCollector.ward_or_area || 'General Ward'}
                  </p>
                </div>

                <div className="border border-slate-200 p-3.5 rounded-lg space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Informal Onboarding & KYC
                  </h4>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">KYC Status:</span>{' '}
                    <span className="font-semibold text-emerald-700">{selectedCollector.kyc_status || 'Verified'}</span>
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Last Active:</span> {selectedCollector.last_active}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">App Version:</span> v2.4 (Collector Micro-PWA)
                  </p>
                </div>
              </div>

              {/* Collector Lots History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Recent Lots Submitted by {selectedCollector.name}
                </h4>
                {collectorLots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No lots found for this collector.</p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2">Lot ID</th>
                          <th className="px-3 py-2">Material</th>
                          <th className="px-3 py-2">Weight</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {collectorLots.map(lot => (
                          <tr key={lot.lot_id} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-mono font-bold text-emerald-700">{lot.lot_id}</td>
                            <td className="px-3 py-2 text-slate-800">{lot.material}</td>
                            <td className="px-3 py-2 font-medium">{lot.weight_kg} kg</td>
                            <td className="px-3 py-2 font-semibold text-slate-900">
                              ₹{lot.final_price || lot.quoted_price}
                            </td>
                            <td className="px-3 py-2">
                              <StatusBadge type="lot" status={lot.status} size="sm" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCollector(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleOpenEdit(selectedCollector)}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Change Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isEditModalOpen && selectedCollector && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Update Collector Account Status
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Collector: <span className="font-semibold text-slate-800">{selectedCollector.name}</span> ({selectedCollector.collector_id})
            </p>

            <div className="space-y-3">
              {(['Active', 'Under Review', 'Suspended', 'Inactive'] as CollectorAccountStatus[]).map((st) => (
                <label
                  key={st}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    editStatus === st
                      ? 'border-emerald-500 bg-emerald-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="collector-status"
                      checked={editStatus === st}
                      onChange={() => setEditStatus(st)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-semibold text-slate-800">{st}</span>
                  </div>
                  <StatusBadge type="collector" status={st} />
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
