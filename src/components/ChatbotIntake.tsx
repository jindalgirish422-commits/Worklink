import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Wrench,
  Clock,
  HelpCircle,
  Coins,
  CheckCircle2,
} from 'lucide-react';
import { JobRequest, CustomerLocation } from '../types';
import {
  SAMPLE_PROMPTS,
  parseNaturalLanguageJob,
  createJobRequestFromSlots,
  ExtractedSlots,
} from '../services/chatbotService';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useToast } from './ui/Toast';

interface ChatbotIntakeProps {
  currentLocation: CustomerLocation;
  onJobCreated: (job: JobRequest) => void;
  activeJob: JobRequest | null;
}

export const ChatbotIntake: React.FC<ChatbotIntakeProps> = ({
  currentLocation,
  onJobCreated,
  activeJob,
}) => {
  const { showToast } = useToast();
  const [inputPrompt, setInputPrompt] = useState(
    "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800."
  );
  const [extracted, setExtracted] = useState<ExtractedSlots>(() =>
    parseNaturalLanguageJob(
      "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800.",
      currentLocation
    )
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromptChange = (val: string) => {
    setInputPrompt(val);
    const parsed = parseNaturalLanguageJob(val, currentLocation);
    setExtracted(parsed);
  };

  const handleSelectSample = (sampleText: string) => {
    setInputPrompt(sampleText);
    const parsed = parseNaturalLanguageJob(sampleText, currentLocation);
    setExtracted(parsed);
    showToast({
      type: 'info',
      title: 'Preset Prompt Loaded',
      message: 'Natural-language slots decoded automatically.',
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseNaturalLanguageJob(inputPrompt, currentLocation);
      setExtracted(parsed);
      const newJob = createJobRequestFromSlots(inputPrompt, parsed, currentLocation);
      onJobCreated(newJob);
      setIsProcessing(false);
      showToast({
        type: 'success',
        title: 'Requirement Decoded',
        message: `Extracted ${parsed.serviceCategory} • ${parsed.requiredSkills.length} skills • ${currentLocation.radiusKm}km zone`,
      });
    }, 300);
  };

  const handleApplyClarification = (field: 'urgency' | 'budget', val: any) => {
    if (field === 'urgency') {
      const updated = {
        ...extracted,
        urgency: val,
        requestedTime: val === 'emergency' ? 'Immediate (Within 45 mins)' : 'Today Afternoon',
      };
      setExtracted(updated);
      const newJob = createJobRequestFromSlots(inputPrompt, updated, currentLocation);
      onJobCreated(newJob);
      showToast({
        type: 'info',
        title: 'Timing Clarified',
        message: `Updated to ${val === 'emergency' ? 'Immediate Emergency' : 'Scheduled Slot'}.`,
      });
    }
  };

  return (
    <div className="card-premium p-6 md:p-8 bg-[#FFFFFF] mb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-[rgba(0,113,227,0.08)] text-[#0071E3]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Natural-Language Job Intake
            </h2>
            <Badge variant="accent" size="sm">
              AI Slot Extraction
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-2xl leading-relaxed">
            State your real-world service requirement naturally. The intake parser identifies the trade category, required skills, urgency, time slot, and budget ceiling.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#86868B] font-medium mr-1">Presets:</span>
          {SAMPLE_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sp.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#111111] font-medium transition-all"
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt Textarea */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={3}
            placeholder="e.g. My AC isn't cooling and making a buzzing noise. Need an experienced technician immediately. Budget is ₹800."
            className="w-full p-4 pr-36 rounded-2xl bg-[#F5F5F7] border border-black/5 text-[#111111] text-xs sm:text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:border-transparent transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3.5 bottom-3.5 flex items-center">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isProcessing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Match Workers
            </Button>
          </div>
        </div>
      </form>

      {/* Structured Slot Inspector */}
      <div className="mt-6 bg-[#FBFBFD] rounded-2xl p-4 sm:p-5 border border-black/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73]">
              Decoded Job Object
            </span>
          </div>
          <span className="text-xs font-semibold text-[#86868B]">
            Confidence: <span className="text-[#34C759] font-bold">{(extracted.confidenceScore * 100).toFixed(0)}%</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Slot 1: Trade */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5">
            <div className="flex items-center space-x-1.5 text-[#86868B] text-[10px] mb-1 font-semibold uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Service</span>
            </div>
            <p className="text-xs font-bold text-[#111111] truncate">
              {extracted.serviceCategory}
            </p>
          </div>

          {/* Slot 2: Skills */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5 col-span-2">
            <div className="flex items-center space-x-1.5 text-[#86868B] text-[10px] mb-1 font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Core Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {extracted.requiredSkills.map((sk, i) => (
                <Badge key={i} variant="accent" size="sm">
                  {sk}
                </Badge>
              ))}
            </div>
          </div>

          {/* Slot 3: Urgency */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5">
            <div className="flex items-center space-x-1.5 text-[#86868B] text-[10px] mb-1 font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Timing</span>
            </div>
            <p className="text-xs font-bold text-[#111111] truncate">
              {extracted.urgency === 'emergency' ? '🚨 Immediate' : extracted.requestedTime}
            </p>
          </div>

          {/* Slot 4: Budget */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5">
            <div className="flex items-center space-x-1.5 text-[#86868B] text-[10px] mb-1 font-semibold uppercase tracking-wider">
              <Coins className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Budget Cap</span>
            </div>
            <p className="text-xs font-bold text-[#111111]">
              ₹{extracted.budgetMax} max
            </p>
          </div>

          {/* Slot 5: Zone */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-black/5">
            <div className="flex items-center space-x-1.5 text-[#86868B] text-[10px] mb-1 font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#5856D6]" />
              <span>Radius</span>
            </div>
            <p className="text-xs font-bold text-[#111111] truncate">
              {currentLocation.radiusKm} km Enforced
            </p>
          </div>
        </div>

        {/* Clarification prompt */}
        {extracted.missingClarifications.length > 0 && (
          <div className="mt-3 p-3 bg-[rgba(255,149,0,0.06)] border border-[rgba(255,149,0,0.2)] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-[#B25E00]">
              <HelpCircle className="w-4 h-4 text-[#FF9500] shrink-0" />
              <span>
                <strong>Timing Clarification:</strong> Do you need immediate emergency dispatch or a scheduled slot?
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={() => handleApplyClarification('urgency', 'emergency')}
              >
                Immediate Emergency
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleApplyClarification('urgency', 'normal')}
              >
                Scheduled Slot
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
