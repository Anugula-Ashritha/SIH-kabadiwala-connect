import React, { useState } from 'react';
import {
  X,
  MapPin,
  Scale,
  Calendar,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import { WasteLot, LotStatus } from '../types';

interface LotDetailsModalProps {
  lot: WasteLot | null;
  isOpen: boolean;
  onClose: () => void;
  onFindRecyclerForLot: (lot: WasteLot) => void;
  onUpdateLotStatus: (lot: WasteLot, newStatus: LotStatus) => void;
}

const TIMELINE_STEPS: { key: LotStatus; label: string; hindi: string; description: string }[] = [
  { key: 'finding_recycler', label: 'Finding Recycler', hindi: 'खरीदार की खोज', description: 'Listed on CPCB portal' },
  { key: 'pending', label: 'Offer Sent', hindi: 'ऑफर भेजा गया', description: 'Awaiting recycler review' },
  { key: 'offer_received', label: 'Offer Received', hindi: 'ऑफर प्राप्त', description: 'Price quote ready' },
  { key: 'accepted', label: 'Accepted', hindi: 'स्वीकृत', description: 'Recycler confirmed rate' },
  { key: 'in_transit', label: 'In Transit', hindi: 'रास्ते में', description: 'Cart / pickup on the way' },
  { key: 'handover', label: 'Handover', hindi: 'हैंडओवर / वजन', description: 'Scale check at depot' },
  { key: 'completed', label: 'Completed', hindi: 'पूर्ण व भुगतान', description: 'Payment disbursed' },
];

export const LotDetailsModal: React.FC<LotDetailsModalProps> = ({
  lot,
  isOpen,
  onClose,
  onFindRecyclerForLot,
  onUpdateLotStatus,
}) => {
  const [showOtpConfirm, setShowOtpConfirm] = useState(false);
  const [otpValue, setOtpValue] = useState('4892');

  if (!isOpen || !lot) return null;

  const lotId = lot.lot_id || lot.id || 'LOT-2026';
  const materialName = lot.material || lot.category || 'E-Waste Consignment';
  const weight = lot.weight_kg || lot.weightKg || 1;
  const estMin = lot.estimated_min_value ?? (lot.estimatedPrice ? Math.round(lot.estimatedPrice * 0.9) : 1000);
  const estMax = lot.estimated_max_value ?? (lot.estimatedPrice ? Math.round(lot.estimatedPrice * 1.1) : 1400);
  const currentStatus: LotStatus = lot.status || 'pending';
  const recyclerName = lot.recycler_name || lot.recyclerName;

  // Map legacy status to index in timeline
  const getStepIndex = (status: LotStatus): number => {
    switch (status) {
      case 'draft':
      case 'finding_recycler':
        return 0;
      case 'pending':
        return 1;
      case 'offer_received':
        return 2;
      case 'accepted':
        return 3;
      case 'in_transit':
        return 4;
      case 'handover':
        return 5;
      case 'completed':
        return 6;
      default:
        return 1;
    }
  };

  const currentStepIdx = getStepIndex(currentStatus);

  const handleAdvanceStatus = () => {
    let nextStatus: LotStatus = currentStatus;
    if (currentStatus === 'finding_recycler' || currentStatus === 'draft') {
      onFindRecyclerForLot(lot);
      return;
    } else if (currentStatus === 'pending') {
      nextStatus = 'accepted';
    } else if (currentStatus === 'offer_received') {
      nextStatus = 'accepted';
    } else if (currentStatus === 'accepted') {
      nextStatus = 'in_transit';
    } else if (currentStatus === 'in_transit') {
      nextStatus = 'handover';
    } else if (currentStatus === 'handover') {
      nextStatus = 'completed';
    }
    onUpdateLotStatus(lot, nextStatus);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-emerald-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-emerald-200 bg-emerald-900/80 px-2 py-0.5 rounded">
                {lotId}
              </span>
              {lot.sync_pending && (
                <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1.5 py-0.5 rounded">
                  Sync Pending
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white mt-1 leading-tight">{materialName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-emerald-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Key Lot Summary Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100 text-center">
              <div className="flex items-center justify-center text-emerald-700 mb-0.5">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-sm font-black text-slate-900">{weight} kg</div>
              <div className="text-[10px] text-slate-500 font-medium">Net Weight</div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-center col-span-2">
              <div className="text-[10px] uppercase font-bold text-slate-500">
                {lot.final_price ? 'Final Settled Payout' : 'Estimated Fair Value'}
              </div>
              <div className="text-base font-black text-emerald-700 mt-0.5">
                {lot.final_price ? (
                  `₹${lot.final_price.toLocaleString('en-IN')}`
                ) : lot.quoted_price ? (
                  `₹${lot.quoted_price.toLocaleString('en-IN')} (Quoted)`
                ) : (
                  `₹${estMin.toLocaleString('en-IN')} – ₹${estMax.toLocaleString('en-IN')}`
                )}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {lot.condition ? `Grading: ${lot.condition}` : 'Verified CPCB Index'}
              </div>
            </div>
          </div>

          {/* Assigned Recycler Info */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                Authorized Buyer
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> CPCB Authorized
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900">
              {recyclerName || 'Awaiting Recycler Assignment'}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1 truncate max-w-[210px]">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{lot.location || 'Mayapuri Belt, Delhi'}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0">
                <Calendar className="w-3 h-3" />
                <span>{lot.created_at || lot.createdAt || 'Today'}</span>
              </div>
            </div>
          </div>

          {/* VISUAL STATUS TIMELINE */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Consignment Status Timeline / स्थिति ट्रैकिंग
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Step {currentStepIdx + 1} of 7
              </span>
            </div>

            <div className="relative pl-6 space-y-4 pt-1">
              {/* Vertical connector track */}
              <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200"></div>

              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isPending = idx > currentStepIdx;

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isPassed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : isCurrent
                          ? 'bg-emerald-700 text-white ring-4 ring-emerald-200 animate-pulse'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isCurrent
                              ? 'text-emerald-900 text-sm'
                              : isPassed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500">
                          {step.hindi}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] mt-0.5 ${
                          isCurrent ? 'text-emerald-700 font-medium' : 'text-slate-500'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OTP Verification Box for Handover */}
          {(currentStatus === 'in_transit' || currentStatus === 'handover') && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900">
                  Digital Handover Security PIN
                </span>
                <span className="font-mono text-sm font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                  PIN: {otpValue}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Share this PIN with the authorized recycler driver when they weigh the scrap on-site.
              </p>
            </div>
          )}

          {/* Completed Payout Note */}
          {currentStatus === 'completed' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3">
              <Receipt className="w-7 h-7 text-emerald-700 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Payout Settled & Transferred
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">
                  Direct Bank Credit confirmed. Digital CPCB manifest issued.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
          >
            Close
          </button>

          {currentStatus === 'finding_recycler' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onFindRecyclerForLot(lot);
              }}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              Find Authorized Recycler <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStatus === 'pending' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              Simulate Recycler Acceptance <CheckCircle2 className="w-4 h-4" />
            </button>
          )}

          {currentStatus === 'accepted' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 py-3 px-4 bg-sky-700 hover:bg-sky-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              <Truck className="w-4 h-4" /> Dispatch Scrap / Mark In Transit
            </button>
          )}

          {currentStatus === 'in_transit' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" /> Confirm On-Site Handover
            </button>
          )}

          {currentStatus === 'handover' && (
            <button
              type="button"
              onClick={handleAdvanceStatus}
              className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-98"
            >
              Complete Lot & Claim ₹{lot.final_price || lot.quoted_price || estMin}
            </button>
          )}

          {currentStatus === 'completed' && (
            <button
              type="button"
              onClick={() => onUpdateLotStatus(lot, 'in_transit')}
              className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-bold hover:bg-slate-100 flex items-center gap-1"
              title="Reset status for presentation re-demo"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
