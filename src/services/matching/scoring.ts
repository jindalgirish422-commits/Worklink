import { MatchingWeights, WorkerScoreComponents } from '../../types';
import { ExtractedFeatures } from './features';

/**
 * CONFIGURABLE WEIGHT PRESETS
 *
 * NOTE: As required by WorkLink engineering guidelines, these presets are documented
 * as heuristic operational priors and scenario configurations. We do not claim
 * scientifically validated weights unless empirical statistical validation has taken place.
 */
export const OPERATIONAL_WEIGHT_PRESETS: MatchingWeights[] = [
  {
    id: 'calibrated_prior',
    name: 'Standard Operational Prior (Emergency Default)',
    description: 'Heuristic prior calibrated for urgent domestic repairs where skill and immediate availability dominate.',
    w_skill: 0.28,
    w_experience: 0.18,
    w_availability: 0.20,
    w_quality: 0.16,
    w_distance: 0.10,
    w_price: 0.08,
    personalizationBonus: 0.05,
    source: 'heuristic_operational_prior',
    validationNote: 'Operational baseline heuristic. Weights subject to ongoing A/B calibration.',
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
    validationNote: 'Subjective business priority preset for discerning customers.',
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
    validationNote: 'Operational preset tuning matching towards affordable local providers.',
  },
  {
    id: 'learned_transactions',
    name: 'Transaction Telemetry Prior (Post-Pilot)',
    description: 'Model calibrated against initial completed jobs, customer repeat bookings, and cancellation telemetry.',
    w_skill: 0.26,
    w_experience: 0.19,
    w_availability: 0.21,
    w_quality: 0.18,
    w_distance: 0.08,
    w_price: 0.08,
    personalizationBonus: 0.08,
    source: 'learned_from_transactions',
    validationNote: 'Derived from telemetry pilot datasets; ongoing statistical cross-validation in progress.',
  },
];

export interface ComputedScore {
  totalScore: number;
  components: WorkerScoreComponents;
  weightedBreakdown: {
    skill: number;
    experience: number;
    availability: number;
    quality: number;
    distance: number;
    price: number;
    personalization: number;
  };
}

/**
 * WORKLINK MATCHING ENGINE: STAGE 3 — SCORING
 *
 * Computes composite match score using configurable weights:
 * Match Score = Skill + Experience + Availability + Quality + Distance + Price + Personalization
 */
export function calculateWorkerScore(
  features: ExtractedFeatures,
  weights: MatchingWeights = OPERATIONAL_WEIGHT_PRESETS[0],
  isEligible: boolean = true
): ComputedScore {
  const components: WorkerScoreComponents = {
    skillScore: features.skillScore,
    experienceScore: features.experienceScore,
    availabilityScore: features.availabilityScore,
    qualityScore: features.qualityScore,
    distanceScore: features.distanceScore,
    priceScore: features.priceScore,
    personalizationScore: features.personalizationScore,
  };

  if (!isEligible) {
    return {
      totalScore: 0,
      components,
      weightedBreakdown: {
        skill: 0,
        experience: 0,
        availability: 0,
        quality: 0,
        distance: 0,
        price: 0,
        personalization: 0,
      },
    };
  }

  // Linear combination of weighted components
  const weightedSkill = weights.w_skill * features.skillScore;
  const weightedExp = weights.w_experience * features.experienceScore;
  const weightedAvail = weights.w_availability * features.availabilityScore;
  const weightedQual = weights.w_quality * features.qualityScore;
  const weightedDist = weights.w_distance * features.distanceScore;
  const weightedPrice = weights.w_price * features.priceScore;
  const weightedPerson = weights.personalizationBonus * (features.personalizationScore / 100) * 10;

  const rawTotal =
    weightedSkill +
    weightedExp +
    weightedAvail +
    weightedQual +
    weightedDist +
    weightedPrice +
    weightedPerson;

  // Normalized score range: 30 to 99 for eligible workers (99 ceiling to avoid claiming absolute 100% perfection)
  const totalScore = Math.min(99, Math.max(30, Math.round(rawTotal)));

  return {
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
  };
}
