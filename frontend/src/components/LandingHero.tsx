import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, ShieldCheck, Navigation, ChevronDown, Activity, Sparkles, Cpu } from 'lucide-react';
import { CyberGridShader } from './CyberGridShader';

interface LandingHeroProps {
  onEnterDashboard: () => void;
  onQuickBuild10: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onEnterDashboard,
  onQuickBuild10
}) => {
  const [stage, setStage] = useState<number>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 300);
    const t2 = setTimeout(() => setStage(2), 1000);
    const t3 = setTimeout(() => setStage(3), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="relative w-full min-h-[560px] lg:min-h-[640px] rounded-3xl overflow-hidden border border-white/[0.08] bg-[#040608] p-6 lg:p-12 flex flex-col justify-between shadow-2xl">
      {/* 3D WebGL GLSL Shader Ambient Canvas */}
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
        <CyberGridShader className="w-full h-full" intensity={1.1} />
      </div>

      {/* Subtle radial vignettes to enhance typography legibility */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#040608]/60 to-[#040608]/90 pointer-events-none z-1" />

      {/* Top Tagline */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-4 h-4 text-black fill-black" />
          </div>
          <span className="font-mono-tech text-xs tracking-widest text-emerald-400 font-bold uppercase">
            PUNE · AUTONOMOUS SPATIAL INFRASTRUCTURE
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-mono-tech text-slate-300 glass-panel px-3 py-1.5 rounded-full border border-white/10 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-white font-semibold">1,354 OPERATIONAL STATIONS INDEXED</span>
        </div>
      </div>

      {/* Center Hero Titles */}
      <div className="relative z-10 max-w-4xl space-y-6 my-auto pt-4">
        <div className={`transition-all duration-700 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="text-xs font-mono-tech text-cyan-300 tracking-widest uppercase bg-cyan-950/40 px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-sm flex items-center gap-2 w-fit">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>T.Y. B.Tech CSE (AI & DS) · Data Visualization Using Python Capstone</span>
          </span>
        </div>

        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] transition-all duration-700 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          WHERE SHOULD PUNE BUILD ITS NEXT{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            10 CHARGING STATIONS?
          </span>
        </h1>

        <p className={`text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-sans transition-all duration-700 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          Pune's electric mobility adoption has surged past <strong>264,000 registered EVs</strong>, creating critical charging deserts along transit gateways.
          VoltPune combines <strong>1,354 BEE-verified stations</strong>, <strong>532.6 km of OSM arterial networks</strong>, and a <strong>greedy submodular spatial coverage engine</strong> to scientifically identify the 10 highest-impact infrastructure locations.
        </p>

        {/* Action Buttons */}
        <div className={`flex flex-wrap items-center gap-4 pt-3 transition-all duration-700 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={onEnterDashboard}
            className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold font-mono-tech text-xs tracking-wider shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span>LAUNCH 3D COMMAND PLATFORM</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onQuickBuild10}
            className="px-6 py-3.5 rounded-xl glass-panel-interactive text-white font-mono-tech font-semibold text-xs border border-white/15 flex items-center gap-2 cursor-pointer transition-all hover:border-emerald-400/50"
          >
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>SOLVE OPTIMAL 10 SITING</span>
          </button>
        </div>
      </div>

      {/* Bottom Proof Strip */}
      <div className="relative z-10 border-t border-white/[0.08] pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">GOVERNMENT REGISTER:</span>
          <span className="text-slate-200">Bureau of Energy Efficiency (BEE) · MoRTH VAHAN · PMC · OSM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500">SOLVER CONVERGENCE:</span>
          <span className="text-emerald-400 font-bold">+6.5% Citywide Catchment Expansion (83.5% → 90.0%)</span>
        </div>
      </div>
    </div>
  );
};
