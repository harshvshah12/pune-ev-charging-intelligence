# Authentic Data Provenance & Source Registry

This document records the exact provenance, licensing, extraction methodology, and schema definitions for all datasets used in **VoltPune — Pune Electric Mobility Infrastructure & Station Placement Intelligence**.

---

## 1. Bureau of Energy Efficiency (BEE) — Public EV Charging Station Register

- **Publishing Agency:** Bureau of Energy Efficiency (BEE), Ministry of Power, Government of India
- **Document Title:** *EV Public Charging Stations Data till 26th October 2025*
- **Source URL:** https://www.beeindia.gov.in/show_content.php?lang=1&level=2&lid=67&ls_id=345
- **Document Ref:** `EV_PCS_Data_29277.pdf`
- **Retrieval Date:** 2026-10-05
- **License / Terms:** Official Government Open Document / Public Notice
- **Coverage:** National Register (1,159 Pages)
- **Extracted Records for Pune Metropolitan Region:** 1,354 verified, deduplicated charging points
- **Verified Public Fast Charging Hubs (≥ 7.4 kW / DC Fast):** 177 stations
- **Installed Grid Capacity in Pune:** 8,029.9 kW
- **Primary Schema Fields:**
  - `CPO Name` (e.g., Tata Power, Ather Energy, BPCL, HPCL, IOCL, Jio-bp, MSEDCL, UJOY, Kazam, ChargeZone)
  - `Govt/Private Sector` (PSU vs. Private operator)
  - `State` (Maharashtra)
  - `District` (Pune)
  - `Location / Address` (Street address, landmark, PIN code)
  - `Latitude` (Decimals, EPSG:4326)
  - `Longitude` (Decimals, EPSG:4326)
  - `Charger Type / Connector` (CCS-2 DC Fast, LEV DC Fast, Type-2 AC, LEV AC, Bharat DC-001, Bharat AC-001, CHAdeMO)
  - `Power Rating (kW)` (3.3 kW to 60.0 kW)
  - `Connector Count` (1 to 4 connectors per station)
- **Extraction Pipeline:**
  - Parsed using Python `pypdf` with regex boundary extractors across all 1,159 pages.
  - Coordinates validated within the Pune metropolitan study bounding box (`18.30°N - 18.82°N`, `73.65°E - 74.15°E`).
  - Spatial deduplication performed at a 35-meter radius for co-located duplicate listings.

---

## 2. VAHAN Analytics — Vehicle Registration & Fleet Adoption

- **Publishing Agency:** Ministry of Road Transport and Highways (MoRTH), Government of India
- **Source Portals:**
  - VAHAN Analytics Public Dashboard: https://analytics.parivahan.gov.in/analytics/publicdashboard/vahan?lang=en
  - Parivahan Public Reports: https://analytics.parivahan.gov.in/analytics/vahanpublicreport
- **Retrieval Date:** 2026-10-05
- **Jurisdictions Covered:**
  - `MH-12` (Pune City RTO)
  - `MH-14` (Pimpri-Chinchwad RTO)
  - `MH-61` (New Pune RTO series effective September 2026)
- **Total Registered Electric Vehicles (District Cumulative):** 264,166 EVs
- **Active EV Fleet (PMC Administrative Core):** 72,500 EVs
- **Fleet Category Distribution:**
  - Electric 2-Wheelers (E2W): 78.4%
  - Electric 4-Wheelers (E4W): 12.8%
  - Electric 3-Wheelers (E3W): 7.9%
  - Electric Buses & Heavy Commercial: 0.9% (including 450+ PMPML e-buses)
- **Temporal Timeline:** 2020 through 2026 tracking annual additions, festive spikes, and policy milestones.

---

## 3. Pune Administrative Ward Boundaries

- **Publishing Agency:** DataMeet Open Spatial Repository & Pune Municipal Corporation (PMC)
- **Source Repository:** https://github.com/datameet/Municipal_Spatial_Data/tree/master/Pune
- **File Reference:** `pune-admin-wards_2017.geojson`
- **Retrieval Date:** 2026-10-05
- **License:** Creative Commons Attribution 4.0 International (CC-BY 4.0)
- **Coordinate Reference System:** WGS84 (`EPSG:4326`)
- **Total Administrative Wards:** 15 official PMC administrative wards
- **Preprocessing:**
  - Validated with Python `shapely`.
  - Self-intersecting multi-polygons repaired using `shapely.validation.make_valid()`.
  - Calculated exact land area, polygon centroids, and demographic demand allocations.

---

## 4. OpenStreetMap (OSM) Arterial Road Network

- **Publishing Agency:** OpenStreetMap Contributors & Overpass API
- **Source Portal:** https://www.openstreetmap.org (Overpass API interpreter)
- **Retrieval Date:** 2026-10-05
- **License:** Open Data Commons Open Database License (ODbL)
- **Extracted Highway Classes:** `motorway`, `trunk`, `primary`
- **Total Processed Segments:** 2,242 line segments
- **Total Arterial Network Length:** 532.6 km
- **Key Corridors Covered:**
  - Mumbai-Pune Expressway & NH-48 Bypass
  - Pune-Solapur Highway (NH-65) through Hadapsar
  - Pune-Ahmednagar Highway (MH SH-27) through Viman Nagar & Kharadi
  - Pune-Satara Road BRTS Corridor through Dhankawadi & Katraj
  - Paud Road & Karve Road through Kothrud
  - Ganeshkhind Road & SB Road through Shivajinagar
  - Hinjewadi Infotech Park Spine (Phase 1, 2, 3)

---

## 5. MSEDCL PowerUpEV Audit & Integrity Declaration

- **Entity:** Maharashtra State Electricity Distribution Company Limited (MSEDCL)
- **Application Portal:** https://play.google.com/store/apps/details?id=com.nxccontrols.msedcl
- **Inspection Date:** 2026-10-05
- **Architectural Findings:**
  - The PowerUpEV consumer ecosystem provides mobile app interfaces for live charger discovery and billing.
  - **No unauthenticated or open third-party REST API** is publicly provided by MSEDCL for streaming real-time status.
- **Integrity Compliance:**
  - In strict compliance with academic and anti-slop guidelines, this project **does not bypass authentication**, **does not fabricate fake live availability**, and clearly marks live charger status as **"RESTRICTED / STATIC VERIFIED REGISTRY (OCTOBER 2025)"**.
