"use client"

import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CTABlockProps {
  title: string
  description: string
  icon: React.ReactNode
  actionLabel: string
  completed?: boolean
  onAction: () => void
}

export function CTABlock({
  title,
  description,
  icon,
  actionLabel,
  completed = false,
  onAction,
}: CTABlockProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{title}</h3>
              {completed && (
                <Badge variant="secondary" className="gap-1">
                  <Check className="w-3 h-3" />
                  Done
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <Button
          onClick={onAction}
          variant={completed ? "outline" : "default"}
          className="w-full"
        >
          {actionLabel}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}
