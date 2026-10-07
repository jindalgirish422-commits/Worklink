// Comprehensive Test Suite for WorkLink Milestone 5: Location & 10 km Service Engine

const EARTH_RADIUS_KM = 6371.0088;
const DEFAULT_SERVICE_ZONE_KM = 10.0;
const DEFAULT_FREE_ZONE_KM = 5.0;

const DEFAULT_TARIFF = {
  freeTravelDistanceKm: 5.0,
  perKmRateAboveFreeZone: 25.0,
};

function isValidCoordinates(coords) {
  if (!coords) return false;
  const { lat, lng } = coords;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

function calculateHaversineDistanceKm(coord1, coord2) {
  if (!isValidCoordinates(coord1) || !isValidCoordinates(coord2)) {
    return Infinity;
  }

  const toRad = (degree) => (degree * Math.PI) / 180;
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = EARTH_RADIUS_KM * c;

  return Math.round(rawDist * 10) / 10;
}

function isDistanceWithinServiceZone(distanceKm, maxRadiusKm = DEFAULT_SERVICE_ZONE_KM) {
  if (!isFinite(distanceKm) || distanceKm < 0) return false;
  return distanceKm <= maxRadiusKm + 1e-6;
}

function getTravelBand(distanceKm, tariff = DEFAULT_TARIFF) {
  if (!isFinite(distanceKm) || distanceKm > DEFAULT_SERVICE_ZONE_KM) {
    return {
      band: 'out_of_zone',
      isEligible: false,
      travelCharge: -1,
      label: '>10 km Cutoff',
    };
  }

  if (distanceKm <= tariff.freeTravelDistanceKm) {
    return {
      band: 'core_free',
      isEligible: true,
      travelCharge: 0,
      label: '0–5 km Core Zone',
    };
  }

  const billable = distanceKm - tariff.freeTravelDistanceKm;
  const charge = Math.round(billable * tariff.perKmRateAboveFreeZone);
  return {
    band: 'extended_slab',
    isEligible: true,
    travelCharge: charge,
    label: '5–10 km Extended Zone',
  };
}

// Test Runner
let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('WorkLink Milestone 5 Location & 10 km Engine Test Suite');
  console.log('======================================================\n');

  // Test Group 1: Coordinate Validation & Edge Cases
  console.log('TEST GROUP 1: Coordinate Validation & Malformed Inputs');
  assert(isValidCoordinates({ lat: 28.5450, lng: 77.2040 }) === true, 'Valid Delhi coordinates');
  assert(isValidCoordinates({ lat: 12.9784, lng: 77.6408 }) === true, 'Valid Bengaluru coordinates');
  assert(isValidCoordinates(null) === false, 'Null coordinates handled gracefully');
  assert(isValidCoordinates(undefined) === false, 'Undefined coordinates handled gracefully');
  assert(isValidCoordinates({ lat: NaN, lng: 77.6408 }) === false, 'NaN latitude rejected');
  assert(isValidCoordinates({ lat: 95.0, lng: 77.0 }) === false, 'Latitude > 90 rejected');
  assert(isValidCoordinates({ lat: 28.0, lng: 195.0 }) === false, 'Longitude > 180 rejected');
  assert(calculateHaversineDistanceKm({ lat: NaN, lng: 0 }, { lat: 0, lng: 0 }) === Infinity, 'Invalid coordinates yield Infinity distance');

  // Test Group 2: Haversine Distance Accuracy
  console.log('\nTEST GROUP 2: Haversine Mathematical Accuracy');
  const origin = { lat: 28.5450, lng: 77.2040 }; // Hauz Khas
  const workerW1 = { lat: 28.5360, lng: 77.2080 }; // ~1.1 - 1.2 km
  const workerW3 = { lat: 28.5520, lng: 77.2180 }; // ~1.6 km
  const workerFar = { lat: 28.6450, lng: 77.3040 }; // > 14 km

  const distW1 = calculateHaversineDistanceKm(origin, workerW1);
  assert(distW1 >= 1.0 && distW1 <= 1.5, `Haversine W1 calculated accurately: ${distW1} km`);

  const distFar = calculateHaversineDistanceKm(origin, workerFar);
  assert(distFar > 10.0, `Far candidate exceeds 10 km: ${distFar} km`);

  // Zero distance identity
  assert(calculateHaversineDistanceKm(origin, origin) === 0, 'Origin distance to itself is exactly 0.0 km');

  // Test Group 3: Non-Negotiable Boundary Enforcement (<= 10.0 km vs > 10.0 km)
  console.log('\nTEST GROUP 3: 10 km Boundary Cutoff Enforcement');
  assert(isDistanceWithinServiceZone(0.0) === true, 'Distance 0.0 km is eligible');
  assert(isDistanceWithinServiceZone(4.9) === true, 'Distance 4.9 km is eligible');
  assert(isDistanceWithinServiceZone(5.0) === true, 'Distance 5.0 km is eligible (exact 5km threshold)');
  assert(isDistanceWithinServiceZone(9.9) === true, 'Distance 9.9 km is eligible');
  assert(isDistanceWithinServiceZone(10.0) === true, 'Distance 10.0 km is strictly eligible (exact boundary)');
  assert(isDistanceWithinServiceZone(10.01) === false, 'Distance 10.01 km is strictly ineligible (boundary breach)');
  assert(isDistanceWithinServiceZone(10.1) === false, 'Distance 10.1 km is strictly ineligible');
  assert(isDistanceWithinServiceZone(13.5) === false, 'Distance 13.5 km is strictly ineligible');
  assert(isDistanceWithinServiceZone(Infinity) === false, 'Infinity distance is ineligible');

  // Test Group 4: Travel Band Tariffs & Logic
  console.log('\nTEST GROUP 4: Travel Bands (0-5 km, 5-10 km, >10 km)');
  const bandCore = getTravelBand(3.2);
  assert(bandCore.band === 'core_free', '3.2 km is core_free');
  assert(bandCore.travelCharge === 0, '3.2 km has zero travel charge (₹0)');
  assert(bandCore.isEligible === true, '3.2 km is eligible');

  const bandThreshold5 = getTravelBand(5.0);
  assert(bandThreshold5.band === 'core_free', '5.0 km is core_free threshold');
  assert(bandThreshold5.travelCharge === 0, '5.0 km carries ₹0 charge');

  const bandExtended = getTravelBand(7.0);
  assert(bandExtended.band === 'extended_slab', '7.0 km is extended_slab');
  assert(bandExtended.isEligible === true, '7.0 km is eligible');
  // (7.0 - 5.0) * 25 = 50
  assert(bandExtended.travelCharge === 50, '7.0 km has ₹50 slab charge (2 km * ₹25/km)');

  const bandBoundary10 = getTravelBand(10.0);
  assert(bandBoundary10.band === 'extended_slab', '10.0 km is eligible extended slab');
  // (10.0 - 5.0) * 25 = 125
  assert(bandBoundary10.travelCharge === 125, '10.0 km has ₹125 slab charge');

  const bandBreach = getTravelBand(10.2);
  assert(bandBreach.band === 'out_of_zone', '10.2 km is out_of_zone');
  assert(bandBreach.isEligible === false, '10.2 km is ineligible');

  // Test Group 5: Customer Movement Simulation
  console.log('\nTEST GROUP 5: Dynamic Customer Movement Recalculation');
  const mockWorkers = [
    { id: 'W1', coordinates: { lat: 28.5360, lng: 77.2080 } }, // Close to Hauz Khas
    { id: 'W6', coordinates: { lat: 28.6250, lng: 77.2950 } }, // Far from Hauz Khas (~11.4 km)
  ];

  // At Hauz Khas:
  const distW1_atHK = calculateHaversineDistanceKm(origin, mockWorkers[0].coordinates);
  const distW6_atHK = calculateHaversineDistanceKm(origin, mockWorkers[1].coordinates);
  assert(distW1_atHK <= 10.0, 'W1 is eligible at Hauz Khas');
  assert(distW6_atHK > 10.0, 'W6 is excluded at Hauz Khas (> 10 km)');

  // Move customer to East Delhi/Noida area (near W6):
  const movedOrigin = { lat: 28.6200, lng: 77.2900 };
  const distW1_moved = calculateHaversineDistanceKm(movedOrigin, mockWorkers[0].coordinates);
  const distW6_moved = calculateHaversineDistanceKm(movedOrigin, mockWorkers[1].coordinates);

  assert(distW6_moved <= 5.0, 'W6 is now in 0-5 km Core Zone after customer moved!');
  assert(distW1_moved > 10.0, 'W1 is now excluded after customer moved!');

  // Test Group 6: Worker Missing Location Edge Case
  console.log('\nTEST GROUP 6: Worker Without Location Edge Case');
  const workerMissingCoords = { id: 'W_NO_GPS', coordinates: null };
  const distMissing = calculateHaversineDistanceKm(origin, workerMissingCoords.coordinates);
  assert(isDistanceWithinServiceZone(distMissing) === false, 'Worker without GPS coordinates is strictly excluded from matching');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runTestSuite().catch(console.error);
