/**
 * Main Express Server for EV Fleet Optimization Backend
 * Provides REST API endpoints and manages system state
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import { dataService } from './services/dataService.js';

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

/**
 * Start the server and initialize data services
 */
async function startServer() {
  try {
    // Initialize data service with mock data
    console.log('Initializing EV Fleet Optimization System...');
    dataService.initialize();
    
    // Start periodic simulation updates (every 30 seconds)
    setInterval(() => {
      dataService.simulateUpdates();
    }, 30000);
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚗 EV Fleet Charging Optimization System');
      console.log('='.repeat(60));
      console.log(`✓ Backend server running on http://localhost:${PORT}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
      console.log(`✓ Health check: http://localhost:${PORT}/health`);
      console.log('='.repeat(60));
      console.log('\nAvailable API endpoints:');
      console.log('  GET  /api/dashboard        - Complete dashboard state');
      console.log('  GET  /api/fleet           - All vehicles');
      console.log('  GET  /api/fleet/:id       - Specific vehicle');
      console.log('  GET  /api/stations        - All charging stations');
      console.log('  GET  /api/pricing         - Energy pricing data');
      console.log('  GET  /api/charging-plans  - Optimized charging plans');
      console.log('  GET  /api/alerts          - System alerts');
      console.log('  GET  /api/metrics         - Optimization metrics');
      console.log('  POST /api/optimize        - Run optimization');
      console.log('  POST /api/manual-assignment - Manual vehicle assignment');
      console.log('\n🧠 AI/ML Endpoints:');
      console.log('  GET  /api/predictions/demand      - Predict charging demand (24h)');
      console.log('  GET  /api/predictions/prices      - Predict energy prices (24h)');
      console.log('  GET  /api/predictions/availability - Predict vehicle availability');
      console.log('  GET  /api/ml/battery-health/:id   - Battery health prediction');
      console.log('  GET  /api/ml/rl-performance       - RL agent metrics');
      console.log('  POST /api/ml/rl-recommend         - RL charging recommendation');
      console.log('='.repeat(60));
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
