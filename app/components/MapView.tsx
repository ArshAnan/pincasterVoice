'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MarkerData } from '../mapMain/types';

// Fix the default icon issue with Leaflet in Next.js
const fixLeafletIcon = () => {
  // Only run on the client
  if (typeof window !== 'undefined') {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/leaflet/marker-icon-2x.png',
      iconUrl: '/leaflet/marker-icon.png',
      shadowUrl: '/leaflet/marker-shadow.png',
    });
  }
};

interface MapViewProps {
  markers: MarkerData[];
  onMarkerClick?: (marker: MarkerData) => void;
  center?: [number, number];
  zoom?: number;
}

const MapView: React.FC<MapViewProps> = ({
  markers = [],
  onMarkerClick,
  center = [51.505, -0.09], // Default to London
  zoom = 13,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Fix Leaflet icon issue
    fixLeafletIcon();

    // Initialize map if it doesn't exist
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (mapRef.current && markersLayerRef.current) {
      // Clear existing markers
      markersLayerRef.current.clearLayers();

      // Add new markers
      markers.forEach((marker) => {
        const leafletMarker = L.marker([marker.lat, marker.lng])
          .addTo(markersLayerRef.current as L.LayerGroup);
        
        if (marker.title || marker.description) {
          leafletMarker.bindPopup(`
            <strong>${marker.title || ''}</strong>
            <p>${marker.description || ''}</p>
          `);
        }

        if (onMarkerClick) {
          leafletMarker.on('click', () => onMarkerClick(marker));
        }
      });
    }
  }, [markers, onMarkerClick]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '100%', minHeight: '500px' }}
    />
  );
};

export default MapView;
