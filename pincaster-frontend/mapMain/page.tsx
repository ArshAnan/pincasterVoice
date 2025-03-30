"use client";

import { useState, useRef, useEffect } from 'react';

// Marker interface
interface MarkerData {
  id: string;
  position: [number, number];
  title: string;
}

export default function MapPage() {
  const [address, setAddress] = useState('');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-0.09, 51.505]); // Default to London
  const [mapZoom, setMapZoom] = useState(13);
  const titleRef = useRef<HTMLInputElement>(null);

  // Handle address submission
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate finding a location with a random nearby point
      const randomLat = mapCenter[0] + (Math.random() * 0.01 - 0.005);
      const randomLng = mapCenter[1] + (Math.random() * 0.01 - 0.005);
      
      setMapCenter([randomLat, randomLng]);
      setMapZoom(15);
    } catch (error) {
      console.error('Error finding address:', error);
    }
  };

  // Handle adding a new marker
  const handleAddMarker = () => {
    if (!titleRef.current?.value) {
      alert('Please provide a title for the marker');
      return;
    }
    
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      position: mapCenter,
      title: titleRef.current.value
    };
    
    setMarkers([...markers, newMarker]);
    titleRef.current.value = '';
  };

  // Handle removing a marker
  const handleRemoveMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  // Handle map click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate relative position within the map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element
    const y = e.clientY - rect.top;  // y position within the element
    
    // Convert to lat/lng (very rough approximation for placeholder)
    // This doesn't actually calculate real coordinates, just for demonstration
    const width = rect.width;
    const height = rect.height;
    
    // Generate coordinates based on the relative click position
    // This is just for visual demonstration, not geographically accurate
    const latRange = 0.2 / mapZoom;
    const lngRange = 0.2 / mapZoom;
    
    const newLat = mapCenter[0] + latRange * (0.5 - y / height);
    const newLng = mapCenter[1] + lngRange * (x / width - 0.5);
    
    setMapCenter([newLat, newLng]);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Left Sidebar */}
      <div className="w-1/4 min-w-[300px] bg-white p-4 overflow-y-auto shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">Pincaster</h2>
        
        {/* Address Search Form */}
        <form onSubmit={handleAddressSearch} className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Find Location</h3>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Enter an address" 
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full"
          >
            Search
          </button>
        </form>
        
        {/* Add Pin Form */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Add Location Pin</h3>
          <p className="text-sm mb-2">Current Location: {mapCenter[0].toFixed(4)}, {mapCenter[1].toFixed(4)}</p>
          <input 
            type="text" 
            ref={titleRef} 
            placeholder="Pin title" 
            className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleAddMarker} 
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors w-full"
          >
            Add Pin
          </button>
          <p className="text-xs text-gray-500 mt-2 italic">Tip: Click on the map to set location</p>
        </div>
        
        {/* Markers List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Your Pins</h3>
          {markers.length === 0 ? (
            <p className="text-gray-500 text-sm">No pins added yet</p>
          ) : (
            <ul className="space-y-2">
              {markers.map(marker => (
                <li key={marker.id} className="flex justify-between items-center p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <span className="font-medium truncate mr-2">{marker.title}</span>
                  <button 
                    onClick={() => handleRemoveMarker(marker.id)}
                    className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Placeholder Map Container */}
      <div 
        className="flex-1 relative bg-gray-200 flex items-center justify-center"
        onClick={handleMapClick}
      >
        <div className="absolute top-0 left-0 p-2 bg-white bg-opacity-70 z-10 rounded-br">
          <strong className="text-sm">Map Placeholder</strong><br />
          <span className="text-xs">Click anywhere to set location</span>
        </div>
        
        {/* Display a crosshair at the center */}
        <div className="absolute top-1/2 left-1/2 w-5 h-5 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500" />
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500" />
        </div>
        
        {/* Display markers */}
        {markers.map((marker) => {
          // Calculate marker position (simplified)
          const latDiff = marker.position[0] - mapCenter[0];
          const lngDiff = marker.position[1] - mapCenter[1];
          
          // Convert lat/lng difference to pixels (very rough approximation)
          const pixelsPerLat = (window.innerHeight * 0.5) / (0.1 / mapZoom);
          const pixelsPerLng = (window.innerWidth * 0.5) / (0.1 / mapZoom);
          
          const top = 50 - (latDiff * pixelsPerLat * 100 / window.innerHeight);
          const left = 50 + (lngDiff * pixelsPerLng * 100 / window.innerWidth);
          
          return (
            <div 
              key={marker.id} 
              className="absolute z-20 transform -translate-x-1/2 -translate-y-full"
              style={{
                top: `${top}%`,
                left: `${left}%`
              }}
            >
              <div className="w-5 h-5 bg-blue-500 rounded-tl-full rounded-tr-full rounded-bl-none rounded-br-full rotate-[-45deg] flex justify-center items-center">
                <div className="w-2.5 h-2.5 bg-white rounded-full rotate-45" />
              </div>
              <div className="bg-white px-1.5 py-0.5 rounded text-xs mt-1 transform -translate-x-1/3 shadow">
                {marker.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
