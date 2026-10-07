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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Worker, MatchingWeights } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

interface OperatorConsoleProps {
  workers: Worker[];
  onOpenWeightsModal: () => void;
  onNavigateToIntelligence: () => void;
  onNavigateToRadar: () => void;
  currentWeights: MatchingWeights;
}

export const OperatorConsole: React.FC<OperatorConsoleProps> = ({
  workers,
  onOpenWeightsModal,
  onNavigateToIntelligence,
  onNavigateToRadar,
  currentWeights,
}) => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [workerList, setWorkerList] = useState<Worker[]>(workers);
  const [filterQuery, setFilterQuery] = useState('');

  const handleToggleVerification = (id: string) => {
    setWorkerList((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextState = !w.isVerified;
          showToast({
            type: nextState ? 'success' : 'warning',
            title: nextState ? 'Worker Approved' : 'Verification Revoked',
            message: `${w.name} (${w.id}) verification status toggled to ${nextState ? 'VERIFIED' : 'PENDING'}.`,
          });
          return { ...w, isVerified: nextState };
        }
        return w;
      })
    );
  };

  const filteredWorkers = workerList.filter(
    (w) =>
      w.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.trade.toLowerCase().includes(filterQuery.toLowerCase()) ||
      w.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Console Header */}
      <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-[#AF52DE]/10 text-[#AF52DE] flex items-center justify-center font-bold">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-[#111111]">
                Operator Control Console
              </h1>
              <Badge variant="accent" size="sm">
                Full Admin
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] mt-1">
              Logged in as {currentUser?.name || 'Anita Roy'} • Marketplace Integrity &amp; Safety
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenWeightsModal}
            leftIcon={<Sliders className="w-3.5 h-3.5 text-[#0071E3]" />}
          >
            Algorithm Weights
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToIntelligence}
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-[#FF9500]" />}
          >
            Workforce Intelligence
          </Button>
        </div>
      </div>

      {/* Operator Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Total Registered Workers</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111111]">{workerList.length}</span>
            <span className="text-xs text-[#34C759] font-medium">100% in 10 km zones</span>
          </div>
          <span className="text-[11px] text-[#6E6E73] mt-1 block">Bengaluru Core Hub</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Verified Credential Rate</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#34C759]">
              {Math.round(
                (workerList.filter((w) => w.isVerified).length / workerList.length) * 100
              )}
              %
            </span>
          </div>
          <span className="text-[11px] text-[#6E6E73] mt-1 block">Govt ID &amp; Trade check</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Strict Hard Filter Violations</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-[#111111]">0</span>
            <span className="text-xs text-[#34C759] font-medium">Clean</span>
          </div>
          <span className="text-[11px] text-[#6E6E73] mt-1 block">No &gt;10km leakages</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-xs">
          <span className="text-xs text-[#86868B] block mb-1">Active Weight Preset</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-[#0071E3] truncate">
              {currentWeights.name}
            </span>
          </div>
          <span className="text-[11px] text-[#86868B] mt-1 block truncate">
            Skill {Math.round(currentWeights.w_skill * 100)}% • Exp {Math.round(currentWeights.w_experience * 100)}%
          </span>
        </div>
      </div>

      {/* Worker Verification & Governance Table */}
      <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div>
            <h2 className="text-base font-bold text-[#111111] flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-[#0071E3]" />
              <span>Worker Verification &amp; Credential Governance</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Review government IDs, background checks, and active eligibility status.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#86868B]" />
            <input
              type="text"
              placeholder="Search worker by name/trade..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-black/5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/5 text-[#86868B] font-semibold">
                <th className="py-2.5 px-3">Worker</th>
                <th className="py-2.5 px-3">Trade</th>
                <th className="py-2.5 px-3">License / ID</th>
                <th className="py-2.5 px-3">Exp / Rating</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={w.avatar}
                        alt={w.name}
                        className="w-8 h-8 rounded-xl object-cover"
                      />
                      <div>
                        <span className="font-bold text-[#111111] block">{w.name}</span>
                        <span className="text-[11px] text-[#86868B]">{w.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-[#111111]">{w.trade}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-md border border-black/5">
                      {w.licenseNumber}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#111111]">
                    <span>{w.experienceYears} yrs</span> •{' '}
                    <span className="text-[#FF9500] font-semibold">★ {w.rating}</span>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={w.isVerified ? 'success' : 'warning'} size="sm">
                      {w.isVerified ? 'Verified' : 'Pending Review'}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant={w.isVerified ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleVerification(w.id)}
                    >
                      {w.isVerified ? 'Revoke Status' : 'Approve & Verify'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
