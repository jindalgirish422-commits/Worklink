export interface SkillDemandItem {
  skill: string;
  count: number;
  sharePercent: number;
  category: string;
}

export interface RoleSalaryItem {
  role: string;
  avgSalaryLakh: number;
  minExperienceAvg: number;
}

export interface JDSSkillComparison {
  dimension: string;
  highHikeMean: number;
  lowHikeMean: number;
  delta: number;
}

export interface SDSTraitComparison {
  trait: string;
  highSuccessMean: number;
  lowSuccessMean: number;
  delta: number;
  isPredictive: boolean;
}

export interface ModelMetric {
  name: string;
  target: string;
  inputs: string;
  accuracyOrR2: string;
  f1OrMae: string;
  sampleSize: number;
  status: string;
  caveat: string;
}

export const WORKFORCE_INTELLIGENCE_DATA = {
  datasetsSummary: [
    {
      name: 'Analytics Jobs',
      records: 15841,
      role: 'Macro Market Demand & Missingness Layer',
      missingness: '22.15% job_description missing; 75.82% job_type missing',
      evidenceClass: 'Class A (Direct Observation) & B (Inference)',
    },
    {
      name: 'Data Science Jobs',
      records: 1602,
      role: 'Role Hierarchy & Compensation Calibration',
      missingness: 'Structured role titles, salary bounds, min experience',
      evidenceClass: 'Class A (Direct Observation)',
    },
    {
      name: 'JDS Skill Traits',
      records: 139,
      role: 'Technical Capability vs Compensation Hike',
      missingness: '5 skill dimensions; binary hike label',
      evidenceClass: 'Class A & B (Model Validation)',
    },
    {
      name: 'SDS Personality Traits',
      records: 161,
      role: 'Behavioral Traits vs Professional Success',
      missingness: 'Big Five traits; success label (Exploratory n=161)',
      evidenceClass: 'Class B (Exploratory only; non-production)',
    },
  ],

  skillDemandDistribution: [
    { skill: 'SQL', count: 1582, sharePercent: 100.0, category: 'Database & Querying' },
    { skill: 'Python', count: 962, sharePercent: 60.8, category: 'General Programming' },
    { skill: 'Java', count: 951, sharePercent: 60.1, category: 'Enterprise Systems' },
    { skill: 'SAS', count: 876, sharePercent: 55.4, category: 'Statistical Computing' },
    { skill: 'Machine Learning', count: 734, sharePercent: 46.4, category: 'Applied Modeling' },
    { skill: 'Data Analysis', count: 726, sharePercent: 45.9, category: 'Core Methodology' },
    { skill: 'Excel', count: 626, sharePercent: 39.6, category: 'Spreadsheets' },
    { skill: 'Hadoop', count: 329, sharePercent: 20.8, category: 'Big Data Distributed' },
    { skill: 'Spark', count: 315, sharePercent: 19.9, category: 'Stream Processing' },
    { skill: 'C++', count: 249, sharePercent: 15.7, category: 'Systems Programming' },
  ] as SkillDemandItem[],

  roleSalaryHierarchy: [
    { role: 'Data Architect', avgSalaryLakh: 25.09, minExperienceAvg: 9.5 },
    { role: 'Senior Data Scientist', avgSalaryLakh: 22.29, minExperienceAvg: 7.8 },
    { role: 'Senior Data Engineer', avgSalaryLakh: 19.00, minExperienceAvg: 6.5 },
    { role: 'Data Scientist', avgSalaryLakh: 13.53, minExperienceAvg: 4.2 },
    { role: 'Senior Business Analyst', avgSalaryLakh: 13.17, minExperienceAvg: 5.0 },
    { role: 'Data Engineer', avgSalaryLakh: 11.81, minExperienceAvg: 3.8 },
    { role: 'ML Engineer', avgSalaryLakh: 9.85, minExperienceAvg: 3.0 },
    { role: 'Senior Data Analyst', avgSalaryLakh: 9.57, minExperienceAvg: 3.5 },
    { role: 'Business Analyst', avgSalaryLakh: 8.95, minExperienceAvg: 2.8 },
    { role: 'Data Analyst', avgSalaryLakh: 5.71, minExperienceAvg: 1.5 },
  ] as RoleSalaryItem[],

  jdsSkillComparison: [
    { dimension: 'Dashboard & Storytelling', highHikeMean: 4.85, lowHikeMean: 3.81, delta: +1.04 },
    { dimension: 'Maths & Statistics', highHikeMean: 4.71, lowHikeMean: 3.83, delta: +0.88 },
    { dimension: 'AI & ML Skills', highHikeMean: 4.60, lowHikeMean: 3.90, delta: +0.70 },
    { dimension: 'Big Data Skills', highHikeMean: 4.52, lowHikeMean: 3.88, delta: +0.64 },
    { dimension: 'Coding Skills', highHikeMean: 4.65, lowHikeMean: 4.02, delta: +0.63 },
  ] as JDSSkillComparison[],

  sdsTraitComparison: [
    { trait: 'Conscientiousness', highSuccessMean: 53.68, lowSuccessMean: 35.74, delta: +17.94, isPredictive: true },
    { trait: 'Openness to Experience', highSuccessMean: 48.49, lowSuccessMean: 33.32, delta: +15.17, isPredictive: true },
    { trait: 'Extraversion', highSuccessMean: 42.10, lowSuccessMean: 34.50, delta: +7.60, isPredictive: true },
    { trait: 'Agreeableness', highSuccessMean: 40.20, lowSuccessMean: 35.10, delta: +5.10, isPredictive: false },
    { trait: 'Neuroticism', highSuccessMean: 28.40, lowSuccessMean: 28.10, delta: +0.30, isPredictive: false },
  ] as SDSTraitComparison[],

  modelsEvaluated: [
    {
      name: 'Logistic Regression (JDS)',
      target: 'salary_hike_high_or_low',
      inputs: '5 Technical Skill Dimensions',
      accuracyOrR2: '81.9% CV Accuracy',
      f1OrMae: '82.8% F1 Score',
      sampleSize: 139,
      status: 'Validated Baseline',
      caveat: 'Interpretable linear boundaries, low variance on small n.',
    },
    {
      name: 'Random Forest (SDS)',
      target: 'success_classification_high_low',
      inputs: '5 Big-Five Personality Traits',
      accuracyOrR2: '95.6% Accuracy',
      f1OrMae: '95.8% F1 Score',
      sampleSize: 161,
      status: 'Exploratory Only',
      caveat: 'High accuracy risks overfitting on small n=161. Strictly forbidden as automated worker rejection criteria.',
    },
    {
      name: 'Ridge Regression (Salary)',
      target: 'Salary Midpoint (₹ Lakh)',
      inputs: 'Experience, Role, Domain features',
      accuracyOrR2: 'R² = 0.587',
      f1OrMae: 'MAE: 3.35L | RMSE: 5.04L',
      sampleSize: 1602,
      status: 'Calibrated Prior',
      caveat: 'Explains 58.7% of variation; proves experience-salary link but highlights residual task variance.',
    },
    {
      name: 'Gradient Boosting (Salary)',
      target: 'Salary Midpoint (₹ Lakh)',
      inputs: 'Experience, Role, Domain features',
      accuracyOrR2: 'R² = 0.541',
      f1OrMae: 'MAE: 3.65L | RMSE: 5.31L',
      sampleSize: 1602,
      status: 'Comparative Benchmark',
      caveat: 'Non-linear tree ensemble; linear regularized model showed superior stability.',
    },
  ] as ModelMetric[],

  coreMatchingPrinciples: [
    {
      number: 1,
      title: 'Skill Fit as Hard & Soft Factor',
      insightFromData: 'In JDS data, high-performing profiles beat low profiles across all technical skills. Demand in Analytics Jobs concentrates heavily on specific core capabilities.',
      productTranslation: 'Hard filter excludes any worker without the mandatory skill. Soft ranking scores skill depth and multi-skill competence.',
      nonNegotiable: true,
    },
    {
      number: 2,
      title: 'Experience Relative to Job, Not Maximized',
      insightFromData: 'Pearson r = 0.66 shows experience correlates with cost and capability, but overqualified profiles cost exponentially more.',
      productTranslation: 'Experience is scored against the job difficulty tier. For an emergency tap wash, 12 years exp with 3x rate is sub-optimal vs 4 years qualified.',
      nonNegotiable: true,
    },
    {
      number: 3,
      title: 'Price is Contextual, Not Universal',
      insightFromData: 'Data Science Jobs roles show ₹5.71L to ₹25.09L spreads based on scope and specialization.',
      productTranslation: 'WorkLink decomposes pricing into: base labour + actual working time + travel slabs + platform fee. No false universal price.',
      nonNegotiable: true,
    },
    {
      number: 4,
      title: 'Confidence Aware of Data Quality',
      insightFromData: 'Analytics Jobs had 22.15% missing descriptions and 75.82% missing job types.',
      productTranslation: 'Worker recommendations display confidence levels and prompt incomplete worker profiles for verification before active ranking.',
      nonNegotiable: true,
    },
    {
      number: 5,
      title: 'Strict Ethical Boundary on Personality Traits',
      insightFromData: 'SDS dataset shows Conscientiousness correlation in small n=161 corporate sample.',
      productTranslation: 'STRICT PRODUCT RULE: Personality traits are NEVER used as a standalone worker rejection/hiring criteria. Only verified objective performance signals are used.',
      nonNegotiable: true,
    },
  ],

  evidenceClassesDescription: [
    { code: 'Class A', name: 'Direct Observation', desc: 'Directly observed in the provided hackathon datasets without imputation.' },
    { code: 'Class B', name: 'Inferred Finding', desc: 'Statistically manipulated or modeled finding (e.g. cross-validated models).' },
    { code: 'Class C', name: 'Product Design Decision', desc: 'Architecture and principles formulated to bridge workforce intelligence to the marketplace.' },
    { code: 'Class D', name: 'Illustrative Prototype Data', desc: 'Synthetic worker profiles (W1-W6) constructed to demonstrate validation logic.' },
    { code: 'Class E', name: 'Future Operational Roadmap', desc: 'Learning loops, feedback calibration, and production ML pipelines post-pilot.' },
  ],
};
