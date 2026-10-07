import {
  Worker,
  JobRequest,
  WorkerEligibility,
  MatchingWeights,
  StructuredExplanation,
} from '../../types';
import { ExtractedFeatures } from './features';
import { ComputedScore } from './scoring';

/**
 * WORKLINK MATCHING ENGINE: STAGE 4 — STRUCTURED EXPLANATION
 *
 * Generates transparent, human-readable rationale data explaining
 * exactly why a professional was matched and recommended.
 * Matches the WorkLink specification format:
 * - Strong [Trade] experience
 * - Available [Timeframe]
 * - [X.X] customer rating
 * - [X.X] km away
 * - Within expected price / budget
 */
export function buildStructuredExplanation(
  worker: Worker,
  job: JobRequest,
  features: ExtractedFeatures,
  score: ComputedScore,
  eligibility: WorkerEligibility,
  weights: MatchingWeights
): StructuredExplanation {
  // If ineligible, provide explicit hard filter failure explanation
  if (!eligibility.isEligible) {
    const failureReason = `Excluded by hard constraint: ${eligibility.failedRule}`;
    return {
      matchScore: 0,
      reasons: [failureReason],
      tradeOffSummary: `Excluded from ranking pool because candidate fails non-negotiable hard rule: ${eligibility.failedRule}.`,
      factorHighlights: {
        skill: `Ineligible: ${eligibility.failedRule}`,
        experience: `${worker.experienceYears} yrs experience`,
        availability: `Status: ${worker.availabilityStatus}`,
        quality: `${worker.rating.toFixed(1)} rating`,
        distance: `${worker.distanceKm.toFixed(1)} km away`,
        price: `Quote: ₹${worker.estimatedQuote}`,
      },
    };
  }

  const reasons: string[] = [];

  // 1. Skill & Experience Reason (e.g. "Strong AC repair experience")
  const tradeDesc = worker.trade.replace('Technician', '').replace('Professional', '').trim();
  if (worker.experienceYears >= 5) {
    reasons.push(`Strong ${tradeDesc} experience (${worker.experienceYears} yrs in trade)`);
  } else {
    reasons.push(`Verified ${tradeDesc} competence (${worker.experienceYears} yrs experience)`);
  }

  // 2. Availability Reason (e.g. "Available tomorrow morning")
  if (worker.availabilityStatus === 'immediate') {
    reasons.push(`Available immediately (ETA ~${Math.round(worker.distanceKm * 4 + 10)} mins)`);
  } else if (worker.availabilityStatus === 'today') {
    reasons.push(`Available today (${worker.nextAvailableSlot || 'afternoon slot'})`);
  } else if (worker.availabilityStatus === 'tomorrow') {
    reasons.push(`Available tomorrow morning (${worker.nextAvailableSlot || 'morning slot'})`);
  } else {
    reasons.push(`Next slot: ${worker.nextAvailableSlot || 'scheduled appointment'}`);
  }

  // 3. Quality & Rating Reason (e.g. "4.8 customer rating")
  reasons.push(
    `${worker.rating.toFixed(1)} customer rating (${worker.reviewCount || worker.completedJobs} verified reviews, ${Math.round((worker.completionRate || 0.98) * 100)}% completion)`
  );

  // 4. Distance Reason (e.g. "3.2 km away")
  if (worker.distanceKm <= 5.0) {
    reasons.push(`${worker.distanceKm.toFixed(1)} km away (Free travel core zone)`);
  } else {
    reasons.push(`${worker.distanceKm.toFixed(1)} km away (Service zone with standard travel tariff)`);
  }

  // 5. Price Reason (e.g. "Within expected price")
  const budget = job.budgetMax || job.budget || 800;
  if (worker.estimatedQuote <= budget) {
    reasons.push(`Within expected price (₹${worker.estimatedQuote} quote within ₹${budget} budget)`);
  } else {
    reasons.push(`Quote ₹${worker.estimatedQuote} slightly above ₹${budget} budget`);
  }

  // 6. Optional Personalization Reason
  if (features.isRepeatWorker) {
    reasons.push(`Previously booked and trusted by customer`);
  }

  // Factor highlights for fine-grained UI cards
  const factorHighlights = {
    skill: `${features.matchedSkillsCount}/${features.totalRequiredSkills || 'all'} skills verified (${worker.skills.slice(0, 3).join(', ')})`,
    experience: `${worker.experienceYears} years active trade practice`,
    availability: worker.availabilityStatus === 'immediate' ? 'Immediate arrival' : worker.nextAvailableSlot || 'Scheduled',
    quality: `${worker.rating.toFixed(1)} ★ (${worker.completedJobs} jobs completed)`,
    distance: `${worker.distanceKm.toFixed(1)} km (${worker.distanceKm <= 5.0 ? '₹0 Free Travel' : 'Extended Zone'})`,
    price: `₹${worker.estimatedQuote} estimated quote (₹${worker.hourlyRate}/hr base)`,
    personalization: features.isRepeatWorker ? 'Repeat provider bonus applied' : undefined,
  };

  // Trade-off summary
  let tradeOffSummary = '';
  if (score.totalScore >= 90) {
    tradeOffSummary = `Dominant candidate: optimal trade-off of verified skills, ${worker.experienceYears}y experience, ${worker.distanceKm.toFixed(1)} km proximity, and price alignment.`;
  } else if (score.totalScore >= 75) {
    tradeOffSummary = `Strong viable candidate: balanced metrics with slight trade-off in proximity (${worker.distanceKm.toFixed(1)} km) or availability window.`;
  } else {
    tradeOffSummary = `Eligible candidate meeting non-negotiable requirements with lower relative rating or budget alignment.`;
  }

  return {
    matchScore: score.totalScore,
    reasons,
    tradeOffSummary,
    factorHighlights,
  };
}
