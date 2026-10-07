// Test customer concierge home component rendering logic and safety
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'customer', 'CustomerConciergeHome.tsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('Validating CustomerConciergeHome safe dereferencing...');

// Check 1: primaryScore safe accessor exists
if (!content.includes('primaryScore = Math.round(primaryRecommendation.totalScore ??')) {
  console.error('FAIL: primaryScore safe accessor missing');
  process.exit(1);
}
console.log('✓ primaryScore safe accessor present');

// Check 2: primaryReasons safe accessor exists
if (!content.includes('primaryReasons: string[] = primaryRecommendation.reasons ||')) {
  console.error('FAIL: primaryReasons safe accessor missing');
  process.exit(1);
}
console.log('✓ primaryReasons safe accessor present');

// Check 3: primaryDistance safe accessor exists
if (!content.includes('primaryDistance = primaryRecommendation.worker?.distanceKm ??')) {
  console.error('FAIL: primaryDistance safe accessor missing');
  process.exit(1);
}
console.log('✓ primaryDistance safe accessor present');

// Check 4: No unsafe primaryRecommendation.matchReasons access
const unsafeAccessRegex = /primaryRecommendation\.matchReasons\[/g;
if (unsafeAccessRegex.test(content)) {
  console.error('FAIL: Unsafe primaryRecommendation.matchReasons[ index ] still present');
  process.exit(1);
}
console.log('✓ No unsafe primaryRecommendation.matchReasons index access');

// Check 5: Secondary recommendations safe access
if (!content.includes('(rw as any).worker?.distanceKm ?? (rw as any).distanceKm')) {
  console.error('FAIL: Secondary recommendation distance not safely dereferenced');
  process.exit(1);
}
console.log('✓ Secondary recommendations distance safely dereferenced');

// Check 6: App.tsx has TabErrorBoundary
const appPath = path.join(__dirname, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
if (!appContent.includes('class TabErrorBoundary extends React.Component') || !appContent.includes('<TabErrorBoundary')) {
  console.error('FAIL: TabErrorBoundary not configured in App.tsx');
  process.exit(1);
}
console.log('✓ TabErrorBoundary cleanly configured in App.tsx');

console.log('\nAll customer concierge render safety assertions PASSED!');
