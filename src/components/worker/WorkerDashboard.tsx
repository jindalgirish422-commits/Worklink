import React, { useState, useEffect } from 'react';
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
  XCircle,
  Check,
  ChevronRight,
  Info,
  Wrench,
  Navigation,
  Play,
  Pause,
  FileText,
  Plus,
  Trash2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Worker, AvailabilityStatus, Booking, BookingStatus, AdditionalWorkItem } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export interface WorkerDashboardProps {
  workers: Worker[];
  onUpdateWorkerStatus: (workerId: string, status: AvailabilityStatus) => void;
  activeBooking?: Booking | null;
  onAcceptBooking?: (bookingId: string) => void;
  onRejectBooking?: (bookingId: string, reason?: string) => void;
  onAdvanceBookingStatus?: (bookingId: string, nextStatus: BookingStatus) => void;
  onUpdateBooking?: (updated: Booking) => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  workers,
  onUpdateWorkerStatus,
  activeBooking,
  onAcceptBooking,
  onRejectBooking,
  onAdvanceBookingStatus,
  onUpdateBooking,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const workerProfile = currentUser?.workerProfile;
  // If no explicit worker profile is logged in, prioritize the worker from activeBooking for easy demonstration, else fallback to W3 (Rajesh)
  const currentWorker =
    workers.find((w) => w.id === workerProfile?.workerId) ||
    (activeBooking ? workers.find((w) => w.id === activeBooking.worker.id) || workers[2] : workers[2]);

  const [availability, setAvailability] = useState<AvailabilityStatus>(
    currentWorker?.availabilityStatus || 'immediate'
  );
  const [activeTab, setActiveTab] = useState<'dispatch' | 'schedule'>('dispatch');
  const [selectedScheduleDay, setSelectedScheduleDay] = useState<'today' | 'tomorrow' | 'upcoming'>('today');
  const [isJobDetailsOpen, setIsJobDetailsOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<string>('');
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  // Milestone 12: Service Execution State
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(
    activeBooking?.workingDurationSeconds || activeBooking?.elapsedSeconds || (activeBooking?.status === 'in_progress' ? 1800 : 0)
  );
  const [isTimerActive, setIsTimerActive] = useState<boolean>(activeBooking?.status === 'in_progress');
  const [showPauseModal, setShowPauseModal] = useState<boolean>(false);
  const [pauseReasonInput, setPauseReasonInput] = useState<string>('Procuring spare parts');
  const [workerNotes, setWorkerNotes] = useState<string>(activeBooking?.notes || '');
  const [newSpareName, setNewSpareName] = useState<string>('');
  const [newSpareCost, setNewSpareCost] = useState<string>('');
  const [showAddSpareForm, setShowAddSpareForm] = useState<boolean>(false);

  // Sync state if activeBooking updates from external props
  useEffect(() => {
    if (activeBooking) {
      if (activeBooking.notes && activeBooking.notes !== workerNotes) {
        setWorkerNotes(activeBooking.notes);
      }
      if (activeBooking.status === 'in_progress') {
        setIsTimerActive(true);
      } else {
        setIsTimerActive(false);
      }
    }
  }, [activeBooking?.status, activeBooking?.notes]);

  // Live timer interval when job is in_progress
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && activeBooking?.status === 'in_progress') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Periodically save elapsed seconds
          if (next % 10 === 0 && activeBooking && onUpdateBooking) {
            onUpdateBooking({
              ...activeBooking,
              elapsedSeconds: next,
              workingDurationSeconds: next,
            });
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, activeBooking?.status]);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const actualHoursWorked = Math.max(0.5, parseFloat((elapsedSeconds / 3600).toFixed(2)));

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

  const handleAccept = () => {
    if (!activeBooking) return;
    if (onAcceptBooking) {
      onAcceptBooking(activeBooking.id);
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'accepted');
    }
    showToast({
      type: 'success',
      title: 'Job Request Accepted',
      message: `You accepted job #${activeBooking.id.slice(0, 8)}. Customer notified.`,
    });
  };

  const handleReject = () => {
    if (!activeBooking) return;
    if (onRejectBooking) {
      onRejectBooking(activeBooking.id, declineReason || 'Worker schedule conflict');
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'cancelled');
    }
    setShowDeclineConfirm(false);
    showToast({
      type: 'warning',
      title: 'Job Request Declined',
      message: `Job #${activeBooking.id.slice(0, 8)} declined. Re-routing to another pro in the 10 km pool.`,
    });
  };

  // =========================================================================
  // MILESTONE 12: WORKER SERVICE EXECUTION ACTIONS
  // =========================================================================

  // 1. START JOB
  const handleStartJob = () => {
    if (!activeBooking) return;
    const now = Date.now();
    const startedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsTimerActive(true);

    const updated: Booking = {
      ...activeBooking,
      status: 'in_progress',
      startTime: now,
      startedAt,
      isTimerRunning: true,
      workerStatusMessage: 'Active Onsite',
    };

    if (onUpdateBooking) {
      onUpdateBooking(updated);
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'in_progress');
    }

    showToast({
      type: 'info',
      title: 'Job Started',
      message: `Service clock started at ${startedAt}. Working duration active.`,
    });
  };

  // 2. PAUSE JOB
  const handleConfirmPause = () => {
    if (!activeBooking) return;
    const pausedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const reason = pauseReasonInput.trim() || 'Procuring spare parts';
    setIsTimerActive(false);
    setShowPauseModal(false);

    const updated: Booking = {
      ...activeBooking,
      status: 'paused',
      isTimerRunning: false,
      pausedAt,
      pauseReason: reason,
      workerStatusMessage: `Paused (${reason})`,
      elapsedSeconds,
      workingDurationSeconds: elapsedSeconds,
    };

    if (onUpdateBooking) {
      onUpdateBooking(updated);
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'paused');
    }

    showToast({
      type: 'warning',
      title: 'Job Paused',
      message: `Clock stopped at ${pausedAt} (${reason}). Paused time is non-billable.`,
    });
  };

  // 3. RESUME JOB
  const handleResumeJob = () => {
    if (!activeBooking) return;
    setIsTimerActive(true);

    const updated: Booking = {
      ...activeBooking,
      status: 'in_progress',
      isTimerRunning: true,
      workerStatusMessage: 'Active Onsite',
    };

    if (onUpdateBooking) {
      onUpdateBooking(updated);
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'in_progress');
    }

    showToast({
      type: 'info',
      title: 'Job Resumed',
      message: 'Working clock resumed. Recording billable labour duration.',
    });
  };

  // 4. COMPLETE JOB
  const handleCompleteJob = () => {
    if (!activeBooking) return;
    const now = Date.now();
    const endedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setIsTimerActive(false);

    const hours = Math.max(0.5, parseFloat((elapsedSeconds / 3600).toFixed(2)));
    const baseLabour = Math.round(hours * currentWorker.hourlyRate);
    const sparesTotal = (activeBooking.additionalWorkItems || [])
      .filter((item) => item.approved)
      .reduce((sum, item) => sum + item.cost, 0);
    const subtotal = baseLabour + activeBooking.travelCharge + sparesTotal;
    const platformFee = Math.round(subtotal * 0.08);
    const discount = 50;
    const finalTotal = Math.max(0, subtotal + platformFee - discount);

    const updated: Booking = {
      ...activeBooking,
      status: 'completed',
      isTimerRunning: false,
      endTime: now,
      endedAt,
      elapsedSeconds,
      workingDurationSeconds: elapsedSeconds,
      actualHours: hours,
      baseLabourFee: baseLabour,
      platformFee,
      discount,
      finalTotal,
      workerStatusMessage: 'Service Completed',
      notes: workerNotes,
    };

    if (onUpdateBooking) {
      onUpdateBooking(updated);
    } else if (onAdvanceBookingStatus) {
      onAdvanceBookingStatus(activeBooking.id, 'completed');
    }

    showToast({
      type: 'success',
      title: 'Job Completed',
      message: `Finished at ${endedAt}. Recorded ${hours} hrs (${formatTime(elapsedSeconds)}). Invoice finalized.`,
    });
  };

  // 5. UPDATE TECHNICIAN FIELD NOTES
  const handleSaveNotes = (newNotes: string) => {
    setWorkerNotes(newNotes);
    if (!activeBooking) return;
    const updated: Booking = { ...activeBooking, notes: newNotes };
    if (onUpdateBooking) {
      onUpdateBooking(updated);
    }
  };

  // 6. TOGGLE ADDITIONAL WORK ITEM
  const handleToggleAdditionalItem = (id: string) => {
    if (!activeBooking) return;
    const currentItems = activeBooking.additionalWorkItems || [];
    const updatedItems = currentItems.map((item) =>
      item.id === id ? { ...item, approved: !item.approved } : item
    );
    const updated: Booking = { ...activeBooking, additionalWorkItems: updatedItems };
    if (onUpdateBooking) {
      onUpdateBooking(updated);
    }
  };

  // 7. ADD NEW ADDITIONAL WORK ITEM
  const handleAddNewSpare = () => {
    if (!activeBooking || !newSpareName.trim()) return;
    const cost = parseFloat(newSpareCost) || 0;
    const newItem: AdditionalWorkItem = {
      id: `add-${Date.now()}`,
      name: newSpareName.trim(),
      cost,
      approved: true,
      addedBy: 'worker',
    };
    const updatedItems = [...(activeBooking.additionalWorkItems || []), newItem];
    const updated: Booking = { ...activeBooking, additionalWorkItems: updatedItems };
    if (onUpdateBooking) {
      onUpdateBooking(updated);
    }
    setNewSpareName('');
    setNewSpareCost('');
    setShowAddSpareForm(false);
    showToast({
      type: 'info',
      title: 'Spares / Work Added',
      message: `${newItem.name} (₹${cost}) added. Synced with customer invoice.`,
    });
  };

  const isIncomingForCurrentWorker =
    activeBooking &&
    (activeBooking.worker.id === currentWorker.id || !workerProfile);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ============================================================== */}
      {/* 1. INCOMING REQUEST ALERT (Milestone 11 Core Worker Requirement) */}
      {/* ============================================================== */}
      {isIncomingForCurrentWorker && activeBooking.status === 'requested' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.03] to-white/95 backdrop-blur-xl border border-amber-500/30 glass-specular-edge shadow-sm relative overflow-hidden animate-fade-in">
          {/* Pulsing indicator */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-500/15">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base sm:text-lg font-bold text-[#111111] tracking-tight">
                    Incoming Service Request Alert
                  </h2>
                  <Badge variant="accent" size="sm" className="bg-amber-100 text-amber-900 border-amber-300">
                    ACTION REQUIRED
                  </Badge>
                  <Badge variant="success" size="sm">
                    Within 10 km Zone
                  </Badge>
                </div>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Customer is awaiting response within 15 minutes. Accept to confirm this schedule.
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-xl border border-amber-200">
              Booking #{activeBooking.id.slice(0, 8)}
            </span>
          </div>

          {/* Job Details Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/80 border border-black/5 shadow-2xs">
              <span className="text-[#86868B] block mb-1 font-medium">Service &amp; Task</span>
              <p className="font-bold text-[#111111] text-sm truncate">
                {activeBooking.job.serviceCategory}
              </p>
              <p className="text-[11px] text-[#6E6E73] truncate mt-0.5">
                &ldquo;{activeBooking.job.rawPrompt}&rdquo;
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-black/5 shadow-2xs">
              <span className="text-[#86868B] block mb-1 font-medium">Customer Location</span>
              <p className="font-bold text-[#111111] text-sm flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#0071E3] shrink-0 inline mr-1" />
                <span>Indiranagar 100ft Rd</span>
              </p>
              <p className="text-[11px] text-[#0071E3] font-medium mt-0.5">
                {activeBooking.worker.distanceKm.toFixed(1)} km away • {activeBooking.worker.distanceKm <= 5 ? 'Free Zone' : 'Tariff Zone'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-black/5 shadow-2xs">
              <span className="text-[#86868B] block mb-1 font-medium">Requested Schedule</span>
              <p className="font-bold text-[#111111] text-sm flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-[#5856D6] shrink-0 inline mr-1" />
                <span>{activeBooking.scheduledDate || 'Today'}</span>
              </p>
              <p className="text-[11px] text-[#5856D6] font-medium mt-0.5 flex items-center">
                <Clock className="w-3 h-3 inline mr-1" />
                {activeBooking.scheduledTimeSlot || 'Immediate (<45m)'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 border border-black/5 shadow-2xs">
              <span className="text-[#86868B] block mb-1 font-medium">Estimated Payout</span>
              <p className="text-base font-extrabold text-[#111111]">
                ₹{activeBooking.estimatedTotal}
              </p>
              <p className="text-[11px] text-[#34C759] font-medium mt-0.5">
                Labour ₹{activeBooking.baseLabourFee} + Travel ₹{activeBooking.travelCharge}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/15">
            <div className="flex items-center space-x-2 text-xs text-[#6E6E73]">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Accepting locks this slot in your schedule and notifies the customer instantly.</span>
            </div>

            <div className="flex items-center space-x-2.5">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setIsJobDetailsOpen(true)}
                className="text-xs font-semibold text-[#111111]"
              >
                View Job Details
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowDeclineConfirm(true)}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Decline Request
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleAccept}
                className="bg-[#34C759] hover:bg-[#2EB150] text-white font-bold px-5 shadow-xs flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Accept Job Request</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Confirmation Modal */}
      {showDeclineConfirm && (
        <Modal
          isOpen={showDeclineConfirm}
          onClose={() => setShowDeclineConfirm(false)}
          title="Decline Job Request?"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setShowDeclineConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleReject}>
                Confirm Decline
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-[#6E6E73]">
              Are you sure you want to decline this request? The customer will be re-matched with another qualified professional in the 10 km service radius.
            </p>
            <div>
              <label className="block text-[#111111] font-semibold mb-1">
                Reason for declining (optional):
              </label>
              <select
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs"
              >
                <option value="Worker schedule conflict">Schedule Conflict / Busy with another job</option>
                <option value="Outside immediate capacity">Outside immediate capacity</option>
                <option value="Required specialized tools unavailable">Required specialized tools unavailable</option>
                <option value="Personal off-duty time">Personal off-duty time</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Pause Confirmation Modal */}
      {showPauseModal && (
        <Modal
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          title="Pause Service Execution?"
          subtitle="Stop the working duration clock while stepping away or collecting parts."
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="ghost" size="sm" onClick={() => setShowPauseModal(false)}>
                Cancel
              </Button>
              <Button variant="warning" size="sm" onClick={handleConfirmPause}>
                Confirm Pause
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <p className="text-[#6E6E73]">
              Paused duration is strictly non-billable to the customer. Select the reason for pausing:
            </p>
            <div className="space-y-2">
              {[
                'Procuring spare parts (Capacitor/Gas)',
                'Awaiting customer access / site clearance',
                'Technical consultation / diagnostic review',
                'Temporary break / safety check',
              ].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setPauseReasonInput(reason)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    pauseReasonInput === reason
                      ? 'bg-amber-500/10 border-amber-500 text-amber-900 font-bold'
                      : 'bg-white border-black/10 text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

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

      {/* Main Mode Toggle: Active Dispatch vs Schedule View */}
      <div className="flex items-center space-x-2 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'dispatch'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'text-[#6E6E73] hover:text-[#111111] bg-white border border-black/5'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Active Dispatch &amp; Onsite Service</span>
          {activeBooking && (activeBooking.status === 'in_progress' || activeBooking.status === 'requested') && (
            <span className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse ml-1" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'schedule'
              ? 'bg-[#111111] text-white shadow-xs'
              : 'text-[#6E6E73] hover:text-[#111111] bg-white border border-black/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#5856D6]" />
          <span>Schedule View</span>
          {activeBooking && (
            <Badge variant="neutral" size="sm" className="ml-1 text-[10px]">
              1 Slot Booked
            </Badge>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE DISPATCH & ONSITE SERVICE CONTROLLER (Milestone 12 Core) */}
      {activeTab === 'dispatch' && (
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* ONSITE SERVICE CONTROLLER (Worker standing at customer home)  */}
          {/* ============================================================== */}
          {activeBooking && ['accepted', 'in_progress', 'paused', 'completed'].includes(activeBooking.status) && (
            <div className="space-y-4 animate-fade-in">
              {/* Floating / Sticky Glass Status & Action Strip */}
              <div className="p-4 sm:p-5 rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 glass-specular-edge shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-black/5 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868B]">
                        Onsite Service Controller
                      </span>
                      <Badge
                        variant={
                          activeBooking.status === 'in_progress'
                            ? 'success'
                            : activeBooking.status === 'paused'
                            ? 'accent'
                            : activeBooking.status === 'completed'
                            ? 'default'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {activeBooking.status === 'in_progress' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse inline-block mr-1.5" />
                        )}
                        {activeBooking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="text-lg font-extrabold text-[#111111] mt-0.5 tracking-tight">
                      {activeBooking.job.serviceCategory}
                    </h3>
                    <p className="text-xs text-[#6E6E73]">
                      Customer: Indiranagar 100ft Rd • Worker Status:{' '}
                      <strong className="text-[#111111]">
                        {activeBooking.workerStatusMessage ||
                          (activeBooking.status === 'in_progress'
                            ? 'Active Onsite'
                            : activeBooking.status === 'paused'
                            ? 'Paused'
                            : 'Ready')}
                      </strong>
                    </p>
                  </div>

                  {/* Working Duration Timer Display */}
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider block">
                      Working Duration
                    </span>
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
                      {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-[11px] text-[#6E6E73] block mt-0.5">
                      {actualHoursWorked} hrs @ ₹{currentWorker.hourlyRate}/hr
                    </span>
                  </div>
                </div>

                {/* Primary High-Clarity Tactile Action Targets */}
                <div className="pt-1">
                  {/* State 1: ACCEPTED -> Start Job */}
                  {activeBooking.status === 'accepted' && (
                    <button
                      onClick={handleStartJob}
                      className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#34C759] hover:bg-[#2EB150] active:scale-[0.98] text-white font-extrabold text-base shadow-sm transition-transform flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5 fill-white" />
                      <span>Start Job (Commence Working Clock)</span>
                    </button>
                  )}

                  {/* State 2: IN_PROGRESS -> Pause or Complete */}
                  {activeBooking.status === 'in_progress' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowPauseModal(true)}
                        className="min-h-[52px] py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-transform flex items-center justify-center space-x-2"
                      >
                        <Pause className="w-4 h-4 fill-white" />
                        <span>Pause Job (Temporary Clock Stop)</span>
                      </button>

                      <button
                        onClick={handleCompleteJob}
                        className="min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-black active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-transform flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                        <span>Complete Job (Finalize Service)</span>
                      </button>
                    </div>
                  )}

                  {/* State 3: PAUSED -> Resume or Complete */}
                  {activeBooking.status === 'paused' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={handleResumeJob}
                        className="min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-transform flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Resume Job (Restart Working Clock)</span>
                      </button>

                      <button
                        onClick={handleCompleteJob}
                        className="min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-black active:scale-[0.98] text-white font-bold text-sm shadow-xs transition-transform flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
                        <span>Complete Job (Finalize Service)</span>
                      </button>
                    </div>
                  )}

                  {/* State 4: COMPLETED -> Finalized */}
                  {activeBooking.status === 'completed' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800 font-semibold">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Job Finalized at {activeBooking.endedAt}. Ready for customer settlement.</span>
                      </div>
                      <Badge variant="success" size="sm">
                        TOTAL: ₹{activeBooking.finalTotal}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* ============================================================ */}
              {/* SOLID SURFACES FOR DENSE INFORMATION                         */}
              {/* ============================================================ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Solid Card 1: Time Tracking Log */}
                <div className="p-5 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-[#111111] flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-[#0071E3]" />
                      <span>Execution Time Log</span>
                    </span>
                    <span className="font-mono text-[#86868B] text-[11px]">
                      Rate: ₹{currentWorker.hourlyRate}/h
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#6E6E73]">Start Time:</span>
                      <strong className="text-[#111111]">{activeBooking.startedAt || 'Pending Start'}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#6E6E73]">End Time:</span>
                      <strong className="text-[#111111]">
                        {activeBooking.endedAt ||
                          (activeBooking.status === 'in_progress'
                            ? 'Currently Running'
                            : activeBooking.status === 'paused'
                            ? 'Temporarily Paused'
                            : '—')}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-[#6E6E73]">Working Duration:</span>
                      <strong className="text-[#0071E3] font-mono font-bold">
                        {formatTime(elapsedSeconds)} ({actualHoursWorked} hrs)
                      </strong>
                    </div>

                    {activeBooking.pausedAt && (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                        <span className="font-bold block">Paused at: {activeBooking.pausedAt}</span>
                        <span>Reason: {activeBooking.pauseReason}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Solid Card 2: Additional Work & Spares */}
                <div className="p-5 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-[#111111] flex items-center space-x-1.5">
                      <Wrench className="w-4 h-4 text-[#5856D6]" />
                      <span>Additional Work &amp; Spares</span>
                    </span>
                    <button
                      onClick={() => setShowAddSpareForm((prev) => !prev)}
                      className="text-[#0071E3] font-bold text-xs flex items-center space-x-0.5 hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Add spare inline form */}
                  {showAddSpareForm && (
                    <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-black/5 space-y-2">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Run Capacitor 45uF)"
                        value={newSpareName}
                        onChange={(e) => setNewSpareName(e.target.value)}
                        className="w-full p-2 rounded-lg bg-white border border-black/10 text-xs"
                      />
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          placeholder="Cost (₹)"
                          value={newSpareCost}
                          onChange={(e) => setNewSpareCost(e.target.value)}
                          className="w-1/2 p-2 rounded-lg bg-white border border-black/10 text-xs"
                        />
                        <Button variant="primary" size="sm" onClick={handleAddNewSpare} className="w-1/2">
                          Save Spare
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {(activeBooking.additionalWorkItems || [
                      { id: 'add-1', name: 'Inverter Run Capacitor (45µF)', cost: 450, approved: true },
                      { id: 'add-2', name: 'High-Pressure Gas Leakage Testing', cost: 350, approved: false },
                    ]).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggleAdditionalItem(item.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          item.approved
                            ? 'bg-[#0071E3]/5 border-[#0071E3]/30 font-medium text-[#111111]'
                            : 'bg-[#FBFBFD] border-black/5 text-[#6E6E73]'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.approved}
                            onChange={() => {}}
                            className="rounded accent-[#0071E3]"
                          />
                          <span className="truncate max-w-[130px]">{item.name}</span>
                        </div>
                        <span className="font-bold">₹{item.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solid Card 3: Technician Field Notes */}
                <div className="p-5 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-black/5">
                    <span className="font-bold text-[#111111] flex items-center space-x-1.5">
                      <FileText className="w-4 h-4 text-[#34C759]" />
                      <span>Technician Field Notes</span>
                    </span>
                    <span className="text-[10px] text-[#86868B]">Auto-synced</span>
                  </div>

                  {/* Preset chips for fast phone input */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Replaced 45µF capacitor',
                      'Coils cleaned',
                      'Gas pressure 65 PSI',
                      'Amp draw 4.2A normal',
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => {
                          const updated = workerNotes ? `${workerNotes}. ${chip}` : chip;
                          handleSaveNotes(updated);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] border border-black/5 text-[10px] text-[#6E6E73] hover:text-[#111111] hover:bg-black/5 transition-all"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    value={workerNotes}
                    onChange={(e) => handleSaveNotes(e.target.value)}
                    placeholder="Enter technician observations or actions taken onsite..."
                    className="w-full p-2.5 rounded-xl border border-black/10 bg-[#FBFBFD] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
                  />
                </div>
              </div>
            </div>
          )}

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
      )}

      {/* TAB 2: SCHEDULE VIEW (Milestone 11 Core Worker Requirement) */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-fade-in">
          {/* Day Selector */}
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#5856D6]" />
              <h3 className="text-sm font-bold text-[#111111]">Worker Schedule &amp; Time Slots</h3>
            </div>

            <div className="flex items-center space-x-1 p-1 bg-[#F5F5F7] rounded-xl text-xs">
              {(
                [
                  { key: 'today', label: 'Today' },
                  { key: 'tomorrow', label: 'Tomorrow' },
                  { key: 'upcoming', label: 'This Week' },
                ] as const
              ).map((day) => (
                <button
                  key={day.key}
                  onClick={() => setSelectedScheduleDay(day.key)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedScheduleDay === day.key
                      ? 'bg-white text-[#111111] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule Timeline */}
          <div className="space-y-3">
            {[
              {
                slot: '09:00 - 12:00',
                label: 'Morning Window',
                isBooked:
                  selectedScheduleDay === 'today' &&
                  Boolean(activeBooking && activeBooking.scheduledTimeSlot?.includes('Morning')),
              },
              {
                slot: '12:00 - 13:00',
                label: 'Commute & Equipment Check Buffer',
                isBuffer: true,
              },
              {
                slot: '13:00 - 16:00',
                label: 'Afternoon Window',
                isBooked:
                  selectedScheduleDay === 'today' &&
                  Boolean(
                    activeBooking &&
                      (activeBooking.scheduledTimeSlot?.includes('Afternoon') ||
                        activeBooking.scheduledTimeSlot?.includes('Immediate'))
                  ),
              },
              {
                slot: '17:00 - 20:00',
                label: 'Evening Window',
                isBooked:
                  selectedScheduleDay === 'today' &&
                  Boolean(activeBooking && activeBooking.scheduledTimeSlot?.includes('Evening')),
              },
            ].map((timeSlot, idx) => {
              if (timeSlot.isBuffer) {
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-[#F5F5F7]/80 border border-black/5 text-xs text-[#86868B] flex items-center justify-between"
                  >
                    <span className="font-mono text-[11px]">{timeSlot.slot}</span>
                    <span>{timeSlot.label}</span>
                    <span className="text-[10px] text-[#86868B]">Travel Buffer</span>
                  </div>
                );
              }

              if (timeSlot.isBooked && activeBooking) {
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border-2 border-[#0071E3] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#0071E3]">
                          {timeSlot.slot}
                        </span>
                        <span className="text-xs text-[#86868B]">•</span>
                        <span className="text-xs font-bold text-[#111111]">
                          {timeSlot.label}
                        </span>
                      </div>
                      <Badge
                        variant={
                          activeBooking.status === 'requested'
                            ? 'accent'
                            : activeBooking.status === 'accepted'
                            ? 'default'
                            : 'success'
                        }
                        size="sm"
                      >
                        {activeBooking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F5F5F7] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#111111]">{activeBooking.job.serviceCategory}</p>
                        <p className="text-[11px] text-[#6E6E73]">
                          Indiranagar 100ft Rd • {activeBooking.worker.distanceKm.toFixed(1)} km
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#111111] block">₹{activeBooking.estimatedTotal}</span>
                        <button
                          onClick={() => setIsJobDetailsOpen(true)}
                          className="text-[11px] text-[#0071E3] hover:underline font-semibold"
                        >
                          Details &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white border border-black/5 shadow-2xs flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-[#86868B]">{timeSlot.slot}</span>
                    <span className="text-[#86868B]">•</span>
                    <span className="font-semibold text-[#111111]">{timeSlot.label}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-[#34C759] font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
                      <span>Available for 10 km Instant Dispatch</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. JOB DETAILS MODAL                                           */}
      {/* ============================================================== */}
      {activeBooking && (
        <Modal
          isOpen={isJobDetailsOpen}
          onClose={() => setIsJobDetailsOpen(false)}
          title={
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-[#0071E3]" />
              <span className="font-bold text-[#111111]">Job Details • #{activeBooking.id.slice(0, 8)}</span>
            </div>
          }
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-[#86868B]">
                WorkLink Verified Service Dispatch
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setIsJobDetailsOpen(false)}>
                  Close
                </Button>
                {activeBooking.status === 'requested' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      handleAccept();
                      setIsJobDetailsOpen(false);
                    }}
                    className="bg-[#34C759] hover:bg-[#2EB150] text-white font-bold"
                  >
                    Accept Job
                  </Button>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            {/* Customer & Location */}
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#111111]">Customer Location</span>
                <Badge variant="accent" size="sm">
                  {activeBooking.worker.distanceKm.toFixed(1)} km from your base
                </Badge>
              </div>
              <p className="text-[#6E6E73]">
                Indiranagar 100ft Rd, Bangalore 560038
              </p>
              <p className="text-[11px] text-[#0071E3]">
                {activeBooking.worker.distanceKm <= 5
                  ? 'Within 0–5 km Free Travel Zone'
                  : `5–10 km Band (Travel Charge: ₹${activeBooking.travelCharge})`}
              </p>
            </div>

            {/* Scope & Description */}
            <div className="p-3.5 rounded-2xl bg-white border border-black/5 space-y-1.5">
              <span className="font-bold text-[#111111] block">Customer Problem Description</span>
              <p className="text-[#6E6E73] leading-relaxed italic bg-[#FBFBFD] p-2.5 rounded-xl border border-black/5">
                &ldquo;{activeBooking.job.rawPrompt}&rdquo;
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {activeBooking.job.requiredSkills.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-[10px] font-semibold text-[#111111]"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Tools Checklist */}
            <div className="p-3.5 rounded-2xl bg-white border border-black/5 space-y-2">
              <span className="font-bold text-[#111111] flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#5856D6]" />
                <span>Recommended Equipment Checklist</span>
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#F5F5F7] flex items-center space-x-1.5 text-[#111111]">
                  <Check className="w-3 h-3 text-[#34C759]" />
                  <span>Digital Multimeter &amp; Clamp Meter</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F5F5F7] flex items-center space-x-1.5 text-[#111111]">
                  <Check className="w-3 h-3 text-[#34C759]" />
                  <span>Insulated Hand Toolset (1000V)</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F5F5F7] flex items-center space-x-1.5 text-[#111111]">
                  <Check className="w-3 h-3 text-[#34C759]" />
                  <span>PPE Safety Gloves &amp; Protective Goggles</span>
                </div>
                <div className="p-2 rounded-lg bg-[#F5F5F7] flex items-center space-x-1.5 text-[#111111]">
                  <Check className="w-3 h-3 text-[#34C759]" />
                  <span>Spare Capacitor / Diagnostic Kit</span>
                </div>
              </div>
            </div>

            {/* Fair Wage & Tariff Breakdown */}
            <div className="p-3.5 rounded-2xl bg-white border border-black/5 space-y-2">
              <span className="font-bold text-[#111111] block">Fair Wage &amp; Tariff Breakdown</span>
              <div className="space-y-1 text-[11px] text-[#6E6E73]">
                <div className="flex justify-between">
                  <span>Base Labour ({activeBooking.estimatedHours || 2} hrs @ ₹{activeBooking.worker.hourlyRate}/hr)</span>
                  <span className="font-semibold text-[#111111]">₹{activeBooking.baseLabourFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Travel Tariff ({activeBooking.worker.distanceKm.toFixed(1)} km)</span>
                  <span className="font-semibold text-[#111111]">₹{activeBooking.travelCharge}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-black/5 font-bold text-[#111111]">
                  <span>Total Worker Payout</span>
                  <span className="text-[#34C759]">₹{activeBooking.estimatedTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
