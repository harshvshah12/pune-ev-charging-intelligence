import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight, ShieldCheck, Navigation, ChevronDown, Activity } from 'lucide-react';

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
    const t1 = setTimeout(() => setStage(1), 600);
    const t2 = setTimeout(() => setStage(2), 1600);
    const t3 = setTimeout(() => setStage(3), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="relative w-full min-h-[550px] lg:min-h-[620px] rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#070a11] via-[#0b101c] to-[#070a11] p-6 lg:p-12 flex flex-col justify-between shadow-2xl">
      {/* Background Graphic Grid / Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tagline */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Zap className="w-5 h-5 text-black fill-black" />
          </div>
          <span className="font-mono-tech text-xs tracking-widest text-emerald-400 font-bold uppercase">
            PUNE · ELECTRIC MOBILITY INTELLIGENCE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>1,354 OPERATIONAL STATIONS INDEXED</span>
        </div>
      </div>

      {/* Center Hero Titles */}
      <div className="relative z-10 max-w-4xl space-y-6 my-auto pt-6">
        <div className={`transition-all duration-1000 ${stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="text-xs font-mono-tech text-cyan-400 tracking-wider uppercase bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            T.Y. B.Tech CSE (AI & DS) · Data Visualization Using Python Mini-Project
          </span>
        </div>

        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] transition-all duration-1000 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          WHERE SHOULD PUNE BUILD ITS NEXT <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">10 CHARGING STATIONS?</span>
        </h1>

        <p className={`text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed transition-all duration-1000 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          Pune's EV fleet has surged past 264,000 vehicles, creating severe fast charging deficits along transit gateways and industrial corridors.
          VoltPune combines <strong>1,354 BEE-verified stations</strong>, <strong>2,242 OSM arterial segments</strong>, and a <strong>greedy submodular spatial coverage engine</strong> to scientifically identify the 10 highest-impact infrastructure locations.
        </p>

        {/* Buttons */}
        <div className={`flex flex-wrap items-center gap-4 pt-4 transition-all duration-1000 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <button
            onClick={onEnterDashboard}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-sm tracking-wide shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <span>Launch Geospatial Intelligence</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onQuickBuild10}
            className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 flex items-center gap-2 cursor-pointer transition-all hover:border-emerald-400/50"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Simulate Optimal 10 Siting</span>
          </button>
        </div>
      </div>

      {/* Bottom Proof Strip */}
      <div className="relative z-10 border-t border-white/10 pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-slate-400">
        <div>
          <span className="text-slate-500">AUTHORITY: </span>
          <span className="text-slate-200">Bureau of Energy Efficiency (BEE) · MoRTH VAHAN · PMC · OSM</span>
        </div>
        <div>
          <span className="text-slate-500">OPTIMIZATION GAIN: </span>
          <span className="text-emerald-400 font-bold">+6.5% City Coverage (83.5% → 90.0%)</span>
        </div>
      </div>
    </div>
  );
};
