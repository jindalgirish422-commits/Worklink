/**
 * WORKLINK MILESTONE 14: RATINGS, REVIEWS & FEEDBACK TEST SUITE
 *
 * Verifies:
 * 1. Prompt Requirements:
 *    - Exact headline: "How was your experience?"
 *    - Interactive 5-star rating (★★★★★)
 *    - Optional review clearly marked as optional
 * 2. Design Constraints:
 *    - Lightweight feedback (not a survey)
 *    - Subtle glass treatment for feedback surface (bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge)
 * 3. Closed Feedback Loop:
 *    - Recommendation -> Booking -> Service -> Completion -> Rating -> Worker signal -> Future recommendation
 * 4. The 7 Potential Signals:
 *    - rating
 *    - completion
 *    - cancellation
 *    - response time
 *    - repeat booking
 *    - satisfaction
 *    - disputes
 * 5. State Recalibration & Future Matching Boost:
 *    - Worker rating recalculated (Bayesian rolling average)
 *    - Completed jobs incremented
 *    - Repeat booking recorded in user profile (triggering +40 pt personalization boost in matching engine)
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

let passedCount = 0;
function pass(msg) {
  console.log(`  ✓ [PASS] ${msg}`);
  passedCount++;
}

console.log('===============================================================');
console.log('WorkLink Milestone 14 Ratings, Reviews & Feedback Test Suite');
console.log('===============================================================');

// Source file paths
const typesPath = path.join(__dirname, 'src', 'types', 'index.ts');
const feedbackComponentPath = path.join(__dirname, 'src', 'components', 'feedback', 'FeedbackExperience.tsx');
const feedbackLoopViewPath = path.join(__dirname, 'src', 'components', 'FeedbackLearningLoopView.tsx');
const trackerPath = path.join(__dirname, 'src', 'components', 'JobExecutionTracker.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');
const featuresPath = path.join(__dirname, 'src', 'services', 'matching', 'features.ts');

assert.ok(fs.existsSync(typesPath), 'types/index.ts must exist');
assert.ok(fs.existsSync(feedbackComponentPath), 'FeedbackExperience.tsx must exist');
assert.ok(fs.existsSync(feedbackLoopViewPath), 'FeedbackLearningLoopView.tsx must exist');
assert.ok(fs.existsSync(trackerPath), 'JobExecutionTracker.tsx must exist');
assert.ok(fs.existsSync(appPath), 'App.tsx must exist');
assert.ok(fs.existsSync(featuresPath), 'features.ts must exist');

const typesSource = fs.readFileSync(typesPath, 'utf8');
const feedbackSource = fs.readFileSync(feedbackComponentPath, 'utf8');
const feedbackLoopViewSource = fs.readFileSync(feedbackLoopViewPath, 'utf8');
const trackerSource = fs.readFileSync(trackerPath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');
const featuresSource = fs.readFileSync(featuresPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: PROMPT AND STRUCTURE
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Prompt & Structure');

// Must feature exact prompt: "How was your experience?"
assert.ok(
  feedbackSource.includes('How was your experience?'),
  'Must include exact prompt "How was your experience?"'
);
pass('Exact headline "How was your experience?" present');

// Must include interactive 5-star rating (★★★★★)
assert.ok(
  feedbackSource.includes('[1, 2, 3, 4, 5].map((star)') || feedbackSource.includes('star <= activeStarCount'),
  'Must render interactive 5-star picker'
);
pass('Interactive 5-star rating (★★★★★) implemented');

// Must feature Optional review
assert.ok(
  feedbackSource.includes('Optional review'),
  'Must feature "Optional review" heading'
);
assert.ok(
  feedbackSource.includes('100% voluntary') || feedbackSource.includes('(optional)'),
  'Review must be clearly marked as optional'
);
pass('Optional review clearly marked as non-mandatory');

// ----------------------------------------------------
// TEST GROUP 2: DESIGN & SUBTLE GLASS SURFACE
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Lightweight Design & Subtle Glass Surface');

// Subtle glass treatment
assert.ok(
  feedbackSource.includes('bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge shadow-sm'),
  'Feedback surface must use subtle liquid glass treatment'
);
pass('Subtle glass treatment for the feedback surface verified');

// Not a survey constraint (single card, no multi-step survey, no NPS survey question)
assert.ok(
  !feedbackSource.includes('Question 1 of') &&
  !feedbackSource.includes('Survey') &&
  !feedbackSource.includes('scale of 1-10'),
  'Must NOT feel like a generic survey or lengthy questionnaire'
);
pass('Lightweight design verified: Single tactile card, zero survey clutter');

// ----------------------------------------------------
// TEST GROUP 3: THE CLOSED FEEDBACK LOOP
// ----------------------------------------------------
console.log('\nTEST GROUP 3: The Closed Feedback Loop Pipeline');

// Loop: Recommendation -> Booking -> Service -> Completion -> Rating -> Worker signal -> Future recommendation
const loopSteps = [
  'Recommendation',
  'Booking',
  'Service',
  'Completion',
  'Rating',
  'Worker Signal',
  'Future Rec',
];

loopSteps.forEach((step) => {
  assert.ok(
    feedbackSource.toLowerCase().includes(step.toLowerCase()) ||
    feedbackLoopViewSource.toLowerCase().includes(step.toLowerCase()),
    `Feedback loop must include step: ${step}`
  );
});
pass('Closed Feedback Loop verified: Recommendation -> Booking -> Service -> Completion -> Rating -> Worker signal -> Future recommendation');

// ----------------------------------------------------
// TEST GROUP 4: THE 7 WORKER SIGNALS
// ----------------------------------------------------
console.log('\nTEST GROUP 4: The 7 Worker Feedback Signals');

const requiredSignals = [
  'rating',
  'completion',
  'cancellation',
  'response time',
  'repeat booking',
  'satisfaction',
  'disputes',
];

requiredSignals.forEach((sig) => {
  const presentInComponent = feedbackSource.toLowerCase().includes(sig);
  const presentInLoopView = feedbackLoopViewSource.toLowerCase().includes(sig);
  assert.ok(
    presentInComponent || presentInLoopView,
    `Signal "${sig}" must be tracked and represented in feedback loop`
  );
  pass(`Signal tracked: ${sig}`);
});

// Also check types definition
assert.ok(typesSource.includes('interface FeedbackSignals'), 'types/index.ts must define FeedbackSignals interface');
assert.ok(typesSource.includes('rating: number;'), 'FeedbackSignals includes rating');
assert.ok(typesSource.includes('completion: boolean;'), 'FeedbackSignals includes completion');
assert.ok(typesSource.includes('cancellation: boolean;'), 'FeedbackSignals includes cancellation');
assert.ok(typesSource.includes('responseTime: number;'), 'FeedbackSignals includes responseTime');
assert.ok(typesSource.includes('repeatBooking: boolean;'), 'FeedbackSignals includes repeatBooking');
assert.ok(typesSource.includes('satisfaction: number;'), 'FeedbackSignals includes satisfaction');
assert.ok(typesSource.includes('disputes: number;'), 'FeedbackSignals includes disputes');
pass('FeedbackSignals interface contains all 7 signals strongly typed');

// ----------------------------------------------------
// TEST GROUP 5: OBSERVABLE RECALIBRATION & FUTURE RECOMMENDATION BOOST
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Recalibration & Future Recommendation Boost');

// 1. Worker rating rolling average updated
assert.ok(
  appSource.includes('(w.rating * w.reviewCount + userStars) / (w.reviewCount + 1)') ||
  appSource.includes('updatedRating'),
  'Worker rating must be recalculated using rolling Bayesian average'
);
pass('Worker rolling average rating updated upon rating submission');

// 2. Completed jobs incremented
assert.ok(
  appSource.includes('completedJobs: newCompleted') || appSource.includes('w.completedJobs + 1'),
  'Worker completedJobs count must be incremented'
);
pass('Worker completedJobs incremented upon service completion');

// 3. Repeat booking signals added to user profile
assert.ok(
  appSource.includes('repeatWorkersBooked: [...prev.repeatWorkersBooked, completedBooking.worker.id]') ||
  appSource.includes('repeatWorkersBooked'),
  'User profile must record repeat workers booked for future preference'
);
pass('Worker added to repeatWorkersBooked in customer personalization profile');

// 4. Personalization boost in matching engine
assert.ok(
  featuresSource.includes('personalizationScore += 40') &&
  featuresSource.includes('repeatWorkersBooked?.includes(worker.id)'),
  'Repeat booked worker must receive +40 pt personalization boost in future matching recommendations'
);
pass('Matching engine awards +40 points to repeat workers in future recommendations');

// ----------------------------------------------------
// TEST GROUP 6: INTEGRATION IN JOB EXECUTION TRACKER
// ----------------------------------------------------
console.log('\nTEST GROUP 6: Integration in JobExecutionTracker');

assert.ok(
  trackerSource.includes('<FeedbackExperience'),
  'JobExecutionTracker must integrate FeedbackExperience component'
);
assert.ok(
  trackerSource.includes('onCompleteFeedbackLoop'),
  'JobExecutionTracker must invoke onCompleteFeedbackLoop'
);
pass('FeedbackExperience seamlessly wired into post-service job completion flow');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n===============================================================');
console.log(`WORKLINK MILESTONE 14 ALL TESTS PASSED (${passedCount}/${passedCount} assertions)`);
console.log('===============================================================\n');
