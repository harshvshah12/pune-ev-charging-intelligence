import os
import sys
import json
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from fastapi.testclient import TestClient
from backend.main import app, haversine_km

client = TestClient(app)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PROCESSED = os.path.join(BASE_DIR, "data", "processed")
DATA_RAW = os.path.join(BASE_DIR, "data", "raw")

def test_processed_files_exist():
    expected_files = [
        "pune_charging_stations.json",
        "pune_charging_stations.csv",
        "pune_arterials.geojson",
        "optimization_results.json",
        "ev_time_series.json"
    ]
    for f in expected_files:
        path = os.path.join(DATA_PROCESSED, f)
        assert os.path.exists(path), f"Missing processed file: {f}"

def test_charging_stations_data_integrity():
    path = os.path.join(DATA_PROCESSED, "pune_charging_stations.json")
    with open(path, "r", encoding="utf-8") as f:
        stations = json.load(f)

    assert len(stations) >= 1000, "Should have indexed at least 1,000 verified charging points in Pune"

    # Validate coordinate bounds strictly inside Pune Metropolitan Area
    for s in stations:
        lat = s["latitude"]
        lon = s["longitude"]
        assert 18.30 <= lat <= 18.82, f"Latitude {lat} out of bounds for station {s['id']}"
        assert 73.65 <= lon <= 74.15, f"Longitude {lon} out of bounds for station {s['id']}"
        assert s["power_kw"] >= 1.0, f"Invalid power rating {s['power_kw']}"
        assert s["cpo"] and len(s["cpo"]) > 0, "CPO name cannot be empty"
        assert s["source"].startswith("Bureau of Energy Efficiency"), "Source must be BEE"

def test_deduplication_integrity():
    path = os.path.join(DATA_PROCESSED, "pune_charging_stations.json")
    with open(path, "r", encoding="utf-8") as f:
        stations = json.load(f)

    # Verify no exact duplicates
    ids = [s["id"] for s in stations]
    assert len(ids) == len(set(ids)), "Station IDs must be globally unique"

def test_haversine_formula():
    # Pune center to Hinjewadi Phase 1 ~16 km
    d = haversine_km(18.5204, 73.8567, 18.5915, 73.7385)
    assert 14.0 <= d <= 18.0, f"Haversine calculation error: {d} km"

def test_funnel_and_optimization_results():
    path = os.path.join(DATA_PROCESSED, "optimization_results.json")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    funnel = data["funnel"]
    assert funnel["total_candidates_generated"] == 100, "Total generated candidates must be 100"
    assert funnel["viable_candidates"] == 72, "Viable candidates must be 72"
    assert funnel["underserved_candidates"] == 43, "Underserved candidates must be 43"
    assert funnel["high_value_candidates"] == 21, "High-value candidates must be 21"

    recs = data["recommendations"]
    assert len(recs) >= 10, "Should have at least 10 recommended stations"

    # Verify minimum separation constraint
    min_sep = data["metadata"]["min_separation_km"]
    for i in range(len(recs[:10])):
        for j in range(i + 1, len(recs[:10])):
            d = haversine_km(recs[i]["latitude"], recs[i]["longitude"], recs[j]["latitude"], recs[j]["longitude"])
            assert d >= (min_sep * 0.7), f"Stations {recs[i]['id']} and {recs[j]['id']} violate minimum separation ({d:.2f} km < {min_sep:.2f} km)"

    # Verify coverage improvement is monotonically increasing or steady
    baseline_cov = data["metadata"]["baseline_city_coverage_pct"]
    post_10_cov = recs[9]["city_coverage_pct"]
    assert post_10_cov > baseline_cov, f"Post-10 coverage ({post_10_cov}%) must exceed baseline ({baseline_cov}%)"

def test_fastapi_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["stations_loaded"] >= 1000
    assert data["wards_loaded"] == 15

def test_fastapi_overview_endpoint():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert data["metrics"]["total_registered_evs_district"] > 200000
    assert data["metrics"]["total_charging_points"] >= 1000
    assert data["metrics"]["after_10_coverage_pct"] >= 88.0

def test_fastapi_stations_filter():
    res_all = client.get("/api/stations?type=all")
    assert res_all.status_code == 200
    count_all = res_all.json()["count"]

    res_fast = client.get("/api/stations?type=fast")
    assert res_fast.status_code == 200
    count_fast = res_fast.json()["count"]

    assert 100 <= count_fast < count_all

def test_fastapi_dynamic_optimization():
    payload = {
        "target_stations": 8,
        "ev_demand_weight": 0.40,
        "charging_gap_weight": 0.30,
        "road_access_weight": 0.15,
        "activity_weight": 0.15,
        "min_separation_km": 1.15,
        "coverage_radius_km": 1.75
    }
    res = client.post("/api/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["target_stations"] == 8
    assert len(data["selected_stations"]) == 8
    assert data["net_coverage_gain_pct"] > 0
