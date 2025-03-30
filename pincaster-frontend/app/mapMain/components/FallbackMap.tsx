import React, { useState } from 'react';

interface FallbackMapProps {
  center: [number, number];
  zoom: number;
  onMapClick: (coords: [number, number]) => void;
  markers: Array<{
    id: string;
    position: [number, number];
    title: string;
  }>;
}

const FallbackMap: React.FC<FallbackMapProps> = ({ center, zoom, onMapClick, markers }) => {
  // Simple visual representation of a map
  const mapStyle = {
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    backgroundColor: '#e5e3df',
    overflow: 'hidden',
  };

  const gridSize = Math.max(5, Math.min(20, zoom));
  
  // Create a grid pattern to simulate a map
  const gridLines = [];
  for (let i = 0; i <= gridSize; i++) {
    // Horizontal lines
    gridLines.push(
      <div
        key={`h-${i}`}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${(i / gridSize) * 100}%`,
          height: '1px',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
      />
    );
    
    // Vertical lines
    gridLines.push(
      <div
        key={`v-${i}`}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${(i / gridSize) * 100}%`,
          width: '1px',
          backgroundColor: 'rgba(0,0,0,0.1)',
        }}
      />
    );
  }
  
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Generate fake coordinates based on click position
    const latRange = 0.2 / zoom;
    const lngRange = 0.2 / zoom;
    
    const newLat = center[1] + latRange * (0.5 - y / rect.height);
    const newLng = center[0] + lngRange * (x / rect.width - 0.5);
    
    onMapClick([newLng, newLat]);
  };
  
  return (
    <div style={mapStyle} onClick={handleClick}>
      {gridLines}
      
      {/* Coordinates display */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        backgroundColor: 'white',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        Center: {center[1].toFixed(4)}, {center[0].toFixed(4)} | Zoom: {zoom}
      </div>
      
      {/* Center marker */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '20px',
        height: '20px',
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          backgroundColor: 'rgba(77, 171, 247, 0.5)',
          border: '2px solid #4dabf7',
        }} />
      </div>
      
      {/* Markers */}
      {markers.map(marker => {
        // Very simplified marker positioning for fallback map
        const offsetX = (marker.position[0] - center[0]) * 100 * zoom;
        const offsetY = (center[1] - marker.position[1]) * 100 * zoom;
        
        return (
          <div
            key={marker.id}
            style={{
              position: 'absolute',
              top: `calc(50% - ${offsetY}px)`,
              left: `calc(50% + ${offsetX}px)`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div style={{
              width: '20px',
              height: '20px',
              background: '#4dabf7',
              borderRadius: '50% 50% 50% 0',
              transform: 'rotate(-45deg)',
            }} />
            <div style={{
              marginTop: '5px',
              background: 'white',
              padding: '3px 6px',
              borderRadius: '3px',
              fontSize: '12px',
              transform: 'translateX(-25%)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}>
              {marker.title}
            </div>
          </div>
        );
      })}
      
      {/* Mouse position indicator for better user experience */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none', // Let clicks pass through
          cursor: 'crosshair',   // Show crosshair cursor for better precision
        }}
      />
      
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        padding: '8px 12px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#fa5252',
      }}>
        FALLBACK MAP (Mapbox API unavailable)
      </div>
    </div>
  );
};

export default FallbackMap;
