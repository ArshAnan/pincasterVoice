import os
import json
from mapbox import Directions
import math


# Gives distance between 2 points in meters
def distance_between(lat1, lon1, lat2, lon2):
    # Earth’s radius in meters
    R = 6371000  # 6,371 km = 6,371,000 meters

    # Convert degrees to radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    # Differences in coordinates
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    # Haversine formula
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c  # Distance in meters

    return distance


# Load your access token from environment variable
access_token = os.getenv('MAPBOX_ACCESS_TOKEN')

# Initialize Directions service
directions = Directions(access_token=access_token)

# Define locations (start, stops, end) as GeoJSON-like dictionaries
start = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-74.0060, 40.7128]}}  # NYC
stop1 = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9857, 40.7484]}}  # Empire State
stop2 = {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9867, 40.7306]}}  # Union Square
end =   {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9851, 40.7589]}}  # Times Square

waypoints = [start, stop1, stop2, end]
# waypoints = [start, end]

# Request directions (driving profile)
response = directions.directions(
    waypoints,
    profile='mapbox/driving',  # Options: driving, walking, cycling
    geometries='geojson'       # Return route as GeoJSON
)


# Check if request was successful
if response.status_code == 200:
    route = response.geojson()
    travel_time = route['features'][0]['properties']['duration'] / 60  # Convert seconds to minutes
    print(f"Total travel time: {travel_time:.2f} minutes")
    with open('route.json', 'w', encoding='utf-8') as f:
        json.dump(route, f, indent=4)  # indent=4 for pretty-printing
else:
    print(f"Error: {response.status_code} - {response.text}")
