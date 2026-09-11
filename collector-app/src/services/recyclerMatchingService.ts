import { Recycler, WasteLot } from '../types';

export interface RecyclerMatchResult {
  recycler: Recycler;
  score: number;
  matchReasons: string[];
  offeredPriceForLot: number;
  ratePerKg: number;
}

export interface RecyclerFilters {
  maxDistanceKm?: number;
  material?: string;
  minRate?: number;
  pickupOnly?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'score' | 'distance' | 'rate';
}

/**
 * Matches recyclers to a collector's lot based on 5 weighted criteria:
 * 1. Material compatibility (40 pts)
 * 2. Distance proximity (20 pts)
 * 3. Offered rate competitiveness (20 pts)
 * 4. Pickup availability (10 pts)
 * 5. CPCB Authorization / Verification status (10 pts)
 */
export function matchRecyclers(
  lot: WasteLot,
  recyclers: Recycler[],
  filters?: RecyclerFilters
): RecyclerMatchResult[] {
  const lotMaterial = (lot.material || lot.category || '').toLowerCase();
  const lotWeight = lot.weight_kg || lot.weightKg || 1;

  const results: RecyclerMatchResult[] = recyclers.map((recycler) => {
    let score = 0;
    const matchReasons: string[] = [];

    // 1. Material Compatibility (0-40)
    const accepted = (recycler.materials_accepted || recycler.acceptedMaterials || []).map((m) =>
      m.toLowerCase()
    );
    const isDirectMatch = accepted.some(
      (m) =>
        lotMaterial.includes(m) ||
        m.includes(lotMaterial) ||
        (lotMaterial.includes('pcb') && (m.includes('pcb') || m.includes('motherboard') || m.includes('circuit'))) ||
        (lotMaterial.includes('cable') && (m.includes('cable') || m.includes('copper') || m.includes('wire'))) ||
        (lotMaterial.includes('battery') && m.includes('battery')) ||
        (lotMaterial.includes('crt') && m.includes('crt')) ||
        (lotMaterial.includes('lcd') && (m.includes('lcd') || m.includes('screen'))) ||
        (lotMaterial.includes('motor') && (m.includes('motor') || m.includes('metal')))
    );

    if (isDirectMatch) {
      score += 40;
      matchReasons.push('Direct material match');
    } else {
      score += 15; // Partial e-waste general allowance
    }

    // 2. Distance Proximity (0-20)
    const dist = recycler.distance_km ?? recycler.distanceKm ?? 5;
    if (dist <= 2.5) {
      score += 20;
      matchReasons.push('Within 2.5 km quick zone');
    } else if (dist <= 5.0) {
      score += 14;
    } else {
      score += 8;
    }

    // 3. Offered Rate & Competitiveness (0-20)
    // Find rate for lot material if explicitly provided, else fallback to average
    let ratePerKg = 0;
    if (recycler.offered_rates) {
      for (const [key, val] of Object.entries(recycler.offered_rates)) {
        if (lotMaterial.includes(key.toLowerCase()) || key.toLowerCase().includes(lotMaterial)) {
          ratePerKg = val;
          break;
        }
      }
    }
    if (!ratePerKg) {
      // Benchmark based on lot estimate
      const minVal = lot.estimated_min_value ?? lot.estimatedPrice ?? 500;
      const maxVal = lot.estimated_max_value ?? minVal * 1.15;
      ratePerKg = Math.round(((minVal + maxVal) / 2) / lotWeight);
    }

    score += 18;
    matchReasons.push(`Fair rate offer (₹${ratePerKg}/kg)`);

    // 4. Pickup availability (0-10)
    const hasPickup = recycler.pickup_available ?? true;
    if (hasPickup) {
      score += 10;
      matchReasons.push('On-site cart/rickshaw pickup available');
    }

    // 5. Verification Status (0-10)
    const isVerified =
      recycler.authorization_status === 'authorized' ||
      recycler.isVerified === true;
    if (isVerified) {
      score += 10;
      matchReasons.push('CPCB Govt authorized recycler');
    }

    const offeredPriceForLot = Math.round(ratePerKg * lotWeight);

    return {
      recycler,
      score,
      matchReasons,
      offeredPriceForLot,
      ratePerKg,
    };
  });

  // Apply filters
  let filtered = results.filter((res) => {
    const dist = res.recycler.distance_km ?? res.recycler.distanceKm ?? 0;
    if (filters?.maxDistanceKm && dist > filters.maxDistanceKm) return false;
    if (filters?.pickupOnly && !res.recycler.pickup_available && res.recycler.pickup_available !== undefined) {
      return false;
    }
    if (filters?.verifiedOnly) {
      const isAuth =
        res.recycler.authorization_status === 'authorized' ||
        res.recycler.isVerified === true;
      if (!isAuth) return false;
    }
    if (filters?.minRate && res.ratePerKg < filters.minRate) {
      return false;
    }
    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (filters?.sortBy === 'distance') {
      const distA = a.recycler.distance_km ?? a.recycler.distanceKm ?? 0;
      const distB = b.recycler.distance_km ?? b.recycler.distanceKm ?? 0;
      return distA - distB;
    }
    if (filters?.sortBy === 'rate') {
      return b.ratePerKg - a.ratePerKg;
    }
    return b.score - a.score;
  });

  return filtered;
}
