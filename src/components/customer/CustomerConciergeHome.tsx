import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  Check,
  ChevronRight,
  Phone,
  MessageSquare,
  RotateCcw,
  Wrench,
  HelpCircle,
  FileText,
  DollarSign,
  Heart,
  Navigation,
  User,
  ShieldAlert,
  Info,
  Zap,
} from 'lucide-react';
import {
  Worker,
  RankedWorker,
  JobRequest,
  CustomerLocation,
  Booking,
  UserPersonalizationProfile,
} from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { parseNaturalLanguageJob, createJobRequestFromSlots } from '../../services/chatbotService';
import { ResponsibleAiBanner } from '../trust/ResponsibleAiBanner';
import { ResponsibleAiTrustModal } from '../trust/ResponsibleAiTrustModal';

export interface CustomerConciergeHomeProps {
  workers: Worker[];
  rankedEligible: RankedWorker[];
  allWorkersRanked: RankedWorker[];
  activeJob: JobRequest;
  customerLocation: CustomerLocation;
  userProfile?: UserPersonalizationProfile;
  activeBooking?: Booking | null;
  onBookClick: (worker: RankedWorker) => void;
  onViewProfileClick: (worker: RankedWorker) => void;
  onJobCreated: (job: JobRequest) => void;
  onNavigateToTab: (tab: any) => void;
  recentBookings?: Booking[];
  onOpenWeightsModal?: () => void;
}

export const CustomerConciergeHome: React.FC<CustomerConciergeHomeProps> = ({
  workers,
  rankedEligible,
  allWorkersRanked,
  activeJob,
  customerLocation,
  userProfile,
  activeBooking,
  onBookClick,
  onViewProfileClick,
  onJobCreated,
  onNavigateToTab,
  recentBookings = [],
  onOpenWeightsModal,
}) => {
  const { showToast } = useToast();

  // AI Intake input state
  const [promptInput, setPromptInput] = useState('');
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const intakeInputRef = useRef<HTMLInputElement>(null);
  const secondarySectionRef = useRef<HTMLDivElement>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    id: string;
    service: string;
    worker: string;
    date: string;
    amount: number;
  } | null>(null);

  // Quick suggestion chips for natural language intake
  const CONCIERGE_SUGGESTIONS = [
    { label: '❄️ AC Diagnostics & Gas Refill', prompt: "My split AC isn't cooling and the outdoor compressor is making a loud buzzing noise. Need an expert today." },
    { label: '🚰 Emergency Bathroom Pipe Leak', prompt: 'Urgent: Water is leaking from under the bathroom washbasin angle valve. Need a plumber right now.' },
    { label: '⚡ Tripping Circuit Breaker', prompt: 'Main MCB tripping repeatedly whenever high-load appliances turn on. Need certified electrician.' },
    { label: '🪚 Door Hinges & Modular Shelving', prompt: 'Modular wardrobe hinges loose and sliding door misaligned. Need carpenter for precision alignment.' },
    { label: '🧹 Post-Monsoon Deep Clean', prompt: 'Complete 2BHK deep sanitization and balcony pressure wash. Scheduled weekend morning.' },
  ];

  // Primary recommended worker (highest score from rankedEligible or allWorkersRanked)
  const primaryRecommendation: RankedWorker =
    rankedEligible[0] || allWorkersRanked[0] || {
      worker: workers[2] || workers[0],
      matchScore: 94,
      scoreBreakdown: {
        skillScore: 95,
        experienceScore: 90,
        availabilityScore: 95,
        qualityScore: 98,
        distanceScore: 92,
        priceScore: 90,
        personalizationScore: 96,
      },
      matchReasons: [
        'Top 1% rated AC Technician in Indiranagar',
        'Available for immediate dispatch (<45m)',
        '7+ years experience with inverter compressors',
      ],
      distanceKm: 3.2,
      estimatedPrice: 750,
      isPrimaryMatch: true,
    };

  // Secondary recommendations (workers 2 and 3)
  const secondaryRecommendations = (rankedEligible.length > 1 ? rankedEligible.slice(1, 4) : allWorkersRanked.slice(1, 4));

  // Handle AI prompt submission
  const handleConciergeSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = promptInput.trim();
    if (!query) return;

    const slots = parseNaturalLanguageJob(query, customerLocation);
    const newJob = createJobRequestFromSlots(query, slots, customerLocation);
    onJobCreated(newJob);

    showToast({
      type: 'success',
      title: 'Concierge Matches Updated',
      message: `Identified ${newJob.serviceCategory} need. Refreshed recommendations within your 10 km service zone.`,
    });
  };

  const handleChipSelect = (suggestionPrompt: string) => {
    setPromptInput(suggestionPrompt);
    const slots = parseNaturalLanguageJob(suggestionPrompt, customerLocation);
    const newJob = createJobRequestFromSlots(suggestionPrompt, slots, customerLocation);
    onJobCreated(newJob);

    showToast({
      type: 'info',
      title: 'Concierge Request Applied',
      message: `Analyzing skilled professionals for '${newJob.serviceCategory}'...`,
    });
  };

  // Recent completed services sample list
  const pastServices = [
    {
      id: 'srv-101',
      service: 'Inverter AC Jet Diagnostic & Clean',
      workerName: 'Rajesh Kumar',
      workerId: 'W3',
      workerAvatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      trade: 'AC Technician',
      date: '2 days ago',
      amount: 750,
      rating: 5.0,
      review: 'Diagnosed faulty capacitor immediately. Very thorough job.',
    },
    {
      id: 'srv-102',
      service: 'Bathroom Angle Valve & Trap Repair',
      workerName: 'Manoj Nair',
      workerId: 'W1',
      workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      trade: 'Plumber',
      date: '8 days ago',
      amount: 520,
      rating: 5.0,
      review: 'Prompt arrival within 25 minutes. No mess left behind.',
    },
    {
      id: 'srv-103',
      service: 'Main Sub-Distribution MCB Inspection',
      workerName: 'Suresh Patil',
      workerId: 'W5',
      workerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      trade: 'Electrician',
      date: '3 weeks ago',
      amount: 680,
      rating: 4.9,
      review: 'Checked earthing and balanced phase loads professionally.',
    },
  ];

  // Favorite professionals list
  const favoritePros = [
    {
      id: 'W3',
      name: 'Rajesh Kumar',
      trade: 'AC Technician',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 142,
      distanceKm: 3.2,
      availability: 'Available Now',
      hourlyRate: 550,
    },
    {
      id: 'W1',
      name: 'Manoj Nair',
      trade: 'Plumber',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 98,
      distanceKm: 4.1,
      availability: 'Slots Today',
      hourlyRate: 450,
    },
    {
      id: 'W5',
      name: 'Suresh Patil',
      trade: 'Electrician',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 115,
      distanceKm: 2.8,
      availability: 'Available Now',
      hourlyRate: 500,
    },
  ];

  // Helper to trigger direct booking for a worker ID
  const handleBookDirectWorkerId = (workerId: string) => {
    const found = allWorkersRanked.find((rw) => rw.worker.id === workerId);
    if (found) {
      onBookClick(found);
    } else {
      const raw = workers.find((w) => w.id === workerId);
      if (raw) {
        onBookClick({
          worker: raw,
          matchScore: 92,
          scoreBreakdown: {
            skillScore: 90,
            experienceScore: 90,
            availabilityScore: 90,
            qualityScore: 95,
            distanceScore: 90,
            priceScore: 90,
            personalizationScore: 95,
          },
          matchReasons: ['Previously booked and rated 5 stars by you'],
          distanceKm: raw.distanceKm,
          estimatedPrice: raw.estimatedQuote,
          isPrimaryMatch: false,
        });
      }
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* ============================================================== */}
      {/* 1. OPENING EXPERIENCE                                          */}
      {/* "Good morning." Then: "What do you need today?"                 */}
      {/* ============================================================== */}
      <div className="pt-2 sm:pt-4 space-y-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2">
            <span className="text-xs font-bold text-[#0071E3] bg-[#0071E3]/10 px-3 py-1 rounded-full flex items-center space-x-1.5 border border-[#0071E3]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>WorkLink Service Concierge</span>
            </span>
            <span className="text-xs text-[#86868B] flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#FF3B30] inline" />
              <span>{customerLocation.address.split(',')[0]} (10 km Zone)</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#111111]">
            Good morning.
          </h1>
          <p className="text-lg sm:text-xl font-medium text-[#6E6E73] tracking-tight">
            What do you need today?
          </p>
        </div>

        {/* ============================================================ */}
        {/* GLASS SURFACE 1: PRIMARY AI JOB INTAKE                       */}
        {/* (One of two high-value floating glass surfaces)              */}
        {/* ============================================================ */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-lg glass-specular-edge space-y-4 transition-all">
          <form onSubmit={handleConciergeSubmit} className="space-y-3">
            <div className="relative">
              <input
                ref={intakeInputRef}
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Describe what you need in plain words (e.g. My AC is leaking water, fix kitchen drain, replace main breaker...)"
                className="w-full pl-4 pr-32 sm:pr-40 py-4 sm:py-4.5 rounded-2xl bg-white/95 border border-black/10 text-sm sm:text-base text-[#111111] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3] shadow-inner transition-all"
              />
              <div className="absolute right-2 top-2 bottom-2 flex items-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="h-full px-4 sm:px-6 rounded-xl font-bold text-xs sm:text-sm bg-[#111111] hover:bg-black text-white flex items-center space-x-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-[#0071E3]" />
                  <span>Match</span>
                </Button>
              </div>
            </div>

            {/* Concierge Suggestion Quick Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-1 text-xs">
              <span className="text-[#86868B] font-semibold shrink-0 mr-1 text-[11px] uppercase tracking-wider">
                Quick Needs:
              </span>
              {CONCIERGE_SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChipSelect(item.prompt)}
                  className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-black/8 hover:border-black/20 text-[#111111] font-medium shrink-0 transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>

          {/* Active Intake Interpretation Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6E6E73] pt-2 border-t border-black/5 gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#111111]">Current Need:</span>
              <span className="bg-[#F5F5F7] text-[#111111] px-2.5 py-0.5 rounded-lg font-medium border border-black/5">
                {activeJob.serviceCategory}
              </span>
              <span className="truncate max-w-[240px] italic hidden md:inline">
                &ldquo;{activeJob.rawPrompt}&rdquo;
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center space-x-1 text-[#34C759] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 inline" />
                <span>Verified Professionals</span>
              </span>
              <span>•</span>
              <span className="text-[#0071E3] font-semibold">10 km Strict Radius</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE THREE CORE GOALS: IMMEDIATE CLARITY BRIEFING            */}
      {/* 1. What can I do?                                              */}
      {/* 2. What is WorkLink recommending?                              */}
      {/* 3. What is happening with my current service?                  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Goal 1: What can I do? */}
        <div className="p-5 rounded-3xl bg-white border border-black/6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-[#111111]">What can I do?</h3>
          </div>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Request any skilled repair in plain words, browse curated trade masters, or re-book your trusted repeat professionals.
          </p>
          <div className="flex items-center space-x-2 pt-1 text-xs">
            <button
              onClick={() => onNavigateToTab('marketplace')}
              className="text-[#0071E3] hover:underline font-bold flex items-center space-x-1"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Goal 2: What is WorkLink recommending? */}
        <div className="p-5 rounded-3xl bg-white border border-black/6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5856D6]/10 text-[#5856D6] flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-[#111111]">What is WorkLink recommending?</h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <img
              src={primaryRecommendation.worker.avatar}
              alt={primaryRecommendation.worker.name}
              className="w-7 h-7 rounded-lg object-cover ring-1 ring-black/5"
            />
            <div className="truncate">
              <span className="font-bold text-[#111111]">{primaryRecommendation.worker.name}</span>
              <span className="text-[#86868B] ml-1.5">• {primaryRecommendation.matchScore}% Match</span>
            </div>
          </div>
          <p className="text-xs text-[#6E6E73] truncate">
            {primaryRecommendation.matchReasons[0] || 'Top qualified candidate within 10 km'}
          </p>
        </div>

        {/* Goal 3: What is happening with my current service? */}
        <div className="p-5 rounded-3xl bg-white border border-black/6 shadow-xs space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-[#111111]">What is happening with my service?</h3>
          </div>
          {activeBooking ? (
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111] truncate">{activeBooking.job.serviceCategory}</span>
                <Badge variant={activeBooking.status === 'in_progress' ? 'success' : 'accent'} size="sm">
                  {activeBooking.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-[#6E6E73] text-[11px]">
                {activeBooking.workerStatusMessage || 'Awaiting Worker Acceptance'}
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-xs text-[#6E6E73]">
              <p className="font-medium text-[#111111] flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] inline" />
                <span>All services complete</span>
              </p>
              <p className="text-[11px]">No active work right now. Ready for your next booking.</p>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: RECOMMENDED FOR YOU                                 */}
      {/* (Features GLASS SURFACE 2: Primary Recommendation)             */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Recommended for you
            </h2>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
              Personalized matches calibrated to your request, skills required, and proximity.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('marketplace')}
            className="text-xs font-semibold text-[#0071E3] hover:underline flex items-center space-x-1"
          >
            <span>View all candidates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* GLASS SURFACE 2: PRIMARY RECOMMENDATION CARD                 */}
        {/* (The second of two high-value floating glass surfaces)       */}
        {/* ============================================================ */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-md glass-specular-edge space-y-5 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative shrink-0">
                <img
                  src={primaryRecommendation.worker.avatar}
                  alt={primaryRecommendation.worker.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-black/5 shadow-xs"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34C759] border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#111111]">
                    {primaryRecommendation.worker.name}
                  </h3>
                  <Badge variant="accent" size="sm">
                    {primaryRecommendation.worker.trade}
                  </Badge>
                  <Badge variant="success" size="sm">
                    Verified Pro
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E6E73]">
                  <span className="flex items-center text-[#FF9500] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#FF9500] inline mr-1" />
                    {primaryRecommendation.worker.rating.toFixed(1)} ({primaryRecommendation.worker.reviewCount} reviews)
                  </span>
                  <span>•</span>
                  <span className="flex items-center text-[#0071E3] font-medium">
                    <Navigation className="w-3 h-3 inline mr-1" />
                    {primaryRecommendation.distanceKm.toFixed(1)} km away
                  </span>
                  <span>•</span>
                  <span>{primaryRecommendation.worker.experienceYears} yrs experience</span>
                </div>

                <p className="text-xs text-[#34C759] font-semibold flex items-center space-x-1 pt-0.5">
                  <Clock className="w-3.5 h-3.5 inline" />
                  <span>Available for immediate 45m dispatch in Indiranagar</span>
                </p>
              </div>
            </div>

            {/* Match Score & Tariff */}
            <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-black/5 gap-2">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
                  {primaryRecommendation.matchScore}%
                </span>
                <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
                  Match
                </span>
              </div>
              <div className="text-left lg:text-right">
                <span className="text-sm font-bold text-[#111111]">
                  ₹{primaryRecommendation.worker.hourlyRate}
                </span>
                <span className="text-xs text-[#86868B]">/hr standard rate</span>
              </div>
            </div>
          </div>

          {/* Explainability Callout (Why Recommended) */}
          <div className="p-3.5 rounded-2xl bg-white/70 border border-black/5 text-xs text-[#111111] space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0071E3] block">
                Why WorkLink Recommended This Professional:
              </span>
              <button
                type="button"
                onClick={() => setIsTrustModalOpen(true)}
                className="text-xs font-bold text-[#0071E3] hover:underline flex items-center space-x-1 self-start sm:self-auto"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Explain Match &amp; Responsible AI</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {primaryRecommendation.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-[#6E6E73]">
                  <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0 mt-0.5" />
                  <span className="text-xs">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-1">
            <Button
              variant="outline"
              size="md"
              onClick={() => onViewProfileClick(primaryRecommendation)}
              className="w-full sm:w-auto text-xs font-bold"
            >
              View Full Profile
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onBookClick(primaryRecommendation)}
              className="w-full sm:w-auto text-xs font-bold bg-[#111111] hover:bg-black text-white px-6 shadow-sm"
            >
              Book this professional
            </Button>
          </div>
        </div>

        {/* RESPONSIBLE AI & USER CONTROL BANNER (Milestone 19) */}
        {/* "AI recommends. Human decides."                     */}
        <ResponsibleAiBanner
          primaryWorker={primaryRecommendation}
          onOpenTrustModal={() => setIsTrustModalOpen(true)}
          onChangeRequirements={() => {
            intakeInputRef.current?.focus();
            intakeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast({
              type: 'info',
              title: 'Modify Job Requirements',
              message: 'Update your service request in the concierge box above.',
            });
          }}
          onChangePreferences={onOpenWeightsModal}
          onViewAlternatives={() => {
            if (secondarySectionRef.current) {
              secondarySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
              onNavigateToTab('marketplace');
            }
          }}
          onOverrideRecommendation={() => {
            if (secondaryRecommendations.length > 0) {
              onBookClick(secondaryRecommendations[0]);
            }
          }}
        />

        {/* Secondary Recommendations (Solid Surfaces) */}
        {secondaryRecommendations.length > 0 && (
          <div ref={secondarySectionRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {secondaryRecommendations.map((rw) => (
              <div
                key={rw.worker.id}
                className="p-4 rounded-2xl bg-white border border-black/6 shadow-xs space-y-3 hover:border-black/15 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={rw.worker.avatar}
                    alt={rw.worker.name}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-black/5"
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-bold text-[#111111] truncate">{rw.worker.name}</h4>
                    <span className="text-xs text-[#6E6E73] block truncate">{rw.worker.trade}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#6E6E73] pt-1 border-t border-black/5">
                  <span className="text-[#FF9500] font-bold">★ {rw.worker.rating.toFixed(1)}</span>
                  <span>{rw.distanceKm.toFixed(1)} km</span>
                  <span className="font-bold text-[#0071E3]">{rw.matchScore}% Match</span>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfileClick(rw)}
                    className="flex-1 text-xs"
                  >
                    Profile
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onBookClick(rw)}
                    className="flex-1 text-xs bg-[#111111] text-white"
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: UPCOMING BOOKING                                    */}
      {/* (Normal Solid Surface)                                         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Upcoming booking
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            Real-time status of your active service and scheduled technician arrival.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/6 shadow-xs space-y-4">
          {activeBooking ? (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeBooking.worker.avatar}
                    alt={activeBooking.worker.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/5"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-[#111111]">
                        {activeBooking.job.serviceCategory}
                      </h3>
                      <Badge
                        variant={
                          activeBooking.status === 'in_progress'
                            ? 'success'
                            : activeBooking.status === 'completed'
                            ? 'default'
                            : 'accent'
                        }
                        size="sm"
                      >
                        {activeBooking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6E6E73]">
                      Technician: <strong>{activeBooking.worker.name}</strong> • License: {activeBooking.worker.licenseNumber}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#86868B] block">Estimated Total</span>
                  <span className="text-lg font-extrabold text-[#111111]">
                    ₹{activeBooking.finalTotal || activeBooking.estimatedTotal}
                  </span>
                </div>
              </div>

              {/* Service Logistics preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[#86868B] block text-[11px] font-semibold">Scheduled Window</span>
                  <p className="font-bold text-[#111111] mt-0.5">
                    {activeBooking.scheduledDate || 'Today'}, {activeBooking.scheduledTimeSlot || 'Immediate'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[#86868B] block text-[11px] font-semibold">Service Address</span>
                  <p className="font-bold text-[#111111] mt-0.5 truncate">
                    {customerLocation.address}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[#86868B] block text-[11px] font-semibold">Technician Status</span>
                  <p className="font-bold text-[#0071E3] mt-0.5 truncate">
                    {activeBooking.workerStatusMessage || 'Awaiting Confirmation'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#86868B]">
                  Booking Reference #{activeBooking.id.slice(0, 8)}
                </span>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigateToTab('active_booking')}
                  className="bg-[#111111] text-white text-xs font-bold"
                >
                  Track Live Service Execution &rarr;
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#86868B] flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#111111]">
                No upcoming service scheduled
              </h3>
              <p className="text-xs text-[#6E6E73] max-w-sm mx-auto">
                Whenever you book a professional, live tracking, technician arrival status, and working clock logs will appear right here.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateToTab('marketplace')}
                className="text-xs font-semibold"
              >
                Schedule a Service
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: RECENT SERVICES                                     */}
      {/* (Normal Solid Surface)                                         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Recent services
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            Completed service visits with verified transparent invoices.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/6 shadow-xs space-y-4">
          <div className="divide-y divide-black/5">
            {pastServices.map((srv) => (
              <div key={srv.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={srv.workerAvatar}
                    alt={srv.workerName}
                    className="w-11 h-11 rounded-xl object-cover ring-1 ring-black/5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-[#111111]">{srv.service}</h4>
                    <p className="text-xs text-[#6E6E73]">
                      Fulfilled by <strong>{srv.workerName}</strong> ({srv.trade}) • {srv.date}
                    </p>
                    <p className="text-[11px] text-[#FF9500] font-semibold flex items-center space-x-1">
                      <span>★ {srv.rating.toFixed(1)}</span>
                      <span className="text-[#86868B]">• &ldquo;{srv.review}&rdquo;</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-black/5">
                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-[#111111] block">₹{srv.amount}</span>
                    <span className="text-[10px] text-[#34C759] font-medium">Settled via Escrow</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setSelectedReceipt({
                          id: srv.id,
                          service: srv.service,
                          worker: srv.workerName,
                          date: srv.date,
                          amount: srv.amount,
                        })
                      }
                      className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-semibold text-[#111111] hover:bg-[#F5F5F7] transition-all"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => handleBookDirectWorkerId(srv.workerId)}
                      className="px-3 py-1.5 rounded-xl bg-[#111111] text-white text-xs font-semibold hover:bg-black transition-all"
                    >
                      Book Again
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: FAVORITE PROFESSIONALS                              */}
      {/* (Normal Solid Surface)                                         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Favorite professionals
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            Your saved and trusted tradespeople with proven track records in your 10 km service zone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favoritePros.map((pro) => (
            <div
              key={pro.id}
              className="p-5 rounded-3xl bg-white border border-black/6 shadow-xs space-y-4 hover:border-black/15 transition-all"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={pro.avatar}
                  alt={pro.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/5"
                />
                <div className="truncate">
                  <h4 className="text-sm font-bold text-[#111111] truncate">{pro.name}</h4>
                  <span className="text-xs text-[#6E6E73] block truncate">{pro.trade}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-[#6E6E73]">
                <div className="flex items-center justify-between">
                  <span className="text-[#FF9500] font-bold flex items-center">
                    <Star className="w-3 h-3 fill-[#FF9500] inline mr-1" />
                    {pro.rating.toFixed(1)} ({pro.reviewCount})
                  </span>
                  <span className="text-[#0071E3] font-semibold">{pro.distanceKm.toFixed(1)} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#34C759] font-medium">{pro.availability}</span>
                  <span className="font-bold text-[#111111]">₹{pro.hourlyRate}/h</span>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => handleBookDirectWorkerId(pro.id)}
                  className="w-full py-2.5 rounded-xl bg-[#F5F5F7] hover:bg-[#111111] text-[#111111] hover:text-white font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                >
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                  <span>Book Direct</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: ACTIVITY                                            */}
      {/* (Normal Solid Surface)                                         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Activity
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            Transparent event trail and safety audits for your home services.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/6 shadow-xs space-y-4">
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-black/5 text-xs">
            {[
              {
                title: 'Escrow Settlement Finalized',
                desc: '₹750 payment released to Rajesh Kumar after your 5-star rating confirmation.',
                time: 'Yesterday, 17:15',
                icon: DollarSign,
                color: 'text-[#34C759] bg-emerald-50',
              },
              {
                title: 'Service Completed Onsite',
                desc: 'Rajesh Kumar finalized AC diagnostic. Working duration logged: 1 hr 12 mins.',
                time: 'Yesterday, 16:30',
                icon: CheckCircle2,
                color: 'text-[#0071E3] bg-blue-50',
              },
              {
                title: 'Fair Price Guarantee Verified',
                desc: 'Within 5 km radius. Travel tariff waived per transparent tariff rules.',
                time: 'Yesterday, 15:00',
                icon: ShieldCheck,
                color: 'text-[#5856D6] bg-purple-50',
              },
              {
                title: '10 km Dispatch Radar Anchored',
                desc: `Service zone calibrated around ${customerLocation.address.split(',')[0]}.`,
                time: '3 days ago',
                icon: Navigation,
                color: 'text-[#FF9500] bg-amber-50',
              },
            ].map((ev, idx) => {
              const Icon = ev.icon;
              return (
                <div key={idx} className="relative flex items-start space-x-3.5 pl-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${ev.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#111111]">{ev.title}</span>
                      <span className="text-[11px] text-[#86868B]">{ev.time}</span>
                    </div>
                    <p className="text-[#6E6E73]">{ev.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: SUPPORT                                             */}
      {/* (Normal Solid Surface)                                         */}
      {/* ============================================================== */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Support
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
            WorkLink concierge assistance, fair pricing protection, and trust guarantees.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-black/6 shadow-xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white text-[#0071E3] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#111111]">Fair Price Guarantee</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Zero surge pricing. Guaranteed transparent tariffs with no hidden travel fees beyond the 10 km zone.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white text-[#34C759] flex items-center justify-center shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#111111]">₹25,000 Property Protection</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Every booking is insured with WorkLink comprehensive property damage protection warranty.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2">
              <div className="w-8 h-8 rounded-xl bg-white text-[#5856D6] flex items-center justify-center shadow-2xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#111111]">24/7 Concierge Desk</h4>
              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Direct phone and chat assistance for technician matching, schedule adjustments, or emergency inquiries.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-black/5 gap-3">
            <div className="flex items-center space-x-2 text-xs text-[#6E6E73]">
              <Info className="w-4 h-4 text-[#0071E3]" />
              <span>Need help with a special tool or complex diagnostic request?</span>
            </div>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsSupportModalOpen(true)}
              className="text-xs font-bold w-full sm:w-auto"
            >
              Contact Concierge Desk
            </Button>
          </div>
        </div>
      </section>

      {/* Support Modal */}
      {isSupportModalOpen && (
        <Modal
          isOpen={isSupportModalOpen}
          onClose={() => setIsSupportModalOpen(false)}
          title="WorkLink Concierge Support Desk"
          subtitle="24/7 dedicated service coordination & customer care"
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsSupportModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsSupportModalOpen(false);
                  showToast({
                    type: 'success',
                    title: 'Concierge Request Sent',
                    message: 'A service coordinator will reach you via WhatsApp / Phone in under 5 minutes.',
                  });
                }}
              >
                Send Request
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-[#6E6E73]">
              Our concierge team is standing by to assist with emergency dispatches, schedule changes, or billing queries.
            </p>

            <div className="space-y-2">
              <label className="font-semibold text-[#111111] block">How can we help you?</label>
              <select className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs">
                <option value="reschedule">Reschedule or modify an existing booking</option>
                <option value="emergency">Emergency technician dispatch (&lt;30 mins)</option>
                <option value="billing">Invoice or tariff explanation</option>
                <option value="special">Special diagnostic equipment request</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-[#F5F5F7] space-y-1">
              <span className="font-bold text-[#111111] block">Direct Concierge Hotline</span>
              <p className="text-[#6E6E73]">Call: +91 80 4000 8899 • Mon-Sun 24/7</p>
              <p className="text-[#0071E3] font-semibold">Priority response time: &lt; 2 minutes</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title="WorkLink Service Receipt"
          subtitle={`Reference #${selectedReceipt.id}`}
          maxWidth="sm"
          footer={
            <Button variant="primary" size="sm" onClick={() => setSelectedReceipt(null)} className="w-full">
              Close Receipt
            </Button>
          }
        >
          <div className="space-y-3 py-2 text-xs">
            <div className="p-4 rounded-2xl bg-[#F5F5F7] space-y-2">
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Service:</span>
                <span className="font-bold text-[#111111]">{selectedReceipt.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Technician:</span>
                <span className="font-bold text-[#111111]">{selectedReceipt.worker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E6E73]">Date:</span>
                <span className="font-bold text-[#111111]">{selectedReceipt.date}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-black/5 font-extrabold text-[#111111] text-sm">
                <span>Total Amount Paid:</span>
                <span className="text-[#34C759]">₹{selectedReceipt.amount}</span>
              </div>
            </div>
            <p className="text-[11px] text-[#86868B] text-center">
              Verified tax invoice issued by WorkLink Workforce Intelligence Platform.
            </p>
          </div>
        </Modal>
      )}

      {/* Responsible AI & Trust Architecture Modal */}
      {isTrustModalOpen && (
        <ResponsibleAiTrustModal
          isOpen={isTrustModalOpen}
          onClose={() => setIsTrustModalOpen(false)}
          primaryMatch={primaryRecommendation}
          alternativeMatches={secondaryRecommendations}
          activeJob={activeJob}
          onChangeRequirements={() => {
            setIsTrustModalOpen(false);
            intakeInputRef.current?.focus();
            intakeInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast({
              type: 'info',
              title: 'Modify Job Requirements',
              message: 'Update your service request in the concierge box above.',
            });
          }}
          onChangePreferences={() => {
            setIsTrustModalOpen(false);
            if (onOpenWeightsModal) onOpenWeightsModal();
          }}
          onViewAlternatives={() => {
            setIsTrustModalOpen(false);
            if (secondarySectionRef.current) {
              secondarySectionRef.current.scrollIntoView({ behavior: 'smooth' });
            } else {
              onNavigateToTab('marketplace');
            }
          }}
          onOverrideRecommendation={(worker) => {
            setIsTrustModalOpen(false);
            onBookClick(worker);
          }}
        />
      )}
    </div>
  );
};
