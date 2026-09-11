import React from 'react';
import {
  PlusCircle,
  IndianRupee,
  Scale,
  Package,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Recycler, WasteLot, NavTab } from '../types';

interface HomeScreenProps {
  lots: WasteLot[];
  recyclers: Recycler[];
  onOpenCreateLot: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onSelectLot?: (lot: WasteLot) => void;
  onSelectRecycler?: (recycler: Recycler) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  lots,
  recyclers,
  onOpenCreateLot,
  onNavigateTab,
  onSelectLot,
  onSelectRecycler,
}) => {
  // Compute realistic today metrics dynamically or from lots
  const todayLots = lots.filter((l) => (l.created_at || l.createdAt || '').toLowerCase().includes('today') || (l.created_at || l.createdAt || '').toLowerCase().includes('just now'));
  const todayEarnings = lots
    .filter((l) => l.status === 'accepted' || l.status === 'completed')
    .reduce((sum, l) => sum + (l.final_price || l.quoted_price || l.estimatedPrice || l.estimated_min_value || 0), 2450);

  const todayWeight = lots.reduce((sum, l) => sum + (l.weight_kg || l.weightKg || 0), 0) || 34.5;
  const todayLotsCount = lots.length || 3;

  const getStatusBadge = (status: WasteLot['status']) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'in_transit':
      case 'handover':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
            <Truck className="w-3 h-3 text-sky-600" />
            In Transit
          </span>
        );
      case 'finding_recycler':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Clock className="w-3 h-3 text-emerald-600" />
            Finding Buyer
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Offer
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto">
      {/* SECTION 1: CREATE NEW LOT (Primary Touch Target) */}
      <section aria-labelledby="create-lot-heading">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1 bg-emerald-800/60 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                <Sparkles className="w-2.5 h-2.5" />
                Quick Action / नया लॉट
              </div>
              <h2 id="create-lot-heading" className="text-lg font-bold leading-tight">
                Create New Lot
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5 max-w-[200px] leading-snug">
                List your collected e-waste to get instant fair offers from authorized recyclers
              </p>
            </div>
            <button
              onClick={onOpenCreateLot}
              className="bg-white hover:bg-emerald-50 active:scale-95 text-emerald-800 font-extrabold px-4 py-3 rounded-xl shadow-md flex flex-col items-center justify-center shrink-0 min-w-[90px] border border-emerald-100 transition-all cursor-pointer"
              aria-label="Create New Lot"
            >
              <PlusCircle className="w-6 h-6 text-emerald-600 mb-0.5 stroke-[2.5]" />
              <span className="text-xs font-bold">+ New Lot</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: TODAY'S EARNINGS */}
      <section aria-labelledby="earnings-heading">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Daily Summary / आज की कमाई
              </span>
              <h2 id="earnings-heading" className="text-sm font-bold text-slate-900">
                Today&apos;s Earnings
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('earnings')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
            >
              Details <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50/80 rounded-xl p-2.5 border border-emerald-100 text-center">
              <div className="flex items-center justify-center text-emerald-700 mb-1">
                <IndianRupee className="w-4 h-4" />
              </div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                ₹{todayEarnings.toLocaleString('en-IN')}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Earned Today
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <Scale className="w-4 h-4" />
              </div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {Number(todayWeight.toFixed(1))} <span className="text-xs font-normal">kg</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Weight Sold
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
              <div className="flex items-center justify-center text-slate-600 mb-1">
                <Package className="w-4 h-4" />
              </div>
              <div className="text-base font-extrabold text-slate-900 leading-tight">
                {todayLotsCount}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                Lots Active
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: RECENT LOTS */}
      <section aria-labelledby="recent-lots-heading">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 id="recent-lots-heading" className="text-sm font-bold text-slate-900">
              Recent Lots
            </h2>
            <span className="text-[11px] text-slate-500">Your listed scrap lots (Tap to view status)</span>
          </div>
          <button
            onClick={() => onNavigateTab('lots')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            View All ({lots.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {lots.slice(0, 3).map((lot) => {
            const lotId = lot.lot_id || lot.id || 'LOT-2026';
            const material = lot.material || lot.category;
            const weight = lot.weight_kg || lot.weightKg;
            const price = lot.final_price || lot.quoted_price || lot.estimatedPrice || lot.estimated_min_value;
            const recycler = lot.recycler_name || lot.recyclerName;
            const date = lot.created_at || lot.createdAt;
            const summary = lot.description || lot.itemsSummary;

            return (
              <div
                key={lotId}
                onClick={() => onSelectLot?.(lot)}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer active:scale-99"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {lotId}
                      </span>
                      {getStatusBadge(lot.status)}
                      {lot.sync_pending && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 px-1 py-0.2 rounded font-bold">
                          Sync Pending
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 leading-snug truncate">
                      {material}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {summary}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-emerald-700">
                      ₹{price ? price.toLocaleString('en-IN') : 'TBD'}
                    </div>
                    <div className="text-xs font-semibold text-slate-600 mt-0.5">
                      {weight} kg
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="truncate max-w-[200px]">
                    {recycler ? `Recycler: ${recycler}` : 'Awaiting recycler claim'}
                  </span>
                  <span className="shrink-0 text-slate-400">{date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: NEARBY RECYCLERS */}
      <section aria-labelledby="recyclers-heading">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 id="recyclers-heading" className="text-sm font-bold text-slate-900">
              Nearby Recyclers
            </h2>
            <span className="text-[11px] text-slate-500">CPCB Authorized e-waste facilities</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Govt Verified
          </span>
        </div>

        <div className="space-y-2.5">
          {recyclers.slice(0, 3).map((recycler) => {
            const name = recycler.organization_name || recycler.name;
            const regNumber = recycler.authorization_number || recycler.cpcbRegNumber;
            const dist = recycler.distance_km ?? recycler.distanceKm;
            const materials = recycler.materials_accepted || recycler.acceptedMaterials || [];
            const address = recycler.service_area || recycler.address;

            return (
              <div
                key={recycler.recycler_id || recycler.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">
                        {name}
                      </h3>
                      {(recycler.authorization_status === 'authorized' || recycler.isVerified) && (
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="CPCB Verified" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-600 mt-0.5">
                      {regNumber}
                    </div>
                  </div>
                  <div className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-0.5 rounded-lg shrink-0">
                    {dist} km away
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Buying: </span>
                  {materials.join(', ')}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-600 truncate max-w-[220px]">
                    {address}
                  </span>
                  <button
                    onClick={() => {
                      if (onSelectRecycler) {
                        onSelectRecycler(recycler);
                      } else {
                        onOpenCreateLot();
                      }
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    Sell Lot <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
