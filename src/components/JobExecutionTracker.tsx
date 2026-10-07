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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, AdditionalWorkItem } from '../types';
import { calculateFinalPrice } from '../services/pricingEngine';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
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
  const [seconds, setSeconds] = useState(booking.elapsedSeconds || 5400); // 1.5 hrs default for ease of testing
  const [timerRunning, setTimerRunning] = useState(false);

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
    'Arrived within 25 minutes. Fixed the cooling issue cleanly with transparent billing.'
  );
  const [isPaid, setIsPaid] = useState(booking.status === 'paid');
  const [isReviewed, setIsReviewed] = useState(false);

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

  const handleAdvanceStatus = (nextStatus: Booking['status']) => {
    if (nextStatus === 'completed') {
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
      status: 'paid',
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
    setIsReviewed(true);
    const completedBooking: Booking = {
      ...booking,
      feedback: {
        rating,
        tags: selectedTags,
        comment: feedbackComment,
        submittedAt: new Date().toLocaleTimeString(),
      },
    };
    onCompleteFeedbackLoop(completedBooking);
    showToast({
      type: 'success',
      title: 'Feedback Recorded',
      message: `Telemetry sent to WorkLink learning loop. Worker rating updated to ${rating}★.`,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Lifecycle Pipeline Stepper */}
      <div className="card-premium p-6 bg-[#FFFFFF]">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-black/5 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="accent" size="sm">
                {booking.id}
              </Badge>
              <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
                Live Job Execution &amp; Working-Hour Tracking
              </h2>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              WorkLink transparent lifecycle: Worker Acceptance &rarr; Execution &rarr; Timer Tracking &rarr; Final Invoice &rarr; Feedback Loop
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#86868B] font-medium">Lifecycle Status:</span>
            <Badge variant="default" size="md">
              {booking.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Stepper Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5">
          {[
            { key: 'accepted', label: '1. Accepted' },
            { key: 'en_route', label: '2. En Route' },
            { key: 'in_progress', label: '3. In Progress' },
            { key: 'completed', label: '4. Service Done' },
            { key: 'paid', label: '5. Paid & Closed' },
          ].map((step, idx) => {
            const isCurrent = booking.status === step.key;
            const isDone =
              (booking.status === 'en_route' && idx < 1) ||
              (booking.status === 'in_progress' && idx < 2) ||
              (booking.status === 'completed' && idx < 3) ||
              (booking.status === 'paid' && idx < 4);

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

      {/* Main Execution Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Worker Dispatch & Timer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Worker Dispatch Card */}
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
                <Badge variant="accent" size="sm">
                  Dispatched
                </Badge>
                <span className="text-xs text-[#86868B] block mt-1">
                  {booking.worker.distanceKm.toFixed(1)} km away
                </span>
              </div>
            </div>

            {/* Quick Dispatch Controls */}
            <div className="flex flex-wrap gap-2 mt-4">
              {booking.status === 'accepted' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAdvanceStatus('en_route')}
                >
                  Mark En Route (Simulate Worker Arrival)
                </Button>
              )}
              {booking.status === 'en_route' && (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleAdvanceStatus('in_progress')}
                >
                  Worker Arrived &rarr; Start Service Clock
                </Button>
              )}
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

              {booking.status !== 'completed' && booking.status !== 'paid' && (
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
                <span>
                  Payment Settled ({booking.paymentMethod || 'UPI'}) • Ref: {booking.paymentReference || 'PAY-8912301'}
                </span>
              </div>
            )}
          </div>

          {/* Feedback & Review Form */}
          <div className="card-premium p-6 bg-[#FFFFFF]">
            <div className="flex items-center space-x-2 pb-3 border-b border-black/5">
              <Sparkles className="w-4 h-4 text-[#FF9500]" />
              <h3 className="text-sm font-bold text-[#111111] tracking-tight">
                Rating, Review &amp; Learning Signal
              </h3>
            </div>

            <p className="text-xs text-[#6E6E73] my-2">
              Your rating updates the worker's verified performance signal and refines WorkLink's future matching calibration.
            </p>

            {/* Stars */}
            <div className="flex items-center space-x-2 my-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      s <= rating ? 'text-[#FF9500] fill-[#FF9500]' : 'text-[#E5E5EA]'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#111111] ml-2">{rating}.0 / 5.0</span>
            </div>

            {/* Tag Chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {[
                'Punctual & Polite',
                'Accurate Diagnostics',
                'Clean Worksite',
                'Fair Pricing',
                'High Expertise',
              ].map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag));
                      } else {
                        setSelectedTags([...selectedTags, tag]);
                      }
                    }}
                  >
                    <Badge variant={isSelected ? 'accent' : 'default'} size="sm">
                      {tag}
                    </Badge>
                  </button>
                );
              })}
            </div>

            {/* Comment */}
            <textarea
              rows={2}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full p-3 bg-[#F5F5F7] border border-black/5 rounded-2xl text-xs text-[#111111] focus:bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#0071E3] resize-none mb-3"
              placeholder="Share honest feedback about the work quality..."
            />

            {!isReviewed ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmitFeedback}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Submit Feedback &amp; Update System Prior
              </Button>
            ) : (
              <div className="p-3 bg-[rgba(0,113,227,0.06)] border border-[rgba(0,113,227,0.18)] rounded-2xl text-xs text-[#0071E3] font-medium">
                ✓ Feedback recorded! Worker completion telemetry updated and logged into the learning loop.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
