# EV Fleet Charging Optimizer

A full-stack AI-powered electric vehicle fleet charging optimization system with a real-time web dashboard. The system uses intelligent algorithms to optimize charging schedules, minimize energy costs, and maximize fleet availability.

## 🚀 Features

### Backend (Node.js + TypeScript)
- **Mock Data Generation**: Realistic simulation of EV fleet, charging stations, and energy grid data
- **AI Optimization Engine**: Heuristic-based algorithm that:
  - Assigns vehicles to nearest available charging stations
  - Schedules charging during off-peak hours to minimize costs
  - Prioritizes vehicles based on battery level and trip schedules
  - Calculates optimal charging windows considering energy pricing
- **REST API**: Comprehensive endpoints for fleet management and optimization
- **Real-time Updates**: Simulated real-time data updates every 30 seconds

### Frontend (React + TypeScript)
- **Interactive Dashboard** with:
  - Live fleet status with battery levels and vehicle details
  - Charging station availability and utilization
  - AI-optimized charging schedules
  - 24-hour energy pricing visualization
  - Fleet and station location map
  - System alerts and notifications
  - Optimization metrics (cost savings, CO₂ reduction, etc.)
- **Modern UI**: Clean, professional design with color-coded status indicators
- **Auto-refresh**: Dashboard updates automatically every 30 seconds
- **Manual Controls**: Run optimization on-demand and refresh data manually

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher

## 🛠️ Installation

### 1. Clone/Navigate to the Project Directory

```bash
cd ev-fleet-optimizer
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Google Maps API (Required for Map Visualization)

To display the real Paris map, you need a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project (or select existing)
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Copy the API key

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp .env.example .env
```

Edit `.env` and add your API key:

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**Note:** Without the API key, the map will show a fallback message with instructions.

## 🚀 Running the Application

### Option 1: Run Both Services Separately (Recommended for Development)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:4000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

### Option 2: Production Build

**Build Backend:**
```bash
cd backend
npm run build
npm start
```

**Build Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🌐 Access the Dashboard

Once both services are running, open your browser and navigate to:

```
http://localhost:3000
```

## 📡 API Endpoints

The backend provides the following REST endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Complete dashboard state |
| GET | `/api/fleet` | All vehicles in the fleet |
| GET | `/api/fleet/:id` | Specific vehicle details |
| GET | `/api/stations` | All charging stations |
| GET | `/api/pricing` | 24-hour energy pricing data |
| GET | `/api/charging-plans` | Optimized charging schedules |
| GET | `/api/alerts` | System alerts and notifications |
| GET | `/api/metrics` | Optimization metrics |
| POST | `/api/optimize` | Trigger optimization run |
| POST | `/api/manual-assignment` | Manual vehicle-to-station assignment |

### Example API Usage

```bash
# Get dashboard state
curl http://localhost:4000/api/dashboard

# Get fleet status
curl http://localhost:4000/api/fleet

# Run optimization
curl -X POST http://localhost:4000/api/optimize

# Manual assignment
curl -X POST http://localhost:4000/api/manual-assignment \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": "EV-001", "stationId": "CS-001"}'
```

## 🧠 AI Optimization Algorithm

The system uses a **greedy heuristic optimization algorithm** with the following approach:

1. **Priority Calculation**: Vehicles are prioritized based on:
   - Battery State of Charge (SoC)
   - Upcoming trip schedules
   - Time until next trip

2. **Station Assignment**: For each vehicle:
   - Find nearest available charging station (Euclidean distance)
   - Calculate required energy to reach target SoC (90%)
   - Determine charging duration based on station power and vehicle capability

3. **Time Optimization**: 
   - Schedule charging during off-peak hours when possible
   - For high-priority vehicles, charge immediately
   - Respect trip departure deadlines

4. **Cost Calculation**:
   - Calculate cost based on time-of-use energy pricing
   - Estimate CO₂ savings from off-peak charging
   - Compare against peak-hour baseline

## 📊 Dashboard Components

### 1. Metrics Overview
- Total energy cost
- Cost savings vs. peak charging
- Average charging time
- Station utilization
- Vehicles optimized
- CO₂ savings

### 2. Fleet Status
- Real-time vehicle status (idle, charging, in use, maintenance)
- Battery levels with visual indicators
- Location and trip schedules
- Charging speed capabilities

### 3. Charging Stations
- Station availability and type (standard, fast, ultra-fast)
- Current power usage
- Location and max power capacity
- Occupied status

### 4. Charging Schedule
- AI-optimized charging plans
- Time windows and duration
- Energy requirements and costs
- Priority levels
- Distance to assigned stations

### 5. Energy Pricing Chart
- 24-hour pricing visualization
- Peak, off-peak, and shoulder periods
- Current hour indicator
- Grid demand levels

### 6. Fleet Map
- **Real Google Maps** of Paris metropolitan area
- Vehicle locations color-coded by status
- Charging station locations by availability
- Interactive markers with detailed information
- Real streets, landmarks, and Seine river
- Click markers to see vehicle/station details

### 7. System Alerts
- Low battery warnings
- Maintenance notifications
- Trip conflicts
- Grid peak period alerts

## 🎨 Color Coding

### Vehicle Status
- 🟢 **Green**: Charging
- 🔵 **Blue**: In Use
- ⚫ **Gray**: Idle
- 🟡 **Yellow**: Maintenance

### Charging Stations
- 🟢 **Green**: Available
- 🔴 **Red**: Occupied

### Energy Periods
- 🔴 **Red**: Peak (2 PM - 8 PM)
- 🟡 **Yellow**: Shoulder (6 AM - 2 PM, 8 PM - 10 PM)
- 🟢 **Green**: Off-Peak (10 PM - 6 AM)

### Priority Levels
- 🔴 **Red**: High Priority
- 🟡 **Yellow**: Medium Priority
- 🟢 **Green**: Low Priority

## 🔧 Configuration

### Backend Configuration

Edit `backend/.env`:
```env
PORT=4000
NODE_ENV=development
```

### Frontend Configuration

**Google Maps API Key (Required):**

Create `frontend/.env`:
```env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Getting a Google Maps API Key:**

1. Visit [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a project or select existing one
3. Enable "Maps JavaScript API"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key and add it to your `.env` file

**Note:** Google Maps offers a generous free tier ($200 credit/month) which is more than sufficient for development and testing.

In development, the frontend uses Vite's proxy (configured in `vite.config.ts`) to forward API requests to `http://localhost:4000`.

## 📦 Project Structure

```
ev-fleet-optimizer/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   └── types.ts           # TypeScript type definitions
│   │   ├── services/
│   │   │   ├── optimizer.ts       # AI optimization logic
│   │   │   └── dataService.ts     # Data management service
│   │   ├── routes/
│   │   │   └── api.ts             # REST API routes
│   │   ├── utils/
│   │   │   └── mockData.ts        # Mock data generators
│   │   └── index.ts               # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── MetricsCard.tsx
    │   │   ├── FleetStatus.tsx
    │   │   ├── ChargingStations.tsx
    │   │   ├── ChargingPlans.tsx
    │   │   ├── Alerts.tsx
    │   │   ├── EnergyPricingChart.tsx
    │   │   └── FleetMap.tsx
    │   ├── services/
    │   │   └── api.ts             # API client
    │   ├── types/
    │   │   └── index.ts           # TypeScript types
    │   ├── styles/
    │   │   └── global.css         # Global styles
    │   ├── App.tsx                # Main application component
    │   └── main.tsx               # React entry point
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## 🧪 Mock Data

The system generates realistic mock data including:

- **20 Electric Vehicles** with:
  - Various models (Tesla Model 3, Nissan Leaf, etc.)
  - Random battery capacities (50-100 kWh)
  - Current charge levels
  - Trip schedules
  - Locations on a 100x100 grid

- **10 Charging Stations** with:
  - Different types (standard: 11kW, fast: 50kW, ultra-fast: 150kW)
  - Random locations
  - Availability status

- **24-Hour Energy Pricing** with:
  - Peak periods (2 PM - 8 PM): $0.20/kWh
  - Off-peak periods (10 PM - 6 AM): $0.08/kWh
  - Shoulder periods: $0.12/kWh

## 🚀 Future Enhancements

Potential improvements for a production system:

1. **Database Integration**: Replace mock data with PostgreSQL/MongoDB
2. **Real IoT Integration**: Connect to actual vehicle telematics and charging station APIs
3. **Advanced ML Models**: Use reinforcement learning for dynamic optimization
4. **User Authentication**: Add multi-tenant support with role-based access
5. **Historical Analytics**: Track performance over time with trend analysis
6. **Mobile App**: React Native companion app for fleet managers
7. **Websocket Support**: Real-time push notifications instead of polling
8. **Route Planning**: Integrate with mapping APIs for trip optimization
9. **Battery Health**: Track and predict battery degradation
10. **Carbon Credits**: Calculate and track environmental impact

## 📝 License

MIT License - feel free to use this project for learning and development purposes.

## 🤝 Contributing

This is a prototype/demonstration project. Feel free to fork and enhance!

## 📧 Support

For questions or issues, please check:
- Backend logs in the terminal running `npm run dev`
- Browser console for frontend errors
- Ensure both services are running on their respective ports

## 🎯 Key Technologies

- **Backend**: Node.js, TypeScript, Express, ES Modules
- **Frontend**: React 18, TypeScript, Vite, Recharts
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **Optimization**: Custom heuristic algorithm with linear programming concepts

---

**Built with ❤️ for EV fleet optimization**
