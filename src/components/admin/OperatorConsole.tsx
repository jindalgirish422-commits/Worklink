import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  BarChart3,
  Users,
  Clock,
  Compass,
  FileCheck,
  Search,
  DollarSign,
  TrendingUp,
  Percent,
  Star,
  Activity,
  Briefcase,
  MapPin,
  Check,
  X,
  AlertCircle,
  Eye,
  Filter,
  RefreshCw,
  Phone,
  ChevronRight,
  ArrowUpRight,
  Layers,
  Wrench,
  Sparkles,
  HelpCircle,
  UserPlus,
  UserCheck,
  UserX,
  Ban,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Worker,
  MatchingWeights,
  Booking,
  AvailabilityStatus,
  TradeCategory,
  WorkerApprovalStatus,
} from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import {
  createOperatorWorker,
  approveWorkerRecord,
  rejectWorkerRecord,
  suspendWorkerRecord,
} from '../../services/authService';

export interface OperatorConsoleProps {
  workers: Worker[];
  onOpenWeightsModal: () => void;
  onNavigateToIntelligence: () => void;
  onNavigateToRadar: () => void;
  currentWeights: MatchingWeights;
  activeBooking?: Booking | null;
  recentBookings?: Booking[];
  onUpdateWorkers?: (updatedWorkers: Worker[]) => void;
}

export interface OperatorDispute {
  id: string;
  bookingId: string;
  customerName: string;
  workerName: string;
  service: string;
  type: 'spare_cost' | 'delay' | 'scope_change';
  description: string;
  amount: number;
  status: 'pending' | 'resolved' | 'escalated';
  createdAt: string;
}

const ALL_TRADE_CATEGORIES: TradeCategory[] = [
  'AC Technician',
  'Plumber',
  'Electrician',
  'Carpenter',
  'Painter',
  'Mechanic',
  'Appliance Repair',
  'Cleaning Professional',
  'Mason / General Technician',
  'Locksmith',
  'Electronics Specialist',
  'Networking Specialist',
  'Gas Appliance Specialist',
  'Glass & Aluminium Specialist',
  'Gardener / Landscaper',
  'Furniture Assembly Specialist',
];

const SKILL_SUGGESTIONS: Record<string, string[]> = {
  'AC Technician': ['AC Diagnostics', 'Gas Leak Detection', 'PCB Inverter Repair', 'Coil Cleaning', 'Copper Brazing'],
  'Plumber': ['Pipe Leak Repair', 'Bathroom Fitting', 'Drain Blockage Removal', 'Water Motor Installation', 'PPR Welding'],
  'Electrician': ['Short Circuit Troubleshooting', 'MCB & DB Box Repair', 'Ceiling Fan Installation', 'House Rewiring'],
  'Carpenter': ['Door Jamming Fix', 'Modular Kitchen Hinge Repair', 'Lock & Handle Replacement', 'Custom Woodwork'],
  'Painter': ['Dampness Water-proofing', 'Wall Touch-up & Putty', 'Texture Painting', 'Ceiling Stain Removal'],
  'Mechanic': ['Engine Diagnostics', 'Brake System Overhaul', 'Battery Jump & Alternator', 'Emergency Puncture Fix'],
  'Appliance Repair': ['Washing Machine Drum Fault', 'Microwave Magnetron Repair', 'Refrigerator Cooling Repair'],
  'Cleaning Professional': ['Deep Home Cleaning', 'Kitchen Degreasing', 'Sofa Shampooing', 'Sanitization'],
  'Mason / General Technician': ['Tile Grouting & Replacement', 'Plaster Patch Repair', 'Granite Chip Restoration', 'Wall Core Drilling'],
  'Locksmith': ['High-Security Lock Installation', 'Cylinder Extraction', 'Emergency Lockout Opening', 'Deadbolt Alignment'],
  'Networking Specialist': ['Mesh WiFi Calibration', 'Cat6 LAN Termination', 'Optical Fiber Splicing', 'Router Gateway Configuration'],
  'Gardener / Landscaper': ['Lawn Aeration & Mowing', 'Ornamental Tree Pruning', 'Organic Soil Enrichment', 'Drip Irrigation Maintenance'],
  'Furniture Assembly Specialist': ['Flatpack Hardware Fastening', 'Hydraulic Lift Bed Assembly', 'Modular Wardrobe Aligning'],
};

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  workers,
  onOpenWeightsModal,
  onNavigateToIntelligence,
  onNavigateToRadar,
  currentWeights,
  activeBooking,
  recentBookings = [],
  onUpdateWorkers,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'workers' | 'bookings'>('overview');

  // Worker management state
  const [workerList, setWorkerList] = useState<Worker[]>(workers);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [workerTradeFilter, setWorkerTradeFilter] = useState('All');
  const [workerStatusFilter, setWorkerStatusFilter] = useState<'All' | WorkerApprovalStatus>('All');
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Worker | null>(null);

  // Modals for governance workflows
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [approvingWorker, setApprovingWorker] = useState<Worker | null>(null);
  const [rejectingWorker, setRejectingWorker] = useState<Worker | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [suspendingWorker, setSuspendingWorker] = useState<Worker | null>(null);
  const [suspensionReasonText, setSuspensionReasonText] = useState('');

  // Add Worker Form State
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('+91 98');
  const [newWorkerTrade, setNewWorkerTrade] = useState<TradeCategory>('AC Technician');
  const [newWorkerSkills, setNewWorkerSkills] = useState<string[]>(['AC Diagnostics', 'Gas Leak Detection']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [newWorkerExp, setNewWorkerExp] = useState(4);
  const [newWorkerHourly, setNewWorkerHourly] = useState(350);
  const [newWorkerQuote, setNewWorkerQuote] = useState(600);
  const [newWorkerAddress, setNewWorkerAddress] = useState('Hauz Khas Enclave, New Delhi');
  const [newWorkerLicense, setNewWorkerLicense] = useState(`LIC-DL-${Date.now().toString().slice(-4)}`);
  const [newWorkerAvailability, setNewWorkerAvailability] = useState<AvailabilityStatus>('immediate');
  const [newWorkerAutoApprove, setNewWorkerAutoApprove] = useState(true);
  const [newWorkerBio, setNewWorkerBio] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Booking management filter state
  const [bookingFilterStatus, setBookingFilterStatus] = useState<
    'all' | 'active' | 'completed' | 'cancelled' | 'issues' | 'disputes'
  >('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Disputes state
  const [disputes, setDisputes] = useState<OperatorDispute[]>([
    {
      id: 'disp-01',
      bookingId: 'b-ac-9812',
      customerName: 'Kavita Menon',
      workerName: 'Rajesh Kumar',
      service: 'Inverter AC Diagnostic',
      type: 'spare_cost',
      description: 'Customer requested clarification on ₹450 45µF Run Capacitor addition.',
      amount: 450,
      status: 'pending',
      createdAt: '1 hour ago',
    },
    {
      id: 'disp-02',
      bookingId: 'b-pl-4410',
      customerName: 'Arjun Das',
      workerName: 'Manoj Nair',
      service: 'Concealed Pipe Repair',
      type: 'scope_change',
      description: 'Additional excavation needed behind kitchen tile. Customer pre-approved offline.',
      amount: 600,
      status: 'pending',
      createdAt: '3 hours ago',
    },
  ]);

  // Sync worker list with parent updates if incoming workers change
  React.useEffect(() => {
    setWorkerList(workers);
  }, [workers]);

  const updateAndPropagateWorkers = (newWorkers: Worker[]) => {
    setWorkerList(newWorkers);
    if (onUpdateWorkers) {
      onUpdateWorkers(newWorkers);
    }
  };

  // -----------------------------------------------------------------
  // 1. APPROVAL WORKFLOW
  // -----------------------------------------------------------------
  const handleConfirmApproval = () => {
    if (!approvingWorker) return;
    try {
      const updated = approveWorkerRecord(currentUser, approvingWorker.id, workerList);
      updateAndPropagateWorkers(updated);
      showToast({
        type: 'success',
        title: 'Worker Approved & Active',
        message: `${approvingWorker.name} is now approved and eligible for customer search and matching.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Approval Failed',
        message: err.message || 'Operator authorization error.',
      });
    } finally {
      setApprovingWorker(null);
    }
  };

  // -----------------------------------------------------------------
  // 2. REJECTION WORKFLOW
  // -----------------------------------------------------------------
  const handleConfirmRejection = () => {
    if (!rejectingWorker) return;
    try {
      const updated = rejectWorkerRecord(
        currentUser,
        rejectingWorker.id,
        rejectionReasonText,
        workerList
      );
      updateAndPropagateWorkers(updated);
      showToast({
        type: 'warning',
        title: 'Worker Registration Rejected',
        message: `${rejectingWorker.name} marked as REJECTED. Ineligible for customer discovery.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Operator authorization error.',
      });
    } finally {
      setRejectingWorker(null);
      setRejectionReasonText('');
    }
  };

  // -----------------------------------------------------------------
  // 3. SUSPENSION & REACTIVATION WORKFLOW
  // -----------------------------------------------------------------
  const handleConfirmSuspension = () => {
    if (!suspendingWorker) return;
    try {
      const updated = suspendWorkerRecord(
        currentUser,
        suspendingWorker.id,
        suspensionReasonText,
        workerList
      );
      updateAndPropagateWorkers(updated);
      showToast({
        type: 'warning',
        title: 'Worker Suspended',
        message: `${suspendingWorker.name} has been suspended from the 10 km dispatch pool.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Operator authorization error.',
      });
    } finally {
      setSuspendingWorker(null);
      setSuspensionReasonText('');
    }
  };

  const handleReactivateWorker = (workerId: string) => {
    try {
      const updated = approveWorkerRecord(currentUser, workerId, workerList);
      updateAndPropagateWorkers(updated);
      showToast({
        type: 'success',
        title: 'Worker Reactivated',
        message: `Worker account ${workerId} has been restored to APPROVED status.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      });
    }
  };

  // Verification toggle alias for governance actions (Approve / Revoke)
  const handleToggleVerification = (id: string, currentVerified: boolean) => {
    if (currentVerified) {
      const worker = workerList.find((w) => w.id === id);
      if (worker) setSuspendingWorker(worker);
    } else {
      const worker = workerList.find((w) => w.id === id);
      if (worker) setApprovingWorker(worker);
    }
  };

  // -----------------------------------------------------------------
  // 4. ADD WORKER FORM SUBMISSION
  // -----------------------------------------------------------------
  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (!newWorkerName.trim()) {
        throw new Error('Please enter worker full name.');
      }
      if (newWorkerSkills.length === 0) {
        throw new Error('Please select or add at least one specialized skill.');
      }
      if (!newWorkerLicense.trim()) {
        throw new Error('Please enter a trade license or government ID number.');
      }

      const created = createOperatorWorker(currentUser, {
        name: newWorkerName,
        trade: newWorkerTrade,
        skills: newWorkerSkills,
        experienceYears: newWorkerExp,
        hourlyRate: newWorkerHourly,
        estimatedQuote: newWorkerQuote,
        licenseNumber: newWorkerLicense,
        backgroundCheckPassed: true,
        phone: newWorkerPhone,
        bio: newWorkerBio || `${newWorkerExp}+ years professional experience in ${newWorkerTrade}. Verified by WorkLink.`,
        coordinates: { lat: 28.545, lng: 77.204 },
        distanceKm: 2.2,
        availabilityStatus: newWorkerAvailability,
        autoApprove: newWorkerAutoApprove,
        toolsEquipped: ['Standard Professional Toolset', 'Diagnostic Equipment'],
      });

      const updated = [created, ...workerList];
      updateAndPropagateWorkers(updated);

      showToast({
        type: 'success',
        title: newWorkerAutoApprove ? 'Worker Created & Approved' : 'Worker Created (Pending Approval)',
        message: `${created.name} (${created.id}) added to WorkLink registry with status: ${created.approvalStatus}.`,
      });

      // Reset form
      setNewWorkerName('');
      setNewWorkerPhone('+91 98');
      setNewWorkerBio('');
      setIsAddWorkerModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create worker.');
    }
  };

  const handleToggleAddSkill = (skill: string) => {
    setNewWorkerSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkillInput.trim() && !newWorkerSkills.includes(customSkillInput.trim())) {
      setNewWorkerSkills((prev) => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  // Handle worker availability toggle by operator
  const handleOperatorChangeAvailability = (id: string, status: AvailabilityStatus) => {
    const updated = workerList.map((w) => (w.id === id ? { ...w, availabilityStatus: status } : w));
    updateAndPropagateWorkers(updated);
    showToast({
      type: 'info',
      title: 'Worker Status Updated',
      message: `Worker ${id} status set to ${status.toUpperCase()} in the 10 km pool.`,
    });
  };

  // Handle dispute resolution
  const handleResolveDispute = (disputeId: string, resolution: 'approved' | 'credited') => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === disputeId ? { ...d, status: 'resolved' } : d))
    );
    showToast({
      type: 'success',
      title: 'Dispute Resolved',
      message: `Dispute #${disputeId} marked as resolved. Escrow updated accordingly.`,
    });
  };

  // Overview metrics computation
  const pendingApprovalsList = workerList.filter(
    (w) => w.approvalStatus === 'PENDING_APPROVAL' || (!w.approvalStatus && !w.isVerified)
  );
  const approvedWorkersList = workerList.filter(
    (w) => w.approvalStatus === 'APPROVED' || (!w.approvalStatus && w.isVerified)
  );
  const suspendedWorkersList = workerList.filter((w) => w.approvalStatus === 'SUSPENDED');
  const rejectedWorkersList = workerList.filter((w) => w.approvalStatus === 'REJECTED');

  const activeWorkersCount = approvedWorkersList.filter((w) => w.availabilityStatus !== 'busy').length;
  const verifiedWorkersCount = approvedWorkersList.length;
  const pendingVerificationCount = pendingApprovalsList.length;
  const activeJobsCount =
    (activeBooking && ['requested', 'accepted', 'in_progress', 'paused'].includes(activeBooking.status) ? 1 : 0) + 3;
  const completedJobsCount = 184 + recentBookings.filter((b) => b.status === 'completed').length;
  const cancelledJobsCount = 6 + recentBookings.filter((b) => b.status === 'cancelled').length;
  const totalRevenue = 148650 + (activeBooking?.finalTotal || 0);
  const utilizationRate = 82.4;
  const averageRating = (
    approvedWorkersList.reduce((acc, w) => acc + w.rating, 0) / (approvedWorkersList.length || 1)
  ).toFixed(2);

  // Filtered workers list
  const filteredWorkers = workerList.filter((w) => {
    const matchesQuery =
      w.name.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.trade.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.licenseNumber.toLowerCase().includes(workerSearchQuery.toLowerCase());
    const matchesTrade = workerTradeFilter === 'All' || w.trade === workerTradeFilter;

    let matchesStatus = true;
    if (workerStatusFilter !== 'All') {
      const currentStatus = w.approvalStatus || (w.isVerified ? 'APPROVED' : 'PENDING_APPROVAL');
      matchesStatus = currentStatus === workerStatusFilter;
    }

    return matchesQuery && matchesTrade && matchesStatus;
  });

  // Seed sample bookings list for Booking Management
  const allBookings = [
    ...(activeBooking
      ? [
          {
            id: activeBooking.id,
            service: activeBooking.job.serviceCategory,
            customer: (activeBooking.job as any)?.customerName || 'Anita Sharma',
            worker: activeBooking.worker.name,
            workerId: activeBooking.worker.id,
            address: activeBooking.job.location.address,
            distanceKm: activeBooking.worker.distanceKm,
            date: activeBooking.scheduledDate || 'Today',
            slot: activeBooking.scheduledTimeSlot || 'Immediate',
            amount: activeBooking.finalTotal || activeBooking.estimatedTotal,
            status: activeBooking.status,
            issue: activeBooking.status === 'paused' ? 'Paused: collecting parts' : undefined,
          },
        ]
      : []),
    {
      id: 'b-live-102',
      service: 'AC Technician',
      customer: 'Kavita Menon',
      worker: 'Manoj Sharma',
      workerId: 'W3',
      address: 'Hauz Khas Enclave',
      distanceKm: 3.2,
      date: 'Today',
      slot: '14:00 - 16:00',
      amount: 850,
      status: 'in_progress',
      issue: undefined,
    },
    {
      id: 'b-live-103',
      service: 'Plumber',
      customer: 'Vikram Seth',
      worker: 'Imran Ali',
      workerId: 'W7',
      address: 'Green Park Extension',
      distanceKm: 2.1,
      date: 'Today',
      slot: '16:00 - 18:00',
      amount: 520,
      status: 'accepted',
      issue: undefined,
    },
    {
      id: 'b-live-104',
      service: 'Electrician',
      customer: 'Deepa Hegde',
      worker: 'Mohit Saxena',
      workerId: 'W8',
      address: 'Saket District Centre',
      distanceKm: 2.8,
      date: 'Today',
      slot: 'Immediate',
      amount: 680,
      status: 'in_progress',
      issue: 'Delay alert: +12m travel traffic',
    },
    {
      id: 'b-hist-201',
      service: 'AC Technician',
      customer: 'Rohan Verma',
      worker: 'Manoj Sharma',
      workerId: 'W3',
      address: 'Safdarjung Enclave',
      distanceKm: 2.1,
      date: 'Yesterday',
      slot: '11:00 - 13:00',
      amount: 750,
      status: 'completed',
      issue: undefined,
    },
    {
      id: 'b-hist-202',
      service: 'Carpenter',
      customer: 'Sunita Lal',
      worker: 'Balwinder Singh',
      workerId: 'W9',
      address: 'Greater Kailash 1',
      distanceKm: 4.4,
      date: 'Yesterday',
      slot: '15:00 - 17:00',
      amount: 700,
      status: 'completed',
      issue: undefined,
    },
  ];

  const filteredBookings = allBookings.filter((b) => {
    if (bookingFilterStatus === 'active') {
      if (!['requested', 'accepted', 'in_progress', 'paused'].includes(b.status)) return false;
    } else if (bookingFilterStatus === 'completed') {
      if (b.status !== 'completed') return false;
    } else if (bookingFilterStatus === 'cancelled') {
      if (b.status !== 'cancelled') return false;
    } else if (bookingFilterStatus === 'issues') {
      if (!b.issue) return false;
    }

    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.worker.toLowerCase().includes(q) ||
        b.service.toLowerCase().includes(q) ||
        b.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* ============================================================== */}
      {/* 1. OPERATOR HEADER & FLOATING CONTROLS                         */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Shield className="w-7 h-7 text-[#0071E3]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
                Operator Governance Console
              </h1>
              <Badge variant="accent" size="sm" className="bg-purple-100 text-purple-900 border-purple-300">
                Full Admin
              </Badge>
              <Badge variant="success" size="sm">
                10 km Strict Enforcement
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 flex items-center space-x-2">
              <span>
                Authorized Operator: <strong>{currentUser?.name || 'Anita Roy'}</strong>
              </span>
              <span>•</span>
              <span>Marketplace Integrity &amp; Compliance</span>
              <span>•</span>
              <span className="text-[#0071E3] font-semibold">South Delhi Zone</span>
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-black/8 shadow-sm glass-specular-edge flex items-center space-x-2 self-start md:self-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddWorkerModalOpen(true)}
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            className="text-xs font-semibold"
          >
            Add Professional
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWeightsModal}
            leftIcon={<Sliders className="w-3.5 h-3.5 text-[#0071E3]" />}
            className="text-xs font-semibold"
          >
            Weights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToIntelligence}
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-[#FF9500]" />}
            className="text-xs font-semibold"
          >
            Intelligence
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToRadar}
            leftIcon={<Compass className="w-3.5 h-3.5 text-[#5856D6]" />}
            className="text-xs font-semibold"
          >
            Radar
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OVERVIEW METRICS STRIP                                      */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Active workers
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">{activeWorkersCount}</span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">Online in 10 km</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Verified workers
          </span>
          <span className="text-xl font-extrabold text-[#34C759] block">{verifiedWorkersCount}</span>
          <span className="text-[10px] text-[#6E6E73] font-medium block mt-0.5">Govt ID &amp; License</span>
        </div>

        <div
          onClick={() => setActiveTab('approvals')}
          className="p-3.5 rounded-2xl bg-white border border-amber-300 shadow-xs cursor-pointer hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
              Pending verification
            </span>
            {pendingVerificationCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span className="text-xl font-extrabold text-amber-600 block">{pendingVerificationCount}</span>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5 group-hover:underline">
            Review &amp; Approve →
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Active jobs
          </span>
          <span className="text-xl font-extrabold text-[#0071E3] block">{activeJobsCount}</span>
          <span className="text-[10px] text-[#0071E3] font-medium block mt-0.5">Live execution</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Completed
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">{completedJobsCount}</span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">97.8% fulfillment</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Cancelled
          </span>
          <span className="text-xl font-extrabold text-red-600 block">{cancelledJobsCount}</span>
          <span className="text-[10px] text-[#86868B] font-medium block mt-0.5">Rate &lt;2.4%</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Revenue
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">
            ₹{(totalRevenue / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">GMV Processed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Utilization
          </span>
          <span className="text-xl font-extrabold text-[#5856D6] block">{utilizationRate}%</span>
          <span className="text-[10px] text-[#6E6E73] font-medium block mt-0.5">Dispatch efficiency</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Average rating
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-extrabold text-[#111111]">{averageRating}</span>
            <span className="text-xs text-[#FF9500] font-bold">★</span>
          </div>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">High satisfaction</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. OPERATOR CONSOLE NAVIGATION TABS                            */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 border-b border-black/8 pb-2 overflow-x-auto no-scrollbar text-xs">
        {[
          { key: 'overview', label: 'Overview & Market Intelligence' },
          {
            key: 'approvals',
            label: `Pending Approvals (${pendingApprovalsList.length})`,
            badge: pendingApprovalsList.length > 0,
          },
          { key: 'workers', label: `Worker Fleet & Governance (${workerList.length})` },
          { key: 'bookings', label: `Booking Registry (${allBookings.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap min-h-[42px] flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 4. TAB: OVERVIEW & MARKETPLACE INTELLIGENCE                    */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Panel 1: Demand by service */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[#0071E3]" />
                  <span>Demand by service</span>
                </h3>
                <span className="text-[11px] text-[#86868B] font-mono">Last 30 Days</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { trade: 'AC Technician', share: 36, color: 'bg-[#0071E3]', count: '68 jobs' },
                  { trade: 'Plumber', share: 24, color: 'bg-[#34C759]', count: '46 jobs' },
                  { trade: 'Electrician', share: 18, color: 'bg-[#FF9500]', count: '34 jobs' },
                  { trade: 'Mechanic / Auto', share: 10, color: 'bg-[#FF3B30]', count: '19 jobs' },
                  { trade: 'Carpenter', share: 7, color: 'bg-[#AF52DE]', count: '14 jobs' },
                  { trade: 'Other Trades', share: 5, color: 'bg-[#86868B]', count: '10 jobs' },
                ].map((item) => (
                  <div key={item.trade} className="space-y-1">
                    <div className="flex justify-between font-semibold text-[#111111]">
                      <span>{item.trade}</span>
                      <span className="font-mono text-[#6E6E73]">
                        {item.share}% ({item.count})
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#F5F5F7] overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 2: Demand by location (10 km Strict Enforcement) */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#FF3B30]" />
                  <span>Demand by location</span>
                </h3>
                <Badge variant="success" size="sm">
                  Strict 10km Radius
                </Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { hub: 'Hauz Khas Core (0–3 km)', share: 42, count: '80 jobs', tag: 'High Density' },
                  { hub: 'Green Park / Saket (3–5 km)', share: 28, count: '54 jobs', tag: 'Fast Response' },
                  { hub: 'Indiranagar / Cluster Hub (5–8 km)', share: 18, count: '35 jobs', tag: 'Tariff Band' },
                  { hub: 'Outer Perimeter (8–10 km)', share: 12, count: '23 jobs', tag: 'Max Perimeter' },
                ].map((loc) => (
                  <div key={loc.hub} className="p-2.5 rounded-xl bg-[#F5F5F7] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#111111] block">{loc.hub}</span>
                      <span className="text-[11px] text-[#6E6E73]">
                        {loc.count} • {loc.tag}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#111111]">{loc.share}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 3: Average booking distance & Travel Bands */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-[#5856D6]" />
                  <span>Average booking distance</span>
                </h3>
                <span className="text-xs font-mono font-bold text-[#5856D6]">2.9 km avg</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>0–5 km Free Travel Zone:</span>
                    <span>70% of Dispatches</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Zero travel tariff applied to customer. Mean technician arrival: 21 mins.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>5–10 km Extended Tariff Band:</span>
                    <span>30% of Dispatches</span>
                  </div>
                  <p className="text-[11px] text-blue-800">
                    Transparent travel fee: ₹15/km past 5 km. Zero dispatches beyond 10 km.
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-[#86868B]">
                  <span>Hard Boundary Compliance:</span>
                  <strong className="text-[#34C759]">100% (0 Violations)</strong>
                </div>
              </div>
            </div>

            {/* Panel 4: Fleet Availability State */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#34C759]" />
                  <span>Fleet Availability &amp; Dispatch</span>
                </h3>
                <span className="text-xs font-mono text-[#34C759] font-bold">Active Fleet</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-emerald-900">
                  <span className="font-bold">Available Now (&lt;45 min dispatch)</span>
                  <span className="font-mono font-extrabold">{activeWorkersCount} Online</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] flex justify-between items-center text-[#6E6E73]">
                  <span>Scheduled Tomorrow Slots</span>
                  <span className="font-mono font-bold text-[#111111]">6 Pros</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] flex justify-between items-center text-[#6E6E73]">
                  <span>Busy on Active Jobs</span>
                  <span className="font-mono font-bold text-[#111111]">{activeJobsCount} Pros</span>
                </div>
              </div>
            </div>

            {/* Panel 5: Recommendation Performance */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#FF9500]" />
                  <span>Recommendation performance</span>
                </h3>
                <span className="text-xs font-mono text-[#0071E3] font-bold">94.2% AI Accuracy</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center text-blue-900">
                  <span className="font-bold">Primary Match Conversion</span>
                  <span className="font-mono font-extrabold">88.6%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] flex justify-between items-center text-[#6E6E73]">
                  <span>Mean Ranking Latency</span>
                  <span className="font-mono font-bold text-[#111111]">12ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F5F7] flex justify-between items-center text-[#6E6E73]">
                  <span>Hard Constraint Violations</span>
                  <span className="font-mono font-bold text-[#34C759]">0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: PENDING WORKER APPROVALS (Milestone 26)                */}
      {/* ============================================================== */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h2 className="text-base font-bold text-[#111111] flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                  <span>Pending Professional Compliance Reviews</span>
                </h2>
                <p className="text-xs text-[#6E6E73] mt-0.5">
                  Review submitted skills, trade licenses, and identity verification before unlocking customer discovery.
                </p>
              </div>
              <Badge variant="warning" size="sm">
                {pendingApprovalsList.length} Pending Actions
              </Badge>
            </div>

            {pendingApprovalsList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#86868B] space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#34C759] mx-auto opacity-75" />
                <p className="font-semibold text-sm text-[#111111]">All Worker Registrations Reviewed</p>
                <p>No professionals currently awaiting compliance approval.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5 text-xs">
                {pendingApprovalsList.map((w) => (
                  <div
                    key={w.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-1 ring-black/10 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-[#111111]">{w.name}</span>
                          <Badge variant="default" size="sm">
                            {w.trade}
                          </Badge>
                          <span className="text-[11px] font-mono text-[#86868B]">ID: {w.id}</span>
                        </div>
                        <p className="text-[#6E6E73] text-[11px]">
                          <strong>License / Govt ID:</strong> {w.licenseNumber || 'Under Review'} •{' '}
                          <strong>Experience:</strong> {w.experienceYears} Years •{' '}
                          <strong>Quote:</strong> ₹{w.estimatedQuote} (₹{w.hourlyRate}/h)
                        </p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {w.skills.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-[10px] text-[#111111] font-medium"
                            >
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-[#86868B] block pt-0.5">
                          Submitted: {w.submittedAt ? new Date(w.submittedAt).toLocaleString() : 'Recently'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorkerDetail(w)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Inspect
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRejectingWorker(w)}
                        leftIcon={<UserX className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setApprovingWorker(w)}
                        leftIcon={<Check className="w-3.5 h-3.5" />}
                        className="text-xs bg-[#34C759] text-white hover:bg-[#2EB150]"
                      >
                        Approve Professional
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB: WORKER FLEET & GOVERNANCE TABLE                       */}
      {/* ============================================================== */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          {/* Glass Filter & Action Surface */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-sm glass-specular-edge flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search worker by name, trade, ID, skill, or license..."
                value={workerSearchQuery}
                onChange={(e) => setWorkerSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {/* Trade Filter */}
              <select
                value={workerTradeFilter}
                onChange={(e) => setWorkerTradeFilter(e.target.value)}
                className="p-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#111111]"
              >
                <option value="All">All Trades ({workerList.length})</option>
                {ALL_TRADE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={workerStatusFilter}
                onChange={(e) => setWorkerStatusFilter(e.target.value as any)}
                className="p-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#111111]"
              >
                <option value="All">All Governance Statuses</option>
                <option value="APPROVED">Approved &amp; Active</option>
                <option value="PENDING_APPROVAL">Pending Review</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddWorkerModalOpen(true)}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                + Add Worker
              </Button>
            </div>
          </div>

          {/* Solid Worker Management Table */}
          <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h2 className="text-base font-bold text-[#111111] flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#0071E3]" />
                <span>Worker Fleet &amp; Governance Registry</span>
              </h2>
              <span className="text-xs text-[#86868B]">{filteredWorkers.length} records matching filters</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 text-[#86868B] font-semibold">
                    <th className="py-3 px-3">Professional</th>
                    <th className="py-3 px-3">Trade &amp; Verified Skills</th>
                    <th className="py-3 px-3">Experience &amp; Rating</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">Governance Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredWorkers.map((w) => {
                    const status = w.approvalStatus || (w.isVerified ? 'APPROVED' : 'PENDING_APPROVAL');
                    return (
                      <tr key={w.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                        {/* Profile Column */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={w.avatar}
                              alt={w.name}
                              className="w-9 h-9 rounded-xl object-cover ring-1 ring-black/5"
                            />
                            <div>
                              <span className="font-bold text-[#111111] block">{w.name}</span>
                              <span className="text-[11px] text-[#86868B] font-mono">
                                {w.id} • {w.licenseNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Trade & Verified Skills Column */}
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-[#111111] block">{w.trade}</span>
                          <div className="flex flex-wrap gap-1 max-w-[220px] mt-0.5" title="Verified Skills">
                            {w.skills.slice(0, 2).map((sk) => (
                              <span
                                key={sk}
                                className="px-1.5 py-0.5 rounded-md bg-[#F5F5F7] text-[10px] text-[#111111]"
                              >
                                {sk}
                              </span>
                            ))}
                            {w.skills.length > 2 && (
                              <span className="text-[10px] text-[#86868B]">+{w.skills.length - 2}</span>
                            )}
                          </div>
                        </td>

                        {/* Experience Column */}
                        <td className="py-3.5 px-3">
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#111111] block">{w.experienceYears} Years</span>
                            <span className="text-[#FF9500] font-semibold text-[11px]">
                              ★ {w.rating.toFixed(1)} ({w.reviewCount} reviews)
                            </span>
                          </div>
                        </td>

                        {/* Availability Column */}
                        <td className="py-3.5 px-3">
                          <select
                            value={w.availabilityStatus}
                            onChange={(e) => handleOperatorChangeAvailability(w.id, e.target.value as any)}
                            className="p-1 rounded-lg border border-black/10 text-[11px] font-semibold bg-white"
                          >
                            <option value="immediate">Available Now</option>
                            <option value="today">Slots Today</option>
                            <option value="busy">Off-Duty</option>
                          </select>
                        </td>

                        {/* Governance Status */}
                        <td className="py-3.5 px-3">
                          <Badge
                            variant={
                              status === 'APPROVED'
                                ? 'success'
                                : status === 'PENDING_APPROVAL'
                                ? 'warning'
                                : status === 'SUSPENDED'
                                ? 'danger'
                                : 'default'
                            }
                            size="sm"
                          >
                            {status.replace('_', ' ')}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setSelectedWorkerDetail(w)}
                              className="p-1.5 rounded-lg border border-black/10 hover:bg-[#F5F5F7] text-[#111111] transition-all"
                              title="Inspect Full Profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {status === 'PENDING_APPROVAL' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setApprovingWorker(w)}
                                className="text-xs bg-[#34C759] text-white hover:bg-[#2EB150]"
                              >
                                Approve
                              </Button>
                            )}

                            {status === 'APPROVED' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSuspendingWorker(w)}
                                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                              >
                                Suspend
                              </Button>
                            )}

                            {status === 'SUSPENDED' && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleReactivateWorker(w.id)}
                                className="text-xs"
                              >
                                Reactivate
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. TAB: BOOKING REGISTRY                                       */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-sm glass-specular-edge flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search booking ID, customer, worker, address..."
                value={bookingSearchQuery}
                onChange={(e) => setBookingSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div className="flex items-center space-x-1 p-1 bg-[#F5F5F7] rounded-xl text-xs overflow-x-auto">
              {(
                [
                  { key: 'all', label: 'All' },
                  { key: 'active', label: 'Active' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'cancelled', label: 'Cancelled' },
                  { key: 'issues', label: 'Issues' },
                  { key: 'disputes', label: 'Disputes' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setBookingFilterStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    bookingFilterStatus === tab.key
                      ? 'bg-white text-[#111111] shadow-2xs'
                      : 'text-[#6E6E73] hover:text-[#111111]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h2 className="text-base font-bold text-[#111111] flex items-center space-x-2">
                <FileCheck className="w-5 h-5 text-[#0071E3]" />
                <span>Bookings &amp; Service Execution Registry</span>
              </h2>
              <span className="text-xs text-[#86868B]">{filteredBookings.length} records found</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 text-[#86868B] font-semibold">
                    <th className="py-3 px-3">Booking ID</th>
                    <th className="py-3 px-3">Service &amp; Customer</th>
                    <th className="py-3 px-3">Assigned Worker</th>
                    <th className="py-3 px-3">Distance / Zone</th>
                    <th className="py-3 px-3">Schedule</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Exceptions / Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F5F5F7]/60 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-[#0071E3]">{b.id}</td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-[#111111] block">{b.service}</span>
                        <span className="text-[11px] text-[#6E6E73]">
                          {b.customer} • {b.address}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#111111]">
                        {b.worker} ({b.workerId})
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[#111111] font-bold">{b.distanceKm.toFixed(1)} km</span>
                        <span className="text-[11px] text-[#34C759] block">10 km Valid</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[#111111]">{b.date}</span>
                        <span className="text-[11px] text-[#6E6E73] block">{b.slot}</span>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-[#111111]">₹{b.amount}</td>
                      <td className="py-3.5 px-3">
                        <Badge
                          variant={
                            b.status === 'in_progress'
                              ? 'success'
                              : b.status === 'completed'
                              ? 'default'
                              : b.status === 'cancelled'
                              ? 'danger'
                              : 'accent'
                          }
                          size="sm"
                        >
                          {b.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {b.issue ? (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-[10px] font-bold">
                            {b.issue}
                          </span>
                        ) : (
                          <span className="text-[#34C759] text-[11px]">Normal</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Disputes & Escrow Adjustments */}
          <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#FF3B30]" />
                <span>Disputes &amp; Active Escalations</span>
              </h3>
              <Badge variant="danger" size="sm">
                {disputes.filter((d) => d.status === 'pending').length} Pending Resolution
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {disputes.map((disp) => (
                <div
                  key={disp.id}
                  className="p-3.5 rounded-2xl bg-[#F5F5F7] border border-black/5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-[#111111]">{disp.id}</span>
                      <span className="text-[#86868B]">({disp.bookingId})</span>
                      <Badge variant="warning" size="sm">
                        ₹{disp.amount} {disp.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-[#6E6E73]">{disp.description}</p>
                    <p className="text-[11px] text-[#86868B]">
                      Customer: <strong>{disp.customerName}</strong> • Pro: <strong>{disp.workerName}</strong> • {disp.createdAt}
                    </p>
                  </div>

                  {disp.status === 'pending' ? (
                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolveDispute(disp.id, 'approved')}
                        className="text-xs"
                      >
                        Approve Adjustment
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveDispute(disp.id, 'credited')}
                        className="text-xs"
                      >
                        Credit Escrow
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="success" size="sm">
                      RESOLVED
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: ADD PROFESSIONAL                                    */}
      {/* ============================================================== */}
      {isAddWorkerModalOpen && (
        <Modal
          isOpen={isAddWorkerModalOpen}
          onClose={() => setIsAddWorkerModalOpen(false)}
          title="Add New Professional to WorkLink"
          subtitle="Onboard a verified trade craftsman with verified skills & credentials"
          maxWidth="md"
        >
          <form onSubmit={handleAddWorkerSubmit} className="space-y-4 py-2 text-xs">
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Professional Name"
                placeholder="e.g. Ramesh Kumar"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                required
              />
              <Input
                label="Phone Number (SMS / Calls)"
                placeholder="+91 98110 12345"
                value={newWorkerPhone}
                onChange={(e) => setNewWorkerPhone(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#111111] mb-1">
                  Primary Trade Category
                </label>
                <select
                  value={newWorkerTrade}
                  onChange={(e) => {
                    const trade = e.target.value as TradeCategory;
                    setNewWorkerTrade(trade);
                    setNewWorkerSkills(SKILL_SUGGESTIONS[trade]?.slice(0, 3) || []);
                  }}
                  className="w-full p-2.5 rounded-xl border border-black/10 bg-white text-xs font-semibold"
                >
                  {ALL_TRADE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Years of Field Experience"
                type="number"
                min={1}
                max={40}
                value={newWorkerExp}
                onChange={(e) => setNewWorkerExp(Number(e.target.value))}
                required
              />
            </div>

            {/* Skills selection */}
            <div>
              <label className="block text-xs font-semibold text-[#111111] mb-1.5">
                Verified Capabilities &amp; Skills ({newWorkerTrade})
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(SKILL_SUGGESTIONS[newWorkerTrade] || []).map((sk) => {
                  const isSelected = newWorkerSkills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleToggleAddSkill(sk)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-[#F5F5F7] text-[#6E6E73] hover:text-[#111111]'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sk}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  className="flex-1 p-2 rounded-xl border border-black/10 text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomSkill}>
                  Add
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Hourly Base Rate (₹/h)"
                type="number"
                min={150}
                max={3000}
                value={newWorkerHourly}
                onChange={(e) => setNewWorkerHourly(Number(e.target.value))}
                required
              />
              <Input
                label="Standard Diagnostic Quote (₹)"
                type="number"
                min={200}
                max={4000}
                value={newWorkerQuote}
                onChange={(e) => setNewWorkerQuote(Number(e.target.value))}
                required
              />
            </div>

            <Input
              label="Operating Base Address (South Delhi 10 km Zone)"
              placeholder="e.g. Hauz Khas / Green Park"
              value={newWorkerAddress}
              onChange={(e) => setNewWorkerAddress(e.target.value)}
              required
            />

            <Input
              label="Trade License / Govt ID Number"
              placeholder="e.g. DL-AC-2026-991"
              value={newWorkerLicense}
              onChange={(e) => setNewWorkerLicense(e.target.value)}
              required
            />

            {/* Auto-Approve Checkbox */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newWorkerAutoApprove}
                  onChange={(e) => setNewWorkerAutoApprove(e.target.checked)}
                  className="rounded text-[#34C759] focus:ring-[#34C759]"
                />
                <div>
                  <span className="font-bold text-emerald-950 block">
                    Approve immediately as platform operator
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Sets status to APPROVED so worker is instantly active in customer discovery pool.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddWorkerModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create Worker Record
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 9. MODAL: APPROVE CONFIRMATION                                 */}
      {/* ============================================================== */}
      {approvingWorker && (
        <Modal
          isOpen={Boolean(approvingWorker)}
          onClose={() => setApprovingWorker(null)}
          title="Approve this professional?"
          subtitle="Once approved, this worker can become eligible for customer bookings."
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setApprovingWorker(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmApproval}
                className="bg-[#34C759] text-white hover:bg-[#2EB150]"
              >
                Confirm Approval
              </Button>
            </div>
          }
        >
          <div className="py-2 text-xs space-y-3">
            <div className="p-3 rounded-2xl bg-[#F5F5F7] flex items-center space-x-3">
              <img
                src={approvingWorker.avatar}
                alt={approvingWorker.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-[#111111]">{approvingWorker.name}</h4>
                <p className="text-[#6E6E73]">{approvingWorker.trade}</p>
                <span className="font-mono text-[11px] text-[#0071E3]">
                  License: {approvingWorker.licenseNumber}
                </span>
              </div>
            </div>
            <p className="text-[#6E6E73]">
              By confirming approval, you verify that this worker has satisfied background checks and trade
              credential criteria.
            </p>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 10. MODAL: REJECT CONFIRMATION WITH REASON                     */}
      {/* ============================================================== */}
      {rejectingWorker && (
        <Modal
          isOpen={Boolean(rejectingWorker)}
          onClose={() => setRejectingWorker(null)}
          title={`Reject Registration: ${rejectingWorker.name}`}
          subtitle="Specify optional governance reason for worker record"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setRejectingWorker(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmRejection}>
                Confirm Rejection
              </Button>
            </div>
          }
        >
          <div className="py-2 space-y-3 text-xs">
            <p className="text-[#6E6E73]">
              Rejected workers will not appear in customer search or recommendation pools.
            </p>
            <div>
              <label className="block font-semibold text-[#111111] mb-1">Rejection Reason (Optional)</label>
              <textarea
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                placeholder="e.g. Incomplete government certification or invalid operating territory..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-black/10 text-xs focus:ring-2 focus:ring-[#FF3B30] outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 11. MODAL: SUSPEND WORKER                                      */}
      {/* ============================================================== */}
      {suspendingWorker && (
        <Modal
          isOpen={Boolean(suspendingWorker)}
          onClose={() => setSuspendingWorker(null)}
          title={`Suspend Account: ${suspendingWorker.name}`}
          subtitle="Immediately remove worker from customer discovery and dispatch"
          maxWidth="sm"
          footer={
            <div className="flex items-center justify-end space-x-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setSuspendingWorker(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmSuspension}>
                Confirm Suspension
              </Button>
            </div>
          }
        >
          <div className="py-2 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#111111] mb-1">Suspension Reason</label>
              <textarea
                value={suspensionReasonText}
                onChange={(e) => setSuspensionReasonText(e.target.value)}
                placeholder="e.g. High cancellation rate or response time compliance hold..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-black/10 text-xs focus:ring-2 focus:ring-[#FF3B30] outline-none"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================== */}
      {/* 12. MODAL: WORKER INSPECTION & AUDIT TRAIL                     */}
      {/* ============================================================== */}
      {selectedWorkerDetail && (
        <Modal
          isOpen={Boolean(selectedWorkerDetail)}
          onClose={() => setSelectedWorkerDetail(null)}
          title={`Worker Inspection: ${selectedWorkerDetail.name}`}
          subtitle={`ID: ${selectedWorkerDetail.id} • Trade: ${selectedWorkerDetail.trade}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Badge
                variant={
                  selectedWorkerDetail.approvalStatus === 'APPROVED' ||
                  (!selectedWorkerDetail.approvalStatus && selectedWorkerDetail.isVerified)
                    ? 'success'
                    : selectedWorkerDetail.approvalStatus === 'SUSPENDED'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
              >
                {selectedWorkerDetail.approvalStatus ||
                  (selectedWorkerDetail.isVerified ? 'APPROVED' : 'PENDING_APPROVAL')}
              </Badge>
              <Button variant="primary" size="sm" onClick={() => setSelectedWorkerDetail(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="flex items-center space-x-3 p-3 bg-[#F5F5F7] rounded-2xl">
              <img
                src={selectedWorkerDetail.avatar}
                alt={selectedWorkerDetail.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-sm text-[#111111]">{selectedWorkerDetail.name}</h4>
                <p className="text-[#6E6E73]">
                  {selectedWorkerDetail.trade} • {selectedWorkerDetail.phone}
                </p>
                <p className="font-mono text-[11px] text-[#0071E3]">
                  License: {selectedWorkerDetail.licenseNumber}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-black/8">
                <span className="text-[#86868B] block mb-0.5">Performance &amp; Rating</span>
                <span className="font-bold text-[#111111] block">
                  {selectedWorkerDetail.experienceYears} Years • ★ {selectedWorkerDetail.rating}
                </span>
                <span className="text-[11px] text-[#6E6E73] block">
                  {selectedWorkerDetail.completedJobs} completed jobs ({selectedWorkerDetail.reviewCount} reviews)
                </span>
                <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">
                  completionRate: 98.4% on-time dispatch
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-black/8">
                <span className="text-[#86868B] block mb-0.5">Pricing &amp; Tariff</span>
                <span className="font-bold text-[#111111] block">
                  ₹{selectedWorkerDetail.hourlyRate}/h Base Rate
                </span>
                <span className="text-[11px] text-[#34C759]">
                  Standard Quote: ₹{selectedWorkerDetail.estimatedQuote}
                </span>
              </div>
            </div>

            {/* Audit governance trail */}
            <div className="p-3 rounded-xl bg-[#F5F5F7] space-y-1">
              <span className="font-bold text-[#111111] block">Governance &amp; Audit Trail:</span>
              <p className="text-[#6E6E73]">
                <strong>Submitted At:</strong>{' '}
                {selectedWorkerDetail.submittedAt
                  ? new Date(selectedWorkerDetail.submittedAt).toLocaleString()
                  : 'Pre-seeded Benchmark'}
              </p>
              {selectedWorkerDetail.approvedBy && (
                <p className="text-[#34C759]">
                  <strong>Approved By:</strong> {selectedWorkerDetail.approvedBy} (
                  {selectedWorkerDetail.approvedAt ? new Date(selectedWorkerDetail.approvedAt).toLocaleDateString() : ''})
                </p>
              )}
              {selectedWorkerDetail.rejectedBy && (
                <p className="text-red-600">
                  <strong>Rejected By:</strong> {selectedWorkerDetail.rejectedBy} •{' '}
                  {selectedWorkerDetail.rejectionReason}
                </p>
              )}
              {selectedWorkerDetail.suspendedBy && (
                <p className="text-red-600">
                  <strong>Suspended By:</strong> {selectedWorkerDetail.suspendedBy} •{' '}
                  {selectedWorkerDetail.rejectionReason}
                </p>
              )}
            </div>

            <div>
              <span className="font-semibold text-[#111111] block mb-1">Equipped Toolsets:</span>
              <div className="flex flex-wrap gap-1">
                {(selectedWorkerDetail.toolsEquipped || []).map((tool) => (
                  <span key={tool} className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-[11px]">
                    ✓ {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
