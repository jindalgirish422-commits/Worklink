export interface TariffConfig {
  freeTravelDistanceKm: number; // default: 5.0 km
  perKmRateAboveFreeZone: number; // default: ₹25 / km
  platformFeePercentage: number; // default: 8% (0.08)
  emergencySurchargeFixed: number; // default: ₹0
  standardDiscountFixed: number; // promo discount: ₹50
}

export const DEFAULT_TARIFF: TariffConfig = {
  freeTravelDistanceKm: 5.0,
  perKmRateAboveFreeZone: 25.0,
  platformFeePercentage: 0.08,
  emergencySurchargeFixed: 0,
  standardDiscountFixed: 50,
};

export interface PriceEstimate {
  hourlyRate: number;
  estimatedHours: number;
  baseLabour: number;
  distanceKm: number;
  travelCharge: number;
  travelExplanation: string;
  platformFee: number;
  discount: number;
  estimatedTotal: number;
}

export interface FinalPriceCalculation {
  hourlyRate: number;
  actualHours: number;
  actualLabour: number;
  distanceKm: number;
  travelCharge: number;
  additionalWorkTotal: number;
  additionalWorkItems: Array<{ name: string; cost: number; approved: boolean }>;
  platformFee: number;
  discount: number;
  finalTotal: number;
}

/**
 * Calculates travel charge based on 10 km service zone rules:
 * 0–5 km: 0 (free zone)
 * 5–10 km: (distance - 5) * perKmRate
 * >10 km: Ineligible
 */
export function calculateTravelCharge(
  distanceKm: number,
  tariff: TariffConfig = DEFAULT_TARIFF
): { travelCharge: number; explanation: string } {
  if (distanceKm <= tariff.freeTravelDistanceKm) {
    return {
      travelCharge: 0,
      explanation: `Free Travel Zone: worker is within ${tariff.freeTravelDistanceKm} km (${distanceKm.toFixed(1)} km)`,
    };
  }

  if (distanceKm > 10.0) {
    return {
      travelCharge: -1,
      explanation: `Ineligible: ${distanceKm.toFixed(1)} km exceeds 10 km service zone limit`,
    };
  }

  const billableDistance = distanceKm - tariff.freeTravelDistanceKm;
  const charge = Math.round(billableDistance * tariff.perKmRateAboveFreeZone);
  return {
    travelCharge: charge,
    explanation: `Slab Travel Charge: ${billableDistance.toFixed(1)} km beyond 5 km free threshold @ ₹${tariff.perKmRateAboveFreeZone}/km = ₹${charge}`,
  };
}

/**
 * Pre-booking transparent estimate calculation
 */
export function calculateEstimatedPrice(
  hourlyRate: number,
  estimatedHours: number,
  distanceKm: number,
  tariff: TariffConfig = DEFAULT_TARIFF
): PriceEstimate {
  const baseLabour = Math.round(hourlyRate * estimatedHours);
  const { travelCharge, explanation } = calculateTravelCharge(distanceKm, tariff);
  const safeTravel = Math.max(0, travelCharge);
  const platformFee = Math.round(baseLabour * tariff.platformFeePercentage);
  const discount = tariff.standardDiscountFixed;

  const estimatedTotal = Math.max(0, baseLabour + safeTravel + platformFee - discount);

  return {
    hourlyRate,
    estimatedHours,
    baseLabour,
    distanceKm,
    travelCharge: safeTravel,
    travelExplanation: explanation,
    platformFee,
    discount,
    estimatedTotal,
  };
}

/**
 * Post-service final calculation based on actual working hours and approved additions
 */
export function calculateFinalPrice(
  hourlyRate: number,
  actualHours: number,
  distanceKm: number,
  additionalWorkItems: Array<{ name: string; cost: number; approved: boolean }> = [],
  tariffOrDiscount: TariffConfig | number = DEFAULT_TARIFF
): FinalPriceCalculation {
  const tariff: TariffConfig =
    typeof tariffOrDiscount === 'number'
      ? { ...DEFAULT_TARIFF, standardDiscountFixed: tariffOrDiscount }
      : tariffOrDiscount;

  const actualLabour = Math.round(hourlyRate * actualHours);
  const { travelCharge } = calculateTravelCharge(distanceKm, tariff);
  const safeTravel = Math.max(0, travelCharge);

  const additionalWorkTotal = additionalWorkItems
    .filter((item) => item.approved)
    .reduce((sum, item) => sum + item.cost, 0);

  const subtotalForFee = actualLabour + additionalWorkTotal;
  const platformFee = Math.round(subtotalForFee * tariff.platformFeePercentage);
  const discount = tariff.standardDiscountFixed;

  const finalTotal = Math.max(0, actualLabour + safeTravel + additionalWorkTotal + platformFee - discount);

  return {
    hourlyRate,
    actualHours,
    actualLabour,
    distanceKm,
    travelCharge: safeTravel,
    additionalWorkTotal,
    additionalWorkItems,
    platformFee,
    discount,
    finalTotal,
  };
}
