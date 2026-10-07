import React, { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  Star,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Calendar,
  Phone,
  Power,
  Sliders,
  Award,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Worker, AvailabilityStatus, Booking } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface WorkerDashboardProps {
  workers: Worker[];
  onUpdateWorkerStatus: (workerId: string, status: AvailabilityStatus) => void;
  activeBooking?: Booking | null;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  workers,
  onUpdateWorkerStatus,
  activeBooking,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const workerProfile = currentUser?.workerProfile;
  const currentWorker = workers.find((w) => w.id === workerProfile?.workerId) || workers[2]; // Default to W3 (Rajesh)

  const [availability, setAvailability] = useState<AvailabilityStatus>(
    currentWorker?.availabilityStatus || 'immediate'
  );

  const handleStatusChange = (newStatus: AvailabilityStatus) => {
    setAvailability(newStatus);
    if (currentWorker) {
      onUpdateWorkerStatus(currentWorker.id, newStatus);
    }
    showToast({
      type: 'success',
      title: 'Availability Status Updated',
      message: `You are now marked as '${newStatus.toUpperCase()}' in the 10 km dispatch pool.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Profile Card */}
      <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={currentUser?.avatar || currentWorker.avatar}
                alt={currentUser?.name || currentWorker.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-black/5"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#34C759] border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-[#111111]">
                  {currentUser?.name || currentWorker.name}
                </h1>
                <Badge variant="accent" size="sm">
                  {currentWorker.trade}
                </Badge>
                <Badge variant="success" size="sm">
                  Verified Pro
                </Badge>
              </div>
              <p className="text-xs text-[#6E6E73] mt-1 flex items-center space-x-2">
                <span>ID: {currentWorker.id}</span>
                <span>•</span>
                <span>License: {currentWorker.licenseNumber}</span>
                <span>•</span>
                <span className="flex items-center text-[#FF9500]">
                  <Star className="w-3 h-3 fill-[#FF9500] inline mr-1" />
                  {currentWorker.rating.toFixed(1)} ({currentWorker.reviewCount} reviews)
                </span>
              </p>
            </div>
          </div>

          {/* Quick Toggle Availability */}
          <div className="flex items-center space-x-1.5 p-1 bg-[#F5F5F7] rounded-2xl border border-black/5">
            {(
              [
                { status: 'immediate', label: 'Available Now' },
                { status: 'today', label: 'Slots Today' },
                { status: 'busy', label: 'Off-Duty' },
              ] as const
            ).map((item) => (
              <button
                key={item.status}
                onClick={() => handleStatusChange(item.status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  availability === item.status
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#111111]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Hourly Service Rate</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-[#111111]">₹{currentWorker.hourlyRate}</span>
            <span className="text-xs text-[#6E6E73]">/hour</span>
          </div>
          <span className="text-[11px] text-[#34C759] mt-1 block font-medium">Standard fair pricing</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Service Zone Boundary</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-[#0071E3]">10 km</span>
            <span className="text-xs text-[#6E6E73]">strict radius</span>
          </div>
          <span className="text-[11px] text-[#0071E3] mt-1 block font-medium">Zero dispatch &gt;10km</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Jobs Completed</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-[#111111]">{currentWorker.completedJobs}</span>
            <span className="text-xs text-[#6E6E73]">total</span>
          </div>
          <span className="text-[11px] text-[#34C759] mt-1 block font-medium">
            {Math.round(currentWorker.completionRate * 100)}% on-time fulfillment
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Dispatch Response</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-bold text-[#111111]">{currentWorker.responseTimeMinutes}</span>
            <span className="text-xs text-[#6E6E73]">mins avg</span>
          </div>
          <span className="text-[11px] text-[#6E6E73] mt-1 block font-medium">Instant auto-ping</span>
        </div>
      </div>

      {/* Active Dispatch & Execution Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/5">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-[#0071E3]" />
                <h3 className="text-sm font-bold text-[#111111]">Active Dispatch Status</h3>
              </div>
              <Badge variant={activeBooking ? 'success' : 'neutral'} size="sm">
                {activeBooking ? 'Live Job in Progress' : 'Ready for Dispatch'}
              </Badge>
            </div>

            {activeBooking ? (
              <div className="p-4 rounded-2xl bg-[#0071E3]/5 border border-[#0071E3]/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#0071E3] uppercase tracking-wider block">
                      Booking #{activeBooking.id.slice(0, 8)}
                    </span>
                    <h4 className="text-base font-bold text-[#111111] mt-0.5">
                      {activeBooking.job.serviceCategory} — {activeBooking.job.requestedTime}
                    </h4>
                    <p className="text-xs text-[#6E6E73] mt-1">
                      {activeBooking.job.rawPrompt}
                    </p>
                  </div>
                  <Badge variant="accent">
                    {activeBooking.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#111111]">
                  <span>Customer: Indiranagar 100ft Rd</span>
                  <span>Estimated Total: ₹{activeBooking.estimatedTotal}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#86868B]">
                <Clock className="w-8 h-8 text-[#86868B]/40 mx-auto mb-2" />
                <p className="font-medium text-[#111111]">No active dispatches currently en-route.</p>
                <p className="mt-1">
                  You are marked as <strong className="text-[#34C759]">available</strong>. Incoming customer job requests will alert you immediately.
                </p>
              </div>
            )}
          </div>

          {/* Capabilities & Skills Card */}
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#5856D6]" />
              <span>Verified Trade Capabilities &amp; Toolkits</span>
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {currentWorker.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-xl bg-[#F5F5F7] border border-black/5 text-xs font-medium text-[#111111]"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>

            <div className="pt-2 text-xs text-[#6E6E73] space-y-1">
              <p>
                <strong className="text-[#111111]">Tools Equipped:</strong>{' '}
                {currentWorker.toolsEquipped.join(', ')}
              </p>
              <p>
                <strong className="text-[#111111]">Background Check:</strong>{' '}
                {currentWorker.backgroundCheckPassed ? 'Verified by WorkLink Trust & Safety' : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews & Reputation */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                <Star className="w-4 h-4 text-[#FF9500] fill-[#FF9500]" />
                <span>Customer Feedback</span>
              </h3>
              <span className="text-xs font-semibold text-[#111111]">
                {currentWorker.rating} / 5.0
              </span>
            </div>

            <div className="space-y-3">
              {currentWorker.recentReviews.map((rev) => (
                <div key={rev.id} className="p-3 rounded-xl bg-[#F5F5F7] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#111111]">{rev.userName}</span>
                    <span className="text-[#FF9500] font-bold">★ {rev.rating}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] leading-relaxed italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                  <span className="text-[10px] text-[#86868B] block">{rev.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
