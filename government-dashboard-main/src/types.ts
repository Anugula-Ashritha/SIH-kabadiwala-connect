/**
 * Kabadiwala Connect - Government / Impact Analytics Dashboard
 * PS 26229: Bringing the Informal Collector into the Formal Recycling Chain
 */

export interface RegionalCollection {
  region_id: string;
  state: string;
  city: string;
  month: string; // e.g., "2026-02"
  lots_collected: number;
  total_weight_kg: number;
  completed_weight_kg: number;
  transaction_value: number; // in INR (₹)
}

export interface MaterialStats {
  material: string;
  total_weight_kg: number;
  lot_count: number;
  average_price_per_kg: number; // in INR
  transaction_value: number; // in INR
  percentage_of_total: number; // 0 - 100
  hazard_category?: 'High' | 'Medium' | 'Low';
  cpcb_code?: string;
}

export interface RecyclerStats {
  recycler_id: string;
  name: string;
  state: string;
  city: string;
  authorization_status: 'CPCB Authorized' | 'SPCB Certified' | 'Under Audit' | 'Renewal Due';
  authorization_number: string;
  materials_accepted: string[];
  pickup_available: boolean;
  service_area: string; // e.g., "Statewide", "Inter-district (100km)", "National"
  completed_lots: number;
  processed_weight_kg: number;
  capacity_metric_tons_per_month: number;
  audit_valid_until: string;
}

export interface TraceabilityStats {
  total_lots: number;
  matched_lots: number;
  accepted_lots: number;
  handed_over_lots: number;
  completed_lots: number;
  traceability_completion_rate: number; // percentage (completed / total)
  pending_handover: number;
  pending_payment: number;
}

export interface PriceTrend {
  material: string;
  location: string; // City or State
  date_or_month: string; // e.g., "2026-01" or "2026-02"
  market_min: number; // INR / kg
  market_max: number; // INR / kg
  average_buying_price: number; // INR / kg
  informal_baseline_price?: number; // Historic unorganized middleman price for comparison
}

export interface ImpactMetrics {
  total_e_waste_collected: number; // in kg
  total_e_waste_handed_to_authorized_recyclers: number; // in kg
  total_transaction_value: number; // in INR
  active_collectors: number; // Count of anonymized informal collectors active in period
  verified_recyclers: number; // Count of compliant formal recyclers
  completed_lots: number;
  formal_channel_rate: number; // percentage: (handed_to_authorized / total_collected) * 100
  average_collector_realized_value: number; // Average INR earned per collector
  // Explicitly defined impact parameters:
  hazardous_fraction_diverted_kg: number; // High-risk components (mercury, lead, cadmium batteries/CRT) safely diverted
  direct_bank_transfers_count: number; // Formal digital payments to collectors
}

export interface FilterState {
  state: string;
  city: string;
  material: string;
  dateRange: string;
  recyclerStatus: string;
  lotStatus: string;
}

export interface GovtUser {
  id: string;
  name: string;
  designation: string;
  department: string;
  jurisdiction: string;
  email: string;
  badgeLevel: 'National Regulator' | 'State Nodal Officer' | 'Regional Inspector';
  lastLogin: string;
}

export interface AnonymizedLot {
  lot_id: string;
  batch_hash: string;
  state: string;
  city: string;
  collector_cohort: string; // Anonymized e.g. "Cluster-MH-401"
  material: string;
  weight_kg: number;
  status: 'Matched' | 'Accepted' | 'Handed Over' | 'Completed';
  matched_date: string;
  accepted_date?: string;
  handover_date?: string;
  settled_date?: string;
  recycler_name: string;
  transaction_value: number;
  payment_status: 'Settled' | 'Pending Verification' | 'Processing';
}
