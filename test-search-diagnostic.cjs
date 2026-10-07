/**
 * WORKLINK SEARCH DIAGNOSTIC — REAL DATA
 * Uses actual skills and trades from mockWorkers.ts
 */

function matchesTerm(text, query) {
  const cleanText = text.toLowerCase();
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery.length <= 2) {
    const regex = new RegExp(`\\b${cleanQuery}\\b`, 'i');
    return regex.test(cleanText);
  }
  return cleanText.includes(cleanQuery);
}

function searchWorkers(workers, query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return workers.map((w) => ({ worker: w, matchedCriteria: [] }));

  const results = [];
  for (const worker of workers) {
    const matchedCriteria = [];
    if (matchesTerm(worker.trade, cleanQuery)) matchedCriteria.push('service');
    if (matchesTerm(worker.name, cleanQuery)) matchedCriteria.push('worker_name');
    if (worker.id.toLowerCase() === cleanQuery || worker.id.toLowerCase().includes(cleanQuery)) matchedCriteria.push('worker_id');
    const hasMatchingSkill = worker.skills.some((s) => matchesTerm(s, cleanQuery));
    if (hasMatchingSkill) matchedCriteria.push('skill');
    if (matchedCriteria.length > 0) results.push({ worker, matchedCriteria });
  }
  return results;
}

// Real worker data from mockWorkers.ts
const workers = [
  { id: 'W1', name: 'Ramesh Kumar', trade: 'AC Technician', skills: ['AC Diagnostics', 'Filter Cleaning'], distanceKm: 1.2 },
  { id: 'W2', name: 'Suresh Verma', trade: 'AC Technician', skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Compressor Overhaul'], distanceKm: 9.1 },
  { id: 'W3', name: 'Manoj Singh', trade: 'AC Technician', skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Copper Brazing'], distanceKm: 3.8 },
  { id: 'W4', name: 'Deepak Nair', trade: 'AC Technician', skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair'], distanceKm: 5.2 },
  { id: 'W5', name: 'Arun Menon', trade: 'AC Technician', skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Ductless Split Systems'], distanceKm: 7.3 },
  { id: 'W6', name: 'Vikram Bose', trade: 'AC Technician', skills: ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Heavy Chillers'], distanceKm: 12.5 },
  { id: 'W7', name: 'Rajan Pillai', trade: 'Plumber', skills: ['Pipe Leak Repair', 'Bathroom Fitting', 'Drain Blockage Removal', 'Water Motor Installation'], distanceKm: 4.1 },
  { id: 'W8', name: 'Hari Krishnan', trade: 'Electrician', skills: ['Short Circuit Troubleshooting', 'MCB & DB Box Repair', 'Ceiling Fan Installation', 'House Rewiring'], distanceKm: 6.2 },
  { id: 'W9', name: 'Sanjay Joshi', trade: 'Carpenter', skills: ['Door Jamming Fix', 'Modular Kitchen Hinge Repair', 'Lock & Handle Replacement', 'Custom Wood Work'], distanceKm: 5.9 },
  { id: 'W10', name: 'Pradeep Kumar', trade: 'Painter', skills: ['Dampness Water-proofing', 'Wall Touch-up & Putty', 'Texture Painting', 'Ceiling Stain Removal'], distanceKm: 8.4 },
  { id: 'W11', name: 'Raju Tiwari', trade: 'Appliance Repair', skills: ['Washing Machine Drum Fault', 'Microwave Magnetron Repair', 'Refrigerator Cooling Repair'], distanceKm: 4.5 },
  { id: 'W12', name: 'Mohit Sharma', trade: 'Cleaning Professional', skills: ['Deep Home Cleaning', 'Kitchen Degreasing', 'Sofa Shampooing', 'Sanitization'], distanceKm: 7.0 },
];

const testQueries = [
  { q: 'plumber', expect: 'Rajan Pillai' },
  { q: 'electrician', expect: 'Hari Krishnan' },
  { q: 'AC repair', expect: null },           // 'AC repair' not in skills — 'AC Diagnostics' is
  { q: 'AC diagnostics', expect: 'Ramesh Kumar' },
  { q: 'carpenter', expect: 'Sanjay Joshi' },
  { q: 'painter', expect: 'Pradeep Kumar' },
  { q: 'washing machine', expect: 'Raju Tiwari' },  // partial match of 'Washing Machine Drum Fault'
  { q: 'mechanic', expect: null },
  { q: 'AC technician near me', expect: null },
  { q: 'My AC is not cooling', expect: null },
  { q: 'AC', expect: 'Ramesh Kumar' },
  { q: 'Manoj', expect: 'Manoj Singh' },
  { q: 'Copper Brazing', expect: 'Manoj Singh' },
  { q: 'PCB', expect: 'Suresh Verma' },
  { q: 'Cleaning', expect: 'Mohit Sharma' },
  { q: 'wiring', expect: 'Hari Krishnan' },
  { q: 'pipe', expect: 'Rajan Pillai' },
  { q: 'drain', expect: 'Rajan Pillai' },
  { q: 'refrigerator', expect: 'Raju Tiwari' },
];

console.log('\n=== WORKLINK SEARCH DIAGNOSTIC — REAL DATA ===\n');
let found = 0, notFound = 0;
for (const { q, expect } of testQueries) {
  const results = searchWorkers(workers, q);
  const status = results.length > 0 ? '✅' : '❌';
  if (results.length > 0) found++; else notFound++;
  console.log(`"${q}" → ${status} ${results.length} result(s)`);
  if (results.length > 0) results.forEach((r) => console.log(`   ${r.worker.name} [${r.matchedCriteria.join(',')}]`));
}
console.log(`\n${found} found / ${notFound} zero-result / ${testQueries.length} total\n`);

// KEY FINDING: natural-language queries like "My AC is not cooling" won't match anything.
// The fix is to add a natural-language keyword extraction step.
console.log('=== NATURAL LANGUAGE PARSING ANALYSIS ===');
const nlQueries = ['My AC is not cooling', 'AC technician near me', 'wiring issue'];
const tradeKeywords = {
  'ac': ['AC Technician', 'AC Diagnostics'],
  'cooling': ['AC Technician'],
  'plumb': ['Plumber'],
  'pipe': ['Plumber'],
  'drain': ['Plumber'],
  'electr': ['Electrician'],
  'wiring': ['Electrician'],
  'circuit': ['Electrician'],
  'carpent': ['Carpenter'],
  'wood': ['Carpenter'],
  'paint': ['Painter'],
  'wash': ['Appliance Repair'],
  'fridge': ['Appliance Repair'],
  'refriger': ['Appliance Repair'],
  'clean': ['Cleaning Professional'],
};
for (const q of nlQueries) {
  const words = q.toLowerCase().split(/\s+/);
  const matchedTrades = new Set();
  for (const word of words) {
    for (const [kw, trades] of Object.entries(tradeKeywords)) {
      if (word.includes(kw)) trades.forEach((t) => matchedTrades.add(t));
    }
  }
  console.log(`"${q}" → extracted trades: [${[...matchedTrades].join(', ')}]`);
}
