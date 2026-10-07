import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Check,
  X,
  Compass,
  Zap,
  Award,
  DollarSign,
} from 'lucide-react';
import { Worker, RankedWorker, JobRequest, CustomerLocation, Booking } from '../../types';
import {
  DiscoveryFilters,
  DEFAULT_DISCOVERY_FILTERS,
  searchWorkers,
  filterWorkers,
  annotateSearchResultsWithRecommendations,
  getCuratedCollections,
  SearchResultItem,
} from '../../services/discoveryService';
import { getTravelBand } from '../../services/locationService';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchScore } from '../ui/MatchScore';
import { Sheet } from '../ui/Sheet';
import { EmptyState } from '../ui/EmptyState';
import { WorkerCard } from '../WorkerCard';
import { ChatbotIntake } from '../ChatbotIntake';
import { HardFilterAudit } from '../HardFilterAudit';
import { SignatureRecommendationView } from '../recommendations/SignatureRecommendationView';
import { PersonalizedRecommendationsSection } from '../recommendations/PersonalizedRecommendationsSection';
import { UserPersonalizationProfile } from '../../types';

interface WorkerDiscoveryViewProps {
  workers: Worker[];
  allWorkersRanked: RankedWorker[];
  rankedEligible: RankedWorker[];
  activeJob: JobRequest;
  customerLocation: CustomerLocation;
  onBookClick: (worker: RankedWorker) => void;
  onViewProfileClick: (worker: RankedWorker) => void;
  onJobCreated: (job: JobRequest) => void;
  onResetLocation?: () => void;
  userProfile?: UserPersonalizationProfile;
  activeBooking?: Booking | null;
  onNavigateToBooking?: () => void;
  onOpenWeightsModal?: () => void;
}

type DiscoveryTab = 'recommendations' | 'explore';
type CuratedCollectionTab = 'all' | 'emergency' | 'masters' | 'free_travel';

const POPULAR_SEARCH_CHIPS = [
  { label: '❄️ AC Diagnostics', query: 'AC' },
  { label: '🚰 Plumber', query: 'Plumber' },
  { label: '⚡ Electrician', query: 'Electrician' },
  { label: '🔥 Copper Brazing', query: 'Copper Brazing' },
  { label: '🪚 Carpenter', query: 'Carpenter' },
  { label: '🧹 Deep Clean', query: 'Cleaning' },
];

const TRADE_CATEGORIES = [
  'All',
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
  'Networking Specialist',
  'Gardener / Landscaper',
];

export const WorkerDiscoveryView: React.FC<WorkerDiscoveryViewProps> = ({
  workers,
  allWorkersRanked,
  rankedEligible,
  activeJob,
  customerLocation,
  onBookClick,
  onViewProfileClick,
  onJobCreated,
  onResetLocation,
  userProfile,
  activeBooking,
  onNavigateToBooking,
  onOpenWeightsModal,
}) => {
  // Navigation & mode state
  const [activeTab, setActiveTab] = useState<DiscoveryTab>('recommendations');
  const [curatedTab, setCuratedTab] = useState<CuratedCollectionTab>('all');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [showIntakeDetails, setShowIntakeDetails] = useState(false);

  // Search and filter state
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULT_DISCOVERY_FILTERS);

  // Curated collections
  const collections = useMemo(() => getCuratedCollections(workers), [workers]);

  // Count active non-default filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.trade !== 'All') count++;
    if (filters.skill.trim() !== '') count++;
    if (filters.availability !== 'all') count++;
    if (filters.minRating > 0) count++;
    if (filters.maxDistanceKm < 10.0) count++;
    if (filters.minExperienceYears > 0) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  // Determine base workers based on curated collection tab in Explore mode
  const baseWorkers = useMemo(() => {
    if (curatedTab === 'emergency') return collections.emergencyDispatch;
    if (curatedTab === 'masters') return collections.masterCraftsmen;
    if (curatedTab === 'free_travel') return collections.freeTravelCore;
    return workers;
  }, [curatedTab, collections, workers]);

  // Apply multi-criteria filtering to base workers
  const filteredWorkersList = useMemo(() => {
    return filterWorkers(baseWorkers, filters);
  }, [baseWorkers, filters]);

  // Apply search query across service, worker name/id, and skill
  const searchResults: SearchResultItem[] = useMemo(() => {
    const rawResults = searchWorkers(filteredWorkersList, filters.searchQuery);
    return annotateSearchResultsWithRecommendations(rawResults, rankedEligible);
  }, [filteredWorkersList, filters.searchQuery, rankedEligible]);

  // Helper to convert plain Worker to a RankedWorker view model for booking modal compatibility
  const toRankedWorkerModel = (item: SearchResultItem): RankedWorker => {
    // If worker was already evaluated by the matching engine, return that instance
    const existing = rankedEligible.find((r) => r.worker.id === item.worker.id);
    if (existing) return existing;

    const allRankedMatch = allWorkersRanked.find((r) => r.worker.id === item.worker.id);
    if (allRankedMatch) return allRankedMatch;

    return {
      worker: item.worker,
      rank: item.engineRank ?? 99,
      totalScore: item.engineMatchScore ?? 70,
      eligibility: {
        workerId: item.worker.id,
        worker: item.worker,
        isEligible: true,
        checks: [
          { ruleName: 'Within 10 km Zone', passed: item.worker.distanceKm <= 10, detail: `${item.worker.distanceKm.toFixed(1)} km` },
        ],
      },
      components: {
        skillScore: 75,
        experienceScore: Math.min(100, item.worker.experienceYears * 10),
        availabilityScore: item.worker.availabilityStatus === 'immediate' ? 100 : 70,
        qualityScore: Math.round(item.worker.rating * 20),
        distanceScore: Math.max(0, Math.round((1 - item.worker.distanceKm / 10) * 100)),
        priceScore: 80,
        personalizationScore: 70,
      },
      weightedBreakdown: {
        skill: 25,
        experience: 15,
        availability: 20,
        quality: 15,
        distance: 15,
        price: 10,
        personalization: 0,
      },
      reasons: [`Discovered via WorkLink Marketplace Search (${item.matchedCriteria.join(', ')})`],
      tradeOffSummary: 'Directory candidate identified through search filters.',
    };
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_DISCOVERY_FILTERS);
  };

  const handleQuickChipClick = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  // Primary worker and secondary workers for explore search mode
  const primarySearchItem = searchResults.length > 0 ? searchResults[0] : null;
  const secondarySearchItems = searchResults.slice(1);

  // Recommendations mode primary worker (#1 rank) and secondary workers (#2+)
  const primaryRecommendation = rankedEligible.length > 0 ? rankedEligible[0] : null;
  const secondaryRecommendations = rankedEligible.slice(1);

  return (
    <div className="space-y-8 animate-fade-in relative pb-24">
      {/* Upcoming Booking Notification Card (Milestone 11) */}
      {activeBooking && ['requested', 'accepted', 'in_progress'].includes(activeBooking.status) && (
        <div
          onClick={onNavigateToBooking}
          className="p-3.5 px-5 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge shadow-xs flex items-center justify-between cursor-pointer hover:border-[#0071E3]/40 transition-all group"
        >
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] animate-pulse" />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#111111]">
                Upcoming Booking with {activeBooking.worker.name}
              </span>
              <Badge
                variant={
                  activeBooking.status === 'requested'
                    ? 'accent'
                    : activeBooking.status === 'accepted'
                    ? 'default'
                    : 'success'
                }
                size="sm"
              >
                {activeBooking.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-[#6E6E73] hidden sm:inline">
                • {activeBooking.scheduledDate || 'Today'} ({activeBooking.scheduledTimeSlot || 'Immediate'})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs font-semibold text-[#0071E3] group-hover:translate-x-0.5 transition-transform shrink-0">
            <span>View Booking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. EDITORIAL HEADER & DISCOVERY HERO */}
      {/* ============================================================== */}
      <div className="card-premium p-6 sm:p-8 relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-[#86868B]">
                Curated Marketplace • South Delhi 10 km Zone
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight">
              Right Labour. Right Work. Right Time.
            </h1>

            <p className="text-sm sm:text-base text-[#6E6E73] leading-relaxed">
              Explore verified professionals across trades, or let our multi-factor engine match
              your specific job parameters with mathematical precision.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-[#F5F5F7] rounded-2xl border border-black/5 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'recommendations'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#0071E3]" />
              <span>AI Recommendations</span>
              {rankedEligible.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#0071E3]/10 text-[#0071E3]">
                  {rankedEligible.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#111111]" />
              <span>Directory & Search</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-black/5 text-[#6E6E73]">
                {workers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Omni-Search Bar */}
        <div className="mt-6 pt-6 border-t border-black/5">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#86868B] absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
                if (activeTab !== 'explore' && e.target.value.trim().length > 0) {
                  // Switch to explore mode when typing search
                  setActiveTab('explore');
                }
              }}
              placeholder="Search by trade, worker name, or specific skill (e.g., AC, Manoj, Copper Brazing, PCB)..."
              className="w-full pl-12 pr-28 py-3.5 bg-[#F5F5F7]/80 hover:bg-[#F5F5F7] focus:bg-white text-sm text-[#111111] placeholder-[#86868B] rounded-2xl border border-black/5 focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all outline-none"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-20 p-1 text-[#86868B] hover:text-[#111111] rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="absolute right-2.5 px-3 py-1.5 bg-white text-[#111111] rounded-xl border border-black/8 hover:border-black/20 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs hover:shadow-xs transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#0071E3] text-white text-[10px] flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Search Chips */}
          <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[11px] text-[#86868B] font-medium shrink-0">Popular:</span>
            {POPULAR_SEARCH_CHIPS.map((chip) => (
              <button
                key={chip.label}
                onClick={() => {
                  handleQuickChipClick(chip.query);
                  setActiveTab('explore');
                }}
                className={`px-3 py-1 rounded-xl shrink-0 transition-all ${
                  filters.searchQuery === chip.query
                    ? 'bg-[#111111] text-white font-semibold'
                    : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111] hover:bg-[#EBEBED]'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MODE CONTENT: AI RECOMMENDATIONS OR DIRECTORY EXPLORATION */}
      {/* ============================================================== */}

      {activeTab === 'recommendations' ? (
        <div className="space-y-8">
          {/* Natural-Language Chatbot Intake */}
          <ChatbotIntake
            currentLocation={customerLocation}
            onJobCreated={onJobCreated}
            activeJob={activeJob}
          />

          {/* Hard Constraint Filter Audit */}
          <HardFilterAudit allRanked={allWorkersRanked} activeJob={activeJob} />

          {/* Quick Trade Filter Chips */}
          <div className="flex items-center justify-between pb-3 border-b border-black/5 gap-3">
            <span className="text-xs font-semibold text-[#86868B] uppercase tracking-wider shrink-0 hidden sm:inline">
              Filter by Trade:
            </span>
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {TRADE_CATEGORIES.map((trade) => (
                <button
                  key={trade}
                  onClick={() => setFilters((prev) => ({ ...prev, trade }))}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                    filters.trade === trade
                      ? 'bg-[#111111] text-white font-semibold shadow-xs'
                      : 'bg-[#FFFFFF] hover:bg-[#F5F5F7] text-[#6E6E73] border border-black/5'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Presentation: Signature AI Recommendation Experience & Personalization */}
          {rankedEligible.length > 0 ? (
            <>
              <SignatureRecommendationView
                rankedEligible={rankedEligible}
                activeJob={activeJob}
                onBookClick={onBookClick}
                onViewProfileClick={onViewProfileClick}
                onChangePreferences={onOpenWeightsModal}
                onChangeRequirements={() => {
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                onViewAlternatives={() => setActiveTab('explore')}
                onOverrideRecommendation={(worker) => onBookClick(worker)}
              />

              {/* Milestone 9: Non-Intrusive Personalized Recommendations */}
              <PersonalizedRecommendationsSection
                workers={workers}
                userProfile={
                  userProfile || {
                    previousSearches: ['AC Repair', 'Plumber Sink Leak'],
                    previousBookingsCount: 3,
                    frequentlyUsedTrades: ['AC Technician', 'Plumber'],
                    preferredDistanceMaxKm: 5.0,
                    priceSensitivity: 'medium',
                    repeatWorkersBooked: ['W3'],
                    avgRatingGiven: 4.8,
                    hasCancellations: false,
                  }
                }
                activeJob={activeJob}
                onBookClick={onBookClick}
                onViewProfileClick={onViewProfileClick}
              />
            </>
          ) : (
            <EmptyState
              icon={<Compass className="w-8 h-8 text-[#86868B]" />}
              title="No Eligible Workers in 10 km Zone"
              description="All scanned candidates were filtered out by the 5 non-negotiable hard constraints. Try broadening your requested time slot or shifting your 10 km zone center."
              actionLabel="Reset to Hauz Khas Center"
              onAction={onResetLocation}
            />
          )}
        </div>
      ) : (
        /* ============================================================== */
        /* DIRECTORY SEARCH & EXPLORATION MODE */
        /* ============================================================== */
        <div className="space-y-6">
          {/* Architectural Distinction Banner */}
          <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/15 flex items-start space-x-3.5">
            <Info className="w-5 h-5 text-[#0071E3] shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-[#111111]">
              <span className="font-bold text-[#0071E3] uppercase tracking-wider block mb-0.5">
                Directory Exploration View
              </span>
              Keyword search and directory browsing display all matching craftspeople across South
              Delhi. <strong>Notice:</strong> General search results are independent of algorithmic
              engine recommendations unless annotated with an active Multi-Factor Match score.
            </div>
          </div>

          {/* Curated Editorial Collection Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setCuratedTab('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
                curatedTab === 'all'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
              }`}
            >
              All Directory ({workers.length})
            </button>
            <button
              onClick={() => setCuratedTab('emergency')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                curatedTab === 'emergency'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Emergency Dispatch &lt;45m ({collections.emergencyDispatch.length})</span>
            </button>
            <button
              onClick={() => setCuratedTab('masters')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                curatedTab === 'masters'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-[#AF52DE]" />
              <span>Master Craftsmen 7+ yrs ({collections.masterCraftsmen.length})</span>
            </button>
            <button
              onClick={() => setCuratedTab('free_travel')}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all flex items-center space-x-1.5 ${
                curatedTab === 'free_travel'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Free Travel Core Zone ({collections.freeTravelCore.length})</span>
            </button>
          </div>

          {/* Active Filter Indicators */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#6E6E73]">
              <span className="font-semibold text-[#111111]">Active Filters:</span>
              {filters.trade !== 'All' && (
                <span className="px-2.5 py-1 rounded-xl bg-black/5 text-[#111111] flex items-center space-x-1">
                  <span>Trade: {filters.trade}</span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, trade: 'All' }))}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.availability !== 'all' && (
                <span className="px-2.5 py-1 rounded-xl bg-black/5 text-[#111111] flex items-center space-x-1">
                  <span>Avail: {filters.availability}</span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, availability: 'all' }))}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-black/5 text-[#111111] flex items-center space-x-1">
                  <span>Rating: {filters.minRating}+ ★</span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, minRating: 0 }))}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.verifiedOnly && (
                <span className="px-2.5 py-1 rounded-xl bg-black/5 text-[#111111] flex items-center space-x-1">
                  <span>Verified Only</span>
                  <button
                    onClick={() => setFilters((p) => ({ ...p, verifiedOnly: false }))}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-[#0071E3] hover:underline font-semibold ml-2"
              >
                Reset All
              </button>
            </div>
          )}

          {/* Results Display */}
          {searchResults.length > 0 ? (
            <div className="space-y-6">
              {/* Primary Search Worker Spotlight */}
              {primarySearchItem && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-[#86868B] font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
                      <span>Featured Editorial Spotlight</span>
                    </span>
                    <span className="text-xs text-[#86868B]">
                      {searchResults.length} {searchResults.length === 1 ? 'Worker' : 'Workers'} Found
                    </span>
                  </div>

                  <PrimaryEditorialWorkerCard
                    item={primarySearchItem}
                    onBookClick={() => onBookClick(toRankedWorkerModel(primarySearchItem))}
                    onViewProfileClick={() => onViewProfileClick(toRankedWorkerModel(primarySearchItem))}
                  />
                </div>
              )}

              {/* Secondary Search Results */}
              {secondarySearchItems.length > 0 && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
                    Additional Discovery Matches ({secondarySearchItems.length})
                  </h3>

                  {/* Responsive Grid with Mobile Scroll-Snap */}
                  <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-3 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {secondarySearchItems.map((item) => (
                      <div
                        key={item.worker.id}
                        className="min-w-[260px] xs:min-w-[280px] sm:min-w-0 snap-start flex-1"
                      >
                        <SecondaryWorkerCard
                          item={item}
                          onBookClick={() => onBookClick(toRankedWorkerModel(item))}
                          onViewProfileClick={() => onViewProfileClick(toRankedWorkerModel(item))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="w-8 h-8 text-[#86868B]" />}
              title="No Directory Matches"
              description={`No professionals matched your search "${filters.searchQuery}" and current filters.`}
              actionLabel="Reset Search & Filters"
              onAction={handleResetFilters}
            />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. FLOATING GLASS FILTER BUTTON (Apple-grade floating control) */}
      {/* ============================================================== */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={() => setIsFilterSheetOpen(true)}
          className="flex items-center space-x-2.5 px-5 py-3 rounded-full bg-white/90 backdrop-blur-xl border border-black/10 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.18)] hover:bg-white text-sm font-semibold text-[#111111] transition-all hover:scale-102 active:scale-98 glass-specular-edge"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#0071E3]" />
          <span>Refine Discovery</span>
          {activeFilterCount > 0 ? (
            <span className="w-5 h-5 rounded-full bg-[#0071E3] text-white text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          ) : (
            <span className="text-xs text-[#86868B]">({searchResults.length})</span>
          )}
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. FILTER BOTTOM SHEET (Mobile & Desktop Responsive Drawer) */}
      {/* ============================================================== */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        position="bottom"
        title={
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-[#0071E3]" />
            <span>Refine Marketplace Filters</span>
          </div>
        }
        subtitle="Filter verified professionals by skill, availability, rating, and geographic radius."
      >
        <div className="space-y-6 pb-6 text-sm">
          {/* Trade / Service */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Trade Category
            </label>
            <div className="flex flex-wrap gap-2">
              {TRADE_CATEGORIES.map((trade) => (
                <button
                  key={trade}
                  onClick={() => setFilters((p) => ({ ...p, trade }))}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                    filters.trade === trade
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {trade}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Availability Window
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { label: 'Any', val: 'all' },
                  { label: 'Immediate (<45m)', val: 'immediate' },
                  { label: 'Today', val: 'today' },
                  { label: 'Tomorrow', val: 'tomorrow' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFilters((p) => ({ ...p, availability: opt.val }))}
                  className={`text-xs p-2.5 rounded-xl font-medium text-center transition-all ${
                    filters.availability === opt.val
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Minimum Rating
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Any Rating', val: 0 },
                { label: '4.5+ ★ Superior', val: 4.5 },
                { label: '4.8+ ★ Elite', val: 4.8 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFilters((p) => ({ ...p, minRating: opt.val }))}
                  className={`text-xs p-2.5 rounded-xl font-medium text-center transition-all ${
                    filters.minRating === opt.val
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Band */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Geographic Proximity
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: '≤ 5.0 km (Core Free Zone)', val: 5.0 },
                { label: '≤ 10.0 km (Full Service Zone)', val: 10.0 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFilters((p) => ({ ...p, maxDistanceKm: opt.val }))}
                  className={`text-xs p-2.5 rounded-xl font-medium text-center transition-all ${
                    filters.maxDistanceKm === opt.val
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Tier */}
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wider mb-2">
              Trade Experience
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Any', val: 0 },
                { label: '3+ Yrs', val: 3 },
                { label: '5+ Yrs', val: 5 },
                { label: '8+ Yrs', val: 8 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFilters((p) => ({ ...p, minExperienceYears: opt.val }))}
                  className={`text-xs p-2.5 rounded-xl font-medium text-center transition-all ${
                    filters.minExperienceYears === opt.val
                      ? 'bg-[#111111] text-white font-semibold'
                      : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verified Only Toggle */}
          <div className="pt-2 flex items-center justify-between border-t border-black/5">
            <div>
              <p className="text-xs font-bold text-[#111111]">Verified Professionals Only</p>
              <p className="text-[11px] text-[#6E6E73]">
                Strictly show providers with verified identity & trade certification.
              </p>
            </div>
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters((p) => ({ ...p, verifiedOnly: e.target.checked }))}
              className="w-5 h-5 accent-[#0071E3] rounded cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-black/5 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleResetFilters}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset Filters
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsFilterSheetOpen(false)}
              className="flex-1"
            >
              Apply ({searchResults.length} Results)
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

// ==============================================================
// PRIMARY EDITORIAL WORKER CARD (Spotlight treatment)
// ==============================================================
interface PrimaryEditorialWorkerCardProps {
  item: SearchResultItem;
  onBookClick: () => void;
  onViewProfileClick: () => void;
}

const PrimaryEditorialWorkerCard: React.FC<PrimaryEditorialWorkerCardProps> = ({
  item,
  onBookClick,
  onViewProfileClick,
}) => {
  const { worker, isEngineRecommendation, engineRank, engineMatchScore, matchedCriteria } = item;
  const travelBand = getTravelBand(worker.distanceKm);

  return (
    <div className="card-premium p-6 sm:p-7 relative overflow-hidden bg-white border border-black/10 shadow-card hover:shadow-card-hover transition-all">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-black/5 mb-5">
        <div className="flex items-center space-x-2">
          {isEngineRecommendation ? (
            <Badge variant="primary" size="sm">
              <Sparkles className="w-3 h-3 mr-1" />
              Engine Match Rank #{engineRank}
            </Badge>
          ) : (
            <Badge variant="neutral" size="sm">
              Directory Match ({matchedCriteria.join(', ')})
            </Badge>
          )}
          {worker.isVerified && (
            <Badge variant="success" size="sm">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified Pro
            </Badge>
          )}
        </div>

        {isEngineRecommendation && typeof engineMatchScore === 'number' && (
          <MatchScore score={engineMatchScore} size="md" />
        )}
      </div>

      {/* Main Grid: Details & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="xl"
            isVerified={worker.isVerified}
          />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-xl font-extrabold text-[#111111] tracking-tight">
                {worker.name}
              </h3>
              <span className="text-xs text-[#86868B] font-mono">({worker.id})</span>
            </div>

            <p className="text-sm font-semibold text-[#0071E3]">
              {worker.trade} • {worker.experienceYears} Years Master Experience
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#6E6E73]">
              <span className="flex items-center font-bold text-[#111111]">
                <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
                {worker.rating.toFixed(1)}
                <span className="text-[#86868B] font-normal ml-1">({worker.reviewCount} jobs)</span>
              </span>

              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 text-[#86868B] mr-1" />
                <span className="font-semibold text-[#111111] mr-1">
                  {worker.distanceKm.toFixed(1)} km
                </span>
                <span className="text-[11px] text-[#34C759]">
                  {travelBand.band === 'core_free' ? '• Free Travel Zone' : `• +₹${travelBand.travelCharge} Travel`}
                </span>
              </span>

              <span className="flex items-center text-[#111111]">
                <Clock className="w-3.5 h-3.5 text-[#34C759] mr-1" />
                <span className="capitalize font-medium">{worker.availabilityStatus}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-4 md:pt-0 border-black/5 shrink-0 gap-3">
          <div className="text-left md:text-right">
            <span className="text-[11px] text-[#86868B] uppercase font-mono block">Estimated Quote</span>
            <span className="text-2xl font-extrabold text-[#111111]">
              ₹{worker.estimatedQuote}
            </span>
            <span className="text-xs text-[#86868B] block">₹{worker.hourlyRate}/hr base</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onViewProfileClick}>
              Inspect Profile
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onBookClick}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Book Direct
            </Button>
          </div>
        </div>
      </div>

      {/* Skills Badges */}
      <div className="mt-5 pt-4 border-t border-black/5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-[#86868B] mr-1">Verified Trade Skills:</span>
        {worker.skills.map((skill) => (
          <span
            key={skill}
            className="text-xs px-2.5 py-1 rounded-lg bg-[#F5F5F7] text-[#111111] font-medium border border-black/5"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

// ==============================================================
// SECONDARY WORKER CARD (Simpler surface, mobile carousel friendly)
// ==============================================================
interface SecondaryWorkerCardProps {
  item: SearchResultItem;
  onBookClick: () => void;
  onViewProfileClick: () => void;
}

const SecondaryWorkerCard: React.FC<SecondaryWorkerCardProps> = ({
  item,
  onBookClick,
  onViewProfileClick,
}) => {
  const { worker, isEngineRecommendation, engineRank, engineMatchScore } = item;
  const travelBand = getTravelBand(worker.distanceKm);

  return (
    <div className="card-premium p-4 sm:p-5 flex flex-col justify-between h-full bg-white border border-black/8 hover:border-black/20 hover:shadow-card transition-all">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-black/5">
          <div className="flex items-center space-x-3 min-w-0">
            <Avatar
              src={worker.avatar}
              alt={worker.name}
              size="md"
              isVerified={worker.isVerified}
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-[#111111] truncate tracking-tight">
                {worker.name}
              </h4>
              <p className="text-xs text-[#6E6E73] truncate">
                {worker.trade} • {worker.experienceYears}y
              </p>
            </div>
          </div>

          {isEngineRecommendation && typeof engineMatchScore === 'number' ? (
            <div className="shrink-0 text-right">
              <span className="text-[10px] font-mono text-[#0071E3] font-bold block">
                #{engineRank} Match
              </span>
              <MatchScore score={engineMatchScore} size="sm" />
            </div>
          ) : (
            <span className="text-[10px] font-mono text-[#86868B] shrink-0">
              {worker.id}
            </span>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center justify-between text-xs py-3 text-[#6E6E73]">
          <span className="flex items-center font-bold text-[#111111]">
            <Star className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500] mr-1" />
            {worker.rating.toFixed(1)}
          </span>

          <span className="flex items-center">
            <MapPin className="w-3 h-3 text-[#86868B] mr-0.5" />
            <span>{worker.distanceKm.toFixed(1)} km</span>
            {travelBand.band === 'core_free' && (
              <span className="ml-1 text-[10px] text-[#34C759] font-semibold">(Free)</span>
            )}
          </span>

          <span className="capitalize font-medium text-[#111111]">
            {worker.availabilityStatus}
          </span>
        </div>

        {/* Skills Snippet */}
        <div className="flex flex-wrap gap-1 mb-3">
          {worker.skills.slice(0, 2).map((skill) => (
            <span
              key={skill}
              className="text-[11px] px-2 py-0.5 rounded-md bg-[#F5F5F7] text-[#6E6E73] truncate max-w-[150px]"
            >
              {skill}
            </span>
          ))}
          {worker.skills.length > 2 && (
            <span className="text-[10px] text-[#86868B] px-1 py-0.5">
              +{worker.skills.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer: Price & Quick CTA */}
      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#86868B] block font-mono">ESTIMATE</span>
          <span className="text-sm font-bold text-[#111111]">₹{worker.estimatedQuote}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={onViewProfileClick}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#6E6E73] hover:text-[#111111] hover:bg-[#F5F5F7] transition-all"
          >
            Profile
          </button>
          <button
            onClick={onBookClick}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#111111] text-white hover:bg-black transition-all shadow-2xs"
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
};
