import React from 'react';
import {
  RotateCcw,
} from 'lucide-react';
import { Booking } from '../types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface FeedbackLearningLoopViewProps {
  recentBookings: Booking[];
  onBookAgain: (workerId: string) => void;
}

export const FeedbackLearningLoopView: React.FC<FeedbackLearningLoopViewProps> = ({
  recentBookings,
  onBookAgain,
}) => {
  return (
    <div className="card-premium p-6 md:p-8 bg-[#FFFFFF] mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-black/5 gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-[rgba(52,199,89,0.08)] text-[#34C759]">
              <RotateCcw className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
              Closed Feedback &amp; Learning Ecosystem
            </h2>
            <Badge variant="success" size="sm">
              Continuous AI Improvement
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-2xl leading-relaxed">
            WorkLink is designed as a learning loop rather than a static directory. Completed jobs produce telemetry signals that recalibrate worker performance indices and personalize future matching.
          </p>
        </div>
      </div>

      {/* Milestone 14: Closed Feedback Loop (Recommendation -> Booking -> Service -> Completion -> Rating -> Worker signal -> Future recommendation) */}
      <div className="my-6 p-5 bg-[#FBFBFD] rounded-3xl border border-black/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
            Closed Telemetry Feedback Loop
          </h3>
          <Badge variant="accent" size="sm">
            Continuous Self-Tuning
          </Badge>
        </div>

        {/* 7-Step Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
          {[
            { step: '1. Recommendation', desc: 'AI multi-factor match' },
            { step: '2. Booking', desc: 'Customer dispatch confirmation' },
            { step: '3. Service', desc: 'Live execution & verified timer' },
            { step: '4. Completion', desc: 'Final invoice & zero dispute' },
            { step: '5. Rating', desc: 'Lightweight star evaluation' },
            { step: '6. Worker Signal', desc: 'Recalibrates quality & affinity' },
            { step: '7. Future Rec', desc: 'Personalized next match boost' },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border shadow-xs transition-all ${
                idx >= 4
                  ? 'bg-white border-[#0071E3]/20 text-[#111111]'
                  : 'bg-white border-black/5 text-[#111111]'
              }`}
            >
              <span className="font-bold text-[11px] block mb-0.5">{item.step}</span>
              <span className="text-[10px] text-[#6E6E73] leading-tight block">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone 14: 7 Key Worker Telemetry Signals */}
      <div className="mb-6 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73]">
          Active Worker Signals Calibrated by Customer Feedback
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {/* Signal 1: rating */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              1. Rating
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#FF9500]">4.91★</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Bayesian quality prior</p>
          </div>

          {/* Signal 2: completion */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              2. Completion
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#111111]">98.6%</span>
              <span className="text-[10px] text-[#1B8738] font-bold">+0.4%</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Verified jobs executed</p>
          </div>

          {/* Signal 3: cancellation */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              3. Cancellation
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#111111]">0.8%</span>
              <span className="text-[10px] text-[#1B8738] font-bold">Low</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Zero arbitrary drops</p>
          </div>

          {/* Signal 4: response time */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              4. Response Time
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#111111]">13.8m</span>
              <span className="text-[10px] text-[#1B8738] font-bold">-1.4m</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Arrival window accuracy</p>
          </div>

          {/* Signal 5: repeat booking */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              5. Repeat Booking
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#5856D6]">39.4%</span>
              <span className="text-[10px] text-[#1B8738] font-bold">+3.2%</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Customer loyalty signal</p>
          </div>

          {/* Signal 6: satisfaction */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              6. Satisfaction
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#1B8738]">97.2%</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Positive review sentiment</p>
          </div>

          {/* Signal 7: disputes */}
          <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-0.5">
              7. Disputes
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-xl font-bold text-[#34C759]">0.0%</span>
            </div>
            <p className="text-[10px] text-[#6E6E73] mt-1">Frictionless resolution</p>
          </div>
        </div>
      </div>

      {/* Recent Completed Jobs Table */}
      {recentBookings.length > 0 && (
        <div className="border-t border-black/5 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] mb-3">
            Recent Telemetry Submissions
          </h3>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-[#F5F5F7] rounded-2xl border border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#111111]">{b.worker.name}</span>
                    <span className="text-[#6E6E73]">({b.worker.trade})</span>
                    <Badge variant="success" size="sm">
                      Settled ₹{b.finalTotal}
                    </Badge>
                  </div>
                  <p className="text-[#6E6E73] text-[11px] mt-0.5">
                    {b.actualHours} hrs worked • {b.worker.distanceKm} km travel • Rating: {b.feedback?.rating || 5}★
                  </p>
                  {b.feedback?.comment && (
                    <p className="text-[#111111] italic text-[11px] mt-1">
                      "{b.feedback.comment}"
                    </p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBookAgain(b.worker.id)}
                >
                  Book Pro Again
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
