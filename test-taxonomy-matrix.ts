import { classifyServiceRequest } from './src/services/taxonomyService.ts';

const testMatrix = [
  { query: 'tap leaking', expected: 'PLUMBING' },
  { query: 'pipe burst', expected: 'PLUMBING' },
  { query: 'sink blocked', expected: 'PLUMBING' },
  { query: 'switch sparking', expected: 'ELECTRICAL' },
  { query: 'MCB keeps tripping', expected: 'ELECTRICAL' },
  { query: 'fan not working', expected: 'ELECTRICAL' },
  { query: 'AC not cooling', expected: 'AC_REPAIR' },
  { query: 'AC leaking water', expected: 'AC_REPAIR' },
  { query: 'fridge not cooling', expected: 'APPLIANCE_REPAIR' },
  { query: 'washing machine not spinning', expected: 'APPLIANCE_REPAIR' },
  { query: 'microwave not heating', expected: 'APPLIANCE_REPAIR' },
  { query: 'wardrobe broken', expected: 'CARPENTRY' },
  { query: 'door hinge broken', expected: 'CARPENTRY' },
  { query: 'paint my room', expected: 'PAINTING' },
  { query: 'wall needs repainting', expected: 'PAINTING' },
  { query: "car won't start", expected: 'AUTOMOTIVE' },
  { query: 'bike puncture', expected: 'AUTOMOTIVE' },
  { query: 'door lock broken', expected: 'LOCKSMITH' },
  { query: 'wifi not working', expected: 'NETWORKING' },
  { query: 'deep clean my house', expected: 'CLEANING' },
  { query: 'broken tiles', expected: 'MASONRY' },
  { query: 'garden maintenance', expected: 'GARDENING' },
  { query: 'assemble my wardrobe', expected: 'FURNITURE_ASSEMBLY' },
];

console.log('\n=== TESTING SEARCH CATEGORY TEST MATRIX (Part 16) ===\n');

let pass = 0;
let fail = 0;

for (const test of testMatrix) {
  const result = classifyServiceRequest(test.query);
  const ok = result.taxonomyCategory === test.expected;
  if (ok) {
    pass++;
    console.log(`✓ [PASS] "${test.query}" → ${result.taxonomyCategory} (${result.serviceCategory}) [Conf: ${result.confidenceScore}]`);
  } else {
    fail++;
    console.error(`✗ [FAIL] "${test.query}" → got ${result.taxonomyCategory}, expected ${test.expected}`);
  }
}

console.log(`\nResults: ${pass} Passed, ${fail} Failed out of ${testMatrix.length}\n`);
