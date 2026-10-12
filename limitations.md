# Technical Limitations & Analytical Assumptions
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

While VoltPune provides an academically grounded and empirical decision framework for urban electric vehicle infrastructure allocation, several practical limitations and domain assumptions must be recognized when interpreting model outputs.

---

## 1. Electrical Grid Feeder & Distribution Transformer Blindspots
- **Limitation**: The optimization engine currently assumes uniform electrical capacity along Pune's major arterial highway corridors.
- **Physical Reality**: In physical deployment, commissioning a 60kW–120kW DC fast charging hub requires dedicated 11kV distribution transformer substations with sufficient MVA headroom from the Maharashtra State Electricity Distribution Company Limited (MSEDCL). Certain high-demand candidate nodes may face distribution feeder congestion requiring costly grid reinforcement before station commissioning.

---

## 2. Land Tenure, Real Estate & Municipal Right-of-Way
- **Limitation**: Candidate locations are generated along a 200-meter buffer of OpenStreetMap major roadways and verified via satellite imagery, but the system does not query the official PMC cadastral land parcel registry (7/12 land records).
- **Physical Reality**: Siting a public charging hub requires physical real estate for vehicle bays, transformer cabinets, and driver waiting amenities. The municipal authority must verify whether recommended coordinates sit on public municipal land, government right-of-way, or privately owned commercial property requiring lease negotiation.

---

## 3. Exclusion of Private & Residential Charging Sockets
- **Limitation**: The model is calibrated exclusively on public and semi-public charging stations documented in the statutory Bureau of Energy Efficiency (BEE) National Gazette.
- **Physical Reality**: A substantial fraction of electric two-wheeler and private passenger four-wheeler charging occurs at home or within cooperative housing society parking lots via private 15A / 3.3kW AC sockets. Because private sockets are not publicly accessible and lack a statutory spatial registry, they are excluded from public accessibility coverage calculations.

---

## 4. Static Travel Distance vs. Dynamic Traffic Speeds
- **Limitation**: The default service catchment radius ($R = 1.50\text{ km}$) represents a geodesic buffer calibrated to an average 5-minute urban travel window.
- **Physical Reality**: Travel times in Pune vary dynamically based on peak-hour congestion (e.g., severe bottlenecks at Swargate, University Road, or Hadapsar Gadital) and seasonal monsoon weather. Dynamic real-time traffic routing matrices (e.g., via Valhalla or OSRM) would provide dynamic isochrones rather than fixed geometric radii.

---

## 5. Multi-Class Vehicle Homogeneity Assumption
- **Limitation**: The Charging Need Score aggregates registered 2-wheelers, 3-wheelers (commercial auto-rickshaws), and 4-wheelers into a unified ward demand metric.
- **Physical Reality**: Electric two-wheelers and three-wheelers in India frequently utilize battery swapping or 15A AC sockets, whereas electric passenger cars and fleet cabs require high-power DC CCS-2 fast chargers. While the model focuses on DC fast charging ($\ge 7.4\text{ kW}$), segment-specific optimization will refine future iterations.
