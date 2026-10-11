import React from 'react';
import { Filter, X, Calendar, MapPin, Briefcase, Award } from 'lucide-react';
import { FilterMetadata } from '../types/api';

export interface FilterState {
  state_code: string;
  district_code: string;
  sector_id: string;
  occupation_id: string;
  horizon_months: number;
}

interface FilterBarProps {
  filters: FilterState;
  metadata: FilterMetadata | null;
  onFilterChange: (key: keyof FilterState, val: string | number) => void;
  onClearFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  metadata,
  onFilterChange,
  onClearFilters,
}) => {
  // Cascading districts based on selected state
  const availableDistricts = React.useMemo(() => {
    if (!metadata) return [];
    if (!filters.state_code) {
      return metadata.states.flatMap((s) => s.districts);
    }
    const st = metadata.states.find((s) => s.code === filters.state_code);
    return st ? st.districts : [];
  }, [metadata, filters.state_code]);

  // Active filter count
  const activeCount = [
    filters.state_code,
    filters.district_code,
    filters.sector_id,
    filters.occupation_id,
  ].filter(Boolean).length;

  return (
    <div className="w-full bg-navy-900/90 border border-navy-700/60 rounded-xl p-3 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-navy-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
          <Filter className="w-4 h-4 text-gold-400" />
          <span>Analytical Scope Filters</span>
          {activeCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[10px]">
              {activeCount} Active
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-gold-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* State Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gold-400" /> State
          </label>
          <select
            value={filters.state_code}
            onChange={(e) => {
              onFilterChange('state_code', e.target.value);
              onFilterChange('district_code', ''); // Reset dependent district
            }}
            className="w-full bg-navy-950 border border-navy-700 hover:border-navy-600 focus:border-gold-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="">All States (National View)</option>
            {metadata?.states.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter (Cascading) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-gold-400" /> District
          </label>
          <select
            value={filters.district_code}
            onChange={(e) => onFilterChange('district_code', e.target.value)}
            disabled={availableDistricts.length === 0}
            className="w-full bg-navy-950 border border-navy-700 hover:border-navy-600 focus:border-gold-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none transition-colors disabled:opacity-50"
          >
            <option value="">All Districts</option>
            {availableDistricts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-gold-400" /> Sector
          </label>
          <select
            value={filters.sector_id}
            onChange={(e) => onFilterChange('sector_id', e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 hover:border-navy-600 focus:border-gold-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="">All Sectors</option>
            {metadata?.sectors.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Occupation Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-gold-400" /> Occupation / Trade
          </label>
          <select
            value={filters.occupation_id}
            onChange={(e) => onFilterChange('occupation_id', e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 hover:border-navy-600 focus:border-gold-500 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none transition-colors"
          >
            <option value="">All Occupations</option>
            {metadata?.occupations
              .filter((o) => !filters.sector_id || o.sector_id === filters.sector_id)
              .map((occ) => (
                <option key={occ.id} value={occ.id}>
                  {occ.name}
                </option>
              ))}
          </select>
        </div>

        {/* Forecast Horizon Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gold-400" /> Forecast Horizon
          </label>
          <div className="grid grid-cols-3 gap-1 bg-navy-950 p-1 rounded-lg border border-navy-700">
            {[3, 6, 12].map((m) => (
              <button
                key={m}
                onClick={() => onFilterChange('horizon_months', m)}
                className={`py-1 text-xs font-semibold rounded transition-colors text-center ${
                  filters.horizon_months === m
                    ? 'bg-gold-500 text-navy-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m}M
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
