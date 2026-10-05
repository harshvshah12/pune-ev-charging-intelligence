import os
import sys
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

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
        print(f"  [FAILED] HTTP {res.status_code}")
        return False

# Download EV_PCS_Data_29277.pdf
pcs_file = "data/raw/BEE_EV_PCS_Data.pdf"
download_file("https://www.beeindia.gov.in/WriteReadData/RTF1984/EV_PCS_Data_29277.pdf", pcs_file)

if os.path.exists(pcs_file):
    reader = PdfReader(pcs_file)
    print(f"\nPages in {pcs_file}: {len(reader.pages)}")
    for i in range(min(3, len(reader.pages))):
        print(f"--- PAGE {i+1} ---")
        text = reader.pages[i].extract_text()
        for line in text.split("\n")[:20]:
            print(" ", line)
