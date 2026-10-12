# REST API Documentation
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

Interactive Swagger OpenAPI UI: `http://127.0.0.1:8008/docs`  
Alternative ReDoc UI: `http://127.0.0.1:8008/redoc`

---

## Endpoints Summary

| Method | Endpoint | Description | Latency Benchmark |
| :--- | :--- | :--- | :---: |
| `GET` | `/` | API root, service status, and discoverability index | $< 2\text{ ms}$ |
| `GET` | `/api/health` | Service health, memory cache status, and entity counts | $< 2\text{ ms}$ |
| `GET` | `/api/overview` | Macro city metrics (264k district EVs, baseline & optimized coverage) | $< 4\text{ ms}$ |
| `GET` | `/api/stations` | Query charging points with optional filters (`type=all`, `fast`, `recommended`) | $< 12\text{ ms}$ |
| `GET` | `/api/wards` | Ingest 15 PMC wards with calculated Need Scores, deficits, and boundaries | $< 8\text{ ms}$ |
| `GET` | `/api/roads` | GeoJSON LineStrings for 532.6 km of Pune major arterial highway corridors | $< 15\text{ ms}$ |
| `POST` | `/api/optimize` | Dynamic Submodular Greedy Siting with real-time weight parameters | $< 45\text{ ms}$ |
| `GET` | `/api/time-series` | Historical annual EV registration trends across Pune District (2020–2026) | $< 3\text{ ms}$ |
| `GET` | `/api/corridors` | 8 arterial simulation corridors with low-battery pitstops and waypoints | $< 4\text{ ms}$ |

---

## 1. Dynamic Submodular Siting Endpoint

### Request: `POST /api/optimize`
Executes real-time submodular optimization over candidate spatial cells using client-specified criteria weights.

```json
{
  "target_stations": 10,
  "ev_demand_weight": 0.35,
  "charging_gap_weight": 0.35,
  "road_access_weight": 0.15,
  "activity_weight": 0.15,
  "min_separation_km": 1.15,
  "coverage_radius_km": 1.50
}
```

### Response: `200 OK`
```json
{
  "target_stations": 10,
  "baseline_coverage_pct": 83.5,
  "optimized_coverage_pct": 90.0,
  "net_coverage_gain_pct": 6.5,
  "average_nearest_distance_km": 0.99,
  "distance_reduction_pct": 10.0,
  "selected_stations": [
    {
      "id": "OPT-01",
      "name": "Hadapsar Gadital Transit Hub",
      "ward_name": "Hadapsar - Mundhwa",
      "ward_id": 13,
      "latitude": 18.5012,
      "longitude": 73.9365,
      "need_score": 92.4,
      "coverage_pct": 85.2,
      "distance_to_nearest_fast_km": 2.84,
      "evs_per_charger": 380.6,
      "explanation": "High EV deficit in Hadapsar (380.6 EVs/charger) with 2.84 km gap to nearest fast charger; captures major eastern arterial flow."
    },
    {
      "id": "OPT-02",
      "name": "Kharadi EON Free Zone North",
      "ward_name": "Nagar Road - Vadgaon Sheri",
      "ward_id": 7,
      "latitude": 18.5521,
      "longitude": 73.9510,
      "need_score": 89.1,
      "coverage_pct": 86.8,
      "distance_to_nearest_fast_km": 2.45,
      "evs_per_charger": 145.0,
      "explanation": "Major IT employment corridor on Nagar Road with high commercial activity and severe 2.45 km charging void."
    }
  ]
}
```

---

## 2. Macro Overview Endpoint

### Request: `GET /api/overview`

### Response: `200 OK`
```json
{
  "status": "success",
  "metrics": {
    "total_registered_evs_district": 264166,
    "core_pmc_registered_evs": 72500,
    "total_charging_points": 1354,
    "fast_chargers_count": 162,
    "baseline_coverage_pct": 83.5,
    "after_10_coverage_pct": 90.0,
    "net_coverage_gain_pct": 6.5,
    "avg_distance_to_fast_charger_km": 1.10,
    "post_optimization_distance_km": 0.99,
    "total_wards": 15,
    "top_deficit_ward": "Hadapsar - Mundhwa"
  }
}
```

---

## 3. Charging Stations Query Endpoint

### Request: `GET /api/stations?type=fast`
Query parameters:
- `type`: `all` (returns all 1,354 points), `fast` (returns 162 fast DC units $\ge 7.4\text{ kW}$), `recommended` (returns top 10 optimized sites).

### Response: `200 OK`
```json
{
  "count": 162,
  "filter": "fast",
  "stations": [
    {
      "id": "PUN-BEE-0012",
      "name": "Tata Power - Kothrud DP Road Fast Hub",
      "cpo": "Tata Power",
      "latitude": 18.5074,
      "longitude": 73.8077,
      "power_kw": 60.0,
      "charger_type": "CCS-2",
      "is_fast": true,
      "ward_id": 2,
      "ward_name": "Kothrud - Bavdhan",
      "status": "Active",
      "source": "Bureau of Energy Efficiency"
    }
  ]
}
```

---

## 4. Transit Corridors Endpoint

### Request: `GET /api/corridors`

### Response: `200 OK`
Returns the 8 authentic arterial transit journeys across Pune, detailing route coordinates, origin, destination, intermediate fast-charging pitstop, initial battery SoC ($14\% - 18\%$), and recharged post-pitstop SoC ($85\% - 90\%$).
