/**
 * Mock Data Generator for EV Fleet Charging Optimization System
 * Generates realistic mock data for EVs, charging stations, and energy pricing
 */

import type { 
  ElectricVehicle, 
  ChargingStation, 
  EnergyPricing, 
  Location,
  TripSchedule,
  Alert 
} from '../models/types.js';

/**
 * Generate a random location within a grid (0-100 for both x and y)
 */
function randomLocation(): Location {
  return {
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  };
}

/**
 * Generate random trip schedules for a vehicle
 * Creates 1-3 upcoming trips with realistic timing
 */
function generateTripSchedules(): TripSchedule[] {
  const schedules: TripSchedule[] = [];
  const numTrips = Math.floor(Math.random() * 3) + 1; // 1-3 trips
  const now = new Date();
  
  for (let i = 0; i < numTrips; i++) {
    const hoursUntilDeparture = (i + 1) * 4 + Math.random() * 4; // Spread trips throughout day
    const tripDuration = 1 + Math.random() * 3; // 1-4 hours
    
    const departure = new Date(now.getTime() + hoursUntilDeparture * 60 * 60 * 1000);
    const arrival = new Date(departure.getTime() + tripDuration * 60 * 60 * 1000);
    
    schedules.push({
      departure,
      arrival,
      destination: ['Downtown', 'Airport', 'Warehouse', 'Depot', 'Client Site'][Math.floor(Math.random() * 5)],
    });
  }
  
  return schedules;
}

/**
 * Generate a fleet of electric vehicles with realistic attributes
 * @param count - Number of vehicles to generate (default: 20)
 */
export function generateEVFleet(count: number = 20): ElectricVehicle[] {
  const fleet: ElectricVehicle[] = [];
  const models = ['Tesla Model 3', 'Nissan Leaf', 'Chevy Bolt', 'BMW i3', 'Ford Mustang Mach-E', 'VW ID.4'];
  const statuses: Array<'idle' | 'charging' | 'in_use' | 'maintenance'> = ['idle', 'charging', 'in_use', 'maintenance'];
  
  for (let i = 0; i < count; i++) {
    const batteryCapacity = 50 + Math.random() * 50; // 50-100 kWh
    const currentCharge = Math.random() * batteryCapacity; // Random current charge
    const soc = (currentCharge / batteryCapacity) * 100; // Calculate State of Charge percentage
    
    // More vehicles are idle or charging than in use/maintenance
    const statusWeights = [0.4, 0.3, 0.25, 0.05];
    const rand = Math.random();
    let status: typeof statuses[number] = 'idle';
    let cumulative = 0;
    
    for (let j = 0; j < statusWeights.length; j++) {
      cumulative += statusWeights[j];
      if (rand < cumulative) {
        status = statuses[j];
        break;
      }
    }
    
    fleet.push({
      vehicle_id: `EV-${String(i + 1).padStart(3, '0')}`,
      battery_capacity: Math.round(batteryCapacity),
      current_charge: Math.round(currentCharge * 10) / 10,
      soc: Math.round(soc),
      location: randomLocation(),
      trip_schedule: generateTripSchedules(),
      status,
      model: models[Math.floor(Math.random() * models.length)],
      charging_speed: [7, 11, 22, 50, 150][Math.floor(Math.random() * 5)], // Various charging speeds
    });
  }
  
  return fleet;
}

/**
 * Generate charging stations across the service area
 * @param count - Number of stations to generate (default: 10)
 */
export function generateChargingStations(count: number = 10): ChargingStation[] {
  const stations: ChargingStation[] = [];
  const types: Array<'fast' | 'standard' | 'ultra_fast'> = ['standard', 'fast', 'ultra_fast'];
  const powerLevels = { standard: 11, fast: 50, ultra_fast: 150 }; // kW by type
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const available = Math.random() > 0.3; // 70% availability
    
    stations.push({
      station_id: `CS-${String(i + 1).padStart(3, '0')}`,
      location: randomLocation(),
      max_power: powerLevels[type],
      available,
      current_usage: available ? 0 : Math.random() * powerLevels[type],
      occupied_by: available ? undefined : `EV-${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
      type,
    });
  }
  
  return stations;
}

/**
 * Generate 24-hour energy pricing data with peak/off-peak periods
 * Models realistic time-of-use electricity pricing
 */
export function generateEnergyPricing(): EnergyPricing[] {
  const pricing: EnergyPricing[] = [];
  
  // Define pricing tiers (in currency units per kWh)
  const offPeakPrice = 0.08;   // Cheapest (night time)
  const shoulderPrice = 0.12;  // Mid-range (morning/evening)
  const peakPrice = 0.20;      // Most expensive (afternoon)
  
  for (let hour = 0; hour < 24; hour++) {
    let price: number;
    let period: 'peak' | 'off_peak' | 'shoulder';
    let demand: number;
    
    // Off-peak: 10 PM - 6 AM
    if (hour >= 22 || hour < 6) {
      price = offPeakPrice;
      period = 'off_peak';
      demand = 20 + Math.random() * 20; // Low demand
    }
    // Peak: 2 PM - 8 PM
    else if (hour >= 14 && hour < 20) {
      price = peakPrice;
      period = 'peak';
      demand = 70 + Math.random() * 30; // High demand
    }
    // Shoulder: All other times
    else {
      price = shoulderPrice;
      period = 'shoulder';
      demand = 40 + Math.random() * 30; // Medium demand
    }
    
    pricing.push({
      hour,
      price: Math.round(price * 100) / 100, // Round to 2 decimals
      period,
      demand: Math.round(demand),
    });
  }
  
  return pricing;
}

/**
 * Generate system alerts based on fleet and station status
 * Creates alerts for low battery, maintenance needs, and conflicts
 */
export function generateAlerts(fleet: ElectricVehicle[]): Alert[] {
  const alerts: Alert[] = [];
  let alertId = 1;
  
  fleet.forEach(vehicle => {
    // Low battery alert (SoC < 20%)
    if (vehicle.soc < 20 && vehicle.status !== 'charging') {
      alerts.push({
        id: `ALERT-${String(alertId++).padStart(3, '0')}`,
        type: 'low_battery',
        severity: vehicle.soc < 10 ? 'critical' : 'warning',
        vehicle_id: vehicle.vehicle_id,
        message: `${vehicle.vehicle_id} has low battery (${vehicle.soc}% SoC) and needs charging`,
        timestamp: new Date(),
        resolved: false,
      });
    }
    
    // Maintenance alert
    if (vehicle.status === 'maintenance') {
      alerts.push({
        id: `ALERT-${String(alertId++).padStart(3, '0')}`,
        type: 'maintenance',
        severity: 'warning',
        vehicle_id: vehicle.vehicle_id,
        message: `${vehicle.vehicle_id} requires maintenance attention`,
        timestamp: new Date(),
        resolved: false,
      });
    }
    
    // Trip conflict (low battery with upcoming trip)
    if (vehicle.soc < 50 && vehicle.trip_schedule.length > 0) {
      const nextTrip = vehicle.trip_schedule[0];
      const hoursUntilTrip = (nextTrip.departure.getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursUntilTrip < 4) {
        alerts.push({
          id: `ALERT-${String(alertId++).padStart(3, '0')}`,
          type: 'trip_conflict',
          severity: 'critical',
          vehicle_id: vehicle.vehicle_id,
          message: `${vehicle.vehicle_id} has upcoming trip in ${hoursUntilTrip.toFixed(1)}h but only ${vehicle.soc}% SoC`,
          timestamp: new Date(),
          resolved: false,
        });
      }
    }
  });
  
  // Grid peak alert
  const currentHour = new Date().getHours();
  if (currentHour >= 14 && currentHour < 20) {
    alerts.push({
      id: `ALERT-${String(alertId++).padStart(3, '0')}`,
      type: 'grid_peak',
      severity: 'info',
      message: 'Currently in peak pricing period. Consider delaying non-urgent charging.',
      timestamp: new Date(),
      resolved: false,
    });
  }
  
  return alerts;
}
