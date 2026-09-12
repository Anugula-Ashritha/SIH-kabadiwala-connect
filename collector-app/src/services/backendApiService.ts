/**
 * Real Backend API Service for Kabadiwala Connect
 *
 * Backend Base URL:
 *   http://127.0.0.1:8001
 *
 * Endpoints:
 *   - POST  /api/lots
 *   - GET   /api/lots/{lot_id}
 *   - GET   /api/collectors/{collector_id}/lots
 *   - PATCH /api/lots/{lot_id}/status?status=STATUS
 */

import { WasteLot, LotStatus } from '../types';

// Single configuration constant for Backend API base URL
export const BACKEND_API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_API_URL) ||
  'http://127.0.0.1:8001';

export const DEFAULT_COLLECTOR_ID = 1;

export interface CreateLotPayload {
  collector_id: number;
  material: string;
  weight: number;
  estimated_value: number;
  quoted_price: number;
  location: string;
}

export interface BackendLotResponse {
  id: number | string;
  lot_id: string;
  collector_id: number | string;
  material: string;
  weight: number;
  estimated_value: number;
  quoted_price: number | null;
  recycler_id: number | string | null;
  status: string;
  location: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch helper with timeout to avoid hanging if the local backend is not yet started.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 6000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Map backend uppercase status to frontend LotStatus.
 */
export function mapBackendStatusToFrontend(statusStr?: string): LotStatus {
  if (!statusStr) return 'finding_recycler';
  const norm = statusStr.toUpperCase();

  switch (norm) {
    case 'CREATED':
      return 'finding_recycler';
    case 'PENDING':
    case 'OFFER_SENT':
      return 'pending';
    case 'OFFER_RECEIVED':
      return 'offer_received';
    case 'ACCEPTED':
      return 'accepted';
    case 'IN_TRANSIT':
      return 'in_transit';
    case 'HANDOVER':
      return 'handover';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'finding_recycler';
  }
}

/**
 * Map frontend LotStatus to backend status string.
 */
export function mapFrontendStatusToBackend(status: LotStatus): string {
  switch (status) {
    case 'draft':
    case 'finding_recycler':
      return 'CREATED';
    case 'pending':
      return 'PENDING';
    case 'offer_received':
      return 'OFFER_RECEIVED';
    case 'accepted':
      return 'ACCEPTED';
    case 'in_transit':
      return 'IN_TRANSIT';
    case 'handover':
      return 'HANDOVER';
    case 'completed':
      return 'COMPLETED';
    case 'cancelled':
      return 'CANCELLED';
    default:
      return (status as string).toUpperCase();
  }
}

/**
 * Map backend lot response item into the frontend WasteLot data model.
 */
export function mapBackendLotToWasteLot(item: BackendLotResponse): WasteLot {
  const lotId = item.lot_id || `LOT-2026-${item.id}`;
  const weight = typeof item.weight === 'number' ? item.weight : Number(item.weight) || 1;
  const estVal =
    typeof item.estimated_value === 'number'
      ? item.estimated_value
      : Number(item.estimated_value) || 1000;
  const quoted =
    typeof item.quoted_price === 'number'
      ? item.quoted_price
      : item.quoted_price
      ? Number(item.quoted_price)
      : undefined;

  const frontendStatus = mapBackendStatusToFrontend(item.status);

  return {
    lot_id: lotId,
    id: lotId,
    collector_id: String(item.collector_id ?? DEFAULT_COLLECTOR_ID),
    material: item.material,
    category: item.material,
    weight_kg: weight,
    weightKg: weight,
    condition: 'clean',
    description: `${item.material} e-waste consignment at ${item.location}`,
    location: item.location,
    estimated_min_value: Math.round(estVal * 0.95),
    estimated_max_value: Math.round(estVal * 1.05),
    estimatedPrice: estVal,
    quoted_price: quoted,
    recycler_id: item.recycler_id ? String(item.recycler_id) : undefined,
    status: frontendStatus,
    created_at: item.created_at || 'Just now',
    createdAt: item.created_at || 'Just now',
    itemsSummary: `${item.material} (${weight} kg)`,
  };
}

/**
 * 1. Create Lot on Backend: POST /api/lots
 */
export async function createLotOnBackend(
  payload: CreateLotPayload
): Promise<BackendLotResponse> {
  const url = `${BACKEND_API_BASE_URL}/api/lots`;
  console.log('[Backend API] Creating lot on backend:', payload);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} from backend: ${errText || response.statusText}`);
    }

    const data: BackendLotResponse = await response.json();
    console.log('[Backend API] Backend response received:', data);
    return data;
  } catch (error) {
    console.error('[Backend API] Backend error creating lot:', error);
    throw error;
  }
}

/**
 * 2. Fetch Collector's Lots: GET /api/collectors/{collector_id}/lots
 */
export async function fetchCollectorLots(
  collectorId: number | string = DEFAULT_COLLECTOR_ID
): Promise<BackendLotResponse[]> {
  const url = `${BACKEND_API_BASE_URL}/api/collectors/${collectorId}/lots`;
  console.log('[Backend API] Fetching lots for collector:', collectorId);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} from backend: ${errText || response.statusText}`);
    }

    const data = await response.json();
    const lotsArray: BackendLotResponse[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.lots)
      ? data.lots
      : [];

    console.log('[Backend API] Backend response received for collector lots:', lotsArray);
    return lotsArray;
  } catch (error) {
    console.error('[Backend API] Backend error fetching lots:', error);
    throw error;
  }
}

/**
 * 3. Fetch Single Lot Details: GET /api/lots/{lot_id}
 */
export async function fetchLotById(lotId: string): Promise<BackendLotResponse> {
  const url = `${BACKEND_API_BASE_URL}/api/lots/${encodeURIComponent(lotId)}`;
  console.log('[Backend API] Fetching lot by ID:', lotId);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} from backend: ${errText || response.statusText}`);
    }

    const data: BackendLotResponse = await response.json();
    console.log('[Backend API] Backend response received for lot:', data);
    return data;
  } catch (error) {
    console.error('[Backend API] Backend error fetching lot details:', error);
    throw error;
  }
}

/**
 * 4. Update Lot Status: PATCH /api/lots/{lot_id}/status?status=STATUS
 */
export async function updateLotStatusOnBackend(
  lotId: string,
  status: string
): Promise<BackendLotResponse | null> {
  const url = `${BACKEND_API_BASE_URL}/api/lots/${encodeURIComponent(
    lotId
  )}/status?status=${encodeURIComponent(status)}`;
  console.log(`[Backend API] Updating lot status: PATCH ${url}`);

  try {
    const response = await fetchWithTimeout(url, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`HTTP ${response.status} from backend: ${errText || response.statusText}`);
    }

    const data: BackendLotResponse = await response.json();
    console.log('[Backend API] Backend response received for status update:', data);
    return data;
  } catch (error) {
    console.error('[Backend API] Backend error updating lot status:', error);
    throw error;
  }
}
