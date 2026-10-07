import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Wrench,
  Sparkles,
  Receipt,
  Star,
  ArrowRight,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertCircle,
  XCircle,
  RotateCcw,
  Edit3,
  Phone,
  Check,
  ArrowLeft,
  DollarSign,
  Info,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, AdditionalWorkItem, BookingStatus } from '../types';
import { calculateFinalPrice } from '../services/pricingEngine';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useToast } from './ui/Toast';

interface JobExecutionTrackerProps {
  booking: Booking | null;
  onUpdateBooking: (updated: Booking) => void;
  onCloseBooking: () => void;
  onCompleteFeedbackLoop: (completedBooking: Booking) => void;
}

export const JobExecutionTracker: React.FC<JobExecutionTrackerProps> = ({
  booking,
  onUpdateBooking,
  onCloseBooking,
  onCompleteFeedbackLoop,
}) => {
  const { showToast } = useToast();

  if (!booking) {
    return (
      <div className="card-premium p-12 bg-[#FFFFFF] text-center max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F0F0F2] text-[#86868B] flex items-center justify-center mx-auto mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[#111111]">
          No Active Service Booking
        </h3>
        <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-sm mx-auto leading-relaxed">
          Match and book a skilled worker from the marketplace to track real-time dispatch, live working-hour timer, transparent post-service billing, and payment.
        </p>
      </div>
    );
  }

  // Timer state
  const [seconds, setSeconds] = useState(booking.elapsedSeconds || (booking.status === 'in_progress' ? 3600 : 0));
  const [timerRunning, setTimerRunning] = useState(booking.status === 'in_progress');

  // Reschedule & Cancel State
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<'today' | 'tomorrow' | 'scheduled'>(
    booking.scheduledDate === 'Tomorrow' ? 'tomorrow' : 'today'
  );
  const [customRescheduleDate, setCustomRescheduleDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [rescheduleSlot, setRescheduleSlot] = useState<string>(
    booking.scheduledTimeSlot || 'Immediate (<45m)'
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('Change of plans');

  // Available add-ons
  const [availableAddons, setAvailableAddons] = useState<AdditionalWorkItem[]>([
    { id: 'add-1', name: 'Inverter Run Capacitor (45µF)', cost: 450, approved: true },
    { id: 'add-2', name: 'High-Pressure Gas Leakage Testing', cost: 350, approved: false },
    { id: 'add-3', name: 'Copper Line Brazing & Valve Joint', cost: 300, approved: false },
  ]);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Punctual & Polite',
    'Accurate Diagnostics',
    'Clean Worksite',
  ]);
  const [feedbackComment, setFeedbackComment] = useState(
    'Arrived on time. Fixed the cooling issue cleanly with transparent billing.'
  );
  const [isPaid, setIsPaid] = useState(booking.status === 'paid' || booking.status === 'rated');

  // Live timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const actualHoursWorked = Math.max(0.5, parseFloat((seconds / 3600).toFixed(2)));

  const finalPriceCalc = calculateFinalPrice(
    booking.worker.hourlyRate,
    actualHoursWorked,
    booking.worker.distanceKm,
    availableAddons
  );

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleTimer = () => {
    const nextState = !timerRunning;
    setTimerRunning(nextState);
    showToast({
      type: 'info',
      title: nextState ? 'Timer Started' : 'Timer Paused',
      message: nextState
        ? 'Recording real-time labour execution.'
        : `Paused at ${formatTime(seconds)}.`,
    });
  };

  const handleToggleAddon = (id: string) => {
    setAvailableAddons((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const toggled = !item.approved;
          showToast({
            type: 'info',
            title: toggled ? 'Spares Approved' : 'Spares Removed',
            message: `${item.name} (${item.cost > 0 ? `₹${item.cost}` : ''})`,
          });
          return { ...item, approved: toggled };
        }
        return item;
      })
    );
  };

  const handleAdvanceStatus = (nextStatus: BookingStatus) => {
    if (nextStatus === 'in_progress') {
      setTimerRunning(true);
      showToast({
        type: 'info',
        title: 'Service In Progress',
        message: `${booking.worker.name} started the job. Working-hour timer is active.`,
      });
    } else if (nextStatus === 'completed') {
      setTimerRunning(false);
      showToast({
        type: 'success',
        title: 'Service Completed',
        message: 'Final invoice generated with recorded timer hours.',
      });
    }

    const updated: Booking = {
      ...booking,
      status: nextStatus,
      elapsedSeconds: seconds,
      actualHours: actualHoursWorked,
      additionalWorkItems: availableAddons.filter((a) => a.approved),
      finalTotal: finalPriceCalc.finalTotal,
    };
    onUpdateBooking(updated);
  };

  const handleProcessPayment = (method: 'UPI' | 'Card' | 'Cash on Delivery') => {
    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      // ignore
    }

    setIsPaid(true);
    const updated: Booking = {
      ...booking,
      status: 'completed',
      paymentMethod: method,
      paymentReference: `PAY-${Date.now().toString().slice(-8)}`,
      actualHours: actualHoursWorked,
      finalTotal: finalPriceCalc.finalTotal,
    };
    onUpdateBooking(updated);

    showToast({
      type: 'success',
      title: 'Payment Confirmed',
      message: `₹${finalPriceCalc.finalTotal} settled via ${method}.`,
    });
  };

  const handleSubmitFeedback = () => {
    const ratedBooking: Booking = {
      ...booking,
      status: 'rated',
      feedback: {
        rating,
        tags: selectedTags,
        comment: feedbackComment,
        submittedAt: new Date().toLocaleTimeString(),
      },
    };
    onUpdateBooking(ratedBooking);
    onCompleteFeedbackLoop(ratedBooking);
    showToast({
      type: 'success',
      title: 'Rating & Feedback Recorded',
      message: `Thank you! Feedback recorded in WorkLink learning loop. Worker rating updated to ${rating}★.`,
    });
  };

  const handleSaveReschedule = () => {
    const formattedDate =
      rescheduleDate === 'today'
        ? 'Today'
        : rescheduleDate === 'tomorrow'
        ? 'Tomorrow'
        : customRescheduleDate;

    const updated: Booking = {
      ...booking,
      scheduledDate: formattedDate,
      scheduledTimeSlot: rescheduleSlot,
    };
    onUpdateBooking(updated);
    setIsRescheduling(false);
    showToast({
      type: 'success',
      title: 'Booking Rescheduled',
      message: `New schedule: ${formattedDate} (${rescheduleSlot}). ${booking.worker.name} notified.`,
    });
  };

  const handleCancelBooking = () => {
    const updated: Booking = {
      ...booking,
      status: 'cancelled',
      cancellationReason: cancelReason,
      cancelledBy: 'customer',
    };
    onUpdateBooking(updated);
    setShowCancelModal(false);
    showToast({
      type: 'warning',
      title: 'Booking Cancelled',
      message: 'Your booking was cancelled with zero fee under the Fair Cancellation Guarantee.',
    });
  };

  // =========================================================================
  // VIEW A: CANCELLED STATE
  // =========================================================================
  if (booking.status === 'cancelled') {
    return (
      <div className="card-premium p-8 bg-[#FFFFFF] max-w-xl mx-auto my-8 space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
          <XCircle className="w-8 h-8" />
        </div>

        <div>
          <Badge variant="neutral" size="sm" className="mb-2">
            BOOKING CANCELLED
          </Badge>
          <h2 className="text-xl font-bold text-[#111111] tracking-tight">
            Booking #{booking.id.slice(0, 8)} Was Cancelled
          </h2>
          <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
            {booking.cancellationReason
              ? `Reason: ${booking.cancellationReason}`
              : booking.cancelledBy === 'worker'
              ? `${booking.worker.name} had a scheduling conflict and could not accept this slot.`
              : 'Cancelled at your request prior to service dispatch.'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F7] text-left text-xs space-y-2 border border-black/5">
          <div className="flex items-center space-x-2 text-[#34C759] font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Zero Prepayment &amp; Cancellation Fee Applied</span>
          </div>
          <p className="text-[#6E6E73] text-[11px] leading-relaxed">
            WorkLink guarantees 100% free cancellation for customer requests prior to job commencement.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <Button variant="primary" size="md" onClick={onCloseBooking}>
            Find Another Professional
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW B: RATED STATE (Completed & Feedback Submitted)
  // =========================================================================
  if (booking.status === 'rated') {
    return (
      <div className="card-premium p-8 bg-[#FFFFFF] max-w-xl mx-auto my-8 space-y-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <Badge variant="success" size="sm" className="mb-2">
            RATED &amp; COMPLETED
          </Badge>
          <h2 className="text-xl font-bold text-[#111111] tracking-tight">
            Service Complete &amp; Feedback Recorded
          </h2>
          <p className="text-xs text-[#6E6E73] mt-1.5">
            Thank you for rating {booking.worker.name}. Your feedback improves the matching engine.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/5 text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#111111]">Your Rating:</span>
            <div className="flex items-center text-[#FF9500]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= (booking.feedback?.rating || 5)
                      ? 'fill-[#FF9500] text-[#FF9500]'
                      : 'text-[#86868B]'
                  }`}
                />
              ))}
            </div>
          </div>
          {booking.feedback?.comment && (
            <p className="text-[#6E6E73] italic">&ldquo;{booking.feedback.comment}&rdquo;</p>
          )}
          <div className="pt-2 flex justify-between border-t border-black/5 text-[11px] text-[#86868B]">
            <span>Settled Amount: ₹{booking.finalTotal}</span>
            <span>Recorded at: {booking.feedback?.submittedAt || 'Today'}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <Button variant="primary" size="md" onClick={onCloseBooking}>
            Return to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PIPELINE STEPPER (Milestone 11 6-State Pipeline)
  // =========================================================================
  const getStepIndex = (status: BookingStatus) => {
    switch (status) {
      case 'requested':
        return 0;
      case 'accepted':
      case 'en_route':
      case 'arrived':
        return 1;
      case 'in_progress':
      case 'paused':
        return 2;
      case 'completed':
      case 'paid':
        return 3;
      case 'rated':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(booking.status);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Stepper Pipeline */}
      <div className="card-premium p-6 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/5 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="accent" size="sm">
                #{booking.id}
              </Badge>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
                {booking.status === 'requested' || booking.status === 'accepted'
                  ? 'Upcoming Service Booking'
                  : 'Live Job Execution &amp; Working-Hour Tracking'}
              </h2>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              WorkLink Pipeline: Requested &rarr; Worker Acceptance &rarr; Service In Progress &rarr; Completed &rarr; Rated
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#86868B] font-medium">Status:</span>
            <Badge
              variant={
                booking.status === 'requested'
                  ? 'accent'
                  : booking.status === 'accepted'
                  ? 'default'
                  : booking.status === 'in_progress'
                  ? 'success'
                  : 'neutral'
              }
              size="md"
            >
              {booking.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stepper Steps (6 Milestone 11 States) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5">
          {[
            { key: 'requested', label: '1. Requested' },
            { key: 'accepted', label: '2. Accepted' },
            { key: 'in_progress', label: '3. In Progress' },
            { key: 'completed', label: '4. Completed' },
            { key: 'rated', label: '5. Rated' },
          ].map((step, idx) => {
            const isCurrent = currentStepIdx === idx;
            const isDone = currentStepIdx > idx;

            return (
              <div
                key={step.key}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-[rgba(0,113,227,0.06)] border-[#0071E3]/40 text-[#0071E3] shadow-xs'
                    : isDone
                    ? 'bg-[rgba(52,199,89,0.08)] border-[rgba(52,199,89,0.22)] text-[#1B8738]'
                    : 'bg-[#FBFBFD] border-black/5 text-[#86868B]'
                }`}
              >
                <span>{step.label}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* UPCOMING BOOKING CARD (When status is REQUESTED or ACCEPTED)          */}
      {/* ===================================================================== */}
      {(booking.status === 'requested' || booking.status === 'accepted') && (
        <div className="p-6 md:p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge shadow-sm space-y-6 animate-fade-in">
          {/* Header Info Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-black/5 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-[#0071E3]" />
                <h3 className="text-xl font-bold text-[#111111] tracking-tight">
                  {booking.status === 'requested'
                    ? 'Awaiting Worker Confirmation'
                    : 'Booking Confirmed with Worker'}
                </h3>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1">
                {booking.status === 'requested'
                  ? `Your request was dispatched to ${booking.worker.name}. They usually respond within 15 minutes.`
                  : `${booking.worker.name} confirmed the schedule. They will arrive within the selected time window.`}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRescheduling(true)}
                className="text-xs font-semibold"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Reschedule
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                className="text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Cancel Booking
              </Button>
            </div>
          </div>

          {/* Worker + Schedule + Price Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Worker Identity */}
            <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block">
                Assigned Professional
              </span>
              <div className="flex items-center space-x-3.5">
                <Avatar
                  src={booking.worker.avatar}
                  alt={booking.worker.name}
                  size="lg"
                  isVerified={booking.worker.isVerified}
                />
                <div>
                  <h4 className="text-base font-bold text-[#111111]">{booking.worker.name}</h4>
                  <p className="text-xs text-[#6E6E73]">
                    {booking.worker.trade} • License: {booking.worker.licenseNumber}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-[#86868B]">
                    <span className="font-semibold text-[#FF9500]">★ {booking.worker.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{booking.worker.distanceKm.toFixed(1)} km away</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-[#6E6E73]">
                <span className="flex items-center space-x-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.worker.phone}</span>
                </span>
                <Badge variant="success" size="sm">
                  10 km Radius
                </Badge>
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block">
                Scheduled Slot
              </span>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[#111111]">
                  <Calendar className="w-4 h-4 text-[#5856D6]" />
                  <span className="font-bold text-base">
                    {booking.scheduledDate || 'Today'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[#6E6E73] text-xs">
                  <Clock className="w-4 h-4 text-[#5856D6]" />
                  <span className="font-medium text-[#111111]">
                    {booking.scheduledTimeSlot || 'Immediate (<45m)'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-black/5 text-xs text-[#6E6E73]">
                <p>
                  Location: <strong className="text-[#111111]">Indiranagar 100ft Rd</strong>
                </p>
                <p className="text-[11px] text-[#0071E3] mt-0.5">
                  {booking.travelDistanceKm <= 5 ? '0–5 km Free Travel Zone' : '5–10 km Band'}
                </p>
              </div>
            </div>

            {/* Transparent Price Estimate */}
            <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B] block">
                Price Estimate
              </span>
              <div className="space-y-1.5 text-xs text-[#6E6E73]">
                <div className="flex justify-between">
                  <span>Base Labour ({booking.estimatedHours || 2}h @ ₹{booking.worker.hourlyRate}/h)</span>
                  <span className="font-semibold text-[#111111]">₹{booking.baseLabourFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel Tariff</span>
                  <span className="font-semibold text-[#111111]">
                    {booking.travelCharge === 0 ? <span className="text-[#34C759]">₹0 (Free)</span> : `₹${booking.travelCharge}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="font-semibold text-[#111111]">₹{booking.platformFee}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black/5 font-extrabold text-base text-[#111111]">
                  <span>Total Estimate</span>
                  <span className="text-[#0071E3]">₹{booking.estimatedTotal}</span>
                </div>
              </div>
              <span className="text-[10px] text-[#86868B] block pt-1">
                Zero prepayment. Pay upon completion.
              </span>
            </div>
          </div>

          {/* Quick Simulation & Progression Actions */}
          <div className="pt-4 border-t border-black/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs text-[#6E6E73]">
              <Info className="w-4 h-4 text-[#0071E3]" />
              {booking.status === 'requested' ? (
                <span>
                  Worker will review request. (You can also switch to Worker Hub tab to test acceptance).
                </span>
              ) : (
                <span>Worker confirmed. Start service when worker arrives at your door.</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {booking.status === 'requested' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAdvanceStatus('accepted')}
                  className="bg-[#34C759] hover:bg-[#2EB150] text-white font-bold"
                >
                  ✓ Simulate Worker Acceptance
                </Button>
              )}

              {booking.status === 'accepted' && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAdvanceStatus('in_progress')}
                  className="bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold"
                >
                  Worker Arrived &rarr; Start Service Clock
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ACTIVE EXECUTION VIEW (When status is IN_PROGRESS or COMPLETED)       */}
      {/* ===================================================================== */}
      {(booking.status === 'in_progress' || booking.status === 'completed') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Worker Dispatch & Timer */}
          <div className="lg:col-span-7 space-y-6">
            {/* Worker Card */}
            <div className="card-premium p-6 bg-[#FFFFFF]">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div className="flex items-center space-x-3.5">
                  <Avatar
                    src={booking.worker.avatar}
                    alt={booking.worker.name}
                    size="lg"
                    isVerified={booking.worker.isVerified}
                  />
                  <div>
                    <h3 className="text-base font-bold text-[#111111]">{booking.worker.name}</h3>
                    <p className="text-xs text-[#6E6E73] font-medium">
                      {booking.worker.trade} • License: {booking.worker.licenseNumber}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-[#86868B]">
                      <span className="font-semibold text-[#111111]">★ {booking.worker.rating.toFixed(1)}</span>
                      <span>•</span>
                      <span>{booking.worker.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge variant="success" size="sm">
                    In Service
                  </Badge>
                  <span className="text-xs text-[#86868B] block mt-1">
                    {booking.worker.distanceKm.toFixed(1)} km away
                  </span>
                </div>
              </div>
            </div>

            {/* Working-Hour Timer */}
            <div className="card-premium p-6 md:p-8 bg-[#111111] text-white">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-[#0071E3] animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Live Working-Hour Timer
                  </h3>
                </div>
                <span className="text-xs text-[#86868B] font-mono">
                  Rate: ₹{booking.worker.hourlyRate}/hr
                </span>
              </div>

              {/* Time Readout */}
              <div className="my-6 text-center">
                <div className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-white">
                  {formatTime(seconds)}
                </div>
                <p className="text-xs text-[#86868B] mt-2 font-medium">
                  Actual Working Time: <span className="text-[#0071E3] font-bold">{actualHoursWorked} Hours</span>
                </p>
                <p className="text-[11px] text-[#6E6E73] mt-1">
                  Live Labour Cost: ₹{Math.round(actualHoursWorked * booking.worker.hourlyRate)}
                </p>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center space-x-3 pt-2">
                <Button
                  variant={timerRunning ? 'warning' : 'accent'}
                  size="md"
                  onClick={handleToggleTimer}
                  leftIcon={timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                >
                  {timerRunning ? 'Pause Timer' : seconds === 0 ? 'Start Timer' : 'Resume Timer'}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => setSeconds((s) => s + 900)}
                  title="Add 15 minutes for simulation"
                >
                  +15 mins
                </Button>

                {booking.status !== 'completed' && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleAdvanceStatus('completed')}
                  >
                    Finish Service
                  </Button>
                )}
              </div>
            </div>

            {/* Approved Additional Work & Spares */}
            <div className="card-premium p-6 bg-[#FFFFFF]">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-[#0071E3]" />
                  <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                    Approved Additional Work &amp; Spares
                  </h3>
                </div>
                <Badge variant="accent" size="sm">
                  Customer Verified
                </Badge>
              </div>

              <p className="text-xs text-[#6E6E73] my-2">
                Additional labour or spare parts must be explicitly verified and approved before inclusion in the final billing amount.
              </p>

              <div className="space-y-2 mt-3">
                {availableAddons.map((addon) => (
                  <div
                    key={addon.id}
                    onClick={() => handleToggleAddon(addon.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      addon.approved
                        ? 'bg-[rgba(0,113,227,0.06)] border-[#0071E3]/30 text-[#111111] font-semibold'
                        : 'bg-[#FBFBFD] border-black/5 text-[#6E6E73]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={addon.approved}
                        onChange={() => {}}
                        className="rounded accent-[#0071E3]"
                      />
                      <span>{addon.name}</span>
                    </div>
                    <span className="font-bold text-[#111111]">₹{addon.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Transparent Billing & Feedback */}
          <div className="lg:col-span-5 space-y-6">
            {/* Post-Service Final Invoice */}
            <div className="card-premium p-6 bg-[#FFFFFF]">
              <div className="flex items-center space-x-2 pb-4 border-b border-black/5">
                <Receipt className="w-4 h-4 text-[#34C759]" />
                <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                  Transparent Final Billing Breakdown
                </h3>
              </div>

              <div className="space-y-2.5 py-4 text-xs border-b border-black/5">
                <div className="flex justify-between text-[#111111]">
                  <span>Actual Labour ({actualHoursWorked} hrs @ ₹{booking.worker.hourlyRate}/hr)</span>
                  <span className="font-semibold">₹{finalPriceCalc.actualLabour}</span>
                </div>

                <div className="flex justify-between text-[#111111]">
                  <div>
                    <span>Travel Expense ({booking.worker.distanceKm.toFixed(1)} km)</span>
                    <span className="text-[10px] text-[#86868B] block">
                      {booking.worker.distanceKm <= 5 ? 'Free within 5 km zone' : 'Configurable slab > 5 km'}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {finalPriceCalc.travelCharge === 0 ? (
                      <span className="text-[#1B8738]">FREE</span>
                    ) : (
                      `₹${finalPriceCalc.travelCharge}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-[#111111]">
                  <span>Approved Spares &amp; Additional Work</span>
                  <span className="font-semibold">₹{finalPriceCalc.additionalWorkTotal}</span>
                </div>

                <div className="flex justify-between text-[#111111]">
                  <span>WorkLink Platform Fee (8%)</span>
                  <span className="font-semibold">₹{finalPriceCalc.platformFee}</span>
                </div>

                <div className="flex justify-between text-[#1B8738]">
                  <span>Promotional Discount</span>
                  <span className="font-semibold">-₹{finalPriceCalc.discount}</span>
                </div>
              </div>

              {/* Final Total Amount */}
              <div className="pt-3 pb-5 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#86868B] block">
                    Final Payable Amount
                  </span>
                  <span className="text-[11px] text-[#86868B]">All taxes included</span>
                </div>
                <span className="text-3xl font-extrabold text-[#111111]">
                  ₹{finalPriceCalc.finalTotal}
                </span>
              </div>

              {/* Payment Options */}
              {!isPaid ? (
                <div className="pt-2 border-t border-black/5">
                  <span className="text-xs font-bold text-[#111111] block mb-2">
                    Select Payment Method:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProcessPayment('UPI')}
                    >
                      Pay UPI
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleProcessPayment('Card')}
                    >
                      Card
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleProcessPayment('Cash on Delivery')}
                    >
                      Cash
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.2)] rounded-2xl flex items-center space-x-2 text-xs text-[#1B8738] font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
                  <span>Payment settled via {booking.paymentMethod || 'UPI'}. Receipt #{booking.paymentReference || 'PAY-8921'}</span>
                </div>
              )}
            </div>

            {/* Post-Service Feedback & Rating Form */}
            {isPaid && (
              <div className="card-premium p-6 bg-[#FFFFFF] animate-fade-in space-y-4">
                <div className="flex items-center space-x-2 pb-3 border-b border-black/5">
                  <Sparkles className="w-4 h-4 text-[#FF9500]" />
                  <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                    Rate Your Experience with {booking.worker.name}
                  </h3>
                </div>

                {/* Star Picker */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'fill-[#FF9500] text-[#FF9500]'
                            : 'text-[#86868B]'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Quick Positive Tags */}
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    'Punctual & Polite',
                    'Accurate Diagnostics',
                    'Clean Worksite',
                    'Fair Pricing',
                    'Fast Resolution',
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() =>
                        setSelectedTags((prev) =>
                          prev.includes(tag)
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        )
                      }
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Comment Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#111111] mb-1">
                    Your Review
                  </label>
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-black/10 bg-[#FBFBFD] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                    placeholder="Share helpful feedback..."
                  />
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSubmitFeedback}
                  className="w-full font-bold"
                >
                  Submit Rating &amp; Finish
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* RESCHEDULE MODAL                                                      */}
      {/* ===================================================================== */}
      {isRescheduling && (
        <Modal
          isOpen={isRescheduling}
          onClose={() => setIsRescheduling(false)}
          title="Reschedule Booking"
          subtitle={`Select a new date and arrival window for ${booking.worker.name}.`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setIsRescheduling(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveReschedule}>
                Save New Schedule
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Date selection */}
            <div>
              <label className="block font-bold text-[#111111] mb-2">Select Date</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'today', label: 'Today' },
                  { key: 'tomorrow', label: 'Tomorrow' },
                  { key: 'scheduled', label: 'Custom' },
                ].map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setRescheduleDate(d.key as any)}
                    className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                      rescheduleDate === d.key
                        ? 'bg-[#111111] text-white border-[#111111]'
                        : 'bg-white border-black/10 text-[#6E6E73] hover:text-[#111111]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              {rescheduleDate === 'scheduled' && (
                <input
                  type="date"
                  value={customRescheduleDate}
                  onChange={(e) => setCustomRescheduleDate(e.target.value)}
                  className="mt-2 w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs"
                />
              )}
            </div>

            {/* Time Slot selection */}
            <div>
              <label className="block font-bold text-[#111111] mb-2">Select Arrival Window</label>
              <div className="space-y-2">
                {[
                  { id: 'Immediate (<45m)', label: 'Immediate (<45 mins arrival)' },
                  { id: 'Morning (09:00 - 12:00)', label: 'Morning (09:00 - 12:00)' },
                  { id: 'Afternoon (13:00 - 16:00)', label: 'Afternoon (13:00 - 16:00)' },
                  { id: 'Evening (17:00 - 20:00)', label: 'Evening (17:00 - 20:00)' },
                ].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setRescheduleSlot(slot.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all ${
                      rescheduleSlot === slot.id
                        ? 'bg-[#0071E3]/5 border-[#0071E3] text-[#0071E3] font-bold'
                        : 'bg-white border-black/10 text-[#6E6E73] hover:text-[#111111]'
                    }`}
                  >
                    <span>{slot.label}</span>
                    {rescheduleSlot === slot.id && <Check className="w-4 h-4 text-[#0071E3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* CANCEL BOOKING MODAL                                                  */}
      {/* ===================================================================== */}
      {showCancelModal && (
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Cancel This Booking?"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setShowCancelModal(false)}>
                Keep Booking
              </Button>
              <Button variant="danger" size="sm" onClick={handleCancelBooking}>
                Confirm Cancellation
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-[#6E6E73] leading-relaxed">
              Are you sure you want to cancel your booking with <strong>{booking.worker.name}</strong>?
            </p>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero cancellation fees apply under WorkLink&apos;s Fair Prepayment Guarantee.</span>
            </div>

            <div>
              <label className="block text-[#111111] font-semibold mb-1">
                Reason for cancellation (optional):
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Problem resolved myself">Problem resolved myself</option>
                <option value="Need a different date/time">Need a different date/time</option>
                <option value="Booked by mistake">Booked by mistake</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
