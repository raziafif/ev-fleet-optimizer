/**
 * Fleet Map Component
 * Visualizes vehicle and station locations on a real Google Map of Paris
 */

import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, MapPin, Zap, AlertCircle } from 'lucide-react';
import type { ElectricVehicle, ChargingStation } from '../types';

interface FleetMapProps {
  fleet: ElectricVehicle[];
  stations: ChargingStation[];
}

/**
 * Get vehicle color based on status
 */
const getVehicleColor = (status: ElectricVehicle['status']): string => {
  const colorMap = {
    idle: '#6b7280',
    charging: '#10b981',
    in_use: '#3b82f6',
    maintenance: '#f59e0b',
  };
  return colorMap[status];
};

/**
 * Get station color based on availability
 */
const getStationColor = (available: boolean): string => {
  return available ? '#10b981' : '#ef4444';
};

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

/**
 * Convert normalized coordinates (0-100) to Paris lat/lng
 * Paris center: 48.8566° N, 2.3522° E
 * Map area covers approximately 20km x 20km
 */
const normalizedToLatLng = (x: number, y: number): { lat: number; lng: number } => {
  // Paris bounds (approximate)
  const centerLat = 48.8566;
  const centerLng = 2.3522;
  
  // Scale factor: 100 units = ~0.15 degrees (approximately 20km)
  const latRange = 0.15;
  const lngRange = 0.2;
  
  return {
    lat: centerLat + ((50 - y) / 100) * latRange, // Invert Y axis
    lng: centerLng + ((x - 50) / 100) * lngRange,
  };
};

/**
 * Fleet Map Component - Shows spatial distribution on real Google Maps
 */
export const FleetMap: React.FC<FleetMapProps> = ({ fleet, stations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const vehicleRoutesRef = useRef<Map<string, any[]>>(new Map()); // Store route paths for each vehicle
  const vehicleRouteIndexRef = useRef<Map<string, number>>(new Map()); // Current position on route
  const animationFrameRef = useRef<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load Google Maps script
   */
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    
    // Try to get API key from environment variable, otherwise use a placeholder
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    
    if (!apiKey) {
      // If no API key, show error message
      setError('Google Maps API key not configured. Add VITE_GOOGLE_MAPS_API_KEY to your .env file.');
      return;
    }

    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setError('Failed to load Google Maps. Please check your API key and internet connection.');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  /**
   * Initialize map when loaded
   */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Create map centered on Paris
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 48.8566, lng: 2.3522 },
        zoom: 12,
        mapTypeId: 'roadmap',
        styles: [
          {
            elementType: 'geometry',
            stylers: [{ color: '#1e293b' }],
          },
          {
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#0f172a' }],
          },
          {
            elementType: 'labels.text.fill',
            stylers: [{ color: '#94a3b8' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#1e3a5f' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#64748b' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#334155' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#94a3b8' }],
          },
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }], // Hide points of interest
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'off' }], // Hide transit
          },
          {
            featureType: 'administrative',
            elementType: 'geometry',
            stylers: [{ visibility: 'off' }], // Hide administrative boundaries
          },
          {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#1e293b' }],
          },
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapInstanceRef.current = map;
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }
  }, [isLoaded]);

  /**
   * Update markers when fleet or stations change
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Add/update station markers (stations don't move)
    stations.forEach(station => {
      const stationKey = `station-${station.station_id}`;
      
      if (!markersRef.current.has(stationKey)) {
        const position = normalizedToLatLng(station.location.x, station.location.y);
        
        const marker = new window.google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: station.station_id,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: station.available ? '#10b981' : '#ef4444',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        // Info window for station
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 4px;">
              <strong>${station.station_id}</strong><br/>
              Type: ${station.type}<br/>
              Power: ${station.max_power} kW<br/>
              Status: ${station.available ? '✅ Available' : '🔴 Occupied'}<br/>
              ${station.occupied_by ? `Vehicle: ${station.occupied_by}` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.set(stationKey, { marker, infoWindow, type: 'station' });
      } else {
        // Update station color if availability changed
        const markerData = markersRef.current.get(stationKey);
        markerData.marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: station.available ? '#10b981' : '#ef4444',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        });
      }
    });

    // Add/update vehicle markers
    fleet.forEach(vehicle => {
      const vehicleKey = `vehicle-${vehicle.vehicle_id}`;
      const targetPosition = normalizedToLatLng(vehicle.location.x, vehicle.location.y);
      
      const colors: Record<string, string> = {
        idle: '#6b7280',
        charging: '#10b981',
        in_use: '#3b82f6',
        maintenance: '#f59e0b',
      };

      if (!markersRef.current.has(vehicleKey)) {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position: targetPosition,
          map: mapInstanceRef.current,
          title: vehicle.vehicle_id,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: colors[vehicle.status],
            fillOpacity: 0.9,
            strokeColor: '#0f172a',
            strokeWeight: 2,
          },
          label: {
            text: `${vehicle.vehicle_id}\n${vehicle.soc}%`,
            color: '#f1f5f9',
            fontSize: '11px',
            fontWeight: 'bold',
            className: 'vehicle-label',
          },
        });

        // Info window for vehicle
        const getDestinationInfo = () => {
          if (vehicle.trip_schedule && vehicle.trip_schedule.length > 0) {
            const nextTrip = vehicle.trip_schedule[0];
            const departureTime = new Date(nextTrip.departure).toLocaleString();
            const destination = nextTrip.destination || 'Unknown';
            return `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <strong>Next Trip:</strong><br/>
                Destination: ${destination}<br/>
                Departure: ${departureTime}
              </div>
            `;
          }
          return '<div style="margin-top: 8px; color: #6b7280;">No trips scheduled</div>';
        };

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="color: #0f172a; padding: 4px; min-width: 200px;">
              <strong style="font-size: 14px;">${vehicle.vehicle_id}</strong><br/>
              <div style="margin-top: 4px;">
                Model: ${vehicle.model}<br/>
                Battery: ${vehicle.soc}% (${vehicle.current_charge.toFixed(1)} kWh)<br/>
                Status: <span style="color: ${colors[vehicle.status]}; font-weight: bold;">${vehicle.status.replace('_', ' ')}</span><br/>
                Max Charge Speed: ${vehicle.charging_speed} kW
              </div>
              ${getDestinationInfo()}
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(mapInstanceRef.current, marker);
        });

        markersRef.current.set(vehicleKey, { 
          marker, 
          infoWindow, 
          type: 'vehicle',
          vehicle,
        });
        
        // For vehicles in use, generate a route
        if (vehicle.status === 'in_use') {
          generateRandomRoute(vehicleKey, targetPosition);
        }
      } else {
        // Update existing marker
        const markerData = markersRef.current.get(vehicleKey);
        markerData.vehicle = vehicle;
        
        // Update icon color if status changed
        markerData.marker.setIcon({
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: colors[vehicle.status],
          fillOpacity: 0.9,
          strokeColor: '#0f172a',
          strokeWeight: 2,
        });
        
        // Update label with current charge
        markerData.marker.setLabel({
          text: `${vehicle.vehicle_id}\n${vehicle.soc}%`,
          color: '#f1f5f9',
          fontSize: '11px',
          fontWeight: 'bold',
          className: 'vehicle-label',
        });
        
        // Update info window content
        const getDestinationInfo = () => {
          if (vehicle.trip_schedule && vehicle.trip_schedule.length > 0) {
            const nextTrip = vehicle.trip_schedule[0];
            const departureTime = new Date(nextTrip.departure).toLocaleString();
            const destination = nextTrip.destination || 'Unknown';
            return `
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <strong>Next Trip:</strong><br/>
                Destination: ${destination}<br/>
                Departure: ${departureTime}
              </div>
            `;
          }
          return '<div style="margin-top: 8px; color: #6b7280;">No trips scheduled</div>';
        };

        markerData.infoWindow.setContent(`
          <div style="color: #0f172a; padding: 4px; min-width: 200px;">
            <strong style="font-size: 14px;">${vehicle.vehicle_id}</strong><br/>
            <div style="margin-top: 4px;">
              Model: ${vehicle.model}<br/>
              Battery: ${vehicle.soc}% (${vehicle.current_charge.toFixed(1)} kWh)<br/>
              Status: <span style="color: ${colors[vehicle.status]}; font-weight: bold;">${vehicle.status.replace('_', ' ')}</span><br/>
              Max Charge Speed: ${vehicle.charging_speed} kW
            </div>
            ${getDestinationInfo()}
          </div>
        `);
      }
    });

    // Remove markers for vehicles/stations that no longer exist
    const currentVehicleIds = new Set(fleet.map(v => `vehicle-${v.vehicle_id}`));
    const currentStationIds = new Set(stations.map(s => `station-${s.station_id}`));
    
    markersRef.current.forEach((markerData, key) => {
      if (markerData.type === 'vehicle' && !currentVehicleIds.has(key)) {
        markerData.marker.setMap(null);
        markersRef.current.delete(key);
        vehicleRoutesRef.current.delete(key);
        vehicleRouteIndexRef.current.delete(key);
      } else if (markerData.type === 'station' && !currentStationIds.has(key)) {
        markerData.marker.setMap(null);
        markersRef.current.delete(key);
      }
    });
  }, [fleet, stations, isLoaded]);

  /**
   * Generate a random route using nearby Paris locations
   * Creates waypoints that follow actual roads
   */
  const generateRandomRoute = async (vehicleKey: string, startPosition: { lat: number; lng: number }) => {
    if (!window.google || !mapInstanceRef.current) return;

    try {
      // Generate random destination within Paris bounds
      const randomOffset = 0.02; // ~2km
      const destination = {
        lat: startPosition.lat + (Math.random() - 0.5) * randomOffset,
        lng: startPosition.lng + (Math.random() - 0.5) * randomOffset,
      };

      const directionsService = new window.google.maps.DirectionsService();

      const result = await directionsService.route({
        origin: startPosition,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
      });

      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        const path: any[] = [];
        
        // Extract all points along the route
        route.legs.forEach((leg: any) => {
          leg.steps.forEach((step: any) => {
            const stepPath = step.path || [];
            stepPath.forEach((point: any) => {
              path.push({
                lat: typeof point.lat === 'function' ? point.lat() : point.lat,
                lng: typeof point.lng === 'function' ? point.lng() : point.lng,
              });
            });
          });
        });

        // Store the route path for this vehicle
        vehicleRoutesRef.current.set(vehicleKey, path);
        vehicleRouteIndexRef.current.set(vehicleKey, 0);
      }
    } catch (error) {
      console.log('Route generation skipped for', vehicleKey);
      // Fallback: create simple straight-line path
      vehicleRoutesRef.current.set(vehicleKey, [startPosition]);
      vehicleRouteIndexRef.current.set(vehicleKey, 0);
    }
  };

  /**
   * Animate vehicle movement along roads
   */
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !isLoaded) return;

    const animate = () => {
      markersRef.current.forEach((markerData, key) => {
        if (markerData.type !== 'vehicle') return;

        const vehicle = markerData.vehicle;

        // Only move vehicles that are "in_use"
        if (vehicle.status === 'in_use') {
          const route = vehicleRoutesRef.current.get(key);
          let routeIndex = vehicleRouteIndexRef.current.get(key) || 0;

          if (route && route.length > 0) {
            // Move along the route
            const currentPos = route[Math.floor(routeIndex)];
            
            if (currentPos) {
              markerData.marker.setPosition(currentPos);
            }

            // Increment route position very slowly (speed: ~0.05 points per frame = ~3 points/sec)
            // This creates a very realistic, observable city driving speed
            routeIndex += 0.05;

            // If reached end of route, generate new route
            if (routeIndex >= route.length - 1) {
              const lastPos = route[route.length - 1];
              generateRandomRoute(key, lastPos);
            } else {
              vehicleRouteIndexRef.current.set(key, routeIndex);
            }
          } else {
            // No route yet, try to generate one
            const currentPosition = markerData.marker.getPosition();
            if (currentPosition) {
              generateRandomRoute(key, {
                lat: currentPosition.lat(),
                lng: currentPosition.lng(),
              });
            }
          }
        } else {
          // Stationary vehicles - set to their target position
          const targetPosition = normalizedToLatLng(vehicle.location.x, vehicle.location.y);
          const currentPosition = markerData.marker.getPosition();
          
          if (currentPosition) {
            const currentLat = currentPosition.lat();
            const currentLng = currentPosition.lng();
            const dx = targetPosition.lng - currentLng;
            const dy = targetPosition.lat - currentLat;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0.00001) {
              // Slowly move to target
              const interpolationSpeed = 0.05;
              const newPosition = {
                lat: currentLat + dy * interpolationSpeed,
                lng: currentLng + dx * interpolationSpeed,
              };
              markerData.marker.setPosition(newPosition);
            }
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isLoaded]);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <MapIcon size={24} />
            Fleet & Station Map - Paris Region
          </h2>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {fleet.length} vehicles and {stations.length} charging stations • Click markers for details
          </div>
        </div>
      </div>
      <div className="card-content">
        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              Vehicles:
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Charging</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#6b7280' }} />
                <span>Idle</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <span>In Use</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>Maintenance</span>
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
              Stations:
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>Available</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span>Occupied</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error message if API key is missing */}
        {error && (
          <div className="alert alert-warning" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={20} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Google Maps Configuration Required</div>
              <div style={{ fontSize: '0.875rem' }}>{error}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.8 }}>
                Get a free API key at: <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Cloud Console</a>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: '500px',
            backgroundColor: '#1e293b',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
          }}
        >
          {!isLoaded && !error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--color-text-muted)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <MapIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <div>Loading map...</div>
              </div>
            </div>
          )}
        </div>

        {/* Custom styles for vehicle labels */}
        <style>{`
          .vehicle-label {
            background-color: rgba(15, 23, 42, 0.9) !important;
            padding: 4px 8px !important;
            border-radius: 6px !important;
            border: 1px solid rgba(148, 163, 184, 0.3) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            white-space: pre !important;
            line-height: 1.3 !important;
          }
        `}</style>

        {/* Statistics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-charging)' }}>
              {fleet.filter(v => v.status === 'charging').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Charging</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-idle)' }}>
              {fleet.filter(v => v.status === 'idle').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Idle</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-in-use)' }}>
              {fleet.filter(v => v.status === 'in_use').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>In Use</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-available)' }}>
              {stations.filter(s => s.available).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Available Stations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
