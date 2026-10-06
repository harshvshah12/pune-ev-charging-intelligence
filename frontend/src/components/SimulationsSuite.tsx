import React, { useState, useEffect } from 'react';
import { TimeSeriesYear, CorridorWaypoint, SimulationCorridor, Recommendation } from '../types';
import { Play, Pause, RotateCcw, Navigation, BatteryCharging, Flame, Award, Sliders, ArrowRight, Zap, CheckCircle2, Gauge, Radio, FastForward } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationsSuiteProps {
  timeline: TimeSeriesYear[];
  corridor: SimulationCorridor;
  corridors?: SimulationCorridor[];
  onSelectCorridor?: (c: SimulationCorridor) => void;
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
  corridors = [],
  onSelectCorridor,
  recommendations,
  onTriggerOptimizationSequence,
  onSetLayerState,
  onFlyToCoords,
  onSetSimulatedCarPosition,
  activeAnimation,
  setActiveAnimation
}) => {
  // Tab selector for animations
  const [selectedTab, setSelectedTab] = useState<'journey' | 'growth' | 'slider' | 'funnel'>('journey');

  // Animation 1: EV Growth scrubber
  const [currentYearIdx, setCurrentYearIdx] = useState<number>(timeline.length - 1);
  const [isPlayingGrowth, setIsPlayingGrowth] = useState<boolean>(false);

  useEffect(() => {
    let interval: any;
    if (isPlayingGrowth) {
      interval = setInterval(() => {
        setCurrentYearIdx((prev) => (prev < timeline.length - 1 ? prev + 1 : 0));
      }, 1400);
    }
    return () => clearInterval(interval);
  }, [isPlayingGrowth, timeline.length]);

  const currentYearData = timeline[currentYearIdx] || timeline[timeline.length - 1];

  // Animation 7: Simulated EV Journey with Speed multiplier
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState<number>(0);
  const [isPlayingJourney, setIsPlayingJourney] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1 = 2000ms, 2 = 1000ms, 3 = 600ms

  const stepDuration = simSpeed === 3 ? 600 : simSpeed === 2 ? 1100 : 2000;

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
      }, stepDuration);
    }
    return () => clearInterval(timer);
  }, [isPlayingJourney, corridor?.waypoints, stepDuration]);

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

  const handleResetJourney = () => {
    setIsPlayingJourney(false);
    setCurrentWaypointIdx(0);
    if (corridor?.waypoints?.[0]) {
      const wp = corridor.waypoints[0];
      onSetSimulatedCarPosition(wp);
      onFlyToCoords([wp.lon, wp.lat]);
    } else {
      onSetSimulatedCarPosition(null);
    }
  };

  const handleStepForward = () => {
    if (corridor?.waypoints && currentWaypointIdx < corridor.waypoints.length - 1) {
      handleJumpWaypoint(currentWaypointIdx + 1);
    }
  };

  const handleStepBack = () => {
    if (corridor?.waypoints && currentWaypointIdx > 0) {
      handleJumpWaypoint(currentWaypointIdx - 1);
    }
  };

  const handleCorridorChange = (newCorridor: SimulationCorridor) => {
    setIsPlayingJourney(false);
    setCurrentWaypointIdx(0);
    onSetSimulatedCarPosition(null);
    if (onSelectCorridor) {
      onSelectCorridor(newCorridor);
    }
  };

  const handleJumpWaypoint = (idx: number) => {
    setCurrentWaypointIdx(idx);
    if (corridor?.waypoints?.[idx]) {
      const wp = corridor.waypoints[idx];
      onSetSimulatedCarPosition(wp);
      onFlyToCoords([wp.lon, wp.lat]);
    }
  };

  // Animation 8: Before / After Slider
  const [sliderSplit, setSliderSplit] = useState<number>(50);

  return (
    <div className="glass-panel p-4.5 rounded-2xl border border-white/[0.08] space-y-3.5 shadow-2xl">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2.5 text-xs font-bold text-white uppercase tracking-wider font-mono-tech">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <span>Kinetic Simulation & Telemetry Engine</span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono-tech">
          <button
            onClick={() => setSelectedTab('journey')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
              selectedTab === 'journey'
                ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/20'
                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>EV Corridor Journey</span>
          </button>
          <button
            onClick={() => setSelectedTab('growth')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedTab === 'growth'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            EV Growth (2020-2026)
          </button>
          <button
            onClick={() => setSelectedTab('slider')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedTab === 'slider'
                ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            Before vs After
          </button>
          <button
            onClick={() => setSelectedTab('funnel')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
              selectedTab === 'funnel'
                ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                : 'bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
            }`}
          >
            Selection Funnel
          </button>
        </div>
      </div>

      {/* TAB 1: Simulated EV Corridor Journey (Default) */}
      {selectedTab === 'journey' && corridor && (
        <div className="space-y-3.5 pt-1">
          {/* Corridor Selection Grid (8 Authentic Corridors) */}
          {((corridors && corridors.length > 0 ? corridors : [corridor])).length > 1 && (
            <div className="space-y-2 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
                <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300">
                  <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SELECT PUNE ARTERIAL EV CORRIDOR ({(corridors && corridors.length > 0 ? corridors : [corridor]).length} AUTHENTIC ROUTES):</span>
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE ROUTE: {corridor.category || 'Corridor'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(corridors && corridors.length > 0 ? corridors : [corridor]).map((c, i) => {
                  const isSelected = c.id ? c.id === corridor.id : c.title === corridor.title;
                  return (
                    <button
                      key={c.id || c.title}
                      onClick={() => handleCorridorChange(c)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-400/20 rounded-bl-full pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between gap-1 text-[9px] font-mono-tech mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            isSelected
                              ? 'bg-emerald-400 text-black'
                              : 'bg-white/[0.06] text-slate-300 group-hover:text-white'
                          }`}
                        >
                          C0{i + 1}
                        </span>
                        <span className="text-slate-400 font-mono-tech">{c.total_distance_km} km</span>
                      </div>
                      <div
                        className={`text-[11px] font-bold truncate leading-tight ${
                          isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'
                        }`}
                      >
                        {c.title}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-tech mt-1.5">
                        <span className="truncate text-slate-400 max-w-[120px]">{c.category || 'Transit'}</span>
                        <span className="text-[9px] text-slate-400 font-bold ml-1">{c.waypoints.length} nodes</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Corridor Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 font-mono-tech">
                <span className="text-emerald-400">{corridor.title}</span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono-tech tracking-wider">
                  GLOWING VECTOR TRACER ACTIVE
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono-tech mt-0.5">
                {corridor.total_distance_km} km Commute · {corridor.waypoints.length} Spatial Nodes · {corridor.category || 'Arterial Corridor'} · Est. {corridor.typical_duration_min || 32} min ({corridor.energy_consumed_kwh || 3.8} kWh)
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Speed Multiplier Pill */}
              <div className="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/10 text-[10px] font-mono-tech">
                <button
                  onClick={() => setSimSpeed(1)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${simSpeed === 1 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSimSpeed(2)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${simSpeed === 2 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
                >
                  2x
                </button>
                <button
                  onClick={() => setSimSpeed(3)}
                  className={`px-2 py-0.5 rounded cursor-pointer ${simSpeed === 3 ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
                >
                  3x
                </button>
              </div>

              {/* Step Controls */}
              <div className="flex items-center bg-white/[0.04] p-1 rounded-lg border border-white/10 text-[10px] font-mono-tech">
                <button
                  onClick={handleStepBack}
                  disabled={currentWaypointIdx === 0}
                  className="px-2 py-0.5 rounded cursor-pointer text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Waypoint"
                >
                  ◀
                </button>
                <span className="px-1 text-slate-400">|</span>
                <button
                  onClick={handleStepForward}
                  disabled={!corridor.waypoints || currentWaypointIdx >= corridor.waypoints.length - 1}
                  className="px-2 py-0.5 rounded cursor-pointer text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Waypoint"
                >
                  ▶
                </button>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleResetJourney}
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10 cursor-pointer transition-all"
                title="Reset Journey to Start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Play / Halt Button */}
              {!isPlayingJourney ? (
                <button
                  onClick={handleStartJourney}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-bold font-mono-tech text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>START JOURNEY TRACER</span>
                </button>
              ) : (
                <button
                  onClick={handleStopJourney}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold font-mono-tech text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-500/20 transition-all"
                >
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>HALT SIMULATION</span>
                </button>
              )}
            </div>
          </div>

          {/* Stepper Scrubber of Waypoints */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono-tech text-slate-400">
              <span>TRACED WAYPOINT PROGRESSION:</span>
              <span className="text-emerald-400 font-bold">
                {currentWaypointIdx + 1} OF {corridor.waypoints.length} NODES
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {corridor.waypoints.map((wp, idx) => (
                <button
                  key={wp.name}
                  onClick={() => handleJumpWaypoint(idx)}
                  className={`flex-1 min-w-[70px] p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                    idx === currentWaypointIdx
                      ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md shadow-emerald-500/30'
                      : idx < currentWaypointIdx
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                      : 'bg-white/[0.03] text-slate-400 border-white/5 hover:bg-white/[0.08]'
                  }`}
                  title={`${wp.name} (${wp.speed_kmh} km/h, ${wp.soc_pct}% SoC)`}
                >
                  <div className="text-[10px] font-mono-tech">#{idx + 1}</div>
                  <div className="text-[9px] font-mono-tech truncate mt-0.5 opacity-80">{wp.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Vehicle Telemetry Cockpit HUD */}
          {currentWaypoint && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-[#080d16] p-3 rounded-xl border border-white/[0.08] font-mono-tech text-xs shadow-inner">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Active Waypoint</div>
                <div className="text-white font-bold truncate mt-0.5">{currentWaypoint.name}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Ground Speed</div>
                <div className="text-cyan-400 font-bold mt-0.5 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{currentWaypoint.speed_kmh} km/h</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Battery State (SoC)</div>
                <div className="text-emerald-400 font-bold flex items-center gap-1.5 mt-0.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{currentWaypoint.soc_pct}%</span>
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
                    <div
                      style={{ width: `${currentWaypoint.soc_pct}%` }}
                      className={`h-full transition-all duration-300 ${
                        currentWaypoint.soc_pct > 70
                          ? 'bg-emerald-400'
                          : currentWaypoint.soc_pct > 40
                          ? 'bg-amber-400'
                          : 'bg-rose-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">Road Segment</div>
                <div className="text-amber-400 font-bold truncate mt-0.5">{currentWaypoint.segment}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EV Growth Scrubber */}
      {selectedTab === 'growth' && currentYearData && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsPlayingGrowth(!isPlayingGrowth)}
                className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center cursor-pointer transition-all shadow-md shadow-cyan-500/20"
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
                {currentYearData.cumulative_evs.toLocaleString()} Cumulative EVs
              </div>
              <div className="text-[10px] text-emerald-400 font-mono-tech">
                {currentYearData.ev_penetration_pct}% Fleet Penetration
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
            <div className="flex justify-between text-[11px] text-slate-300 font-mono-tech">
              <span>Category Fleet Mix ({currentYearData.year}):</span>
              <span className="text-slate-400">
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

      {/* TAB 3: Before vs After Split Slider */}
      {selectedTab === 'slider' && (
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-xs font-mono-tech">
            <span className="font-bold text-slate-300">BASELINE 2025 (83.5% Coverage)</span>
            <span className="font-bold text-emerald-400">AFTER +10 STATIONS (90.0% Coverage)</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={sliderSplit}
            onChange={(e) => setSliderSplit(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded"
          />

          <div className="grid grid-cols-2 gap-3 text-xs font-mono-tech">
            <div className="bg-[#080d16] p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Baseline Infrastructure:</div>
              <div className="text-slate-300">· 1,354 recorded points (177 public fast)</div>
              <div className="text-slate-300">· Avg nearest fast charger: <span className="text-amber-400">1.10 km</span></div>
              <div className="text-slate-300">· Severe deficits in Hadapsar & Nagar Road</div>
            </div>

            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/20 space-y-1">
              <div className="text-emerald-400 font-bold uppercase text-[10px]">Optimized 10 Sited Hubs:</div>
              <div className="text-slate-300">· Citywide coverage expands to <span className="text-emerald-400 font-bold">90.0%</span></div>
              <div className="text-slate-300">· Avg nearest fast charger: <span className="text-emerald-400 font-bold">0.99 km</span></div>
              <div className="text-slate-300">· 10 multi-standard high-power hubs sited</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Selection Funnel */}
      {selectedTab === 'funnel' && (
        <div className="space-y-2 pt-1 text-xs">
          <div className="grid grid-cols-5 gap-2 text-center font-mono-tech">
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-white/10">
              <div className="text-slate-400 text-[10px] uppercase">1. Generated</div>
              <div className="text-xl font-black text-white">100</div>
              <div className="text-[9px] text-slate-500">Spatial Candidates</div>
            </div>
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-cyan-500/30">
              <div className="text-cyan-400 text-[10px] uppercase">2. Viable</div>
              <div className="text-xl font-black text-cyan-400">72</div>
              <div className="text-[9px] text-slate-500">&lt;200m to Arterial</div>
            </div>
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-amber-500/30">
              <div className="text-amber-400 text-[10px] uppercase">3. Underserved</div>
              <div className="text-xl font-black text-amber-400">43</div>
              <div className="text-[9px] text-slate-500">Deficit &gt;1.05km</div>
            </div>
            <div className="bg-[#080d16] p-2.5 rounded-xl border border-rose-500/30">
              <div className="text-rose-400 text-[10px] uppercase">4. High-Value</div>
              <div className="text-xl font-black text-rose-400">21</div>
              <div className="text-[9px] text-slate-500">Top Prelim Score</div>
            </div>
            <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/50 shadow-lg shadow-emerald-500/10">
              <div className="text-emerald-400 text-[10px] uppercase">5. Sited</div>
              <div className="text-xl font-black text-emerald-400">10</div>
              <div className="text-[9px] text-emerald-300">Submodular Greedy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
