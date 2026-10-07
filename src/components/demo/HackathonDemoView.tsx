import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  UserCheck,
  RotateCcw,
  ArrowRight,
  Sliders,
  Calendar,
  DollarSign,
  Layers,
  Compass,
  Eye,
  Zap,
  FlaskConical,
  ChevronRight,
  Info,
  Check,
  Wrench,
  Navigation,
  FileText,
  Briefcase,
} from 'lucide-react';
import {
  Worker,
  RankedWorker,
  JobRequest,
  CustomerLocation,
  MatchingWeights,
  UserPersonalizationProfile,
  Booking,
} from '../../types';
import { INITIAL_WORKERS, DEFAULT_CUSTOMER_LOCATION } from '../../data/mockWorkers';
import { calculateEstimatedPrice, calculateFinalPrice } from '../../services/pricingEngine';
import { getTravelBand } from '../../services/locationService';
import { rankWorkers, DEFAULT_WEIGHT_PRESETS } from '../../services/matchingEngine';
import { parseNaturalLanguageJob, createJobRequestFromSlots } from '../../services/chatbotService';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TransparentPriceSummary } from '../pricing/TransparentPriceSummary';
import { ResponsibleAiBanner } from '../trust/ResponsibleAiBanner';
import { ResponsibleAiTrustModal } from '../trust/ResponsibleAiTrustModal';

export type DemoScenarioId =
  | 'scenario_1_ac_repair'
  | 'scenario_2_electrician'
  | 'scenario_3_personalization'
  | 'scenario_4_10km_exclusion'
  | 'scenario_5_unavailable'
  | 'appendix_g_benchmark';

export interface HackathonDemoViewProps {
  workers?: Worker[];
  onOpenWorkerProfile?: (worker: RankedWorker) => void;
  onOpenBookingModal?: (worker: RankedWorker) => void;
  onApplyToLiveApp?: (job: JobRequest, location: CustomerLocation, profile?: UserPersonalizationProfile) => void;
}

// Synthetic / Demo data identifier tag
export const DEMO_DATASET_METADATA = {
  identifier: 'WORKLINK_SYNTHETIC_DELHI_V2',
  source: 'SDS Hackathon Simulated Trades Telemetry',
  simulatedCenter: 'Hauz Khas Enclave, New Delhi (10.0 km zone)',
  isSynthetic: true,
  disclaimer: 'Synthetic demonstration dataset. Calibrated to Delhi NCR market wages and trade standards; does not represent fabricated real-world claims.',
};

export const HackathonDemoView: React.FC<HackathonDemoViewProps> = ({
  workers = INITIAL_WORKERS,
  onOpenWorkerProfile,
  onOpenBookingModal,
  onApplyToLiveApp,
}) => {
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('scenario_1_ac_repair');
  const [activeStrategy, setActiveStrategy] = useState<'worklink' | 'nearest' | 'rating' | 'skills'>('worklink');
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [selectedInspectWorker, setSelectedInspectWorker] = useState<RankedWorker | null>(null);

  // Scenario 1: AC REPAIR
  // Prompt: "My AC isn't cooling. I need someone tomorrow morning."
  const scenario1Job = useMemo<JobRequest>(() => {
    const prompt = "My AC isn't cooling. I need someone tomorrow morning.";
    const slots = parseNaturalLanguageJob(prompt, DEFAULT_CUSTOMER_LOCATION);
    return createJobRequestFromSlots(prompt, slots, DEFAULT_CUSTOMER_LOCATION);
  }, []);

  // Scenario 2: ELECTRICIAN
  // Prompt: "I need an electrician tomorrow morning for a wiring issue."
  const scenario2Job = useMemo<JobRequest>(() => {
    const prompt = 'I need an electrician tomorrow morning for a wiring issue.';
    const slots = parseNaturalLanguageJob(prompt, DEFAULT_CUSTOMER_LOCATION);
    return createJobRequestFromSlots(prompt, slots, DEFAULT_CUSTOMER_LOCATION);
  }, []);

  // Scenario 3: PERSONALIZATION (Returning user with previous 5-star booking)
  const returningUserProfile: UserPersonalizationProfile = {
    previousSearches: ['AC Repair', 'Split Inverter Maintenance'],
    previousBookingsCount: 4,
    frequentlyUsedTrades: ['AC Technician', 'Plumber'],
    preferredDistanceMaxKm: 5.0,
    priceSensitivity: 'medium',
    repeatWorkersBooked: ['W3'], // Previously booked Manoj Sharma (W3)
    avgRatingGiven: 5.0,
    hasCancellations: false,
  };

  const scenario3Job = useMemo<JobRequest>(() => {
    const prompt = 'Need annual maintenance and coolant check for split AC.';
    const slots = parseNaturalLanguageJob(prompt, DEFAULT_CUSTOMER_LOCATION);
    return createJobRequestFromSlots(prompt, slots, DEFAULT_CUSTOMER_LOCATION);
  }, []);

  // Scenario 4: 10 KM EXCLUSION
  const scenario4Job = useMemo<JobRequest>(() => {
    const prompt = 'Commercial grade heavy chiller maintenance. Need 8+ years experience master technician.';
    const slots = parseNaturalLanguageJob(prompt, DEFAULT_CUSTOMER_LOCATION);
    return createJobRequestFromSlots(prompt, slots, DEFAULT_CUSTOMER_LOCATION);
  }, []);

  // Scenario 5: UNAVAILABLE EXCLUSION
  const scenario5Job = useMemo<JobRequest>(() => {
    const prompt = 'Immediate emergency: AC compressor smoking right now, need dispatch in 30 mins.';
    const slots = parseNaturalLanguageJob(prompt, DEFAULT_CUSTOMER_LOCATION);
    return {
      ...createJobRequestFromSlots(prompt, slots, DEFAULT_CUSTOMER_LOCATION),
      urgency: 'emergency',
      requestedTime: 'immediate',
    };
  }, []);

  // Compute rankings for the active scenario
  const currentScenarioJob = useMemo(() => {
    switch (activeScenario) {
      case 'scenario_1_ac_repair':
        return scenario1Job;
      case 'scenario_2_electrician':
        return scenario2Job;
      case 'scenario_3_personalization':
        return scenario3Job;
      case 'scenario_4_10km_exclusion':
        return scenario4Job;
      case 'scenario_5_unavailable':
        return scenario5Job;
      default:
        return scenario1Job;
    }
  }, [activeScenario, scenario1Job, scenario2Job, scenario3Job, scenario4Job, scenario5Job]);

  const currentProfile = activeScenario === 'scenario_3_personalization' ? returningUserProfile : undefined;

  const { rankedEligible, excludedWorkers, allWorkersRanked } = useMemo(() => {
    return rankWorkers(workers, currentScenarioJob, DEFAULT_WEIGHT_PRESETS[0], currentProfile);
  }, [workers, currentScenarioJob, currentProfile]);

  const bestMatch = rankedEligible[0] || allWorkersRanked[0];
  const runnerUp = rankedEligible[1];

  // Benchmark workers for Appendix G tab
  const benchmarkWorkers = workers.filter((w) => w.isBenchmarkWorker);

  // Excluded Worker for Scenario 4: Vikram Singh (W6)
  const worker10KmExcluded = workers.find((w) => w.id === 'W6') || {
    id: 'W6',
    name: 'Vikram Singh',
    trade: 'AC Technician',
    skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Heavy Chillers'],
    experienceYears: 9,
    hourlyRate: 400,
    estimatedQuote: 700,
    rating: 4.9,
    reviewCount: 165,
    completedJobs: 340,
    completionRate: 0.98,
    responseTimeMinutes: 30,
    isVerified: true,
    licenseNumber: 'AC-DL-2017-310',
    backgroundCheckPassed: true,
    phone: '+91 98104 99120',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior HVAC master technician with 9 years commercial & high-end inverter experience. Top rated in North India.',
    coordinates: { lat: 28.625, lng: 77.295 },
    distanceKm: 11.4,
    availabilityStatus: 'immediate',
    nextAvailableSlot: 'Immediate',
    toolsEquipped: ['Full Heavy Refrigeration Kit', 'Industrial Manifold', 'Thermal Gun'],
    recentReviews: [],
    notes: 'Excluded by hard constraint: worker is at 11.4 km, exceeding the dynamic 10 km service zone boundary.',
    isBenchmarkWorker: true,
  };

  // Excluded Worker for Scenario 5: Suresh Verma (W2)
  const workerUnavailableExcluded = workers.find((w) => w.id === 'W2') || {
    id: 'W2',
    name: 'Suresh Verma',
    trade: 'AC Technician',
    skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Compressor Overhaul'],
    experienceYears: 8,
    hourlyRate: 450,
    estimatedQuote: 900,
    rating: 4.9,
    reviewCount: 142,
    completedJobs: 310,
    completionRate: 0.99,
    responseTimeMinutes: 45,
    isVerified: true,
    licenseNumber: 'AC-DL-2018-442',
    backgroundCheckPassed: true,
    phone: '+91 98112 88412',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Master HVAC & Inverter AC specialist with 8 years institutional and residential repair expertise.',
    coordinates: { lat: 28.584, lng: 77.242 },
    distanceKm: 6.5,
    availabilityStatus: 'tomorrow',
    nextAvailableSlot: 'Tomorrow 10:00 AM',
    toolsEquipped: ['Nitrogen Leak Testing Kit', 'Digital Manifold Gauge', 'PCB Soldering Station', 'Vacuum Pump'],
    recentReviews: [],
    notes: 'Highest rated candidate (4.9). Excluded because user requested immediate service, but Suresh is booked until tomorrow morning.',
    isBenchmarkWorker: true,
  };

  // Pre-calculated pricing estimate for best match
  const bestMatchEstimate = useMemo(() => {
    if (!bestMatch) return null;
    return calculateEstimatedPrice(bestMatch.worker.hourlyRate, 2.0, bestMatch.worker.distanceKm);
  }, [bestMatch]);

  // Pre-calculated final pricing simulation
  const bestMatchFinalCalculation = useMemo(() => {
    if (!bestMatch) return null;
    return calculateFinalPrice(
      bestMatch.worker.hourlyRate,
      1.75, // 1h 45m actual working time
      bestMatch.worker.distanceKm,
      [
        { name: 'R-32 Refrigerant Top-up (300g)', cost: 350, approved: true },
        { name: 'Anti-Vibration Rubber Dampers', cost: 150, approved: true },
      ],
      50 // standard promotional discount
    );
  }, [bestMatch]);

  const handleInspectWorker = (worker: RankedWorker) => {
    setSelectedInspectWorker(worker);
    if (onOpenWorkerProfile) {
      onOpenWorkerProfile(worker);
    }
  };

  const handleBookWorker = (worker: RankedWorker) => {
    if (onOpenBookingModal) {
      onOpenBookingModal(worker);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs pb-16">
      {/* ============================================================== */}
      {/* 1. PREMIUM HERO: Controlled Evaluation Environment             */}
      {/* ============================================================== */}
      <div className="rounded-3xl bg-white/95 sm:bg-white/90 backdrop-blur-md sm:backdrop-blur-xl border border-white/80 glass-specular-edge p-6 sm:p-8 shadow-sm space-y-6 motion-glass-appear">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#111111] text-white text-[10px] font-mono uppercase tracking-wider font-bold">
                Controlled Demo Mode
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-[10px] font-bold border border-[#34C759]/20">
                Deterministic Evaluator
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight">
              WorkLink Demo Hub
            </h1>

            <p className="text-xs sm:text-sm text-[#6E6E73] max-w-2xl leading-relaxed">
              Showcases the full intelligence pipeline and Cupertino material interface across the 5 core validation scenarios.
              Select any scenario below to evaluate end-to-end matching, radius guardrails, and user controls.
            </p>
          </div>

          {/* Internal Demo Data Metadata Callout */}
          <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/6 text-left space-y-1.5 shrink-0 max-w-xs">
            <div className="flex items-center space-x-1.5 text-[#86868B]">
              <Info className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                Internal Demo Identifier
              </span>
            </div>
            <p className="font-mono text-[11px] font-bold text-[#111111]">
              {DEMO_DATASET_METADATA.identifier}
            </p>
            <p className="text-[10px] text-[#86868B] leading-tight">
              {DEMO_DATASET_METADATA.disclaimer}
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SCENARIO SELECTOR BUTTONS (1 to 5 + Appendix G Benchmark)       */}
        {/* ============================================================== */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868B] block mb-2 font-bold">
            Select Evaluation Scenario:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Scenario 1 */}
            <button
              type="button"
              onClick={() => setActiveScenario('scenario_1_ac_repair')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'scenario_1_ac_repair'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Scenario 1: AC Repair</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-[#0071E3] font-bold">
                  Full Pipeline
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'scenario_1_ac_repair' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                &ldquo;My AC isn&apos;t cooling. I need someone tomorrow morning.&rdquo;
              </p>
              <span className="text-[10px] font-semibold text-[#34C759] mt-2 block">
                AI Understanding &rarr; Best Match (Manoj) &rarr; Booking
              </span>
            </button>

            {/* Scenario 2 */}
            <button
              type="button"
              onClick={() => setActiveScenario('scenario_2_electrician')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'scenario_2_electrician'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Scenario 2: Electrician</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-[#AF52DE] font-bold">
                  Dynamic Trade
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'scenario_2_electrician' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                &ldquo;I need an electrician tomorrow morning for a wiring issue.&rdquo;
              </p>
              <span className="text-[10px] font-semibold text-[#0071E3] mt-2 block">
                Different Recommendation &rarr; Mohit Saxena (W8)
              </span>
            </button>

            {/* Scenario 3 */}
            <button
              type="button"
              onClick={() => setActiveScenario('scenario_3_personalization')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'scenario_3_personalization'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Scenario 3: Personalization</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-[#FF9500] font-bold">
                  Returning User
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'scenario_3_personalization' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                &ldquo;Recommended for you&rdquo; • &ldquo;Based on your previous booking&rdquo;
              </p>
              <span className="text-[10px] font-semibold text-[#FF9500] mt-2 block">
                Repeat Booking Affinity (+15%) Boost
              </span>
            </button>

            {/* Scenario 4 */}
            <button
              type="button"
              onClick={() => setActiveScenario('scenario_4_10km_exclusion')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'scenario_4_10km_exclusion'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Scenario 4: 10 km Exclusion</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-[#FF3B30] font-bold">
                  Radius Guardrail
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'scenario_4_10km_exclusion' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                High-skilled senior master technician outside 10 km strictly excluded.
              </p>
              <span className="text-[10px] font-semibold text-[#FF3B30] mt-2 block">
                Vikram Singh (11.4 km &gt; 10 km) Excluded
              </span>
            </button>

            {/* Scenario 5 */}
            <button
              type="button"
              onClick={() => setActiveScenario('scenario_5_unavailable')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'scenario_5_unavailable'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Scenario 5: Unavailable</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-amber-500 font-bold">
                  Schedule Filter
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'scenario_5_unavailable' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                Strongest 4.9★ candidate excluded because busy / booked.
              </p>
              <span className="text-[10px] font-semibold text-amber-600 mt-2 block">
                Suresh Verma (Unavailable) Excluded
              </span>
            </button>

            {/* Appendix G Simulator */}
            <button
              type="button"
              onClick={() => setActiveScenario('appendix_g_benchmark')}
              className={`p-3.5 rounded-2xl text-left border transition-all hover-lift active-press flex flex-col justify-between ${
                activeScenario === 'appendix_g_benchmark'
                  ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                  : 'bg-white hover:bg-[#F5F5F7] border-black/8 text-[#111111]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs">Appendix G Benchmark</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-indigo-400 font-bold">
                  RQ6 / H5 Test
                </span>
              </div>
              <p className={`text-[11px] mt-1.5 line-clamp-2 ${activeScenario === 'appendix_g_benchmark' ? 'text-stone-300' : 'text-[#6E6E73]'}`}>
                Single-factor shortcuts fail vs Multi-factor algorithm.
              </p>
              <span className="text-[10px] font-semibold text-indigo-500 mt-2 block">
                Nearest vs Highest-Rated vs Skills vs WorkLink
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. APPENDIX G BENCHMARK VIEW (If selected)                      */}
      {/* ============================================================== */}
      {activeScenario === 'appendix_g_benchmark' ? (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center space-x-2">
                <FlaskConical className="w-4 h-4 text-[#AF52DE]" />
                <h3 className="text-base font-bold text-[#111111]">
                  Appendix G: RQ6 Single-Factor Failure Comparison
                </h3>
              </div>
              <Badge variant="accent" size="sm">
                Empirical Evaluation
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'worklink', label: 'WorkLink Multi-Factor', sub: 'Picks W3 (Dominates pool)' },
                { id: 'nearest', label: 'Nearest Worker', sub: 'Picks W1 (Lacks skill & exp)' },
                { id: 'rating', label: 'Highest-Rated', sub: 'Picks W2 (Booked until tomorrow)' },
                { id: 'skills', label: 'Skill-Match Only', sub: 'Four-way tie (W2, W3, W4, W5)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setActiveStrategy(opt.id as any)}
                  className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                    activeStrategy === opt.id
                      ? 'bg-[#111111] text-white border-[#111111] font-semibold'
                      : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/6 text-[#111111]'
                  }`}
                >
                  <span className="font-bold block">{opt.label}</span>
                  <span className={`text-[10px] block mt-0.5 ${activeStrategy === opt.id ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
                    {opt.sub}
                  </span>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/6 text-xs text-[#111111] leading-relaxed">
              {activeStrategy === 'worklink' && (
                <p>
                  <strong>WorkLink Outcome:</strong> Hard constraints eliminate W1 (missing core skill &amp; only 1y exp), W2 (booked until tomorrow), and W6 (11.4 km outside zone). Calibrated weights pick <strong>Manoj Sharma (W3)</strong> over W5 due to proximity (3.2 km vs 9.1 km) and rating (4.8 vs 4.7).
                </p>
              )}
              {activeStrategy === 'nearest' && (
                <p>
                  <strong className="text-[#FF3B30]">Nearest Worker Failure Mode:</strong> Selects W1 solely because he is 1.2 km away. However, W1 lacks gas leak detection and has only 1 year experience, leaving the AC cooling fault unresolved.
                </p>
              )}
              {activeStrategy === 'rating' && (
                <p>
                  <strong className="text-[#FF3B30]">Highest-Rated Failure Mode:</strong> Selects W2 (4.9★ rating). However, W2 is booked until tomorrow morning. In an urgent breakdown, an unavailable worker leads to user abandonment.
                </p>
              )}
              {activeStrategy === 'skills' && (
                <p>
                  <strong className="text-amber-600">Skill-Match Failure Mode:</strong> W2, W3, W4, and W5 all have 3/3 skills. Keyword matching produces an unresolved 4-way tie.
                </p>
              )}
            </div>

            {/* Benchmark Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 text-[#86868B] font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Rating</th>
                    <th className="py-2.5 px-3">Skills</th>
                    <th className="py-2.5 px-3">Experience</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">WorkLink Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-medium">
                  {benchmarkWorkers.map((w) => {
                    const isSelected =
                      (activeStrategy === 'worklink' && w.id === 'W3') ||
                      (activeStrategy === 'nearest' && w.id === 'W1') ||
                      (activeStrategy === 'rating' && w.id === 'W2');

                    return (
                      <tr key={w.id} className={isSelected ? 'bg-[#0071E3]/5 font-bold' : ''}>
                        <td className="py-2.5 px-3">
                          {w.name} ({w.id})
                        </td>
                        <td className="py-2.5 px-3">{w.distanceKm} km</td>
                        <td className="py-2.5 px-3">★ {w.rating.toFixed(1)}</td>
                        <td className="py-2.5 px-3">{w.skills.length}/3</td>
                        <td className="py-2.5 px-3">{w.experienceYears}y</td>
                        <td className="py-2.5 px-3 capitalize">{w.availabilityStatus}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              w.id === 'W3'
                                ? 'bg-[#34C759]/15 text-[#34C759]'
                                : w.id === 'W6' || w.id === 'W1' || w.id === 'W2'
                                ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                : 'bg-black/5 text-[#6E6E73]'
                            }`}
                          >
                            {w.id === 'W3'
                              ? 'Rank #1 Recommended'
                              : w.id === 'W1'
                              ? 'Excluded: Missing Skill & Exp'
                              : w.id === 'W2'
                              ? 'Excluded: Unavailable'
                              : w.id === 'W6'
                              ? 'Excluded: 11.4km > 10km'
                              : 'Eligible Runner-Up'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 3. SCENARIOS 1 TO 5: THE INTERACTIVE PIPELINE WALKTHROUGH        */
        /* ============================================================== */
        <div className="space-y-8">
          {/* STEP 1: GLASS AI INTERACTION & INTENT UNDERSTANDING */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/95 sm:bg-white/85 backdrop-blur-md sm:backdrop-blur-xl border border-white/80 shadow-md glass-specular-edge space-y-4 motion-glass-appear">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-xl bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#111111]">
                  AI Job Intake &amp; Intent Understanding
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#0071E3] font-bold">
                Natural Language Token Extraction
              </span>
            </div>

            {/* Customer Prompt Display */}
            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/6">
              <span className="text-[10px] uppercase font-mono text-[#86868B] block mb-1">
                Customer Natural Language Input:
              </span>
              <p className="text-sm font-semibold text-[#111111] italic">
                &ldquo;{currentScenarioJob.rawPrompt}&rdquo;
              </p>
            </div>

            {/* Extracted Slots Entity Chips */}
            <div>
              <span className="text-[10px] uppercase font-mono text-[#86868B] block mb-2 font-bold">
                Extracted Job Slots (Deterministic Parser):
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-[#0071E3]/10 text-[#0071E3] font-bold flex items-center space-x-1 border border-[#0071E3]/20">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Category: {currentScenarioJob.serviceCategory}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 font-bold flex items-center space-x-1 border border-purple-500/20">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Schedule: {currentScenarioJob.requestedTime || currentScenarioJob.requestedDate || 'Tomorrow Morning'}</span>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-[#34C759]/10 text-[#34C759] font-bold flex items-center space-x-1 border border-[#34C759]/20">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Zone: Hauz Khas (10 km Strict Perimeter)</span>
                </span>
                {currentScenarioJob.requiredSkills.map((sk) => (
                  <span key={sk} className="px-2.5 py-1.5 rounded-xl bg-black/5 text-[#111111] font-medium flex items-center space-x-1">
                    <Check className="w-3 h-3 text-[#34C759]" />
                    <span>Skill: {sk}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: 10 KM SERVICE ZONE & EXCLUSIONS AUDIT */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-xl bg-[#5856D6] text-white flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#111111]">
                  10 km Dynamic Radius Guardrail &amp; Eligibility Audit
                </h3>
              </div>
              <Badge variant="accent" size="sm">
                South Delhi Cluster • 10.0 km SLA
              </Badge>
            </div>

            {/* Special Highlight for Scenario 4 (10 km Exclusion) */}
            {activeScenario === 'scenario_4_10km_exclusion' && (
              <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
                <div className="flex items-center space-x-2 text-[#FF3B30] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-[#FF3B30]" />
                  <span>Scenario 4 Highlight: Out-of-Zone Candidate Hard Exclusion</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-red-500/20 gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={worker10KmExcluded.avatar}
                      alt={worker10KmExcluded.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-red-500/20"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#111111]">{worker10KmExcluded.name}</span>
                        <Badge variant="danger" size="sm">EXCLUDED (11.4 km &gt; 10 km)</Badge>
                      </div>
                      <p className="text-xs text-[#6E6E73] mt-0.5">
                        {worker10KmExcluded.trade} • {worker10KmExcluded.experienceYears}y Experience • ★ {worker10KmExcluded.rating} (Top Rated in Pool)
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-[#FF3B30] font-bold block">Distance: 11.4 km</span>
                    <span className="text-[11px] text-[#86868B]">1.4 km outside service perimeter</span>
                  </div>
                </div>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  <strong>WorkLink Algorithmic Principle:</strong> Even though Vikram holds the highest rating (4.9★) and 9 years experience, WorkLink&apos;s hard constraint strictly disqualifies workers beyond 10 km. This prevents transit tardiness and ensures the 45-minute dispatch SLA.
                </p>
              </div>
            )}

            {/* Special Highlight for Scenario 5 (Unavailable Exclusion) */}
            {activeScenario === 'scenario_5_unavailable' && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center space-x-2 text-amber-700 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Scenario 5 Highlight: Unavailable Worker Hard Filter Exclusion</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white border border-amber-500/20 gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={workerUnavailableExcluded.avatar}
                      alt={workerUnavailableExcluded.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-500/20"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-[#111111]">{workerUnavailableExcluded.name}</span>
                        <Badge variant="warning" size="sm">EXCLUDED: SCHEDULE CONFLICT</Badge>
                      </div>
                      <p className="text-xs text-[#6E6E73] mt-0.5">
                        {workerUnavailableExcluded.trade} • {workerUnavailableExcluded.experienceYears}y Experience • Distance: {workerUnavailableExcluded.distanceKm} km (In Zone)
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-amber-700 font-bold block">Status: Booked Tomorrow Morning</span>
                    <span className="text-[11px] text-[#86868B]">Requested: Immediate Dispatch</span>
                  </div>
                </div>
                <p className="text-xs text-[#6E6E73] leading-relaxed">
                  <strong>WorkLink Algorithmic Principle:</strong> Even though Suresh Verma is physically within 6.5 km and possesses 4.9★ rating, he is excluded from this immediate request because his confirmed slot is tomorrow morning. WorkLink never shows phantom availability.
                </p>
              </div>
            )}

            {/* Eligible In-Zone Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/5">
                <span className="text-[#86868B] block text-[10px] uppercase font-mono">10 km In-Zone Total</span>
                <span className="text-lg font-extrabold text-[#111111] mt-0.5 block">
                  {rankedEligible.length + excludedWorkers.filter((e) => e.worker.distanceKm <= 10).length} Candidates
                </span>
                <span className="text-[11px] text-[#34C759]">Within South Delhi cluster</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/5">
                <span className="text-[#86868B] block text-[10px] uppercase font-mono">Eligible Matches</span>
                <span className="text-lg font-extrabold text-[#0071E3] mt-0.5 block">
                  {rankedEligible.length} Verified
                </span>
                <span className="text-[11px] text-[#6E6E73]">Passed all 5 hard filters</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/5">
                <span className="text-[#86868B] block text-[10px] uppercase font-mono">Excluded Candidates</span>
                <span className="text-lg font-extrabold text-[#FF3B30] mt-0.5 block">
                  {excludedWorkers.length} Disqualified
                </span>
                <span className="text-[11px] text-[#86868B]">Zone, skill, or schedule</span>
              </div>
            </div>
          </div>

          {/* STEP 3: BEST MATCH (SIGNATURE RECOMMENDATION CARD) */}
          <div className="p-5 sm:p-7 rounded-3xl bg-white/95 sm:bg-white/85 backdrop-blur-md sm:backdrop-blur-xl border border-white/80 shadow-md glass-specular-edge space-y-6 motion-glass-appear hover-lift">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-xl bg-[#34C759] text-white flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#111111]">
                  Best Match: Signature Recommendation
                </h3>
              </div>

              {/* Scenario 3 Personalization Callout */}
              {activeScenario === 'scenario_3_personalization' && (
                <span className="px-3 py-1 rounded-full bg-[#FF9500]/10 text-amber-800 text-xs font-bold border border-amber-300 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>Recommended for you • Based on your previous booking</span>
                </span>
              )}

              {activeScenario === 'scenario_2_electrician' && (
                <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 text-xs font-bold border border-purple-300">
                  Electrician Domain Match
                </span>
              )}
            </div>

            {bestMatch && (
              <div className="space-y-6">
                {/* Worker Identity Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={bestMatch.worker.avatar}
                      alt={bestMatch.worker.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-black/5 shadow-xs"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xl font-extrabold text-[#111111]">{bestMatch.worker.name}</h4>
                        <Badge variant="accent" size="sm">{bestMatch.worker.trade}</Badge>
                        <Badge variant="success" size="sm">Verified Pro</Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#6E6E73]">
                        <span className="flex items-center text-[#FF9500] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#FF9500] inline mr-1" />
                          {bestMatch.worker.rating.toFixed(1)} ({bestMatch.worker.reviewCount} reviews)
                        </span>
                        <span>•</span>
                        <span className="flex items-center text-[#0071E3] font-medium">
                          <Navigation className="w-3 h-3 inline mr-1" />
                          {bestMatch.worker.distanceKm.toFixed(1)} km away
                        </span>
                        <span>•</span>
                        <span>{bestMatch.worker.experienceYears} yrs trade practice</span>
                      </div>

                      <p className="text-xs text-[#34C759] font-semibold flex items-center space-x-1 pt-0.5">
                        <Clock className="w-3.5 h-3.5 inline" />
                        <span>
                          {bestMatch.worker.availabilityStatus === 'immediate'
                            ? 'Available Immediately (<45m)'
                            : bestMatch.worker.nextAvailableSlot || 'Confirmed Slot Available'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Typographic Match Score & Tariff */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5 gap-1">
                    <div className="text-left sm:text-right">
                      <span className="text-3xl sm:text-4xl font-extrabold text-[#111111] leading-none block">
                        {bestMatch.totalScore}%
                      </span>
                      <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider block mt-1">
                        Total Match Fit
                      </span>
                    </div>

                    <div className="text-right mt-1 sm:mt-2">
                      <span className="text-lg font-extrabold text-[#111111]">
                        ₹{bestMatch.worker.estimatedQuote}
                      </span>
                      <span className="text-xs text-[#86868B] block">
                        ₹{bestMatch.worker.hourlyRate}/hr base
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 4: "WHY THIS WORKER?" (MULTI-FACTOR RATIONALE) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8FA] border border-black/5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-[#0071E3]" />
                      <span className="font-extrabold text-xs text-[#111111]">
                        Why WorkLink Recommended {bestMatch.worker.name.split(' ')[0]} (Deterministic Rationale)
                      </span>
                    </div>
                    <span className="text-[10px] text-[#86868B] font-mono">
                      Rank #1 of {rankedEligible.length} Candidates
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs text-[#111111]">
                    {bestMatch.reasons.slice(0, 4).map((r, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-4 h-4 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>

                  {bestMatch.tradeOffSummary && (
                    <div className="pt-2 border-t border-black/5 text-[11px] text-[#6E6E73] italic">
                      <strong>Comparison Insight vs Runner-up:</strong> {bestMatch.tradeOffSummary}
                    </div>
                  )}
                </div>

                {/* STEP 5: INTERACTIVE ACTIONS (PROFILE & BOOKING) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <span className="text-xs text-[#86868B]">
                    Interactive Actions: Test the profile inspection modal and calm booking modal directly.
                  </span>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2.5">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => handleInspectWorker(bestMatch)}
                      className="w-full sm:w-auto min-h-[44px] justify-center text-xs font-bold"
                    >
                      Inspect Profile Modal
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleBookWorker(bestMatch)}
                      icon={<ArrowRight className="w-4 h-4" />}
                      className="w-full sm:w-auto min-h-[48px] justify-center text-xs sm:text-sm font-bold bg-[#111111] text-white shadow-sm active-press"
                    >
                      Launch Booking Flow &rarr;
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 6: TRANSPARENT PRICING & FINAL AMOUNT SUMMARY */}
          {bestMatchEstimate && bestMatchFinalCalculation && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-extrabold text-[#111111]">
                  Transparent Pricing: Estimated vs Final Invoice
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 1. Estimated Amount */}
                <TransparentPriceSummary
                  mode="estimate"
                  estimate={bestMatchEstimate}
                  isSimulated={true}
                />

                {/* 2. Final Amount */}
                <TransparentPriceSummary
                  mode="final"
                  finalCalculation={bestMatchFinalCalculation}
                  workingDurationFormatted="1 hr 45 mins"
                  isSimulated={true}
                />
              </div>
            </div>
          )}

          {/* STEP 7: RESPONSIBLE AI ARCHITECTURE BANNER */}
          <ResponsibleAiBanner
            primaryWorker={bestMatch}
            onOpenTrustModal={() => setIsTrustModalOpen(true)}
            compact={false}
          />
        </div>
      )}

      {/* Responsible AI Trust Modal */}
      {isTrustModalOpen && bestMatch && (
        <ResponsibleAiTrustModal
          isOpen={isTrustModalOpen}
          onClose={() => setIsTrustModalOpen(false)}
          primaryMatch={bestMatch}
          alternativeMatches={rankedEligible.slice(1)}
          activeJob={currentScenarioJob}
        />
      )}
    </div>
  );
};
