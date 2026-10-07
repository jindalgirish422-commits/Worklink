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
 * Searches workers across:
 * 1. Service / Trade (e.g. "AC", "Plumber")
 * 2. Worker Name or ID (e.g. "Manoj", "W3")
 * 3. Specific Skill (e.g. "Gas Leak", "PCB", "Copper Brazing")
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

  const results: SearchResultItem[] = [];

  for (const worker of workers) {
    const matchedCriteria: ('service' | 'worker_name' | 'worker_id' | 'skill')[] = [];

    // 1. Service / Trade match
    if (matchesTerm(worker.trade, cleanQuery)) {
      matchedCriteria.push('service');
    }

    // 2. Worker Name match
    if (matchesTerm(worker.name, cleanQuery)) {
      matchedCriteria.push('worker_name');
    }

    // 2b. Worker ID match (e.g. "W3", "W-3", "W1")
    if (worker.id.toLowerCase() === cleanQuery || worker.id.toLowerCase().includes(cleanQuery)) {
      matchedCriteria.push('worker_id');
    }

    // 3. Skill match
    const hasMatchingSkill = worker.skills.some((s) => matchesTerm(s, cleanQuery));
    if (hasMatchingSkill) {
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
