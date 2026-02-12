/**
 * Reinforcement Learning Agent
 * Uses Q-Learning approach to continuously improve charging decisions
 * 
 * The RL Agent learns from historical charging decisions to optimize:
 * - When to charge (timing)
 * - How much to charge
 * - Which station to use
 * - Trade-offs between cost, time, and convenience
 */

import type { ElectricVehicle, ChargingStation, EnergyPricing } from '../models/types.js';

interface State {
  hour: number;
  vehicleSoC: number;
  energyPrice: number;
  stationAvailability: number;
}

interface Action {
  shouldCharge: boolean;
  targetSoC: number;
  urgency: 'low' | 'medium' | 'high';
}

interface QValue {
  state: string;
  action: string;
  value: number;
  visits: number;
}

/**
 * Reinforcement Learning Agent for Charging Optimization
 * Implements Q-Learning with epsilon-greedy exploration
 */
export class ReinforcementLearningAgent {
  private qTable: Map<string, Map<string, QValue>>;
  private learningRate: number = 0.1;
  private discountFactor: number = 0.95;
  private epsilon: number = 0.1; // Exploration rate
  private rewardHistory: number[] = [];

  constructor() {
    this.qTable = new Map();
  }

  /**
   * Convert state to a discrete key for Q-table
   */
  private stateToKey(state: State): string {
    const hourBucket = Math.floor(state.hour / 4); // 6 time buckets per day
    const socBucket = Math.floor(state.vehicleSoC / 20); // 5 SoC buckets
    const priceBucket = state.energyPrice > 0.15 ? 'high' : state.energyPrice > 0.10 ? 'med' : 'low';
    const availBucket = state.stationAvailability > 0.7 ? 'high' : state.stationAvailability > 0.4 ? 'med' : 'low';
    
    return `${hourBucket}-${socBucket}-${priceBucket}-${availBucket}`;
  }

  /**
   * Convert action to a discrete key
   */
  private actionToKey(action: Action): string {
    return `${action.shouldCharge}-${action.targetSoC}-${action.urgency}`;
  }

  /**
   * Get Q-value for a state-action pair
   */
  private getQValue(state: State, action: Action): number {
    const stateKey = this.stateToKey(state);
    const actionKey = this.actionToKey(action);
    
    if (!this.qTable.has(stateKey)) {
      this.qTable.set(stateKey, new Map());
    }
    
    const actions = this.qTable.get(stateKey)!;
    if (!actions.has(actionKey)) {
      actions.set(actionKey, { state: stateKey, action: actionKey, value: 0, visits: 0 });
    }
    
    return actions.get(actionKey)!.value;
  }

  /**
   * Update Q-value using Q-learning update rule
   */
  private updateQValue(state: State, action: Action, reward: number, nextState: State): void {
    const stateKey = this.stateToKey(state);
    const actionKey = this.actionToKey(action);
    
    const currentQ = this.getQValue(state, action);
    
    // Find max Q-value for next state
    const nextActions = this.getPossibleActions(nextState);
    const maxNextQ = Math.max(...nextActions.map(a => this.getQValue(nextState, a)));
    
    // Q-learning update: Q(s,a) = Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
    const newQ = currentQ + this.learningRate * (reward + this.discountFactor * maxNextQ - currentQ);
    
    const actions = this.qTable.get(stateKey)!;
    const qValue = actions.get(actionKey)!;
    qValue.value = newQ;
    qValue.visits += 1;
    
    this.rewardHistory.push(reward);
  }

  /**
   * Get all possible actions for a state
   */
  private getPossibleActions(state: State): Action[] {
    const actions: Action[] = [];
    
    // Action space
    const shouldChargeOptions = [true, false];
    const targetSoCOptions = [80, 90, 100];
    const urgencyOptions: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    
    shouldChargeOptions.forEach(shouldCharge => {
      if (!shouldCharge) {
        actions.push({ shouldCharge: false, targetSoC: 0, urgency: 'low' });
      } else {
        targetSoCOptions.forEach(targetSoC => {
          urgencyOptions.forEach(urgency => {
            actions.push({ shouldCharge, targetSoC, urgency });
          });
        });
      }
    });
    
    return actions;
  }

  /**
   * Select best action using epsilon-greedy policy
   */
  public selectAction(state: State): Action {
    // Epsilon-greedy: explore with probability epsilon
    if (Math.random() < this.epsilon) {
      // Exploration: random action
      const actions = this.getPossibleActions(state);
      return actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Exploitation: best known action
      const actions = this.getPossibleActions(state);
      let bestAction = actions[0];
      let bestValue = this.getQValue(state, bestAction);
      
      actions.forEach(action => {
        const value = this.getQValue(state, action);
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      });
      
      return bestAction;
    }
  }

  /**
   * Calculate reward for a charging decision
   */
  public calculateReward(
    vehicle: ElectricVehicle,
    action: Action,
    energyPrice: number,
    chargingCost: number,
    timeUsed: number
  ): number {
    let reward = 0;
    
    // Positive reward for keeping battery healthy (50-80% is optimal)
    if (vehicle.soc >= 50 && vehicle.soc <= 80) {
      reward += 10;
    }
    
    // Negative reward for low battery (risk of vehicle unavailability)
    if (vehicle.soc < 20) {
      reward -= 20;
    }
    
    // Reward for charging during off-peak (low price) hours
    if (action.shouldCharge && energyPrice < 0.10) {
      reward += 15;
    } else if (action.shouldCharge && energyPrice > 0.15) {
      reward -= 10; // Penalty for peak charging
    }
    
    // Reward for efficiency (minimize cost)
    reward -= chargingCost * 10; // Scale cost to reward units
    
    // Reward for time efficiency
    reward -= timeUsed * 2; // Penalty for long charging times
    
    // Reward for meeting demand (vehicle available when needed)
    if (vehicle.trip_schedule.length > 0) {
      const nextTrip = vehicle.trip_schedule[0];
      const hoursUntilTrip = (new Date(nextTrip.departure).getTime() - Date.now()) / (1000 * 60 * 60);
      
      if (hoursUntilTrip < 2 && vehicle.soc >= 80) {
        reward += 25; // High reward for ensuring vehicle is ready
      } else if (hoursUntilTrip < 2 && vehicle.soc < 50) {
        reward -= 30; // High penalty for vehicle not ready
      }
    }
    
    return reward;
  }

  /**
   * Train the agent with a new experience
   */
  public learn(
    state: State,
    action: Action,
    reward: number,
    nextState: State
  ): void {
    this.updateQValue(state, action, reward, nextState);
  }

  /**
   * Get agent performance metrics
   */
  public getPerformanceMetrics(): {
    totalStatesLearned: number;
    averageReward: number;
    explorationRate: number;
  } {
    const avgReward = this.rewardHistory.length > 0
      ? this.rewardHistory.slice(-100).reduce((a, b) => a + b, 0) / Math.min(100, this.rewardHistory.length)
      : 0;
    
    return {
      totalStatesLearned: this.qTable.size,
      averageReward: Math.round(avgReward * 100) / 100,
      explorationRate: this.epsilon,
    };
  }

  /**
   * Recommend optimal charging strategy using learned policy
   */
  public recommendStrategy(
    vehicle: ElectricVehicle,
    currentHour: number,
    energyPrice: number,
    stationAvailability: number
  ): {
    shouldCharge: boolean;
    reasoning: string;
    confidence: number;
  } {
    const state: State = {
      hour: currentHour,
      vehicleSoC: vehicle.soc,
      energyPrice,
      stationAvailability,
    };
    
    const action = this.selectAction(state);
    const qValue = this.getQValue(state, action);
    
    // Convert Q-value to confidence (normalize to 0-1)
    const confidence = Math.min(1, Math.max(0, (qValue + 50) / 100));
    
    let reasoning = '';
    if (action.shouldCharge) {
      reasoning = `Charge to ${action.targetSoC}% (${action.urgency} urgency). `;
      if (energyPrice < 0.10) {
        reasoning += 'Low energy price detected. ';
      }
      if (vehicle.soc < 30) {
        reasoning += 'Battery level critical. ';
      }
    } else {
      reasoning = 'Wait for better conditions. ';
      if (energyPrice > 0.15) {
        reasoning += 'Energy price too high. ';
      }
      if (vehicle.soc > 70) {
        reasoning += 'Battery level sufficient. ';
      }
    }
    
    return {
      shouldCharge: action.shouldCharge,
      reasoning: reasoning.trim(),
      confidence: Math.round(confidence * 100) / 100,
    };
  }
}

// Singleton RL Agent instance
export const rlAgent = new ReinforcementLearningAgent();
