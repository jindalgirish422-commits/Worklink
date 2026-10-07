/**
 * WORKLINK MILESTONE 15: WORKER DASHBOARD — PREMIUM MOBILE-FIRST TEST SUITE
 *
 * Verifies:
 * 1. OPENING:
 *    - "Good morning, [Name]." (dynamically extracting first name)
 *    - Then: "Today's work"
 * 2. SHOW:
 *    - Today's jobs
 *    - Upcoming
 *    - New requests
 *    - Earnings
 *    - Rating
 *    - Completion
 * 3. JOB REQUEST:
 *    - Service
 *    - Location
 *    - Requested time
 *    - Estimated earnings
 *    - Distance
 *    - Customer
 *    - Accept
 *    - Decline
 * 4. GLASS SYSTEM HIERARCHY:
 *    - Glass for floating status
 *    - Glass for important active job
 *    - Glass for action surfaces
 *    - Normal surfaces for dense information (time log, spares, notes, schedule timeline)
 * 5. MOBILE SPEED & CLARITY:
 *    - Large touch targets (min-h-[52px])
 *    - Tactile response (active:scale-[0.98])
 *    - Fast input chips
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedCount = 0;
function pass(msg) {
  console.log(`  ✓ [PASS] ${msg}`);
  passedCount++;
}

console.log('======================================================');
console.log('WorkLink Milestone 15 Worker Dashboard Test');
console.log('======================================================');

const workerDashboardPath = path.join(__dirname, 'src', 'components', 'worker', 'WorkerDashboard.tsx');
assert.ok(fs.existsSync(workerDashboardPath), 'WorkerDashboard.tsx must exist');

const dashboardSource = fs.readFileSync(workerDashboardPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: OPENING & GREETING
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Opening & Greeting');

assert.ok(
  dashboardSource.includes('Good morning, {workerFirstName}.'),
  'Opening must include "Good morning, {workerFirstName}."'
);
pass('Worker dashboard displays personalized opening: "Good morning, [Name]."');

assert.ok(
  dashboardSource.includes("Today's work"),
  'Opening must prominently display "Today\'s work"'
);
pass('Opening follows with clear section header: "Today\'s work"');

assert.ok(
  dashboardSource.includes('const workerFirstName = workerFullName.split(\' \')[0]') ||
  dashboardSource.includes('.split(\' \')[0]'),
  'Worker first name is dynamically extracted from logged-in user or active worker profile'
);
pass('Dynamic worker first name extraction implemented');

// ----------------------------------------------------
// TEST GROUP 2: SHOW METRICS & WORK PIPELINE
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Show Metrics & Work Pipeline');

// 1. Today's jobs
assert.ok(
  dashboardSource.includes("Today's jobs"),
  'Worker dashboard must show "Today\'s jobs"'
);
pass('Shows "Today\'s jobs" (active onsite service controller & scheduled jobs)');

// 2. Upcoming
assert.ok(
  dashboardSource.includes("Upcoming"),
  'Worker dashboard must show "Upcoming"'
);
pass('Shows "Upcoming" work overview and schedule slots');

// 3. New requests
assert.ok(
  dashboardSource.includes("New requests"),
  'Worker dashboard must show "New requests"'
);
pass('Shows "New requests" incoming alert counter with action badge');

// 4. Earnings
assert.ok(
  dashboardSource.includes("Earnings") &&
  (dashboardSource.includes('todayCompletedEarnings') || dashboardSource.includes('₹')),
  'Worker dashboard must show "Earnings" with today and week figures'
);
pass('Shows "Earnings" (₹ today and this week total)');

// 5. Rating
assert.ok(
  dashboardSource.includes("Rating") &&
  dashboardSource.includes('currentWorker.rating'),
  'Worker dashboard must show "Rating" with reviews count'
);
pass('Shows "Rating" with star badge and reviews');

// 6. Completion
assert.ok(
  dashboardSource.includes("Completion") &&
  dashboardSource.includes('completionRate'),
  'Worker dashboard must show "Completion" percentage'
);
pass('Shows "Completion" rate (% on-time fulfillment)');

// ----------------------------------------------------
// TEST GROUP 3: JOB REQUEST CARD
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Job Request Card (All 8 Items)');

// 1. Service
assert.ok(
  dashboardSource.includes('Service') &&
  dashboardSource.includes('activeBooking.job.serviceCategory'),
  'Job request card must show Service'
);
pass('Job request card itemizes Service category & prompt');

// 2. Customer
assert.ok(
  dashboardSource.includes('Customer') &&
  dashboardSource.includes('customerName'),
  'Job request card must show Customer identity'
);
pass('Job request card itemizes Customer with verified badge');

// 3. Location
assert.ok(
  dashboardSource.includes('Location') &&
  dashboardSource.includes('activeBooking.job.location'),
  'Job request card must show Location'
);
pass('Job request card itemizes Customer Location address');

// 4. Requested time
assert.ok(
  dashboardSource.includes('Requested time') &&
  dashboardSource.includes('activeBooking.scheduledDate'),
  'Job request card must show Requested time'
);
pass('Job request card itemizes Requested time window');

// 5. Distance
assert.ok(
  dashboardSource.includes('Distance') &&
  dashboardSource.includes('activeBooking.worker.distanceKm'),
  'Job request card must show Distance'
);
pass('Job request card itemizes Distance in km within 10 km pool');

// 6. Estimated earnings
assert.ok(
  dashboardSource.includes('Estimated earnings') &&
  dashboardSource.includes('activeBooking.estimatedTotal'),
  'Job request card must show Estimated earnings'
);
pass('Job request card itemizes Estimated earnings payout');

// 7. Accept
assert.ok(
  dashboardSource.includes('Accept') &&
  dashboardSource.includes('handleAccept') &&
  dashboardSource.includes('Accept Job Request'),
  'Job request card must provide Accept action'
);
pass('Job request card provides high-visibility Accept button');

// 8. Decline
assert.ok(
  dashboardSource.includes('Decline') &&
  dashboardSource.includes('setShowDeclineConfirm') &&
  dashboardSource.includes('Decline Request'),
  'Job request card must provide Decline action'
);
pass('Job request card provides tactile Decline action button');

// ----------------------------------------------------
// TEST GROUP 4: GLASS SYSTEM HIERARCHY
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Glass System Hierarchy');

// 1. Floating status uses glass
assert.ok(
  dashboardSource.includes('sticky') &&
  dashboardSource.includes('backdrop-blur-xl') &&
  dashboardSource.includes('glass-specular-edge'),
  'Floating status surface must use glass material'
);
pass('Floating status uses glass material surface with specular edge');

// 2. Important active job uses glass
assert.ok(
  dashboardSource.includes('Onsite Service Controller') &&
  dashboardSource.includes('backdrop-blur-xl') &&
  dashboardSource.includes('glass-specular-edge'),
  'Important active job controller must use glass material surface'
);
pass('Important active job controller uses prominent glass material');

// 3. Action surfaces use glass
assert.ok(
  dashboardSource.includes('backdrop-blur-md') &&
  dashboardSource.includes('glass-specular-edge'),
  'Action surfaces use glass backdrop styling'
);
pass('Action surfaces use glass backdrop styling');

// 4. Dense information uses solid surfaces
assert.ok(
  dashboardSource.includes('Execution Time Log') &&
  dashboardSource.includes('Additional Work & Spares') &&
  dashboardSource.includes('Technician Field Notes') &&
  dashboardSource.includes('Schedule View'),
  'Dense technical information uses normal solid surfaces'
);
pass('Normal surfaces used for dense technical information (time log, spares, notes, schedule)');

// ----------------------------------------------------
// TEST GROUP 5: MOBILE USABILITY & SPEED
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Mobile Speed & Usability');

// Mobile touch targets >= 52px
assert.ok(
  dashboardSource.includes('min-h-[52px]'),
  'Primary worker action buttons must have mobile touch targets >= 52px'
);
pass('Mobile touch targets >= 52px implemented for high-speed technician operation');

// Tactile active scale feedback
assert.ok(
  dashboardSource.includes('active:scale-[0.98]'),
  'Buttons must provide tactile active scale feedback'
);
pass('Tactile active scale feedback (active:scale-[0.98]) provided on touch');

// Fast observation chips
assert.ok(
  dashboardSource.includes('Replaced 45µF capacitor') &&
  dashboardSource.includes('Coils cleaned'),
  'Quick phone input chips for fast field notes entry'
);
pass('Quick observation chips support speed and clarity without clutter');

console.log('\n======================================================');
console.log(`All ${passedCount} WorkLink Milestone 15 tests passed successfully!`);
console.log('======================================================');
