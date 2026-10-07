import { TradeCategory } from '../types';

/**
 * WORKLINK CENTRALIZED SERVICE TAXONOMY (Milestone 26)
 *
 * Single source of truth for all service domains, entity/object terms,
 * problem terms, trade mappings, default skills, and required experience levels.
 */

export type TaxonomyCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'AC_REPAIR'
  | 'APPLIANCE_REPAIR'
  | 'CARPENTRY'
  | 'PAINTING'
  | 'AUTOMOTIVE'
  | 'CLEANING'
  | 'HANDYMAN'
  | 'MASONRY'
  | 'LOCKSMITH'
  | 'ELECTRONICS'
  | 'NETWORKING'
  | 'GAS_APPLIANCE'
  | 'GLASS_ALUMINIUM'
  | 'GARDENING'
  | 'FURNITURE_ASSEMBLY';

export interface TaxonomyDefinition {
  id: TaxonomyCategory;
  displayName: string;
  tradeCategory: TradeCategory;
  workerTitle: string;
  objects: string[];
  problems: string[];
  contextualPhrases: string[];
  explicitKeywords: string[];
  defaultSkills: string[];
  defaultExperienceYears: number;
  baseDiagnosticQuote: number;
  sampleClarification: string;
}

export const TAXONOMY_CATALOG: Record<TaxonomyCategory, TaxonomyDefinition> = {
  PLUMBING: {
    id: 'PLUMBING',
    displayName: 'Plumbing & Drainage',
    tradeCategory: 'Plumber',
    workerTitle: 'Licensed Plumber',
    objects: [
      'tap',
      'pipe',
      'pipes',
      'sink',
      'toilet',
      'drain',
      'drainage',
      'faucet',
      'flush',
      'basin',
      'washbasin',
      'sewage',
      'bibcock',
      'shower',
      'geyser inlet',
      'overhead tank',
      'water tank',
      'float valve',
      'angle valve',
      'sump pump',
      'water motor',
    ],
    problems: [
      'leaking',
      'leak',
      'leakage',
      'burst',
      'clogged',
      'blocked',
      'clog',
      'blockage',
      'dripping',
      'overflowing',
      'low pressure',
      'no water',
      'choked',
      'draining slowly',
      'fitting',
      'installation',
    ],
    contextualPhrases: [
      'tap leaking',
      'pipe burst',
      'pipe leaking',
      'sink blocked',
      'sink clogged',
      'toilet leaking',
      'toilet flush broken',
      'drain blocked',
      'water dripping from pipe',
      'water pipe leakage',
      'bathroom tap loose',
    ],
    explicitKeywords: ['plumber', 'plumbing', 'sanitary work', 'drain cleaner'],
    defaultSkills: ['Pipe Leak Repair', 'Bathroom Fitting', 'Drain Blockage Removal', 'Water Motor Installation'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 550,
    sampleClarification: 'Is the plumbing issue with a pipe, tap, toilet, or drain?',
  },

  ELECTRICAL: {
    id: 'ELECTRICAL',
    displayName: 'Electrical & Power Systems',
    tradeCategory: 'Electrician',
    workerTitle: 'Certified Electrician',
    objects: [
      'switch',
      'switchboard',
      'socket',
      'plug',
      'wire',
      'wiring',
      'mcb',
      'mcb box',
      'fuse',
      'fan',
      'ceiling fan',
      'light',
      'bulb',
      'tube light',
      'chandelier',
      'inverter',
      'distribution board',
      'db box',
      'circuit breaker',
      'earthing',
      'panel board',
    ],
    problems: [
      'sparking',
      'tripping',
      'tripped',
      'keeps tripping',
      'short circuit',
      'not working',
      'burning smell',
      'shock',
      'flickering',
      'fluctuating',
      'no power',
      'loose connection',
      'dead socket',
      'rewiring',
    ],
    contextualPhrases: [
      'switch sparking',
      'mcb keeps tripping',
      'mcb tripping',
      'fan not working',
      'switch not working',
      'lights flickering',
      'short circuit in room',
      'inverter not charging',
      'ceiling fan humming',
      'socket burning smell',
    ],
    explicitKeywords: ['electrician', 'electrical', 'wireman', 'electrical repair'],
    defaultSkills: ['Short Circuit Troubleshooting', 'MCB & DB Box Repair', 'Ceiling Fan Installation', 'House Rewiring'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 500,
    sampleClarification: 'Is the electrical issue with a switchboard, MCB box, ceiling fan, or wiring?',
  },

  AC_REPAIR: {
    id: 'AC_REPAIR',
    displayName: 'Air Conditioning & HVAC',
    tradeCategory: 'AC Technician',
    workerTitle: 'AC Specialist',
    objects: [
      'ac',
      'air conditioner',
      'split ac',
      'window ac',
      'inverter ac',
      'compressor',
      'cooling coil',
      'condenser',
      'ac gas',
      'refrigerant',
      'ac remote',
      'ac filter',
      'outdoor unit',
      'indoor unit',
      'blower',
      'hvac',
    ],
    problems: [
      'not cooling',
      "isn't cooling",
      'is not cooling',
      'no cooling',
      'low cooling',
      'leaking water',
      'water dropping',
      'water leakage',
      'gas leak',
      'gas refill',
      'gas charging',
      'buzzing noise',
      'loud noise',
      'fan not spinning',
      'pcb error',
      'e4 error',
      'servicing',
      'coil wash',
    ],
    contextualPhrases: [
      'ac not cooling',
      "ac isn't cooling",
      'ac leaking water',
      'ac gas leak',
      'ac making noise',
      'air conditioner not cooling',
      'split ac dripping water',
      'ac compressor not starting',
      'ac servicing required',
    ],
    explicitKeywords: ['ac technician', 'ac mechanic', 'ac repair', 'hvac technician'],
    defaultSkills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Coil Cleaning'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 650,
    sampleClarification: 'Is your AC experiencing low cooling, water leakage, or an electrical/compressor fault?',
  },

  APPLIANCE_REPAIR: {
    id: 'APPLIANCE_REPAIR',
    displayName: 'Home Appliance Repair',
    tradeCategory: 'Appliance Repair',
    workerTitle: 'Appliance Technician',
    objects: [
      'fridge',
      'refrigerator',
      'washing machine',
      'front load',
      'top load',
      'microwave',
      'oven',
      'dishwasher',
      'ro',
      'water purifier',
      'geyser',
      'water heater',
      'chimney',
      'mixer grinder',
      'dryer',
    ],
    problems: [
      'not cooling',
      'leaking',
      'not spinning',
      'vibrating violently',
      'not heating',
      'no display',
      'water not draining',
      'drum fault',
      'door locked',
      'making loud sound',
      'tripping electricity',
      'thermostat broken',
      'filter replacement',
    ],
    contextualPhrases: [
      'fridge not cooling',
      'fridge leaking',
      'refrigerator not freezing',
      'washing machine not spinning',
      'washing machine leaking',
      'washing machine vibrating',
      'microwave not heating',
      'geyser not heating water',
      'ro filter choked',
      'chimney suction weak',
    ],
    explicitKeywords: ['appliance repair', 'appliance technician', 'fridge repair', 'washing machine repair'],
    defaultSkills: ['Washing Machine Drum Fault', 'Microwave Magnetron Repair', 'Refrigerator Cooling Repair'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 600,
    sampleClarification: 'Which appliance needs repair (e.g. refrigerator, washing machine, microwave, geyser)?',
  },

  CARPENTRY: {
    id: 'CARPENTRY',
    displayName: 'Carpentry & Woodwork',
    tradeCategory: 'Carpenter',
    workerTitle: 'Master Carpenter',
    objects: [
      'wardrobe',
      'cabinet',
      'drawer',
      'wooden door',
      'door',
      'door frame',
      'bed',
      'dining table',
      'wooden chair',
      'shelf',
      'shelving',
      'hinge',
      'hydraulic fitting',
      'plywood',
      'laminate',
      'kitchen cabinet',
      'closet',
    ],
    problems: [
      'broken',
      'jammed',
      'swollen',
      'loose',
      'not closing',
      'planing required',
      'alignment',
      'damaged',
      'sagging',
      'termite damage',
      'custom making',
      'modification',
    ],
    contextualPhrases: [
      'wardrobe broken',
      'door hinge broken',
      'wooden door jammed',
      'door swollen',
      'cabinet door loose',
      'drawer slide broken',
      'bed frame squeaking',
      'hydraulic bed fitting loose',
    ],
    explicitKeywords: ['carpenter', 'carpentry', 'woodworker', 'furniture repair'],
    defaultSkills: ['Door Jamming Fix', 'Modular Kitchen Hinge Repair', 'Lock & Handle Replacement', 'Custom Woodwork'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 550,
    sampleClarification: 'Is your carpentry request for door alignment, cabinet repair, or furniture work?',
  },

  PAINTING: {
    id: 'PAINTING',
    displayName: 'Painting & Waterproofing',
    tradeCategory: 'Painter',
    workerTitle: 'Professional Painter',
    objects: [
      'wall',
      'walls',
      'ceiling',
      'room',
      'bedroom',
      'living room',
      'exterior',
      'interior',
      'balcony wall',
      'door paint',
      'grill paint',
      'putty',
      'primer',
    ],
    problems: [
      'paint',
      'repainting',
      'repaint',
      'needs repainting',
      'dampness',
      'seepage',
      'waterproofing',
      'peeling',
      'flaking',
      'cracks in paint',
      'stain',
      'stains',
      'texture painting',
      'touch up',
    ],
    contextualPhrases: [
      'paint my room',
      'wall needs repainting',
      'wall dampness seepage',
      'ceiling paint peeling',
      'waterproofing required on wall',
      'stain removal on ceiling',
      'interior paint quote',
    ],
    explicitKeywords: ['painter', 'painting', 'whitewash', 'wall painting', 'waterproofing contractor'],
    defaultSkills: ['Dampness Water-proofing', 'Wall Touch-up & Putty', 'Texture Painting', 'Ceiling Stain Removal'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 600,
    sampleClarification: 'Do you need interior wall repainting, moisture damp-proofing, or exterior painting?',
  },

  AUTOMOTIVE: {
    id: 'AUTOMOTIVE',
    displayName: 'Automotive & Two-Wheeler',
    tradeCategory: 'Mechanic',
    workerTitle: 'Automotive Mechanic',
    objects: [
      'car',
      'bike',
      'scooter',
      'motorcycle',
      'engine',
      'brake',
      'brakes',
      'clutch',
      'tyre',
      'tire',
      'car battery',
      'spark plug',
      'radiator',
      'headlight',
    ],
    problems: [
      "won't start",
      'not starting',
      'puncture',
      'flat tyre',
      'flat tire',
      'battery dead',
      'jump start',
      'brake failure',
      'overheating',
      'engine noise',
      'oil leak',
      'service',
    ],
    contextualPhrases: [
      "car won't start",
      'car not starting',
      'bike puncture',
      'scooter flat tyre',
      'car battery dead',
      'car engine overheating',
      'brake pads worn out',
      'two wheeler servicing',
    ],
    explicitKeywords: ['mechanic', 'car mechanic', 'bike mechanic', 'auto repair', 'garage technician'],
    defaultSkills: ['Engine Diagnostics', 'Brake System Overhaul', 'Battery Jump & Alternator', 'Emergency Puncture Fix'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 600,
    sampleClarification: 'Is the vehicle a car or two-wheeler, and what is the issue (puncture, battery, engine)?',
  },

  CLEANING: {
    id: 'CLEANING',
    displayName: 'Deep Cleaning & Sanitization',
    tradeCategory: 'Cleaning Professional',
    workerTitle: 'Deep Cleaning Specialist',
    objects: [
      'house',
      'home',
      'apartment',
      'flat',
      'kitchen',
      'bathroom',
      'sofa',
      'couch',
      'carpet',
      'mattress',
      'balcony',
      'window glass',
      'floor',
      'tiles',
    ],
    problems: [
      'deep clean',
      'deep cleaning',
      'cleaning',
      'degreasing',
      'shampooing',
      'sanitize',
      'sanitization',
      'dirty',
      'dusty',
      'stains',
      'odour',
      'post construction',
      'move in cleaning',
    ],
    contextualPhrases: [
      'deep clean my house',
      'kitchen degreasing required',
      'sofa shampooing service',
      'bathroom deep cleaning',
      'carpet dry cleaning',
      'post renovation cleaning',
    ],
    explicitKeywords: ['cleaner', 'cleaning service', 'housekeeper', 'deep cleaner', 'maid'],
    defaultSkills: ['Deep Home Cleaning', 'Kitchen Degreasing', 'Sofa Shampooing', 'Sanitization'],
    defaultExperienceYears: 2,
    baseDiagnosticQuote: 750,
    sampleClarification: 'Do you require full home deep cleaning, kitchen degreasing, or sofa shampooing?',
  },

  LOCKSMITH: {
    id: 'LOCKSMITH',
    displayName: 'Locksmith & Door Security',
    tradeCategory: 'Locksmith',
    workerTitle: 'Certified Locksmith',
    objects: ['lock', 'door lock', 'main door lock', 'key', 'keys', 'padlock', 'handle lock', 'deadbolt', 'latches', 'cylinder lock', 'electronic lock'],
    problems: ['broken', 'stuck', 'jammed', 'lost key', 'locked out', 'change lock', 'replace cylinder', 'duplicate key', 'not turning'],
    contextualPhrases: ['door lock broken', 'key stuck in lock', 'locked out of house', 'change main door lock', 'padlock jammed'],
    explicitKeywords: ['locksmith', 'chabi wala', 'key maker', 'lock technician'],
    defaultSkills: ['High-Security Lock Installation', 'Cylinder Extraction', 'Emergency Lockout Opening', 'Deadbolt Alignment'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 500,
    sampleClarification: 'Are you locked out or looking to repair/replace an existing door lock?',
  },

  NETWORKING: {
    id: 'NETWORKING',
    displayName: 'Networking & WiFi Support',
    tradeCategory: 'Networking Specialist',
    workerTitle: 'Network & WiFi Engineer',
    objects: ['wifi', 'wi-fi', 'router', 'modem', 'internet', 'broadband', 'fiber', 'lan', 'ethernet cable', 'mesh wifi', 'network switch'],
    problems: ['not working', 'slow internet', 'no connection', 'disconnecting', 'router setup', 'cabling', 'range extender setup', 'red light on router'],
    contextualPhrases: ['wifi not working', 'internet not working', 'router not connecting', 'configure mesh wifi', 'lan cable crimping'],
    explicitKeywords: ['network engineer', 'wifi technician', 'broadband technician', 'it network support'],
    defaultSkills: ['Mesh WiFi Calibration', 'Cat6 LAN Termination', 'Optical Fiber Splicing', 'Router Gateway Configuration'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 500,
    sampleClarification: 'Is your issue with WiFi coverage, router configuration, or ethernet cabling?',
  },

  MASONRY: {
    id: 'MASONRY',
    displayName: 'Masonry & Tile Repair',
    tradeCategory: 'Mason / General Technician',
    workerTitle: 'Masonry Specialist',
    objects: ['tiles', 'tile', 'floor tile', 'granite', 'marble', 'cement', 'plaster', 'brick', 'brickwork', 'concrete', 'grouting'],
    problems: ['broken', 'cracked', 'hollow', 'loose', 'grouting worn', 'chipped', 'hole in wall', 'drilling', 'civil repair'],
    contextualPhrases: ['broken tiles', 'floor tile cracked', 'grouting worn out in bathroom', 'plaster falling from ceiling', 'granite countertop chip'],
    explicitKeywords: ['mason', 'tile worker', 'civil contractor', 'mistri'],
    defaultSkills: ['Tile Grouting & Replacement', 'Plaster Patch Repair', 'Granite Chip Restoration', 'Wall Core Drilling'],
    defaultExperienceYears: 5,
    baseDiagnosticQuote: 600,
    sampleClarification: 'Do you need broken tile replacement, wall plastering, or grouting repair?',
  },

  GARDENING: {
    id: 'GARDENING',
    displayName: 'Gardening & Landscape Care',
    tradeCategory: 'Gardener / Landscaper',
    workerTitle: 'Gardener & Horticulturist',
    objects: ['garden', 'lawn', 'grass', 'plants', 'trees', 'pots', 'hedges', 'soil', 'terrace garden', 'drip irrigation'],
    problems: ['maintenance', 'mowing', 'pruning', 'trimming', 'weeding', 'dying plants', 'fertilizing', 'repotting', 'pest infection on plants'],
    contextualPhrases: ['garden maintenance', 'lawn mowing required', 'pruning tree branches', 'balcony plant repotting', 'hedge trimming'],
    explicitKeywords: ['gardener', 'mali', 'landscaper', 'horticulture technician'],
    defaultSkills: ['Lawn Aeration & Mowing', 'Ornamental Tree Pruning', 'Organic Soil Enrichment', 'Drip Irrigation Maintenance'],
    defaultExperienceYears: 3,
    baseDiagnosticQuote: 450,
    sampleClarification: 'Do you need regular lawn maintenance, tree pruning, or plant repotting?',
  },

  FURNITURE_ASSEMBLY: {
    id: 'FURNITURE_ASSEMBLY',
    displayName: 'Furniture & Equipment Assembly',
    tradeCategory: 'Furniture Assembly Specialist',
    workerTitle: 'Assembly Specialist',
    objects: ['wardrobe', 'bed', 'bunk bed', 'desk', 'standing desk', 'ikea furniture', 'flatpack', 'treadmill', 'bookshelf', 'tv unit'],
    problems: ['assemble', 'assembly', 'assembling', 'installation', 'dismantle', 'dismantling', 're-assembly'],
    contextualPhrases: ['assemble my wardrobe', 'assemble ikea bed', 'standing desk assembly', 'treadmill installation', 'dismantle furniture'],
    explicitKeywords: ['furniture assembler', 'ikea assembler', 'assembly technician'],
    defaultSkills: ['Flatpack Hardware Fastening', 'Hydraulic Lift Bed Assembly', 'Modular Wardrobe Aligning', 'Wall Anchoring Safety'],
    defaultExperienceYears: 2,
    baseDiagnosticQuote: 500,
    sampleClarification: 'What piece of furniture needs assembly (e.g. wardrobe, bed, desk)?',
  },

  GAS_APPLIANCE: {
    id: 'GAS_APPLIANCE',
    displayName: 'Gas Stoves & Piping',
    tradeCategory: 'Gas Appliance Specialist',
    workerTitle: 'Gas Safety Specialist',
    objects: ['gas stove', 'gas hob', 'burner', 'lpg pipe', 'gas cylinder regulator', 'gas geyser'],
    problems: ['gas leak', 'gas smell', 'burner not lighting', 'low flame', 'yellow flame', 'knob jammed', 'pipe replacement'],
    contextualPhrases: ['gas stove leaking', 'gas smell near hob', 'gas burner low flame', 'replace lpg rubber pipe'],
    explicitKeywords: ['gas technician', 'gas stove repair', 'hob repair'],
    defaultSkills: ['LPG Manometer Leak Detection', 'Brass Burner Re-coring', 'Flame Staging Calibration', 'Reinforced Gas Hose Fitting'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 450,
    sampleClarification: 'Is there a gas smell / leak, or is a stove burner not firing?',
  },

  GLASS_ALUMINIUM: {
    id: 'GLASS_ALUMINIUM',
    displayName: 'Glass & Aluminium Fixtures',
    tradeCategory: 'Glass & Aluminium Specialist',
    workerTitle: 'Glass & Aluminium Technician',
    objects: ['glass door', 'sliding door', 'aluminium window', 'window pane', 'shower partition', 'glass railing', 'mesh door'],
    problems: ['broken glass', 'roller jammed', 'track off', 'handle broken', 'silicone seal leaking', 'mosquito net torn'],
    contextualPhrases: ['sliding glass door jammed', 'aluminium window roller broken', 'replace broken window glass pane'],
    explicitKeywords: ['glass technician', 'aluminium fabricator', 'window glazier'],
    defaultSkills: ['Toughened Glass Installation', 'Sliding Roller Track Truing', 'Structural Glazing Silicone Sealing'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 600,
    sampleClarification: 'Is the issue with a sliding door track, broken glass pane, or aluminium frame?',
  },

  ELECTRONICS: {
    id: 'ELECTRONICS',
    displayName: 'Consumer Electronics & PCB',
    tradeCategory: 'Electronics Specialist',
    workerTitle: 'Electronics Technician',
    objects: ['tv', 'television', 'led tv', 'soundbar', 'home theater', 'amplifier', 'pcb', 'circuit board', 'ups'],
    problems: ['no display', 'no sound', 'not turning on', 'lines on screen', 'hdmi port broken', 'power surge'],
    contextualPhrases: ['led tv not turning on', 'soundbar no audio', 'tv lines on display', 'amplifier power issue'],
    explicitKeywords: ['electronics technician', 'tv repair', 'pcb technician'],
    defaultSkills: ['SMD Component Soldering', 'Motherboard Power Rail Diagnostics', 'Display Panel Driver Replacement'],
    defaultExperienceYears: 4,
    baseDiagnosticQuote: 550,
    sampleClarification: 'Which electronic device needs diagnostic (e.g. LED TV, sound system, PCB)?',
  },

  HANDYMAN: {
    id: 'HANDYMAN',
    displayName: 'General Domestic Handyman',
    tradeCategory: 'Mason / General Technician',
    workerTitle: 'General Handyman',
    objects: ['curtain rod', 'mirror', 'photo frame', 'tv mount', 'wall mounting', 'shelf hanging', 'minor fix'],
    problems: ['drilling', 'mounting', 'hanging', 'fixing', 'small repairs'],
    contextualPhrases: ['drill and mount tv', 'hang heavy mirror on wall', 'fix curtain rod', 'minor general domestic fixes'],
    explicitKeywords: ['handyman', 'general technician', 'domestic helper'],
    defaultSkills: ['Precision Wall Anchoring', 'Laser Level Alignment', 'Multi-material Drilling', 'General Hardware Mounting'],
    defaultExperienceYears: 2,
    baseDiagnosticQuote: 400,
    sampleClarification: 'Do you need wall mounting/drilling or multi-trade domestic adjustments?',
  },
};

export interface ClassificationResult {
  taxonomyCategory: TaxonomyCategory;
  serviceCategory: TradeCategory;
  workerCategory: string;
  serviceName: string;
  matchedKeywords: string[];
  detectedObject?: string;
  detectedProblem?: string;
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0.0 to 1.0
  clarificationRequired: boolean;
  clarificationQuestion?: string;
  clarificationOptions?: string[];
  requiredSkills: string[];
  requiredExperienceYears: number;
  suggestedBudget: number;
  detectedIssueSummary: string;
}

/**
 * CONTEXT-AWARE & OBJECT-FIRST CLASSIFIER (Milestone 26)
 *
 * Evaluates queries using:
 * 1. High-priority explicit trade phrases ("I need a plumber")
 * 2. Contextual exact phrases ("tap leaking", "AC not cooling", "fridge not cooling")
 * 3. Object-first entity scoring combined with problem disambiguation
 * 4. Fallback clarification for truly ambiguous queries (NEVER defaults to AC Technician)
 */
export function classifyServiceRequest(rawPrompt: string): ClassificationResult {
  const text = rawPrompt.toLowerCase().trim();
  const matchedKeywords: string[] = [];

  if (!text) {
    return createAmbiguousResult(rawPrompt);
  }

  // -----------------------------------------------------------------
  // STAGE 1: EXPLICIT CATEGORY PHRASES (Highest Priority: 1.0 Confidence)
  // -----------------------------------------------------------------
  for (const cat of Object.values(TAXONOMY_CATALOG)) {
    for (const kw of cat.explicitKeywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        matchedKeywords.push(kw);
        return {
          taxonomyCategory: cat.id,
          serviceCategory: cat.tradeCategory,
          workerCategory: cat.workerTitle,
          serviceName: cat.displayName,
          matchedKeywords: [kw],
          detectedObject: kw,
          detectedProblem: 'Explicit category requested',
          confidence: 'high',
          confidenceScore: 1.0,
          clarificationRequired: false,
          requiredSkills: cat.defaultSkills,
          requiredExperienceYears: cat.defaultExperienceYears,
          suggestedBudget: cat.baseDiagnosticQuote,
          detectedIssueSummary: `Explicit request for ${cat.workerTitle} (${cat.displayName})`,
        };
      }
    }
  }

  // -----------------------------------------------------------------
  // STAGE 2: EXACT CONTEXTUAL PHRASES (e.g. "tap leaking", "AC not cooling")
  // -----------------------------------------------------------------
  for (const cat of Object.values(TAXONOMY_CATALOG)) {
    for (const phrase of cat.contextualPhrases) {
      if (text.includes(phrase)) {
        matchedKeywords.push(phrase);
        const [obj, ...probParts] = phrase.split(' ');
        const prob = probParts.join(' ');
        return {
          taxonomyCategory: cat.id,
          serviceCategory: cat.tradeCategory,
          workerCategory: cat.workerTitle,
          serviceName: cat.displayName,
          matchedKeywords: [phrase],
          detectedObject: obj,
          detectedProblem: prob,
          confidence: 'high',
          confidenceScore: 0.98,
          clarificationRequired: false,
          requiredSkills: cat.defaultSkills,
          requiredExperienceYears: cat.defaultExperienceYears,
          suggestedBudget: cat.baseDiagnosticQuote,
          detectedIssueSummary: `${phrase.toUpperCase()} — ${cat.displayName}`,
        };
      }
    }
  }

  // -----------------------------------------------------------------
  // STAGE 3: OBJECT-FIRST MULTI-FACTOR SCORING
  // -----------------------------------------------------------------
  interface CategoryScore {
    category: TaxonomyDefinition;
    objectMatches: string[];
    problemMatches: string[];
    score: number;
  }

  const scores: CategoryScore[] = [];

  for (const cat of Object.values(TAXONOMY_CATALOG)) {
    const objectMatches: string[] = [];
    const problemMatches: string[] = [];

    // Check objects with word boundaries or substring
    for (const obj of cat.objects) {
      if (obj.length <= 3) {
        const regex = new RegExp(`\\b${obj}\\b`, 'i');
        if (regex.test(text)) objectMatches.push(obj);
      } else if (text.includes(obj)) {
        objectMatches.push(obj);
      }
    }

    // Check problems
    for (const prob of cat.problems) {
      if (text.includes(prob)) {
        problemMatches.push(prob);
      }
    }

    // Scoring formula: Object matches carry 70% weight, problems carry 30% weight
    let score = 0;
    if (objectMatches.length > 0) {
      score += 60 + Math.min(20, objectMatches.length * 10);
    }
    if (problemMatches.length > 0 && objectMatches.length > 0) {
      score += 20 + Math.min(10, problemMatches.length * 5);
    } else if (problemMatches.length > 0 && objectMatches.length === 0) {
      // Problem without object is weak / ambiguous (e.g. "leaking" or "broken")
      score += 15;
    }

    if (score > 0) {
      scores.push({
        category: cat,
        objectMatches,
        problemMatches,
        score,
      });
    }
  }

  // Sort scores descending
  scores.sort((a, b) => b.score - a.score);

  if (scores.length > 0 && scores[0].score >= 60) {
    const best = scores[0];
    const obj = best.objectMatches[0] || 'Appliance / Fixture';
    const prob = best.problemMatches[0] || 'Issue';
    const matched = [...best.objectMatches, ...best.problemMatches];

    return {
      taxonomyCategory: best.category.id,
      serviceCategory: best.category.tradeCategory,
      workerCategory: best.category.workerTitle,
      serviceName: best.category.displayName,
      matchedKeywords: matched,
      detectedObject: obj,
      detectedProblem: prob,
      confidence: best.score >= 80 ? 'high' : 'medium',
      confidenceScore: Math.min(0.95, best.score / 100),
      clarificationRequired: false,
      requiredSkills: best.category.defaultSkills,
      requiredExperienceYears: best.category.defaultExperienceYears,
      suggestedBudget: best.category.baseDiagnosticQuote,
      detectedIssueSummary: `${obj} ${prob} — ${best.category.displayName}`,
    };
  }

  // -----------------------------------------------------------------
  // STAGE 4: LOW CONFIDENCE / AMBIGUOUS REQUEST (Do NOT default to AC)
  // -----------------------------------------------------------------
  return createAmbiguousResult(rawPrompt);
}

function createAmbiguousResult(rawPrompt: string): ClassificationResult {
  return {
    taxonomyCategory: 'HANDYMAN',
    serviceCategory: 'Mason / General Technician',
    workerCategory: 'General Domestic Specialist',
    serviceName: 'General Domestic Assistance',
    matchedKeywords: [],
    detectedObject: undefined,
    detectedProblem: undefined,
    confidence: 'low',
    confidenceScore: 0.3,
    clarificationRequired: true,
    clarificationQuestion: 'I can help with that. What needs repair?',
    clarificationOptions: [
      'Plumbing (Tap / Pipe / Toilet)',
      'Electrical (Switch / MCB / Fan)',
      'AC Repair (Cooling / Gas / Leak)',
      'Appliance (Fridge / Washing Machine)',
      'Carpentry (Door / Wardrobe / Wood)',
      'Painting & Seepage',
      'Automotive / Vehicle',
      'Deep Cleaning',
    ],
    requiredSkills: ['General Diagnostics', 'Tool Equipment', 'Domestic Maintenance'],
    requiredExperienceYears: 2,
    suggestedBudget: 500,
    detectedIssueSummary: 'General home service request requiring trade clarification',
  };
}
