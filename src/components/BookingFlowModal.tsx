import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { RankedWorker, JobRequest, Booking } from '../types';
import { calculateEstimatedPrice } from '../services/pricingEngine';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankedWorker: RankedWorker | null;
  job: JobRequest;
  onBookingConfirmed: (booking: Booking) => void;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  rankedWorker,
  job,
  onBookingConfirmed,
}) => {
  if (!isOpen || !rankedWorker) return null;

  const { worker } = rankedWorker;
  const [estimatedHours, setEstimatedHours] = useState(2.0);
  const [customerPhone, setCustomerPhone] = useState('+91 98712 34567');
  const [specialInstructions, setSpecialInstructions] = useState('Please bring nitrogen gas cylinder for leak test.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priceEstimate = calculateEstimatedPrice(worker.hourlyRate, estimatedHours, worker.distanceKm);

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        job,
        worker,
        status: 'accepted',
        elapsedSeconds: 0,
        isTimerRunning: false,
        estimatedHours,
        actualHours: 0,
        travelDistanceKm: worker.distanceKm,
        travelCharge: priceEstimate.travelCharge,
        baseLabourFee: priceEstimate.baseLabour,
        additionalWorkItems: [],
        platformFee: priceEstimate.platformFee,
        discount: priceEstimate.discount,
        estimatedTotal: priceEstimate.estimatedTotal,
        finalTotal: priceEstimate.estimatedTotal,
      };

      setIsSubmitting(false);
      onBookingConfirmed(newBooking);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="apple-card w-full max-w-xl bg-white border border-slate-200 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Review &amp; Confirm Booking
            </h3>
            <p className="text-xs text-slate-500">
              WorkLink Transparent Pre-Service Cost Estimate
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Worker Summary */}
        <div className="flex items-center space-x-3.5 p-3.5 my-4 bg-slate-50 rounded-xl border border-slate-100">
          <img
            src={worker.avatar}
            alt={worker.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">{worker.name}</span>
              <span className="text-xs font-semibold text-blue-600 font-mono">
                {rankedWorker.totalScore}% Match
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {worker.trade} • {worker.distanceKm.toFixed(1)} km away
            </p>
          </div>
        </div>

        {/* Estimated Duration Selector */}
        <div className="mb-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-2">
            Estimated Service Duration
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1.0, 2.0, 3.0].map((hrs) => (
              <button
                key={hrs}
                type="button"
                onClick={() => setEstimatedHours(hrs)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  estimatedHours === hrs
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {hrs} Hour{hrs > 1 ? 's' : ''} (₹{worker.hourlyRate * hrs})
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Actual amount is dynamically recalculated via the live working-hour timer after job execution.
          </span>
        </div>

        {/* Transparent Cost Breakdown */}
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 mb-5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 font-bold uppercase tracking-wider text-slate-500 text-[10px]">
            <span>Item</span>
            <span>Estimated Fee</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>
              Labour Estimate ({estimatedHours} hrs @ ₹{worker.hourlyRate}/hr)
            </span>
            <span className="font-semibold text-slate-900">₹{priceEstimate.baseLabour}</span>
          </div>

          <div className="flex justify-between text-slate-700">
            <div>
              <span>Travel Expense ({worker.distanceKm.toFixed(1)} km)</span>
              <span className="text-[10px] text-slate-400 block">{priceEstimate.travelExplanation}</span>
            </div>
            <span className="font-semibold text-slate-900">
              {priceEstimate.travelCharge === 0 ? (
                <span className="text-emerald-600">FREE (0–5 km)</span>
              ) : (
                `₹${priceEstimate.travelCharge}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-slate-700">
            <span>Platform Service Fee (8%)</span>
            <span className="font-semibold text-slate-900">₹{priceEstimate.platformFee}</span>
          </div>

          <div className="flex justify-between text-emerald-600">
            <span>Early Access Promotional Discount</span>
            <span className="font-semibold">-₹{priceEstimate.discount}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-bold text-slate-900">
            <span>Estimated Total (Pre-Service)</span>
            <span className="text-xl text-blue-600">₹{priceEstimate.estimatedTotal}</span>
          </div>
        </div>

        {/* Customer Details */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Service Address
            </label>
            <div className="p-2.5 bg-slate-100/70 rounded-xl text-xs text-slate-700 border border-slate-200/60">
              {job.location.address}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Contact Phone
            </label>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <span>Confirming with Worker...</span>
            ) : (
              <>
                <span>Confirm Booking &amp; Dispatch</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
