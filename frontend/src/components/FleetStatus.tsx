/**
 * Fleet Status Component
 * Displays all vehicles with their current status, battery level, and details
 */

import React from 'react';
import { Car, Battery } from 'lucide-react';
import type { ElectricVehicle } from '../types';

interface FleetStatusProps {
  fleet: ElectricVehicle[];
}

/**
 * Get badge class based on vehicle status
 */
const getStatusBadgeClass = (status: ElectricVehicle['status']): string => {
  const statusMap = {
    idle: 'badge-idle',
    charging: 'badge-charging',
    in_use: 'badge-in-use',
    maintenance: 'badge-maintenance',
  };
  return statusMap[status];
};

/**
 * Get battery color based on State of Charge
 */
const getBatteryColor = (soc: number): string => {
  if (soc < 20) return 'var(--color-danger)';
  if (soc < 50) return 'var(--color-warning)';
  return 'var(--color-success)';
};

/**
 * Individual vehicle card
 */
const VehicleCard: React.FC<{ vehicle: ElectricVehicle }> = ({ vehicle }) => {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
            {vehicle.vehicle_id}
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {vehicle.model}
          </div>
        </div>
        <span className={`badge ${getStatusBadgeClass(vehicle.status)}`}>
          {vehicle.status.replace('_', ' ')}
        </span>
      </div>

      {/* Battery indicator */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <Battery size={16} color={getBatteryColor(vehicle.soc)} />
            <span style={{ color: getBatteryColor(vehicle.soc), fontWeight: 600 }}>
              {vehicle.soc}%
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {vehicle.current_charge.toFixed(1)} / {vehicle.battery_capacity} kWh
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${vehicle.soc}%`,
              background: getBatteryColor(vehicle.soc),
            }}
          />
        </div>
      </div>

      {/* Vehicle details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Location</div>
          <div>({vehicle.location.x}, {vehicle.location.y})</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Max Charge</div>
          <div>{vehicle.charging_speed} kW</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Trips Scheduled</div>
          <div>{vehicle.trip_schedule.length}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * Fleet Status Component - Shows all vehicles in a grid
 */
export const FleetStatus: React.FC<FleetStatusProps> = ({ fleet }) => {
  // Calculate fleet statistics
  const totalVehicles = fleet.length;
  const chargingCount = fleet.filter(v => v.status === 'charging').length;
  const lowBatteryCount = fleet.filter(v => v.soc < 30).length;
  const avgSoC = fleet.reduce((sum, v) => sum + v.soc, 0) / totalVehicles;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Car size={24} />
            Fleet Status
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {totalVehicles} vehicles • {chargingCount} charging • {lowBatteryCount} low battery • Avg SoC: {avgSoC.toFixed(0)}%
          </div>
        </div>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-4" style={{ gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
          {fleet.map(vehicle => (
            <VehicleCard key={vehicle.vehicle_id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </div>
  );
};
