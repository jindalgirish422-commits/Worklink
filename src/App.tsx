import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  MapPin,
  ShieldCheck,
  Wrench,
  Compass,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Clock,
  Filter,
  Users,
} from 'lucide-react';
import {
  Worker,
  JobRequest,
  CustomerLocation,
  MatchingWeights,
  RankedWorker,
  Booking,
  UserPersonalizationProfile,
  TradeCategory,
} from './types';
import { INITIAL_WORKERS, DEFAULT_CUSTOMER_LOCATION } from './data/mockWorkers';
import {
  DEFAULT_WEIGHT_PRESETS,
  rankWorkers,
} from './services/matchingEngine';
import { parseNaturalLanguageJob, createJobRequestFromSlots } from './services/chatbotService';
import { Navbar } from './components/Navbar';
import { ChatbotIntake } from './components/ChatbotIntake';
import { ServiceZoneMap } from './components/ServiceZoneMap';
import { HardFilterAudit } from './components/HardFilterAudit';
import { WorkerCard } from './components/WorkerCard';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { WeightCalibrationModal } from './components/WeightCalibrationModal';
import { JobExecutionTracker } from './components/JobExecutionTracker';
import { FeedbackLearningLoopView } from './components/FeedbackLearningLoopView';
import { WorkforceIntelligenceView } from './components/WorkforceIntelligenceView';
import { ScenarioSimulator } from './components/ScenarioSimulator';

export const App: React.FC = () => {
  // Navigation & Location State
  const [currentTab, setCurrentTab] = useState<
    'marketplace' | 'zone_radar' | 'active_booking' | 'intelligence' | 'simulator'
  >('marketplace');
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation>(DEFAULT_CUSTOMER_LOCATION);

  // Workers dataset
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);

  // Active Job Intake
  const defaultPrompt =
    "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800.";
  const [activeJob, setActiveJob] = useState<JobRequest>(() => {
    const slots = parseNaturalLanguageJob(defaultPrompt, DEFAULT_CUSTOMER_LOCATION);
    return createJobRequestFromSlots(defaultPrompt, slots, DEFAULT_CUSTOMER_LOCATION);
  });

  // Matching Weights
  const [currentWeights, setCurrentWeights] = useState<MatchingWeights>(DEFAULT_WEIGHT_PRESETS[0]);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);

  // User Profile (Personalization)
  const [userProfile, setUserProfile] = useState<UserPersonalizationProfile>({
    previousSearches: ['AC Repair', 'Plumber Sink Leak'],
    previousBookingsCount: 3,
    frequentlyUsedTrades: ['AC Technician', 'Plumber'],
    preferredDistanceMaxKm: 5.0,
    priceSensitivity: 'medium',
    repeatWorkersBooked: ['W3'],
    avgRatingGiven: 4.8,
    hasCancellations: false,
  });

  // Active Booking & History State
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  // Modals State
  const [selectedProfileWorker, setSelectedProfileWorker] = useState<RankedWorker | null>(null);
  const [selectedBookingWorker, setSelectedBookingWorker] = useState<RankedWorker | null>(null);
  const [selectedMapWorkerId, setSelectedMapWorkerId] = useState<string | undefined>('W3');

  // Trade category filter in marketplace
  const [tradeFilter, setTradeFilter] = useState<string>('All');

  // Dynamic ranking recalculation
  const { rankedEligible, excludedWorkers, allWorkersRanked } = useMemo(() => {
    return rankWorkers(workers, activeJob, currentWeights, userProfile);
  }, [workers, activeJob, currentWeights, userProfile]);

  // Filtered workers for display
  const displayedEligible = useMemo(() => {
    if (tradeFilter === 'All') return rankedEligible;
    return rankedEligible.filter((w) => w.worker.trade === tradeFilter);
  }, [rankedEligible, tradeFilter]);

  // Handle Location Change
  const handleUpdateLocation = (newLoc: CustomerLocation) => {
    setCustomerLocation(newLoc);
    // Recalculate distance for all workers relative to new location
    const updatedWorkers = workers.map((w) => {
      const R = 6371;
      const dLat = ((w.coordinates.lat - newLoc.lat) * Math.PI) / 180;
      const dLng = ((w.coordinates.lng - newLoc.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((newLoc.lat * Math.PI) / 180) *
          Math.cos((w.coordinates.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = parseFloat((R * c).toFixed(1));
      return { ...w, distanceKm: dist };
    });
    setWorkers(updatedWorkers);
    setActiveJob((prev) => ({ ...prev, location: newLoc }));
  };

  // Job created from Chatbot
  const handleJobCreated = (newJob: JobRequest) => {
    setActiveJob(newJob);
  };

  // Booking Flow confirmation
  const handleBookingConfirmed = (booking: Booking) => {
    setActiveBooking(booking);
    setSelectedBookingWorker(null);
    setCurrentTab('active_booking');
  };

  // Booking lifecycle update
  const handleUpdateBooking = (updated: Booking) => {
    setActiveBooking(updated);
  };

  // Completed feedback loop
  const handleCompleteFeedbackLoop = (completedBooking: Booking) => {
    setRecentBookings((prev) => [completedBooking, ...prev]);

    // Update worker telemetry in state (increase completedJobs, adjust rating)
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === completedBooking.worker.id) {
          const newCompleted = w.completedJobs + 1;
          const userStars = completedBooking.feedback?.rating || 5;
          const updatedRating = parseFloat(
            ((w.rating * w.reviewCount + userStars) / (w.reviewCount + 1)).toFixed(2)
          );
          return {
            ...w,
            completedJobs: newCompleted,
            rating: updatedRating,
            reviewCount: w.reviewCount + 1,
            completionRate: Math.min(1.0, w.completionRate + 0.005),
          };
        }
        return w;
      })
    );

    // Update user profile repeat worker list
    if (!userProfile.repeatWorkersBooked.includes(completedBooking.worker.id)) {
      setUserProfile((prev) => ({
        ...prev,
        repeatWorkersBooked: [...prev.repeatWorkersBooked, completedBooking.worker.id],
      }));
    }
  };

  const handleBookAgain = (workerId: string) => {
    const candidate = allWorkersRanked.find((w) => w.worker.id === workerId);
    if (candidate) {
      setSelectedBookingWorker(candidate);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      {/* Apple-inspired Sticky Topbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        location={customerLocation}
        onChangeLocationClick={() => setCurrentTab('zone_radar')}
        currentWeights={currentWeights}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        hasActiveBooking={!!activeBooking}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ============================================================== */}
        {/* TAB 1: MARKETPLACE & INTAKE (Primary Non-Negotiable Flow) */}
        {/* ============================================================== */}
        {currentTab === 'marketplace' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Brand Statement */}
            <div className="text-center max-w-3xl mx-auto pt-2 pb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold mb-4 border border-slate-200/80">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Explainable Skilled-Labour Intelligence</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                "Right Labour. Right Work. Right Time."
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
                WorkLink is not about finding the nearest worker.
                <br className="hidden sm:inline" />
                WorkLink is about finding the <strong className="font-semibold text-slate-900">most suitable available worker</strong>.
              </p>
            </div>

            {/* Step 1: Natural-Language Chatbot Intake */}
            <ChatbotIntake
              currentLocation={customerLocation}
              onJobCreated={handleJobCreated}
              activeJob={activeJob}
            />

            {/* Step 2: Hard Constraint Filter Audit */}
            <HardFilterAudit
              allRanked={allWorkersRanked}
              activeJob={activeJob}
            />

            {/* Multi-Factor Ranking Results Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/70 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">
                    Explainable Multi-Factor Recommendations
                  </h2>
                  <span className="badge-subtle bg-slate-900 text-white font-bold text-[11px]">
                    {displayedEligible.length} Verified Candidates
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ranked via: Skill Fit + Experience + Slot Availability + Reputation + 10km Proximity + Budget
                </p>
              </div>

              {/* Trade Chips */}
              <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
                {[
                  'All',
                  'AC Technician',
                  'Plumber',
                  'Electrician',
                  'Carpenter',
                  'Painter',
                  'Appliance Repair',
                  'Cleaning Professional',
                ].map((trade) => (
                  <button
                    key={trade}
                    onClick={() => setTradeFilter(trade)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                      tradeFilter === trade
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {trade}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Ranked Worker Cards */}
            {displayedEligible.length > 0 ? (
              <div className="space-y-4">
                {displayedEligible.map((item, idx) => (
                  <WorkerCard
                    key={item.worker.id}
                    rankedWorker={item}
                    job={activeJob}
                    isTopRecommendation={idx === 0}
                    onBookClick={(rw) => setSelectedBookingWorker(rw)}
                    onViewProfileClick={(rw) => setSelectedProfileWorker(rw)}
                  />
                ))}
              </div>
            ) : (
              <div className="apple-card p-12 bg-white text-center border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">No Eligible Workers in 10 km Zone</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  All scanned candidates were filtered out by the 5 hard constraints. Try widening your time slot or shifting your 10 km service zone center.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 10 KM SERVICE ZONE RADAR */}
        {/* ============================================================== */}
        {currentTab === 'zone_radar' && (
          <ServiceZoneMap
            location={customerLocation}
            onUpdateLocation={handleUpdateLocation}
            workers={workers}
            selectedWorkerId={selectedMapWorkerId}
            onSelectWorker={(id) => {
              setSelectedMapWorkerId(id);
              const found = allWorkersRanked.find((w) => w.worker.id === id);
              if (found) setSelectedProfileWorker(found);
            }}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 3: LIVE JOB EXECUTION & TIMER */}
        {/* ============================================================== */}
        {currentTab === 'active_booking' && (
          <div className="space-y-8 animate-fade-in">
            <JobExecutionTracker
              booking={activeBooking}
              onUpdateBooking={handleUpdateBooking}
              onCloseBooking={() => setActiveBooking(null)}
              onCompleteFeedbackLoop={handleCompleteFeedbackLoop}
            />

            <FeedbackLearningLoopView
              recentBookings={recentBookings}
              onBookAgain={handleBookAgain}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: APPENDIX G SIMULATOR */}
        {/* ============================================================== */}
        {currentTab === 'simulator' && <ScenarioSimulator />}

        {/* ============================================================== */}
        {/* TAB 5: WORKFORCE INTELLIGENCE & RESEARCH */}
        {/* ============================================================== */}
        {currentTab === 'intelligence' && <WorkforceIntelligenceView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.06] bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900">WorkLink</span>
            <span>•</span>
            <span>Right Labour. Right Work. Right Time.</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Workforce Intelligence Foundation • Explainable Matching System
          </div>
        </div>
      </footer>

      {/* Profile Modal */}
      {selectedProfileWorker && (
        <WorkerProfileModal
          rankedWorker={selectedProfileWorker}
          job={activeJob}
          onClose={() => setSelectedProfileWorker(null)}
          onProceedToBooking={(rw) => {
            setSelectedProfileWorker(null);
            setSelectedBookingWorker(rw);
          }}
        />
      )}

      {/* Booking Confirmation Flow Modal */}
      {selectedBookingWorker && (
        <BookingFlowModal
          isOpen={!!selectedBookingWorker}
          rankedWorker={selectedBookingWorker}
          job={activeJob}
          onClose={() => setSelectedBookingWorker(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {/* Matching Weights Calibration Modal */}
      <WeightCalibrationModal
        isOpen={isWeightsModalOpen}
        onClose={() => setIsWeightsModalOpen(false)}
        weights={currentWeights}
        onSaveWeights={(w) => setCurrentWeights(w)}
      />
    </div>
  );
};
export default App;
