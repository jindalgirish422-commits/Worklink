import { Worker, RankedWorker, TradeCategory, AvailabilityStatus } from '../types';

export interface DiscoveryFilters {
  searchQuery: string;
  trade: string; // 'All' or specific trade
  skill: string; // '' or specific skill
  availability: 'all' | 'immediate' | 'today' | 'tomorrow';
  minRating: number; // 0, 4.5, 4.8
  maxDistanceKm: number; // 0 for any, 3, 5, 10
  minExperienceYears: number; // 0, 3, 5, 8
  maxPrice: number | null;
  verifiedOnly: boolean;
}

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  searchQuery: '',
  trade: 'All',
  skill: '',
  availability: 'all',
  minRating: 0,
  maxDistanceKm: 10.0,
  minExperienceYears: 0,
  maxPrice: null,
  verifiedOnly: false,
};

export interface SearchResultItem {
  worker: Worker;
  isEngineRecommendation: boolean;
  engineRank?: number;
  engineMatchScore?: number;
  matchedCriteria: ('service' | 'worker_name' | 'worker_id' | 'skill')[];
}

function matchesTerm(text: string, query: string): boolean {
  const cleanText = text.toLowerCase();
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length <= 2) {
    // For short acronym queries like "AC", enforce word-boundary matching so "replacement" does not match
    const regex = new RegExp(`\\b${cleanQuery}\\b`, 'i');
    return regex.test(cleanText);
  }
  return cleanText.includes(cleanQuery);
}

/**
 * Maps natural-language keywords to TradeCategory values.
 * Enables queries like "My AC is not cooling" or "wiring issue" to match relevant workers.
 */
const TRADE_SYNONYMS: Record<string, TradeCategory> = {
  // AC / HVAC
  cooling: 'AC Technician',
  'air conditioning': 'AC Technician',
  aircon: 'AC Technician',
  hvac: 'AC Technician',
  compressor: 'AC Technician',
  // Plumber
  plumbing: 'Plumber',
  pipe: 'Plumber',
  leak: 'Plumber',
  drain: 'Plumber',
  tap: 'Plumber',
  faucet: 'Plumber',
  toilet: 'Plumber',
  sink: 'Plumber',
  // Electrician
  electrical: 'Electrician',
  wiring: 'Electrician',
  circuit: 'Electrician',
  mcb: 'Electrician',
  power: 'Electrician',
  voltage: 'Electrician',
  socket: 'Electrician',
  switch: 'Electrician',
  sparking: 'Electrician',
  fan: 'Electrician',
  // Appliance
  washing: 'Appliance Repair',
  fridge: 'Appliance Repair',
  refrigerator: 'Appliance Repair',
  microwave: 'Appliance Repair',
  appliance: 'Appliance Repair',
  geyser: 'Appliance Repair',
  dishwasher: 'Appliance Repair',
  // Carpenter
  carpentry: 'Carpenter',
  furniture: 'Carpenter',
  door: 'Carpenter',
  wood: 'Carpenter',
  cabinet: 'Carpenter',
  wardrobe: 'Carpenter',
  hinge: 'Carpenter',
  // Painter
  painting: 'Painter',
  wall: 'Painter',
  seepage: 'Painter',
  dampness: 'Painter',
  // Automotive
  mechanic: 'Mechanic',
  car: 'Mechanic',
  bike: 'Mechanic',
  scooter: 'Mechanic',
  puncture: 'Mechanic',
  tyre: 'Mechanic',
  // Locksmith
  lock: 'Locksmith',
  key: 'Locksmith',
  padlock: 'Locksmith',
  locksmith: 'Locksmith',
  // Masonry
  mason: 'Mason / General Technician',
  tile: 'Mason / General Technician',
  tiles: 'Mason / General Technician',
  granite: 'Mason / General Technician',
  plaster: 'Mason / General Technician',
  // Gardening
  garden: 'Gardener / Landscaper',
  gardener: 'Gardener / Landscaper',
  lawn: 'Gardener / Landscaper',
  pruning: 'Gardener / Landscaper',
  // Networking
  wifi: 'Networking Specialist',
  router: 'Networking Specialist',
  broadband: 'Networking Specialist',
  network: 'Networking Specialist',
  fiber: 'Networking Specialist',
  // Cleaning
  cleaning: 'Cleaning Professional',
  cleaner: 'Cleaning Professional',
  housekeeping: 'Cleaning Professional',
  sanitiz: 'Cleaning Professional',
  sofa: 'Cleaning Professional',
};

/** English stop-words to ignore when splitting a natural-language query into terms */
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'my', 'me', 'i', 'we',
  'it', 'its', 'not', 'and', 'or', 'for', 'to', 'of', 'in',
  'on', 'at', 'by', 'near', 'with', 'do', 'need', 'want',
  'please', 'help', 'get', 'find', 'fix', 'repair', 'issue',
  'problem', 'broken', 'faulty', 'working', 'morning', 'evening',
  'today', 'tomorrow', 'asap', 'urgent',
]);

/**
 * Splits a query string into meaningful individual search terms,
 * discarding stop-words. Short acronyms (≤2 chars) are preserved.
 * e.g. "My AC is not cooling" → ["ac", "cooling"]
 */
function extractSearchTerms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,]+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter((t) => t.length > 0 && !STOP_WORDS.has(t));
}

/**
 * Searches workers across:
 * 1. Service / Trade (exact phrase + individual terms + synonym map)
 * 2. Worker Name or ID (e.g. "Manoj", "W3")
 * 3. Specific Skill (exact phrase + individual terms)
 * 4. Worker Bio (broad intent matching)
 *
 * Multi-word natural language queries ("My AC is not cooling") are handled
 * by extracting meaningful keywords and matching each individually.
 */
export function searchWorkers(workers: Worker[], query: string): SearchResultItem[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return workers.map((w) => ({
      worker: w,
      isEngineRecommendation: false,
      matchedCriteria: [],
    }));
  }

  // Extract individual meaningful terms for multi-word / NL queries
  const terms = extractSearchTerms(cleanQuery);

  // Build the set of TradeCategory values implied by the query (synonym lookup)
  const impliedTrades = new Set<TradeCategory>();
  for (const term of terms) {
    for (const [synonym, trade] of Object.entries(TRADE_SYNONYMS)) {
      if (term === synonym || synonym.startsWith(term) || term.includes(synonym)) {
        impliedTrades.add(trade);
      }
    }
  }

  const results: SearchResultItem[] = [];

  for (const worker of workers) {
    const matchedCriteria: ('service' | 'worker_name' | 'worker_id' | 'skill')[] = [];

    // 1. Service / Trade match
    //    a) Full-phrase match (e.g. query = "electrician")
    //    b) Any extracted term matches the trade string (e.g. "technician" in "AC Technician")
    //    c) Trade is implied via the synonym map (e.g. "cooling" → "AC Technician")
    const tradeMatchesFull = matchesTerm(worker.trade, cleanQuery);
    const tradeMatchesTerm = terms.some((t) => t.length > 2 && matchesTerm(worker.trade, t));
    const tradeMatchesSynonym = impliedTrades.has(worker.trade as TradeCategory);
    if (tradeMatchesFull || tradeMatchesTerm || tradeMatchesSynonym) {
      matchedCriteria.push('service');
    }

    // 2. Worker Name match (full phrase only — avoids false positives from NL queries)
    if (matchesTerm(worker.name, cleanQuery) || terms.some((t) => t.length > 2 && matchesTerm(worker.name, t))) {
      matchedCriteria.push('worker_name');
    }

    // 2b. Worker ID match (e.g. "W3", "W-3", "W1")
    if (worker.id.toLowerCase() === cleanQuery || worker.id.toLowerCase().includes(cleanQuery)) {
      matchedCriteria.push('worker_id');
    }

    // 3. Skill match
    //    a) Full-phrase matches any skill (e.g. "Copper Brazing")
    //    b) Any extracted term matches any skill (e.g. "pcb" in "PCB Inverter Repair")
    const skillMatchesFull = worker.skills.some((s) => matchesTerm(s, cleanQuery));
    const skillMatchesTerm = terms.some((t) =>
      t.length > 2 && worker.skills.some((s) => matchesTerm(s, t))
    );
    if (skillMatchesFull || skillMatchesTerm) {
      matchedCriteria.push('skill');
    }

    if (matchedCriteria.length > 0) {
      results.push({
        worker,
        isEngineRecommendation: false,
        matchedCriteria,
      });
    }
  }

  return results;
}

/**
 * Filters workers according to user constraints
 */
export function filterWorkers(workers: Worker[], filters: DiscoveryFilters): Worker[] {
  return workers.filter((worker) => {
    // 0. Governance Approval Filter (Milestone 26)
    if (worker.approvalStatus && worker.approvalStatus !== 'APPROVED') {
      return false;
    }

    // Trade filter
    if (filters.trade !== 'All' && worker.trade !== filters.trade) {
      return false;
    }

    // Skill filter
    if (filters.skill.trim()) {
      const targetSkill = filters.skill.toLowerCase().trim();
      const hasSkill = worker.skills.some((s) => s.toLowerCase().includes(targetSkill));
      if (!hasSkill) return false;
    }

    // Availability filter
    if (filters.availability !== 'all') {
      if (filters.availability === 'immediate' && worker.availabilityStatus !== 'immediate') {
        return false;
      }
      if (filters.availability === 'today' && !['immediate', 'today'].includes(worker.availabilityStatus)) {
        return false;
      }
      if (filters.availability === 'tomorrow' && !['immediate', 'today', 'tomorrow'].includes(worker.availabilityStatus)) {
        return false;
      }
    }

    // Rating filter
    if (filters.minRating > 0 && worker.rating < filters.minRating) {
      return false;
    }

    // Distance filter
    if (filters.maxDistanceKm > 0 && worker.distanceKm > filters.maxDistanceKm) {
      return false;
    }

    // Experience filter
    if (filters.minExperienceYears > 0 && worker.experienceYears < filters.minExperienceYears) {
      return false;
    }

    // Price ceiling filter
    if (filters.maxPrice !== null && worker.estimatedQuote > filters.maxPrice) {
      return false;
    }

    // Verification filter
    if (filters.verifiedOnly && !worker.isVerified) {
      return false;
    }

    return true;
  });
}

/**
 * Distinguishes search results from multi-factor engine recommendations:
 * Search results are NOT automatically recommendations.
 * Recommendation ranking strictly comes from the matching engine.
 */
export function annotateSearchResultsWithRecommendations(
  searchResults: SearchResultItem[],
  rankedWorkers: RankedWorker[]
): SearchResultItem[] {
  const rankMap = new Map<string, { rank: number; score: number }>();
  rankedWorkers.forEach((rw) => {
    rankMap.set(rw.worker.id, { rank: rw.rank, score: rw.totalScore });
  });

  return searchResults.map((item) => {
    const recData = rankMap.get(item.worker.id);
    if (recData) {
      return {
        ...item,
        isEngineRecommendation: true,
        engineRank: recData.rank,
        engineMatchScore: recData.score,
      };
    }
    return {
      ...item,
      isEngineRecommendation: false,
    };
  });
}

/**
 * Extracts all unique trade skills across workers for filter pill generation
 */
export function getAvailableSkills(workers: Worker[]): string[] {
  const skillSet = new Set<string>();
  workers.forEach((w) => {
    w.skills.forEach((s) => skillSet.add(s));
  });
  return Array.from(skillSet).sort();
}

/**
 * Curated Editorial Collections
 */
export function getCuratedCollections(workers: Worker[]) {
  return {
    emergencyDispatch: workers.filter(
      (w) => w.availabilityStatus === 'immediate' && w.distanceKm <= 5.0 && w.isVerified
    ),
    masterCraftsmen: workers.filter(
      (w) => w.experienceYears >= 7 && w.rating >= 4.8 && w.isVerified
    ),
    freeTravelCore: workers.filter(
      (w) => w.distanceKm <= 5.0 && w.isVerified
    ),
  };
}
