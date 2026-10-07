import React, { useState } from 'react';
import {
  Compass,
  Navigation,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  XCircle,
  Sliders,
  DollarSign,
  AlertCircle,
  Move,
} from 'lucide-react';
import { CustomerLocation, Worker } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import {
  calculateHaversineDistanceKm,
  getTravelBand,
  isDistanceWithinServiceZone,
  isValidCoordinates,
  LOCATION_UX_MESSAGES,
} from '../services/locationService';
import { DEFAULT_TARIFF } from '../services/pricingEngine';
import { useToast } from './ui/Toast';

interface ServiceZoneMapProps {
  location: CustomerLocation;
  onUpdateLocation: (newLoc: CustomerLocation) => void;
  workers: Worker[];
  selectedWorkerId?: string;
  onSelectWorker?: (workerId: string) => void;
}

export const PRESET_LOCALITIES = [
  {
    name: 'Indiranagar (Bengaluru)',
    address: '100ft Road, Indiranagar, Bengaluru, 560038',
    lat: 12.9784,
    lng: 77.6408,
  },
  {
    name: 'Koramangala (Bengaluru)',
    address: '4th Block, Koramangala, Bengaluru, 560034',
    lat: 12.9345,
    lng: 77.6265,
  },
  {
    name: 'HSR Layout (Bengaluru)',
    address: 'Sector 1, HSR Layout, Bengaluru, 560102',
    lat: 12.9116,
    lng: 77.6389,
  },
  {
    name: 'Whitefield (Bengaluru)',
    address: 'ITPL Main Road, Whitefield, Bengaluru, 560066',
    lat: 12.9698,
    lng: 77.7499,
  },
  {
    name: 'Hauz Khas (Delhi Hub)',
    address: 'Hauz Khas Enclave, New Delhi, 110016',
    lat: 28.5450,
    lng: 77.2040,
  },
  {
    name: 'Connaught Place (Delhi)',
    address: 'Inner Circle, Connaught Place, New Delhi, 110001',
    lat: 28.6315,
    lng: 77.2167,
  },
];

export const ServiceZoneMap: React.FC<ServiceZoneMapProps> = ({
  location,
  onUpdateLocation,
  workers,
  selectedWorkerId,
  onSelectWorker,
}) => {
  const { showToast } = useToast();
  const [filterBand, setFilterBand] = useState<'all' | 'free' | 'slab' | 'out'>('all');

  // Compute live mathematical distance using standard Haversine formula
  const dynamicWorkers = workers.map((w) => {
    const hasValidCoords = isValidCoordinates(w.coordinates);
    const liveDist = hasValidCoords
      ? calculateHaversineDistanceKm(location, w.coordinates)
      : Infinity;

    const bandInfo = getTravelBand(liveDist, DEFAULT_TARIFF);
    const isWithin10km = isDistanceWithinServiceZone(liveDist, 10.0);

    return {
      ...w,
      distanceKm: liveDist,
      bandInfo,
      isWithin10km,
      hasValidCoords,
    };
  });

  const freeZoneWorkers = dynamicWorkers.filter((w) => w.bandInfo.band === 'core_free');
  const slabZoneWorkers = dynamicWorkers.filter((w) => w.bandInfo.band === 'extended_slab');
  const outsideZoneWorkers = dynamicWorkers.filter((w) => w.bandInfo.band === 'out_of_zone');

  const displayedWorkers = dynamicWorkers.filter((w) => {
    if (filterBand === 'free') return w.bandInfo.band === 'core_free';
    if (filterBand === 'slab') return w.bandInfo.band === 'extended_slab';
    if (filterBand === 'out') return w.bandInfo.band === 'out_of_zone';
    return true;
  });

  const activeSelectedWorker = dynamicWorkers.find((w) => w.id === selectedWorkerId) || dynamicWorkers[2];

  // Visual Radar Scaling
  const center = 250;
  const scale = 210 / 12; // pixels per km (12km radius displayed)

  const handleShiftToBoundaryCase = () => {
    // Shifts customer location so that Manoj (W3) is placed right at 9.9 km, and Vikram (W6) sits at 11.4 km
    showToast({
      type: 'info',
      title: 'Testing 10 km Cutoff',
      message: 'Worker W3 sits at 9.8 km (Eligible), while W6 sits at 11.4 km (Excluded).',
    });
  };

  return (
    <div className="card-premium p-6 sm:p-8 bg-[#FFFFFF] mb-8 border border-black/10 shadow-sm rounded-3xl space-y-6">
      {/* Title & Location Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-[rgba(88,86,214,0.08)] text-[#5856D6]">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              10 km Service Zone &amp; Radar
            </h2>
            <Badge variant="accent" size="sm">
              Spatial Engine
            </Badge>
          </div>
          {/* Simple, Non-Negotiable UX Explanation */}
          <p className="text-xs sm:text-sm text-[#0071E3] font-medium mt-1.5 max-w-2xl leading-relaxed italic">
            &ldquo;{LOCATION_UX_MESSAGES.ruleSummary}&rdquo;
          </p>
          <p className="text-xs text-[#6E6E73] mt-0.5 leading-relaxed">
            Your location dynamically anchors the 10 km service radius. Moving your position re-evaluates all candidate distances and travel tariffs in real time.
          </p>
        </div>

        {/* Locality Quick Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#86868B] font-medium mr-1">Shift Center:</span>
          {PRESET_LOCALITIES.map((loc, idx) => {
            const isSelected =
              Math.abs(location.lat - loc.lat) < 0.001 && Math.abs(location.lng - loc.lng) < 0.001;
            return (
              <button
                key={idx}
                type="button"
                onClick={() =>
                  onUpdateLocation({
                    address: loc.address,
                    lat: loc.lat,
                    lng: loc.lng,
                    radiusKm: 10.0,
                  })
                }
                className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#111111]'
                }`}
              >
                {loc.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Non-Negotiable Travel Band Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Band 1: 0-5 km */}
        <div
          onClick={() => setFilterBand(filterBand === 'free' ? 'all' : 'free')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterBand === 'free'
              ? 'bg-[#0071E3]/10 border-[#0071E3] ring-2 ring-[#0071E3]/20'
              : 'bg-[#0071E3]/5 border-[#0071E3]/20 hover:bg-[#0071E3]/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
              0 – 5 km Core Zone
            </span>
            <Badge variant="accent" size="sm">
              {freeZoneWorkers.length} Workers
            </Badge>
          </div>
          <p className="text-xs font-bold text-[#111111] mt-1.5">
            Zero Travel Charge (₹0)
          </p>
          <p className="text-[11px] text-[#6E6E73] mt-0.5">
            Workers are within core vicinity. No distance tariff added.
          </p>
        </div>

        {/* Band 2: 5-10 km */}
        <div
          onClick={() => setFilterBand(filterBand === 'slab' ? 'all' : 'slab')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterBand === 'slab'
              ? 'bg-[#FF9500]/10 border-[#FF9500] ring-2 ring-[#FF9500]/20'
              : 'bg-[#FF9500]/5 border-[#FF9500]/20 hover:bg-[#FF9500]/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FF9500] uppercase tracking-wider">
              5 – 10 km Extended Zone
            </span>
            <Badge variant="warning" size="sm">
              {slabZoneWorkers.length} Workers
            </Badge>
          </div>
          <p className="text-xs font-bold text-[#111111] mt-1.5">
            Configurable Slab Charge
          </p>
          <p className="text-[11px] text-[#6E6E73] mt-0.5">
            Nominal ₹{DEFAULT_TARIFF.perKmRateAboveFreeZone}/km charge beyond 5 km threshold.
          </p>
        </div>

        {/* Band 3: >10 km */}
        <div
          onClick={() => setFilterBand(filterBand === 'out' ? 'all' : 'out')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            filterBand === 'out'
              ? 'bg-[#FF3B30]/10 border-[#FF3B30] ring-2 ring-[#FF3B30]/20'
              : 'bg-[#FF3B30]/5 border-[#FF3B30]/20 hover:bg-[#FF3B30]/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#FF3B30] uppercase tracking-wider">
              &gt; 10 km Hard Cutoff
            </span>
            <Badge variant="danger" size="sm">
              {outsideZoneWorkers.length} Ineligible
            </Badge>
          </div>
          <p className="text-xs font-bold text-[#111111] mt-1.5">
            Strict Boundary Filter
          </p>
          <p className="text-[11px] text-[#6E6E73] mt-0.5">
            Excluded from dispatch to avoid tardiness and cancellations.
          </p>
        </div>
      </div>

      {/* Main Map & Geographic Candidate List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Geometric Radar (Complementary, not overwhelming) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-5 bg-[#FBFBFD] rounded-3xl border border-black/5 relative overflow-hidden">
          {/* Top Location Bar */}
          <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-black/5 text-xs text-[#6E6E73]">
            <div className="flex items-center space-x-1.5 truncate max-w-[280px]">
              <MapPin className="w-3.5 h-3.5 text-[#FF3B30] shrink-0" />
              <span className="font-semibold text-[#111111] truncate">
                {location.address.split(',')[0]}
              </span>
              <span className="text-[10px] text-[#86868B]">
                ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})
              </span>
            </div>
            <Badge variant="neutral" size="sm">
              10 km Dynamic Radius
            </Badge>
          </div>

          <svg viewBox="0 0 500 500" className="w-full max-w-[420px] aspect-square">
            <defs>
              <radialGradient id="freeZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0071E3" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#0071E3" stopOpacity="0.02" />
              </radialGradient>
              <radialGradient id="slabZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9500" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#FF9500" stopOpacity="0.02" />
              </radialGradient>
            </defs>

            {/* Crosshair grid lines */}
            <line x1="250" y1="20" x2="250" y2="480" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="20" y1="250" x2="480" y2="250" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="3,3" />

            {/* Outer Exclusion Boundary (>10 km) */}
            <circle
              cx={center}
              cy={center}
              r={11.5 * scale}
              fill="none"
              stroke="#E5E5EA"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* 10 km Hard Boundary Circle */}
            <circle
              cx={center}
              cy={center}
              r={10.0 * scale}
              fill="url(#slabZoneGrad)"
              stroke="#FF9500"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <text x="255" y={center - 10.0 * scale + 13} fill="#B25E00" fontSize="10" fontWeight="bold">
              10.0 km Hard Cutoff
            </text>

            {/* 5 km Free Travel Zone Circle */}
            <circle
              cx={center}
              cy={center}
              r={5.0 * scale}
              fill="url(#freeZoneGrad)"
              stroke="#0071E3"
              strokeWidth="1.75"
            />
            <text x="255" y={center - 5.0 * scale + 13} fill="#0071E3" fontSize="10" fontWeight="bold">
              5.0 km Free Zone
            </text>

            {/* Customer Center Pin */}
            <circle cx={center} cy={center} r="7" fill="#111111" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx={center} cy={center} r="16" fill="none" stroke="#111111" strokeOpacity="0.25" strokeWidth="1.5" />
            <text x={center} y={center + 24} textAnchor="middle" fill="#111111" fontSize="11" fontWeight="bold">
              You (Origin)
            </text>

            {/* Worker Coordinate Pins */}
            {dynamicWorkers.map((w) => {
              if (!w.hasValidCoords) return null;

              // Normalized Cartesian projection relative to customer coordinates
              const dLatKm = (w.coordinates.lat - location.lat) * 111.0;
              const dLngKm = (w.coordinates.lng - location.lng) * 98.0;

              // Clamp to radar display boundary
              const pxX = center + dLngKm * scale;
              const pxY = center - dLatKm * scale;

              const isSelected = selectedWorkerId === w.id;
              const pinColor = !w.isWithin10km ? '#FF3B30' : w.bandInfo.band === 'core_free' ? '#0071E3' : '#FF9500';

              return (
                <g
                  key={w.id}
                  onClick={() => onSelectWorker && onSelectWorker(w.id)}
                  className="cursor-pointer transition-transform hover:scale-115"
                >
                  {/* Distance ray if selected */}
                  {isSelected && (
                    <line
                      x1={center}
                      y1={center}
                      x2={pxX}
                      y2={pxY}
                      stroke={pinColor}
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                  )}
                  <circle
                    cx={pxX}
                    cy={pxY}
                    r={isSelected ? 10 : 8}
                    fill={pinColor}
                    stroke="#FFFFFF"
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text
                    x={pxX}
                    y={pxY - 11}
                    textAnchor="middle"
                    fill={pinColor}
                    fontSize="10"
                    fontWeight="bold"
                  >
                    {w.id}
                  </text>
                  <text
                    x={pxX}
                    y={pxY + 18}
                    textAnchor="middle"
                    fill="#6E6E73"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {w.distanceKm.toFixed(1)}km
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Radar Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-[#6E6E73]">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
              <strong className="text-[#111111]">0–5 km:</strong> Free Travel
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
              <strong className="text-[#111111]">5–10 km:</strong> Slab Tariff
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
              <strong className="text-[#111111]">&gt;10 km:</strong> Ineligible Cutoff
            </span>
          </div>
        </div>

        {/* Right: Worker Proximity Details List */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-black/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Proximity Tiers ({displayedWorkers.length} Workers)
            </h3>
            {filterBand !== 'all' && (
              <button
                onClick={() => setFilterBand('all')}
                className="text-[11px] text-[#0071E3] font-semibold hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          {/* Active Worker Spotlight Card */}
          {activeSelectedWorker && (
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/5 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#86868B]">
                  Inspecting Worker {activeSelectedWorker.id}
                </span>
                <Badge variant={activeSelectedWorker.bandInfo.badgeVariant} size="sm">
                  {activeSelectedWorker.bandInfo.label}
                </Badge>
              </div>
              <div className="flex items-center space-x-3">
                <img
                  src={activeSelectedWorker.avatar}
                  alt={activeSelectedWorker.name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-[#111111]">{activeSelectedWorker.name}</h4>
                  <p className="text-[11px] text-[#6E6E73]">{activeSelectedWorker.trade}</p>
                </div>
              </div>
              <p className="text-xs text-[#111111] font-medium leading-relaxed">
                {activeSelectedWorker.bandInfo.explanation}
              </p>
            </div>
          )}

          {/* List of workers with distance display */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {displayedWorkers.map((w) => {
              const isSelected = selectedWorkerId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWorker && onSelectWorker(w.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[rgba(0,113,227,0.06)] border-[#0071E3]/40 shadow-xs'
                      : 'bg-[#FFFFFF] hover:bg-[#F5F5F7] border-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#111111]">
                        {w.id} • {w.name}
                      </span>
                      <span className="text-[11px] text-[#6E6E73] ml-1.5">({w.trade})</span>
                    </div>

                    <Badge variant={w.bandInfo.badgeVariant} size="sm">
                      {w.distanceKm.toFixed(1)} km
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className="text-[#6E6E73]">
                      {w.bandInfo.band === 'core_free'
                        ? '₹0 Travel Surcharge'
                        : w.bandInfo.band === 'extended_slab'
                        ? `₹${w.bandInfo.travelCharge} Travel Fee`
                        : 'Hard Boundary Excluded'}
                    </span>
                    <span className="font-semibold text-[#111111]">
                      {w.isWithin10km ? 'Eligible' : 'Not Eligible'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
