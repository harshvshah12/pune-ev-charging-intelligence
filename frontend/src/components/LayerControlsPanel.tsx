import React from 'react';
import { MapLayerState } from '../types';
import { Layers, Eye, EyeOff, BatteryCharging, Map, GitFork, Flame, Target, Award, Disc } from 'lucide-react';

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
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Geospatial Layers</span>
        </div>
        <span className="text-[10px] font-mono-tech text-slate-400">MapLibre WebGL</span>
      </div>

      <div className="space-y-2 text-xs">
        {/* Layer 1: Existing Charging Infrastructure */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <span>Existing Stations</span>
          </div>
          <button
            onClick={() => toggle('existingChargers')}
            className={`p-1 rounded cursor-pointer ${layerState.existingChargers ? 'text-emerald-400' : 'text-slate-600'}`}
          >
            {layerState.existingChargers ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Sub-controls for Existing Stations */}
        {layerState.existingChargers && (
          <div className="pl-6 space-y-1.5 pt-1 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Type:</span>
              <button
                onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'all' })}
                className={`px-2 py-0.5 rounded cursor-pointer ${layerState.chargerTypeFilter === 'all' ? 'bg-cyan-500 text-black font-semibold' : 'bg-white/5 text-slate-300'}`}
              >
                All (1354)
              </button>
              <button
                onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'fast' })}
                className={`px-2 py-0.5 rounded cursor-pointer ${layerState.chargerTypeFilter === 'fast' ? 'bg-emerald-500 text-black font-semibold' : 'bg-white/5 text-slate-300'}`}
              >
                Fast DC (177)
              </button>
              <button
                onClick={() => onChangeLayerState({ ...layerState, chargerTypeFilter: 'ac' })}
                className={`px-2 py-0.5 rounded cursor-pointer ${layerState.chargerTypeFilter === 'ac' ? 'bg-blue-500 text-white font-semibold' : 'bg-white/5 text-slate-300'}`}
              >
                AC Slow
              </button>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-slate-400">CPO:</span>
              <select
                value={layerState.selectedCPO}
                onChange={(e) => onChangeLayerState({ ...layerState, selectedCPO: e.target.value })}
                className="bg-[#0b101c] border border-white/10 rounded px-2 py-0.5 text-[11px] text-slate-200 outline-none cursor-pointer"
              >
                <option value="all">All Operators</option>
                {cpoList.map((cpo) => (
                  <option key={cpo} value={cpo}>{cpo}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Layer 2: Pune Wards */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Map className="w-4 h-4 text-cyan-400" />
            <span>Pune Administrative Wards</span>
          </div>
          <button
            onClick={() => toggle('wardPolygons')}
            className={`p-1 rounded cursor-pointer ${layerState.wardPolygons ? 'text-cyan-400' : 'text-slate-600'}`}
          >
            {layerState.wardPolygons ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 3: Ward Choropleth */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Disc className="w-4 h-4 text-amber-400" />
            <span>Ward Need Score Choropleth</span>
          </div>
          <button
            onClick={() => toggle('wardChoropleth')}
            className={`p-1 rounded cursor-pointer ${layerState.wardChoropleth ? 'text-amber-400' : 'text-slate-600'}`}
          >
            {layerState.wardChoropleth ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 4: OSM Arterial Roads */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <GitFork className="w-4 h-4 text-sky-400" />
            <span>OSM Arterial Highways (532 km)</span>
          </div>
          <button
            onClick={() => toggle('roadNetwork')}
            className={`p-1 rounded cursor-pointer ${layerState.roadNetwork ? 'text-sky-400' : 'text-slate-600'}`}
          >
            {layerState.roadNetwork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 5: Charging Deserts Heatmap */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>Charging Density & Deserts</span>
          </div>
          <button
            onClick={() => toggle('chargingDeserts')}
            className={`p-1 rounded cursor-pointer ${layerState.chargingDeserts ? 'text-rose-400' : 'text-slate-600'}`}
          >
            {layerState.chargingDeserts ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 6: Viable Candidates */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <div className="flex items-center gap-2 text-slate-200">
            <Target className="w-4 h-4 text-amber-500" />
            <span>Viable Candidates (72 Sites)</span>
          </div>
          <button
            onClick={() => toggle('candidateLocations')}
            className={`p-1 rounded cursor-pointer ${layerState.candidateLocations ? 'text-amber-500' : 'text-slate-600'}`}
          >
            {layerState.candidateLocations ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 7: Recommended Stations */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-yellow-500/20">
          <div className="flex items-center gap-2 text-yellow-300 font-medium">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>Optimized Sited Stations</span>
          </div>
          <button
            onClick={() => toggle('recommendedSites')}
            className={`p-1 rounded cursor-pointer ${layerState.recommendedSites ? 'text-yellow-400' : 'text-slate-600'}`}
          >
            {layerState.recommendedSites ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>

        {/* Layer 8: 1.75km Coverage Isochrones */}
        {layerState.recommendedSites && (
          <div className="flex items-center justify-between p-2 pl-6 rounded-lg bg-white/5 transition-colors">
            <div className="flex items-center gap-2 text-slate-300 text-[11px]">
              <Disc className="w-3.5 h-3.5 text-yellow-400" />
              <span>1.75 km Coverage Isochrones</span>
            </div>
            <button
              onClick={() => toggle('coverageIsochrones')}
              className={`p-1 rounded cursor-pointer ${layerState.coverageIsochrones ? 'text-yellow-400' : 'text-slate-600'}`}
            >
              {layerState.coverageIsochrones ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
