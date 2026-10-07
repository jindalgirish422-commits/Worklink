import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  History,
  Sliders,
  Award,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Info,
  Check,
} from 'lucide-react';
import {
  Worker,
  UserPersonalizationProfile,
  JobRequest,
  RankedWorker,
} from '../../types';
import {
  getPersonalizedBuckets,
  PersonalizationMatch,
} from '../../services/personalizationService';
import { getTravelBand } from '../../services/locationService';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface PersonalizedRecommendationsSectionProps {
  workers: Worker[];
  userProfile: UserPersonalizationProfile;
  activeJob?: JobRequest;
  onBookClick: (worker: RankedWorker) => void;
  onViewProfileClick: (worker: RankedWorker) => void;
}

type TabType = 'recommended' | 'previous_booking' | 'preferences' | 'highly_rated';

export const PersonalizedRecommendationsSection: React.FC<PersonalizedRecommendationsSectionProps> = ({
  workers,
  userProfile,
  activeJob,
  onBookClick,
  onViewProfileClick,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('recommended');

  const buckets = useMemo(
    () => getPersonalizedBuckets(workers, userProfile, activeJob),
    [workers, userProfile, activeJob]
  );

  // Helper to convert PersonalizationMatch to RankedWorker for booking modal
  const toRankedWorker = (match: PersonalizationMatch, rank: number): RankedWorker => {
    return {
      worker: match.worker,
      rank,
      totalScore: match.affinityScore,
      eligibility: {
        workerId: match.worker.id,
        worker: match.worker,
        isEligible: true,
        checks: [],
      },
      components: {
        skillScore: 90,
        experienceScore: Math.min(100, match.worker.experienceYears * 10),
        availabilityScore: match.worker.availabilityStatus === 'immediate' ? 100 : 85,
        qualityScore: Math.round(match.worker.rating * 20),
        distanceScore: Math.round(Math.max(0, (1 - match.worker.distanceKm / 10) * 100)),
        priceScore: 85,
        personalizationScore: match.affinityScore,
      },
      weightedBreakdown: {
        skill: 25,
        experience: 18,
        availability: 20,
        quality: 16,
        distance: 10,
        price: 8,
        personalization: Math.round(match.affinityScore * 0.1),
      },
      reasons: match.reasons,
      tradeOffSummary: match.reasons.join(' • '),
    };
  };

  return (
    <section className="mt-10 pt-8 border-t border-black/8 space-y-6">
      {/* ============================================================== */}
      {/* 1. SECTION HEADER: Subtle Glass Accent Pill                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {/* Subtle glass accent tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-black/8 shadow-2xs glass-specular-edge mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span className="text-[11px] font-semibold text-[#111111] tracking-wide">
              Personalized for You
            </span>
            <span className="w-1 h-1 rounded-full bg-[#0071E3]" />
            <span className="text-[10px] text-[#86868B] font-mono">
              Deterministic Preference Prior
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
            Tailored to your history and preferences
          </h3>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            Clear, helpful suggestions based on your past bookings, ratings, and vicinity preference.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="text-[11px] text-[#86868B] flex items-center space-x-1.5 self-start sm:self-auto bg-black/4 px-2.5 py-1 rounded-xl">
          <Info className="w-3.5 h-3.5 shrink-0 text-[#86868B]" />
          <span>Non-intrusive rule matching (No black-box ML)</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECTION TABS: Apple-Grade Horizontal Nav                     */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('recommended')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'recommended'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5 hover:border-black/15'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
          <span>Recommended for you</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {buckets.recommendedForYou.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('previous_booking')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'previous_booking'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5 hover:border-black/15'
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Based on your previous booking</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {buckets.basedOnPreviousBooking.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'preferences'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5 hover:border-black/15'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-[#FF9500]" />
          <span>Matches your preferences</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {buckets.matchesPreferences.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('highly_rated')}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
            activeTab === 'highly_rated'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5 hover:border-black/15'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#AF52DE]" />
          <span>Highly rated for this service</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10">
            {buckets.highlyRatedForService.length}
          </span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. CARD PRESENTATION: Clean, Non-Transparent Flatter Surfaces   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* TAB 1: Recommended for you */}
        {activeTab === 'recommended' &&
          buckets.recommendedForYou.map((match, idx) => (
            <PersonalizedCard
              key={match.worker.id}
              match={match}
              rank={idx + 1}
              badgeLabel={match.matchedSignals.isRepeatWorker ? 'Repeat Trusted Pro' : 'Top Affinity'}
              badgeVariant={match.matchedSignals.isRepeatWorker ? 'success' : 'neutral'}
              onBookClick={() => onBookClick(toRankedWorker(match, idx + 1))}
              onViewProfileClick={() => onViewProfileClick(toRankedWorker(match, idx + 1))}
            />
          ))}

        {/* TAB 2: Based on your previous booking */}
        {activeTab === 'previous_booking' &&
          buckets.basedOnPreviousBooking.map(({ match, contextText }, idx) => (
            <PersonalizedCard
              key={match.worker.id}
              match={match}
              rank={idx + 1}
              contextText={contextText}
              badgeLabel="Past Service Continuity"
              badgeVariant="success"
              onBookClick={() => onBookClick(toRankedWorker(match, idx + 1))}
              onViewProfileClick={() => onViewProfileClick(toRankedWorker(match, idx + 1))}
            />
          ))}

        {/* TAB 3: Matches your preferences */}
        {activeTab === 'preferences' &&
          buckets.matchesPreferences.map((match, idx) => (
            <PersonalizedCard
              key={match.worker.id}
              match={match}
              rank={idx + 1}
              badgeLabel="Proximity & Budget Match"
              badgeVariant="primary"
              onBookClick={() => onBookClick(toRankedWorker(match, idx + 1))}
              onViewProfileClick={() => onViewProfileClick(toRankedWorker(match, idx + 1))}
            />
          ))}

        {/* TAB 4: Highly rated for this service */}
        {activeTab === 'highly_rated' &&
          buckets.highlyRatedForService.map((match, idx) => (
            <PersonalizedCard
              key={match.worker.id}
              match={match}
              rank={idx + 1}
              badgeLabel="Elite 4.8+ ★ Quality"
              badgeVariant="accent"
              onBookClick={() => onBookClick(toRankedWorker(match, idx + 1))}
              onViewProfileClick={() => onViewProfileClick(toRankedWorker(match, idx + 1))}
            />
          ))}
      </div>
    </section>
  );
};

// ==============================================================
// PERSONALIZED CARD COMPONENT (Solid white surface, clear privacy reasons)
// ==============================================================
interface PersonalizedCardProps {
  match: PersonalizationMatch;
  rank: number;
  badgeLabel: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'neutral' | 'accent';
  contextText?: string;
  onBookClick: () => void;
  onViewProfileClick: () => void;
}

const PersonalizedCard: React.FC<PersonalizedCardProps> = ({
  match,
  badgeLabel,
  badgeVariant = 'neutral',
  contextText,
  onBookClick,
  onViewProfileClick,
}) => {
  const { worker, affinityScore, reasons } = match;
  const travelBand = getTravelBand(worker.distanceKm);

  return (
    <div className="bg-white border border-black/8 hover:border-black/18 rounded-2xl p-5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all duration-200">
      <div>
        {/* Top Badges & Context */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 gap-2">
          <Badge variant={badgeVariant} size="sm">
            {badgeLabel}
          </Badge>
          <span className="text-[11px] font-mono text-[#0071E3] font-bold">
            {affinityScore}% Affinity
          </span>
        </div>

        {/* Context subtitle if based on previous booking */}
        {contextText && (
          <p className="text-[11px] font-semibold text-[#0071E3] mt-2 mb-1">
            {contextText}
          </p>
        )}

        {/* Worker Details */}
        <div className="flex items-start space-x-3 mt-3">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="md"
            isVerified={worker.isVerified}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-[#111111] truncate tracking-tight">
              {worker.name}
            </h4>
            <p className="text-xs text-[#6E6E73] truncate">
              {worker.trade} • {worker.experienceYears}y Experience
            </p>

            <div className="flex items-center gap-2 mt-1 text-xs text-[#6E6E73]">
              <span className="flex items-center font-bold text-[#111111]">
                <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                {worker.rating.toFixed(1)}
              </span>
              <span className="text-[#86868B]">•</span>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 text-[#86868B] mr-0.5" />
                <span>{worker.distanceKm.toFixed(1)} km</span>
                {travelBand.band === 'core_free' && (
                  <span className="ml-1 text-[10px] text-[#34C759] font-medium">(Free)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Non-intrusive, helpful reasons list */}
        <div className="mt-3.5 pt-3 border-t border-black/5 space-y-1.5 text-xs text-[#111111]">
          {reasons.slice(0, 2).map((reason, i) => (
            <div key={i} className="flex items-start space-x-1.5 leading-snug">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] mt-1.5 shrink-0" />
              <span className="text-[#6E6E73]">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Quote & Action */}
      <div className="pt-3.5 mt-3.5 border-t border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#86868B] font-mono block">ESTIMATE</span>
          <span className="text-sm font-bold text-[#111111]">₹{worker.estimatedQuote}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onViewProfileClick}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7] transition-all"
          >
            Profile
          </button>
          <button
            onClick={onBookClick}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-black transition-all shadow-2xs"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};
