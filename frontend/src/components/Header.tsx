import React from 'react';
import { Zap, ShieldCheck, Database, Sliders, FileText, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenMethodology: () => void;
  onOpenProvenance: () => void;
  onTriggerFlagshipBuild: () => void;
  isOptimizing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMethodology,
  onOpenProvenance,
  onTriggerFlagshipBuild,
  isOptimizing
}) => {
  return (
    <header className="w-full bg-[#070a11]/90 backdrop-blur-md border-b border-white/10 px-4 lg:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
      {/* Brand & Academic Project Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Zap className="w-6 h-6 text-black fill-black" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              VOLTPUNE <span className="text-xs px-2 py-0.5 rounded font-mono-tech bg-white/10 text-emerald-400 font-normal">v1.0 DVP</span>
            </h1>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono-tech">
              BEE OFFICIAL DATA (OCT 2025)
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Pune Electric Mobility Infrastructure & Optimal Station Placement Engine · T.Y. B.Tech CSE (AI & DS)
          </p>
        </div>
      </div>

      {/* Action Controls & Methodology Modals */}
      <div className="flex items-center flex-wrap gap-2">
        <button
          onClick={onTriggerFlagshipBuild}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Activity className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing 10 Stations...' : 'Build 10 Stations'}</span>
        </button>

        <button
          onClick={onOpenMethodology}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Methodology</span>
        </button>

        <button
          onClick={onOpenProvenance}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Data Sources</span>
        </button>
      </div>
    </header>
  );
};
