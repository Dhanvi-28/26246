import React from 'react';
import {
  TrendingUp,
  GraduationCap,
  Users,
  AlertTriangle,
  CheckCircle,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { OverviewData } from '../types/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';

interface OverviewViewProps {
  data: OverviewData | null;
  loading: boolean;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  data,
  loading,
  onNavigateToTab,
}) => {
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-navy-900 border border-navy-800" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-navy-900 border border-navy-800" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center rounded-xl bg-navy-900 border border-navy-800 text-slate-400">
        No overview data found for selected filter scope. Try clearing or expanding filters.
      </div>
    );
  }

  const { kpis, gap_distribution, trend_history, top_shortages, top_oversupplies, insight_summary } = data;

  // Format data for severity bar chart
  const severityChartData = [
    { name: 'Critical Shortage', count: gap_distribution.critical_shortage, color: '#F43F5E' },
    { name: 'High Shortage', count: gap_distribution.high_shortage, color: '#F59E0B' },
    { name: 'Balanced', count: gap_distribution.balanced, color: '#10B981' },
    { name: 'High Oversupply', count: gap_distribution.high_oversupply, color: '#8B5CF6' },
    { name: 'Critical Oversupply', count: gap_distribution.critical_oversupply, color: '#6366F1' },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Labour Demand Index"
          value={`${kpis.ldi_score} / 100`}
          subtitle="Multi-signal recruitment pressure"
          change={`+${kpis.ldi_trend_pct}% MoM`}
          isPositiveChange={true}
          icon={Activity}
          goldAccent={true}
          tooltip="Aggregates deduplicated postings (50%), growth (25%), employer diversity (15%), and vacancies (10%)."
        />

        <MetricCard
          title="Sanctioned Seats"
          value={kpis.training_seats.toLocaleString()}
          subtitle="Approved training intake"
          icon={GraduationCap}
          tooltip="Total sanctioned institutional seats across ITIs, NSTIs, and PMKVY centres."
        />

        <MetricCard
          title="Effective Supply"
          value={kpis.effective_supply.toLocaleString()}
          subtitle="Est. graduating candidates"
          icon={Users}
          tooltip="Weighted estimate: 85% course completions + 15% placement outcomes."
        />

        <MetricCard
          title="Shortage Risks"
          value={kpis.shortage_occupations_count}
          subtitle="Demand outstrips supply"
          change="Needs Intervention"
          isPositiveChange={false}
          icon={AlertTriangle}
          tooltip="Occupations where demand exceeds effective supply by >= 15%."
        />

        <MetricCard
          title="Oversupply Risks"
          value={kpis.oversupply_occupations_count}
          subtitle="Supply exceeds demand"
          change="Curriculum Review"
          isPositiveChange={true}
          icon={Layers}
          tooltip="Occupations where trained supply exceeds local demand by >= 15%."
        />
      </div>

      {/* Analytical Insight Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-gold-500/30 flex items-start gap-3 shadow-gold-glow">
        <Info className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gold-300">
            Labour Market Intelligence Synthesis
          </h4>
          <p className="mt-1 text-xs text-slate-200 leading-relaxed">
            {insight_summary}
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand & Forecast Trend with Interval Bands */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                Labour Demand & Forecast Trajectory
              </h3>
              <p className="text-xs text-slate-400">
                Observed historical demand vs. 2026 forecast with 80% prediction interval
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Observed Demand
              </span>
              <span className="flex items-center gap-1.5 text-gold-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-gold-400" /> 2026 Projection
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Effective Supply
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={trend_history} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1528', borderColor: '#2A4E7F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                {/* Historical Observed Demand */}
                <Line
                  type="monotone"
                  dataKey="observed_demand"
                  name="Observed Demand"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38BDF8' }}
                  connectNulls
                />
                {/* 2026 Forecast Projection Line */}
                <Line
                  type="monotone"
                  dataKey="forecast_demand"
                  name="Forecasted Demand"
                  stroke="#F5A623"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 5, fill: '#F5A623' }}
                  connectNulls
                />
                {/* Upper and Lower Prediction Intervals */}
                <Area
                  type="monotone"
                  dataKey="upper_bound"
                  name="Upper Interval"
                  stroke="transparent"
                  fill="#F5A623"
                  fillOpacity={0.12}
                  connectNulls
                />
                <Area
                  type="monotone"
                  dataKey="lower_bound"
                  name="Lower Interval"
                  stroke="transparent"
                  fill="#0B1528"
                  fillOpacity={0.8}
                  connectNulls
                />
                {/* Effective Supply Line */}
                <Line
                  type="monotone"
                  dataKey="effective_supply"
                  name="Effective Supply"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-gold-400" />
              Gap Risk Distribution
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of trades by shortage and oversupply severity
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityChartData} layout="vertical" margin={{ top: 5, right: 15, left: 35, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B1528', borderColor: '#2A4E7F', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {severityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Want to see all trade rankings?</span>
            <button
              onClick={() => onNavigateToTab('forecast')}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
            >
              View Gap Matrix <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Top Shortage and Oversupply Priority Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Shortages */}
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Priority Workforce Shortages
              </h3>
              <p className="text-xs text-slate-400">Demand exceeds current effective training pipeline</p>
            </div>
            <button
              onClick={() => onNavigateToTab('recommendations')}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
            >
              Take Action <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Occupation / Trade</th>
                  <th className="pb-2.5">District</th>
                  <th className="pb-2.5 text-right">Demand</th>
                  <th className="pb-2.5 text-right">Supply</th>
                  <th className="pb-2.5 text-right">Deficit</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {top_shortages.map((item, idx) => (
                  <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-2.5 pr-2 font-medium text-slate-100 truncate max-w-[160px]" title={item.occupation_name}>
                      {item.occupation_name}
                      <span className="block text-[10px] text-slate-400">{item.sector_name}</span>
                    </td>
                    <td className="py-2.5 text-slate-300">{item.district_name}</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">{Math.round(item.demand)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">{Math.round(item.supply)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-rose-400">
                      +{Math.round(item.gap)}
                    </td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={item.severity} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Oversupply */}
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Workforce Oversupply & Surplus Intake
              </h3>
              <p className="text-xs text-slate-400">Training capacity exceeds absorbed hiring signals</p>
            </div>
            <button
              onClick={() => onNavigateToTab('scenarios')}
              className="text-xs text-gold-400 hover:text-gold-300 font-semibold flex items-center gap-1"
            >
              Simulate Adjustment <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Occupation / Trade</th>
                  <th className="pb-2.5">District</th>
                  <th className="pb-2.5 text-right">Demand</th>
                  <th className="pb-2.5 text-right">Supply</th>
                  <th className="pb-2.5 text-right">Surplus</th>
                  <th className="pb-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-850">
                {top_oversupplies.map((item, idx) => (
                  <tr key={idx} className="hover:bg-navy-800/40 transition-colors">
                    <td className="py-2.5 pr-2 font-medium text-slate-100 truncate max-w-[160px]" title={item.occupation_name}>
                      {item.occupation_name}
                      <span className="block text-[10px] text-slate-400">{item.sector_name}</span>
                    </td>
                    <td className="py-2.5 text-slate-300">{item.district_name}</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">{Math.round(item.demand)}</td>
                    <td className="py-2.5 text-right font-mono text-slate-200">{Math.round(item.supply)}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-purple-400">
                      {Math.round(item.gap)}
                    </td>
                    <td className="py-2.5 text-right">
                      <StatusBadge status={item.severity} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
