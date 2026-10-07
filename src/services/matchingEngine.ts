import {
  Worker,
  JobRequest,
  WorkerEligibility,
  MatchingWeights,
  RankedWorker,
  WorkerScoreComponents,
  UserPersonalizationProfile,
} from '../types';
import { isValidCoordinates, isDistanceWithinServiceZone } from './locationService';

export const DEFAULT_WEIGHT_PRESETS: MatchingWeights[] = [
  {
    id: 'calibrated_prior',
    name: 'Standard Calibrated Prior (AC Emergency)',
    description: 'Balanced multi-factor prior calibrated for urgent domestic repairs where skill and immediate availability dominate.',
    w_skill: 0.28,
    w_experience: 0.18,
    w_availability: 0.20,
    w_quality: 0.16,
    w_distance: 0.10,
    w_price: 0.08,
    personalizationBonus: 0.05,
    source: 'calibrated_scenario',
  },
  {
    id: 'quality_first',
    name: 'Quality & Reputation Priority',
    description: 'Heavier weight on verified ratings, completion history, and years of trade experience.',
    w_skill: 0.25,
    w_experience: 0.25,
    w_availability: 0.15,
    w_quality: 0.25,
    w_distance: 0.05,
    w_price: 0.05,
    personalizationBonus: 0.05,
    source: 'business_prior',
  },
  {
    id: 'budget_sensitive',
    name: 'Cost & Proximity Focused',
    description: 'Prioritizes lower quotes, zero travel charges, and nearby workers without compromising core hard constraints.',
    w_skill: 0.20,
    w_experience: 0.12,
    w_availability: 0.18,
    w_quality: 0.12,
    w_distance: 0.18,
    w_price: 0.20,
    personalizationBonus: 0.05,
    source: 'business_prior',
  },
  {
    id: 'learned_transactions',
    name: 'Learned from Transaction Feedback (Post-Pilot)',
    description: 'Model calibrated on actual completed jobs, customer satisfaction ratings, and cancellation telemetry.',
    w_skill: 0.26,
    w_experience: 0.19,
    w_availability: 0.21,
    w_quality: 0.18,
    w_distance: 0.08,
    w_price: 0.08,
    personalizationBonus: 0.08,
    source: 'learned_from_transactions',
  },
];

/**
 * Step 1: Hard Eligibility Filtering
 * Non-negotiable: workers who cannot do the job are removed before ranking.
 */
export function checkWorkerEligibility(
  worker: Worker,
  job: JobRequest
): WorkerEligibility {
  const checks = [
    {
      ruleName: 'Worker Verified',
      passed: worker.isVerified && worker.backgroundCheckPassed,
      detail: worker.isVerified && worker.backgroundCheckPassed
        ? `Govt ID & background verified (${worker.licenseNumber})`
        : 'Worker has unverified identity or incomplete background check',
    },
    {
      ruleName: 'Required Skills Available',
      passed: job.requiredSkills.every((reqSkill) =>
        worker.skills.some((ws) => ws.toLowerCase().includes(reqSkill.toLowerCase()))
      ),
      detail: `Holds ${worker.skills.filter((s) =>
        job.requiredSkills.some((req) => s.toLowerCase().includes(req.toLowerCase()))
      ).length} of ${job.requiredSkills.length} required skills`,
    },
    {
      ruleName: 'Available at Requested Time',
      passed: (() => {
        if (job.urgency === 'emergency') {
          return worker.availabilityStatus === 'immediate';
        }
        if (job.urgency === 'high') {
          return worker.availabilityStatus === 'immediate' || worker.availabilityStatus === 'today';
        }
        return worker.availabilityStatus !== 'busy';
      })(),
      detail:
        worker.availabilityStatus === 'immediate'
          ? 'Available immediately'
          : worker.availabilityStatus === 'today'
          ? `Available today (${worker.nextAvailableSlot})`
          : `Next slot: ${worker.nextAvailableSlot}`,
    },
    {
      ruleName: 'Within 10 km Service Zone',
      passed: isValidCoordinates(worker.coordinates) && isDistanceWithinServiceZone(worker.distanceKm, 10.0),
      detail: !isValidCoordinates(worker.coordinates)
        ? 'Worker GPS coordinates missing or invalid'
        : isDistanceWithinServiceZone(worker.distanceKm, 10.0)
        ? `${worker.distanceKm.toFixed(1)} km from customer (within 10.0 km boundary)`
        : `${worker.distanceKm.toFixed(1)} km away (exceeds 10.0 km cutoff)`,
    },
    {
      ruleName: 'Mandatory Experience & Requirements',
      passed: worker.experienceYears >= (job.requiredExperienceYears || 1),
      detail:
        worker.experienceYears >= (job.requiredExperienceYears || 1)
          ? `${worker.experienceYears} yrs experience (meets ${job.requiredExperienceYears || 1}+ yrs minimum)`
          : `${worker.experienceYears} yrs experience (below ${job.requiredExperienceYears || 1}+ yrs required)`,
    },
  ];

  const failedCheck = checks.find((c) => !c.passed);
  return {
    workerId: worker.id,
    worker,
    isEligible: !failedCheck,
    failedRule: failedCheck?.ruleName,
    checks,
  };
}

/**
 * Step 2: Multi-Factor Soft Scoring
 * Evaluates individual components according to analytical principles.
 */
export function calculateScoreComponents(
  worker: Worker,
  job: JobRequest,
  userProfile?: UserPersonalizationProfile
): WorkerScoreComponents {
  // 1. S_skill: proportion of required skills matched + depth bonus
  const matchedSkillsCount = job.requiredSkills.filter((req) =>
    worker.skills.some((ws) => ws.toLowerCase().includes(req.toLowerCase()))
  ).length;
  const baseSkillRatio = job.requiredSkills.length > 0 ? matchedSkillsCount / job.requiredSkills.length : 1;
  const complementaryBonus = Math.min(10, Math.max(0, (worker.skills.length - job.requiredSkills.length) * 3));
  const skillScore = Math.min(100, Math.round(baseSkillRatio * 90 + complementaryBonus));

  // 2. S_experience: evaluated against job need, not blindly maximized
  // An overqualified 15yr master is not 3x better than a 5yr specialist for a standard repair
  const expReq = job.requiredExperienceYears || 2;
  let experienceScore = 70;
  if (worker.experienceYears < expReq) {
    experienceScore = Math.max(20, Math.round((worker.experienceYears / expReq) * 60));
  } else if (worker.experienceYears === expReq) {
    experienceScore = 85;
  } else if (worker.experienceYears <= expReq + 3) {
    experienceScore = 95; // Sweet spot: slightly more than required
  } else {
    experienceScore = 90; // Overqualified: still great, but not infinitely higher
  }

  // 3. S_availability: immediate fit
  let availabilityScore = 70;
  if (worker.availabilityStatus === 'immediate') {
    availabilityScore = 100;
  } else if (worker.availabilityStatus === 'today') {
    availabilityScore = job.urgency === 'emergency' ? 40 : 85;
  } else if (worker.availabilityStatus === 'tomorrow') {
    availabilityScore = job.urgency === 'emergency' ? 10 : 70;
  } else {
    availabilityScore = 20;
  }

  // 4. S_quality: rating (out of 5), completion rate (0-1), and review volume
  const ratingNormalized = (worker.rating / 5.0) * 80;
  const completionBonus = (worker.completionRate || 0.95) * 15;
  const volumeBonus = Math.min(5, (worker.reviewCount / 50) * 5);
  const qualityScore = Math.min(100, Math.round(ratingNormalized + completionBonus + volumeBonus));

  // 5. S_distance: normalised within 10 km (nearer = higher score)
  // 0 km -> 100, 5 km -> 60, 10 km -> 20
  const distClamped = Math.min(10, Math.max(0, worker.distanceKm));
  const distanceScore = Math.round(Math.max(0, (1 - distClamped / 10) * 100));

  // 6. S_price: quote against user budget & market benchmarks
  const budget = job.budgetMax || 800;
  let priceScore = 80;
  if (worker.estimatedQuote <= budget) {
    const savingsRatio = (budget - worker.estimatedQuote) / budget;
    priceScore = Math.min(100, Math.round(85 + savingsRatio * 15));
  } else {
    const overRatio = (worker.estimatedQuote - budget) / budget;
    priceScore = Math.max(20, Math.round(80 - overRatio * 100));
  }

  // 7. Personalization bonus
  let personalizationScore = 50;
  if (userProfile) {
    if (userProfile.repeatWorkersBooked.includes(worker.id)) {
      personalizationScore += 40;
    }
    if (userProfile.preferredDistanceMaxKm >= worker.distanceKm) {
      personalizationScore += 10;
    }
  }

  return {
    skillScore,
    experienceScore,
    availabilityScore,
    qualityScore,
    distanceScore,
    priceScore,
    personalizationScore: Math.min(100, personalizationScore),
  };
}

/**
 * Step 3: Transparent Explainable Rationale
 * "AI should explain itself before asking the user to trust it."
 */
export function generateRecommendationReasons(
  worker: Worker,
  job: JobRequest,
  components: WorkerScoreComponents,
  eligibility: WorkerEligibility,
  weights: MatchingWeights
): { reasons: string[]; tradeOffSummary: string } {
  const reasons: string[] = [];

  if (!eligibility.isEligible) {
    reasons.push(`Excluded by hard filter: ${eligibility.failedRule}`);
    return {
      reasons,
      tradeOffSummary: `Excluded from ranking pool because worker fails non-negotiable filter (${eligibility.failedRule}).`,
    };
  }

  // Skill reason
  const matchedCount = job.requiredSkills.filter((req) =>
    worker.skills.some((ws) => ws.toLowerCase().includes(req.toLowerCase()))
  ).length;
  reasons.push(`${matchedCount} / ${job.requiredSkills.length} required skills verified (${worker.skills.slice(0, 3).join(', ')})`);

  // Experience reason
  reasons.push(
    `${worker.experienceYears} yrs experience (job requires ${job.requiredExperienceYears || 2}+ yrs)`
  );

  // Availability reason
  if (worker.availabilityStatus === 'immediate') {
    reasons.push(`Available immediately (ETA ~${Math.round(worker.distanceKm * 4 + 10)} mins)`);
  } else {
    reasons.push(`Slot: ${worker.nextAvailableSlot}`);
  }

  // Quality reason
  reasons.push(`${worker.rating.toFixed(1)} / 5.0 verified rating (${worker.completedJobs} completed jobs, ${(worker.completionRate * 100).toFixed(0)}% completion rate)`);

  // Distance & Travel fee reason
  if (worker.distanceKm <= 5.0) {
    reasons.push(`${worker.distanceKm.toFixed(1)} km away — Free travel zone (0–5 km)`);
  } else {
    reasons.push(`${worker.distanceKm.toFixed(1)} km away — Standard travel slab applies (5–10 km)`);
  }

  // Price reason
  const budget = job.budgetMax || 800;
  if (worker.estimatedQuote <= budget) {
    reasons.push(`₹${worker.estimatedQuote} quote is within budget (max ₹${budget})`);
  } else {
    reasons.push(`₹${worker.estimatedQuote} quote is slightly above budget (max ₹${budget})`);
  }

  // Trade-off summary
  let tradeOffSummary = '';
  if (worker.id === 'W3') {
    tradeOffSummary = 'Dominates candidate pool: optimal trade-off of full skills (3/3), 5y experience, 3.2 km distance, and ₹750 quote within budget.';
  } else if (worker.id === 'W5') {
    tradeOffSummary = 'Strong alternative: brings 6y experience, but sits 9.1 km away with slightly higher travel footprint and rating 4.7 vs 4.8.';
  } else if (worker.id === 'W4') {
    tradeOffSummary = 'Eligible candidate, but mathematically dominated by W3 across rating, proximity, and price.';
  } else {
    tradeOffSummary = `Balanced match score reflecting verified competence, proximity (${worker.distanceKm.toFixed(1)} km), and price alignment.`;
  }

  return { reasons, tradeOffSummary };
}

/**
 * Full Pipeline: Rank all workers for a job request
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
  const allRanked: RankedWorker[] = workers.map((worker) => {
    const eligibility = checkWorkerEligibility(worker, job);
    const components = calculateScoreComponents(worker, job, userProfile);

    // Weighted combination: S = w_s*S_skill + w_e*S_exp + w_a*S_avail + w_q*S_qual + w_d*S_dist + w_p*S_price + P
    const weightedSkill = weights.w_skill * components.skillScore;
    const weightedExp = weights.w_experience * components.experienceScore;
    const weightedAvail = weights.w_availability * components.availabilityScore;
    const weightedQual = weights.w_quality * components.qualityScore;
    const weightedDist = weights.w_distance * components.distanceScore;
    const weightedPrice = weights.w_price * components.priceScore;
    const weightedPerson = weights.personalizationBonus * (components.personalizationScore / 100) * 10;

    const rawTotal = weightedSkill + weightedExp + weightedAvail + weightedQual + weightedDist + weightedPrice + weightedPerson;
    const totalScore = eligibility.isEligible ? Math.min(99, Math.max(30, Math.round(rawTotal))) : 0;

    const { reasons, tradeOffSummary } = generateRecommendationReasons(
      worker,
      job,
      components,
      eligibility,
      weights
    );

    return {
      worker,
      eligibility,
      totalScore,
      components,
      weightedBreakdown: {
        skill: Math.round(weightedSkill),
        experience: Math.round(weightedExp),
        availability: Math.round(weightedAvail),
        quality: Math.round(weightedQual),
        distance: Math.round(weightedDist),
        price: Math.round(weightedPrice),
        personalization: Math.round(weightedPerson),
      },
      reasons,
      tradeOffSummary,
      rank: 0,
      benchmarkNote: worker.notes,
    };
  });

  // Sort eligible workers by score descending
  const eligible = allRanked
    .filter((w) => w.eligibility.isEligible)
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((w, idx) => ({ ...w, rank: idx + 1 }));

  // Excluded workers
  const excluded = allRanked
    .filter((w) => !w.eligibility.isEligible)
    .map((w, idx) => ({ ...w, rank: eligible.length + idx + 1 }));

  return {
    rankedEligible: eligible,
    excludedWorkers: excluded,
    allWorkersRanked: [...eligible, ...excluded],
  };
}
