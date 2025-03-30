"use client";

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerData } from '../types';
import styles from '../MapPage.module.css';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'your_google_maps_api_key_here';

interface MapViewProps {
  markers: MarkerData[];
  mapCenter: [number, number];
  setMapCenter: (center: [number, number]) => void;
  addPinMode: boolean;
  tempPinLocation: [number, number] | null;
  setTempPinLocation: (location: [number, number] | null) => void;
  setShowAddPinDialog: (show: boolean) => void;
}

export default function MapView({
  markers,
  mapCenter,
  setMapCenter,
  addPinMode,
  tempPinLocation,
  setTempPinLocation,
  setShowAddPinDialog
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});

  useEffect(() => {
    if (map.current) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader.load().then(() => {
      if (mapContainer.current) {
        map.current = new google.maps.Map(mapContainer.current, {
          center: { lat: 40.7306, lng: -73.9352 }, // Centered around Brooklyn
          zoom: 12, // Adjusted zoom level to include all markers
        });

        map.current.addListener('idle', () => {
          if (map.current) {
            const center = map.current.getCenter();
            if (center) {
              setMapCenter([center.lat(), center.lng()]);
            }
          }
        });

        map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (addPinMode && e.latLng) {
            setTempPinLocation([e.latLng.lat(), e.latLng.lng()]);
            setShowAddPinDialog(true);
          }
        });

        // Add placeholder markers
        const placeholderMarkers = [
          { lat: 40.7128, lng: -74.0060, title: "Times Square" }, // Manhattan
          { lat: 40.7306, lng: -73.9352, title: "Brooklyn" },     // Brooklyn
          { lat: 40.7580, lng: -73.9855, title: "Central Park" }, // Central Park
          { lat: 40.748817, lng: -73.985428, title: "Empire State Building" }, // Empire State Building
          { lat: 40.7061, lng: -74.0086, title: "Wall Street" }   // Wall Street
        ];

        const markerIcon = {
          url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png", // Default Google Maps marker icon
          scaledSize: new google.maps.Size(50, 50), // Increase size to 50x50
        };

        placeholderMarkers.forEach(marker => {
          new google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map: map.current,
            title: marker.title,
            icon: markerIcon // Apply the custom icon
          });
        });

        // Adjust the map bounds to fit all markers
        const bounds = new google.maps.LatLngBounds();
        placeholderMarkers.forEach(marker => {
          bounds.extend(new google.maps.LatLng(marker.lat, marker.lng));
        });
        map.current.fitBounds(bounds);
      }
    });
  }, [mapCenter, setMapCenter, addPinMode, setTempPinLocation, setShowAddPinDialog]);

  useEffect(() => {
    if (!map.current) return;

    const bounds = new google.maps.LatLngBounds();

    // Add markers to the map
    markers.forEach((marker) => {
      if (!markersRef.current[marker.id]) {
        const googleMarker = new google.maps.Marker({
          position: { lat: marker.coordinates[0], lng: marker.coordinates[1] },
          map: map.current,
          title: marker.title,
        });
        markersRef.current[marker.id] = googleMarker;
      }
      bounds.extend(new google.maps.LatLng(marker.coordinates[0], marker.coordinates[1]));
    });

    // Remove markers that are no longer in the list
    Object.keys(markersRef.current).forEach((id) => {
      if (!markers.find((marker) => marker.id === id)) {
        markersRef.current[id].setMap(null);
        delete markersRef.current[id];
      }
    });

    // Adjust the map to fit all markers
    if (!bounds.isEmpty()) {
      map.current.fitBounds(bounds);
    }
  }, [markers]);

  return <div ref={mapContainer} className={styles.mapContainer}></div>;
}
