import React from 'react';
import { Sliders, Play, RotateCcw, ChevronRight, Zap, Target, Cpu, CheckCircle } from 'lucide-react';

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
    <div className="glass-panel p-4.5 rounded-2xl border border-white/[0.08] space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span>Submodular Spatial Solver</span>
        </div>
        <button
          onClick={handleResetWeights}
          className="text-[10px] font-mono-tech text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
          title="Reset weights to academic baseline"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET WEIGHTS</span>
        </button>
      </div>

      {/* Target Stations Picker */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-300 font-mono-tech font-bold">TARGET SITING QUOTA:</span>
          <span className="text-base font-black font-mono-tech text-emerald-400">
            {targetStations} <span className="text-xs font-normal text-slate-400">STATIONS</span>
          </span>
        </div>

        {/* Preset Selector Buttons */}
        <div className="grid grid-cols-6 gap-1.5 font-mono-tech text-xs">
          {stationPresets.map((cnt) => (
            <button
              key={cnt}
              onClick={() => onTargetStationsChange(cnt)}
              className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer font-bold ${
                targetStations === cnt
                  ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/30'
                  : 'bg-white/[0.03] text-slate-300 border-white/5 hover:bg-white/[0.08]'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>

        {/* Continuous Range Slider */}
        <input
          type="range"
          min="0"
          max="20"
          step="1"
          value={targetStations}
          onChange={(e) => onTargetStationsChange(Number(e.target.value))}
          className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg mt-1"
        />
      </div>

      {/* Mathematical Weight Sliders */}
      <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
        <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono-tech flex items-center justify-between">
          <span>LINEAR SCORING WEIGHTS:</span>
          <span className="text-cyan-400 text-[10px]">
            SUM: {Math.round((weights.ev_demand + weights.charging_gap + weights.road_access + weights.activity) * 100)}%
          </span>
        </div>

        {/* Weight 1: EV Demand */}
        <div className="space-y-1 text-xs font-mono-tech">
          <div className="flex justify-between text-slate-300">
            <span>EV Fleet Adoption (w₁)</span>
            <span className="text-emerald-400 font-bold">{Math.round(weights.ev_demand * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.ev_demand}
            onChange={(e) => onWeightsChange({ ...weights, ev_demand: parseFloat(e.target.value) })}
            className="w-full accent-emerald-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>

        {/* Weight 2: Charging Deficit Gap */}
        <div className="space-y-1 text-xs font-mono-tech">
          <div className="flex justify-between text-slate-300">
            <span>Fast Charging Gap (w₂)</span>
            <span className="text-amber-400 font-bold">{Math.round(weights.charging_gap * 100)}%</span>
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

        {/* Weight 3: Road Accessibility */}
        <div className="space-y-1 text-xs font-mono-tech">
          <div className="flex justify-between text-slate-300">
            <span>Arterial Road Access (w₃)</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.road_access * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.road_access}
            onChange={(e) => onWeightsChange({ ...weights, road_access: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>

        {/* Weight 4: Urban Activity / Footfall */}
        <div className="space-y-1 text-xs font-mono-tech">
          <div className="flex justify-between text-slate-300">
            <span>Commercial Footfall (w₄)</span>
            <span className="text-purple-400 font-bold">{Math.round(weights.activity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={weights.activity}
            onChange={(e) => onWeightsChange({ ...weights, activity: parseFloat(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer h-1 bg-slate-800 rounded"
          />
        </div>
      </div>

      {/* Minimum Spatial Separation Constraint */}
      <div className="space-y-1 pt-2 border-t border-white/[0.08] text-xs font-mono-tech">
        <div className="flex justify-between text-slate-300">
          <span>Min Spatial Separation (d_min)</span>
          <span className="text-slate-200 font-bold">{minSeparationKm} km</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={minSeparationKm}
          onChange={(e) => onMinSeparationChange(parseFloat(e.target.value))}
          className="w-full accent-slate-300 cursor-pointer h-1 bg-slate-800 rounded"
        />
        <div className="text-[10px] text-slate-400">
          Prevents cannibalization between adjacent charging hubs.
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onRunOptimization}
        disabled={isOptimizing}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-black font-bold font-mono-tech text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
      >
        <Zap className={`w-3.5 h-3.5 fill-black ${isOptimizing ? 'animate-spin' : ''}`} />
        <span>{isOptimizing ? 'RECOMPUTING SPATIAL COVERAGE...' : 'RUN GREEDY OPTIMIZATION'}</span>
      </button>
    </div>
  );
};
