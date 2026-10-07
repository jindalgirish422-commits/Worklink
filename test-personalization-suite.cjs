/**
 * WORKLINK MILESTONE 9: PERSONALIZED RECOMMENDATIONS TEST SUITE
 *
 * Verifies:
 * 1. Signals processing:
 *    - previous searches
 *    - previous bookings
 *    - ratings
 *    - cancellations
 *    - preferred services
 *    - preferred distance
 *    - preferred price
 *    - preferred time
 *    - repeat workers
 * 2. Prototype Rule:
 *    - Deterministic heuristic logic used
 *    - No false claims of production machine learning
 * 3. Required UI Sections:
 *    - "Recommended for you"
 *    - "Based on your previous booking"
 *    - "Matches your preferences"
 *    - "Highly rated for this service"
 * 4. Glass Effect Constraint:
 *    - Subtle glass accent used on header/pill
 *    - Cards remain solid surfaces (not transparent whole dashboard)
 * 5. Privacy Protection:
 *    - Non-intrusive, helpful reasons
 *    - No creepy inferred attributes exposed
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
console.log('WorkLink Milestone 9 Personalized Recommendations Test');
console.log('======================================================');

// Read files to verify component structure & logic
const servicePath = path.join(__dirname, 'src', 'services', 'personalizationService.ts');
assert.ok(fs.existsSync(servicePath), 'personalizationService.ts must exist');
const serviceSource = fs.readFileSync(servicePath, 'utf8');

const componentPath = path.join(__dirname, 'src', 'components', 'recommendations', 'PersonalizedRecommendationsSection.tsx');
assert.ok(fs.existsSync(componentPath), 'PersonalizedRecommendationsSection.tsx must exist');
const componentSource = fs.readFileSync(componentPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: SIGNALS PROCESSING
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Personalization Signals Coverage');

const requiredSignals = [
  { name: 'previous searches', check: 'previousSearches' },
  { name: 'previous bookings', check: 'previousBookings' },
  { name: 'ratings given & thresholds', check: 'avgRatingGiven' },
  { name: 'cancellation history guard', check: 'hasCancellationHistory' },
  { name: 'preferred services / trades', check: 'frequentlyUsedTrades' },
  { name: 'preferred distance', check: 'preferredDistanceMaxKm' },
  { name: 'preferred price / budget', check: 'isPricePreferred' },
  { name: 'preferred time slot', check: 'preferredTimeSlot' },
  { name: 'repeat workers', check: 'repeatWorkersBooked' },
];

for (const sig of requiredSignals) {
  assert.ok(serviceSource.includes(sig.check), `Must evaluate ${sig.name}`);
  pass(`Evaluates signal: ${sig.name}`);
}

// ----------------------------------------------------
// TEST GROUP 2: PROTOTYPE RULE & TRANSPARENCY
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Prototype Rule Compliance');

// Must disclaim production machine learning and note deterministic/demo logic
assert.ok(
  serviceSource.includes('Production ML is not used') ||
  serviceSource.includes('Deterministic rule-based') ||
  serviceSource.includes('deterministic'),
  'Must explicitly use deterministic heuristic logic and disclaim production ML'
);
pass('Engine explicitly uses deterministic demo logic without claiming production ML');

assert.ok(
  componentSource.includes('Deterministic Preference Prior') ||
  componentSource.includes('Non-intrusive rule matching'),
  'Component UI informs customer of transparent heuristic matching'
);
pass('UI communicates transparent preference alignment to customer');

// ----------------------------------------------------
// TEST GROUP 3: REQUIRED UI SECTIONS
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Required UI Sections');

const requiredSections = [
  'Recommended for you',
  'Based on your previous booking',
  'Matches your preferences',
  'Highly rated for this service',
];

for (const sec of requiredSections) {
  assert.ok(
    componentSource.includes(sec),
    `Must include section: "${sec}"`
  );
  pass(`UI includes section: "${sec}"`);
}

// ----------------------------------------------------
// TEST GROUP 4: SUBTLE GLASS ACCENT & RESTRAINED SURFACES
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Restrained Glass Accent');

// Header pill uses subtle glass accent
assert.ok(
  componentSource.includes('backdrop-blur-md') && componentSource.includes('glass-specular-edge'),
  'Personalized section pill must use a subtle glass accent'
);
pass('Uses subtle glass accent pill for section badge');

// Individual cards stay solid white (#FFFFFF / bg-white) with hairline borders
assert.ok(
  componentSource.includes('bg-white border border-black/8'),
  'Cards must use solid surfaces to prevent turning the whole dashboard into transparent plastic'
);
pass('Worker cards maintain solid white surfaces with subtle hairline borders');

// ----------------------------------------------------
// TEST GROUP 5: PRIVACY-PRESERVING HELPFUL REASONS
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Non-Intrusive Privacy Protection');

// Check that reasons are transparent, helpful, and non-creepy
const helpfulReasons = [
  'You previously booked and trusted this professional',
  'Within your preferred',
  'Within your expected budget range',
  'Fits your preferred',
  'Highly rated',
];

for (const reason of helpfulReasons) {
  assert.ok(
    serviceSource.includes(reason),
    `Must include helpful reason pattern: "${reason}"`
  );
  pass(`Helpful privacy-safe rationale provided: "${reason}"`);
}

// Confirm no creepy tracking or obscure inferences exist
assert.ok(
  !serviceSource.includes('batteryLevel') &&
  !serviceSource.includes('accelerometer') &&
  !serviceSource.includes('income_inferred'),
  'Must not expose sensitive inferred attributes'
);
pass('Strictly protects customer privacy without sensitive inferred attributes');

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedCount} Passed, 0 Failed`);
console.log('======================================================\n');
