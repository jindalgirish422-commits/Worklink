import {
  Worker,
  JobRequest,
  WorkerEligibility,
  MatchingWeights,
  RankedWorker,
  WorkerScoreComponents,
  UserPersonalizationProfile,
} from '../types';
import {
  checkWorkerEligibility,
  extractMatchingFeatures,
  calculateWorkerScore,
  OPERATIONAL_WEIGHT_PRESETS,
  buildStructuredExplanation,
  rankWorkersDeterministic,
  rankWorkersWithFallback,
  compareWorkersDeterministic,
  RankingResult,
  ExtractedFeatures,
  ComputedScore,
} from './matching';

export * from './matching';

// Export alias for backwards compatibility
export const DEFAULT_WEIGHT_PRESETS: MatchingWeights[] = OPERATIONAL_WEIGHT_PRESETS;

/**
 * Backwards-compatible wrapper around extractMatchingFeatures
 */
export function calculateScoreComponents(
  worker: Worker,
  job: JobRequest,
  userProfile?: UserPersonalizationProfile
): WorkerScoreComponents {
  const feat = extractMatchingFeatures(worker, job, userProfile);
  return {
    skillScore: feat.skillScore,
    experienceScore: feat.experienceScore,
    availabilityScore: feat.availabilityScore,
    qualityScore: feat.qualityScore,
    distanceScore: feat.distanceScore,
    priceScore: feat.priceScore,
    personalizationScore: feat.personalizationScore,
  };
}

/**
 * Backwards-compatible wrapper around buildStructuredExplanation
 */
export function generateRecommendationReasons(
  worker: Worker,
  job: JobRequest,
  components: WorkerScoreComponents,
  eligibility: WorkerEligibility,
  weights: MatchingWeights = DEFAULT_WEIGHT_PRESETS[0]
): { reasons: string[]; tradeOffSummary: string } {
  const features = extractMatchingFeatures(worker, job);
  const score = calculateWorkerScore(features, weights, eligibility.isEligible);
  const structured = buildStructuredExplanation(worker, job, features, score, eligibility, weights);
  return {
    reasons: structured.reasons,
    tradeOffSummary: structured.tradeOffSummary,
  };
}

/**
 * Backwards-compatible rankWorkers entry point (delegates to deterministic pipeline)
 */
export function rankWorkers(
  workers: Worker[],
  job: JobRequest,
  weights: MatchingWeights = DEFAULT_WEIGHT_PRESETS[0],
  userProfile?: UserPersonalizationProfile
): {
  rankedEligible: RankedWorker[];
  excludedWorkers: RankedWorker[];
  allWorkersRanked: RankedWorker[];
} {
  const result = rankWorkersDeterministic(workers, job, weights, userProfile);
  return {
    rankedEligible: result.rankedEligible,
    excludedWorkers: result.excludedWorkers,
    allWorkersRanked: result.allWorkersRanked,
  };
}
