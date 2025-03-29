"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Headphones, MapPin, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WelcomeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
}

export default function WelcomeDialog({ open, onOpenChange, onComplete }: WelcomeDialogProps) {
  const [step, setStep] = useState(1)

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      onComplete()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Geo Audio Explorer</DialogTitle>
          <DialogDescription>
            Discover and create audio experiences tied to locations around the world
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="bg-primary/10 p-6 rounded-full">
                <Headphones className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center">What are Audio Pins?</h3>
            <p>
              Audio pins are sound recordings attached to specific geographic locations. They capture the unique sounds,
              stories, and atmosphere of places around the world.
            </p>
            <p>
              With Geo Audio Explorer, you can discover audio pins created by others or generate your own audio
              experiences based on any location.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="bg-primary/10 p-6 rounded-full">
                <MapPin className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center">Finding Audio Pins</h3>
            <p>You can discover audio pins in several ways:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Search for a specific location by entering coordinates</li>
              <li>Use your current location to find nearby audio pins</li>
              <li>Explore our featured locations from around the world</li>
              <li>Browse your recent searches to quickly return to places you've explored</li>
            </ul>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="bg-primary/10 p-6 rounded-full">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center">Create Your Own Audio</h3>
            <p>Geo Audio Explorer lets you generate audio experiences for any location.</p>
            <p>
              Simply select a location on the map, click "Generate Audio", and choose what type of audio you want to
              create:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ambient sounds that capture the atmosphere</li>
              <li>Narrated descriptions of the location</li>
              <li>Musical interpretations inspired by the place</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Let's get started by exploring the map and discovering audio pins!
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{step} of 3</span>
            <Button onClick={nextStep}>
              {step < 3 ? (
                <>
                  Next <ChevronRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Get Started"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

