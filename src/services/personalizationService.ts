import {
  Worker,
  UserPersonalizationProfile,
  JobRequest,
  TradeCategory,
} from '../types';

export interface PersonalizationMatch {
  worker: Worker;
  affinityScore: number; // 0 - 100
  reasons: string[];
  matchedSignals: {
    isRepeatWorker: boolean;
    isPastTradeMatch: boolean;
    isDistancePreferred: boolean;
    isPricePreferred: boolean;
    isTimeSlotPreferred: boolean;
    hasCancellationHistory: boolean;
    isHighRatingMatch: boolean;
    isSearchMatch?: boolean;
  };
}

export interface PersonalizedBuckets {
  recommendedForYou: PersonalizationMatch[];
  basedOnPreviousBooking: {
    match: PersonalizationMatch;
    contextText: string;
  }[];
  matchesPreferences: PersonalizationMatch[];
  highlyRatedForService: PersonalizationMatch[];
  isDeterministicDemo: boolean;
  engineDisclaimer: string;
}

/**
 * WORKLINK PERSONALIZATION SERVICE
 *
 * Evaluates candidate workers against non-intrusive customer signals:
 * - previous searches
 * - previous bookings
 * - ratings given
 * - cancellation history
 * - preferred services/trades
 * - preferred distance (e.g. <= 5 km free core zone)
 * - preferred budget/price tier
 * - preferred time slot (e.g. morning)
 * - repeat workers
 *
 * PROTOTYPE RULE:
 * This uses deterministic rule-based prioritization. We explicitly do not claim
 * black-box production machine learning for this prototype.
 */
export function evaluateWorkerPersonalization(
  worker: Worker,
  profile: UserPersonalizationProfile,
  job?: JobRequest
): PersonalizationMatch {
  let score = 50; // Neutral baseline
  const reasons: string[] = [];

  // 1. Repeat Worker Signal (strongest positive signal)
  const isRepeatWorker = Boolean(
    profile.repeatWorkersBooked?.includes(worker.id) ||
    profile.previousBookings?.some((b) => b.workerId === worker.id)
  );
  if (isRepeatWorker) {
    score += 35;
    reasons.push('You previously booked and trusted this professional');
  }

  // 2. Previous Bookings & Trade Continuity Signal
  const pastBooking = profile.previousBookings?.find((b) => b.trade === worker.trade);
  const isPastTradeMatch = Boolean(pastBooking || profile.frequentlyUsedTrades?.includes(worker.trade));
  if (isPastTradeMatch && !isRepeatWorker) {
    score += 15;
    if (pastBooking) {
      reasons.push(`Based on your previous booking for ${pastBooking.serviceName}`);
    } else {
      reasons.push(`Aligned with your frequently requested trade (${worker.trade})`);
    }
  }

  // 3. Distance Preference Signal
  const maxPreferredDist = profile.preferredDistanceMaxKm || 5.0;
  const isDistancePreferred = worker.distanceKm <= maxPreferredDist;
  if (isDistancePreferred) {
    score += 10;
    reasons.push(`Within your preferred ${maxPreferredDist} km vicinity (${worker.distanceKm.toFixed(1)} km away)`);
  } else if (worker.distanceKm > 8.0) {
    score -= 10;
  }

  // 4. Budget & Price Preference Signal
  const budgetCeiling = profile.preferredMaxBudget || (job?.budgetMax || job?.budget || 800);
  const isPricePreferred = worker.estimatedQuote <= budgetCeiling;
  if (isPricePreferred) {
    score += 10;
    reasons.push(`Within your expected budget range (₹${worker.estimatedQuote} vs ₹${budgetCeiling})`);
  } else {
    score -= 10;
  }

  // 5. Preferred Time Slot Signal
  const preferredTime = profile.preferredTimeSlot?.toLowerCase() || 'morning';
  const workerSlot = (worker.nextAvailableSlot || worker.availabilityStatus).toLowerCase();
  const isTimeSlotPreferred = workerSlot.includes(preferredTime) || worker.availabilityStatus === 'immediate';
  if (isTimeSlotPreferred) {
    score += 8;
    reasons.push(`Fits your preferred ${preferredTime} timeframe`);
  }

  // 6. Rating & Quality Signal
  const isHighRatingMatch = worker.rating >= (profile.avgRatingGiven || 4.7);
  if (isHighRatingMatch) {
    score += 10;
    reasons.push(`Highly rated (${worker.rating.toFixed(1)} ★) matching your quality standard`);
  }

  // 7. Cancellation History Guard (helpful safety signal)
  const isCancelledWorker = Boolean(profile.cancelledWorkerIds?.includes(worker.id));
  if (isCancelledWorker) {
    score -= 40;
  }

  // 8. Previous Searches Signal
  const isSearchMatch = Boolean(
    profile.previousSearches?.some((query) => {
      const qLower = query.toLowerCase().trim();
      return (
        worker.trade.toLowerCase().includes(qLower) ||
        worker.skills.some((s) => s.toLowerCase().includes(qLower))
      );
    })
  );
  if (isSearchMatch) {
    score += 5;
    reasons.push('Matches topics from your recent searches');
  }

  // Bound score between 10 and 99
  const boundedScore = Math.min(99, Math.max(10, Math.round(score)));

  return {
    worker,
    affinityScore: boundedScore,
    reasons,
    matchedSignals: {
      isRepeatWorker,
      isPastTradeMatch,
      isDistancePreferred,
      isPricePreferred,
      isTimeSlotPreferred,
      hasCancellationHistory: isCancelledWorker,
      isHighRatingMatch,
      isSearchMatch,
    },
  };
}

/**
 * Organizes workers into clear, helpful, non-intrusive UI sections:
 * - "Recommended for you"
 * - "Based on your previous booking"
 * - "Matches your preferences"
 * - "Highly rated for this service"
 */
export function getPersonalizedBuckets(
  workers: Worker[],
  profile: UserPersonalizationProfile,
  activeJob?: JobRequest
): PersonalizedBuckets {
  // Filter only verified and zone-eligible workers first
  const eligibleBase = workers.filter(
    (w) => w.isVerified && w.distanceKm <= 10.0
  );

  const evaluated = eligibleBase.map((w) =>
    evaluateWorkerPersonalization(w, profile, activeJob)
  );

  // 1. "Recommended for you": Top overall affinity
  const recommendedForYou = [...evaluated]
    .sort((a, b) => b.affinityScore - a.affinityScore)
    .slice(0, 3);

  // 2. "Based on your previous booking": Matches previous trades or repeat workers
  const basedOnPreviousBooking = evaluated
    .filter(
      (m) =>
        m.matchedSignals.isRepeatWorker ||
        m.matchedSignals.isPastTradeMatch
    )
    .sort((a, b) => b.affinityScore - a.affinityScore)
    .slice(0, 3)
    .map((match) => {
      const pastBooking = profile.previousBookings?.find(
        (b) => b.workerId === match.worker.id || b.trade === match.worker.trade
      );
      const contextText = pastBooking
        ? `Based on your ${pastBooking.completedAt ? new Date(pastBooking.completedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'past'} booking for ${pastBooking.serviceName}`
        : `Based on your previous use of ${match.worker.trade} services`;
      return { match, contextText };
    });

  // 3. "Matches your preferences": Perfect distance + budget + preferred time fit
  const matchesPreferences = evaluated
    .filter(
      (m) =>
        m.matchedSignals.isDistancePreferred &&
        m.matchedSignals.isPricePreferred
    )
    .sort((a, b) => a.worker.distanceKm - b.worker.distanceKm)
    .slice(0, 3);

  // 4. "Highly rated for this service": 4.8+ rating in requested/frequent service
  const targetTrade = activeJob?.serviceCategory || profile.frequentlyUsedTrades[0] || 'AC Technician';
  const highlyRatedForService = evaluated
    .filter((m) => m.worker.trade === targetTrade && m.worker.rating >= 4.8)
    .sort((a, b) => b.worker.rating - a.worker.rating)
    .slice(0, 3);

  return {
    recommendedForYou,
    basedOnPreviousBooking,
    matchesPreferences,
    highlyRatedForService,
    isDeterministicDemo: true,
    engineDisclaimer:
      'Deterministic preference matching based on past bookings and declared preferences. Production ML is not used.',
  };
}
