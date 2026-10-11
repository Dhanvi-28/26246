import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositiveChange?: boolean;
  icon: LucideIcon;
  tooltip?: string;
  goldAccent?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositiveChange,
  icon: Icon,
  tooltip,
  goldAccent = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl p-5 transition-all duration-200 border ${
        goldAccent
          ? 'bg-gradient-to-br from-navy-850 to-navy-900 border-gold-500/50 shadow-gold-glow'
          : 'bg-navy-900/90 border-navy-700/60 hover:border-gold-500/30 shadow-navy-card'
      }`}
      title={tooltip}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
            {title}
            {tooltip && (
              <span className="cursor-help text-gold-400/80 hover:text-gold-300 text-[10px]" title={tooltip}>
                ⓘ
              </span>
            )}
          </p>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
            {goldAccent ? <span className="gold-gradient-text">{value}</span> : value}
          </div>
        </div>
        <div
          className={`p-2.5 rounded-lg border ${
            goldAccent
              ? 'bg-gold-500/10 border-gold-500/30 text-gold-400'
              : 'bg-navy-800 border-navy-700 text-sky-400'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400 truncate max-w-[70%]">{subtitle}</span>}
          {change && (
            <span
              className={`font-medium px-1.5 py-0.5 rounded text-[11px] ${
                isPositiveChange
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/70 text-rose-300 border border-rose-500/30'
              }`}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
