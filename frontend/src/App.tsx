/**
 * Main App Component
 * Root component that manages state and renders the dashboard
 */

import React, { useEffect, useState } from 'react';
import { RefreshCw, Zap } from 'lucide-react';
import { apiService } from './services/api';
import { MetricsCard } from './components/MetricsCard';
import { FleetStatus } from './components/FleetStatus';
import { ChargingStations } from './components/ChargingStations';
import { ChargingPlans } from './components/ChargingPlans';
import { Alerts } from './components/Alerts';
import { EnergyPricingChart } from './components/EnergyPricingChart';
import { FleetMap } from './components/FleetMap';
import { VehicleSearch } from './components/VehicleSearch';
import { AIInsights } from './components/AIInsights';
import type { DashboardState } from './types';
import './styles/global.css';

/**
 * Main Application Component
 * Fetches data from backend and renders all dashboard components
 */
function App() {
  // State management
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Fetch dashboard data from backend
   */
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);
      const data = await apiService.getDashboardState();
      setDashboardState(data);
      setLastRefresh(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please ensure the backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * Trigger manual optimization
   */
  const handleOptimize = async () => {
    try {
      setIsRefreshing(true);
      await apiService.runOptimization();
      // Refresh dashboard after optimization
      await fetchDashboardData();
    } catch (err) {
      console.error('Failed to run optimization:', err);
      setError('Failed to run optimization. Please try again.');
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="loading">
        <div style={{ textAlign: 'center' }}>
          <Zap size={48} style={{ marginBottom: '1rem', color: 'var(--color-primary)' }} />
          <div>Loading EV Fleet Optimizer...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !dashboardState) {
    return (
      <div className="dashboard">
        <div className="error">
          <h2 style={{ marginBottom: '1rem' }}>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button
            className="button button-primary"
            onClick={fetchDashboardData}
            style={{ marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardState) {
    return null;
  }

  /**
   * Format last update time
   */
  const formatLastUpdate = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    const mins = Math.floor(diff / 60);
    return `${mins}m ago`;
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            <Zap size={32} color="var(--color-primary)" />
            EV Fleet Charging Optimizer
          </h1>
          <div className="dashboard-subtitle">
            AI-powered charging optimization for electric vehicle fleets
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Last updated: {formatLastUpdate()}
          </div>
          <button
            className="button button-secondary"
            onClick={fetchDashboardData}
            disabled={isRefreshing}
            style={{ opacity: isRefreshing ? 0.6 : 1 }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            className="button button-primary"
            onClick={handleOptimize}
            disabled={isRefreshing}
            style={{ opacity: isRefreshing ? 0.6 : 1 }}
          >
            <Zap size={16} />
            Run Optimization
          </button>
        </div>
      </div>

      {/* Error banner (if error but we have cached data) */}
      {error && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <div>{error}</div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1" style={{ gap: '1.5rem' }}>
        {/* Metrics Overview */}
        <MetricsCard metrics={dashboardState.metrics} />

        {/* Vehicle Search & History */}
        <VehicleSearch fleet={dashboardState.fleet} chargingPlans={dashboardState.charging_plans} />

        {/* AI Predictive Analytics */}
        <AIInsights />

        {/* Alerts */}
        {dashboardState.alerts.length > 0 && (
          <Alerts alerts={dashboardState.alerts} />
        )}

        {/* Fleet Map and Energy Pricing */}
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          <FleetMap fleet={dashboardState.fleet} stations={dashboardState.stations} />
          <EnergyPricingChart pricing={dashboardState.energy_pricing} />
        </div>

        {/* Charging Plans */}
        <ChargingPlans plans={dashboardState.charging_plans} />

        {/* Fleet Status */}
        <FleetStatus fleet={dashboardState.fleet} />

        {/* Charging Stations */}
        <ChargingStations stations={dashboardState.stations} />
      </div>

      {/* Add spinning animation for refresh button */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
