import React, { useState } from 'react';
import {
  ArrowRight,
} from 'lucide-react';
import { RankedWorker, JobRequest, Booking } from '../types';
import { calculateEstimatedPrice } from '../services/pricingEngine';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

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
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title="Review &amp; Confirm Booking"
      subtitle="WorkLink Pre-Service Cost Estimate &amp; Dispatch Confirmation"
      footer={
        <div className="w-full flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handleConfirm}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm &amp; Dispatch Worker
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Selected Worker Summary */}
        <div className="flex items-center space-x-3.5 p-3.5 bg-[#F5F5F7] rounded-2xl border border-black/5">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="md"
            isVerified={worker.isVerified}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-[#111111] truncate">
                {worker.name}
              </span>
              <Badge variant="accent" size="sm">
                {rankedWorker.totalScore}% Match
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] truncate">
              {worker.trade} • {worker.distanceKm.toFixed(1)} km away
            </p>
          </div>
        </div>

        {/* Duration Selector */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E6E73] block mb-2">
            Estimated Service Hours
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[1.0, 2.0, 3.0].map((hrs) => (
              <Button
                key={hrs}
                type="button"
                variant={estimatedHours === hrs ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setEstimatedHours(hrs)}
              >
                {hrs} Hour{hrs > 1 ? 's' : ''} (₹{worker.hourlyRate * hrs})
              </Button>
            ))}
          </div>
          <span className="text-[11px] text-[#86868B] mt-1.5 block">
            Actual amount is dynamically recalculated via the live service timer after completion.
          </span>
        </div>

        {/* Cost Breakdown */}
        <div className="p-4 bg-[#FBFBFD] rounded-2xl border border-black/5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-black/5 font-bold uppercase tracking-wider text-[#86868B] text-[10px]">
            <span>Item</span>
            <span>Estimated Fee</span>
          </div>

          <div className="flex justify-between text-[#111111]">
            <span>Labour Estimate ({estimatedHours} hrs @ ₹{worker.hourlyRate}/hr)</span>
            <span className="font-semibold">₹{priceEstimate.baseLabour}</span>
          </div>

          <div className="flex justify-between text-[#111111]">
            <div>
              <span>Travel Expense ({worker.distanceKm.toFixed(1)} km)</span>
              <span className="text-[10px] text-[#86868B] block">{priceEstimate.travelExplanation}</span>
            </div>
            <span className="font-semibold">
              {priceEstimate.travelCharge === 0 ? (
                <span className="text-[#1B8738]">FREE</span>
              ) : (
                `₹${priceEstimate.travelCharge}`
              )}
            </span>
          </div>

          <div className="flex justify-between text-[#111111]">
            <span>Platform Service Fee (8%)</span>
            <span className="font-semibold">₹{priceEstimate.platformFee}</span>
          </div>

          <div className="flex justify-between text-[#1B8738]">
            <span>Promotional Welcome Discount</span>
            <span className="font-semibold">-₹{priceEstimate.discount}</span>
          </div>

          <div className="pt-2.5 border-t border-black/5 flex justify-between items-baseline text-sm font-bold text-[#111111]">
            <span>Estimated Total (Pre-Service)</span>
            <span className="text-xl text-[#0071E3]">₹{priceEstimate.estimatedTotal}</span>
          </div>
        </div>

        {/* Address and Phone */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#111111] block mb-1">
              Service Address
            </label>
            <div className="p-3 bg-[#F5F5F7] rounded-xl text-xs text-[#111111] border border-black/5">
              {job.location.address}
            </div>
          </div>

          <Input
            label="Contact Mobile"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};
