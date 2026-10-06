import React from 'react';
import { Zap, ShieldCheck, Database, Sliders, Activity, Terminal, Radio } from 'lucide-react';

interface HeaderProps {
  onOpenMethodology: () => void;
  onOpenProvenance: () => void;
  onTriggerFlagshipBuild: () => void;
  isOptimizing: boolean;
  activeTargetCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMethodology,
  onOpenProvenance,
  onTriggerFlagshipBuild,
  isOptimizing,
  activeTargetCount = 10
}) => {
  return (
    <header className="w-full bg-[#040608]/90 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 py-3.5 sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Brand & Mission Tag */}
      <div className="flex items-center gap-3.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/20">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#040608] animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-black text-white tracking-wider flex items-center gap-2 font-mono-tech">
              VOLTPUNE
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 tracking-widest uppercase">
                3D COMMAND
              </span>
            </h1>
            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/10 font-mono-tech">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>1,354 BEE REGISTERED PCS (OCT 2025)</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono-tech flex items-center gap-2">
            <span>T.Y. B.Tech CSE (AI & DS) · Spatial Multi-Criteria Optimization</span>
            <span className="text-slate-600 hidden sm:inline">/</span>
            <span className="text-cyan-400 hidden sm:inline">MCLP Submodular Solver</span>
          </p>
        </div>
      </div>

      {/* Action Controls & Documentation Access */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Flagship Build 10 Stations Button */}
        <button
          onClick={onTriggerFlagshipBuild}
          disabled={isOptimizing}
          className="relative group overflow-hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black text-xs font-bold font-mono-tech tracking-wide shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          <Activity className={`w-3.5 h-3.5 fill-black ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'SOLVING SITING MODEL...' : `SOLVE OPTIMAL ${activeTargetCount} HUBS`}</span>
        </button>

        {/* Methodology Modal */}
        <button
          onClick={onOpenMethodology}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-mono-tech border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
          title="Inspect Mathematical Formulation & Viva Proofs"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Methodology</span>
        </button>

        {/* Provenance Modal */}
        <button
          onClick={onOpenProvenance}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-mono-tech border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer shadow-sm"
          title="Inspect Government Data Registry & Schemas"
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Data Sources</span>
        </button>

        {/* GitHub Shortcut */}
        <a
          href="https://github.com/harshvshah12/pune-ev-charging-intelligence"
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/10 transition-all cursor-pointer"
          title="Open GitHub Repository"
        >
          <svg className="w-4 h-4 fill-currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        </a>
      </div>
    </header>
  );
};
