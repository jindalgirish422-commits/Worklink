import { Worker, JobRequest, UserPersonalizationProfile } from '../../types';

export interface ExtractedFeatures {
  skillScore: number;          // 0 - 100
  experienceScore: number;     // 0 - 100
  availabilityScore: number;   // 0 - 100
  qualityScore: number;        // 0 - 100
  distanceScore: number;       // 0 - 100
  priceScore: number;          // 0 - 100
  personalizationScore: number;// 0 - 100
  matchedSkillsCount: number;
  totalRequiredSkills: number;
  priceDelta: number;          // budget - estimatedQuote
  isRepeatWorker: boolean;
  isInFreeTravelZone: boolean;
}

/**
 * WORKLINK MATCHING ENGINE: STAGE 2 — FEATURE EXTRACTION
 *
 * Extracts normalized analytical features from worker profile, job context,
 * and user preferences. All component scores are calibrated on a 0 - 100 scale.
 */
export function extractMatchingFeatures(
  worker: Worker,
  job: JobRequest,
  userProfile?: UserPersonalizationProfile
): ExtractedFeatures {
  // 1. Skill Compatibility (0 - 100)
  const reqSkills = job.requiredSkills || [];
  const matchedSkills = reqSkills.filter((req) => {
    const reqLower = req.toLowerCase().trim();
    return worker.skills.some((ws) => {
      const wsLower = ws.toLowerCase().trim();
      return wsLower.includes(reqLower) || reqLower.includes(wsLower);
    });
  });

  const baseSkillRatio = reqSkills.length > 0 ? matchedSkills.length / reqSkills.length : 1.0;
  // Complementary trade depth bonus (up to 10 points)
  const complementaryBonus = Math.min(
    10,
    Math.max(0, (worker.skills.length - reqSkills.length) * 3)
  );
  const skillScore = Math.min(100, Math.round(baseSkillRatio * 90 + complementaryBonus));

  // 2. Experience Alignment (0 - 100)
  // Calibrated against job requirements rather than blindly prioritizing max years.
  // A standard domestic repair benefits from 3-7 yrs; a 15-year master is slightly discounted to avoid cost/scope mismatch.
  const expReq = job.requiredExperienceYears || 2;
  let experienceScore = 70;
  if (worker.experienceYears < expReq) {
    experienceScore = Math.max(20, Math.round((worker.experienceYears / expReq) * 60));
  } else if (worker.experienceYears === expReq) {
    experienceScore = 85;
  } else if (worker.experienceYears <= expReq + 3) {
    experienceScore = 95; // Sweet spot: calibrated expertise
  } else {
    experienceScore = 90; // Overqualified: high mastery, slightly lower efficiency score
  }

  // 3. Availability Score (0 - 100)
  let availabilityScore = 70;
  const customerWantsTomorrow =
    (job.requestedDate && job.requestedDate.toLowerCase().includes('tomorrow')) ||
    (job.requestedTime && job.requestedTime.toLowerCase().includes('tomorrow'));

  if (worker.availabilityStatus === 'immediate') {
    availabilityScore = 100;
  } else if (worker.availabilityStatus === 'today') {
    availabilityScore = job.urgency === 'emergency' ? 40 : 90;
  } else if (worker.availabilityStatus === 'tomorrow') {
    if (job.urgency === 'emergency') {
      availabilityScore = 10;
    } else if (customerWantsTomorrow) {
      availabilityScore = 95; // Exact slot match for requested tomorrow schedule
    } else {
      availabilityScore = 75;
    }
  } else {
    availabilityScore = 20;
  }

  // 4. Quality & Reputation (0 - 100)
  // Bayesian normalized rating (0-5 -> 0-80), completion rate bonus (0-15), review volume (0-5)
  const ratingNormalized = (worker.rating / 5.0) * 80;
  const completionBonus = (worker.completionRate || 0.95) * 15;
  const volumeBonus = Math.min(5, (worker.reviewCount / 50) * 5);
  const qualityScore = Math.min(100, Math.round(ratingNormalized + completionBonus + volumeBonus));

  // 5. Distance & Proximity Score (0 - 100)
  // 0 km -> 100, 5 km -> 60, 10 km -> 20, >10 km -> 0
  const distClamped = Math.min(10, Math.max(0, worker.distanceKm));
  const distanceScore = Math.round(Math.max(0, (1 - distClamped / 10) * 100));

  // 6. Price Alignment Score (0 - 100)
  const budget = job.budgetMax || job.budget || 800;
  let priceScore = 80;
  const priceDelta = budget - worker.estimatedQuote;
  if (worker.estimatedQuote <= budget) {
    const savingsRatio = priceDelta / budget;
    priceScore = Math.min(100, Math.round(85 + savingsRatio * 15));
  } else {
    const overRatio = (worker.estimatedQuote - budget) / budget;
    priceScore = Math.max(20, Math.round(80 - overRatio * 100));
  }

  // 7. Personalization & Customer Preferences (0 - 100)
  let personalizationScore = 50;
  const isRepeatWorker = Boolean(
    userProfile && userProfile.repeatWorkersBooked?.includes(worker.id)
  );
  if (userProfile) {
    if (isRepeatWorker) {
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
    matchedSkillsCount: matchedSkills.length,
    totalRequiredSkills: reqSkills.length,
    priceDelta,
    isRepeatWorker,
    isInFreeTravelZone: worker.distanceKm <= 5.0,
  };
}
