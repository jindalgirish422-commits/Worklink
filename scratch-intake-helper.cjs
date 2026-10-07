function parseNaturalLanguageJob(text, currentLocation) {
  const lower = text.toLowerCase();

  let service = 'AC Repair';
  let serviceCategory = 'AC Technician';
  let requiredSkills = ['Inverter Compressor', 'Gas Leak Detection'];
  let requiredExperienceYears = 3;
  let detectedIssue = 'AC Not Cooling Malfunction';

  if (
    lower.includes('plumb') ||
    lower.includes('pipe') ||
    lower.includes('leak') ||
    lower.includes('tap') ||
    lower.includes('sink') ||
    lower.includes('drain')
  ) {
    service = 'Pipe Leak & Plumbing';
    serviceCategory = 'Plumber';
    requiredSkills = ['PPR Pipe Welding', 'Pressure Booster', 'Concealed Leak Detection'];
    requiredExperienceYears = 3;
    detectedIssue = 'Plumbing Pipe / Drainage Leak';
  } else if (
    lower.includes('electr') ||
    lower.includes('mcb') ||
    lower.includes('spark') ||
    lower.includes('wire') ||
    lower.includes('short circuit')
  ) {
    service = 'Electrical Fault Repair';
    serviceCategory = 'Electrician';
    requiredSkills = ['MCB Tripping Diagnostic', 'Phase Balancing', 'Rewiring'];
    requiredExperienceYears = 3;
    detectedIssue = 'Electrical Short Circuit / Wiring Fault';
  }

  let urgency = 'normal';
  let requestedDate = 'Today';
  let requestedTime = 'Flexible Today';

  if (
    lower.includes('tomorrow morning') ||
    (lower.includes('tomorrow') && (lower.includes('morning') || lower.includes('am')))
  ) {
    urgency = 'normal';
    requestedDate = 'Tomorrow';
    requestedTime = 'Tomorrow Morning (09:00 - 12:00)';
  } else if (
    lower.includes('right now') ||
    lower.includes('immediately') ||
    lower.includes('emergency') ||
    lower.includes('urgent')
  ) {
    urgency = 'emergency';
    requestedDate = 'Today';
    requestedTime = 'Immediate (Within 45 mins)';
  } else if (lower.includes('today')) {
    urgency = 'high';
    requestedDate = 'Today';
    requestedTime = 'Today Afternoon (13:00 - 16:00)';
  }

  let budget = null;
  let budgetMax = 800;

  const budgetRegex = /(?:budget|price|rate|quote|cost|under|within|max)?\s*(?:is|of|around|approx)?\s*[₹$]?\s*(\d{3,5})/i;
  const budgetMatch = text.match(budgetRegex);

  if (budgetMatch && budgetMatch[1]) {
    const parsed = parseInt(budgetMatch[1], 10);
    if (parsed >= 200 && parsed <= 15000) {
      budget = parsed;
      budgetMax = parsed;
    }
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
  };
}

function createJobRequestFromSlots(prompt, slots, location) {
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
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

module.exports = {
  parseNaturalLanguageJob,
  createJobRequestFromSlots,
};
