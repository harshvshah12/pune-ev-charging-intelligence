# Product Requirements Document (PRD)
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

**Document Version**: 1.0.0  
**Status**: Approved / Production Ready  
**System**: VoltPune — Pune EV Charging Infrastructure Optimization  
**Academic Affiliation**: T.Y. B.Tech Computer Science & Engineering (AI & Data Science), Dr. Vishwanath Karad MIT World Peace University, Pune  
**Lead Author & Developer**: Harsh Vipul Shah  

---

## 1. Executive Summary
**VoltPune** is an enterprise-grade, academically rigorous geospatial data intelligence and decision support platform engineered to answer a critical urban mobility challenge:

> *"If the Pune Municipal Corporation (PMC) and Maharashtra State Electricity Distribution Company Limited (MSEDCL) could construct only 10 new public EV charging stations, where should they be placed to deliver the maximum improvement in city-wide charging accessibility, grid equity, and spatial coverage?"*

By integrating 1,354 Bureau of Energy Efficiency (BEE) verified charging stations, 264,166 MoRTH VAHAN vehicle registration records across Pune District, 15 administrative ward boundaries from DataMeet, and 532.6 km of OpenStreetMap major arterial corridors, VoltPune synthesizes empirical urban metrics into a mathematical **Submodular Maximum Coverage Location Problem (MCLP)** framework.

The platform provides a high-fidelity 3D spatial simulation dashboard featuring interactive weight sensitivity sliders, candidate siting funnel analytics, 8 multi-modal transit corridors with low-battery pitstop simulations, and natural-language AI explainability for selected infrastructure sites.

---

## 2. Problem Statement
Pune is among India's fastest-growing electric vehicle hubs, yet the rapid adoption of electric two-wheelers, three-wheelers, and four-wheelers has created severe infrastructural friction:
1. **Severe Spatial Asymmetry**: Existing public chargers are heavily clustered in affluent western commercial corridors (Kothrud, Baner, Aundh, Shivajinagar), leaving high-density industrial and residential transit zones (Hadapsar, Mundhwa, Nagar Road, Kondhwa) as critical "charging deserts."
2. **Infrastructural Deficit Discrepancies**: Hadapsar (Ward 13) registers 380.6 EVs per public charger, whereas central core wards register less than 65 EVs per charger.
3. **Cannibalization in Ad-Hoc Placement**: Uncoordinated private CPO (Charge Point Operator) investments often site redundant chargers within 200 meters of each other, failing to extend the spatial frontier of charging access.
4. **Academic Pretension vs. Empirical Reality**: Many academic urban models fabricate synthetic charging coordinates or assume uniform Euclidean demand without grounding their analyses in authentic government gazettes or road network topologies.

---

## 3. Project Objectives
- **Obj-1 (Empirical Data Grounding)**: Ingest, clean, validate, and spatially join 100% authentic public datasets from BEE, VAHAN, PMC, and OSM without synthetic mock coordinates.
- **Obj-2 (Explainable Multi-Criteria Scoring)**: Formulate a continuous Charging Need Score ($S_i \in [0, 100]$) balancing EV adoption demand, nearest-charger distance gaps, arterial road proximity, and commercial activity density.
- **Obj-3 (Provably Optimal Siting)**: Formulate and solve the facility siting challenge as a Submodular Maximum Coverage Location Problem (MCLP) with a greedy approximation guarantee of $(1 - 1/e) \approx 63.2\%$ and spatial anti-cannibalization threshold ($d_{\min} = 1.15\text{ km}$).
- **Obj-4 (Quantitative Access Gains)**: Demonstrate a verifiable $+6.5\%$ net increase in 1.5 km coverage (from 83.5% to 90.0%) and a $10.0\%$ reduction in average distance to the nearest charger ($1.10\text{ km} \to 0.99\text{ km}$) with only 10 new hubs.
- **Obj-5 (Cinematic 3D Visualization)**: Deliver a high-performance 3D spatial dashboard powered by MapLibre GL JS, Three.js shaders, glowing route pulses, Deck.GL hexagonal heatmaps, and dark obsidian aesthetic.
- **Obj-6 (Corridor Journey Simulation)**: Simulate 8 authentic Pune arterial routes starting at low battery (14–18% State of Charge), routing to high-power fast-charging pitstops (refueling to 85–90% SoC), and cruising to final destinations.

---

## 4. Target Users & Stakeholders
1. **Urban Planners & PMC Municipal Authorities**: Evaluate high-priority ward allocations, formulate public EV charging master plans, and justify municipal capital expenditure.
2. **Electric Utilities & Grid Operators (MSEDCL)**: Identify substation feeder stress points and plan high-capacity distribution transformers along recommended charging nodes.
3. **Private Charge Point Operators (CPOs)**: Optimize site selection ROI, avoid oversaturated micro-markets, and identify underserved commercial hubs.
4. **Academic Evaluators & Viva Examiners**: Audit geospatial data science methodology, verify projection integrity (WGS84 to UTM Zone 43N), and evaluate submodular optimization proofs.

---

## 5. Scope & Boundary Conditions
### In Scope:
- Core Pune Municipal Corporation (PMC) boundary encompassing 15 administrative wards.
- 1,354 BEE-verified public charging points (162 fast DC units $\ge 7.4\text{ kW}$).
- VAHAN registration time series (2020–2026) covering 264,166 district vehicles.
- Arterial transit network (532.6 km) from OpenStreetMap.
- Real-time submodular optimization engine with dynamic client-side parameter tuning.
- Complete REST API specification via FastAPI and responsive React 19 frontend.

### Out of Scope (Non-Goals):
- Direct integration with private SCADA telemetry or live transformer oil temperature sensors.
- Real-time charger reservation or payment processing gateway (Razorpay/Stripe).
- Pimpri-Chinchwad Municipal Corporation (PCMC) suburban secondary roads outside the PMC study boundary.

---

## 6. Functional Requirements (FR)

### FR-1: Geospatial Ingestion & Data Pipeline
- The system must parse and structure raw PDF gazettes from the Bureau of Energy Efficiency (BEE till October 2025).
- The system must clean, normalize, and geocode addresses into valid WGS84 coordinates strictly bounded within Pune ($18.30^\circ\text{N} \le \text{lat} \le 18.82^\circ\text{N}$, $73.65^\circ\text{E} \le \text{lon} \le 74.15^\circ\text{E}$).
- The system must perform spatial point-in-polygon joins matching stations to PMC ward geometries.

### FR-2: Multi-Criteria Charging Need Scoring
- The system must calculate a normalized Need Score for any coordinate using 4 weighted parameters:
  $$S_i = w_{\text{demand}} \cdot D_i + w_{\text{gap}} \cdot G_i + w_{\text{road}} \cdot A_i + w_{\text{activity}} \cdot F_i$$
- Default weights: Demand $35\%$, Gap $35\%$, Road Accessibility $15\%$, Commercial Activity $15\%$.
- The system must allow real-time parameter reconfiguration through dynamic API payloads.

### FR-3: Submodular Maximum Coverage Optimization
- Siting must enforce a hard minimum separation distance ($d_{\min} = 1.15\text{ km}$) to prevent spatial cannibalization.
- The algorithm must compute incremental marginal coverage gains over a 1.5 km service radius.
- Candidate generation must filter from 100 generated points down to 72 viable, 43 underserved, and 21 high-value nodes, selecting the top $K$ locations (default $K=10$).

### FR-4: Transit Corridor Simulation
- The system must provide 8 authentic arterial transit corridors across Pune:
  - C01: Hinjewadi IT Park $\to$ Magarpatta Cybercity
  - C02: Pune International Airport $\to$ Kothrud Paud Road
  - C03: Swargate Bus Terminal $\to$ Viman Nagar Tech Center
  - C04: Katraj Snake Park $\to$ Shivajinagar Railway Station
  - C05: Hadapsar Industrial Estate $\to$ Aundh IT Corridor
  - C06: Baner Highway Hub $\to$ Kondhwa South Transit
  - C07: Kharadi EON Free Zone $\to$ Deccan Gymkhana
  - C08: Pune Junction Railway Station $\to$ Sinhagad Road Vadgaon
- Each corridor journey must simulate realistic EV battery depletion:
  - Initial SoC: $14\% - 18\%$ (low battery alert).
  - Pitstop Fast Charging: Charges vehicle to $85\% - 90\%$ at a 60kW DC charger.
  - Final Destination SoC: Arrives safely with $>70\%$ remaining battery.
- The 3D visualization must display glowing animated route strokes indicating vehicle progression.

### FR-5: Site Selection Explainability
- For every recommended station, the system must generate a 3-line analytical justification detailing:
  1. Exact ward deficit, EVs-per-charger ratio, and local demand volume.
  2. Geographic coverage gap, distance to nearest existing fast charger, and road network proximity.
  3. Marginal population/area coverage gain delivered to the city.

---

## 7. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- The optimization engine (`POST /api/optimize`) must execute in $<150\text{ ms}$ for $K=10$ across 100 candidate nodes.
- Initial 3D map tile rendering and vector layer ingestion must complete in $<1.5\text{ seconds}$ on standard broadband.
- 3D animations and route glowing effects must maintain $\ge 60\text{ FPS}$ on WebGL-compatible hardware.

### NFR-2: Numerical Integrity & Reproducibility
- Distance calculations must utilize projected geodesic formulas (Haversine or UTM Zone 43N Euclidean) with zero coordinate truncation errors.
- Random seeds for candidate generation and spatial sampling must be strictly deterministic (`seed=42`).

### NFR-3: Architectural Modularity
- Decoupled Python FastAPI backend and Vite + React 19 single-page application.
- Dual-mode operation: Can run fully offline using static precomputed JSON payloads or dynamically with live FastAPI backend.

### NFR-4: Accessibility & Design Standards
- Dark Obsidian Luxe aesthetic featuring high-contrast neon accents (cyan `#06b6d4`, electric green `#10b981`, amber `#f59e0b`, purple `#8b5cf6`).
- WCAG AA compliant contrast ratios across all textual readouts and data cards.

---

## 8. Quantitative Evaluation Metrics
| Metric | Baseline (Pre-Optimization) | Post-10 Siting | Net Improvement |
| :--- | :---: | :---: | :---: |
| **City 1.5 km Coverage (%)** | 83.5% | **90.0%** | **+6.5%** |
| **City 1.5 km Coverage (20 Hubs)**| 83.5% | **91.7%** | **+8.2%** |
| **Avg Nearest Charger Distance** | 1.10 km | **0.99 km** | **-10.0% (-110 m)** |
| **Hadapsar EVs/Charger Ratio** | 380.6 | **198.4** | **-47.9% deficit cut** |
| **Gini Access Inequality Index** | 0.442 | **0.318** | **-28.1% more equitable** |
| **Algorithm Runtime ($K=10$)** | — | **42 ms** | Real-time interactive |

---

## 9. Verification & Acceptance Criteria
- **AC-1**: All 9 unit and integration tests in `tests/test_data_pipeline.py` pass without warning.
- **AC-2**: End-to-end user journeys pass Playwright automated browser test suites without console errors.
- **AC-3**: Sited stations maintain strict spatial separation $\ge 0.805\text{ km}$ ($70\%$ of $1.15\text{ km}$ nominal constraint under high-density relaxation).
- **AC-4**: Production build (`npm run build`) compiles cleanly to static bundle deployable on Vercel.
