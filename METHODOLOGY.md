# VoltPune — Analytical Methodology & Optimization Framework

## 1. Problem Formulation

As electric vehicle adoption expands across Pune, public charging infrastructure must be allocated strategically. The core research question addresses:

> **"If Pune could build only 10 new public EV charging stations, where should they be placed to provide the greatest improvement in charging accessibility?"**

This is formally modeled as a **Budget-Constrained Maximum Coverage Location Problem (MCLP)** on a spatial graph.

### Sets & Parameters
- $\mathcal{S} = \{s_1, s_2, \dots, s_K\}$: Set of $K = 1,354$ existing charging points indexed from BEE (with $K_{\text{fast}} = 177$ public fast chargers).
- $\mathcal{C} = \{c_1, c_2, \dots, c_M\}$: Set of $M = 72$ viable candidate sites located along Pune's arterial transport corridors.
- $\mathcal{G} = \{g_1, g_2, \dots, g_P\}$: Spatial demand grid points across Pune's administrative wards ($P = 460$ urban cells).
- $w_g$: Empirical demand weight of cell $g$, derived from ward-level VAHAN EV registrations and residential population density.
- $R_{\text{cov}}$: Service radius for public fast charging, calibrated at $R_{\text{cov}} = 1.75\text{ km}$ (~5-minute urban drive).
- $D_{\min}$: Minimum spatial separation constraint between new stations, set to $D_{\min} = 1.15\text{ km}$ to eliminate cannibalization.
- $N = 10$: Target number of newly constructed stations.

---

## 2. Charging Need Score Formulation

For any spatial node $c \in \mathcal{C}$, the composite **Charging Need Score** is a convex linear combination of four normalized empirical indicators:

$$\text{Score}(c) = w_{\text{gap}} \cdot \widetilde{d}_{\text{gap}}(c) + w_{\text{ev}} \cdot \widetilde{D}_{\text{ev}}(c) + w_{\text{road}} \cdot \widetilde{A}_{\text{road}}(c) + w_{\text{act}} \cdot \widetilde{A}_{\text{act}}(c)$$

subject to:
$$w_{\text{gap}} + w_{\text{ev}} + w_{\text{road}} + w_{\text{act}} = 1.0$$

### Normalized Factor Definitions:
1. **Spatial Charging Deficit ($\widetilde{d}_{\text{gap}}$)**:
   $$\widetilde{d}_{\text{gap}}(c) = \min\left(1.0, \frac{\min_{s \in \mathcal{S}_{\text{fast}}} \text{dist}(c, s)}{d_{\max}}\right)$$
   Measures distance to the nearest existing operational fast charger ($d_{\max} = 4.0\text{ km}$).

2. **EV Fleet Demand ($\widetilde{D}_{\text{ev}}$)**:
   $$\widetilde{D}_{\text{ev}}(c) = \frac{\text{EV}_{\text{ward}}(c)}{\max_{w} \text{EV}_w}$$
   Normalized ward-level EV registrations from VAHAN analytics.

3. **Road Network Accessibility ($\widetilde{A}_{\text{road}}$)**:
   $$\widetilde{A}_{\text{road}}(c) = \frac{\text{AccessRating}(c)}{100}$$
   Proximity to OSM primary/trunk corridors and multi-lane junctions.

4. **Civic & Commercial Activity ($\widetilde{A}_{\text{act}}$)**:
   $$\widetilde{A}_{\text{act}}(c) = \frac{\text{ActivityRating}(c)}{100}$$
   Footfall proxy reflecting IT parks, transit interchanges, and major retail hubs.

**Default Analytical Weights:**
- $w_{\text{gap}} = 0.35$ (35%)
- $w_{\text{ev}} = 0.35$ (35%)
- $w_{\text{road}} = 0.15$ (15%)
- $w_{\text{act}} = 0.15$ (15%)

---

## 3. Greedy Submodular Marginal Coverage Optimization

MCLP is an NP-hard combinatorial problem ($\binom{72}{10} \approx 4.14 \times 10^{11}$ combinations).

However, the objective function representing cumulative population within service radius is **monotone submodular**. Consequently, a greedy forward-selection algorithm guarantees an optimal approximation ratio of:

$$1 - \frac{1}{e} \approx 63.21\% \quad \text{(Nemhauser, Wolsey & Fisher, 1978)}$$

### Step-by-Step Optimization Algorithm:
1. **Initialization:**
   - Set $\mathcal{S}_0^* = \emptyset$.
   - For every grid cell $g \in \mathcal{G}$, compute initial nearest fast charger distance:
     $$d_0(g) = \min_{s \in \mathcal{S}_{\text{fast}}} \text{dist}(g, s)$$
2. **For iteration $t = 1, 2, \dots, N$:**
   - For every remaining eligible candidate $c \in \mathcal{C} \setminus \mathcal{S}_{t-1}^*$ satisfying:
     $$\min_{s^* \in \mathcal{S}_{t-1}^*} \text{dist}(c, s^*) \ge D_{\min}$$
   - Calculate marginal distance reduction across the demand grid:
     $$\Delta_t(c) = \sum_{g \in \mathcal{G}} w_g \cdot \left[ d_{t-1}(g) - \min(d_{t-1}(g), \text{dist}(g, c)) \right]$$
   - Combine with candidate-specific road and activity factors:
     $$V_t(c) = 0.55 \cdot \widetilde{\Delta}_t(c) + 0.25 \cdot \widetilde{A}_{\text{act}}(c) + 0.20 \cdot \widetilde{A}_{\text{road}}(c)$$
   - Select candidate with maximum marginal gain:
     $$c_t^* = \arg\max_{c} V_t(c)$$
   - Update selected set:
     $$\mathcal{S}_t^* = \mathcal{S}_{t-1}^* \cup \{c_t^*\}$$
   - **Submodular Update:** Recompute distance field for all demand cells:
     $$d_t(g) = \min(d_{t-1}(g), \text{dist}(g, c_t^*))$$
3. **Termination:** Output ordered recommendation set $\{c_1^*, c_2^*, \dots, c_{10}^*\}$.

---

## 4. Empirical Optimization Results for Pune

| Metric | Baseline Network | After 10 Sited Stations | Net Gain |
| :--- | :--- | :--- | :--- |
| **Citywide Fast Charging Coverage (1.75km)** | 83.5% | **90.0%** | **+6.5%** |
| **Average Distance to Fast Charger** | 1.10 km | **0.99 km** | **-110 meters** |
| **Hadapsar Deficit Reduction** | 85.5 (Critical) | 58.2 (Controlled) | -31.9% |
| **Pashan-Sus Gateway Access** | 2.8 km deficit | 0.0 km direct access | Solved |
| **Katraj Highway Junction Access** | 2.1 km deficit | 0.0 km direct access | Solved |

### Top 10 Sited Recommendations:
1. **Pashan-Sus Road Intermodal Point** (Aundh / Baner Gateway) — Score: 58.0
2. **Yerawda - Sangamwadi Transit Feeder** (Yerawda Corridor) — Score: 53.2
3. **Katraj Snake Park / BRTS Terminal** (Dhankawadi / Satara Highway) — Score: 51.2
4. **Chandani Chowk Multimodal Interchange** (Kothrud / NH-48) — Score: 47.1
5. **Shivajinagar Integrated Transit Terminal** (Ghole Road Central Hub) — Score: 46.9
6. **Yerawda Gunjan Chowk Junction** (Ahmednagar Highway) — Score: 45.2
7. **Baner High Street Commercial Spine** (Baner IT Corridor) — Score: 45.1
8. **Swargate Multimodal Transport Hub** (Tilak Road / MSRTC) — Score: 44.8
9. **Balewadi High Street Sports Complex** (Balewadi Gateway) — Score: 44.7
10. **Hadapsar Gadital Intermodal Hub** (Hadapsar / Solapur Highway) — Score: 44.6

---

## 5. Viva Defense: Assumptions & Limitations

1. **Static vs. Live Telemetry:** Station listings reflect the official BEE gazette register (October 2025). Real-time telemetry is restricted due to lack of public unauthenticated MSEDCL APIs.
2. **Demand Proxy:** VAHAN fleet statistics are RTO-level (MH-12/14/61) and projected down to administrative wards via PMC demographic master-plan census ratios.
3. **Grid Feasibility:** Candidate sites assume standard 11kV electrical distribution feeder accessibility along major road rights-of-way.
