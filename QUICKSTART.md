# EV Fleet Charging Optimizer - Quick Start

## Installation & Running

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Google Maps (Required)

Get a free Google Maps API key:
1. Go to https://console.cloud.google.com/google/maps-apis
2. Create a project and enable "Maps JavaScript API"
3. Create an API key

Create `frontend/.env`:
```bash
cd frontend
echo "VITE_GOOGLE_MAPS_API_KEY=your_key_here" > .env
```

Replace `your_key_here` with your actual API key.

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3000

### 4. Open Dashboard

Visit http://localhost:3000 in your browser.

## What You'll See

- **Fleet Status**: 20 EVs with real-time battery levels
- **Charging Stations**: 10 stations across Paris
- **Real Google Map**: Interactive map of Paris with all vehicles and stations
- **Charging Schedule**: AI-optimized charging plans
- **Energy Pricing**: 24-hour cost visualization
- **Metrics**: Cost savings, utilization, CO₂ reduction
- **Alerts**: Low battery warnings and notifications

Click on map markers to see detailed information!

Enjoy exploring the EV Fleet Charging Optimizer! 🚗⚡
