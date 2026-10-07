import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  CustomerSignupData,
  WorkerSignupData,
  Worker,
  CustomerLocation,
} from '../types';
import {
  getStoredSession,
  authenticate,
  registerCustomer,
  registerWorker,
  logoutSession,
  switchDemoUser,
  updateLocationPermission,
} from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: UserRole;
  login: (email: string, pass: string) => Promise<void>;
  signupCustomer: (data: CustomerSignupData) => Promise<void>;
  signupWorker: (data: WorkerSignupData) => Promise<Worker>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateLocation: (location: CustomerLocation, granted: boolean) => void;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'signup_customer' | 'signup_worker';
  openAuthModal: (mode?: 'login' | 'signup_customer' | 'signup_worker') => void;
  closeAuthModal: () => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onWorkerAdded?: (newWorker: Worker) => void;
}> = ({ children, onWorkerAdded }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup_customer' | 'signup_worker'>('login');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const user = await authenticate(email, pass);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const signupCustomer = async (data: CustomerSignupData) => {
    const user = await registerCustomer(data);
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const signupWorker = async (data: WorkerSignupData): Promise<Worker> => {
    const { user, newWorker } = await registerWorker(data);
    setCurrentUser(user);
    if (onWorkerAdded) {
      onWorkerAdded(newWorker);
    }
    setIsAuthModalOpen(false);
    return newWorker;
  };

  const logout = () => {
    logoutSession();
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const user = switchDemoUser(newRole);
    setCurrentUser(user);
  };

  const updateLocation = (location: CustomerLocation, granted: boolean) => {
    if (currentUser) {
      const updated = updateLocationPermission(currentUser, granted, location);
      setCurrentUser(updated);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup_customer' | 'signup_worker' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openLocationModal = () => {
    setIsLocationModalOpen(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || 'customer',
        login,
        signupCustomer,
        signupWorker,
        logout,
        switchRole,
        updateLocation,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
