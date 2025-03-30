"use client";

import { useState } from "react";
import styles from "./MapPage.module.css";
import MapView from "./components/MapView";
import Sidebar from "./components/Sidebar";
import { MarkerData } from "./types";
import {
  APIProvider,
  Map,
  MapCameraChangedEvent,
} from "@vis.gl/react-google-maps";

// Mapbox access token - replace with your own from mapbox.com
export const MAPBOX_ACCESS_TOKEN = "AIzaSyAnskerN7bwR6W4J_nRLG4Mtnb7zcjnvYg";

export default function MapPage() {
  const [address, setAddress] = useState("");
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.71, -74.0]); // Corrected to [latitude, longitude]
  const [mapZoom, setMapZoom] = useState(12); // Slightly higher zoom for city view
  const [error, setError] = useState<string | null>(null);

  // Add new state for pin adding mode
  const [addPinMode, setAddPinMode] = useState(false);
  const [tempPinLocation, setTempPinLocation] = useState<
    [number, number] | null
  >(null);
  const [showAddPinDialog, setShowAddPinDialog] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [useVoiceCommands, setUseVoiceCommands] = useState(false);

  // Update map center (used by pin clicks, etc)
  const updateMapCenter = (coords: [number, number]) => {
    setMapCenter([coords[1], coords[0]]); // Switch to [latitude, longitude]
  };

  return (
    <APIProvider
      apiKey={"AIzaSyAnskerN7bwR6W4J_nRLG4Mtnb7zcjnvYg"}
      onLoad={() => console.log("Maps API has loaded.")}
    >
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
          updateMapCenter={(coords) => updateMapCenter([coords[1], coords[0]])} // Ensure correct order
          useVoiceCommands={useVoiceCommands}
          setUseVoiceCommands={setUseVoiceCommands}
        />

        {/* Map Container */}
        <MapView
          markers={markers}
          mapCenter={[mapCenter[1], mapCenter[0]]} // Pass as [longitude, latitude] to MapView
          setMapCenter={(coords) => setMapCenter([coords[1], coords[0]])} // Ensure correct order
          mapZoom={mapZoom}
          setMarkers={setMarkers}
          addPinMode={addPinMode}
          tempPinLocation={tempPinLocation}
          setTempPinLocation={setTempPinLocation}
          showAddPinDialog={showAddPinDialog}
          setShowAddPinDialog={setShowAddPinDialog}
          useFallback={useFallback}
          setUseFallback={setUseFallback}
        />
        <Map
          defaultZoom={13}
          defaultCenter={{ lat: -33.860664, lng: 151.208138 }}
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
        ></Map>
      </div>
    </APIProvider>
  );
}
