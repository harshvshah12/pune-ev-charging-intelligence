import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewMetricsPanel } from './components/OverviewMetricsPanel';
import { MapEngine } from './components/MapEngine';
import { LayerControlsPanel } from './components/LayerControlsPanel';
import { OptimizerControlsPanel } from './components/OptimizerControlsPanel';
import { RecommendationsList } from './components/RecommendationsList';
import { SimulationsSuite } from './components/SimulationsSuite';
import { StationDetailDrawer } from './components/StationDetailDrawer';
import { MethodologyModal } from './components/MethodologyModal';
import { ProvenanceModal } from './components/ProvenanceModal';
import { LandingHero } from './components/LandingHero';
import {
  fetchOverview,
  fetchStations,
  fetchWards,
  fetchRoads,
  fetchOptimizationData,
  fetchTimeSeries,
  executeOptimization
} from './services/api';
import {
  Station,
  WardCollection,
  Candidate,
  Recommendation,
  OverviewMetrics,
  MapLayerState,
  TimeSeriesYear,
  SimulationCorridor,
  CorridorWaypoint
} from './types';
import confetti from 'canvas-confetti';
import { CheckCircle2, Award, Zap, Compass, RefreshCw } from 'lucide-react';

export function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [showLanding, setShowLanding] = useState<boolean>(true);

  // Core Data
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    total_registered_evs_district: 264166,
    active_evs_pmc_core: 72500,
    total_charging_points: 1354,
    verified_public_fast_stations: 177,
    total_installed_power_kw: 8030,
    baseline_coverage_pct: 83.5,
    baseline_avg_nearest_dist_km: 1.10,
    after_10_coverage_pct: 90.0,
    after_10_avg_dist_km: 0.99,
    coverage_improvement_10_stations_pct: 6.5,
    after_20_coverage_pct: 91.7,
    critical_desert_wards_identified: 2
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [wards, setWards] = useState<WardCollection | null>(null);
  const [roads, setRoads] = useState<any>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeline, setTimeline] = useState<TimeSeriesYear[]>([]);
  const [corridor, setCorridor] = useState<SimulationCorridor | null>(null);

  // Map & Layer State
  const [layerState, setLayerState] = useState<MapLayerState>({
    existingChargers: true,
    chargerTypeFilter: 'all',
    selectedCPO: 'all',
    wardPolygons: true,
    wardChoropleth: true,
    roadNetwork: true,
    chargingDeserts: false,
    candidateLocations: false,
    recommendedSites: true,
    coverageIsochrones: true,
    simulationRoute: false,
    building3D: true
  });

  // Optimizer Inputs
  const [targetStations, setTargetStations] = useState<number>(10);
  const [weights, setWeights] = useState({
    ev_demand: 0.35,
    charging_gap: 0.35,
    road_access: 0.15,
    activity: 0.15
  });
  const [minSeparationKm, setMinSeparationKm] = useState<number>(1.15);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationCompleteBanner, setOptimizationCompleteBanner] = useState<boolean>(false);

  // Selection & Interactions
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [simulatedCarPosition, setSimulatedCarPosition] = useState<CorridorWaypoint | null>(null);

  // Modals
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [showProvenanceModal, setShowProvenanceModal] = useState<boolean>(false);

  // Load Initial Datasets
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [overviewData, stData, wardsData, roadsData, optData, tsData] = await Promise.all([
          fetchOverview(),
          fetchStations(),
          fetchWards(),
          fetchRoads(),
          fetchOptimizationData(),
          fetchTimeSeries()
        ]);

        setMetrics(overviewData.metrics);
        setStations(stData);
        setWards(wardsData);
        setRoads(roadsData);
        setCandidates(optData.all_candidates);
        setRecommendations(optData.recommendations);
        setTimeline(tsData.timeline);
        setCorridor(tsData.simulation_corridor);
      } catch (err) {
        console.error('Failed to load initial datasets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // CPO list for filter dropdown
  const cpoList = Array.from(new Set(stations.map((s) => s.cpo).filter(Boolean))).sort();

  // Handle Fly To
  const handleFlyTo = (coords: [number, number]) => {
    setFlyToCoords(coords);
  };

  // Select Recommendation from List
  const handleSelectRecommendation = (rec: Recommendation) => {
    setSelectedRecommendation(rec);
    setSelectedStation(null);
    setFlyToCoords([rec.longitude, rec.latitude]);
  };

  // Select Station from Map
  const handleSelectStation = (st: Station | null) => {
    setSelectedStation(st);
    setSelectedRecommendation(null);
    if (st) {
      setFlyToCoords([st.longitude, st.latitude]);
    }
  };

  // Flagship Step-by-Step Build 10 Stations Animation Sequence
  const handleTriggerFlagshipBuild = () => {
    setIsOptimizing(true);
    setOptimizationCompleteBanner(false);
    setTargetStations(0);
    setLayerState((prev) => ({
      ...prev,
      candidateLocations: true,
      recommendedSites: true,
      coverageIsochrones: true
    }));

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setTargetStations(current);

      if (recommendations[current - 1]) {
        const rec = recommendations[current - 1];
        setFlyToCoords([rec.longitude, rec.latitude]);
      }

      if (current >= 10) {
        clearInterval(interval);
        setIsOptimizing(false);
        setOptimizationCompleteBanner(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 700);
  };

  // Re-run Dynamic Optimization with user weights
  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationCompleteBanner(false);
    try {
      const res = await executeOptimization({
        target_stations: targetStations,
        ev_demand_weight: weights.ev_demand,
        charging_gap_weight: weights.charging_gap,
        road_access_weight: weights.road_access,
        activity_weight: weights.activity,
        min_separation_km: minSeparationKm,
        coverage_radius_km: 1.75
      });
      setRecommendations(res.selected_stations);
      setMetrics((prev) => ({
        ...prev,
        after_10_coverage_pct: res.optimized_coverage_pct,
        coverage_improvement_10_stations_pct: res.net_coverage_gain_pct
      }));
      setOptimizationCompleteBanner(true);
    } catch (e) {
      console.error('Optimization error:', e);
    } finally {
      setIsOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a11] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center animate-spin">
          <Zap className="w-6 h-6 text-black fill-black" />
        </div>
        <div className="font-mono-tech text-xs tracking-wider text-slate-300">
          INITIALIZING VOLTPUNE 3D SPATIAL KERNEL...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a11] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Global Header */}
      <Header
        onOpenMethodology={() => setShowMethodologyModal(true)}
        onOpenProvenance={() => setShowProvenanceModal(true)}
        onTriggerFlagshipBuild={handleTriggerFlagshipBuild}
        isOptimizing={isOptimizing}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-6 space-y-5 max-w-[1720px] mx-auto w-full">
        {/* Landing Hero View (Can be collapsed/entered) */}
        {showLanding ? (
          <div className="space-y-4">
            <LandingHero
              onEnterDashboard={() => setShowLanding(false)}
              onQuickBuild10={() => {
                setShowLanding(false);
                setTimeout(handleTriggerFlagshipBuild, 400);
              }}
            />
            <div className="text-center">
              <button
                onClick={() => setShowLanding(false)}
                className="text-xs text-slate-400 hover:text-white font-mono-tech flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <span>Jump directly to Geospatial Workspace ↓</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* City Overview KPIs */}
        <OverviewMetricsPanel metrics={metrics} selectedStationCount={targetStations} />

        {/* Flagship Climax Banner */}
        {optimizationCompleteBanner && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>NETWORK OPTIMIZED: {targetStations} NEW STATIONS SITED</span>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    CONVERGENCE ACHIEVED
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Submodular greedy selection increased citywide charging accessibility from <strong>83.5%</strong> to <strong>{targetStations >= 10 ? metrics.after_10_coverage_pct : (83.5 + targetStations * 0.65).toFixed(1)}%</strong> (+{metrics.coverage_improvement_10_stations_pct}% net gain).
                </p>
              </div>
            </div>

            <button
              onClick={() => setOptimizationCompleteBanner(false)}
              className="text-xs text-slate-400 hover:text-white font-mono-tech px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Geospatial Digital Twin Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Layer Controls & Optimizer Controls (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <LayerControlsPanel
              layerState={layerState}
              onChangeLayerState={setLayerState}
              cpoList={cpoList}
            />

            <OptimizerControlsPanel
              targetStations={targetStations}
              onTargetStationsChange={setTargetStations}
              weights={weights}
              onWeightsChange={setWeights}
              minSeparationKm={minSeparationKm}
              onMinSeparationChange={setMinSeparationKm}
              onRunOptimization={handleRunOptimization}
              isOptimizing={isOptimizing}
            />

            <RecommendationsList
              recommendations={recommendations}
              selectedRecommendation={selectedRecommendation}
              onSelectRecommendation={handleSelectRecommendation}
              targetCount={targetStations}
            />
          </div>

          {/* Right Column: 3D MapEngine & Simulation Suite (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-4">
            {/* The 3D Map Canvas */}
            <div className="h-[620px] w-full relative">
              <MapEngine
                stations={stations}
                wards={wards}
                roads={roads}
                candidates={candidates}
                recommendations={recommendations.slice(0, targetStations)}
                layerState={layerState}
                selectedStation={selectedStation}
                selectedRecommendation={selectedRecommendation}
                simulatedCarPosition={simulatedCarPosition}
                onSelectStation={handleSelectStation}
                onSelectRecommendation={handleSelectRecommendation}
                flyToCoords={flyToCoords}
              />
            </div>

            {/* Simulation Suite */}
            {timeline.length > 0 && corridor && (
              <SimulationsSuite
                timeline={timeline}
                corridor={corridor}
                recommendations={recommendations}
                onTriggerOptimizationSequence={handleTriggerFlagshipBuild}
                onSetLayerState={setLayerState}
                onFlyToCoords={handleFlyTo}
                onSetSimulatedCarPosition={setSimulatedCarPosition}
                activeAnimation={null}
                setActiveAnimation={() => {}}
              />
            )}
          </div>
        </div>
      </main>

      {/* Floating Station Detail Drawer */}
      <StationDetailDrawer
        station={selectedStation}
        recommendation={selectedRecommendation}
        onClose={() => {
          setSelectedStation(null);
          setSelectedRecommendation(null);
        }}
        onFlyTo={handleFlyTo}
      />

      {/* Methodology Modal */}
      <MethodologyModal
        isOpen={showMethodologyModal}
        onClose={() => setShowMethodologyModal(false)}
      />

      {/* Provenance Modal */}
      <ProvenanceModal
        isOpen={showProvenanceModal}
        onClose={() => setShowProvenanceModal(false)}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 px-6 py-4 mt-8 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 font-mono-tech">
        <div>
          <span>VOLTPUNE · T.Y. B.Tech CSE (AI & DS) Mini-Project · Data Visualization Using Python</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowProvenanceModal(true)} className="hover:text-slate-300 cursor-pointer">
            DATA_SOURCES.md
          </button>
          <span>·</span>
          <button onClick={() => setShowMethodologyModal(true)} className="hover:text-slate-300 cursor-pointer">
            METHODOLOGY.md
          </button>
          <span>·</span>
          <span>EPSG:4326 WGS84</span>
        </div>
      </footer>
    </div>
  );
}
