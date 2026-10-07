import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Star,
  MapPin,
  Wrench,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, AdditionalWorkItem } from '../types';
import { calculateFinalPrice } from '../services/pricingEngine';

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
  if (!booking) {
    return (
      <div className="apple-card p-12 bg-white text-center border border-slate-200">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900">No Active Service Booking</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Match and book a skilled worker from the marketplace to track real-time dispatch, live working-hour timer, transparent post-service billing, and payment.
        </p>
      </div>
    );
  }

  // Timer state
  const [seconds, setSeconds] = useState(booking.elapsedSeconds || 5400); // default to 1.5 hrs (5400s) for demonstration ease
  const [timerRunning, setTimerRunning] = useState(false);

  // Available add-ons for approval
  const [availableAddons, setAvailableAddons] = useState<AdditionalWorkItem[]>([
    { id: 'add-1', name: 'Inverter Run Capacitor (45µF)', cost: 450, approved: true },
    { id: 'add-2', name: 'High-Pressure Gas Leakage Testing', cost: 350, approved: false },
    { id: 'add-3', name: 'Copper Line Brazing & Valve Joint', cost: 300, approved: false },
  ]);

  // Feedback form state
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual & Polite', 'Accurate Diagnostics', 'Clean Worksite']);
  const [feedbackComment, setFeedbackComment] = useState('Arrived within 25 minutes. Fixed the cooling issue cleanly with transparent billing.');
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

  // Calculate actual hours worked (minimum 0.5 hr)
  const actualHoursWorked = Math.max(0.5, parseFloat((seconds / 3600).toFixed(2)));

  // Post-service pricing calculation
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
    setTimerRunning(!timerRunning);
  };

  const handleToggleAddon = (id: string) => {
    setAvailableAddons((prev) =>
      prev.map((item) => (item.id === id ? { ...item, approved: !item.approved } : item))
    );
  };

  const handleAdvanceStatus = (nextStatus: Booking['status']) => {
    if (nextStatus === 'completed') {
      setTimerRunning(false);
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
        particleCount: 80,
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
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Lifecycle Pipeline Stepper */}
      <div className="apple-card p-6 bg-white border border-black/[0.06] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="badge-subtle bg-blue-50 text-blue-700 font-mono text-[11px] font-bold">
                {booking.id}
              </span>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Live Job Execution &amp; Working-Hour Tracking
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              WorkLink transparent lifecycle: Worker Acceptance &rarr; Execution &rarr; Timer Tracking &rarr; Final Invoice &rarr; Feedback Loop
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Current Status:</span>
            <span className="badge-subtle bg-slate-900 text-white font-bold capitalize text-xs">
              {booking.status.replace('_', ' ')}
            </span>
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
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <span>{step.label}</span>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Execution Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Worker Dispatch & Working-Hour Timer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Worker card */}
          <div className="apple-card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <img
                  src={booking.worker.avatar}
                  alt={booking.worker.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{booking.worker.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {booking.worker.trade} • License: {booking.worker.licenseNumber}
                  </p>
                  <div className="flex items-center space-x-2 mt-1 text-xs text-slate-600">
                    <span className="font-semibold">★ {booking.worker.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{booking.worker.phone}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="badge-subtle bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                  Dispatched
                </span>
                <span className="text-xs text-slate-400 block mt-1">
                  {booking.worker.distanceKm.toFixed(1)} km away
                </span>
              </div>
            </div>

            {/* Quick Dispatch Controls */}
            <div className="flex flex-wrap gap-2 mt-4">
              {booking.status === 'accepted' && (
                <button
                  onClick={() => handleAdvanceStatus('en_route')}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
                >
                  Mark En Route (Simulate Worker Arrival)
                </button>
              )}
              {booking.status === 'en_route' && (
                <button
                  onClick={() => handleAdvanceStatus('in_progress')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all"
                >
                  Worker Arrived &rarr; Start Working Timer
                </button>
              )}
            </div>
          </div>

          {/* Working-Hour Timer (Real-Time Service Clock) */}
          <div className="apple-card p-6 md:p-8 bg-slate-900 text-white border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  Live Working-Hour Timer
                </h3>
              </div>
              <span className="badge-subtle bg-slate-800 text-slate-300 text-[10px] font-mono">
                Rate: ₹{booking.worker.hourlyRate}/hr
              </span>
            </div>

            {/* Time Readout */}
            <div className="my-6 text-center">
              <div className="font-mono text-5xl md:text-6xl font-extrabold tracking-tight text-white">
                {formatTime(seconds)}
              </div>
              <p className="text-xs text-slate-400 mt-2 font-medium">
                Actual Working Time: <span className="text-blue-400 font-bold">{actualHoursWorked} Hours</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Live Labour Cost: ₹{Math.round(actualHoursWorked * booking.worker.hourlyRate)}
              </p>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleToggleTimer}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm ${
                  timerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                }`}
              >
                {timerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{seconds === 0 ? 'Start Service Timer' : 'Resume Timer'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSeconds((s) => s + 900)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                title="Add 15 minutes for simulation"
              >
                +15 mins
              </button>

              {booking.status !== 'completed' && booking.status !== 'paid' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStatus('completed')}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold transition-all shadow-sm"
                >
                  Finish Service &rarr; Generate Bill
                </button>
              )}
            </div>
          </div>

          {/* Approved Additional Work Add-ons */}
          <div className="apple-card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Approved Additional Work &amp; Spares
                </h3>
              </div>
              <span className="text-xs text-slate-400">Customer Verified</span>
            </div>

            <p className="text-xs text-slate-500 my-2">
              Per product rules, additional labour or spare parts must be explicitly approved before adding to the final amount.
            </p>

            <div className="space-y-2.5 mt-3">
              {availableAddons.map((addon) => (
                <div
                  key={addon.id}
                  onClick={() => handleToggleAddon(addon.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    addon.approved
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <input
                      type="checkbox"
                      checked={addon.approved}
                      onChange={() => {}}
                      className="rounded accent-blue-600"
                    />
                    <span>{addon.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">₹{addon.cost}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Transparent Final Bill, Payment & Feedback */}
        <div className="lg:col-span-5 space-y-6">
          {/* Post-Service Final Amount Calculation Card */}
          <div className="apple-card p-6 bg-white border border-slate-200 shadow-md">
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Transparent Final Billing Breakdown
              </h3>
            </div>

            <div className="space-y-2.5 py-4 text-xs border-b border-slate-100">
              <div className="flex justify-between text-slate-700">
                <span>
                  Actual Labour ({actualHoursWorked} hrs @ ₹{booking.worker.hourlyRate}/hr)
                </span>
                <span className="font-semibold text-slate-900">₹{finalPriceCalc.actualLabour}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <div>
                  <span>Travel Expense ({booking.worker.distanceKm.toFixed(1)} km)</span>
                  <span className="text-[10px] text-slate-400 block">
                    {booking.worker.distanceKm <= 5 ? 'Free within 5 km zone' : 'Configurable slab > 5 km'}
                  </span>
                </div>
                <span className="font-semibold text-slate-900">
                  {finalPriceCalc.travelCharge === 0 ? (
                    <span className="text-emerald-600">FREE</span>
                  ) : (
                    `₹${finalPriceCalc.travelCharge}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>Approved Spares &amp; Additional Work</span>
                <span className="font-semibold text-slate-900">₹{finalPriceCalc.additionalWorkTotal}</span>
              </div>

              <div className="flex justify-between text-slate-700">
                <span>WorkLink Platform Fee (8%)</span>
                <span className="font-semibold text-slate-900">₹{finalPriceCalc.platformFee}</span>
              </div>

              <div className="flex justify-between text-emerald-600">
                <span>Promotional Discount</span>
                <span className="font-semibold">-₹{finalPriceCalc.discount}</span>
              </div>
            </div>

            {/* Final Total Amount */}
            <div className="pt-3 pb-5 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Final Payable Amount
                </span>
                <span className="text-[11px] text-slate-400">All taxes included</span>
              </div>
              <span className="text-3xl font-extrabold text-slate-900">
                ₹{finalPriceCalc.finalTotal}
              </span>
            </div>

            {/* Payment Section */}
            {!isPaid ? (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Select Payment Method:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleProcessPayment('UPI')}
                    className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                  >
                    Pay UPI
                  </button>
                  <button
                    onClick={() => handleProcessPayment('Card')}
                    className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all"
                  >
                    Credit Card
                  </button>
                  <button
                    onClick={() => handleProcessPayment('Cash on Delivery')}
                    className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-all"
                  >
                    Cash
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Payment Settled ({booking.paymentMethod || 'UPI'}) • Ref: {booking.paymentReference || 'PAY-8912301'}</span>
              </div>
            )}
          </div>

          {/* Feedback & Review Form (Closes the Feedback Loop) */}
          <div className="apple-card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Rating, Review &amp; Learning Signal
              </h3>
            </div>

            <p className="text-xs text-slate-500 my-2">
              Your rating updates the worker's verified performance signal and refines WorkLink's future matching calibration.
            </p>

            {/* Star selector */}
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
                      s <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating}.0 / 5.0</span>
            </div>

            {/* Tag chips */}
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
                    className={`badge-subtle text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 text-blue-800 border border-blue-200 font-semibold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Comment */}
            <textarea
              rows={2}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none mb-3"
              placeholder="Share honest feedback about the work quality..."
            />

            {!isReviewed ? (
              <button
                type="button"
                onClick={handleSubmitFeedback}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <span>Submit Feedback &amp; Update System Prior</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
                ✓ Feedback recorded! Worker completion telemetry updated and logged into the learning loop.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
