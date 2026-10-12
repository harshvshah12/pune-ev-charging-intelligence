# VoltPune: Project Glossary & Viva Explainer Guide

This guide is designed to help you quickly and deeply understand every technical term, mathematical concept, and architectural decision used in your **Pune EV Charging Infrastructure Optimization** project. You can use this cheat sheet to confidently explain your system to teachers, viva examiners, and academic evaluators.

---

## 1. Urban Mobility & Geospatial Terms

### **MCLP (Maximum Coverage Location Problem)**
* **What it means**: A classic mathematical formulation in operations research that seeks to place a fixed number of facilities ($K$) to maximize the total population or demand covered within a specified service radius ($R$).
* **How to explain it**: *"Rather than simply putting chargers where cars already are, MCLP ensures each new station expands the physical coverage boundary of the city, bringing the maximum number of new citizens within a 5-minute drive of a fast charger."*

### **Charging Desert**
* **What it means**: An urban or suburban zone with high EV adoption or transit traffic where the nearest public fast charging facility is located further than an acceptable distance threshold ($>2.5\text{ km}$).
* **How to explain it**: *"Hadapsar and Kharadi are major charging deserts in Pune. Despite housing massive IT hubs and residential complexes, drivers have to travel nearly 3 km to find a high-power fast charger. Our system explicitly detects and targets these deserts."*

### **Spatial Isochrone (Service Radius $R = 1.5\text{ km}$)**
* **What it means**: A line or contour connecting points that can be reached within an equal amount of travel time.
* **How to explain it**: *"In a dense Indian city like Pune, a 1.5 km geodesic radius corresponds to approximately 4 to 6 minutes of driving. We define this as the maximum reasonable threshold for public fast charging convenience."*

### **WGS84 vs. UTM Zone 43N**
* **What it means**: WGS84 (`EPSG:4326`) expresses locations as spherical angular coordinates (latitude/longitude in degrees). UTM Zone 43N (`EPSG:32643`) projects the curved surface of Maharashtra onto a flat 2D Cartesian grid in meters.
* **How to explain it**: *"We use WGS84 for our interactive 3D map tiles, but project coordinates into UTM Zone 43N to perform high-speed Euclidean distance matrix calculations in meters without spherical trigonometry errors."*

### **Gini Coefficient of Spatial Access**
* **What it means**: A statistical measure of inequality on a scale from 0 (perfect equality) to 1 (complete inequality).
* **How to explain it**: *"Before our optimization, Pune had a Gini coefficient of 0.442 because western wards were flooded with chargers while eastern wards were neglected. Siting our 10 recommended hubs reduced the Gini index to 0.318—a 28.1% improvement in spatial fairness."*

---

## 2. Mathematical Optimization & Algorithms

### **Submodular Function & Diminishing Marginal Returns**
* **What it means**: A set function where adding an element to a small set gives a larger marginal increase than adding it to a larger set: $F(A \cup \{x\}) - F(A) \ge F(B \cup \{x\}) - F(B)$ for $A \subseteq B$.
* **How to explain it**: *"If an area has zero chargers, adding one station provides massive value. But if an area already has five chargers, adding a sixth provides almost zero new coverage. That mathematical property of diminishing returns is called submodularity."*

### **Nemhauser's Theorem & The $(1 - 1/e) \approx 63.2\%$ Approximation Proof**
* **What it means**: Nemhauser, Wolsey, and Fisher proved in 1978 that a greedy heuristic applied to any monotone submodular function achieves at least $1 - 1/e$ ($63.2\%$) of the true theoretical optimum.
* **How to explain it**: *"Solving facility location exactly is NP-hard and takes seconds of compute time. But because our coverage function is mathematically submodular, our greedy algorithm is provably guaranteed to achieve at least 63.2% of the optimal solution. In our empirical testing against exact Integer Linear Programming, it actually achieves 95.6% of the optimum in only 42 milliseconds."*

### **Spatial Anti-Cannibalization ($d_{\min} = 1.15\text{ km}$)**
* **What it means**: A geometric constraint forbidding two new charging hubs from being placed closer than $1.15\text{ km}$ to each other or to existing fast chargers.
* **How to explain it**: *"Without this rule, a greedy algorithm might put three stations at the same busy crossroads in Hadapsar. Our anti-cannibalization constraint forces the stations to spread out, each establishing its own distinct service catchment area."*

---

## 3. Data Integrity & Provenance

### **1. Bureau of Energy Efficiency (BEE) Gazette**
* **How to explain it**: *"We did not make up fake coordinates or scrape unverified Google Maps markers. We extracted all 1,354 public charging points directly from the Ministry of Power's official Bureau of Energy Efficiency Gazette published up to October 26, 2025."*

### **2. MoRTH VAHAN Database**
* **How to explain it**: *"Our vehicle demand numbers come straight from the Ministry of Road Transport and Highways VAHAN database. Pune District has 264,166 registered electric vehicles from 2020 to 2026, with 72,500 in the core PMC city limits."*

---

## 4. Top 6 Viva Exam Questions & Winning Answers

### **Q1: Why didn't you use K-Means clustering to find the station locations?**
> **Answer**: *"K-Means is an unsupervised clustering algorithm that groups demand points around centroids, but it is completely blind to existing infrastructure. If an area like Kothrud already has 18 chargers, K-Means would still place new stations there simply because vehicle counts are high. In fact, our benchmarks showed that K-Means causes a 40% spatial cannibalization rate. Our Submodular MCLP model explicitly subtracts existing coverage, focusing exclusively on unserved marginal demand."*

### **Q2: Why did Hadapsar get two new stations while Aundh and Shivajinagar got zero?**
> **Answer**: *"Hadapsar has 380.6 registered EVs for every public charger, with an average distance of 2.84 km to the nearest fast charger. Conversely, Aundh and Shivajinagar already have 22 and 20 fast chargers, with less than 60 EVs per charger. Adding more chargers to Aundh provides zero marginal coverage expansion. Allocating stations to Hadapsar cuts its deficit ratio by 47.9% and expands the city's 1.5 km coverage by 214,500 residents."*

### **Q3: What is the difference between the 1,354 total charging points and the 162 fast chargers?**
> **Answer**: *"The BEE dataset contains 1,354 total charging points, which include slow AC Level 2 points (3.3 kW to 7.2 kW) found in private offices or parking lots. In our optimization model, we strictly filter for public DC Fast Chargers delivering $\ge 7.4\text{ kW}$ (primarily 30kW–60kW CCS-2 units), of which there are 162 operational units. Rapid transit accessibility depends on fast charging, not overnight AC sockets."*

### **Q4: How did you ensure your road network is realistic?**
> **Answer**: *"We ingested 532.6 km of OpenStreetMap arterial and trunk highway vectors for Pune. Candidate locations must lie within a 200-meter buffer of major transit roads, ensuring stations are physically accessible by passenger cars, commercial rickshaws, and delivery fleets."*

### **Q5: What is the significance of the 8 simulated transit corridors?**
> **Answer**: *"In our Corridor Journey Simulator, we prove that our recommended stations solve real-world driver range anxiety. Each vehicle starts with a critically low State of Charge (14%–18%), navigates along glowing animated paths, pulls into an intermediate 60kW DC fast charger, refuels to 85%–90% SoC in 25 minutes, and safely completes its trip across Pune."*

### **Q6: Why is your system faster than traditional GIS software?**
> **Answer**: *"Traditional GIS tools like QGIS or ArcGIS rely on heavy desktop software that cannot run interactive what-if simulations for end users. VoltPune combines a lightweight Python FastAPI microservice with KD-Tree spatial indexing and WebGL GPU shaders, delivering submodular optimization in 42 milliseconds directly in the browser."*
