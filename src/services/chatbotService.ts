import { JobRequest, TradeCategory, CustomerLocation } from '../types';
import { classifyServiceRequest, ClassificationResult } from './taxonomyService';

export interface ExtractedSlots {
  service: string; // e.g. "AC Repair", "Electrical Wiring", "Plumbing"
  serviceCategory: TradeCategory; // Canonical trade e.g. "AC Technician", "Plumber", "Electrician"
  requiredSkills: string[];
  requiredExperienceYears: number;
  urgency: 'emergency' | 'high' | 'normal' | 'scheduled';
  requestedDate: string; // e.g. "Tomorrow"
  requestedTime: string; // e.g. "Tomorrow Morning"
  budget: number | null; // null if "Not specified"
  budgetMax: number;
  mandatoryConditions: string[];
  additionalConstraints: string[];
  detectedIssueSummary: string;
  confidenceScore: number;
  missingClarifications: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  extractedSlots?: ExtractedSlots;
  clarificationOptions?: string[];
  isStructuredJobGenerated?: boolean;
}

export const SAMPLE_PROMPTS = [
  {
    label: 'Tomorrow Morning AC (Benchmark)',
    prompt: "My AC isn't cooling. I need someone tomorrow morning.",
  },
  {
    label: 'Emergency AC Buzzing (₹800)',
    prompt: "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800.",
  },
  {
    label: 'Burst Sink Pipe Leak',
    prompt: 'Emergency! Copper pipe under my kitchen sink burst and is leaking water everywhere. Need an experienced plumber immediately.',
  },
  {
    label: 'Sparking MCB Box (₹600)',
    prompt: 'Ceiling fan is sparking and repeatedly tripping our main MCB box. Need a licensed electrician today, budget around ₹600.',
  },
  {
    label: 'Swollen Jammed Door',
    prompt: 'Monsoon humidity has swollen our wooden bedroom door and it is jammed in the frame. Need a skilled carpenter tomorrow.',
  },
  {
    label: 'Washing Machine Error',
    prompt: 'Front-load washing machine drum is vibrating violently and showing error E4. Need an appliance technician today.',
  },
];

/**
 * Parses natural language user input into structured job attributes
 * using the centralized context-aware classification taxonomy.
 */
export function parseNaturalLanguageJob(
  text: string,
  currentLocation: CustomerLocation
): ExtractedSlots {
  const lower = text.toLowerCase();

  // 1. Context-Aware and Object-First Classification (Milestone 26)
  const classification: ClassificationResult = classifyServiceRequest(text);
  const service = classification.serviceName;
  const serviceCategory: TradeCategory = classification.serviceCategory;
  const requiredSkills: string[] = classification.requiredSkills;
  const requiredExperienceYears = classification.requiredExperienceYears;
  const detectedIssue = classification.detectedIssueSummary;
  let requestedDate = 'Today';
  let requestedTime = 'Flexible Today';

  if (
    lower.includes('tomorrow morning') ||
    (lower.includes('tomorrow') && (lower.includes('morning') || lower.includes('am')))
  ) {
    urgency = 'normal';
    requestedDate = 'Tomorrow';
    requestedTime = 'Tomorrow Morning (09:00 - 12:00)';
  } else if (lower.includes('tomorrow evening') || lower.includes('tomorrow afternoon')) {
    urgency = 'normal';
    requestedDate = 'Tomorrow';
    requestedTime = 'Tomorrow Afternoon (14:00 - 17:00)';
  } else if (lower.includes('tomorrow')) {
    urgency = 'normal';
    requestedDate = 'Tomorrow';
    requestedTime = 'Tomorrow (Flexible Slot)';
  } else if (
    lower.includes('right now') ||
    lower.includes('immediately') ||
    lower.includes('emergency') ||
    lower.includes('urgent') ||
    lower.includes('asap')
  ) {
    urgency = 'emergency';
    requestedDate = 'Today';
    requestedTime = 'Immediate (Within 45 mins)';
  } else if (lower.includes('tonight') || lower.includes('this evening')) {
    urgency = 'high';
    requestedDate = 'Today';
    requestedTime = 'This Evening (18:00 - 20:00)';
  } else if (lower.includes('today')) {
    urgency = 'high';
    requestedDate = 'Today';
    requestedTime = 'Today Afternoon (13:00 - 16:00)';
  } else if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    urgency = 'scheduled';
    requestedDate = 'Upcoming Weekend';
    requestedTime = 'Weekend Morning Slot';
  }

  // 3. Budget extraction (e.g. "budget is 800", "₹750", "budget around 600", "under 1000")
  let budget: number | null = null;
  let budgetMax = 800; // default cap if not specified

  const budgetRegex = /(?:budget|price|rate|quote|cost|under|within|max)?\s*(?:is|of|around|approx)?\s*[₹$]?\s*(\d{3,5})/i;
  const budgetMatch = text.match(budgetRegex);

  if (budgetMatch && budgetMatch[1]) {
    const parsed = parseInt(budgetMatch[1], 10);
    // Sanity range check for Indian skilled labour services: ₹200 to ₹15,000
    if (parsed >= 200 && parsed <= 15000) {
      budget = parsed;
      budgetMax = parsed;
    }
  }

  // 4. Missing Clarifications & Additional Constraints
  const missingClarifications: string[] = [];
  if (
    !lower.includes('tomorrow') &&
    !lower.includes('today') &&
    !lower.includes('right now') &&
    !lower.includes('immediately') &&
    !lower.includes('weekend')
  ) {
    missingClarifications.push('Preferred appointment window (Immediate vs Tomorrow)');
  }
  if (budget === null) {
    missingClarifications.push('Target budget ceiling (optional)');
  }

  const additionalConstraints = [
    'Verified government trade license',
    'Background check cleared',
    'Equipped with diagnostic tools',
  ];

  return {
    service,
    serviceCategory,
    requiredSkills,
    requiredExperienceYears,
    urgency,
    requestedDate,
    requestedTime,
    budget,
    budgetMax,
    mandatoryConditions: [
      'Worker verified',
      'Required skill available',
      'Worker available',
      'Worker within 10 km',
      'Mandatory job conditions satisfied',
    ],
    additionalConstraints,
    detectedIssueSummary: detectedIssue,
    confidenceScore: 0.96,
    missingClarifications,
    notes: `Customer requirement: ${detectedIssue}. Requested: ${requestedTime}.`,
  };
}

/**
 * Creates structured JobRequest from extracted slots
 */
export function createJobRequestFromSlots(
  prompt: string,
  slots: ExtractedSlots,
  location: CustomerLocation
): JobRequest {
  return {
    id: `JOB-${Date.now().toString().slice(-6)}`,
    rawPrompt: prompt,
    service: slots.service,
    serviceCategory: slots.serviceCategory,
    requiredSkills: slots.requiredSkills,
    requiredExperienceYears: slots.requiredExperienceYears,
    urgency: slots.urgency,
    requestedDate: slots.requestedDate,
    requestedTime: slots.requestedTime,
    location,
    budget: slots.budget,
    budgetMax: slots.budgetMax,
    mandatoryConditions: slots.mandatoryConditions,
    additionalConstraints: slots.additionalConstraints,
    notes: slots.notes,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
