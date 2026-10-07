import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Check,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../../types';
import { getTravelBand } from '../../services/locationService';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ResponsibleAiBanner } from '../trust/ResponsibleAiBanner';
import { ResponsibleAiTrustModal } from '../trust/ResponsibleAiTrustModal';

export interface SignatureRecommendationViewProps {
  rankedEligible: RankedWorker[];
  activeJob: JobRequest;
  onBookClick: (worker: RankedWorker) => void;
  onViewProfileClick: (worker: RankedWorker) => void;
  onOpenTrustModal?: (worker?: RankedWorker) => void;
  onChangeRequirements?: () => void;
  onChangePreferences?: () => void;
  onViewAlternatives?: () => void;
  onOverrideRecommendation?: (alternativeWorker: RankedWorker) => void;
}

export const SignatureRecommendationView: React.FC<SignatureRecommendationViewProps> = ({
  rankedEligible,
  activeJob,
  onBookClick,
  onViewProfileClick,
  onOpenTrustModal,
  onChangeRequirements,
  onChangePreferences,
  onViewAlternatives,
  onOverrideRecommendation,
}) => {
  const [expandedWorkerId, setExpandedWorkerId] = useState<string | null>(null);
  const [isInternalTrustOpen, setIsInternalTrustOpen] = useState(false);
  const alternativesRef = useRef<HTMLDivElement>(null);

  if (rankedEligible.length === 0) {
    return null;
  }

  const primaryMatch = rankedEligible[0];
  const secondaryMatches = rankedEligible.slice(1);
  const primaryFirstName = primaryMatch.worker.name.split(' ')[0];
  const primaryTravelBand = getTravelBand(primaryMatch.worker.distanceKm);

  // Normalize structured reasons for the prominent "Why [FirstName]?" section
  const primaryReasons = primaryMatch.reasons && primaryMatch.reasons.length >= 3
    ? primaryMatch.reasons
    : [
        `Strong ${primaryMatch.worker.trade} experience (${primaryMatch.worker.experienceYears} yrs in trade)`,
        primaryMatch.worker.availabilityStatus === 'immediate'
          ? 'Available immediately (<45m arrival)'
          : primaryMatch.worker.availabilityStatus === 'tomorrow'
          ? 'Available tomorrow morning'
          : `Available today (${primaryMatch.worker.nextAvailableSlot || 'confirmed slot'})`,
        `${primaryMatch.worker.rating.toFixed(1)} customer rating (${primaryMatch.worker.reviewCount || 100}+ reviews)`,
        `${primaryMatch.worker.distanceKm.toFixed(1)} km away (${primaryTravelBand.band === 'core_free' ? 'Free travel core zone' : 'Standard travel slab'})`,
        `Within expected price range (₹${primaryMatch.worker.estimatedQuote} quote)`,
      ];

  return (
    <section className="space-y-8 animate-fade-in transition-all duration-300">
      {/* ============================================================== */}
      {/* 1. OPENING: Large Typography & Calibrated Reassurance           */}
      {/* ============================================================== */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-[#0071E3] flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>AI MATCHING ENGINE • ANALYSIS COMPLETE</span>
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight">
          Best matches for your job.
        </h2>

        <p className="text-sm sm:text-base text-[#6E6E73] max-w-2xl leading-relaxed">
          WorkLink found these professionals based on your requirements.
        </p>

        {/* Subconscious Reassurance: WorkLink did the hard comparison */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-black/4 border border-black/5 text-xs text-[#6E6E73] mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>
            Evaluated against 5 non-negotiable hard constraints across South Delhi&apos;s 10 km zone.
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. PRIMARY MATCH: Mobile-Calibrated Glass Recommendation Surface */}
      {/* ============================================================== */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-white/95 sm:bg-white/85 backdrop-blur-md sm:backdrop-blur-2xl border border-black/8 sm:border-white/80 shadow-md sm:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.12)] glass-specular-edge p-4 sm:p-8 lg:p-9 transition-all duration-300 hover:shadow-[0_24px_56px_-8px_rgba(0,0,0,0.15)] motion-glass-appear hover-lift">
        {/* Subtle Top Indicator Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-black/6">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-[#111111] text-white text-xs font-semibold tracking-wide flex items-center space-x-1.5 shadow-2xs">
              <Sparkles className="w-3 h-3 text-[#0071E3]" />
              <span>Top Recommendation</span>
            </span>
            {primaryMatch.worker.isVerified && (
              <span className="px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-xs font-semibold flex items-center space-x-1 border border-[#34C759]/20">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Pro</span>
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-[#86868B] tracking-tight">
            Rank #1 of {rankedEligible.length} Verified Candidates
          </span>
        </div>

        {/* Primary Header Grid: Profile, Key Metrics & Typographic Match Score */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          {/* Worker Avatar & Primary Identity */}
          <div className="flex items-start space-x-4 sm:space-x-5">
            <Avatar
              src={primaryMatch.worker.avatar}
              alt={primaryMatch.worker.name}
              size="xl"
              isVerified={primaryMatch.worker.isVerified}
            />

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  {primaryMatch.worker.name}
                </h3>
                <span className="text-xs text-[#86868B] font-mono">({primaryMatch.worker.id})</span>
              </div>

              {/* Profession & Experience */}
              <p className="text-sm font-semibold text-[#0071E3]">
                {primaryMatch.worker.trade} • {primaryMatch.worker.experienceYears} Years Trade Experience
              </p>

              {/* Core Vital Tags */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#6E6E73]">
                <span className="flex items-center font-bold text-[#111111]">
                  <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                  {primaryMatch.worker.rating.toFixed(1)}
                  <span className="text-[#86868B] font-normal ml-1">
                    ({primaryMatch.worker.reviewCount || primaryMatch.worker.completedJobs} reviews)
                  </span>
                </span>

                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#86868B] mr-1" />
                  <span className="font-semibold text-[#111111] mr-1">
                    {primaryMatch.worker.distanceKm.toFixed(1)} km away
                  </span>
                  <span className="text-[11px] text-[#34C759] font-medium">
                    {primaryTravelBand.band === 'core_free' ? '• Free Core Zone' : `• +₹${primaryTravelBand.travelCharge} Travel`}
                  </span>
                </span>

                <span className="flex items-center text-[#111111]">
                  <Clock className="w-3.5 h-3.5 text-[#34C759] mr-1" />
                  <span className="capitalize font-medium">
                    {primaryMatch.worker.availabilityStatus === 'immediate'
                      ? 'Available Immediately'
                      : primaryMatch.worker.nextAvailableSlot || primaryMatch.worker.availabilityStatus}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Typographic Match Score & Estimated Price */}
          {/* Note: Pure typographic presentation. Calm, confident typography. */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-black/6">
            <div className="text-left md:text-right">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111] leading-none block">
                {primaryMatch.totalScore}%
              </span>
              <span className="text-xs uppercase font-bold tracking-widest text-[#0071E3] block mt-1">
                Match
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-mono text-[#86868B] uppercase block">
                Estimated Price
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#111111]">
                ₹{primaryMatch.worker.estimatedQuote}
              </span>
              <span className="text-xs text-[#86868B] block">
                ₹{primaryMatch.worker.hourlyRate}/hr base
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. "WHY THIS WORKER?" PROMINENT SECTION                        */}
        {/* (Flattened on mobile to reduce layer stacking & blur load)      */}
        {/* ============================================================== */}
        <div className="mt-6 pt-5 border-t border-black/6 bg-[#F8F8FA] sm:bg-white/60 sm:backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-black/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm sm:text-base font-extrabold text-[#111111] tracking-tight">
                Why {primaryFirstName}?
              </h4>
              <span className="text-xs text-[#6E6E73] font-normal">
                (WorkLink AI Multi-Factor Rationale)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (onOpenTrustModal) {
                  onOpenTrustModal(primaryMatch);
                } else {
                  setIsInternalTrustOpen(true);
                }
              }}
              className="text-xs font-bold text-[#0071E3] hover:underline flex items-center space-x-1 self-start sm:self-auto py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Inspect Responsible AI &amp; Trust Rationale</span>
            </button>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-[#111111]">
            {primaryReasons.map((reason, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
                <span className="font-medium text-[#111111]">{reason}</span>
              </li>
            ))}
          </ul>

          {primaryMatch.tradeOffSummary && (
            <p className="mt-3.5 pt-3 border-t border-black/5 text-xs text-[#6E6E73] italic">
              <strong>Comparison Insight:</strong> {primaryMatch.tradeOffSummary}
            </p>
          )}

          {/* Action Row: Floating Action Surface Touch Ergonomics */}
          <div className="mt-5 pt-4 border-t border-black/6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-[#86868B]">
              Direct booking locks this rate and dispatches {primaryFirstName} instantly.
            </span>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2.5 shrink-0 w-full sm:w-auto">
              <Button
                variant="outline"
                size="md"
                onClick={() => onViewProfileClick(primaryMatch)}
                className="w-full sm:w-auto min-h-[44px] justify-center text-xs font-bold"
              >
                Inspect Profile
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => onBookClick(primaryMatch)}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto min-h-[48px] justify-center text-xs sm:text-sm font-bold bg-[#111111] text-white shadow-sm active-press"
              >
                Book {primaryFirstName} — ₹{primaryMatch.worker.estimatedQuote}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RESPONSIBLE AI & USER CONTROL BANNER (Milestone 19)            */}
      {/* "AI recommends. Human decides."                                */}
      {/* ============================================================== */}
      <ResponsibleAiBanner
        primaryWorker={primaryMatch}
        onOpenTrustModal={() => {
          if (onOpenTrustModal) {
            onOpenTrustModal(primaryMatch);
          } else {
            setIsInternalTrustOpen(true);
          }
        }}
        onChangeRequirements={onChangeRequirements}
        onChangePreferences={onChangePreferences}
        onViewAlternatives={() => {
          if (onViewAlternatives) {
            onViewAlternatives();
          } else if (alternativesRef.current) {
            alternativesRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        onOverrideRecommendation={() => {
          if (secondaryMatches.length > 0 && onOverrideRecommendation) {
            onOverrideRecommendation(secondaryMatches[0]);
          } else if (secondaryMatches.length > 0) {
            onBookClick(secondaryMatches[0]);
          }
        }}
      />

      {/* ============================================================== */}
      {/* 4. SECONDARY WORKERS: Flatter Surfaces & Calm Hierarchy        */}
      {/* ============================================================== */}
      {secondaryMatches.length > 0 && (
        <div ref={alternativesRef} className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wider">
                Alternative Qualified Candidates ({secondaryMatches.length})
              </h3>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Evaluated against the same hard constraints with alternative trade-offs.
              </p>
            </div>
            <span className="text-xs text-[#86868B] hidden sm:inline font-medium">
              Ranked in order of total fit score
            </span>
          </div>

          {/* Flatter Cards Grid (Desktop Grid / Mobile Horizontal Scroll-Snap) */}
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {secondaryMatches.map((item) => {
              const itemTravelBand = getTravelBand(item.worker.distanceKm);
              const isExpanded = expandedWorkerId === item.worker.id;

              return (
                <div
                  key={item.worker.id}
                  className="min-w-[260px] xs:min-w-[280px] sm:min-w-0 snap-start flex-1 flex flex-col justify-between rounded-2xl bg-white border border-black/8 hover:border-black/18 shadow-2xs hover:shadow-xs transition-all duration-200 p-4 sm:p-5 hover-lift"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/5">
                      <div className="flex items-center space-x-3 min-w-0">
                        <Avatar
                          src={item.worker.avatar}
                          alt={item.worker.name}
                          size="md"
                          isVerified={item.worker.isVerified}
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#111111] truncate tracking-tight">
                            {item.worker.name}
                          </h4>
                          <p className="text-xs text-[#6E6E73] truncate">
                            {item.worker.trade} • {item.worker.experienceYears}y
                          </p>
                        </div>
                      </div>

                      {/* Calm Secondary Match Score */}
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-[#111111] leading-none block">
                          {item.totalScore}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#86868B] block">
                          Rank #{item.rank}
                        </span>
                      </div>
                    </div>

                    {/* Vitals */}
                    <div className="flex items-center justify-between text-xs py-3 text-[#6E6E73]">
                      <span className="flex items-center font-bold text-[#111111]">
                        <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                        {item.worker.rating.toFixed(1)}
                      </span>

                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 text-[#86868B] mr-0.5" />
                        <span>{item.worker.distanceKm.toFixed(1)} km</span>
                        {itemTravelBand.band === 'core_free' && (
                          <span className="ml-1 text-[10px] text-[#34C759] font-medium">(Free)</span>
                        )}
                      </span>

                      <span className="capitalize font-medium text-[#111111]">
                        {item.worker.availabilityStatus}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.worker.skills.slice(0, 2).map((skill) => (
                        <span
                          key={skill}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#6E6E73] truncate max-w-[140px]"
                        >
                          {skill}
                        </span>
                      ))}
                      {item.worker.skills.length > 2 && (
                        <span className="text-[10px] text-[#86868B] px-1 py-0.5">
                          +{item.worker.skills.length - 2}
                        </span>
                      )}
                    </div>

                    {/* Expandable Trade-Off Rationale */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWorkerId(isExpanded ? null : item.worker.id)
                      }
                      className="w-full text-left py-1 text-[11px] font-semibold text-[#0071E3] flex items-center justify-between hover:underline"
                    >
                      <span>Why this alternative?</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 rounded-xl bg-[#F8F8FA] border border-black/5 text-[11px] text-[#6E6E73] space-y-1.5 animate-slide-up">
                        {item.reasons.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-start space-x-1.5 text-[#111111]">
                            <span className="w-1 h-1 rounded-full bg-[#0071E3] mt-1.5 shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Price & Quick Action */}
                  <div className="pt-3 mt-3 border-t border-black/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#86868B] block font-mono">ESTIMATE</span>
                      <span className="text-sm font-bold text-[#111111]">
                        ₹{item.worker.estimatedQuote}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => onViewProfileClick(item)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7] transition-all"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => onBookClick(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-black transition-all shadow-2xs"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Responsible AI & Trust Architecture Modal */}
      {isInternalTrustOpen && (
        <ResponsibleAiTrustModal
          isOpen={isInternalTrustOpen}
          onClose={() => setIsInternalTrustOpen(false)}
          primaryMatch={primaryMatch}
          alternativeMatches={secondaryMatches}
          activeJob={activeJob}
          onChangeRequirements={onChangeRequirements}
          onChangePreferences={onChangePreferences}
          onViewAlternatives={() => {
            setIsInternalTrustOpen(false);
            if (onViewAlternatives) {
              onViewAlternatives();
            } else if (alternativesRef.current) {
              alternativesRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOverrideRecommendation={(worker) => {
            setIsInternalTrustOpen(false);
            if (onOverrideRecommendation) {
              onOverrideRecommendation(worker);
            } else {
              onBookClick(worker);
            }
          }}
        />
      )}
    </section>
  );
};
