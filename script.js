// ...existing code...

// Initialize Google Map
let map;
let markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false
    });
    
    // Get user location if available
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(userLocation);
            addMarker(userLocation, 'Your location');

            // Send the user's location to the backend
            sendLocationToBackend(userLocation);
        }, () => {
            console.log('Error: The Geolocation service failed.');
        });
    }

    // Add click listener to map
    map.addListener('click', (e) => {
        const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng()
        };
        addMarker(clickedLocation, 'New marker');
    });
}

function addMarker(location, title) {
    const marker = new google.maps.Marker({
        position: location,
        map: map,
        title: title,
        animation: google.maps.Animation.DROP
    });
    
    markers.push(marker);
    
    // Add info window for the marker
    const infoWindow = new google.maps.InfoWindow({
        content: `<div><h3>${title}</h3><p>Latitude: ${location.lat.toFixed(6)}, Longitude: ${location.lng.toFixed(6)}</p></div>`
    });
    
    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
    
    return marker;
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', initMap);

function sendLocationToBackend(location) {
    const backendUrl = '/api/location'; // Local API endpoint for MongoDB integration

    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send location to the backend');
        }
        return response.json();
    })
    .then(data => {
        console.log('Location sent successfully:', data);
    })
    .catch(error => {
        console.error('Error sending location:', error);
    });
}

// ...existing code...
