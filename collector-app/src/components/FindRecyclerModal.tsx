import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Truck,
  IndianRupee,
  Star,
  CheckCircle2,
  Filter,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Recycler, WasteLot } from '../types';
import { matchRecyclers, RecyclerFilters } from '../services/recyclerMatchingService';

interface FindRecyclerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: WasteLot | null;
  allLots: WasteLot[];
  recyclers: Recycler[];
  onSelectRecyclerForLot: (lot: WasteLot, recycler: Recycler) => void;
}

export const FindRecyclerModal: React.FC<FindRecyclerModalProps> = ({
  isOpen,
  onClose,
  lot,
  allLots,
  recyclers,
  onSelectRecyclerForLot,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string>(lot?.lot_id || lot?.id || '');
  const [maxDistance, setMaxDistance] = useState<number>(10);
  const [pickupOnly, setPickupOnly] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'score' | 'distance' | 'rate'>('score');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Send Lot confirmation sub-state
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    lot: WasteLot;
    recycler: Recycler;
  } | null>(null);

  if (!isOpen) return null;

  // Resolve current lot or pick first pending lot
  const activeLot: WasteLot =
    allLots.find((l) => (l.lot_id || l.id) === selectedLotId) ||
    lot ||
    allLots[0];

  const filters: RecyclerFilters = {
    maxDistanceKm: maxDistance,
    pickupOnly,
    verifiedOnly,
    sortBy,
  };

  const matchedResults = matchRecyclers(activeLot, recyclers, filters);

  const handleConfirmSend = () => {
    if (pendingConfirmation) {
      onSelectRecyclerForLot(pendingConfirmation.lot, pendingConfirmation.recycler);
      setPendingConfirmation(null);
      onClose();
    }
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              Government Verified Network
            </span>
            <h2 className="text-base font-bold text-white mt-0.5 leading-tight">
              Authorized Recyclers / खरीदार चुनें
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-700 hover:bg-emerald-600 flex items-center justify-center text-emerald-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Lot Selector Banner */}
        <div className="bg-emerald-50/90 px-4 py-3 border-b border-emerald-100 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-950">Matching for Consignment:</span>
            {allLots.length > 1 ? (
              <select
                value={activeLot.lot_id || activeLot.id}
                onChange={(e) => setSelectedLotId(e.target.value)}
                aria-label="Select consignment to match recyclers for"
                className="text-xs font-mono font-bold text-emerald-900 bg-white border border-emerald-200 rounded-lg px-2 py-1 focus:outline-emerald-600"
              >
                {allLots.map((l) => (
                  <option key={l.lot_id || l.id} value={l.lot_id || l.id}>
                    {l.lot_id || l.id} ({l.material || l.category})
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {activeLot.lot_id || activeLot.id}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-700">
            <span className="font-semibold">{activeLot.material || activeLot.category}</span>
            <span>
              {activeLot.weight_kg || activeLot.weightKg} kg • Est:{' '}
              <strong className="text-emerald-800">
                ₹
                {(activeLot.estimated_min_value ?? activeLot.estimatedPrice ?? 1000).toLocaleString(
                  'en-IN'
                )}
              </strong>
            </span>
          </div>
        </div>

        {/* Filter Bar Controls */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSortBy('score')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                sortBy === 'score'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Best Match
            </button>
            <button
              type="button"
              onClick={() => setSortBy('distance')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                sortBy === 'distance'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Nearest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('rate')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                sortBy === 'rate'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Highest Rate
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 text-slate-600 hover:text-emerald-700 font-bold ml-2 text-[11px]"
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        {/* Expandable Filter Details */}
        {showFilters && (
          <div className="p-3 bg-slate-100/80 border-b border-slate-200 space-y-2 text-xs text-slate-700 shrink-0">
            <div className="flex items-center justify-between">
              <span>Max Distance: {maxDistance} km</span>
              <input
                type="range"
                min="2"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-32 accent-emerald-600"
              />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickupOnly}
                  onChange={(e) => setPickupOnly(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                Pickup Required
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                Govt Verified Only
              </label>
            </div>
          </div>
        )}

        {/* Recycler Cards List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {matchedResults.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
              <p className="text-xs text-slate-500 font-medium">
                No recyclers match the current filters. Try expanding the distance limit.
              </p>
              <button
                type="button"
                onClick={() => {
                  setMaxDistance(25);
                  setPickupOnly(false);
                }}
                className="mt-2 text-xs font-bold text-emerald-700 underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            matchedResults.map(({ recycler, score, matchReasons, offeredPriceForLot, ratePerKg }) => {
              const name = recycler.organization_name || recycler.name || 'Recycler Hub';
              const dist = recycler.distance_km ?? recycler.distanceKm ?? 2;
              const authNum = recycler.authorization_number || recycler.cpcbRegNumber || 'CPCB/EW/DL/2026';
              const hasPickup = recycler.pickup_available ?? true;
              const accepted = recycler.materials_accepted || recycler.acceptedMaterials || [];

              return (
                <div
                  key={recycler.recycler_id || recycler.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">{name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="CPCB Verified" />
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-0.5">{authNum}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {score}% Match
                      </span>
                      <div className="text-[11px] text-slate-500 font-medium mt-1">
                        {dist} km away
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Pickup Strip */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        Offered Rate
                      </span>
                      <div className="font-black text-slate-900 text-sm flex items-center mt-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {ratePerKg}
                        <span className="text-[10px] text-slate-500 font-normal">/kg</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">
                        Estimated Payout
                      </span>
                      <div className="font-black text-emerald-700 text-sm mt-0.5">
                        ₹{offeredPriceForLot.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Highlights / Features */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasPickup ? 'Doorstep cart pickup' : 'Depot drop-off only'}</span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-amber-700">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>{recycler.rating || 4.8} / 5.0</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate">
                    <strong>Service Area:</strong> {recycler.service_area || recycler.address || 'Delhi-NCR'}
                  </div>

                  {/* Primary Sell Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setPendingConfirmation({
                        lot: activeLot,
                        recycler,
                      });
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    Sell Lot to Recycler <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Confirmation Modal Overlay (Send Lot to Recycler) */}
        {pendingConfirmation && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white rounded-3xl w-full max-w-sm p-5 border border-slate-200 shadow-2xl space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Confirm Consignment Sale</h3>
                <p className="text-xs text-slate-500 mt-0.5">लॉट की बिक्री की पुष्टि करें</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lot ID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {pendingConfirmation.lot.lot_id || pendingConfirmation.lot.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recycler:</span>
                  <span className="font-bold text-emerald-800 truncate max-w-[180px]">
                    {pendingConfirmation.recycler.organization_name || pendingConfirmation.recycler.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Material:</span>
                  <span className="font-bold text-slate-800">
                    {pendingConfirmation.lot.material || pendingConfirmation.lot.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Weight:</span>
                  <span className="font-bold text-slate-800">
                    {pendingConfirmation.lot.weight_kg || pendingConfirmation.lot.weightKg} kg
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold">
                  <span className="text-slate-700">Estimated Value:</span>
                  <span className="text-emerald-700 text-sm">
                    ₹
                    {(
                      pendingConfirmation.lot.estimated_min_value ??
                      pendingConfirmation.lot.estimatedPrice ??
                      1200
                    ).toLocaleString('en-IN')}{' '}
                    – ₹
                    {(
                      pendingConfirmation.lot.estimated_max_value ??
                      (pendingConfirmation.lot.estimatedPrice ? pendingConfirmation.lot.estimatedPrice * 1.15 : 1400)
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPendingConfirmation(null)}
                  className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="flex-1 py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" /> Send Lot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
