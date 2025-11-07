"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  steps: { label: string; description: string }[]
}

export function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-center gap-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isUpcoming = stepNumber > currentStep

          return (
            <div
              key={stepNumber}
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                isCompleted &&
                  "bg-primary border-primary text-primary-foreground",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isUpcoming && "border-border bg-background text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{stepNumber}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
