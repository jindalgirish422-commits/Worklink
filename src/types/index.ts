export type TradeCategory =
  | 'AC Technician'
  | 'Plumber'
  | 'Electrician'
  | 'Carpenter'
  | 'Painter'
  | 'Mechanic'
  | 'Appliance Repair'
  | 'Cleaning Professional'
  | 'Mason / General Technician';

export type AvailabilityStatus = 'immediate' | 'today' | 'tomorrow' | 'busy';

export interface CustomerLocation {
  address: string;
  lat: number;
  lng: number;
  radiusKm: number; // strictly 10 km
}

export interface WorkerReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  tradeTag: string;
}

export interface Worker {
  id: string; // e.g. W1, W2, W3...
  name: string;
  trade: TradeCategory;
  skills: string[];
  experienceYears: number;
  hourlyRate: number; // in INR ₹
  estimatedQuote: number; // standard diagnostic / service quote in ₹
  rating: number; // out of 5.0
  reviewCount: number;
  completedJobs: number;
  completionRate: number; // e.g. 0.98 = 98%
  responseTimeMinutes: number;
  isVerified: boolean;
  licenseNumber: string;
  backgroundCheckPassed: boolean;
  phone: string;
  avatar: string;
  bio: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm: number; // distance relative to customer
  availabilityStatus: AvailabilityStatus;
  nextAvailableSlot: string;
  toolsEquipped: string[];
  recentReviews: WorkerReview[];
  notes?: string;
  isBenchmarkWorker?: boolean; // From Appendix G
}

export interface JobRequest {
  id: string;
  rawPrompt: string;
  serviceCategory: TradeCategory;
  requiredSkills: string[];
  requiredExperienceYears: number;
  urgency: 'emergency' | 'high' | 'normal' | 'scheduled';
  requestedTime: string;
  location: CustomerLocation;
  budgetMax?: number;
  mandatoryConditions: string[];
  clarificationAnswers?: Record<string, string>;
  createdAt: string;
}

export interface HardConstraintCheck {
  ruleName: string;
  passed: boolean;
  detail: string;
}

export interface WorkerEligibility {
  workerId: string;
  worker: Worker;
  isEligible: boolean;
  failedRule?: string;
  checks: HardConstraintCheck[];
}

export interface MatchingWeights {
  id: string;
  name: string;
  description: string;
  w_skill: number;
  w_experience: number;
  w_availability: number;
  w_quality: number;
  w_distance: number;
  w_price: number;
  personalizationBonus: number;
  source: 'business_prior' | 'calibrated_scenario' | 'learned_from_transactions';
}

export interface WorkerScoreComponents {
  skillScore: number;       // S_skill: 0 - 100
  experienceScore: number;  // S_experience: 0 - 100 (evaluated against job need, not blindly maximized)
  availabilityScore: number;// S_availability: 0 - 100
  qualityScore: number;     // S_quality: 0 - 100 (rating, completion rate, history)
  distanceScore: number;    // S_distance: 0 - 100 (normalised within 10km)
  priceScore: number;       // S_price: 0 - 100 (quote vs budget)
  personalizationScore: number; // 0 - 100 (repeat preference, history)
}

export interface RankedWorker {
  worker: Worker;
  eligibility: WorkerEligibility;
  totalScore: number; // 0 - 100
  components: WorkerScoreComponents;
  weightedBreakdown: {
    skill: number;
    experience: number;
    availability: number;
    quality: number;
    distance: number;
    price: number;
    personalization: number;
  };
  reasons: string[]; // Transparent "Why this worker was recommended"
  tradeOffSummary: string;
  rank: number;
  benchmarkNote?: string;
}

export interface AdditionalWorkItem {
  id: string;
  name: string;
  cost: number;
  approved: boolean;
}

export interface Booking {
  id: string;
  job: JobRequest;
  worker: Worker;
  status:
    | 'requested'
    | 'accepted'
    | 'en_route'
    | 'arrived'
    | 'in_progress'
    | 'paused'
    | 'completed'
    | 'paid'
    | 'cancelled';
  startTime?: number;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  estimatedHours: number;
  actualHours: number;
  travelDistanceKm: number;
  travelCharge: number; // 0 for <=5km; configurable slab for 5-10km
  baseLabourFee: number;
  additionalWorkItems: AdditionalWorkItem[];
  platformFee: number;
  discount: number;
  estimatedTotal: number;
  finalTotal: number;
  paymentMethod?: 'UPI' | 'Card' | 'Cash on Delivery';
  paymentReference?: string;
  feedback?: {
    rating: number;
    tags: string[];
    comment: string;
    submittedAt: string;
  };
}

export interface UserPersonalizationProfile {
  previousSearches: string[];
  previousBookingsCount: number;
  frequentlyUsedTrades: TradeCategory[];
  preferredDistanceMaxKm: number;
  priceSensitivity: 'low' | 'medium' | 'high';
  repeatWorkersBooked: string[];
  avgRatingGiven: number;
  hasCancellations: boolean;
}

export * from './auth';
