"use client";

import { useState, useEffect } from "react";
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

  const [showPopup, setShowPopup] = useState<string | null>(null);

  const handleCurrentVoice = async (poiKey: string) => {
    try {
      const response = await fetch(`http://localhost:5000/get-audio?poi_key=${poiKey}`);
      if (!response.ok) {
        throw new Error("Failed to fetch audio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error("Error playing audio:", error);
      setShowPopup("Failed to play audio.");
    }
  };

  const handleConversation = () => {
    setShowPopup("Conversation Activated!");
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(null), 3000); // Auto-hide popup after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Update map center (used by pin clicks, etc)
  const updateMapCenter = (coords: [number, number]) => {
    setMapCenter([coords[1], coords[0]]); // Switch to [latitude, longitude]
  };

  type Poi = { key: string; location: google.maps.LatLngLiteral };
  const PoiMarkers = (props: { pois: Poi[] }) => {
    const [activePoi, setActivePoi] = useState<string | null>(null);
    const [activePoiLocation, setActivePoiLocation] = useState<google.maps.LatLngLiteral | null>(null);

    return (
      <>
        {props.pois.map((poi: Poi) => (
          <AdvancedMarker
            key={poi.key}
            position={poi.location}
            onClick={() => {
              setActivePoi(poi.key); // Set the active POI
              setActivePoiLocation(poi.location); // Set the location of the active POI
            }}
          >
            <Pin
              background={"#FBBC04"}
              glyphColor={"#000"}
              borderColor={"#000"}
            />
          </AdvancedMarker>
        ))}
        {activePoi && activePoiLocation && (
          <div
            className={styles.featureSelectionUI}
            style={{
              position: "absolute",
              top: `${activePoiLocation.lat}px`, // Adjust based on map projection
              left: `${activePoiLocation.lng}px`, // Adjust based on map projection
            }}
          >
            <p>Choose an action for {activePoi}:</p>
            <button
              onClick={() => {
                handleCurrentVoice(activePoi!); // Pass the active POI key
                setShowPopup(`Feature One Activated for ${activePoi}`);
                setActivePoi(null); // Close the UI after selection
              }}
              className={styles.button}
            >
              Activate Feature One
            </button>
            <button
              onClick={() => {
                handleConversation();
                setShowPopup(`Conversation Started for ${activePoi}`);
                setActivePoi(null); // Close the UI after selection
              }}
              className={styles.button}
            >
              Start Conversation
            </button>
          </div>
        )}
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
        {/* Popup */}
        {showPopup && <div className={styles.popup}>{showPopup}</div>}

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
