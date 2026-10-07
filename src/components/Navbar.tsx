import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Sliders,
  Clock,
  Compass,
  BarChart3,
  FlaskConical,
  Home,
  User as UserIcon,
  LogOut,
  Shield,
  Briefcase,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { CustomerLocation, MatchingWeights } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';

export type NavTabType =
  | 'customer_home'
  | 'landing'
  | 'marketplace'
  | 'zone_radar'
  | 'active_booking'
  | 'intelligence'
  | 'simulator'
  | 'worker_hub'
  | 'operator_console';

interface NavbarProps {
  currentTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  location: CustomerLocation;
  onChangeLocationClick: () => void;
  currentWeights: MatchingWeights;
  onOpenWeightsModal: () => void;
  hasActiveBooking: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  location,
  onChangeLocationClick,
  currentWeights,
  onOpenWeightsModal,
  hasActiveBooking,
}) => {
  const { currentUser, role, openAuthModal, logout, switchRole } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll listener for dynamic glass material transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeVariant = (userRole: string) => {
    switch (userRole) {
      case 'worker':
        return 'success';
      case 'operator':
        return 'accent';
      default:
        return 'default';
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 navbar-scroll-transition motion-reduce:transition-none ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-black/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] glass-specular-edge'
          : 'bg-white/60 backdrop-blur-md border-b border-black/[0.03] shadow-none'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer select-none group shrink-0"
            onClick={() => onSelectTab('customer_home')}
          >
            <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold tracking-tight shadow-2xs transition-transform duration-200 group-hover:scale-105 shrink-0">
              <span className="text-[#0071E3] mr-0.5">W</span>L
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#111111]">
              WorkLink
            </span>
          </div>

          {/* Primary Navigation: Home, Bookings (and role hubs when active) */}
          <nav className="hidden sm:flex items-center space-x-1 text-xs font-medium text-[#6E6E73]">
            {/* Home (customer_home / Concierge) */}
            <button
              onClick={() => onSelectTab('customer_home')}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                currentTab === 'customer_home' || currentTab === 'landing'
                  ? 'bg-black/[0.05] text-[#111111] font-semibold'
                  : 'hover:text-[#111111] hover:bg-black/[0.03]'
              }`}
            >
              Home
            </button>

            {/* Bookings */}
            <button
              onClick={() => onSelectTab('active_booking')}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 flex items-center space-x-1.5 ${
                currentTab === 'active_booking'
                  ? 'bg-black/[0.05] text-[#111111] font-semibold'
                  : 'hover:text-[#111111] hover:bg-black/[0.03]'
              }`}
            >
              <span>Bookings</span>
              {hasActiveBooking && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
              )}
            </button>

            {role === 'worker' && (
              <button
                onClick={() => onSelectTab('worker_hub')}
                className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                  currentTab === 'worker_hub'
                    ? 'bg-black/[0.05] text-[#111111] font-semibold'
                    : 'hover:text-[#111111] hover:bg-black/[0.03]'
                }`}
              >
                Worker Hub
              </button>
            )}

            {role === 'operator' && (
              <button
                onClick={() => onSelectTab('operator_console')}
                className={`px-3.5 py-1.5 rounded-xl transition-all duration-150 ${
                  currentTab === 'operator_console'
                    ? 'bg-black/[0.05] text-[#111111] font-semibold'
                    : 'hover:text-[#111111] hover:bg-black/[0.03]'
                }`}
              >
                Operator
              </button>
            )}
          </nav>

          {/* Right Action Controls: Location & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Subtle Understated Location Indicator (📍 Hauz Khas Enclave · 10 km) */}
            <button
              onClick={onChangeLocationClick}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs text-[#6E6E73] hover:text-[#111111] hover:bg-black/[0.03] transition-colors truncate max-w-[105px] xs:max-w-[155px] sm:max-w-[220px]"
              title="📍 Hauz Khas Enclave · 10 km (Click to view or change your location)"
            >
              <MapPin className="w-3.5 h-3.5 text-[#86868B] shrink-0" />
              <span className="truncate font-medium text-[#111111]">
                {location.address.split(',')[0]}
              </span>
              <span className="text-[#86868B] shrink-0 font-normal">· 10 km</span>
            </button>

            {/* User Account / Profile Menu */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl glass-button transition-all text-xs"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-6 h-6 rounded-lg object-cover ring-1 ring-black/10 shrink-0"
                  />
                  <div className="text-left hidden sm:block">
                    <span className="font-semibold text-[#111111] block leading-tight truncate max-w-[90px]">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#86868B] capitalize block leading-tight">
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
                </button>

                {/* Profile Popover Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-surface-strong border border-black/10 shadow-xl p-3 z-50 animate-fade-in space-y-3">
                    <div className="flex items-center space-x-3 pb-3 border-b border-black/5">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10"
                      />
                      <div className="truncate">
                        <span className="font-bold text-sm text-[#111111] block truncate">
                          {currentUser.name}
                        </span>
                        <span className="text-xs text-[#86868B] block truncate">
                          {currentUser.email}
                        </span>
                        <div className="mt-1">
                          <Badge variant={getRoleBadgeVariant(currentUser.role)} size="sm">
                            {currentUser.role.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Instant Demo Role Switcher */}
                    <div>
                      <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-1.5">
                        Switch Active Role (Demo)
                      </span>
                      <div className="grid grid-cols-3 gap-1">
                        <button
                          onClick={() => {
                            switchRole('customer');
                            setIsProfileMenuOpen(false);
                            onSelectTab('marketplace');
                          }}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                            role === 'customer'
                              ? 'bg-[#111111] text-white'
                              : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                          }`}
                        >
                          Customer
                        </button>
                        <button
                          onClick={() => {
                            switchRole('worker');
                            setIsProfileMenuOpen(false);
                            onSelectTab('worker_hub');
                          }}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                            role === 'worker'
                              ? 'bg-[#111111] text-white'
                              : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                          }`}
                        >
                          Worker
                        </button>
                        <button
                          onClick={() => {
                            switchRole('operator');
                            setIsProfileMenuOpen(false);
                            onSelectTab('operator_console');
                          }}
                          className={`p-1.5 rounded-lg text-xs font-semibold transition-all text-center ${
                            role === 'operator'
                              ? 'bg-[#111111] text-white'
                              : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                          }`}
                        >
                          Admin
                        </button>
                      </div>
                    </div>

                    {/* Direct Links */}
                    <div className="pt-2 border-t border-black/5 space-y-1">
                      {role === 'worker' && (
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            onSelectTab('worker_hub');
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-[#34C759]" />
                          <span>My Worker Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSelectTab('operator_console');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#AF52DE]" />
                        <span>Operator Console</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSelectTab('simulator');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                      >
                        <FlaskConical className="w-3.5 h-3.5 text-[#AF52DE]" />
                        <span>Demo Hub (5 Live Scenarios)</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSelectTab('intelligence');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                      >
                        <BarChart3 className="w-3.5 h-3.5 text-[#FF9500]" />
                        <span>Workforce Intelligence</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onSelectTab('zone_radar');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#5856D6]" />
                        <span>10 km Service Radar</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenWeightsModal();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#111111] hover:bg-[#F5F5F7] flex items-center space-x-2"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>Matching Weights</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#FF3B30] hover:bg-[#FF3B30]/10 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAuthModal('login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAuthModal('signup_customer')}
                >
                  Join
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Compact Glass Navigation Rail (Mobile Material Design) */}
        <nav
          aria-label="Mobile Navigation"
          className="flex sm:hidden items-center space-x-1.5 py-1 px-1 my-1.5 rounded-2xl bg-white/75 backdrop-blur-md border border-black/5 shadow-2xs text-xs"
        >
          <button
            onClick={() => onSelectTab('customer_home')}
            className={`min-h-[40px] flex-1 py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-1.5 ${
              currentTab === 'customer_home' || currentTab === 'landing'
                ? 'bg-[#111111] text-white shadow-xs font-semibold'
                : 'text-[#6E6E73] hover:text-[#111111]'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => onSelectTab('active_booking')}
            className={`min-h-[40px] flex-1 py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-1.5 relative ${
              currentTab === 'active_booking'
                ? 'bg-[#111111] text-white shadow-xs font-semibold'
                : 'text-[#6E6E73] hover:text-[#111111]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Bookings</span>
            {hasActiveBooking && (
              <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
            )}
          </button>

          {role === 'worker' && (
            <button
              onClick={() => onSelectTab('worker_hub')}
              className={`min-h-[40px] flex-1 py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-1.5 ${
                currentTab === 'worker_hub'
                  ? 'bg-[#111111] text-white shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Jobs</span>
            </button>
          )}

          {role === 'operator' && (
            <button
              onClick={() => onSelectTab('operator_console')}
              className={`min-h-[40px] flex-1 py-2 px-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-1.5 ${
                currentTab === 'operator_console'
                  ? 'bg-[#111111] text-white shadow-xs font-semibold'
                  : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#AF52DE]" />
              <span>Operator</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};
