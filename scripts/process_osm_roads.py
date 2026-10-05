import os
import sys
import json
import math
from shapely.geometry import LineString, mapping

sys.stdout.reconfigure(encoding='utf-8')

raw_path = "data/raw/pune_osm_arterials_raw.json"
if not os.path.exists(raw_path):
    print(f"{raw_path} not found!")
    sys.exit(1)

with open(raw_path, "r", encoding="utf-8") as f:
    raw_data = json.load(f)

elements = raw_data.get("elements", [])
print(f"Total raw OSM road elements: {len(elements)}")

features = []
total_length_km = 0.0

for elem in elements:
    if elem.get("type") != "way":
        continue
    geom_pts = elem.get("geometry", [])
    if len(geom_pts) < 2:
        continue

    coords = [[pt["lon"], pt["lat"]] for pt in geom_pts]
    tags = elem.get("tags", {})
    name = tags.get("name") or tags.get("name:en") or tags.get("ref") or "Unnamed Arterial"
    highway = tags.get("highway", "primary")
    ref = tags.get("ref", "")
    oneway = tags.get("oneway", "no")
    maxspeed = tags.get("maxspeed", "")

    # Calculate approximate road segment length
    # 1 deg lat ~= 111 km, 1 deg lon ~= 105 km in Pune
    seg_len_km = 0.0
    for k in range(len(coords) - 1):
        dx = (coords[k+1][0] - coords[k][0]) * 105.0
        dy = (coords[k+1][1] - coords[k][1]) * 111.0
        seg_len_km += math.sqrt(dx*dx + dy*dy)
    total_length_km += seg_len_km

    features.append({
        "type": "Feature",
        "id": elem.get("id"),
        "properties": {
            "id": elem.get("id"),
            "name": name,
            "highway": highway,
            "ref": ref,
            "oneway": oneway,
            "length_km": round(seg_len_km, 3)
        },
        "geometry": {
            "type": "LineString",
            "coordinates": coords
        }
    })

geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "source": "OpenStreetMap Contributors (ODbL)",
        "region": "Pune Metropolitan Area",
        "total_segments": len(features),
        "total_length_km": round(total_length_km, 2)
    },
    "features": features
}

os.makedirs("data/processed", exist_ok=True)
out_path = "data/processed/pune_arterials.geojson"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(geojson, f)

size_mb = os.path.getsize(out_path) / (1024 * 1024)
print(f"Processed {len(features)} road segments ({total_length_km:.1f} km total). Saved to {out_path} ({size_mb:.2f} MB)")
