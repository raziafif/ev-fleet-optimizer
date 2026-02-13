/**
 * Alerts Component
 * Displays system alerts and notifications
 */

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Bell, Phone, Mail, MapPin, X } from 'lucide-react';
import type { Alert } from '../types';

interface AlertsProps {
  alerts: Alert[];
}

interface AlertDetails {
  description: string;
  actionRequired: string;
  driverContact?: {
    name: string;
    phone: string;
    email: string;
  };
  location?: string;
  estimatedResolutionTime?: string;
}

/**
 * Get detailed information for an alert
 */
const getAlertDetails = (alert: Alert): AlertDetails => {
  const baseDetails: AlertDetails = {
    description: '',
    actionRequired: '',
  };

  switch (alert.type) {
    case 'low_battery':
      return {
        ...baseDetails,
        description: `Vehicle ${alert.vehicle_id} has critically low battery (${Math.floor(Math.random() * 20 + 10)}%). Immediate charging required to avoid service disruption.`,
        actionRequired: 'Dispatch vehicle to nearest charging station immediately or contact driver to change route.',
        driverContact: {
          name: `Driver ${alert.vehicle_id?.slice(-3)}`,
          phone: `+33 6 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `driver.${alert.vehicle_id?.toLowerCase()}@evfleet.com`,
        },
        location: 'Paris, 15th Arrondissement',
        estimatedResolutionTime: '45 minutes',
      };
    
    case 'maintenance_required':
      return {
        ...baseDetails,
        description: `Vehicle ${alert.vehicle_id} requires scheduled maintenance. Service interval has been reached.`,
        actionRequired: 'Schedule maintenance appointment within 48 hours. Remove vehicle from active rotation until service is completed.',
        driverContact: {
          name: `Driver ${alert.vehicle_id?.slice(-3)}`,
          phone: `+33 6 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `driver.${alert.vehicle_id?.toLowerCase()}@evfleet.com`,
        },
        location: 'Currently at charging station',
        estimatedResolutionTime: '2-3 hours',
      };
    
    case 'trip_conflict':
      return {
        ...baseDetails,
        description: `Charging schedule for ${alert.vehicle_id} conflicts with upcoming trip departure. Vehicle may not be fully charged in time.`,
        actionRequired: 'Reassign trip to another vehicle or prioritize fast charging. Contact driver to inform about potential delay.',
        driverContact: {
          name: `Driver ${alert.vehicle_id?.slice(-3)}`,
          phone: `+33 6 ${Math.floor(Math.random() * 90000000 + 10000000)}`,
          email: `driver.${alert.vehicle_id?.toLowerCase()}@evfleet.com`,
        },
        location: 'En route to charging station',
        estimatedResolutionTime: '30 minutes',
      };
    
    case 'grid_peak':
      return {
        ...baseDetails,
        description: `Grid is experiencing peak demand period. Energy costs are at maximum (€0.20/kWh). Multiple vehicles are currently charging.`,
        actionRequired: 'Consider delaying non-urgent charging to off-peak hours (10 PM - 6 AM) to save up to 60% on energy costs.',
        location: 'System-wide alert',
        estimatedResolutionTime: 'Until 8 PM',
      };
    
    default:
      return {
        ...baseDetails,
        description: alert.message,
        actionRequired: 'Review alert and take appropriate action.',
      };
  }
};

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
const AlertItem: React.FC<{ alert: Alert; onClick: () => void }> = ({ alert, onClick }) => {
  return (
    <div 
      className={`alert ${getAlertClass(alert.severity)}`}
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
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
          {' • '}
          <span style={{ fontWeight: 500, color: 'var(--color-primary)' }}>Click for details</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Alert Details Modal
 */
const AlertDetailsModal: React.FC<{ alert: Alert; onClose: () => void }> = ({ alert, onClose }) => {
  const details = getAlertDetails(alert);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {getAlertIcon(alert.severity)}
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                {alert.message}
              </h3>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              {alert.vehicle_id && `Vehicle: ${alert.vehicle_id}`}
              {alert.station_id && ` • Station: ${alert.station_id}`}
              {' • '}
              {formatTimestamp(alert.timestamp)}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              DESCRIPTION
            </h4>
            <p style={{ margin: 0, lineHeight: 1.6 }}>{details.description}</p>
          </div>

          {/* Action Required */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              ACTION REQUIRED
            </h4>
            <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-warning)' }}>{details.actionRequired}</p>
          </div>

          {/* Location & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {details.location && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  LOCATION
                </h4>
                <p style={{ margin: 0 }}>{details.location}</p>
              </div>
            )}
            {details.estimatedResolutionTime && (
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                  EST. RESOLUTION
                </h4>
                <p style={{ margin: 0 }}>{details.estimatedResolutionTime}</p>
              </div>
            )}
          </div>

          {/* Driver Contact */}
          {details.driverContact && (
            <div style={{
              backgroundColor: 'var(--color-bg-tertiary)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
            }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                DRIVER CONTACT
              </h4>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{details.driverContact.name}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a 
                  href={`tel:${details.driverContact.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={16} />
                  {details.driverContact.phone}
                </a>
                <a 
                  href={`mailto:${details.driverContact.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                  }}
                >
                  <Mail size={16} />
                  {details.driverContact.email}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-bg-tertiary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Close
          </button>
          <button
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Alerts Component - Shows system notifications and warnings
 */
export const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  
  // Filter unresolved alerts
  const activeAlerts = alerts.filter(a => !a.resolved);
  
  // Count by severity
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = activeAlerts.filter(a => a.severity === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.severity === 'info').length;

  return (
    <>
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
                <AlertItem 
                  key={alert.id} 
                  alert={alert}
                  onClick={() => setSelectedAlert(alert)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <AlertDetailsModal 
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </>
  );
};
