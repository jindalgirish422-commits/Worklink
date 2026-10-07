import React, { useState } from 'react';
import {
  BarChart3,
  Database,
  Brain,
  ShieldAlert,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { WORKFORCE_INTELLIGENCE_DATA } from '../data/workforceIntelligence';

export const WorkforceIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'demand' | 'models' | 'principles'>('principles');
  const data = WORKFORCE_INTELLIGENCE_DATA;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Explaining Conceptual Distinction */}
      <div className="apple-card p-6 md:p-8 bg-white border border-black/[0.06] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Workforce Intelligence &amp; Research Foundations
              </h2>
              <span className="badge-subtle bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                Analytical Foundations
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl">
              WorkLink is built on real workforce data science research. The hackathon datasets serve as workforce intelligence evidence to formulate explainable matching principles, not as the consumer trades database.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'principles' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matching Principles
            </button>
            <button
              onClick={() => setActiveTab('datasets')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'datasets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              4 Hackathon Datasets
            </button>
            <button
              onClick={() => setActiveTab('demand')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'demand' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demand &amp; Compensation
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'models' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Model Benchmarks
            </button>
          </div>
        </div>

        {/* Conceptual Chain Flow */}
        <div className="my-6 p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Non-Negotiable Conceptual Separation
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-800">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center w-full sm:w-auto flex-1">
              <span className="text-blue-600 block text-[10px] uppercase">Layer 1</span>
              HACKATHON DATA
              <span className="text-[10px] text-slate-400 block font-normal">17,743 records analyzed</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center w-full sm:w-auto flex-1">
              <span className="text-indigo-600 block text-[10px] uppercase">Layer 2</span>
              WORKFORCE INTELLIGENCE
              <span className="text-[10px] text-slate-400 block font-normal">Correlations, hikes, skills</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-center w-full sm:w-auto flex-1">
              <span className="text-amber-600 block text-[10px] uppercase">Layer 3</span>
              MATCHING PRINCIPLES
              <span className="text-[10px] text-slate-400 block font-normal">Hard constraints + soft rank</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
            <div className="p-3 bg-slate-900 text-white rounded-xl text-center w-full sm:w-auto flex-1 shadow-xs">
              <span className="text-emerald-400 block text-[10px] uppercase">Layer 4</span>
              WORKLINK MARKETPLACE
              <span className="text-[10px] text-slate-300 block font-normal">Plumbers, AC tech, electricians</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: Matching Principles */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.coreMatchingPrinciples.map((prin) => (
            <div key={prin.number} className="apple-card p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                    #{prin.number}
                  </span>
                  <span className="badge-subtle bg-slate-100 text-slate-700 text-[10px] font-semibold">
                    Core Design Rule
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight mb-2">
                  {prin.title}
                </h3>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 mb-3">
                  <strong className="text-slate-800 block text-[11px] mb-0.5">Empirical Evidence from Data:</strong>
                  {prin.insightFromData}
                </div>

                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-blue-900 block text-[11px] mb-0.5">WorkLink Product Implementation:</strong>
                  {prin.productTranslation}
                </div>
              </div>

              {prin.number === 5 && (
                <div className="mt-4 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Ethical Guardrail: Zero automated personality rejection.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Datasets & Missingness */}
      {activeTab === 'datasets' && (
        <div className="apple-card p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              The 4 Analyzed Hackathon Datasets
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Methodological rigor requires acknowledging data quality, missingness rates, and sample sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.datasetsSummary.map((ds, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="badge-subtle bg-blue-100 text-blue-800 text-[10px] font-bold mb-2">
                  {ds.evidenceClass.split(' ')[0]} {ds.evidenceClass.split(' ')[1]}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{ds.name}</h4>
                <div className="text-2xl font-extrabold text-slate-900 my-1 font-mono">
                  {ds.records.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">records</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 mt-2">{ds.role}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ds.missingness}</p>
              </div>
            ))}
          </div>

          {/* Evidence Classes Table */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Evidence Discipline Taxonomy (Classes A through E)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {data.evidenceClassesDescription.map((ec) => (
                <div key={ec.code} className="p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-900 block">{ec.code}: {ec.name}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{ec.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Demand & Compensation */}
      {activeTab === 'demand' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skill Demand Bar Chart */}
          <div className="lg:col-span-6 apple-card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Concentration of Skill Demand (Analytics Jobs)
              </h3>
              <span className="text-xs text-slate-400">RQ1 Finding</span>
            </div>
            <p className="text-xs text-slate-500 my-2">
              Demand strongly concentrates around foundational core competencies (SQL in 1,582 records, Python in 962 records).
            </p>

            <div className="space-y-2 mt-4">
              {data.skillDemandDistribution.map((sk) => (
                <div key={sk.skill} className="text-xs">
                  <div className="flex justify-between text-slate-700 font-medium mb-1">
                    <span>{sk.skill}</span>
                    <span className="font-mono text-slate-900">{sk.count} postings</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(sk.count / 1582) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role Salary Hierarchy */}
          <div className="lg:col-span-6 apple-card p-6 bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Compensation Hierarchy by Role &amp; Experience
              </h3>
              <span className="text-xs text-slate-400">RQ2 Finding</span>
            </div>
            <p className="text-xs text-slate-500 my-2">
              Pearson r = 0.66 correlation between experience and compensation. Role spreads span from ₹5.71L to ₹25.09L.
            </p>

            <div className="space-y-2 mt-4">
              {data.roleSalaryHierarchy.map((r) => (
                <div key={r.role} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{r.role}</span>
                    <span className="text-[11px] text-slate-500 block">Avg Min Exp: {r.minExperienceAvg} years</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{r.avgSalaryLakh.toFixed(2)} Lakh
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ML Models & Evaluation */}
      {activeTab === 'models' && (
        <div className="apple-card p-6 md:p-8 bg-white border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Machine-Learning Models &amp; Evaluation Baselines
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Empirical models trained on the hackathon datasets to test analytical hypotheses (H1 through H5).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.modelsEvaluated.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{m.name}</h4>
                  <span className="badge-subtle bg-slate-200 text-slate-800 text-[10px] font-bold">
                    {m.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-white rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Metric</span>
                    <span className="font-bold text-emerald-600 font-mono">{m.accuracyOrR2}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">F1 / Loss</span>
                    <span className="font-semibold text-slate-800 font-mono">{m.f1OrMae}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600"><strong>Inputs:</strong> {m.inputs} (n = {m.sampleSize})</p>
                <p className="text-[11px] text-slate-500 mt-2 italic bg-slate-100/70 p-2 rounded-lg">
                  <strong>Boundary:</strong> {m.caveat}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
