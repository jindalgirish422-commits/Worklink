import React from 'react';
import {
  Sparkles,
  MapPin,
  Sliders,
  Clock,
  Compass,
  BarChart3,
  FlaskConical,
  Home,
} from 'lucide-react';
import { CustomerLocation, MatchingWeights } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface NavbarProps {
  currentTab: 'landing' | 'marketplace' | 'zone_radar' | 'active_booking' | 'intelligence' | 'simulator';
  onSelectTab: (tab: 'landing' | 'marketplace' | 'zone_radar' | 'active_booking' | 'intelligence' | 'simulator') => void;
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
  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/85 backdrop-blur-md border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Subtitle */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none group"
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
                <Badge variant="accent" size="sm">
                  Marketplace
                </Badge>
              </div>
              <p className="text-[11px] text-[#86868B] font-normal leading-tight hidden sm:block">
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
            <button
              onClick={onChangeLocationClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#FFFFFF] hover:bg-[#F5F5F7] border border-black/10 text-[#111111] transition-all max-w-[180px] sm:max-w-[220px] truncate"
              title="Click to shift dynamic 10km service zone"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
              <span className="truncate">{location.address.split(',')[0]} (10km)</span>
            </button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenWeightsModal}
              leftIcon={<Sliders className="w-3.5 h-3.5 text-[#0071E3]" />}
            >
              <span className="hidden sm:inline">Weights</span>
            </Button>
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
