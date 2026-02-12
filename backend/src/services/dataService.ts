/**
 * Data Service - Central state management for the optimization system
 * Manages mock data generation and provides access to current system state
 */

import type { 
  ElectricVehicle, 
  ChargingStation, 
  EnergyPricing, 
  Alert,
  ChargingPlan,
  OptimizationMetrics,
  DashboardState
} from '../models/types.js';

import { 
  generateEVFleet, 
  generateChargingStations, 
  generateEnergyPricing,
  generateAlerts 
} from '../utils/mockData.js';

import { 
  optimizeChargingSchedule, 
  calculateOptimizationMetrics 
} from './optimizer.js';

import { rlAgent } from './reinforcementLearning.js';

/**
 * DataService class maintains the current state of the system
 * In a production system, this would interface with a database
 */
export class DataService {
  private fleet: ElectricVehicle[] = [];
  private stations: ChargingStation[] = [];
  private pricing: EnergyPricing[] = [];
  private plans: ChargingPlan[] = [];
  private alerts: Alert[] = [];
  private metrics: OptimizationMetrics = {
    total_energy_cost: 0,
    average_charging_time: 0,
    station_utilization: 0,
    vehicles_optimized: 0,
    co2_saved: 0,
    cost_savings: 0,
  };
  private lastUpdated: Date = new Date();

  /**
   * Initialize the system with mock data
   */
  initialize(): void {
    console.log('Initializing data service with mock data...');
    
    // Generate initial mock data
    this.fleet = generateEVFleet(20);
    this.stations = generateChargingStations(10);
    this.pricing = generateEnergyPricing();
    
    // Run initial optimization
    this.runOptimization();
    
    console.log(`Initialized: ${this.fleet.length} vehicles, ${this.stations.length} stations`);
  }

  /**
   * Run the AI optimization algorithm
   * Creates charging plans and calculates metrics
   */
  runOptimization(): void {
    console.log('Running optimization algorithm...');
    
    // Generate optimized charging plans
    this.plans = optimizeChargingSchedule(this.fleet, this.stations, this.pricing);
    
    // Calculate system metrics
    this.metrics = calculateOptimizationMetrics(this.plans, this.stations, this.pricing);
    
    // Generate alerts based on current fleet state
    this.alerts = generateAlerts(this.fleet);
    
    // Train RL agent with new data
    this.trainRLAgent();
    
    this.lastUpdated = new Date();
    
    console.log(`Optimization complete: ${this.plans.length} charging plans created`);
  }

  /**
   * Train the Reinforcement Learning agent with current state
   */
  private trainRLAgent(): void {
    const currentHour = new Date().getHours();
    const currentPrice = this.pricing[currentHour].price;
    const availableStations = this.stations.filter(s => s.available).length;
    const stationAvailability = availableStations / this.stations.length;

    // Train on each vehicle that has a charging plan
    this.plans.forEach(plan => {
      const vehicle = this.fleet.find(v => v.vehicle_id === plan.vehicle_id);
      if (!vehicle) return;

      // Create state
      const state = {
        hour: currentHour,
        vehicleSoC: vehicle.soc,
        energyPrice: currentPrice,
        stationAvailability,
      };

      // Action taken
      const action = {
        shouldCharge: true,
        targetSoC: 90,
        urgency: plan.priority === 'high' ? 'high' : plan.priority === 'medium' ? 'medium' : 'low',
      };

      // Calculate reward
      const reward = rlAgent.calculateReward(
        vehicle,
        action,
        currentPrice,
        plan.estimated_cost,
        (plan.end_time.getTime() - plan.start_time.getTime()) / (1000 * 60 * 60)
      );

      // Next state (after charging)
      const nextState = {
        hour: (currentHour + 1) % 24,
        vehicleSoC: 90, // Target SoC
        energyPrice: this.pricing[(currentHour + 1) % 24].price,
        stationAvailability,
      };

      // Learn from this experience
      rlAgent.learn(state, action, reward, nextState);
    });
  }

  /**
   * Simulate real-time updates (for demo purposes)
   * In production, this would react to real sensor/vehicle data
   */
  simulateUpdates(): void {
    // Update some vehicle charges (vehicles that are charging)
    this.fleet.forEach(vehicle => {
      if (vehicle.status === 'charging') {
        // Add some charge (simulate 5-10 minutes of charging)
        const chargeAdded = (vehicle.charging_speed / 60) * (5 + Math.random() * 5);
        vehicle.current_charge = Math.min(
          vehicle.current_charge + chargeAdded,
          vehicle.battery_capacity
        );
        vehicle.soc = Math.round((vehicle.current_charge / vehicle.battery_capacity) * 100);
        
        // If fully charged, mark as idle
        if (vehicle.soc >= 90) {
          vehicle.status = 'idle';
        }
      }
    });
    
    // Randomly change some station availability
    if (Math.random() < 0.1) {
      const randomStation = this.stations[Math.floor(Math.random() * this.stations.length)];
      randomStation.available = !randomStation.available;
      
      if (randomStation.available) {
        randomStation.current_usage = 0;
        randomStation.occupied_by = undefined;
      }
    }
    
    this.lastUpdated = new Date();
  }

  /**
   * Get complete dashboard state
   */
  getDashboardState(): DashboardState {
    return {
      fleet: this.fleet,
      stations: this.stations,
      charging_plans: this.plans,
      energy_pricing: this.pricing,
      alerts: this.alerts,
      metrics: this.metrics,
      last_updated: this.lastUpdated,
    };
  }

  /**
   * Get fleet data
   */
  getFleet(): ElectricVehicle[] {
    return this.fleet;
  }

  /**
   * Get specific vehicle by ID
   */
  getVehicle(vehicleId: string): ElectricVehicle | undefined {
    return this.fleet.find(v => v.vehicle_id === vehicleId);
  }

  /**
   * Get charging stations
   */
  getStations(): ChargingStation[] {
    return this.stations;
  }

  /**
   * Get energy pricing data
   */
  getPricing(): EnergyPricing[] {
    return this.pricing;
  }

  /**
   * Get charging plans
   */
  getChargingPlans(): ChargingPlan[] {
    return this.plans;
  }

  /**
   * Get system alerts
   */
  getAlerts(): Alert[] {
    return this.alerts;
  }

  /**
   * Get optimization metrics
   */
  getMetrics(): OptimizationMetrics {
    return this.metrics;
  }

  /**
   * Manually assign vehicle to station (override optimization)
   * @param vehicleId - Vehicle to assign
   * @param stationId - Target charging station
   */
  manualAssignment(vehicleId: string, stationId: string): ChargingPlan | null {
    const vehicle = this.fleet.find(v => v.vehicle_id === vehicleId);
    const station = this.stations.find(s => s.station_id === stationId);
    
    if (!vehicle || !station) {
      return null;
    }
    
    // Calculate charging parameters
    const targetSoC = 90;
    const energyNeeded = (vehicle.battery_capacity * (targetSoC - vehicle.soc)) / 100;
    const effectiveChargingRate = Math.min(station.max_power, vehicle.charging_speed);
    const chargingDurationHours = energyNeeded / effectiveChargingRate;
    
    const now = new Date();
    const endTime = new Date(now.getTime() + chargingDurationHours * 60 * 60 * 1000);
    
    // Simple cost calculation (use current hour pricing)
    const currentPrice = this.pricing[now.getHours()].price;
    const estimatedCost = energyNeeded * currentPrice;
    
    const newPlan: ChargingPlan = {
      vehicle_id: vehicleId,
      station_id: stationId,
      start_time: now,
      end_time: endTime,
      energy_to_charge: Math.round(energyNeeded * 10) / 10,
      estimated_cost: Math.round(estimatedCost * 100) / 100,
      priority: 'medium',
      distance_to_station: 0, // Would need to calculate
    };
    
    // Update or add the plan
    const existingPlanIndex = this.plans.findIndex(p => p.vehicle_id === vehicleId);
    if (existingPlanIndex >= 0) {
      this.plans[existingPlanIndex] = newPlan;
    } else {
      this.plans.push(newPlan);
    }
    
    // Update vehicle and station status
    vehicle.status = 'charging';
    station.available = false;
    station.occupied_by = vehicleId;
    
    this.lastUpdated = new Date();
    
    return newPlan;
  }
}

// Singleton instance
export const dataService = new DataService();
