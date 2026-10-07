import React from 'react';
import { Sliders, X, Check, RotateCcw, Info, Sparkles } from 'lucide-react';
import { MatchingWeights } from '../types';
import { DEFAULT_WEIGHT_PRESETS } from '../services/matchingEngine';

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
  if (!isOpen) return null;

  const handlePresetSelect = (preset: MatchingWeights) => {
    onSaveWeights(preset);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="apple-card w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
              <Sliders className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Matching Weight Calibration
              </h3>
              <p className="text-xs text-slate-500">
                Formula: S = w_s·S_skill + w_e·S_exp + w_a·S_avail + w_q·S_qual + w_d·S_dist + w_p·S_price
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsible AI Disclaimer Banner */}
        <div className="my-5 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed">
          <strong className="block font-semibold mb-0.5">Methodological Integrity:</strong>
          Weights are business priors awaiting transaction calibration, not fitted constants.
          Initial priors are configured by category (e.g. emergencies heighten availability), and subsequently calibrated from actual booking telemetry.
        </div>

        {/* Presets List */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Preset Calibration Profiles
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEFAULT_WEIGHT_PRESETS.map((p) => {
              const isSelected = weights.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{p.name.split('(')[0]}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Individual Factor Sliders */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Factor Weights (Sum: {sumWeights})</span>
            <span className="text-[11px] text-slate-400 font-normal">Scale: 0.00 – 0.50</span>
          </div>

          {/* w_skill */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>w_skill (Core Skill Fit)</span>
              <span className="font-mono font-bold">{weights.w_skill.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.45"
              step="0.01"
              value={weights.w_skill}
              onChange={(e) => handleSliderChange('w_skill', parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* w_experience */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
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
              className="w-full accent-indigo-600"
            />
          </div>

          {/* w_availability */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
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
              className="w-full accent-emerald-600"
            />
          </div>

          {/* w_quality */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>w_quality (Rating & Completed job history)</span>
              <span className="font-mono font-bold">{weights.w_quality.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={weights.w_quality}
              onChange={(e) => handleSliderChange('w_quality', parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          {/* w_distance */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>w_distance (Proximity within 10 km)</span>
              <span className="font-mono font-bold">{weights.w_distance.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={weights.w_distance}
              onChange={(e) => handleSliderChange('w_distance', parseFloat(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          {/* w_price */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
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
              className="w-full accent-rose-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => handlePresetSelect(DEFAULT_WEIGHT_PRESETS[0])}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Calibrated Prior</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Apply &amp; Recompute
          </button>
        </div>
      </div>
    </div>
  );
};
