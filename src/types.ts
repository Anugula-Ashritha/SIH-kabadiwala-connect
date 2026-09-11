export type NavTab = 'home' | 'lots' | 'prices' | 'earnings' | 'profile';

export type LotStatus =
  | 'draft'
  | 'finding_recycler'
  | 'pending'
  | 'offer_received'
  | 'accepted'
  | 'in_transit'
  | 'handover'
  | 'completed'
  | 'cancelled';

export type MaterialCondition = 'clean' | 'mixed' | 'damaged' | 'unknown';

export interface Collector {
  collector_id: string;
  name: string;
  phone: string;
  location: string;
  preferred_language: 'English' | 'हिंदी';
  vehicle_type?: string;
  verified_badge?: boolean;
  member_since?: string;
  stats?: {
    lots_listed: number;
    lots_completed: number;
    total_earnings: number;
    total_weight_kg: number;
  };
}

export interface WasteLot {
  lot_id: string;
  collector_id: string;
  material: string;
  image?: string;
  weight_kg: number;
  condition: MaterialCondition;
  description?: string;
  location: string;
  estimated_min_value: number;
  estimated_max_value: number;
  quoted_price?: number;
  final_price?: number;
  recycler_id?: string;
  recycler_name?: string;
  status: LotStatus;
  created_at: string;
  updated_at?: string;
  sync_pending?: boolean;
  // Compatibility fields with previous tasks
  id?: string;
  category?: string;
  weightKg?: number;
  estimatedPrice?: number;
  itemsSummary?: string;
  createdAt?: string;
  recyclerName?: string;
}

export interface Recycler {
  recycler_id: string;
  organization_name: string;
  location: string;
  distance_km: number;
  materials_accepted: string[];
  authorization_number: string;
  authorization_status: 'authorized' | 'provisional' | 'expired';
  offered_rates: Record<string, number>;
  pickup_available: boolean;
  service_area: string;
  rating?: number;
  // Compatibility fields
  id?: string;
  name?: string;
  cpcbRegNumber?: string;
  distanceKm?: number;
  acceptedMaterials?: string[];
  address?: string;
  isVerified?: boolean;
}

export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Disputed';

export interface Transaction {
  transaction_id: string;
  lot_id: string;
  collector_id: string;
  recycler_id: string;
  recycler_name: string;
  material: string;
  amount: number;
  payment_status: PaymentStatus;
  payment_method: string;
  transaction_date: string;
  receipt_ref?: string;
}

export interface PriceItem {
  id: string;
  material: string;
  location: string;
  market_min: number;
  market_max: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change_amount: number;
  updated_at: string;
  min_grading: string;
  historical_rates: { day: string; rate: number }[];
  // Compatibility
  category?: string;
  currentRate?: number;
  changeAmount?: number;
  minGrading?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'lot' | 'payment' | 'price' | 'system';
  lot_id?: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  hindiName: string;
  description: string;
  iconName: string;
  baseMinRate: number;
  baseMaxRate: number;
  unit: string;
  defaultWeight: number;
  commonExamples: string;
}
