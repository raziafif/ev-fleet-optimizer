/**
 * Alerts Component
 * Displays system alerts and notifications
 */

import React from 'react';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';
import type { Alert } from '../types';

interface AlertsProps {
  alerts: Alert[];
}

/**
 * Get icon based on alert type
 */
const getAlertIcon = (severity: Alert['severity']): React.ReactNode => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle size={20} />;
    case 'warning':
      return <AlertCircle size={20} />;
    case 'info':
      return <Info size={20} />;
  }
};

/**
 * Get alert class based on severity
 */
const getAlertClass = (severity: Alert['severity']): string => {
  const classMap = {
    critical: 'alert-critical',
    warning: 'alert-warning',
    info: 'alert-info',
  };
  return classMap[severity];
};

/**
 * Format timestamp
 */
const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

/**
 * Individual alert item
 */
const AlertItem: React.FC<{ alert: Alert }> = ({ alert }) => {
  return (
    <div className={`alert ${getAlertClass(alert.severity)}`}>
      <div style={{ flexShrink: 0 }}>
        {getAlertIcon(alert.severity)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
          {alert.message}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {alert.vehicle_id && `Vehicle: ${alert.vehicle_id}`}
          {alert.station_id && ` • Station: ${alert.station_id}`}
          {' • '}
          {formatTimestamp(alert.timestamp)}
        </div>
      </div>
    </div>
  );
};

/**
 * Alerts Component - Shows system notifications and warnings
 */
export const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  // Filter unresolved alerts
  const activeAlerts = alerts.filter(a => !a.resolved);
  
  // Count by severity
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.severity === 'info').length;

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Bell size={24} />
            System Alerts
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {criticalCount} critical • {warningCount} warnings • {infoCount} info
          </div>
        </div>
      </div>
      <div className="card-content">
        {activeAlerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
            <Info size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>No active alerts. System operating normally.</div>
          </div>
        ) : (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {activeAlerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
