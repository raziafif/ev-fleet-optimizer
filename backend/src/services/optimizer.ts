/**
 * AI Optimization Service for EV Fleet Charging
 * Implements heuristic-based optimization to assign vehicles to charging stations
 * and create optimal charging schedules that minimize energy costs
 */

import type { 
  ElectricVehicle, 
  ChargingStation, 
  EnergyPricing, 
  ChargingPlan,
  OptimizationMetrics,
  Location 
} from '../models/types.js';

/**
 * Calculate Euclidean distance between two locations
 */
function calculateDistance(loc1: Location, loc2: Location): number {
  const dx = loc1.x - loc2.x;
  const dy = loc1.y - loc2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the cost to charge a vehicle at a specific time
 * @param energyAmount - kWh to charge
 * @param startHour - Hour when charging starts
 * @param durationHours - How long charging takes
 * @param pricing - Energy pricing data
 */
function calculateChargingCost(
  energyAmount: number,
  startHour: number,
  durationHours: number,
  pricing: EnergyPricing[]
): number {
  let totalCost = 0;
  const hoursToCharge = Math.ceil(durationHours);
  
  // Calculate cost for each hour of charging
  for (let i = 0; i < hoursToCharge; i++) {
    const hour = (startHour + i) % 24;
    const hourlyPrice = pricing[hour].price;
    const energyThisHour = Math.min(energyAmount / durationHours, energyAmount);
    
    totalCost += energyThisHour * hourlyPrice;
  }
  
  return totalCost;
}

/**
 * Determine charging priority based on vehicle state and upcoming trips
 * Higher priority vehicles should be charged first
 */
function calculatePriority(vehicle: ElectricVehicle): 'high' | 'medium' | 'low' {
  // Critical: Low battery with upcoming trip
  if (vehicle.soc < 30 && vehicle.trip_schedule.length > 0) {
    const nextTrip = vehicle.trip_schedule[0];
    const hoursUntilTrip = (nextTrip.departure.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntilTrip < 6) {
      return 'high';
    }
  }
  
  // High: Low battery without immediate trip
  if (vehicle.soc < 30) {
    return 'high';
  }
  
  // Medium: Moderate battery with trips scheduled
  if (vehicle.soc < 60 && vehicle.trip_schedule.length > 0) {
    return 'medium';
  }
  
  // Low: Adequate battery or no trips scheduled
  return 'low';
}

/**
 * Find the optimal charging time window based on energy pricing
 * Returns the start hour that minimizes cost while respecting deadlines
 */
function findOptimalChargingWindow(
  vehicle: ElectricVehicle,
  durationHours: number,
  pricing: EnergyPricing[]
): number {
  const currentHour = new Date().getHours();
  
  // If vehicle has urgent trip, charge immediately
  if (vehicle.trip_schedule.length > 0) {
    const nextTrip = vehicle.trip_schedule[0];
    const hoursUntilTrip = (nextTrip.departure.getTime() - Date.now()) / (1000 * 60 * 60);
    
    if (hoursUntilTrip < durationHours + 2) {
      return currentHour; // Charge now!
    }
  }
  
  // Otherwise, find cheapest time window in next 24 hours
  let minCost = Infinity;
  let optimalHour = currentHour;
  
  for (let hour = currentHour; hour < currentHour + 24; hour++) {
    const actualHour = hour % 24;
    const cost = calculateChargingCost(1, actualHour, durationHours, pricing); // Normalize to 1 kWh
    
    if (cost < minCost) {
      minCost = cost;
      optimalHour = actualHour;
    }
  }
  
  return optimalHour;
}

/**
 * Main optimization function: Creates charging plans for the entire fleet
 * Uses a greedy heuristic approach:
 * 1. Sort vehicles by priority
 * 2. For each vehicle, find nearest available station
 * 3. Schedule charging at optimal time based on energy pricing
 * 4. Calculate costs and generate plan
 */
export function optimizeChargingSchedule(
  fleet: ElectricVehicle[],
  stations: ChargingStation[],
  pricing: EnergyPricing[]
): ChargingPlan[] {
  const plans: ChargingPlan[] = [];
  const availableStations = stations.filter(s => s.available);
  
  // Filter vehicles that need charging (SoC < 80% and not in maintenance)
  const vehiclesNeedingCharge = fleet.filter(
    v => v.soc < 80 && v.status !== 'maintenance' && v.status !== 'in_use'
  );
  
  // Sort by priority (high priority first)
  const sortedVehicles = vehiclesNeedingCharge.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const aPriority = calculatePriority(a);
    const bPriority = calculatePriority(b);
    return priorityOrder[bPriority] - priorityOrder[aPriority];
  });
  
  // Track station assignments to avoid double-booking
  const stationAssignments = new Map<string, string>();
  
  for (const vehicle of sortedVehicles) {
    // Calculate energy needed to reach 90% SoC (leaving buffer)
    const targetSoC = 90;
    const energyNeeded = (vehicle.battery_capacity * (targetSoC - vehicle.soc)) / 100;
    
    if (energyNeeded <= 0) continue;
    
    // Find nearest available station
    let nearestStation: ChargingStation | null = null;
    let minDistance = Infinity;
    
    for (const station of availableStations) {
      // Skip if already assigned in this optimization cycle
      if (stationAssignments.has(station.station_id)) continue;
      
      const distance = calculateDistance(vehicle.location, station.location);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestStation = station;
      }
    }
    
    if (!nearestStation) {
      // No available stations, skip this vehicle
      continue;
    }
    
    // Calculate charging duration based on station power and vehicle charging speed
    const effectiveChargingRate = Math.min(nearestStation.max_power, vehicle.charging_speed);
    const chargingDurationHours = energyNeeded / effectiveChargingRate;
    
    // Find optimal charging start time
    const priority = calculatePriority(vehicle);
    const optimalStartHour = findOptimalChargingWindow(vehicle, chargingDurationHours, pricing);
    
    // Create charging plan
    const now = new Date();
    const startTime = new Date(now);
    
    // If optimal hour is in the past today, schedule for that hour tomorrow
    if (optimalStartHour < now.getHours() && priority !== 'high') {
      startTime.setDate(startTime.getDate() + 1);
    }
    
    startTime.setHours(optimalStartHour, 0, 0, 0);
    
    // For high priority, charge immediately
    if (priority === 'high') {
      startTime.setTime(now.getTime());
    }
    
    const endTime = new Date(startTime.getTime() + chargingDurationHours * 60 * 60 * 1000);
    const estimatedCost = calculateChargingCost(energyNeeded, optimalStartHour, chargingDurationHours, pricing);
    
    plans.push({
      vehicle_id: vehicle.vehicle_id,
      station_id: nearestStation.station_id,
      start_time: startTime,
      end_time: endTime,
      energy_to_charge: Math.round(energyNeeded * 10) / 10,
      estimated_cost: Math.round(estimatedCost * 100) / 100,
      priority,
      distance_to_station: Math.round(minDistance * 10) / 10,
    });
    
    // Mark station as assigned
    stationAssignments.set(nearestStation.station_id, vehicle.vehicle_id);
  }
  
  return plans;
}

/**
 * Calculate optimization metrics for the dashboard
 * Provides insights into cost savings, efficiency, and system performance
 */
export function calculateOptimizationMetrics(
  plans: ChargingPlan[],
  stations: ChargingStation[],
  pricing: EnergyPricing[]
): OptimizationMetrics {
  if (plans.length === 0) {
    return {
      total_energy_cost: 0,
      average_charging_time: 0,
      station_utilization: 0,
      vehicles_optimized: 0,
      co2_saved: 0,
      cost_savings: 0,
    };
  }
  
  // Calculate total cost from all plans
  const totalCost = plans.reduce((sum, plan) => sum + plan.estimated_cost, 0);
  
  // Calculate average charging time
  const totalChargingTime = plans.reduce((sum, plan) => {
    const duration = (plan.end_time.getTime() - plan.start_time.getTime()) / (1000 * 60 * 60);
    return sum + duration;
  }, 0);
  const avgChargingTime = totalChargingTime / plans.length;
  
  // Calculate station utilization (percentage of stations in use)
  const usedStations = new Set(plans.map(p => p.station_id)).size;
  const stationUtilization = (usedStations / stations.length) * 100;
  
  // Calculate CO2 savings (off-peak charging uses more renewable energy)
  // Rough estimate: off-peak charging saves ~0.5 kg CO2 per kWh vs peak
  const co2Saved = plans.reduce((sum, plan) => {
    const startHour = plan.start_time.getHours();
    const isOffPeak = pricing[startHour].period === 'off_peak';
    return sum + (isOffPeak ? plan.energy_to_charge * 0.5 : 0);
  }, 0);
  
  // Calculate cost savings vs always charging at peak rate
  const peakPrice = Math.max(...pricing.map(p => p.price));
  const totalEnergyCharged = plans.reduce((sum, plan) => sum + plan.energy_to_charge, 0);
  const peakCost = totalEnergyCharged * peakPrice;
  const costSavings = peakCost - totalCost;
  
  return {
    total_energy_cost: Math.round(totalCost * 100) / 100,
    average_charging_time: Math.round(avgChargingTime * 100) / 100,
    station_utilization: Math.round(stationUtilization * 10) / 10,
    vehicles_optimized: plans.length,
    co2_saved: Math.round(co2Saved * 10) / 10,
    cost_savings: Math.round(costSavings * 100) / 100,
  };
}
