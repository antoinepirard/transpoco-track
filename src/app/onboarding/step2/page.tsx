"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Target,
  Shield,
  Fuel,
  Route,
  Building2,
  Truck,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GoalCard } from "@/components/onboarding/GoalCard"
import { useOnboardingStore } from "@/stores/onboardingStore"
import {
  detectIndustry,
  getIndustryLabel,
  getVehicleMissionLabel,
} from "@/lib/onboarding/industryDetector"
import type { OnboardingGoal, GoalOption } from "@/types/onboarding"

const goalOptions: GoalOption[] = [
  {
    id: "no-sla-breach",
    label: "No SLA Breach",
    description:
      "Ensure service level agreements are met consistently and avoid penalties",
    icon: "target",
  },
  {
    id: "driver-safety",
    label: "Driver Safety",
    description:
      "Monitor and improve driver safety metrics to reduce accidents and liability",
    icon: "shield",
  },
  {
    id: "fuel-efficiency",
    label: "Fuel Efficiency",
    description:
      "Optimize fuel consumption and reduce operational costs through better routing",
    icon: "fuel",
  },
  {
    id: "route-optimization",
    label: "Route Optimization",
    description:
      "Improve route planning to reduce travel time and increase productivity",
    icon: "route",
  },
]

const iconMap = {
  target: Target,
  shield: Shield,
  fuel: Fuel,
  route: Route,
}

export default function Step2Page() {
  const router = useRouter()
  const { goals, setGoals, toggleGoal, nextStep, previousStep, setCompanyInfo, goToStep } =
    useOnboardingStore()

  const [detectedInfo, setDetectedInfo] = useState<{
    industry: string
    mission: string
    confidence: string
  } | null>(null)

  // Sync the store's currentStep with this page
  useEffect(() => {
    goToStep(2)
  }, [goToStep])

  useEffect(() => {
    // Auto-detect industry based on company name (using "Irish Water" as example)
    const companyName = "Irish Water"
    const detection = detectIndustry(companyName)

    setDetectedInfo({
      industry: getIndustryLabel(detection.industry),
      mission: getVehicleMissionLabel(detection.suggestedMission),
      confidence: detection.confidence,
    })

    // Store in the onboarding state
    setCompanyInfo({
      name: companyName,
      industry: detection.industry,
      detectedIndustry: detection.industry,
      vehicleMission: detection.suggestedMission,
    })
  }, [setCompanyInfo])

  const handleContinue = () => {
    if (goals.length === 0) {
      alert("Please select at least one goal")
      return
    }
    nextStep()
    router.push("/onboarding/step3")
  }

  const handleBack = () => {
    previousStep()
    router.push("/onboarding/step1")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Industry Detection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company Information
          </CardTitle>
          <CardDescription>
            We&apos;ve automatically detected your industry based on your company
            profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detectedInfo && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-semibold">{detectedInfo.industry}</p>
                </div>
                <Badge variant="secondary">
                  {detectedInfo.confidence === "high"
                    ? "Auto-detected"
                    : "Suggested"}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    Vehicle Mission
                  </p>
                  <p className="font-semibold">{detectedInfo.mission}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goals Selection */}
      <Card>
        <CardHeader>
          <CardTitle>What are your primary goals?</CardTitle>
          <CardDescription>
            Select one or more goals that matter most to your fleet operations.
            This helps us customize your dashboard and recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalOptions.map((goal) => {
              const Icon = iconMap[goal.icon as keyof typeof iconMap]
              return (
                <GoalCard
                  key={goal.id}
                  title={goal.label}
                  description={goal.description}
                  icon={<Icon className="w-6 h-6" />}
                  selected={goals.includes(goal.id)}
                  onToggle={() => toggleGoal(goal.id)}
                />
              )
            })}
          </div>

          {goals.length === 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-muted/50 text-muted-foreground text-sm">
              <AlertCircle className="w-4 h-4" />
              Please select at least one goal to continue
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleContinue} size="lg" disabled={goals.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  )
}
