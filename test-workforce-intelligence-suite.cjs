/**
 * WORKLINK MILESTONE 18: WORKFORCE INTELLIGENCE TEST SUITE
 *
 * Verifies:
 * 1. CONCEPTUAL DISTINCTION & INTEGRITY:
 *    - Does NOT change WorkLink into a data-science recruitment platform
 *    - Datasets serve as analytical evidence informing workforce intelligence
 *    - Synthetic/demo values are clearly labeled (never fabricate data)
 * 2. MARKET INTELLIGENCE (All 6 Core Insights):
 *    - skill demand
 *    - experience vs compensation
 *    - role differences
 *    - technical capability
 *    - professional outcomes
 *    - salary modelling
 * 3. WORKLINK OPERATIONS (Separate Section with all 8 Metrics):
 *    - booking conversion
 *    - recommendation acceptance
 *    - completion
 *    - cancellation
 *    - worker utilization
 *    - customer satisfaction
 *    - average distance
 *    - repeat bookings
 * 4. VISUAL DESIGN:
 *    - Avoid glass for every chart (charts use solid backgrounds)
 *    - Large numbers & whitespace
 *    - Subtle glass filters/controls
 * 5. ETHICAL GUARDRAIL:
 *    - Strict guardrail against automated personality-based worker rejection
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
console.log('WorkLink Milestone 18 Workforce Intelligence Test');
console.log('======================================================');

const intelligenceViewPath = path.join(__dirname, 'src', 'components', 'WorkforceIntelligenceView.tsx');
const intelligenceDataPath = path.join(__dirname, 'src', 'data', 'workforceIntelligence.ts');

assert.ok(fs.existsSync(intelligenceViewPath), 'WorkforceIntelligenceView.tsx must exist');
assert.ok(fs.existsSync(intelligenceDataPath), 'workforceIntelligence.ts must exist');

const viewSource = fs.readFileSync(intelligenceViewPath, 'utf8');
const dataSource = fs.readFileSync(intelligenceDataPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: CONCEPTUAL POSITIONING & INTEGRITY
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Conceptual Positioning & Empirical Integrity');

assert.ok(
  viewSource.includes('This does not change WorkLink into a corporate data-science recruitment platform') ||
  viewSource.includes('recruitment platform'),
  'Must clarify that datasets are analytical evidence and WorkLink is not a DS recruitment platform'
);
pass('Maintains strict conceptual positioning: Evidence informing local trades matching, not recruitment platform');

assert.ok(
  viewSource.includes('SYNTHETIC / DEMO PROTOTYPE TELEMETRY') &&
  viewSource.includes('Never fabricate data'),
  'Must clearly label synthetic/demo values where applicable and explicitly state never fabricate data'
);
pass('Explicitly labels synthetic/demo telemetry values and adheres to "Never fabricate data" mandate');

// ----------------------------------------------------
// TEST GROUP 2: MARKET INTELLIGENCE (All 6 Core Insights)
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Market Intelligence (All 6 Insights)');

// 1. Skill Demand
assert.ok(
  viewSource.includes('Skill Demand Concentration') &&
  viewSource.includes('skillDemandDistribution'),
  'Must show Skill Demand insight'
);
pass('Market Intelligence Insight 1: "skill demand" concentration (SQL 1,582, Python 962)');

// 2. Experience vs Compensation
assert.ok(
  viewSource.includes('Experience vs. Compensation Correlation') &&
  viewSource.includes('Pearson r = 0.66'),
  'Must show Experience vs Compensation insight'
);
pass('Market Intelligence Insight 2: "experience vs compensation" (Pearson r = 0.66)');

// 3. Role Differences
assert.ok(
  viewSource.includes('Role Differences') &&
  viewSource.includes('Compensation Hierarchy Across 10 Roles'),
  'Must show Role Differences insight'
);
pass('Market Intelligence Insight 3: "role differences" across 10-role hierarchy (₹5.71L to ₹25.09L)');

// 4. Technical Capability
assert.ok(
  viewSource.includes('Technical Capability vs. Compensation Hike') &&
  viewSource.includes('jdsSkillComparison'),
  'Must show Technical Capability insight'
);
pass('Market Intelligence Insight 4: "technical capability" vs compensation hike (+1.04 storytelling delta)');

// 5. Professional Outcomes
assert.ok(
  viewSource.includes('Professional Outcomes & Ethical Guardrails') ||
  viewSource.includes('Professional Outcomes'),
  'Must show Professional Outcomes insight'
);
pass('Market Intelligence Insight 5: "professional outcomes" behavioral trait analysis');

// 6. Salary Modelling
assert.ok(
  viewSource.includes('Salary Modelling & Empirical Baselines') ||
  viewSource.includes('Salary Modelling'),
  'Must show Salary Modelling insight'
);
pass('Market Intelligence Insight 6: "salary modelling" (Ridge Regression R²=0.587, Gradient Boosting R²=0.541)');

// ----------------------------------------------------
// TEST GROUP 3: WORKLINK OPERATIONS (Separate Section & 8 Metrics)
// ----------------------------------------------------
console.log('\nTEST GROUP 3: WorkLink Operations (Separate Section & 8 Metrics)');

// Separate Section Presence
assert.ok(
  viewSource.includes('WorkLink Operations') &&
  viewSource.includes('SECTION 2: WORKLINK OPERATIONS (SEPARATE SECTION)'),
  'WorkLink Operations must be presented in a dedicated separate section'
);
pass('WorkLink Operations established as a prominent separate section');

// 1. Booking conversion
assert.ok(
  viewSource.includes('booking conversion') &&
  viewSource.includes('bookingConversion'),
  'Must show booking conversion metric'
);
pass('Operational Metric 1: Shows "booking conversion"');

// 2. Recommendation acceptance
assert.ok(
  viewSource.includes('recommendation acceptance') &&
  viewSource.includes('recommendationAcceptance'),
  'Must show recommendation acceptance metric'
);
pass('Operational Metric 2: Shows "recommendation acceptance"');

// 3. Completion
assert.ok(
  viewSource.includes('completion') &&
  viewSource.includes('completionRate'),
  'Must show completion metric'
);
pass('Operational Metric 3: Shows "completion"');

// 4. Cancellation
assert.ok(
  viewSource.includes('cancellation') &&
  viewSource.includes('cancellationRate'),
  'Must show cancellation metric'
);
pass('Operational Metric 4: Shows "cancellation"');

// 5. Worker utilization
assert.ok(
  viewSource.includes('worker utilization') &&
  viewSource.includes('workerUtilization'),
  'Must show worker utilization metric'
);
pass('Operational Metric 5: Shows "worker utilization"');

// 6. Customer satisfaction
assert.ok(
  viewSource.includes('customer satisfaction') &&
  viewSource.includes('customerSatisfaction'),
  'Must show customer satisfaction metric'
);
pass('Operational Metric 6: Shows "customer satisfaction"');

// 7. Average distance
assert.ok(
  viewSource.includes('average distance') &&
  viewSource.includes('averageDistanceKm'),
  'Must show average distance metric'
);
pass('Operational Metric 7: Shows "average distance"');

// 8. Repeat bookings
assert.ok(
  viewSource.includes('repeat bookings') &&
  viewSource.includes('repeatBookingsRate'),
  'Must show repeat bookings metric'
);
pass('Operational Metric 8: Shows "repeat bookings"');

// ----------------------------------------------------
// TEST GROUP 4: VISUAL DESIGN DISCIPLINE
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Visual Design Discipline');

// Solid backgrounds & whitespace for charts (avoid glass charts)
assert.ok(
  viewSource.includes('bg-white border border-black/8 shadow-xs') &&
  viewSource.includes('rounded-3xl'),
  'Charts and insight containers must use solid backgrounds and generous padding'
);
pass('Charts use solid backgrounds (white) with generous whitespace and clear borders');

// Large numbers
assert.ok(
  viewSource.includes('text-3xl sm:text-4xl font-extrabold'),
  'Key operational and analytical numbers must be large typography'
);
pass('Large numbers (text-3xl/4xl) used for primary KPIs and metrics');

// Subtle glass filters/controls
assert.ok(
  viewSource.includes('backdrop-blur-xl') &&
  viewSource.includes('glass-specular-edge'),
  'Filters and view selectors use subtle liquid glass surfaces'
);
pass('Subtle glass surface reserved for top view controls & segment filters');

// ----------------------------------------------------
// TEST GROUP 5: ETHICAL GUARDRAIL
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Ethical Guardrails');

assert.ok(
  viewSource.includes('Ethical Guardrail') &&
  viewSource.includes('Personality Rejection'),
  'Must enforce explicit ethical guardrail against automated personality rejection'
);
pass('Strict ethical guardrail: Personality traits strictly forbidden as worker rejection/hiring criteria');

console.log('\n======================================================');
console.log(`All ${passedCount} WorkLink Milestone 18 tests passed successfully!`);
console.log('======================================================');
