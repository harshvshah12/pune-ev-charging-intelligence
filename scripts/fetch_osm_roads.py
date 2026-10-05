import os
import sys
import json
import requests

sys.stdout.reconfigure(encoding='utf-8')

mirrors = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]

# High-level arterial spine: motorway, trunk, primary for Pune
query = """
[out:json][timeout:30];
(
  way["highway"~"motorway|trunk|primary"](18.44,73.76,18.62,73.95);
);
out geom;
"""

success = False
for ep in mirrors:
    print(f"Trying {ep} ...")
    try:
        res = requests.post(ep, data={"data": query}, headers={"User-Agent": "VoltPuneRoads/1.0"}, timeout=35)
        if res.status_code == 200:
            data = res.json()
            elems = data.get("elements", [])
            print(f"  SUCCESS! Received {len(elems)} road elements from {ep}")
            with open("data/raw/pune_osm_arterials_raw.json", "w", encoding="utf-8") as f:
                json.dump(data, f)
            success = True
            break
        else:
            print(f"  HTTP {res.status_code}")
    except Exception as e:
        print(f"  Error: {e}")

if not success:
    print("Could not fetch from overpass mirrors, will check alternative OSM sources.")
