import { CustomerLocation, Worker } from '../types';
import { DEFAULT_TARIFF, TariffConfig } from './pricingEngine';

export const EARTH_RADIUS_KM = 6371.0088; // WGS84 mean earth radius in km
export const DEFAULT_SERVICE_ZONE_KM = 10.0;
export const DEFAULT_FREE_ZONE_KM = 5.0;

export type TravelBand = 'core_free' | 'extended_slab' | 'out_of_zone';

export interface TravelBandInfo {
  band: TravelBand;
  label: string;
  distanceKm: number;
  isEligible: boolean;
  travelCharge: number;
  explanation: string;
  badgeVariant: 'accent' | 'warning' | 'danger';
}

/**
 * Validates coordinate pair
 */
export function isValidCoordinates(coords?: { lat?: number; lng?: number } | null): boolean {
  if (!coords) return false;
  const { lat, lng } = coords;
  if (typeof lat !== 'number' || typeof lng !== 'number') return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * Mathematical Haversine Distance Formula between two geographic coordinates
 */
export function calculateHaversineDistanceKm(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  if (!isValidCoordinates(coord1) || !isValidCoordinates(coord2)) {
    return Infinity;
  }

  const toRad = (degree: number) => (degree * Math.PI) / 180;

  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = EARTH_RADIUS_KM * c;

  // Round to single decimal place with high numerical stability
  return Math.round(rawDist * 10) / 10;
}

/**
 * Determines eligibility strictly based on 10 km service zone boundary
 */
export function isDistanceWithinServiceZone(
  distanceKm: number,
  maxRadiusKm: number = DEFAULT_SERVICE_ZONE_KM
): boolean {
  if (!isFinite(distanceKm) || distanceKm < 0) return false;
  // Worker distance <= 10.0 km is eligible; > 10.0 km is ineligible
  return distanceKm <= maxRadiusKm + 1e-6;
}

/**
 * Categorizes distance into WorkLink's 3 non-negotiable travel bands:
 * - 0–5 km: Core Free Zone
 * - 5–10 km: Extended Zone (Configurable slab charge)
 * - >10 km: Ineligible Cutoff
 */
export function getTravelBand(
  distanceKm: number,
  tariff: TariffConfig = DEFAULT_TARIFF
): TravelBandInfo {
  if (!isFinite(distanceKm) || distanceKm > DEFAULT_SERVICE_ZONE_KM) {
    return {
      band: 'out_of_zone',
      label: '>10 km Cutoff',
      distanceKm: isFinite(distanceKm) ? distanceKm : 999,
      isEligible: false,
      travelCharge: -1,
      explanation: `Ineligible: ${isFinite(distanceKm) ? distanceKm.toFixed(1) : 'Unknown'} km exceeds strict 10 km service boundary`,
      badgeVariant: 'danger',
    };
  }

  if (distanceKm <= tariff.freeTravelDistanceKm) {
    return {
      band: 'core_free',
      label: '0–5 km Core Zone',
      distanceKm,
      isEligible: true,
      travelCharge: 0,
      explanation: `Free Travel Zone: worker is ${distanceKm.toFixed(1)} km away (under ${tariff.freeTravelDistanceKm} km) — ₹0 travel fee`,
      badgeVariant: 'accent',
    };
  }

  // 5–10 km extended zone
  const billableDistance = Math.max(0, distanceKm - tariff.freeTravelDistanceKm);
  const charge = Math.round(billableDistance * tariff.perKmRateAboveFreeZone);

  return {
    band: 'extended_slab',
    label: '5–10 km Extended Zone',
    distanceKm,
    isEligible: true,
    travelCharge: charge,
    explanation: `Extended Zone: ${billableDistance.toFixed(1)} km beyond 5 km free threshold @ ₹${tariff.perKmRateAboveFreeZone}/km = ₹${charge} travel allowance`,
    badgeVariant: 'warning',
  };
}

/**
 * Recalculates distances for all workers relative to new customer location
 */
export function recalculateWorkerDistances(
  workers: Worker[],
  customerLocation: CustomerLocation
): Worker[] {
  if (!isValidCoordinates(customerLocation)) {
    return workers;
  }

  return workers.map((w) => {
    if (!isValidCoordinates(w.coordinates)) {
      return {
        ...w,
        distanceKm: Infinity,
      };
    }
    const dist = calculateHaversineDistanceKm(customerLocation, w.coordinates);
    return {
      ...w,
      distanceKm: dist,
    };
  });
}

/**
 * Location explanation UX copy
 */
export const LOCATION_UX_MESSAGES = {
  ruleSummary: 'Only professionals within your 10 km service area are considered.',
  zoneRationale: 'WorkLink uses your location to find professionals who can actually reach you.',
  zeroCharge: 'Workers within 0–5 km carry zero travel surcharge.',
  extendedCharge: 'Workers between 5–10 km include a nominal transparent travel fee.',
  boundaryEnforcement: 'Workers farther than 10 km are strictly filtered out to prevent dispatch delays.',
};
