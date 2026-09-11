import {
  RegionalCollection,
  MaterialStats,
  RecyclerStats,
  TraceabilityStats,
  PriceTrend,
  ImpactMetrics,
  GovtUser,
  AnonymizedLot
} from '../types';

export const GOVT_USERS: GovtUser[] = [
  {
    id: 'CPCB-HQ-01',
    name: 'Dr. Rameshwar V. Sharma',
    designation: 'Director (Hazardous Substances & E-Waste Management)',
    department: 'Central Pollution Control Board (CPCB), MoEFCC',
    jurisdiction: 'National (All India)',
    email: 'rameshwar.cpcb@nic.in',
    badgeLevel: 'National Regulator',
    lastLogin: 'Today at 09:14 AM IST',
  },
  {
    id: 'MPCB-STATE-04',
    name: 'Priya S. Deshmukh',
    designation: 'Senior Environmental Engineer & E-Waste Nodal Officer',
    department: 'Maharashtra Pollution Control Board (MPCB)',
    jurisdiction: 'Maharashtra (Statewide)',
    email: 'priya.deshmukh@mpcb.gov.in',
    badgeLevel: 'State Nodal Officer',
    lastLogin: 'Yesterday at 04:30 PM IST',
  },
  {
    id: 'KSPCB-STATE-02',
    name: 'K. Venkatesh Gowda',
    designation: 'Joint Director (Waste Management Division)',
    department: 'Karnataka State Pollution Control Board (KSPCB)',
    jurisdiction: 'Karnataka (Statewide)',
    email: 'k.venkatesh@kspcb.gov.in',
    badgeLevel: 'State Nodal Officer',
    lastLogin: '10 Sep 2026 at 11:20 AM IST',
  },
  {
    id: 'DPCC-UT-09',
    name: 'Anil Kumar Saxena',
    designation: 'Regional Environmental Officer (Industrial Clusters)',
    department: 'Delhi Pollution Control Committee (DPCC)',
    jurisdiction: 'Delhi NCR',
    email: 'anil.saxena@dpcc.delhigovt.nic.in',
    badgeLevel: 'Regional Inspector',
    lastLogin: '08 Sep 2026 at 02:45 PM IST',
  }
];

export const STATES_AND_CITIES: Record<string, string[]> = {
  'Maharashtra': ['All Cities', 'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'],
  'Delhi NCR': ['All Cities', 'New Delhi', 'North Delhi (Seelampur Cluster)', 'East Delhi', 'South Delhi', 'Noida-Ghaziabad Hub'],
  'Karnataka': ['All Cities', 'Bengaluru', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru'],
  'Tamil Nadu': ['All Cities', 'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Telangana': ['All Cities', 'Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad'],
  'Gujarat': ['All Cities', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  'West Bengal': ['All Cities', 'Kolkata', 'Howrah', 'Siliguri', 'Asansol'],
  'Uttar Pradesh': ['All Cities', 'Noida', 'Kanpur', 'Lucknow', 'Moradabad']
};

export const MATERIAL_LIST = [
  'All Materials',
  'Motherboards & High-Grade PCBs',
  'Li-ion & Telecom Batteries',
  'Copper Cables & Wiring Harnesses',
  'Display Units & Monitors (CRT/TFT)',
  'Telecom Infrastructure Gear',
  'Consumer IT & Office Peripherals',
  'Small Domestic E-Appliances'
];

export const REGIONAL_COLLECTIONS: RegionalCollection[] = [
  // Maharashtra
  { region_id: 'MH-MUM-2601', state: 'Maharashtra', city: 'Mumbai', month: '2026-01', lots_collected: 412, total_weight_kg: 84500, completed_weight_kg: 79200, transaction_value: 12672000 },
  { region_id: 'MH-MUM-2602', state: 'Maharashtra', city: 'Mumbai', month: '2026-02', lots_collected: 468, total_weight_kg: 96800, completed_weight_kg: 92100, transaction_value: 14736000 },
  { region_id: 'MH-MUM-2603', state: 'Maharashtra', city: 'Mumbai', month: '2026-03', lots_collected: 510, total_weight_kg: 108200, completed_weight_kg: 104500, transaction_value: 16720000 },
  { region_id: 'MH-PUN-2601', state: 'Maharashtra', city: 'Pune', month: '2026-01', lots_collected: 230, total_weight_kg: 48900, completed_weight_kg: 45200, transaction_value: 7232000 },
  { region_id: 'MH-PUN-2602', state: 'Maharashtra', city: 'Pune', month: '2026-02', lots_collected: 265, total_weight_kg: 56200, completed_weight_kg: 53100, transaction_value: 8496000 },
  { region_id: 'MH-PUN-2603', state: 'Maharashtra', city: 'Pune', month: '2026-03', lots_collected: 290, total_weight_kg: 62400, completed_weight_kg: 59800, transaction_value: 9568000 },
  { region_id: 'MH-NAG-2601', state: 'Maharashtra', city: 'Nagpur', month: '2026-01', lots_collected: 110, total_weight_kg: 21500, completed_weight_kg: 19800, transaction_value: 3168000 },
  { region_id: 'MH-NAG-2602', state: 'Maharashtra', city: 'Nagpur', month: '2026-02', lots_collected: 135, total_weight_kg: 26800, completed_weight_kg: 25100, transaction_value: 4016000 },
  { region_id: 'MH-NAG-2603', state: 'Maharashtra', city: 'Nagpur', month: '2026-03', lots_collected: 145, total_weight_kg: 29400, completed_weight_kg: 28000, transaction_value: 4480000 },

  // Delhi NCR
  { region_id: 'DL-DEL-2601', state: 'Delhi NCR', city: 'New Delhi', month: '2026-01', lots_collected: 380, total_weight_kg: 78200, completed_weight_kg: 72400, transaction_value: 11584000 },
  { region_id: 'DL-DEL-2602', state: 'Delhi NCR', city: 'New Delhi', month: '2026-02', lots_collected: 425, total_weight_kg: 89400, completed_weight_kg: 84900, transaction_value: 13584000 },
  { region_id: 'DL-DEL-2603', state: 'Delhi NCR', city: 'New Delhi', month: '2026-03', lots_collected: 470, total_weight_kg: 99100, completed_weight_kg: 95200, transaction_value: 15232000 },
  { region_id: 'DL-SLM-2601', state: 'Delhi NCR', city: 'North Delhi (Seelampur Cluster)', month: '2026-01', lots_collected: 520, total_weight_kg: 112000, completed_weight_kg: 98000, transaction_value: 15680000 },
  { region_id: 'DL-SLM-2602', state: 'Delhi NCR', city: 'North Delhi (Seelampur Cluster)', month: '2026-02', lots_collected: 580, total_weight_kg: 126400, completed_weight_kg: 116200, transaction_value: 18592000 },
  { region_id: 'DL-SLM-2603', state: 'Delhi NCR', city: 'North Delhi (Seelampur Cluster)', month: '2026-03', lots_collected: 630, total_weight_kg: 139000, completed_weight_kg: 131000, transaction_value: 20960000 },

  // Karnataka
  { region_id: 'KA-BLR-2601', state: 'Karnataka', city: 'Bengaluru', month: '2026-01', lots_collected: 490, total_weight_kg: 105000, completed_weight_kg: 99500, transaction_value: 16915000 },
  { region_id: 'KA-BLR-2602', state: 'Karnataka', city: 'Bengaluru', month: '2026-02', lots_collected: 540, total_weight_kg: 118200, completed_weight_kg: 113400, transaction_value: 19278000 },
  { region_id: 'KA-BLR-2603', state: 'Karnataka', city: 'Bengaluru', month: '2026-03', lots_collected: 610, total_weight_kg: 134500, completed_weight_kg: 129800, transaction_value: 22066000 },
  { region_id: 'KA-MYS-2601', state: 'Karnataka', city: 'Mysuru', month: '2026-01', lots_collected: 85, total_weight_kg: 16800, completed_weight_kg: 15900, transaction_value: 2703000 },
  { region_id: 'KA-MYS-2602', state: 'Karnataka', city: 'Mysuru', month: '2026-02', lots_collected: 98, total_weight_kg: 19400, completed_weight_kg: 18600, transaction_value: 3162000 },
  { region_id: 'KA-MYS-2603', state: 'Karnataka', city: 'Mysuru', month: '2026-03', lots_collected: 112, total_weight_kg: 22800, completed_weight_kg: 21900, transaction_value: 3723000 },

  // Tamil Nadu
  { region_id: 'TN-CHE-2601', state: 'Tamil Nadu', city: 'Chennai', month: '2026-01', lots_collected: 360, total_weight_kg: 74200, completed_weight_kg: 70100, transaction_value: 11216000 },
  { region_id: 'TN-CHE-2602', state: 'Tamil Nadu', city: 'Chennai', month: '2026-02', lots_collected: 410, total_weight_kg: 86500, completed_weight_kg: 82800, transaction_value: 13248000 },
  { region_id: 'TN-CHE-2603', state: 'Tamil Nadu', city: 'Chennai', month: '2026-03', lots_collected: 455, total_weight_kg: 97300, completed_weight_kg: 93800, transaction_value: 15008000 },
  { region_id: 'TN-CBE-2601', state: 'Tamil Nadu', city: 'Coimbatore', month: '2026-01', lots_collected: 140, total_weight_kg: 28500, completed_weight_kg: 26900, transaction_value: 4304000 },
  { region_id: 'TN-CBE-2602', state: 'Tamil Nadu', city: 'Coimbatore', month: '2026-02', lots_collected: 165, total_weight_kg: 33800, completed_weight_kg: 32200, transaction_value: 5152000 },
  { region_id: 'TN-CBE-2603', state: 'Tamil Nadu', city: 'Coimbatore', month: '2026-03', lots_collected: 185, total_weight_kg: 38200, completed_weight_kg: 36700, transaction_value: 5872000 },

  // Telangana
  { region_id: 'TS-HYD-2601', state: 'Telangana', city: 'Hyderabad', month: '2026-01', lots_collected: 330, total_weight_kg: 69400, completed_weight_kg: 65800, transaction_value: 10528000 },
  { region_id: 'TS-HYD-2602', state: 'Telangana', city: 'Hyderabad', month: '2026-02', lots_collected: 375, total_weight_kg: 79200, completed_weight_kg: 75600, transaction_value: 12096000 },
  { region_id: 'TS-HYD-2603', state: 'Telangana', city: 'Hyderabad', month: '2026-03', lots_collected: 420, total_weight_kg: 89500, completed_weight_kg: 86100, transaction_value: 13776000 },

  // Gujarat
  { region_id: 'GJ-AHM-2601', state: 'Gujarat', city: 'Ahmedabad', month: '2026-01', lots_collected: 270, total_weight_kg: 56400, completed_weight_kg: 53200, transaction_value: 8512000 },
  { region_id: 'GJ-AHM-2602', state: 'Gujarat', city: 'Ahmedabad', month: '2026-02', lots_collected: 310, total_weight_kg: 65100, completed_weight_kg: 62000, transaction_value: 9920000 },
  { region_id: 'GJ-AHM-2603', state: 'Gujarat', city: 'Ahmedabad', month: '2026-03', lots_collected: 345, total_weight_kg: 73200, completed_weight_kg: 70400, transaction_value: 11264000 },

  // West Bengal
  { region_id: 'WB-KOL-2601', state: 'West Bengal', city: 'Kolkata', month: '2026-01', lots_collected: 240, total_weight_kg: 49800, completed_weight_kg: 46200, transaction_value: 7392000 },
  { region_id: 'WB-KOL-2602', state: 'West Bengal', city: 'Kolkata', month: '2026-02', lots_collected: 280, total_weight_kg: 58600, completed_weight_kg: 55100, transaction_value: 8816000 },
  { region_id: 'WB-KOL-2603', state: 'West Bengal', city: 'Kolkata', month: '2026-03', lots_collected: 310, total_weight_kg: 65400, completed_weight_kg: 62500, transaction_value: 10000000 },

  // Uttar Pradesh
  { region_id: 'UP-NOI-2601', state: 'Uttar Pradesh', city: 'Noida', month: '2026-01', lots_collected: 210, total_weight_kg: 44200, completed_weight_kg: 41500, transaction_value: 6640000 },
  { region_id: 'UP-NOI-2602', state: 'Uttar Pradesh', city: 'Noida', month: '2026-02', lots_collected: 245, total_weight_kg: 52100, completed_weight_kg: 49300, transaction_value: 7888000 },
  { region_id: 'UP-NOI-2603', state: 'Uttar Pradesh', city: 'Noida', month: '2026-03', lots_collected: 280, total_weight_kg: 60200, completed_weight_kg: 57600, transaction_value: 9216000 }
];

export const MATERIAL_STATS: MaterialStats[] = [
  {
    material: 'Motherboards & High-Grade PCBs',
    total_weight_kg: 342500,
    lot_count: 2480,
    average_price_per_kg: 385,
    transaction_value: 131862500,
    percentage_of_total: 24.8,
    hazard_category: 'High',
    cpcb_code: 'EW-PCB-01A'
  },
  {
    material: 'Li-ion & Telecom Batteries',
    total_weight_kg: 215400,
    lot_count: 1840,
    average_price_per_kg: 260,
    transaction_value: 56004000,
    percentage_of_total: 15.6,
    hazard_category: 'High',
    cpcb_code: 'EW-BAT-02B'
  },
  {
    material: 'Copper Cables & Wiring Harnesses',
    total_weight_kg: 288900,
    lot_count: 2120,
    average_price_per_kg: 440,
    transaction_value: 127116000,
    percentage_of_total: 20.9,
    hazard_category: 'Low',
    cpcb_code: 'EW-CAB-03C'
  },
  {
    material: 'Display Units & Monitors (CRT/TFT)',
    total_weight_kg: 196300,
    lot_count: 1450,
    average_price_per_kg: 95,
    transaction_value: 18648500,
    percentage_of_total: 14.2,
    hazard_category: 'High',
    cpcb_code: 'EW-DIS-04D'
  },
  {
    material: 'Telecom Infrastructure Gear',
    total_weight_kg: 148200,
    lot_count: 920,
    average_price_per_kg: 310,
    transaction_value: 45942000,
    percentage_of_total: 10.7,
    hazard_category: 'Medium',
    cpcb_code: 'EW-TEL-05E'
  },
  {
    material: 'Consumer IT & Office Peripherals',
    total_weight_kg: 114600,
    lot_count: 1130,
    average_price_per_kg: 125,
    transaction_value: 14325000,
    percentage_of_total: 8.3,
    hazard_category: 'Medium',
    cpcb_code: 'EW-ITP-06F'
  },
  {
    material: 'Small Domestic E-Appliances',
    total_weight_kg: 76100,
    lot_count: 810,
    average_price_per_kg: 78,
    transaction_value: 5935800,
    percentage_of_total: 5.5,
    hazard_category: 'Low',
    cpcb_code: 'EW-SDA-07G'
  }
];

export const RECYCLER_STATS: RecyclerStats[] = [
  {
    recycler_id: 'REC-MH-001',
    name: 'Eco-Recycle Technologies Pvt Ltd',
    state: 'Maharashtra',
    city: 'Mumbai',
    authorization_status: 'CPCB Authorized',
    authorization_number: 'CPCB/EW-REG/MH-2023-014',
    materials_accepted: ['Motherboards & High-Grade PCBs', 'Li-ion & Telecom Batteries', 'Copper Cables & Wiring Harnesses'],
    pickup_available: true,
    service_area: 'Statewide (Maharashtra)',
    completed_lots: 1420,
    processed_weight_kg: 298000,
    capacity_metric_tons_per_month: 250,
    audit_valid_until: '2027-11-30'
  },
  {
    recycler_id: 'REC-KA-002',
    name: 'Cerebra Green Integrated Recyclers',
    state: 'Karnataka',
    city: 'Bengaluru',
    authorization_status: 'CPCB Authorized',
    authorization_number: 'CPCB/EW-REG/KA-2022-088',
    materials_accepted: ['Motherboards & High-Grade PCBs', 'Telecom Infrastructure Gear', 'Consumer IT & Office Peripherals'],
    pickup_available: true,
    service_area: 'National (Southern Region)',
    completed_lots: 1890,
    processed_weight_kg: 412000,
    capacity_metric_tons_per_month: 380,
    audit_valid_until: '2028-03-31'
  },
  {
    recycler_id: 'REC-DL-003',
    name: 'Attero Clean Tech Recovery Ltd',
    state: 'Delhi NCR',
    city: 'New Delhi',
    authorization_status: 'CPCB Authorized',
    authorization_number: 'CPCB/EW-REG/DL-2021-002',
    materials_accepted: ['Li-ion & Telecom Batteries', 'Motherboards & High-Grade PCBs', 'Display Units & Monitors (CRT/TFT)'],
    pickup_available: true,
    service_area: 'National (North & West)',
    completed_lots: 2150,
    processed_weight_kg: 535000,
    capacity_metric_tons_per_month: 500,
    audit_valid_until: '2027-08-15'
  },
  {
    recycler_id: 'REC-TN-004',
    name: 'Tritech E-Waste Refining & Metal Extracts',
    state: 'Tamil Nadu',
    city: 'Chennai',
    authorization_status: 'SPCB Certified',
    authorization_number: 'TNPCB/EW/CHN/2024-419',
    materials_accepted: ['Copper Cables & Wiring Harnesses', 'Display Units & Monitors (CRT/TFT)', 'Small Domestic E-Appliances'],
    pickup_available: true,
    service_area: 'Inter-district (Tamil Nadu & AP)',
    completed_lots: 980,
    processed_weight_kg: 184000,
    capacity_metric_tons_per_month: 160,
    audit_valid_until: '2026-12-31'
  },
  {
    recycler_id: 'REC-GJ-005',
    name: 'Greenscape Eco Management',
    state: 'Gujarat',
    city: 'Ahmedabad',
    authorization_status: 'CPCB Authorized',
    authorization_number: 'CPCB/EW-REG/GJ-2023-112',
    materials_accepted: ['Motherboards & High-Grade PCBs', 'Telecom Infrastructure Gear', 'Li-ion & Telecom Batteries'],
    pickup_available: false,
    service_area: 'Statewide (Gujarat)',
    completed_lots: 870,
    processed_weight_kg: 192000,
    capacity_metric_tons_per_month: 180,
    audit_valid_until: '2027-04-20'
  },
  {
    recycler_id: 'REC-TS-006',
    name: 'Hyderabad Clean Circular Solutions',
    state: 'Telangana',
    city: 'Hyderabad',
    authorization_status: 'SPCB Certified',
    authorization_number: 'TSPCB/EWR/HYD-2024-055',
    materials_accepted: ['Consumer IT & Office Peripherals', 'Small Domestic E-Appliances', 'Copper Cables & Wiring Harnesses'],
    pickup_available: true,
    service_area: 'Hyderabad Metropolitan + 100km',
    completed_lots: 740,
    processed_weight_kg: 146000,
    capacity_metric_tons_per_month: 140,
    audit_valid_until: '2026-10-15'
  },
  {
    recycler_id: 'REC-WB-007',
    name: 'Hulladek Recycling Private Ltd',
    state: 'West Bengal',
    city: 'Kolkata',
    authorization_status: 'CPCB Authorized',
    authorization_number: 'CPCB/EW-REG/WB-2022-071',
    materials_accepted: ['Motherboards & High-Grade PCBs', 'Display Units & Monitors (CRT/TFT)', 'Consumer IT & Office Peripherals'],
    pickup_available: true,
    service_area: 'Eastern Region (WB, Bihar, Odisha)',
    completed_lots: 830,
    processed_weight_kg: 178000,
    capacity_metric_tons_per_month: 150,
    audit_valid_until: '2027-09-30'
  },
  {
    recycler_id: 'REC-UP-008',
    name: 'Namo E-Waste Management Ltd',
    state: 'Uttar Pradesh',
    city: 'Noida',
    authorization_status: 'Under Audit',
    authorization_number: 'UPPCB/AUDIT-PEND/2026-03',
    materials_accepted: ['Small Domestic E-Appliances', 'Display Units & Monitors (CRT/TFT)'],
    pickup_available: false,
    service_area: 'Noida & Western UP',
    completed_lots: 390,
    processed_weight_kg: 81000,
    capacity_metric_tons_per_month: 120,
    audit_valid_until: '2026-05-30'
  },
  {
    recycler_id: 'REC-MH-009',
    name: 'Western Metal & Circular Refining Hub',
    state: 'Maharashtra',
    city: 'Pune',
    authorization_status: 'Renewal Due',
    authorization_number: 'CPCB/EW-REG/MH-2021-009',
    materials_accepted: ['Copper Cables & Wiring Harnesses', 'Motherboards & High-Grade PCBs'],
    pickup_available: true,
    service_area: 'Western Maharashtra (Pune, Satara, Kolhapur)',
    completed_lots: 620,
    processed_weight_kg: 128000,
    capacity_metric_tons_per_month: 110,
    audit_valid_until: '2026-03-31'
  }
];

export const TRACEABILITY_STATS: TraceabilityStats = {
  total_lots: 10750,
  matched_lots: 10240,
  accepted_lots: 9810,
  handed_over_lots: 9520,
  completed_lots: 9280,
  traceability_completion_rate: 86.3, // (completed_lots / total_lots) * 100
  pending_handover: 290, // accepted but not yet physically handed over
  pending_payment: 240  // handed over, waiting final bank payout release
};

export const PRICE_TRENDS: PriceTrend[] = [
  // Motherboards & High-Grade PCBs
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2025-10', market_min: 310, market_max: 360, average_buying_price: 340, informal_baseline_price: 220 },
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2025-11', market_min: 325, market_max: 375, average_buying_price: 355, informal_baseline_price: 225 },
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2025-12', market_min: 335, market_max: 390, average_buying_price: 370, informal_baseline_price: 230 },
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2026-01', market_min: 345, market_max: 405, average_buying_price: 382, informal_baseline_price: 235 },
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2026-02', market_min: 350, market_max: 415, average_buying_price: 392, informal_baseline_price: 240 },
  { material: 'Motherboards & High-Grade PCBs', location: 'Maharashtra (Mumbai)', date_or_month: '2026-03', market_min: 360, market_max: 425, average_buying_price: 405, informal_baseline_price: 245 },

  // Li-ion Batteries
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2025-10', market_min: 200, market_max: 240, average_buying_price: 225, informal_baseline_price: 140 },
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2025-11', market_min: 210, market_max: 255, average_buying_price: 238, informal_baseline_price: 145 },
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2025-12', market_min: 220, market_max: 265, average_buying_price: 248, informal_baseline_price: 150 },
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2026-01', market_min: 230, market_max: 275, average_buying_price: 256, informal_baseline_price: 155 },
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2026-02', market_min: 235, market_max: 285, average_buying_price: 265, informal_baseline_price: 160 },
  { material: 'Li-ion & Telecom Batteries', location: 'Delhi NCR', date_or_month: '2026-03', market_min: 240, market_max: 295, average_buying_price: 275, informal_baseline_price: 165 },

  // Copper Cables & Wiring Harnesses
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2025-10', market_min: 380, market_max: 430, average_buying_price: 405, informal_baseline_price: 290 },
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2025-11', market_min: 390, market_max: 440, average_buying_price: 418, informal_baseline_price: 300 },
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2025-12', market_min: 400, market_max: 455, average_buying_price: 430, informal_baseline_price: 310 },
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2026-01', market_min: 410, market_max: 465, average_buying_price: 442, informal_baseline_price: 315 },
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2026-02', market_min: 420, market_max: 475, average_buying_price: 452, informal_baseline_price: 320 },
  { material: 'Copper Cables & Wiring Harnesses', location: 'Karnataka (Bengaluru)', date_or_month: '2026-03', market_min: 425, market_max: 485, average_buying_price: 460, informal_baseline_price: 325 },

  // Display Units
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2025-10', market_min: 75, market_max: 95, average_buying_price: 86, informal_baseline_price: 45 },
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2025-11', market_min: 78, market_max: 98, average_buying_price: 89, informal_baseline_price: 45 },
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2025-12', market_min: 80, market_max: 102, average_buying_price: 92, informal_baseline_price: 50 },
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2026-01', market_min: 82, market_max: 105, average_buying_price: 95, informal_baseline_price: 50 },
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2026-02', market_min: 85, market_max: 108, average_buying_price: 97, informal_baseline_price: 52 },
  { material: 'Display Units & Monitors (CRT/TFT)', location: 'Tamil Nadu (Chennai)', date_or_month: '2026-03', market_min: 88, market_max: 112, average_buying_price: 101, informal_baseline_price: 55 }
];

export const IMPACT_METRICS: ImpactMetrics = {
  total_e_waste_collected: 1380500, // 1,380.5 Metric Tons
  total_e_waste_handed_to_authorized_recyclers: 1256400, // 1,256.4 Metric Tons
  total_transaction_value: 398933800, // ₹ 39.89 Crores direct transaction volume
  active_collectors: 4320, // 4,320 registered informal collectors participating
  verified_recyclers: 28, // 28 accredited facilities actively lifting
  completed_lots: 9280, // Verified completed lots
  formal_channel_rate: 91.01, // (1,256,400 / 1,380,500) * 100
  average_collector_realized_value: 92345, // ₹ 92,345 average realization per collector in period
  hazardous_fraction_diverted_kg: 478200, // Diverted from crude acid-bath/backyard burning
  direct_bank_transfers_count: 9280
};

export const ANONYMIZED_LOTS_AUDIT: AnonymizedLot[] = [
  {
    lot_id: 'LOT-2026-09812',
    batch_hash: '0x8f19...c34b',
    state: 'Maharashtra',
    city: 'Mumbai',
    collector_cohort: 'Cluster-MH-401 (Dharavi Hub)',
    material: 'Motherboards & High-Grade PCBs',
    weight_kg: 240,
    status: 'Completed',
    matched_date: '2026-03-01',
    accepted_date: '2026-03-02',
    handover_date: '2026-03-03',
    settled_date: '2026-03-04',
    recycler_name: 'Eco-Recycle Technologies Pvt Ltd',
    transaction_value: 96000,
    payment_status: 'Settled'
  },
  {
    lot_id: 'LOT-2026-09813',
    batch_hash: '0x3a77...e912',
    state: 'Delhi NCR',
    city: 'North Delhi (Seelampur Cluster)',
    collector_cohort: 'Cluster-DL-109 (Seelampur South)',
    material: 'Li-ion & Telecom Batteries',
    weight_kg: 410,
    status: 'Completed',
    matched_date: '2026-03-02',
    accepted_date: '2026-03-03',
    handover_date: '2026-03-04',
    settled_date: '2026-03-05',
    recycler_name: 'Attero Clean Tech Recovery Ltd',
    transaction_value: 110700,
    payment_status: 'Settled'
  },
  {
    lot_id: 'LOT-2026-09814',
    batch_hash: '0xb284...119f',
    state: 'Karnataka',
    city: 'Bengaluru',
    collector_cohort: 'Cluster-KA-204 (Peenya Industrial)',
    material: 'Copper Cables & Wiring Harnesses',
    weight_kg: 320,
    status: 'Completed',
    matched_date: '2026-03-03',
    accepted_date: '2026-03-04',
    handover_date: '2026-03-05',
    settled_date: '2026-03-06',
    recycler_name: 'Cerebra Green Integrated Recyclers',
    transaction_value: 144000,
    payment_status: 'Settled'
  },
  {
    lot_id: 'LOT-2026-09815',
    batch_hash: '0x55dc...a408',
    state: 'Tamil Nadu',
    city: 'Chennai',
    collector_cohort: 'Cluster-TN-312 (Guindy Aggregators)',
    material: 'Display Units & Monitors (CRT/TFT)',
    weight_kg: 580,
    status: 'Handed Over',
    matched_date: '2026-03-04',
    accepted_date: '2026-03-05',
    handover_date: '2026-03-06',
    recycler_name: 'Tritech E-Waste Refining',
    transaction_value: 58580,
    payment_status: 'Processing'
  },
  {
    lot_id: 'LOT-2026-09816',
    batch_hash: '0x99e1...7bc3',
    state: 'Telangana',
    city: 'Hyderabad',
    collector_cohort: 'Cluster-TS-508 (Secunderabad Zone)',
    material: 'Telecom Infrastructure Gear',
    weight_kg: 190,
    status: 'Accepted',
    matched_date: '2026-03-05',
    accepted_date: '2026-03-06',
    recycler_name: 'Hyderabad Clean Circular Solutions',
    transaction_value: 60800,
    payment_status: 'Pending Verification'
  },
  {
    lot_id: 'LOT-2026-09817',
    batch_hash: '0x44fa...22e7',
    state: 'Gujarat',
    city: 'Ahmedabad',
    collector_cohort: 'Cluster-GJ-611 (Vatva GIDC)',
    material: 'Motherboards & High-Grade PCBs',
    weight_kg: 275,
    status: 'Matched',
    matched_date: '2026-03-06',
    recycler_name: 'Greenscape Eco Management',
    transaction_value: 110000,
    payment_status: 'Pending Verification'
  },
  {
    lot_id: 'LOT-2026-09818',
    batch_hash: '0x17c8...99d4',
    state: 'West Bengal',
    city: 'Kolkata',
    collector_cohort: 'Cluster-WB-702 (Topsia & Tangra)',
    material: 'Consumer IT & Office Peripherals',
    weight_kg: 380,
    status: 'Completed',
    matched_date: '2026-03-02',
    accepted_date: '2026-03-03',
    handover_date: '2026-03-04',
    settled_date: '2026-03-05',
    recycler_name: 'Hulladek Recycling Private Ltd',
    transaction_value: 47500,
    payment_status: 'Settled'
  },
  {
    lot_id: 'LOT-2026-09819',
    batch_hash: '0x62bd...301a',
    state: 'Maharashtra',
    city: 'Pune',
    collector_cohort: 'Cluster-MH-412 (Bhosari Pimpri)',
    material: 'Copper Cables & Wiring Harnesses',
    weight_kg: 290,
    status: 'Handed Over',
    matched_date: '2026-03-04',
    accepted_date: '2026-03-05',
    handover_date: '2026-03-06',
    recycler_name: 'Western Metal & Circular Refining Hub',
    transaction_value: 130500,
    payment_status: 'Processing'
  },
  {
    lot_id: 'LOT-2026-09820',
    batch_hash: '0xdd41...88c2',
    state: 'Uttar Pradesh',
    city: 'Noida',
    collector_cohort: 'Cluster-UP-805 (Moradabad-Noida Link)',
    material: 'Small Domestic E-Appliances',
    weight_kg: 450,
    status: 'Completed',
    matched_date: '2026-03-01',
    accepted_date: '2026-03-02',
    handover_date: '2026-03-03',
    settled_date: '2026-03-04',
    recycler_name: 'Namo E-Waste Management Ltd',
    transaction_value: 36000,
    payment_status: 'Settled'
  }
];
