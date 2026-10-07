import React from 'react';
import {
  Compass,
  Navigation,
} from 'lucide-react';
import { CustomerLocation, Worker } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface ServiceZoneMapProps {
  location: CustomerLocation;
  onUpdateLocation: (newLoc: CustomerLocation) => void;
  workers: Worker[];
  selectedWorkerId?: string;
  onSelectWorker?: (workerId: string) => void;
}

export const PRESET_LOCALITIES: Array<{ name: string; address: string; lat: number; lng: number }> = [
  {
    name: 'Hauz Khas (South Delhi)',
    address: 'Hauz Khas Enclave, New Delhi, 110016',
    lat: 28.5450,
    lng: 77.2040,
  },
  {
    name: 'Connaught Place (Central)',
    address: 'Connaught Place, Inner Circle, New Delhi, 110001',
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    name: 'Noida Sector 18 (NCR)',
    address: 'Sector 18 Market, Noida, Uttar Pradesh, 201301',
    lat: 28.5700,
    lng: 77.3200,
  },
  {
    name: 'Dwarka Sector 10 (West)',
    address: 'Sector 10, Dwarka, New Delhi, 110075',
    lat: 28.5820,
    lng: 77.0500,
  },
];

export const ServiceZoneMap: React.FC<ServiceZoneMapProps> = ({
  location,
  onUpdateLocation,
  workers,
  selectedWorkerId,
  onSelectWorker,
}) => {
  const calculateDistance = (wLat: number, wLng: number) => {
    const R = 6371; // Earth radius km
    const dLat = ((wLat - location.lat) * Math.PI) / 180;
    const dLng = ((wLng - location.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((location.lat * Math.PI) / 180) *
        Math.cos((wLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const dynamicWorkers = workers.map((w) => {
    const liveDist = calculateDistance(w.coordinates.lat, w.coordinates.lng);
    return {
      ...w,
      distanceKm: liveDist,
      isWithin10km: liveDist <= 10.0,
      isFreeZone: liveDist <= 5.0,
    };
  });

  const freeZoneCount = dynamicWorkers.filter((w) => w.isFreeZone).length;
  const slabZoneCount = dynamicWorkers.filter((w) => w.isWithin10km && !w.isFreeZone).length;
  const outsideZoneCount = dynamicWorkers.filter((w) => !w.isWithin10km).length;

  const center = 250;
  const scale = 210 / 12; // px per km

  return (
    <div className="card-premium p-6 md:p-8 bg-[#FFFFFF] mb-8">
      {/* Title & Locality Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-[rgba(88,86,214,0.08)] text-[#5856D6]">
              <Compass className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Dynamic 10 km Service Zone Radar
            </h2>
            <Badge variant="accent" size="sm">
              Spatial Feasibility
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-2xl leading-relaxed">
            The service boundary is anchored dynamically to your current coordinates. Moving the customer pin shifts the 10 km zone, recalculating eligibility and travel fee tiers in real time.
          </p>
        </div>

        {/* Quick Shift Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[#86868B] font-medium mr-1">Shift Center:</span>
          {PRESET_LOCALITIES.map((loc, idx) => {
            const isSelected = location.lat === loc.lat && location.lng === loc.lng;
            return (
              <Button
                key={idx}
                type="button"
                variant={isSelected ? 'primary' : 'secondary'}
                size="sm"
                onClick={() =>
                  onUpdateLocation({
                    address: loc.address,
                    lat: loc.lat,
                    lng: loc.lng,
                    radiusKm: 10.0,
                  })
                }
              >
                {loc.name.split(' ')[0]}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Zone Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className="p-4 rounded-2xl bg-[rgba(0,113,227,0.04)] border border-[rgba(0,113,227,0.14)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
              0 – 5 km Zone
            </span>
            <Badge variant="accent" size="sm">
              {freeZoneCount} Workers
            </Badge>
          </div>
          <p className="text-xs text-[#111111] mt-1.5 font-medium">
            Free Travel Zone — Zero travel surcharge applied.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(255,149,0,0.05)] border border-[rgba(255,149,0,0.18)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B25E00] uppercase tracking-wider">
              5 – 10 km Zone
            </span>
            <Badge variant="warning" size="sm">
              {slabZoneCount} Workers
            </Badge>
          </div>
          <p className="text-xs text-[#111111] mt-1.5 font-medium">
            Configurable Slab Charge — Travel fee per km above 5 km.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[rgba(255,59,48,0.04)] border border-[rgba(255,59,48,0.16)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D70015] uppercase tracking-wider">
              &gt; 10 km Cutoff
            </span>
            <Badge variant="danger" size="sm">
              {outsideZoneCount} Ineligible
            </Badge>
          </div>
          <p className="text-xs text-[#111111] mt-1.5 font-medium">
            Strict Boundary — Workers outside 10 km are excluded from matching.
          </p>
        </div>
      </div>

      {/* Main Radar & Worker List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Geometric Radar */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-[#FBFBFD] rounded-3xl border border-black/5 relative overflow-hidden">
          <div className="absolute top-3.5 left-4 flex items-center space-x-1.5 text-xs text-[#6E6E73] font-medium">
            <Navigation className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Center: {location.address.split(',')[0]}</span>
          </div>

          <svg viewBox="0 0 500 500" className="w-full max-w-[420px] aspect-square">
            <defs>
              <radialGradient id="freeZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0071E3" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#0071E3" stopOpacity="0.02" />
              </radialGradient>
              <radialGradient id="slabZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9500" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#FF9500" stopOpacity="0.01" />
              </radialGradient>
            </defs>

            {/* Grid background lines */}
            <line x1="250" y1="20" x2="250" y2="480" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="20" y1="250" x2="480" y2="250" stroke="#E5E5EA" strokeWidth="1" strokeDasharray="3,3" />

            {/* Outer Ineligible Cutoff Boundary (>10 km) */}
            <circle
              cx={center}
              cy={center}
              r={11.4 * scale}
              fill="none"
              stroke="#D1D1D6"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* 10 km Boundary */}
            <circle
              cx={center}
              cy={center}
              r={10.0 * scale}
              fill="url(#slabZoneGrad)"
              stroke="#FF9500"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <text x="255" y={center - 10.0 * scale + 14} fill="#B25E00" fontSize="10" fontWeight="bold">
              10 km Hard Boundary
            </text>

            {/* 5 km Free Zone */}
            <circle
              cx={center}
              cy={center}
              r={5.0 * scale}
              fill="url(#freeZoneGrad)"
              stroke="#0071E3"
              strokeWidth="1.75"
            />
            <text x="255" y={center - 5.0 * scale + 14} fill="#0071E3" fontSize="10" fontWeight="bold">
              5 km Free Boundary
            </text>

            {/* Customer Pin */}
            <circle cx={center} cy={center} r="7" fill="#111111" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx={center} cy={center} r="18" fill="none" stroke="#111111" strokeOpacity="0.2" strokeWidth="1.5" />
            <text x={center} y={center + 24} textAnchor="middle" fill="#111111" fontSize="11" fontWeight="bold">
              Customer Pin
            </text>

            {/* Worker Pins */}
            {dynamicWorkers.map((w) => {
              const dLatKm = (w.coordinates.lat - location.lat) * 111.0;
              const dLngKm = (w.coordinates.lng - location.lng) * 98.0;
              const pxX = center + dLngKm * scale;
              const pxY = center - dLatKm * scale;

              const isSelected = selectedWorkerId === w.id;
              const pinColor = !w.isWithin10km ? '#FF3B30' : w.isFreeZone ? '#0071E3' : '#FF9500';

              return (
                <g
                  key={w.id}
                  onClick={() => onSelectWorker && onSelectWorker(w.id)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
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
                    fontWeight="500"
                  >
                    {w.distanceKm}km
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-[#6E6E73] font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3]" />
              <span>0–5 km (Free)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500]" />
              <span>5–10 km (Slab)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B30]" />
              <span>&gt;10 km (Ineligible)</span>
            </span>
          </div>
        </div>

        {/* Right: Workers List */}
        <div className="lg:col-span-5 flex flex-col h-[420px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-black/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111]">
              Live Candidates Relative to Pin
            </h3>
            <span className="text-xs text-[#86868B]">{dynamicWorkers.length} scanned</span>
          </div>

          <div className="overflow-y-auto space-y-2.5 py-3 pr-1 flex-1">
            {dynamicWorkers.map((w) => {
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
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-[#111111]">{w.id}: {w.name}</span>
                      <span className="text-[11px] text-[#6E6E73]">({w.trade})</span>
                    </div>
                    {w.isWithin10km ? (
                      <Badge variant={w.isFreeZone ? 'accent' : 'warning'} size="sm">
                        {w.distanceKm} km ({w.isFreeZone ? 'Free travel' : 'Slab fee'})
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="sm">
                        {w.distanceKm} km (&gt;10km Excluded)
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-[#6E6E73]">
                    <span>★ {w.rating.toFixed(1)} ({w.completedJobs} jobs)</span>
                    <span className="font-semibold text-[#111111]">₹{w.estimatedQuote}</span>
                    <span className="capitalize">{w.availabilityStatus}</span>
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
