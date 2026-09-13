import { RegionalCollection, MaterialStats, RecyclerStats, TraceabilityStats, PriceTrend, ImpactMetrics, FilterState, AnonymizedLot } from '../types';
import { PRICE_TRENDS } from '../data/mockData';
import { backendApi } from './backendApiService';

type BackendLot = any;
type BackendRecycler = any;

let lots: BackendLot[] = [];
let recyclersRaw: BackendRecycler[] = [];
let overview: any = {};
let materialsRaw: any[] = [];
let collectionsRaw: any[] = [];

const splitLocation = (location = '') => {
  const parts = location.split(',').map((x: string) => x.trim()).filter(Boolean);
  return { city: parts[0] || 'Unknown', state: parts.length > 1 ? parts[1] : 'Unknown' };
};

export const analyticsService = {
  async refresh() {
    const [o, m, c, r, l] = await Promise.all([
      backendApi.getOverview(),
      backendApi.getMaterials(),
      backendApi.getCollections(),
      backendApi.getRecyclers(),
      backendApi.getLots()
    ]);
    overview = o || {};
    materialsRaw = Array.isArray(m) ? m : [];
    collectionsRaw = Array.isArray(c) ? c : [];
    recyclersRaw = Array.isArray(r) ? r : [];
    lots = Array.isArray(l) ? l : [];
  },

  getRegionalCollections(filters: FilterState): RegionalCollection[] {
    return collectionsRaw.map((c: any, i: number) => {
      const loc = splitLocation(c.location);
      const related = lots.filter(l => (l.location || 'Unknown') === (c.location || 'Unknown'));
      const completedWeight = related.filter(l => String(l.status).toUpperCase() === 'COMPLETED').reduce((s, l) => s + Number(l.weight || 0), 0);
      return {
        region_id: `REG-${i + 1}`,
        state: loc.state === 'Delhi' ? 'Delhi NCR' : loc.state,
        city: loc.city,
        month: '2026-09',
        lots_collected: Number(c.lots_collected || 0),
        total_weight_kg: Number(c.total_weight_kg || 0),
        completed_weight_kg: completedWeight,
        transaction_value: Number(c.transaction_value || 0)
      };
    }).filter(c =>
      (filters.state === 'All India' || c.state === filters.state) &&
      (filters.city === 'All Cities' || c.city === filters.city)
    );
  },

  getMaterialStats(filters: FilterState): MaterialStats[] {
    const total = materialsRaw.reduce((s, m) => s + Number(m.total_weight_kg || 0), 0);
    return materialsRaw.filter(m => filters.material === 'All Materials' || m.material === filters.material).map(m => ({
      material: m.material,
      total_weight_kg: Number(m.total_weight_kg || 0),
      lot_count: Number(m.lot_count || 0),
      average_price_per_kg: Number(m.total_weight_kg || 0) ? Number(m.transaction_value || 0) / Number(m.total_weight_kg || 1) : 0,
      transaction_value: Number(m.transaction_value || 0),
      percentage_of_total: total ? Number(((Number(m.total_weight_kg || 0) / total) * 100).toFixed(1)) : 0,
      hazard_category: m.material === 'Battery' ? 'High' : m.material === 'PCB' ? 'Medium' : 'Low'
    }));
  },

  getRecyclers(filters: FilterState): RecyclerStats[] {
    return recyclersRaw.map((r, i) => {
      const loc = splitLocation(r.location);
      const accepted = r.materials_accepted ? String(r.materials_accepted).split(',').map((x: string) => x.trim()) : [];
      const completed = lots.filter(l => String(l.recycler_id) === String(r.id) && String(l.status).toUpperCase() === 'COMPLETED');
      return {
        recycler_id: String(r.id), name: r.organization_name, state: loc.state === 'Delhi' ? 'Delhi NCR' : loc.state, city: loc.city,
        authorization_status: r.authorization_status === 'VERIFIED' ? 'CPCB Authorized' : 'Under Audit',
        authorization_number: `AUTH-${r.id}`,
        materials_accepted: accepted, pickup_available: Boolean(r.pickup_available), service_area: 'Regional',
        completed_lots: completed.length, processed_weight_kg: completed.reduce((s, l) => s + Number(l.weight || 0), 0),
        capacity_metric_tons_per_month: 0, audit_valid_until: ''
      };
    }).filter(r =>
      (filters.state === 'All India' || r.state === filters.state) &&
      (filters.city === 'All Cities' || r.city === filters.city) &&
      (filters.material === 'All Materials' || r.materials_accepted.includes(filters.material))
    );
  },

  getTraceabilityStats(_filters: FilterState): TraceabilityStats {
    const total = lots.length;
    const matched = lots.filter(l => ['MATCHED','ACCEPTED','HANDOVER_PENDING','COMPLETED'].includes(String(l.status).toUpperCase())).length;
    const accepted = lots.filter(l => ['ACCEPTED','HANDOVER_PENDING','COMPLETED'].includes(String(l.status).toUpperCase())).length;
    const handed = lots.filter(l => ['HANDOVER_PENDING','COMPLETED'].includes(String(l.status).toUpperCase())).length;
    const completed = lots.filter(l => String(l.status).toUpperCase() === 'COMPLETED').length;
    return { total_lots: total, matched_lots: matched, accepted_lots: accepted, handed_over_lots: handed, completed_lots: completed,
      traceability_completion_rate: total ? Number(((completed / total) * 100).toFixed(1)) : 0,
      pending_handover: Math.max(0, accepted - handed), pending_payment: Math.max(0, handed - completed) };
  },

  getPriceTrends(filters: FilterState): PriceTrend[] {
    return PRICE_TRENDS.filter(p => filters.material === 'All Materials' || p.material === filters.material);
  },

  getImpactMetrics(filters: FilterState): ImpactMetrics {
    const filteredCollections = this.getRegionalCollections(filters);
    const weight = filteredCollections.reduce((s, c) => s + c.total_weight_kg, 0);
    const completedWeight = filteredCollections.reduce((s, c) => s + c.completed_weight_kg, 0);
    const value = filteredCollections.reduce((s, c) => s + c.transaction_value, 0);
    const collectorIds = new Set(lots.map(l => l.collector_id));
    const verified = this.getRecyclers(filters).filter(r => r.authorization_status === 'CPCB Authorized').length;
    return {
      total_e_waste_collected: weight || Number(overview.total_weight_kg || 0),
      total_e_waste_handed_to_authorized_recyclers: completedWeight || Number(overview.completed_weight_kg || 0),
      total_transaction_value: value || Number(overview.transaction_value || 0),
      active_collectors: collectorIds.size,
      verified_recyclers: verified,
      completed_lots: Number(overview.completed_lots || 0),
      formal_channel_rate: weight ? Number(((completedWeight / weight) * 100).toFixed(2)) : Number(overview.formal_channel_rate || 0),
      average_collector_realized_value: collectorIds.size ? Math.round((value || Number(overview.transaction_value || 0)) / collectorIds.size) : 0,
      hazardous_fraction_diverted_kg: Math.round(completedWeight * 0.346),
      direct_bank_transfers_count: Number(overview.completed_lots || 0)
    };
  },

  getAnonymizedLots(filters: FilterState): AnonymizedLot[] {
    return lots.filter(l => filters.material === 'All Materials' || l.material === filters.material).map(l => {
      const loc = splitLocation(l.location);
      const statusMap: any = { MATCHED: 'Matched', ACCEPTED: 'Accepted', HANDOVER_PENDING: 'Handed Over', COMPLETED: 'Completed' };
      return {
        lot_id: l.lot_id, batch_hash: `HASH-${String(l.lot_id).slice(-6)}`, state: loc.state === 'Delhi' ? 'Delhi NCR' : loc.state, city: loc.city,
        collector_cohort: `Cluster-${String(l.collector_id).padStart(3, '0')}`, material: l.material, weight_kg: Number(l.weight || 0),
        status: statusMap[String(l.status).toUpperCase()] || 'Matched', matched_date: l.created_at || '', recycler_name: recyclersRaw.find(r => r.id === l.recycler_id)?.organization_name || 'Unassigned',
        transaction_value: Number(l.final_price || l.quoted_price || l.estimated_value || 0), payment_status: 'Processing'
      };
    }).filter(l => (filters.state === 'All India' || l.state === filters.state) && (filters.city === 'All Cities' || l.city === filters.city) && (filters.lotStatus === 'All Statuses' || l.status === filters.lotStatus));
  }
};
