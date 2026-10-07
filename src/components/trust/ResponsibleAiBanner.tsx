import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  Sliders,
  RotateCcw,
  Scale,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { RankedWorker } from '../../types';

export interface ResponsibleAiBannerProps {
  primaryWorker?: RankedWorker;
  onOpenTrustModal: () => void;
  onChangeRequirements?: () => void;
  onChangePreferences?: () => void;
  onViewAlternatives?: () => void;
  onOverrideRecommendation?: () => void;
  compact?: boolean;
}

export const ResponsibleAiBanner: React.FC<ResponsibleAiBannerProps> = ({
  primaryWorker,
  onOpenTrustModal,
  onChangeRequirements,
  onChangePreferences,
  onViewAlternatives,
  onOverrideRecommendation,
  compact = false,
}) => {
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-white/70 shadow-2xs glass-specular-edge p-4 sm:p-4.5 transition-all motion-glass-appear">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Reassuring Trust Identity */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-extrabold text-[#111111] tracking-tight">
                AI recommends. Human decides.
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759]">
                5 Biases Mitigated
              </span>
            </div>
            <p className="text-[11px] text-[#6E6E73] leading-normal">
              Transparent reasons • SDS personality never gates hiring • You retain 100% decision authority
            </p>
          </div>
        </div>

        {/* Right: Quick User Controls */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenTrustModal}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F7] border border-black/8 text-[11px] font-bold text-[#0071E3] flex items-center space-x-1 shadow-2xs transition-all hover-lift active-press"
          >
            <Sparkles className="w-3 h-3" />
            <span>Why Recommended?</span>
          </button>

          {onChangePreferences && (
            <button
              type="button"
              onClick={onChangePreferences}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F7] border border-black/8 text-[11px] font-medium text-[#111111] flex items-center space-x-1 shadow-2xs transition-all hover-lift active-press"
            >
              <Sliders className="w-3 h-3 text-[#5856D6]" />
              <span>Preferences</span>
            </button>
          )}

          {onChangeRequirements && (
            <button
              type="button"
              onClick={onChangeRequirements}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#F5F5F7] border border-black/8 text-[11px] font-medium text-[#111111] flex items-center space-x-1 shadow-2xs transition-all hover-lift active-press"
            >
              <RotateCcw className="w-3 h-3 text-[#FF9500]" />
              <span>Requirements</span>
            </button>
          )}

          {onViewAlternatives && (
            <button
              type="button"
              onClick={onViewAlternatives}
              className="px-2.5 py-1.5 rounded-xl bg-[#111111] hover:bg-black text-white text-[11px] font-semibold flex items-center space-x-1 shadow-2xs transition-all hover-lift active-press"
            >
              <span>Alternatives</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
