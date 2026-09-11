/**
 * Machine Learning Image Classification Placeholder Service
 *
 * NOTE: As per architecture requirements, this service simulates AI/ML
 * e-waste classification for the collector app. It provides a clean interface
 * so an actual vision model / Gemini Vision API / edge ML endpoint can be connected later.
 */

export interface ClassificationResult {
  materialId: string;
  materialName: string;
  confidence: number;
  detectedFeatures: string[];
  suggestedCondition: 'clean' | 'mixed' | 'damaged' | 'unknown';
}

const PRESET_MOCK_RESULTS: Record<string, ClassificationResult> = {
  pcb: {
    materialId: 'pcb',
    materialName: 'PCB',
    confidence: 0.94,
    detectedFeatures: ['Gold contact fingers', 'IC chips', 'FR-4 green substrate'],
    suggestedCondition: 'clean',
  },
  crt: {
    materialId: 'crt',
    materialName: 'CRT',
    confidence: 0.89,
    detectedFeatures: ['Lead-containing funnel glass', 'Electron gun', 'Heavy chassis'],
    suggestedCondition: 'damaged',
  },
  lcd: {
    materialId: 'lcd',
    materialName: 'LCD / LED',
    confidence: 0.92,
    detectedFeatures: ['CCFL/LED backlight array', 'Indium tin oxide polarizers'],
    suggestedCondition: 'clean',
  },
  cables: {
    materialId: 'cables',
    materialName: 'Cables',
    confidence: 0.96,
    detectedFeatures: ['Stripped copper strands', 'PVC insulation jacket'],
    suggestedCondition: 'clean',
  },
  batteries: {
    materialId: 'batteries',
    materialName: 'Batteries',
    confidence: 0.91,
    detectedFeatures: ['Li-ion pouch cells', 'Terminals insulated', 'Metallic casing'],
    suggestedCondition: 'mixed',
  },
  motors: {
    materialId: 'motors',
    materialName: 'Motors / Magnets',
    confidence: 0.88,
    detectedFeatures: ['Neodymium magnet assembly', 'Copper stator winding'],
    suggestedCondition: 'mixed',
  },
  plastics: {
    materialId: 'plastics',
    materialName: 'Mixed Plastics',
    confidence: 0.86,
    detectedFeatures: ['ABS/HIPS appliance shells', 'Fire-retardant grade'],
    suggestedCondition: 'mixed',
  },
  other: {
    materialId: 'other',
    materialName: 'Other E-Waste',
    confidence: 0.82,
    detectedFeatures: ['Unsorted peripheral components', 'Mixed metallic parts'],
    suggestedCondition: 'unknown',
  },
};

export async function classifyMaterialImage(
  _imageDataOrUrl: string,
  preferredMaterialHint?: string
): Promise<ClassificationResult> {
  // Simulate network / edge inference delay (600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (preferredMaterialHint && PRESET_MOCK_RESULTS[preferredMaterialHint]) {
    return PRESET_MOCK_RESULTS[preferredMaterialHint];
  }

  // Default demonstration classification as required by prompt: "AI detected: PCB, Confidence: 94%"
  return PRESET_MOCK_RESULTS.pcb;
}
