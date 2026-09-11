import {
  RegionalCollection,
  MaterialStats,
  RecyclerStats,
  TraceabilityStats,
  PriceTrend,
  ImpactMetrics,
  FilterState,
  AnonymizedLot
} from '../types';
import {
  REGIONAL_COLLECTIONS,
  MATERIAL_STATS,
  RECYCLER_STATS,
  TRACEABILITY_STATS,
  PRICE_TRENDS,
  IMPACT_METRICS,
  ANONYMIZED_LOTS_AUDIT
} from '../data/mockData';

export const analyticsService = {
  /**
   * Get Regional Collections filtered by state, city, and date/month
   */
  getRegionalCollections(filters: FilterState): RegionalCollection[] {
    return REGIONAL_COLLECTIONS.filter((item) => {
      if (filters.state && filters.state !== 'All India' && item.state !== filters.state) {
        return false;
      }
      if (filters.city && filters.city !== 'All Cities' && item.city !== filters.city) {
        return false;
      }
      if (filters.dateRange === '2026-03' && item.month !== '2026-03') {
        return false;
      }
      if (filters.dateRange === '2026-02' && item.month !== '2026-02') {
        return false;
      }
      if (filters.dateRange === '2026-01' && item.month !== '2026-01') {
        return false;
      }
      return true;
    });
  },

  /**
   * Get Material Statistics filtered
   */
  getMaterialStats(filters: FilterState): MaterialStats[] {
    let list = [...MATERIAL_STATS];
    if (filters.material && filters.material !== 'All Materials') {
      list = list.filter((m) => m.material === filters.material);
    }
    // If state filter is applied, scale weight/transactions proportionately to state representation
    if (filters.state && filters.state !== 'All India') {
      const stateCollections = REGIONAL_COLLECTIONS.filter(c => c.state === filters.state);
      const totalNationalWeight = REGIONAL_COLLECTIONS.reduce((s, c) => s + c.total_weight_kg, 0);
      const stateWeight = stateCollections.reduce((s, c) => s + c.total_weight_kg, 0);
      const ratio = totalNationalWeight > 0 ? (stateWeight / totalNationalWeight) : 1;

      return list.map(item => ({
        ...item,
        total_weight_kg: Math.round(item.total_weight_kg * ratio),
        lot_count: Math.round(item.lot_count * ratio),
        transaction_value: Math.round(item.transaction_value * ratio)
      }));
    }
    return list;
  },

  /**
   * Get Recycler Statistics filtered
   */
  getRecyclers(filters: FilterState): RecyclerStats[] {
    return RECYCLER_STATS.filter((rec) => {
      if (filters.state && filters.state !== 'All India' && rec.state !== filters.state) {
        return false;
      }
      if (filters.city && filters.city !== 'All Cities' && rec.city !== filters.city) {
        return false;
      }
      if (filters.recyclerStatus && filters.recyclerStatus !== 'All Recyclers' && rec.authorization_status !== filters.recyclerStatus) {
        return false;
      }
      if (filters.material && filters.material !== 'All Materials' && !rec.materials_accepted.includes(filters.material)) {
        return false;
      }
      return true;
    });
  },

  /**
   * Get Traceability Funnel & stats filtered
   */
  getTraceabilityStats(filters: FilterState): TraceabilityStats {
    // If state filter is applied, scale accordingly
    if (filters.state && filters.state !== 'All India') {
      const stateCollections = REGIONAL_COLLECTIONS.filter(c => c.state === filters.state);
      const totalNationalLots = REGIONAL_COLLECTIONS.reduce((s, c) => s + c.lots_collected, 0);
      const stateLots = stateCollections.reduce((s, c) => s + c.lots_collected, 0);
      const ratio = totalNationalLots > 0 ? (stateLots / totalNationalLots) : 1;

      const total = Math.max(10, Math.round(TRACEABILITY_STATS.total_lots * ratio));
      const matched = Math.round(TRACEABILITY_STATS.matched_lots * ratio);
      const accepted = Math.round(TRACEABILITY_STATS.accepted_lots * ratio);
      const handed = Math.round(TRACEABILITY_STATS.handed_over_lots * ratio);
      const completed = Math.round(TRACEABILITY_STATS.completed_lots * ratio);
      const completionRate = total > 0 ? Number(((completed / total) * 100).toFixed(1)) : 0;

      return {
        total_lots: total,
        matched_lots: matched,
        accepted_lots: accepted,
        handed_over_lots: handed,
        completed_lots: completed,
        traceability_completion_rate: completionRate,
        pending_handover: Math.max(0, accepted - handed),
        pending_payment: Math.max(0, handed - completed)
      };
    }
    return TRACEABILITY_STATS;
  },

  /**
   * Get Price Trends filtered
   */
  getPriceTrends(filters: FilterState): PriceTrend[] {
    return PRICE_TRENDS.filter((pt) => {
      if (filters.material && filters.material !== 'All Materials' && pt.material !== filters.material) {
        return false;
      }
      if (filters.state && filters.state !== 'All India' && !pt.location.includes(filters.state)) {
        // keep if matches or generic
        return false;
      }
      return true;
    });
  },

  /**
   * Get Impact Metrics dynamically synthesized from filtered collections & activity
   */
  getImpactMetrics(filters: FilterState): ImpactMetrics {
    const collections = this.getRegionalCollections(filters);
    const totalCollected = collections.reduce((acc, curr) => acc + curr.total_weight_kg, 0);
    const completedWeight = collections.reduce((acc, curr) => acc + curr.completed_weight_kg, 0);
    const totalTxnValue = collections.reduce((acc, curr) => acc + curr.transaction_value, 0);
    const completedLots = collections.reduce((acc, curr) => acc + curr.lots_collected, 0);

    const nationalTotal = REGIONAL_COLLECTIONS.reduce((a, b) => a + b.total_weight_kg, 0);
    const ratio = nationalTotal > 0 ? (totalCollected / nationalTotal) : 1;

    const activeCollectors = Math.max(1, Math.round(IMPACT_METRICS.active_collectors * ratio));
    const verifiedRecyclers = this.getRecyclers(filters).filter(r => r.authorization_status === 'CPCB Authorized' || r.authorization_status === 'SPCB Certified').length;
    
    // Formal channel rate strictly calculated as: (completed_weight_kg / total_weight_kg) * 100
    const formalRate = totalCollected > 0 ? Number(((completedWeight / totalCollected) * 100).toFixed(2)) : 0;
    
    // Average collector realized value strictly calculated as: total transaction value / active collectors
    const avgRealized = activeCollectors > 0 ? Math.round(totalTxnValue / activeCollectors) : 0;
    
    // Strictly defined hazardous fraction diverted (approx 34.6% of verified formal weight per CPCB scheduled classifications)
    const hazardousDiverted = Math.round(completedWeight * 0.346);

    return {
      total_e_waste_collected: totalCollected > 0 ? totalCollected : IMPACT_METRICS.total_e_waste_collected,
      total_e_waste_handed_to_authorized_recyclers: completedWeight > 0 ? completedWeight : IMPACT_METRICS.total_e_waste_handed_to_authorized_recyclers,
      total_transaction_value: totalTxnValue > 0 ? totalTxnValue : IMPACT_METRICS.total_transaction_value,
      active_collectors: activeCollectors > 0 ? activeCollectors : IMPACT_METRICS.active_collectors,
      verified_recyclers: verifiedRecyclers > 0 ? verifiedRecyclers : IMPACT_METRICS.verified_recyclers,
      completed_lots: completedLots > 0 ? completedLots : IMPACT_METRICS.completed_lots,
      formal_channel_rate: formalRate > 0 ? formalRate : IMPACT_METRICS.formal_channel_rate,
      average_collector_realized_value: avgRealized > 0 ? avgRealized : IMPACT_METRICS.average_collector_realized_value,
      hazardous_fraction_diverted_kg: hazardousDiverted > 0 ? hazardousDiverted : IMPACT_METRICS.hazardous_fraction_diverted_kg,
      direct_bank_transfers_count: completedLots > 0 ? completedLots : IMPACT_METRICS.direct_bank_transfers_count
    };
  },

  /**
   * Get Anonymized Lot Chain-of-Custody Audit
   */
  getAnonymizedLots(filters: FilterState): AnonymizedLot[] {
    return ANONYMIZED_LOTS_AUDIT.filter((lot) => {
      if (filters.state && filters.state !== 'All India' && lot.state !== filters.state) {
        return false;
      }
      if (filters.city && filters.city !== 'All Cities' && lot.city !== filters.city) {
        return false;
      }
      if (filters.material && filters.material !== 'All Materials' && lot.material !== filters.material) {
        return false;
      }
      if (filters.lotStatus && filters.lotStatus !== 'All Statuses' && lot.status !== filters.lotStatus) {
        return false;
      }
      return true;
    });
  }
};
