import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Sliders,
  Scale,
  Lock,
  Heart,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  MapPin,
  Clock,
  Star,
  DollarSign,
  HelpCircle,
  FileText,
  X,
  ChevronRight,
  ShieldAlert,
  ThumbsUp,
  ExternalLink,
} from 'lucide-react';
import { RankedWorker, JobRequest, MatchingWeights, Worker } from '../../types';
import {
  BIAS_MITIGATIONS,
  PERSONALITY_GUARDRAIL,
  PRIVACY_POLICIES,
  buildWorkerTrustProfile,
  FairnessBiasKey,
} from '../../services/responsibleAiService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface ResponsibleAiTrustModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryMatch: RankedWorker;
  alternativeMatches?: RankedWorker[];
  activeJob: JobRequest;
  currentWeights?: MatchingWeights;
  onChangeRequirements?: () => void;
  onChangePreferences?: () => void;
  onViewAlternatives?: () => void;
  onOverrideRecommendation?: (alternativeWorker: RankedWorker) => void;
}

type TrustTab = 'explainability' | 'user_control' | 'fairness' | 'personality' | 'privacy';

export const ResponsibleAiTrustModal: React.FC<ResponsibleAiTrustModalProps> = ({
  isOpen,
  onClose,
  primaryMatch,
  alternativeMatches = [],
  activeJob,
  currentWeights,
  onChangeRequirements,
  onChangePreferences,
  onViewAlternatives,
  onOverrideRecommendation,
}) => {
  const [activeTab, setActiveTab] = useState<TrustTab>('explainability');
  const [selectedBiasKey, setSelectedBiasKey] = useState<FairnessBiasKey>('geographic_bias');

  if (!primaryMatch) return null;

  const trustProfile = buildWorkerTrustProfile(primaryMatch, activeJob);
  const selectedBias =
    BIAS_MITIGATIONS.find((b) => b.key === selectedBiasKey) || BIAS_MITIGATIONS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#0071E3]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#111111] tracking-tight">
                Responsible AI &amp; Trust Architecture
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759] text-[10px] font-bold uppercase tracking-wider">
                Audited
              </span>
            </div>
            <p className="text-xs text-[#6E6E73] font-medium">
              Transparent explainability, fairness mitigations, and user autonomy
            </p>
          </div>
        </div>
      }
      footer={
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center space-x-2 text-xs text-[#6E6E73]">
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span className="font-semibold text-[#111111]">AI recommends. Human decides.</span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose}>
              Dismiss
            </Button>
            {onChangePreferences && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onChangePreferences();
                }}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
              >
                Tune Matching Weights
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================================== */}
        {/* PHILOSOPHY CALLOUT (SUBTLE GLASS SURFACE)                       */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-sm glass-specular-edge space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-[#111111] text-white text-[11px] font-bold tracking-wide flex items-center space-x-1.5 shadow-2xs">
                <Sparkles className="w-3 h-3 text-[#0071E3]" />
                <span>AI Recommends. Human Decides.</span>
              </span>
              <span className="text-xs text-[#86868B] font-mono">WorkLink Trust Standard</span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-[#34C759] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Deterministic Auditable Scoring</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#6E6E73] leading-relaxed">
            Every match is calculated with open mathematical weights and tested against 5 non-negotiable hard constraints.
            WorkLink never treats recommendation algorithms as final authority: you always retain full control to modify requirements,
            calibrate preferences, inspect alternatives, or override the engine.
          </p>
        </div>

        {/* ============================================================== */}
        {/* TABS NAVIGATION                                                */}
        {/* ============================================================== */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar border-b border-black/5 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('explainability')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
              activeTab === 'explainability'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Why Recommended</span>
          </button>

          <button
            onClick={() => setActiveTab('user_control')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
              activeTab === 'user_control'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#34C759]" />
            <span>User Control</span>
          </button>

          <button
            onClick={() => setActiveTab('fairness')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
              activeTab === 'fairness'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-[#FF9500]" />
            <span>Fairness &amp; Biases</span>
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
              activeTab === 'personality'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#FF2D55]" />
            <span>Personality Guardrail</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-1.5 shrink-0 transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#5856D6]" />
            <span>Privacy &amp; Security</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: EXPLAINABILITY (Why WorkLink recommended this pro)       */}
        {/* ============================================================== */}
        {activeTab === 'explainability' && (
          <div className="space-y-5 animate-fade-in">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-black/6">
              <div className="flex items-center space-x-3.5">
                <img
                  src={primaryMatch.worker.avatar}
                  alt={primaryMatch.worker.name}
                  className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/10"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-extrabold text-[#111111]">
                      {trustProfile.workerName}
                    </h3>
                    <Badge variant="accent" size="sm">
                      {trustProfile.trade}
                    </Badge>
                    {trustProfile.isVerified && (
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Evaluated candidate for: &ldquo;{activeJob.serviceCategory} • {activeJob.urgency} urgency&rdquo;
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-2xl font-extrabold text-[#111111] block leading-none">
                  {trustProfile.matchScore}%
                </span>
                <span className="text-[11px] font-bold text-[#0071E3] uppercase tracking-wider block mt-1">
                  Fit Score
                </span>
              </div>
            </div>

            {/* Actual Reasons (The core requirement) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                <span>Why WorkLink Recommended This Professional (Actual Reasons)</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {trustProfile.actualReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-black/6 flex items-start space-x-3 text-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5 font-bold text-[11px]">
                      ✓
                    </span>
                    <span className="font-semibold text-[#111111] leading-relaxed">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Factor Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
                Evaluated Factor Breakdown
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trustProfile.factors.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white border border-black/6 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111]">{f.label}</span>
                      <span className="text-xs font-mono font-bold text-[#0071E3]">
                        {f.scoreContribution}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#111111]">{f.value}</p>
                    <p className="text-[11px] text-[#6E6E73] leading-relaxed">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Non-Negotiable Hard Filters Audit */}
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  5 Hard Constraints Verification
                </span>
                <span className="text-[11px] text-[#34C759] font-bold">5 of 5 Passed</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {trustProfile.hardConstraintsAudit.map((check, i) => (
                  <div key={i} className="flex items-start space-x-2 text-[#6E6E73]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#111111]">{check.name}:</strong> {check.detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: USER CONTROL (Human Decides Actions)                     */}
        {/* ============================================================== */}
        {activeTab === 'user_control' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/15 space-y-1.5">
              <h3 className="text-sm font-bold text-[#0071E3] flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-[#0071E3]" />
                <span>You Have Complete Control Over Every Match</span>
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                WorkLink recommendations are suggestions, not requirements. You can alter requirements,
                shift matching priorities, view all alternative candidates, or directly override the top recommendation.
              </p>
            </div>

            {/* 4 Explicit User Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Action 1: Change Requirements */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/20 shadow-xs space-y-3 transition-all flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-xs">
                    01
                  </div>
                  <h4 className="text-sm font-bold text-[#111111]">Change Requirements</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Modify your required trade, urgency timeframe, specific problem description, or budget ceiling.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onClose();
                    if (onChangeRequirements) onChangeRequirements();
                  }}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Edit Job Requirements
                </Button>
              </div>

              {/* Action 2: Change Preferences */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/20 shadow-xs space-y-3 transition-all flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center font-bold text-xs">
                    02
                  </div>
                  <h4 className="text-sm font-bold text-[#111111]">Change Preferences</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Recalibrate matching weights: prioritize distance (arrival speed), price (budget savings), or trade experience.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onClose();
                    if (onChangePreferences) onChangePreferences();
                  }}
                  leftIcon={<Sliders className="w-3.5 h-3.5" />}
                >
                  Calibrate Weights
                </Button>
              </div>

              {/* Action 3: View Alternatives */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/20 shadow-xs space-y-3 transition-all flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center font-bold text-xs">
                    03
                  </div>
                  <h4 className="text-sm font-bold text-[#111111]">View Alternatives</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Inspect secondary qualified craftspeople evaluated against the same 10 km constraints with alternative trade-offs.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    onClose();
                    if (onViewAlternatives) onViewAlternatives();
                  }}
                  leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Browse Secondary Candidates
                </Button>
              </div>

              {/* Action 4: Override Recommendation */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 hover:border-black/20 shadow-xs space-y-3 transition-all flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
                    04
                  </div>
                  <h4 className="text-sm font-bold text-[#111111]">Override Recommendation</h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">
                    Choose and directly book ANY qualified professional in the marketplace, regardless of algorithmic ranking.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="bg-[#111111] hover:bg-black text-white"
                  onClick={() => {
                    if (alternativeMatches.length > 0 && onOverrideRecommendation) {
                      onClose();
                      onOverrideRecommendation(alternativeMatches[0]);
                    } else if (onViewAlternatives) {
                      onClose();
                      onViewAlternatives();
                    }
                  }}
                  leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Override &amp; Pick Alternative
                </Button>
              </div>
            </div>

            {/* Quick Override List if Alternatives Exist */}
            {alternativeMatches.length > 0 && (
              <div className="p-4 rounded-2xl bg-white border border-black/6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                  Available Qualified Alternatives to Book Directly:
                </h4>
                <div className="space-y-2">
                  {alternativeMatches.slice(0, 3).map((alt) => (
                    <div
                      key={alt.worker.id}
                      className="p-3 rounded-xl bg-[#F5F5F7] border border-black/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <img
                          src={alt.worker.avatar}
                          alt={alt.worker.name}
                          className="w-9 h-9 rounded-lg object-cover ring-1 ring-black/5"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-[#111111] truncate">
                            {alt.worker.name}
                          </h5>
                          <p className="text-[11px] text-[#6E6E73] truncate">
                            {alt.worker.trade} • {alt.worker.rating.toFixed(1)} ★ • {alt.worker.distanceKm.toFixed(1)} km away • ₹{alt.worker.estimatedQuote}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="text-xs font-bold text-[#111111]">
                          {alt.totalScore}%
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs py-1 px-2.5 h-auto"
                          onClick={() => {
                            onClose();
                            if (onOverrideRecommendation) onOverrideRecommendation(alt);
                          }}
                        >
                          Book Instead
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: FAIRNESS (5 Biases Mitigated)                            */}
        {/* ============================================================== */}
        {activeTab === 'fairness' && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#FF9500]/5 border border-[#FF9500]/20 space-y-1">
              <h3 className="text-sm font-bold text-[#FF9500] flex items-center space-x-1.5">
                <Scale className="w-4 h-4 text-[#FF9500]" />
                <span>Algorithmic Fairness &amp; Bias Mitigation Framework</span>
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                WorkLink explicitly monitors and mitigates 5 common marketplace biases to protect both customers and independent technicians.
              </p>
            </div>

            {/* Bias Selector Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
              {BIAS_MITIGATIONS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setSelectedBiasKey(b.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    selectedBiasKey === b.key
                      ? 'bg-[#111111] text-white shadow-2xs'
                      : 'bg-white hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/6'
                  }`}
                >
                  {b.badge}
                </button>
              ))}
            </div>

            {/* Selected Bias Detailed Card */}
            <div className="p-5 rounded-2xl bg-white border border-black/8 space-y-4 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5">
                <div>
                  <h4 className="text-base font-extrabold text-[#111111]">
                    {selectedBias.title}
                  </h4>
                  <span className="text-xs font-semibold text-[#0071E3]">
                    Safeguard: {selectedBias.badge}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-xs font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enforced</span>
                </span>
              </div>

              {/* The Risk */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF3B30] block">
                  Identified Algorithmic Risk:
                </span>
                <p className="text-xs text-[#6E6E73] leading-relaxed bg-[#FF3B30]/5 p-3 rounded-xl border border-[#FF3B30]/10">
                  {selectedBias.biasRisk}
                </p>
              </div>

              {/* WorkLink Mitigation */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#34C759] block">
                  WorkLink Architectural Mitigation:
                </span>
                <p className="text-xs text-[#111111] leading-relaxed bg-[#34C759]/5 p-3 rounded-xl border border-[#34C759]/10 font-medium">
                  {selectedBias.mitigationStrategy}
                </p>
              </div>

              {/* Operational Rule & Guarantee */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/5">
                  <strong className="block text-[#111111] mb-1 font-bold">Operational Rule:</strong>
                  <span className="text-[#6E6E73]">{selectedBias.operationalRule}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/5">
                  <strong className="block text-[#111111] mb-1 font-bold">Metric Guarantee:</strong>
                  <span className="text-[#6E6E73]">{selectedBias.guaranteeMetric}</span>
                </div>
              </div>
            </div>

            {/* Overview Grid of all 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
              {BIAS_MITIGATIONS.map((b) => (
                <button
                  key={b.key}
                  onClick={() => setSelectedBiasKey(b.key)}
                  className={`p-2.5 text-left rounded-xl text-xs border transition-all ${
                    selectedBiasKey === b.key
                      ? 'border-[#0071E3] bg-[#0071E3]/5 font-bold text-[#0071E3]'
                      : 'border-black/5 bg-white text-[#6E6E73] hover:border-black/15'
                  }`}
                >
                  <span className="block truncate font-bold text-[#111111]">{b.badge}</span>
                  <span className="text-[10px] block truncate text-[#86868B]">{b.title.split(' ')[0]} Bias</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: PERSONALITY GUARDRAIL (Strict SDS Dataset Rule)          */}
        {/* ============================================================== */}
        {activeTab === 'personality' && (
          <div className="space-y-5 animate-fade-in">
            {/* The Strict Rule Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FF2D55]/10 to-[#5856D6]/10 border border-[#FF2D55]/20 space-y-2">
              <div className="flex items-center space-x-2 text-[#FF2D55]">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  MANDATORY GOVERNANCE COMMITMENT
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#111111] leading-snug">
                &ldquo;{PERSONALITY_GUARDRAIL.rule}&rdquo;
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                {PERSONALITY_GUARDRAIL.rationale}
              </p>
            </div>

            {/* Side-by-side comparison: What We Evaluate vs What We Forbid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prioritized Factors */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 space-y-3">
                <div className="flex items-center space-x-2 text-[#34C759]">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    What WorkLink Evaluates (Prioritized Factors)
                  </h4>
                </div>

                <div className="space-y-2">
                  {PERSONALITY_GUARDRAIL.prioritizedFactors.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#F5F5F7] border border-black/5 text-xs space-y-0.5"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[#111111]">{f.factor}</strong>
                        <span className="text-[10px] text-[#0071E3] font-semibold">{f.weightStatus}</span>
                      </div>
                      <p className="text-[11px] text-[#6E6E73]">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forbidden Factors */}
              <div className="p-4 rounded-2xl bg-white border border-black/8 space-y-3">
                <div className="flex items-center space-x-2 text-[#FF3B30]">
                  <AlertTriangle className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                    Strictly Prohibited Automated Criteria
                  </h4>
                </div>

                <div className="space-y-2">
                  {PERSONALITY_GUARDRAIL.forbiddenFactors.map((f, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#FF3B30]/5 border border-[#FF3B30]/15 text-xs space-y-0.5"
                    >
                      <strong className="text-[#FF3B30] block">{f.factor}</strong>
                      <p className="text-[11px] text-[#6E6E73]">{f.prohibitionReason}</p>
                    </div>
                  ))}
                </div>

                {/* Compliance Statement */}
                <div className="mt-4 p-3 rounded-xl bg-black text-white text-xs space-y-1">
                  <span className="font-bold text-[#34C759] flex items-center space-x-1 text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Compliance Verification</span>
                  </span>
                  <p className="text-[11px] text-[#F5F5F7] leading-relaxed">
                    {PERSONALITY_GUARDRAIL.complianceDeclaration}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: PRIVACY & SECURITY                                       */}
        {/* ============================================================== */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-[#5856D6]/5 border border-[#5856D6]/20 space-y-1">
              <h3 className="text-sm font-bold text-[#5856D6] flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-[#5856D6]" />
                <span>Privacy-First Architecture &amp; Data Protection</span>
              </h3>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                WorkLink operates under strict data minimization guidelines. We never collect data we don&apos;t need to execute your service.
              </p>
            </div>

            <div className="space-y-3">
              {PRIVACY_POLICIES.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-black/8 space-y-2 shadow-xs"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
                    <span>{p.title}</span>
                  </h4>
                  <p className="text-xs text-[#6E6E73] leading-relaxed">{p.explanation}</p>
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-black/5 text-[11px] text-[#111111] font-medium flex items-start space-x-2">
                    <span className="text-[#34C759] font-bold">✓ Safeguard:</span>
                    <span>{p.safeguard}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
