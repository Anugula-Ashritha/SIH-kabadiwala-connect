/**
 * Machine Learning Image Classification Service for Kabadiwala Connect
 *
 * Real ML API endpoint:
 *   POST http://127.0.0.1:8000/api/ml/classify
 *   Expects: multipart/form-data with field name "file"
 *   Response: { "material": "PCB", "confidence": 0.983 }
 *
 * Offline-first behavior:
 *   Falls back to offline mock grading if device is disconnected or offline mode is active.
 */

import { offlineStorageService } from './offlineStorageService';

// Configurable ML API endpoint constant
export const ML_API_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_ML_API_URL) ||
  'http://127.0.0.1:8000/api/ml/classify';

export interface ClassificationResult {
  materialId: string;
  materialName: string;
  confidence: number;
  confidenceStr: string;
  detectedFeatures: string[];
  suggestedCondition: 'clean' | 'mixed' | 'damaged' | 'unknown';
  isOffline?: boolean;
}

export interface MlApiSuccessResponse {
  material: string;
  confidence: number;
}

/**
 * Maps raw model class prediction to pricing category metadata.
 */
export function mapMaterialToCategory(materialName: string): {
  materialId: string;
  suggestedCondition: 'clean' | 'mixed' | 'damaged' | 'unknown';
  detectedFeatures: string[];
} {
  const norm = materialName.toLowerCase().trim();

  if (norm === 'pcb' || norm.includes('circuit') || norm.includes('motherboard')) {
    return {
      materialId: 'pcb',
      suggestedCondition: 'clean',
      detectedFeatures: ['Gold contact fingers', 'IC chips', 'FR-4 circuit substrate'],
    };
  }

  if (norm.includes('batter')) {
    return {
      materialId: 'batteries',
      suggestedCondition: 'mixed',
      detectedFeatures: ['Li-ion cells', 'Insulated terminals', 'Metallic casing'],
    };
  }

  if (norm.includes('mobile') || norm.includes('phone')) {
    return {
      materialId: 'pcb', // Mobile handsets yield high-grade circuit boards
      suggestedCondition: 'clean',
      detectedFeatures: ['High-density mobile PCB', 'Display connector', 'Telecom ICs'],
    };
  }

  if (norm.includes('cable') || norm.includes('wire')) {
    return {
      materialId: 'cables',
      suggestedCondition: 'clean',
      detectedFeatures: ['Copper strands', 'PVC insulation jacket'],
    };
  }

  if (
    norm.includes('lcd') ||
    norm.includes('led') ||
    norm.includes('screen') ||
    norm.includes('display')
  ) {
    return {
      materialId: 'lcd',
      suggestedCondition: 'clean',
      detectedFeatures: ['Backlight array', 'Polarizer film'],
    };
  }

  if (norm.includes('crt')) {
    return {
      materialId: 'crt',
      suggestedCondition: 'damaged',
      detectedFeatures: ['Heavy funnel glass', 'Electron gun'],
    };
  }

  if (norm.includes('motor') || norm.includes('magnet')) {
    return {
      materialId: 'motors',
      suggestedCondition: 'mixed',
      detectedFeatures: ['Neodymium magnets', 'Copper windings'],
    };
  }

  if (norm.includes('plastic')) {
    return {
      materialId: 'plastics',
      suggestedCondition: 'mixed',
      detectedFeatures: ['Flame-retardant casing', 'ABS/HIPS polymer'],
    };
  }

  return {
    materialId: 'other',
    suggestedCondition: 'unknown',
    detectedFeatures: ['Mixed e-waste components'],
  };
}

/**
 * Offline preset mock classification results.
 */
const PRESET_MOCK_RESULTS: Record<string, ClassificationResult> = {
  pcb: {
    materialId: 'pcb',
    materialName: 'PCB',
    confidence: 0.94,
    confidenceStr: '94.0%',
    detectedFeatures: ['Gold contact fingers', 'IC chips', 'FR-4 green substrate'],
    suggestedCondition: 'clean',
    isOffline: true,
  },
  batteries: {
    materialId: 'batteries',
    materialName: 'Battery',
    confidence: 0.91,
    confidenceStr: '91.0%',
    detectedFeatures: ['Li-ion pouch cells', 'Terminals insulated', 'Metallic casing'],
    suggestedCondition: 'mixed',
    isOffline: true,
  },
  mobile: {
    materialId: 'pcb',
    materialName: 'Mobile',
    confidence: 0.95,
    confidenceStr: '95.0%',
    detectedFeatures: ['High-density motherboard', 'Display unit', 'Camera sensor'],
    suggestedCondition: 'clean',
    isOffline: true,
  },
  cables: {
    materialId: 'cables',
    materialName: 'Cables',
    confidence: 0.96,
    confidenceStr: '96.0%',
    detectedFeatures: ['Stripped copper strands', 'PVC insulation jacket'],
    suggestedCondition: 'clean',
    isOffline: true,
  },
  lcd: {
    materialId: 'lcd',
    materialName: 'LCD / LED',
    confidence: 0.92,
    confidenceStr: '92.0%',
    detectedFeatures: ['CCFL/LED backlight array', 'Indium tin oxide polarizers'],
    suggestedCondition: 'clean',
    isOffline: true,
  },
  crt: {
    materialId: 'crt',
    materialName: 'CRT',
    confidence: 0.89,
    confidenceStr: '89.0%',
    detectedFeatures: ['Lead-containing funnel glass', 'Electron gun', 'Heavy chassis'],
    suggestedCondition: 'damaged',
    isOffline: true,
  },
  motors: {
    materialId: 'motors',
    materialName: 'Motors / Magnets',
    confidence: 0.88,
    confidenceStr: '88.0%',
    detectedFeatures: ['Neodymium magnet assembly', 'Copper stator winding'],
    suggestedCondition: 'mixed',
    isOffline: true,
  },
  plastics: {
    materialId: 'plastics',
    materialName: 'Mixed Plastics',
    confidence: 0.86,
    confidenceStr: '86.0%',
    detectedFeatures: ['ABS/HIPS appliance shells', 'Fire-retardant grade'],
    suggestedCondition: 'mixed',
    isOffline: true,
  },
  other: {
    materialId: 'other',
    materialName: 'Other E-Waste',
    confidence: 0.82,
    confidenceStr: '82.0%',
    detectedFeatures: ['Unsorted peripheral components', 'Mixed metallic parts'],
    suggestedCondition: 'unknown',
    isOffline: true,
  },
};

/**
 * Returns mock classification result for offline usage.
 */
export function getOfflineFallbackResult(materialHint?: string): ClassificationResult {
  const key = materialHint?.toLowerCase();
  if (key && PRESET_MOCK_RESULTS[key]) {
    return { ...PRESET_MOCK_RESULTS[key], isOffline: true };
  }
  return { ...PRESET_MOCK_RESULTS.pcb, isOffline: true };
}

/**
 * Converts a data URL or string to a Blob for FormData submission.
 */
async function stringToBlob(dataOrUrl: string): Promise<Blob> {
  if (dataOrUrl.startsWith('data:')) {
    const res = await fetch(dataOrUrl);
    return await res.blob();
  }
  return new Blob([dataOrUrl], { type: 'image/jpeg' });
}

/**
 * Classifies an e-waste scrap image.
 *
 * ONLINE: Sends multipart/form-data with "file" to http://127.0.0.1:8000/api/ml/classify
 * OFFLINE: Returns immediate offline fallback without network calls
 */
export async function classifyMaterialImage(
  imageInput: File | Blob | string,
  preferredMaterialHint?: string
): Promise<ClassificationResult> {
  const isOnline = offlineStorageService.isOnline();

  // OFFLINE CHECK: If offline, do NOT repeatedly call the API
  if (!isOnline) {
    console.log('[ML API] Device is in offline mode. Skipping API call and using offline fallback.');
    return getOfflineFallbackResult(preferredMaterialHint);
  }

  // ONLINE API REQUEST
  console.log(`[ML API] API request started: POST ${ML_API_URL}`);

  try {
    const formData = new FormData();

    if (imageInput instanceof File) {
      formData.append('file', imageInput, imageInput.name);
    } else if (imageInput instanceof Blob) {
      formData.append('file', imageInput, 'lot-image.jpg');
    } else if (typeof imageInput === 'string') {
      const blob = await stringToBlob(imageInput);
      formData.append('file', blob, 'lot-image.jpg');
    } else {
      throw new Error('Invalid image input provided.');
    }

    const response = await fetch(ML_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(
        `ML API responded with status ${response.status}: ${errText || response.statusText}`
      );
    }

    const data: MlApiSuccessResponse = await response.json();
    console.log('[ML API] API response received:', data);

    if (!data || typeof data.material !== 'string') {
      throw new Error('Invalid response structure from ML API');
    }

    const rawConfidence = typeof data.confidence === 'number' ? data.confidence : 0.9;
    const pct = rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
    const confidenceStr = `${pct.toFixed(1)}%`;

    const mapped = mapMaterialToCategory(data.material);

    return {
      materialId: mapped.materialId,
      materialName: data.material,
      confidence: rawConfidence <= 1 ? rawConfidence : rawConfidence / 100,
      confidenceStr: confidenceStr,
      detectedFeatures: mapped.detectedFeatures,
      suggestedCondition: mapped.suggestedCondition,
      isOffline: false,
    };
  } catch (error) {
    console.error('[ML API] API error:', error);
    throw error;
  }
}
