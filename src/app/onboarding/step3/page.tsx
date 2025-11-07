"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, MapPin, Route, Upload, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CTABlock } from "@/components/onboarding/CTABlock"
import { useOnboardingStore } from "@/stores/onboardingStore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Step3Page() {
  const router = useRouter()
  const { previousStep, completeOnboarding, goToStep } = useOnboardingStore()

  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [dialogContent, setDialogContent] = useState({
    title: "",
    description: "",
  })

  // Sync the store's currentStep with this page
  useEffect(() => {
    goToStep(3)
  }, [goToStep])

  const handleAction = (actionId: string, title: string) => {
    // Simulate completion
    setCompletedActions([...completedActions, actionId])

    // Show success dialog
    setDialogContent({
      title: `${title} (Demo)`,
      description:
        "This is a prototype. In the full version, you would be able to perform this action here.",
    })
    setShowDialog(true)
  }

  const handleFinish = () => {
    completeOnboarding()
    router.push("/")
  }

  const handleBack = () => {
    previousStep()
    router.push("/onboarding/step2")
  }

  const handleSkip = () => {
    completeOnboarding()
    router.push("/")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Let's set up your fleet</CardTitle>
          <CardDescription>
            Complete these quick actions to get the most out of Transpoco. You
            can also skip and do this later from your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Drivers CTA */}
          <CTABlock
            title="Add Drivers"
            description="Import your drivers from a CSV file or add them manually to start assigning vehicles and tracking performance."
            icon={<Users className="w-6 h-6" />}
            actionLabel="Upload CSV"
            completed={completedActions.includes("drivers")}
            onAction={() => handleAction("drivers", "Add Drivers")}
          />

          {/* Setup Journeys CTA */}
          <CTABlock
            title="Setup Journeys"
            description="Define common routes and journeys for your fleet to enable better tracking and optimization."
            icon={<Route className="w-6 h-6" />}
            actionLabel="Create Journey"
            completed={completedActions.includes("journeys")}
            onAction={() => handleAction("journeys", "Setup Journeys")}
          />

          {/* Setup Locations CTA */}
          <CTABlock
            title="Setup Locations"
            description="Add important locations like depots, warehouses, and customer sites to monitor arrivals and departures."
            icon={<MapPin className="w-6 h-6" />}
            actionLabel="Add Location"
            completed={completedActions.includes("locations")}
            onAction={() => handleAction("locations", "Setup Locations")}
          />
        </CardContent>
      </Card>

      {/* Progress Summary */}
      {completedActions.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Great progress!</p>
                <p className="text-sm text-muted-foreground">
                  You've completed {completedActions.length} of 3 setup actions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
          <Button onClick={handleFinish} size="lg">
            {completedActions.length === 3
              ? "Complete Setup"
              : "Finish & Go to Dashboard"}
          </Button>
        </div>
      </div>

      {/* Demo Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription>{dialogContent.description}</DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button onClick={() => setShowDialog(false)} className="w-full">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
