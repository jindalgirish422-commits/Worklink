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

      {/* Signal Propagation Flow */}
      <div className="my-6 p-5 bg-[#FBFBFD] rounded-3xl border border-black/5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-4">
          Telemetry Signal Propagation Flow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: '1. Recommender', desc: 'Multi-factor match & rationale' },
            { step: '2. Booking', desc: 'Customer acceptance & dispatch' },
            { step: '3. Execution', desc: 'Live timer & verified work' },
            { step: '4. Invoice', desc: 'Transparent post-service billing' },
            { step: '5. Rating / Review', desc: 'Customer satisfaction & tags' },
            { step: '6. Prior Update', desc: 'Calibrates future match weights' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
              <span className="font-bold text-[#111111] block mb-1">{item.step}</span>
              <span className="text-[11px] text-[#6E6E73]">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-1">
            Worker Reliability
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-[#111111]">98.4%</span>
            <span className="text-xs text-[#1B8738] font-semibold">+0.6%</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] mt-1">Based on completed vs cancelled jobs</p>
        </div>

        <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-1">
            Response Punctuality
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-[#111111]">14.2 min</span>
            <span className="text-xs text-[#1B8738] font-semibold">-2.1m</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] mt-1">Average dispatch to doorstep arrival</p>
        </div>

        <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-1">
            Price Acceptance
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-[#111111]">96.8%</span>
            <span className="text-xs text-[#86868B] font-medium">Stable</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] mt-1">Pre-service estimate vs final invoice fit</p>
        </div>

        <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-black/5 shadow-xs">
          <span className="text-[10px] text-[#86868B] font-bold uppercase tracking-wider block mb-1">
            Repeat Bookings
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-[#111111]">38.2%</span>
            <span className="text-xs text-[#1B8738] font-semibold">+4.2%</span>
          </div>
          <p className="text-[11px] text-[#6E6E73] mt-1">Customers re-booking preferred workers</p>
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
