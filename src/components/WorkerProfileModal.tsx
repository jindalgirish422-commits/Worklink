import React from 'react';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';

interface WorkerProfileModalProps {
  rankedWorker: RankedWorker | null;
  job: JobRequest;
  onClose: () => void;
  onProceedToBooking: (worker: RankedWorker) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  rankedWorker,
  job,
  onClose,
  onProceedToBooking,
}) => {
  if (!rankedWorker) return null;
  const { worker, totalScore, reasons } = rankedWorker;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="apple-card w-full max-w-2xl bg-white border border-slate-200 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  {worker.name}
                </h3>
                <span className="badge-subtle bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600 inline" />
                  Verified Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {worker.trade} • {worker.experienceYears} Years Certified Experience
              </p>
              <div className="flex items-center space-x-3 mt-1.5 text-xs text-slate-600">
                <span className="flex items-center font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                  {worker.rating.toFixed(1)} ({worker.reviewCount} verified reviews)
                </span>
                <span>•</span>
                <span>{worker.completedJobs} Completed Jobs</span>
                <span>•</span>
                <span className="text-emerald-700 font-medium">{(worker.completionRate * 100).toFixed(0)}% Completion</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bio */}
        <div className="my-5">
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            "{worker.bio}"
          </p>
        </div>

        {/* Verification Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">Trade License</span>
            <span className="text-xs font-mono font-bold text-slate-900">{worker.licenseNumber}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">Background Check</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Govt ID & Police Verified
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <span className="text-[11px] text-slate-400 font-medium block mb-1">Avg Response Time</span>
            <span className="text-xs font-bold text-slate-900">{worker.responseTimeMinutes} Minutes</span>
          </div>
        </div>

        {/* Tools & Equipment */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>Tools & Diagnostics Equipment Carried</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {worker.toolsEquipped.map((tool, idx) => (
              <span
                key={idx}
                className="badge-subtle bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/60"
              >
                ✓ {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Customer Reviews */}
        <div className="mb-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
            <span>Recent Customer Reviews</span>
          </h4>
          <div className="space-y-2">
            {worker.recentReviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800">{rev.userName}</span>
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px]">
                    <span className="text-amber-500 font-bold">★ {rev.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
                <p className="text-slate-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">Service Estimate</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold text-slate-900">₹{worker.estimatedQuote}</span>
              <span className="text-xs text-slate-400">(@ ₹{worker.hourlyRate}/hr)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onProceedToBooking(rankedWorker);
              }}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center space-x-2 shadow-sm transition-all"
            >
              <span>Proceed to Booking</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
