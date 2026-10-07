import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Navigation,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { CustomerLocation, Worker } from '../types';

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
  const [activeTab, setActiveTab] = useState<'radar' | 'breakdown'>('radar');

  // Compute dynamic distance for every worker relative to current user coords
  // (using Haversine or projected Euclidean distance)
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

  // Radar mapping coordinates: center is (250, 250), radius 210 represents 12 km
  // 1 km = 210 / 12 = 17.5 px
  const center = 250;
  const scale = 210 / 12; // px per km

  return (
    <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm mb-8">
      {/* Title & Location Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Compass className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Dynamic 10 km Service Zone Radar
            </h2>
            <span className="badge-subtle bg-indigo-50 text-indigo-700 border border-indigo-100/60 font-semibold text-[11px]">
              Spatial Feasibility
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            The service zone is created relative to your exact pin. When you change location, the 10 km feasibility zone moves, dynamically recalculating the eligible worker pool and travel fee tiers.
          </p>
        </div>

        {/* Quick Locality Shift Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 font-medium mr-1">Shift Center:</span>
          {PRESET_LOCALITIES.map((loc, idx) => {
            const isSelected = location.lat === loc.lat && location.lng === loc.lng;
            return (
              <button
                key={idx}
                onClick={() =>
                  onUpdateLocation({
                    address: loc.address,
                    lat: loc.lat,
                    lng: loc.lng,
                    radiusKm: 10.0,
                  })
                }
                className={`text-[11px] px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {loc.name.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Zone Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              0 – 5 km Zone
            </span>
            <span className="badge-subtle bg-blue-600 text-white font-bold">
              {freeZoneCount} Workers
            </span>
          </div>
          <p className="text-xs text-blue-700 mt-1 font-medium">
            Free Travel Zone — Zero travel surcharge applied.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              5 – 10 km Zone
            </span>
            <span className="badge-subtle bg-amber-600 text-white font-bold">
              {slabZoneCount} Workers
            </span>
          </div>
          <p className="text-xs text-amber-700 mt-1 font-medium">
            Configurable Slab Charge — Travel fee per km above 5 km.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wider">
              &gt; 10 km Cutoff
            </span>
            <span className="badge-subtle bg-rose-600 text-white font-bold">
              {outsideZoneCount} Ineligible
            </span>
          </div>
          <p className="text-xs text-rose-700 mt-1 font-medium">
            Strict Boundary — Workers outside 10 km are excluded from matching.
          </p>
        </div>
      </div>

      {/* Main Radar / Map Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: SVG Geometric Radar */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 relative overflow-hidden">
          <div className="absolute top-3 left-4 flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Center: {location.address.split(',')[0]}</span>
          </div>

          <svg viewBox="0 0 500 500" className="w-full max-w-[420px] aspect-square">
            <defs>
              <radialGradient id="freeZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.04" />
              </radialGradient>
              <radialGradient id="slabZoneGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </radialGradient>
            </defs>

            {/* Grid background lines */}
            <line x1="250" y1="20" x2="250" y2="480" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
            <line x1="20" y1="250" x2="480" y2="250" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />

            {/* Outer Ineligible Cutoff Boundary (>10 km) */}
            <circle
              cx={center}
              cy={center}
              r={11.4 * scale}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* 10 km Hard Constraint Boundary */}
            <circle
              cx={center}
              cy={center}
              r={10.0 * scale}
              fill="url(#slabZoneGrad)"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="6,3"
            />
            <text x="255" y={center - 10.0 * scale + 14} fill="#b45309" fontSize="10" fontWeight="bold">
              10 km Hard Cutoff
            </text>

            {/* 5 km Free Travel Zone */}
            <circle
              cx={center}
              cy={center}
              r={5.0 * scale}
              fill="url(#freeZoneGrad)"
              stroke="#3b82f6"
              strokeWidth="2"
            />
            <text x="255" y={center - 5.0 * scale + 14} fill="#1d4ed8" fontSize="10" fontWeight="bold">
              5 km Free Boundary
            </text>

            {/* Center Customer Pin */}
            <circle cx={center} cy={center} r="7" fill="#0f172a" stroke="#ffffff" strokeWidth="2.5" />
            <circle cx={center} cy={center} r="18" fill="none" stroke="#0f172a" strokeOpacity="0.25" strokeWidth="1.5" />
            <text x={center} y={center + 24} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">
              Customer
            </text>

            {/* Render Worker Pins */}
            {dynamicWorkers.map((w) => {
              // Calculate angle and distance relative to user
              const dLatKm = (w.coordinates.lat - location.lat) * 111.0;
              const dLngKm = (w.coordinates.lng - location.lng) * 98.0;
              const pxX = center + dLngKm * scale;
              const pxY = center - dLatKm * scale;

              const isSelected = selectedWorkerId === w.id;
              const pinColor = !w.isWithin10km ? '#ef4444' : w.isFreeZone ? '#2563eb' : '#d97706';

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
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    className="drop-shadow-sm"
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
                    fill="#64748b"
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
          <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>0–5 km (Free)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>5–10 km (Slab)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>&gt;10 km (Ineligible)</span>
            </span>
          </div>
        </div>

        {/* Right: Workers in Dynamic Radius List */}
        <div className="lg:col-span-5 flex flex-col h-[420px] overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Workers Relative to Pin
            </h3>
            <span className="text-xs text-slate-500">{dynamicWorkers.length} scanned</span>
          </div>

          <div className="overflow-y-auto space-x-0 space-y-2.5 py-3 pr-1 flex-1">
            {dynamicWorkers.map((w) => {
              const isSelected = selectedWorkerId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWorker && onSelectWorker(w.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{w.id}: {w.name}</span>
                      <span className="text-[11px] text-slate-500">({w.trade})</span>
                    </div>
                    {w.isWithin10km ? (
                      <span
                        className={`badge-subtle text-[10px] font-bold ${
                          w.isFreeZone
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {w.distanceKm} km ({w.isFreeZone ? 'Free travel' : 'Slab fee'})
                      </span>
                    ) : (
                      <span className="badge-subtle bg-rose-100 text-rose-800 text-[10px] font-bold">
                        {w.distanceKm} km (&gt;10km Excluded)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-600">
                    <span>★ {w.rating.toFixed(1)} ({w.completedJobs} jobs)</span>
                    <span className="font-semibold text-slate-800">₹{w.estimatedQuote}</span>
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
