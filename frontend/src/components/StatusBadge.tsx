import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status.toLowerCase().replace(/[\s-]/g, '_');
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  if (norm.includes('critical_shortage') || norm === 'critical') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
        Critical Shortage
      </span>
    );
  }

  if (norm.includes('high_shortage') || norm === 'high') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        High Shortage
      </span>
    );
  }

  if (norm.includes('balanced') || norm === 'optimal') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Balanced / Watch
      </span>
    );
  }

  if (norm.includes('high_oversupply')) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        High Oversupply
      </span>
    );
  }

  if (norm.includes('critical_oversupply')) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shadow-sm ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        Critical Oversupply
      </span>
    );
  }

  // Generic fallback
  return (
    <span className={`inline-flex items-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClasses}`}>
      {status}
    </span>
  );
};
