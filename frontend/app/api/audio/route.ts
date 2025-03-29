import { NextResponse } from "next/server"

// This is a mock implementation - in a real app, you would connect to MongoDB
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lng = Number.parseFloat(searchParams.get("lng") || "0")
  const radius = Number.parseFloat(searchParams.get("radius") || "1")

  // Validate parameters
  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 })
  }

  try {
    // In a real application, you would query MongoDB using the $geoNear operator
    // Example MongoDB query:
    /*
    const audioFiles = await db.collection('audioFiles').aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radius * 1000, // Convert km to meters
          spherical: true,
          query: {} // Additional filters can go here
        }
      }
    ]).toArray();
    */

    // For this example, we'll return mock data
    const mockAudioFiles = generateMockAudioFiles(lat, lng, radius)

    return NextResponse.json(mockAudioFiles)
  } catch (error) {
    console.error("Error fetching audio files:", error)
    return NextResponse.json({ error: "Failed to fetch audio files" }, { status: 500 })
  }
}

// Helper function to generate mock audio data
function generateMockAudioFiles(lat: number, lng: number, radius: number) {
  const audioFiles = []
  const numFiles = Math.floor(Math.random() * 5) + 1 // 1-5 files

  for (let i = 0; i < numFiles; i++) {
    // Generate a random point within the radius
    const angle = Math.random() * Math.PI * 2
    const distance = Math.random() * radius

    // Convert distance in km to lat/lng offset (approximate)
    // 1 degree of latitude = ~111 km
    // 1 degree of longitude = ~111 km * cos(latitude)
    const latOffset = distance / 111
    const lngOffset = distance / (111 * Math.cos((lat * Math.PI) / 180))

    const newLat = lat + latOffset * Math.sin(angle)
    const newLng = lng + lngOffset * Math.cos(angle)

    audioFiles.push({
      _id: `audio_${i}_${Date.now()}`,
      title: `Audio Recording ${i + 1}`,
      url: `/api/mock-audio/${i + 1}`, // In a real app, this would be a real URL
      location: {
        type: "Point",
        coordinates: [newLng, newLat],
      },
      distance: distance, // Distance in km
      // Additional metadata could go here
    })
  }

  return audioFiles
}

