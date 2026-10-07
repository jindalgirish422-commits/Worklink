import React, { useState } from 'react';
import {
  FlaskConical,
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_WORKERS } from '../data/mockWorkers';

export const ScenarioSimulator: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<'worklink' | 'nearest' | 'rating' | 'skills'>('worklink');

  const benchmarkWorkers = INITIAL_WORKERS.filter((w) => w.isBenchmarkWorker);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                <FlaskConical className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Appendix G: Prototype Scenario Validation Simulator
              </h2>
              <span className="badge-subtle bg-purple-50 text-purple-800 border border-purple-200 font-semibold text-[11px]">
                Validation Benchmark
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              Reproduces the exact research scenario from the Round 2 Report (RQ6, H5). Demonstrates structurally why single-factor shortcuts fail and why WorkLink's multi-factor matching finds the most suitable available worker.
            </p>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-xs text-purple-900 font-medium">
            <strong>Scenario Spec:</strong> Emergency AC Breakdown • 3+ yrs exp • Budget ₹800 • Immediate • 3 Core Skills
          </div>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
          <button
            onClick={() => setActiveStrategy('worklink')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStrategy === 'worklink'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>WorkLink Multi-Factor</span>
              {activeStrategy === 'worklink' && <Sparkles className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'worklink' ? 'text-slate-300' : 'text-slate-500'}`}>
              Selects W3 (dominates pool; trade-off vs W5 explained)
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('nearest')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStrategy === 'nearest'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Nearest Worker</span>
              <span className="text-rose-400 text-[10px]">Naive</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'nearest' ? 'text-slate-300' : 'text-slate-500'}`}>
              Picks W1 (1.2 km) &rarr; FAILS: lacks core skill &amp; exp!
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('rating')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStrategy === 'rating'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Highest-Rated Worker</span>
              <span className="text-rose-400 text-[10px]">Naive</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'rating' ? 'text-slate-300' : 'text-slate-500'}`}>
              Picks W2 (4.9★) &rarr; FAILS: unavailable until tomorrow!
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('skills')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStrategy === 'skills'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-semibold'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Skill-Match Only</span>
              <span className="text-amber-400 text-[10px]">Ties</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'skills' ? 'text-slate-300' : 'text-slate-500'}`}>
              Four-way tie (W2, W3, W4, W5) &rarr; FAILS: cannot discriminate!
            </p>
          </button>
        </div>

        {/* Selected Strategy Behaviour Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          {activeStrategy === 'worklink' && (
            <div className="text-slate-800">
              <strong className="text-blue-600 block text-sm mb-1">WorkLink Multi-Factor Recommendation Outcome:</strong>
              Hard constraints instantly eliminate <strong>W1</strong> (lacks gas leak skill &amp; only 1y exp), <strong>W2</strong> (booked until tomorrow), and <strong>W6</strong> (11.4 km &gt; 10 km service zone).
              Among remaining eligible candidates, <strong>W3</strong> dominates <strong>W4</strong> across rating, distance, and quote. <strong>W3 vs W5</strong> is a genuine trade-off that calibrated weights resolve: W3 ranks #1 (3.2 km, free travel, 4.8★) over W5 (9.1 km, slab travel fee).
            </div>
          )}

          {activeStrategy === 'nearest' && (
            <div className="text-rose-900">
              <strong className="text-rose-600 block text-sm mb-1">Single-Factor Failure Mode: Nearest Worker</strong>
              The customer is routed to <strong>W1 (1.2 km)</strong> solely because of map proximity. However, W1 only possesses 2 of 3 required diagnostic skills and has only 1 year of experience. The customer suffers an unresolved AC breakdown.
            </div>
          )}

          {activeStrategy === 'rating' && (
            <div className="text-rose-900">
              <strong className="text-rose-600 block text-sm mb-1">Single-Factor Failure Mode: Highest Rated</strong>
              The customer is routed to <strong>W2 (4.9★ rating)</strong>. However, W2 is booked until tomorrow morning. In an emergency AC breakdown during summer, a 24-hour wait is unusable.
            </div>
          )}

          {activeStrategy === 'skills' && (
            <div className="text-amber-900">
              <strong className="text-amber-600 block text-sm mb-1">Single-Factor Failure Mode: Skill-Match Only</strong>
              W2, W3, W4, and W5 all hold 3 / 3 skills. A keyword/skill-only match results in an unranked 4-way tie, leaving the user with the guesswork of calling multiple workers.
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Workers Table (Table 29 & Table 30 from Report) */}
      <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Synthetic Worker Benchmark Pool (Table 29 &amp; Table 30 from Hackathon Report)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">ID &amp; Name</th>
                <th className="py-2.5 px-3">Distance</th>
                <th className="py-2.5 px-3">Rating</th>
                <th className="py-2.5 px-3">Skills</th>
                <th className="py-2.5 px-3">Experience</th>
                <th className="py-2.5 px-3">Availability</th>
                <th className="py-2.5 px-3">Quote</th>
                <th className="py-2.5 px-3">WorkLink Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {benchmarkWorkers.map((w) => {
                let isPicked = false;
                let outcomeLabel = '';
                let outcomeBadgeClass = '';

                if (w.id === 'W1') {
                  isPicked = activeStrategy === 'nearest';
                  outcomeLabel = 'Excluded: Lacks skill & Exp < 3y';
                  outcomeBadgeClass = 'bg-rose-100 text-rose-800';
                } else if (w.id === 'W2') {
                  isPicked = activeStrategy === 'rating';
                  outcomeLabel = 'Excluded: Booked Tomorrow';
                  outcomeBadgeClass = 'bg-rose-100 text-rose-800';
                } else if (w.id === 'W3') {
                  isPicked = activeStrategy === 'worklink';
                  outcomeLabel = '#1 Recommended (Dominates W4)';
                  outcomeBadgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
                } else if (w.id === 'W4') {
                  outcomeLabel = 'Eligible (Dominated by W3)';
                  outcomeBadgeClass = 'bg-slate-100 text-slate-700';
                } else if (w.id === 'W5') {
                  outcomeLabel = 'Eligible (Trade-off: farther 9.1km)';
                  outcomeBadgeClass = 'bg-blue-100 text-blue-800';
                } else if (w.id === 'W6') {
                  outcomeLabel = 'Excluded: 11.4km > 10km Zone';
                  outcomeBadgeClass = 'bg-rose-100 text-rose-800';
                }

                return (
                  <tr
                    key={w.id}
                    className={`transition-colors ${
                      isPicked
                        ? 'bg-blue-50/80 font-bold text-slate-900'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-bold">{w.id}: {w.name}</span>
                      {isPicked && (
                        <span className="ml-2 badge-subtle bg-slate-900 text-white text-[10px]">
                          Selected by {activeStrategy.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">{w.distanceKm} km</td>
                    <td className="py-3 px-3">★ {w.rating.toFixed(1)}</td>
                    <td className="py-3 px-3">{w.skills.length} / 3</td>
                    <td className="py-3 px-3">{w.experienceYears} yrs</td>
                    <td className="py-3 px-3 capitalize">{w.availabilityStatus}</td>
                    <td className="py-3 px-3">₹{w.estimatedQuote}</td>
                    <td className="py-3 px-3">
                      <span className={`badge-subtle text-[10px] ${outcomeBadgeClass}`}>
                        {outcomeLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
