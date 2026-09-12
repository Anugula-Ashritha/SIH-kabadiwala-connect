import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  MapPin, 
  FileText, 
  Eye, 
  Calendar,
  X,
  Clock,
  Layers
} from 'lucide-react';
import { RecyclerStats, FilterState } from '../types';
import { formatINR, formatWeight } from '../components/Charts';

interface Props {
  recyclers: RecyclerStats[];
  filters: FilterState;
}

export const RecyclerNetworkView: React.FC<Props> = ({ recyclers, filters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecycler, setSelectedRecycler] = useState<RecyclerStats | null>(null);

  const filteredRecyclers = recyclers.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      r.authorization_number.toLowerCase().includes(q)
    );
  });

  const totalProcessedKg = recyclers.reduce((s, r) => s + r.processed_weight_kg, 0);
  const totalCompletedLots = recyclers.reduce((s, r) => s + r.completed_lots, 0);
  const totalMonthlyCapacity = recyclers.reduce((s, r) => s + r.capacity_metric_tons_per_month, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Formal Recycler Network Directory & Compliance
          </h2>
          <p className="text-xs text-slate-500">
            CPCB & SPCB Authorized Processing Facilities: Authorization tracking, authorized material streams, and formal capacity utilization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            {recyclers.length} Facilities Listed
          </span>
        </div>
      </div>

      {/* Network Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Processed E-Waste</div>
          <div className="text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {formatWeight(totalProcessedKg)}
          </div>
          <div className="text-xs text-slate-400 mt-1">Verified recycling throughput</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Cumulative Monthly Capacity</div>
          <div className="text-xl font-extrabold text-slate-900 font-mono mt-1">
            {totalMonthlyCapacity.toLocaleString('en-IN')} MT / month
          </div>
          <div className="text-xs text-slate-400 mt-1">Authorized CPCB licensed capacity</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Closed Informal Batches</div>
          <div className="text-xl font-extrabold text-blue-700 font-mono mt-1">
            {totalCompletedLots.toLocaleString()} lots
          </div>
          <div className="text-xs text-slate-400 mt-1">Successfully settled & paid to micro-aggregators</div>
        </div>
      </div>

      {/* Recyclers Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Accredited Recyclers Register</h3>
            <p className="text-xs text-slate-500">Search by facility name, city, state, or license certificate</p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search facility name or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Facility & Location</th>
                <th className="py-3 px-4">Authorization Status</th>
                <th className="py-3 px-4">CPCB License No.</th>
                <th className="py-3 px-4">Fleet Pickup</th>
                <th className="py-3 px-4">Service Area</th>
                <th className="py-3 px-4">Monthly Capacity</th>
                <th className="py-3 px-4">Processed Weight</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecyclers.map((rec) => {
                const isCpcb = rec.authorization_status === 'CPCB Authorized';
                const isSpcb = rec.authorization_status === 'SPCB Certified';
                const isAudit = rec.authorization_status === 'Under Audit';
                const isRenewal = rec.authorization_status === 'Renewal Due';

                return (
                  <tr key={rec.recycler_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{rec.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{rec.city}, {rec.state}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCpcb
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSpcb
                          ? 'bg-blue-100 text-blue-800'
                          : isAudit
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isCpcb && <ShieldCheck className="w-3 h-3" />}
                        {rec.authorization_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                      {rec.authorization_number}
                    </td>

                    <td className="py-3 px-4">
                      {rec.pickup_available ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Truck className="w-3.5 h-3.5" /> Direct Fleet Pickup
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-normal">
                          Self-Drop at Facility
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-700 text-[11px]">
                      {rec.service_area}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                      {rec.capacity_metric_tons_per_month} MT/mo
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {(rec.processed_weight_kg / 1000).toFixed(1)} MT
                      <span className="text-[10px] text-slate-400 font-normal block font-sans">
                        {rec.completed_lots} lots settled
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedRecycler(rec)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded transition flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Audit Dossier</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recycler Detail Modal */}
      {selectedRecycler && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            
            <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  CPCB Regulatory Facility Dossier
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {selectedRecycler.name}
                </h3>
                <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{selectedRecycler.city}, {selectedRecycler.state}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecycler(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              
              {/* License & Status */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Authorization Status</div>
                  <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedRecycler.authorization_status}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Audit Valid Until</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedRecycler.audit_valid_until}</span>
                  </div>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">License Certificate</div>
                  <div className="font-mono font-semibold text-slate-800 mt-0.5 select-all">
                    {selectedRecycler.authorization_number}
                  </div>
                </div>
              </div>

              {/* Operating Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Monthly Capacity</div>
                  <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                    {selectedRecycler.capacity_metric_tons_per_month} MT
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Processed Weight</div>
                  <div className="text-sm font-bold text-emerald-700 font-mono mt-1">
                    {(selectedRecycler.processed_weight_kg / 1000).toFixed(1)} MT
                  </div>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 text-center">
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Completed Lots</div>
                  <div className="text-sm font-bold text-blue-700 font-mono mt-1">
                    {selectedRecycler.completed_lots}
                  </div>
                </div>
              </div>

              {/* Authorized Streams */}
              <div>
                <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-600" />
                  <span>Licensed Material Streams</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRecycler.materials_accepted.map((m, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-100 border border-slate-200 rounded text-slate-800 font-medium text-[11px]">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Service Area & Fleet */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-700" />
                  <span>Logistics & Cluster Service Coverage</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-snug">
                  Service Area: <strong>{selectedRecycler.service_area}</strong>. 
                  {selectedRecycler.pickup_available 
                    ? ' Dedicated direct pickup fleet available for batches exceeding 200 kg.' 
                    : ' Aggregators must deliver directly to central processing gate.'}
                </p>
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedRecycler(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs transition"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
