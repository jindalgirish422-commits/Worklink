import React, { useState, useMemo, useEffect } from 'react';
import {
  Worker,
  JobRequest,
  CustomerLocation,
  MatchingWeights,
  RankedWorker,
  Booking,
  BookingStatus,
  UserPersonalizationProfile,
  AvailabilityStatus,
  PaymentTransactionRecord,
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
import { ServiceZoneMap } from './components/ServiceZoneMap';
import { WorkerProfileModal } from './components/WorkerProfileModal';
import { BookingFlowModal } from './components/BookingFlowModal';
import { WeightCalibrationModal } from './components/WeightCalibrationModal';
import { JobExecutionTracker } from './components/JobExecutionTracker';
import { FeedbackLearningLoopView } from './components/FeedbackLearningLoopView';
import { WorkforceIntelligenceView } from './components/WorkforceIntelligenceView';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { HackathonDemoView } from './components/demo/HackathonDemoView';
import { WorkerDiscoveryView } from './components/discovery/WorkerDiscoveryView';

import { WorkerDashboard } from './components/worker/WorkerDashboard';
import { CustomerConciergeHome } from './components/customer/CustomerConciergeHome';
import { OperatorConsole } from './components/admin/OperatorConsole';
import { AuthModal } from './components/auth/AuthModal';
import { LocationPermissionModal } from './components/auth/LocationPermissionModal';
import { AuthProvider, useAuth } from './context/AuthContext';

import { Container } from './components/ui/Container';
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
  const [isSimulatedOffline, setIsSimulatedOffline] = useState(false);

  // Sync tab with role changes for intuitive experience
  useEffect(() => {
    if (role === 'worker' && currentTab === 'landing') {
      setCurrentTab('worker_hub');
    } else if (role === 'operator' && currentTab === 'landing') {
      setCurrentTab('operator_console');
    } else if (role === 'customer' && currentTab === 'landing') {
      setCurrentTab('customer_home');
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
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransactionRecord[]>([]);

  const handleAddPaymentTransaction = (record: PaymentTransactionRecord) => {
    setPaymentHistory((prev) => [record, ...prev]);
  };

  // Modals State
  const [selectedProfileWorker, setSelectedProfileWorker] = useState<RankedWorker | null>(null);
  const [selectedBookingWorker, setSelectedBookingWorker] = useState<RankedWorker | null>(null);
  const [selectedMapWorkerId, setSelectedMapWorkerId] = useState<string | undefined>('W3');

  // Dynamic ranking recalculation
  const { rankedEligible, excludedWorkers, allWorkersRanked } = useMemo(() => {
    return rankWorkers(workers, activeJob, currentWeights, userProfile);
  }, [workers, activeJob, currentWeights, userProfile]);

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
      type: 'info',
      title: 'Booking Requested',
      message: `Request sent to ${booking.worker.name}. Scheduled for ${booking.scheduledDate || 'Today'} (${booking.scheduledTimeSlot || 'Immediate'}).`,
    });
  };

  const handleAcceptBooking = (bookingId: string) => {
    if (activeBooking && activeBooking.id === bookingId) {
      const updated: Booking = { ...activeBooking, status: 'accepted' };
      setActiveBooking(updated);
      showToast({
        type: 'success',
        title: 'Job Request Accepted',
        message: `Accepted request #${bookingId.slice(0, 8)}. Scheduled for ${updated.scheduledDate || 'Today'} (${updated.scheduledTimeSlot || 'Immediate'}).`,
      });
    }
  };

  const handleRejectBooking = (bookingId: string, reason?: string) => {
    if (activeBooking && activeBooking.id === bookingId) {
      const updated: Booking = {
        ...activeBooking,
        status: 'cancelled',
        cancellationReason: reason || 'Worker schedule conflict',
        cancelledBy: 'worker',
      };
      setActiveBooking(updated);
      showToast({
        type: 'warning',
        title: 'Job Request Declined',
        message: `Booking #${bookingId.slice(0, 8)} was declined. Customer will be notified.`,
      });
    }
  };

  const handleAdvanceBookingStatus = (bookingId: string, nextStatus: BookingStatus) => {
    if (activeBooking && activeBooking.id === bookingId) {
      const updated: Booking = { ...activeBooking, status: nextStatus };
      setActiveBooking(updated);
    }
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
          const newReview = completedBooking.feedback?.comment
            ? [
                {
                  id: `rev-${Date.now()}`,
                  userName: 'Customer',
                  rating: userStars,
                  comment: completedBooking.feedback.comment,
                  date: 'Just now',
                  tradeTag: w.trade,
                },
                ...w.recentReviews,
              ]
            : w.recentReviews;

          return {
            ...w,
            completedJobs: newCompleted,
            rating: updatedRating,
            reviewCount: w.reviewCount + 1,
            completionRate: Math.min(1.0, w.completionRate + 0.005),
            recentReviews: newReview,
          };
        }
        return w;
      })
    );

    // If rated 4 or 5 stars, record in repeat workers preference for future recommendation boost
    const userRating = completedBooking.feedback?.rating || 5;
    if (userRating >= 4 && !userProfile.repeatWorkersBooked.includes(completedBooking.worker.id)) {
      setUserProfile((prev) => ({
        ...prev,
        previousBookingsCount: prev.previousBookingsCount + 1,
        repeatWorkersBooked: [...prev.repeatWorkersBooked, completedBooking.worker.id],
        avgRatingGiven: parseFloat(
          ((prev.avgRatingGiven * prev.previousBookingsCount + userRating) / (prev.previousBookingsCount + 1)).toFixed(2)
        ),
      }));
    } else {
      setUserProfile((prev) => ({
        ...prev,
        previousBookingsCount: prev.previousBookingsCount + 1,
      }));
    }
  };

  const handleBookAgain = (workerId: string) => {
    const candidate = allWorkersRanked.find((w) => w.worker.id === workerId);
    if (candidate) {
      setSelectedBookingWorker(candidate);
    }
  };

  const handleFindWorkerClick = () => {
    setCurrentTab('customer_home');
    if (!currentUser?.locationPermissionGranted) {
      openLocationModal();
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#111111] flex flex-col font-sans selection:bg-[#111111] selection:text-white">
      {/* Edge Case: Simulated Network Offline Warning Banner */}
      {isSimulatedOffline && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs sticky top-0 z-50 animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>
              📶 Simulated Network Offline: WorkLink is operating with cached local data. Realtime dispatches are paused.
            </span>
          </div>
          <button
            onClick={() => setIsSimulatedOffline(false)}
            className="px-2.5 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-all"
          >
            Reconnect Network
          </button>
        </div>
      )}

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
          {/* TAB: CUSTOMER HOME — SERVICE CONCIERGE (Milestone 16) */}
          {/* ============================================================== */}
          {currentTab === 'customer_home' && (
            <CustomerConciergeHome
              workers={workers}
              rankedEligible={rankedEligible}
              allWorkersRanked={allWorkersRanked}
              activeJob={activeJob}
              customerLocation={customerLocation}
              userProfile={userProfile}
              activeBooking={activeBooking}
              onBookClick={(rw) => setSelectedBookingWorker(rw)}
              onViewProfileClick={(rw) => setSelectedProfileWorker(rw)}
              onJobCreated={handleJobCreated}
              onNavigateToTab={(tab) => setCurrentTab(tab)}
              recentBookings={recentBookings}
              onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
            />
          )}

          {/* ============================================================== */}
          {/* TAB 0: PUBLIC LANDING PAGE (Launch Experience) */}
          {/* ============================================================== */}
          {currentTab === 'landing' && (
            <LandingPage
              onFindWorkerClick={handleFindWorkerClick}
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
              onAcceptBooking={handleAcceptBooking}
              onRejectBooking={handleRejectBooking}
              onAdvanceBookingStatus={handleAdvanceBookingStatus}
              onUpdateBooking={handleUpdateBooking}
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
              activeBooking={activeBooking}
              recentBookings={recentBookings}
            />
          )}

          {/* ============================================================== */}
          {/* TAB 3: MARKETPLACE & EDITORIAL DISCOVERY */}
          {/* ============================================================== */}
          {currentTab === 'marketplace' && (
            <WorkerDiscoveryView
              workers={workers}
              allWorkersRanked={allWorkersRanked}
              rankedEligible={rankedEligible}
              activeJob={activeJob}
              customerLocation={customerLocation}
              userProfile={userProfile}
              activeBooking={activeBooking}
              onNavigateToBooking={() => setCurrentTab('active_booking')}
              onBookClick={(rw) => setSelectedBookingWorker(rw)}
              onViewProfileClick={(rw) => setSelectedProfileWorker(rw)}
              onJobCreated={handleJobCreated}
              onResetLocation={() => handleUpdateLocation(DEFAULT_CUSTOMER_LOCATION)}
              onOpenWeightsModal={() => setIsWeightsModalOpen(true)}
            />
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
                paymentTransactions={paymentHistory}
                onAddPaymentTransaction={handleAddPaymentTransaction}
              />

              <FeedbackLearningLoopView
                recentBookings={recentBookings}
                onBookAgain={handleBookAgain}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: PREMIUM HACKATHON DEMO MODE & SIMULATOR (Milestone 22) */}
          {/* ============================================================== */}
          {currentTab === 'simulator' && (
            <HackathonDemoView
              workers={workers}
              onOpenWorkerProfile={(rw) => setSelectedProfileWorker(rw)}
              onOpenBookingModal={(rw) => setSelectedBookingWorker(rw)}
              onApplyToLiveApp={(job, loc, prof) => {
                setActiveJob(job);
                setCustomerLocation(loc);
                if (prof) setUserProfile(prof);
                setCurrentTab('customer_home');
              }}
            />
          )}

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
            <div className="flex items-center space-x-3 text-[11px] text-[#86868B]">
              <span>Workforce Intelligence Foundations • Explainable Multi-Factor Matching</span>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsSimulatedOffline((prev) => !prev)}
                className="hover:text-[#111111] transition-colors underline font-medium"
              >
                {isSimulatedOffline ? '📶 Reconnect Network' : '⚡ Test Offline Mode'}
              </button>
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
          activeBooking={activeBooking}
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
