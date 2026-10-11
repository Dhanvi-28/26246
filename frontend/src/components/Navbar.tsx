import React from 'react';
import { Database, RefreshCw, BookOpen, ShieldCheck, Cpu } from 'lucide-react';

interface NavbarProps {
  onResetDemo: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onResetDemo, isResetting }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-navy-700/80 bg-navy-900/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow">
            <Cpu className="w-5 h-5 text-navy-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                NATIONAL <span className="gold-gradient-text">LMIS</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-navy-800 text-gold-300 border border-gold-500/30">
                v1.2 Decision Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Ministry of Skill Development & Entrepreneurship • Analytical Forecasting Portal
            </p>
          </div>
        </div>

        {/* Status Indicators & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Demo Data Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/40 text-gold-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
            <span>Pilot Dataset Active</span>
          </div>

          {/* Connected Data Stream Badge */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NCVET & NCS Verified</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemo}
            disabled={isResetting}
            title="Reset and reseed synthetic pilot dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white border border-navy-700 hover:border-gold-500/40 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-gold-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Reset Pilot Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
