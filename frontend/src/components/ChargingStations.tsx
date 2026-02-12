/**
 * Charging Stations Component
 * Displays all charging stations with status and availability
 */

import React from 'react';
import { Zap, MapPin } from 'lucide-react';
import type { ChargingStation } from '../types';

interface ChargingStationsProps {
  stations: ChargingStation[];
}

/**
 * Get station type badge class
 */
const getStationTypeBadge = (type: ChargingStation['type']): { label: string; color: string } => {
  const typeMap = {
    standard: { label: 'Standard', color: 'var(--color-info)' },
    fast: { label: 'Fast', color: 'var(--color-warning)' },
    ultra_fast: { label: 'Ultra Fast', color: 'var(--color-danger)' },
  };
  return typeMap[type];
};

/**
 * Individual station card
 */
const StationCard: React.FC<{ station: ChargingStation }> = ({ station }) => {
  const stationType = getStationTypeBadge(station.type);
  const utilizationPercent = station.available ? 0 : (station.current_usage / station.max_power) * 100;

  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
            {station.station_id}
          </div>
          <div style={{ fontSize: '0.875rem', color: stationType.color, fontWeight: 600 }}>
            {stationType.label}
          </div>
        </div>
        <span className={`badge ${station.available ? 'badge-available' : 'badge-occupied'}`}>
          {station.available ? 'Available' : 'Occupied'}
        </span>
      </div>

      {/* Power usage indicator (if occupied) */}
      {!station.available && (
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Power Usage
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {station.current_usage.toFixed(1)} / {station.max_power} kW
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${utilizationPercent}%`,
                background: 'var(--color-warning)',
              }}
            />
          </div>
        </div>
      )}

      {/* Station details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        <div>
          <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={12} />
            Location
          </div>
          <div>({station.location.x}, {station.location.y})</div>
        </div>
        <div>
          <div style={{ color: 'var(--color-text-muted)' }}>Max Power</div>
          <div>{station.max_power} kW</div>
        </div>
        {station.occupied_by && (
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ color: 'var(--color-text-muted)' }}>Occupied By</div>
            <div style={{ color: 'var(--color-primary)' }}>{station.occupied_by}</div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Charging Stations Component - Shows all stations in a grid
 */
export const ChargingStations: React.FC<ChargingStationsProps> = ({ stations }) => {
  // Calculate station statistics
  const totalStations = stations.length;
  const availableCount = stations.filter(s => s.available).length;
  const utilizationPercent = ((totalStations - availableCount) / totalStations) * 100;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Zap size={24} />
            Charging Stations
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {totalStations} stations • {availableCount} available • {utilizationPercent.toFixed(0)}% utilization
          </div>
        </div>
      </div>
      <div className="card-content">
        <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
          {stations.map(station => (
            <StationCard key={station.station_id} station={station} />
          ))}
        </div>
      </div>
    </div>
  );
};
