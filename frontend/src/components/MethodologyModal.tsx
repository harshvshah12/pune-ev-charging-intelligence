import React from 'react';
import { X, Sliders, CheckCircle2, AlertTriangle, BookOpen, Calculator } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel-elevated max-w-3xl w-full p-6 rounded-2xl border border-white/20 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Analytical Methodology & Mathematical Optimization Engine
              </h2>
              <p className="text-xs text-slate-400">
                Academic Formulation for T.Y. B.Tech CSE (AI & DS) Data Visualization Mini-Project
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Core Problem & Mathematical Objective */}
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span>1. Objective: The 10-Station Facility Location Problem</span>
          </h3>
          <p className="leading-relaxed">
            The problem is formulated as a <strong>Budget-Constrained Maximum Coverage Facility Location Problem (MCLP)</strong>. Given an initial network of verified charging stations <span className="font-mono-tech text-white">S</span> and an urban spatial demand grid <span className="font-mono-tech text-white">G</span> representing Pune's registered EV distribution, identify a subset of candidate locations <span className="font-mono-tech text-emerald-400">S* ⊂ C</span> with <span className="font-mono-tech text-emerald-400">|S*| = 10</span> that maximizes the net spatial accessibility gain while respecting minimum separation constraints:
          </p>
          <div className="p-3 bg-black/50 rounded-xl font-mono-tech text-[11px] text-emerald-300 border border-emerald-500/20 overflow-x-auto">
            max Σ_(g ∈ G) w_g · [ f(d_0(g)) - f(min(d_0(g), min_(c ∈ S*) dist(g, c))) ] + λ · Acc(S*)
            <br />
            subject to: dist(c_i, c_j) ≥ D_min,  ∀ c_i, c_j ∈ S*, i ≠ j
          </div>
        </div>

        {/* Section 2: Explainable Charging Need Score */}
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span>2. Explainable Charging Need Score Formulation</span>
          </h3>
          <p className="leading-relaxed">
            Rather than relying on uninterpretable black-box heuristics, the spatial priority score for any candidate node is calculated through a convex linear combination of four normalized empirical indicators:
          </p>
          <div className="p-3 bg-black/50 rounded-xl font-mono-tech text-[11px] text-amber-300 border border-amber-500/20">
            Score(c) = w_gap · (d_nearest / d_max) + w_ev · (EV_ward / EV_max) + w_road · (Acc_road / 100) + w_act · (Act_civic / 100)
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-amber-400 font-bold">Spatial Deficit (35%):</span> Normalized distance from candidate to nearest operational fast charger.
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-cyan-400 font-bold">EV Demand (35%):</span> Ward-level EV adoption density from official VAHAN registrations.
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-emerald-400 font-bold">Road Access (15%):</span> Proximity to OSM primary/trunk arterial corridors.
            </div>
            <div className="bg-white/5 p-2 rounded border border-white/5">
              <span className="text-purple-400 font-bold">Civic Activity (15%):</span> Commercial, transit terminal, or IT park footfall density.
            </div>
          </div>
        </div>

        {/* Section 3: Submodular Greedy Algorithm */}
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span>3. Greedy Marginal Coverage Optimization with Submodular Decay</span>
          </h3>
          <p className="leading-relaxed">
            MCLP is known to be NP-hard. However, because the spatial coverage objective function is <strong>monotone submodular</strong>, the greedy iterative selection algorithm is mathematically proven (Nemhauser et al.) to achieve at least:
          </p>
          <div className="p-2.5 bg-black/50 rounded-lg font-mono-tech text-xs text-white border border-white/10 flex items-center justify-between">
            <span>Theoretical Performance Floor:</span>
            <span className="text-emerald-400 font-bold">(1 - 1/e) ≈ 63.21% of the global optimal placement</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            <strong>Submodular Dynamic Re-computation:</strong> At step k, once candidate c* is sited, the spatial distance field across all demand cells is dynamically updated: <span className="font-mono-tech text-slate-200">d_k(g) = min(d_(k-1)(g), dist(g, c*))</span>. This prevents clustering and ensures candidate #2 addresses remaining underserved territory rather than duplicating candidate #1's service basin.
          </p>
        </div>

        {/* Section 4: Academic Assumptions & Viva Limitations */}
        <div className="space-y-2 text-xs text-slate-300">
          <h3 className="text-sm font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span>4. Analytical Assumptions & Limitations (Viva Defense)</span>
          </h3>
          <ul className="space-y-1.5 list-disc pl-4 text-[11px] text-slate-400">
            <li><strong>Static Authority:</strong> Public charging dataset is sourced from the official Bureau of Energy Efficiency (BEE) register (October 2025). MSEDCL PowerUpEV lacks a public authenticated REST endpoint; no fake live telemetry is simulated.</li>
            <li><strong>Geographic Granularity:</strong> VAHAN registration data is authoritative at RTO level (MH-12 Pune, MH-14 PCMC) and distributed across administrative wards via PMC population density and commercial GIS weights.</li>
            <li><strong>Travel Distance Metric:</strong> Distances are computed using the Haversine great-circle formula with arterial road network accessibility weights rather than unconstrained Euclidean planar coordinates.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Close Methodology Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
