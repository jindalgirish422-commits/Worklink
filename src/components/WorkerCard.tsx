import React, { useState } from 'react';
import {
  Star,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { MatchScore } from './ui/MatchScore';

interface WorkerCardProps {
  rankedWorker: RankedWorker;
  job: JobRequest;
  onBookClick: (worker: RankedWorker) => void;
  onViewProfileClick: (worker: RankedWorker) => void;
  isTopRecommendation?: boolean;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  rankedWorker,
  job,
  onBookClick,
  onViewProfileClick,
  isTopRecommendation = false,
}) => {
  const [showExplanation, setShowExplanation] = useState(isTopRecommendation);
  const { worker, totalScore, components, reasons, tradeOffSummary, rank } = rankedWorker;

  const isFreeTravel = worker.distanceKm <= 5.0;

  return (
    <div
      className={`card-premium overflow-hidden transition-all duration-300 ${
        isTopRecommendation
          ? 'border-[#0071E3]/30 bg-gradient-to-b from-[rgba(0,113,227,0.03)] to-[#FFFFFF]'
          : 'bg-[#FFFFFF]'
      }`}
    >
      {/* Top Banner for #1 Match */}
      {isTopRecommendation && (
        <div className="bg-[#111111] text-white px-5 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Top Recommended Match • Multi-Factor Optimal</span>
          </div>
          <span className="text-[#86868B] font-mono text-[11px]">Rank #{rank}</span>
        </div>
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Avatar and Primary Details */}
          <div className="flex items-start space-x-4">
            <Avatar
              src={worker.avatar}
              alt={worker.name}
              size="lg"
              isVerified={worker.isVerified}
            />

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#111111] tracking-tight">
                  {worker.name}
                </h3>
                <span className="text-xs text-[#86868B] font-mono">({worker.id})</span>
              </div>

              <p className="text-xs text-[#6E6E73] mt-0.5 font-medium">
                {worker.trade} • {worker.experienceYears} Years Trade Experience
              </p>

              {/* Rating & Distance Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#6E6E73]">
                <span className="flex items-center font-bold text-[#111111]">
                  <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                  {worker.rating.toFixed(1)}
                  <span className="text-[#86868B] font-normal ml-1">({worker.reviewCount})</span>
                </span>

                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-[#86868B] mr-1" />
                  <span className="font-semibold text-[#111111] mr-1">{worker.distanceKm.toFixed(1)} km</span>
                  <Badge variant={isFreeTravel ? 'accent' : 'warning'} size="sm">
                    {isFreeTravel ? 'Free travel' : 'Slab charge'}
                  </Badge>
                </span>

                <span className="flex items-center text-[#111111]">
                  <Clock className="w-3.5 h-3.5 text-[#34C759] mr-1" />
                  <span className="capitalize font-medium">{worker.availabilityStatus}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Display */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
            <MatchScore score={totalScore} size="lg" />

            {/* Price Quote */}
            <div className="mt-2 text-right">
              <span className="text-lg font-bold text-[#111111]">₹{worker.estimatedQuote}</span>
              <span className="text-[11px] text-[#86868B] block">estimated quote</span>
            </div>
          </div>
        </div>

        {/* Trade Skills Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-black/5">
          <span className="text-[11px] text-[#86868B] font-medium mr-1">Skills:</span>
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

        {/* Explainability Accordion Header */}
        <div className="mt-4 pt-3 border-t border-black/5">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-[#111111] hover:text-[#0071E3] transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Why WorkLink Recommends {worker.name} (Explainable AI Rationale)</span>
            </div>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Expanded AI Explanation Drawer */}
          {showExplanation && (
            <div className="mt-3 p-4 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-3 text-xs animate-slide-up">
              {/* Bulleted Rationale */}
              <div className="space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-[#111111]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] mt-1.5 shrink-0" />
                    <span className="font-medium">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Trade-off Rationale */}
              {tradeOffSummary && (
                <div className="pt-2 border-t border-black/5 text-[11px] text-[#6E6E73] italic">
                  <strong>Trade-off Insight:</strong> {tradeOffSummary}
                </div>
              )}

              {/* Factor Score Bars */}
              <div className="pt-3 border-t border-black/5">
                <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block mb-2">
                  Factor Breakdown (Multi-Factor Scoring)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Skill Match</span>
                      <span className="font-semibold text-[#111111]">{components.skillScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#0071E3] h-1.5 rounded-full" style={{ width: `${components.skillScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Experience</span>
                      <span className="font-semibold text-[#111111]">{components.experienceScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#5856D6] h-1.5 rounded-full" style={{ width: `${components.experienceScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Availability</span>
                      <span className="font-semibold text-[#111111]">{components.availabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#34C759] h-1.5 rounded-full" style={{ width: `${components.availabilityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Quality</span>
                      <span className="font-semibold text-[#111111]">{components.qualityScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#FF9500] h-1.5 rounded-full" style={{ width: `${components.qualityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Proximity</span>
                      <span className="font-semibold text-[#111111]">{components.distanceScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#30B0C7] h-1.5 rounded-full" style={{ width: `${components.distanceScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] rounded-xl border border-black/5">
                    <div className="flex justify-between text-[#6E6E73] mb-1">
                      <span>Budget Fit</span>
                      <span className="font-semibold text-[#111111]">{components.priceScore}/100</span>
                    </div>
                    <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#FF3B30] h-1.5 rounded-full" style={{ width: `${components.priceScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-black/5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onViewProfileClick(rankedWorker)}
          >
            View Verified Profile
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => onBookClick(rankedWorker)}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Book {worker.name}
          </Button>
        </div>
      </div>
    </div>
  );
};
