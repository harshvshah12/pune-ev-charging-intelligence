# Future Scope & Extensions
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

## 1. Smart Grid & MSEDCL SCADA Telemetry Integration
- **Extension**: Establish automated API integrations with MSEDCL's distribution management system (DMS) and substation SCADA telemetry.
- **Impact**: Enables candidate filtering based on real-time distribution transformer (DT) loading and feeder thermal capacity, preventing recommended stations from being sited on overloaded 11kV distribution circuits.

---

## 2. Vehicle-to-Grid (V2G) & Decentralized Energy Storage
- **Extension**: Model recommended charging hubs as bi-directional Vehicle-to-Grid (V2G) nodes capable of feeding power back into the urban grid during peak industrial demand hours (6 PM – 10 PM).
- **Impact**: Transforms charging stations from passive electrical loads into active virtual power plants (VPPs) that stabilize local grid voltage and generate ancillary service revenue for charge point operators.

---

## 3. Dynamic Time-of-Day (ToD) Pricing & Demand Elasticity
- **Extension**: Incorporate dynamic tariff engines that simulate driver price sensitivity and charging dwell scheduling based on time-varying electricity rates.
- **Impact**: Incentivizes off-peak charging (11 PM – 6 AM) through automated algorithmic tariff discounts, smoothing the diurnal load profile across Pune's municipal grid.

---

## 4. Queuing Theory & Stochastic Dwell-Time Modeling
- **Extension**: Implement an $M/M/c$ or $M/G/c$ Markovian multi-server queuing model at each candidate node to predict driver wait times under stochastic arrival processes.
- **Impact**: Allows the optimizer to dynamically recommend the number of individual charging dispensers ($c$) required at each hub to maintain peak-hour queuing delays below an acceptable threshold (e.g., $<10\text{ minutes}$).

---

## 5. Solar PV & Battery Energy Storage (BESS) Co-Location
- **Extension**: Evaluate candidate hubs for rooftop solar canopy integration and on-site Battery Energy Storage Systems (BESS).
- **Impact**: Allows urban charging hubs to buffer peak demand spikes with local clean solar generation, reducing demand charges and lowering carbon intensity per kilowatt-hour dispensed.

---

## 6. Dedicated Battery Swapping Infrastructure for 2W/3W Fleets
- **Extension**: Formulate a dual-tier optimization model distinguishing between plug-in DC fast charging for passenger 4-wheelers and automated Battery Swapping Stations (BSS) for Pune's massive commercial 3-wheeler auto-rickshaw fleet (32,000+ registered vehicles).
- **Impact**: Optimizes battery swapping turnarounds ($<3\text{ minutes}$) along high-density auto-rickshaw commute corridors (Swargate, Pune Station, Hadapsar).
