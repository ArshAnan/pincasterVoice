"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  MapPin,
  Loader2,
  Play,
  Compass,
  Globe,
  Headphones,
  BookmarkPlus,
  History,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

interface RecentSearch {
  id: string
  name: string
  latitude: number
  longitude: number
  timestamp: number
}

interface FeaturedLocation {
  name: string
  description: string
  latitude: number
  longitude: number
  icon: React.ReactNode
}

interface SidebarProps {
  latitude: string
  longitude: string
  radius: number[]
  setLatitude: (value: string) => void
  setLongitude: (value: string) => void
  setRadius: (value: number[]) => void
  audioFiles: AudioFile[]
  filteredAudioFiles: AudioFile[]
  loading: boolean
  error: string | null
  selectedAudio: AudioFile | null
  setSelectedAudio: (audio: AudioFile | null) => void
  recentSearches: RecentSearch[]
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  favorites: string[]
  setFavorites: (favorites: string[]) => void
  categories: string[]
  handleSearch: () => void
  setShowWelcome: (show: boolean) => void
  setShowGenerateDialog: (show: boolean) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({
  latitude,
  longitude,
  radius,
  setLatitude,
  setLongitude,
  setRadius,
  audioFiles,
  filteredAudioFiles,
  loading,
  error,
  selectedAudio,
  setSelectedAudio,
  recentSearches,
  selectedCategory,
  setSelectedCategory,
  favorites,
  setFavorites,
  categories,
  handleSearch,
  setShowWelcome,
  setShowGenerateDialog,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
        },
        (err) => {
          console.error(`Error getting location: ${err.message}`)
        },
      )
    }
  }

  const handleSelectFeaturedLocation = (location: FeaturedLocation) => {
    setLatitude(location.latitude.toString())
    setLongitude(location.longitude.toString())
    handleSearch()
  }

  const handleSelectRecentSearch = (search: RecentSearch) => {
    setLatitude(search.latitude.toString())
    setLongitude(search.longitude.toString())
    handleSearch()
  }

  const handleClearRecentSearches = () => {
    localStorage.removeItem("recentSearches")
    window.location.reload()
  }

  const toggleFavorite = (audioId: string) => {
    let updatedFavorites
    if (favorites.includes(audioId)) {
      updatedFavorites = favorites.filter((id) => id !== audioId)
    } else {
      updatedFavorites = [...favorites, audioId]
    }
    setFavorites(updatedFavorites)
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
  }

  const featuredLocations: FeaturedLocation[] = [
    {
      name: "Central Park, NYC",
      description: "Nature sounds and street musicians in the heart of Manhattan",
      latitude: 40.7812,
      longitude: -73.9665,
      icon: <Globe className="h-8 w-8 text-green-500" />,
    },
    {
      name: "Venice Beach, LA",
      description: "Ocean waves and boardwalk performers",
      latitude: 33.985,
      longitude: -118.4695,
      icon: <Headphones className="h-8 w-8 text-blue-500" />,
    },
    {
      name: "Shibuya Crossing, Tokyo",
      description: "The bustling sounds of the world's busiest intersection",
      latitude: 35.6595,
      longitude: 139.7004,
      icon: <Compass className="h-8 w-8 text-amber-500" />,
    },
  ]

  return (
    <>
      {/* Sidebar Toggle Button (Mobile) */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" className="bg-background" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          bg-background border-r h-full overflow-y-auto transition-all duration-300 ease-in-out
          ${collapsed ? "w-0 md:w-16 p-0" : "w-full md:w-80 p-4"}
        `}
      >
        {!collapsed && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Geo Audio Explorer</h1>
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setCollapsed(true)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Search Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="latitude" className="text-xs">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        placeholder="e.g. 40.7128"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="longitude" className="text-xs">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        placeholder="e.g. -74.0060"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <Label htmlFor="radius">Search Radius</Label>
                      <span>{radius[0]} km</span>
                    </div>
                    <Slider id="radius" min={0.1} max={10} step={0.1} value={radius} onValueChange={setRadius} />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={handleUseCurrentLocation}>
                      <MapPin className="mr-1 h-3 w-3" /> My Location
                    </Button>
                    <Button size="sm" className="flex-1" onClick={handleSearch} disabled={loading}>
                      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="results" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="results">Results</TabsTrigger>
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4 mt-2">
                  {error && <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm">{error}</div>}

                  {audioFiles.length > 0 && (
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{filteredAudioFiles.length} Audio Pins</h3>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredAudioFiles.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No audio pins found</p>
                        <p className="text-sm">Try searching a different location</p>
                      </div>
                    ) : (
                      filteredAudioFiles.map((audio) => (
                        <Card
                          key={audio._id}
                          className={`hover:bg-muted/50 transition-colors ${selectedAudio?._id === audio._id ? "border-primary" : ""}`}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div
                                className="flex items-center gap-2 flex-1 cursor-pointer"
                                onClick={() => setSelectedAudio(audio)}
                              >
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <Play className="h-3 w-3" />
                                </Button>
                                <div>
                                  <h4 className="font-medium text-sm truncate max-w-[120px]">{audio.title}</h4>
                                  <div className="flex items-center gap-1">
                                    {audio.category && (
                                      <Badge variant="outline" className="text-[10px] h-4">
                                        {audio.category}
                                      </Badge>
                                    )}
                                    {audio.isGenerated && (
                                      <Badge variant="secondary" className="text-[10px] h-4">
                                        Generated
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => toggleFavorite(audio._id)}
                                >
                                  <BookmarkPlus
                                    className={`h-3 w-3 ${favorites.includes(audio._id) ? "fill-primary text-primary" : ""}`}
                                  />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {latitude && longitude && (
                    <Button className="w-full" variant="outline" onClick={() => setShowGenerateDialog(true)}>
                      <Mic className="mr-2 h-4 w-4" /> Generate Audio for This Location
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="featured" className="space-y-2 mt-2">
                  {featuredLocations.map((location, index) => (
                    <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent
                        className="p-3 flex items-center gap-3"
                        onClick={() => handleSelectFeaturedLocation(location)}
                      >
                        <div className="flex-shrink-0">{location.icon}</div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-sm">{location.name}</h3>
                          <p className="text-xs text-muted-foreground truncate">{location.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="recent" className="mt-2">
                  {recentSearches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No recent searches</p>
                      <p className="text-sm">Your search history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="sm" onClick={handleClearRecentSearches} className="text-xs h-7">
                          Clear All
                        </Button>
                      </div>
                      {recentSearches.map((search) => (
                        <div
                          key={search.id}
                          className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                          onClick={() => handleSelectRecentSearch(search)}
                        >
                          <div className="flex items-center gap-2">
                            <History className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{search.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(search.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <Button variant="outline" size="sm" className="w-full" onClick={() => setShowWelcome(true)}>
                <Info className="mr-2 h-4 w-4" /> How It Works
              </Button>
            </div>
          </div>
        )}

        {/* Collapsed Sidebar */}
        {collapsed && (
          <div className="hidden md:flex flex-col items-center py-4 gap-4">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
                    <MapPin className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Search</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)}>
                    <Headphones className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Audio Pins</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowWelcome(true)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">How It Works</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </>
  )
}

// Add the missing Mic component
function Mic(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  )
}

