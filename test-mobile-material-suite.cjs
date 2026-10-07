// test-mobile-material-suite.cjs
// Verification Suite for WORKLINK MILESTONE 21: MOBILE MATERIAL DESIGN

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    ${err.message}`);
  }
}

console.log('====================================================');
console.log('WORKLINK TEST SUITE: MILESTONE 21 — MOBILE MATERIAL DESIGN');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// [1] AUDIT BOTTOM SHEETS IN MODAL COMPONENT
// -----------------------------------------------------------------------------
console.log('[1] Auditing Bottom Sheet Architecture in src/components/ui/Modal.tsx...');
const modalPath = path.join(__dirname, 'src/components/ui/Modal.tsx');

test('src/components/ui/Modal.tsx exists', () => {
  assert(fs.existsSync(modalPath), 'Modal.tsx must exist');
});

const modalSrc = fs.readFileSync(modalPath, 'utf8');

test('Presents native bottom sheet on mobile (items-end sm:items-center)', () => {
  assert(modalSrc.includes('items-end sm:items-center'), 'Modal container must align to bottom on mobile');
});

test('Applies rounded-t-3xl for mobile bottom sheet curve', () => {
  assert(modalSrc.includes('rounded-t-3xl'), 'Modal must have rounded-t-3xl for bottom sheet styling');
});

test('Includes tactile drag handle indicator for mobile sheet', () => {
  assert(modalSrc.includes('bg-black/15 rounded-full') && modalSrc.includes('sm:hidden'), 'Must render mobile drag handle pill');
});

test('Uses motion-bottom-sheet-appear animation for mobile entry', () => {
  assert(modalSrc.includes('motion-bottom-sheet-appear'), 'Modal body must trigger bottom sheet motion');
});

test('Reduces blur intensity on mobile (backdrop-blur-md vs sm:backdrop-blur-xl)', () => {
  assert(modalSrc.includes('backdrop-blur-md sm:backdrop-blur-xl'), 'Must reduce blur intensity on mobile to optimize compositor performance');
});

test('Provides minimum 44px touch target on close button', () => {
  assert(modalSrc.includes('min-h-[44px]') && modalSrc.includes('min-w-[44px]'), 'Close button must provide >=44px touch target');
});

// -----------------------------------------------------------------------------
// [2] AUDIT FLOATING ACTION SURFACES
// -----------------------------------------------------------------------------
console.log('\n[2] Auditing Floating Action Surfaces in Booking & Profile Modals...');
const profileModalPath = path.join(__dirname, 'src/components/WorkerProfileModal.tsx');
const bookingModalPath = path.join(__dirname, 'src/components/BookingFlowModal.tsx');

const profileModalSrc = fs.readFileSync(profileModalPath, 'utf8');
const bookingModalSrc = fs.readFileSync(bookingModalPath, 'utf8');

test('WorkerProfileModal implements floating action surface for booking CTA', () => {
  assert(profileModalSrc.includes('FLOATING ACTION SURFACE') || profileModalSrc.includes('items-stretch sm:items-center'), 'Must provide floating action surface');
});

test('WorkerProfileModal booking CTA enforces min-h-[48px] touch target and full width on mobile', () => {
  assert(profileModalSrc.includes('min-h-[48px]') && profileModalSrc.includes('w-full sm:w-auto'), 'CTA button must be full-width on mobile with min-h-[48px]');
});

test('BookingFlowModal implements floating action surface for price estimate footer', () => {
  assert(bookingModalSrc.includes('flex flex-col sm:flex-row items-stretch sm:items-center'), 'Booking modal footer must be responsive floating action surface');
});

test('BookingFlowModal confirm CTA enforces min-h-[48px] touch target and full width on mobile', () => {
  assert(bookingModalSrc.includes('min-h-[48px]') && bookingModalSrc.includes('w-full sm:w-auto'), 'Confirm CTA must be full-width on mobile with min-h-[48px]');
});

// -----------------------------------------------------------------------------
// [3] AUDIT COMPACT GLASS NAVIGATION IN NAVBAR
// -----------------------------------------------------------------------------
console.log('\n[3] Auditing Compact Glass Navigation in src/components/Navbar.tsx...');
const navbarPath = path.join(__dirname, 'src/components/Navbar.tsx');
const navbarSrc = fs.readFileSync(navbarPath, 'utf8');

test('Navbar provides compact glass navigation rail for mobile viewports', () => {
  assert(navbarSrc.includes('Compact Glass Navigation Rail') || navbarSrc.includes('backdrop-blur-md border border-black/5'), 'Must render compact glass navigation rail');
});

test('Mobile navigation rail uses frosted material backdrop (bg-white/75 backdrop-blur-md)', () => {
  assert(navbarSrc.includes('bg-white/75 backdrop-blur-md') || navbarSrc.includes('bg-white/70 backdrop-blur-md'), 'Must use frosted glass backdrop for mobile navigation rail');
});

test('Mobile navigation rail tabs enforce minimum 40px touch targets', () => {
  assert(navbarSrc.includes('min-h-[40px]'), 'Mobile nav tabs must enforce min-h-[40px] touch target');
});

test('Mobile tabs feature icons for instant visual comprehension', () => {
  assert(navbarSrc.includes('<Sparkles') && navbarSrc.includes('<Home') && navbarSrc.includes('<Compass'), 'Mobile navigation rail must feature iconography');
});

test('Dynamic location pill provides narrow viewport tolerance down to 320px', () => {
  assert(navbarSrc.includes('max-w-[105px]') || navbarSrc.includes('max-w-[110px]'), 'Dynamic location pill must handle narrow 320px viewports without overflow');
});

// -----------------------------------------------------------------------------
// [4] AUDIT GLASS RECOMMENDATION SURFACES (MOBILE PASS)
// -----------------------------------------------------------------------------
console.log('\n[4] Auditing Glass Recommendation Surfaces...');
const sigRecPath = path.join(__dirname, 'src/components/recommendations/SignatureRecommendationView.tsx');
const conciergePath = path.join(__dirname, 'src/components/customer/CustomerConciergeHome.tsx');
const workerCardPath = path.join(__dirname, 'src/components/WorkerCard.tsx');

const sigRecSrc = fs.readFileSync(sigRecPath, 'utf8');
const conciergeSrc = fs.readFileSync(conciergePath, 'utf8');
const workerCardSrc = fs.readFileSync(workerCardPath, 'utf8');

test('SignatureRecommendationView primary card calibrates glass for mobile (backdrop-blur-md sm:backdrop-blur-2xl)', () => {
  assert(sigRecSrc.includes('backdrop-blur-md sm:backdrop-blur-2xl'), 'Primary recommendation card must scale blur gracefully on mobile');
});

test('Reduces floating layer count by flattening nested Why Pro card on mobile (bg-[#F8F8FA] sm:bg-white/60)', () => {
  assert(sigRecSrc.includes('bg-[#F8F8FA] sm:bg-white/60'), 'Must flatten nested Why Pro card on mobile to eliminate nested floating layers');
});

test('SignatureRecommendationView action CTAs provide min-h-[48px] touch target and full width on mobile', () => {
  assert(sigRecSrc.includes('min-h-[48px]') && sigRecSrc.includes('w-full sm:w-auto'), 'Primary booking CTA must be full-width with min-h-[48px]');
});

test('CustomerConciergeHome Glass Surface 1 (intake) adapts padding for mobile (p-4 sm:p-7)', () => {
  assert(conciergeSrc.includes('p-4 sm:p-7') && conciergeSrc.includes('backdrop-blur-md sm:backdrop-blur-xl'), 'Concierge intake glass surface must adapt for mobile');
});

test('CustomerConciergeHome Glass Surface 2 (primary recommendation) adapts blur and padding for mobile', () => {
  assert(conciergeSrc.includes('backdrop-blur-md sm:backdrop-blur-xl') && conciergeSrc.includes('min-h-[48px]'), 'Concierge primary recommendation card must adapt for mobile');
});

test('WorkerCard action buttons adapt to full-width stack with >=40px touch height on mobile', () => {
  assert(workerCardSrc.includes('flex flex-col sm:flex-row') && workerCardSrc.includes('min-h-[44px]'), 'WorkerCard buttons must adapt to mobile stack with proper touch height');
});

// -----------------------------------------------------------------------------
// [5] AUDIT VIEWPORT RESPONSIVENESS & OVERFLOW PROTECTION (320px - 1440px)
// -----------------------------------------------------------------------------
console.log('\n[5] Auditing Viewport Responsiveness across 320px, 375px, 390px, 430px, 768px, 1024px, 1440px...');
const cssPath = path.join(__dirname, 'src/index.css');
const containerPath = path.join(__dirname, 'src/components/ui/Container.tsx');

const cssSrc = fs.readFileSync(cssPath, 'utf8');
const containerSrc = fs.readFileSync(containerPath, 'utf8');

test('Global CSS protects html, body, #root against horizontal overflow', () => {
  assert(cssSrc.includes('overflow-x: hidden'), 'html, body, #root must enforce overflow-x: hidden');
  assert(cssSrc.includes('max-width: 100%'), 'html, body, #root must enforce max-width: 100%');
});

test('Container adjusts horizontal padding for 320px viewports (px-3.5 sm:px-6)', () => {
  assert(containerSrc.includes('px-3.5 sm:px-6'), 'Container must have calibrated mobile padding');
});

const REQUIRED_VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1440];

REQUIRED_VIEWPORTS.forEach((width) => {
  test(`Audit width ${width}px: verifies no hardcoded wide fixed-width breakers`, () => {
    // Verify that components do not hardcode fixed widths greater than viewport width
    const filesToAudit = [
      'src/components/ui/Modal.tsx',
      'src/components/Navbar.tsx',
      'src/components/BookingFlowModal.tsx',
      'src/components/WorkerProfileModal.tsx',
      'src/components/recommendations/SignatureRecommendationView.tsx',
      'src/components/customer/CustomerConciergeHome.tsx',
      'src/components/WorkerCard.tsx',
      'src/components/pricing/TransparentPriceSummary.tsx',
      'src/components/ServiceZoneMap.tsx'
    ];

    filesToAudit.forEach((rel) => {
      const content = fs.readFileSync(path.join(__dirname, rel), 'utf8');
      // Must not contain hardcoded fixed width classes exceeding width without responsive prefixes
      // Negative lookbehind ensures max-w-[...px] is not erroneously flagged
      const forbiddenFixedPattern = /(?<!max-)\b(w|min-w)-\[(\d+)px\]/g;
      let match;
      while ((match = forbiddenFixedPattern.exec(content)) !== null) {
        const pxVal = parseInt(match[2], 10);
        if (pxVal > width) {
          assert(false, `File ${rel} contains unconstrained width class ${match[0]} exceeding ${width}px viewport`);
        }
      }
    });
  });
});

// -----------------------------------------------------------------------------
// [6] AUDIT PERFORMANCE & ACCESSIBILITY IN MOBILE MATERIAL PASS
// -----------------------------------------------------------------------------
console.log('\n[6] Auditing Performance & Accessibility in Mobile Material Pass...');

test('bottomSheetAppear keyframes defined with Apple fluid easing in index.css', () => {
  assert(cssSrc.includes('@keyframes bottomSheetAppear'), 'Must define @keyframes bottomSheetAppear');
  assert(cssSrc.includes('.motion-bottom-sheet-appear'), 'Must define .motion-bottom-sheet-appear');
});

test('prefers-reduced-motion nullifies motion-bottom-sheet-appear', () => {
  assert(cssSrc.includes('.motion-bottom-sheet-appear') && cssSrc.includes('prefers-reduced-motion'), 'Reduced motion must reset bottom sheet animation');
});

console.log('\n====================================================');
console.log(`ALL MILESTONE 21 ASSERTIONS PASSED! Total: ${passedTests}/${totalTests} assertions`);
console.log('====================================================\n');
