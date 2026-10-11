import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Database,
  FileText
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'demand'
  | 'supply'
  | 'forecast'
  | 'alerts'
  | 'recommendations'
  | 'scenarios'
  | 'data-management'
  | 'methodology';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, alertCount = 0 }) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.FC<any>; badge?: number }> = [
    { id: 'overview', label: 'Overview Dashboard', icon: LayoutDashboard },
    { id: 'demand', label: 'Demand Intelligence', icon: TrendingUp },
    { id: 'supply', label: 'Supply & Training', icon: GraduationCap },
    { id: 'forecast', label: 'Forecasts & Gaps', icon: Target },
    { id: 'alerts', label: 'Early Warnings', icon: AlertTriangle, badge: alertCount },
    { id: 'recommendations', label: 'Recommendations', icon: CheckCircle2 },
    { id: 'scenarios', label: 'Scenario Planner', icon: Sliders },
    { id: 'data-management', label: 'Data Sources & Imports', icon: Database },
    { id: 'methodology', label: 'Methodology & Audit', icon: FileText },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-navy-800 bg-navy-950/80 backdrop-blur-md flex flex-col justify-between p-4 hidden md:flex min-h-[calc(100vh-61px)]">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Analytical Modules
          </p>
          <nav className="mt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-navy-800 to-navy-850 text-gold-300 border border-gold-500/40 shadow-sm shadow-gold-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-navy-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-gold-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl p-3 bg-navy-900/60 border border-navy-800 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Target Horizon</span>
          <span className="text-gold-400 font-mono">Q1–Q4 2026</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          National aggregate to district-level demand-supply intelligence engine.
        </p>
      </div>
    </aside>
  );
};
