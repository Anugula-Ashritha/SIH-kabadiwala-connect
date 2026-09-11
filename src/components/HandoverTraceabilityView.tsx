import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Scale,
  MapPin,
  Calendar,
  Image as ImageIcon,
  FileCheck,
  ShieldCheck,
  Building2,
  User,
  Eye,
  Clock,
  X
} from 'lucide-react';
import { useData } from '../services/dataService';
import { Handover, HandoverStatus } from '../types';
import { StatusBadge } from './StatusBadge';

interface HandoverTraceabilityProps {
  selectedCity: string;
  globalSearch: string;
}

export const HandoverTraceabilityView: React.FC<HandoverTraceabilityProps> = ({
  selectedCity,
  globalSearch
}) => {
  const { handovers, lots, collectors, recyclers, confirmHandover } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedHandover, setSelectedHandover] = useState<Handover | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmedWeightInput, setConfirmedWeightInput] = useState<number>(0);
  const [signoffNameInput, setSignoffNameInput] = useState('');

  const activeSearch = searchQuery || globalSearch;

  const filtered = handovers.filter((h) => {
    // City filter
    if (selectedCity !== 'All' && !h.location.toLowerCase().includes(selectedCity.toLowerCase())) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'All' && h.status !== statusFilter) {
      return false;
    }
    // Search query
    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase();
      const col = collectors.find(c => c.collector_id === h.collector_id);
      const rec = recyclers.find(r => r.recycler_id === h.recycler_id);
      const match =
        h.unique_reference.toLowerCase().includes(q) ||
        h.handover_id.toLowerCase().includes(q) ||
        h.lot_id.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (col && col.name.toLowerCase().includes(q)) ||
        (rec && rec.organization_name.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleOpenConfirm = (h: Handover) => {
    setSelectedHandover(h);
    const linkedLot = lots.find(l => l.lot_id === h.lot_id);
    setConfirmedWeightInput(h.weight_confirmed || (linkedLot ? linkedLot.weight_kg : 0));
    setSignoffNameInput('Lead Admin Signoff (CPCB Custody)');
    setIsConfirmModalOpen(true);
  };

  const handleSaveConfirmation = () => {
    if (selectedHandover) {
      confirmHandover(selectedHandover.handover_id, confirmedWeightInput, signoffNameInput);
      setSelectedHandover(prev =>
        prev
          ? {
              ...prev,
              weight_confirmed: confirmedWeightInput,
              recycler_confirmation: true,
              status: 'Verified',
              manifest_signoff_by: signoffNameInput
            }
          : null
      );
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Traceability Header Info */}
      <div className="bg-gradient-to-r from-slate-900 to-teal-950 text-white p-5 rounded-xl border border-teal-800/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable Traceability & Chain of Custody
          </div>
          <h3 className="text-lg font-bold">Formal Gate Weighbridge Verification</h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Verifying tamper-proof physical handovers with certified scale weights, photographic manifests, and geo-referenced recycler confirmations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Handovers</p>
            <p className="text-lg font-bold text-teal-300">{handovers.length}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg text-center">
            <p className="text-[10px] uppercase font-bold text-slate-400">Weigh Flagged</p>
            <p className="text-lg font-bold text-rose-400">
              {handovers.filter(h => h.status === 'Discrepancy Flagged').length}
            </p>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="handover-search-input"
            type="text"
            placeholder="Search by unique reference (e.g. KC-TRC-), lot ID, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold">Custody Status:</span>
            <select
              id="handover-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="All">All Verification States</option>
              <option value="Completed">Completed</option>
              <option value="Verified">Verified</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Discrepancy Flagged">Discrepancy Flagged</option>
            </select>
          </div>

          <div className="text-xs text-slate-400 font-medium pl-2">
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of {handovers.length}
          </div>
        </div>
      </div>

      {/* Handover Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Traceability Reference</th>
                <th className="px-4 py-3.5">Lot ID</th>
                <th className="px-4 py-3.5">Origin Collector</th>
                <th className="px-4 py-3.5">Receiving Recycler</th>
                <th className="px-4 py-3.5">Scale Confirmed Weight</th>
                <th className="px-4 py-3.5">Discrepancy</th>
                <th className="px-4 py-3.5">Recycler Confirmation</th>
                <th className="px-4 py-3.5">Handover Timestamp</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Manifest Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    No handover records found.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => {
                  const collector = collectors.find(c => c.collector_id === h.collector_id);
                  const recycler = recyclers.find(r => r.recycler_id === h.recycler_id);
                  const linkedLot = lots.find(l => l.lot_id === h.lot_id);

                  const hasDiscrepancy = h.discrepancy_kg && Math.abs(h.discrepancy_kg) > 0.5;

                  return (
                    <tr key={h.handover_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-800">
                        {h.unique_reference}
                        <div className="text-[10px] text-slate-400 font-normal">{h.handover_id}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                        {h.lot_id}
                        {linkedLot && (
                          <div className="text-[10px] text-slate-500 font-sans">{linkedLot.material_category}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{collector ? collector.name : h.collector_id}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{h.collector_id}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800 truncate max-w-xs">
                          {recycler ? recycler.organization_name : h.recycler_id}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        {h.weight_confirmed.toFixed(1)} kg
                        {linkedLot && (
                          <div className="text-[10px] text-slate-400 font-normal">
                            Lot claim: {linkedLot.weight_kg.toFixed(1)} kg
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {hasDiscrepancy ? (
                          <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            {h.discrepancy_kg! > 0 ? `+${h.discrepancy_kg} kg` : `${h.discrepancy_kg} kg`}
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Matched (0.0 kg)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {h.recycler_confirmation ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Sign
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-[11px]">
                        <div>{h.handover_date_time}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{h.location}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge type="handover" status={h.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => setSelectedHandover(h)}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded border border-slate-200 transition-colors inline-flex items-center gap-1"
                          title="View Digital Handover Manifest"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-semibold">Manifest</span>
                        </button>
                        {!h.recycler_confirmation && (
                          <button
                            onClick={() => handleOpenConfirm(h)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors inline-flex items-center gap-1 font-semibold"
                            title="Sign Off Handover"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Verify</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manifest Detail Modal */}
      {selectedHandover && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  E-Waste Gate Handover Manifest
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  Ref: <span className="font-bold text-teal-800">{selectedHandover.unique_reference}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedHandover(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Scale Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Scale Weight</p>
                  <p className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedHandover.weight_confirmed.toFixed(1)} kg
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Weighbridge Status</p>
                  <StatusBadge type="handover" status={selectedHandover.status} size="sm" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Deviation</p>
                  <p className={`text-sm font-bold mt-0.5 ${selectedHandover.discrepancy_kg && Math.abs(selectedHandover.discrepancy_kg) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedHandover.discrepancy_kg || 0} kg
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Recycler Signoff</p>
                  <p className="text-xs font-semibold mt-0.5 text-slate-800">
                    {selectedHandover.recycler_confirmation ? 'Signed & Verified' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Weighbridge Scale Photo Inspection Reference */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-teal-600" /> Weighbridge Scale & Lot Photo Evidence
                </h4>
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 h-52 flex items-center justify-center">
                  <img
                    src={selectedHandover.photo_reference}
                    alt="Handover Weighbridge inspection"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded text-[11px] font-mono border border-slate-700">
                    Geo-Stamp: {selectedHandover.location} • {selectedHandover.handover_date_time}
                  </div>
                </div>
              </div>

              {/* Audit Signoff trail */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                <p className="font-bold text-slate-800">Manifest Certification Signoff</p>
                <p className="text-slate-600">
                  <span className="font-semibold">Inspector / Supervisor:</span>{' '}
                  {selectedHandover.manifest_signoff_by || 'Field Supervisor Pending'}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold">Weighbridge Station:</span> {selectedHandover.location}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setSelectedHandover(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Close
              </button>
              {!selectedHandover.recycler_confirmation && (
                <button
                  onClick={() => {
                    handleOpenConfirm(selectedHandover);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
                >
                  Verify Weighbridge Log
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify Scale Modal */}
      {isConfirmModalOpen && selectedHandover && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Confirm Gate Handover Scale Weight
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Manifest: <span className="font-mono font-bold text-teal-800">{selectedHandover.unique_reference}</span>
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirmed Scale Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={confirmedWeightInput}
                  onChange={(e) => setConfirmedWeightInput(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspector / Admin Signoff Authority</label>
                <input
                  type="text"
                  value={signoffNameInput}
                  onChange={(e) => setSignoffNameInput(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Inspector Name or Emp ID"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="save-handover-confirm-button"
                onClick={handleSaveConfirmation}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
              >
                Sign & Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
