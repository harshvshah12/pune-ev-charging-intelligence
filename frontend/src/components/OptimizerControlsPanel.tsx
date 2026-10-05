import React from 'react';
import { Sliders, Play, RotateCcw, ChevronRight, Zap, Target } from 'lucide-react';

interface OptimizerControlsPanelProps {
  targetStations: number;
  onTargetStationsChange: (val: number) => void;
  weights: {
    ev_demand: number;
    charging_gap: number;
    road_access: number;
    activity: number;
  };
  onWeightsChange: (newWeights: any) => void;
  minSeparationKm: number;
  onMinSeparationChange: (val: number) => void;
  onRunOptimization: () => void;
  isOptimizing: boolean;
}

export const OptimizerControlsPanel: React.FC<OptimizerControlsPanelProps> = ({
  targetStations,
  onTargetStationsChange,
  weights,
  onWeightsChange,
  minSeparationKm,
  onMinSeparationChange,
  onRunOptimization,
  isOptimizing
}) => {
  const stationPresets = [0, 1, 5, 10, 15, 20];

  const handleResetWeights = () => {
    onWeightsChange({
      ev_demand: 0.35,
      charging_gap: 0.35,
      road_access: 0.15,
      activity: 0.15
    });
    onMinSeparationChange(1.15);
  };

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Location Optimizer</span>
        </div>
        <button
          onClick={handleResetWeights}
          className="text-[11px] font-mono-tech text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Target Stations Picker */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">Target New Stations:</span>
          <span className="font-mono-tech text-emerald-400 font-bold text-sm">{targetStations} Stations</span>
        </div>

        <div className="flex items-center gap-1">
          {stationPresets.map((val) => (
            <button
              key={val}
              onClick={() => onTargetStationsChange(val)}
              className={`flex-1 py-1 text-xs font-mono-tech rounded transition-all cursor-pointer ${
                targetStations === val
                  ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {val}
            </button>
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="20"
          value={targetStations}
          onChange={(e) => onTargetStationsChange(Number(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Selection Funnel Snapshot */}
      <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span>Selection Funnel</span>
          </span>
          <span className="font-mono-tech text-[10px] text-emerald-400">Greedy Submodular</span>
        </div>
        <div className="grid grid-cols-5 text-center text-[10px] font-mono-tech gap-1 pt-1">
          <div className="bg-slate-900/60 p-1 rounded border border-white/5">
            <div className="text-slate-400">Gen</div>
            <div className="text-white font-bold">100</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-white/5">
            <div className="text-slate-400">Viable</div>
            <div className="text-cyan-400 font-bold">72</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-white/5">
            <div className="text-slate-400">Deficit</div>
            <div className="text-amber-400 font-bold">43</div>
          </div>
          <div className="bg-slate-900/60 p-1 rounded border border-white/5">
            <div className="text-slate-400">Top</div>
            <div className="text-rose-400 font-bold">21</div>
          </div>
          <div className="bg-emerald-950/60 p-1 rounded border border-emerald-500/30">
            <div className="text-emerald-300">Sited</div>
            <div className="text-emerald-400 font-bold">{targetStations}</div>
          </div>
        </div>
      </div>

      {/* Analytical Multi-Criteria Weights */}
      <div className="space-y-2.5 pt-1 text-xs">
        <div className="text-slate-400 font-medium text-[11px] uppercase tracking-wider flex items-center justify-between">
          <span>Scoring Criteria Weights</span>
          <span className="font-mono-tech text-[10px] text-slate-500">Σ = 100%</span>
        </div>

        {/* EV Demand Weight */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">EV Adoption & Fleet Share:</span>
            <span className="font-mono-tech text-cyan-400">{Math.round(weights.ev_demand * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.ev_demand}
            onChange={(e) => onWeightsChange({ ...weights, ev_demand: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>

        {/* Charging Gap Weight */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Distance to Nearest Charger:</span>
            <span className="font-mono-tech text-amber-400">{Math.round(weights.charging_gap * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.charging_gap}
            onChange={(e) => onWeightsChange({ ...weights, charging_gap: parseFloat(e.target.value) })}
            className="w-full accent-amber-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>

        {/* Road Accessibility Weight */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">OSM Arterial Highway Access:</span>
            <span className="font-mono-tech text-emerald-400">{Math.round(weights.road_access * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.road_access}
            onChange={(e) => onWeightsChange({ ...weights, road_access: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>

        {/* Minimum Station Separation */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-slate-300">Min Station Separation:</span>
            <span className="font-mono-tech text-white">{minSeparationKm.toFixed(2)} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={minSeparationKm}
            onChange={(e) => onMinSeparationChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>
      </div>

      {/* Run Optimization Button */}
      <button
        onClick={onRunOptimization}
        disabled={isOptimizing}
        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <Play className={`w-3.5 h-3.5 fill-black ${isOptimizing ? 'animate-spin' : ''}`} />
        <span>{isOptimizing ? 'Recalculating Greedy Set...' : 'Run Greedy Optimization'}</span>
      </button>
    </div>
  );
};
