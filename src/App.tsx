import React, { useState, useMemo, useEffect } from 'react';
import {
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
  AvailabilityStatus,
} from './types';
import { INITIAL_WORKERS, DEFAULT_CUSTOMER_LOCATION } from './data/mockWorkers';
import {
  DEFAULT_WEIGHT_PRESETS,
  rankWorkers,
} from './services/matchingEngine';
import { parseNaturalLanguageJob, createJobRequestFromSlots } from './services/chatbotService';
import { recalculateWorkerDistances } from './services/locationService';
import { Navbar, NavTabType } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
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

import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { OperatorConsole } from './components/admin/OperatorConsole';
import { AuthModal } from './components/auth/AuthModal';
import { LocationPermissionModal } from './components/auth/LocationPermissionModal';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Container } from './components/ui/Container';
import { Badge } from './components/ui/Badge';
import { EmptyState } from './components/ui/EmptyState';
import { useToast } from './components/ui/Toast';

interface AppContentProps {
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
}

const AppContent: React.FC<AppContentProps> = ({ workers, setWorkers }) => {
  const { showToast } = useToast();
  const {
    currentUser,
    role,
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal,
    updateLocation,
  } = useAuth();

  // Navigation & Location State - default to public landing page
  const [currentTab, setCurrentTab] = useState<NavTabType>('landing');
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation>(DEFAULT_CUSTOMER_LOCATION);

  // Sync tab with role changes for intuitive experience
  useEffect(() => {
    if (role === 'worker' && currentTab === 'landing') {
      setCurrentTab('worker_hub');
    } else if (role === 'operator' && currentTab === 'landing') {
      setCurrentTab('operator_console');
    }
  }, [role]);

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
    const updatedWorkers = recalculateWorkerDistances(workers, newLoc);
    setWorkers(updatedWorkers);
    setActiveJob((prev) => ({ ...prev, location: newLoc }));
    showToast({
      type: 'info',
      title: 'Service Zone Shifted',
      message: `10 km radius re-anchored to ${newLoc.address.split(',')[0]}.`,
    });
  };

  // Handle Worker Status Change from Worker Dashboard
  const handleUpdateWorkerStatus = (workerId: string, status: AvailabilityStatus) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, availabilityStatus: status } : w))
    );
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
        onChangeLocationClick={openLocationModal}
        currentWeights={currentWeights}
        onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
        hasActiveBooking={!!activeBooking}
      />

      {/* Main Container */}
      <main className="flex-1 w-full py-8">
        <Container size="2xl">
          {/* ============================================================== */}
          {/* TAB 0: PUBLIC LANDING PAGE (Launch Experience) */}
          {/* ============================================================== */}
          {currentTab === 'landing' && (
            <LandingPage
              onFindWorkerClick={() => setCurrentTab('marketplace')}
              onExploreRadarClick={() => setCurrentTab('zone_radar')}
              onViewIntelligenceClick={() => setCurrentTab('intelligence')}
            />
          )}

          {/* ============================================================== */}
          {/* TAB 1: WORKER HUB (Worker Role View) */}
          {/* ============================================================== */}
          {currentTab === 'worker_hub' && (
            <WorkerDashboard
              workers={workers}
              onUpdateWorkerStatus={handleUpdateWorkerStatus}
              activeBooking={activeBooking}
            />
          )}

          {/* ============================================================== */}
          {/* TAB 2: OPERATOR CONSOLE (Admin/Operator Role View) */}
          {/* ============================================================== */}
          {currentTab === 'operator_console' && (
            <OperatorConsole
              workers={workers}
              onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
              onNavigateToIntelligence={() => setCurrentTab('intelligence')}
              onNavigateToRadar={() => setCurrentTab('zone_radar')}
              currentWeights={currentWeights}
            />
          )}

          {/* ============================================================== */}
          {/* TAB 3: MARKETPLACE & INTAKE */}
          {/* ============================================================== */}
          {currentTab === 'marketplace' && (
            <div className="space-y-8 animate-fade-in">
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
          {/* TAB 4: 10 KM SERVICE ZONE RADAR */}
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
          {/* TAB 5: LIVE JOB EXECUTION & TIMER */}
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
          {/* TAB 6: APPENDIX G SIMULATOR */}
          {/* ============================================================== */}
          {currentTab === 'simulator' && <ScenarioSimulator />}

          {/* ============================================================== */}
          {/* TAB 7: WORKFORCE INTELLIGENCE & RESEARCH */}
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

      {/* Authentication & Onboarding Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
      />

      {/* Transparent Location Permission Modal */}
      <LocationPermissionModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        currentLocation={customerLocation}
        onLocationConfirmed={(loc, granted) => {
          handleUpdateLocation(loc);
          updateLocation(loc, granted);
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>(INITIAL_WORKERS);

  const handleWorkerAdded = (newWorker: Worker) => {
    setWorkers((prev) => [newWorker, ...prev]);
  };

  return (
    <AuthProvider onWorkerAdded={handleWorkerAdded}>
      <AppContent workers={workers} setWorkers={setWorkers} />
    </AuthProvider>
  );
};

export default App;
