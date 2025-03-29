import os
import json
import math
from mapbox import Directions

def interpolate_points_with_total_distance(linestring_coords, total_distance, interval):
    """
    Generate points along a LineString at a given interval using a precomputed total distance.
    
    Args:
        linestring_coords: List of [lon, lat] pairs from the LineString.
        total_distance: Total distance of the LineString in meters (from Mapbox).
        interval: Distance interval in meters (e.g., 500).
    
    Returns:
        List of [lon, lat] points at the specified intervals.
    """
    # Calculate cumulative distances as a proportion of total distance
    cumulative_distances = [0]
    for i in range(1, len(linestring_coords)):
        # Use Haversine to estimate segment lengths, then scale to total_distance later
        lon1, lat1 = linestring_coords[i - 1]
        lon2, lat2 = linestring_coords[i]
        segment_distance = haversine(lat1, lon1, lat2, lon2)
        cumulative_distances.append(cumulative_distances[-1] + segment_distance)

    # Scale cumulative distances to match total_distance
    haversine_total = cumulative_distances[-1]
    if haversine_total > 0:  # Avoid division by zero
        scale_factor = total_distance / haversine_total
        cumulative_distances = [d * scale_factor for d in cumulative_distances]

    print(f"Scaled total distance: {cumulative_distances[-1]:.2f} meters (matches Mapbox)")

    # Generate points at intervals
    interpolated_points = []
    current_distance = 0

    while current_distance <= total_distance:
        # Find the segment containing current_distance
        for i in range(1, len(cumulative_distances)):
            if cumulative_distances[i - 1] <= current_distance <= cumulative_distances[i]:
                # Interpolate between points i-1 and i
                lon1, lat1 = linestring_coords[i - 1]
                lon2, lat2 = linestring_coords[i]
                segment_length = cumulative_distances[i] - cumulative_distances[i - 1]
                if segment_length > 0:  # Avoid division by zero
                    segment_progress = (current_distance - cumulative_distances[i - 1]) / segment_length
                    interpolated_lon = lon1 + (lon2 - lon1) * segment_progress
                    interpolated_lat = lat1 + (lat2 - lat1) * segment_progress
                    interpolated_points.append([interpolated_lon, interpolated_lat])
                break
        
        current_distance += interval

    return interpolated_points


# Haversine function (for segment proportions)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371000
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


# Example with Mapbox data
access_token = os.getenv('MAPBOX_ACCESS_TOKEN')
directions = Directions(access_token=access_token)


waypoints = [
    {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-74.0060, 40.7128]}},
    {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9857, 40.7484]}},
    {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9867, 40.7306]}},
    {'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': [-73.9851, 40.7589]}}
]


response = directions.directions(waypoints, profile='mapbox/driving', geometries='geojson')
if response.status_code == 200:
    route = response.geojson()
    linestring_coords = route['features'][0]['geometry']['coordinates']
    total_distance = route['features'][0]['properties']['distance']  # Mapbox-provided distance in meters
    interval = 1000  # 500 meters

    points = interpolate_points_with_total_distance(linestring_coords, total_distance, interval)

    for i, (lon, lat) in enumerate(points):
        print(f"Point {i}: [{lon:.6f}, {lat:.6f}]")
else:
    print(f"Error: {response.status_code} - {response.text}")



# if response.status_code == 200:
#     route = response.geojson()
#     linestring_coords = route['features'][0]['geometry']['coordinates']
#     total_distance = route['features'][0]['properties']['distance']  # Mapbox-provided distance in meters
#     interval = 1000  # 500 meters

#     points = interpolate_points_with_total_distance(linestring_coords, total_distance, interval)

#     print(f"Points at {interval}-meter intervals:")
#     for i, (lon, lat) in enumerate(points):
#         print(f"Point {i}: [{lon:.6f}, {lat:.6f}]")

#     # Save to JSON
#     # with open('interpolated_points.json', 'w', encoding='utf-8') as f:
#     #     json.dump({
#     #         'type': 'FeatureCollection',
#     #         'features': [{'type': 'Feature', 'geometry': {'type': 'Point', 'coordinates': pt}} for pt in points]
#     #     }, f, indent=4)
#     # print("Points saved as 'interpolated_points.json'")
# else:
#     print(f"Error: {response.status_code} - {response.text}")
