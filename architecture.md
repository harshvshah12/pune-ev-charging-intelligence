# System Architecture Specification
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

## 1. Architectural Philosophy
The **VoltPune** platform separates geospatial data engineering and submodular optimization from interactive client-side 3D rendering. Rather than locking complex spatial algorithms into heavyweight GIS desktop suites (e.g., QGIS or ArcGIS), the system decomposes the infrastructure planning challenge into a decoupled four-tier architecture:
1. **Tier 1 (Geospatial ETL & Pipeline)**: Automated extraction of official government gazettes, coordinate validation, spatial point-in-polygon ward joins, and road network buffering.
2. **Tier 2 (Analytical Optimization Engine)**: Submodular Maximum Coverage Location Problem (MCLP) solver with anti-cannibalization spatial constraints and multi-criteria scoring.
3. **Tier 3 (Asynchronous REST API Backend)**: High-throughput FastAPI microservice exposing parameterized endpoints for dynamic optimization, station filtering, ward metrics, and time series.
4. **Tier 4 (Cinematic 3D Presentation Layer)**: GPU-accelerated web interface built with React 19, Vite, MapLibre GL JS, Deck.GL hexbins, Three.js shaders, and Tailwind CSS v4.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                                FRONTEND PRESENTATION LAYER                              |
|                         (React 19 + TypeScript + Vite + Tailwind CSS v4)                |
+-----------------------------------------------------------------------------------------+
|  • 3D Map Viewport (MapLibre GL JS, Pitch 52°, Bearing -22°, Carto Dark Matter Tiles)  |
|  • 3D Shaders & Glowing Pulse Rings (Custom Canvas / Three.js GPU Route Rendering)      |
|  • Dynamic Siting Studio (Real-time weight sliders, Candidate count selector K ∈ [5-20])|
|  • Corridor Journey Simulator (8 authentic Pune transit paths, low-battery pitstops)    |
|  • Ward Intelligence & Candidate Funnel (100 -> 72 -> 43 -> 21 -> 10 selected sites)    |
+--------------------------------------------┬--------------------------------------------+
                                             | HTTP REST / JSON (or static local fallback)
                                             v
+-----------------------------------------------------------------------------------------+
|                                 FASTAPI BACKEND SERVICE                                 |
|                            (Python 3.10 + Uvicorn + Pydantic v2)                        |
+-----------------------------------------------------------------------------------------+
|  • GET  /api/health       -> Service health, 1,354 stations loaded, 15 wards indexed     |
|  • GET  /api/overview     -> 264k district EVs, 83.5% baseline, 90.0% optimized metrics |
|  • GET  /api/stations     -> Filter by charger tier (All: 1354, Fast: 162, Recommended) |
|  • GET  /api/wards        -> 15 PMC administrative wards with computed Need Scores       |
|  • GET  /api/roads        -> 532.6 km arterial highway network GeoJSON                  |
|  • POST /api/optimize     -> Dynamic Submodular Greedy Siting with custom weight vector  |
|  • GET  /api/time-series  -> VAHAN historical EV adoption curves (2020 - 2026)          |
|  • GET  /api/corridors    -> 8 arterial transit simulation paths with battery metrics   |
+--------------------------------------------┬--------------------------------------------+
                                             | In-Memory Cache / Serialized GeoJSON
                                             v
+-----------------------------------------------------------------------------------------+
|                              GEOSPATIAL OPTIMIZATION ENGINE                             |
|                           (NumPy + SciPy Spatial + Shapely + GeoPandas)                 |
+-----------------------------------------------------------------------------------------+
|  • Geodesic Haversine & Projected UTM Zone 43N Distance Matrices                        |
|  • Multi-Criteria Need Scoring: S_i = 0.35 D_i + 0.35 G_i + 0.15 A_i + 0.15 F_i         |
|  • Greedy Submodular MCLP Solver with (1 - 1/e) ≈ 63.2% Approximation Guarantee         |
|  • Spatial Separation Constraint: ||c_i - c_j|| ≥ d_min (1.15 km anti-cannibalization)   |
|  • Coverage Radius Integration: R = 1.50 km geodesic buffer                             |
+--------------------------------------------┬--------------------------------------------+
                                             | Pipeline Ingestion & Sanitization
                                             v
+-----------------------------------------------------------------------------------------+
|                                   DATA FOUNDATION TIER                                  |
+-----------------------------------------------------------------------------------------+
|  • BEE Public Gazette (Oct 2025): 1,354 Charging Points (162 Fast DC CCS-2 units)       |
|  • MoRTH VAHAN Database: 264,166 Registered EVs across Pune District (72,500 core PMC) |
|  • DataMeet PMC Administrative Boundaries: 15 Municipal Wards (GeoJSON EPSG:4326)       |
|  • OpenStreetMap Geofabrik India Extract: 532.6 km Major Arterials & Expressways        |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Data Engineering & Geospatial Pipeline

### 3.1 Data Flow Sequence
```
[ Official BEE PDF Gazette ]  [ MoRTH VAHAN Public DB ]  [ DataMeet PMC Wards ]  [ OSM Geofabrik India ]
            │                           │                          │                        │
            ▼                           ▼                          │                        │
  pdfplumber / Regex          JSON Time Series Ingestion           │                        │
  Table Parsing Engine        (2020-2026 Adoption Curve)           │                        │
            │                           │                          │                        │
            ▼                           ▼                          │                        │
  [ 1,354 Charging Records ]  [ 264,166 Registered EVs ]           │                        │
            │                           │                          │                        │
            └─────────────┬─────────────┘                          │                        │
                          ▼                                        ▼                        ▼
               Spatial Coordinate Cleaning            GeoJSON Boundary Validation   Road Network Filtering
               (18.30-18.82°N, 73.65-74.15°E)         (WGS84 EPSG:4326 repaired)    (Motorway, Trunk, Primary)
                          │                                        │                        │
                          └───────────────────────┬────────────────┴────────────────────────┘
                                                  ▼
                                       Spatial Point-in-Polygon
                                        Join & Ward Aggregation
                                                  │
                                                  ▼
                                   [ Analytical Dataset: GeoJSON ]
                             data/processed/pune_charging_stations.json
                             data/processed/optimization_results.json
                             data/processed/pune_arterials.geojson
```

### 3.2 Coordinate Reference Systems (CRS) & Projection Mathematics
- **Storage & Web Standard**: WGS84 (`EPSG:4326`) for GeoJSON interchange and MapLibre GL JS rendering.
- **Metric Distance Calculation**: Distances for submodular coverage radii and separation buffers are computed via projected geodesics using the Haversine great-circle formula:
  $$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  where $R = 6,371.0088\text{ km}$ (Earth volumetric mean radius). For dense spatial indexing, coordinates are projected into **UTM Zone 43N (`EPSG:32643`)** to perform planar Euclidean operations.

---

## 4. Backend Service Specifications (FastAPI)

### 4.1 Application Lifecycle & Memory Management
- **Startup Lifecycle (`@asynccontextmanager`)**:
  - The FastAPI server loads `pune_charging_stations.json`, `optimization_results.json`, `pune_arterials.geojson`, and `ev_time_series.json` once into persistent memory on process boot.
  - Precomputes spatial bounding boxes and spatial indices, eliminating runtime disk I/O.
- **Inference Latency**:
  - Precomputed endpoints (`/api/overview`, `/api/stations`, `/api/wards`): $\le 5\text{ ms}$.
  - Dynamic Submodular Optimization (`POST /api/optimize`): $\le 45\text{ ms}$ for $K=10$ candidate selections.

### 4.2 Security, CORS & Production Resilience
- Configured with permissive CORS origins for seamless local Vite development (`localhost:3000`, `localhost:3001`, `localhost:5173`) and Vercel production domains.
- Robust exception handling wrapping JSON serialization and query parameter parsing.

---

## 5. Frontend Presentation Layer Architecture

### 5.1 Component Hierarchy
```
src/
├── App.tsx                     # Main dashboard coordinator, view switcher, global state
├── components/
│   ├── MapView.tsx             # MapLibre GL JS 3D canvas, layers, popups, route camera fly-tos
│   ├── Header.tsx              # Brand banner, live system clock, network stats, theme controls
│   ├── KPIStrip.tsx            # Macro metrics (EVs, chargers, baseline coverage, optimized coverage)
│   ├── OptimizationPanel.tsx   # Submodular controls, weight sliders, candidate funnel, export
│   ├── CorridorJourney.tsx     # 8 transit paths, glowing route pulse, battery SoC charging curve
│   ├── WardTable.tsx           # 15 PMC wards, sortable need scores, deficit ratios, charger counts
│   ├── TimeSeriesChart.tsx     # Historical EV adoption growth chart (2020-2026)
│   ├── StationDetailModal.tsx  # Station technical profile, CPO, connectors, power tier
│   └── ExplanationCard.tsx     # 3-line natural language justification for selected candidate nodes
└── services/
    └── api.ts                  # Axios/Fetch client with graceful fallback to static processed JSON
```

### 5.2 3D Geospatial Engine & Shaders
- **MapLibre GL JS**: Renders Carto Dark Matter vector tiles with a 3D perspective pitch of $52^\circ$ and bearing of $-22^\circ$, providing cinematic architectural depth.
- **Custom Pulse Shaders**: Station nodes pulse using CSS radial keyframes and WebGL point shaders, glowing cyan (`#06b6d4`) for existing chargers and neon electric green (`#10b981`) for newly recommended hubs.
- **Animated Transit Corridors**: Routes animate along GeoJSON linestrings using dynamic dash arrays and multi-stop gradients, simulating vehicular motion with speed-proportional glowing pulses.

---

## 6. Dual-Mode Deployment & Reliability Strategy
To ensure 100% uptime regardless of backend container availability:
1. **Dynamic Connected Mode**: When the FastAPI service is active at `http://127.0.0.1:8008`, the frontend executes real-time submodular optimization with arbitrary user weights.
2. **Static Edge Mode (Vercel)**: If the backend is unreachable or during static Jamstack deployment on Vercel, the frontend client falls back automatically to the high-resolution precomputed optimization result files stored in `data/processed/`.
