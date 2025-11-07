"use client"

import { useOnboardingStore } from "@/stores/onboardingStore"
import { StepIndicator } from "@/components/onboarding/StepIndicator"

const steps = [
  { label: "Account", description: "Your details" },
  { label: "Goals", description: "What matters" },
  { label: "Setup", description: "Get started" },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentStep = useOnboardingStore((state) => state.currentStep)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome to Transpoco
          </h1>
          <p className="text-muted-foreground">
            Let's get you set up in just a few steps
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={3}
          steps={steps}
        />

        {/* Content */}
        <div className="mt-12">{children}</div>
      </div>
    </div>
  )
}
