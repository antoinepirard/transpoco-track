"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface GoalCardProps {
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
  onToggle: () => void
}

export function GoalCard({
  title,
  description,
  icon,
  selected,
  onToggle,
}: GoalCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md relative",
        selected && "ring-2 ring-primary border-primary"
      )}
      onClick={onToggle}
    >
      <CardContent className="p-6">
        {/* Selection Indicator */}
        {selected && (
          <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        )}

        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
            selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {icon}
        </div>

        {/* Content */}
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
