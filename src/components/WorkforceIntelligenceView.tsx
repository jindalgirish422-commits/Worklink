import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Database,
  Layers,
  Activity,
  Sliders,
  DollarSign,
  Clock,
  Navigation,
  Percent,
  Star,
  CheckCircle2,
  AlertTriangle,
  Info,
  Compass,
  Zap,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { WORKFORCE_INTELLIGENCE_DATA } from '../data/workforceIntelligence';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const WorkforceIntelligenceView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'all' | 'market' | 'operations' | 'principles'>('all');
  const [selectedTradeModel, setSelectedTradeModel] = useState<string>('all');
  const data = WORKFORCE_INTELLIGENCE_DATA;

  // WorkLink Operations Telemetry Data (Clearly labeled synthetic / demo prototype values)
  const operationsTelemetry = {
    bookingConversion: 88.5,
    recommendationAcceptance: 91.2,
    completionRate: 98.4,
    cancellationRate: 2.8,
    workerUtilization: 82.4,
    customerSatisfaction: 4.91,
    averageDistanceKm: 3.4,
    repeatBookingsRate: 34.2,
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* ============================================================== */}
      {/* 1. HEADER: CONCEPTUAL DISTINCTION & ETHICAL COMMITMENT         */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-black/8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-[#FF9500]/10 text-[#FF9500]">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-[#111111]">
                Workforce Intelligence &amp; Analytics
              </h1>
              <Badge variant="warning" size="sm">
                Empirical Evidence • 17,743 Records
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-2 max-w-3xl leading-relaxed">
              WorkLink uses empirical data science to formulate explainable skilled-trades matching. 
              <strong> Important:</strong> This does not change WorkLink into a corporate data-science recruitment platform. The hackathon datasets serve as empirical evidence informing workforce intelligence for fair local service matching.
            </p>
          </div>

          {/* Subtle Glass Controls / Filters */}
          <div className="p-1 rounded-2xl bg-white/85 backdrop-blur-xl border border-white/70 shadow-sm glass-specular-edge flex items-center space-x-1 text-xs font-semibold self-start lg:self-auto overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Intelligence' },
              { id: 'market', label: 'Market Intelligence' },
              { id: 'operations', label: 'WorkLink Operations' },
              { id: 'principles', label: 'Matching Principles' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap min-h-[36px] ${
                  activeSection === tab.id
                    ? 'bg-[#111111] text-white shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#111111]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conceptual Pipeline Flow (Layered Separation) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FBFBFD] border border-black/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#86868B]">
              Rigorous Conceptual Layering (Evidence vs Production)
            </span>
            <span className="text-[11px] text-[#0071E3] font-semibold">
              Evidence-Informed Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white rounded-2xl border border-black/8 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#0071E3] block">Layer 1</span>
              <strong className="text-sm font-extrabold text-[#111111] block">Hackathon Datasets</strong>
              <p className="text-[11px] text-[#6E6E73]">
                17,743 historical records across 4 sets (Analytics Jobs, DS Jobs, JDS, SDS).
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/8 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#5856D6] block">Layer 2</span>
              <strong className="text-sm font-extrabold text-[#111111] block">Workforce Intelligence</strong>
              <p className="text-[11px] text-[#6E6E73]">
                Observed correlations (r=0.66), skill premiums (+1.04), and role spreads.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/8 shadow-2xs space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#FF9500] block">Layer 3</span>
              <strong className="text-sm font-extrabold text-[#111111] block">Matching Principles</strong>
              <p className="text-[11px] text-[#6E6E73]">
                Hard filters for safety, contextual pricing, and skill-depth ranking.
              </p>
            </div>

            <div className="p-4 bg-[#111111] text-white rounded-2xl shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#34C759] block">Layer 4</span>
              <strong className="text-sm font-extrabold text-white block">WorkLink Marketplace</strong>
              <p className="text-[11px] text-white/70">
                Local skilled trades (AC Tech, Plumber, Electrician) within 10 km radius.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECTION 1: MARKET INTELLIGENCE                              */}
      {/* Insights: skill demand | experience vs compensation |           */}
      {/* role differences | technical capability | professional outcomes|*/}
      {/* salary modelling                                               */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'market') && (
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-black/5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111] flex items-center space-x-2">
                <span>Market Intelligence</span>
                <Badge variant="accent" size="sm">Evidence Synthesis</Badge>
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
                Empirical workforce patterns analyzed from the 17,743 hackathon dataset records.
              </p>
            </div>
            <span className="text-xs text-[#86868B] font-mono">Classes A &amp; B Evidence</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insight 1: Skill Demand */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] block">
                    Insight 01 • Analytics Jobs (n=15,841)
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Skill Demand Concentration
                  </h3>
                </div>
                <span className="font-mono text-xs text-[#86868B]">10 Core Skills</span>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Skill demand concentrates heavily around foundational core competencies rather than peripheral specializations. 
                SQL appears in 1,582 job descriptions (100% relative benchmark), followed by Python (962 postings, 60.8%).
              </p>

              {/* Clean Horizontal Bar Chart */}
              <div className="space-y-2.5 pt-2">
                {data.skillDemandDistribution.map((sk) => (
                  <div key={sk.skill} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-[#111111]">
                      <span>{sk.skill} <span className="font-normal text-[#86868B]">({sk.category})</span></span>
                      <span className="font-mono text-[#0071E3]">{sk.count.toLocaleString()} ({sk.sharePercent}%)</span>
                    </div>
                    <div className="w-full bg-[#F5F5F7] rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#0071E3] h-full rounded-full transition-all duration-500"
                        style={{ width: `${(sk.count / 1582) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-[#F5F5F7] text-[11px] text-[#6E6E73]">
                <strong>Product Implication:</strong> WorkLink matches workers based on validated mandatory core skills first, using secondary tools for incremental score refinement.
              </div>
            </div>

            {/* Insight 2: Experience vs Compensation */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5856D6] block">
                    Insight 02 • Data Science Jobs (n=1,602)
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Experience vs. Compensation Correlation
                  </h3>
                </div>
                <Badge variant="success" size="sm">Pearson r = 0.66</Badge>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Empirical correlation between minimum experience and compensation midpoint is statistically strong (Pearson r = 0.66, p &lt; 0.001). However, the return follows non-linear bands across experience brackets.
              </p>

              {/* Large Numbers & Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[10px] text-[#86868B] uppercase font-bold block">0–2 Years</span>
                  <span className="text-lg font-extrabold text-[#111111] mt-1 block">₹5.71L</span>
                  <span className="text-[10px] text-[#6E6E73]">Entry baseline</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[10px] text-[#86868B] uppercase font-bold block">3–5 Years</span>
                  <span className="text-lg font-extrabold text-[#0071E3] mt-1 block">₹11.81L</span>
                  <span className="text-[10px] text-[#34C759] font-semibold">+106% hike</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[10px] text-[#86868B] uppercase font-bold block">6–8 Years</span>
                  <span className="text-lg font-extrabold text-[#5856D6] mt-1 block">₹19.00L</span>
                  <span className="text-[10px] text-[#5856D6] font-semibold">+60% hike</span>
                </div>

                <div className="p-3 rounded-2xl bg-[#F5F5F7]">
                  <span className="text-[10px] text-[#86868B] uppercase font-bold block">9+ Years</span>
                  <span className="text-lg font-extrabold text-[#111111] mt-1 block">₹25.09L</span>
                  <span className="text-[10px] text-[#86868B]">Mastery premium</span>
                </div>
              </div>

              {/* Empirical Finding Callout */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/60 text-xs text-purple-950 space-y-1">
                <strong className="block font-bold">Why Experience Must Be Contextual, Not Maximized:</strong>
                <p className="text-[11px] leading-relaxed">
                  Higher experience commands steep pricing premiums. For routine consumer maintenance (e.g. minor tap leakage), paying 3x for a 12-year master tradesman is economically inefficient. WorkLink matches experience relative to job complexity tiers.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insight 3: Role Differences */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF9500] block">
                    Insight 03 • Role Differences
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Compensation Hierarchy Across 10 Roles
                  </h3>
                </div>
                <span className="text-xs font-mono text-[#86868B]">Spread: 4.4x Ratio</span>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Role compensation reflects distinct scopes of responsibility. Spreads range from ₹5.71 Lakh (Data Analyst, 1.5 yrs) to ₹25.09 Lakh (Data Architect, 9.5 yrs).
              </p>

              {/* Clean Role Range Table */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 text-xs">
                {data.roleSalaryHierarchy.map((r, idx) => (
                  <div
                    key={r.role}
                    className="p-2.5 rounded-xl bg-[#FBFBFD] border border-black/5 flex items-center justify-between hover:bg-white transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-lg bg-[#F5F5F7] text-[10px] font-mono text-[#86868B] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-[#111111] block">{r.role}</span>
                        <span className="text-[10px] text-[#86868B]">Avg Min Exp: {r.minExperienceAvg} yrs</span>
                      </div>
                    </div>
                    <span className="font-mono font-extrabold text-[#111111] text-sm">
                      ₹{r.avgSalaryLakh.toFixed(2)}L
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Insight 4: Technical Capability & Hikes */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#34C759] block">
                    Insight 04 • JDS Skill Traits (n=139)
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Technical Capability vs. Compensation Hike
                  </h3>
                </div>
                <Badge variant="success" size="sm">Significant Premiums</Badge>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Analysis of 5 skill dimensions reveals that candidates securing high compensation hikes score substantially higher across all technical capabilities. Storytelling and Statistics exhibit the largest divergence.
              </p>

              {/* Skill Delta Comparison Bars */}
              <div className="space-y-2.5 pt-1 text-xs">
                {data.jdsSkillComparison.map((item) => (
                  <div key={item.dimension} className="p-2.5 rounded-xl bg-[#FBFBFD] border border-black/5 space-y-1.5">
                    <div className="flex justify-between font-bold text-[#111111]">
                      <span>{item.dimension}</span>
                      <span className="text-[#34C759] font-mono font-extrabold">+{item.delta.toFixed(2)} Delta</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[11px] text-[#6E6E73]">
                      <span>High Hike: <strong className="text-[#111111]">{item.highHikeMean}</strong></span>
                      <span>•</span>
                      <span>Low Hike: <strong className="text-[#86868B]">{item.lowHikeMean}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insight 5: Professional Outcomes & Personality Guardrails */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D70015] block">
                    Insight 05 • SDS Personality Traits (n=161)
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Professional Outcomes &amp; Ethical Guardrails
                  </h3>
                </div>
                <Badge variant="danger" size="sm">Strict Boundary</Badge>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Big Five personality trait correlation indicates Conscientiousness (+17.94 delta) and Openness (+15.17 delta) associate with rated corporate success in an exploratory n=161 cohort. Neuroticism (+0.30) shows zero predictive power.
              </p>

              {/* Trait Delta List */}
              <div className="space-y-2 text-xs">
                {data.sdsTraitComparison.map((trait) => (
                  <div key={trait.trait} className="p-2.5 rounded-xl bg-[#FBFBFD] border border-black/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#111111]">{trait.trait}</span>
                      <span className="text-[10px] text-[#86868B] block">
                        High Success: {trait.highSuccessMean} vs Low: {trait.lowSuccessMean}
                      </span>
                    </div>
                    <span className={`font-mono font-bold text-xs ${trait.isPredictive ? 'text-[#0071E3]' : 'text-[#86868B]'}`}>
                      +{trait.delta.toFixed(1)} pts
                    </span>
                  </div>
                ))}
              </div>

              {/* Ethical Guardrail Warning Box */}
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-red-900">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Ethical Guardrail: Zero Automated Personality Rejection</span>
                </div>
                <p className="text-[11px] leading-relaxed text-red-900">
                  WorkLink enforces a non-negotiable rule: Psychological/personality traits from small corporate datasets (n=161) are <strong>never</strong> used to evaluate, rank, or reject skilled tradespeople. Only verified technical skills, license validity, and customer reviews are evaluated.
                </p>
              </div>
            </div>

            {/* Insight 6: Salary Modelling & Evaluation Baselines */}
            <div className="p-6 sm:p-7 rounded-3xl bg-white border border-black/8 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0071E3] block">
                    Insight 06 • Empirical Modeling (n=1,602 &amp; n=139)
                  </span>
                  <h3 className="text-base font-bold text-[#111111] mt-0.5">
                    Salary Modelling &amp; Empirical Baselines
                  </h3>
                </div>
                <Badge variant="accent" size="sm">H1–H5 Validation</Badge>
              </div>

              <p className="text-xs text-[#6E6E73] leading-relaxed">
                Predictive compensation models trained across features show that regularized linear frameworks (Ridge R² = 0.587) outperform complex non-linear ensembles (Gradient Boosting R² = 0.541) in generalization and stability.
              </p>

              {/* Model Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {data.modelsEvaluated.map((m) => (
                  <div key={m.name} className="p-3.5 rounded-2xl bg-[#FBFBFD] border border-black/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-[#111111] truncate">{m.name}</strong>
                      <span className="text-[10px] font-mono text-[#86868B]">n={m.sampleSize}</span>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-black/5">
                      <span className="text-[10px] text-[#86868B] block font-semibold uppercase">Performance</span>
                      <span className="font-mono font-extrabold text-sm text-[#0071E3]">{m.accuracyOrR2}</span>
                      <span className="text-[10px] text-[#6E6E73] block mt-0.5">{m.f1OrMae}</span>
                    </div>

                    <p className="text-[10px] text-[#6E6E73] italic">
                      {m.caveat}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 3. SECTION 2: WORKLINK OPERATIONS (SEPARATE SECTION)           */}
      {/* Metrics: booking conversion | recommendation acceptance |      */}
      {/* completion | cancellation | worker utilization |               */}
      {/* customer satisfaction | average distance | repeat bookings     */}
      {/* Clearly label synthetic/demo values where applicable           */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'operations') && (
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-black/5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111] flex items-center space-x-2">
                <span>WorkLink Operations</span>
                <Badge variant="accent" size="sm" className="bg-blue-100 text-blue-900 border-blue-300">
                  Platform Telemetry
                </Badge>
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
                Simulated platform operations and marketplace execution telemetry.
              </p>
            </div>

            {/* Mandatory Non-Negotiable Prototype Disclaimer Badge */}
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>SYNTHETIC / DEMO PROTOTYPE TELEMETRY</span>
            </span>
          </div>

          {/* Mandatory Integrity Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong className="font-bold block">Integrity Notice on Prototype Telemetry:</strong>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Never fabricate data. In accordance with WorkLink hackathon methodology, the values below represent <strong>synthetic demonstration values</strong> generated from test executions of the matching engine and dispatch simulator. They are not claimed as measured multi-year production statistics.
                </p>
              </div>
            </div>
            <Badge variant="warning" size="sm" className="shrink-0 self-start sm:self-auto">
              Simulated Telemetry
            </Badge>
          </div>

          {/* The 8 Required Operational Metrics (Clean cards, large numbers, whitespace, solid backgrounds) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Metric 1: booking conversion */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  booking conversion
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#111111] pt-1">
                {operationsTelemetry.bookingConversion}%
              </div>
              <p className="text-xs text-[#34C759] font-medium pt-0.5">
                From intake prompt to confirmed booking
              </p>
            </div>

            {/* Metric 2: recommendation acceptance */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  recommendation acceptance
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0071E3] pt-1">
                {operationsTelemetry.recommendationAcceptance}%
              </div>
              <p className="text-xs text-[#6E6E73] font-medium pt-0.5">
                Top 3 candidates booked
              </p>
            </div>

            {/* Metric 3: completion */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  completion
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#34C759] pt-1">
                {operationsTelemetry.completionRate}%
              </div>
              <p className="text-xs text-[#34C759] font-medium pt-0.5">
                On-time service execution
              </p>
            </div>

            {/* Metric 4: cancellation */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  cancellation
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-red-600 pt-1">
                {operationsTelemetry.cancellationRate}%
              </div>
              <p className="text-xs text-[#6E6E73] font-medium pt-0.5">
                Fair zero-penalty cancellation
              </p>
            </div>

            {/* Metric 5: worker utilization */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  worker utilization
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#5856D6] pt-1">
                {operationsTelemetry.workerUtilization}%
              </div>
              <p className="text-xs text-[#6E6E73] font-medium pt-0.5">
                Active time in 10 km clusters
              </p>
            </div>

            {/* Metric 6: customer satisfaction */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  customer satisfaction
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#111111] pt-1 flex items-baseline space-x-1">
                <span>{operationsTelemetry.customerSatisfaction}</span>
                <span className="text-xl text-[#FF9500]">★</span>
              </div>
              <p className="text-xs text-[#34C759] font-medium pt-0.5">
                Rolling 5-star verified feedback
              </p>
            </div>

            {/* Metric 7: average distance */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  average distance
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0071E3] pt-1">
                {operationsTelemetry.averageDistanceKm} <span className="text-base font-normal text-[#6E6E73]">km</span>
              </div>
              <p className="text-xs text-[#0071E3] font-medium pt-0.5">
                Strict 10 km perimeter
              </p>
            </div>

            {/* Metric 8: repeat bookings */}
            <div className="p-5 rounded-3xl bg-white border border-black/8 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#86868B] uppercase tracking-wider">
                  repeat bookings
                </span>
                <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Demo</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-[#111111] pt-1">
                {operationsTelemetry.repeatBookingsRate}%
              </div>
              <p className="text-xs text-[#34C759] font-medium pt-0.5">
                Re-booking trusted favorite pros
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* 4. SECTION 3: MATCHING PRINCIPLES (Core Rules)                 */}
      {/* ============================================================== */}
      {(activeSection === 'all' || activeSection === 'principles') && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center justify-between pb-1 border-b border-black/5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#111111]">
                Core Matching Principles
              </h2>
              <p className="text-xs sm:text-sm text-[#6E6E73] mt-0.5">
                The 5 fundamental rules derived from dataset evidence governing WorkLink's matching engine.
              </p>
            </div>
            <Badge variant="default" size="sm">Explainable AI</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.coreMatchingPrinciples.map((prin) => (
              <div key={prin.number} className="p-6 rounded-3xl bg-white border border-black/8 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-xs">
                      #{prin.number}
                    </span>
                    <Badge variant="default" size="sm">
                      Non-Negotiable
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-[#111111] tracking-tight mb-2">
                    {prin.title}
                  </h3>

                  <div className="p-3 bg-[#FBFBFD] rounded-xl border border-black/5 text-xs text-[#6E6E73] mb-3">
                    <strong className="text-[#111111] block text-[11px] mb-0.5">Empirical Evidence from Data:</strong>
                    {prin.insightFromData}
                  </div>

                  <div className="text-xs text-[#111111] leading-relaxed">
                    <strong className="text-[#0071E3] block text-[11px] mb-0.5">WorkLink Product Implementation:</strong>
                    {prin.productTranslation}
                  </div>
                </div>

                {prin.number === 5 && (
                  <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-900 font-semibold flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Ethical Guardrail: Zero automated personality rejection.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
