import React from 'react';
import {
  FileText,
  Activity,
  GraduationCap,
  Target,
  Cpu,
  ShieldCheck,
  Scale,
  CheckCircle2,
  Info
} from 'lucide-react';

export const MethodologyView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 shadow-navy-card">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-gold-400" />
          Analytical Methodology & Computational Formulas
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          Full mathematical transparency, feature weights, error metrics, and statistical definitions powering the National Labour Market Intelligence System (LMIS).
        </p>
      </div>

      {/* Section 1: LDI Calculation */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
          <Activity className="w-4 h-4 text-gold-400" />
          <h4 className="text-sm font-bold text-white">1. Labour Demand Index (LDI) Normalisation</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Aggregated online postings cannot be treated directly as official employment headcounts due to multi-platform duplication and variable regional internet penetration. The LMIS synthesizes an index score on a 0–100 scale:
        </p>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 font-mono text-xs text-gold-300 overflow-x-auto">
          LDI = 0.50 × Postings_norm + 0.25 × Growth_norm + 0.15 × Employer_norm + 0.10 × Vacancy_norm
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-bold text-white block">Postings Volume (50%)</span>
            <span className="text-slate-400">Deduplicated active recruitment advertisements indexed against peer baseline.</span>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-bold text-white block">Growth Velocity (25%)</span>
            <span className="text-slate-400">3-month rolling growth rate mapped from [-20%, +20%] to [0, 100].</span>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-bold text-white block">Employer Breadth (15%)</span>
            <span className="text-slate-400">Unique enterprise hiring count, preventing single-firm surges from skewing the market indicator.</span>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 space-y-1">
            <span className="font-bold text-white block">Vacancy Expansion (10%)</span>
            <span className="text-slate-400">Ratio of verified open positions relative to raw postings.</span>
          </div>
        </div>
      </div>

      {/* Section 2: Effective Supply Derivation */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
          <GraduationCap className="w-4 h-4 text-gold-400" />
          <h4 className="text-sm font-bold text-white">2. Training Supply & Estimated Effective Supply</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Sanctioned seats represent approved institutional intake, not graduating candidates entering the labour market. The engine tracks 5 separate stages:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
            <span className="font-bold text-slate-300 block">Sanctioned</span>
            <span className="text-[10px] text-slate-500">Intake capacity</span>
          </div>
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
            <span className="font-bold text-sky-400 block">Enrolments</span>
            <span className="text-[10px] text-slate-500">Admitted candidates</span>
          </div>
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
            <span className="font-bold text-gold-400 block">Completions</span>
            <span className="text-[10px] text-slate-500">Course graduates</span>
          </div>
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
            <span className="font-bold text-emerald-400 block">Certified</span>
            <span className="text-[10px] text-slate-500">NSQF credentialed</span>
          </div>
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
            <span className="font-bold text-purple-400 block">Placed</span>
            <span className="text-[10px] text-slate-500">Wage employed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 font-mono text-xs text-gold-300 overflow-x-auto">
          Effective_Supply = 0.85 × Completions + 0.15 × Placed_Candidates
        </div>
      </div>

      {/* Section 3: Demand-Supply Gap Formulation */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
          <Target className="w-4 h-4 text-gold-400" />
          <h4 className="text-sm font-bold text-white">3. Gap Formulation & Severity Categorization</h4>
        </div>

        <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 font-mono text-xs text-gold-300 space-y-1">
          <div>Gap = Forecast_Demand - Effective_Supply</div>
          <div>Gap_Rate (%) = (Gap / max(Forecast_Demand, 1.0)) × 100%</div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-rose-300">Critical Shortage:</span>
              <span className="text-slate-300 ml-1.5">Gap Rate ≥ +30%</span>
            </div>
            <span className="text-[11px] text-rose-400">Immediate expansion required</span>
          </div>

          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-300">High Shortage:</span>
              <span className="text-slate-300 ml-1.5">+15% ≤ Gap Rate &lt; +30%</span>
            </div>
            <span className="text-[11px] text-amber-400">Shortage watch; review centre capacity</span>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-emerald-300">Balanced / Watch:</span>
              <span className="text-slate-300 ml-1.5">-15% ≤ Gap Rate &lt; +15%</span>
            </div>
            <span className="text-[11px] text-emerald-400">Healthy market alignment</span>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-900/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-purple-300">High Oversupply:</span>
              <span className="text-slate-300 ml-1.5">-30% &lt; Gap Rate ≤ -15%</span>
            </div>
            <span className="text-[11px] text-purple-400">Surplus caution; monitor placements</span>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between">
            <div>
              <span className="font-bold text-indigo-300">Critical Oversupply:</span>
              <span className="text-slate-300 ml-1.5">Gap Rate ≤ -30%</span>
            </div>
            <span className="text-[11px] text-indigo-400">Rationalise intake; diversify curriculum</span>
          </div>
        </div>
      </div>

      {/* Section 4: Forecasting Engine */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
          <Cpu className="w-4 h-4 text-gold-400" />
          <h4 className="text-sm font-bold text-white">4. Forecasting Engine & Chronological Backtesting</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Forecasting uses scikit-learn Ridge Lag Regression and chronological time-series splitting:
        </p>

        <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
          <li><strong>Chronological Splits:</strong> Training strictly on historical periods without future information leakage.</li>
          <li><strong>Lag Features:</strong> Incorporates $t-1, t-2, t-3$ demand observations and 3-month moving averages.</li>
          <li><strong>Evaluation Metrics:</strong> Validated via Mean Absolute Error (MAE) and Weighted Absolute Percentage Error (WAPE).</li>
          <li><strong>Prediction Intervals:</strong> 80% empirical intervals computed from backtest residual standard deviation.</li>
        </ul>
      </div>

      {/* Section 5: Data Provenance Disclaimer */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-navy-800">
          <ShieldCheck className="w-4 h-4 text-gold-400" />
          <h4 className="text-sm font-bold text-white">5. Pilot Data Disclaimer & Governance</h4>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Current prototype records for Karnataka, Maharashtra, and Tamil Nadu pilot districts are generated from a deterministic synthetic benchmark dataset designed for stress testing, analytical verification, and prototype demonstration. When live feeds from NCS, NCVET, and PLFS are enabled via their canonical adapters, the computational engine operates identically on official administrative feeds.
        </p>
      </div>
    </div>
  );
};
