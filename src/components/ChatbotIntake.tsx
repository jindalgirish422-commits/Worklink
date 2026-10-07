import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Zap,
  Wrench,
  Clock,
  ShieldAlert,
  Coins,
} from 'lucide-react';
import { JobRequest, CustomerLocation } from '../types';
import {
  SAMPLE_PROMPTS,
  parseNaturalLanguageJob,
  createJobRequestFromSlots,
  ExtractedSlots,
} from '../services/chatbotService';

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
  const [showClarificationResponse, setShowClarificationResponse] = useState(false);

  const handlePromptChange = (val: string) => {
    setInputPrompt(val);
    const parsed = parseNaturalLanguageJob(val, currentLocation);
    setExtracted(parsed);
  };

  const handleSelectSample = (sampleText: string) => {
    setInputPrompt(sampleText);
    const parsed = parseNaturalLanguageJob(sampleText, currentLocation);
    setExtracted(parsed);
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
    }, 350);
  };

  const handleApplyClarification = (field: 'urgency' | 'budget', val: any) => {
    if (field === 'urgency') {
      const updated = { ...extracted, urgency: val, requestedTime: val === 'emergency' ? 'Immediate (Within 45 mins)' : 'Today Afternoon' };
      setExtracted(updated);
      setShowClarificationResponse(true);
      const newJob = createJobRequestFromSlots(inputPrompt, updated, currentLocation);
      onJobCreated(newJob);
    }
  };

  return (
    <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm mb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Natural-Language Job Intake
            </h2>
            <span className="badge-subtle bg-blue-50 text-blue-700 border border-blue-100/60 font-semibold text-[11px]">
              AI Slot Extraction
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Describe your problem in plain words. The intake engine decodes your trade requirement, required core skills, urgency, time slot, and budget into a structured matching object.
          </p>
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Presets:</span>
          {SAMPLE_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sp.prompt)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all"
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Input */}
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={3}
            placeholder="e.g. My AC isn't cooling and leaking water. I need a certified technician immediately. Budget is ₹800."
            className="w-full p-4 pr-32 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-sm md:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none font-normal leading-relaxed"
          />
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <button
              type="submit"
              disabled={isProcessing || !inputPrompt.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs md:text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm"
            >
              {isProcessing ? (
                <span>Decoding...</span>
              ) : (
                <>
                  <span>Match Workers</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Structured Slot Extraction Inspector */}
      <div className="mt-6 bg-slate-50/80 rounded-2xl p-4 md:p-5 border border-slate-200/70">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Live AI Structured Job Object
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Confidence: <span className="text-emerald-600">{(extracted.confidenceScore * 100).toFixed(0)}%</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Slot 1: Trade */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-medium">
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
              <span>Service</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {extracted.serviceCategory}
            </p>
          </div>

          {/* Slot 2: Required Skills */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs col-span-2">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Extracted Core Skills</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {extracted.requiredSkills.map((sk, i) => (
                <span
                  key={i}
                  className="badge-subtle bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100"
                >
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Slot 3: Urgency & Time */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Urgency & Slot</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {extracted.urgency === 'emergency' ? '🚨 Immediate' : extracted.requestedTime}
            </p>
          </div>

          {/* Slot 4: Budget Max */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-medium">
              <Coins className="w-3.5 h-3.5 text-emerald-500" />
              <span>Budget Cap</span>
            </div>
            <p className="text-xs font-bold text-slate-900">
              ₹{extracted.budgetMax} max
            </p>
          </div>

          {/* Slot 5: 10 km Service Zone */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] mb-1 font-medium">
              <Zap className="w-3.5 h-3.5 text-purple-500" />
              <span>Dynamic Radius</span>
            </div>
            <p className="text-xs font-bold text-slate-900 truncate">
              {currentLocation.radiusKm} km Enforced
            </p>
          </div>
        </div>

        {/* Clarification prompt if needed */}
        {extracted.missingClarifications.length > 0 && (
          <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2 text-amber-900">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>AI Clarification:</strong> Do you need emergency attendance right now, or a scheduled slot?
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => handleApplyClarification('urgency', 'emergency')}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-all"
              >
                Immediate Emergency
              </button>
              <button
                type="button"
                onClick={() => handleApplyClarification('urgency', 'normal')}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-amber-900 border border-amber-200 rounded-lg font-medium transition-all"
              >
                Scheduled Slot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
