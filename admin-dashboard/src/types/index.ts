/**
 * Kabadiwala Connect - Operational Admin Dashboard Types
 * Problem Statement: PS 26229 - Bringing Informal Collectors into the Formal Recycling Chain
 */

export type MaterialCategory = 
  | 'CRT'
  | 'LCD/LED'
  | 'PCB'
  | 'Cables'
  | 'Batteries'
  | 'Motors/Magnets'
  | 'Mixed Plastics'
  | 'Other E-Waste';

export type LotStatus = 
  | 'Created'
  | 'Finding Recycler'
  | 'Offer Received'
  | 'Accepted'
  | 'In Transit'
  | 'Handover Pending'
  | 'Completed'
  | 'Rejected'
  | 'Payment Pending';

export type RecyclerVerificationStatus = 
  | 'Pending'
  | 'Verified'
  | 'Rejected'
  | 'Needs Update';

export type CollectorAccountStatus = 
  | 'Active'
  | 'Suspended'
  | 'Under Review'
  | 'Inactive';

export type RecyclerAccountStatus = 
  | 'Active'
  | 'Suspended'
  | 'Pending Approval';

export type PaymentStatus = 
  | 'Paid'
  | 'Pending'
  | 'Processing'
  | 'Failed';

export type PaymentMethod = 
  | 'UPI'
  | 'Bank Transfer (NEFT/RTGS)'
  | 'Direct Wallet'
  | 'Direct Bank Mandate';

export type HandoverStatus = 
  | 'Scheduled'
  | 'Verified'
  | 'Discrepancy Flagged'
  | 'Completed';

export interface Collector {
  collector_id: string;
  name: string;
  phone: string;
  city: string;
  preferred_language: string;
  registration_date: string;
  total_lots: number;
  completed_lots: number;
  total_earnings: number;
  account_status: CollectorAccountStatus;
  last_active: string;
  kyc_status?: 'Verified' | 'Pending' | 'Aadhaar Linked';
  upi_id?: string;
  ward_or_area?: string;
}

export interface Recycler {
  recycler_id: string;
  organization_name: string;
  contact_person: string;
  location: string;
  materials_accepted: MaterialCategory[];
  authorization_number: string;
  authorization_status: RecyclerVerificationStatus;
  authorization_expiry: string;
  offered_rate_summary: string;
  pickup_available: boolean;
  service_area: string[];
  account_status: RecyclerAccountStatus;
  phone?: string;
  email?: string;
  processing_capacity_tons_pm?: number;
  last_audit_date?: string;
}

export interface Material {
  material_id: string;
  category: MaterialCategory;
  subcategory: string;
  unit: string;
  active_status: boolean;
  description?: string;
  hazardous_rating?: 'High' | 'Medium' | 'Low' | 'Non-hazardous';
}

export interface Lot {
  lot_id: string;
  collector_id: string;
  material: string; // or MaterialCategory + subcategory
  material_category: MaterialCategory;
  weight_kg: number;
  estimated_min_value: number;
  estimated_max_value: number;
  quoted_price: number;
  final_price: number;
  recycler_id: string;
  status: LotStatus;
  created_at: string;
  location: string;
  notes?: string;
}

export interface Transaction {
  transaction_id: string;
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  quoted_price: number;
  final_price: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_date: string;
  reference_utr?: string;
  tds_deducted?: number;
}

export interface Handover {
  handover_id: string;
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  weight_confirmed: number;
  handover_date_time: string;
  location: string;
  photo_reference: string;
  recycler_confirmation: boolean;
  unique_reference: string;
  status: HandoverStatus;
  discrepancy_kg?: number;
  manifest_signoff_by?: string;
}

export interface Price {
  price_id: string;
  material: MaterialCategory;
  subcategory: string;
  location: string;
  buying_price_per_kg: number;
  market_min: number;
  market_max: number;
  recycler_id: string;
  effective_date: string;
  source_type: 'CPCB Benchmark' | 'Recycler Quotation' | 'Admin Floor Price' | 'Spot Market';
}

export interface FlaggedRecord {
  issue_id: string;
  type: 'Weight Discrepancy' | 'Expired Authorization' | 'Delayed Transit' | 'Rate Dispute' | 'Unconfirmed Handover';
  entity_type: 'Lot' | 'Recycler' | 'Handover' | 'Collector';
  entity_id: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  reported_date: string;
  status: 'Open' | 'Under Investigation' | 'Resolved' | 'Overridden';
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
}

export interface AdminUser {
  admin_id: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  assigned_regions: string[];
  phone: string;
  last_login: string;
  is_logged_in: boolean;
}

export type AdminTab = 
  | 'overview'
  | 'collectors'
  | 'recyclers'
  | 'lots'
  | 'transactions'
  | 'handover'
  | 'pricing'
  | 'flagged'
  | 'settings';
