# Development & Production Setup Guide
# VoltPune: Pune EV Public Charging Infrastructure Optimization Platform

## 1. System Requirements
- **Operating System**: Windows 10/11, macOS, or Ubuntu Linux
- **Python**: Version 3.10.x or higher
- **Node.js**: Version 18.x, 20.x, or 22.x with npm
- **Hardware**: Dedicated GPU recommended for 60 FPS WebGL 3D rendering (Intel Iris / AMD Radeon / NVIDIA GeForce)
- **Disk Space**: ~250 MB (includes raw/processed datasets, Python virtual environment, and node_modules)

---

## 2. Step-by-Step Installation

### Step 1: Clone or Navigate to Project Directory
```bash
cd "X:\EV Manager"
```

### Step 2: Set Up Python Backend Dependencies
```bash
# Verify Python version
python --version

# Install required Python analytical and API dependencies
pip install fastapi uvicorn pydantic numpy scipy pandas geopandas shapely pytest httpx
```

### Step 3: Set Up Node.js Frontend Dependencies
```bash
# Verify Node.js and npm
node --version
npm --version

# Install frontend packages (React 19, MapLibre GL, Lucide React, Tailwind CSS v4, Vite)
npm install
```

---

## 3. Running the Application Locally

### Option A: Run Backend & Frontend Concurrently (Recommended)

**Terminal 1 — Launch FastAPI Microservice**:
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8008 --reload
```
*The interactive Swagger OpenAPI documentation will be live at `http://127.0.0.1:8008/docs`.*

**Terminal 2 — Launch Vite 3D Web Dashboard**:
```bash
npm run dev
```
*The interactive dashboard will be accessible at `http://localhost:3000` (or `http://localhost:3001`).*

---

## 4. Running Automated Test Suites

### Backend Unit & Integration Tests (pytest)
```bash
python -m pytest tests/test_data_pipeline.py -v
```

### End-to-End (E2E) Playwright Browser Tests
```bash
npx playwright test
```

---

## 5. Production Build & Vercel Deployment

VoltPune is designed with a **zero-downtime dual-mode architecture**:
1. When running alongside the FastAPI daemon, it performs real-time submodular optimization dynamically.
2. When deployed as a static Jamstack single-page application on **Vercel**, it seamlessly utilizes high-resolution precomputed optimization artifacts in `data/processed/`, ensuring lightning-fast edge CDN delivery with 100% uptime.

### Compile Static Production Bundle:
```bash
npm run build
```

### Deploy to Vercel:
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to production
vercel --prod
```
The repository includes a pre-configured `vercel.json` routing configuration that serves the single-page application cleanly.
