"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, Volume1, VolumeX, Share2, BookmarkPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

interface AudioPlayerProps {
  audio: AudioFile
}

export default function AudioPlayer({ audio }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([0.8])

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const audioElement = audioRef.current

    const handleLoadedMetadata = () => {
      if (audioElement) {
        setDuration(audioElement.duration)
      }
    }

    if (audioElement) {
      audioElement.addEventListener("loadedmetadata", handleLoadedMetadata)
      audioElement.volume = volume[0]
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audio.url, volume])

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause()
      cancelAnimationFrame(animationRef.current!)
    } else {
      audioRef.current?.play()
      animationRef.current = requestAnimationFrame(whilePlaying)
    }
    setIsPlaying(!isPlaying)
  }

  const whilePlaying = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      animationRef.current = requestAnimationFrame(whilePlaying)
    }
  }

  const handleTimeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value[0]
      setVolume(value)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const VolumeIcon = () => {
    if (volume[0] === 0) return <VolumeX className="h-4 w-4" />
    if (volume[0] < 0.5) return <Volume1 className="h-4 w-4" />
    return <Volume2 className="h-4 w-4" />
  }

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full flex-shrink-0" onClick={togglePlayPause}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="truncate">
              <span className="font-medium">{audio.title}</span>
              {audio.category && (
                <Badge variant="outline" className="ml-2">
                  {audio.category}
                </Badge>
              )}
              {audio.isGenerated && (
                <Badge variant="secondary" className="ml-2">
                  Generated
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share2 className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <VolumeIcon />
              <Slider className="w-20" min={0} max={1} step={0.01} value={volume} onValueChange={handleVolumeChange} />
            </div>
          </div>
        </div>

        <audio ref={audioRef} src={audio.url} onEnded={() => setIsPlaying(false)} />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground w-8">{formatTime(currentTime)}</span>
          <Slider
            min={0}
            max={duration || 100}
            step={0.01}
            value={[currentTime]}
            onValueChange={(value) => handleTimeChange(value)}
            className="cursor-pointer"
          />
          <span className="text-xs text-muted-foreground w-8">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  )
}

