import React, { useState, useMemo } from 'react';
import {
  Sparkles,
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

import { Container } from './components/ui/Container';
import { Badge } from './components/ui/Badge';
import { EmptyState } from './components/ui/EmptyState';
import { useToast } from './components/ui/Toast';

export const App: React.FC = () => {
  const { showToast } = useToast();

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
    showToast({
      type: 'info',
      title: 'Service Zone Shifted',
      message: `10 km radius re-anchored to ${newLoc.address.split(',')[0]}.`,
    });
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
    showToast({
      type: 'success',
      title: 'Worker Dispatched',
      message: `${booking.worker.name} accepted your request. Tracking active.`,
    });
  };

  // Booking lifecycle update
  const handleUpdateBooking = (updated: Booking) => {
    setActiveBooking(updated);
  };

  // Completed feedback loop
  const handleCompleteFeedbackLoop = (completedBooking: Booking) => {
    setRecentBookings((prev) => [completedBooking, ...prev]);

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
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] flex flex-col font-sans selection:bg-[#111111] selection:text-white">
      {/* Sticky Topbar */}
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
      <main className="flex-1 w-full py-8">
        <Container size="2xl">
          {/* ============================================================== */}
          {/* TAB 1: MARKETPLACE & INTAKE */}
          {/* ============================================================== */}
          {currentTab === 'marketplace' && (
            <div className="space-y-8 animate-fade-in">
              {/* Hero Section */}
              <div className="text-center max-w-3xl mx-auto pt-4 pb-8">
                <div className="inline-flex items-center space-x-2 mb-4">
                  <Badge variant="accent" size="md">
                    <Sparkles className="w-3.5 h-3.5 text-[#0071E3] mr-1" />
                    Explainable Skilled-Labour Intelligence
                  </Badge>
                </div>

                <h1 className="text-hero text-[#111111]">
                  "Right Labour. Right Work. Right Time."
                </h1>

                <p className="mt-4 text-subheading max-w-2xl mx-auto">
                  WorkLink is not about finding the nearest worker.
                  <br className="hidden sm:inline" />
                  WorkLink is about finding the <strong className="font-semibold text-[#111111]">most suitable available worker</strong>.
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

              {/* Multi-Factor Recommendation Results */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#111111]">
                      Explainable Multi-Factor Recommendations
                    </h2>
                    <Badge variant="default" size="sm">
                      {displayedEligible.length} Verified Candidates
                    </Badge>
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-0.5">
                    Ranked via: Skill Fit + Experience Tier + Slot Availability + Quality + 10km Proximity + Budget
                  </p>
                </div>

                {/* Trade Filter Chips */}
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
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
                          ? 'bg-[#111111] text-white font-semibold shadow-xs'
                          : 'bg-[#FFFFFF] hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
                      }`}
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Worker Cards */}
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
                <EmptyState
                  icon={<Users className="w-8 h-8" />}
                  title="No Eligible Workers in 10 km Zone"
                  description="All scanned candidates were filtered out by the 5 non-negotiable hard constraints. Try broadening your requested time slot or shifting your 10 km zone center."
                  actionLabel="Reset to Hauz Khas Center"
                  onAction={() => handleUpdateLocation(DEFAULT_CUSTOMER_LOCATION)}
                />
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
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#FFFFFF] py-6 mt-12 text-center text-xs text-[#6E6E73]">
        <Container size="2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#111111]">WorkLink</span>
              <span className="text-[#86868B]">•</span>
              <span>Right Labour. Right Work. Right Time.</span>
            </div>
            <div className="text-[11px] text-[#86868B]">
              Workforce Intelligence Foundations • Explainable Multi-Factor Matching
            </div>
          </div>
        </Container>
      </footer>

      {/* Modals */}
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

      {selectedBookingWorker && (
        <BookingFlowModal
          isOpen={Boolean(selectedBookingWorker)}
          rankedWorker={selectedBookingWorker}
          job={activeJob}
          onClose={() => setSelectedBookingWorker(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

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
