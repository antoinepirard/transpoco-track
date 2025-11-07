"use client"

import { useState } from "react"
import {
  Sparkles,
  Map,
  BarChart3,
  Settings,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useOnboardingStore } from "@/stores/onboardingStore"

interface WelcomeModalProps {
  open: boolean
  onClose: () => void
}

const tips = [
  {
    icon: Map,
    title: "Live Fleet Map",
    description:
      "View all your vehicles in real-time on the interactive map. Click any vehicle for detailed information.",
  },
  {
    icon: BarChart3,
    title: "Custom Dashboards",
    description:
      "Create personalized dashboards with widgets that matter to you. Drag and drop to rearrange.",
  },
  {
    icon: Settings,
    title: "Smart Alerts",
    description:
      "Set up notifications for SLA breaches, speeding, idling, and more. Stay informed without constantly checking.",
  },
  {
    icon: Lightbulb,
    title: "AI Insights",
    description:
      "Get AI-powered recommendations to optimize routes, reduce fuel consumption, and improve safety.",
  },
]

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const { markWelcomeAsSeen, accountInfo } = useOnboardingStore()
  const [currentTip, setCurrentTip] = useState(0)

  const handleClose = () => {
    markWelcomeAsSeen()
    onClose()
  }

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1)
    } else {
      handleClose()
    }
  }

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1)
    }
  }

  const CurrentIcon = tips[currentTip].icon

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-2xl">
                Welcome to Transpoco
                {accountInfo?.firstName && `, ${accountInfo.firstName}`}!
              </DialogTitle>
              <DialogDescription>
                Here are some tips to help you get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* Tip Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CurrentIcon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {tips[currentTip].title}
                  </h3>
                  <p className="text-muted-foreground">
                    {tips[currentTip].description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentTip
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentTip === 0}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentTip + 1} of {tips.length}
          </span>

          <Button onClick={handleNext}>
            {currentTip === tips.length - 1 ? (
              <>
                Get Started
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
