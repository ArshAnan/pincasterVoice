import React from 'react';
import { MarkerData } from '../types';
import styles from '../MapPage.module.css';

interface MarkersListProps {
  markers: MarkerData[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerData[]>>;
  updateMapCenter: (coords: [number, number]) => void;
  setMapZoom: React.Dispatch<React.SetStateAction<number>>;
}

const MarkersList: React.FC<MarkersListProps> = ({
  markers,
  setMarkers,
  updateMapCenter,
  setMapZoom
}) => {
  // Function to center the map on a specific marker
  const handleMarkerClick = (coords: [number, number]) => {
    updateMapCenter(coords);
    setMapZoom(15);
  };

  // Function to delete a marker
  const handleDeleteMarker = (id: string) => {
    setMarkers(markers.filter(marker => marker.id !== id));
  };

  return (
    <div className={styles.markersList} style={{
      background: 'rgba(44, 62, 80, 0.6)',
      padding: '15px',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3 className={styles.sectionHeading} style={{ color: '#3498db' }}>Saved Locations</h3>
      
      {markers.length === 0 ? (
        <p style={{ color: '#bdc3c7', textAlign: 'center', marginTop: '10px' }}>
          No pins added yet
        </p>
      ) : (
        <ul className={styles.markerItems} style={{ listStyle: 'none', padding: 0 }}>
          {markers.map(marker => (
            <li key={marker.id} className={styles.markerItem} style={{
              background: 'rgba(52, 73, 94, 0.7)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#3498db' }}>{marker.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9em', color: '#bdc3c7' }}>{marker.description || 'No description'}</p>
              </div>
              <div className={styles.markerActions}>
                <button 
                  onClick={() => handleMarkerClick(marker.coordinates)}
                  className={styles.actionButton}
                  style={{ 
                    background: '#2980b9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    marginRight: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Go
                </button>
                <button 
                  onClick={() => handleDeleteMarker(marker.id)}
                  className={styles.actionButton}
                  style={{ 
                    background: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    cursor: 'pointer'
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
  );
};

export default MarkersList;
