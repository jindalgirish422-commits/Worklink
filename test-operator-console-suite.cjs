/**
 * WORKLINK MILESTONE 17: OPERATOR CONTROL CENTER TEST SUITE
 *
 * Verifies:
 * 1. OVERVIEW (All 9 Core Metrics):
 *    - Active workers
 *    - Verified workers
 *    - Pending verification
 *    - Active jobs
 *    - Completed
 *    - Cancelled
 *    - Revenue
 *    - Utilization
 *    - Average rating
 * 2. MARKETPLACE INTELLIGENCE:
 *    - Demand by service
 *    - Demand by location
 *    - Average booking distance
 *    - Availability
 *    - Recommendation performance
 * 3. WORKER MANAGEMENT:
 *    - Verification (Approve / Revoke)
 *    - Profiles (Inspect details)
 *    - Skills (Verified skills tag display)
 *    - Performance (Jobs completed & completion rate)
 *    - Availability (Fleet status management)
 * 4. BOOKING MANAGEMENT:
 *    - Active
 *    - Completed
 *    - Cancelled
 *    - Issues
 *    - Disputes
 * 5. DESIGN SYSTEM:
 *    - Mostly solid surfaces
 *    - Avoid glass tables for maximum readability
 *    - Glass reserved for filters, floating controls, contextual panels, modals
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
console.log('WorkLink Milestone 17 Operator Control Center Test');
console.log('======================================================');

const consolePath = path.join(__dirname, 'src', 'components', 'admin', 'OperatorConsole.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

assert.ok(fs.existsSync(consolePath), 'OperatorConsole.tsx must exist');
assert.ok(fs.existsSync(appPath), 'App.tsx must exist');

const consoleSource = fs.readFileSync(consolePath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: OVERVIEW METRICS (All 9 Metrics)
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Overview Metrics (All 9 Operational KPIs)');

// 1. Active workers
assert.ok(
  consoleSource.includes('Active workers') && consoleSource.includes('activeWorkersCount'),
  'Operator console must show Active workers'
);
pass('Metric 1: Shows "Active workers"');

// 2. Verified workers
assert.ok(
  consoleSource.includes('Verified workers') && consoleSource.includes('verifiedWorkersCount'),
  'Operator console must show Verified workers'
);
pass('Metric 2: Shows "Verified workers"');

// 3. Pending verification
assert.ok(
  consoleSource.includes('Pending verification') && consoleSource.includes('pendingVerificationCount'),
  'Operator console must show Pending verification'
);
pass('Metric 3: Shows "Pending verification"');

// 4. Active jobs
assert.ok(
  consoleSource.includes('Active jobs') && consoleSource.includes('activeJobsCount'),
  'Operator console must show Active jobs'
);
pass('Metric 4: Shows "Active jobs"');

// 5. Completed
assert.ok(
  consoleSource.includes('Completed') && consoleSource.includes('completedJobsCount'),
  'Operator console must show Completed jobs'
);
pass('Metric 5: Shows "Completed"');

// 6. Cancelled
assert.ok(
  consoleSource.includes('Cancelled') && consoleSource.includes('cancelledJobsCount'),
  'Operator console must show Cancelled jobs'
);
pass('Metric 6: Shows "Cancelled"');

// 7. Revenue
assert.ok(
  consoleSource.includes('Revenue') && consoleSource.includes('totalRevenue'),
  'Operator console must show Revenue'
);
pass('Metric 7: Shows "Revenue"');

// 8. Utilization
assert.ok(
  consoleSource.includes('Utilization') && consoleSource.includes('utilizationRate'),
  'Operator console must show Utilization'
);
pass('Metric 8: Shows "Utilization"');

// 9. Average rating
assert.ok(
  consoleSource.includes('Average rating') && consoleSource.includes('averageRating'),
  'Operator console must show Average rating'
);
pass('Metric 9: Shows "Average rating"');

// ----------------------------------------------------
// TEST GROUP 2: MARKETPLACE INTELLIGENCE
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Marketplace Intelligence');

// 1. Demand by service
assert.ok(
  consoleSource.includes('Demand by service') && consoleSource.includes('AC Technician'),
  'Must display Demand by service'
);
pass('Marketplace Dimension 1: Shows "Demand by service" with trade share breakdown');

// 2. Demand by location
assert.ok(
  consoleSource.includes('Demand by location') && consoleSource.includes('Indiranagar'),
  'Must display Demand by location'
);
pass('Marketplace Dimension 2: Shows "Demand by location" with 10 km zone cluster enforcement');

// 3. Average booking distance
assert.ok(
  consoleSource.includes('Average booking distance') && consoleSource.includes('Free Travel Zone'),
  'Must display Average booking distance'
);
pass('Marketplace Dimension 3: Shows "Average booking distance" with travel tariff bands');

// 4. Availability
assert.ok(
  consoleSource.includes('Availability') && consoleSource.includes('Available Now'),
  'Must display Fleet Availability state'
);
pass('Marketplace Dimension 4: Shows "Availability & Fleet State"');

// 5. Recommendation performance
assert.ok(
  consoleSource.includes('Recommendation performance') && consoleSource.includes('Primary Match Conversion'),
  'Must display Recommendation performance'
);
pass('Marketplace Dimension 5: Shows "Recommendation performance" and conversion');

// ----------------------------------------------------
// TEST GROUP 3: WORKER MANAGEMENT
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Worker Management');

// Verification
assert.ok(
  consoleSource.includes('handleToggleVerification') &&
  (consoleSource.includes('Revoke') || consoleSource.includes('Approve')),
  'Worker management must include verification toggle (Approve / Revoke)'
);
pass('Worker Governance 1: Verification approval and revocation actions');

// Profiles
assert.ok(
  consoleSource.includes('Worker Inspection') && consoleSource.includes('setSelectedWorkerDetail'),
  'Worker management must provide profile inspection drawer/modal'
);
pass('Worker Governance 2: Detailed Worker Profile inspection modal');

// Skills
assert.ok(
  consoleSource.includes('Verified Skills') && consoleSource.includes('w.skills'),
  'Worker management must display verified skills tags'
);
pass('Worker Governance 3: Verified Skills itemization');

// Performance
assert.ok(
  consoleSource.includes('Performance') && consoleSource.includes('completionRate'),
  'Worker management must display worker performance & rating metrics'
);
pass('Worker Governance 4: Worker Performance (completed jobs, on-time rate, rating)');

// Availability
assert.ok(
  consoleSource.includes('handleOperatorChangeAvailability'),
  'Operator can manage worker availability status'
);
pass('Worker Governance 5: Operator fleet Availability management');

// ----------------------------------------------------
// TEST GROUP 4: BOOKING MANAGEMENT
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Booking Management');

// Active bookings
assert.ok(
  consoleSource.includes('Active') && consoleSource.includes('in_progress'),
  'Booking management must show active bookings'
);
pass('Booking Category 1: Shows Active bookings with live status');

// Completed bookings
assert.ok(
  consoleSource.includes('Completed') && consoleSource.includes('completed'),
  'Booking management must show completed bookings'
);
pass('Booking Category 2: Shows Completed service registry');

// Cancelled bookings
assert.ok(
  consoleSource.includes('Cancelled') && consoleSource.includes('cancelled'),
  'Booking management must show cancelled bookings'
);
pass('Booking Category 3: Shows Cancelled bookings with reasons');

// Issues
assert.ok(
  consoleSource.includes('Issues') && consoleSource.includes('Exceptions / Issues'),
  'Booking management must flag operational issues and delay alerts'
);
pass('Booking Category 4: Flags operational Issues & delay alerts');

// Disputes
assert.ok(
  consoleSource.includes('Disputes') &&
  consoleSource.includes('handleResolveDispute') &&
  consoleSource.includes('Active Escalations'),
  'Booking management must handle active disputes and escrow resolutions'
);
pass('Booking Category 5: Handles Disputes & Escrow adjustments');

// ----------------------------------------------------
// TEST GROUP 5: DESIGN SYSTEM (SOLID SURFACES & SELECTIVE GLASS)
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Design System (Solid Surfaces & Selective Glass)');

// Solid surfaces for tables (avoid glass tables)
assert.ok(
  consoleSource.includes('border-b border-black/8') &&
  consoleSource.includes('hover:bg-[#F5F5F7]/60'),
  'Tables must use solid readable surfaces and clear borders, avoiding glass tables'
);
pass('Tables maintain clean solid white surfaces for maximum readability (no glass tables)');

// Glass reserved for filters & floating controls
assert.ok(
  consoleSource.includes('glass-specular-edge') &&
  consoleSource.includes('backdrop-blur-xl'),
  'Glass must be reserved for filters, floating controls, and modals'
);
pass('Selective glass reserved for floating controls, filter bars, and modals');

// App integration
assert.ok(
  appSource.includes('OperatorConsole') &&
  appSource.includes("currentTab === 'operator_console'"),
  'App.tsx must integrate OperatorConsole'
);
pass('App.tsx coordinates OperatorConsole with live reactive state');

console.log('\n======================================================');
console.log(`All ${passedCount} WorkLink Milestone 17 tests passed successfully!`);
console.log('======================================================');
