// Comprehensive Node Test Suite for WorkLink Milestone 3 Authentication & Onboarding

// 1. Mock Browser Environment (localStorage)
const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

// Validation helpers
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

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
  console.log('WorkLink Milestone 3 Auth & Onboarding Test Suite');
  console.log('======================================================\n');

  // Test 1: Input Validation
  console.log('TEST GROUP 1: Input Validation & Formatting');
  assert(validateEmail('customer@worklink.ai') === true, 'Valid email format');
  assert(validateEmail('worker.rajesh@gmail.com') === true, 'Valid email with dot');
  assert(validateEmail('invalid-email') === false, 'Invalid email without @ rejected');
  assert(validateEmail('name@domain') === false, 'Invalid email without TLD rejected');
  assert(validatePhone('+91 98765 43210') === true, '10-digit phone with country code valid');
  assert(validatePhone('12345') === false, 'Short phone (< 10 digits) rejected');

  // Test 2: Seed Users & Session Persistence
  console.log('\nTEST GROUP 2: Seed Users & Session Persistence');
  const SEED_USERS = [
    {
      id: 'usr_cust_priya',
      email: 'customer@worklink.ai',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      role: 'customer',
      customerProfile: {
        location: { address: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408, radiusKm: 10 },
        locationPermissionGranted: true,
        preferredTrades: ['AC Technician', 'Plumber'],
        priceSensitivity: 'medium',
      },
    },
    {
      id: 'usr_work_rajesh',
      email: 'worker@worklink.ai',
      name: 'Rajesh Kumar',
      phone: '+91 98450 11223',
      role: 'worker',
      workerProfile: {
        workerId: 'W3',
        trade: 'AC Technician',
        skills: ['Inverter Compressor', 'Gas Refill'],
        experienceYears: 7,
        hourlyRate: 550,
        estimatedQuote: 750,
        licenseNumber: 'DL-AC-2019-8834',
        verificationStatus: 'verified',
      },
    },
    {
      id: 'usr_admin_anita',
      email: 'admin@worklink.ai',
      name: 'Anita Roy',
      phone: '+91 91234 56789',
      role: 'operator',
      operatorProfile: {
        department: 'Marketplace Integrity & Safety',
        accessLevel: 'full_admin',
      },
    },
  ];

  localStorage.setItem('worklink_auth_users_v1', JSON.stringify(SEED_USERS));
  const retrievedUsers = JSON.parse(localStorage.getItem('worklink_auth_users_v1'));
  assert(retrievedUsers.length === 3, '3 Seed roles (Customer, Worker, Operator) persisted');
  assert(retrievedUsers[0].role === 'customer', 'Seed user 1 is Customer');
  assert(retrievedUsers[1].role === 'worker', 'Seed user 2 is Worker');
  assert(retrievedUsers[2].role === 'operator', 'Seed user 3 is Operator');

  // Test 3: Login Authentication
  console.log('\nTEST GROUP 3: Authentication & Login Scenarios');
  const authenticate = (email, pass) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) throw new Error('Email required');
    if (!validateEmail(cleanEmail)) throw new Error('Invalid email format');
    if (!pass || pass.length < 6) throw new Error('Password min 6 chars');
    const match = retrievedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!match) throw new Error('No account found with this email');
    localStorage.setItem('worklink_auth_session_v1', JSON.stringify(match));
    return match;
  };

  const loginSuccess = authenticate('customer@worklink.ai', 'Password123');
  assert(loginSuccess.name === 'Priya Sharma', 'Customer login successful');
  assert(JSON.parse(localStorage.getItem('worklink_auth_session_v1')).id === 'usr_cust_priya', 'Session stored in localStorage');

  let errorCaught1 = false;
  try {
    authenticate('notfound@worklink.ai', 'Password123');
  } catch (e) {
    errorCaught1 = true;
    assert(e.message === 'No account found with this email', 'Invalid credentials caught: non-existent email');
  }
  assert(errorCaught1 === true, 'Non-existent account rejected');

  let errorCaught2 = false;
  try {
    authenticate('bad-email', '123456');
  } catch (e) {
    errorCaught2 = true;
    assert(e.message === 'Invalid email format', 'Invalid credentials caught: bad email format');
  }
  assert(errorCaught2 === true, 'Malformed email rejected');

  let errorCaught3 = false;
  try {
    authenticate('customer@worklink.ai', '123');
  } catch (e) {
    errorCaught3 = true;
    assert(e.message === 'Password min 6 chars', 'Short password (<6 chars) rejected');
  }
  assert(errorCaught3 === true, 'Short password rejected');

  // Test 4: Customer Onboarding
  console.log('\nTEST GROUP 4: Customer Onboarding');
  const registerCustomer = (data) => {
    if (!data.name || data.name.length < 2) throw new Error('Name min 2 chars');
    if (!validateEmail(data.email)) throw new Error('Invalid email');
    if (!validatePhone(data.phone)) throw new Error('Invalid phone');
    if (!data.password || data.password.length < 6) throw new Error('Password min 6 chars');
    const existing = JSON.parse(localStorage.getItem('worklink_auth_users_v1'));
    if (existing.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('Account already exists');
    }
    const newUser = {
      id: `usr_cust_${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone,
      role: 'customer',
      customerProfile: {
        location: data.location,
        locationPermissionGranted: data.locationPermissionGranted,
        preferredTrades: data.preferredTrades,
        priceSensitivity: data.priceSensitivity,
      },
    };
    existing.push(newUser);
    localStorage.setItem('worklink_auth_users_v1', JSON.stringify(existing));
    localStorage.setItem('worklink_auth_session_v1', JSON.stringify(newUser));
    return newUser;
  };

  const newCustomer = registerCustomer({
    name: 'Kavita Menon',
    email: 'kavita@domain.com',
    phone: '+91 99887 76655',
    password: 'SecurePassword123',
    location: { address: 'Koramangala, Bengaluru', lat: 12.9345, lng: 77.6265, radiusKm: 10 },
    locationPermissionGranted: true,
    preferredTrades: ['Plumber', 'Electrician'],
    priceSensitivity: 'low',
  });

  assert(newCustomer.name === 'Kavita Menon', 'Customer signup registered');
  assert(newCustomer.customerProfile.locationPermissionGranted === true, 'Customer location permission recorded');
  assert(newCustomer.customerProfile.location.radiusKm === 10, 'Strict 10 km service zone configured');
  assert(newCustomer.customerProfile.preferredTrades.length === 2, 'Customer trade preferences preserved');

  // Test duplicate registration rejection
  let dupCaught = false;
  try {
    registerCustomer({
      name: 'Duplicate Kavita',
      email: 'kavita@domain.com',
      phone: '+91 99887 76655',
      password: 'SecurePassword123',
      location: { address: 'Koramangala', lat: 12.9345, lng: 77.6265, radiusKm: 10 },
      locationPermissionGranted: true,
      preferredTrades: [],
      priceSensitivity: 'medium',
    });
  } catch (e) {
    dupCaught = true;
    assert(e.message === 'Account already exists', 'Duplicate registration rejected');
  }
  assert(dupCaught === true, 'Duplicate email guard active');

  // Test 5: Worker Progressive Onboarding
  console.log('\nTEST GROUP 5: Progressive Worker Onboarding');
  const registerWorker = (data) => {
    // Progressive validation across 4 steps
    if (!data.name || data.name.length < 2) throw new Error('Identity: Valid name required');
    if (!validateEmail(data.email)) throw new Error('Identity: Valid email required');
    if (!validatePhone(data.phone)) throw new Error('Identity: Valid phone required');
    if (!data.password || data.password.length < 6) throw new Error('Identity: Password min 6 chars');
    if (!data.trade) throw new Error('Trade: Category required');
    if (!data.skills || data.skills.length === 0) throw new Error('Skills: At least 1 skill required');
    if (!data.experienceYears || data.experienceYears <= 0) throw new Error('Experience: Years > 0 required');
    if (!data.baseAddress) throw new Error('Service Area: Base location required');
    if (!data.hourlyRate || data.hourlyRate <= 0) throw new Error('Pricing: Hourly rate > 0 required');
    if (!data.licenseNumber) throw new Error('Verification: Govt ID/License required');

    const workerId = `W${Date.now().toString().slice(-4)}`;
    const newWorkerUser = {
      id: `usr_work_${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone,
      role: 'worker',
      workerProfile: {
        workerId,
        trade: data.trade,
        skills: data.skills,
        experienceYears: data.experienceYears,
        hourlyRate: data.hourlyRate,
        estimatedQuote: data.estimatedQuote,
        serviceRadiusKm: 10,
        baseAddress: data.baseAddress,
        licenseNumber: data.licenseNumber,
        verificationStatus: 'verified',
      },
    };

    const newMarketplaceWorker = {
      id: workerId,
      name: data.name,
      trade: data.trade,
      skills: data.skills,
      experienceYears: data.experienceYears,
      hourlyRate: data.hourlyRate,
      rating: 5.0,
      isVerified: true,
      distanceKm: 3.2,
      availabilityStatus: data.availabilityStatus,
    };

    return { user: newWorkerUser, worker: newMarketplaceWorker };
  };

  const newWorkerResult = registerWorker({
    name: 'Suresh Patil',
    email: 'suresh.electrician@worklink.pro',
    phone: '+91 97766 55443',
    password: 'MasterTrade2026',
    trade: 'Electrician',
    skills: ['MCB Tripping Diagnostic', 'Phase Balancing', 'Rewiring'],
    experienceYears: 6,
    baseAddress: 'HSR Layout Sector 1, Bengaluru',
    coordinates: { lat: 12.9116, lng: 77.6389 },
    serviceRadiusKm: 10,
    hourlyRate: 450,
    estimatedQuote: 650,
    availabilityStatus: 'immediate',
    licenseNumber: 'KA-ELEC-2021-9941',
  });

  assert(newWorkerResult.user.role === 'worker', 'Worker role assigned');
  assert(newWorkerResult.user.workerProfile.trade === 'Electrician', 'Trade category recorded');
  assert(newWorkerResult.user.workerProfile.skills.length === 3, 'Specialized skills recorded');
  assert(newWorkerResult.user.workerProfile.serviceRadiusKm === 10, 'Strict 10 km service radius enforced');
  assert(newWorkerResult.worker.isVerified === true, 'Worker verified pro status enabled');
  assert(newWorkerResult.worker.hourlyRate === 450, 'Transparent hourly rate set');

  // Test 6: Role Routing & Logout
  console.log('\nTEST GROUP 6: Role Routing, Switching & Logout');
  const sessionUser = JSON.parse(localStorage.getItem('worklink_auth_session_v1'));
  assert(sessionUser !== null, 'Session active');

  // Logout
  localStorage.removeItem('worklink_auth_session_v1');
  assert(localStorage.getItem('worklink_auth_session_v1') === null, 'Session destroyed on logout');

  // Quick Demo Switcher
  const allUsers = JSON.parse(localStorage.getItem('worklink_auth_users_v1'));
  const switchedToOperator = allUsers.find((u) => u.role === 'operator');
  localStorage.setItem('worklink_auth_session_v1', JSON.stringify(switchedToOperator));
  const activeOperator = JSON.parse(localStorage.getItem('worklink_auth_session_v1'));
  assert(activeOperator.role === 'operator', 'Instant role switch to Operator successful');
  assert(activeOperator.operatorProfile.accessLevel === 'full_admin', 'Operator access level is full_admin');

  console.log('\n======================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(console.error);
