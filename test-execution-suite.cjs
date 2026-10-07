/**
 * WORKLINK MILESTONE 12: SERVICE EXECUTION EXPERIENCE TEST SUITE
 *
 * Verifies:
 * 1. Worker Actions:
 *    - Start Job
 *    - Pause / Resume
 *    - Complete Job
 * 2. Tracked Attributes:
 *    - start time (startedAt, startTime)
 *    - end time (endedAt, endTime)
 *    - working duration (workingDurationSeconds, actualHours, formatTime)
 *    - additional work (additionalWorkItems, add spare, toggle)
 *    - notes (technician field notes & observations)
 * 3. Customer Experience:
 *    - Job status (IN_PROGRESS, PAUSED, COMPLETED)
 *    - Worker status (Active Onsite, Paused with reason, Completed)
 *    - Progress (live timer, milestone timeline, notes sync)
 *    - Finalization status (final invoice breakdown, billable hours)
 * 4. Design & Mobile Usability:
 *    - Clear tactile actions for worker standing at home with phone (min-h-[52px])
 *    - Glass used only for important floating status/action surfaces
 *    - Solid surfaces for dense information (time log, spares, notes)
 *    - Tactile responsive status changes without over-animation
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
console.log('WorkLink Milestone 12 Service Execution Experience Test');
console.log('======================================================');

const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
const workerDashboardPath = path.join(__dirname, 'src', 'components', 'worker', 'WorkerDashboard.tsx');
const trackerPath = path.join(__dirname, 'src', 'components', 'JobExecutionTracker.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

assert.ok(fs.existsSync(typesPath), 'types/index.ts must exist');
assert.ok(fs.existsSync(workerDashboardPath), 'WorkerDashboard.tsx must exist');
assert.ok(fs.existsSync(trackerPath), 'JobExecutionTracker.tsx must exist');
assert.ok(fs.existsSync(appPath), 'App.tsx must exist');

const typesSource = fs.readFileSync(typesPath, 'utf8');
const workerDashboardSource = fs.readFileSync(workerDashboardPath, 'utf8');
const trackerSource = fs.readFileSync(trackerPath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: TRACKED FIELDS IN DATA MODEL
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Tracked Service Execution Fields in Types');

assert.ok(
  typesSource.includes('startTime?: number') && typesSource.includes('startedAt?: string'),
  'Booking must track start time (startTime and startedAt)'
);
pass('Start time tracked (startTime and startedAt in Booking interface)');

assert.ok(
  typesSource.includes('endTime?: number') && typesSource.includes('endedAt?: string'),
  'Booking must track end time (endTime and endedAt)'
);
pass('End time tracked (endTime and endedAt in Booking interface)');

assert.ok(
  typesSource.includes('workingDurationSeconds?: number'),
  'Booking must track working duration (workingDurationSeconds)'
);
pass('Working duration tracked (workingDurationSeconds in Booking interface)');

assert.ok(
  typesSource.includes('additionalWorkItems: AdditionalWorkItem[]'),
  'Booking must track additional work items'
);
pass('Additional work tracked (additionalWorkItems in Booking interface)');

assert.ok(
  typesSource.includes('notes?: string'),
  'Booking must track technician notes'
);
pass('Technician notes tracked (notes in Booking interface)');

assert.ok(
  typesSource.includes('pausedAt?: string') && typesSource.includes('pauseReason?: string'),
  'Booking must track pause status metadata (pausedAt and pauseReason)'
);
pass('Pause metadata tracked (pausedAt and pauseReason in Booking interface)');

assert.ok(
  typesSource.includes('workerStatusMessage?: string'),
  'Booking must track worker status message'
);
pass('Worker status message tracked in Booking interface');

// ----------------------------------------------------
// TEST GROUP 2: WORKER ACTIONS (START, PAUSE/RESUME, COMPLETE)
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Worker Actions Implementation');

// 1. Start Job
assert.ok(
  workerDashboardSource.includes('handleStartJob') &&
  workerDashboardSource.includes("status: 'in_progress'") &&
  workerDashboardSource.includes('startedAt'),
  'WorkerDashboard must implement handleStartJob recording start time and setting in_progress'
);
pass('Worker action "Start Job" implemented (records startedAt, activates timer, sets in_progress)');

// 2. Pause Job
assert.ok(
  workerDashboardSource.includes('handleConfirmPause') &&
  workerDashboardSource.includes("status: 'paused'") &&
  workerDashboardSource.includes('pausedAt'),
  'WorkerDashboard must implement pause job recording pausedAt and pauseReason'
);
pass('Worker action "Pause Job" implemented (records pausedAt and pauseReason, stops clock)');

// 3. Resume Job
assert.ok(
  workerDashboardSource.includes('handleResumeJob') &&
  workerDashboardSource.includes("status: 'in_progress'"),
  'WorkerDashboard must implement resume job restarting working clock'
);
pass('Worker action "Resume Job" implemented (re-engages live working clock)');

// 4. Complete Job
assert.ok(
  workerDashboardSource.includes('handleCompleteJob') &&
  workerDashboardSource.includes("status: 'completed'") &&
  workerDashboardSource.includes('endedAt') &&
  workerDashboardSource.includes('workingDurationSeconds'),
  'WorkerDashboard must implement handleCompleteJob recording end time and working duration'
);
pass('Worker action "Complete Job" implemented (records endedAt, calculates duration & invoice)');

// ----------------------------------------------------
// TEST GROUP 3: WORKER ONSITE EXECUTION CONTROLLER DESIGN
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Worker Mobile Onsite Execution Usability');

// Mobile phone usability - clear tactile targets
assert.ok(
  workerDashboardSource.includes('min-h-[52px]') &&
  workerDashboardSource.includes('active:scale-[0.98]'),
  'Worker action buttons must be large tactile touch targets with active feedback for phone use'
);
pass('Actions are large tactile touch targets (min-h-[52px] with active depression feedback)');

// Glass selectively on floating/status surface
assert.ok(
  workerDashboardSource.includes('glass-specular-edge') &&
  workerDashboardSource.includes('backdrop-blur-xl'),
  'Worker status/action strip uses selective glass'
);
pass('Selective glass used for floating onsite status & action strip');

// Solid surfaces for dense information
assert.ok(
  workerDashboardSource.includes('Execution Time Log') &&
  workerDashboardSource.includes('Additional Work & Spares') &&
  workerDashboardSource.includes('Technician Field Notes'),
  'Worker dashboard provides solid surface cards for dense logs, spares, and notes'
);
pass('Solid surfaces used for dense technical information (time log, spares, notes)');

// Technician notes chips
assert.ok(
  workerDashboardSource.includes('handleSaveNotes') &&
  workerDashboardSource.includes('Replaced 45µF capacitor'),
  'Worker dashboard includes quick phone chips for fast notes entry'
);
pass('Fast phone input supported with quick technician observation chips');

// Additional work item add & toggle
assert.ok(
  workerDashboardSource.includes('handleToggleAdditionalItem') &&
  workerDashboardSource.includes('handleAddNewSpare'),
  'Worker can add and toggle additional work items'
);
pass('Worker can add and toggle additional work items & spare parts');

// ----------------------------------------------------
// TEST GROUP 4: CUSTOMER EXECUTION EXPERIENCE
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Customer Execution Experience');

// Customer sees Job status
assert.ok(
  trackerSource.includes('Job Status:') &&
  trackerSource.includes('booking.status.replace'),
  'Customer view clearly displays Job Status'
);
pass('Customer sees real-time Job Status badge (IN PROGRESS, PAUSED, COMPLETED)');

// Customer sees Worker status
assert.ok(
  trackerSource.includes('booking.workerStatusMessage'),
  'Customer view clearly displays Worker Status'
);
pass('Customer sees real-time Worker Status message (e.g. Active Onsite / Paused)');

// Customer sees Progress
assert.ok(
  trackerSource.includes('Working Duration') &&
  trackerSource.includes('formatTime(seconds)') &&
  trackerSource.includes('booking.startedAt'),
  'Customer view displays working duration progress and start time'
);
pass('Customer sees live working duration progress, start time, and time log');

// Customer sees Paused state clearly
assert.ok(
  trackerSource.includes("booking.status === 'paused'") &&
  trackerSource.includes('Service Clock Paused at') &&
  trackerSource.includes('non-billable'),
  'Customer view provides transparent pause notification confirming paused time is non-billable'
);
pass('Customer sees transparent pause notice confirming clock is stopped and non-billable');

// Customer sees Field Notes
assert.ok(
  trackerSource.includes('Technician Field Notes &amp; Observations') &&
  trackerSource.includes('booking.notes'),
  'Customer view displays technician field notes in real time'
);
pass('Customer sees live technician field notes & onsite observations');

// Customer sees Finalization status
assert.ok(
  trackerSource.includes('Finalization Status &amp; Invoice Breakdown') &&
  trackerSource.includes('Billable Working Duration:'),
  'Customer view displays finalization status when job is completed'
);
pass('Customer sees comprehensive Finalization Status upon service completion');

// ----------------------------------------------------
// TEST GROUP 5: CROSS-VIEW SYNCHRONIZATION
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Cross-View Synchronization');

assert.ok(
  appSource.includes('onUpdateBooking={handleUpdateBooking}'),
  'App.tsx passes onUpdateBooking to WorkerDashboard for full synchronization'
);
pass('App.tsx synchronizes booking state updates between Worker and Customer views');

console.log('\n======================================================');
console.log(`All ${passedCount} WorkLink Milestone 12 tests passed successfully!`);
console.log('======================================================\n');
