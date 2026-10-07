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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Worker, MatchingWeights, Booking, AvailabilityStatus } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

export interface OperatorConsoleProps {
  workers: Worker[];
  onOpenWeightsModal: () => void;
  onNavigateToIntelligence: () => void;
  onNavigateToRadar: () => void;
  currentWeights: MatchingWeights;
  activeBooking?: Booking | null;
  recentBookings?: Booking[];
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

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  workers,
  onOpenWeightsModal,
  onNavigateToIntelligence,
  onNavigateToRadar,
  currentWeights,
  activeBooking,
  recentBookings = [],
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  // Navigation sub-tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'workers' | 'bookings'>('overview');

  // Worker management state
  const [workerList, setWorkerList] = useState<Worker[]>(workers);
  const [workerSearchQuery, setWorkerSearchQuery] = useState('');
  const [workerTradeFilter, setWorkerTradeFilter] = useState('All');
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<Worker | null>(null);

  // Booking management filter state
  const [bookingFilterStatus, setBookingFilterStatus] = useState<'all' | 'active' | 'completed' | 'cancelled' | 'issues' | 'disputes'>('all');
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

  // Handle worker verification toggle
  const handleToggleVerification = (id: string) => {
    setWorkerList((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextState = !w.isVerified;
          showToast({
            type: nextState ? 'success' : 'warning',
            title: nextState ? 'Worker Approved' : 'Verification Revoked',
            message: `${w.name} (${w.id}) verification status toggled to ${nextState ? 'VERIFIED' : 'PENDING REVIEW'}.`,
          });
          return { ...w, isVerified: nextState };
        }
        return w;
      })
    );
  };

  // Handle worker availability toggle by operator
  const handleOperatorChangeAvailability = (id: string, status: AvailabilityStatus) => {
    setWorkerList((prev) =>
      prev.map((w) => (w.id === id ? { ...w, availabilityStatus: status } : w))
    );
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
  const activeWorkersCount = workerList.filter((w) => w.availabilityStatus !== 'busy').length;
  const verifiedWorkersCount = workerList.filter((w) => w.isVerified).length;
  const pendingVerificationCount = workerList.filter((w) => !w.isVerified).length;
  const activeJobsCount = (activeBooking && ['requested', 'accepted', 'in_progress', 'paused'].includes(activeBooking.status) ? 1 : 0) + 3;
  const completedJobsCount = 184 + recentBookings.filter((b) => b.status === 'completed').length;
  const cancelledJobsCount = 6 + recentBookings.filter((b) => b.status === 'cancelled').length;
  const totalRevenue = 148650 + (activeBooking?.finalTotal || 0);
  const utilizationRate = 82.4;
  const averageRating = (
    workerList.reduce((acc, w) => acc + w.rating, 0) / (workerList.length || 1)
  ).toFixed(2);

  // Filtered workers list
  const filteredWorkers = workerList.filter((w) => {
    const matchesQuery =
      w.name.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.trade.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(workerSearchQuery.toLowerCase()) ||
      w.licenseNumber.toLowerCase().includes(workerSearchQuery.toLowerCase());
    const matchesTrade = workerTradeFilter === 'All' || w.trade === workerTradeFilter;
    return matchesQuery && matchesTrade;
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
      worker: 'Rajesh Kumar',
      workerId: 'W3',
      address: 'Indiranagar 100ft Rd',
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
      worker: 'Manoj Nair',
      workerId: 'W1',
      address: 'Domlur 2nd Stage',
      distanceKm: 4.1,
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
      worker: 'Suresh Patil',
      workerId: 'W5',
      address: 'HAL 2nd Stage',
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
      worker: 'Rajesh Kumar',
      workerId: 'W3',
      address: 'Indiranagar 12th Main',
      distanceKm: 2.1,
      date: 'Yesterday',
      slot: '11:00 - 13:00',
      amount: 750,
      status: 'completed',
      issue: undefined,
    },
    {
      id: 'b-hist-202',
      service: 'Plumber',
      customer: 'Sneha Pillai',
      worker: 'Manoj Nair',
      workerId: 'W1',
      address: 'Koramangala 4th Block',
      distanceKm: 5.6,
      date: 'Yesterday',
      slot: '15:00 - 17:00',
      amount: 640,
      status: 'completed',
      issue: undefined,
    },
    {
      id: 'b-hist-203',
      service: 'Electrician',
      customer: 'Amitabh Sen',
      worker: 'Suresh Patil',
      workerId: 'W5',
      address: 'Old Airport Road',
      distanceKm: 3.9,
      date: '2 days ago',
      slot: '09:00 - 11:00',
      amount: 590,
      status: 'completed',
      issue: undefined,
    },
    {
      id: 'b-hist-301',
      service: 'Carpenter',
      customer: 'Nikhil Rao',
      worker: 'Arun M',
      workerId: 'W4',
      address: 'MG Road Metro',
      distanceKm: 6.8,
      date: '2 days ago',
      slot: '13:00 - 15:00',
      amount: 950,
      status: 'cancelled',
      issue: 'Cancelled by customer: personal reschedule',
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
      {/* 1. OPERATOR HEADER & FLOATING CONTROLS (Glass Surface)         */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Shield className="w-7 h-7 text-[#0071E3]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
                Operator Control Center
              </h1>
              <Badge variant="accent" size="sm" className="bg-purple-100 text-purple-900 border-purple-300">
                Full Admin
              </Badge>
              <Badge variant="success" size="sm">
                10 km Strict Enforcement
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1 flex items-center space-x-2">
              <span>Admin: <strong>{currentUser?.name || 'Anita Roy'}</strong></span>
              <span>•</span>
              <span>Department: Marketplace Integrity &amp; Trust Safety</span>
              <span>•</span>
              <span className="text-[#0071E3] font-semibold">Bengaluru Core Cluster</span>
            </p>
          </div>
        </div>

        {/* Floating Glass Control Surface for Top Actions */}
        <div className="p-1.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-black/8 shadow-sm glass-specular-edge flex items-center space-x-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWeightsModal}
            leftIcon={<Sliders className="w-3.5 h-3.5 text-[#0071E3]" />}
            className="text-xs font-semibold"
          >
            Algorithm Weights
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
            10 km Radar
          </Button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OVERVIEW METRICS STRIP (All 9 Core Operator Metrics)        */}
      {/* Active workers | Verified workers | Pending verification |     */}
      {/* Active jobs | Completed | Cancelled | Revenue | Utilization |  */}
      {/* Average rating                                                 */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {/* Metric 1: Active workers */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Active workers
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">
            {activeWorkersCount}
          </span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">
            Online in 10 km
          </span>
        </div>

        {/* Metric 2: Verified workers */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Verified workers
          </span>
          <span className="text-xl font-extrabold text-[#34C759] block">
            {verifiedWorkersCount}
          </span>
          <span className="text-[10px] text-[#6E6E73] font-medium block mt-0.5">
            Govt ID &amp; License
          </span>
        </div>

        {/* Metric 3: Pending verification */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Pending verification
          </span>
          <span className="text-xl font-extrabold text-amber-600 block">
            {pendingVerificationCount}
          </span>
          <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
            Action required
          </span>
        </div>

        {/* Metric 4: Active jobs */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Active jobs
          </span>
          <span className="text-xl font-extrabold text-[#0071E3] block">
            {activeJobsCount}
          </span>
          <span className="text-[10px] text-[#0071E3] font-medium block mt-0.5">
            Live execution
          </span>
        </div>

        {/* Metric 5: Completed */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Completed
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">
            {completedJobsCount}
          </span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">
            97.8% fulfillment
          </span>
        </div>

        {/* Metric 6: Cancelled */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Cancelled
          </span>
          <span className="text-xl font-extrabold text-red-600 block">
            {cancelledJobsCount}
          </span>
          <span className="text-[10px] text-[#86868B] font-medium block mt-0.5">
            3.1% cancel rate
          </span>
        </div>

        {/* Metric 7: Revenue */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Revenue
          </span>
          <span className="text-xl font-extrabold text-[#111111] block">
            ₹{(totalRevenue / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">
            GMV Processed
          </span>
        </div>

        {/* Metric 8: Utilization */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Utilization
          </span>
          <span className="text-xl font-extrabold text-[#5856D6] block">
            {utilizationRate}%
          </span>
          <span className="text-[10px] text-[#6E6E73] font-medium block mt-0.5">
            Dispatch efficiency
          </span>
        </div>

        {/* Metric 9: Average rating */}
        <div className="p-3.5 rounded-2xl bg-white border border-black/8 shadow-xs">
          <span className="text-[10px] font-bold text-[#86868B] uppercase tracking-wider block mb-0.5">
            Average rating
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-extrabold text-[#111111]">{averageRating}</span>
            <span className="text-xs text-[#FF9500] font-bold">★</span>
          </div>
          <span className="text-[10px] text-[#34C759] font-medium block mt-0.5">
            High satisfaction
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. OPERATOR CONSOLE NAVIGATION TABS                            */}
      {/* ============================================================== */}
      <div className="flex items-center space-x-2 border-b border-black/8 pb-2 overflow-x-auto no-scrollbar text-xs">
        {[
          { key: 'overview', label: 'Overview & Marketplace Intelligence' },
          { key: 'marketplace', label: 'Marketplace Deep Dive' },
          { key: 'workers', label: `Worker Management (${workerList.length})` },
          { key: 'bookings', label: `Booking Management (${allBookings.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap min-h-[42px] ${
              activeTab === tab.key
                ? 'bg-[#111111] text-white shadow-xs'
                : 'bg-white text-[#6E6E73] hover:text-[#111111] border border-black/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* 4. TAB: OVERVIEW & MARKETPLACE INTELLIGENCE                    */}
      {/* Demand by service | Demand by location |                       */}
      {/* Average booking distance | Availability |                      */}
      {/* Recommendation performance                                    */}
      {/* ============================================================== */}
      {(activeTab === 'overview' || activeTab === 'marketplace') && (
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
                  { trade: 'AC Technician', share: 42, color: 'bg-[#0071E3]', count: '78 jobs' },
                  { trade: 'Plumber', share: 28, color: 'bg-[#34C759]', count: '52 jobs' },
                  { trade: 'Electrician', share: 18, color: 'bg-[#FF9500]', count: '33 jobs' },
                  { trade: 'Carpenter', share: 8, color: 'bg-[#AF52DE]', count: '15 jobs' },
                  { trade: 'Cleaning & Appliances', share: 4, color: 'bg-[#86868B]', count: '8 jobs' },
                ].map((item) => (
                  <div key={item.trade} className="space-y-1">
                    <div className="flex justify-between font-semibold text-[#111111]">
                      <span>{item.trade}</span>
                      <span className="font-mono text-[#6E6E73]">{item.share}% ({item.count})</span>
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
                <Badge variant="success" size="sm">Strict 10km Radius</Badge>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { hub: 'Indiranagar Core (0–3 km)', share: 38, count: '71 jobs', tag: 'High Density' },
                  { hub: 'Koramangala (3–5 km)', share: 26, count: '48 jobs', tag: 'Fast Response' },
                  { hub: 'HSR Layout (5–8 km)', share: 21, count: '39 jobs', tag: 'Tariff Band' },
                  { hub: 'Whitefield West (8–10 km)', share: 15, count: '28 jobs', tag: 'Max Perimeter' },
                ].map((loc) => (
                  <div key={loc.hub} className="p-2.5 rounded-xl bg-[#F5F5F7] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#111111] block">{loc.hub}</span>
                      <span className="text-[11px] text-[#6E6E73]">{loc.count} • {loc.tag}</span>
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
                <span className="text-xs font-mono font-bold text-[#5856D6]">3.4 km avg</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>0–5 km Free Travel Zone:</span>
                    <span>64% of Dispatches</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Zero travel tariff applied to customer. Mean technician arrival: 24 mins.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>5–10 km Extended Tariff Band:</span>
                    <span>36% of Dispatches</span>
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Panel 4: Availability Status Pool */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#34C759]" />
                  <span>Availability &amp; Fleet State</span>
                </h3>
                <span className="text-xs text-[#6E6E73] font-medium">Real-Time Dispatch</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-2xl font-extrabold text-[#34C759] block">
                    {workerList.filter((w) => w.availabilityStatus === 'immediate').length}
                  </span>
                  <span className="font-bold text-emerald-900 text-xs">Available Now</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">&lt;45m Instant Ping</span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-2xl font-extrabold text-[#0071E3] block">
                    {workerList.filter((w) => w.availabilityStatus === 'today').length}
                  </span>
                  <span className="font-bold text-blue-900 text-xs">Slots Today</span>
                  <span className="text-[10px] text-blue-700 block mt-0.5">Scheduled Windows</span>
                </div>

                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="text-2xl font-extrabold text-[#86868B] block">
                    {workerList.filter((w) => w.availabilityStatus === 'busy').length}
                  </span>
                  <span className="font-bold text-gray-900 text-xs">Off-Duty</span>
                  <span className="text-[10px] text-gray-600 block mt-0.5">Rest / Off-Shift</span>
                </div>
              </div>
            </div>

            {/* Panel 5: Recommendation performance */}
            <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#0071E3]" />
                  <span>Recommendation performance</span>
                </h3>
                <Badge variant="accent" size="sm">Core Matching Engine</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[#86868B] text-[11px] block font-semibold">Primary Match Conversion</span>
                  <span className="text-xl font-extrabold text-[#111111] block mt-0.5">88.5%</span>
                  <span className="text-[10px] text-[#34C759] font-medium">Customer books #1 Pro</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[#86868B] text-[11px] block font-semibold">Mean Recommendation Score</span>
                  <span className="text-xl font-extrabold text-[#0071E3] block mt-0.5">93.2%</span>
                  <span className="text-[10px] text-[#6E6E73] font-medium">Multi-Factor Match</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6E6E73]">
                Zero unverified recommendations surfaced. Hard filters eliminate 100% of out-of-radius workers prior to scoring.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. TAB: WORKER MANAGEMENT                                      */}
      {/* Verification | Profiles | Skills | Performance | Availability  */}
      {/* (Solid readable table; glass reserved for filter surface)      */}
      {/* ============================================================== */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          {/* Glass Filter & Search Surface */}
          <div className="p-4 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-sm glass-specular-edge flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#86868B]" />
              <input
                type="text"
                placeholder="Search worker by name, trade, ID, or license..."
                value={workerSearchQuery}
                onChange={(e) => setWorkerSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={workerTradeFilter}
                onChange={(e) => setWorkerTradeFilter(e.target.value)}
                className="p-2 rounded-xl bg-white border border-black/10 text-xs font-semibold text-[#111111]"
              >
                <option value="All">All Trades</option>
                <option value="AC Technician">AC Technician</option>
                <option value="Plumber">Plumber</option>
                <option value="Electrician">Electrician</option>
                <option value="Carpenter">Carpenter</option>
              </select>

              <span className="text-xs text-[#86868B] font-medium whitespace-nowrap">
                {filteredWorkers.length} Professionals
              </span>
            </div>
          </div>

          {/* Solid Worker Management Table (Pristine readability) */}
          <div className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h2 className="text-base font-bold text-[#111111] flex items-center space-x-2">
                <Users className="w-5 h-5 text-[#0071E3]" />
                <span>Worker Fleet &amp; Governance Table</span>
              </h2>
              <span className="text-xs text-[#86868B]">Click row or action to inspect</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/8 text-[#86868B] font-semibold">
                    <th className="py-3 px-3">Worker / Profile</th>
                    <th className="py-3 px-3">Trade</th>
                    <th className="py-3 px-3">Verified Skills</th>
                    <th className="py-3 px-3">Performance &amp; Rating</th>
                    <th className="py-3 px-3">Availability</th>
                    <th className="py-3 px-3">Verification</th>
                    <th className="py-3 px-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredWorkers.map((w) => (
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
                            <span className="text-[11px] text-[#86868B] font-mono">{w.id} • {w.licenseNumber}</span>
                          </div>
                        </div>
                      </td>

                      {/* Trade Column */}
                      <td className="py-3.5 px-3 font-semibold text-[#111111]">{w.trade}</td>

                      {/* Skills Column */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {w.skills.slice(0, 2).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-lg bg-[#F5F5F7] text-[10px] text-[#111111] font-medium"
                            >
                              {sk}
                            </span>
                          ))}
                          {w.skills.length > 2 && (
                            <span className="text-[10px] text-[#86868B]">+{w.skills.length - 2}</span>
                          )}
                        </div>
                      </td>

                      {/* Performance Column */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5">
                          <span className="text-[#FF9500] font-bold">★ {w.rating.toFixed(1)}</span>
                          <span className="text-[#6E6E73] text-[11px] block">
                            {w.completedJobs} jobs ({Math.round(w.completionRate * 100)}% on-time)
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

                      {/* Verification Status */}
                      <td className="py-3.5 px-3">
                        <Badge variant={w.isVerified ? 'success' : 'warning'} size="sm">
                          {w.isVerified ? 'Verified' : 'Pending Review'}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedWorkerDetail(w)}
                            className="p-1.5 rounded-lg border border-black/10 hover:bg-[#F5F5F7] text-[#111111] transition-all"
                            title="Inspect Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Button
                            variant={w.isVerified ? 'outline' : 'primary'}
                            size="sm"
                            onClick={() => handleToggleVerification(w.id)}
                            className="text-xs"
                          >
                            {w.isVerified ? 'Revoke' : 'Approve'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TAB: BOOKING MANAGEMENT                                     */}
      {/* Active | Completed | Cancelled | Issues | Disputes             */}
      {/* (Solid readable table; glass reserved for filter bar)          */}
      {/* ============================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Glass Filter & Status Bar */}
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

          {/* Disputes Section (when disputes tab active or pending exists) */}
          {(bookingFilterStatus === 'disputes' || bookingFilterStatus === 'all') && disputes.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#111111]">
                    Active Escalations &amp; Escrow Disputes ({disputes.filter((d) => d.status === 'pending').length} Pending)
                  </h3>
                </div>
                <Badge variant="accent" size="sm" className="bg-amber-100 text-amber-900 border-amber-300">
                  Immediate Attention
                </Badge>
              </div>

              <div className="divide-y divide-black/5 text-xs">
                {disputes.map((d) => (
                  <div key={d.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#111111]">{d.customerName}</span>
                        <span className="text-[#86868B]">vs</span>
                        <span className="font-bold text-[#111111]">{d.workerName}</span>
                        <Badge variant="warning" size="sm">{d.type.replace('_', ' ').toUpperCase()}</Badge>
                      </div>
                      <p className="text-[#6E6E73]">{d.description}</p>
                      <span className="text-[11px] font-mono text-[#86868B]">
                        Booking Ref: {d.bookingId} • Amount in Question: ₹{d.amount} • {d.createdAt}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {d.status === 'pending' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveDispute(d.id, 'credited')}
                            className="text-xs"
                          >
                            Refund Escrow
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleResolveDispute(d.id, 'approved')}
                            className="text-xs bg-[#34C759] text-white hover:bg-[#2EB150]"
                          >
                            Approve Worker Addition
                          </Button>
                        </>
                      ) : (
                        <Badge variant="success" size="sm">Resolved by Operator</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solid Booking Management Table */}
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
                        <span className="text-[11px] text-[#6E6E73]">{b.customer} • {b.address}</span>
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
                      <td className="py-3.5 px-3 font-extrabold text-[#111111]">
                        ₹{b.amount}
                      </td>
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
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. WORKER DETAIL INSPECTION MODAL                              */}
      {/* (Modal Glass Backdrop & Solid Card Interior)                   */}
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
              <Badge variant={selectedWorkerDetail.isVerified ? 'success' : 'warning'} size="sm">
                {selectedWorkerDetail.isVerified ? 'Verified Pro' : 'Pending Verification'}
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
                <p className="text-[#6E6E73]">{selectedWorkerDetail.trade} • {selectedWorkerDetail.phone}</p>
                <p className="font-mono text-[11px] text-[#0071E3]">License: {selectedWorkerDetail.licenseNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white border border-black/8">
                <span className="text-[#86868B] block mb-0.5">Experience &amp; Rating</span>
                <span className="font-bold text-[#111111] block">
                  {selectedWorkerDetail.experienceYears} Years • ★ {selectedWorkerDetail.rating}
                </span>
                <span className="text-[11px] text-[#6E6E73]">
                  {selectedWorkerDetail.completedJobs} completed jobs
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-black/8">
                <span className="text-[#86868B] block mb-0.5">Pricing &amp; Tariff</span>
                <span className="font-bold text-[#111111] block">
                  ₹{selectedWorkerDetail.hourlyRate}/h Base Rate
                </span>
                <span className="text-[11px] text-[#34C759]">Standard fair pricing</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-[#111111] block mb-1">Equipped Toolsets:</span>
              <div className="flex flex-wrap gap-1">
                {selectedWorkerDetail.toolsEquipped.map((tool) => (
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
