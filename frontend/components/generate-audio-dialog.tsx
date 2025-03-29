"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GenerateAudioDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (type: string, prompt: string) => void
  isLoading: boolean
  coordinates: {
    latitude: string
    longitude: string
  }
}

export default function GenerateAudioDialog({
  open,
  onOpenChange,
  onGenerate,
  isLoading,
  coordinates,
}: GenerateAudioDialogProps) {
  const [generationType, setGenerationType] = useState("ambient")
  const [generationPrompt, setGenerationPrompt] = useState("")

  const handleGenerate = () => {
    onGenerate(generationType, generationPrompt)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Audio for This Location</DialogTitle>
          <DialogDescription>
            Create a custom audio experience for coordinates: {coordinates.latitude}, {coordinates.longitude}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="audio-type">Audio Type</Label>
            <Select value={generationType} onValueChange={setGenerationType}>
              <SelectTrigger id="audio-type">
                <SelectValue placeholder="Select audio type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ambient">Ambient Sounds</SelectItem>
                <SelectItem value="narration">Narrated Description</SelectItem>
                <SelectItem value="music">Musical Interpretation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want to hear..."
              value={generationPrompt}
              onChange={(e) => setGenerationPrompt(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Add details to customize your generated audio experience</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Audio
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

