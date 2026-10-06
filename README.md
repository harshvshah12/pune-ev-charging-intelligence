# VoltPune — Pune Electric Mobility Infrastructure & Station Placement Intelligence

[![Academic Level](https://img.shields.io/badge/Course-T.Y.%20B.Tech%20CSE%20(AI%20%26%20DS)-emerald.svg)](https://github.com/harshvshah12/pune-ev-charging-intelligence)
[![Project](https://img.shields.io/badge/Project-Data%20Visualization%20Using%20Python-cyan.svg)](https://github.com/harshvshah12/pune-ev-charging-intelligence)
[![Data Integrity](https://img.shields.io/badge/Data%20Integrity-100%25%20Verified%20Public%20Sources-blue.svg)](DATA_SOURCES.md)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Passing-brightgreen.svg)](tests/)

> **"If Pune could build only 10 new public EV charging stations, where should they be placed to provide the greatest improvement in charging accessibility?"**

VoltPune is a **production-quality, 3D geospatial mobility intelligence platform** built to solve the urban charging infrastructure bottleneck in Pune, Maharashtra.

Rather than relying on generic synthetic templates or fabricated data, VoltPune is grounded in **1,354 Bureau of Energy Efficiency (BEE)-verified charging points**, **264,166 VAHAN vehicle registration records**, **15 PMC administrative ward boundaries**, and **532.6 km of OpenStreetMap arterial highways**. It computes an explainable **Charging Need Score** and solves the **Maximum Coverage Location Problem (MCLP)** via an iterative **Greedy Submodular Marginal Coverage Optimization Engine**.

---

## 🏛️ System Architecture & Data Pipeline

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │                           RAW DATA ACQUISITION                         │
  ├──────────────────┬──────────────────┬──────────────────┬───────────────┤
  │ BEE Gazette PDF  │  MoRTH VAHAN RTO │  DataMeet PMC    │  OSM Overpass │
  │ 1,159 Pages Nat. │  MH-12 / MH-14   │  Admin Wards     │  532 km Roads │
  └─────────┬────────┴─────────┬────────┴─────────┬────────┴───────┬───────┘
            │                  │                  │                │
            ▼                  ▼                  ▼                ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                  DATA CLEANING & STANDARDIZATION                       │
  │  • Coordinate Validation (EPSG:4326 inside Pune Bounding Box)          │
  │  • Deduplication (35m radius co-located charger merging)               │
  │  • CPO & Power Standardization (CCS-2, Type-2, LEV DC, Bharat DC)      │
  │  • Polygon geometry self-intersection repair (make_valid)              │
  └────────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 SPATIAL JOIN & FEATURE ENGINEERING                     │
  │  • Point-in-Polygon Ward Assignment                                    │
  │  • Spatial Charging Deficit Grid (460 urban demand cells)              │
  │  • EVs-per-Charger Ratio & Charger Density per km²                     │
  └────────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │                 EXPLAINABLE CHARGING NEED SCORING                      │
  │   Score = 0.35·Deficit + 0.35·EV_Demand + 0.15·Road_Acc + 0.15·Activity│
  └────────────────────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │          GREEDY SUBMODULAR MARGINAL COVERAGE OPTIMIZATION              │
  │  100 Generated ➔ 72 Viable ➔ 43 Underserved ➔ 21 Top ➔ Top 10 Sited    │
  │  Guaranteed (1 - 1/e) ≈ 63.2% Approximation of NP-Hard Optimum         │
  └────────────────────────────────────┬───────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        ┌───────────────────────┐             ┌───────────────────────┐
        │  FastAPI Python REST  │             │   MapLibre 3D WebGL   │
        │  Analytical Backend   │             │   Vite React Frontend │
        └───────────────────────┘             └───────────────────────┘
```

---

## 📊 Key Findings & Urban Insights

1. **The Hadapsar-Magarpatta Deficit (Rank #1 Need — Score 85.5):**
   - Hadapsar has **7,612 registered EVs** across 45.1 km², yet only **20 charging stations** (yielding a staggering **380.6 EVs per charger** ratio).
   - Siting Station #10 at Hadapsar Gadital Intermodal Hub provides immediate relief along NH-65.

2. **The Nagar Road / Kharadi IT Corridor Strain (Rank #2 Need — Score 70.9):**
   - High adoption corridor with **9,425 registered EVs**, commercial airport traffic, and EON IT Park.

3. **Baseline vs. Optimized Coverage:**
   - **Baseline:** 83.5% of Pune's urban grid lies within 1.75 km of a fast charger, with an average distance of **1.10 km**.
   - **After 10 Stations:** Coverage reaches **90.0%** (+6.5% citywide improvement), reducing average nearest distance to **0.99 km** (-110 meters citywide).

---

## 🎬 9 Purposeful Data Animations & Simulations

Every animation in VoltPune communicates authentic data:

1. **EV Growth Scrubber:** Interactive temporal slider (2020 → 2026) demonstrating fleet expansion and vehicle mix (2W: 78%, 4W: 13%, 3W: 8%, Buses: 1%).
2. **Network Ignition:** Progressive illumination and pulse of 1,354 charging nodes across Pune.
3. **Charging Deserts Heatmap:** Dynamic spatial transition revealing underserved areas.
4. **Build 10 Stations Flagship:** Interactive step-by-step sequence evaluating candidates, eliminating low scores, siting stations 1 through 10, and culminating in a celebratory **NETWORK OPTIMIZED** convergence banner.
5. **Coverage Expansion Isochrones:** 1.75 km golden buffer rings showing service basin expansion.
6. **Arterial Highway Tracing:** Soft vector glow rendering 532 km of OSM primary highways.
7. **Simulated EV Journey:** Real-time corridor trip from **Hinjewadi Infotech Park Phase 1 → Baner → Aundh → Shivajinagar** with simulated battery State of Charge (92% → 63%) and speed telemetry.
8. **Before vs. After Split Slider:** Comparative slider comparing baseline vs. post-10 infrastructure.
9. **Selection Funnel:** Clear visualization of the 5-stage candidate reduction (`100 → 72 → 43 → 21 → 10`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Run Analytical Backend (FastAPI)
```bash
# Navigate to project root
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation will be live at: `http://127.0.0.1:8000/docs`

### 2. Run Interactive Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to launch the 3D Geospatial Intelligence platform.

### 3. Run Automated Test Suite
```bash
python -m pytest tests/test_data_pipeline.py -v
```
All 9 unit and integration tests verify coordinate validity, data deduplication, greedy submodular mathematical properties, and REST endpoints.

---

## 📁 Repository Structure

```
├── data/
│   ├── raw/                  # Official BEE PDF, DataMeet GeoJSONs, raw OSM extracts
│   ├── processed/            # Cleaned stations, GeoJSON arterials, optimization outputs
│   └── metadata/             # Schema definitions and data dictionaries
├── backend/
│   └── main.py               # FastAPI analytical server & dynamic optimization endpoint
├── frontend/
│   ├── src/
│   │   ├── components/       # MapEngine, Header, Optimizer, Simulations, Modals
│   │   ├── services/api.ts   # Resilient data service with static offline fallback
│   │   ├── types.ts          # TypeScript domain interfaces
│   │   ├── App.tsx           # Master state coordinator
│   │   └── main.tsx          # Application entry point
│   ├── public/data/          # Bundled offline datasets for 100% reliable deployment
│   └── vite.config.ts        # Vite + Tailwind v4 + React configuration
├── scripts/
│   ├── extract_bee_stations.py # PyPDF regex extraction & deduplication pipeline
│   ├── process_osm_roads.py    # Overpass road segment to GeoJSON converter
│   └── optimizer.py            # Greedy submodular location optimization engine
├── tests/
│   └── test_data_pipeline.py  # 9 Automated regression and verification tests
├── DATA_SOURCES.md           # Full data provenance and licensing dossier
├── METHODOLOGY.md            # Mathematical formulation and viva defense paper
└── README.md
```

---

## 🚀 Instant Vercel Deployment

VoltPune is configured for zero-configuration, 1-click deployment on [Vercel](https://vercel.com):

1. **Import Repository**: Connect `harshvshah12/pune-ev-charging-intelligence` to Vercel.
2. **Zero Configuration Needed**: The root `vercel.json` and `package.json` automatically orchestrate the build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm --prefix frontend run build` (or `npm run build` if Root Directory is set to `frontend`)
   - **Output Directory**: `frontend/dist` (or `dist`)
3. **Static Edge Architecture**: All 1,354 BEE stations, ward geometries, OSM arterials, optimization solutions, and 8 EV corridors are bundled in high-performance static JSON/GeoJSON files under `public/data/` with resilient client-side submodular solver fallbacks.

---

## 📖 Academic References & Provenance

1. **Bureau of Energy Efficiency (BEE)**, Ministry of Power, Govt. of India, *EV Public Charging Stations Register*, Oct 2025.
2. **Ministry of Road Transport and Highways (MoRTH)**, *VAHAN Analytics Public Dashboard*, 2020–2026.
3. **DataMeet Community**, *Pune Municipal Spatial Data & Electoral Wards*, CC-BY 4.0.
4. **OpenStreetMap Contributors**, *Planet OSM Data*, ODbL.
5. **Nemhauser, G. L., Wolsey, L. A., & Fisher, M. L. (1978)**, *An analysis of approximations for maximizing submodular set functions—I*, Mathematical Programming, 14(1), 265-278.
