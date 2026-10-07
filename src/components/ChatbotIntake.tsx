import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Wrench,
  Clock,
  Coins,
  MapPin,
  CheckCircle2,
  Edit3,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { JobRequest, CustomerLocation, TradeCategory } from '../types';
import {
  SAMPLE_PROMPTS,
  parseNaturalLanguageJob,
  createJobRequestFromSlots,
  ExtractedSlots,
} from '../services/chatbotService';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input } from './ui/Input';
import { useToast } from './ui/Toast';

interface ChatbotIntakeProps {
  currentLocation: CustomerLocation;
  onJobCreated: (job: JobRequest) => void;
  activeJob: JobRequest | null;
}

const AVAILABLE_TRADES: TradeCategory[] = [
  'AC Technician',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Mechanic',
  'Appliance Repair',
  'Cleaning Professional',
  'Mason / General Technician',
  'Locksmith',
  'Electronics Specialist',
  'Networking Specialist',
  'Gardener / Landscaper',
];

const TIME_SLOT_OPTIONS = [
  { label: 'Immediate Emergency', time: 'Immediate (Within 45 mins)', urgency: 'emergency' as const },
  { label: 'Today Afternoon', time: 'Today Afternoon (13:00 - 16:00)', urgency: 'high' as const },
  { label: 'Tomorrow Morning', time: 'Tomorrow Morning (09:00 - 12:00)', urgency: 'normal' as const },
  { label: 'Tomorrow Afternoon', time: 'Tomorrow Afternoon (14:00 - 17:00)', urgency: 'normal' as const },
  { label: 'Upcoming Weekend', time: 'Weekend Morning Slot', urgency: 'scheduled' as const },
];

export const ChatbotIntake: React.FC<ChatbotIntakeProps> = ({
  currentLocation,
  onJobCreated,
  activeJob,
}) => {
  const { showToast } = useToast();

  // Natural language prompt state
  const defaultPrompt =
    "My AC isn't cooling. I need someone tomorrow morning.";
  const [inputPrompt, setInputPrompt] = useState(defaultPrompt);

  // Extracted slots state
  const [slots, setSlots] = useState<ExtractedSlots>(() =>
    parseNaturalLanguageJob(defaultPrompt, currentLocation)
  );

  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingConfirmation, setIsEditingConfirmation] = useState(false);

  // Editable slot draft state
  const [editService, setEditService] = useState(slots.service);
  const [editTrade, setEditTrade] = useState<TradeCategory>(slots.serviceCategory);
  const [editSkills, setEditSkills] = useState<string[]>(slots.requiredSkills);
  const [editTimeSlot, setEditTimeSlot] = useState(slots.requestedTime);
  const [editUrgency, setEditUrgency] = useState(slots.urgency);
  const [editBudget, setEditBudget] = useState<string>(
    slots.budget ? String(slots.budget) : ''
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  // Handle prompt text change
  const handlePromptChange = (val: string) => {
    setInputPrompt(val);
    const parsed = parseNaturalLanguageJob(val, currentLocation);
    setSlots(parsed);
    syncDraftSlots(parsed);
  };

  const syncDraftSlots = (parsed: ExtractedSlots) => {
    setEditService(parsed.service);
    setEditTrade(parsed.serviceCategory);
    setEditSkills(parsed.requiredSkills);
    setEditTimeSlot(parsed.requestedTime);
    setEditUrgency(parsed.urgency);
    setEditBudget(parsed.budget ? String(parsed.budget) : '');
  };

  // Select sample preset prompt
  const handleSelectSample = (sampleText: string) => {
    setInputPrompt(sampleText);
    const parsed = parseNaturalLanguageJob(sampleText, currentLocation);
    setSlots(parsed);
    syncDraftSlots(parsed);

    const newJob = createJobRequestFromSlots(sampleText, parsed, currentLocation);
    onJobCreated(newJob);

    showToast({
      type: 'info',
      title: 'Prompt Loaded & Decoded',
      message: `Extracted ${parsed.service} • ${parsed.requestedTime}`,
    });
  };

  // Submit / parse prompt and update matching engine
  const handleAnalyzeAndMatch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseNaturalLanguageJob(inputPrompt, currentLocation);
      setSlots(parsed);
      syncDraftSlots(parsed);

      const newJob = createJobRequestFromSlots(inputPrompt, parsed, currentLocation);
      onJobCreated(newJob);
      setIsProcessing(false);

      showToast({
        type: 'success',
        title: 'Requirement Extracted & Passed to Engine',
        message: `${parsed.serviceCategory} • ${parsed.requestedTime} • Filtered within 10 km`,
      });
    }, 250);
  };

  // Save manual modifications from the confirmation card
  const handleSaveEdits = () => {
    const numericBudget = editBudget.trim() ? parseInt(editBudget.replace(/\D/g, ''), 10) : null;
    const updatedSlots: ExtractedSlots = {
      ...slots,
      service: editService,
      serviceCategory: editTrade,
      requiredSkills: editSkills,
      requestedTime: editTimeSlot,
      urgency: editUrgency,
      budget: numericBudget && !isNaN(numericBudget) ? numericBudget : null,
      budgetMax: numericBudget && !isNaN(numericBudget) ? numericBudget : 800,
    };

    setSlots(updatedSlots);
    setIsEditingConfirmation(false);

    const newJob = createJobRequestFromSlots(inputPrompt, updatedSlots, currentLocation);
    onJobCreated(newJob);

    showToast({
      type: 'success',
      title: 'Job Requirements Refined',
      message: `Updated parameters fed to ranking engine. Recommendations updated.`,
    });
  };

  // Add / remove skills during editing
  const handleAddSkill = () => {
    if (newSkillInput.trim() && !editSkills.includes(newSkillInput.trim())) {
      setEditSkills([...editSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  return (
    <div className="card-premium p-6 sm:p-8 bg-[#FFFFFF] mb-8 border border-black/[0.08] shadow-sm rounded-3xl space-y-6">
      {/* Conversational Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-[rgba(0,113,227,0.08)] text-[#0071E3]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Tell WorkLink What You Need
            </h2>
            <Badge variant="accent" size="sm">
              AI Slot Extraction
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1 max-w-2xl leading-relaxed">
            Describe your real-world service requirement in ordinary language. WorkLink automatically extracts the trade, required skills, timing, urgency, and budget constraints.
          </p>
        </div>

        {/* Quick Benchmark Prompt Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#86868B] font-medium mr-1">Presets:</span>
          {SAMPLE_PROMPTS.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sp.prompt)}
              className="text-[11px] px-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#111111] font-medium transition-all"
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Conversational Input */}
      <form onSubmit={handleAnalyzeAndMatch} className="space-y-3">
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            rows={3}
            placeholder="e.g. My AC isn't cooling. I need someone tomorrow morning."
            className="w-full p-4 pr-36 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-[#111111] text-sm focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3]/40 transition-all resize-none leading-relaxed shadow-inner"
          />
          <div className="absolute right-3.5 bottom-3.5 flex items-center space-x-2">
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

      {/* ============================================================== */}
      {/* CONCISE CONFIRMATION CARD (EXACT REQUIREMENT SPECIFICATION) */}
      {/* ============================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#F8F8FA] border border-black/[0.06] space-y-4 animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-black/5">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <h3 className="text-sm font-bold text-[#111111] tracking-tight">
              WorkLink Understood Your Requirement
            </h3>
            <Badge variant="success" size="sm">
              {(slots.confidenceScore * 100).toFixed(0)}% Confidence
            </Badge>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingConfirmation(!isEditingConfirmation)}
            className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingConfirmation ? 'Cancel Editing' : 'Edit Before Searching'}</span>
          </button>
        </div>

        {/* Read-Only Concise Confirmation Display */}
        {!isEditingConfirmation ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Service */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-black/[0.06] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block">
                Service
              </span>
              <p className="text-sm font-bold text-[#111111] truncate">{slots.service}</p>
              <span className="text-[11px] text-[#0071E3] font-medium block">
                {slots.serviceCategory}
              </span>
            </div>

            {/* 2. Required Skill */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-black/[0.06] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block">
                Required Skill
              </span>
              <div className="flex flex-wrap gap-1">
                {slots.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="text-[10px] font-semibold bg-[#F5F5F7] px-2 py-0.5 rounded-md text-[#111111]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. When / Time */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-black/[0.06] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block">
                When
              </span>
              <p className="text-sm font-bold text-[#111111] truncate">{slots.requestedTime}</p>
              <span className="text-[11px] text-[#86868B] capitalize block">
                {slots.urgency === 'emergency' ? '🚨 Immediate' : `${slots.urgency} urgency`}
              </span>
            </div>

            {/* 4. Location */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-black/[0.06] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block">
                Location
              </span>
              <p className="text-sm font-bold text-[#111111] truncate">
                {currentLocation.address.split(',')[0]}
              </p>
              <span className="text-[11px] text-[#5856D6] font-medium block">
                Dynamic 10 km Zone
              </span>
            </div>

            {/* 5. Budget */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-xl border border-black/[0.06] shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#86868B] tracking-wider block">
                Budget
              </span>
              <p className="text-sm font-bold text-[#111111]">
                {slots.budget !== null ? `₹${slots.budget}` : 'Not specified'}
              </p>
              <span className="text-[11px] text-[#86868B] block">
                {slots.budget !== null ? 'Budget ceiling active' : 'Standard fair rate'}
              </span>
            </div>
          </div>
        ) : (
          /* Inline Editing Interface */
          <div className="p-5 bg-[#FFFFFF] rounded-2xl border border-black/[0.08] shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-xs font-bold text-[#111111]">
                Refine Extracted Job Parameters
              </span>
              <span className="text-[11px] text-[#86868B]">
                Changes affect hard filters and ranking in real-time
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Service & Trade */}
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Service Category &amp; Trade
                </label>
                <select
                  value={editTrade}
                  onChange={(e) => {
                    const t = e.target.value as TradeCategory;
                    setEditTrade(t);
                    setEditService(`${t} Service`);
                  }}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/10 rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                >
                  {AVAILABLE_TRADES.map((trade) => (
                    <option key={trade} value={trade}>
                      {trade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slot Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Requested Time Window
                </label>
                <select
                  value={editTimeSlot}
                  onChange={(e) => {
                    const opt = TIME_SLOT_OPTIONS.find((o) => o.time === e.target.value);
                    if (opt) {
                      setEditTimeSlot(opt.time);
                      setEditUrgency(opt.urgency);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/10 rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                >
                  {TIME_SLOT_OPTIONS.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.label} ({slot.time})
                    </option>
                  ))}
                </select>
              </div>

              {/* Budget Field */}
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Max Budget Ceiling (₹)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Leave empty for Not specified"
                    value={editBudget}
                    onChange={(e) => setEditBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F5F5F7] border border-black/10 rounded-xl text-xs font-medium text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                  />
                  <button
                    type="button"
                    onClick={() => setEditBudget('')}
                    className="px-2.5 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[11px] font-semibold text-[#86868B] shrink-0"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Skills tag editor */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Required Capability Tags (Hard Filtered)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {editSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#0071E3]/10 text-[#0071E3] text-xs font-medium"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-[#FF3B30] ml-1 font-bold text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2 max-w-sm">
                <input
                  type="text"
                  placeholder="Add skill requirement (e.g. Inverter)"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full px-3 py-1.5 bg-[#F5F5F7] border border-black/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddSkill}>
                  Add
                </Button>
              </div>
            </div>

            {/* Save Edits Action */}
            <div className="pt-2 flex items-center justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingConfirmation(false)}
              >
                Discard Changes
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSaveEdits}
                leftIcon={<Check className="w-3.5 h-3.5" />}
              >
                Apply &amp; Re-Rank Candidates
              </Button>
            </div>
          </div>
        )}

        {/* Additional Mandatory Quality Constraints */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#6E6E73]">
          <span className="font-semibold text-[#111111] flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34C759]" />
            <span>Guaranteed Verification Checks:</span>
          </span>
          {slots.additionalConstraints.map((c, i) => (
            <span
              key={i}
              className="px-2.5 py-0.5 rounded-full bg-white border border-black/5 text-[11px] font-medium text-[#111111]"
            >
              ✓ {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
