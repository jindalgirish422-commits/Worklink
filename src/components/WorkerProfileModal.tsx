import React from 'react';
import {
  Star,
  Wrench,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';
import { Modal } from './ui/Modal';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

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
  const { worker } = rankedWorker;

  return (
    <Modal
      isOpen={Boolean(rankedWorker)}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center space-x-3.5">
          <Avatar
            src={worker.avatar}
            alt={worker.name}
            size="lg"
            isVerified={worker.isVerified}
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-[#111111]">{worker.name}</span>
              <Badge variant="accent" size="sm">
                Verified Pro
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] font-medium mt-0.5">
              {worker.trade} • {worker.experienceYears} Years Certified Experience
            </p>
          </div>
        </div>
      }
      footer={
        <div className="w-full flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#86868B] block">Service Estimate</span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-xl font-bold text-[#111111]">₹{worker.estimatedQuote}</span>
              <span className="text-xs text-[#86868B]">(@ ₹{worker.hourlyRate}/hr)</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onClose();
                onProceedToBooking(rankedWorker);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Proceed to Booking
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Rating & Performance Stats Bar */}
        <div className="flex flex-wrap items-center gap-4 p-3.5 glass-surface-light rounded-2xl border border-white/80 text-xs text-[#111111] shadow-xs">
          <span className="flex items-center font-bold">
            <Star className="w-4 h-4 text-[#FF9500] fill-[#FF9500] mr-1" />
            {worker.rating.toFixed(1)} ({worker.reviewCount} reviews)
          </span>
          <span className="text-black/10">•</span>
          <span className="font-medium">{worker.completedJobs} Completed Jobs</span>
          <span className="text-black/10">•</span>
          <span className="text-[#1B8738] font-semibold">
            {(worker.completionRate * 100).toFixed(0)}% Completion Rate
          </span>
        </div>

        {/* Bio */}
        <div className="p-4 glass-surface-light rounded-2xl border border-white/80 text-xs text-[#111111] leading-relaxed italic shadow-xs">
          "{worker.bio}"
        </div>

        {/* Verification Credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 glass-surface-light rounded-2xl border border-white/80 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Trade License
            </span>
            <span className="text-xs font-mono font-bold text-[#111111]">{worker.licenseNumber}</span>
          </div>

          <div className="p-3.5 glass-surface-light rounded-2xl border border-white/80 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Background Check
            </span>
            <span className="text-xs font-bold text-[#1B8738] flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#34C759]" /> Govt ID &amp; Police Verified
            </span>
          </div>

          <div className="p-3.5 glass-surface-light rounded-2xl border border-white/80 shadow-xs">
            <span className="text-[10px] text-[#86868B] font-semibold uppercase tracking-wider block mb-1">
              Avg Response Time
            </span>
            <span className="text-xs font-bold text-[#111111]">{worker.responseTimeMinutes} Minutes</span>
          </div>
        </div>

        {/* Tools Carried */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-2.5 flex items-center space-x-1.5">
            <Wrench className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Tools &amp; Equipment Carried</span>
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {worker.toolsEquipped.map((tool, idx) => (
              <Badge key={idx} variant="default" size="sm">
                ✓ {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Customer Reviews */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-2.5 flex items-center space-x-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#5856D6]" />
            <span>Recent Customer Reviews</span>
          </h4>
          <div className="space-y-2">
            {worker.recentReviews.map((rev) => (
              <div key={rev.id} className="p-3 glass-surface-light rounded-xl border border-white/80 text-xs shadow-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#111111]">{rev.userName}</span>
                  <div className="flex items-center space-x-2 text-[#86868B] text-[11px]">
                    <span className="text-[#FF9500] font-bold">★ {rev.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
                <p className="text-[#6E6E73]">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
