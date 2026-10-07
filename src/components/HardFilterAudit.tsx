import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import { RankedWorker, JobRequest } from '../types';

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
    <div className="apple-card p-5 md:p-6 bg-white border border-black/[0.06] shadow-sm mb-8 transition-all">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
            <Filter className="w-5 h-5 text-slate-700" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Step 1: Hard Eligibility Filter Audit
              </h3>
              <span className="badge-subtle bg-emerald-50 text-emerald-700 font-semibold text-[11px] border border-emerald-100">
                {eligibleCount} Passed
              </span>
              <span className="badge-subtle bg-rose-50 text-rose-700 font-semibold text-[11px] border border-rose-100">
                {excludedCount} Excluded
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              5 non-negotiable checks (Verification, Required Skills, Slot Availability, 10 km Boundary, Mandatory Experience) applied before ranking.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-all"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Worker</th>
                  <th className="py-2.5 px-3">1. Verified ID</th>
                  <th className="py-2.5 px-3">2. Skills Match</th>
                  <th className="py-2.5 px-3">3. Slot Fit</th>
                  <th className="py-2.5 px-3">4. &le; 10 km Zone</th>
                  <th className="py-2.5 px-3">5. Experience</th>
                  <th className="py-2.5 px-3">Final Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allRanked.map((item) => {
                  const w = item.worker;
                  const e = item.eligibility;
                  const checks = e.checks;

                  return (
                    <tr
                      key={w.id}
                      className={e.isEligible ? 'hover:bg-slate-50/80' : 'bg-rose-50/20 hover:bg-rose-50/40'}
                    >
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{w.id}: {w.name}</div>
                        <div className="text-[11px] text-slate-500">{w.trade} ({w.distanceKm}km)</div>
                      </td>

                      {/* Rule 1 */}
                      <td className="py-3 px-3">
                        {checks[0].passed ? (
                          <span className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> Unverified
                          </span>
                        )}
                      </td>

                      {/* Rule 2 */}
                      <td className="py-3 px-3">
                        {checks[1].passed ? (
                          <span className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                            {w.skills.length} skills
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            Missing Core Skill
                          </span>
                        )}
                      </td>

                      {/* Rule 3 */}
                      <td className="py-3 px-3">
                        {checks[2].passed ? (
                          <span className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" /> Available
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" />
                            {w.availabilityStatus === 'tomorrow' ? 'Booked Today' : 'Busy'}
                          </span>
                        )}
                      </td>

                      {/* Rule 4 */}
                      <td className="py-3 px-3">
                        {checks[3].passed ? (
                          <span className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" /> {w.distanceKm} km
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> {w.distanceKm} km (&gt;10km)
                          </span>
                        )}
                      </td>

                      {/* Rule 5 */}
                      <td className="py-3 px-3">
                        {checks[4].passed ? (
                          <span className="flex items-center text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 shrink-0" /> {w.experienceYears}y exp
                          </span>
                        ) : (
                          <span className="flex items-center text-rose-600 font-semibold">
                            <XCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> {w.experienceYears}y &lt; {activeJob.requiredExperienceYears}y
                          </span>
                        )}
                      </td>

                      {/* Outcome */}
                      <td className="py-3 px-3">
                        {e.isEligible ? (
                          <span className="badge-subtle bg-emerald-100 text-emerald-800 font-bold">
                            Eligible &amp; Ranked
                          </span>
                        ) : (
                          <span className="badge-subtle bg-rose-100 text-rose-800 font-bold" title={e.failedRule}>
                            Excluded: {e.failedRule}
                          </span>
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
