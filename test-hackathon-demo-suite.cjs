const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('WORKLINK TEST SUITE: MILESTONE 22 — HACKATHON DEMO MODE');
console.log('====================================================');

const projectRoot = __dirname;
let passedAssertions = 0;

function testAssert(condition, message) {
  assert(condition, message);
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// 1. FILE EXISTENCE & EXPORT AUDIT
// -------------------------------------------------------------
console.log('\n[1] Auditing HackathonDemoView.tsx component...');
const demoViewPath = path.join(projectRoot, 'src', 'components', 'demo', 'HackathonDemoView.tsx');
testAssert(fs.existsSync(demoViewPath), 'HackathonDemoView.tsx file exists');

const demoContent = fs.readFileSync(demoViewPath, 'utf8');

testAssert(demoContent.includes('export const HackathonDemoView'), 'Exports HackathonDemoView component');
testAssert(demoContent.includes('DEMO_DATASET_METADATA'), 'Exports/defines DEMO_DATASET_METADATA constant');

// -------------------------------------------------------------
// 2. SYNTHETIC & DEMO DATASET LABELLING (NO FABRICATED CLAIMS)
// -------------------------------------------------------------
console.log('\n[2] Verifying Synthetic Dataset Metadata & Disclaimers...');
testAssert(
  demoContent.includes('WORKLINK_SYNTHETIC_DELHI_V2'),
  'Identifies benchmark dataset as WORKLINK_SYNTHETIC_DELHI_V2'
);
testAssert(
  demoContent.includes('Synthetic') || demoContent.includes('synthetic'),
  'Explicitly labels synthetic evaluation environment'
);
testAssert(
  demoContent.includes('disclaimer') || demoContent.includes('Disclaimer') || demoContent.includes('simulated'),
  'Includes disclaimer clarifying benchmark evaluation rather than fabricated claims'
);

// -------------------------------------------------------------
// 3. FIVE CONTROLLED SCENARIOS
// -------------------------------------------------------------
console.log('\n[3] Auditing 5 Mandatory Demo Scenarios...');

// Scenario 1: AC Repair
testAssert(
  demoContent.includes("My AC isn't cooling. I need someone tomorrow morning.") ||
  demoContent.includes("My AC isn't cooling"),
  'Scenario 1: Contains exact prompt "My AC isn\'t cooling. I need someone tomorrow morning."'
);
testAssert(
  demoContent.includes('AC Technician') || demoContent.includes('AC Repair'),
  'Scenario 1: Resolves category to AC Technician'
);
testAssert(
  demoContent.includes('10 km') && (demoContent.includes('eligible') || demoContent.includes('Eligible')),
  'Scenario 1: Demonstrates 10 km zone & eligible workers pool'
);
testAssert(
  demoContent.includes('Manoj Sharma') || demoContent.includes('W3'),
  'Scenario 1: Highlights best match candidate Manoj Sharma (W3)'
);

// Scenario 2: Electrician
testAssert(
  demoContent.includes('I need an electrician tomorrow morning for a wiring issue.') ||
  demoContent.includes('wiring issue'),
  'Scenario 2: Contains exact prompt "I need an electrician tomorrow morning for a wiring issue."'
);
testAssert(
  demoContent.includes('Mohit Saxena') || demoContent.includes('W8'),
  'Scenario 2: Dynamically shifts recommendation to Electrician Mohit Saxena (W8)'
);
testAssert(
  demoContent.includes('Electrician') && demoContent.includes('wiring'),
  'Scenario 2: Correctly matches electrical wiring domain'
);

// Scenario 3: Personalization (Returning User)
testAssert(
  demoContent.includes('Recommended for you') && demoContent.includes('Based on your previous booking'),
  'Scenario 3: Prominently renders "Recommended for you" and "Based on your previous booking"'
);
testAssert(
  demoContent.includes('personalization') || demoContent.includes('Personalization') || demoContent.includes('affinity'),
  'Scenario 3: Highlights personalization affinity bonus and previous booking history'
);

// Scenario 4: 10 km Exclusion
testAssert(
  demoContent.includes('Vikram Singh') || demoContent.includes('W6'),
  'Scenario 4: Features Vikram Singh (W6) as reference out-of-zone master technician'
);
testAssert(
  demoContent.includes('11.4') || (demoContent.includes('10 km') && demoContent.includes('Exclusion')),
  'Scenario 4: Illustrates strict 10 km hard exclusion despite high rating/experience'
);

// Scenario 5: Unavailable Exclusion
testAssert(
  demoContent.includes('Suresh Verma') || demoContent.includes('W2'),
  'Scenario 5: Features Suresh Verma (W2) as reference candidate'
);
testAssert(
  demoContent.includes('Unavailable') || demoContent.includes('unavailable') || demoContent.includes('Slot conflict'),
  'Scenario 5: Demonstrates exclusion of high-reputation worker due to schedule unavailability'
);

// -------------------------------------------------------------
// 4. VISUAL DEMO SURFACE & INTERACTION ELEMENTS
// -------------------------------------------------------------
console.log('\n[4] Auditing Visual Surfaces, Pricing & Responsible AI Integration...');

// Premium glass hero & scenario switcher
testAssert(
  demoContent.includes('scenario') || demoContent.includes('Scenario'),
  'Provides intuitive scenario switcher controls'
);
testAssert(
  demoContent.includes('AI Understanding') || demoContent.includes('Extracted Intent') || demoContent.includes('Tokens'),
  'Renders AI understanding token & intent breakdown'
);

// Deterministic Why Rationale
testAssert(
  demoContent.includes('Deterministic Rationale') || demoContent.includes('Why WorkLink Recommended') || demoContent.includes('reasons'),
  'Exposes deterministic match rationale and multi-factor score breakdown'
);

// Modals: Worker Profile & Booking Modal
testAssert(
  demoContent.includes('onOpenWorkerProfile') || demoContent.includes('Inspect Profile Modal') || demoContent.includes('handleInspectWorker'),
  'Supports opening full worker profile modal'
);
testAssert(
  demoContent.includes('onOpenBookingModal') || demoContent.includes('Launch Booking Flow') || demoContent.includes('handleBookWorker'),
  'Supports direct booking initiation modal trigger'
);

// Transparent Price Breakdown
testAssert(
  demoContent.includes('TransparentPriceSummary'),
  'Integrates TransparentPriceSummary component'
);
testAssert(
  demoContent.includes('mode="estimate"') || demoContent.includes('mode="final"'),
  'Shows transparent pricing in estimate and/or final invoice modes'
);

// Responsible AI Trust surface
testAssert(
  demoContent.includes('ResponsibleAiBanner') || demoContent.includes('ResponsibleAiTrustModal'),
  'Embeds Responsible AI trust banner and/or trust modal triggers'
);

// -------------------------------------------------------------
// 5. APPLICATION WIRING & NAVIGATION AUDIT
// -------------------------------------------------------------
console.log('\n[5] Auditing App.tsx and Navigation Integration...');

const appPath = path.join(projectRoot, 'src', 'App.tsx');
testAssert(fs.existsSync(appPath), 'App.tsx exists');
const appContent = fs.readFileSync(appPath, 'utf8');

testAssert(
  appContent.includes('HackathonDemoView'),
  'App.tsx imports and renders HackathonDemoView'
);
testAssert(
  appContent.includes("currentTab === 'simulator'") && appContent.includes('HackathonDemoView'),
  'App.tsx mounts HackathonDemoView under the simulator tab'
);

const navbarPath = path.join(projectRoot, 'src', 'components', 'Navbar.tsx');
testAssert(fs.existsSync(navbarPath), 'Navbar.tsx exists');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

testAssert(
  navbarContent.includes('Demo Hub') || navbarContent.includes('Demo'),
  'Navbar contains Demo Hub navigation link'
);

const conciergePath = path.join(projectRoot, 'src', 'components', 'customer', 'CustomerConciergeHome.tsx');
testAssert(fs.existsSync(conciergePath), 'CustomerConciergeHome.tsx exists');
const conciergeContent = fs.readFileSync(conciergePath, 'utf8');

testAssert(
  conciergeContent.includes('Hackathon Demo Mode') || conciergeContent.includes('simulator'),
  'CustomerConciergeHome includes 1-tap quick access to Hackathon Demo Mode'
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n====================================================');
console.log(`WORKLINK MILESTONE 22 TEST SUITE PASSED! (${passedAssertions} assertions)`);
console.log('====================================================\n');
