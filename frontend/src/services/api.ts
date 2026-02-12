/**
 * API Service for communicating with the backend
 * Provides type-safe methods for fetching data from REST endpoints
 */

import type {
  DashboardState,
  ElectricVehicle,
  ChargingStation,
  EnergyPricing,
  ChargingPlan,
  Alert,
  OptimizationMetrics,
  ApiResponse,
} from '../types/index';

// Base API URL - uses Vite proxy in development, configurable for production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'API request failed');
    }

    return result.data as T;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * API Service object with all available endpoints
 */
export const apiService = {
  /**
   * Fetch complete dashboard state
   */
  async getDashboardState(): Promise<DashboardState> {
    return fetchApi<DashboardState>('/dashboard');
  },

  /**
   * Fetch all vehicles in the fleet
   */
  async getFleet(): Promise<ElectricVehicle[]> {
    return fetchApi<ElectricVehicle[]>('/fleet');
  },

  /**
   * Fetch specific vehicle by ID
   */
  async getVehicle(vehicleId: string): Promise<ElectricVehicle> {
    return fetchApi<ElectricVehicle>(`/fleet/${vehicleId}`);
  },

  /**
   * Fetch all charging stations
   */
  async getStations(): Promise<ChargingStation[]> {
    return fetchApi<ChargingStation[]>('/stations');
  },

  /**
   * Fetch energy pricing data
   */
  async getPricing(): Promise<EnergyPricing[]> {
    return fetchApi<EnergyPricing[]>('/pricing');
  },

  /**
   * Fetch charging plans
   */
  async getChargingPlans(): Promise<ChargingPlan[]> {
    return fetchApi<ChargingPlan[]>('/charging-plans');
  },

  /**
   * Fetch system alerts
   */
  async getAlerts(): Promise<Alert[]> {
    return fetchApi<Alert[]>('/alerts');
  },

  /**
   * Fetch optimization metrics
   */
  async getMetrics(): Promise<OptimizationMetrics> {
    return fetchApi<OptimizationMetrics>('/metrics');
  },

  /**
   * Trigger optimization run
   */
  async runOptimization(): Promise<{ plans: ChargingPlan[]; metrics: OptimizationMetrics }> {
    return fetchApi('/optimize', {
      method: 'POST',
    });
  },

  /**
   * Create manual vehicle-to-station assignment
   */
  async createManualAssignment(vehicleId: string, stationId: string): Promise<ChargingPlan> {
    return fetchApi<ChargingPlan>('/manual-assignment', {
      method: 'POST',
      body: JSON.stringify({ vehicleId, stationId }),
    });
  },

  /**
   * Get demand predictions
   */
  async getDemandPredictions(): Promise<any[]> {
    return fetchApi<any[]>('/predictions/demand');
  },

  /**
   * Get price predictions
   */
  async getPricePredictions(): Promise<any[]> {
    return fetchApi<any[]>('/predictions/prices');
  },

  /**
   * Get vehicle availability predictions
   */
  async getAvailabilityPredictions(): Promise<any[]> {
    return fetchApi<any[]>('/predictions/availability');
  },

  /**
   * Get battery health prediction for a vehicle
   */
  async getBatteryHealth(vehicleId: string): Promise<any> {
    return fetchApi<any>(`/ml/battery-health/${vehicleId}`);
  },

  /**
   * Get RL agent performance metrics
   */
  async getRLPerformance(): Promise<any> {
    return fetchApi<any>('/ml/rl-performance');
  },

  /**
   * Get RL recommendation for a vehicle
   */
  async getRLRecommendation(vehicleId: string): Promise<any> {
    return fetchApi<any>('/ml/rl-recommend', {
      method: 'POST',
      body: JSON.stringify({ vehicleId }),
    });
  },
};
