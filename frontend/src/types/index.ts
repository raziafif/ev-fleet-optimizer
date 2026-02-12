/**
 * Frontend Type Definitions
 * Mirrors backend types for type-safe frontend development
 */

export interface Location {
  x: number;
  y: number;
}

export interface TripSchedule {
  departure: string; // ISO date string
  arrival: string;   // ISO date string
  destination?: string;
}

export interface ElectricVehicle {
  vehicle_id: string;
  battery_capacity: number;
  current_charge: number;
  soc: number;
  location: Location;
  trip_schedule: TripSchedule[];
  status: 'idle' | 'charging' | 'in_use' | 'maintenance';
  model: string;
  charging_speed: number;
}

export interface ChargingStation {
  station_id: string;
  location: Location;
  max_power: number;
  available: boolean;
  current_usage: number;
  occupied_by?: string;
  type: 'fast' | 'standard' | 'ultra_fast';
}

export interface EnergyPricing {
  hour: number;
  price: number;
  period: 'peak' | 'off_peak' | 'shoulder';
  demand: number;
}

export interface ChargingPlan {
  vehicle_id: string;
  station_id: string;
  start_time: string; // ISO date string
  end_time: string;   // ISO date string
  energy_to_charge: number;
  estimated_cost: number;
  priority: 'high' | 'medium' | 'low';
  distance_to_station: number;
}

export interface Alert {
  id: string;
  type: 'low_battery' | 'maintenance' | 'charging_complete' | 'trip_conflict' | 'grid_peak';
  severity: 'critical' | 'warning' | 'info';
  vehicle_id?: string;
  station_id?: string;
  message: string;
  timestamp: string; // ISO date string
  resolved: boolean;
}

export interface OptimizationMetrics {
  total_energy_cost: number;
  average_charging_time: number;
  station_utilization: number;
  vehicles_optimized: number;
  co2_saved: number;
  cost_savings: number;
}

export interface DashboardState {
  fleet: ElectricVehicle[];
  stations: ChargingStation[];
  charging_plans: ChargingPlan[];
  energy_pricing: EnergyPricing[];
  alerts: Alert[];
  metrics: OptimizationMetrics;
  last_updated: string; // ISO date string
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
