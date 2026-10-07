import { JobRequest, TradeCategory, CustomerLocation } from '../types';

export interface ExtractedSlots {
  serviceCategory: TradeCategory;
  requiredSkills: string[];
  requiredExperienceYears: number;
  urgency: 'emergency' | 'high' | 'normal' | 'scheduled';
  requestedTime: string;
  budgetMax: number;
  mandatoryConditions: string[];
  detectedIssueSummary: string;
  confidenceScore: number;
  missingClarifications: string[];
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
    label: 'Emergency AC Cooling',
    prompt: "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800.",
  },
  {
    label: 'Burst Pipe Leak',
    prompt: 'Emergency! Copper pipe under my kitchen sink burst and is leaking water everywhere. Need an experienced plumber immediately.',
  },
  {
    label: 'Electrician Spark / MCB Trip',
    prompt: 'Ceiling fan is sparking and repeatedly tripping our main MCB box. Need a licensed electrician today, budget around ₹600.',
  },
  {
    label: 'Jamming Wooden Door',
    prompt: 'Monsoon humidity has swollen our wooden bedroom door and it is jammed in the frame. Need a skilled carpenter today.',
  },
  {
    label: 'Washing Machine Error',
    prompt: 'Front-load washing machine drum is vibrating violently and not draining. Need an appliance technician today.',
  },
];

/**
 * Parses natural language user input into structured job attributes
 */
export function parseNaturalLanguageJob(
  text: string,
  currentLocation: CustomerLocation
): ExtractedSlots {
  const lower = text.toLowerCase();

  // 1. Service Category & Skills
  let serviceCategory: TradeCategory = 'AC Technician';
  let requiredSkills: string[] = ['AC Diagnostics', 'Gas Leak Detection'];
  let requiredExperienceYears = 3;
  let detectedIssue = 'AC Cooling Malfunction';

  if (lower.includes('plumb') || lower.includes('pipe') || lower.includes('leak') || lower.includes('tap') || lower.includes('sink') || lower.includes('drain')) {
    serviceCategory = 'Plumber';
    requiredSkills = ['Pipe Leak Repair', 'Bathroom Fitting'];
    requiredExperienceYears = 3;
    detectedIssue = 'Plumbing Pipe / Drainage Leak';
  } else if (lower.includes('electr') || lower.includes('mcb') || lower.includes('spark') || lower.includes('wire') || lower.includes('short circuit') || lower.includes('fan')) {
    serviceCategory = 'Electrician';
    requiredSkills = ['Short Circuit Troubleshooting', 'MCB & DB Box Repair'];
    requiredExperienceYears = 3;
    detectedIssue = 'Electrical Short Circuit / Wiring Fault';
  } else if (lower.includes('carpent') || lower.includes('door') || lower.includes('wood') || lower.includes('hinge') || lower.includes('jam')) {
    serviceCategory = 'Carpenter';
    requiredSkills = ['Door Jamming Fix', 'Modular Kitchen Hinge Repair'];
    requiredExperienceYears = 4;
    detectedIssue = 'Swollen / Jammed Door Planing';
  } else if (lower.includes('paint') || lower.includes('damp') || lower.includes('seepage') || lower.includes('wall')) {
    serviceCategory = 'Painter';
    requiredSkills = ['Dampness Water-proofing', 'Wall Touch-up & Putty'];
    requiredExperienceYears = 3;
    detectedIssue = 'Wall Seepage & Paint Touch-up';
  } else if (lower.includes('washing machine') || lower.includes('fridge') || lower.includes('microwave') || lower.includes('appliance')) {
    serviceCategory = 'Appliance Repair';
    requiredSkills = ['Washing Machine Drum Fault', 'Appliance Electronics'];
    requiredExperienceYears = 4;
    detectedIssue = 'Home Appliance Mechanical Fault';
  } else if (lower.includes('clean') || lower.includes('sofa') || lower.includes('deep clean') || lower.includes('sanitize')) {
    serviceCategory = 'Cleaning Professional';
    requiredSkills = ['Deep Home Cleaning', 'Kitchen Degreasing'];
    requiredExperienceYears = 2;
    detectedIssue = 'Deep Home Sanitization & Cleaning';
  } else {
    // Default AC technician
    serviceCategory = 'AC Technician';
    requiredSkills = ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair'];
    requiredExperienceYears = 3;
    detectedIssue = "AC Not Cooling / Refrigerant & Compressor Issue";
  }

  // 2. Urgency & Time Slot
  let urgency: 'emergency' | 'high' | 'normal' | 'scheduled' = 'normal';
  let requestedTime = 'Flexible today';

  if (lower.includes('right now') || lower.includes('immediately') || lower.includes('emergency') || lower.includes('urgent') || lower.includes('asap')) {
    urgency = 'emergency';
    requestedTime = 'Immediate (Within 45 mins)';
  } else if (lower.includes('tomorrow morning') || lower.includes('tomorrow')) {
    urgency = 'normal';
    requestedTime = 'Tomorrow 10:00 AM';
  } else if (lower.includes('today') || lower.includes('tonight') || lower.includes('this evening')) {
    urgency = 'high';
    requestedTime = 'Today Afternoon';
  } else if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    urgency = 'scheduled';
    requestedTime = 'Upcoming Weekend';
  }

  // 3. Budget extraction (e.g. "budget is 800", "₹750", "under 1000", "budget 600")
  let budgetMax = 800;
  const budgetMatch = text.match(/(?:budget|price|under|within|max)?\s*(?:is|of|around)?\s*[₹$]?\s*(\d{3,5})/i);
  if (budgetMatch && budgetMatch[1]) {
    const parsed = parseInt(budgetMatch[1], 10);
    if (parsed >= 200 && parsed <= 10000) {
      budgetMax = parsed;
    }
  }

  // 4. Missing clarifications
  const missingClarifications: string[] = [];
  if (!lower.includes('right now') && !lower.includes('tomorrow') && !lower.includes('today')) {
    missingClarifications.push('Preferred service time (Immediate vs Scheduled slot)');
  }
  if (!budgetMatch) {
    missingClarifications.push('Approximate budget expectation');
  }

  return {
    serviceCategory,
    requiredSkills,
    requiredExperienceYears,
    urgency,
    requestedTime,
    budgetMax,
    mandatoryConditions: ['Verified background check', 'Trade license active', 'Carries testing tools'],
    detectedIssueSummary: detectedIssue,
    confidenceScore: 0.94,
    missingClarifications,
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
    serviceCategory: slots.serviceCategory,
    requiredSkills: slots.requiredSkills,
    requiredExperienceYears: slots.requiredExperienceYears,
    urgency: slots.urgency,
    requestedTime: slots.requestedTime,
    location,
    budgetMax: slots.budgetMax,
    mandatoryConditions: slots.mandatoryConditions,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
