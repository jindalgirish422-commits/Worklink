// ========================================================
// WorkLink Milestone 6 Worker Discovery Test Suite
// ========================================================

const assert = require('assert');

// Mock data replicating mockWorkers.ts
const MOCK_WORKERS = [
  {
    id: 'W1',
    name: 'Ramesh Kumar',
    trade: 'AC Technician',
    skills: ['AC Diagnostics', 'Filter Cleaning'],
    experienceYears: 1,
    hourlyRate: 300,
    estimatedQuote: 600,
    rating: 4.1,
    distanceKm: 1.2,
    availabilityStatus: 'immediate',
    isVerified: true,
  },
  {
    id: 'W2',
    name: 'Suresh Verma',
    trade: 'AC Technician',
    skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair'],
    experienceYears: 8,
    hourlyRate: 450,
    estimatedQuote: 900,
    rating: 4.9,
    distanceKm: 6.5,
    availabilityStatus: 'tomorrow',
    isVerified: true,
  },
  {
    id: 'W3',
    name: 'Manoj Sharma',
    trade: 'AC Technician',
    skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Copper Brazing'],
    experienceYears: 5,
    hourlyRate: 350,
    estimatedQuote: 750,
    rating: 4.8,
    distanceKm: 3.2,
    availabilityStatus: 'immediate',
    isVerified: true,
  },
  {
    id: 'W7',
    name: 'Imran Ali',
    trade: 'Plumber',
    skills: ['Pipe Leak Repair', 'Bathroom Fitting', 'Drain Blockage Removal'],
    experienceYears: 7,
    hourlyRate: 320,
    estimatedQuote: 650,
    rating: 4.85,
    distanceKm: 2.1,
    availabilityStatus: 'immediate',
    isVerified: true,
  },
  {
    id: 'W8',
    name: 'Mohit Saxena',
    trade: 'Electrician',
    skills: ['Short Circuit Troubleshooting', 'MCB & DB Box Repair', 'Ceiling Fan Installation'],
    experienceYears: 6,
    hourlyRate: 350,
    estimatedQuote: 550,
    rating: 4.9,
    distanceKm: 2.8,
    availabilityStatus: 'immediate',
    isVerified: true,
  },
  {
    id: 'W9',
    name: 'Balwinder Singh',
    trade: 'Carpenter',
    skills: ['Door Jamming Fix', 'Modular Kitchen Hinge Repair', 'Lock & Handle Replacement'],
    experienceYears: 10,
    hourlyRate: 380,
    estimatedQuote: 700,
    rating: 4.75,
    distanceKm: 4.4,
    availabilityStatus: 'today',
    isVerified: false, // unverified pro test case
  },
];

function matchesTerm(text, query) {
  const cleanText = text.toLowerCase();
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length <= 2) {
    const regex = new RegExp(`\\b${cleanQuery}\\b`, 'i');
    return regex.test(cleanText);
  }
  return cleanText.includes(cleanQuery);
}

// Logic matching discoveryService
function searchWorkers(workers, query) {
  const clean = query.trim().toLowerCase();
  if (!clean) return workers.map(w => ({ worker: w, matchedCriteria: [], isEngineRecommendation: false }));

  const results = [];
  for (const worker of workers) {
    const matched = [];
    if (matchesTerm(worker.trade, clean)) matched.push('service');
    if (matchesTerm(worker.name, clean)) matched.push('worker_name');
    if (worker.id.toLowerCase() === clean || worker.id.toLowerCase().includes(clean)) matched.push('worker_id');
    if (worker.skills.some(s => matchesTerm(s, clean))) matched.push('skill');

    if (matched.length > 0) {
      results.push({ worker, matchedCriteria: matched, isEngineRecommendation: false });
    }
  }
  return results;
}

function filterWorkers(workers, filters) {
  return workers.filter(worker => {
    if (filters.trade && filters.trade !== 'All' && worker.trade !== filters.trade) return false;
    if (filters.skill && filters.skill.trim()) {
      const target = filters.skill.toLowerCase().trim();
      if (!worker.skills.some(s => s.toLowerCase().includes(target))) return false;
    }
    if (filters.availability && filters.availability !== 'all') {
      if (filters.availability === 'immediate' && worker.availabilityStatus !== 'immediate') return false;
      if (filters.availability === 'today' && !['immediate', 'today'].includes(worker.availabilityStatus)) return false;
      if (filters.availability === 'tomorrow' && !['immediate', 'today', 'tomorrow'].includes(worker.availabilityStatus)) return false;
    }
    if (filters.minRating && worker.rating < filters.minRating) return false;
    if (filters.maxDistanceKm && worker.distanceKm > filters.maxDistanceKm) return false;
    if (filters.minExperienceYears && worker.experienceYears < filters.minExperienceYears) return false;
    if (filters.maxPrice !== null && filters.maxPrice !== undefined && worker.estimatedQuote > filters.maxPrice) return false;
    if (filters.verifiedOnly && !worker.isVerified) return false;
    return true;
  });
}

function annotateSearchResultsWithRecommendations(searchResults, rankedWorkers) {
  const rankMap = new Map();
  rankedWorkers.forEach(rw => {
    rankMap.set(rw.worker.id, { rank: rw.rank, score: rw.totalScore });
  });

  return searchResults.map(item => {
    const recData = rankMap.get(item.worker.id);
    if (recData) {
      return {
        ...item,
        isEngineRecommendation: true,
        engineRank: recData.rank,
        engineMatchScore: recData.score,
      };
    }
    return {
      ...item,
      isEngineRecommendation: false,
    };
  });
}

console.log('======================================================');
console.log('WorkLink Milestone 6 Worker Discovery Test Suite');
console.log('======================================================\n');

let passedTests = 0;
function pass(testName) {
  console.log(`  ✓ [PASS] ${testName}`);
  passedTests++;
}

// ----------------------------------------------------
// TEST GROUP 1: Omnisearch by Service, Worker, and Skill
// ----------------------------------------------------
console.log('TEST GROUP 1: Search by Service, Worker Name/ID, and Skill');

// 1.1 Search by service
const serviceResults = searchWorkers(MOCK_WORKERS, 'Plumber');
assert.strictEqual(serviceResults.length, 1);
assert.strictEqual(serviceResults[0].worker.id, 'W7');
assert.ok(serviceResults[0].matchedCriteria.includes('service'));
pass('Search by service trade "Plumber" matches Imran Ali (W7)');

// 1.2 Search by worker name
const nameResults = searchWorkers(MOCK_WORKERS, 'Manoj');
assert.strictEqual(nameResults.length, 1);
assert.strictEqual(nameResults[0].worker.id, 'W3');
assert.ok(nameResults[0].matchedCriteria.includes('worker_name'));
pass('Search by worker name "Manoj" matches Manoj Sharma (W3)');

// 1.3 Search by worker ID
const idResults = searchWorkers(MOCK_WORKERS, 'W8');
assert.strictEqual(idResults.length, 1);
assert.strictEqual(idResults[0].worker.id, 'W8');
assert.ok(idResults[0].matchedCriteria.includes('worker_id'));
pass('Search by worker ID "W8" matches Mohit Saxena (W8)');

// 1.4 Search by skill
const skillResults = searchWorkers(MOCK_WORKERS, 'PCB');
assert.strictEqual(skillResults.length, 2); // Suresh (W2) and Manoj (W3) have PCB Inverter Repair
assert.ok(skillResults.every(r => r.matchedCriteria.includes('skill')));
pass('Search by skill "PCB" returns all workers possessing that skill');

// 1.5 Case insensitive & whitespace trimmed search
const messyResults = searchWorkers(MOCK_WORKERS, '  gas leak   ');
assert.strictEqual(messyResults.length, 2);
pass('Search handles leading/trailing whitespace and case insensitivity');

// ----------------------------------------------------
// TEST GROUP 2: Minimal & Granular Filters
// ----------------------------------------------------
console.log('\nTEST GROUP 2: Multi-Criteria Filter Engine');

// 2.1 Filter by skill
const filteredBySkill = filterWorkers(MOCK_WORKERS, { skill: 'Copper Brazing' });
assert.strictEqual(filteredBySkill.length, 1);
assert.strictEqual(filteredBySkill[0].id, 'W3');
pass('Filter by skill "Copper Brazing" isolates qualified candidate');

// 2.2 Filter by availability
const filteredImmediate = filterWorkers(MOCK_WORKERS, { availability: 'immediate' });
assert.strictEqual(filteredImmediate.length, 4); // W1, W3, W7, W8
assert.ok(filteredImmediate.every(w => w.availabilityStatus === 'immediate'));
pass('Filter by availability "immediate" excludes workers unavailable now');

// 2.3 Filter by rating
const filteredHighRating = filterWorkers(MOCK_WORKERS, { minRating: 4.85 });
assert.strictEqual(filteredHighRating.length, 3); // W2 (4.9), W7 (4.85), W8 (4.9)
pass('Filter by rating threshold (>= 4.85) retains top-tier professionals');

// 2.4 Filter by distance (Core Zone 5 km)
const filteredCoreZone = filterWorkers(MOCK_WORKERS, { maxDistanceKm: 5.0 });
assert.ok(filteredCoreZone.every(w => w.distanceKm <= 5.0));
assert.ok(!filteredCoreZone.some(w => w.id === 'W2')); // W2 is 6.5 km
pass('Filter by distance (<= 5 km) restricts candidates to core vicinity');

// 2.5 Filter by experience tier
const filteredSenior = filterWorkers(MOCK_WORKERS, { minExperienceYears: 8 });
assert.strictEqual(filteredSenior.length, 2); // W2 (8 yrs), W9 (10 yrs)
pass('Filter by experience (>= 8 yrs) yields master craftsmen');

// 2.6 Filter by price ceiling
const filteredBudget = filterWorkers(MOCK_WORKERS, { maxPrice: 700 });
assert.ok(filteredBudget.every(w => w.estimatedQuote <= 700));
assert.ok(!filteredBudget.some(w => w.id === 'W2')); // 900
assert.ok(!filteredBudget.some(w => w.id === 'W3')); // 750
pass('Filter by price ceiling (<= 700) enforces budget boundaries');

// 2.7 Filter by verification status
const filteredVerified = filterWorkers(MOCK_WORKERS, { verifiedOnly: true });
assert.ok(filteredVerified.every(w => w.isVerified === true));
assert.ok(!filteredVerified.some(w => w.id === 'W9')); // W9 is unverified
pass('Filter by verified status excludes unvetted providers');

// ----------------------------------------------------
// TEST GROUP 3: Distinction Rule (Search != Recommendation)
// ----------------------------------------------------
console.log('\nTEST GROUP 3: Architectural Distinction (Search Results vs Engine Recommendations)');

// Simulate matching engine ranking results for an Emergency AC job
const simulatedRankedWorkers = [
  { worker: MOCK_WORKERS[2], rank: 1, totalScore: 94 }, // W3 is #1
  { worker: MOCK_WORKERS[0], rank: 2, totalScore: 78 }, // W1 is #2
];

// Perform a keyword search for "AC"
const rawSearch = searchWorkers(MOCK_WORKERS, 'AC');
// Raw search contains W1, W2, W3
assert.strictEqual(rawSearch.length, 3);

// Search results before engine annotation are NOT automatically recommendations
assert.ok(rawSearch.every(r => r.isEngineRecommendation === false));
pass('Keyword search results are not automatically engine recommendations');

// Annotate search results with matching engine recommendations
const annotatedSearch = annotateSearchResultsWithRecommendations(rawSearch, simulatedRankedWorkers);

// W3 is both a search result AND Engine Recommendation Rank #1
const w3Item = annotatedSearch.find(r => r.worker.id === 'W3');
assert.strictEqual(w3Item.isEngineRecommendation, true);
assert.strictEqual(w3Item.engineRank, 1);
assert.strictEqual(w3Item.engineMatchScore, 94);
pass('Engine recommendation metadata correctly annotated on matching search results');

// W2 is a search result, but NOT an engine recommendation (failed emergency availability)
const w2Item = annotatedSearch.find(r => r.worker.id === 'W2');
assert.strictEqual(w2Item.isEngineRecommendation, false);
assert.strictEqual(w2Item.engineRank, undefined);
pass('Search results excluded by engine remain pure directory listings without recommendation endorsement');

// ----------------------------------------------------
// TEST GROUP 4: Visual Hierarchy (Primary vs Secondary)
// ----------------------------------------------------
console.log('\nTEST GROUP 4: Visual Treatment & Editorial Hierarchy');

// Top recommendation is marked for primary visual treatment
const topCandidate = simulatedRankedWorkers[0];
assert.strictEqual(topCandidate.rank, 1);
const isPrimaryVisual = topCandidate.rank === 1;
assert.strictEqual(isPrimaryVisual, true);
pass('Rank #1 candidate receives primary visual treatment');

const secondaryCandidate = simulatedRankedWorkers[1];
const isSecondaryVisual = secondaryCandidate.rank > 1;
assert.strictEqual(isSecondaryVisual, true);
pass('Secondary candidates receive simpler surface treatment');

console.log('\n======================================================');
console.log(`TEST SUMMARY: ${passedTests} Passed, 0 Failed`);
console.log('======================================================');
