import React from 'react';
import {
  Sparkles,
  MapPin,
  Sliders,
  Clock,
  Compass,
  BarChart3,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';
import { CustomerLocation, MatchingWeights } from '../types';

interface NavbarProps {
  currentTab: 'marketplace' | 'zone_radar' | 'active_booking' | 'intelligence' | 'simulator';
  onSelectTab: (tab: 'marketplace' | 'zone_radar' | 'active_booking' | 'intelligence' | 'simulator') => void;
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
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-black/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('marketplace')}>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight shadow-sm">
              <span className="text-blue-400 mr-0.5">W</span>L
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-semibold text-base tracking-tight text-slate-900">WorkLink</span>
                <span className="badge-subtle bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                  AI Marketplace
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal leading-tight hidden sm:block">
                Right Labour. Right Work. Right Time.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 text-xs font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('marketplace')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentTab === 'marketplace'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Intake & Matching</span>
            </button>

            <button
              onClick={() => onSelectTab('zone_radar')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentTab === 'zone_radar'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>10 km Zone Radar</span>
            </button>

            <button
              onClick={() => onSelectTab('active_booking')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 relative ${
                currentTab === 'active_booking'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Execution & Invoice</span>
              {hasActiveBooking && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('simulator')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentTab === 'simulator'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
              <span>Appendix G Simulator</span>
            </button>

            <button
              onClick={() => onSelectTab('intelligence')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                currentTab === 'intelligence'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
              <span>Workforce Intelligence</span>
            </button>
          </nav>

          {/* Location Badge & Weight Config Button */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onChangeLocationClick}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all max-w-[190px] sm:max-w-[240px] truncate"
              title="Click to shift dynamic 10km service zone"
            >
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">{location.address.split(',')[0]} (10km zone)</span>
            </button>

            <button
              onClick={onOpenWeightsModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
              title="Calibrate multi-factor matching weights"
            >
              <Sliders className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Weights</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-2 border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => onSelectTab('marketplace')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${
              currentTab === 'marketplace' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Intake & Match
          </button>
          <button
            onClick={() => onSelectTab('zone_radar')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${
              currentTab === 'zone_radar' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            10km Radar
          </button>
          <button
            onClick={() => onSelectTab('active_booking')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${
              currentTab === 'active_booking' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Live Execution
          </button>
          <button
            onClick={() => onSelectTab('simulator')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${
              currentTab === 'simulator' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => onSelectTab('intelligence')}
            className={`px-2.5 py-1 rounded-lg shrink-0 ${
              currentTab === 'intelligence' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Intelligence
          </button>
        </div>
      </div>
    </header>
  );
};
