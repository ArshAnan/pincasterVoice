"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Mic } from "lucide-react"
import AudioPlayer from "@/components/audio-player"
import Map from "@/components/map"
import Sidebar from "@/components/sidebar"
import WelcomeDialog from "@/components/welcome-dialog"
import GenerateAudioDialog from "@/components/generate-audio-dialog"

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

export default function GeoAudioFinder() {
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [radius, setRadius] = useState([1]) // km
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [filteredAudioFiles, setFilteredAudioFiles] = useState<AudioFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAudio, setSelectedAudio] = useState<AudioFile | null>(null)
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [showWelcome, setShowWelcome] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const categories = ["all", "nature", "urban", "music", "conversation", "ambient"]

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }

    const savedFavorites = localStorage.getItem("favorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }

    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem("hasCompletedOnboarding")
    if (hasCompletedOnboarding) {
      setShowWelcome(false)
    }
  }, [])

  // Filter audio files when category changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredAudioFiles(audioFiles)
    } else {
      setFilteredAudioFiles(audioFiles.filter((audio) => audio.category === selectedCategory || !audio.category))
    }
  }, [selectedCategory, audioFiles])

  const handleSearch = async () => {
    if (!latitude || !longitude) {
      setError("Please enter both latitude and longitude")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/audio?lat=${latitude}&lng=${longitude}&radius=${radius[0]}`)

      if (!response.ok) {
        throw new Error("Failed to fetch audio files")
      }

      const data = await response.json()

      // Add random categories to mock data for demonstration
      const dataWithCategories = data.map((audio: AudioFile) => ({
        ...audio,
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
      }))

      setAudioFiles(dataWithCategories)
      setFilteredAudioFiles(dataWithCategories)
      setSelectedCategory("all")

      if (data.length === 0) {
        setError("No audio files found in this location")
      } else {
        // Save to recent searches
        const locationName = `Location at ${Number.parseFloat(latitude).toFixed(4)}, ${Number.parseFloat(longitude).toFixed(4)}`
        const newSearch = {
          id: Date.now().toString(),
          name: locationName,
          latitude: Number.parseFloat(latitude),
          longitude: Number.parseFloat(longitude),
          timestamp: Date.now(),
        }

        const updatedSearches = [newSearch, ...recentSearches.slice(0, 4)]
        setRecentSearches(updatedSearches)
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAudio = (type: string, prompt: string) => {
    setLoading(true)

    // Simulate audio generation (in a real app, this would call an AI service)
    setTimeout(() => {
      const newAudio: AudioFile = {
        _id: `generated_${Date.now()}`,
        title: `Generated ${type.charAt(0).toUpperCase() + type.slice(1)} Audio`,
        url: `/api/mock-audio/generated`, // In a real app, this would be a real URL
        location: {
          type: "Point",
          coordinates: [Number.parseFloat(longitude), Number.parseFloat(latitude)],
        },
        distance: 0,
        category: type,
        isGenerated: true,
      }

      const updatedAudioFiles = [newAudio, ...audioFiles]
      setAudioFiles(updatedAudioFiles)
      setFilteredAudioFiles(updatedAudioFiles)
      setSelectedAudio(newAudio)
      setLoading(false)
      setShowGenerateDialog(false)
    }, 2000)
  }

  const completeWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem("hasCompletedOnboarding", "true")
  }

  return (
    <>
      <WelcomeDialog open={showWelcome} onOpenChange={setShowWelcome} onComplete={completeWelcome} />

      <GenerateAudioDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        onGenerate={handleGenerateAudio}
        isLoading={loading}
        coordinates={{ latitude, longitude }}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar
          latitude={latitude}
          longitude={longitude}
          radius={radius}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          setRadius={setRadius}
          audioFiles={audioFiles}
          filteredAudioFiles={filteredAudioFiles}
          loading={loading}
          error={error}
          selectedAudio={selectedAudio}
          setSelectedAudio={setSelectedAudio}
          recentSearches={recentSearches}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          favorites={favorites}
          setFavorites={setFavorites}
          categories={categories}
          handleSearch={handleSearch}
          setShowWelcome={setShowWelcome}
          setShowGenerateDialog={setShowGenerateDialog}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Main Content - Map */}
        <div className="flex-1 h-full flex flex-col">
          {/* Map Container */}
          <div ref={mapRef} className="flex-1 relative">
            <Map
              latitude={latitude ? Number.parseFloat(latitude) : undefined}
              longitude={longitude ? Number.parseFloat(longitude) : undefined}
              radius={radius[0]}
              audioFiles={filteredAudioFiles}
              onSelectAudio={setSelectedAudio}
              fullscreen={true}
            />

            {/* Generate Audio Button (Floating) */}
            {latitude && longitude && (
              <div className="absolute bottom-4 right-4 z-10">
                <Button onClick={() => setShowGenerateDialog(true)} className="shadow-lg">
                  <Mic className="mr-2 h-4 w-4" /> Generate Audio
                </Button>
              </div>
            )}
          </div>

          {/* Audio Player (Fixed at bottom) */}
          {selectedAudio && (
            <div className="border-t bg-background p-2">
              <AudioPlayer audio={selectedAudio} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

interface RecentSearch {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: number
}

