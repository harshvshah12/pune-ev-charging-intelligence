import React from 'react';
import { OverviewMetrics } from '../types';
import { BatteryCharging, Car, Zap, CheckCircle2, Navigation, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface OverviewMetricsPanelProps {
  metrics: OverviewMetrics;
  selectedStationCount: number;
}

export const OverviewMetricsPanel: React.FC<OverviewMetricsPanelProps> = ({
  metrics,
  selectedStationCount
}) => {
  return (
    <div className="w-full space-y-3">
      {/* Live Data Integrity Banner */}
      <div className="glass-panel px-4 py-2.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">DATA INTEGRITY:</span>
          <span>Official BEE Registry Data till 26th October 2025</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">VAHAN Pune (MH-12/14/61)</span>
        </div>
        <div className="flex items-center gap-2 text-amber-400 font-mono-tech">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>MSEDCL Live API: Restricted (No synthetic status fabricated)</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Pune District EVs</span>
            <Car className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-white">
            {metrics.total_registered_evs_district.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono-tech">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.7% CAGR (VAHAN)</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">BEE Verified Points</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-white">
            {metrics.total_charging_points.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 15 Wards + Fringe
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Public Fast Hubs</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-amber-400">
            {metrics.verified_public_fast_stations}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            DC Fast & Type-2 (≥7.4kW)
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Installed Grid Capacity</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-white">
            {metrics.total_installed_power_kw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kW</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg {Math.round(metrics.total_installed_power_kw / metrics.total_charging_points)} kW per connector
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Citywide Coverage</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-white flex items-baseline gap-1.5">
            <span>{selectedStationCount >= 10 ? metrics.after_10_coverage_pct : metrics.baseline_coverage_pct}%</span>
            {selectedStationCount >= 10 && (
              <span className="text-xs text-emerald-400 font-semibold">(+{metrics.coverage_improvement_10_stations_pct}%)</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {selectedStationCount >= 10 ? 'Post-Optimization Gain' : 'Within 1.75km radius'}
          </div>
        </div>

        {/* Metric 6 */}
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg Distance to Charger</span>
            <Navigation className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono-tech text-white flex items-baseline gap-1.5">
            <span>{selectedStationCount >= 10 ? metrics.after_10_avg_dist_km : metrics.baseline_avg_nearest_dist_km}</span>
            <span className="text-xs text-slate-400 font-normal">km</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 font-mono-tech">
            {selectedStationCount >= 10 ? 'Reduced by 110m citywide' : 'Urban baseline distance'}
          </div>
        </div>
      </div>
    </div>
  );
};
