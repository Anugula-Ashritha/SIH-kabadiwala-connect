import { MaterialCategory, MaterialCondition } from '../types';

export const MATERIAL_CATEGORIES: MaterialCategory[] = [
  {
    id: 'pcb',
    name: 'PCB',
    hindiName: 'सर्किट बोर्ड',
    description: 'Mobile phone, server, desktop & telecom motherboards',
    iconName: 'Cpu',
    baseMinRate: 480,
    baseMaxRate: 560,
    unit: 'kg',
    defaultWeight: 2.5,
    commonExamples: 'High-grade gold contact pins, multi-layer circuit scrap',
  },
  {
    id: 'cables',
    name: 'Cables',
    hindiName: 'तांबे की तार व केबल',
    description: 'Stripped bright copper wire & insulated power cords',
    iconName: 'Cable',
    baseMinRate: 620,
    baseMaxRate: 710,
    unit: 'kg',
    defaultWeight: 5.0,
    commonExamples: 'Appliance power leads, network cables, motor windings',
  },
  {
    id: 'lcd',
    name: 'LCD / LED',
    hindiName: 'स्क्रीन और डिस्प्ले',
    description: 'Flat panel displays, monitors & unbroken television screens',
    iconName: 'Monitor',
    baseMinRate: 180,
    baseMaxRate: 250,
    unit: 'kg',
    defaultWeight: 8.0,
    commonExamples: 'Laptop screens, LED TV modules, desktop monitors',
  },
  {
    id: 'batteries',
    name: 'Batteries',
    hindiName: 'बैटरी (लीथियम / लेड)',
    description: 'Lithium-ion laptop packs, phone cells & sealed batteries',
    iconName: 'BatteryCharging',
    baseMinRate: 140,
    baseMaxRate: 180,
    unit: 'kg',
    defaultWeight: 3.0,
    commonExamples: '18650 cells, pouch batteries with insulated tape',
  },
  {
    id: 'motors',
    name: 'Motors / Magnets',
    hindiName: 'मोटर और मैग्नेट',
    description: 'Hard drive voice-coil magnets, fans & fractional HP motors',
    iconName: 'RotateCw',
    baseMinRate: 210,
    baseMaxRate: 290,
    unit: 'kg',
    defaultWeight: 6.5,
    commonExamples: 'Neodymium magnets from HDDs, transformer coils',
  },
  {
    id: 'crt',
    name: 'CRT',
    hindiName: 'सीआरटी कांच',
    description: 'Old television picture tubes & cathode ray monitor scrap',
    iconName: 'Tv',
    baseMinRate: 40,
    baseMaxRate: 75,
    unit: 'kg',
    defaultWeight: 14.0,
    commonExamples: 'Heavy leaded glass tubes (requires certified disposal)',
  },
  {
    id: 'plastics',
    name: 'Mixed Plastics',
    hindiName: 'प्लास्टिक बॉडी',
    description: 'Fire-retardant ABS/HIPS shells from printers and CPUs',
    iconName: 'Boxes',
    baseMinRate: 35,
    baseMaxRate: 50,
    unit: 'kg',
    defaultWeight: 10.0,
    commonExamples: 'Printer outer casing, keyboard shells, computer towers',
  },
  {
    id: 'other',
    name: 'Other E-Waste',
    hindiName: 'अन्य ई-कचरा',
    description: 'Unsorted adapters, small peripherals, mixed scrap lots',
    iconName: 'Package',
    baseMinRate: 55,
    baseMaxRate: 90,
    unit: 'kg',
    defaultWeight: 4.0,
    commonExamples: 'Power bricks, mice, keyboards, broken telecom toys',
  },
];

export interface LotValueEstimate {
  materialId: string;
  materialName: string;
  weightKg: number;
  condition: MaterialCondition;
  minRatePerKg: number;
  maxRatePerKg: number;
  estimatedMinValue: number;
  estimatedMaxValue: number;
  averageValue: number;
  unit: string;
  priceUpdated: string;
}

/**
 * Calculates fair market value ranges based on material, condition & weight.
 * Clean materials earn premium rates; damaged/unknown receive standard conservative bounds.
 */
export function calculateLotValueRange(
  materialIdOrName: string,
  weightKg: number,
  condition: MaterialCondition = 'clean'
): LotValueEstimate {
  const category =
    MATERIAL_CATEGORIES.find(
      (c) =>
        c.id.toLowerCase() === materialIdOrName.toLowerCase() ||
        c.name.toLowerCase() === materialIdOrName.toLowerCase()
    ) || MATERIAL_CATEGORIES[0];

  let conditionMultiplierMin = 1.0;
  let conditionMultiplierMax = 1.0;

  switch (condition) {
    case 'clean':
      conditionMultiplierMin = 1.0;
      conditionMultiplierMax = 1.0;
      break;
    case 'mixed':
      conditionMultiplierMin = 0.9;
      conditionMultiplierMax = 0.95;
      break;
    case 'damaged':
      conditionMultiplierMin = 0.75;
      conditionMultiplierMax = 0.85;
      break;
    case 'unknown':
    default:
      conditionMultiplierMin = 0.85;
      conditionMultiplierMax = 0.92;
      break;
  }

  const effectiveMinRate = Math.round(category.baseMinRate * conditionMultiplierMin);
  const effectiveMaxRate = Math.round(category.baseMaxRate * conditionMultiplierMax);

  const estimatedMinValue = Math.round(effectiveMinRate * weightKg);
  const estimatedMaxValue = Math.round(effectiveMaxRate * weightKg);
  const averageValue = Math.round((estimatedMinValue + estimatedMaxValue) / 2);

  return {
    materialId: category.id,
    materialName: category.name,
    weightKg,
    condition,
    minRatePerKg: effectiveMinRate,
    maxRatePerKg: effectiveMaxRate,
    estimatedMinValue,
    estimatedMaxValue,
    averageValue,
    unit: category.unit,
    priceUpdated: 'Today, 10:30 AM',
  };
}
