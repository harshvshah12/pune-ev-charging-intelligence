import React from 'react';
import { Recommendation } from '../types';
import { Award, Navigation, Zap, MapPin, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  selectedRecommendation: Recommendation | null;
  onSelectRecommendation: (rec: Recommendation) => void;
  targetCount: number;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  selectedRecommendation,
  onSelectRecommendation,
  targetCount
}) => {
  const displayed = recommendations.slice(0, targetCount);

  if (displayed.length === 0) {
    return (
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] text-center text-xs text-slate-400 space-y-2.5">
        <Award className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="font-bold font-mono-tech text-white uppercase tracking-wider">0 Stations Sited</p>
        <p className="text-[11px] text-slate-400">
          Adjust the quota slider above to generate up to 20 optimal spatial charging candidate locations.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4.5 rounded-2xl border border-white/[0.08] space-y-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Award className="w-3.5 h-3.5" />
          </div>
          <span>Sited High-Impact Hubs ({displayed.length})</span>
        </div>
        <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
          GREEDY SUBMODULAR
        </span>
      </div>

      {/* Cards list */}
      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
        {displayed.map((rec) => {
          const isSelected = selectedRecommendation?.id === rec.id;
          return (
            <div
              key={rec.id}
              onClick={() => onSelectRecommendation(rec)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer font-mono-tech text-xs ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                  : 'bg-white/[0.03] border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.06]'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/40">
                    #{rec.rank}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-xs tracking-tight line-clamp-1">
                      {rec.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{rec.ward}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold text-xs">
                    +{rec.incremental_coverage_gain_pct}%
                  </span>
                  <div className="text-[9px] text-slate-500">Net Gain</div>
                </div>
              </div>

              {/* Middle row: Traffic Node */}
              <div className="flex items-center gap-1.5 text-[10px] text-cyan-300/90 mt-2 bg-cyan-950/20 px-2 py-1 rounded-md border border-cyan-500/20">
                <Navigation className="w-3 h-3 text-cyan-400 shrink-0" />
                <span className="truncate">{rec.traffic_node}</span>
              </div>

              {/* Hardware & Distance */}
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-1 text-slate-300">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Dual 60kW CCS-2 DC</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{rec.nearest_existing_station_km} km to nearest</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom 3-Line Selection Explanation */}
      <div className="pt-2 border-t border-white/[0.08] space-y-1.5 font-mono-tech text-[10px]">
        <div className="flex items-center justify-between text-slate-300 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Why These Nodes Were Selected:</span>
          </span>
          <span className="text-[9px] text-emerald-300 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
            3-CRITERIA PROOF
          </span>
        </div>
        <div className="space-y-1 text-slate-400 leading-snug bg-[#080d16] p-2.5 rounded-xl border border-white/[0.06]">
          <p className="flex items-start gap-1.5">
            <span className="text-emerald-400 font-bold shrink-0">1.</span>
            <span><strong className="text-slate-200">Charging Deserts:</strong> Sited in high-deficit wards (e.g. Hadapsar & Nagar Road, &gt;380 EVs/charger, &gt;1.4km to nearest charger).</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-cyan-400 font-bold shrink-0">2.</span>
            <span><strong className="text-slate-200">Arterial Access:</strong> Anchored to major OSM highway interchanges and BRTS terminals with verified 11kV grid capacity.</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-purple-400 font-bold shrink-0">3.</span>
            <span><strong className="text-slate-200">Submodular Gain:</strong> Maximizes marginal coverage (+6.5% citywide) while maintaining a strict 1.15km anti-cannibalization buffer.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
