import { TradeCategory, AvailabilityStatus, CustomerLocation } from './index';

export type UserRole = 'customer' | 'worker' | 'operator';

export interface CustomerProfile {
  location: CustomerLocation;
  locationPermissionGranted: boolean;
  preferredTrades: TradeCategory[];
  priceSensitivity: 'low' | 'medium' | 'high';
  contactPreference: 'sms' | 'whatsapp' | 'call';
}

export interface WorkerProfileData {
  workerId: string;
  trade: TradeCategory;
  skills: string[];
  experienceYears: number;
  hourlyRate: number;
  estimatedQuote: number;
  serviceRadiusKm: number; // strictly 10 km zone
  baseAddress: string;
  coordinates: { lat: number; lng: number };
  availabilityStatus: AvailabilityStatus;
  licenseNumber: string;
  idDocumentName?: string;
  backgroundCheckPassed: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  bio?: string;
}

export interface OperatorProfile {
  department: string;
  accessLevel: 'full_admin' | 'supervisor' | 'compliance_auditor';
  lastAuditAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  customerProfile?: CustomerProfile;
  workerProfile?: WorkerProfileData;
  operatorProfile?: OperatorProfile;
}

export interface CustomerSignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  location: CustomerLocation;
  locationPermissionGranted: boolean;
  preferredTrades: TradeCategory[];
  priceSensitivity: 'low' | 'medium' | 'high';
}

export interface WorkerSignupData {
  name: string;
  email: string;
  phone: string;
  password: string;
  trade: TradeCategory;
  skills: string[];
  experienceYears: number;
  baseAddress: string;
  coordinates: { lat: number; lng: number };
  serviceRadiusKm: number;
  hourlyRate: number;
  estimatedQuote: number;
  availabilityStatus: AvailabilityStatus;
  licenseNumber: string;
  idDocumentName?: string;
  backgroundCheckConsent: boolean;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
