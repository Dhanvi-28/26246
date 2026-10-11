import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Briefcase,
  Users,
  Search,
  ExternalLink,
  X,
  FileCheck2,
  Tag,
  BarChart3,
  Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { DemandTrendItem, DemandSectorBreakdown, OccupationDemandItem } from '../types/api';
import { fetchDemandTrends, fetchDemandBySector, fetchDemandOccupations, fetchOccupationDetail } from '../lib/api';

interface DemandViewProps {
  filterParams: Record<string, string>;
}

export const DemandView: React.FC<DemandViewProps> = ({ filterParams }) => {
  const [trends, setTrends] = useState<DemandTrendItem[]>([]);
  const [sectors, setSectors] = useState<DemandSectorBreakdown[]>([]);
  const [occupations, setOccupations] = useState<OccupationDemandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOccupationId, setSelectedOccupationId] = useState<string | null>(null);
  const [occupationDetail, setOccupationDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetchDemandTrends(filterParams),
      fetchDemandBySector(filterParams),
      fetchDemandOccupations(filterParams),
    ])
      .then(([tData, sData, oData]) => {
        if (!mounted) return;
        setTrends(tData);
        setSectors(sData);
        setOccupations(oData);
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

  const handleOpenDetail = (id: string) => {
    setSelectedOccupationId(id);
    setDetailLoading(true);
    fetchOccupationDetail(id)
      .then((res) => {
        setOccupationDetail(res);
        setDetailLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDetailLoading(false);
      });
  };

  const filteredOccupations = occupations.filter((o) =>
    o.occupation_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.sector_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.nco_code && o.nco_code.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 rounded-xl bg-navy-900 border border-navy-800" />
        <div className="h-80 rounded-xl bg-navy-900 border border-navy-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gold-400" />
                Aggregated Recruitment Postings & Labour Demand Index
              </h3>
              <p className="text-xs text-slate-400">
                Monthly trend of active recruitment postings and computed LDI intensity score
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#38BDF8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#F5A623" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1528', borderColor: '#2A4E7F', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="job_postings_count"
                  name="Job Postings"
                  stroke="#38BDF8"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="ldi_score"
                  name="LDI Score (0-100)"
                  stroke="#F5A623"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Distribution */}
        <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-gold-400" />
              Sector Hiring Intensity
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Deduplicated recruitment postings by industrial sector
            </p>

            <div className="space-y-3">
              {sectors.map((s, idx) => (
                <div key={s.sector_id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200 truncate max-w-[70%]">{s.sector_name}</span>
                    <span className="font-mono text-gold-400 font-bold">{s.postings_count.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-gold-400 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (s.postings_count / (sectors[0]?.postings_count || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Occupations Table */}
      <div className="p-5 rounded-xl bg-navy-900/90 border border-navy-800 shadow-navy-card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gold-400" />
              Occupation-Level Demand Signals
            </h3>
            <p className="text-xs text-slate-400">
              Granular recruitment velocity, NCO 2015 codes, and computed demand scores
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by trade or NCO code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-navy-950 border border-navy-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-navy-800 text-slate-400 font-semibold">
                <th className="pb-3">Occupation / Trade</th>
                <th className="pb-3">NCO 2015 Code</th>
                <th className="pb-3">Sector</th>
                <th className="pb-3 text-right">Postings</th>
                <th className="pb-3 text-right">Unique Employers</th>
                <th className="pb-3 text-right">LDI Index</th>
                <th className="pb-3 text-right">Growth %</th>
                <th className="pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {filteredOccupations.map((occ) => (
                <tr key={occ.occupation_id} className="hover:bg-navy-800/40 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    {occ.occupation_name}
                  </td>
                  <td className="py-3 text-slate-300 font-mono">
                    <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-gold-300 text-[11px]">
                      {occ.nco_code || 'Unmapped'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">{occ.sector_name}</td>
                  <td className="py-3 text-right font-mono text-slate-200">{occ.postings_count.toLocaleString()}</td>
                  <td className="py-3 text-right font-mono text-slate-200">{occ.unique_employers}</td>
                  <td className="py-3 text-right font-mono font-bold text-gold-400">{occ.ldi_score}</td>
                  <td className="py-3 text-right font-mono text-emerald-400">+{occ.growth_rate_pct}%</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => handleOpenDetail(occ.occupation_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-navy-800 hover:bg-gold-500/20 text-gold-300 hover:text-gold-200 border border-navy-700 hover:border-gold-500/40 text-xs font-medium transition-colors"
                    >
                      Audit <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupation Detail Drawer / Modal */}
      {selectedOccupationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-gold-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedOccupationId(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white bg-navy-800"
            >
              <X className="w-5 h-5" />
            </button>

            {detailLoading || !occupationDetail ? (
              <div className="p-8 text-center text-slate-400">Loading occupational audit details...</div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold-400 uppercase tracking-wider">
                    <FileCheck2 className="w-4 h-4" /> NCVET / NCO Occupational Alignment
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    {occupationDetail.occupation.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {occupationDetail.occupation.description}
                  </p>
                </div>

                {/* Audit Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">NCO 2015 Code</span>
                    <span className="font-mono text-xs font-bold text-gold-300">{occupationDetail.occupation.nco_code}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">NSQF Level</span>
                    <span className="font-mono text-xs font-bold text-sky-300">Level {occupationDetail.occupation.nsqf_level}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Mapping Status</span>
                    <span className="text-xs font-semibold text-emerald-400">Verified</span>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
                    <span className="text-[10px] uppercase text-slate-500 font-bold block">Last Audit</span>
                    <span className="text-xs text-slate-300">2025-12-15</span>
                  </div>
                </div>

                {/* Competency Skills Tags */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-gold-400" /> Curricular Competency Units & Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {occupationDetail.key_skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-navy-800 text-slate-200 border border-navy-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Top Employing Districts */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <Building className="w-3.5 h-3.5 text-gold-400" /> Top Demand Hubs (Districts)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {occupationDetail.top_districts.map((d: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-xs text-white">{d.district_name}</p>
                          <p className="text-[10px] text-slate-400">{d.state_name}</p>
                        </div>
                        <span className="font-mono text-xs font-bold text-gold-400">{d.postings}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
