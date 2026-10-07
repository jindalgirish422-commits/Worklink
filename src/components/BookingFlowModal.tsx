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
  activeBooking?: Booking | null;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  rankedWorker,
  job,
  onBookingConfirmed,
  activeBooking,
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
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [hoursError, setHoursError] = useState<string | null>(null);
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
    let hasError = false;
    const digitsOnly = customerPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      setPhoneError('Please enter a valid 10-digit phone number for dispatch.');
      hasError = true;
    } else {
      setPhoneError(null);
    }

    if (estimatedHours < 0.5 || estimatedHours > 12) {
      setHoursError('Estimated duration must be between 0.5 and 12 hours.');
      hasError = true;
    } else {
      setHoursError(null);
    }

    if (hasError) return;

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

          {/* Edge Case Warning: Duplicate Active Booking */}
          {activeBooking && ['requested', 'accepted', 'in_progress'].includes(activeBooking.status) && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Concurrent Booking In Progress</span>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  You currently have an active booking (#{activeBooking.id.slice(0, 8)}) with <strong>{activeBooking.worker.name}</strong> for {activeBooking.job.serviceCategory}. Confirming this request will create a separate concurrent dispatch.
                </p>
              </div>
            </div>
          )}

          {/* Edge Case Advisory: Worker Unavailable Slot Guard */}
          {worker.availabilityStatus !== 'immediate' && selectedTimeSlot === 'Immediate (<45m)' && (
            <div className="p-3.5 rounded-2xl bg-[#0071E3]/10 border border-[#0071E3]/25 text-[#0071E3] text-xs flex items-start space-x-2.5">
              <Clock className="w-4 h-4 text-[#0071E3] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Arrival Window Advisory</span>
                <p className="text-[11px] text-[#0071E3]/90 mt-0.5 leading-relaxed">
                  {worker.name} is currently flagged as {worker.availabilityStatus === 'tomorrow' ? 'booked until tomorrow' : 'busy'}. Immediate dispatch may experience delay. Recommended: select a scheduled morning or afternoon slot.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. ESTIMATE: Transparent Breakdown & Clear Numbers (Glass Card) */}
          {/* ============================================================== */}
          <TransparentPriceSummary mode="estimate" estimate={priceEstimate} isSimulated={true} />

          {/* Contact & Hours Inputs with Validation */}
          <div className="p-4 rounded-2xl bg-white border border-black/8 space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#86868B] uppercase font-mono block mb-1">
                  Customer Contact Phone *
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="+91 98712 34567"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium text-[#111111] bg-white outline-none focus:border-[#0071E3] ${
                    phoneError ? 'border-[#FF3B30] bg-red-50/20' : 'border-black/10'
                  }`}
                />
                {phoneError && (
                  <span className="text-[10px] text-[#FF3B30] font-semibold mt-1 block">
                    {phoneError}
                  </span>
                )}
              </div>

              <div>
                <label className="text-[10px] text-[#86868B] uppercase font-mono block mb-1">
                  Estimated Work Duration (Hours)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0.5"
                    max="12"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEstimatedHours(val);
                      if (hoursError) setHoursError(null);
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium text-[#111111] bg-white outline-none focus:border-[#0071E3] ${
                      hoursError ? 'border-[#FF3B30] bg-red-50/20' : 'border-black/10'
                    }`}
                  />
                  <span className="text-xs text-[#86868B] shrink-0 font-medium">hrs</span>
                </div>
                {hoursError && (
                  <span className="text-[10px] text-[#FF3B30] font-semibold mt-1 block">
                    {hoursError}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-black/5 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#6E6E73] gap-1">
              <span>Service Location: <strong className="text-[#111111]">{job.location.address}</strong></span>
              <span className="text-[#34C759] font-medium flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 inline" />
                <span>Fair Pricing &amp; Zero Cancellation Guarantee</span>
              </span>
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
