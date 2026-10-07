export type TradeCategory =
  | 'AC Technician'
  | 'Plumber'
  | 'Electrician'
  | 'Carpenter'
  | 'Painter'
  | 'Mechanic'
  | 'Appliance Repair'
  | 'Cleaning Professional'
  | 'Mason / General Technician'
  | 'Locksmith'
  | 'Electronics Specialist'
  | 'Networking Specialist'
  | 'Gas Appliance Specialist'
  | 'Glass & Aluminium Specialist'
  | 'Gardener / Landscaper'
  | 'Furniture Assembly Specialist';

export type WorkerApprovalStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

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
  approvalStatus?: WorkerApprovalStatus;
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
  // Auditability & Governance Fields (Milestone 26)
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  suspendedBy?: string;
  suspendedAt?: string;
}

export interface JobRequest {
  id: string;
  rawPrompt: string;
  serviceCategory: TradeCategory;
  service?: string;
  requiredSkills: string[];
  requiredExperienceYears: number;
  urgency: 'emergency' | 'high' | 'normal' | 'scheduled';
  requestedDate?: string;
  requestedTime: string;
  location: CustomerLocation;
  budgetMax?: number;
  budget?: number | null;
  mandatoryConditions: string[];
  additionalConstraints?: string[];
  notes?: string;
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
  source: 'business_prior' | 'calibrated_scenario' | 'learned_from_transactions' | 'heuristic_operational_prior' | 'user_configured';
  validationNote?: string;
}

export interface StructuredExplanation {
  matchScore: number;
  reasons: string[];
  tradeOffSummary: string;
  factorHighlights: {
    skill: string;
    experience: string;
    availability: string;
    quality: string;
    distance: string;
    price: string;
    personalization?: string;
  };
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
  structuredExplanation?: StructuredExplanation;
  rank: number;
  benchmarkNote?: string;
  rankingMethod?: 'deterministic_rule_based' | 'model_assisted' | 'deterministic_fallback';
}

export interface AdditionalWorkItem {
  id: string;
  name: string;
  cost: number;
  approved: boolean;
  addedBy?: 'worker' | 'customer';
  notes?: string;
}

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rated'
  | 'en_route'
  | 'arrived'
  | 'paused'
  | 'paid';

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface PaymentReceipt {
  receiptNumber: string;
  transactionReference: string;
  bookingId: string;
  workerName: string;
  workerTrade: string;
  customerName: string;
  customerAddress: string;
  serviceCategory: string;
  timestamp: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash on Delivery';
  paymentStatus: PaymentStatus;
  isSimulated: boolean;
  actualHours: number;
  workingDurationFormatted: string;
  hourlyRate: number;
  actualLabour: number;
  travelDistanceKm: number;
  travelCharge: number;
  additionalWorkItems: Array<{ name: string; cost: number; approved: boolean }>;
  additionalWorkTotal: number;
  platformFee: number;
  discount: number;
  finalTotal: number;
}

export interface PaymentTransactionRecord {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  method: 'UPI' | 'Card' | 'Cash on Delivery';
  isSimulated: boolean;
  transactionReference: string;
  timestamp: string;
  receiptNumber: string;
  workerName: string;
  serviceCategory: string;
}

export interface Booking {
  id: string;
  job: JobRequest;
  worker: Worker;
  status: BookingStatus;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  startTime?: number;
  startedAt?: string;
  endTime?: number;
  endedAt?: string;
  workingDurationSeconds?: number;
  pausedAt?: string;
  pauseReason?: string;
  workerStatusMessage?: string;
  notes?: string;
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
  paymentStatus?: PaymentStatus;
  paymentMethod?: 'UPI' | 'Card' | 'Cash on Delivery';
  paymentReference?: string;
  receiptNumber?: string;
  paidAt?: string;
  isSimulatedPayment?: boolean;
  feedback?: BookingFeedback;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'worker';
}

export interface FeedbackSignals {
  rating: number;            // 1 - 5
  completion: boolean;       // completed without dispute
  cancellation: boolean;     // false for completed jobs
  responseTime: number;      // recorded response time in minutes
  repeatBooking: boolean;    // added to repeat pro list
  satisfaction: number;      // 0 - 100 percentage
  disputes: number;          // 0 disputes
}

export interface BookingFeedback {
  rating: number;
  tags: string[];
  comment: string;
  submittedAt: string;
  signals?: FeedbackSignals;
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
