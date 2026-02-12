/**
 * Vehicle Search Component
 * Search for vehicles and view their historical charging data
 */

import React, { useState } from 'react';
import { Search, X, Clock, Battery, Calendar, MapPin, Zap, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import type { ElectricVehicle, ChargingPlan } from '../types';

interface VehicleSearchProps {
  fleet: ElectricVehicle[];
  chargingPlans: ChargingPlan[];
}

interface ChargingHistoryEntry {
  date: Date;
  stationId: string;
  energyCharged: number;
  duration: number; // hours
  cost: number;
  startSoC: number;
  endSoC: number;
}

/**
 * Generate mock historical charging data for a vehicle
 */
const generateChargingHistory = (vehicleId: string): ChargingHistoryEntry[] => {
  const history: ChargingHistoryEntry[] = [];
  const now = new Date();
  
  // Generate 15-20 historical charging sessions over the past 6 weeks (42 days)
  const numSessions = 15 + Math.floor(Math.random() * 6); // 15-20 sessions
  
  for (let i = 0; i < numSessions; i++) {
    const daysAgo = Math.floor(Math.random() * 42); // 0-42 days ago
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const startSoC = 10 + Math.floor(Math.random() * 40); // 10-50%
    const endSoC = 80 + Math.floor(Math.random() * 20); // 80-100%
    const energyCharged = ((endSoC - startSoC) / 100) * (50 + Math.random() * 50); // Based on capacity
    const duration = 0.5 + Math.random() * 3.5; // 0.5-4 hours
    const cost = energyCharged * (0.08 + Math.random() * 0.12); // €0.08-0.20 per kWh
    
    history.push({
      date,
      stationId: `CS-${String(Math.floor(Math.random() * 10) + 1).padStart(3, '0')}`,
      energyCharged: Math.round(energyCharged * 10) / 10,
      duration: Math.round(duration * 10) / 10,
      cost: Math.round(cost * 100) / 100,
      startSoC,
      endSoC,
    });
  }
  
  // Sort by date (newest first)
  return history.sort((a, b) => b.date.getTime() - a.date.getTime());
};

/**
 * Generate weekly aggregated data for the chart
 */
const generateWeeklyData = (history: ChargingHistoryEntry[]) => {
  const weeks: { [key: string]: { totalDuration: number; count: number; totalEnergy: number; totalCost: number; weekStart: Date } } = {};
  const now = new Date();
  
  // Initialize 6 weeks
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (i * 7));
    const weekLabel = `${weekStart.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'short' })}`;
    weeks[weekLabel] = { totalDuration: 0, count: 0, totalEnergy: 0, totalCost: 0, weekStart };
  }
  
  // Aggregate history into weeks
  history.forEach(entry => {
    const daysAgo = Math.floor((now.getTime() - entry.date.getTime()) / (1000 * 60 * 60 * 24));
    const weekIndex = Math.floor(daysAgo / 7);
    
    if (weekIndex < 6) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (weekIndex * 7));
      const weekLabel = `${weekStart.getDate()} ${weekStart.toLocaleDateString('en-US', { month: 'short' })}`;
      
      if (weeks[weekLabel]) {
        weeks[weekLabel].totalDuration += entry.duration;
        weeks[weekLabel].totalEnergy += entry.energyCharged;
        weeks[weekLabel].totalCost += entry.cost;
        weeks[weekLabel].count += 1;
      }
    }
  });
  
  // Convert to array format for chart and sort by date
  return Object.entries(weeks)
    .map(([week, data]) => {
      // Calculate savings: assume peak charging would cost 30% more
      const peakCost = data.totalCost * 1.3;
      const moneySaved = peakCost - data.totalCost;
      
      // Calculate time optimization: assume unoptimized charging takes 20% longer
      const unoptimizedTime = data.totalDuration * 1.2;
      const timeSaved = unoptimizedTime - data.totalDuration;
      
      return {
        week,
        date: data.weekStart,
        avgDuration: data.count > 0 ? Math.round((data.totalDuration / data.count) * 10) / 10 : 0,
        totalDuration: Math.round(data.totalDuration * 10) / 10,
        sessions: data.count,
        totalEnergy: Math.round(data.totalEnergy * 10) / 10,
        avgCost: data.count > 0 ? Math.round((data.totalCost / data.count) * 100) / 100 : 0,
        totalCost: Math.round(data.totalCost * 100) / 100,
        moneySaved: Math.round(moneySaved * 100) / 100,
        timeSaved: Math.round(timeSaved * 10) / 10,
      };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime()); // Sort oldest to newest
};

export const VehicleSearch: React.FC<VehicleSearchProps> = ({ fleet, chargingPlans }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<ElectricVehicle | null>(null);
  const [chargingHistory, setChargingHistory] = useState<ChargingHistoryEntry[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Filter vehicles based on search query
  const filteredVehicles = searchQuery.length > 0
    ? fleet.filter(vehicle =>
        vehicle.vehicle_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : fleet; // Show all vehicles when no search query

  const handleVehicleSelect = (vehicle: ElectricVehicle) => {
    setSelectedVehicle(vehicle);
    const history = generateChargingHistory(vehicle.vehicle_id);
    setChargingHistory(history);
    setWeeklyData(generateWeeklyData(history));
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeDetails = () => {
    setSelectedVehicle(null);
    setChargingHistory([]);
    setWeeklyData([]);
  };

  // Calculate statistics
  const totalEnergy = chargingHistory.reduce((sum, entry) => sum + entry.energyCharged, 0);
  const totalCost = chargingHistory.reduce((sum, entry) => sum + entry.cost, 0);
  const avgDuration = chargingHistory.length > 0 
    ? chargingHistory.reduce((sum, entry) => sum + entry.duration, 0) / chargingHistory.length 
    : 0;
  
  // Calculate total savings
  const totalMoneySaved = weeklyData.reduce((sum, week) => sum + week.moneySaved, 0);
  const totalTimeSaved = weeklyData.reduce((sum, week) => sum + week.timeSaved, 0);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Search size={24} />
            Vehicle Search & History
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            Search for a vehicle to view charging history
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* Search Input with Dropdown */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search or select a vehicle..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              style={{
                width: '100%',
                padding: '12px 44px 12px 44px',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            />
            <button
              onClick={toggleDropdown}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                padding: '4px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4H4z" />
              </svg>
            </button>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                marginTop: '4px',
                maxHeight: '400px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {/* Dropdown Header */}
              <div
                style={{
                  padding: '12px',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  backgroundColor: 'var(--color-bg-tertiary)',
                }}
              >
                Select a Vehicle ({filteredVehicles.length})
              </div>

              {/* Vehicle List */}
              {filteredVehicles.length > 0 ? (
                filteredVehicles.map(vehicle => (
                  <div
                    key={vehicle.vehicle_id}
                    onClick={() => handleVehicleSelect(vehicle)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.875rem' }}>
                        {vehicle.vehicle_id}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', gap: '1rem' }}>
                        <span>{vehicle.model}</span>
                        <span>
                          <Battery size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {vehicle.soc}%
                        </span>
                      </div>
                    </div>
                    <span className={`badge badge-${vehicle.status}`} style={{ fontSize: '0.65rem' }}>
                      {vehicle.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No vehicles found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Click outside to close dropdown */}
        {showDropdown && (
          <div
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9,
            }}
          />
        )}

        {/* Vehicle Details & History */}
        {selectedVehicle ? (
          <div>
            {/* Vehicle Info Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '1rem',
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selectedVehicle.vehicle_id}</h3>
                  <span className={`badge badge-${selectedVehicle.status}`}>
                    {selectedVehicle.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  <div>{selectedVehicle.model}</div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <span>
                      <Battery size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      {selectedVehicle.soc}% ({selectedVehicle.current_charge.toFixed(1)} kWh)
                    </span>
                    <span>
                      <Zap size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Max {selectedVehicle.charging_speed} kW
                    </span>
                    <span>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      ({selectedVehicle.location.x}, {selectedVehicle.location.y})
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeDetails}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  padding: '4px',
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Charging Statistics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card">
                <div className="stat-label">Total Energy</div>
                <div className="stat-value">{totalEnergy.toFixed(1)} <span style={{ fontSize: '1rem' }}>kWh</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Cost</div>
                <div className="stat-value">€{totalCost.toFixed(2)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Avg Duration</div>
                <div className="stat-value">{avgDuration.toFixed(1)} <span style={{ fontSize: '1rem' }}>hrs</span></div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Money Saved</div>
                <div className="stat-value" style={{ color: '#fff' }}>€{totalMoneySaved.toFixed(2)}</div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <div className="stat-label" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Time Saved</div>
                <div className="stat-value" style={{ color: '#fff' }}>{totalTimeSaved.toFixed(1)} <span style={{ fontSize: '1rem' }}>hrs</span></div>
              </div>
            </div>

            {/* Charging Time Evolution Chart */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} />
                Optimization Metrics Evolution (Last 6 Weeks)
              </h3>
              <div style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="week" 
                      stroke="var(--color-text-muted)"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="var(--color-text-muted)"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                      label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="var(--color-text-muted)"
                      tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                      label={{ value: '€ (Euro)', angle: 90, position: 'insideRight', fill: 'var(--color-text-muted)', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--color-text)',
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'avgDuration') return [`${value} hrs`, 'Avg Charging Time'];
                        if (name === 'timeSaved') return [`${value} hrs`, 'Time Saved'];
                        if (name === 'moneySaved') return [`€${value}`, 'Money Saved'];
                        return [value, name];
                      }}
                    />
                    {/* Charging Time Line */}
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="avgDuration" 
                      stroke="#6b7280" 
                      strokeWidth={2}
                      dot={{ fill: '#6b7280', r: 4 }}
                      name="Avg Charging Time"
                    />
                    {/* Time Saved Line */}
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="timeSaved" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', r: 5 }}
                      name="Time Saved"
                    />
                    {/* Money Saved Line */}
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="moneySaved" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      dot={{ fill: '#10b981', r: 5 }}
                      name="Money Saved"
                    />
                  </LineChart>
                </ResponsiveContainer>
                
                {/* Legend */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '3px', backgroundColor: '#6b7280' }} />
                    <span>Avg Charging Time</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '3px', backgroundColor: '#3b82f6' }} />
                    <span>Time Saved (hrs)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '20px', height: '3px', backgroundColor: '#10b981' }} />
                    <span>Money Saved (€)</span>
                  </div>
                </div>
                
                {/* Additional metrics below chart */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
                  {weeklyData.map((week, index) => (
                    <div key={index} style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        {week.week}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
                        {week.sessions} sessions
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981', marginBottom: '0.15rem' }}>
                        ↓ €{week.moneySaved.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                        ↓ {week.timeSaved.toFixed(1)}h
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charging History Table */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--color-text)' }}>
                <Calendar size={18} style={{ display: 'inline', marginRight: '8px' }} />
                Detailed Charging History
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Date & Time
                      </th>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Station
                      </th>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Energy
                      </th>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Duration
                      </th>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        SoC Change
                      </th>
                      <th style={{ padding: '0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargingHistory.map((entry, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                          <div>{entry.date.toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                            {entry.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-primary)' }}>
                          {entry.stationId}
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600 }}>
                          {entry.energyCharged} kWh
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                          {entry.duration} hrs
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--color-danger)' }}>{entry.startSoC}%</span>
                            <span style={{ color: 'var(--color-text-muted)' }}>→</span>
                            <span style={{ color: 'var(--color-success)' }}>{entry.endSoC}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-success)' }}>
                          €{entry.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
            <Search size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>Search for a vehicle to view its charging history</div>
          </div>
        )}
      </div>
    </div>
  );
};
