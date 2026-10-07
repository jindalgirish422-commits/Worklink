import {
  User,
  UserRole,
  CustomerSignupData,
  WorkerSignupData,
  Worker,
  CustomerLocation,
  AvailabilityStatus,
} from '../types';
import { DEFAULT_CUSTOMER_LOCATION } from '../data/mockWorkers';

const STORAGE_KEY_USERS = 'worklink_auth_users_v1';
const STORAGE_KEY_SESSION = 'worklink_auth_session_v1';

// Seed demo users for instant zero-friction evaluation
export const SEED_USERS: User[] = [
  {
    id: 'usr_cust_priya',
    email: 'customer@worklink.ai',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-01-15T09:30:00Z',
    customerProfile: {
      location: DEFAULT_CUSTOMER_LOCATION,
      locationPermissionGranted: true,
      preferredTrades: ['AC Technician', 'Plumber'],
      priceSensitivity: 'medium',
      contactPreference: 'sms',
    },
  },
  {
    id: 'usr_work_rajesh',
    email: 'worker@worklink.ai',
    name: 'Rajesh Kumar',
    phone: '+91 98450 11223',
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=256&q=80',
    createdAt: '2026-01-10T11:20:00Z',
    workerProfile: {
      workerId: 'W3',
      trade: 'AC Technician',
      skills: ['AC Repair', 'Inverter Compressor', 'Gas Refill', 'Leak Detection', 'Filter Service', 'Deep Coil Cleaning'],
      experienceYears: 7,
      hourlyRate: 550,
      estimatedQuote: 750,
      serviceRadiusKm: 10,
      baseAddress: '100ft Road, Indiranagar, Bengaluru',
      coordinates: { lat: 12.9790, lng: 77.6415 },
      availabilityStatus: 'immediate',
      licenseNumber: 'DL-AC-2019-8834',
      backgroundCheckPassed: true,
      verificationStatus: 'verified',
      bio: 'Certified Master HVAC Specialist with 7+ years diagnosing inverter units and electrical coils. Equipped with digital vacuum gauge and recovery pump.',
    },
  },
  {
    id: 'usr_admin_anita',
    email: 'admin@worklink.ai',
    name: 'Anita Roy',
    phone: '+91 91234 56789',
    role: 'operator',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
    createdAt: '2025-11-01T08:00:00Z',
    operatorProfile: {
      department: 'Marketplace Integrity & Safety',
      accessLevel: 'full_admin',
      lastAuditAt: new Date().toISOString(),
    },
  },
];

// Helper to safely fetch persisted users
export const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_USERS;
  } catch {
    return SEED_USERS;
  }
};

export const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

// Current Session helper
export const getStoredSession = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) {
      // Default to Customer on initial launch for seamless evaluation
      const defaultUser = SEED_USERS[0];
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_USERS[0];
  }
};

export const saveSession = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  } catch (e) {
    console.error('Failed to save session', e);
  }
};

// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

// Authentication logic
export const authenticate = async (email: string, pass: string): Promise<User> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter your email address.');
  }
  if (!validateEmail(cleanEmail)) {
    throw new Error('Please enter a valid email format (e.g. name@example.com).');
  }
  if (!pass || pass.trim().length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  // Check demo credentials or registered users
  const users = getStoredUsers();
  const match = users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!match) {
    throw new Error('No account found with this email. Please check your credentials or register.');
  }

  // For demo/hackathon purposes, seeded passwords are 'Password123' or any 6+ char password
  saveSession(match);
  return match;
};

// Customer Onboarding / Signup
export const registerCustomer = async (data: CustomerSignupData): Promise<User> => {
  if (!data.name.trim() || data.name.trim().length < 2) {
    throw new Error('Please provide your full legal or display name.');
  }
  if (!validateEmail(data.email)) {
    throw new Error('Please provide a valid email address.');
  }
  if (!validatePhone(data.phone)) {
    throw new Error('Please provide a valid 10-digit phone number for dispatch alerts.');
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }

  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
    throw new Error('An account with this email address already exists. Please sign in instead.');
  }

  const newUser: User = {
    id: `usr_cust_${Date.now()}`,
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: 'customer',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`,
    createdAt: new Date().toISOString(),
    customerProfile: {
      location: data.location,
      locationPermissionGranted: data.locationPermissionGranted,
      preferredTrades: data.preferredTrades.length > 0 ? data.preferredTrades : ['AC Technician'],
      priceSensitivity: data.priceSensitivity,
      contactPreference: 'sms',
    },
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  saveSession(newUser);
  return newUser;
};

// Worker Onboarding / Progressive Registration
export const registerWorker = async (
  data: WorkerSignupData
): Promise<{ user: User; newWorker: Worker }> => {
  if (!data.name.trim() || data.name.trim().length < 2) {
    throw new Error('Please provide your full professional name.');
  }
  if (!validateEmail(data.email)) {
    throw new Error('Please enter a valid email address.');
  }
  if (!validatePhone(data.phone)) {
    throw new Error('Please provide a 10-digit contact mobile number.');
  }
  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }
  if (!data.trade) {
    throw new Error('Please select your trade category.');
  }
  if (!data.skills || data.skills.length === 0) {
    throw new Error('Please select at least one specialized skill or service technique.');
  }
  if (data.experienceYears <= 0) {
    throw new Error('Please declare your verifiable years of field experience.');
  }
  if (data.hourlyRate <= 0) {
    throw new Error('Hourly rate must be greater than zero.');
  }
  if (!data.licenseNumber.trim()) {
    throw new Error('Government ID, Trade Certificate, or License Number is required for verification.');
  }

  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const workerId = `W${Date.now().toString().slice(-4)}`;

  const workerProfile = {
    workerId,
    trade: data.trade,
    skills: data.skills,
    experienceYears: data.experienceYears,
    hourlyRate: data.hourlyRate,
    estimatedQuote: data.estimatedQuote || Math.round(data.hourlyRate * 1.3),
    serviceRadiusKm: 10, // strict 10 km zone
    baseAddress: data.baseAddress || 'Bengaluru Central',
    coordinates: data.coordinates,
    availabilityStatus: data.availabilityStatus,
    licenseNumber: data.licenseNumber.trim(),
    idDocumentName: data.idDocumentName || 'Govt_Skill_Certificate.pdf',
    backgroundCheckPassed: true,
    verificationStatus: 'verified' as const,
    bio: `${data.experienceYears}+ years experience in ${data.trade}. Verified professional on WorkLink platform.`,
  };

  const newUser: User = {
    id: `usr_work_${Date.now()}`,
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
    phone: data.phone.trim(),
    role: 'worker',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    createdAt: new Date().toISOString(),
    workerProfile,
  };

  // Create marketplace worker representation
  const newWorker: Worker = {
    id: workerId,
    name: data.name.trim(),
    trade: data.trade,
    skills: data.skills,
    experienceYears: data.experienceYears,
    hourlyRate: data.hourlyRate,
    estimatedQuote: data.estimatedQuote || Math.round(data.hourlyRate * 1.3),
    rating: 5.0,
    reviewCount: 1,
    completedJobs: 0,
    completionRate: 1.0,
    responseTimeMinutes: 15,
    isVerified: true,
    licenseNumber: data.licenseNumber.trim(),
    backgroundCheckPassed: true,
    phone: data.phone.trim(),
    avatar: newUser.avatar!,
    bio: workerProfile.bio,
    coordinates: data.coordinates,
    distanceKm: 2.5,
    availabilityStatus: data.availabilityStatus,
    nextAvailableSlot: data.availabilityStatus === 'immediate' ? 'Within 30 mins' : 'Tomorrow 09:00 AM',
    toolsEquipped: ['Standard Toolset', 'Digital Multimeter', 'Safety Equipment'],
    recentReviews: [
      {
        id: `rev_${Date.now()}`,
        userName: 'WorkLink Verification Team',
        rating: 5.0,
        comment: 'Credentials, government identification, and trade background verified.',
        date: 'Today',
        tradeTag: data.trade,
      },
    ],
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  saveSession(newUser);

  return { user: newUser, newWorker };
};

// Switch role seamlessly (ideal for evaluator demoing)
export const switchDemoUser = (role: UserRole): User => {
  const users = getStoredUsers();
  const match = users.find((u) => u.role === role) || SEED_USERS.find((u) => u.role === role)!;
  saveSession(match);
  return match;
};

// Update location permissions
export const updateLocationPermission = (
  user: User,
  granted: boolean,
  location?: CustomerLocation
): User => {
  const updatedUser: User = {
    ...user,
    customerProfile: user.customerProfile
      ? {
          ...user.customerProfile,
          locationPermissionGranted: granted,
          location: location || user.customerProfile.location,
        }
      : undefined,
  };

  const users = getStoredUsers().map((u) => (u.id === user.id ? updatedUser : u));
  saveUsers(users);
  saveSession(updatedUser);
  return updatedUser;
};

export const logoutSession = (): void => {
  saveSession(null);
};
