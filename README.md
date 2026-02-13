# EV Fleet Charging Optimizer

AI-powered electric vehicle fleet charging optimization system with real-time web dashboard.

<img width="1701" height="926" alt="image" src="https://github.com/user-attachments/assets/fb649009-de58-4e7d-9b93-7bba8d1a0fe1" />

<img width="1092" height="788" alt="image" src="https://github.com/user-attachments/assets/542cec78-5f9e-454f-b144-0e590f02c7f4" />

<img width="1114" height="764" alt="image" src="https://github.com/user-attachments/assets/106d5284-a0f3-4876-ada7-8c2b3d3c4179" />

<img width="1113" height="571" alt="image" src="https://github.com/user-attachments/assets/1880dffb-68e1-43c0-b425-9854b0f7150f" />

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
