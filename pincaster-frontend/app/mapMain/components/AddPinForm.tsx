"use client";

import { useState, RefObject } from 'react';
import { MarkerData } from '../types';
import styles from '../MapPage.module.css';

interface AddPinFormProps {
  addPinMode: boolean;
  setAddPinMode: (mode: boolean) => void;
  mapCenter: [number, number];
  tempPinLocation: [number, number] | null;
  setTempPinLocation: (location: [number, number] | null) => void;
  setShowAddPinDialog: (show: boolean) => void;
  markers: MarkerData[];
  setMarkers: (markers: MarkerData[]) => void;
  titleRef: RefObject<HTMLInputElement>;
}

export default function AddPinForm({
  addPinMode,
  setAddPinMode,
  mapCenter,
  tempPinLocation,
  setTempPinLocation,
  setShowAddPinDialog,
  markers,
  setMarkers,
  titleRef
}: AddPinFormProps) {
  const [defaultPinTitle, setDefaultPinTitle] = useState('New Pin');

  // Handle adding a new marker
  const handleAddMarker = () => {
    // Use temp pin location if available, otherwise use map center
    const coordinates = tempPinLocation || mapCenter;
    
    if (!titleRef.current?.value) {
      alert('Please provide a title for the marker');
      return;
    }
    
    const newMarker: MarkerData = {
      id: Date.now().toString(),
      coordinates: coordinates,
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

  return (
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
  );
}
