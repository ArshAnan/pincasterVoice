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
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import React from "react";

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

  type Poi = { key: string; location: google.maps.LatLngLiteral };
  const PoiMarkers = (props: { pois: Poi[] }) => {
    return (
      <>
        {props.pois.map((poi: Poi) => (
          <AdvancedMarker key={poi.key} position={poi.location}>
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
        ))}
      </>
    );
  };
  // example poi's
  const locations: Poi[] = [
    { key: "statueOfLiberty", location: { lat: 40.6892, lng: -74.0445 } }, // Statue of Liberty
    { key: "centralPark", location: { lat: 40.7829, lng: -73.9654 } }, // Central Park (center)
    { key: "timesSquare", location: { lat: 40.758, lng: -73.9855 } }, // Times Square
    { key: "empireStateBuilding", location: { lat: 40.7484, lng: -73.9857 } }, // Empire State Building
    { key: "brooklynBridge", location: { lat: 40.7061, lng: -73.9969 } }, // Brooklyn Bridge
    { key: "oneWorldTrade", location: { lat: 40.7127, lng: -74.0134 } }, // One World Trade Center
    { key: "metMuseum", location: { lat: 40.7794, lng: -73.9632 } }, // Metropolitan Museum of Art
    { key: "grandCentral", location: { lat: 40.7527, lng: -73.9772 } }, // Grand Central Terminal
    { key: "highLine", location: { lat: 40.748, lng: -74.0048 } }, // The High Line (approx. center)
    { key: "yankeeStadium", location: { lat: 40.8296, lng: -73.9262 } }, // Yankee Stadium
    { key: "bryantPark", location: { lat: 40.7536, lng: -73.9832 } }, // Bryant Park
    { key: "rockefellerCenter", location: { lat: 40.7587, lng: -73.9787 } }, // Rockefeller Center
    { key: "wallStreet", location: { lat: 40.7069, lng: -74.0113 } }, // Wall Street (NYSE)
    { key: "flatironBuilding", location: { lat: 40.7411, lng: -73.9897 } }, // Flatiron Building
    { key: "coneyIsland", location: { lat: 40.5755, lng: -73.9707 } }, // Coney Island
  ];

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

        <Map
          defaultZoom={13}
          defaultCenter={{ lat: 40.71, lng: -74.0 }}
          mapId="dbb25aa561a27861"
          onCameraChanged={(ev: MapCameraChangedEvent) =>
            console.log(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
        >
          <PoiMarkers pois={locations} />
        </Map>
      </div>
    </APIProvider>
  );
}
