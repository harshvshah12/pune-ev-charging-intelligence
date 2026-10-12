# Comparative Optimization Benchmarks & Algorithmic Evaluation
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

**Study Region**: Pune Municipal Corporation (15 administrative wards, 1,354 BEE stations, 264k registered EVs)  
**Evaluation Protocol**: Siting $K=10$ new public charging hubs with coverage service radius $R = 1.50\text{ km}$  
**Spatial Constraint**: Anti-cannibalization separation threshold $d_{\min} = 1.15\text{ km}$  

---

## 1. Executive Optimization Method Leaderboard

| Rank | Siting Methodology | Algorithmic Paradigm | 1.5 km City Coverage (%) | Net Coverage Gain | Avg Nearest Charger Dist (km) | Spatial Cannibalization Violations | Execution Runtime (ms) | Theoretical Optimality Guarantee |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | **Greedy Submodular MCLP** *(VoltPune)* | **Submodular Set Optimization** | **90.0%** | **+6.5%** | **0.99 km** | **0 (0.0%)** | **42 ms** | **$(1 - 1/e) \approx 63.2\%$ Proof** |
| 2 | **Exact Integer Linear Program (ILP)** | Branch-and-Bound Simplex | 90.3% | +6.8% | 0.98 km | 0 (0.0%) | 1,840 ms | 100.0% Global Optimum |
| 3 | **K-Means Spatial Clustering** | Unsupervised Geometric Clust. | 87.6% | +4.1% | 1.04 km | 4 (40.0%) | 18 ms | None (Heuristic) |
| 4 | **Pure Demand-Weighted Siting** | Greedy Density Ranking | 86.4% | +2.9% | 1.07 km | 8 (80.0%) | 4 ms | None (Myopic) |
| 5 | **Random Uniform Baseline** | Stochastic Monte Carlo | 84.7% | +1.2% | 1.09 km | 6 (60.0%) | 1 ms | None (Stochastic) |

---

## 2. In-Depth Algorithmic Analysis & Comparative Mechanics

### 2.1 Model 1: Greedy Submodular MCLP (VoltPune Engine)
- **Mechanism**: Evaluates the incremental marginal coverage gain of each road-accessible candidate cell while accounting for existing BEE chargers and previously selected hubs. Enforces a strict Euclidean separation threshold $d_{\min} = 1.15\text{ km}$.
- **Performance**: Achieves **$90.0\%$ city coverage** ($+6.5\%$ absolute increase), lowers average nearest charger distance to $0.99\text{ km}$, and executes in **$42\text{ ms}$**.
- **Advantage**: Possesses a mathematically proven worst-case lower bound of $(1 - 1/e) \approx 63.2\%$ (Nemhauser et al., 1978). In practice, it captures **$95.6\%$ of the global optimum found by exact ILP** while running 44 times faster, making it ideal for real-time web interactivity.

---

### 2.2 Model 2: Exact Integer Linear Programming (ILP Benchmark)
- **Mechanism**: Formulated as a binary integer program solved via Branch-and-Bound:
  $$\max \sum_{i \in \mathcal{I}} w_i y_i \quad \text{s.t.} \quad y_i \le \sum_{j \in \mathcal{N}_i} x_j, \quad \sum x_j \le K, \quad x_j + x_k \le 1 \;\forall (j,k): d(j,k) < d_{\min}$$
- **Performance**: Reaches the mathematical ceiling of $90.3\%$ coverage ($+6.8\%$ gain).
- **Drawback**: Combinatorial explosion requires **$1,840\text{ ms}$** of CPU compute time. This introduces unacceptable lag for an interactive web dashboard where users continuously adjust sensitivity weights on dynamic sliders.

---

### 2.3 Model 3: K-Means Spatial Clustering (Geometric Heuristic)
- **Mechanism**: Clusters registered EV demand coordinates into $K=10$ spatial centroids using Lloyd's algorithm, siting stations at cluster centers.
- **Why It Fails**: K-Means operates blind to existing infrastructure. In wards like Kothrud and Baner, high vehicle density pulls cluster centroids into areas that *already possess dense public fast charging*, causing $40\%$ of sited stations to sit within $<500\text{ meters}$ of an existing charger (severe spatial cannibalization).

---

### 2.4 Model 4: Pure Demand-Weighted Siting (Myopic Deficit)
- **Mechanism**: Ranks cells strictly by registered EV demand and places all $K=10$ stations into the highest-density cells.
- **Why It Fails**: Suffers from extreme geographic concentration. Eight of the 10 stations are placed inside two adjacent western wards, providing zero relief to Hadapsar, Kharadi, or Kondhwa. Net coverage gain is restricted to a meager $+2.9\%$.

---

### 2.5 Model 5: Random Spatial Baseline
- **Mechanism**: Selects 10 random coordinates uniformly across the PMC bounding polygon.
- **Why It Fails**: Sits stations in topographically unsuitable zones (hill reserves, riverbanks) or low-density peripheral agricultural edges, yielding an insignificant $+1.2\%$ coverage change.

---

## 3. Algorithmic Trade-Off Matrix

```
                        ▲ HIGH
                        │
                        │                       Exact ILP (90.3%)
                        │                       [Latency: 1,840 ms]
   Coverage             │
   Quality              │       VoltPune Submodular Greedy (90.0%)
   (Optimality)         │       [Latency: 42 ms] ★ OPTIMAL TRADEOFF
                        │
                        │           K-Means (87.6%)
                        │
                        │   Pure Demand (86.4%)
                        │
                        │   Random (84.7%)
                        │
                        └─────────────────────────────────────────►
                        LOW           COMPUTATIONAL LATENCY        HIGH
```

VoltPune's Greedy Submodular approach hits the sweet spot: near-optimal spatial coverage within sub-50ms execution latency.
