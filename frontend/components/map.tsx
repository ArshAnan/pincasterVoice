"use client"

import { useEffect, useRef } from "react"

interface AudioFile {
  _id: string
  title: string
  url: string
  location: {
    type: string
    coordinates: [number, number]
  }
  distance: number
  category?: string
  isGenerated?: boolean
}

interface MapProps {
  latitude?: number
  longitude?: number
  radius: number
  audioFiles: AudioFile[]
  onSelectAudio: (audio: AudioFile) => void
  fullscreen?: boolean
}

export default function Map({ latitude, longitude, radius, audioFiles, onSelectAudio, fullscreen = false }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    // This is a placeholder for map initialization
    // In a real application, you would use a library like Mapbox, Leaflet, or Google Maps

    const initMap = () => {
      if (!mapRef.current) return

      // Simulate map rendering with a canvas
      const canvas = document.createElement("canvas")
      canvas.width = mapRef.current.clientWidth
      canvas.height = mapRef.current.clientHeight
      canvas.style.width = "100%"
      canvas.style.height = "100%"

      mapRef.current.innerHTML = ""
      mapRef.current.appendChild(canvas)

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Draw a simple map representation
      ctx.fillStyle = "#e5e7eb"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = "#d1d5db"
      ctx.lineWidth = 1

      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }

      for (let i = 0; i < canvas.height; i += 20) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      // Store the map instance reference
      mapInstanceRef.current = {
        canvas,
        ctx,
        width: canvas.width,
        height: canvas.height,
      }
    }

    initMap()

    // Handle window resize
    const handleResize = () => {
      initMap()
      updateMap()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Update map when coordinates or audio files change
  useEffect(() => {
    updateMap()
  }, [latitude, longitude, radius, audioFiles])

  const updateMap = () => {
    const map = mapInstanceRef.current
    if (!map || !map.ctx) return

    const { ctx, width, height } = map

    // Clear the canvas
    ctx.fillStyle = "#e5e7eb"
    ctx.fillRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = "#d1d5db"
    ctx.lineWidth = 1

    for (let i = 0; i < width; i += 20) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }

    for (let i = 0; i < height; i += 20) {
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.stroke()
    }

    // Reset markers
    markersRef.current = []

    // If we have coordinates, draw the search area
    if (latitude !== undefined && longitude !== undefined) {
      // Center point
      const centerX = width / 2
      const centerY = height / 2

      // Draw search radius
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius * 20, 0, 2 * Math.PI)
      ctx.fillStyle = "rgba(59, 130, 246, 0.1)"
      ctx.fill()
      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw center point
      ctx.beginPath()
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#3b82f6"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw audio file markers
      audioFiles.forEach((audio, index) => {
        // In a real app, you would convert geo coordinates to pixel coordinates
        // Here we're just placing them randomly within the radius for demonstration
        const angle = (index / audioFiles.length) * 2 * Math.PI
        const distance = (audio.distance / radius) * radius * 20 * 0.8

        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        // Draw marker
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, 2 * Math.PI)

        // Use different colors for different categories or generated audio
        if (audio.isGenerated) {
          ctx.fillStyle = "#8b5cf6" // Purple for generated audio
        } else if (audio.category === "nature") {
          ctx.fillStyle = "#10b981" // Green for nature
        } else if (audio.category === "music") {
          ctx.fillStyle = "#f59e0b" // Amber for music
        } else if (audio.category === "urban") {
          ctx.fillStyle = "#6b7280" // Gray for urban
        } else {
          ctx.fillStyle = "#ef4444" // Red default
        }

        ctx.fill()
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Add click handler for this marker
        const markerArea = {
          x,
          y,
          radius: 10,
          audio,
        }
        markersRef.current.push(markerArea)
      })

      // Add click handler to the canvas
      map.canvas.onclick = (e: MouseEvent) => {
        const rect = map.canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Check if any marker was clicked
        for (const marker of markersRef.current) {
          const dx = marker.x - x
          const dy = marker.y - y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance <= marker.radius) {
            onSelectAudio(marker.audio)
            break
          }
        }
      }
    } else {
      // No coordinates selected yet
      ctx.font = "16px sans-serif"
      ctx.fillStyle = "#6b7280"
      ctx.textAlign = "center"
      ctx.fillText("Enter coordinates or select a location to see the map", width / 2, height / 2)
    }
  }

  return (
    <div
      ref={mapRef}
      className={`w-full ${fullscreen ? "h-full" : "h-[300px]"} bg-muted flex items-center justify-center text-muted-foreground`}
    >
      Loading map...
    </div>
  )
}

