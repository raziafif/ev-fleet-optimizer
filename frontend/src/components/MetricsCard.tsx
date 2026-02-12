/**
 * Metrics Card Component
 * Displays key optimization metrics in a visually appealing grid
 */

import React from 'react';
import { TrendingUp, DollarSign, Zap, Battery, Leaf } from 'lucide-react';
import type { OptimizationMetrics } from '../types';

interface MetricsCardProps {
  metrics: OptimizationMetrics;
}

/**
 * Individual metric display component
 */
const MetricItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  color: string;
}> = ({ icon, label, value, unit, color }) => (
  <div className="stat-card">
    <div style={{ color }} className="stat-label">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon}
        {label}
      </div>
    </div>
    <div className="stat-value">
      {value}
      {unit && <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}> {unit}</span>}
    </div>
  </div>
);

/**
 * Metrics Card Component - Shows optimization results and system performance
 */
export const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          <TrendingUp size={24} />
          Optimization Metrics
        </h2>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
          <MetricItem
            icon={<DollarSign size={16} />}
            label="Total Energy Cost"
            value={`€${metrics.total_energy_cost.toFixed(2)}`}
            color="var(--color-primary)"
          />
          <MetricItem
            icon={<DollarSign size={16} />}
            label="Cost Savings"
            value={`€${metrics.cost_savings.toFixed(2)}`}
            color="var(--color-success)"
          />
          <MetricItem
            icon={<Zap size={16} />}
            label="Avg Charging Time"
            value={metrics.average_charging_time.toFixed(1)}
            unit="hrs"
            color="var(--color-info)"
          />
          <MetricItem
            icon={<Battery size={16} />}
            label="Station Utilization"
            value={`${metrics.station_utilization.toFixed(0)}%`}
            color="var(--color-warning)"
          />
          <MetricItem
            icon={<Zap size={16} />}
            label="Vehicles Optimized"
            value={metrics.vehicles_optimized}
            color="var(--color-primary)"
          />
          <MetricItem
            icon={<Leaf size={16} />}
            label="CO₂ Saved"
            value={metrics.co2_saved.toFixed(1)}
            unit="kg"
            color="var(--color-success)"
          />
        </div>
      </div>
    </div>
  );
};
