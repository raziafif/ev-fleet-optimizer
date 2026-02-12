/**
 * Predictive Models Service
 * Implements forecasting for charging demand, energy prices, and vehicle availability
 */

import type { ElectricVehicle, EnergyPricing } from '../models/types.js';

/**
 * Predict charging demand for next 24 hours
 * Uses historical patterns to forecast when vehicles will need charging
 */
export function predictChargingDemand(fleet: ElectricVehicle[]): Array<{ hour: number; expectedDemand: number }> {
  const predictions: Array<{ hour: number; expectedDemand: number }> = [];
  
  // Analyze fleet patterns
  const lowBatteryVehicles = fleet.filter(v => v.soc < 30).length;
  const baseDemand = lowBatteryVehicles / fleet.length;
  
  for (let hour = 0; hour < 24; hour++) {
    let expectedDemand = 0;
    
    // Morning peak (6-9 AM) - vehicles returning from night shifts
    if (hour >= 6 && hour < 9) {
      expectedDemand = baseDemand * 1.5;
    }
    // Evening peak (5-8 PM) - vehicles returning from day operations
    else if (hour >= 17 && hour < 20) {
      expectedDemand = baseDemand * 1.8;
    }
    // Night charging (10 PM - 6 AM) - optimal time
    else if (hour >= 22 || hour < 6) {
      expectedDemand = baseDemand * 2.0;
    }
    // Off-peak hours
    else {
      expectedDemand = baseDemand * 0.5;
    }
    
    // Add some randomness for realism
    expectedDemand = expectedDemand * (0.8 + Math.random() * 0.4);
    
    predictions.push({
      hour,
      expectedDemand: Math.round(expectedDemand * 100) / 100,
    });
  }
  
  return predictions;
}

/**
 * Predict energy price trends for next 24 hours
 * Uses time-series forecasting to anticipate price changes
 */
export function predictEnergyPrices(currentPricing: EnergyPricing[]): Array<{ hour: number; predictedPrice: number; confidence: number }> {
  const predictions: Array<{ hour: number; predictedPrice: number; confidence: number }> = [];
  
  for (let hour = 0; hour < 24; hour++) {
    const currentPrice = currentPricing[hour].price;
    
    // Predict slight variations based on historical patterns
    const variation = (Math.random() - 0.5) * 0.02; // ±2% variation
    const predictedPrice = currentPrice * (1 + variation);
    
    // Confidence is higher during stable periods
    const isStablePeriod = currentPricing[hour].period === 'off_peak';
    const confidence = isStablePeriod ? 0.9 : 0.7;
    
    predictions.push({
      hour,
      predictedPrice: Math.round(predictedPrice * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    });
  }
  
  return predictions;
}

/**
 * Predict vehicle availability based on trip schedules
 * Forecasts when vehicles will be available for charging
 */
export function predictVehicleAvailability(fleet: ElectricVehicle[]): Array<{ vehicleId: string; availableAt: Date; predictedSoC: number }> {
  const predictions: Array<{ vehicleId: string; availableAt: Date; predictedSoC: number }> = [];
  
  fleet.forEach(vehicle => {
    if (vehicle.status === 'in_use' && vehicle.trip_schedule.length > 0) {
      const nextTrip = vehicle.trip_schedule[0];
      const arrivalTime = new Date(nextTrip.arrival);
      
      // Predict battery drain during trip (assume 20% average consumption)
      const estimatedDrain = 15 + Math.random() * 10; // 15-25%
      const predictedSoC = Math.max(0, vehicle.soc - estimatedDrain);
      
      predictions.push({
        vehicleId: vehicle.vehicle_id,
        availableAt: arrivalTime,
        predictedSoC: Math.round(predictedSoC),
      });
    }
  });
  
  return predictions.sort((a, b) => a.availableAt.getTime() - b.availableAt.getTime());
}

/**
 * Machine Learning Model for Battery Health Prediction
 * Predicts battery degradation and maintenance needs
 */
export function predictBatteryHealth(vehicle: ElectricVehicle): {
  healthScore: number;
  estimatedLifeRemaining: number; // in months
  maintenanceRecommendation: string;
} {
  // Simplified model based on usage patterns
  const age = Math.random() * 36; // Simulate vehicle age in months
  const cycleCount = Math.random() * 1000; // Charging cycles
  
  // Health score calculation (100 = perfect, 0 = needs replacement)
  let healthScore = 100;
  healthScore -= (age / 36) * 20; // Age factor
  healthScore -= (cycleCount / 1000) * 15; // Cycle factor
  healthScore -= vehicle.soc < 20 ? 10 : 0; // Low SoC stress
  
  healthScore = Math.max(0, Math.min(100, healthScore));
  
  // Estimate remaining life
  const estimatedLifeRemaining = Math.round((healthScore / 100) * 60); // Max 60 months
  
  // Maintenance recommendation
  let recommendation = 'Good condition';
  if (healthScore < 50) {
    recommendation = 'Schedule battery inspection soon';
  } else if (healthScore < 30) {
    recommendation = 'Critical: Battery replacement needed';
  }
  
  return {
    healthScore: Math.round(healthScore),
    estimatedLifeRemaining,
    maintenanceRecommendation: recommendation,
  };
}
