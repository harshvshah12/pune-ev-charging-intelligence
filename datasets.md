# Datasets Documentation: VoltPune EV Infrastructure Platform

## 1. Primary Geospatial & Mobility Datasets

| Metadata Field | Dataset 1: Public EV Charging Stations | Dataset 2: EV Registrations & Adoption | Dataset 3: Municipal Administrative Wards | Dataset 4: Road Network & Corridors |
| :--- | :--- | :--- | :--- | :--- |
| **Dataset Name** | National Public EV Charging Stations Registry | VAHAN National Vehicle Registration Dashboard | Pune Municipal Corporation (PMC) Wards GeoJSON | OpenStreetMap Maharashtra / Pune Extract |
| **Source Authority** | Bureau of Energy Efficiency (BEE), Ministry of Power | Ministry of Road Transport and Highways (MoRTH) | DataMeet India Municipal Spatial Data | OpenStreetMap Contributors / Geofabrik GmbH |
| **Direct URL** | https://www.beeindia.gov.in | https://analytics.parivahan.gov.in | https://github.com/datameet/Pune_wards | https://download.geofabrik.de/asia/india.html |
| **Release / Retrieval** | October 26, 2025 (Official Gazette) | March 2026 (Historical 2020–2026 series) | Official PMC Delimitation Survey | OSM 2025/2026 Snapshot |
| **License / Usage** | Government Open Data License (India) / Public Domain | MoRTH Public Analytics Portal / Open Access | Open Data Commons Open Database License (ODbL) | Open Database License (ODbL 1.0) |
| **Spatial Scope** | Pune District & PMC Metropolitan Region | Pune District RTO (MH-12) & Core PMC Limits | 15 Administrative Wards of PMC | Pune Metropolitan Area Major Arterials |
| **Raw Format** | Official Gazette PDF Table | Structured Analytics Web Ingestion / Tabular CSV | GeoJSON Polygons (EPSG:4326) | OSM XML / Protocolbuffer (.osm.pbf) |
| **Total Records** | **1,354 Charging Points** (162 Fast DC Units) | **264,166 Registered EVs** (72,500 core PMC) | **15 Administrative Wards** | **532.6 km Primary & Secondary Arterials** |

---

## 2. Rationale for Dataset Selection
1. **Authoritative Statutory Compliance**: The Bureau of Energy Efficiency (BEE) is India's designated central agency under the Ministry of Power for public charging infrastructure. Using their official October 2025 gazette ensures that every charging station in our baseline represents a verified, operational facility rather than unverified crowd-sourced points.
2. **True District-Level Demand Grounding**: MoRTH VAHAN provides real vehicle registration counts. Instead of simulating synthetic EV adoption, VoltPune uses the authentic 264,166 vehicle registration history from 2020 to 2026 across electric 2-wheelers, 3-wheelers, and 4-wheelers.
3. **Official Administrative Boundaries**: Planning municipal capital expenditure requires mapping to official administrative wards recognized by the Pune Municipal Corporation (PMC). DataMeet's peer-reviewed GeoJSON provides accurate polygon geometry for spatial joins.
4. **Topological Realism via OpenStreetMap**: Electric vehicle charging access is strictly bounded by road network accessibility. Incorporating 532.6 km of OSM arterials prevents siting stations in inaccessible geographic barriers (e.g., hill slopes, lakes, or military cantonment restrictions).

---

## 3. Comprehensive Feature Dictionaries

### 3.1 Charging Stations Dataset (`pune_charging_stations.json`)

| Field Name | Type | Description | Source / Provenance |
| :--- | :--- | :--- | :--- |
| `id` | String | Unique identifier (e.g., `PUN-BEE-0001`) | Generated system key |
| `name` | String | Station display name or commercial facility | BEE Gazette Table |
| `cpo` | String | Charge Point Operator (e.g., Tata Power, Jio-bp, Ather, Statiq) | BEE Gazette Table |
| `latitude` | Float | Geocoded WGS84 Latitude ($18.30^\circ\text{N} - 18.82^\circ\text{N}$) | Verified via Nominatim / Google Geocoding |
| `longitude` | Float | Geocoded WGS84 Longitude ($73.65^\circ\text{E} - 74.15^\circ\text{E}$) | Verified via Nominatim / Google Geocoding |
| `power_kw` | Float | Total installed charging capacity in kilowatts | BEE Technical Specifications |
| `charger_type`| String | Connector standard (`CCS-2`, `Type-2 AC`, `CHAdeMO`, `Bharat AC-001`)| Standardized connector classification |
| `is_fast` | Boolean | True if $\text{power\_kw} \ge 7.4\text{ kW}$ (DC Fast Charging) | Derived threshold |
| `ward_id` | Integer | ID of containing PMC ward ($1 - 15$) | Spatial Point-in-Polygon Join |
| `ward_name` | String | Name of containing PMC ward (e.g., `Hadapsar - Mundhwa`) | Spatial Point-in-Polygon Join |
| `status` | String | Operational status (`Active`, `Maintenance`, `Planned`) | Gazette Operational State |

### 3.2 Municipal Administrative Wards Dataset (`pune_wards_analytical.json`)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `ward_id` | Integer | PMC administrative ward code (1 to 15) |
| `ward_name` | String | Official ward title (e.g., `Kothrud - Bavdhan`, `Hadapsar - Mundhwa`) |
| `area_sqkm` | Float | Geographical surface area in square kilometers |
| `population_est` | Integer | Projected ward residential population |
| `ev_registered_est`| Integer | Ward-allocated registered EV fleet based on housing and commercial density |
| `existing_chargers`| Integer | Count of existing operational BEE charging stations located inside ward |
| `fast_chargers` | Integer | Count of fast charging points ($\ge 7.4\text{ kW}$) inside ward |
| `evs_per_charger` | Float | Deficit ratio: $\text{ev\_registered\_est} / \text{existing\_chargers}$ |
| `need_score` | Float | Normalized Charging Need Score ($0.0 - 100.0$) |
| `geometry` | Polygon | WGS84 boundary polygon for choropleth mapping |

### 3.3 Historical EV Time Series Dataset (`ev_time_series.json`)

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `year` | Integer | Calendar year ($2020, 2021, 2022, 2023, 2024, 2025, 2026$) |
| `two_wheelers` | Integer | Registered Electric 2-Wheelers (E2W) in Pune District |
| `three_wheelers` | Integer | Registered Electric 3-Wheelers (E3W / Commercial Rickshaws) |
| `four_wheelers` | Integer | Registered Electric 4-Wheelers (E4W / Passenger Cars & Fleets) |
| `buses_and_commercial`| Integer| Registered Electric Buses (PMPML) & Heavy Commercial Vehicles |
| `total_district_evs`| Integer| Cumulative district total from MoRTH VAHAN |

---

## 4. Preprocessing & Validation Pipeline

### 4.1 Coordinate Bounding & Outlier Purging
All geocoded locations undergo strict spatial boundary checks. Points falling outside the bounding box of the Pune Metropolitan Region ($18.30^\circ\text{N} \le \text{lat} \le 18.82^\circ\text{N}$ and $73.65^\circ\text{E} \le \text{lon} \le 74.15^\circ\text{E}$) are flagged as erroneous and either manually corrected or purged.

### 4.2 Deduplication Protocol
1. **Exact Duplicate Removal**: Purges records with identical station names, operator strings, and geolocations.
2. **Proximity Clustering**: Stations with different commercial titles situated within $< 25\text{ meters}$ of an existing coordinate are inspected to verify whether they represent separate charging dispensers at the same physical hub or duplicate records. Dispenser capacities are aggregated into a single charging hub entity.

### 4.3 Spatial Geometry Healing
Ward boundary polygons from DataMeet undergo topological repair via `shapely.validation.make_valid` to resolve self-intersecting rings or duplicate vertices, ensuring 100% watertight point-in-polygon spatial joins.
