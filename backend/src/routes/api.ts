/**
 * API Routes for EV Fleet Optimization System
 * Provides REST endpoints for the frontend dashboard
 */

import { Router, Request, Response } from 'express';
import { dataService } from '../services/dataService.js';
import { predictChargingDemand, predictEnergyPrices, predictVehicleAvailability, predictBatteryHealth } from '../services/predictiveModels.js';
import { rlAgent } from '../services/reinforcementLearning.js';

const router = Router();

/**
 * GET /api/dashboard
 * Returns complete dashboard state including fleet, stations, plans, metrics, and alerts
 */
router.get('/dashboard', (_req: Request, res: Response) => {
  try {
    const state = dataService.getDashboardState();
    res.json({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('Error fetching dashboard state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard state',
    });
  }
});

/**
 * GET /api/fleet
 * Returns all vehicles in the fleet
 */
router.get('/fleet', (_req: Request, res: Response) => {
  try {
    const fleet = dataService.getFleet();
    res.json({
      success: true,
      data: fleet,
    });
  } catch (error) {
    console.error('Error fetching fleet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch fleet data',
    });
  }
});

/**
 * GET /api/fleet/:vehicleId
 * Returns specific vehicle details
 */
router.get('/fleet/:vehicleId', (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = dataService.getVehicle(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
    }
    
    res.json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vehicle data',
    });
  }
});

/**
 * GET /api/stations
 * Returns all charging stations
 */
router.get('/stations', (_req: Request, res: Response) => {
  try {
    const stations = dataService.getStations();
    res.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch station data',
    });
  }
});

/**
 * GET /api/pricing
 * Returns 24-hour energy pricing data
 */
router.get('/pricing', (_req: Request, res: Response) => {
  try {
    const pricing = dataService.getPricing();
    res.json({
      success: true,
      data: pricing,
    });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing data',
    });
  }
});

/**
 * GET /api/charging-plans
 * Returns optimized charging plans for the fleet
 */
router.get('/charging-plans', (_req: Request, res: Response) => {
  try {
    const plans = dataService.getChargingPlans();
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    console.error('Error fetching charging plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch charging plans',
    });
  }
});

/**
 * GET /api/alerts
 * Returns system alerts and notifications
 */
router.get('/alerts', (_req: Request, res: Response) => {
  try {
    const alerts = dataService.getAlerts();
    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alerts',
    });
  }
});

/**
 * GET /api/metrics
 * Returns optimization metrics (costs, utilization, savings)
 */
router.get('/metrics', (_req: Request, res: Response) => {
  try {
    const metrics = dataService.getMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
    });
  }
});

/**
 * POST /api/optimize
 * Triggers a new optimization run
 */
router.post('/optimize', (_req: Request, res: Response) => {
  try {
    dataService.runOptimization();
    const plans = dataService.getChargingPlans();
    const metrics = dataService.getMetrics();
    
    res.json({
      success: true,
      message: 'Optimization completed',
      data: {
        plans,
        metrics,
      },
    });
  } catch (error) {
    console.error('Error running optimization:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to run optimization',
    });
  }
});

/**
 * POST /api/manual-assignment
 * Manually assign a vehicle to a charging station (override AI)
 * Body: { vehicleId: string, stationId: string }
 */
router.post('/manual-assignment', (req: Request, res: Response) => {
  try {
    const { vehicleId, stationId } = req.body;
    
    if (!vehicleId || !stationId) {
      return res.status(400).json({
        success: false,
        error: 'vehicleId and stationId are required',
      });
    }
    
    const plan = dataService.manualAssignment(vehicleId, stationId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle or station not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Manual assignment created',
      data: plan,
    });
  } catch (error) {
    console.error('Error creating manual assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual assignment',
    });
  }
});

/**
 * GET /api/predictions/demand
 * Get predicted charging demand for next 24 hours
 */
router.get('/predictions/demand', (_req: Request, res: Response) => {
  try {
    const fleet = dataService.getFleet();
    const predictions = predictChargingDemand(fleet);
    
    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error('Error generating demand predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate demand predictions',
    });
  }
});

/**
 * GET /api/predictions/prices
 * Get predicted energy prices for next 24 hours
 */
router.get('/predictions/prices', (_req: Request, res: Response) => {
  try {
    const pricing = dataService.getPricing();
    const predictions = predictEnergyPrices(pricing);
    
    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error('Error generating price predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate price predictions',
    });
  }
});

/**
 * GET /api/predictions/availability
 * Get predicted vehicle availability
 */
router.get('/predictions/availability', (_req: Request, res: Response) => {
  try {
    const fleet = dataService.getFleet();
    const predictions = predictVehicleAvailability(fleet);
    
    res.json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    console.error('Error generating availability predictions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate availability predictions',
    });
  }
});

/**
 * GET /api/ml/battery-health/:vehicleId
 * Get battery health prediction for a specific vehicle
 */
router.get('/ml/battery-health/:vehicleId', (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = dataService.getVehicle(vehicleId);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
    }
    
    const healthPrediction = predictBatteryHealth(vehicle);
    
    res.json({
      success: true,
      data: {
        vehicleId,
        ...healthPrediction,
      },
    });
  } catch (error) {
    console.error('Error predicting battery health:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to predict battery health',
    });
  }
});

/**
 * GET /api/ml/rl-performance
 * Get Reinforcement Learning agent performance metrics
 */
router.get('/ml/rl-performance', (_req: Request, res: Response) => {
  try {
    const metrics = rlAgent.getPerformanceMetrics();
    
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error getting RL performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RL performance metrics',
    });
  }
});

/**
 * POST /api/ml/rl-recommend
 * Get RL agent recommendation for a vehicle
 * Body: { vehicleId: string }
 */
router.post('/ml/rl-recommend', (req: Request, res: Response) => {
  try {
    const { vehicleId } = req.body;
    
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        error: 'vehicleId is required',
      });
    }
    
    const vehicle = dataService.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
      });
    }
    
    const currentHour = new Date().getHours();
    const pricing = dataService.getPricing();
    const stations = dataService.getStations();
    const availableStations = stations.filter(s => s.available).length;
    const stationAvailability = availableStations / stations.length;
    
    const recommendation = rlAgent.recommendStrategy(
      vehicle,
      currentHour,
      pricing[currentHour].price,
      stationAvailability
    );
    
    res.json({
      success: true,
      data: {
        vehicleId,
        ...recommendation,
      },
    });
  } catch (error) {
    console.error('Error getting RL recommendation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get RL recommendation',
    });
  }
});

export default router;
