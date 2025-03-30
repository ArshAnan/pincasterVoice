"use client";

import { useState } from 'react';
import styles from './MapPage.module.css';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import { MarkerData } from './types';

// Mapbox access token - replace with your own from mapbox.com
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicGluY2FzdCIsImEiOiJjbGlicmpoeGQwOXdrM2ZuMmF6eDd6MDFhIn0.YWqi3hBOO5gU1lGDqigMEg';

export default function MapPage() {
  const [address, setAddress] = useState('');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.00, 40.71]); // NYC coordinates
  const [mapZoom, setMapZoom] = useState(12); // Slightly higher zoom for city view
  const [error, setError] = useState<string | null>(null);
  
  // Add new state for pin adding mode
  const [addPinMode, setAddPinMode] = useState(false);
  const [tempPinLocation, setTempPinLocation] = useState<[number, number] | null>(null);
  const [showAddPinDialog, setShowAddPinDialog] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [useVoiceCommands, setUseVoiceCommands] = useState(false);

  // Update map center (used by pin clicks, etc)
  const updateMapCenter = (coords: [number, number]) => {
    setMapCenter(coords);
  };

  return (
    <div className={styles.container}>
      <Sidebar 
        address={address}
        setAddress={setAddress}
        markers={markers}
        setMarkers={setMarkers}
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        setMapZoom={setMapZoom}
        error={error}
        setError={setError}
        addPinMode={addPinMode}
        setAddPinMode={setAddPinMode}
        tempPinLocation={tempPinLocation}
        setTempPinLocation={setTempPinLocation}
        showAddPinDialog={showAddPinDialog}
        setShowAddPinDialog={setShowAddPinDialog}
        useFallback={useFallback}
        updateMapCenter={updateMapCenter}
        useVoiceCommands={useVoiceCommands}
        setUseVoiceCommands={setUseVoiceCommands}
      />
      
      {/* Map Container */}
      <MapView 
        mapCenter={mapCenter}
        setMapCenter={setMapCenter}
        mapZoom={mapZoom}
        markers={markers}
        setMarkers={setMarkers}
        addPinMode={addPinMode}
        tempPinLocation={tempPinLocation}
        setTempPinLocation={setTempPinLocation}
        showAddPinDialog={showAddPinDialog}
        setShowAddPinDialog={setShowAddPinDialog}
        useFallback={useFallback}
        setUseFallback={setUseFallback}
      />
    </div>
  );
}
