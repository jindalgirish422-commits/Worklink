import React from 'react';
import {
  DollarSign,
  Receipt,
  Clock,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Tag,
  AlertCircle,
  Wrench,
  Info,
} from 'lucide-react';
import { PriceEstimate, FinalPriceCalculation } from '../../services/pricingEngine';
import { Badge } from '../ui/Badge';

export interface TransparentPriceSummaryProps {
  mode: 'estimate' | 'final' | 'comparison';
  estimate?: PriceEstimate | null;
  finalCalculation?: FinalPriceCalculation | null;
  workingDurationFormatted?: string;
  isSimulated?: boolean;
}

export const TransparentPriceSummary: React.FC<TransparentPriceSummaryProps> = ({
  mode,
  estimate,
  finalCalculation,
  workingDurationFormatted,
  isSimulated = true,
}) => {
  return (
    <div className="p-4 sm:p-6 md:p-7 rounded-2xl sm:rounded-3xl bg-white/95 sm:bg-white/90 backdrop-blur-md sm:backdrop-blur-xl border border-white/80 glass-specular-edge shadow-sm space-y-4 sm:space-y-5 motion-glass-appear hover-lift text-xs">
      {/* Header with Clear Labeling: ESTIMATED vs FINAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/5 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#111111] text-white flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4 text-[#34C759]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                {mode === 'estimate'
                  ? 'Pre-Service Price Estimate'
                  : mode === 'final'
                  ? 'Post-Service Final Invoice'
                  : 'Transparent Price Comparison'}
              </h3>
              <Badge
                variant={mode === 'final' ? 'success' : 'accent'}
                size="sm"
                className="font-extrabold tracking-wider"
              >
                {mode === 'estimate' ? 'ESTIMATED' : mode === 'final' ? 'FINAL' : 'ESTIMATED vs FINAL'}
              </Badge>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">
              WorkLink Fair Tariff Standard • 100% itemized pricing with zero hidden surcharges
            </p>
          </div>
        </div>

        {isSimulated && (
          <span className="text-[10px] font-mono font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 self-start sm:self-auto">
            Test Calculation Mode
          </span>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODE 1: ESTIMATE BREAKDOWN                                     */}
      {/* ============================================================== */}
      {mode === 'estimate' && estimate && (
        <div className="space-y-4">
          <div className="space-y-2.5 text-[#111111]">
            {/* 1. Labour */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">Base Labour</span>
                <span className="text-[11px] text-[#86868B]">
                  {estimate.estimatedHours} hrs estimated @ ₹{estimate.hourlyRate}/hr
                </span>
              </div>
              <span className="font-bold text-sm">₹{estimate.baseLabour}</span>
            </div>

            {/* 2. Travel */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">Estimated Travel Expense</span>
                <span className="text-[11px] text-[#86868B]">
                  {estimate.distanceKm.toFixed(1)} km distance (
                  {estimate.distanceKm <= 5 ? (
                    <strong className="text-[#34C759]">0–5 km Free Zone</strong>
                  ) : (
                    '5–10 km configurable slab'
                  )}
                  )
                </span>
              </div>
              <span className="font-bold text-sm">
                {estimate.travelCharge === 0 ? (
                  <span className="text-[#34C759]">₹0 (FREE)</span>
                ) : (
                  `₹${estimate.travelCharge}`
                )}
              </span>
            </div>

            {/* 3. Platform Fee */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">WorkLink Platform Fee (8%)</span>
                <span className="text-[11px] text-[#86868B]">
                  Platform dispatch, verified safety, &amp; 100% resolution guarantee
                </span>
              </div>
              <span className="font-bold text-sm">₹{estimate.platformFee}</span>
            </div>

            {/* 4. Promotional Discount */}
            <div className="flex justify-between items-center py-1 text-[#1B8738]">
              <div>
                <span className="font-semibold block">Welcome Promotional Credit</span>
                <span className="text-[11px] text-[#34C759]">Standard first-service credit</span>
              </div>
              <span className="font-bold text-sm">-₹{estimate.discount}</span>
            </div>
          </div>

          {/* Bottom Total Bar */}
          <div className="pt-3 border-t border-black/10 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#86868B] block">
                ESTIMATED TOTAL
              </span>
              <span className="text-[11px] text-[#86868B]">
                Pay nothing upfront. Final price settled only after completion.
              </span>
            </div>
            <span className="text-3xl font-extrabold text-[#111111] tracking-tight">
              ₹{estimate.estimatedTotal}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: FINAL BREAKDOWN                                        */}
      {/* ============================================================== */}
      {mode === 'final' && finalCalculation && (
        <div className="space-y-4">
          <div className="space-y-2.5 text-[#111111]">
            {/* 1. Actual Labour & Working Time */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">Actual Labour</span>
                <span className="text-[11px] text-[#86868B]">
                  Working time: <strong className="text-[#0071E3]">{workingDurationFormatted || `${finalCalculation.actualHours} hrs`}</strong> ({finalCalculation.actualHours} hrs billable @ ₹{finalCalculation.hourlyRate}/hr)
                </span>
              </div>
              <span className="font-bold text-sm">₹{finalCalculation.actualLabour}</span>
            </div>

            {/* 2. Travel */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">Travel Expense</span>
                <span className="text-[11px] text-[#86868B]">
                  {finalCalculation.distanceKm.toFixed(1)} km customer distance (
                  {finalCalculation.distanceKm <= 5 ? (
                    <strong className="text-[#34C759]">0–5 km Free Zone</strong>
                  ) : (
                    '5–10 km configurable slab'
                  )}
                  )
                </span>
              </div>
              <span className="font-bold text-sm">
                {finalCalculation.travelCharge === 0 ? (
                  <span className="text-[#34C759]">₹0 (FREE)</span>
                ) : (
                  `₹${finalPriceCalcTravel(finalCalculation.travelCharge)}`
                )}
              </span>
            </div>

            {/* 3. Approved Additional Work & Spares */}
            <div className="flex justify-between items-start py-1">
              <div>
                <span className="font-semibold block">Approved Additional Work &amp; Spares</span>
                <span className="text-[11px] text-[#86868B] block">
                  {finalCalculation.additionalWorkItems.filter((i) => i.approved).length > 0
                    ? finalCalculation.additionalWorkItems
                        .filter((i) => i.approved)
                        .map((i) => `${i.name} (₹${i.cost})`)
                        .join(', ')
                    : 'No additional spares added'}
                </span>
              </div>
              <span className="font-bold text-sm">₹{finalCalculation.additionalWorkTotal}</span>
            </div>

            {/* 4. Platform Fee */}
            <div className="flex justify-between items-center py-1">
              <div>
                <span className="font-semibold block">WorkLink Platform Fee (8%)</span>
                <span className="text-[11px] text-[#86868B]">
                  Service guarantee &amp; resolution protection
                </span>
              </div>
              <span className="font-bold text-sm">₹{finalCalculation.platformFee}</span>
            </div>

            {/* 5. Promotional Discount */}
            <div className="flex justify-between items-center py-1 text-[#1B8738]">
              <div>
                <span className="font-semibold block">Promotional Discount</span>
                <span className="text-[11px] text-[#34C759]">Standard credit</span>
              </div>
              <span className="font-bold text-sm">-₹{finalCalculation.discount}</span>
            </div>
          </div>

          {/* Bottom Total Bar */}
          <div className="pt-3 border-t border-black/10 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#34C759] block">
                FINAL PAYABLE AMOUNT
              </span>
              <span className="text-[11px] text-[#86868B]">
                All taxes &amp; fees included • Verified by customer
              </span>
            </div>
            <span className="text-3xl font-extrabold text-[#111111] tracking-tight">
              ₹{finalCalculation.finalTotal}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: COMPARISON (ESTIMATED vs FINAL)                        */}
      {/* ============================================================== */}
      {mode === 'comparison' && estimate && finalCalculation && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 pb-2">
            <div className="p-3 rounded-2xl bg-[#F5F5F7] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-[#86868B] block">
                ESTIMATED
              </span>
              <span className="text-xl font-bold text-[#111111]">₹{estimate.estimatedTotal}</span>
              <span className="text-[10px] text-[#6E6E73] block">
                {estimate.estimatedHours}h initial quote
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 block">
                FINAL AMOUNT
              </span>
              <span className="text-xl font-bold text-emerald-950">₹{finalCalculation.finalTotal}</span>
              <span className="text-[10px] text-emerald-700 block">
                {finalCalculation.actualHours}h actual duration
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#6E6E73] leading-relaxed">
            Variance: {finalCalculation.finalTotal >= estimate.estimatedTotal ? '+' : '-'}₹
            {Math.abs(finalCalculation.finalTotal - estimate.estimatedTotal)} reflects recorded working duration
            ({finalCalculation.actualHours} hrs vs {estimate.estimatedHours} hrs quoted) plus approved spare parts.
          </p>
        </div>
      )}
    </div>
  );
};

function finalPriceCalcTravel(charge: number) {
  return charge;
}
