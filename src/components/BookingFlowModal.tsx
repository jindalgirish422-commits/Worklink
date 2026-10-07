import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  ArrowRight,
  Sparkles,
  Check,
  CheckCircle2,
  DollarSign,
  Info,
} from 'lucide-react';
import { RankedWorker, JobRequest, Booking, BookingStatus } from '../types';
import { calculateEstimatedPrice } from '../services/pricingEngine';
import { getTravelBand } from '../services/locationService';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { TransparentPriceSummary } from './pricing/TransparentPriceSummary';

export interface BookingFlowModalProps {
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
  const travelBand = getTravelBand(worker.distanceKm);
  const firstName = worker.name.split(' ')[0];

  // Booking Flow Form State
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'scheduled'>('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    worker.availabilityStatus === 'immediate' ? 'Immediate (<45m)' : 'Morning (09:00 - 12:00)'
  );
  const [customDate, setCustomDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [estimatedHours, setEstimatedHours] = useState(2.0);
  const [customerPhone, setCustomerPhone] = useState('+91 98712 34567');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'details' | 'confirmed'>('details');

  const priceEstimate = calculateEstimatedPrice(worker.hourlyRate, estimatedHours, worker.distanceKm);

  const formattedDateString =
    selectedDate === 'today'
      ? 'Today'
      : selectedDate === 'tomorrow'
      ? 'Tomorrow'
      : customDate;

  const handleConfirm = () => {
    setIsSubmitting(true);

    setTimeout(() => {
      // Create initial booking with state: 'requested'
      const newBooking: Booking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        job,
        worker,
        status: 'requested',
        scheduledDate: formattedDateString,
        scheduledTimeSlot: selectedTimeSlot,
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
      setStep('confirmed');

      // Seamlessly notify parent after brief confirmed state
      setTimeout(() => {
        onBookingConfirmed(newBooking);
      }, 900);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 rounded-xl bg-[#111111] text-white">
            <Calendar className="w-4 h-4 text-[#0071E3]" />
          </span>
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Schedule &amp; Confirm Booking
            </h3>
            <p className="text-[11px] text-[#6E6E73] font-medium">
              Calm Dispatch • Clear Pre-Service Estimate
            </p>
          </div>
        </div>
      }
      footer={
        step === 'details' ? (
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 sm:p-2 bg-white/95 sm:bg-white/90 backdrop-blur-md sm:backdrop-blur-xl rounded-2xl border border-black/8 sm:border-white/80 glass-specular-edge motion-glass-appear">
            <div className="flex items-center justify-between sm:justify-start space-x-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#86868B] block">
                  Total Estimate
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
                  ₹{priceEstimate.estimatedTotal}
                </span>
              </div>
              <span className="text-[11px] text-[#34C759] font-medium sm:hidden">
                {travelBand.band === 'core_free' ? '• Free Core Zone' : `• +₹${travelBand.travelCharge} Travel`}
              </span>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Button variant="ghost" size="md" onClick={onClose} className="hidden sm:inline-flex">
                Cancel
              </Button>
              <Button
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                onClick={handleConfirm}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold min-h-[48px] py-3.5 px-6 shadow-md justify-center active-press text-sm"
              >
                Confirm &amp; Request {firstName}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      {step === 'details' ? (
        <div className="space-y-6 pb-2">
          {/* ============================================================== */}
          {/* 1. WORKER SUMMARY: Calm continuation of recommendation        */}
          {/* ============================================================== */}
          <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <Avatar
                src={worker.avatar}
                alt={worker.name}
                size="lg"
                isVerified={worker.isVerified}
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-base font-bold text-[#111111] tracking-tight">
                    {worker.name}
                  </h4>
                  <Badge variant="success" size="sm">
                    Verified Pro
                  </Badge>
                </div>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  {worker.trade} • {worker.experienceYears}y Trade Practice • {worker.distanceKm.toFixed(1)} km away
                </p>
              </div>
            </div>

            {rankedWorker.totalScore && (
              <div className="text-right hidden sm:block">
                <span className="text-xs font-mono text-[#0071E3] font-bold block">
                  {rankedWorker.totalScore}% Match
                </span>
                <span className="text-[10px] text-[#86868B]">Rank #{rankedWorker.rank}</span>
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 2. SUBTLE GLASS BOOKING PANEL: Date & Time Selection          */}
          {/* ============================================================== */}
          <div className="p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xs glass-specular-edge space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-2 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Select Service Date</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'today', label: 'Today', sub: 'Immediate dispatch' },
                  { id: 'tomorrow', label: 'Tomorrow', sub: 'Advance slot' },
                  { id: 'scheduled', label: 'Custom Date', sub: 'Flexible' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedDate(opt.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all text-xs ${
                      selectedDate === opt.id
                        ? 'bg-[#111111] text-white border-[#111111] shadow-xs'
                        : 'bg-white text-[#111111] border-black/8 hover:border-black/20'
                    }`}
                  >
                    <span className="font-bold block">{opt.label}</span>
                    <span
                      className={`text-[10px] block mt-0.5 ${
                        selectedDate === opt.id ? 'text-[#86868B]' : 'text-[#6E6E73]'
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>

              {selectedDate === 'scheduled' && (
                <div className="mt-3">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-xs font-medium text-[#111111] bg-white outline-none focus:border-[#0071E3]"
                  />
                </div>
              )}
            </div>

            {/* Time Slot Selector */}
            <div className="pt-3 border-t border-black/5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111] block mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0071E3]" />
                <span>Select Arrival Window</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  'Immediate (<45m)',
                  'Morning (09:00 - 12:00)',
                  'Afternoon (13:00 - 17:00)',
                  'Evening (17:00 - 20:00)',
                ].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`p-2.5 rounded-xl text-center border text-xs font-semibold transition-all hover-lift active-press ${
                      selectedTimeSlot === slot
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white text-[#6E6E73] hover:text-[#111111] border-black/8'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 3. ESTIMATE: Transparent Breakdown & Clear Numbers (Glass Card) */}
          {/* ============================================================== */}
          <TransparentPriceSummary mode="estimate" estimate={priceEstimate} isSimulated={true} />

          {/* Contact & Address Confirmation */}
          <div className="p-4 rounded-2xl bg-white border border-black/8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-[#86868B] uppercase font-mono block">
                Service Address
              </span>
              <span className="font-semibold text-[#111111]">{job.location.address}</span>
            </div>

            <div className="sm:text-right">
              <span className="text-[10px] text-[#86868B] uppercase font-mono block">
                Customer Phone
              </span>
              <span className="font-semibold text-[#111111]">{customerPhone}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmed State Transition */
        <div className="py-12 px-6 text-center space-y-4 motion-glass-appear">
          <div className="w-16 h-16 rounded-full bg-[#34C759]/15 text-[#34C759] flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-[#111111] tracking-tight">
              Booking Created
            </h3>
            <p className="text-sm text-[#6E6E73] max-w-sm mx-auto">
              Your request has been dispatched to <strong>{worker.name}</strong> for {formattedDateString} ({selectedTimeSlot}).
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/5 text-xs text-[#111111] font-mono">
            <span>Status: REQUESTED</span>
            <span>•</span>
            <span>Awaiting Worker Acceptance</span>
          </div>
        </div>
      )}
    </Modal>
  );
};
