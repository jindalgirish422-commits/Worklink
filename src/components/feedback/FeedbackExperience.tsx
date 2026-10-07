import React, { useState } from 'react';
import {
  Star,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Heart,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Booking, BookingFeedback, FeedbackSignals } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface FeedbackExperienceProps {
  booking: Booking;
  onSubmitFeedback: (feedback: BookingFeedback) => void;
  isAlreadySubmitted?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  5: 'Outstanding experience',
  4: 'Great service',
  3: 'Satisfactory',
  2: 'Needs improvement',
  1: 'Poor experience',
};

const QUICK_TAGS = [
  'Punctual & Polite',
  'Accurate Diagnostics',
  'Clean Worksite',
  'Fair Pricing',
  'Fast Resolution',
  'Expert Workmanship',
];

export const FeedbackExperience: React.FC<FeedbackExperienceProps> = ({
  booking,
  onSubmitFeedback,
  isAlreadySubmitted = false,
}) => {
  const [rating, setRating] = useState<number>(booking.feedback?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(
    booking.feedback?.comment || 'Arrived on time. Fixed the cooling issue cleanly with transparent billing.'
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    booking.feedback?.tags || ['Punctual & Polite', 'Accurate Diagnostics', 'Clean Worksite']
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(
    isAlreadySubmitted || booking.status === 'rated' || Boolean(booking.feedback)
  );

  const activeStarCount = hoverRating || rating;

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
      });
    } catch {
      // ignore
    }

    const satisfaction = Math.round((rating / 5) * 100);
    const signals: FeedbackSignals = {
      rating,
      completion: true,
      cancellation: false,
      responseTime: booking.worker.responseTimeMinutes || 15,
      repeatBooking: rating >= 4,
      satisfaction,
      disputes: 0,
    };

    const feedbackPayload: BookingFeedback = {
      rating,
      tags: selectedTags,
      comment: comment.trim(),
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      signals,
    };

    setIsSubmitted(true);
    onSubmitFeedback(feedbackPayload);
  };

  return (
    <div className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge shadow-sm space-y-4 sm:space-y-5 animate-fade-in text-xs">
      {/* ============================================================== */}
      {/* 1. HEADER & PROMPT                                             */}
      {/* ============================================================== */}
      <div className="flex items-start justify-between pb-4 border-b border-black/5 gap-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868B]">
              Post-Service Evaluation
            </span>
          </div>
          {/* Exact Prompt: "How was your experience?" */}
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] tracking-tight">
            How was your experience?
          </h3>
          <p className="text-xs text-[#6E6E73]">
            with <strong className="text-[#111111]">{booking.worker.name}</strong> • {booking.worker.trade}
          </p>
        </div>

        <Badge
          variant={isSubmitted ? 'success' : 'accent'}
          size="sm"
          className="font-bold shrink-0"
        >
          {isSubmitted ? 'FEEDBACK LOGGED' : 'QUICK RATING'}
        </Badge>
      </div>

      {!isSubmitted ? (
        /* ============================================================== */
        /* 2. LIGHTWEIGHT FEEDBACK FORM (NOT A SURVEY)                    */
        /* ============================================================== */
        <div className="space-y-5">
          {/* Interactive Star Rating (★★★★★) */}
          <div className="text-center py-2 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                      star <= activeStarCount
                        ? 'fill-[#FF9500] text-[#FF9500] drop-shadow-xs'
                        : 'text-black/15 hover:text-black/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-semibold text-[#111111]">
              <span className="text-amber-600 font-bold">{activeStarCount}★</span> —{' '}
              <span>{RATING_LABELS[activeStarCount] || 'Select rating'}</span>
            </div>
          </div>

          {/* Optional review section */}
          <div className="space-y-3 pt-2 border-t border-black/5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#111111]">
                Optional review
              </label>
              <span className="text-[11px] text-[#86868B]">100% voluntary</span>
            </div>

            {/* Quick 1-tap positive tags */}
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#111111] text-white shadow-2xs'
                        : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111] hover:bg-black/5'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Lightweight review textarea */}
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave an optional review or observations..."
              className="w-full p-3 rounded-2xl border border-black/10 bg-[#FBFBFD] text-xs text-[#111111] placeholder:text-[#86868B] outline-none focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all"
            />
          </div>

          {/* Submission Action */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              className="w-full font-bold shadow-sm min-h-[48px] justify-center active-press"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Feedback
            </Button>
            <p className="text-[10px] text-center text-[#86868B] mt-2">
              Feedback directly recalibrates the WorkLink AI matching engine and personalizes future recommendations.
            </p>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 3. POST-SUBMISSION CONFIRMATION & FEEDBACK LOOP TELEMETRY     */
        /* ============================================================== */
        <div className="space-y-4 animate-fade-in">
          {/* Success summary badge */}
          <div className="p-4 rounded-2xl bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.2)] text-[#1B8738] space-y-1">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
              <span>Thank You! Feedback Recorded</span>
            </div>
            <p className="text-[11px] text-[#2C6E49] leading-relaxed">
              Your {rating}★ evaluation for <strong>{booking.worker.name}</strong> has been propagated into the WorkLink feedback loop.
            </p>
            {comment && (
              <p className="text-[11px] italic text-[#2C6E49]/90 pt-1 border-t border-[rgba(52,199,89,0.15)]">
                &ldquo;{comment}&rdquo;
              </p>
            )}
          </div>

          {/* The Closed Feedback Loop Visualization */}
          <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#0071E3]" />
                <span className="font-bold text-[#111111] text-[11px] uppercase tracking-wider">
                  The Closed Feedback Loop
                </span>
              </div>
              <Badge variant="accent" size="sm">
                Signals Propagated
              </Badge>
            </div>

            {/* Loop Diagram */}
            <div className="p-2.5 rounded-xl bg-white border border-black/5 text-[10px] font-mono flex items-center justify-between text-[#6E6E73] overflow-x-auto gap-1">
              <span>Recommendation</span>
              <span>&rarr;</span>
              <span>Booking</span>
              <span>&rarr;</span>
              <span>Service</span>
              <span>&rarr;</span>
              <span>Completion</span>
              <span>&rarr;</span>
              <span className="text-[#FF9500] font-bold">Rating</span>
              <span>&rarr;</span>
              <span className="text-[#0071E3] font-bold">Worker Signal</span>
              <span>&rarr;</span>
              <span className="text-[#34C759] font-bold">Future Rec</span>
            </div>

            {/* The 7 Worker Signals Updated */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">1. Rating Signal</span>
                <span className="font-bold text-[#FF9500] text-xs">{rating}.0★</span>
                <span className="text-[#6E6E73] block text-[9px]">Bayesian updated</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">2. Completion</span>
                <span className="font-bold text-[#34C759] text-xs">+1 Job</span>
                <span className="text-[#6E6E73] block text-[9px]">100% verified</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">3. Cancellation</span>
                <span className="font-bold text-[#111111] text-xs">0%</span>
                <span className="text-[#6E6E73] block text-[9px]">High reliability</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">4. Response Time</span>
                <span className="font-bold text-[#0071E3] text-xs">Punctual</span>
                <span className="text-[#6E6E73] block text-[9px]">Slot adhered</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">5. Repeat Booking</span>
                <span className="font-bold text-[#5856D6] text-xs">{rating >= 4 ? 'Preferred Pro' : 'Neutral'}</span>
                <span className="text-[#6E6E73] block text-[9px]">Saved to affinity</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">6. Satisfaction</span>
                <span className="font-bold text-[#1B8738] text-xs">{Math.round((rating / 5) * 100)}%</span>
                <span className="text-[#6E6E73] block text-[9px]">Positive sentiment</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5">
                <span className="text-[#86868B] block font-bold">7. Disputes</span>
                <span className="font-bold text-[#34C759] text-xs">Zero (0)</span>
                <span className="text-[#6E6E73] block text-[9px]">Fair settlement</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-black/5 bg-[#0071E3]/5 border-[#0071E3]/20">
                <span className="text-[#0071E3] block font-bold">Future Boost</span>
                <span className="font-bold text-[#0071E3] text-xs">Priority Match</span>
                <span className="text-[#0071E3] block text-[9px]">Personalized rec</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
