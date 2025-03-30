// Define shared types for the application

export interface MarkerData {
  id: string;
  coordinates: [number, number];
  title: string;
  description?: string;
  // Add other properties as needed
}

// Define the NYC bounding box coordinates
export const NYC_BOUNDS = {
  west: -74.2589,
  south: 40.4774,
  east: -73.7004,
  north: 40.9176,
  toString: () => '-74.2589,40.4774,-73.7004,40.9176'
};

// Add global type definition for Mapbox/Leaflet
declare global {
  interface Window {
    L: any;
  }
}
