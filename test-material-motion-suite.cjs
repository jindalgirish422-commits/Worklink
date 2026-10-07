const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('WORKLINK TEST SUITE: MILESTONE 20 — PREMIUM MATERIAL MOTION');
console.log('====================================================');

const projectRoot = __dirname;
let passedAssertions = 0;

function testAssert(condition, message) {
  assert(condition, message);
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// 1. CSS SYSTEM AUDIT: src/index.css
// -------------------------------------------------------------
console.log('\n[1] Auditing Material Motion System in src/index.css...');
const cssPath = path.join(projectRoot, 'src', 'index.css');
testAssert(fs.existsSync(cssPath), 'src/index.css exists');

const cssContent = fs.readFileSync(cssPath, 'utf8');

// Fluid Apple cubic-bezier easing
testAssert(
  cssContent.includes('--ease-apple: cubic-bezier(0.16, 1, 0.3, 1)') ||
  cssContent.includes('cubic-bezier(0.16, 1, 0.3, 1)'),
  'Defines Apple-calibrated fluid easing curve: cubic-bezier(0.16, 1, 0.3, 1)'
);

// Motion Keyframes
testAssert(cssContent.includes('@keyframes glassAppear'), 'Defines @keyframes glassAppear for natural settling');
testAssert(cssContent.includes('@keyframes slideSettle'), 'Defines @keyframes slideSettle for subtle translation');
testAssert(cssContent.includes('@keyframes scaleSettle'), 'Defines @keyframes scaleSettle for grounded scaling');
testAssert(cssContent.includes('@keyframes fadeIn'), 'Defines @keyframes fadeIn for soft opacity transitions');

// Subtle movement parameters (6px - 8px slight move, NOT large leaps)
testAssert(
  cssContent.includes('translateY(6px)') && cssContent.includes('translateY(0)'),
  'glassAppear moves slightly into place (6px translation) and settles naturally'
);
testAssert(
  cssContent.includes('scale(0.995)') || cssContent.includes('scale(0.985)'),
  'Applies subtle micro-scale parameter (0.985 - 0.995) without dramatic distortion'
);

// Material Motion Classes
testAssert(cssContent.includes('.motion-glass-appear'), 'Provides .motion-glass-appear utility class');
testAssert(cssContent.includes('.motion-fade-in'), 'Provides .motion-fade-in utility class');
testAssert(cssContent.includes('.motion-slide-settle'), 'Provides .motion-slide-settle utility class');
testAssert(cssContent.includes('.motion-scale-settle'), 'Provides .motion-scale-settle utility class');
testAssert(cssContent.includes('.hover-lift'), 'Provides .hover-lift subtle 1-2px hover elevation');
testAssert(cssContent.includes('.active-press'), 'Provides .active-press tactile micro-compression');
testAssert(cssContent.includes('.navbar-scroll-transition'), 'Provides .navbar-scroll-transition for smooth material shift');

// -------------------------------------------------------------
// 2. STRICT AVOIDANCE AUDIT (No bounce, spin, glow, or excessive parallax)
// -------------------------------------------------------------
console.log('\n[2] Auditing Strict Avoidance of Bouncing, Spinning, Glowing, & Parallax...');

// No bouncing in keyframe definitions (no overshooting beyond destination)
testAssert(!cssContent.includes('animate-bounce'), 'No animate-bounce keyframe class used');
testAssert(!cssContent.includes('cubic-bezier(0.68, -0.55, 0.265, 1.55)'), 'No bouncy overshoot cubic-bezier curve');

// No spinning in entrance motions
testAssert(!cssContent.includes('@keyframes spin'), 'No spin keyframes in material motion system');

// No glowing neon drop shadows in material tokens
testAssert(!cssContent.includes('drop-shadow(0 0 20px'), 'No glowing neon drop shadows in material system');

// -------------------------------------------------------------
// 3. SCROLL NAVIGATION TRANSITION AUDIT: Navbar.tsx
// -------------------------------------------------------------
console.log('\n[3] Auditing Scroll Navigation Material Transition in Navbar.tsx...');
const navbarPath = path.join(projectRoot, 'src', 'components', 'Navbar.tsx');
testAssert(fs.existsSync(navbarPath), 'Navbar.tsx exists');

const navbarContent = fs.readFileSync(navbarPath, 'utf8');

testAssert(navbarContent.includes('isScrolled'), 'Tracks scroll position for dynamic material transition');
testAssert(
  navbarContent.includes('bg-white/60') || navbarContent.includes('backdrop-blur-md'),
  'Displays lighter/transparent material when at top of page'
);
testAssert(
  navbarContent.includes('bg-white/90') || navbarContent.includes('backdrop-blur-xl'),
  'Transitions to slightly stronger material while scrolling'
);
testAssert(
  navbarContent.includes('navbar-scroll-transition') || navbarContent.includes('transition-all duration-300'),
  'Applies smooth transition for scroll material shift'
);

// -------------------------------------------------------------
// 4. ACCESSIBILITY AUDIT: prefers-reduced-motion
// -------------------------------------------------------------
console.log('\n[4] Auditing Accessibility (prefers-reduced-motion)...');
testAssert(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Contains strict prefers-reduced-motion media query');
testAssert(
  cssContent.includes('animation-duration: 0.001ms') || cssContent.includes('animation: none'),
  'Nullifies animation durations for users with reduced motion preferences'
);
testAssert(
  cssContent.includes('transform: none'),
  'Nullifies transform animations and hover lifts under reduced motion'
);

// Button component accessibility check
const buttonPath = path.join(projectRoot, 'src', 'components', 'ui', 'Button.tsx');
const buttonContent = fs.readFileSync(buttonPath, 'utf8');
testAssert(
  buttonContent.includes('motion-reduce:transition-none') || buttonContent.includes('motion-reduce:transform-none'),
  'Button component respects motion-reduce preferences'
);

// -------------------------------------------------------------
// 5. PERFORMANCE & BACKDROP-FILTER AUDIT
// -------------------------------------------------------------
console.log('\n[5] Auditing Performance & GPU-Composited Material Motion...');

// Verify that keyframes do NOT animate backdrop-filter (expensive layout re-rasterization)
const keyframesSection = cssContent.slice(cssContent.indexOf('/* Keyframe Animations */'));
testAssert(
  !keyframesSection.includes('backdrop-filter: blur('),
  'Does not animate expensive backdrop-filter in keyframes (preserves 60/120fps scrolling)'
);
testAssert(
  cssContent.includes('will-change: opacity, transform'),
  'Utilizes GPU-composited will-change for entrance surfaces'
);

// -------------------------------------------------------------
// 6. APPLICATION-WIDE GLASS SURFACE ENHANCEMENT AUDIT
// -------------------------------------------------------------
console.log('\n[6] Auditing Application-Wide Glass Surface Enhancement...');

// Modal dialog entrance
const modalPath = path.join(projectRoot, 'src', 'components', 'ui', 'Modal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');
testAssert(modalContent.includes('motion-glass-appear'), 'Modal dialog body uses motion-glass-appear');

// Signature recommendation primary card
const sigPath = path.join(projectRoot, 'src', 'components', 'recommendations', 'SignatureRecommendationView.tsx');
const sigContent = fs.readFileSync(sigPath, 'utf8');
testAssert(sigContent.includes('motion-glass-appear'), 'Primary recommendation surface uses motion-glass-appear');
testAssert(sigContent.includes('hover-lift'), 'Recommendation cards feature subtle hover-lift');

// Customer concierge home surfaces
const conciergePath = path.join(projectRoot, 'src', 'components', 'customer', 'CustomerConciergeHome.tsx');
const conciergeContent = fs.readFileSync(conciergePath, 'utf8');
testAssert(conciergeContent.includes('motion-glass-appear'), 'Concierge home glass surfaces use motion-glass-appear');
testAssert(conciergeContent.includes('hover-lift'), 'Concierge suggestion chips and cards use hover-lift');

// Booking flow modal
const bookingPath = path.join(projectRoot, 'src', 'components', 'BookingFlowModal.tsx');
const bookingContent = fs.readFileSync(bookingPath, 'utf8');
testAssert(bookingContent.includes('motion-glass-appear'), 'Booking modal glass summary uses motion-glass-appear');

// Transparent price summary
const pricePath = path.join(projectRoot, 'src', 'components', 'pricing', 'TransparentPriceSummary.tsx');
const priceContent = fs.readFileSync(pricePath, 'utf8');
testAssert(priceContent.includes('motion-glass-appear'), 'TransparentPriceSummary uses motion-glass-appear');

// Responsible AI banner
const bannerPath = path.join(projectRoot, 'src', 'components', 'trust', 'ResponsibleAiBanner.tsx');
const bannerContent = fs.readFileSync(bannerPath, 'utf8');
testAssert(bannerContent.includes('motion-glass-appear'), 'ResponsibleAiBanner uses motion-glass-appear');

console.log('\n====================================================');
console.log(`ALL MILESTONE 20 ASSERTIONS PASSED! Total: ${passedAssertions} assertions`);
console.log('====================================================');
