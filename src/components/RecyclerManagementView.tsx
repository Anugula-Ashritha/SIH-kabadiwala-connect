import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Truck,
  Edit,
  ExternalLink,
  X,
  Phone,
  Mail
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Recycler, RecyclerVerificationStatus, MaterialCategory } from '../types';
import { StatusBadge } from './StatusBadge';

interface RecyclerManagementProps {
  selectedCity: string;
  globalSearch: string;
}

export const RecyclerManagementView: React.FC<RecyclerManagementProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { recyclers, updateRecyclerVerification } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [authFilter, setAuthFilter] = useState<string>('All');
  const [materialFilter, setMaterialFilter] = useState<string>('All');
  const [selectedRecycler, setSelectedRecycler] = useState<Recycler | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [newAuthStatus, setNewAuthStatus] = useState<RecyclerVerificationStatus>('Verified');
  const [auditNotes, setAuditNotes] = useState('');

  const activeSearch = searchQuery || globalSearch;

  const filtered = recyclers.filter((rec) => {
    // City / Location filter
    if (selectedCity !== 'All') {
      const matchCity =
        rec.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
        rec.service_area.some(a => a.toLowerCase().includes(selectedCity.toLowerCase()));
      if (!matchCity) return false;
    }
    // Auth filter
    if (authFilter !== 'All' && rec.authorization_status !== authFilter) {
      return false;
    }
    // Material filter
    if (materialFilter !== 'All' && !rec.materials_accepted.includes(materialFilter as MaterialCategory)) {
      return false;
    }
    // Search
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const match =
        rec.recycler_id.toLowerCase().includes(q) ||
        rec.organization_name.toLowerCase().includes(q) ||
        rec.contact_person.toLowerCase().includes(q) ||
        rec.authorization_number.toLowerCase().includes(q) ||
        rec.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAuthModal = (rec: Recycler) => {
    setSelectedRecycler(rec);
    setNewAuthStatus(rec.authorization_status);
    setAuditNotes('');
    setIsAuthModalOpen(true);
  };

  const handleSaveVerification = () => {
    if (selectedRecycler) {
      updateRecyclerVerification(selectedRecycler.recycler_id, newAuthStatus, auditNotes);
      setSelectedRecycler(prev => (prev ? { ...prev, authorization_status: newAuthStatus } : null));
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="recycler-search-input"
            type="text"
            placeholder="Search by recycler ID, name, CPCB reg number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">CPCB Verification:</span>
            <select
              id="recycler-auth-filter"
              value={authFilter}
              onChange={(e) => setAuthFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Verification States</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending Review</option>
              <option value="Needs Update">Needs Update</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold">Material Accepted:</span>
            <select
              id="recycler-material-filter"
              value={materialFilter}
              onChange={(e) => setMaterialFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All E-Waste Streams</option>
              <option value="PCB">PCB</option>
              <option value="Batteries">Batteries</option>
              <option value="Cables">Cables</option>
              <option value="CRT">CRT</option>
              <option value="LCD/LED">LCD/LED</option>
              <option value="Motors/Magnets">Motors/Magnets</option>
              <option value="Mixed Plastics">Mixed Plastics</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {recyclers.length}
          </div>
        </div>
      </div>

      {/* Recyclers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Recycler ID</th>
                <th className="px-4 py-3.5">Organization & Contact</th>
                <th className="px-4 py-3.5">Facility Location</th>
                <th className="px-4 py-3.5">CPCB Reg #</th>
                <th className="px-4 py-3.5">Authorization Status</th>
                <th className="px-4 py-3.5">Valid Until</th>
                <th className="px-4 py-3.5">Streams Accepted</th>
                <th className="px-4 py-3.5">Logistics Pickup</th>
                <th className="px-4 py-3.5">Offered Rate Summary</th>
                <th className="px-4 py-3.5 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No recyclers match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => {
                  const isExpiringSoon = new Date(rec.authorization_expiry) < new Date('2026-12-31');
                  const isExpired = new Date(rec.authorization_expiry) < new Date('2026-09-11');

                  return (
                    <tr key={rec.recycler_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-700">
                        {rec.recycler_id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{rec.organization_name}</div>
                        <div className="text-[11px] text-slate-500">Contact: {rec.contact_person}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1 text-slate-800">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{rec.location}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Service: {rec.service_area.slice(0, 2).join(', ')}...
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800">
                        {rec.authorization_number}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge type="recyclerAuth" status={rec.authorization_status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`font-medium ${isExpired ? 'text-rose-600 font-bold' : isExpiringSoon ? 'text-amber-600' : 'text-slate-700'}`}>
                          {rec.authorization_expiry}
                        </div>
                        {isExpired ? (
                          <span className="text-[10px] text-rose-600 font-semibold">EXPIRED</span>
                        ) : isExpiringSoon ? (
                          <span className="text-[10px] text-amber-600 font-medium">Renewal Due</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rec.materials_accepted.map((m) => (
                            <span
                              key={m}
                              className="px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] border border-teal-200"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {rec.pickup_available ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                            <Truck className="w-3 h-3" /> Yes (Fleet Active)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Self-drop only</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-slate-600 max-w-xs truncate" title={rec.offered_rate_summary}>
                        {rec.offered_rate_summary}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          id={`manage-auth-btn-${rec.recycler_id}`}
                          onClick={() => handleOpenAuthModal(rec)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded border border-teal-300 transition-colors inline-flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Review Auth</span>
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

      {/* Recycler Authorization Details & Status Update Modal */}
      {isAuthModalOpen && selectedRecycler && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-600" />
                  Recycler CPCB / SPCB Authorization Review
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRecycler.organization_name} • {selectedRecycler.recycler_id}
                </p>
              </div>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Certificate Summary Card */}
              <div className="bg-teal-950 text-white p-4 rounded-xl border border-teal-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
                    National E-Waste Dismantler Registry
                  </span>
                  <StatusBadge type="recyclerAuth" status={selectedRecycler.authorization_status} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-400 text-[10px]">Authorization / License No.</p>
                    <p className="font-mono font-bold text-teal-200 text-sm mt-0.5">
                      {selectedRecycler.authorization_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Validity Expiration</p>
                    <p className="font-semibold text-white mt-0.5">
                      {selectedRecycler.authorization_expiry}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Processing Capacity</p>
                    <p className="font-semibold text-white mt-0.5">
                      {selectedRecycler.processing_capacity_tons_pm || 200} Metric Tons / month
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px]">Last Regulatory Audit</p>
                    <p className="font-semibold text-white mt-0.5">
                      {selectedRecycler.last_audit_date || '2026-01-15'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Organization Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 p-3.5 rounded-lg space-y-1.5">
                  <p className="font-bold text-slate-900">Contact Person</p>
                  <p className="text-slate-700 font-medium">{selectedRecycler.contact_person}</p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" /> {selectedRecycler.phone || '+91 44 2250 1190'}
                  </p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" /> {selectedRecycler.email || 'compliance@recycler.in'}
                  </p>
                </div>
                <div className="border border-slate-200 p-3.5 rounded-lg space-y-1.5">
                  <p className="font-bold text-slate-900">Authorized Logistics Area</p>
                  <p className="text-slate-700">{selectedRecycler.service_area.join(', ')}</p>
                  <p className="text-slate-500">
                    Pickup Fleet: <span className="font-semibold text-slate-800">{selectedRecycler.pickup_available ? 'Available' : 'No'}</span>
                  </p>
                  <p className="text-slate-500">
                    Account Status: <span className="font-semibold text-slate-800">{selectedRecycler.account_status}</span>
                  </p>
                </div>
              </div>

              {/* Authorized Materials */}
              <div>
                <p className="text-xs font-bold text-slate-900 mb-2">
                  Licensed Material Streams (CPCB Authorized)
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecycler.materials_accepted.map(mat => (
                    <span
                      key={mat}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Change Verification Status Section (Mandated by Prompt) */}
              <div className="border-t border-slate-200 pt-5 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Update Recycler Verification Status
                </label>
                <p className="text-xs text-slate-500">
                  Select the official verification state according to CPCB portal audit:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Pending', 'Verified', 'Rejected', 'Needs Update'] as RecyclerVerificationStatus[]).map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setNewAuthStatus(statusOption)}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                        newAuthStatus === statusOption
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{statusOption}</span>
                      <StatusBadge type="recyclerAuth" status={statusOption} size="sm" />
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Compliance Verification Audit Notes / Reason
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter inspection reference, certificate upload stamp, or reason for rejection/needs update..."
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="save-recycler-auth-button"
                onClick={handleSaveVerification}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
              >
                Confirm Verification Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
