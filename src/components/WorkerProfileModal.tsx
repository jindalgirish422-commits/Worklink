import React from 'react';
import {
  Star,
  Wrench,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  DollarSign,
  Award,
  Check,
  Info,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';
import { getTravelBand } from '../services/locationService';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export interface WorkerProfileModalProps {
  rankedWorker: RankedWorker | null;
  job: JobRequest;
  onClose: () => void;
  onProceedToBooking: (worker: RankedWorker) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  rankedWorker,
  job,
  onClose,
  onProceedToBooking,
}) => {
  if (!rankedWorker) return null;
  const { worker, totalScore, reasons, tradeOffSummary, rank } = rankedWorker;
  const travelBand = getTravelBand(worker.distanceKm);
  const firstName = worker.name.split(' ')[0];

  // Determine if this profile was opened from an active engine recommendation
  const isFromRecommendation = Boolean(
    (totalScore && totalScore > 0) || (reasons && reasons.length > 0)
  );

  return (
    <Modal
      isOpen={Boolean(rankedWorker)}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-2xl bg-[#111111] text-white">
            <Award className="w-4 h-4 text-[#0071E3]" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Professional Profile
            </h3>
            <p className="text-[11px] text-[#6E6E73] font-medium">
              Verified Independent Trade Specialist • ID {worker.id}
            </p>
          </div>
        </div>
      }
      footer={
        /* ============================================================== */
        /* SELECTIVE GLASS BOOKING CTA BAR (Visually Dominant)           */
        /* ============================================================== */
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 p-1 sm:p-2 bg-white/90 backdrop-blur-xl rounded-2xl border border-white/80 glass-specular-edge motion-glass-appear">
          <div className="flex items-baseline space-x-3 self-start sm:self-auto">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#86868B] block">
                Estimated Quote
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-2xl font-extrabold text-[#111111] tracking-tight">
                  ₹{worker.estimatedQuote}
                </span>
                <span className="text-xs text-[#86868B]">
                  (₹{worker.hourlyRate}/hr base)
                </span>
              </div>
            </div>

            <div className="hidden sm:block pl-3 border-l border-black/8 text-[11px] text-[#6E6E73]">
              <span>{travelBand.band === 'core_free' ? '₹0 Travel (Free Zone)' : `+₹${travelBand.travelCharge} Travel Tariff`}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <Button variant="ghost" size="md" onClick={onClose} className="hidden sm:inline-flex">
              Close
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1 sm:flex-none shadow-md hover:shadow-lg font-bold text-sm sm:text-base py-3 px-6"
              onClick={() => {
                onClose();
                onProceedToBooking(rankedWorker);
              }}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Book this professional
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-2">
        {/* ============================================================== */}
        {/* 1. HERO: Large Worker Visual & Professional Identity          */}
        {/* ============================================================== */}
        <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-5">
            {/* Large Worker Visual */}
            <div className="relative shrink-0">
              <Avatar
                src={worker.avatar}
                alt={worker.name}
                size="2xl"
                isVerified={worker.isVerified}
              />
              {worker.isVerified && (
                <span className="absolute -bottom-1 -right-1 p-1 bg-[#34C759] text-white rounded-full border-2 border-white shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                  {worker.name}
                </h2>
                <Badge variant="success" size="sm">
                  Verified Pro
                </Badge>
              </div>

              {/* Profession & Seniority */}
              <p className="text-sm sm:text-base font-semibold text-[#0071E3]">
                {worker.trade} • {worker.experienceYears} Years Trade Experience
              </p>

              {/* Rating & Proximity Vitals */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#6E6E73]">
                <span className="flex items-center font-bold text-[#111111]">
                  <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                  {worker.rating.toFixed(1)}
                  <span className="text-[#86868B] font-normal ml-1">
                    ({worker.reviewCount || worker.completedJobs} verified reviews)
                  </span>
                </span>

                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#86868B] mr-1" />
                  <span className="font-semibold text-[#111111] mr-1">
                    {worker.distanceKm.toFixed(1)} km away
                  </span>
                  {travelBand.band === 'core_free' && (
                    <span className="text-[#34C759] font-medium">• Free Core Zone</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Selective Glass Availability Pill */}
          <div className="p-3.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs glass-specular-edge shrink-0 self-stretch sm:self-auto flex sm:flex-col justify-between items-center sm:items-end text-right motion-glass-appear">
            <div>
              <span className="text-[10px] uppercase font-mono text-[#86868B] block">
                Live Status
              </span>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-[#111111] capitalize mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#34C759]" />
                <span>
                  {worker.availabilityStatus === 'immediate'
                    ? 'Available Now (<45m)'
                    : worker.nextAvailableSlot || worker.availabilityStatus}
                </span>
              </div>
            </div>

            <div className="sm:mt-2 text-right">
              <span className="text-[10px] text-[#86868B] block">Response</span>
              <span className="text-xs font-semibold text-[#111111]">
                ~{worker.responseTimeMinutes} mins
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. WHY RECOMMENDED (Selective Glass Material Surface)          */}
        {/* ============================================================== */}
        {isFromRecommendation && (
          <div className="p-5 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-2xs glass-specular-edge space-y-3 motion-glass-appear">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#0071E3]" />
                <h4 className="text-sm font-bold text-[#111111] tracking-tight">
                  Why WorkLink recommended this professional
                </h4>
              </div>

              {totalScore && (
                <span className="text-xs font-bold font-mono text-[#0071E3] bg-[#0071E3]/10 px-2.5 py-0.5 rounded-full">
                  {totalScore}% Match Score
                </span>
              )}
            </div>

            {/* Rationale Bullet Points */}
            <div className="space-y-2 text-xs sm:text-sm text-[#111111]">
              {(reasons && reasons.length > 0
                ? reasons
                : [
                    `Strong ${worker.trade} experience (${worker.experienceYears} yrs in trade)`,
                    worker.availabilityStatus === 'immediate'
                      ? 'Available immediately (<45m arrival)'
                      : `Confirmed slot: ${worker.nextAvailableSlot || 'tomorrow morning'}`,
                    `${worker.rating.toFixed(1)} customer rating across ${worker.completedJobs} completed jobs`,
                    `${worker.distanceKm.toFixed(1)} km from your location (${travelBand.band === 'core_free' ? 'Free travel zone' : 'Standard tariff applies'})`,
                    `Estimated quote ₹${worker.estimatedQuote} aligns with requested budget`,
                  ]
              ).map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2.5 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                  <span className="font-medium text-[#111111]">{reason}</span>
                </div>
              ))}
            </div>

            {tradeOffSummary && (
              <p className="pt-2 border-t border-black/5 text-xs text-[#6E6E73] italic">
                <strong>Trade-off Insight:</strong> {tradeOffSummary}
              </p>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. CORE INFORMATION: Solid Cards with Clear Hierarchy          */}
        {/* ============================================================== */}

        {/* Bio */}
        {worker.bio && (
          <div className="p-4 bg-white rounded-2xl border border-black/8 text-xs sm:text-sm text-[#111111] leading-relaxed italic">
            &ldquo;{worker.bio}&rdquo;
          </div>
        )}

        {/* Verification Credentials & Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-black/8">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Trade License
            </span>
            <span className="text-xs font-mono font-bold text-[#111111]">
              {worker.licenseNumber || 'Verified ID'}
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-black/8">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Background Check
            </span>
            <span className="text-xs font-bold text-[#34C759] flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Verified
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-black/8">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Completed Jobs
            </span>
            <span className="text-xs font-bold text-[#111111]">
              {worker.completedJobs} Jobs
            </span>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-black/8">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Completion Rate
            </span>
            <span className="text-xs font-bold text-[#111111]">
              {Math.round((worker.completionRate || 0.98) * 100)}%
            </span>
          </div>
        </div>

        {/* Skills & Tools */}
        <div className="p-5 rounded-2xl bg-white border border-black/8 space-y-4">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-2.5">
              Verified Technical Skills
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {worker.skills.map((skill, idx) => {
                const isMandatory = job.requiredSkills.some((rs) =>
                  skill.toLowerCase().includes(rs.toLowerCase())
                );
                return (
                  <Badge
                    key={idx}
                    variant={isMandatory ? 'accent' : 'default'}
                    size="sm"
                    icon={isMandatory ? <Check className="w-3 h-3 text-[#0071E3]" /> : undefined}
                  >
                    {skill}
                  </Badge>
                );
              })}
            </div>
          </div>

          {worker.toolsEquipped && worker.toolsEquipped.length > 0 && (
            <div className="pt-3 border-t border-black/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-2 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Tools &amp; Diagnostic Equipment Carried</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {worker.toolsEquipped.map((tool, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-[#111111] font-medium border border-black/5"
                  >
                    ✓ {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Area & Proximity Context */}
        <div className="p-5 rounded-2xl bg-white border border-black/8 flex items-start space-x-3.5">
          <MapPin className="w-5 h-5 text-[#0071E3] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-[#111111] space-y-1">
            <h4 className="font-bold tracking-tight">
              Service Area: South Delhi 10 km Zone
            </h4>
            <p className="text-[#6E6E73]">
              Based in {worker.coordinates ? 'Hauz Khas Vicinity' : 'South Delhi'}. Currently situated {worker.distanceKm.toFixed(1)} km from your service address.
            </p>
            <div className="pt-1 flex items-center space-x-2 text-xs">
              <span className="font-semibold text-[#111111]">
                {travelBand.band === 'core_free' ? 'Core Zone: ₹0 Free Travel' : `Extended Zone: +₹${travelBand.travelCharge} Travel Charge`}
              </span>
              <span className="text-[#86868B]">• Within 10 km boundary</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        {worker.recentReviews && worker.recentReviews.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Recent Customer Reviews ({worker.recentReviews.length})</span>
              </h4>
              <span className="text-xs text-[#86868B]">
                Average {worker.rating.toFixed(1)} ★
              </span>
            </div>

            <div className="space-y-2.5">
              {worker.recentReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white rounded-2xl border border-black/8 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#111111]">{rev.userName}</span>
                    <div className="flex items-center space-x-2 text-[#86868B] text-[11px]">
                      <span className="text-[#FF9500] font-bold">★ {rev.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-[#6E6E73] leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
