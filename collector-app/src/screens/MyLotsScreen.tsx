import React, { useState } from 'react';
import { Plus, Package, Clock, Truck, CheckCircle2, Search, ChevronRight, RefreshCw } from 'lucide-react';
import { WasteLot } from '../types';

interface MyLotsScreenProps {
  lots: WasteLot[];
  onOpenCreateLot: () => void;
  onSelectLot: (lot: WasteLot) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  backendNotice?: string | null;
}

export const MyLotsScreen: React.FC<MyLotsScreenProps> = ({
  lots,
  onOpenCreateLot,
  onSelectLot,
  onRefresh,
  isLoading = false,
  backendNotice = null,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_transit' | 'accepted' | 'completed'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLots = lots.filter((lot) => {
    const lotStatus = lot.status;
    let matchesFilter = true;

    if (filter === 'all') {
      matchesFilter = true;
    } else if (filter === 'pending') {
      matchesFilter =
        lotStatus === 'pending' ||
        lotStatus === 'finding_recycler' ||
        lotStatus === 'offer_received' ||
        lotStatus === 'draft';
    } else if (filter === 'in_transit') {
      matchesFilter = lotStatus === 'in_transit' || lotStatus === 'handover';
    } else if (filter === 'accepted') {
      matchesFilter = lotStatus === 'accepted';
    } else if (filter === 'completed') {
      matchesFilter = lotStatus === 'completed';
    }

    const materialText = (lot.material || lot.category || '').toLowerCase();
    const idText = (lot.lot_id || lot.id || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = materialText.includes(query) || idText.includes(query);

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: WasteLot['status']) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Accepted
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Completed
          </span>
        );
      case 'in_transit':
      case 'handover':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-300">
            <Truck className="w-3 h-3 text-sky-600" />
            In Transit
          </span>
        );
      case 'finding_recycler':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-300">
            <Clock className="w-3 h-3 text-slate-500" />
            Finding Buyer
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Offer
          </span>
        );
    }
  };

  return (
    <div className="space-y-3 pb-24 px-4 pt-3 max-w-md mx-auto">
      {/* Top Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My E-Waste Lots</h2>
          <p className="text-xs text-slate-500">Track and manage your scrap consignments</p>
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh from Backend"
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          )}
          <button
            onClick={onOpenCreateLot}
            className="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Lot
          </button>
        </div>
      </div>

      {/* Backend Status Notice if offline/unreachable */}
      {backendNotice && (
        <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center justify-between">
          <span>{backendNotice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by lot ID or material (e.g. PCB, Copper)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-emerald-600 shadow-2xs"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All (${lots.length})` },
          { id: 'pending', label: 'Pending' },
          { id: 'accepted', label: 'Accepted' },
          { id: 'in_transit', label: 'In Transit' },
          { id: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
              filter === item.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Lots List */}
      {filteredLots.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No matching lots found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Create a new consignment to list e-waste for authorized recyclers
          </p>
          <button
            onClick={onOpenCreateLot}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Consignment
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLots.map((lot) => {
            const lotId = lot.lot_id || lot.id || 'LOT-2026';
            const material = lot.material || lot.category;
            const weight = lot.weight_kg || lot.weightKg;
            const price =
              lot.final_price ||
              lot.quoted_price ||
              lot.estimatedPrice ||
              lot.estimated_min_value;
            const recycler = lot.recycler_name || lot.recyclerName;
            const date = lot.created_at || lot.createdAt;
            const description = lot.description || lot.itemsSummary;

            return (
              <div
                key={lotId}
                onClick={() => onSelectLot(lot)}
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
                        <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                          Sync Pending
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{material}</h3>
                    <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                      {description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-base font-black text-emerald-700">
                      ₹{price ? price.toLocaleString('en-IN') : 'TBD'}
                    </div>
                    <div className="text-xs font-semibold text-slate-600">{weight} kg</div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-medium text-slate-700 truncate max-w-[210px]">
                    {recycler ? `Buyer: ${recycler}` : 'Waiting for offer claim'}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                    <span>{date}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
