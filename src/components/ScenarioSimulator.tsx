import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { INITIAL_WORKERS } from '../data/mockWorkers';
import { Badge } from './ui/Badge';

export const ScenarioSimulator: React.FC = () => {
  const [activeStrategy, setActiveStrategy] = useState<'worklink' | 'nearest' | 'rating' | 'skills'>('worklink');

  const benchmarkWorkers = INITIAL_WORKERS.filter((w) => w.isBenchmarkWorker);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="card-premium p-6 md:p-8 bg-[#FFFFFF]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-[rgba(175,82,222,0.08)] text-[#AF52DE]">
                <FlaskConical className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                Appendix G: Prototype Validation Simulator
              </h2>
              <Badge variant="accent" size="sm">
                Scenario Benchmark
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-3xl leading-relaxed">
              Reproduces the exact research scenario from the Round 2 Report (RQ6, H5). Demonstrates structurally why single-factor shortcuts fail and why WorkLink's multi-factor matching finds the most suitable available worker.
            </p>
          </div>

          <div className="p-3.5 bg-[#FBFBFD] rounded-2xl border border-black/5 text-xs text-[#111111] font-medium">
            <strong>Scenario Spec:</strong> Emergency AC Breakdown • 3+ yrs exp • Budget ₹800 • Immediate • 3 Core Skills
          </div>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-6">
          <button
            onClick={() => setActiveStrategy('worklink')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'worklink'
                ? 'bg-[#111111] text-white border-[#111111] shadow-xs font-semibold'
                : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/5 text-[#111111]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>WorkLink Multi-Factor</span>
              {activeStrategy === 'worklink' && <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />}
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'worklink' ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
              Selects W3 (dominates pool; trade-off vs W5 explained)
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('nearest')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'nearest'
                ? 'bg-[#111111] text-white border-[#111111] shadow-xs font-semibold'
                : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/5 text-[#111111]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Nearest Worker</span>
              <span className="text-[#FF3B30] text-[10px]">Naive</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'nearest' ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
              Picks W1 (1.2 km) &rarr; FAILS: lacks core skill &amp; exp!
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('rating')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'rating'
                ? 'bg-[#111111] text-white border-[#111111] shadow-xs font-semibold'
                : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/5 text-[#111111]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Highest-Rated Worker</span>
              <span className="text-[#FF3B30] text-[10px]">Naive</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'rating' ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
              Picks W2 (4.9★) &rarr; FAILS: unavailable until tomorrow!
            </p>
          </button>

          <button
            onClick={() => setActiveStrategy('skills')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              activeStrategy === 'skills'
                ? 'bg-[#111111] text-white border-[#111111] shadow-xs font-semibold'
                : 'bg-[#FBFBFD] hover:bg-[#F5F5F7] border-black/5 text-[#111111]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Skill-Match Only</span>
              <span className="text-[#FF9500] text-[10px]">Ties</span>
            </div>
            <p className={`text-[11px] mt-1 ${activeStrategy === 'skills' ? 'text-[#86868B]' : 'text-[#6E6E73]'}`}>
              Four-way tie (W2, W3, W4, W5) &rarr; FAILS: cannot discriminate!
            </p>
          </button>
        </div>

        {/* Selected Strategy Behaviour Banner */}
        <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/5 text-xs">
          {activeStrategy === 'worklink' && (
            <div className="text-[#111111]">
              <strong className="text-[#0071E3] block text-sm mb-1 font-bold">
                WorkLink Multi-Factor Recommendation Outcome:
              </strong>
              Hard constraints instantly eliminate <strong>W1</strong> (lacks gas leak skill &amp; only 1y exp), <strong>W2</strong> (booked until tomorrow), and <strong>W6</strong> (11.4 km &gt; 10 km service zone).
              Among remaining eligible candidates, <strong>W3</strong> dominates <strong>W4</strong> across rating, distance, and quote. <strong>W3 vs W5</strong> is a genuine trade-off that calibrated weights resolve: W3 ranks #1 (3.2 km, free travel, 4.8★) over W5 (9.1 km, slab travel fee).
            </div>
          )}

          {activeStrategy === 'nearest' && (
            <div className="text-[#111111]">
              <strong className="text-[#FF3B30] block text-sm mb-1 font-bold">
                Single-Factor Failure Mode: Nearest Worker
              </strong>
              The customer is routed to <strong>W1 (1.2 km)</strong> solely because of map proximity. However, W1 only possesses 2 of 3 required diagnostic skills and has only 1 year of experience. The customer suffers an unresolved AC breakdown.
            </div>
          )}

          {activeStrategy === 'rating' && (
            <div className="text-[#111111]">
              <strong className="text-[#FF3B30] block text-sm mb-1 font-bold">
                Single-Factor Failure Mode: Highest Rated
              </strong>
              The customer is routed to <strong>W2 (4.9★ rating)</strong>. However, W2 is booked until tomorrow morning. In an emergency AC breakdown during summer, a 24-hour wait is unusable.
            </div>
          )}

          {activeStrategy === 'skills' && (
            <div className="text-[#111111]">
              <strong className="text-[#FF9500] block text-sm mb-1 font-bold">
                Single-Factor Failure Mode: Skill-Match Only
              </strong>
              W2, W3, W4, and W5 all hold 3 / 3 skills. A keyword/skill-only match results in an unranked 4-way tie, leaving the user with the guesswork of calling multiple workers.
            </div>
          )}
        </div>
      </div>

      {/* Benchmark Workers Table */}
      <div className="card-premium p-6 md:p-8 bg-[#FFFFFF]">
        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider mb-4">
          Synthetic Worker Benchmark Pool (Table 29 &amp; Table 30 from Hackathon Report)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-[#86868B] font-semibold uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-black/5 font-medium">
              {benchmarkWorkers.map((w) => {
                let isPicked = false;
                let outcomeLabel = '';
                let outcomeVariant: 'success' | 'danger' | 'accent' | 'default' = 'default';

                if (w.id === 'W1') {
                  isPicked = activeStrategy === 'nearest';
                  outcomeLabel = 'Excluded: Missing skill & Exp < 3y';
                  outcomeVariant = 'danger';
                } else if (w.id === 'W2') {
                  isPicked = activeStrategy === 'rating';
                  outcomeLabel = 'Excluded: Booked Tomorrow';
                  outcomeVariant = 'danger';
                } else if (w.id === 'W3') {
                  isPicked = activeStrategy === 'worklink';
                  outcomeLabel = '#1 Recommended (Dominates W4)';
                  outcomeVariant = 'success';
                } else if (w.id === 'W4') {
                  outcomeLabel = 'Eligible (Dominated by W3)';
                  outcomeVariant = 'default';
                } else if (w.id === 'W5') {
                  outcomeLabel = 'Eligible (Trade-off: farther 9.1km)';
                  outcomeVariant = 'accent';
                } else if (w.id === 'W6') {
                  outcomeLabel = 'Excluded: 11.4km > 10km Zone';
                  outcomeVariant = 'danger';
                }

                return (
                  <tr
                    key={w.id}
                    className={`transition-colors ${
                      isPicked
                        ? 'bg-[rgba(0,113,227,0.06)] font-bold text-[#111111]'
                        : 'hover:bg-[#F5F5F7]'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <span className="font-bold">{w.id}: {w.name}</span>
                      {isPicked && (
                        <span className="ml-2">
                          <Badge variant="accent" size="sm">
                            {activeStrategy.toUpperCase()} Pick
                          </Badge>
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
                      <Badge variant={outcomeVariant} size="sm">
                        {outcomeLabel}
                      </Badge>
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
