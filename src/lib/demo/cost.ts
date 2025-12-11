import type {
  ActionItem,
  ActionItemsSummary,
  ComplianceItem,
  ComplianceSummary,
  CostBreakdownItem,
  CostDashboardData,
  CostDataSourceSummary,
  CostSavingsSummary,
  CostTrendPoint,
  DataSourceStatus,
  FleetReport,
  FuelAnomaly,
  FuelAnomalySummary,
  ReportsSummary,
} from '@/types/cost';

const BASE_TOTAL_COST = 428_000;
const BASE_VEHICLE_COUNT = 146;
const BASE_TOTAL_KM = 612_000;
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const CATEGORY_SPLITS: Record<CostBreakdownItem['category'], number> = {
  fuel: 0.42,
  maintenance: 0.22,
  lease: 0.18,
  insurance: 0.09,
  accidents: 0.06,
  other: 0.03,
};

// Data Sources with completeness metrics
const DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'fuelcards',
    label: 'Circle K Fuel Cards',
    description: 'Live fuel card integration (transactions every 15 min)',
    status: 'connected',
    lastSync: '2025-12-03T08:10:00.000Z',
    dataCompleteness: 98,
  },
  {
    id: 'leasing',
    label: 'Ayvens Leasing',
    description: 'Lease & depreciation schedules',
    status: 'connected',
    lastSync: '2025-12-02T22:45:00.000Z',
    dataCompleteness: 100,
  },
  {
    id: 'telematics',
    label: 'Transpoco Telematics',
    description: 'Idling, utilization, odometer mileage',
    status: 'connected',
    lastSync: '2025-12-03T08:15:00.000Z',
    dataCompleteness: 94,
  },
  {
    id: 'invoices',
    label: 'Maintenance Invoices Inbox',
    description: 'Awaiting first scanned invoice upload',
    status: 'pending',
    actionLabel: 'Upload invoice',
    dataCompleteness: 0,
  },
  {
    id: 'insurance',
    label: 'Insurance Claims Feed',
    description: 'Webhook misconfigured – needs attention',
    status: 'error',
    actionLabel: 'Fix webhook',
    dataCompleteness: 45,
  },
];

// Compliance items
const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: 'comp-001',
    vehicleId: 'DUB-204',
    vehicleLabel: 'Sprinter 316CDI · DUB-204',
    type: 'nct',
    label: 'NCT Due',
    dueDate: '2025-12-08',
    status: 'due-soon',
    daysUntilDue: 5,
  },
  {
    id: 'comp-002',
    vehicleId: 'CORK-118',
    vehicleLabel: 'Vivaro-e · CORK-118',
    type: 'insurance',
    label: 'Insurance Renewal',
    dueDate: '2025-12-15',
    status: 'due-soon',
    daysUntilDue: 12,
  },
  {
    id: 'comp-003',
    vehicleId: 'LIM-077',
    vehicleLabel: 'Transit Custom · LIM-077',
    type: 'road-tax',
    label: 'Road Tax',
    dueDate: '2025-11-30',
    status: 'overdue',
    daysUntilDue: -3,
  },
  {
    id: 'comp-004',
    vehicleId: 'BEL-033',
    vehicleLabel: 'eVito · BEL-033',
    type: 'service',
    label: 'Service Due',
    dueDate: '2025-12-20',
    status: 'due-soon',
    daysUntilDue: 17,
  },
  {
    id: 'comp-005',
    vehicleId: 'GAL-022',
    vehicleLabel: 'Crafter · GAL-022',
    type: 'cvrt',
    label: 'CVRT Test',
    dueDate: '2025-11-28',
    status: 'expired',
    daysUntilDue: -5,
  },
  {
    id: 'comp-006',
    vehicleId: 'DUB-301',
    vehicleLabel: 'Transit · DUB-301',
    type: 'nct',
    label: 'NCT Due',
    dueDate: '2026-02-15',
    status: 'ok',
    daysUntilDue: 74,
  },
  {
    id: 'comp-007',
    vehicleId: 'CORK-205',
    vehicleLabel: 'Sprinter · CORK-205',
    type: 'insurance',
    label: 'Insurance Renewal',
    dueDate: '2026-01-31',
    status: 'ok',
    daysUntilDue: 59,
  },
];

// Fleet Reports
const FLEET_REPORTS: FleetReport[] = [
  {
    id: 'report-001',
    type: 'monthly-cost',
    title: 'Monthly Fleet Cost Summary',
    description: 'November 2025 – all cost centers',
    status: 'ready',
    generatedAt: '2025-12-01T06:00:00.000Z',
    downloadUrl: '#',
  },
  {
    id: 'report-002',
    type: 'compliance',
    title: 'Compliance Status Report',
    description: 'NCT, insurance, road tax, CVRT status',
    status: 'attention',
    generatedAt: '2025-12-03T06:00:00.000Z',
    attentionCount: 2,
    downloadUrl: '#',
  },
  {
    id: 'report-003',
    type: 'fuel-mileage',
    title: 'Fuel & Mileage Report',
    description: 'Last 30 days consumption and distance',
    status: 'ready',
    generatedAt: '2025-12-03T06:00:00.000Z',
    downloadUrl: '#',
  },
  {
    id: 'report-004',
    type: 'bik',
    title: 'Benefit in Kind Report',
    description: 'December 2025 – scheduled',
    status: 'scheduled',
    scheduledFor: '2025-12-31T06:00:00.000Z',
  },
];

// Fuel Anomalies (kept from original)
const FUEL_ANOMALIES: FuelAnomaly[] = [
  {
    id: 'anom-001',
    vehicleId: 'DUB-117',
    vehicleLabel: 'Transit Custom · DUB-117',
    type: 'overfill',
    description: '78L fill on 65L tank (Circle K Navan Road)',
    impact: 86,
    occurredAt: '2025-12-02T06:40:00.000Z',
    confidence: 'high',
    status: 'open',
  },
  {
    id: 'anom-002',
    vehicleId: 'BEL-033',
    vehicleLabel: 'eVito · BEL-033',
    type: 'location-mismatch',
    description: 'Card charged in Belfast while van in Dublin depot',
    impact: 112,
    occurredAt: '2025-12-01T21:18:00.000Z',
    confidence: 'medium',
    status: 'investigating',
  },
  {
    id: 'anom-003',
    vehicleId: 'POOL-004',
    vehicleLabel: 'Pool Vehicle · HQ',
    type: 'duplicate',
    description: 'Back-to-back fill within 12 minutes',
    impact: 44,
    occurredAt: '2025-11-30T11:05:00.000Z',
    confidence: 'medium',
    status: 'open',
  },
];

// Action Items (combined from anomalies, compliance, and data sources)
function buildActionItems(): ActionItemsSummary {
  const items: ActionItem[] = [
    // Compliance actions
    {
      id: 'action-001',
      type: 'compliance',
      title: 'Road Tax Overdue',
      description: 'Transit Custom · LIM-077 – road tax expired 3 days ago',
      priority: 'high',
      createdAt: '2025-11-30T00:00:00.000Z',
      vehicleId: 'LIM-077',
      vehicleLabel: 'Transit Custom · LIM-077',
      actionLabel: 'Renew now',
    },
    {
      id: 'action-002',
      type: 'compliance',
      title: 'CVRT Test Expired',
      description: 'Crafter · GAL-022 – CVRT expired 5 days ago',
      priority: 'high',
      createdAt: '2025-11-28T00:00:00.000Z',
      vehicleId: 'GAL-022',
      vehicleLabel: 'Crafter · GAL-022',
      actionLabel: 'Book test',
    },
    // Anomaly actions
    {
      id: 'action-003',
      type: 'anomaly',
      title: 'Fuel Card Mismatch',
      description: 'eVito · BEL-033 – card charged in wrong location',
      priority: 'medium',
      createdAt: '2025-12-01T21:18:00.000Z',
      vehicleId: 'BEL-033',
      vehicleLabel: 'eVito · BEL-033',
      actionLabel: 'Investigate',
    },
    {
      id: 'action-004',
      type: 'anomaly',
      title: 'Suspicious Overfill',
      description: 'Transit Custom · DUB-117 – 78L on 65L tank',
      priority: 'medium',
      createdAt: '2025-12-02T06:40:00.000Z',
      vehicleId: 'DUB-117',
      vehicleLabel: 'Transit Custom · DUB-117',
      actionLabel: 'Review',
    },
    // Data source actions
    {
      id: 'action-005',
      type: 'data-source',
      title: 'Insurance Feed Disconnected',
      description: 'Webhook misconfigured – claims data incomplete',
      priority: 'medium',
      createdAt: '2025-12-01T00:00:00.000Z',
      actionLabel: 'Fix webhook',
    },
    {
      id: 'action-006',
      type: 'data-source',
      title: 'Invoices Not Connected',
      description: 'Upload maintenance invoices to complete cost tracking',
      priority: 'low',
      createdAt: '2025-11-15T00:00:00.000Z',
      actionLabel: 'Upload invoice',
    },
    // Maintenance actions
    {
      id: 'action-007',
      type: 'maintenance',
      title: 'NCT Due Soon',
      description: 'Sprinter 316CDI · DUB-204 – NCT due in 5 days',
      priority: 'medium',
      createdAt: '2025-12-03T00:00:00.000Z',
      vehicleId: 'DUB-204',
      vehicleLabel: 'Sprinter 316CDI · DUB-204',
      actionLabel: 'Schedule',
    },
  ];

  const highPriorityCount = items.filter((i) => i.priority === 'high').length;

  return {
    items,
    highPriorityCount,
    totalCount: items.length,
  };
}

let cachedData: CostDashboardData | null = null;
let cachedAt = 0;

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function buildBreakdown(total: number): CostBreakdownItem[] {
  return (Object.keys(CATEGORY_SPLITS) as CostBreakdownItem['category'][]).map(
    (category) => {
      const share = CATEGORY_SPLITS[category];
      const amount = total * share;
      const variance = (Math.sin(amount) * 2) / 100;
      return {
        category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
        amount: round(amount, 0),
        deltaPct: round(variance, 2),
        sharePct: round(share * 100, 1),
        insight:
          category === 'fuel'
            ? 'Idling accounts for 18% of fuel spend'
            : category === 'maintenance'
              ? 'Mobile tyre vendor quotes 12% cheaper'
              : undefined,
      };
    }
  );
}

function buildTrend(total: number): CostTrendPoint[] {
  // Use fixed base date to avoid hydration mismatch
  const now = new Date('2025-01-01T00:00:00Z');
  return Array.from({ length: 6 }).map((_, idx) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - (5 - idx));
    const month = monthNames[date.getMonth()];
    const jitter = ((idx - 2) * 0.7) / 100;
    const value = total * (1 + jitter);
    return {
      label: month,
      value: round(value, 0),
      deltaPct: idx === 5 ? round(jitter * 100, 1) : undefined,
    };
  });
}

function buildSavingsSummary(): CostSavingsSummary {
  return {
    verifiedMonthlySavings: 1240,
    verifiedDescription:
      'Reduced depot idling by 18% and consolidated tyre supplier contract',
  };
}

function buildAnomaliesSummary(): FuelAnomalySummary {
  return {
    anomalies: FUEL_ANOMALIES,
    unresolvedCount: FUEL_ANOMALIES.filter(
      (anomaly) => anomaly.status !== 'resolved'
    ).length,
  };
}

function buildDataSourceSummary(): CostDataSourceSummary {
  const connectedSources = DATA_SOURCES.filter((s) => s.status === 'connected');
  const totalCompleteness =
    connectedSources.reduce((sum, s) => sum + (s.dataCompleteness ?? 0), 0) /
    Math.max(connectedSources.length, 1);

  return {
    sources: DATA_SOURCES,
    overallCompleteness: round(totalCompleteness, 0),
  };
}

function buildComplianceSummary(): ComplianceSummary {
  const overdueCount = COMPLIANCE_ITEMS.filter(
    (c) => c.status === 'overdue' || c.status === 'expired'
  ).length;
  const dueSoonCount = COMPLIANCE_ITEMS.filter(
    (c) => c.status === 'due-soon'
  ).length;

  return {
    items: COMPLIANCE_ITEMS,
    overdueCount,
    dueSoonCount,
  };
}

function buildReportsSummary(): ReportsSummary {
  return {
    reports: FLEET_REPORTS,
  };
}

function buildCostDashboardData(): CostDashboardData {
  // Use fixed multiplier to avoid hydration mismatch (no Date.now())
  const totalCost = BASE_TOTAL_COST * 1.005;
  const breakdown = buildBreakdown(totalCost);
  const trend = buildTrend(totalCost);
  const savings = buildSavingsSummary();
  const anomalies = buildAnomaliesSummary();
  const dataSources = buildDataSourceSummary();
  const compliance = buildComplianceSummary();
  const reports = buildReportsSummary();
  const actionItems = buildActionItems();

  // Use fixed dates to avoid hydration mismatch
  const end = new Date('2025-01-01T00:00:00Z');
  const start = new Date('2024-12-01T00:00:00Z');

  return {
    updatedAt: '2025-01-01T00:00:00.000Z',
    currency: 'EUR',
    dateRange: {
      label: 'Last 30 days',
      start: start.toISOString(),
      end: end.toISOString(),
    },
    tco: {
      costPerVehicle: round(totalCost / BASE_VEHICLE_COUNT, 0),
      costPerKm: round(totalCost / BASE_TOTAL_KM, 2),
      totalMonthlyCost: round(totalCost, 0),
      monthChangePct: trend.at(-1)?.deltaPct ?? 0,
      vehiclesTracked: BASE_VEHICLE_COUNT,
      totalKm: BASE_TOTAL_KM,
      dataCompleteness: dataSources.overallCompleteness,
    },
    breakdown,
    trend,
    savings,
    anomalies,
    dataSources,
    compliance,
    reports,
    actionItems,
  };
}

export function getCostDashboardDemoData(): CostDashboardData {
  const now = Date.now();
  if (!cachedData || now - cachedAt > CACHE_TTL_MS) {
    cachedData = buildCostDashboardData();
    cachedAt = now;
  }
  return cachedData;
}

export function refreshCostDashboardDemoData(): CostDashboardData {
  cachedData = null;
  cachedAt = 0;
  return getCostDashboardDemoData();
}
