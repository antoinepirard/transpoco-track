// Compliance Types
export type ComplianceStatus = 'ok' | 'due-soon' | 'overdue' | 'expired';

export type ComplianceType =
  | 'nct'
  | 'insurance'
  | 'road-tax'
  | 'service'
  | 'cvrt';

export interface ComplianceItem {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  type: ComplianceType;
  label: string;
  dueDate: string;
  status: ComplianceStatus;
  daysUntilDue: number;
}

export interface ComplianceSummary {
  items: ComplianceItem[];
  overdueCount: number;
  dueSoonCount: number;
}

// Report Types
export type ReportStatus = 'ready' | 'generating' | 'scheduled' | 'attention';

export type ReportType =
  | 'monthly-cost'
  | 'compliance'
  | 'fuel-mileage'
  | 'bik';

export interface FleetReport {
  id: string;
  type: ReportType;
  title: string;
  description: string;
  status: ReportStatus;
  generatedAt?: string;
  scheduledFor?: string;
  attentionCount?: number;
  downloadUrl?: string;
}

export interface ReportsSummary {
  reports: FleetReport[];
}

// Action Item Types
export type ActionItemType =
  | 'compliance'
  | 'anomaly'
  | 'data-source'
  | 'maintenance';

export type ActionItemPriority = 'high' | 'medium' | 'low';

export interface ActionItem {
  id: string;
  type: ActionItemType;
  title: string;
  description: string;
  priority: ActionItemPriority;
  createdAt: string;
  vehicleId?: string;
  vehicleLabel?: string;
  actionLabel?: string;
}

export interface ActionItemsSummary {
  items: ActionItem[];
  highPriorityCount: number;
  totalCount: number;
}

// Existing Types (kept for compatibility)
export interface CostDateRange {
  label: string;
  start: string;
  end: string;
}

export type CostCategory =
  | 'fuel'
  | 'maintenance'
  | 'lease'
  | 'insurance'
  | 'accidents'
  | 'other';

export interface CostBreakdownItem {
  category: CostCategory;
  label: string;
  amount: number;
  deltaPct: number;
  sharePct: number;
  insight?: string;
}

export interface CostTrendPoint {
  label: string;
  value: number;
  deltaPct?: number;
}

export interface CostTcoSummary {
  costPerVehicle: number;
  costPerKm: number;
  totalMonthlyCost: number;
  monthChangePct: number;
  vehiclesTracked: number;
  totalKm: number;
  dataCompleteness: number; // NEW: percentage of verified data
}

export interface CostSavingsSummary {
  verifiedMonthlySavings: number;
  verifiedDescription: string;
}

export type FuelAnomalyType =
  | 'overfill'
  | 'location-mismatch'
  | 'duplicate'
  | 'suspicious-card';

export interface FuelAnomaly {
  id: string;
  vehicleId: string;
  vehicleLabel: string;
  type: FuelAnomalyType;
  description: string;
  impact: number;
  occurredAt: string;
  confidence: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
}

export interface FuelAnomalySummary {
  anomalies: FuelAnomaly[];
  unresolvedCount: number;
}

export type DataSourceStatusType = 'connected' | 'pending' | 'error';

export interface DataSourceStatus {
  id: string;
  label: string;
  description: string;
  status: DataSourceStatusType;
  lastSync?: string;
  actionLabel?: string;
  dataCompleteness?: number;
}

export interface CostDataSourceSummary {
  sources: DataSourceStatus[];
  overallCompleteness: number;
}

// Main Dashboard Data Type
export interface CostDashboardData {
  updatedAt: string;
  currency: string;
  dateRange: CostDateRange;
  tco: CostTcoSummary;
  breakdown: CostBreakdownItem[];
  trend: CostTrendPoint[];
  savings: CostSavingsSummary;
  anomalies: FuelAnomalySummary;
  dataSources: CostDataSourceSummary;
  compliance: ComplianceSummary;
  reports: ReportsSummary;
  actionItems: ActionItemsSummary;
}

// ============================================
// TCO Dashboard Types (v1 + v2)
// ============================================

// Extended cost bucket categories for TCO
export type TcoCostBucket =
  | 'fuel'
  | 'lease'
  | 'maintenance'
  | 'insurance'
  | 'tax'
  | 'tolls'
  | 'fines'
  | 'parking'
  | 'downtime'
  | 'other';

// Cost breakdown per bucket for a vehicle
export interface TcoCostBucketAmount {
  bucket: TcoCostBucket;
  label: string;
  amount: number;
  sharePct: number;
  color: string;
}

// Vehicle-level TCO data
export interface VehicleTco {
  vehicleId: string;
  vehicleLabel: string;
  registrationNumber: string;
  vehicleType: 'truck' | 'van' | 'car' | 'motorcycle';
  driver?: {
    id: string;
    name: string;
  };
  // Monthly TCO metrics
  monthlyTco: number;
  tcoPerKm: number;
  tcoPerHour: number;
  // Usage metrics
  totalKm: number;
  totalHours: number;
  utilization: number; // percentage
  // Cost breakdown
  costBreakdown: TcoCostBucketAmount[];
  // Trend
  tcoTrend: number; // % change vs previous month
  // Peer comparison
  peerGroupAvgTcoPerKm: number;
  peerGroupMultiple: number; // how many times the peer average (e.g., 1.5x, 2.1x)
  // Age and metadata
  vehicleAge: number; // months
  contractEndDate?: string;
  // Data quality
  dataCompleteness: number;
}

// Outlier reason explaining why a vehicle is flagged
export type TcoOutlierReason =
  | 'high-fuel'
  | 'high-maintenance'
  | 'low-utilization'
  | 'excessive-idling'
  | 'high-repairs'
  | 'age-related'
  | 'route-inefficiency';

export interface TcoOutlierReasonDetail {
  reason: TcoOutlierReason;
  label: string;
  contribution: number; // amount this factor contributes to excess cost
  contributionPct: number; // percentage of total excess
  insight: string; // human-readable explanation
}

// Outlier detection result
export interface TcoOutlier {
  vehicle: VehicleTco;
  isOutlier: boolean;
  severity: 'critical' | 'warning' | 'monitor';
  excessCost: number; // how much more than peer group average
  excessPct: number; // percentage above peer group
  reasons: TcoOutlierReasonDetail[];
  suggestedAction?: string;
}

// Monthly TCO trend data point
export interface TcoMonthlyTrend {
  month: string; // e.g., "Jan 2024"
  totalTco: number;
  tcoPerKm: number;
  tcoPerVehicle: number;
  vehicleCount: number;
  breakdown: TcoCostBucketAmount[];
}

// Fleet-level TCO summary
export interface TcoFleetSummary {
  // Headline metrics
  totalMonthlyTco: number;
  tcoPerKm: number;
  tcoPerVehicle: number;
  tcoPerHour: number;
  // Fleet size
  totalVehicles: number;
  activeVehicles: number;
  // Comparison
  monthOverMonthChange: number; // percentage
  yearOverYearChange: number; // percentage
  // Aggregated breakdown
  costBreakdown: TcoCostBucketAmount[];
  // Trend (last 6 months)
  monthlyTrend: TcoMonthlyTrend[];
  // Data quality
  dataCompleteness: number;
  dataSourceCount: number;
}

// Outlier summary for the fleet
export interface TcoOutlierSummary {
  outliers: TcoOutlier[];
  totalOutlierCount: number;
  criticalCount: number;
  warningCount: number;
  totalExcessCost: number;
  topContributors: {
    vehicleId: string;
    vehicleLabel: string;
    contribution: number; // this vehicle's share of total fleet TCO
    contributionPct: number;
  }[];
}

// Complete TCO Dashboard data
export interface TcoDashboardData {
  updatedAt: string;
  currency: string;
  dateRange: CostDateRange;
  // Core TCO data
  fleetSummary: TcoFleetSummary;
  vehicles: VehicleTco[];
  outlierSummary: TcoOutlierSummary;
  // Supporting data (reuse existing types)
  dataSources: CostDataSourceSummary;
  actionItems: ActionItemsSummary;
}
