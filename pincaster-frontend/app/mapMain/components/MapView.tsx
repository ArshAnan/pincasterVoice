"use client";

import { useEffect, useRef, useState } from 'react';
// Using Google Maps JavaScript API, not Mapbox
import { Loader } from '@googlemaps/js-api-loader';
import { MarkerData } from '../types';
import styles from '../MapPage.module.css';

// Set your Google Maps JavaScript API key here
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
  const markersRef = useRef<{[key: string]: google.maps.Marker}>({});
  const tempMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      // Explicitly using Google Maps JavaScript API
      libraries: ["places", "geometry"]
    });

    loader.load().then(() => {
      if (mapContainer.current) {
        map.current = new google.maps.Map(mapContainer.current, {
          center: { lat: mapCenter[0], lng: mapCenter[1] },
          zoom: 13,
        });

        // Set up map event handlers
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

        // Initialize infoWindow
        infoWindowRef.current = new google.maps.InfoWindow();
      }
    });
    
    return () => {
      // No need to explicitly remove the map with Google Maps
      map.current = null;
    };
  }, []);

  // Update markers when they change
  useEffect(() => {
    if (!map.current) return;
    
    // Clear any previous markers
    Object.values(markersRef.current).forEach(marker => marker.setMap(null));
    markersRef.current = {};
    
    // Add markers to the map
    markers.forEach(marker => {
      if (marker.coordinates && map.current) {
        const newMarker = new google.maps.Marker({
          position: { lat: marker.coordinates[0], lng: marker.coordinates[1] },
          map: map.current,
          title: marker.title,
          // Google Maps standard marker
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
          }
        });
        
        newMarker.addListener('click', () => {
          if (infoWindowRef.current && map.current) {
            infoWindowRef.current.setContent(`<h3>${marker.title}</h3>`);
            infoWindowRef.current.open(map.current, newMarker);
          }
        });
        
        markersRef.current[marker.id] = newMarker;
      }
    });
    
  }, [markers, map.current]);

  // Update temporary pin marker
  useEffect(() => {
    if (!map.current) return;
    
    // Remove existing temp marker if any
    if (tempMarkerRef.current) {
      tempMarkerRef.current.setMap(null);
      tempMarkerRef.current = null;
    }
    
    // Add new temp marker if a location is set
    if (tempPinLocation && map.current) {
      tempMarkerRef.current = new google.maps.Marker({
        position: { lat: tempPinLocation[0], lng: tempPinLocation[1] },
        map: map.current,
        title: 'New Location',
        // Google Maps standard blue marker
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        }
      });

      tempMarkerRef.current.addListener('click', () => {
        if (infoWindowRef.current && map.current && tempMarkerRef.current) {
          infoWindowRef.current.setContent('<h3>New Location</h3>');
          infoWindowRef.current.open(map.current, tempMarkerRef.current);
        }
      });
    }
  }, [tempPinLocation, map.current]);

  // Update map center when it changes
  useEffect(() => {
    if (map.current) {
      map.current.setCenter({ lat: mapCenter[0], lng: mapCenter[1] });
    }
  }, [mapCenter]);

  return (
    <div ref={mapContainer} className={styles.mapContainer} />
  );
}
