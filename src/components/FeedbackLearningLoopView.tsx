import React from 'react';
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Booking } from '../types';

interface FeedbackLearningLoopViewProps {
  recentBookings: Booking[];
  onBookAgain: (workerId: string) => void;
}

export const FeedbackLearningLoopView: React.FC<FeedbackLearningLoopViewProps> = ({
  recentBookings,
  onBookAgain,
}) => {
  return (
    <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm mb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <RotateCcw className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Closed Feedback &amp; Learning Ecosystem
            </h2>
            <span className="badge-subtle bg-emerald-50 text-emerald-700 border border-emerald-100 font-semibold text-[11px]">
              Continuous AI Improvement
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            WorkLink is designed as a learning loop rather than a static directory. Completed jobs produce telemetry signals that recalibrate worker performance indices and personalize future matching.
          </p>
        </div>
      </div>

      {/* The 5 Lifecycle Steps Diagram */}
      <div className="my-6 p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-4">
          Telemetry Signal Propagation Flow
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
          {[
            { step: '1. Recommender', desc: 'Multi-factor match & explanation' },
            { step: '2. Booking', desc: 'Customer acceptance & dispatch' },
            { step: '3. Execution', desc: 'Live timer & verified work' },
            { step: '4. Invoice', desc: 'Transparent post-service billing' },
            { step: '5. Rating / Review', desc: 'Customer satisfaction & tags' },
            { step: '6. Prior Update', desc: 'Calibrates future match weights' },
          ].map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
              <span className="font-bold text-slate-900 block mb-1">{item.step}</span>
              <span className="text-[11px] text-slate-500">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Worker Reliability
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900">98.4%</span>
            <span className="text-xs text-emerald-600 font-semibold">+0.6%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Based on completed vs cancelled jobs</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Response Punctuality
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900">14.2 min</span>
            <span className="text-xs text-emerald-600 font-semibold">-2.1m</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average dispatch to doorstep arrival</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Price Acceptance
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900">96.8%</span>
            <span className="text-xs text-slate-400 font-medium">Stable</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pre-service estimate vs final invoice fit</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            Repeat Bookings
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900">38.2%</span>
            <span className="text-xs text-emerald-600 font-semibold">+4.2%</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Customers re-booking preferred workers</p>
        </div>
      </div>

      {/* Recent Completed Jobs Table */}
      {recentBookings.length > 0 && (
        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Recent Telemetry Submissions
          </h3>
          <div className="space-y-2">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{b.worker.name}</span>
                    <span className="text-slate-500">({b.worker.trade})</span>
                    <span className="badge-subtle bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Settled ₹{b.finalTotal}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {b.actualHours} hrs worked • {b.worker.distanceKm} km travel • Rating: {b.feedback?.rating || 5}★
                  </p>
                  {b.feedback?.comment && (
                    <p className="text-slate-700 italic text-[11px] mt-1">
                      "{b.feedback.comment}"
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onBookAgain(b.worker.id)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg font-semibold shrink-0"
                >
                  Book Pro Again
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
