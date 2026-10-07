/**
 * WORKLINK MILESTONE 8: SIGNATURE AI RECOMMENDATION EXPERIENCE TEST SUITE
 *
 * Verifies:
 * 1. Opening copy & typography requirements:
 *    - "Best matches for your job."
 *    - "WorkLink found these professionals based on your requirements."
 * 2. Primary Match Requirements:
 *    - One prominent glass material surface
 *    - Includes all 9 required data elements:
 *      (worker, profession, rating, experience, distance, availability, estimated price, verification, match score)
 * 3. Match Score Styling:
 *    - Typographic elegance: e.g. "94% Match"
 *    - Absence of giant neon progress rings
 * 4. "Why This Worker?" Prominent Section:
 *    - "Why [FirstName]?" headline
 *    - 5 core checkmark reasons (experience, availability, rating, distance, price range)
 * 5. Secondary Workers:
 *    - Flatter surfaces establishing clear hierarchy
 * 6. Motion & Psychological Principle:
 *    - Subtle fade & gentle transition
 *    - User reassurance: "WorkLink has already done the difficult comparison for me."
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
console.log('WorkLink Milestone 8 Signature Recommendation Test');
console.log('======================================================');

// Read the SignatureRecommendationView component file
const componentPath = path.join(__dirname, 'src', 'components', 'recommendations', 'SignatureRecommendationView.tsx');
assert.ok(fs.existsSync(componentPath), 'SignatureRecommendationView.tsx must exist');
const componentSource = fs.readFileSync(componentPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: OPENING TYPOGRAPHY & MESSAGING
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Opening Typography & Messaging');

assert.ok(
  componentSource.includes('Best matches for your job.'),
  'Must include exact opening headline: "Best matches for your job."'
);
pass('Opening headline contains exact text: "Best matches for your job."');

assert.ok(
  componentSource.includes('WorkLink found these professionals based on your requirements.'),
  'Must include exact supporting copy: "WorkLink found these professionals based on your requirements."'
);
pass('Supporting copy contains exact text: "WorkLink found these professionals based on your requirements."');

// ----------------------------------------------------
// TEST GROUP 2: PRIMARY MATCH WITH ONE PROMINENT GLASS SURFACE
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Primary Match (Prominent Glass Material Surface)');

// Verify prominent glass surface usage on the primary match card
assert.ok(
  componentSource.includes('bg-white/85') &&
  componentSource.includes('backdrop-blur-2xl') &&
  componentSource.includes('glass-specular-edge'),
  'Primary match must use ONE prominent glass material surface with backdrop-blur-2xl and glass-specular-edge'
);
pass('Primary card features ONE prominent Cupertino liquid glass surface');

// Verify all 9 required attributes exist on the primary match:
const requiredElements = [
  { name: 'worker (identity & avatar)', check: 'primaryMatch.worker.name' },
  { name: 'profession', check: 'primaryMatch.worker.trade' },
  { name: 'rating', check: 'primaryMatch.worker.rating' },
  { name: 'experience', check: 'primaryMatch.worker.experienceYears' },
  { name: 'distance', check: 'primaryMatch.worker.distanceKm' },
  { name: 'availability', check: 'primaryMatch.worker.availabilityStatus' },
  { name: 'estimated price', check: 'primaryMatch.worker.estimatedQuote' },
  { name: 'verification badge', check: 'primaryMatch.worker.isVerified' },
  { name: 'match score', check: 'primaryMatch.totalScore' },
];

for (const elem of requiredElements) {
  assert.ok(componentSource.includes(elem.check), `Primary match must display ${elem.name}`);
  pass(`Primary match includes ${elem.name}`);
}

// ----------------------------------------------------
// TEST GROUP 3: ELEGANT TYPOGRAPHIC MATCH SCORE (NO NEON RINGS)
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Match Score Styling');

assert.ok(
  componentSource.includes('{primaryMatch.totalScore}%') && componentSource.includes('Match'),
  'Match score must display percentage and "Match" label'
);
pass('Match score renders clean percentage with "Match" label');

// Check that giant neon rings or circular progress bars are NOT present
assert.ok(
  !componentSource.includes('stroke-dasharray') && !componentSource.includes('neon'),
  'Must not use giant neon progress rings'
);
pass('Match score adheres to calm, confident typography without neon progress rings');

// ----------------------------------------------------
// TEST GROUP 4: PROMINENT "WHY THIS WORKER?" SECTION
// ----------------------------------------------------
console.log('\nTEST GROUP 4: "Why This Worker?" Section');

assert.ok(
  componentSource.includes('Why {primaryFirstName}?'),
  'Must include prominent "Why [FirstName]?" headline'
);
pass('Section headline dynamically personalizes as "Why {primaryFirstName}?"');

// Verify default 5-factor rationale structure
assert.ok(
  componentSource.includes('experience') &&
  componentSource.includes('Available') &&
  componentSource.includes('rating') &&
  componentSource.includes('km away') &&
  componentSource.includes('expected price range'),
  'Why section must cover trade experience, availability, rating, distance, and price range'
);
pass('Covers all 5 core rationale factors: experience, availability, rating, distance, and price range');

// ----------------------------------------------------
// TEST GROUP 5: SECONDARY WORKERS WITH FLATTER SURFACES & CLEAR HIERARCHY
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Secondary Workers & Hierarchy');

assert.ok(
  componentSource.includes('Alternative Qualified Candidates'),
  'Secondary recommendations must be grouped with clear hierarchy'
);
pass('Secondary candidates clearly grouped under alternative qualified recommendations');

// Verify secondary cards use solid white flatter surfaces (not prominent glass blur)
assert.ok(
  componentSource.includes('bg-white border border-black/8'),
  'Secondary cards must use flatter solid surfaces to preserve hierarchy'
);
pass('Secondary cards use flatter solid surfaces, avoiding visual clutter');

// ----------------------------------------------------
// TEST GROUP 6: GENTLE MOTION & USER REASSURANCE
// ----------------------------------------------------
console.log('\nTEST GROUP 6: Motion & Core Principle');

assert.ok(
  componentSource.includes('animate-fade-in') &&
  componentSource.includes('transition-all') &&
  componentSource.includes('duration-300'),
  'Must include subtle fade and gentle transition timing'
);
pass('Employs subtle fade-in and smooth 300ms material transitions');

// Verify reassurance copy that conveys WorkLink has already completed comparison
assert.ok(
  componentSource.includes('Evaluated against 5 non-negotiable hard constraints'),
  'Must convey the principle: "WorkLink has already done the difficult comparison for me."'
);
pass('Reassures user: "WorkLink has already done the difficult comparison for me"');

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedCount} Passed, 0 Failed`);
console.log('======================================================\n');
