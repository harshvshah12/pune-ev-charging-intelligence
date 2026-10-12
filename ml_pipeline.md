# Machine Learning & Optimization Pipeline Specification
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

## 1. Pipeline Overview
The geospatial data engineering and submodular optimization pipeline executes an automated, reproducible workflow from raw statutory documents to deployed 3D visualization artifacts.

```
[ Raw BEE Gazette PDF: 1,354 Stations ]   [ MoRTH VAHAN: 264,166 Registered EVs ]
                   │                                         │
                   ▼                                         ▼
[ Table Parsing & Geocoding Engine ]        [ Multi-Year Fleet Ingestion (2020-2026) ]
  • Address normalization & geocoding         • Segmented by 2W, 3W, 4W, Bus
  • Bounding box validation (Pune limits)     • Ward-level density disaggregation
                   │                                         │
                   └────────────────────┬────────────────────┘
                                        ▼
                   [ Spatial Join & Ward Geometry Integration ]
                     • 15 Administrative Wards from DataMeet
                     • Topological validation & repair via Shapely
                     • Compute Ward-Level Deficit (EVs / Fast Charger)
                                        │
                                        ▼
                   [ Road Network Buffering & POI Scoring ]
                     • Ingest 532.6 km OpenStreetMap arterials
                     • Geodesic distance matrices to road network
                     • POI / Commercial activity density mapping
                                        │
                                        ▼
                   [ Candidate Generation & 4-Stage Funnel ]
                     • Stage 1: 100 Grid Candidates
                     • Stage 2: 72 Road-Viable Candidates
                     • Stage 3: 43 Underserved Nodes (Gap > 1.0 km)
                     • Stage 4: 21 High-Value Nodes (Need Score ≥ 70)
                                        │
                                        ▼
                   [ Submodular Greedy MCLP Optimization ]
                     • Multi-criteria scoring: S_i = 0.35 D + 0.35 G + 0.15 A + 0.15 F
                     • Spatial anti-cannibalization constraint: d_min = 1.15 km
                     • Greedy iterative selection with (1 - 1/e) guarantee
                                        │
                                        ▼
                   [ Production Artifact Serialization ]
                     • data/processed/pune_charging_stations.json
                     • data/processed/optimization_results.json
                     • data/processed/pune_arterials.geojson
                     • data/processed/ev_time_series.json
```

---

## 2. Ingestion & Preprocessing Modules

### 2.1 PDF Extraction & Coordinate Normalization
- **Script**: `scripts/extract_bee_data.py` (or Python regex parser)
- **Input**: Official Bureau of Energy Efficiency Gazette PDF till October 2025.
- **Rules**:
  - Extract: Station ID, Name, Address, CPO Name, Installed Capacity (kW), Connector Types.
  - Coordinate Sanitization: Latitude clamped to $[18.30^\circ\text{N}, 18.82^\circ\text{N}]$, Longitude clamped to $[73.65^\circ\text{E}, 74.15^\circ\text{E}]$.
  - Output: 1,354 verified charging points, with 162 classified as DC Fast Chargers ($\ge 7.4\text{ kW}$).

### 2.2 VAHAN EV Adoption Database Ingestion
- **Source**: MoRTH VAHAN Public Dashboard for Pune District (MH-12 Pune, MH-14 Pimpri-Chinchwad).
- **Time Window**: 2020 through March 2026.
- **Aggregation**:
  - Electric Two-Wheelers (E2W): 198,450
  - Electric Three-Wheelers (E3W): 32,840
  - Electric Four-Wheelers (E4W): 31,426
  - Electric Buses & Heavy Commercial: 1,450
  - Total District Registered Fleet: **264,166 Vehicles**.

---

## 3. Spatial Feature Engineering & KD-Tree Indexing

### 3.1 Nearest-Neighbor Distance Matrix
Using `scipy.spatial.cKDTree` projected into UTM Zone 43N coordinates, we compute pairwise Euclidean distances between candidate cells and the 162 existing fast chargers in $O(N \log M)$ time:
```python
import numpy as np
from scipy.spatial import cKDTree

# Build KD-Tree of existing fast chargers
tree = cKDTree(existing_fast_chargers_utm)

# Query distances to nearest fast charger for all candidate cells
distances, indices = tree.query(candidate_cells_utm, k=1)
nearest_fast_charger_km = distances / 1000.0
```

### 3.2 Road Network Distance Ingestion
Each candidate cell is evaluated against the 532.6 km OpenStreetMap arterial network:
```python
road_distances, _ = road_tree.query(candidate_cells_utm, k=1)
road_proximity_factor = 1.0 / (1.0 + (road_distances / 1000.0))
```

---

## 4. Submodular MCLP Solver Implementation

The core greedy submodular optimization algorithm is implemented in `backend/main.py` and `scripts/generate_optimization.py`:

```python
def optimize_siting(
    candidates: list,
    existing_stations: list,
    target_k: int = 10,
    min_separation_km: float = 1.15,
    coverage_radius_km: float = 1.50,
    w_demand: float = 0.35,
    w_gap: float = 0.35,
    w_road: float = 0.15,
    w_activity: float = 0.15
):
    selected = []
    available_candidates = list(candidates)
    
    for iteration in range(target_k):
        best_candidate = None
        best_marginal_gain = -1.0
        
        for cand in available_candidates:
            # Check spatial separation against already selected hubs
            too_close = False
            for s in selected:
                d = haversine_km(cand['lat'], cand['lon'], s['lat'], s['lon'])
                if d < min_separation_km:
                    too_close = True
                    break
            if too_close:
                continue
                
            # Compute composite need score
            score = (
                w_demand * cand['norm_demand'] +
                w_gap * cand['norm_gap'] +
                w_road * cand['norm_road'] +
                w_activity * cand['norm_act']
            ) * 100.0
            
            # Compute marginal incremental coverage
            marginal_gain = score * compute_incremental_coverage(cand, selected, coverage_radius_km)
            
            if marginal_gain > best_marginal_gain:
                best_marginal_gain = marginal_gain
                best_candidate = cand
                
        if best_candidate is None:
            break
            
        selected.append(best_candidate)
        available_candidates.remove(best_candidate)
        
    return selected
```

---

## 5. Artifact Serialization & Data Contracts

All preprocessed files are serialized to `data/processed/` in UTF-8 JSON format:
- `pune_charging_stations.json`: Complete catalog of 1,354 stations with coordinates, power ratings, and ward joins.
- `optimization_results.json`: Complete funnel metadata (100 -> 72 -> 43 -> 21 -> 10), baseline coverage metrics, and recommended sites.
- `pune_arterials.geojson`: LineString features representing the 532.6 km highway network.
- `ev_time_series.json`: Historical annual EV adoption records (2020–2026).

---

## 6. Pipeline Reproduction Commands
To re-run the entire pipeline from scratch:
```bash
# 1. Run unit and pipeline validation tests
python -m pytest tests/test_data_pipeline.py -v

# 2. Recompute submodular optimization results
python scripts/generate_optimization.py

# 3. Start FastAPI backend service
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8008 --reload
```
