/**
 * Type definitions for the EV Fleet Charging Optimization System
 * These interfaces define the core data structures used throughout the application
 */

// Location coordinates (simplified 2D grid)
export interface Location {
  x: number; // X coordinate on the grid
  y: number; // Y coordinate on the grid
}

// Time-based trip schedule for each EV
export interface TripSchedule {
  departure: Date; // When the vehicle needs to depart
  arrival: Date;   // When the vehicle returns
  destination?: string; // Optional destination name
}

// Electric Vehicle representation
export interface ElectricVehicle {
  vehicle_id: string;           // Unique identifier
  battery_capacity: number;      // Total battery capacity in kWh
  current_charge: number;        // Current charge level in kWh
  soc: number;                   // State of Charge (percentage 0-100)
  location: Location;            // Current location
  trip_schedule: TripSchedule[]; // Upcoming trips
  status: 'idle' | 'charging' | 'in_use' | 'maintenance'; // Current status
  model: string;                 // Vehicle model name
  charging_speed: number;        // Max charging speed in kW
}

// Charging Station representation
export interface ChargingStation {
  station_id: string;       // Unique identifier
  location: Location;       // Station location
  max_power: number;        // Maximum charging power in kW
  available: boolean;       // Current availability status
  current_usage: number;    // Current power being used in kW
  occupied_by?: string;     // Vehicle ID if occupied
  type: 'fast' | 'standard' | 'ultra_fast'; // Charger type
}

// Energy/Grid pricing data
export interface EnergyPricing {
  hour: number;             // Hour of day (0-23)
  price: number;            // Price per kWh in currency units
  period: 'peak' | 'off_peak' | 'shoulder'; // Time period classification
  demand: number;           // Grid demand level (0-100)
}

// AI-generated charging plan for a vehicle
export interface ChargingPlan {
  vehicle_id: string;       // Vehicle being charged
  station_id: string;       // Assigned charging station
  start_time: Date;         // When to start charging
  end_time: Date;           // When charging completes
  energy_to_charge: number; // Amount of energy to charge in kWh
  estimated_cost: number;   // Estimated cost in currency units
  priority: 'high' | 'medium' | 'low'; // Charging priority
  distance_to_station: number; // Distance from vehicle to station
}

// System alert/notification
export interface Alert {
  id: string;
  type: 'low_battery' | 'maintenance' | 'charging_complete' | 'trip_conflict' | 'grid_peak'; // Alert type
  severity: 'critical' | 'warning' | 'info'; // Severity level
  vehicle_id?: string;      // Associated vehicle if applicable
  station_id?: string;      // Associated station if applicable
  message: string;          // Human-readable alert message
  timestamp: Date;          // When the alert was generated
  resolved: boolean;        // Whether the alert has been addressed
}

// Optimization metrics for dashboard
export interface OptimizationMetrics {
  total_energy_cost: number;        // Total estimated energy cost
  average_charging_time: number;    // Average time to charge in hours
  station_utilization: number;      // Percentage of station usage
  vehicles_optimized: number;       // Number of vehicles with optimized plans
  co2_saved: number;               // Estimated CO2 saved in kg (off-peak charging)
  cost_savings: number;            // Cost savings vs peak charging
}

// Complete system state for the dashboard
export interface DashboardState {
  fleet: ElectricVehicle[];
  stations: ChargingStation[];
  charging_plans: ChargingPlan[];
  energy_pricing: EnergyPricing[];
  alerts: Alert[];
  metrics: OptimizationMetrics;
  last_updated: Date;
}
