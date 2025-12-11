'use client';

import { memo, useMemo } from 'react';
import {
  AlertTriangle,
  Radio,
  Database,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  VehicleTco,
  CostDataSourceSummary,
  ComplianceSummary,
} from '@/types/cost';

interface FleetHealthCardProps {
  vehicles: VehicleTco[];
  dataSources: CostDataSourceSummary;
  compliance: ComplianceSummary;
  isLoading?: boolean;
}

interface HealthItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: 'critical' | 'warning' | 'ok';
  action?: React.ReactNode;
}

function HealthItem({
  icon,
  title,
  subtitle,
  status,
  action,
}: HealthItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0">
      <div
        className={cn(
          'flex items-center justify-center h-8 w-8 rounded-full flex-shrink-0',
          status === 'critical' && 'bg-rose-100 text-rose-600',
          status === 'warning' && 'bg-amber-100 text-amber-600',
          status === 'ok' && 'bg-emerald-100 text-emerald-600'
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function TabBadge({
  count,
  variant,
}: {
  count: number;
  variant: 'critical' | 'warning' | 'ok';
}) {
  if (count === 0) return null;
  return (
    <Badge
      variant="outline"
      className={cn(
        'ml-1.5 text-[10px] px-1.5 py-0 h-4',
        variant === 'critical' && 'bg-rose-100 text-rose-700 border-rose-200',
        variant === 'warning' && 'bg-amber-100 text-amber-700 border-amber-200',
        variant === 'ok' && 'bg-emerald-100 text-emerald-700 border-emerald-200'
      )}
    >
      {count}
    </Badge>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse h-full">
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-32" />
        <div className="h-4 bg-muted rounded w-48 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="h-9 bg-muted rounded w-full mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const FleetHealthCard = memo(function FleetHealthCard({
  vehicles,
  dataSources,
  compliance,
  isLoading,
}: FleetHealthCardProps) {
  // Calculate tracking issues (vehicles with low data completeness)
  const trackingIssues = useMemo(() => {
    return vehicles.filter((v) => v.dataCompleteness < 80);
  }, [vehicles]);

  // Calculate data source issues
  const dataSourceIssues = useMemo(() => {
    return dataSources.sources.filter((s) => s.status !== 'connected');
  }, [dataSources.sources]);

  // Calculate compliance issues
  const complianceIssues = useMemo(() => {
    return compliance.items.filter(
      (c) =>
        c.status === 'overdue' ||
        c.status === 'expired' ||
        c.status === 'due-soon'
    );
  }, [compliance.items]);

  // Total issues count
  const totalIssues =
    trackingIssues.length + dataSourceIssues.length + complianceIssues.length;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Fleet Health
              {totalIssues > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalIssues} issues
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Tracking, data sources, and compliance status
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Tabs defaultValue="tracking" className="h-full flex flex-col">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="tracking" className="text-xs">
              <Radio className="h-3.5 w-3.5" />
              Tracking
              <TabBadge
                count={trackingIssues.length}
                variant={trackingIssues.length > 5 ? 'critical' : 'warning'}
              />
            </TabsTrigger>
            <TabsTrigger value="data" className="text-xs">
              <Database className="h-3.5 w-3.5" />
              Data
              <TabBadge
                count={dataSourceIssues.length}
                variant={
                  dataSourceIssues.some((d) => d.status === 'error')
                    ? 'critical'
                    : 'warning'
                }
              />
            </TabsTrigger>
            <TabsTrigger value="compliance" className="text-xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Compliance
              <TabBadge
                count={complianceIssues.length}
                variant={compliance.overdueCount > 0 ? 'critical' : 'warning'}
              />
            </TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="flex-1 overflow-auto mt-3">
            {trackingIssues.length === 0 ? (
              <EmptyState message="All vehicles reporting correctly" />
            ) : (
              <div className="space-y-1">
                {trackingIssues.slice(0, 5).map((vehicle) => (
                  <HealthItem
                    key={vehicle.vehicleId}
                    icon={<Radio className="h-4 w-4" />}
                    title={vehicle.vehicleLabel}
                    subtitle={`${vehicle.dataCompleteness}% data completeness`}
                    status={
                      vehicle.dataCompleteness < 60 ? 'critical' : 'warning'
                    }
                    action={
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                ))}
                {trackingIssues.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{trackingIssues.length - 5} more vehicles with tracking
                    issues
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* Data Sources Tab */}
          <TabsContent value="data" className="flex-1 overflow-auto mt-3">
            {dataSourceIssues.length === 0 ? (
              <EmptyState message="All data sources connected" />
            ) : (
              <div className="space-y-1">
                {dataSourceIssues.map((source) => (
                  <HealthItem
                    key={source.id}
                    icon={
                      source.status === 'error' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )
                    }
                    title={source.label}
                    subtitle={source.description}
                    status={source.status === 'error' ? 'critical' : 'warning'}
                    action={
                      source.actionLabel && (
                        <Badge
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-slate-100"
                        >
                          {source.actionLabel}
                        </Badge>
                      )
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="flex-1 overflow-auto mt-3">
            {complianceIssues.length === 0 ? (
              <EmptyState message="All compliance items up to date" />
            ) : (
              <div className="space-y-1">
                {complianceIssues.slice(0, 5).map((item) => (
                  <HealthItem
                    key={item.id}
                    icon={
                      item.status === 'overdue' || item.status === 'expired' ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )
                    }
                    title={`${item.vehicleLabel}`}
                    subtitle={`${item.label} · ${item.status === 'overdue' || item.status === 'expired' ? `${Math.abs(item.daysUntilDue)} days overdue` : `Due in ${item.daysUntilDue} days`}`}
                    status={
                      item.status === 'overdue' || item.status === 'expired'
                        ? 'critical'
                        : 'warning'
                    }
                    action={
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    }
                  />
                ))}
                {complianceIssues.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{complianceIssues.length - 5} more compliance items
                  </p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
});

FleetHealthCard.displayName = 'FleetHealthCard';

export default FleetHealthCard;
