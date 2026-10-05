import os
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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

def fetch_github_contents(owner_repo, path=""):
    url = f"https://api.github.com/repos/{owner_repo}/contents/{path}".rstrip("/")
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Authorization": f"token {GH_TOKEN}"
    }
    print(f"Querying GitHub API: {url} ...")
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        return r.json()
    else:
        print(f"Error {r.status_code}: {r.text[:200]}")
        return None

if __name__ == "__main__":
    # 1. Download BEE Maharashtra EV Public Charging Stations PDF
    download_file(
        "https://www.beeindia.gov.in/WriteReadData/RTF1984/Maharastra.pdf",
        "data/raw/BEE_Maharashtra_PCS.pdf"
    )
    
    # 2. Check DataMeet repos via GitHub API
    for repo, subpath in [("datameet/Pune_wards", ""), ("datameet/Municipal_Spatial_Data", "Pune"), ("opendatapune/data", "")]:
        data = fetch_github_contents(repo, subpath)
        if data:
            print(f"=== {repo}/{subpath} ===")
            for item in data:
                print(f"  {item.get('type')}: {item.get('name')} -> {item.get('download_url')}")
