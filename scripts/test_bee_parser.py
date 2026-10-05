import os
import sys
import re
import json
import pandas as pd
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

# Regex to detect latitude and longitude pair
# In BEE data: lat is around 18.xxxxx and lon is around 73.xxxxx for Pune/Maharashtra
# More generally: lat: \d{1,2}\.\d{4,8} and lon: \d{2,3}\.\d{4,8}
COORD_PATTERN = re.compile(r'(\d{1,2}\.\d{4,8})\s+(\d{2,3}\.\d{4,8})')

def parse_page_records(page_text):
    records = []
    # Split text by CPO prefixes or common patterns
    # Each entry usually has coords followed by charger details
    matches = list(COORD_PATTERN.finditer(page_text))
    for i, m in enumerate(matches):
        lat = float(m.group(1))
        lon = float(m.group(2))
        
        # Check if coordinates match Pune metropolitan region (with buffer for expressway / PCMC / outskirts)
        # Lat: 18.30 to 18.80, Lon: 73.60 to 74.15
        is_pune_box = (18.30 <= lat <= 18.80) and (73.60 <= lon <= 74.15)
        
        # Text preceding coords has address & CPO
        start_idx = matches[i-1].end() if i > 0 else 0
        pre_text = page_text[start_idx:m.start()].strip()
        
        # Text following coords has charger type, rating, connectors
        next_start = matches[i+1].start() if i+1 < len(matches) else len(page_text)
        post_text = page_text[m.end():next_start].strip()
        
        if is_pune_box or ("pune" in pre_text.lower()) or ("pimpri" in pre_text.lower()) or ("chinchwad" in pre_text.lower()):
            records.append({
                "lat": lat,
                "lon": lon,
                "pre_text": pre_text,
                "post_text": post_text
            })
    return records

reader = PdfReader("data/raw/BEE_EV_PCS_Data.pdf")
print("Scanning pages 650-750 for sample parsing...")
found = []
for p in range(650, 750):
    text = reader.pages[p].extract_text()
    if "pune" in text.lower() or "maharashtra" in text.lower():
        recs = parse_page_records(text)
        if recs:
            for r in recs:
                r["page"] = p
            found.extend(recs)

print(f"Extracted {len(found)} candidate Pune records from sample range 650-750:")
for r in found[:5]:
    print("---------------------------------")
    print(f"Page {r['page']} | Coords: {r['lat']}, {r['lon']}")
    print("PRE:", r['pre_text'][-150:])
    print("POST:", r['post_text'][:120])
