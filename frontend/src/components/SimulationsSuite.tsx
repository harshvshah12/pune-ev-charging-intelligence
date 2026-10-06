import React, { useState, useEffect } from 'react';
import { TimeSeriesYear, CorridorWaypoint, SimulationCorridor, Recommendation } from '../types';
import { Play, Pause, RotateCcw, Navigation, BatteryCharging, Flame, Award, Sliders, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationsSuiteProps {
  timeline: TimeSeriesYear[];
  corridor: SimulationCorridor;
  recommendations: Recommendation[];
  onTriggerOptimizationSequence: () => void;
  onSetLayerState: (fn: (prev: any) => any) => void;
  onFlyToCoords: (coords: [number, number]) => void;
  onSetSimulatedCarPosition: (pos: CorridorWaypoint | null) => void;
  activeAnimation: string | null;
  setActiveAnimation: (anim: string | null) => void;
}

export const SimulationsSuite: React.FC<SimulationsSuiteProps> = ({
  timeline,
  corridor,
  recommendations,
  onTriggerOptimizationSequence,
  onSetLayerState,
  onFlyToCoords,
  onSetSimulatedCarPosition,
  activeAnimation,
  setActiveAnimation
}) => {
  // Tab selector for animations
  const [selectedTab, setSelectedTab] = useState<'growth' | 'journey' | 'slider' | 'funnel'>('growth');

  // Animation 1: EV Growth scrubber
  const [currentYearIdx, setCurrentYearIdx] = useState<number>(timeline.length - 1);
  const [isPlayingGrowth, setIsPlayingGrowth] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isPlayingGrowth) {
      interval = setInterval(() => {
        setCurrentYearIdx((prev) => (prev < timeline.length - 1 ? prev + 1 : 0));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPlayingGrowth, timeline.length]);

  const currentYearData = timeline[currentYearIdx] || timeline[timeline.length - 1];

  // Animation 7: Simulated EV Journey
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState<number>(0);
  const [isPlayingJourney, setIsPlayingJourney] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isPlayingJourney && corridor?.waypoints) {
      timer = setInterval(() => {
        setCurrentWaypointIdx((prev) => {
          if (prev < corridor.waypoints.length - 1) {
            return prev + 1;
          } else {
            return prev;
          }
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlayingJourney, corridor?.waypoints]);

  // Synchronize waypoint to parent safely inside an effect
  useEffect(() => {
    if (isPlayingJourney && corridor?.waypoints && corridor.waypoints[currentWaypointIdx]) {
      const wp = corridor.waypoints[currentWaypointIdx];
      onSetSimulatedCarPosition(wp);
      onFlyToCoords([wp.lon, wp.lat]);
      if (currentWaypointIdx >= corridor.waypoints.length - 1) {
        setIsPlayingJourney(false);
      }
    }
  }, [currentWaypointIdx, isPlayingJourney, corridor?.waypoints]);

  const currentWaypoint = corridor?.waypoints?.[currentWaypointIdx] || corridor?.waypoints?.[0];

  const handleStartJourney = () => {
    setIsPlayingJourney(true);
    setCurrentWaypointIdx(0);
    if (corridor?.waypoints?.[0]) {
      const wp = corridor.waypoints[0];
      onSetSimulatedCarPosition(wp);
      onFlyToCoords([wp.lon, wp.lat]);
    }
  };

  const handleStopJourney = () => {
    setIsPlayingJourney(false);
    onSetSimulatedCarPosition(null);
  };

  // Animation 8: Before / After Slider
  const [sliderSplit, setSliderSplit] = useState<number>(50);

  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-3">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-2 gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span>Analytical Animation & Simulation Suite</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono-tech">
          <button
            onClick={() => setSelectedTab('growth')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedTab === 'growth' ? 'bg-cyan-500 text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            EV Growth (2020-2026)
          </button>
          <button
            onClick={() => setSelectedTab('journey')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedTab === 'journey' ? 'bg-emerald-500 text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            EV Journey Sim
          </button>
          <button
            onClick={() => setSelectedTab('slider')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedTab === 'slider' ? 'bg-amber-500 text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Before vs After
          </button>
          <button
            onClick={() => setSelectedTab('funnel')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              selectedTab === 'funnel' ? 'bg-purple-500 text-white font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            Selection Funnel
          </button>
        </div>
      </div>

      {/* TAB 1: EV Growth Scrubber */}
      {selectedTab === 'growth' && currentYearData && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingGrowth(!isPlayingGrowth)}
                className="w-7 h-7 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center cursor-pointer transition-all"
              >
                {isPlayingGrowth ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black" />}
              </button>
              <div>
                <div className="text-sm font-bold font-mono-tech text-white">
                  {currentYearData.label}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentYearData.key_event}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-base font-bold font-mono-tech text-cyan-400">
                {currentYearData.cumulative_evs.toLocaleString()} EVs
              </div>
              <div className="text-[10px] text-emerald-400 font-mono-tech">
                {currentYearData.ev_penetration_pct}% Penetration
              </div>
            </div>
          </div>

          {/* Timeline Range Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max={timeline.length - 1}
              value={currentYearIdx}
              onChange={(e) => {
                setIsPlayingGrowth(false);
                setCurrentYearIdx(Number(e.target.value));
              }}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono-tech text-slate-400">
              {timeline.map((item, idx) => (
                <span
                  key={item.year}
                  onClick={() => setCurrentYearIdx(idx)}
                  className={`cursor-pointer ${idx === currentYearIdx ? 'text-cyan-400 font-bold' : ''}`}
                >
                  {item.year}
                </span>
              ))}
            </div>
          </div>

          {/* Fleet Breakdown Bar */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Category Fleet Mix ({currentYearData.year}):</span>
              <span className="font-mono-tech text-slate-400">
                2W: {Math.round((currentYearData.e2w / currentYearData.new_registrations) * 100)}% · 4W: {Math.round((currentYearData.e4w / currentYearData.new_registrations) * 100)}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${(currentYearData.e2w / currentYearData.new_registrations) * 100}%` }}
                className="bg-cyan-400 h-full"
                title={`Electric 2W: ${currentYearData.e2w.toLocaleString()}`}
              />
              <div
                style={{ width: `${(currentYearData.e4w / currentYearData.new_registrations) * 100}%` }}
                className="bg-emerald-400 h-full"
                title={`Electric 4W: ${currentYearData.e4w.toLocaleString()}`}
              />
              <div
                style={{ width: `${(currentYearData.e3w / currentYearData.new_registrations) * 100}%` }}
                className="bg-amber-400 h-full"
                title={`Electric 3W: ${currentYearData.e3w.toLocaleString()}`}
              />
              <div
                style={{ width: `${(currentYearData.buses_commercial / currentYearData.new_registrations) * 100}%` }}
                className="bg-purple-500 h-full"
                title={`E-Buses/Commercial: ${currentYearData.buses_commercial.toLocaleString()}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Simulated EV Corridor Journey */}
      {selectedTab === 'journey' && corridor && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{corridor.title}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono-tech">
                  SIMULATION
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {corridor.total_distance_km} km · ~{corridor.typical_duration_min} min commute corridor
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isPlayingJourney ? (
                <button
                  onClick={handleStartJourney}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>Start Journey</span>
                </button>
              ) : (
                <button
                  onClick={handleStopJourney}
                  className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/20"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>Stop Simulation</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Vehicle Telemetry HUD */}
          {currentWaypoint && (
            <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-white/5 font-mono-tech text-xs">
              <div>
                <div className="text-[10px] text-slate-400">Waypoint</div>
                <div className="text-white font-bold truncate">{currentWaypoint.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Speed</div>
                <div className="text-cyan-400 font-bold">{currentWaypoint.speed_kmh} km/h</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Battery SoC</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1">
                  <span>{currentWaypoint.soc_pct}%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Corridor Node</div>
                <div className="text-amber-400 font-bold truncate">{currentWaypoint.segment}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Before vs After Split Slider */}
      {selectedTab === 'slider' && (
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">BEFORE (Baseline 83.5% Coverage)</span>
            <span className="font-bold text-emerald-400">AFTER (+10 Stations 90.0% Coverage)</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderSplit}
            onChange={(e) => setSliderSplit(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded"
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1">
              <div className="text-slate-400 font-medium">Baseline Network:</div>
              <div className="text-slate-300">· 1,354 recorded points (177 public fast)</div>
              <div className="text-slate-300">· Avg nearest fast charger: <span className="font-mono-tech text-amber-400">1.10 km</span></div>
              <div className="text-slate-300">· Severe deficits in Hadapsar & Nagar Rd</div>
            </div>

            <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/20 space-y-1">
              <div className="text-emerald-300 font-medium">After 10 Sited Hubs:</div>
              <div className="text-slate-300">· Citywide coverage expands to <span className="font-mono-tech text-emerald-400 font-bold">90.0%</span></div>
              <div className="text-slate-300">· Avg nearest fast charger: <span className="font-mono-tech text-emerald-400">0.99 km</span></div>
              <div className="text-slate-300">· 10 multi-standard DC fast hubs installed</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Selection Funnel */}
      {selectedTab === 'funnel' && (
        <div className="space-y-2 pt-1 text-xs">
          <div className="grid grid-cols-5 gap-2 text-center font-mono-tech">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-white/10">
              <div className="text-slate-400 text-[10px]">1. Generated</div>
              <div className="text-lg font-bold text-white">100</div>
              <div className="text-[9px] text-slate-500">Spatial Nodes</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-cyan-500/30">
              <div className="text-cyan-400 text-[10px]">2. Viable</div>
              <div className="text-lg font-bold text-cyan-400">72</div>
              <div className="text-[9px] text-slate-500">&lt;200m to Arterial</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-amber-500/30">
              <div className="text-amber-400 text-[10px]">3. Underserved</div>
              <div className="text-lg font-bold text-amber-400">43</div>
              <div className="text-[9px] text-slate-500">Deficit &gt;1.05km</div>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-rose-500/30">
              <div className="text-rose-400 text-[10px]">4. High-Value</div>
              <div className="text-lg font-bold text-rose-400">21</div>
              <div className="text-[9px] text-slate-500">Top Prelim Score</div>
            </div>
            <div className="bg-emerald-950/80 p-2 rounded-lg border border-emerald-500/50 shadow-lg shadow-emerald-500/10">
              <div className="text-emerald-400 text-[10px]">5. Sited</div>
              <div className="text-lg font-bold text-emerald-400">10</div>
              <div className="text-[9px] text-emerald-300">Greedy Submodular</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
