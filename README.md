# EV Fleet Charging Optimizer

AI-powered electric vehicle fleet charging optimization system with real-time web dashboard.

<img width="1701" height="926" alt="image" src="https://github.com/user-attachments/assets/fb649009-de58-4e7d-9b93-7bba8d1a0fe1" />

## Quick Start

### Prerequisites
- Node.js v18+
- npm v9+
- Google Maps API key ([Get one here](https://console.cloud.google.com/google/maps-apis))

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Configure Google Maps API
cp .env.example .env
# Edit .env and add: VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Dashboard

Open your browser and navigate to: **http://localhost:3000**

---

**Tech Stack:** Node.js, TypeScript, React, Express, Google Maps API
