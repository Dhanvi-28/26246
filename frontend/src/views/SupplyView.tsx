import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Award,
  CheckCircle2,
  Building2,
  TrendingUp,
  Info,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { SupplySummary } from '../types/api';
import { fetchSupplySummary } from '../lib/api';

interface SupplyViewProps {
  filterParams: Record<string, string>;
}

export const SupplyView: React.FC<SupplyViewProps> = ({ filterParams }) => {
  const [data, setData] = useState<SupplySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSupplySummary(filterParams)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [JSON.stringify(filterParams)]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-navy-900 border border-navy-800" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-navy-900 border border-navy-800" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center rounded-xl bg-navy-900 border border-navy-800 text-slate-400">
        No training ecosystem data found for selected filter scope.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Skilling Funnel Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Sanctioned Seats
          </span>
          <span className="text-xl font-extrabold font-mono text-white">
            {data.total_sanctioned_seats.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Approved Capacity</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Enrolments
          </span>
          <span className="text-xl font-extrabold font-mono text-sky-300">
            {data.total_enrolments.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Admitted Trainees</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Completions
          </span>
          <span className="text-xl font-extrabold font-mono text-gold-400">
            {data.total_completions.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Passed Exams</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Certified
          </span>
          <span className="text-xl font-extrabold font-mono text-emerald-400">
            {data.total_certified.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">NSQF Credentials</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Placed / Apprentices
          </span>
          <span className="text-xl font-extrabold font-mono text-purple-300">
            {data.total_placed.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Wage Verified</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Active Centres
          </span>
          <span className="text-xl font-extrabold font-mono text-slate-200">
            {data.active_centres.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">ITIs / NSTIs</span>
        </div>
      </div>

      {/* Funnel Efficiency Indicators & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Overall Completion Rate
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">
              {data.overall_completion_rate}%
            </span>
            <span className="text-xs text-slate-400">of enrolled trainees</span>
          </div>
          <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden border border-navy-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.overall_completion_rate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Measures institutional retention and candidate examination completion success.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-gold-400" /> Placement & Apprenticeship Rate
          </h3>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-gold-400">
              {data.overall_placement_rate}%
            </span>
            <span className="text-xs text-slate-400">of certified graduates</span>
          </div>
          <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden border border-navy-800">
            <div
              className="bg-gold-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${data.overall_placement_rate}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Tracks confirmed wage employment or registered apprenticeship within 90 days of certification.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-navy-900 to-navy-850 border border-gold-500/30 shadow-gold-glow space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-300">
            <Info className="w-4 h-4 text-gold-400" /> Sanctioned Capacity vs Effective Supply
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            A sanctioned seat does not equal a ready worker. In planning calculations, LMIS uses <strong>Estimated Effective Supply</strong>:
          </p>
          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 font-mono text-[11px] text-gold-300">
            S_eff = 0.85 × Completions + 0.15 × Placed
          </div>
          <p className="text-[11px] text-slate-400">
            This avoids assuming 100% seat conversion and provides realistic capacity benchmarking.
          </p>
        </div>
      </div>

      {/* Skilling Pipeline Trends Chart */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              Skilling Pipeline Funnel Over Time
            </h3>
            <p className="text-xs text-slate-400">
              Monthly distribution of training intake, graduations, and confirmed placements
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data.pipeline_trends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1528', borderColor: '#2A4E7F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="seats" name="Sanctioned Seats" fill="#1E3A5F" radius={[4, 4, 0, 0]} />
              <Bar dataKey="enrolments" name="Enrolments" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="completions" name="Completions" stroke="#F5A623" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="placed" name="Placed" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course / Occupation Capacity Matrix */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-gold-400" />
          Institutional Course Capacity by Trade
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                <th className="pb-3">Course / Trade</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3 text-right">Sanctioned Seats</th>
                <th className="pb-3 text-right">Enrolments</th>
                <th className="pb-3 text-right">Completions</th>
                <th className="pb-3 text-right">Placed</th>
                <th className="pb-3 text-right">Completion %</th>
                <th className="pb-3 text-right">Placement %</th>
                <th className="pb-3 text-right">Centres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {data.occupation_capacities.map((item) => (
                <tr key={item.occupation_id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 font-semibold text-white truncate max-w-[200px]" title={item.occupation_name}>
                    {item.occupation_name}
                  </td>
                  <td className="py-3 text-slate-300">{item.sector_name}</td>
                  <td className="py-3 text-right font-mono text-slate-200">{item.sanctioned_seats.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-sky-300">{item.enrolments.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-gold-400">{item.completions.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-emerald-400">{item.placed.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-slate-200">{item.completion_rate}%</td>
                  <td className="py-3 text-right font-mono font-bold text-gold-300">{item.placement_rate}%</td>
                  <td className="py-3 text-right font-mono text-slate-300">{item.active_centres}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
