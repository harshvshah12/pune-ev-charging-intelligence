import React from 'react';
import { Recommendation } from '../types';
import { Award, Navigation, Zap, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

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
      <div className="glass-panel p-6 rounded-xl border border-white/10 text-center text-xs text-slate-400 space-y-2">
        <Award className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="font-medium text-slate-300">0 Stations Selected</p>
        <p className="text-[11px]">Use the optimizer slider to site between 1 and 20 optimal charging stations.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>Optimal Station Locations ({displayed.length})</span>
        </div>
        <span className="text-[10px] font-mono-tech text-emerald-400 font-semibold">
          Marginal Greedy Sited
        </span>
      </div>

      {/* Cards list */}
      <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {displayed.map((rec) => {
          const isSelected = selectedRecommendation?.id === rec.id;
          return (
            <div
              key={rec.id}
              onClick={() => onSelectRecommendation(rec)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-yellow-500/10 border-yellow-500/60 shadow-lg shadow-yellow-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-yellow-400/20 text-yellow-300 font-mono-tech font-bold text-xs flex items-center justify-center border border-yellow-400/30">
                    #{rec.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-snug">{rec.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{rec.ward}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold font-mono-tech text-yellow-400">
                    {rec.optimization_score}
                  </div>
                  <div className="text-[9px] text-slate-400 uppercase">Score</div>
                </div>
              </div>

              {/* Highway / Traffic Node */}
              <div className="mt-2 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Arterial Node:</span>
                <span className="font-mono-tech text-slate-200 truncate max-w-[190px]">{rec.traffic_node}</span>
              </div>

              {/* Distance to Nearest Existing */}
              <div className="mt-1 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Nearest Fast Charger:</span>
                <span className="font-mono-tech text-amber-400">{rec.nearest_existing_station_km} km away</span>
              </div>

              {/* Justification summary */}
              <p className="mt-2 text-[11px] text-slate-300 italic bg-black/30 p-1.5 rounded border border-white/5">
                "{rec.justification}"
              </p>

              {/* Footer specs & Fly-to button */}
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-emerald-400 font-mono-tech flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Dual 60kW DC Fast</span>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectRecommendation(rec);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 font-medium cursor-pointer"
                >
                  <span>Fly to Site</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
