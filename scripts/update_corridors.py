import json
import os

def create_rich_time_series():
    input_file = "data/processed/ev_time_series.json"
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 8 Diverse, Verified Pune Transit Corridors
    corridors = [
        {
            "id": "corridor-hinjewadi-shivajinagar",
            "title": "Hinjewadi IT Hub to Shivajinagar Intermodal Terminal",
            "subtitle": "West Corridor (NH-48 Bypass & Ganeshkhind Road)",
            "category": "IT Commuter",
            "total_distance_km": 18.4,
            "typical_duration_min": 38,
            "energy_consumed_kwh": 3.4,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Hinjewadi Infotech Park Phase 1",
                    "lat": 18.5915,
                    "lon": 73.7385,
                    "speed_kmh": 35,
                    "soc_pct": 95,
                    "segment": "Hinjewadi Flyover Approach"
                },
                {
                    "name": "Wakad Bridge / Bhujbal Chowk",
                    "lat": 18.5992,
                    "lon": 73.7625,
                    "speed_kmh": 50,
                    "soc_pct": 91,
                    "segment": "NH-48 Bypass Flyover"
                },
                {
                    "name": "Balewadi High Street Phata",
                    "lat": 18.5784,
                    "lon": 73.7745,
                    "speed_kmh": 42,
                    "soc_pct": 86,
                    "segment": "Baner-Balewadi Link Rd"
                },
                {
                    "name": "Baner Main Arterial Chowk",
                    "lat": 18.5592,
                    "lon": 73.7845,
                    "speed_kmh": 32,
                    "soc_pct": 82,
                    "segment": "Baner Commercial Spine"
                },
                {
                    "name": "Pashan-Sus Road Connector",
                    "lat": 18.5485,
                    "lon": 73.7915,
                    "speed_kmh": 40,
                    "soc_pct": 78,
                    "segment": "DP Road North"
                },
                {
                    "name": "Aundh Parihar Chowk",
                    "lat": 18.5582,
                    "lon": 73.8075,
                    "speed_kmh": 28,
                    "soc_pct": 74,
                    "segment": "Aundh Main Market Rd"
                },
                {
                    "name": "SPPU University Circle Gate",
                    "lat": 18.5492,
                    "lon": 73.8295,
                    "speed_kmh": 45,
                    "soc_pct": 70,
                    "segment": "Ganeshkhind Road Arterial"
                },
                {
                    "name": "Sancheti Hospital Flyover",
                    "lat": 18.5395,
                    "lon": 73.8445,
                    "speed_kmh": 42,
                    "soc_pct": 66,
                    "segment": "Shivajinagar Grade Separator"
                },
                {
                    "name": "Shivajinagar Intermodal Terminal",
                    "lat": 18.5328,
                    "lon": 73.8524,
                    "speed_kmh": 18,
                    "soc_pct": 63,
                    "segment": "Shivajinagar Metro Terminal"
                }
            ]
        },
        {
            "id": "corridor-wagholi-punestation",
            "title": "Wagholi to Pune Central Railway Station",
            "subtitle": "Nagar Road Corridor (Critical Eastern Desert Route)",
            "category": "Tech & Highway Radial",
            "total_distance_km": 16.8,
            "typical_duration_min": 42,
            "energy_consumed_kwh": 3.2,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Wagholi Kesnand Phata",
                    "lat": 18.5830,
                    "lon": 73.9840,
                    "speed_kmh": 35,
                    "soc_pct": 94,
                    "segment": "Critical Eastern Desert Origin"
                },
                {
                    "name": "Kharadi Bypass / EON IT Park",
                    "lat": 18.5582,
                    "lon": 73.9515,
                    "speed_kmh": 48,
                    "soc_pct": 89,
                    "segment": "EON Free Zone Access"
                },
                {
                    "name": "Chandan Nagar Water Tank",
                    "lat": 18.5540,
                    "lon": 73.9310,
                    "speed_kmh": 36,
                    "soc_pct": 84,
                    "segment": "Nagar Road Arterial"
                },
                {
                    "name": "Viman Nagar Phoenix Marketcity",
                    "lat": 18.5620,
                    "lon": 73.9170,
                    "speed_kmh": 28,
                    "soc_pct": 80,
                    "segment": "Retail & Commercial Hub"
                },
                {
                    "name": "Ramwadi Metro Interchange",
                    "lat": 18.5535,
                    "lon": 73.8990,
                    "speed_kmh": 35,
                    "soc_pct": 75,
                    "segment": "Metro Feeder Segment"
                },
                {
                    "name": "Yerawda Gunjan Chowk",
                    "lat": 18.5510,
                    "lon": 73.8820,
                    "speed_kmh": 30,
                    "soc_pct": 70,
                    "segment": "Yerawda Bridge Approach"
                },
                {
                    "name": "Bund Garden Bridge",
                    "lat": 18.5390,
                    "lon": 73.8790,
                    "speed_kmh": 42,
                    "soc_pct": 65,
                    "segment": "Mula-Mutha River Cross"
                },
                {
                    "name": "Pune Railway Station Central Portico",
                    "lat": 18.5284,
                    "lon": 73.8740,
                    "speed_kmh": 15,
                    "soc_pct": 61,
                    "segment": "Central Intermodal Destination"
                }
            ]
        },
        {
            "id": "corridor-hadapsar-kothrud",
            "title": "Hadapsar Magarpatta to Kothrud Paud Road",
            "subtitle": "East-West Cross-Link (Traversing Top Underserved Ward)",
            "category": "Commercial Cross-Link",
            "total_distance_km": 17.5,
            "typical_duration_min": 45,
            "energy_consumed_kwh": 3.3,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Magarpatta Cybercity South Gate",
                    "lat": 18.5140,
                    "lon": 73.9280,
                    "speed_kmh": 32,
                    "soc_pct": 92,
                    "segment": "Magarpatta IT Hub"
                },
                {
                    "name": "Hadapsar Gadital Flyover",
                    "lat": 18.5020,
                    "lon": 73.9285,
                    "speed_kmh": 45,
                    "soc_pct": 87,
                    "segment": "Solapur Highway Bypass"
                },
                {
                    "name": "Fatima Nagar Wanowrie Phata",
                    "lat": 18.5045,
                    "lon": 73.8990,
                    "speed_kmh": 38,
                    "soc_pct": 81,
                    "segment": "Wanowrie Link Rd"
                },
                {
                    "name": "Camp MG Road / Pulgate Bus Stand",
                    "lat": 18.5085,
                    "lon": 73.8780,
                    "speed_kmh": 24,
                    "soc_pct": 76,
                    "segment": "Cantonment Heritage Spine"
                },
                {
                    "name": "Swargate Flyover Grade Separator",
                    "lat": 18.5015,
                    "lon": 73.8580,
                    "speed_kmh": 36,
                    "soc_pct": 71,
                    "segment": "Southern Transit Gateway"
                },
                {
                    "name": "Alka Talkies Chowk / Sambhaji Bridge",
                    "lat": 18.5160,
                    "lon": 73.8440,
                    "speed_kmh": 28,
                    "soc_pct": 66,
                    "segment": "Deccan Gymkhana Approach"
                },
                {
                    "name": "Karve Road Nal Stop Metro Station",
                    "lat": 18.5080,
                    "lon": 73.8290,
                    "speed_kmh": 32,
                    "soc_pct": 62,
                    "segment": "Karve Road Metro Corridor"
                },
                {
                    "name": "Kothrud Chandani Chowk Junction",
                    "lat": 18.5015,
                    "lon": 73.7845,
                    "speed_kmh": 40,
                    "soc_pct": 57,
                    "segment": "Kothrud Western Terminal"
                }
            ]
        },
        {
            "id": "corridor-katraj-heritage",
            "title": "Katraj Transit Gateway to Shaniwar Wada & Mandai",
            "subtitle": "South Corridor (High-Density 2W/3W Transit Radial)",
            "category": "Urban Transit & Commercial",
            "total_distance_km": 11.2,
            "typical_duration_min": 30,
            "energy_consumed_kwh": 2.1,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Katraj Snake Park / PMT Terminal",
                    "lat": 18.4520,
                    "lon": 73.8560,
                    "speed_kmh": 38,
                    "soc_pct": 96,
                    "segment": "Southern Ring Entry"
                },
                {
                    "name": "Bharati Vidyapeeth Medical Campus",
                    "lat": 18.4590,
                    "lon": 73.8550,
                    "speed_kmh": 35,
                    "soc_pct": 92,
                    "segment": "Dhankawadi University Zone"
                },
                {
                    "name": "Padmavati Mandir / Bibvewadi Link",
                    "lat": 18.4770,
                    "lon": 73.8560,
                    "speed_kmh": 40,
                    "soc_pct": 86,
                    "segment": "Bibvewadi Commercial Spine"
                },
                {
                    "name": "Swargate Jedhe Chowk",
                    "lat": 18.5015,
                    "lon": 73.8580,
                    "speed_kmh": 22,
                    "soc_pct": 80,
                    "segment": "Multimodal PMPML/MSRTC Hub"
                },
                {
                    "name": "Mandai Shivaji Market",
                    "lat": 18.5140,
                    "lon": 73.8565,
                    "speed_kmh": 18,
                    "soc_pct": 75,
                    "segment": "Historic Core Commerce"
                },
                {
                    "name": "Shaniwar Wada Historic Gate",
                    "lat": 18.5195,
                    "lon": 73.8553,
                    "speed_kmh": 15,
                    "soc_pct": 71,
                    "segment": "Central Heritage Terminus"
                }
            ]
        },
        {
            "id": "corridor-bhosari-swargate",
            "title": "Bhosari Industrial MIDC to Swargate Transit Hub",
            "subtitle": "North-South Industrial Freight & Cargo Trunk",
            "category": "Freight & Commercial Logistics",
            "total_distance_km": 16.4,
            "typical_duration_min": 40,
            "energy_consumed_kwh": 3.5,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Bhosari MIDC Telco Road",
                    "lat": 18.6320,
                    "lon": 73.8340,
                    "speed_kmh": 45,
                    "soc_pct": 95,
                    "segment": "Auto Ancillary Belt"
                },
                {
                    "name": "Nashik Phata Multilevel Flyover",
                    "lat": 18.6020,
                    "lon": 73.8260,
                    "speed_kmh": 55,
                    "soc_pct": 89,
                    "segment": "NH-60 Interchange"
                },
                {
                    "name": "Dapodi CME Cantonment Gate",
                    "lat": 18.5830,
                    "lon": 73.8310,
                    "speed_kmh": 48,
                    "soc_pct": 84,
                    "segment": "Military Engineering Highway"
                },
                {
                    "name": "Khadki Bazaar / Station",
                    "lat": 18.5630,
                    "lon": 73.8410,
                    "speed_kmh": 36,
                    "soc_pct": 79,
                    "segment": "Old Mumbai-Pune Highway"
                },
                {
                    "name": "Shivajinagar Shimla Office Chowk",
                    "lat": 18.5320,
                    "lon": 73.8510,
                    "speed_kmh": 30,
                    "soc_pct": 73,
                    "segment": "PMC Administrative Core"
                },
                {
                    "name": "Shanipar Mandir / Bajirao Road",
                    "lat": 18.5130,
                    "lon": 73.8520,
                    "speed_kmh": 22,
                    "soc_pct": 67,
                    "segment": "High-Density City Route"
                },
                {
                    "name": "Swargate Terminal South Gate",
                    "lat": 18.5010,
                    "lon": 73.8580,
                    "speed_kmh": 20,
                    "soc_pct": 62,
                    "segment": "Freight Logistics Destination"
                }
            ]
        },
        {
            "id": "corridor-sinhagad-fcroad",
            "title": "Khadakwasla Dam to Fergusson College Road",
            "subtitle": "Sinhagad Radial (Dense Residential Commuter Corridor)",
            "category": "Residential Commuter Radial",
            "total_distance_km": 14.6,
            "typical_duration_min": 36,
            "energy_consumed_kwh": 2.8,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Khadakwasla Dam Scenic Promenade",
                    "lat": 18.4410,
                    "lon": 73.7660,
                    "speed_kmh": 45,
                    "soc_pct": 95,
                    "segment": "Southwest Periphery"
                },
                {
                    "name": "Nanded City Destination Centre",
                    "lat": 18.4610,
                    "lon": 73.7850,
                    "speed_kmh": 38,
                    "soc_pct": 90,
                    "segment": "Integrated Township Hub"
                },
                {
                    "name": "Sinhagad Road Manik Baug",
                    "lat": 18.4820,
                    "lon": 73.8180,
                    "speed_kmh": 32,
                    "soc_pct": 84,
                    "segment": "Dense Commuter Residential Spine"
                },
                {
                    "name": "Dandekar Bridge / Sarasbaug",
                    "lat": 18.5030,
                    "lon": 73.8420,
                    "speed_kmh": 28,
                    "soc_pct": 78,
                    "segment": "Mutha Canal Crossing"
                },
                {
                    "name": "Tilak Road SP College Chowk",
                    "lat": 18.5090,
                    "lon": 73.8480,
                    "speed_kmh": 26,
                    "soc_pct": 72,
                    "segment": "Education Corridor"
                },
                {
                    "name": "Deccan Gymkhana Goodluck Chowk",
                    "lat": 18.5170,
                    "lon": 73.8410,
                    "speed_kmh": 22,
                    "soc_pct": 67,
                    "segment": "FC Road Cafe Belt"
                },
                {
                    "name": "Fergusson College Main Gate",
                    "lat": 18.5230,
                    "lon": 73.8390,
                    "speed_kmh": 20,
                    "soc_pct": 63,
                    "segment": "University North Terminus"
                }
            ]
        },
        {
            "id": "corridor-nh48-bypass",
            "title": "Ravet Expressway Exit to Katraj Tunnel Bypass",
            "subtitle": "NH-48 National Highway Outer Arterial Ring",
            "category": "Interstate Highway Bypass",
            "total_distance_km": 23.5,
            "typical_duration_min": 32,
            "energy_consumed_kwh": 4.6,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Ravet Mumbai-Pune Expressway Exit",
                    "lat": 18.6470,
                    "lon": 73.7480,
                    "speed_kmh": 65,
                    "soc_pct": 98,
                    "segment": "Expressway Toll Approach"
                },
                {
                    "name": "Bhumkar Chowk Hinjewadi Underpass",
                    "lat": 18.6010,
                    "lon": 73.7540,
                    "speed_kmh": 60,
                    "soc_pct": 91,
                    "segment": "Wakad Ring Interchange"
                },
                {
                    "name": "Balewadi Sports Complex Outer",
                    "lat": 18.5770,
                    "lon": 73.7680,
                    "speed_kmh": 62,
                    "soc_pct": 84,
                    "segment": "Olympic Stadium Outer"
                },
                {
                    "name": "Baner Pashan Highway Hill Cutting",
                    "lat": 18.5490,
                    "lon": 73.7780,
                    "speed_kmh": 58,
                    "soc_pct": 77,
                    "segment": "Baner Hill Pass"
                },
                {
                    "name": "Chandani Chowk Multilevel Flyover",
                    "lat": 18.5060,
                    "lon": 73.7840,
                    "speed_kmh": 50,
                    "soc_pct": 70,
                    "segment": "Paud Rd / Highway Interchange"
                },
                {
                    "name": "Warje Flyover / Mai Mangeshkar Hospital",
                    "lat": 18.4790,
                    "lon": 73.7990,
                    "speed_kmh": 58,
                    "soc_pct": 63,
                    "segment": "Warje Bypass Hub"
                },
                {
                    "name": "Vadgaon Bridge / Sinhagad Rd Junction",
                    "lat": 18.4680,
                    "lon": 73.8210,
                    "speed_kmh": 52,
                    "soc_pct": 56,
                    "segment": "Mutha River Highway Bridge"
                },
                {
                    "name": "Navale Bridge / Katraj Ghat Entry",
                    "lat": 18.4550,
                    "lon": 73.8390,
                    "speed_kmh": 45,
                    "soc_pct": 49,
                    "segment": "Southern Ghat Gateway"
                }
            ]
        },
        {
            "id": "corridor-airport-sppu",
            "title": "Pune International Airport (PNQ) to SPPU University",
            "subtitle": "Airport VIP Express Line (High Fleet Utilization)",
            "category": "Airport VIP & Commercial Fleet",
            "total_distance_km": 13.9,
            "typical_duration_min": 34,
            "energy_consumed_kwh": 2.7,
            "status": "SIMULATION (Verified Road Geometry & Elevation)",
            "waypoints": [
                {
                    "name": "Pune Airport Terminal 2 Departure Ramp",
                    "lat": 18.5810,
                    "lon": 73.9190,
                    "speed_kmh": 30,
                    "soc_pct": 95,
                    "segment": "PNQ New Terminal"
                },
                {
                    "name": "Airport Road VIP Junction",
                    "lat": 18.5680,
                    "lon": 73.9020,
                    "speed_kmh": 45,
                    "soc_pct": 90,
                    "segment": "Golf Course Arterial"
                },
                {
                    "name": "Yerawda Golf Club Link",
                    "lat": 18.5570,
                    "lon": 73.8890,
                    "speed_kmh": 42,
                    "soc_pct": 85,
                    "segment": "Koregaon Park North"
                },
                {
                    "name": "Sangamwadi BRTS Dedicated Expressway",
                    "lat": 18.5390,
                    "lon": 73.8680,
                    "speed_kmh": 50,
                    "soc_pct": 79,
                    "segment": "BRTS Dedicated Expressway"
                },
                {
                    "name": "Sancheti Hospital Bridge",
                    "lat": 18.5320,
                    "lon": 73.8480,
                    "speed_kmh": 35,
                    "soc_pct": 73,
                    "segment": "Shivajinagar Outer"
                },
                {
                    "name": "Pune University Main Administrative Gate",
                    "lat": 18.5492,
                    "lon": 73.8295,
                    "speed_kmh": 30,
                    "soc_pct": 67,
                    "segment": "SPPU Academic Terminus"
                }
            ]
        }
    ]

    data["simulation_corridor"] = corridors[0]
    data["simulation_corridors"] = corridors

    with open("data/processed/ev_time_series.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Successfully wrote data/processed/ev_time_series.json with 8 corridors!")

    os.makedirs("frontend/public/data", exist_ok=True)
    with open("frontend/public/data/ev_time_series.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Successfully copied to frontend/public/data/ev_time_series.json!")

if __name__ == "__main__":
    create_rich_time_series()
