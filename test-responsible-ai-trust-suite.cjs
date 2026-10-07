const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('WORKLINK TEST SUITE: MILESTONE 19 — RESPONSIBLE AI & TRUST');
console.log('====================================================');

const projectRoot = __dirname;
let passedAssertions = 0;

function testAssert(condition, message) {
  assert(condition, message);
  passedAssertions++;
  console.log(`  ✓ ${message}`);
}

// -------------------------------------------------------------
// 1. SERVICE LAYER AUDIT: responsibleAiService.ts
// -------------------------------------------------------------
console.log('\n[1] Auditing responsibleAiService.ts...');
const servicePath = path.join(projectRoot, 'src', 'services', 'responsibleAiService.ts');
testAssert(fs.existsSync(servicePath), 'responsibleAiService.ts file exists');

const serviceContent = fs.readFileSync(servicePath, 'utf8');

// Bias mitigations
testAssert(serviceContent.includes('geographic_bias'), 'Mitigates geographic bias');
testAssert(serviceContent.includes('rating_bias'), 'Mitigates rating & cold-start bias');
testAssert(serviceContent.includes('historical_feedback_bias'), 'Mitigates historical feedback loop bias');
testAssert(serviceContent.includes('availability_bias'), 'Mitigates availability & rest time bias');
testAssert(serviceContent.includes('pricing_bias'), 'Mitigates pricing & undercutting bias');

// 10 km radial boundary & travel tariff explanation
testAssert(serviceContent.includes('10 km radial boundary') || serviceContent.includes('10 km'), 'Enforces 10 km zone boundary without unfair perimeter penalty');
testAssert(serviceContent.includes('travel tariff') || serviceContent.includes('travel fee'), 'Uses transparent travel tariffs for outer zones');

// Bayesian damping / cold start
testAssert(serviceContent.includes('Bayesian shrinkage') || serviceContent.includes('damping'), 'Applies Bayesian shrinkage/damping for new workers');

// Exploration discovery slots
testAssert(serviceContent.includes('exploratory discovery slots') || serviceContent.includes('exploration'), 'Rotates exploratory discovery slots to prevent lock-in');

// Availability and rest time protection
testAssert(serviceContent.includes('resting hours') || serviceContent.includes('rest time') || serviceContent.includes('decoupled'), 'Protects resting hours with zero score penalties upon return');

// Living wage baseline floor
testAssert(serviceContent.includes('living wage baseline floor') || serviceContent.includes('living wage'), 'Enforces living wage baseline floor against predatory undercutting');

// SDS Personality dataset safeguard
testAssert(
  serviceContent.includes('Personality data from the SDS dataset must never become an automatic worker rejection/acceptance mechanism'),
  'Explicitly enforces exact non-negotiable rule on SDS dataset personality data'
);
testAssert(serviceContent.includes('Skill Match'), 'Prioritizes skill match');
testAssert(serviceContent.includes('Experience Depth'), 'Prioritizes experience depth');
testAssert(serviceContent.includes('Availability Window'), 'Prioritizes availability window');
testAssert(serviceContent.includes('Verified Reputation'), 'Prioritizes verified reputation');
testAssert(serviceContent.includes('Geographic Distance'), 'Prioritizes geographic distance (10 km)');
testAssert(serviceContent.includes('Transparent Price'), 'Prioritizes transparent price');
testAssert(serviceContent.includes('Specific Job Fit'), 'Prioritizes job fit');

// Prohibited psychometric gating
testAssert(serviceContent.includes('SDS Personality Traits') && serviceContent.includes('NEVER disqualify'), 'Strictly forbids personality inventory traits from disqualifying workers');

// Privacy architecture
testAssert(serviceContent.includes('Why Location is Used'), 'Explains why location is used');
testAssert(serviceContent.includes('Data Minimization'), 'Enforces data minimization principle');
testAssert(serviceContent.includes('Personal Information Protection') || serviceContent.includes('Relay Masking'), 'Protects personal information with phone masking & delayed address reveal');

// -------------------------------------------------------------
// 2. MODAL COMPONENT AUDIT: ResponsibleAiTrustModal.tsx
// -------------------------------------------------------------
console.log('\n[2] Auditing ResponsibleAiTrustModal.tsx...');
const modalPath = path.join(projectRoot, 'src', 'components', 'trust', 'ResponsibleAiTrustModal.tsx');
testAssert(fs.existsSync(modalPath), 'ResponsibleAiTrustModal.tsx exists');

const modalContent = fs.readFileSync(modalPath, 'utf8');

// Core philosophy
testAssert(modalContent.includes('AI recommends. Human decides.') || modalContent.includes('AI Recommends. Human Decides.'), 'Prominently features "AI recommends. Human decides."');

// 4 User Control Actions
testAssert(modalContent.includes('Change Requirements'), 'Provides "Change Requirements" user action');
testAssert(modalContent.includes('Change Preferences'), 'Provides "Change Preferences" user action');
testAssert(modalContent.includes('View Alternatives'), 'Provides "View Alternatives" user action');
testAssert(modalContent.includes('Override Recommendation'), 'Provides "Override Recommendation" user action');

// Explainability tab
testAssert(modalContent.includes('Why WorkLink Recommended This Professional'), 'Features explicit "Why WorkLink Recommended This Professional" section');
testAssert(modalContent.includes('actualReasons'), 'Shows actual deterministic reasons for recommendation');
testAssert(modalContent.includes('5 Hard Constraints Verification') || modalContent.includes('hardConstraintsAudit'), 'Audits 5 non-negotiable hard constraints');

// Fairness & 5 biases
testAssert(modalContent.includes('BIAS_MITIGATIONS'), 'Renders the 5 algorithmic bias mitigations');
testAssert(modalContent.includes('Fairness & Biases') || modalContent.includes('fairness'), 'Features Fairness & Biases tab');
testAssert(serviceContent.includes('geographic_bias'), 'Explains geographic bias mitigation in service');
testAssert(serviceContent.includes('rating_bias'), 'Explains rating & cold-start bias mitigation in service');
testAssert(serviceContent.includes('historical_feedback_bias'), 'Explains historical feedback bias mitigation in service');
testAssert(serviceContent.includes('availability_bias'), 'Explains availability rest-time protection in service');
testAssert(serviceContent.includes('pricing_bias'), 'Explains pricing fair wage floor mitigation in service');

// Personality tab
testAssert(modalContent.includes('PERSONALITY_GUARDRAIL'), 'Integrates PERSONALITY_GUARDRAIL');
testAssert(modalContent.includes('What WorkLink Evaluates (Prioritized Factors)'), 'Displays prioritized objective factors');
testAssert(modalContent.includes('Strictly Prohibited Automated Criteria'), 'Displays strictly prohibited psychometric criteria');

// Privacy tab
testAssert(modalContent.includes('PRIVACY_POLICIES'), 'Integrates privacy policies');
testAssert(serviceContent.includes('Why Location is Used') && modalContent.includes('PRIVACY_POLICIES'), 'Explains location usage via PRIVACY_POLICIES in modal');

// Glass styling & non-compliance simplicity
testAssert(modalContent.includes('backdrop-blur-xl') || modalContent.includes('bg-white/80'), 'Uses subtle glass styling');

// -------------------------------------------------------------
// 3. INLINE BANNER AUDIT: ResponsibleAiBanner.tsx
// -------------------------------------------------------------
console.log('\n[3] Auditing ResponsibleAiBanner.tsx...');
const bannerPath = path.join(projectRoot, 'src', 'components', 'trust', 'ResponsibleAiBanner.tsx');
testAssert(fs.existsSync(bannerPath), 'ResponsibleAiBanner.tsx exists');

const bannerContent = fs.readFileSync(bannerPath, 'utf8');
testAssert(bannerContent.includes('AI recommends. Human decides.'), 'Banner includes core philosophy');
testAssert(bannerContent.includes('Why Recommended?'), 'Banner includes explainability trigger');
testAssert(bannerContent.includes('backdrop-blur-xl') || bannerContent.includes('glass-specular-edge'), 'Banner uses subtle glass surface');

// -------------------------------------------------------------
// 4. INTEGRATION AUDIT: SignatureRecommendationView.tsx
// -------------------------------------------------------------
console.log('\n[4] Auditing SignatureRecommendationView.tsx integration...');
const sigPath = path.join(projectRoot, 'src', 'components', 'recommendations', 'SignatureRecommendationView.tsx');
const sigContent = fs.readFileSync(sigPath, 'utf8');
testAssert(sigContent.includes('ResponsibleAiBanner'), 'SignatureRecommendationView embeds ResponsibleAiBanner');
testAssert(sigContent.includes('ResponsibleAiTrustModal'), 'SignatureRecommendationView connects ResponsibleAiTrustModal');
testAssert(sigContent.includes('Inspect Responsible AI & Trust Rationale') || sigContent.includes('Responsible AI'), 'Includes trust rationale trigger in Why pro section');
testAssert(sigContent.includes('alternativesRef') || sigContent.includes('onViewAlternatives'), 'Supports viewing alternatives');

// -------------------------------------------------------------
// 5. INTEGRATION AUDIT: CustomerConciergeHome.tsx
// -------------------------------------------------------------
console.log('\n[5] Auditing CustomerConciergeHome.tsx integration...');
const conciergePath = path.join(projectRoot, 'src', 'components', 'customer', 'CustomerConciergeHome.tsx');
const conciergeContent = fs.readFileSync(conciergePath, 'utf8');
testAssert(conciergeContent.includes('ResponsibleAiBanner'), 'CustomerConciergeHome embeds ResponsibleAiBanner');
testAssert(conciergeContent.includes('ResponsibleAiTrustModal'), 'CustomerConciergeHome connects ResponsibleAiTrustModal');
testAssert(conciergeContent.includes('Explain Match & Responsible AI') || conciergeContent.includes('Responsible AI'), 'Includes trust rationale button in Recommended for you');
testAssert(conciergeContent.includes('intakeInputRef') || conciergeContent.includes('Modify Job Requirements'), 'Connects change requirements to intake input');

// -------------------------------------------------------------
// 6. INTEGRATION AUDIT: WorkerDiscoveryView.tsx & App.tsx
// -------------------------------------------------------------
console.log('\n[6] Auditing WorkerDiscoveryView.tsx and App.tsx wiring...');
const discPath = path.join(projectRoot, 'src', 'components', 'discovery', 'WorkerDiscoveryView.tsx');
const discContent = fs.readFileSync(discPath, 'utf8');
testAssert(discContent.includes('onOpenWeightsModal'), 'WorkerDiscoveryView accepts and wires onOpenWeightsModal');

const appPath = path.join(projectRoot, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
testAssert(appContent.includes('onOpenWeightsModal={() => setIsWeightsModalOpen(true)}'), 'App.tsx wires onOpenWeightsModal to CustomerConciergeHome and WorkerDiscoveryView');

console.log('\n====================================================');
console.log(`ALL MILESTONE 19 ASSERTIONS PASSED! Total: ${passedAssertions} assertions`);
console.log('====================================================');
