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
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/85 backdrop-blur-md border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group shrink-0"
            onClick={() => onSelectTab('landing')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center font-bold tracking-tight shadow-sm transition-transform duration-200 group-hover:scale-105">
              <span className="text-[#0071E3] mr-0.5">W</span>L
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight text-[#111111]">
                  WorkLink
                </span>
                <Badge variant={getRoleBadgeVariant(role)} size="sm">
                  {role === 'worker' ? 'Worker Pro' : role === 'operator' ? 'Admin' : 'Marketplace'}
                </Badge>
              </div>
              <p className="text-[11px] text-[#86868B] font-normal leading-tight hidden lg:block">
                Right Labour. Right Work. Right Time.
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-[#F5F5F7] rounded-xl border border-black/5 text-xs font-medium text-[#6E6E73]">
            <button
              onClick={() => onSelectTab('landing')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                currentTab === 'landing'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-[#111111]" />
              <span>Overview</span>
            </button>

            {/* Role-Specific Primary Tab */}
            {role === 'worker' && (
              <button
                onClick={() => onSelectTab('worker_hub')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                  currentTab === 'worker_hub'
                    ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                    : 'hover:text-[#111111]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-[#34C759]" />
                <span>Worker Hub</span>
              </button>
            )}

            {role === 'operator' && (
              <button
                onClick={() => onSelectTab('operator_console')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                  currentTab === 'operator_console'
                    ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                    : 'hover:text-[#111111]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-[#AF52DE]" />
                <span>Operator Console</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                currentTab === 'marketplace'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
              <span>Intake &amp; Match</span>
            </button>

            <button
              onClick={() => onSelectTab('zone_radar')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                currentTab === 'zone_radar'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#5856D6]" />
              <span>10 km Radar</span>
            </button>

            <button
              onClick={() => onSelectTab('active_booking')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 relative ${
                currentTab === 'active_booking'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#34C759]" />
              <span>Execution</span>
              {hasActiveBooking && (
                <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('simulator')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                currentTab === 'simulator'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#AF52DE]" />
              <span>Simulator</span>
            </button>

            <button
              onClick={() => onSelectTab('intelligence')}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1.5 ${
                currentTab === 'intelligence'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-xs font-semibold'
                  : 'hover:text-[#111111]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#FF9500]" />
              <span>Intelligence</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dynamic Location Pill */}
            <button
              onClick={onChangeLocationClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#FFFFFF] hover:bg-[#F5F5F7] border border-black/10 text-[#111111] transition-all max-w-[150px] sm:max-w-[200px] truncate"
              title="Click to shift dynamic 10km service zone"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
              <span className="truncate">{location.address.split(',')[0]} (10km)</span>
            </button>

            {/* Weights Preset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenWeightsModal}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#0071E3]" />}
              className="hidden lg:flex"
            >
              <span>Weights</span>
            </Button>

            {/* User Account / Profile Menu */}
            {currentUser ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBEF] border border-black/5 transition-all text-xs"
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
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-black/10 shadow-lg p-3 z-50 animate-fade-in space-y-3">
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

                      {role === 'operator' && (
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
                      )}

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

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-black/5 text-xs no-scrollbar">
          <button
            onClick={() => onSelectTab('landing')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'landing'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            Overview
          </button>

          {role === 'worker' && (
            <button
              onClick={() => onSelectTab('worker_hub')}
              className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
                currentTab === 'worker_hub'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F0F0F2] text-[#6E6E73]'
              }`}
            >
              Worker Hub
            </button>
          )}

          {role === 'operator' && (
            <button
              onClick={() => onSelectTab('operator_console')}
              className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
                currentTab === 'operator_console'
                  ? 'bg-[#111111] text-white shadow-xs'
                  : 'bg-[#F0F0F2] text-[#6E6E73]'
              }`}
            >
              Admin Console
            </button>
          )}

          <button
            onClick={() => onSelectTab('marketplace')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'marketplace'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            Match
          </button>
          <button
            onClick={() => onSelectTab('zone_radar')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'zone_radar'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            10km Radar
          </button>
          <button
            onClick={() => onSelectTab('active_booking')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'active_booking'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            Execution
          </button>
          <button
            onClick={() => onSelectTab('simulator')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'simulator'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => onSelectTab('intelligence')}
            className={`px-3 py-1 rounded-lg shrink-0 font-medium transition-all ${
              currentTab === 'intelligence'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-[#F0F0F2] text-[#6E6E73]'
            }`}
          >
            Intelligence
          </button>
        </div>
      </div>
    </header>
  );
};
