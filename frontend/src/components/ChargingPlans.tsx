/**
 * Charging Plans Component
 * Displays AI-optimized charging schedules for the fleet
 */

import React from 'react';
import { Calendar, Clock, DollarSign, Navigation } from 'lucide-react';
import type { ChargingPlan } from '../types';

interface ChargingPlansProps {
  plans: ChargingPlan[];
}

/**
 * Get priority badge class
 */
const getPriorityBadgeClass = (priority: ChargingPlan['priority']): string => {
  const priorityMap = {
    high: 'badge-priority-high',
    medium: 'badge-priority-medium',
    low: 'badge-priority-low',
  };
  return priorityMap[priority];
};

/**
 * Format date/time for display
 */
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Calculate duration in hours
 */
const calculateDuration = (start: string, end: string): string => {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  return hours.toFixed(1);
};

/**
 * Individual charging plan row
 */
const PlanRow: React.FC<{ plan: ChargingPlan }> = ({ plan }) => {
  const duration = calculateDuration(plan.start_time, plan.end_time);

  return (
    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 600 }}>{plan.vehicle_id}</div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ color: 'var(--color-primary)' }}>{plan.station_id}</div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <Calendar size={14} />
          {formatDate(plan.start_time)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Clock size={14} />
          {formatTime(plan.start_time)} - {formatTime(plan.end_time)}
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 600 }}>{plan.energy_to_charge} kWh</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          {duration} hours
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-success)', fontWeight: 600 }}>
          <DollarSign size={16} />
          €{plan.estimated_cost.toFixed(2)}
        </div>
      </td>
      <td style={{ padding: '1rem' }}>
        <span className={`badge ${getPriorityBadgeClass(plan.priority)}`}>
          {plan.priority}
        </span>
      </td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          <Navigation size={14} />
          {plan.distance_to_station.toFixed(1)} units
        </div>
      </td>
    </tr>
  );
};

/**
 * Charging Plans Component - Shows optimized charging schedule
 */
export const ChargingPlans: React.FC<ChargingPlansProps> = ({ plans }) => {
  // Sort plans by priority (high first) and then by start time
  const sortedPlans = [...plans].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Calendar size={24} />
            Charging Schedule
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {plans.length} vehicles scheduled • AI-optimized for cost and availability
          </div>
        </div>
      </div>
      <div className="card-content">
        {plans.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            No charging plans available. All vehicles are adequately charged.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Vehicle
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Station
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Schedule
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Energy
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Cost
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Priority
                  </th>
                  <th style={{ padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Distance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPlans.map(plan => (
                  <PlanRow key={`${plan.vehicle_id}-${plan.station_id}`} plan={plan} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
