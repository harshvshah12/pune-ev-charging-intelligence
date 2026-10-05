import os
import sys
import json
import math
import pandas as pd
from shapely.geometry import shape, Point
from shapely.validation import make_valid

sys.stdout.reconfigure(encoding='utf-8')

# Load charging stations
with open("data/processed/pune_charging_stations.json", "r", encoding="utf-8") as f:
    stations = json.load(f)
print(f"Loaded {len(stations)} verified charging stations.")

# Load PMC wards
with open("data/raw/pune-admin-wards_2017.geojson", "r", encoding="utf-8") as f:
    pmc_geojson = json.load(f)

# Load PCMC wards
pcmc_geojson = None
if os.path.exists("data/raw/pcmc-electoral-wards.geojson"):
    with open("data/raw/pcmc-electoral-wards.geojson", "r", encoding="utf-8") as f:
        pcmc_geojson = json.load(f)

# Build list of parsed ward polygons
ward_polys = []
for feat in pmc_geojson.get("features", []):
    geom = shape(feat["geometry"])
    if not geom.is_valid:
        geom = make_valid(geom)
    name = feat.get("properties", {}).get("name", "Unknown Ward")
    ward_polys.append({
        "name": name,
        "region": "PMC",
        "geometry": geom,
        "feature": feat
    })

if pcmc_geojson:
    for feat in pcmc_geojson.get("features", []):
        geom = shape(feat["geometry"])
        if not geom.is_valid:
            geom = make_valid(geom)
        name = feat.get("properties", {}).get("name") or feat.get("properties", {}).get("Ward_Name") or "PCMC Ward"
        ward_polys.append({
            "name": f"PCMC - {name}",
            "region": "PCMC",
            "geometry": geom,
            "feature": feat
        })

print(f"Total wards loaded: {len(ward_polys)} ({len(pmc_geojson.get('features', []))} PMC + {len(pcmc_geojson.get('features', [])) if pcmc_geojson else 0} PCMC)")

# Spatially join each station to a ward
matched = 0
ward_counts = {}
for s in stations:
    pt = Point(s["longitude"], s["latitude"])
    assigned_ward = "Outskirts / Fringe / Highway Corridor"
    assigned_region = "Greater Pune"
    for wp in ward_polys:
        if wp["geometry"].contains(pt):
            assigned_ward = wp["name"]
            assigned_region = wp["region"]
            matched += 1
            break
    s["ward"] = assigned_ward
    s["region"] = assigned_region
    ward_counts[assigned_ward] = ward_counts.get(assigned_ward, 0) + 1

print(f"Direct point-in-polygon matched: {matched} / {len(stations)} stations ({matched/len(stations)*100:.1f}%)")
print("\nTop 10 Wards by Station Count:")
for w, cnt in sorted(ward_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
    print(f"  {w}: {cnt} stations")
