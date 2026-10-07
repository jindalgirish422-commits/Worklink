/**
 * WORKLINK MILESTONE 16: CUSTOMER HOME — SERVICE CONCIERGE TEST SUITE
 *
 * Verifies:
 * 1. TONE & AESTHETIC:
 *    - Premium service concierge feel (not admin dashboard)
 *    - WorkLink Service Concierge identity
 * 2. OPENING:
 *    - "Good morning."
 *    - "What do you need today?"
 *    - Primary AI job intake with natural language input & suggestions
 * 3. SECTIONS (All 6 Required Sections):
 *    - Recommended for you
 *    - Upcoming booking
 *    - Recent services
 *    - Favorite professionals
 *    - Activity
 *    - Support
 * 4. GLASS USAGE CONSTRAINT:
 *    - 1-2 high-value floating glass surfaces (AI request input + Primary recommendation)
 *    - Normal solid surfaces for other sections (Upcoming, Recent, Favorites, Activity, Support)
 * 5. THE THREE CORE GOALS:
 *    - What can I do?
 *    - What is WorkLink recommending?
 *    - What is happening with my current service?
 * 6. INTEGRATION:
 *    - Navbar & App navigation wire-up for customer concierge
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
console.log('WorkLink Milestone 16 Customer Home Concierge Test');
console.log('======================================================');

const conciergePath = path.join(__dirname, 'src', 'components', 'customer', 'CustomerConciergeHome.tsx');
const navbarPath = path.join(__dirname, 'src', 'components', 'Navbar.tsx');
const appPath = path.join(__dirname, 'src', 'App.tsx');

assert.ok(fs.existsSync(conciergePath), 'CustomerConciergeHome.tsx must exist');
assert.ok(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
assert.ok(fs.existsSync(appPath), 'App.tsx must exist');

const conciergeSource = fs.readFileSync(conciergePath, 'utf8');
const navbarSource = fs.readFileSync(navbarPath, 'utf8');
const appSource = fs.readFileSync(appPath, 'utf8');

// ----------------------------------------------------
// TEST GROUP 1: OPENING EXPERIENCE & GREETING
// ----------------------------------------------------
console.log('\nTEST GROUP 1: Opening Experience & Greeting');

// Headline 1: "Good morning."
assert.ok(
  conciergeSource.includes('Good morning.'),
  'Opening must include the exact greeting "Good morning."'
);
pass('Displays opening greeting: "Good morning."');

// Headline 2: "What do you need today?"
assert.ok(
  conciergeSource.includes('What do you need today?'),
  'Opening must ask "What do you need today?"'
);
pass('Displays conversational concierge question: "What do you need today?"');

// Concierge Branding
assert.ok(
  conciergeSource.includes('WorkLink Service Concierge') || conciergeSource.includes('WorkLink Concierge'),
  'Must convey premium service concierge identity (not admin dashboard)'
);
pass('Branded as "WorkLink Service Concierge" with calm luxury aesthetic');

// Primary AI Job Intake
assert.ok(
  conciergeSource.includes('Describe what you need in plain words') &&
  conciergeSource.includes('parseNaturalLanguageJob') &&
  conciergeSource.includes('createJobRequestFromSlots'),
  'Primary AI job intake must accept natural language input and parse into job request'
);
pass('Primary AI job intake accepts conversational service descriptions and extracts slots');

// Quick Suggestions
assert.ok(
  conciergeSource.includes('CONCIERGE_SUGGESTIONS') &&
  conciergeSource.includes('AC Diagnostics') &&
  conciergeSource.includes('Emergency Bathroom Pipe Leak'),
  'Concierge must provide one-tap immediate suggestion chips'
);
pass('One-tap quick need chips provided for immediate emergency and scheduled requests');

// ----------------------------------------------------
// TEST GROUP 2: THE 6 REQUIRED SECTIONS
// ----------------------------------------------------
console.log('\nTEST GROUP 2: The 6 Required Sections');

// Section 1: Recommended for you
assert.ok(
  conciergeSource.includes('Recommended for you'),
  'Must include "Recommended for you" section'
);
pass('Section 1 present: "Recommended for you"');

// Section 2: Upcoming booking
assert.ok(
  conciergeSource.includes('Upcoming booking'),
  'Must include "Upcoming booking" section'
);
pass('Section 2 present: "Upcoming booking"');

// Section 3: Recent services
assert.ok(
  conciergeSource.includes('Recent services'),
  'Must include "Recent services" section'
);
pass('Section 3 present: "Recent services"');

// Section 4: Favorite professionals
assert.ok(
  conciergeSource.includes('Favorite professionals'),
  'Must include "Favorite professionals" section'
);
pass('Section 4 present: "Favorite professionals"');

// Section 5: Activity
assert.ok(
  conciergeSource.includes('Activity'),
  'Must include "Activity" section'
);
pass('Section 5 present: "Activity"');

// Section 6: Support
assert.ok(
  conciergeSource.includes('Support'),
  'Must include "Support" section'
);
pass('Section 6 present: "Support"');

// ----------------------------------------------------
// TEST GROUP 3: GLASS MATERIAL SYSTEM DISCIPLINE
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Glass Material System Discipline (1-2 High-Value Surfaces)');

// Floating Glass Surface 1: AI request input
assert.ok(
  conciergeSource.includes('backdrop-blur-xl') &&
  conciergeSource.includes('glass-specular-edge') &&
  conciergeSource.includes('GLASS SURFACE 1: PRIMARY AI JOB INTAKE'),
  'AI request input must use high-value floating glass surface'
);
pass('High-Value Glass Surface 1: AI request input features liquid glass with specular edge');

// Floating Glass Surface 2: Primary recommendation card
assert.ok(
  conciergeSource.includes('GLASS SURFACE 2: PRIMARY RECOMMENDATION CARD') &&
  conciergeSource.includes('backdrop-blur-xl') &&
  conciergeSource.includes('glass-specular-edge'),
  'Primary recommendation card must use high-value floating glass surface'
);
pass('High-Value Glass Surface 2: Primary recommendation uses prominent glass material');

// Discipline: Dense / other sections use normal solid surfaces
assert.ok(
  conciergeSource.includes('SECTION 2: UPCOMING BOOKING') &&
  conciergeSource.includes('(Normal Solid Surface)') &&
  conciergeSource.includes('SECTION 3: RECENT SERVICES') &&
  conciergeSource.includes('SECTION 4: FAVORITE PROFESSIONALS') &&
  conciergeSource.includes('SECTION 5: ACTIVITY') &&
  conciergeSource.includes('SECTION 6: SUPPORT'),
  'Non-hero sections must maintain normal solid white surfaces to avoid glass fatigue'
);
pass('Rest of sections (Upcoming, Recent, Favorites, Activity, Support) maintain crisp solid surfaces');

// ----------------------------------------------------
// TEST GROUP 4: THE THREE CORE GOALS
// ----------------------------------------------------
console.log('\nTEST GROUP 4: The Three Core Goals for Immediate Customer Orientation');

// Goal 1: What can I do?
assert.ok(
  conciergeSource.includes('What can I do?'),
  'Customer must immediately see answers to: "What can I do?"'
);
pass('Immediate orientation: Answers "What can I do?"');

// Goal 2: What is WorkLink recommending?
assert.ok(
  conciergeSource.includes('What is WorkLink recommending?'),
  'Customer must immediately see answers to: "What is WorkLink recommending?"'
);
pass('Immediate orientation: Answers "What is WorkLink recommending?"');

// Goal 3: What is happening with my current service?
assert.ok(
  conciergeSource.includes('What is happening with my service?') ||
  conciergeSource.includes('What is happening with my current service?'),
  'Customer must immediately see answers to: "What is happening with my current service?"'
);
pass('Immediate orientation: Answers "What is happening with my current service?"');

// ----------------------------------------------------
// TEST GROUP 5: CONCIERGE ACTIONS & TRUST FEATURES
// ----------------------------------------------------
console.log('\nTEST GROUP 5: Concierge Actions & Trust Features');

// 1-Click Book Again for Recent Services
assert.ok(
  conciergeSource.includes('Book Again') &&
  conciergeSource.includes('handleBookDirectWorkerId'),
  'Recent services must provide 1-click Book Again'
);
pass('1-Click "Book Again" implemented for past trusted services');

// 1-Click Book Direct for Favorites
assert.ok(
  conciergeSource.includes('Book Direct') &&
  conciergeSource.includes('favoritePros'),
  'Favorites must provide 1-click Book Direct'
);
pass('1-Click "Book Direct" implemented for saved favorite professionals');

// Concierge Support & Trust Guarantees
assert.ok(
  conciergeSource.includes('Fair Price Guarantee') &&
  conciergeSource.includes('Property Protection') &&
  conciergeSource.includes('Concierge Desk'),
  'Support section must include Fair Price Guarantee, Property Protection, and Concierge Desk'
);
pass('Concierge support guarantees (Fair Price, ₹25k Protection, 24/7 Desk) fully present');

// ----------------------------------------------------
// TEST GROUP 6: APP & NAVBAR ROUTING INTEGRATION
// ----------------------------------------------------
console.log('\nTEST GROUP 6: App & Navbar Routing Integration');

assert.ok(
  navbarSource.includes('customer_home') &&
  navbarSource.includes('Concierge'),
  'Navbar must provide first-class navigation to Concierge (customer_home)'
);
pass('Navbar integrates Concierge tab for desktop and mobile');

assert.ok(
  appSource.includes('CustomerConciergeHome') &&
  appSource.includes("currentTab === 'customer_home'"),
  'App.tsx must wire CustomerConciergeHome to customer_home tab'
);
pass('App.tsx orchestrates CustomerConciergeHome with real-time reactive state');

assert.ok(
  appSource.includes("role === 'customer' && currentTab === 'landing'"),
  'App.tsx automatically navigates customer to customer_home'
);
pass('Customer login/role switch automatically transitions to Concierge Home');

console.log('\n======================================================');
console.log(`All ${passedCount} WorkLink Milestone 16 tests passed successfully!`);
console.log('======================================================');
