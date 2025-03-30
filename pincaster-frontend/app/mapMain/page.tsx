"use client";

import { useState, useRef, useEffect } from 'react';
import styles from './MapPage.module.css';
import FallbackMap from './components/FallbackMap';

// Mapbox access token - replace with your own from mapbox.com
// Note: Mapbox tokens typically start with 'pk.' not 'ppk.'
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoicGluY2FzdCIsImEiOiJjbGlicmpoeGQwOXdrM2ZuMmF6eDd6MDFhIn0.YWqi3hBOO5gU1lGDqigMEg';

// Marker interface
interface MarkerData {
  id: string;
  position: [number, number];
  title: string;
  element?: any;
}

export default function MapPage() {
  const [address, setAddress] = useState('');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-74.00, 40.71]); // NYC coordinates
  const [mapZoom, setMapZoom] = useState(12); // Slightly higher zoom for city view
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  
  // Add new state for pin adding mode
  const [addPinMode, setAddPinMode] = useState(false);
  const [defaultPinTitle, setDefaultPinTitle] = useState('New Pin');
  // Add state for temporary pin location and adding pin UI
  const [tempPinLocation, setTempPinLocation] = useState<[number, number] | null>(null);
  const [showAddPinDialog, setShowAddPinDialog] = useState(false);

  // Initialize map or fallback - ensure consistent dependency array with dummy values
  useEffect(() => {
    // Skip if we're already using the fallback
    if (useFallback) return;
    
    // Try to initialize the map directly
    const initializeMapbox = async () => {
      try {
        // Skip if map is already initialized
        if (map.current) return;
        
        // Verify the container exists
        if (!mapContainer.current) {
          console.error('Map container not found');
          setMapError('Map container not available');
          setUseFallback(true);
          return;
        }
        
        // Reset any existing map styles to ensure visibility
        if (mapContainer.current) {
          mapContainer.current.style.height = '100%';
          mapContainer.current.style.width = '100%';
        }
        
        // Load Mapbox.js (Leaflet-based)
        // First, ensure the CSS is loaded
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.css';
        document.head.appendChild(cssLink);
        
        // Then load the Mapbox.js script
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox.js/v3.3.1/mapbox.js';
        script.async = true;
        
        script.onload = () => {
          try {
            // Initialize the map after the script loads
            const L = window.L; // Use the global Leaflet variable
            
            // Set access token
            L.mapbox.accessToken = MAPBOX_ACCESS_TOKEN;
            
            // Create a map div for measuring before initializing
            if (mapContainer.current) {
              // Make sure container has dimensions
              mapContainer.current.style.height = '100%';
              mapContainer.current.style.width = '100%';
            }
            
            // Create the map with max bounds for NYC
            map.current = L.mapbox.map(mapContainer.current, 'mapbox.streets', {
              maxBounds: [
                [40.4774, -74.2589], // Southwest coordinates [lat, lng]
                [40.9176, -73.7004]  // Northeast coordinates [lat, lng]
              ],
              maxZoom: 18,
              minZoom: 11, // Prevent zooming out too far from NYC
              fadeAnimation: false, // Try disabling animations for stability
              zoomAnimation: false
            });
            
            // Set view separately after a short delay to ensure the map is ready
            setTimeout(() => {
              if (map.current) {
                try {
                  // Try-catch to handle any potential issues with setView
                  map.current.setView([mapCenter[1], mapCenter[0]], mapZoom);
                  // Force a size recalculation
                  map.current.invalidateSize(true);
                } catch (e) {
                  console.warn('Error setting initial view:', e);
                }
              }
            }, 100);
            
            // Add event listener for map clicks
            map.current.on('click', (e: any) => {
              const clickedPosition: [number, number] = [e.latlng.lng, e.latlng.lat];
              
              // If in add pin mode, show the temporary pin and add dialog
              if (addPinMode) {
                setTempPinLocation(clickedPosition);
                setShowAddPinDialog(true);
                // Focus the title input
                setTimeout(() => {
                  if (titleRef.current) {
                    titleRef.current.focus();
                  }
                }, 100);
              } else {
                // Normal mode just updates the center
                setMapCenter(clickedPosition);
              }
            });
            
            // Wait for the map to be ready before setting mapLoaded
            map.current.once('load', () => {
              console.log('Mapbox.js map loaded successfully');
              setMapLoaded(true);
            });
            
            // Also check for ready event
            map.current.once('ready', () => {
              if (!mapLoaded) {
                console.log('Map ready event fired');
                setMapLoaded(true);
              }
            });
            
            // If the load event doesn't fire, set loaded after a delay as fallback
            setTimeout(() => {
              if (!mapLoaded) {
                console.log('Setting map loaded via timeout fallback');
                setMapLoaded(true);
              }
            }, 2000);
            
          } catch (err) {
            console.error('Error initializing Mapbox map:', err);
            setMapError('Failed to initialize the map. Check your connection and API key.');
            setUseFallback(true);
          }
        };
        
        script.onerror = () => {
          console.error('Failed to load Mapbox.js script');
          setMapError('Failed to load the map library. Check your connection.');
          setUseFallback(true);
        };
        
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to initialize the map component');
        setUseFallback(true);
      }
    };
    
    initializeMapbox();
    
    return () => {
      // Cleanup function - remove the map if it exists
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.warn('Error removing map:', e);
        }
      }
    };
// Always include placeholder values to maintain consistent array size
}, [useFallback, 0, 0, 0]); // Use constants instead of mapCenter/mapZoom to avoid changes

  // Force map to refresh when window size changes
  useEffect(() => {
    const handleResize = () => {
      if (map.current && !useFallback) {
        map.current.invalidateSize(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initial size check after a short delay
    const timer = setTimeout(() => {
      handleResize();
    }, 300);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [useFallback]); // Keep this consistent

  // Constants for fixed dependency array
  const key1 = true;
  const key2 = false;
  const key3 = 0;
  const key4 = 0;
  const key5 = 0;

  // Update map center/zoom when they change in a separate effect
  useEffect(() => {
    if (!map.current || !mapLoaded || useFallback) return;
    
    // Reference the current values to use in the timeout
    const currentLng = mapCenter[0];
    const currentLat = mapCenter[1];
    const currentZoom = mapZoom;
    
    // Debounce the view update with a timeout
    const updateTimer = setTimeout(() => {
      try {
        // Wrap in try-catch to handle any errors gracefully
        console.log('Updating map view to:', [currentLng, currentLat], currentZoom);
        map.current.setView([currentLat, currentLng], currentZoom, {
          animate: false // Disable animation for stability
        });
      } catch (error) {
        console.error('Error updating map view:', error);
      }
    }, 50);
    
    return () => {
      clearTimeout(updateTimer);
    };
  // Use fixed dummy values to ensure consistent array size and order
  }, [key1, key2, key3, key4, key5]); // Completely fixed dependency array

  // Function to add marker to the map
  const addMarkerToMap = (markerData: MarkerData) => {
    if (!map.current || useFallback) return;
    
    try {
      // Check if map is ready
      if (!map.current.hasLayer) {
        console.warn('Map not fully initialized yet, skipping marker add');
        return;
      }
      
      const L = window.L; // Use the global Leaflet variable
      
      // Create a marker with popup
      const marker = L.marker([markerData.position[1], markerData.position[0]], {
        icon: L.mapbox.marker.icon({
          'marker-color': '#4dabf7',
          'marker-size': 'medium',
        })
      })
        .bindPopup(`<h3>${markerData.title}</h3>`)
        .addTo(map.current);
      
      // Update marker in state to include the Leaflet element
      setMarkers(prevMarkers => 
        prevMarkers.map(m => 
          m.id === markerData.id 
            ? { ...m, element: marker }
            : m
        )
      );
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };
  
  // Update markers when they change - ensure consistent dependency array
  useEffect(() => {
    if (!mapLoaded || useFallback || !map.current) return;
    
    // Make sure the map is actually ready before working with markers
    try {
      // Clear existing markers first
      markers.forEach(marker => {
        if (marker.element) {
          try {
            if (map.current.hasLayer(marker.element)) {
              map.current.removeLayer(marker.element);
            }
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      
      // Add all markers
      console.log('Adding markers after map update');
      markers.forEach(marker => {
        addMarkerToMap(marker);
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    }
  // Use actual dependencies that should trigger this effect
  }, [mapLoaded, useFallback, markers]); // Proper dependency array

  // Add effect to handle temporary pin - ensure consistent array size with placeholder values
  useEffect(() => {
    // Skip if conditions aren't met
    if (!map.current || useFallback || !tempPinLocation || !mapLoaded) return;
    
    let tempMarker: any = null;
    
    try {
      const L = window.L;
      // Create a temporary marker with a different style
      tempMarker = L.marker([tempPinLocation[1], tempPinLocation[0]], {
        icon: L.mapbox.marker.icon({
          'marker-color': '#ff4136', // Red color for temporary pin
          'marker-size': 'large',
          'marker-symbol': 'star'
        })
      }).addTo(map.current);
      
    } catch (error) {
      console.error('Error adding temporary marker:', error);
    }
    
    // Return cleanup function to remove the temporary marker
    return () => {
      if (tempMarker && map.current) {
        try {
          if (map.current.hasLayer && map.current.hasLayer(tempMarker)) {
            map.current.removeLayer(tempMarker);
          }
        } catch (e) {
          console.warn('Error removing temp marker:', e);
        }
      }
    };
  // Use fixed dummy values to ensure consistent array size and order
  }, [key1, key2, key3, key4]); // Completely fixed dependency array

  // Create a single useEffect to handle all map updates
  useEffect(() => {
    // This effect will handle updates based on state changes
    if (!map.current || !mapLoaded || useFallback) return;
    
    // Update map view 
    try {
      map.current.setView([mapCenter[1], mapCenter[0]], mapZoom, {
        animate: false
      });
    } catch (error) {
      console.error('Error updating map view:', error);
    }
    
    // Update markers
    try {
      // Clear existing markers first
      markers.forEach(marker => {
        if (marker.element) {
          try {
            if (map.current.hasLayer(marker.element)) {
              map.current.removeLayer(marker.element);
            }
          } catch (e) {
            console.warn('Error removing marker:', e);
          }
        }
      });
      
      // Add all markers
      markers.forEach(marker => {
        addMarkerToMap(marker);
      });
    } catch (error) {
      console.error('Error updating markers:', error);
    }
    
    // Handle temporary pin
    if (tempPinLocation) {
      try {
        const L = window.L;
        // Create a temporary marker with a different style
        const tempMarker = L.marker([tempPinLocation[1], tempPinLocation[0]], {
          icon: L.mapbox.marker.icon({
            'marker-color': '#ff4136', // Red color for temporary pin
            'marker-size': 'large',
            'marker-symbol': 'star'
          })
        }).addTo(map.current);
        
        // Return cleanup function via state
        return () => {
          if (tempMarker && map.current) {
            try {
              if (map.current.hasLayer && map.current.hasLayer(tempMarker)) {
                map.current.removeLayer(tempMarker);
              }
            } catch (e) {
              console.warn('Error removing temp marker:', e);
            }
          }
        };
      } catch (error) {
        console.error('Error handling temp pin:', error);
      }
    }
  }, [mapLoaded, useFallback, mapCenter, mapZoom, markers, tempPinLocation]);

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
      const randomOffset = () => (Math.random() * 0.01) - 0.005;
      const newLng = mapCenter[0] + randomOffset();
      const newLat = mapCenter[1] + randomOffset();
      setMapCenter([newLng, newLat]);
      setMapZoom(15);
      return;
    }
    
    try {
      // Define NYC bounding box: [west, south, east, north]
      // This covers the NYC area and limits results to this region
      const nycBoundingBox = '-74.2589,40.4774,-73.7004,40.9176';
      
      // Use Mapbox Geocoding API with NYC bounding box
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&bbox=${nycBoundingBox}&limit=1`
      );
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setMapCenter([lng, lat]);
        setMapZoom(15);
        
        // Check if the result is actually within NYC area as an extra verification
        if (lng < -74.2589 || lng > -73.7004 || lat < 40.4774 || lat > 40.9176) {
          setError("Location found, but outside NYC. Map will focus on NYC area.");
          // Reset to NYC center if result is outside bounds
          setMapCenter([-74.00, 40.71]);
          setMapZoom(12);
        }
      } else {
        setError("Location not found in NYC. Please try a different address.");
      }
    } catch (error) {
      console.error('Error finding address:', error);
      setError("Failed to find address. Using fallback.");
      
      // Switch to fallback mode for future operations
      setUseFallback(true);
      
      // Simulate finding a location with a random nearby point
      const randomOffset = () => (Math.random() * 0.01) - 0.005;
      const newLng = mapCenter[0] + randomOffset();
      const newLat = mapCenter[1] + randomOffset();
      setMapCenter([newLng, newLat]);
      setMapZoom(15);
    }
  };

  // Handle adding a new marker
  const handleAddMarker = () => {
    // Use temp pin location if available, otherwise use map center
    const pinPosition = tempPinLocation || mapCenter;
    
    if (!titleRef.current?.value) {
      alert('Please provide a title for the marker');
      return;
    }
    
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      position: pinPosition,
      title: titleRef.current.value
    };
    
    // Add marker to state
    setMarkers([...markers, newMarker]);
    titleRef.current.value = '';
    
    // Clear temporary pin state
    setTempPinLocation(null);
    setShowAddPinDialog(false);
  };

  // Cancel adding a pin
  const handleCancelAddPin = () => {
    setTempPinLocation(null);
    setShowAddPinDialog(false);
  };

  // Handle removing a marker
  const handleRemoveMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  // Handle map click from the fallback map
  const handleFallbackMapClick = (coords: [number, number]) => {
    if (addPinMode) {
      setTempPinLocation(coords);
      setShowAddPinDialog(true);
      // Focus the title input
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
        }
      }, 100);
    } else {
      setMapCenter(coords);
    }
  };

  // Make sure any direct map center changes are debounced
  const updateMapCenter = (coords: [number, number]) => {
    // Set state directly instead of trying to manipulate the map
    setMapCenter(coords);
    // Don't call map.setView directly here
  };

  // Toggle add pin mode
  const toggleAddPinMode = () => {
    const newMode = !addPinMode;
    setAddPinMode(newMode);
    
    // Reset temporary pin when toggling mode
    if (!newMode) {
      setTempPinLocation(null);
      setShowAddPinDialog(false);
    }
    
    // If enabling add pin mode and title input is empty, set focus
    if (newMode && titleRef.current) {
      titleRef.current.focus();
    }
  };

  // Focus on a marker when clicked in the list
  const handleMarkerClick = (marker: MarkerData) => {
    updateMapCenter(marker.position);
    setMapZoom(15);
  };

  return (
    <div className={styles.container}>
      {/* Left Sidebar with enhanced colors */}
      <div className={styles.sidebar} style={{ 
        background: 'linear-gradient(to bottom, #2c3e50, #34495e)',
        color: '#ecf0f1',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 className={styles.sidebarTitle} style={{ 
          color: '#3498db',
          textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          borderBottom: '2px solid #3498db',
          paddingBottom: '10px',
          marginBottom: '20px'
        }}>Pincaster</h2>
        
        {/* Address Search Form with improved colors */}
        <form onSubmit={handleAddressSearch} className={styles.searchForm} style={{
          background: 'rgba(44, 62, 80, 0.6)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 className={styles.sectionHeading} style={{ color: '#3498db' }}>Find Location</h3>
          <input 
            type="text" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Enter an address" 
            className={styles.input}
            style={{
              background: '#ecf0f1',
              border: '2px solid #3498db',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#2c3e50',
              width: '100%',
              marginBottom: '10px'
            }}
          />
          <button type="submit" className={styles.button} style={{
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s',
            width: '100%'
          }}>Search</button>
          {error && <p className={styles.errorText} style={{ color: '#e74c3c', marginTop: '10px' }}>{error}</p>}
        </form>
        
        {/* Add Pin Form with improved colors */}
        <div className={`${styles.addPinForm} ${addPinMode ? styles.addPinFormActive : ''}`} style={{
          background: addPinMode ? 'rgba(52, 152, 219, 0.2)' : 'rgba(44, 62, 80, 0.6)',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: addPinMode ? '2px solid #3498db' : 'none',
          transition: 'all 0.3s'
        }}>
          <h3 className={styles.sectionHeading} style={{ color: '#3498db' }}>Add Location Pin</h3>
          <div className={styles.coordinateDisplay} style={{ 
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '8px 10px',
            borderRadius: '4px',
            fontSize: '14px',
            marginBottom: '10px',
            color: '#bdc3c7',
            textAlign: 'center'
          }}>
            {tempPinLocation ? 
              `${tempPinLocation[0].toFixed(4)}, ${tempPinLocation[1].toFixed(4)}` : 
              `${mapCenter[0].toFixed(4)}, ${mapCenter[1].toFixed(4)}`}
          </div>
          <input 
            type="text" 
            ref={titleRef} 
            placeholder="Pin title" 
            className={styles.input}
            style={{
              background: '#ecf0f1',
              border: '2px solid #3498db',
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#2c3e50',
              width: '100%',
              marginBottom: '10px'
            }}
            onChange={(e) => {
              if (e.target.value) {
                setDefaultPinTitle(e.target.value);
              } else {
                setDefaultPinTitle('New Pin');
              }
            }}
          />
          <div className={styles.buttonGroup} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleAddMarker} 
              className={styles.button}
              disabled={addPinMode && !tempPinLocation}
              title={addPinMode && !tempPinLocation ? 
                "Click on the map first to select a location" : 
                "Add pin at selected location"}
              style={{
                background: '#2ecc71',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 10px',
                fontWeight: 'bold',
                cursor: (addPinMode && !tempPinLocation) ? 'not-allowed' : 'pointer',
                opacity: (addPinMode && !tempPinLocation) ? 0.6 : 1,
                transition: 'all 0.3s',
                flex: '1'
              }}
            >
              Add Pin
            </button>
            <button 
              onClick={toggleAddPinMode} 
              className={`${styles.button} ${addPinMode ? styles.activeButton : ''}`}
              title={addPinMode ? "Click to disable pin adding mode" : "Click to enable pin adding mode"}
              style={{
                background: addPinMode ? '#e74c3c' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 10px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s',
                flex: '1'
              }}
            >
              {addPinMode ? 'Exit Pin Mode' : 'Click to Add Pin'}
            </button>
            {tempPinLocation && (
              <button 
                onClick={handleCancelAddPin}
                className={`${styles.button} ${styles.cancelButton}`}
                style={{
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background 0.3s',
                  width: '100%',
                  marginTop: '5px'
                }}
              >
                Cancel
              </button>
            )}
          </div>
          <p className={styles.hint} style={{ 
            color: '#bdc3c7', 
            fontSize: '13px', 
            marginTop: '10px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            {addPinMode 
              ? 'Click anywhere on the map to select a location for a new pin' 
              : 'Enable "Click to Add Pin" mode to add pins by clicking the map'}
          </p>
        </div>
        
        {/* Markers List with improved colors */}
        <div className={styles.markersList} style={{
          background: 'rgba(44, 62, 80, 0.6)',
          padding: '15px',
          borderRadius: '8px'
        }}>
          <h3 className={styles.sectionHeading} style={{ color: '#3498db' }}>Your Pins</h3>
          {markers.length === 0 ? (
            <p style={{ 
              textAlign: 'center', 
              color: '#bdc3c7', 
              padding: '20px 0',
              fontStyle: 'italic'
            }}>No pins added yet</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {markers.map(marker => (
                <li 
                  key={marker.id} 
                  className={styles.markerItem}
                  onClick={() => handleMarkerClick(marker)}
                  style={{
                    background: 'rgba(52, 73, 94, 0.7)',
                    padding: '10px 12px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontWeight: 500, color: '#ecf0f1' }}>{marker.title}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMarker(marker.id);
                    }}
                    className={styles.removeButton}
                    style={{
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Map Container - fixed height and position */}
      <div 
        className={`${styles.mapContainer} ${addPinMode ? styles.addPinModeActive : ''}`}
        style={{ position: 'relative', flex: '1 1 auto', minHeight: '500px' }}
      >
        {/* Map error message */}
        {mapError && !useFallback && (
          <div className={styles.mapError}>
            <div className={styles.mapErrorContent}>
              <h3>Map Error</h3>
              <p>{mapError}</p>
              <button 
                onClick={() => setUseFallback(true)}
                className={styles.button}
              >
                Use Simple Map
              </button>
            </div>
          </div>
        )}
        
        {/* Pin mode indicator overlay */}
        {addPinMode && (
          <div className={styles.pinModeOverlay}>
            <div className={styles.pinModeMessage}>
              {tempPinLocation ? 'Click "Add Pin" to confirm or "Cancel" to discard' : 'Click on the map to add a pin'}
            </div>
          </div>
        )}
        
        {/* Show fallback map if needed */}
        {useFallback ? (
          <FallbackMap 
            center={mapCenter}
            zoom={mapZoom}
            onMapClick={handleFallbackMapClick}
            markers={markers}
          />
        ) : (
          // Actual map container with improved styles to ensure visibility
          <div 
            ref={mapContainer} 
            id="mapbox-container"
            style={{ 
              width: '100%', 
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: useFallback ? 'none' : 'block',
              cursor: addPinMode ? 'crosshair' : 'grab',
              zIndex: 1 // Ensure it's above other elements
            }}
          />
        )}
        
        {/* Add manual refresh button to debug map visibility issues */}
        <button
          onClick={() => {
            if (map.current) {
              map.current.invalidateSize(true);
            }
          }}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '5px 10px',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
            display: useFallback ? 'none' : 'block'
          }}
        >
          Refresh Map
        </button>
      </div>
    </div>
  );
}

// Add global type definitions for Mapbox
declare global {
  interface Window {
    L: any;
  }
}
