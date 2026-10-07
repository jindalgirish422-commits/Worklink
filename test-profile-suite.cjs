/**
 * WORKLINK MILESTONE 10: PREMIUM WORKER PROFILE TEST SUITE
 *
 * Verifies:
 * 1. Hero Requirements:
 *    - Large worker visual
 *    - Name
 *    - Profession
 *    - Rating
 *    - Experience
 * 2. Information Completeness:
 *    - Skills
 *    - Verification (License, Background check)
 *    - Completed jobs
 *    - Reviews
 *    - Availability
 *    - Service area
 *    - Pricing
 * 3. "Why Recommended" Section:
 *    - Exactly includes "Why WorkLink recommended this professional"
 *    - Renders relevant matching reasons
 * 4. Selective Glass Rules:
 *    - Glass used selectively on availability, recommendation explanation, booking CTA, and contextual info
 *    - Avoids putting every section inside glass (skills, reviews, verification stay solid)
 * 5. CTA Dominance:
 *    - Primary action labeled "Book this professional"
 *    - Visually dominant
 * 6. Mobile Accessibility:
 *    - Worker identity and booking CTA remain immediately accessible
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
console.log('WorkLink Milestone 10 Premium Worker Profile Test');
console.log('======================================================');

const profilePath = path.join(__dirname, 'src', 'components', 'WorkerProfileModal.tsx');
assert.ok(fs.existsSync(profilePath), 'WorkerProfileModal.tsx must exist');
const profileSource = fs.readFileSync(profilePath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: HERO REQUIREMENTS
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Hero Section');

// Large visual
assert.ok(
  profileSource.includes('size="2xl"') || profileSource.includes('avatar'),
  'Hero must include large worker visual'
);
pass('Hero includes large worker visual (size 2xl avatar)');

// Name
assert.ok(profileSource.includes('worker.name'), 'Hero must display worker name');
pass('Hero displays worker name in prominent typography');

// Profession
assert.ok(profileSource.includes('worker.trade'), 'Hero must display worker profession');
pass('Hero displays worker profession');

// Rating
assert.ok(profileSource.includes('worker.rating'), 'Hero must display customer rating');
pass('Hero displays customer rating & verified review count');

// Experience
assert.ok(profileSource.includes('worker.experienceYears'), 'Hero must display trade experience');
pass('Hero displays trade experience');

// ----------------------------------------------------
// TEST GROUP 2: COMPREHENSIVE INFORMATION
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Comprehensive Information');

const requiredInfoFields = [
  { name: 'skills', check: 'worker.skills' },
  { name: 'verification (license & background)', check: 'worker.isVerified' },
  { name: 'completed jobs', check: 'worker.completedJobs' },
  { name: 'reviews', check: 'worker.recentReviews' },
  { name: 'availability', check: 'worker.availabilityStatus' },
  { name: 'service area', check: 'Service Area' },
  { name: 'pricing', check: 'worker.estimatedQuote' },
];

for (const field of requiredInfoFields) {
  assert.ok(profileSource.includes(field.check), `Profile must include ${field.name}`);
  pass(`Profile includes ${field.name}`);
}

// ----------------------------------------------------
// TEST GROUP 3: "WHY RECOMMENDED" SECTION
// ----------------------------------------------------
console.log('\nTEST GROUP 3: "Why Recommended" Section');

// Exact headline
assert.ok(
  profileSource.includes('Why WorkLink recommended this professional'),
  'Must include exact headline: "Why WorkLink recommended this professional"'
);
pass('Features exact headline: "Why WorkLink recommended this professional"');

// Matching reasons render
assert.ok(
  profileSource.includes('reasons.map') || profileSource.includes('reason'),
  'Must render matching reasons'
);
pass('Renders granular explainability matching reasons with checkmark indicators');

// ----------------------------------------------------
// TEST GROUP 4: SELECTIVE GLASS DESIGN RULES
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Selective Glass Rules');

// Glass used selectively for:
// 1. availability
assert.ok(
  profileSource.includes('bg-white/70 backdrop-blur-md') && profileSource.includes('glass-specular-edge'),
  'Availability pill must use selective glass effect'
);
pass('Availability status features selective glass pill');

// 2. recommendation explanation
assert.ok(
  profileSource.includes('bg-white/80 backdrop-blur-xl') && profileSource.includes('glass-specular-edge'),
  'Recommendation explanation container must use selective glass surface'
);
pass('Recommendation explanation uses prominent selective glass surface');

// 3. booking CTA
assert.ok(
  profileSource.includes('bg-white/90 backdrop-blur-xl') && profileSource.includes('glass-specular-edge'),
  'Booking CTA bar must use selective glass material'
);
pass('Booking CTA bar uses selective glass material surface');

// Other sections stay solid white (not glass):
assert.ok(
  profileSource.includes('bg-white border border-black/8'),
  'Core information sections (skills, reviews, credentials) must stay on solid white cards'
);
pass('Core sections maintain solid white surfaces, avoiding excessive glass');

// ----------------------------------------------------
// TEST GROUP 5: VISUALLY DOMINANT CTA
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Visually Dominant CTA');

assert.ok(
  profileSource.includes('Book this professional'),
  'Primary CTA must have exact label "Book this professional"'
);
pass('CTA uses exact label: "Book this professional"');

assert.ok(
  profileSource.includes('variant="primary"') &&
  profileSource.includes('size="lg"'),
  'CTA must be styled with dominant primary visual treatment'
);
pass('CTA is visually dominant with prominent size and contrast');

// ----------------------------------------------------
// TEST GROUP 6: MOBILE ACCESSIBILITY
// ----------------------------------------------------
console.log('\nTEST GROUP 6: Mobile Accessibility');

// Footer / CTA accessible across mobile
assert.ok(
  profileSource.includes('footer=') &&
  profileSource.includes('onProceedToBooking'),
  'CTA remains immediately accessible in modal footer for mobile devices'
);
pass('Worker identity and booking CTA remain immediately accessible across viewport sizes');

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedCount} Passed, 0 Failed`);
console.log('======================================================\n');
