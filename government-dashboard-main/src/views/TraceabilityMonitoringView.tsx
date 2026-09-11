import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Lock, 
  Search, 
  FileCheck, 
  AlertCircle, 
  Layers, 
  Eye, 
  Hash,
  Truck,
  IndianRupee
} from 'lucide-react';
import { TraceabilityStats, FilterState, AnonymizedLot } from '../types';
import { TraceabilityFunnel, formatINR } from '../components/Charts';

interface Props {
  traceability: TraceabilityStats;
  lots: AnonymizedLot[];
  filters: FilterState;
}

export const TraceabilityMonitoringView: React.FC<Props> = ({ traceability, lots, filters }) => {
  const [searchLot, setSearchLot] = useState('');
  const [selectedLotModal, setSelectedLotModal] = useState<AnonymizedLot | null>(null);

  const funnelSteps = [
    {
      stage: '1. Aggregated Informal Lots',
      count: traceability.total_lots,
      percentageOfTotal: 100,
      description: 'Micro-batches logged by verified informal collectors at local aggregators',
      color: '#0284c7'
    },
    {
      stage: '2. Matched with Authorized Recyclers',
      count: traceability.matched_lots,
      percentageOfTotal: (traceability.matched_lots / (traceability.total_lots || 1)) * 100,
      description: 'Algorithmic matching to closest CPCB/SPCB licensed recycling facility',
      color: '#0d9488'
    },
    {
      stage: '3. Price & Grade Accepted',
      count: traceability.accepted_lots,
      percentageOfTotal: (traceability.accepted_lots / (traceability.total_lots || 1)) * 100,
      description: 'Recycler commits to rate per kg & schedule for weighbridge intake',
      color: '#059669'
    },
    {
      stage: '4. Digitally Handed Over (In Transit)',
      count: traceability.handed_over_lots,
      percentageOfTotal: (traceability.handed_over_lots / (traceability.total_lots || 1)) * 100,
      description: 'Digital transit manifest generated with tamper-proof electronic gatepass',
      color: '#10b981',
      statBadge: `${traceability.pending_handover} staging`
    },
    {
      stage: '5. Completed, Weighed & Settled',
      count: traceability.completed_lots,
      percentageOfTotal: (traceability.completed_lots / (traceability.total_lots || 1)) * 100,
      description: 'Physical weighbridge verified, digital payment released directly to collector account',
      color: '#047857',
      statBadge: `${traceability.traceability_completion_rate}% closed`
    }
  ];

  const filteredLots = lots.filter(lot => {
    if (!searchLot) return true;
    const q = searchLot.toLowerCase();
    return (
      lot.lot_id.toLowerCase().includes(q) ||
      lot.material.toLowerCase().includes(q) ||
      lot.collector_cohort.toLowerCase().includes(q) ||
      lot.recycler_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Traceability & Formal Channel Funnel
          </h2>
          <p className="text-xs text-slate-500">
            End-to-end statutory verification from informal collector intake to physical recycler weighbridge settlement.
          </p>
        </div>

        {/* Privacy Seal */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-emerald-400 text-xs font-semibold rounded-lg shadow-xs border border-slate-800">
          <Lock className="w-3.5 h-3.5" />
          <span>Strict Privacy Compliance: Zero PII Exposed</span>
        </div>
      </div>

      {/* Top Funnel Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Traceability Completion</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {traceability.traceability_completion_rate}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Closed-loop verified lots</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Completed Formal Batches</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {traceability.completed_lots.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">Out of {traceability.total_lots.toLocaleString()} total logged</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pending Physical Handover</div>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">
            {traceability.pending_handover} lots
          </div>
          <div className="text-xs text-amber-700 mt-1">In staging / dispatch transit</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Pending Settlement Payout</div>
          <div className="text-2xl font-black text-blue-600 font-mono mt-1">
            {traceability.pending_payment} lots
          </div>
          <div className="text-xs text-blue-700 mt-1">Weighed, bank escrow release underway</div>
        </div>
      </div>

      {/* 5-Stage Traceability Funnel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">5-Stage Formalization Funnel</h3>
            <p className="text-xs text-slate-500">Continuous chain of custody tracking to eliminate leakage into informal dumping</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded font-semibold border border-emerald-200">
            CPCB E-Waste Rules 2022 Mandate
          </span>
        </div>

        <TraceabilityFunnel steps={funnelSteps} />
      </div>

      {/* Anonymized Lot Audit Trail Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Anonymized Chain-of-Custody Manifest Register</h3>
            <p className="text-xs text-slate-500">
              Aggregated batch records with tamper-evident digital hashes. Phone numbers and personal IDs are cryptographically hashed.
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Lot ID, Cohort, or Recycler..."
              value={searchLot}
              onChange={(e) => setSearchLot(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Lot ID & Hash</th>
                <th className="py-3 px-4">Anonymized Collector Cohort</th>
                <th className="py-3 px-4">Material Fraction</th>
                <th className="py-3 px-4">Gross Weight</th>
                <th className="py-3 px-4">Assigned Recycler</th>
                <th className="py-3 px-4">Stage Status</th>
                <th className="py-3 px-4">Payout Settlement</th>
                <th className="py-3 px-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLots.map((lot) => {
                const isCompleted = lot.status === 'Completed';
                const isHandover = lot.status === 'Handed Over';
                const isAccepted = lot.status === 'Accepted';

                return (
                  <tr key={lot.lot_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono">{lot.lot_id}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                        <Hash className="w-2.5 h-2.5" />
                        <span>{lot.batch_hash}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {lot.collector_cohort}
                      <span className="text-[10px] text-slate-400 block font-normal">
                        {lot.city}, {lot.state}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {lot.material}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {lot.weight_kg} kg
                    </td>

                    <td className="py-3 px-4 text-slate-700">
                      {lot.recycler_name}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isHandover
                          ? 'bg-blue-100 text-blue-800'
                          : isAccepted
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        {lot.status}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        ₹ {lot.transaction_value.toLocaleString('en-IN')}
                      </div>
                      <span className={`text-[10px] font-semibold ${
                        lot.payment_status === 'Settled'
                          ? 'text-emerald-700'
                          : lot.payment_status === 'Processing'
                          ? 'text-blue-700'
                          : 'text-amber-700'
                      }`}>
                        {lot.payment_status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedLotModal(lot)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition"
                        title="View Custody Log"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lot Detail Modal */}
      {selectedLotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                  Electronic Gatepass & Chain of Custody
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Lot ID: {selectedLotModal.lot_id}
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Batch Ledger Hash: {selectedLotModal.batch_hash}
                </div>
              </div>
              <button
                onClick={() => setSelectedLotModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Material</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedLotModal.material}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Net Weight</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">{selectedLotModal.weight_kg} kg</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Assigned Recycler</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedLotModal.recycler_name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Disbursed Value</div>
                  <div className="font-bold text-emerald-700 font-mono mt-0.5">
                    ₹ {selectedLotModal.transaction_value.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Timestamp Milestones */}
              <div className="space-y-2 border-l-2 border-emerald-500 pl-3 ml-2">
                <div>
                  <div className="text-slate-500 text-[10px]">1. Intake & Matched</div>
                  <div className="font-semibold text-slate-900">{selectedLotModal.matched_date}</div>
                </div>
                {selectedLotModal.accepted_date && (
                  <div>
                    <div className="text-slate-500 text-[10px]">2. Recycler Price Agreement</div>
                    <div className="font-semibold text-slate-900">{selectedLotModal.accepted_date}</div>
                  </div>
                )}
                {selectedLotModal.handover_date && (
                  <div>
                    <div className="text-slate-500 text-[10px]">3. Handed Over / Weighbridge Scale In</div>
                    <div className="font-semibold text-slate-900">{selectedLotModal.handover_date}</div>
                  </div>
                )}
                {selectedLotModal.settled_date && (
                  <div>
                    <div className="text-emerald-700 text-[10px] font-bold">4. Final Escrow Settlement</div>
                    <div className="font-bold text-emerald-800">{selectedLotModal.settled_date} (Paid)</div>
                  </div>
                )}
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Weighbridge digital ticket and tamper-evident manifest authenticated by CPCB node.</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedLotModal(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
