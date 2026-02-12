/**
 * Energy Pricing Chart Component
 * Visualizes 24-hour energy pricing with peak/off-peak periods
 */

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { EnergyPricing } from '../types';

interface EnergyPricingChartProps {
  pricing: EnergyPricing[];
}

/**
 * Get color based on pricing period
 */
const getPeriodColor = (period: EnergyPricing['period']): string => {
  const colorMap = {
    peak: '#ef4444',
    off_peak: '#10b981',
    shoulder: '#f59e0b',
  };
  return colorMap[period];
};

/**
 * Custom tooltip for the chart
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        padding: '0.75rem',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
        {data.hour}:00
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Price: €{data.price.toFixed(2)} / kWh
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        Demand: {data.demand}%
      </div>
      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
        <span
          className={`badge badge-${data.period.replace('_', '-')}`}
          style={{ textTransform: 'capitalize' }}
        >
          {data.period.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};

/**
 * Energy Pricing Chart - Shows 24-hour pricing visualization
 */
export const EnergyPricingChart: React.FC<EnergyPricingChartProps> = ({ pricing }) => {
  const currentHour = new Date().getHours();
  
  // Find peak and off-peak prices
  const peakPrice = Math.max(...pricing.map(p => p.price));
  const offPeakPrice = Math.min(...pricing.map(p => p.price));
  const avgPrice = pricing.reduce((sum, p) => sum + p.price, 0) / pricing.length;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <TrendingUp size={24} />
            Energy Pricing (24h)
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Current hour: {currentHour}:00 • Peak: €{peakPrice.toFixed(2)} • Off-peak: €{offPeakPrice.toFixed(2)} • Avg: €{avgPrice.toFixed(2)}
          </div>
        </div>
      </div>
      <div className="card-content">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
            <span>Peak</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
            <span>Shoulder</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#10b981' }} />
            <span>Off-Peak</span>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pricing} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="hour"
              stroke="var(--color-text-muted)"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickFormatter={(value) => `${value}h`}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="price" radius={[4, 4, 0, 0]}>
              {pricing.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPeriodColor(entry.period)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
