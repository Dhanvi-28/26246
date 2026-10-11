import React, { useState, useEffect } from 'react';
import {
  Target,
  Download,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  Cpu,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';
import { GapRankingItem, ForecastEvaluation } from '../types/api';
import { fetchGapRankings, fetchForecastEvaluation } from '../lib/api';
import { StatusBadge } from '../components/StatusBadge';

interface ForecastViewProps {
  filterParams: Record<string, string>;
  horizonMonths: number;
  onHorizonChange: (h: number) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  filterParams,
  horizonMonths,
  onHorizonChange,
}) => {
  const [rankings, setRankings] = useState<GapRankingItem[]>([]);
  const [evaluation, setEvaluation] = useState<ForecastEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const params: Record<string, string> = { ...filterParams, horizon_months: String(horizonMonths) };
    if (severityFilter) params.severity = severityFilter;

    Promise.all([
      fetchGapRankings(params),
      fetchForecastEvaluation(),
    ])
      .then(([rData, eData]) => {
        if (!mounted) return;
        setRankings(rData);
        setEvaluation(eData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filterParams), horizonMonths, severityFilter]);

  const filteredRankings = rankings.filter((r) =>
    r.occupation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.district_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.sector_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadGaps = () => {
    const qs = new URLSearchParams({
      horizon_months: String(horizonMonths),
      ...(filterParams.state_code ? { state_code: filterParams.state_code } : {}),
      ...(filterParams.district_code ? { district_code: filterParams.district_code } : {}),
    }).toString();
    window.open(`/api/v1/exports/gaps.csv?${qs}`, '_blank');
  };

  const handleDownloadForecasts = () => {
    const qs = new URLSearchParams({
      horizon_months: String(horizonMonths),
      ...(filterParams.state_code ? { state_code: filterParams.state_code } : {}),
      ...(filterParams.district_code ? { district_code: filterParams.district_code } : {}),
    }).toString();
    window.open(`/api/v1/exports/forecasts.csv?${qs}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-xl bg-navy-900 border border-navy-800" />
        <div className="h-96 rounded-xl bg-navy-900 border border-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Performance & Chronological Validation Card */}
      {evaluation && (
        <div className="p-5 rounded-xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 shadow-navy-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-gold-400" />
                <span className="font-bold text-sm text-white">{evaluation.model_name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-navy-800 text-gold-300 border border-navy-700">
                  {evaluation.model_version}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                {evaluation.validation_method}
              </p>
            </div>

            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-navy-800 pt-3 sm:pt-0 sm:pl-6">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Overall MAE</span>
                <span className="font-mono text-sm font-bold text-white">{evaluation.mae_overall}</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold block">WAPE Error</span>
                <span className="font-mono text-sm font-bold text-sky-400">{(evaluation.wape_overall * 100).toFixed(1)}%</span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold block">vs Naive Baseline</span>
                <span className="font-mono text-sm font-bold text-emerald-400">+{evaluation.improvement_over_baseline_pct}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Ranking Table Card */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-gold-400" />
              Demand-Supply Gap Matrix ({horizonMonths} Months Horizon)
            </h3>

            {/* Horizon Selector */}
            <div className="inline-flex rounded-lg bg-navy-950 p-1 border border-navy-800">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => onHorizonChange(m)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    horizonMonths === m
                      ? 'bg-gold-500 text-navy-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}M Projection
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search trade or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-gold-500"
            >
              <option value="">All Severities</option>
              <option value="critical_shortage">Critical Shortage</option>
              <option value="high_shortage">High Shortage</option>
              <option value="balanced">Balanced</option>
              <option value="high_oversupply">High Oversupply</option>
              <option value="critical_oversupply">Critical Oversupply</option>
            </select>

            {/* Export Buttons */}
            <button
              onClick={handleDownloadGaps}
              title="Download filtered gaps CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-gold-500/20 text-gold-300 border border-navy-700 hover:border-gold-500/40 text-xs font-medium transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-gold-400" />
              <span>Export Gaps CSV</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                <th className="pb-3">Occupation / Trade</th>
                <th className="pb-3">Geography</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3 text-right">Projected Demand</th>
                <th className="pb-3 text-right">Effective Supply</th>
                <th className="pb-3 text-right">Net Gap</th>
                <th className="pb-3 text-right">Gap Rate %</th>
                <th className="pb-3 text-center">Severity</th>
                <th className="pb-3 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No trade gap records matching current filters.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((row) => {
                  const isShortage = row.gap > 0;
                  const isBalanced = row.severity === 'balanced';
                  return (
                    <tr key={row.id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="py-3 font-semibold text-white truncate max-w-[200px]" title={row.occupation_name}>
                        {row.occupation_name}
                      </td>
                      <td className="py-3 text-slate-300">
                        {row.district_name}, {row.state_code}
                      </td>
                      <td className="py-3 text-slate-400">{row.sector_name}</td>
                      <td className="py-3 text-right font-mono text-slate-200">
                        {Math.round(row.forecast_demand)}
                      </td>
                      <td className="py-3 text-right font-mono text-slate-200">
                        {Math.round(row.effective_supply)}
                      </td>
                      <td
                        className={`py-3 text-right font-mono font-bold ${
                          isBalanced
                            ? 'text-emerald-400'
                            : isShortage
                            ? 'text-rose-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {isShortage ? `+${Math.round(row.gap)}` : Math.round(row.gap)}
                      </td>
                      <td
                        className={`py-3 text-right font-mono font-bold ${
                          isBalanced
                            ? 'text-emerald-400'
                            : isShortage
                            ? 'text-rose-400'
                            : 'text-purple-400'
                        }`}
                      >
                        {row.gap_rate > 0 ? `+${row.gap_rate}%` : `${row.gap_rate}%`}
                      </td>
                      <td className="py-3 text-center">
                        <StatusBadge status={row.severity} size="sm" />
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            row.confidence === 'High'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : row.confidence === 'Moderate'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {row.confidence}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
