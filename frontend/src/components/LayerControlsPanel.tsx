import React from 'react';
import { MapLayerState } from '../types';
import { Layers, Eye, EyeOff, BatteryCharging, Map, GitFork, Flame, Target, Award, Disc, Filter } from 'lucide-react';

interface LayerControlsPanelProps {
  layerState: MapLayerState;
  onChangeLayerState: (newState: MapLayerState) => void;
  cpoList: string[];
}

export const LayerControlsPanel: React.FC<LayerControlsPanelProps> = ({
  layerState,
  onChangeLayerState,
  cpoList
}) => {
  const toggle = (key: keyof MapLayerState) => {
    onChangeLayerState({
      ...layerState,
      [key]: !layerState[key]
    });
  };

  return (
    <div className="glass-panel p-4.5 rounded-2xl border border-white/[0.08] space-y-3.5 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
        <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>Geospatial Overlays</span>
        </div>
        <span className="text-[10px] font-mono-tech text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          60 FPS WEBGL
        </span>
      </div>

      <div className="space-y-2 text-xs font-mono-tech">
        {/* Layer 1: Existing Charging Infrastructure */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">BEE PCS Stations (1,354)</span>
            </div>
            <button
              onClick={() => toggle('existingChargers')}
              className={`p-1 rounded-lg cursor-pointer transition-colors ${
                layerState.existingChargers ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-600'
              }`}
            >
              {layerState.existingChargers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Sub-controls for Existing Stations */}
          {layerState.existingChargers && (
            <div className="space-y-2 pt-1 border-t border-white/5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[10px]">POWER:</span>
                <button
                  onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'all' })}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    layerState.chargerTypeFilter === 'all'
                      ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/30'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  All (1354)
                </button>
                <button
                  onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'fast' })}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    layerState.chargerTypeFilter === 'fast'
                      ? 'bg-amber-400 text-black font-bold shadow-sm shadow-amber-400/30'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  Fast (≥7.4 kW)
                </button>
                <button
                  onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'ac' })}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    layerState.chargerTypeFilter === 'ac'
                      ? 'bg-slate-300 text-black font-bold shadow-sm'
                      : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                  }`}
                >
                  AC Slow
                </button>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5">
                <span className="text-slate-400 text-[10px]">OPERATOR:</span>
                <select
                  value={layerState.selectedCPO}
                  onChange={(e) => onChangeLayerState({ ...layerState, selectedCPO: e.target.value })}
                  className="bg-[#05080e] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 outline-none cursor-pointer w-full"
                >
                  <option value="all">All CPOs / Networks</option>
                  {cpoList.map((cpo) => (
                    <option key={cpo} value={cpo}>{cpo}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Layer 2: Pune Wards */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Map className="w-4 h-4 text-cyan-400" />
            <span>15 Administrative Wards</span>
          </div>
          <button
            onClick={() => toggle('wardPolygons')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.wardPolygons ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.wardPolygons ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 3: Ward Choropleth */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>Need Score Choropleth</span>
          </div>
          <button
            onClick={() => toggle('wardChoropleth')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.wardChoropleth ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.wardChoropleth ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 4: OSM Arterial Roads */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <GitFork className="w-4 h-4 text-cyan-400" />
            <span>OSM Arterials (532.6 km)</span>
          </div>
          <button
            onClick={() => toggle('roadNetwork')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.roadNetwork ? 'text-cyan-400 bg-cyan-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.roadNetwork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 5: Charging Deserts Heatmap */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Charging Deserts Heatmap</span>
          </div>
          <button
            onClick={() => toggle('chargingDeserts')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.chargingDeserts ? 'text-rose-400 bg-rose-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.chargingDeserts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 6: Viable Candidates */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Viable Candidates (72 Sites)</span>
          </div>
          <button
            onClick={() => toggle('candidateLocations')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.candidateLocations ? 'text-amber-400 bg-amber-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.candidateLocations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 7: Sited Hubs & Isochrones */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Optimized Sited Hubs (1-20)</span>
          </div>
          <button
            onClick={() => toggle('recommendedSites')}
            className={`p-1 rounded-lg cursor-pointer transition-colors ${
              layerState.recommendedSites ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-600'
            }`}
          >
            {layerState.recommendedSites ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
