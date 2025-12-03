'use client';

import { InfoIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export function SpeedingInfoTooltip() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
        >
          <InfoIcon className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">Information about Speeding %</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1">What is Speeding %?</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We receive tracker updates from vehicles every few seconds. If a vehicle
              is above the speed limit when an update comes in, that update is counted
              as <span className="font-medium text-foreground">speeding</span>.
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Speeding %</span> ={' '}
              (speeding updates ÷ all updates while driving)
            </p>
          </div>
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium">For context:</span> If your tracker sends an
              update every 30 seconds, 5% ≈ 9 minutes of speeding for every 3 hours of
              driving.
            </p>
          </div>
          <div className="pt-2 border-t space-y-1.5">
            <p className="text-xs font-medium">Severity levels:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-chart-1" />
                <span>Mild (11-20% over limit)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-chart-2" />
                <span>Moderate (21-30% over limit)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-destructive" />
                <span>Severe (&gt;30% over limit)</span>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
