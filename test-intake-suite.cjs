// Test Suite for WorkLink Milestone 4: AI Job Intake & Matching Engine Integration

const { parseNaturalLanguageJob, createJobRequestFromSlots } = require('./scratch-intake-helper.cjs');

// Test runner
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('WorkLink Milestone 4 AI Job Intake Test Suite');
  console.log('======================================================\n');

  const mockLocation = {
    address: 'Indiranagar 100ft Road, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    radiusKm: 10,
  };

  // 1. Test Prompt 1: Benchmark from Prompt ("My AC isn't cooling. I need someone tomorrow morning.")
  console.log('TEST GROUP 1: Benchmark Prompt Extraction');
  const benchmarkPrompt = "My AC isn't cooling. I need someone tomorrow morning.";
  const slots1 = parseNaturalLanguageJob(benchmarkPrompt, mockLocation);

  assert(slots1.service === 'AC Repair', 'Extracted Service: AC Repair');
  assert(slots1.serviceCategory === 'AC Technician', 'Extracted Category: AC Technician');
  assert(slots1.urgency === 'normal', 'Urgency: normal (not emergency)');
  assert(slots1.requestedDate === 'Tomorrow', 'Date: Tomorrow');
  assert(slots1.requestedTime.includes('Tomorrow Morning'), 'Time: Tomorrow Morning');
  assert(slots1.budget === null, 'Budget: Not specified (null)');
  assert(slots1.additionalConstraints.length >= 3, 'Additional Constraints extracted');

  const job1 = createJobRequestFromSlots(benchmarkPrompt, slots1, mockLocation);
  assert(job1.serviceCategory === 'AC Technician', 'JobRequest.serviceCategory is AC Technician');
  assert(job1.location.radiusKm === 10, 'JobRequest enforced within 10 km');
  assert(job1.budget === null, 'JobRequest.budget reflects Not specified');

  // 2. Test Prompt 2: Emergency with Budget ("My AC isn't cooling at all... right now! Budget is ₹800.")
  console.log('\nTEST GROUP 2: Emergency Intake with Budget');
  const emergencyPrompt = "My AC isn't cooling at all and making a strange buzzing noise. I need someone right now! Budget is ₹800.";
  const slots2 = parseNaturalLanguageJob(emergencyPrompt, mockLocation);

  assert(slots2.urgency === 'emergency', 'Urgency: emergency detected from "right now!"');
  assert(slots2.budget === 800, 'Budget extracted: ₹800');
  assert(slots2.budgetMax === 800, 'BudgetMax ceiling set: ₹800');

  // 3. Test Prompt 3: Trade Switch to Plumbing
  console.log('\nTEST GROUP 3: Trade Category Detection (Plumber)');
  const plumbingPrompt = "Emergency! Copper pipe under my kitchen sink burst and is leaking water everywhere. Need an experienced plumber immediately.";
  const slots3 = parseNaturalLanguageJob(plumbingPrompt, mockLocation);

  assert(slots3.serviceCategory === 'Plumber', 'Service Category correctly switched to Plumber');
  assert(slots3.requiredSkills.some(s => s.toLowerCase().includes('pipe')), 'Plumbing skills extracted');
  assert(slots3.urgency === 'emergency', 'Urgency: emergency from "immediately"');

  // 4. Test Prompt 4: Electrical Switch
  console.log('\nTEST GROUP 4: Trade Category Detection (Electrician)');
  const electricPrompt = "Ceiling fan is sparking and repeatedly tripping our main MCB box. Need a licensed electrician today, budget around ₹600.";
  const slots4 = parseNaturalLanguageJob(electricPrompt, mockLocation);

  assert(slots4.serviceCategory === 'Electrician', 'Service Category: Electrician');
  assert(slots4.budget === 600, 'Budget extracted: ₹600');
  assert(slots4.requestedTime.toLowerCase().includes('today'), 'Requested time: Today');

  // 5. Test Matching Engine Impact
  console.log('\nTEST GROUP 5: Engine Impact & Disconnection Prevention');
  // Check that changing job affects candidate eligibility
  const mockWorkerAC = {
    id: 'W3',
    trade: 'AC Technician',
    skills: ['Inverter Compressor', 'Gas Leak Detection'],
    availabilityStatus: 'immediate',
    distanceKm: 2.5,
    isVerified: true,
    backgroundCheckPassed: true,
    experienceYears: 7,
  };

  const mockWorkerPlumber = {
    id: 'W1',
    trade: 'Plumber',
    skills: ['PPR Pipe Welding', 'Pressure Booster'],
    availabilityStatus: 'immediate',
    distanceKm: 1.2,
    isVerified: true,
    backgroundCheckPassed: true,
    experienceYears: 4,
  };

  const checkTradeMatch = (worker, job) => worker.trade === job.serviceCategory;

  assert(checkTradeMatch(mockWorkerAC, job1) === true, 'W3 is eligible for AC Job 1');
  assert(checkTradeMatch(mockWorkerPlumber, job1) === false, 'W1 (Plumber) is excluded from AC Job 1');

  const jobPlumber = createJobRequestFromSlots(plumbingPrompt, slots3, mockLocation);
  assert(checkTradeMatch(mockWorkerPlumber, jobPlumber) === true, 'W1 is eligible for Plumber Job');
  assert(checkTradeMatch(mockWorkerAC, jobPlumber) === false, 'W3 (AC) is excluded from Plumber Job');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(console.error);
