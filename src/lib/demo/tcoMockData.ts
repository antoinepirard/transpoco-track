import type {
  ActionItem,
  ActionItemsSummary,
  CostDataSourceSummary,
  CostDateRange,
  DataSourceStatus,
  TcoCostBucket,
  TcoCostBucketAmount,
  TcoDashboardData,
  TcoFleetSummary,
  TcoMonthlyTrend,
  TcoOutlier,
  TcoOutlierReason,
  TcoOutlierReasonDetail,
  TcoOutlierSummary,
  VehicleGroup,
  VehicleTco,
} from '@/types/cost';

// ============================================
// Constants and Configuration
// ============================================

const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const VEHICLE_COUNT = 50;
const AVG_MONTHLY_TCO_PER_VEHICLE = 2_850; // EUR
const AVG_KM_PER_VEHICLE = 4_200; // km/month
const AVG_HOURS_PER_VEHICLE = 160; // hours/month

const MONTH_NAMES = [
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

// Cost bucket distribution (percentages that sum to 100%)
const BUCKET_DISTRIBUTION: Record<
  TcoCostBucket,
  { share: number; label: string; color: string }
> = {
  fuel: { share: 0.35, label: 'Fuel', color: '#ef4444' },
  lease: { share: 0.25, label: 'Lease/Finance', color: '#3b82f6' },
  maintenance: { share: 0.18, label: 'Maintenance', color: '#f59e0b' },
  insurance: { share: 0.1, label: 'Insurance', color: '#8b5cf6' },
  tax: { share: 0.05, label: 'Road Tax', color: '#10b981' },
  tolls: { share: 0.03, label: 'Tolls', color: '#6366f1' },
  fines: { share: 0.02, label: 'Fines', color: '#ec4899' },
  parking: { share: 0.01, label: 'Parking', color: '#14b8a6' },
  downtime: { share: 0.01, label: 'Downtime', color: '#64748b' },
  other: { share: 0.0, label: 'Other', color: '#94a3b8' },
};

// Vehicle prefixes by region
const REGION_PREFIXES = [
  'DUB',
  'CORK',
  'GAL',
  'LIM',
  'WAT',
  'KIL',
  'SLI',
  'DRO',
];

// Vehicle types with distribution
const VEHICLE_TYPES: {
  type: VehicleTco['vehicleType'];
  share: number;
  models: string[];
}[] = [
  {
    type: 'van',
    share: 0.6,
    models: ['Transit Custom', 'Sprinter 316', 'Vivaro-e', 'Crafter', 'eVito'],
  },
  {
    type: 'truck',
    share: 0.25,
    models: ['DAF XF', 'Volvo FH', 'Scania R450', 'MAN TGX'],
  },
  { type: 'car', share: 0.12, models: ['Passat', 'Octavia', 'Focus', 'Golf'] },
  { type: 'motorcycle', share: 0.03, models: ['MT-07', 'CB500X'] },
];

// Vehicle groups with distribution and labels
const VEHICLE_GROUPS: {
  id: VehicleGroup;
  label: string;
  share: number;
}[] = [
  { id: 'delivery-vans', label: 'Delivery Vans', share: 0.35 },
  { id: 'service-vehicles', label: 'Service Vehicles', share: 0.25 },
  { id: 'sales-fleet', label: 'Sales Fleet', share: 0.2 },
  { id: 'maintenance-crews', label: 'Maintenance Crews', share: 0.12 },
  { id: 'executive-cars', label: 'Executive Cars', share: 0.08 },
];

// Export vehicle groups for use in filters
export const VEHICLE_GROUP_OPTIONS = VEHICLE_GROUPS.map((g) => ({
  id: g.id,
  label: g.label,
}));

// Driver names pool
const DRIVER_NAMES = [
  'John Murphy',
  "Sean O'Brien",
  'Michael Ryan',
  'Patrick Walsh',
  'David Kelly',
  'Thomas Byrne',
  'James Doyle',
  'Kevin Lynch',
  'Brian McCarthy',
  'Paul Sullivan',
  'Mark Connolly',
  "Stephen O'Connor",
  'Alan Kennedy',
  'Gary Power',
  'Ciaran Nolan',
  'Declan Fitzgerald',
  'Niall Quinn',
  'Owen Brennan',
  'Liam Casey',
  'Conor Gallagher',
  'Aidan Moran',
  'Fergal Healy',
  'Rory Dunne',
  'Eoin Doherty',
  'Shane Reilly',
];

// Data Sources (reuse pattern from cost.ts)
// Use fixed timestamps to avoid hydration mismatch
const DATA_SOURCES: DataSourceStatus[] = [
  {
    id: 'fuelcards',
    label: 'Circle K Fuel Cards',
    description: 'Live fuel card integration',
    status: 'connected',
    lastSync: '2024-12-31T23:55:00.000Z',
    dataCompleteness: 98,
  },
  {
    id: 'leasing',
    label: 'Ayvens Leasing',
    description: 'Lease & depreciation schedules',
    status: 'connected',
    lastSync: '2024-12-31T14:00:00.000Z',
    dataCompleteness: 100,
  },
  {
    id: 'telematics',
    label: 'Transpoco Telematics',
    description: 'Odometer, utilization, idling data',
    status: 'connected',
    lastSync: '2024-12-31T23:58:00.000Z',
    dataCompleteness: 94,
  },
  {
    id: 'maintenance',
    label: 'Fleet Maintenance Portal',
    description: 'Service history & repair invoices',
    status: 'connected',
    lastSync: '2024-12-31T00:00:00.000Z',
    dataCompleteness: 85,
  },
  {
    id: 'insurance',
    label: 'Insurance Claims Feed',
    description: 'Webhook needs reconfiguration',
    status: 'error',
    actionLabel: 'Fix webhook',
    dataCompleteness: 45,
  },
];

// ============================================
// Utility Functions
// ============================================

function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

// Global seeded random for consistent SSR/CSR hydration
let globalSeed = 42;
function seededRandom(): number {
  globalSeed = (globalSeed * 16807) % 2147483647;
  return (globalSeed - 1) / 2147483646;
}

function resetSeed(seed = 42): void {
  globalSeed = seed;
}

function randomBetween(min: number, max: number): number {
  return seededRandom() * (max - min) + min;
}

// ============================================
// Data Generators
// ============================================

function generateCostBreakdown(
  totalTco: number,
  variance = 0.15
): TcoCostBucketAmount[] {
  const buckets: TcoCostBucketAmount[] = [];
  let remaining = totalTco;

  const bucketKeys = Object.keys(BUCKET_DISTRIBUTION) as TcoCostBucket[];

  bucketKeys.forEach((bucket, index) => {
    const config = BUCKET_DISTRIBUTION[bucket];
    const isLast = index === bucketKeys.length - 1;

    // Add variance to the share
    const adjustedShare =
      config.share * (1 + randomBetween(-variance, variance));
    const amount = isLast ? remaining : round(totalTco * adjustedShare, 0);

    if (amount > 0) {
      remaining -= amount;
      buckets.push({
        bucket,
        label: config.label,
        amount: Math.max(0, amount),
        sharePct: round((amount / totalTco) * 100, 1),
        color: config.color,
      });
    }
  });

  // Recalculate percentages to ensure they sum to 100%
  const actualTotal = buckets.reduce((sum, b) => sum + b.amount, 0);
  buckets.forEach((b) => {
    b.sharePct = round((b.amount / actualTotal) * 100, 1);
  });

  return buckets.filter((b) => b.amount > 0);
}

function generateVehicles(): VehicleTco[] {
  const vehicles: VehicleTco[] = [];

  for (let i = 0; i < VEHICLE_COUNT; i++) {
    // Determine vehicle type
    const typeRoll = seededRandom();
    let cumulative = 0;
    let selectedType = VEHICLE_TYPES[0];
    for (const vt of VEHICLE_TYPES) {
      cumulative += vt.share;
      if (typeRoll <= cumulative) {
        selectedType = vt;
        break;
      }
    }

    // Determine vehicle group
    const groupRoll = seededRandom();
    let groupCumulative = 0;
    let selectedGroup = VEHICLE_GROUPS[0];
    for (const vg of VEHICLE_GROUPS) {
      groupCumulative += vg.share;
      if (groupRoll <= groupCumulative) {
        selectedGroup = vg;
        break;
      }
    }

    const region =
      REGION_PREFIXES[Math.floor(seededRandom() * REGION_PREFIXES.length)];
    const vehicleNumber = String(100 + i).padStart(3, '0');
    const vehicleId = `${region}-${vehicleNumber}`;
    const model =
      selectedType.models[
        Math.floor(seededRandom() * selectedType.models.length)
      ];
    const regYear = 2019 + Math.floor(seededRandom() * 6);
    const regLetters = ['D', 'C', 'G', 'L', 'W'][
      Math.floor(seededRandom() * 5)
    ];

    // Generate TCO with some vehicles being outliers
    const isOutlierCandidate = seededRandom() < 0.15; // 15% chance of being an outlier
    const tcoMultiplier = isOutlierCandidate
      ? randomBetween(1.5, 2.8)
      : randomBetween(0.7, 1.3);
    const monthlyTco = round(AVG_MONTHLY_TCO_PER_VEHICLE * tcoMultiplier, 0);

    // Km and hours with correlation to TCO (higher usage = higher cost)
    const usageMultiplier =
      0.6 + (tcoMultiplier - 1) * 0.3 + randomBetween(-0.2, 0.2);
    const totalKm = round(
      AVG_KM_PER_VEHICLE * Math.max(0.3, usageMultiplier),
      0
    );
    const totalHours = round(
      AVG_HOURS_PER_VEHICLE * Math.max(0.3, usageMultiplier),
      0
    );

    const tcoPerKm = round(monthlyTco / totalKm, 2);
    const tcoPerHour = round(monthlyTco / totalHours, 2);

    // Calculate peer group average (based on vehicle type)
    const peerGroupAvgTcoPerKm = round(
      AVG_MONTHLY_TCO_PER_VEHICLE / AVG_KM_PER_VEHICLE,
      2
    );
    const peerGroupMultiple = round(tcoPerKm / peerGroupAvgTcoPerKm, 2);

    // Use seeded random for contract end date offset (days from now)
    const contractEndDays = randomBetween(90, 730);
    // Use a fixed base date to avoid hydration mismatch
    const baseDate = new Date('2025-01-01T00:00:00Z');
    const contractEndDate =
      seededRandom() < 0.7
        ? new Date(baseDate.getTime() + contractEndDays * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        : undefined;

    const vehicle: VehicleTco = {
      vehicleId,
      vehicleLabel: `${model} · ${vehicleId}`,
      registrationNumber: `${regYear}-${regLetters}-${Math.floor(seededRandom() * 90000 + 10000)}`,
      vehicleType: selectedType.type,
      group: selectedGroup.id,
      driver:
        seededRandom() < 0.85
          ? {
              id: `driver-${i}`,
              name: DRIVER_NAMES[
                Math.floor(seededRandom() * DRIVER_NAMES.length)
              ],
            }
          : undefined,
      monthlyTco,
      tcoPerKm,
      tcoPerHour,
      totalKm,
      totalHours,
      utilization: round(randomBetween(45, 95), 0),
      costBreakdown: generateCostBreakdown(monthlyTco),
      tcoTrend: round(randomBetween(-15, 20), 1),
      peerGroupAvgTcoPerKm,
      peerGroupMultiple,
      vehicleAge: Math.floor(randomBetween(6, 72)),
      contractEndDate,
      dataCompleteness: round(randomBetween(75, 100), 0),
    };

    vehicles.push(vehicle);
  }

  // Sort by monthly TCO descending
  return vehicles.sort((a, b) => b.monthlyTco - a.monthlyTco);
}

function generateOutlierReasons(vehicle: VehicleTco): TcoOutlierReasonDetail[] {
  const reasons: TcoOutlierReasonDetail[] = [];
  const excessCost =
    vehicle.monthlyTco - vehicle.peerGroupAvgTcoPerKm * vehicle.totalKm;

  if (excessCost <= 0) return reasons;

  // Analyze cost breakdown to find outlier reasons
  const fuelBucket = vehicle.costBreakdown.find((b) => b.bucket === 'fuel');
  const maintenanceBucket = vehicle.costBreakdown.find(
    (b) => b.bucket === 'maintenance'
  );

  const reasonTypes: {
    reason: TcoOutlierReason;
    condition: boolean;
    contribution: number;
    insight: string;
  }[] = [
    {
      reason: 'high-fuel',
      condition: (fuelBucket?.sharePct ?? 0) > 40,
      contribution: excessCost * 0.35,
      insight:
        'Fuel spend 25% above fleet average. Consider driver coaching on eco-driving.',
    },
    {
      reason: 'high-maintenance',
      condition: (maintenanceBucket?.sharePct ?? 0) > 22,
      contribution: excessCost * 0.25,
      insight:
        'Maintenance costs elevated. Vehicle may need replacement assessment.',
    },
    {
      reason: 'low-utilization',
      condition: vehicle.utilization < 55,
      contribution: excessCost * 0.2,
      insight: `Only ${vehicle.utilization}% utilization. Consider pooling or reassignment.`,
    },
    {
      reason: 'excessive-idling',
      condition: seededRandom() > 0.6,
      contribution: excessCost * 0.15,
      insight: 'High idle time detected. Added €180/month to fuel costs.',
    },
    {
      reason: 'age-related',
      condition: vehicle.vehicleAge > 48,
      contribution: excessCost * 0.15,
      insight: `${Math.floor(vehicle.vehicleAge / 12)} years old. Repair frequency increasing.`,
    },
  ];

  let totalContribution = 0;
  const activeReasons = reasonTypes.filter((r) => r.condition).slice(0, 3); // Max 3 reasons per vehicle

  activeReasons.forEach((r) => {
    totalContribution += r.contribution;
  });

  activeReasons.forEach((r) => {
    reasons.push({
      reason: r.reason,
      label: r.reason
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      contribution: round(r.contribution, 0),
      contributionPct: round((r.contribution / totalContribution) * 100, 0),
      insight: r.insight,
    });
  });

  return reasons;
}

function generateOutliers(vehicles: VehicleTco[]): TcoOutlierSummary {
  const outliers: TcoOutlier[] = [];
  const peerAvgTcoPerKm =
    vehicles.reduce((sum, v) => sum + v.tcoPerKm, 0) / vehicles.length;

  vehicles.forEach((vehicle) => {
    const excessPct =
      ((vehicle.tcoPerKm - peerAvgTcoPerKm) / peerAvgTcoPerKm) * 100;
    const excessCost = vehicle.monthlyTco - peerAvgTcoPerKm * vehicle.totalKm;

    // Only flag as outlier if 50% or more above peer average
    if (excessPct >= 50) {
      const severity: TcoOutlier['severity'] =
        excessPct >= 100 ? 'critical' : excessPct >= 75 ? 'warning' : 'monitor';

      outliers.push({
        vehicle,
        isOutlier: true,
        severity,
        excessCost: round(excessCost, 0),
        excessPct: round(excessPct, 0),
        reasons: generateOutlierReasons(vehicle),
        suggestedAction:
          severity === 'critical'
            ? 'Immediate review recommended'
            : severity === 'warning'
              ? 'Schedule cost review'
              : 'Monitor for next period',
      });
    }
  });

  // Sort outliers by excess cost descending
  outliers.sort((a, b) => b.excessCost - a.excessCost);

  // Calculate top contributors to total fleet TCO
  const totalFleetTco = vehicles.reduce((sum, v) => sum + v.monthlyTco, 0);
  const topContributors = vehicles.slice(0, 10).map((v) => ({
    vehicleId: v.vehicleId,
    vehicleLabel: v.vehicleLabel,
    contribution: v.monthlyTco,
    contributionPct: round((v.monthlyTco / totalFleetTco) * 100, 1),
  }));

  return {
    outliers,
    totalOutlierCount: outliers.length,
    criticalCount: outliers.filter((o) => o.severity === 'critical').length,
    warningCount: outliers.filter((o) => o.severity === 'warning').length,
    totalExcessCost: round(
      outliers.reduce((sum, o) => sum + o.excessCost, 0),
      0
    ),
    topContributors,
  };
}

function generateMonthlyTrend(vehicles: VehicleTco[]): TcoMonthlyTrend[] {
  const trend: TcoMonthlyTrend[] = [];
  // Use fixed base date to avoid hydration mismatch
  const now = new Date('2025-01-01T00:00:00Z');
  const currentTotalTco = vehicles.reduce((sum, v) => sum + v.monthlyTco, 0);

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const month = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;

    // Generate historical data with seasonal variation
    const seasonalFactor =
      1 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.05;
    const trendFactor = 1 + i * 0.015; // Slight upward trend over time
    const totalTco = round((currentTotalTco * seasonalFactor) / trendFactor, 0);
    const vehicleCount = VEHICLE_COUNT - Math.floor(i * 0.5); // Slight fleet growth

    trend.push({
      month,
      totalTco,
      tcoPerKm: round(totalTco / (vehicleCount * AVG_KM_PER_VEHICLE), 2),
      tcoPerVehicle: round(totalTco / vehicleCount, 0),
      vehicleCount,
      breakdown: generateCostBreakdown(totalTco, 0.08), // Less variance in historical data
    });
  }

  return trend;
}

function generateFleetSummary(vehicles: VehicleTco[]): TcoFleetSummary {
  const totalMonthlyTco = vehicles.reduce((sum, v) => sum + v.monthlyTco, 0);
  const totalKm = vehicles.reduce((sum, v) => sum + v.totalKm, 0);
  const totalHours = vehicles.reduce((sum, v) => sum + v.totalHours, 0);
  const activeVehicles = vehicles.filter((v) => v.utilization > 10).length;

  const monthlyTrend = generateMonthlyTrend(vehicles);
  const previousMonth = monthlyTrend[monthlyTrend.length - 2];
  const monthOverMonthChange = previousMonth
    ? round(
        ((totalMonthlyTco - previousMonth.totalTco) / previousMonth.totalTco) *
          100,
        1
      )
    : 0;

  // Calculate YoY if we have enough data
  const yearAgoMonth = monthlyTrend[0];
  const yearOverYearChange = yearAgoMonth
    ? round(
        ((totalMonthlyTco - yearAgoMonth.totalTco) / yearAgoMonth.totalTco) *
          100,
        1
      )
    : 0;

  // Aggregate cost breakdown
  const aggregatedBreakdown: Record<TcoCostBucket, number> = {} as Record<
    TcoCostBucket,
    number
  >;
  vehicles.forEach((v) => {
    v.costBreakdown.forEach((b) => {
      aggregatedBreakdown[b.bucket] =
        (aggregatedBreakdown[b.bucket] ?? 0) + b.amount;
    });
  });

  const costBreakdown: TcoCostBucketAmount[] = Object.entries(
    aggregatedBreakdown
  )
    .map(([bucket, amount]) => ({
      bucket: bucket as TcoCostBucket,
      label: BUCKET_DISTRIBUTION[bucket as TcoCostBucket].label,
      amount: round(amount, 0),
      sharePct: round((amount / totalMonthlyTco) * 100, 1),
      color: BUCKET_DISTRIBUTION[bucket as TcoCostBucket].color,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate data completeness
  const avgCompleteness =
    vehicles.reduce((sum, v) => sum + v.dataCompleteness, 0) / vehicles.length;

  return {
    totalMonthlyTco: round(totalMonthlyTco, 0),
    tcoPerKm: round(totalMonthlyTco / totalKm, 2),
    tcoPerVehicle: round(totalMonthlyTco / vehicles.length, 0),
    tcoPerHour: round(totalMonthlyTco / totalHours, 2),
    totalVehicles: vehicles.length,
    activeVehicles,
    monthOverMonthChange,
    yearOverYearChange,
    costBreakdown,
    monthlyTrend,
    dataCompleteness: round(avgCompleteness, 0),
    dataSourceCount: DATA_SOURCES.filter((s) => s.status === 'connected')
      .length,
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

function buildActionItems(outliers: TcoOutlierSummary): ActionItemsSummary {
  const items: ActionItem[] = [];

  // Add action items for critical outliers
  outliers.outliers
    .filter((o) => o.severity === 'critical')
    .slice(0, 3)
    .forEach((outlier, idx) => {
      items.push({
        id: `tco-outlier-${idx}`,
        type: 'anomaly' as const,
        title: `High TCO: ${outlier.vehicle.vehicleLabel}`,
        description: `TCO ${outlier.excessPct}% above fleet average. €${outlier.excessCost}/mo excess.`,
        priority: 'high' as const,
        createdAt: '2025-01-01T00:00:00.000Z',
        vehicleId: outlier.vehicle.vehicleId,
        vehicleLabel: outlier.vehicle.vehicleLabel,
        actionLabel: 'Review costs',
      });
    });

  // Add data source action
  const errorSources = DATA_SOURCES.filter((s) => s.status === 'error');
  errorSources.forEach((source, idx) => {
    items.push({
      id: `datasource-${idx}`,
      type: 'data-source' as const,
      title: `${source.label} Disconnected`,
      description: source.description,
      priority: 'medium' as const,
      createdAt: '2024-12-31T00:00:00.000Z',
      actionLabel: source.actionLabel,
    });
  });

  return {
    items,
    highPriorityCount: items.filter((i) => i.priority === 'high').length,
    totalCount: items.length,
  };
}

// ============================================
// Main Export Functions
// ============================================

let cachedData: TcoDashboardData | null = null;
let cachedAt = 0;

function buildTcoDashboardData(): TcoDashboardData {
  // Reset seed for consistent data generation across SSR/CSR
  resetSeed(42);

  const vehicles = generateVehicles();
  const fleetSummary = generateFleetSummary(vehicles);
  const outlierSummary = generateOutliers(vehicles);
  const dataSources = buildDataSourceSummary();
  const actionItems = buildActionItems(outlierSummary);

  // Use fixed dates to avoid hydration mismatch
  const end = new Date('2025-01-01T00:00:00Z');
  const start = new Date('2024-12-01T00:00:00Z');

  const dateRange: CostDateRange = {
    label: 'Last 30 days',
    start: start.toISOString(),
    end: end.toISOString(),
  };

  return {
    updatedAt: '2025-01-01T00:00:00.000Z',
    currency: 'EUR',
    dateRange,
    fleetSummary,
    vehicles,
    outlierSummary,
    dataSources,
    actionItems,
  };
}

export function getTcoDashboardDemoData(): TcoDashboardData {
  const now = Date.now();
  if (!cachedData || now - cachedAt > CACHE_TTL_MS) {
    cachedData = buildTcoDashboardData();
    cachedAt = now;
  }
  return cachedData;
}

export function refreshTcoDashboardDemoData(): TcoDashboardData {
  cachedData = null; // Clear cache to force rebuild
  cachedAt = 0;
  return getTcoDashboardDemoData();
}

// Export helper to get formatted currency
export function formatTcoCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTcoNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('en-IE', {
    maximumFractionDigits: decimals,
  }).format(value);
}
