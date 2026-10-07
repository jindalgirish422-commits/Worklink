import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';
import { Badge } from './ui/Badge';

interface HardFilterAuditProps {
  allRanked: RankedWorker[];
  activeJob: JobRequest;
}

export const HardFilterAudit: React.FC<HardFilterAuditProps> = ({
  allRanked,
  activeJob,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const eligibleCount = allRanked.filter((w) => w.eligibility.isEligible).length;
  const excludedCount = allRanked.filter((w) => !w.eligibility.isEligible).length;

  return (
    <div className="card-premium p-5 sm:p-6 bg-[#FFFFFF] mb-8 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3.5">
          <span className="p-2 rounded-xl bg-[#F0F0F2] text-[#111111]">
            <Filter className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-bold text-[#111111] tracking-tight">
                Step 1: Hard Eligibility Filter Audit
              </h3>
              <Badge variant="success" size="sm">
                {eligibleCount} Passed
              </Badge>
              <Badge variant="danger" size="sm">
                {excludedCount} Excluded
              </Badge>
            </div>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              5 non-negotiable checks (Verification, Required Skills, Slot Availability, 10 km Zone, Experience Tier) enforced before ranking.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-full hover:bg-black/5 text-[#86868B] transition-all"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-black/5 animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/5 text-[#86868B] font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Worker</th>
                  <th className="py-2.5 px-3">1. Verified ID</th>
                  <th className="py-2.5 px-3">2. Skills Match</th>
                  <th className="py-2.5 px-3">3. Slot Fit</th>
                  <th className="py-2.5 px-3">4. &le; 10 km Zone</th>
                  <th className="py-2.5 px-3">5. Experience</th>
                  <th className="py-2.5 px-3">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {allRanked.map((item) => {
                  const w = item.worker;
                  const e = item.eligibility;
                  const checks = e.checks;

                  return (
                    <tr
                      key={w.id}
                      className={e.isEligible ? 'hover:bg-[#F5F5F7]/80' : 'bg-[rgba(255,59,48,0.02)] hover:bg-[rgba(255,59,48,0.04)]'}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#111111]">{w.id}: {w.name}</div>
                        <div className="text-[11px] text-[#6E6E73]">{w.trade} ({w.distanceKm}km)</div>
                      </td>

                      {/* Rule 1 */}
                      <td className="py-3 px-3">
                        {checks[0].passed ? (
                          <span className="flex items-center text-[#1B8738] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-[#34C759]" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-[#D70015] font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-[#FF3B30]" /> Unverified
                          </span>
                        )}
                      </td>

                      {/* Rule 2 */}
                      <td className="py-3 px-3">
                        {checks[1].passed ? (
                          <span className="flex items-center text-[#1B8738] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-[#34C759]" />
                            {w.skills.length} skills
                          </span>
                        ) : (
                          <span className="flex items-center text-[#D70015] font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-[#FF3B30]" />
                            Missing Core Skill
                          </span>
                        )}
                      </td>

                      {/* Rule 3 */}
                      <td className="py-3 px-3">
                        {checks[2].passed ? (
                          <span className="flex items-center text-[#1B8738] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-[#34C759]" /> Available
                          </span>
                        ) : (
                          <span className="flex items-center text-[#D70015] font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-[#FF3B30]" />
                            {w.availabilityStatus === 'tomorrow' ? 'Booked Today' : 'Busy'}
                          </span>
                        )}
                      </td>

                      {/* Rule 4 */}
                      <td className="py-3 px-3">
                        {checks[3].passed ? (
                          <span className="flex items-center text-[#1B8738] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-[#34C759]" /> {w.distanceKm} km
                          </span>
                        ) : (
                          <span className="flex items-center text-[#D70015] font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-[#FF3B30]" /> {w.distanceKm} km (&gt;10km)
                          </span>
                        )}
                      </td>

                      {/* Rule 5 */}
                      <td className="py-3 px-3">
                        {checks[4].passed ? (
                          <span className="flex items-center text-[#1B8738] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0 text-[#34C759]" /> {w.experienceYears}y exp
                          </span>
                        ) : (
                          <span className="flex items-center text-[#D70015] font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0 text-[#FF3B30]" /> {w.experienceYears}y &lt; {activeJob.requiredExperienceYears}y
                          </span>
                        )}
                      </td>

                      {/* Final Decision */}
                      <td className="py-3 px-3">
                        {e.isEligible ? (
                          <Badge variant="success" size="sm">
                            Eligible &amp; Ranked
                          </Badge>
                        ) : (
                          <Badge variant="danger" size="sm" title={e.failedRule}>
                            Excluded: {e.failedRule}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
