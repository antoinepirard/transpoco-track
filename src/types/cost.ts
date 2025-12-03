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
