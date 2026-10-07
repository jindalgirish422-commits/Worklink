import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  Coins,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';

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
  const { worker, totalScore, components, weightedBreakdown, reasons, tradeOffSummary, rank } = rankedWorker;

  // Travel charge status
  const isFreeTravel = worker.distanceKm <= 5.0;

  return (
    <div
      className={`apple-card overflow-hidden transition-all duration-300 ${
        isTopRecommendation
          ? 'ring-2 ring-blue-500/30 border-blue-200/80 shadow-md bg-gradient-to-b from-blue-50/[0.15] to-white'
          : 'bg-white'
      }`}
    >
      {/* Top Banner for #1 Match */}
      {isTopRecommendation && (
        <div className="bg-slate-900 text-white px-5 py-2 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Top Recommended Match • Multi-Factor Optimal</span>
          </div>
          <span className="text-slate-300 font-mono text-[11px]">Rank #{rank}</span>
        </div>
      )}

      <div className="p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          {/* Avatar and Primary Details */}
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={worker.avatar}
                alt={worker.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              {worker.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 p-0.5 bg-blue-600 rounded-full text-white shadow-xs"
                  title="Govt ID & Trade License Verified"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {worker.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium font-mono">({worker.id})</span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {worker.trade} • {worker.experienceYears} Years Trade Experience
              </p>

              {/* Rating & Distance Meta */}
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center font-semibold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                  {worker.rating.toFixed(1)}
                  <span className="text-slate-400 font-normal ml-1">({worker.reviewCount})</span>
                </span>

                <span className="flex items-center">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <span className="font-semibold text-slate-800 mr-1">{worker.distanceKm.toFixed(1)} km</span>
                  <span
                    className={`badge-subtle text-[10px] ${
                      isFreeTravel ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {isFreeTravel ? 'Free travel' : 'Slab charge'}
                  </span>
                </span>

                <span className="flex items-center text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  <span className="capitalize font-medium">{worker.availabilityStatus}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Display */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
            <div className="text-left sm:text-right">
              <div className="flex items-baseline sm:justify-end space-x-1">
                <span className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {totalScore}%
                </span>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Match
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Multi-Factor Fit</p>
            </div>

            {/* Price Quote */}
            <div className="mt-2 text-right">
              <span className="text-lg font-bold text-slate-900">₹{worker.estimatedQuote}</span>
              <span className="text-xs text-slate-500 block">estimated</span>
            </div>
          </div>
        </div>

        {/* Trade Skills Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Skills:</span>
          {worker.skills.map((skill, idx) => {
            const isMandatory = job.requiredSkills.some((rs) =>
              skill.toLowerCase().includes(rs.toLowerCase())
            );
            return (
              <span
                key={idx}
                className={`badge-subtle text-[11px] font-medium ${
                  isMandatory
                    ? 'bg-blue-50 text-blue-800 border border-blue-100 font-semibold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {isMandatory && <Check className="w-3 h-3 mr-1 text-blue-600 inline" />}
                {skill}
              </span>
            );
          })}
        </div>

        {/* Explainability Accordion Header: "Why this worker was recommended" */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-slate-800 hover:text-blue-600 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Why WorkLink Recommends {worker.name} (Explainable AI Breakdown)</span>
            </div>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Expanded AI Explanation Drawer */}
          {showExplanation && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              {/* Bulleted Rationale */}
              <div className="space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span className="font-medium">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Trade-off Rationale */}
              {tradeOffSummary && (
                <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 italic">
                  <strong>Trade-off Insight:</strong> {tradeOffSummary}
                </div>
              )}

              {/* Micro Factor Score Bars */}
              <div className="pt-3 border-t border-slate-200/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
                  Factor Breakdown (Weighted Components)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Skill Fit</span>
                      <span className="font-semibold text-slate-900">{components.skillScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${components.skillScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Experience</span>
                      <span className="font-semibold text-slate-900">{components.experienceScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${components.experienceScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Availability</span>
                      <span className="font-semibold text-slate-900">{components.availabilityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${components.availabilityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Quality Rating</span>
                      <span className="font-semibold text-slate-900">{components.qualityScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${components.qualityScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Proximity</span>
                      <span className="font-semibold text-slate-900">{components.distanceScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${components.distanceScore}%` }} />
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded-lg border border-slate-200/60">
                    <div className="flex justify-between text-slate-500 mb-1">
                      <span>Budget Fit</span>
                      <span className="font-semibold text-slate-900">{components.priceScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: `${components.priceScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onViewProfileClick(rankedWorker)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            View Verified Profile
          </button>

          <button
            type="button"
            onClick={() => onBookClick(rankedWorker)}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm"
          >
            <span>Book {worker.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
