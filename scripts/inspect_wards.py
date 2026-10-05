import os
import sys
import json
from shapely.geometry import shape, Point
from shapely.validation import make_valid

sys.stdout.reconfigure(encoding='utf-8')

with open("data/raw/pune-admin-wards_2017.geojson", "r", encoding="utf-8") as f:
    data = json.load(f)

features = data.get("features", [])
print(f"Total administrative wards in pune-admin-wards_2017.geojson: {len(features)}")

ward_summary = []
for i, feat in enumerate(features):
    props = feat.get("properties", {})
    geom = shape(feat.get("geometry"))
    if not geom.is_valid:
        geom = make_valid(geom)
    name = props.get("name") or props.get("ward_name") or props.get("WARD_NAME") or props.get("Name") or f"Ward-{i+1}"
    centroid = geom.centroid
    bounds = geom.bounds # minx, miny, maxx, maxy
    ward_summary.append({
        "index": i,
        "name": name,
        "properties": props,
        "centroid": [centroid.y, centroid.x], # lat, lon
        "bounds": bounds,
        "area_sq_deg": geom.area
    })

print("\nSample Wards:")
for w in ward_summary[:10]:
    print(f"  [{w['index']+1}] {w['name']} | Centroid: Lat {w['centroid'][0]:.4f}, Lon {w['centroid'][1]:.4f} | Props: {w['properties']}")
