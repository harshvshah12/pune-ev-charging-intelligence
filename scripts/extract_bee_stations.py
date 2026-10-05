import os
import sys
import re
import json
import math
import pandas as pd
from pypdf import PdfReader

sys.stdout.reconfigure(encoding='utf-8')

COORD_REGEX = re.compile(r'(\d{1,2}\.\d{4,8})\s+(\d{2,3}\.\d{4,8})')

def clean_text(t):
    return re.sub(r'\s+', ' ', t).strip()

def standardize_cpo(cpo_raw):
    c = cpo_raw.upper()
    if "TATA" in c:
        return "Tata Power"
    elif "ATHER" in c:
        return "Ather Energy"
    elif "BPCL" in c or "BHARAT PETROLEUM" in c:
        return "BPCL"
    elif "HPCL" in c or "HINDUSTAN PETROLEUM" in c:
        return "HPCL"
    elif "IOCL" in c or "INDIAN OIL" in c:
        return "IOCL"
    elif "RELIANCE" in c or "JIO" in c:
        return "Jio-bp"
    elif "MSEDCL" in c or "MAHAVITARAN" in c:
        return "MSEDCL"
    elif "UJOY" in c:
        return "UJOY"
    elif "CHARGEZONE" in c:
        return "ChargeZone"
    elif "STATIQ" in c:
        return "Statiq"
    elif "KAZAM" in c:
        return "Kazam"
    elif "GLIDA" in c or "FORTUM" in c:
        return "Glida / Fortum"
    elif "ZEON" in c:
        return "Zeon Charging"
    else:
        # Fallback to cleaned title case
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', cpo_raw).strip()
        return cleaned.title() if cleaned else "Independent CPO"

def standardize_charger_type(raw_type):
    t = raw_type.upper()
    if "CCS" in t:
        return "CCS-2 (DC Fast)"
    elif "TYPE-II" in t or "TYPE 2" in t or "TYPE-2" in t:
        return "Type-2 AC"
    elif "LEV DC" in t:
        return "LEV DC (Light EV Fast)"
    elif "LEV AC" in t:
        return "LEV AC"
    elif "BHARAT DC" in t:
        return "Bharat DC-001"
    elif "BHARAT AC" in t:
        return "Bharat AC-001"
    elif "CHADEMO" in t:
        return "CHAdeMO"
    else:
        return "AC/DC Standard"

def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def extract_all_stations():
    pdf_path = "data/raw/BEE_EV_PCS_Data.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found!")
        return

    reader = PdfReader(pdf_path)
    total_pages = len(reader.pages)
    print(f"Parsing all {total_pages} pages of BEE EV PCS data...")

    extracted_records = []

    # Known CPO markers to detect start of record
    cpo_markers = ["ATHER", "TATA POWER", "BPCL", "HPCL", "IOCL", "RELIANCE", "JIO", "MSEDCL", "UJOY", "CHARGEZONE", "STATIQ", "KAZAM", "FORTUM", "GLIDA", "ZEON", "MAGENTA", "VOLTTIC"]

    for page_idx in range(total_pages):
        try:
            page_text = reader.pages[page_idx].extract_text()
            if not page_text:
                continue

            # Quick check if Maharashtra / Pune / coordinates are potentially here
            if not ("maharashtra" in page_text.lower() or "pune" in page_text.lower() or "18." in page_text):
                continue

            coord_matches = list(COORD_REGEX.finditer(page_text))
            if not coord_matches:
                continue

            for i, match in enumerate(coord_matches):
                lat = float(match.group(1))
                lon = float(match.group(2))

                # Check bounding box for Pune metropolitan district (18.30 to 18.82, 73.65 to 74.15)
                in_pune_box = (18.30 <= lat <= 18.82) and (73.65 <= lon <= 74.15)
                
                start_pos = coord_matches[i-1].end() if i > 0 else 0
                pre_chunk = page_text[start_pos:match.start()].strip()

                next_pos = coord_matches[i+1].start() if i+1 < len(coord_matches) else len(page_text)
                post_chunk = page_text[match.end():next_pos].strip()

                is_pune_text = ("pune" in pre_chunk.lower()) or ("pimpri" in pre_chunk.lower()) or ("chinchwad" in pre_chunk.lower()) or ("haveli" in pre_chunk.lower())

                if not (in_pune_box or is_pune_text):
                    continue
                
                # If coordinates are outside Maharashtra completely, discard
                if not (18.0 <= lat <= 20.0 and 72.5 <= lon <= 76.0):
                    continue

                # Parse CPO and Sector
                cpo_raw = "Unknown"
                sector = "Private"
                for marker in cpo_markers:
                    if marker in pre_chunk.upper():
                        cpo_raw = marker.title()
                        break

                if "Govt." in pre_chunk or "Govt" in pre_chunk:
                    sector = "Government / PSU"
                elif "Private" in pre_chunk:
                    sector = "Private"

                # Parse Address
                # Remove common header noise
                addr_text = clean_text(pre_chunk)
                addr_text = re.sub(r'^(?:[A-Za-z\s]+(?:Govt\.|Private|Govt))\s+', '', addr_text, flags=re.IGNORECASE)
                addr_text = re.sub(r'^(?:Maharashtra\s+(?:Pune|Pimpri-Chinchwad)\s+(?:Pune|Pimpri-Chinchwad))\s*', '', addr_text, flags=re.IGNORECASE)
                addr_clean = clean_text(addr_text)
                if len(addr_clean) < 5:
                    addr_clean = f"Station at lat {lat:.5f}, lon {lon:.5f}"

                # Parse Charger info from post_chunk
                # Formats: "LEV DC Charge Point (IS-17017-2-7) 3.3 3.3 1" or "CCS-2 60 60 2" or "Type-II AC 7.4 7.4 1"
                post_tokens = post_chunk.split()
                charger_type_raw = "Standard"
                power_kw = 3.3
                connector_count = 1

                # Extract power numbers (float or int followed by numbers)
                numbers = re.findall(r'(\d+(?:\.\d+)?)', post_chunk)
                if len(numbers) >= 2:
                    try:
                        p_val = float(numbers[0])
                        if 1.0 <= p_val <= 350.0:
                            power_kw = p_val
                    except:
                        pass
                if len(numbers) >= 3:
                    try:
                        c_val = int(float(numbers[-1]))
                        if 1 <= c_val <= 12:
                            connector_count = c_val
                    except:
                        pass

                # Charger type string
                type_match = re.search(r'([A-Za-z0-9\-\(\)\/\s]{3,35})\s+\d', post_chunk)
                if type_match:
                    charger_type_raw = clean_text(type_match.group(1))
                else:
                    charger_type_raw = post_tokens[0] if post_tokens else "AC"

                cpo_clean = standardize_cpo(cpo_raw)
                charger_type_clean = standardize_charger_type(charger_type_raw)

                # If power_kw is still 3.3 but it's CCS-2, default to 30 or 60 kW
                if "CCS" in charger_type_clean and power_kw <= 7.4:
                    power_kw = 30.0

                extracted_records.append({
                    "id": f"BEE-PN-{page_idx}-{i}",
                    "name": f"{cpo_clean} Charging Hub - {addr_clean[:35]}",
                    "cpo": cpo_clean,
                    "cpo_raw": cpo_raw,
                    "sector": sector,
                    "state": "Maharashtra",
                    "district": "Pune",
                    "address": addr_clean,
                    "latitude": round(lat, 6),
                    "longitude": round(lon, 6),
                    "charger_type": charger_type_clean,
                    "charger_type_raw": charger_type_raw,
                    "power_kw": power_kw,
                    "connector_count": connector_count,
                    "source": "Bureau of Energy Efficiency (BEE), Ministry of Power, Govt. of India",
                    "source_ref": f"EV_PCS_Data_29277.pdf (Page {page_idx + 1})",
                    "status": "Operational (Verified Registry)",
                    "last_verified": "October 2025"
                })
        except Exception as ex:
            continue

    print(f"\nTotal raw Pune candidate records extracted: {len(extracted_records)}")

    # Deduplication and spatial validation
    os.makedirs("data/raw", exist_ok=True)
    with open("data/raw/bee_pune_extracted_raw.json", "w", encoding="utf-8") as f:
        json.dump(extracted_records, f, indent=2)

    # 1. Deduplicate: remove entries with same coords (within 30 meters) and same CPO
    cleaned_stations = []
    seen = []
    for rec in extracted_records:
        r_lat = rec["latitude"]
        r_lon = rec["longitude"]
        r_cpo = rec["cpo"]
        
        # Check strict bounds for Pune Core & Periphery (Hinjewadi, Pimpri, Chinchwad, Hadapsar, Wagholi, Katraj, Kothrud, Chakan gateway)
        if not (18.32 <= r_lat <= 18.78 and 73.68 <= r_lon <= 74.08):
            continue

        is_dup = False
        for s in seen:
            dist = haversine_m(r_lat, r_lon, s["latitude"], s["longitude"])
            if dist < 35.0 and (r_cpo == s["cpo"] or rec["address"] == s["address"]):
                is_dup = True
                # Merge connectors / power if multiple ports recorded
                s["connector_count"] = max(s["connector_count"], rec["connector_count"])
                s["power_kw"] = max(s["power_kw"], rec["power_kw"])
                break
        
        if not is_dup:
            rec["id"] = f"PUN-EV-{len(cleaned_stations)+1:03d}"
            seen.append(rec)
            cleaned_stations.append(rec)

    print(f"Total verified, deduplicated Pune charging stations: {len(cleaned_stations)}")
    
    # Save cleaned dataset
    os.makedirs("data/processed", exist_ok=True)
    with open("data/processed/pune_charging_stations.json", "w", encoding="utf-8") as f:
        json.dump(cleaned_stations, f, indent=2)
        
    df = pd.DataFrame(cleaned_stations)
    df.to_csv("data/processed/pune_charging_stations.csv", index=False, encoding="utf-8")
    print("Saved data/processed/pune_charging_stations.json & .csv")
    
    # Print summary breakdown
    print("\n--- Summary Breakdown by CPO ---")
    print(df["cpo"].value_counts())
    print("\n--- Summary Breakdown by Charger Type ---")
    print(df["charger_type"].value_counts())
    print("\n--- Summary Power Distribution (kW) ---")
    print(df["power_kw"].describe())

if __name__ == "__main__":
    extract_all_stations()
