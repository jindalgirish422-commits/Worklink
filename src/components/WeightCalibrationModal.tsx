import React from 'react';
import { Sliders, RotateCcw, Check } from 'lucide-react';
import { MatchingWeights } from '../types';
import { DEFAULT_WEIGHT_PRESETS } from '../services/matchingEngine';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useToast } from './ui/Toast';

interface WeightCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: MatchingWeights;
  onSaveWeights: (updated: MatchingWeights) => void;
}

export const WeightCalibrationModal: React.FC<WeightCalibrationModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSaveWeights,
}) => {
  const { showToast } = useToast();

  const handlePresetSelect = (preset: MatchingWeights) => {
    onSaveWeights(preset);
    showToast({
      type: 'info',
      title: 'Weight Preset Applied',
      message: `${preset.name} active.`,
    });
  };

  const handleSliderChange = (key: keyof MatchingWeights, val: number) => {
    onSaveWeights({
      ...weights,
      [key]: val,
      id: 'custom',
      name: 'Custom User Calibration',
      description: 'Manually adjusted multi-factor weights.',
      source: 'business_prior',
    });
  };

  const sumWeights = (
    weights.w_skill +
    weights.w_experience +
    weights.w_availability +
    weights.w_quality +
    weights.w_distance +
    weights.w_price
  ).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center space-x-2.5">
          <span className="p-2 rounded-xl bg-[#F0F0F2] text-[#111111]">
            <Sliders className="w-4 h-4 text-[#0071E3]" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[#111111]">Matching Weight Calibration</h3>
            <p className="text-[11px] text-[#6E6E73] font-normal">
              Formula: S = w_s·S_skill + w_e·S_exp + w_a·S_avail + w_q·S_qual + w_d·S_dist + w_p·S_price
            </p>
          </div>
        </div>
      }
      footer={
        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={() => handlePresetSelect(DEFAULT_WEIGHT_PRESETS[0])}
            className="text-xs text-[#6E6E73] hover:text-[#111111] flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>Reset to Calibrated Prior</span>
          </button>
          <Button variant="primary" size="md" onClick={onClose}>
            Apply &amp; Recompute
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Responsible AI Banner */}
        <div className="p-4 bg-[rgba(0,113,227,0.04)] border border-[rgba(0,113,227,0.18)] rounded-2xl text-xs text-[#111111] leading-relaxed">
          <strong className="block font-semibold mb-0.5 text-[#0071E3]">
            Methodological Integrity:
          </strong>
          Weights are business priors awaiting post-pilot calibration, not fitted constants.
          Category priors emphasize critical dimensions (e.g., emergencies heighten availability weight $w_a$), which are subsequently learned from actual transaction outcomes.
        </div>

        {/* Presets */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73] block mb-2">
            Preset Calibration Profiles
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEFAULT_WEIGHT_PRESETS.map((p) => {
              const isSelected = weights.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`p-3 text-left rounded-2xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-[#111111] text-white border-[#111111] shadow-xs font-semibold'
                      : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/5 text-[#111111]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.name.split('(')[0]}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#0071E3]" />}
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3.5 pt-3 border-t border-black/5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#111111]">
            <span>Factor Weights (Normalized Sum: {sumWeights})</span>
            <span className="text-[11px] text-[#86868B] font-normal">Range: 0.05 – 0.45</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_skill (Core Technical Skill Fit)</span>
              <span className="font-mono font-bold">{weights.w_skill.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.01"
              value={weights.w_skill}
              onChange={(e) => handleSliderChange('w_skill', parseFloat(e.target.value))}
              className="w-full accent-[#0071E3]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_experience (Experience relative to need)</span>
              <span className="font-mono font-bold">{weights.w_experience.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={weights.w_experience}
              onChange={(e) => handleSliderChange('w_experience', parseFloat(e.target.value))}
              className="w-full accent-[#5856D6]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_availability (Immediate slot timing)</span>
              <span className="font-mono font-bold">{weights.w_availability.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={weights.w_availability}
              onChange={(e) => handleSliderChange('w_availability', parseFloat(e.target.value))}
              className="w-full accent-[#34C759]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_quality (Rating &amp; Completed job history)</span>
              <span className="font-mono font-bold">{weights.w_quality.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={weights.w_quality}
              onChange={(e) => handleSliderChange('w_quality', parseFloat(e.target.value))}
              className="w-full accent-[#FF9500]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_distance (10 km zone proximity)</span>
              <span className="font-mono font-bold">{weights.w_distance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={weights.w_distance}
              onChange={(e) => handleSliderChange('w_distance', parseFloat(e.target.value))}
              className="w-full accent-[#30B0C7]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-[#111111] mb-1">
              <span>w_price (Quote vs Budget benchmark)</span>
              <span className="font-mono font-bold">{weights.w_price.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={weights.w_price}
              onChange={(e) => handleSliderChange('w_price', parseFloat(e.target.value))}
              className="w-full accent-[#FF3B30]"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
