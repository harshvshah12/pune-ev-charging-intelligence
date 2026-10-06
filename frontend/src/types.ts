export interface Station {
  id: string;
  name: string;
  cpo: string;
  cpo_raw?: string;
  sector: string;
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  charger_type: string;
  charger_type_raw?: string;
  power_kw: number;
  connector_count: number;
  source: string;
  source_ref?: string;
  status: string;
  last_verified?: string;
  ward?: string;
}

export interface WardProperties {
  name: string;
  need_score: number;
  need_tier: string;
  evs: number;
  stations: number;
  evs_per_charger: number;
  area_km2: number;
  pop: number;
  hub: string;
}

export interface WardFeature {
  type: string;
  properties: WardProperties;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface WardCollection {
  type: string;
  metadata?: any;
  features: WardFeature[];
}

export interface Candidate {
  id: string;
  name: string;
  ward: string;
  lat: number;
  lon: number;
  traffic_node: string;
  activity: number;
  road_access: number;
  dist_to_nearest_existing_km?: number;
  is_viable?: boolean;
  is_underserved?: boolean;
  is_high_value?: boolean;
  composite_score?: number;
}

export interface Recommendation {
  rank: number;
  id: string;
  name: string;
  ward: string;
  latitude: number;
  longitude: number;
  traffic_node: string;
  optimization_score: number;
  ev_demand_score: number;
  road_accessibility_score: number;
  activity_score: number;
  nearest_existing_station_km: number;
  incremental_coverage_gain_pct: number;
  city_coverage_pct: number;
  city_avg_dist_km: number;
  recommended_hardware: string;
  justification: string;
}

export interface FunnelStep {
  step: number;
  label: string;
  count: number;
  description: string;
  status: string;
}

export interface TimeSeriesYear {
  year: number;
  label: string;
  new_registrations: number;
  cumulative_evs: number;
  e2w: number;
  e3w: number;
  e4w: number;
  buses_commercial: number;
  charging_stations_operational: number;
  ev_penetration_pct: number;
  key_event: string;
}

export interface CorridorWaypoint {
  name: string;
  lat: number;
  lon: number;
  speed_kmh: number;
  soc_pct: number;
  segment: string;
}

export interface SimulationCorridor {
  id?: string;
  title: string;
  subtitle?: string;
  category?: string;
  total_distance_km: number;
  typical_duration_min: number;
  energy_consumed_kwh: number;
  status: string;
  waypoints: CorridorWaypoint[];
}

export interface OverviewMetrics {
  total_registered_evs_district: number;
  active_evs_pmc_core: number;
  total_charging_points: number;
  verified_public_fast_stations: number;
  total_installed_power_kw: number;
  baseline_coverage_pct: number;
  baseline_avg_nearest_dist_km: number;
  after_10_coverage_pct: number;
  after_10_avg_dist_km: number;
  coverage_improvement_10_stations_pct: number;
  after_20_coverage_pct: number;
  critical_desert_wards_identified: number;
}

export interface MapLayerState {
  existingChargers: boolean;
  chargerTypeFilter: 'all' | 'fast' | 'ac';
  selectedCPO: string;
  wardPolygons: boolean;
  wardChoropleth: boolean;
  roadNetwork: boolean;
  chargingDeserts: boolean;
  candidateLocations: boolean;
  recommendedSites: boolean;
  coverageIsochrones: boolean;
  simulationRoute: boolean;
  building3D: boolean;
}
