import {
  Worker,
  JobRequest,
  MatchingWeights,
  RankedWorker,
  UserPersonalizationProfile,
} from '../../types';
import { checkWorkerEligibility } from './eligibility';
import { extractMatchingFeatures } from './features';
import { calculateWorkerScore, OPERATIONAL_WEIGHT_PRESETS } from './scoring';
import { buildStructuredExplanation } from './explanation';

export interface RankingResult {
  rankedEligible: RankedWorker[];
  excludedWorkers: RankedWorker[];
  allWorkersRanked: RankedWorker[];
  rankingMethod: 'deterministic_rule_based' | 'model_assisted' | 'deterministic_fallback';
  fallbackTriggered: boolean;
  fallbackReason?: string;
}

/**
 * Deterministic multi-tier comparator for breaking ties when totalScore is identical.
 * Criteria hierarchy:
 * 1. Higher total score
 * 2. Higher quality / rating
 * 3. Closer geographic proximity (lower distanceKm)
 * 4. Greater trade experience (higher experienceYears)
 * 5. Lower quote price (lower estimatedQuote)
 * 6. Deterministic worker ID (alphanumeric ascending)
 */
export function compareWorkersDeterministic(a: RankedWorker, b: RankedWorker): number {
  // 1. Total score
  if (b.totalScore !== a.totalScore) {
    return b.totalScore - a.totalScore;
  }

  // 2. Rating
  if (b.worker.rating !== a.worker.rating) {
    return b.worker.rating - a.worker.rating;
  }

  // 3. Proximity (closer first)
  if (a.worker.distanceKm !== b.worker.distanceKm) {
    return a.worker.distanceKm - b.worker.distanceKm;
  }

  // 4. Experience years
  if (b.worker.experienceYears !== a.worker.experienceYears) {
    return b.worker.experienceYears - a.worker.experienceYears;
  }

  // 5. Price (lower first)
  if (a.worker.estimatedQuote !== b.worker.estimatedQuote) {
    return a.worker.estimatedQuote - b.worker.estimatedQuote;
  }

  // 6. Alphanumeric worker ID
  return a.worker.id.localeCompare(b.worker.id);
}

/**
 * WORKLINK MATCHING ENGINE: STAGE 5 — DETERMINISTIC RANKING
 *
 * Evaluates all workers against eligibility, extracts analytical features,
 * scores each candidate via weighted combinations, builds structured explanations,
 * and sorts candidates using multi-tier deterministic tie-breaking.
 */
export function rankWorkersDeterministic(
  workers: Worker[],
  job: JobRequest,
  weights: MatchingWeights = OPERATIONAL_WEIGHT_PRESETS[0],
  userProfile?: UserPersonalizationProfile,
  rankingMethodTag: 'deterministic_rule_based' | 'deterministic_fallback' = 'deterministic_rule_based'
): RankingResult {
  const allEvaluated: RankedWorker[] = workers.map((worker) => {
    // 1. Eligibility Check (Hard Filters)
    const eligibility = checkWorkerEligibility(worker, job);

    // 2. Feature Extraction
    const features = extractMatchingFeatures(worker, job, userProfile);

    // 3. Scoring
    const computedScore = calculateWorkerScore(features, weights, eligibility.isEligible);

    // 4. Explanation Generation
    const structuredExplanation = buildStructuredExplanation(
      worker,
      job,
      features,
      computedScore,
      eligibility,
      weights
    );

    return {
      worker,
      eligibility,
      totalScore: computedScore.totalScore,
      components: computedScore.components,
      weightedBreakdown: computedScore.weightedBreakdown,
      reasons: structuredExplanation.reasons,
      tradeOffSummary: structuredExplanation.tradeOffSummary,
      structuredExplanation,
      rank: 0,
      benchmarkNote: worker.notes,
      rankingMethod: rankingMethodTag,
    };
  });

  // Separate eligible from excluded
  const eligibleCandidates = allEvaluated
    .filter((w) => w.eligibility.isEligible)
    .sort(compareWorkersDeterministic)
    .map((w, idx) => ({ ...w, rank: idx + 1 }));

  const excludedCandidates = allEvaluated
    .filter((w) => !w.eligibility.isEligible)
    .sort((a, b) => a.worker.id.localeCompare(b.worker.id))
    .map((w, idx) => ({ ...w, rank: eligibleCandidates.length + idx + 1 }));

  return {
    rankedEligible: eligibleCandidates,
    excludedWorkers: excludedCandidates,
    allWorkersRanked: [...eligibleCandidates, ...excludedCandidates],
    rankingMethod: rankingMethodTag,
    fallbackTriggered: rankingMethodTag === 'deterministic_fallback',
  };
}

/**
 * AI MODEL SERVICE FALLBACK RUNNER
 *
 * If an external AI/model scoring service is provided and fails (throws error, times out,
 * or returns invalid data), the engine gracefully catches the fault and falls back to
 * deterministic rule-based ranking without crashing or degrading customer experience.
 */
export async function rankWorkersWithFallback(
  workers: Worker[],
  job: JobRequest,
  weights: MatchingWeights = OPERATIONAL_WEIGHT_PRESETS[0],
  userProfile?: UserPersonalizationProfile,
  modelAssister?: (
    workers: Worker[],
    job: JobRequest
  ) => Promise<RankedWorker[] | null>
): Promise<RankingResult> {
  if (!modelAssister) {
    return rankWorkersDeterministic(workers, job, weights, userProfile, 'deterministic_rule_based');
  }

  try {
    const modelOutput = await modelAssister(workers, job);
    if (!modelOutput || !Array.isArray(modelOutput) || modelOutput.length === 0) {
      throw new Error('Model service returned null or empty rankings');
    }

    // Ensure hard filters were not violated by model
    const sanitizedEligible = modelOutput
      .filter((rw) => {
        const hardCheck = checkWorkerEligibility(rw.worker, job);
        return hardCheck.isEligible;
      })
      .map((rw, idx) => ({
        ...rw,
        rank: idx + 1,
        rankingMethod: 'model_assisted' as const,
      }));

    const sanitizedExcluded = workers
      .filter((w) => !sanitizedEligible.some((e) => e.worker.id === w.id))
      .map((w, idx) => {
        const eligibility = checkWorkerEligibility(w, job);
        return {
          worker: w,
          eligibility,
          totalScore: 0,
          components: {
            skillScore: 0,
            experienceScore: 0,
            availabilityScore: 0,
            qualityScore: 0,
            distanceScore: 0,
            priceScore: 0,
            personalizationScore: 0,
          },
          weightedBreakdown: {
            skill: 0,
            experience: 0,
            availability: 0,
            quality: 0,
            distance: 0,
            price: 0,
            personalization: 0,
          },
          reasons: [`Excluded: ${eligibility.failedRule || 'Unmatched'}`],
          tradeOffSummary: 'Excluded from ranking pool.',
          rank: sanitizedEligible.length + idx + 1,
          rankingMethod: 'model_assisted' as const,
        };
      });

    return {
      rankedEligible: sanitizedEligible,
      excludedWorkers: sanitizedExcluded,
      allWorkersRanked: [...sanitizedEligible, ...sanitizedExcluded],
      rankingMethod: 'model_assisted',
      fallbackTriggered: false,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // Seamless deterministic fallback
    const fallbackResult = rankWorkersDeterministic(
      workers,
      job,
      weights,
      userProfile,
      'deterministic_fallback'
    );
    return {
      ...fallbackResult,
      fallbackReason: `AI Model failure (${errorMsg}) — successfully engaged deterministic rule-based ranking`,
    };
  }
}
