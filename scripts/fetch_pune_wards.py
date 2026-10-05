import os
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0",
}
GH_TOKEN = os.environ.get("GITHUB_TOKEN", "")
if GH_TOKEN:
    HEADERS["Authorization"] = f"token {GH_TOKEN}"

def download_file(url, target_path):
    print(f"Downloading {url} -> {target_path} ...")
    os.makedirs(os.path.dirname(target_path), exist_ok=True)
    res = requests.get(url, headers=HEADERS, stream=True, timeout=30)
    if res.status_code == 200:
        with open(target_path, "wb") as f:
            for chunk in res.iter_content(chunk_size=16384):
                f.write(chunk)
        size = os.path.getsize(target_path)
        print(f"  [SUCCESS] Saved {target_path} ({size:,} bytes)")
        return True
    else:
        print(f"  [FAILED] HTTP {res.status_code} for {url}")
        return False

def check_geodata():
    url = "https://api.github.com/repos/datameet/Pune_wards/contents/GeoData"
    r = requests.get(url, headers=HEADERS)
    if r.status_code == 200:
        for item in r.json():
            print(f"  GeoData: {item.get('name')} -> {item.get('download_url')}")
            if item.get('download_url') and item.get('name').endswith('.geojson'):
                download_file(item.get('download_url'), f"data/raw/{item.get('name')}")

if __name__ == "__main__":
    # Download official Pune GeoJSON files from Municipal Spatial Data
    files = [
        ("https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Pune/pune-admin-wards_2017.geojson", "data/raw/pune-admin-wards_2017.geojson"),
        ("https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Pune/pune-electoral-wards_2017.geojson", "data/raw/pune-electoral-wards_2017.geojson"),
        ("https://raw.githubusercontent.com/datameet/Municipal_Spatial_Data/master/Pune/pune-electoral-wards_2022.geojson", "data/raw/pune-electoral-wards_2022.geojson")
    ]
    for url, target in files:
        download_file(url, target)
        
    check_geodata()
