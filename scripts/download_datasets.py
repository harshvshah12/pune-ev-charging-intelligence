import os
import re
import json
import requests
from urllib.parse import urljoin

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def inspect_bee():
    url = "https://www.beeindia.gov.in/show_content.php?lang=1&level=2&lid=67&ls_id=345"
    print("Fetching BEE portal:", url)
    res = requests.get(url, headers=headers, timeout=15)
    html = res.text
    
    # Save raw html
    os.makedirs("data/raw", exist_ok=True)
    with open("data/raw/bee_portal_page.html", "w", encoding="utf-8") as f:
        f.write(html)
        
    print(f"Saved BEE page ({len(html)} bytes). Searching links...")
    links = re.findall(r'href=[\'"]([^\'"]+)', html, re.IGNORECASE)
    data_links = []
    for l in links:
        if any(ext in l.lower() for ext in ['.pdf', '.xlsx', '.csv', '.zip', 'pcs', 'charging', 'station']):
            full_url = urljoin(url, l)
            data_links.append((l, full_url))
            
    print(f"Found {len(data_links)} relevant links:")
    for orig, full in set(data_links):
        print(f"  -> {orig} -> {full}")

def inspect_datameet():
    print("\nInspecting GitHub DataMeet Pune repo files via GitHub API...")
    repos = [
        "https://api.github.com/repos/datameet/Pune_wards/contents",
        "https://api.github.com/repos/datameet/Municipal_Spatial_Data/contents/Pune",
        "https://api.github.com/repos/opendatapune/data/contents"
    ]
    for api_url in repos:
        try:
            r = requests.get(api_url, headers=headers, timeout=10)
            if r.status_code == 200:
                items = r.json()
                print(f"Files in {api_url}:")
                for item in items:
                    name = item.get("name")
                    download_url = item.get("download_url")
                    print(f"   * {name} -> {download_url}")
            else:
                print(f"Failed to query {api_url}: status {r.status_code}")
        except Exception as e:
            print(f"Error querying {api_url}: {e}")

if __name__ == "__main__":
    inspect_bee()
    inspect_datameet()
