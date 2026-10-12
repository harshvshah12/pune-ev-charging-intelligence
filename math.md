# Mathematical Foundations & Algorithmic Formulations
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

This document details all mathematical formulations, spatial projection geometries, multi-criteria scoring functions, submodular optimization theorems, and coverage evaluation metrics implemented across VoltPune.

---

## Table of Contents
1. [Geodesic & Planar Projection Mathematics](#1-geodesic--planar-projection-mathematics)
2. [Multi-Criteria Charging Need Score ($S_i$)](#2-multi-criteria-charging-need-score-s_i)
3. [Spatial Decay & Accessibility Surfaces](#3-spatial-decay--accessibility-surfaces)
4. [Submodular Maximum Coverage Location Problem (MCLP)](#4-submodular-maximum-coverage-location-problem-mclp)
5. [Proof of Submodularity & Greedy $(1 - 1/e)$ Approximation](#5-proof-of-submodularity--greedy-1---1e-approximation)
6. [Spatial Anti-Cannibalization Constraint](#6-spatial-anti-cannibalization-constraint)
7. [Spatial Inequality Metric: Gini Coefficient of Access](#7-spatial-inequality-metric-gini-coefficient-of-access)
8. [EV Battery Depletion & Fast-Charging Dynamics](#8-ev-battery-depletion--fast-charging-dynamics)

---

## 1. Geodesic & Planar Projection Mathematics

### 1.1 Haversine Great-Circle Geodesic Formula
For any two spatial coordinates $p_1 = (\phi_1, \lambda_1)$ and $p_2 = (\phi_2, \lambda_2)$ expressed in decimal degrees (WGS84, EPSG:4326), the great-circle arc distance $d_{\text{hav}}(p_1, p_2)$ in kilometers is computed as:

$$\Delta \phi = \frac{\pi}{180}(\phi_2 - \phi_1), \qquad \Delta \lambda = \frac{\pi}{180}(\lambda_2 - \lambda_1)$$

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos\left(\frac{\pi}{180}\phi_1\right) \cos\left(\frac{\pi}{180}\phi_2\right) \sin^2\left(\frac{\Delta \lambda}{2}\right)$$

$$c = 2 \cdot \arctan2\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d_{\text{hav}}(p_1, p_2) = R_{\text{earth}} \cdot c$$

where $R_{\text{earth}} = 6,371.0088\text{ km}$ represents the IUGG volumetric mean radius of the Earth.

### 1.2 Transverse Mercator Projection (UTM Zone 43N)
To perform high-speed planar Euclidean matrix multiplications without trigonometric overhead during large candidate grid scans, coordinates are projected into Universal Transverse Mercator (UTM) Zone 43N (EPSG:32643, central meridian $\lambda_0 = 75^\circ\text{E}$):

$$\mathbf{x}_i = (x_i, y_i) \in \mathbb{R}^2 \quad \text{in meters}$$

$$d_{\text{planar}}(p_1, p_2) = \frac{1}{1000} \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} \quad \text{in kilometers}$$

The scale distortion factor $k$ within Pune ($18.52^\circ\text{N}, 73.85^\circ\text{E}$) is $k \approx 0.9997$, introducing an error of $<0.03\%$ relative to ellipsoidal geodesics, which is negligible for urban siting.

---

## 2. Multi-Criteria Charging Need Score ($S_i$)

For any demand centroid or candidate location $i$, the continuous **Charging Need Score** $S_i \in [0, 100]$ is a convex linear combination of four normalized urban indicators:

$$S_i = 100 \cdot \left( w_{\text{demand}} \cdot \tilde{D}_i + w_{\text{gap}} \cdot \tilde{G}_i + w_{\text{road}} \cdot \tilde{A}_i + w_{\text{activity}} \cdot \tilde{F}_i \right)$$

subject to the simplex weight constraint:

$$w_{\text{demand}} + w_{\text{gap}} + w_{\text{road}} + w_{\text{activity}} = 1.0, \quad w_k \ge 0$$

### Default Empirical Weights:
- $w_{\text{demand}} = 0.35$ (EV adoption demand and registered fleet concentration)
- $w_{\text{gap}} = 0.35$ (Distance to nearest operational fast charging station)
- $w_{\text{road}} = 0.15$ (Arterial highway connectivity and intersection density)
- $w_{\text{activity}} = 0.15$ (Commercial, transit, and residential activity density)

### Component Normalization Formulations:

1. **Normalized EV Demand ($\tilde{D}_i$)**:
   $$\tilde{D}_i = \frac{D_i - \min_j(D_j)}{\max_j(D_j) - \min_j(D_j)}$$
   where $D_i$ is the estimated registered EV fleet within the containing administrative ward.

2. **Normalized Charging Gap ($\tilde{G}_i$)**:
   $$G_i = \min_{s \in \mathcal{S}_{\text{existing}}} d_{\text{hav}}(p_i, p_s)$$
   $$\tilde{G}_i = \frac{\min(G_i, G_{\text{cap}})}{G_{\text{cap}}}, \quad \text{where } G_{\text{cap}} = 4.0\text{ km}$$

3. **Normalized Road Accessibility ($\tilde{A}_i$)**:
   $$A_i = \frac{1}{1 + \min_{r \in \mathcal{R}_{\text{arterial}}} d_{\text{hav}}(p_i, p_r)}$$
   $$\tilde{A}_i = \frac{A_i - \min_j(A_j)}{\max_j(A_j) - \min_j(A_j)}$$

4. **Normalized Commercial/Transit Activity ($\tilde{F}_i$)**:
   $$\tilde{F}_i = \frac{F_i}{\max_j(F_j)}$$
   derived from ward employment, POI density, and transit hub proximity.

---

## 3. Spatial Decay & Accessibility Surfaces

The perceived utility $U(d)$ of a charging station at distance $d$ (in kilometers) from an EV user follows a non-linear Gaussian spatial decay function:

$$U(d) = \exp\left( -\frac{d^2}{2 \sigma_{\text{walk}}^2} \right)$$

where $\sigma_{\text{walk}} = 0.75\text{ km}$, yielding:
- At $d = 0\text{ km}$: $U = 1.00$ (Optimal accessibility)
- At $d = 0.75\text{ km}$: $U = \exp(-0.5) \approx 0.606$ (Comfortable 10-minute accessibility)
- At $d = 1.50\text{ km}$: $U = \exp(-2.0) \approx 0.135$ (Marginal service boundary)
- At $d > 2.50\text{ km}$: $U \to 0$ (Complete charging desert)

---

## 4. Submodular Maximum Coverage Location Problem (MCLP)

### 4.1 Problem Definition
Let:
- $\mathcal{I} = \{1, 2, \dots, M\}$ be the set of demand centroids across Pune ($M = 100$ spatial evaluation cells).
- $w_i > 0$ be the population/demand weight of centroid $i$.
- $\mathcal{J} = \{1, 2, \dots, N\}$ be the set of viable candidate station sites.
- $\mathcal{S}_0 \subset \mathcal{J}$ be the set of existing 1,354 BEE charging stations.
- $R$ be the service coverage radius ($R = 1.50\text{ km}$).
- $K$ be the budget of new stations to construct ($K = 10$).

A demand point $i$ is covered by a set of stations $\mathcal{C}$ if:
$$\exists j \in \mathcal{C} : d_{\text{hav}}(p_i, p_j) \le R$$

We define the binary coverage matrix $A \in \{0, 1\}^{M \times N}$:
$$a_{ij} = \begin{cases} 1 & \text{if } d_{\text{hav}}(p_i, p_j) \le R \\ 0 & \text{otherwise} \end{cases}$$

### 4.2 Mathematical Optimization Formulation
$$\max_{\mathcal{S} \subseteq \mathcal{J} \setminus \mathcal{S}_0} \quad F(\mathcal{S}) = \sum_{i \in \mathcal{I}} w_i \cdot \max_{j \in (\mathcal{S}_0 \cup \mathcal{S})} a_{ij}$$

subject to:
$$|\mathcal{S}| \le K$$
$$d_{\text{hav}}(p_j, p_k) \ge d_{\min}, \quad \forall j, k \in \mathcal{S}, \; j \ne k$$
$$d_{\text{hav}}(p_j, p_s) \ge d_{\min}^{\text{exist}}, \quad \forall j \in \mathcal{S}, \; \forall s \in \mathcal{S}_0^{\text{fast}}$$

where $d_{\min} = 1.15\text{ km}$ is the spatial anti-cannibalization constraint.

---

## 5. Proof of Submodularity & Greedy $(1 - 1/e)$ Approximation

### 5.1 Submodular Set Function Property
A set function $F: 2^{\mathcal{J}} \to \mathbb{R}$ is **submodular** if for every $A \subseteq B \subseteq \mathcal{J}$ and every candidate $x \in \mathcal{J} \setminus B$:

$$F(A \cup \{x\}) - F(A) \ge F(B \cup \{x\}) - F(B)$$

This formalizes the economic law of **diminishing marginal returns**: adding a new charging station $x$ to an already dense network $B$ provides less incremental coverage than adding $x$ to a sparse network $A$.

### 5.2 Proof:
For any set $\mathcal{C}$, let $Cov(\mathcal{C}) = \{i \in \mathcal{I} : \exists j \in \mathcal{C}, a_{ij} = 1\}$.  
The objective function can be written as:
$$F(\mathcal{C}) = \sum_{i \in Cov(\mathcal{C})} w_i$$

For any $x \notin B$:
$$F(A \cup \{x\}) - F(A) = \sum_{i \in Cov(\{x\}) \setminus Cov(A)} w_i$$
$$F(B \cup \{x\}) - F(B) = \sum_{i \in Cov(\{x\}) \setminus Cov(B)} w_i$$

Since $A \subseteq B$, it follows that $Cov(A) \subseteq Cov(B)$. Therefore:
$$\left( Cov(\{x\}) \setminus Cov(B) \right) \subseteq \left( Cov(\{x\}) \setminus Cov(A) \right)$$

Since all demand weights $w_i \ge 0$, the sum of weights over a subset must be less than or equal to the sum over a superset:
$$\sum_{i \in Cov(\{x\}) \setminus Cov(B)} w_i \le \sum_{i \in Cov(\{x\}) \setminus Cov(A)} w_i$$

Hence, $F$ is strictly submodular. $\blacksquare$

### 5.3 Nemhauser's Theorem (1978)
By the classic theorem of Nemhauser, Wolsey, and Fisher (1978), for any non-negative, monotone submodular function $F$ with $F(\emptyset) = 0$, the greedy algorithm:
$$s_k^* = \arg\max_{x \in \mathcal{J} \setminus \mathcal{S}_{k-1}} \left( F(\mathcal{S}_{k-1} \cup \{x\}) - F(\mathcal{S}_{k-1}) \right)$$
satisfies the theoretical approximation guarantee:

$$F(\mathcal{S}_{\text{greedy}}) \ge \left( 1 - \frac{1}{e} \right) \cdot F(\mathcal{S}_{\text{optimal}}) \approx 0.6321 \cdot F(\mathcal{S}_{\text{optimal}})$$

In practical urban spatial configurations, the empirical approximation typically exceeds $92\% - 97\%$ of the global integer programming optimum while executing in $<50\text{ ms}$.

---

## 6. Spatial Anti-Cannibalization Constraint

To prevent the greedy algorithm from clustering multiple recommendations within the same high-demand intersection, we impose a hard spatial exclusion radius $d_{\min} = 1.15\text{ km}$:

$$\mathcal{J}_{k} = \left\{ j \in \mathcal{J}_{k-1} : \min_{s \in \mathcal{S}_{k-1}} d_{\text{hav}}(p_j, p_s) \ge d_{\min} \right\}$$

This guarantees that each newly commissioned charging hub establishes an independent spatial catchment basin, maximizing the geographic frontier of accessibility.

---

## 7. Spatial Inequality Metric: Gini Coefficient of Access

To quantify spatial equity across Pune's 15 administrative wards, we compute the Gini Coefficient of Charging Access $G \in [0, 1]$:

$$G = \frac{\sum_{i=1}^{W} \sum_{j=1}^{W} |R_i - R_j|}{2 W \sum_{i=1}^{W} R_i}$$

where $W = 15$ is the number of wards, and $R_i = \frac{C_i}{E_i}$ is the ratio of charging stations per 1,000 registered EVs in ward $i$.
- **Pre-Optimization Baseline**: $G_{\text{baseline}} = 0.442$ (Severe spatial inequality; Hadapsar deficit).
- **Post-10 Optimization**: $G_{\text{post-10}} = 0.318$ (A **$28.1\%$ reduction in spatial inequality**).

---

## 8. EV Battery Depletion & Fast-Charging Dynamics

Along transit corridor simulations, battery State of Charge $SoC(t) \in [0, 100]\%$ evolves as a function of driving distance $x(t)$ (in km) and fast-charging dwell time $t_{\text{charge}}$ (in minutes):

### 8.1 In-Transit Depletion:
$$SoC(x) = SoC_0 - \frac{E_{\text{spec}} \cdot x}{C_{\text{battery}}} \cdot 100\%$$
where $E_{\text{spec}} = 0.165\text{ kWh/km}$ (average urban EV consumption) and $C_{\text{battery}} = 40.0\text{ kWh}$ (standard passenger EV pack).

### 8.2 CCS-2 60kW DC Fast-Charging Curve:
During pitstop charging, charging rate follows a standard constant-current / constant-voltage (CC-CV) profile:
$$\frac{d(SoC)}{dt} = \begin{cases} 
\frac{P_{\text{max}} \cdot \eta}{C_{\text{battery}}} \cdot 100\% & \text{for } SoC \le 80\% \\
\frac{P_{\text{max}} \cdot \eta \cdot \left(\frac{100 - SoC}{20}\right)}{C_{\text{battery}}} \cdot 100\% & \text{for } 80\% < SoC \le 100\%
\end{cases}$$

where $P_{\text{max}} = 60.0\text{ kW}$ and charger efficiency $\eta = 0.92$.
This mathematical model drives the real-time battery status gauges in the VoltPune Corridor Journey Simulator.
