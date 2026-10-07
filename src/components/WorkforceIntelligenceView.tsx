import React, { useState } from 'react';
import {
  BarChart3,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { WORKFORCE_INTELLIGENCE_DATA } from '../data/workforceIntelligence';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

export const WorkforceIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'demand' | 'models' | 'principles'>('principles');
  const data = WORKFORCE_INTELLIGENCE_DATA;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Explaining Conceptual Distinction */}
      <div className="card-premium p-6 md:p-8 bg-[#FFFFFF]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-black/5 gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-[rgba(255,149,0,0.08)] text-[#FF9500]">
                <BarChart3 className="w-4 h-4" />
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
                Workforce Intelligence &amp; Research Foundations
              </h2>
              <Badge variant="warning" size="sm">
                Analytical Foundations
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 max-w-3xl leading-relaxed">
              WorkLink is built on real workforce data science research. The hackathon datasets serve as workforce intelligence evidence to formulate explainable matching principles, not as the consumer trades database.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap gap-1 bg-[#F5F5F7] p-1 rounded-2xl border border-black/5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'principles' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              Matching Principles
            </button>
            <button
              onClick={() => setActiveTab('datasets')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'datasets' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              4 Datasets
            </button>
            <button
              onClick={() => setActiveTab('demand')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'demand' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              Demand &amp; Salaries
            </button>
            <button
              onClick={() => setActiveTab('models')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'models' ? 'bg-[#FFFFFF] text-[#111111] shadow-xs' : 'text-[#6E6E73] hover:text-[#111111]'
              }`}
            >
              Models
            </button>
          </div>
        </div>

        {/* Conceptual Chain Flow */}
        <div className="my-6 p-4 bg-[#FBFBFD] rounded-3xl border border-black/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#86868B] block mb-2">
            Non-Negotiable Conceptual Separation
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-[#111111]">
            <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 text-center w-full sm:w-auto flex-1 shadow-xs">
              <span className="text-[#0071E3] block text-[10px] uppercase">Layer 1</span>
              HACKATHON DATA
              <span className="text-[10px] text-[#86868B] block font-normal">17,743 records analyzed</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86868B] hidden sm:block shrink-0" />
            <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 text-center w-full sm:w-auto flex-1 shadow-xs">
              <span className="text-[#5856D6] block text-[10px] uppercase">Layer 2</span>
              WORKFORCE INTELLIGENCE
              <span className="text-[10px] text-[#86868B] block font-normal">Correlations, hikes, skills</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86868B] hidden sm:block shrink-0" />
            <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-black/5 text-center w-full sm:w-auto flex-1 shadow-xs">
              <span className="text-[#FF9500] block text-[10px] uppercase">Layer 3</span>
              MATCHING PRINCIPLES
              <span className="text-[10px] text-[#86868B] block font-normal">Hard constraints + soft rank</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#86868B] hidden sm:block shrink-0" />
            <div className="p-3.5 bg-[#111111] text-white rounded-2xl text-center w-full sm:w-auto flex-1 shadow-sm">
              <span className="text-[#34C759] block text-[10px] uppercase">Layer 4</span>
              WORKLINK MARKETPLACE
              <span className="text-[10px] text-[#86868B] block font-normal">Plumbers, AC tech, electricians</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: Matching Principles */}
      {activeTab === 'principles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.coreMatchingPrinciples.map((prin) => (
            <div key={prin.number} className="card-premium p-6 bg-[#FFFFFF] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="w-7 h-7 rounded-lg bg-[rgba(0,113,227,0.08)] text-[#0071E3] flex items-center justify-center font-bold text-xs">
                    #{prin.number}
                  </span>
                  <Badge variant="default" size="sm">
                    Core Design Rule
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
                <div className="mt-4 p-2.5 bg-[rgba(255,59,48,0.06)] border border-[rgba(255,59,48,0.2)] rounded-xl text-[11px] text-[#D70015] font-semibold flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-[#FF3B30] shrink-0" />
                  <span>Ethical Guardrail: Zero automated personality rejection.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Datasets & Missingness */}
      {activeTab === 'datasets' && (
        <div className="card-premium p-6 md:p-8 bg-[#FFFFFF] space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              The 4 Analyzed Hackathon Datasets
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1">
              Methodological rigor requires acknowledging data quality, missingness rates, and sample sizes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.datasetsSummary.map((ds, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/5">
                <Badge variant="accent" size="sm" className="mb-2">
                  {ds.evidenceClass.split(' ')[0]} {ds.evidenceClass.split(' ')[1]}
                </Badge>
                <h4 className="text-sm font-bold text-[#111111]">{ds.name}</h4>
                <div className="text-2xl font-extrabold text-[#111111] my-1 font-mono">
                  {ds.records.toLocaleString()}
                  <span className="text-xs font-normal text-[#86868B] ml-1">records</span>
                </div>
                <p className="text-xs font-semibold text-[#111111] mt-2">{ds.role}</p>
                <p className="text-[11px] text-[#6E6E73] mt-1 leading-relaxed">{ds.missingness}</p>
              </div>
            ))}
          </div>

          {/* Evidence Classes Table */}
          <div className="pt-4 border-t border-black/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6E6E73] mb-3">
              Evidence Discipline Taxonomy (Classes A through E)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              {data.evidenceClassesDescription.map((ec) => (
                <div key={ec.code} className="p-3 bg-[#FFFFFF] rounded-2xl border border-black/5">
                  <span className="font-bold text-[#111111] block">{ec.code}: {ec.name}</span>
                  <span className="text-[11px] text-[#6E6E73] block mt-1">{ec.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Demand & Salaries */}
      {activeTab === 'demand' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 card-premium p-6 bg-[#FFFFFF]">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-sm font-bold text-[#111111]">
                Concentration of Skill Demand (Analytics Jobs)
              </h3>
              <Badge variant="default" size="sm">RQ1 Finding</Badge>
            </div>
            <p className="text-xs text-[#6E6E73] my-2">
              Demand strongly concentrates around foundational core competencies (SQL in 1,582 records, Python in 962 records).
            </p>

            <div className="space-y-2.5 mt-4">
              {data.skillDemandDistribution.map((sk) => (
                <div key={sk.skill} className="text-xs">
                  <div className="flex justify-between text-[#111111] font-medium mb-1">
                    <span>{sk.skill}</span>
                    <span className="font-mono text-[#86868B]">{sk.count} postings</span>
                  </div>
                  <div className="w-full bg-[#F0F0F2] rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-[#0071E3] h-1.5 rounded-full"
                      style={{ width: `${(sk.count / 1582) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 card-premium p-6 bg-[#FFFFFF]">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-sm font-bold text-[#111111]">
                Compensation Hierarchy by Role &amp; Experience
              </h3>
              <Badge variant="default" size="sm">RQ2 Finding</Badge>
            </div>
            <p className="text-xs text-[#6E6E73] my-2">
              Pearson r = 0.66 correlation between experience and compensation. Role spreads span from ₹5.71L to ₹25.09L.
            </p>

            <div className="space-y-2 mt-4">
              {data.roleSalaryHierarchy.map((r) => (
                <div key={r.role} className="p-2.5 rounded-xl bg-[#FBFBFD] border border-black/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#111111]">{r.role}</span>
                    <span className="text-[11px] text-[#86868B] block">Avg Min Exp: {r.minExperienceAvg} years</span>
                  </div>
                  <span className="font-mono font-bold text-[#111111] text-sm">
                    ₹{r.avgSalaryLakh.toFixed(2)} Lakh
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Models */}
      {activeTab === 'models' && (
        <div className="card-premium p-6 md:p-8 bg-[#FFFFFF] space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Machine-Learning Models &amp; Evaluation Baselines
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1">
              Empirical models trained on the hackathon datasets to test analytical hypotheses (H1 through H5).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.modelsEvaluated.map((m, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#111111]">{m.name}</h4>
                  <Badge variant="default" size="sm">
                    {m.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-[#FFFFFF] rounded-xl border border-black/5 text-xs">
                  <div>
                    <span className="text-[10px] text-[#86868B] font-bold uppercase block">Target Metric</span>
                    <span className="font-bold text-[#1B8738] font-mono">{m.accuracyOrR2}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#86868B] font-bold uppercase block">F1 / Loss</span>
                    <span className="font-semibold text-[#111111] font-mono">{m.f1OrMae}</span>
                  </div>
                </div>

                <p className="text-xs text-[#6E6E73]"><strong>Inputs:</strong> {m.inputs} (n = {m.sampleSize})</p>
                <p className="text-[11px] text-[#86868B] mt-2 italic bg-[#F0F0F2] p-2 rounded-xl">
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
