'use client';

import React from 'react';
import MapView from '../components/MapView';
import { MarkerData } from './types';

const markers: MarkerData[] = [
  { lat: 51.505, lng: -0.09, title: 'Marker 1', description: 'Description for Marker 1' },
  { lat: 51.515, lng: -0.1, title: 'Marker 2', description: 'Description for Marker 2' },
];

const MapMainPage: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <MapView markers={markers} />
    </div>
  );
};

export default MapMainPage;
