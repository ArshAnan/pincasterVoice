"use client";

import React, { useRef } from "react";
import { MarkerData, NYC_BOUNDS } from "../types";
import GOOGLE_MAPS_API_KEY from "../page";
import AddPinForm from "./AddPinForm";
import styles from "../MapPage.module.css";

interface SidebarProps {
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  markers: MarkerData[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
  mapCenter: [number, number];
  setMapCenter: React.Dispatch<React.SetStateAction<[number, number]>>;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  addPinMode: boolean;
  setAddPinMode: React.Dispatch<React.SetStateAction<boolean>>;
  tempPinLocation: [number, number] | null;
  setTempPinLocation: React.Dispatch<
    React.SetStateAction<[number, number] | null>
  >;
  showAddPinDialog: boolean;
  setShowAddPinDialog: React.Dispatch<React.SetStateAction<boolean>>;
  useVoiceCommands: boolean;
  setUseVoiceCommands: React.Dispatch<React.SetStateAction<boolean>>;
  useFallback: boolean;
  updateMapCenter: (coords: [number, number]) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  address,
  setAddress,
  markers,
  setMarkers,
  mapCenter,
  setMapCenter,
  setMapZoom,
  error,
  setError,
  addPinMode,
  setAddPinMode,
  tempPinLocation,
  setTempPinLocation,
  showAddPinDialog,
  setShowAddPinDialog,
  useVoiceCommands,
  setUseVoiceCommands,
  useFallback,
  updateMapCenter,
}) => {
  const titleRef = useRef<HTMLInputElement | null>(null);

  // Handle address submission with geocoding or fallback
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    if (useFallback) {
      // In fallback mode, just simulate finding an address nearby the current location
      const randomOffset = () => Math.random() * 0.01 - 0.005;
      const newLng = mapCenter[0] + randomOffset();
      const newLat = mapCenter[1] + randomOffset();
      setMapCenter([newLng, newLat]);
      setMapZoom(15);
      return;
    }

    try {
      // Use Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${GOOGLE_MAPS_API_KEY}`
      );

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const { lng, lat } = data.results[0].geometry.location;
        setMapCenter([lng, lat]);
        setMapZoom(15);

        // Check if the result is actually within NYC area as an extra verification
        if (
          lng < NYC_BOUNDS.west ||
          lng > NYC_BOUNDS.east ||
          lat < NYC_BOUNDS.south ||
          lat > NYC_BOUNDS.north
        ) {
          setError(
            "Location found, but outside NYC. Map will focus on NYC area."
          );
          // Reset to NYC center if result is outside bounds
          setMapCenter([-74.0, 40.71]);
          setMapZoom(12);
        }
      } else {
        setError("Location not found in NYC. Please try a different address.");
      }
    } catch (error) {
      console.error("Error finding address:", error);
      setError("Failed to find address.");
    }
  };

  // Function to center the map on a specific marker
  const handleMarkerClick = (coords: [number, number]) => {
    updateMapCenter(coords);
    setMapZoom(15);
  };

  // Function to delete a marker
  const handleDeleteMarker = (id: string) => {
    setMarkers(markers.filter((marker) => marker.id !== id));
  };

  return (
    <div
      className={styles.sidebar}
      style={{
        background: "linear-gradient(to bottom, #2c3e50, #34495e)",
        color: "#ecf0f1",
        boxShadow: "2px 0 10px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2
        className={styles.sidebarTitle}
        style={{
          color: "#3498db",
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
          borderBottom: "2px solid #3498db",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Pincaster
      </h2>

      {/* Address Search Form */}
      <form
        onSubmit={handleAddressSearch}
        className={styles.searchForm}
        style={{
          background: "rgba(44, 62, 80, 0.6)",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3 className={styles.sectionHeading} style={{ color: "#3498db" }}>
          Find Location
        </h3>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address"
          className={styles.input}
          style={{
            background: "#ecf0f1",
            border: "2px solid #3498db",
            borderRadius: "4px",
            padding: "8px 12px",
            color: "#2c3e50",
            width: "100%",
            marginBottom: "10px",
          }}
        />
        <button
          type="submit"
          className={styles.button}
          style={{
            background: "#3498db",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "8px 16px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "background 0.3s",
            width: "100%",
          }}
        >
          Search
        </button>
        {error && (
          <p
            className={styles.errorText}
            style={{ color: "#e74c3c", marginTop: "10px" }}
          >
            {error}
          </p>
        )}
      </form>

      {/* Add Pin Form Component */}
      <AddPinForm
        addPinMode={addPinMode}
        setAddPinMode={setAddPinMode}
        mapCenter={mapCenter}
        tempPinLocation={tempPinLocation}
        setTempPinLocation={setTempPinLocation}
        setShowAddPinDialog={setShowAddPinDialog}
        markers={markers}
        setMarkers={setMarkers}
        titleRef={titleRef.current}
      />

      {/* Inline Markers List */}
      <div
        className={styles.markersList}
        style={{
          background: "rgba(44, 62, 80, 0.6)",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <h3 className={styles.sectionHeading} style={{ color: "#3498db" }}>
          Saved Locations
        </h3>

        {markers.length === 0 ? (
          <p
            style={{ color: "#bdc3c7", textAlign: "center", marginTop: "10px" }}
          >
            No pins added yet
          </p>
        ) : (
          <ul
            className={styles.markerItems}
            style={{ listStyle: "none", padding: 0 }}
          >
            {markers.map((marker) => (
              <li
                key={marker.id}
                className={styles.markerItem}
                style={{
                  background: "rgba(52, 73, 94, 0.7)",
                  padding: "10px",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ margin: "0 0 5px 0", color: "#3498db" }}>
                    {marker.title}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9em", color: "#bdc3c7" }}>
                    {marker.description || "No description"}
                  </p>
                </div>
                <div className={styles.markerActions}>
                  <button
                    onClick={() => handleMarkerClick(marker.coordinates)}
                    className={styles.actionButton}
                    style={{
                      background: "#2980b9",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      marginRight: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Go
                  </button>
                  <button
                    onClick={() => handleDeleteMarker(marker.id)}
                    className={styles.actionButton}
                    style={{
                      background: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
