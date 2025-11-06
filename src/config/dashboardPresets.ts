import type { DashboardPreset } from '@/types/dashboard';

export const PRESETS: DashboardPreset[] = [
  // Field Service vans
  {
    id: 'fieldService:slaProductivity',
    mission: 'fieldService',
    presetKey: 'slaProductivity',
    name: 'SLA & Productivity',
    description:
      'On-time %, Jobs done/planned, At-risk now, First-time-fix %, Wrench:Drive, Avg response.',
    isDefault: true,
    headerKpis: [
      'onTimePercent',
      'jobsDonePlanned',
      'atRiskNow',
      'firstTimeFixPercent',
      'wrenchDriveRatio',
      'avgResponseTime',
    ],
    widgets: [
      'onTimeByHour',
      'opsFunnel',
      'techUtilization',
      'riskMap',
      'durationVsTarget',
    ],
  },
  {
    id: 'fieldService:repeatRiskQuality',
    mission: 'fieldService',
    presetKey: 'repeatRiskQuality',
    name: 'Repeat Risk & Quality',
    description:
      'Repeat rate, FTF %, Parts availability %, Proof completeness, CSAT.',
    headerKpis: [
      'repeatRate',
      'firstTimeFixPercent',
      'partsAvailabilityPercent',
      'proofCompleteness',
      'csat',
    ],
    widgets: [
      'repeatsByServiceType',
      'partStockouts',
      'proofChecklist',
      'csatTrend',
    ],
  },

  // Last-mile / Parcel
  {
    id: 'lastMile:promiseThroughput',
    mission: 'lastMile',
    presetKey: 'promiseThroughput',
    name: 'Promise & Throughput',
    description:
      'On-time %, Stops completed, Stops/hr, km/stop, First-attempt %.',
    isDefault: true,
    headerKpis: [
      'onTimePercent',
      'stopsCompleted',
      'stopsPerHour',
      'kmPerStop',
      'firstAttemptSuccess',
    ],
    widgets: [
      'routeLeaderboard',
      'onTimeByWave',
      'failedAttemptsHeatmap',
      'distanceVsPlanned',
      'commsCoverage',
    ],
  },
  {
    id: 'lastMile:costPerStop',
    mission: 'lastMile',
    presetKey: 'costPerStop',
    name: 'Cost per Stop',
    description:
      'Cost/stop, Overtime forecast, Fuel/Energy per route, Reattempt rate.',
    headerKpis: [
      'costPerStop',
      'overtimeForecast',
      'energyPerRoute',
      'reattemptRate',
    ],
    widgets: [
      'costScatter',
      'overtimeGauge',
      'reattemptHotspots',
      'energyTrend',
    ],
  },

  // Long-haul / Linehaul
  {
    id: 'longHaul:complianceFirstOps',
    mission: 'longHaul',
    presetKey: 'complianceFirstOps',
    name: 'Compliance-First Ops',
    description:
      'HOS/tacho violations, On-time arrivals, Avg dwell, Fuel L/100 km, Idling %.',
    isDefault: true,
    headerKpis: [
      'hosViolations',
      'onTimeArrivals',
      'avgDwell',
      'fuelPer100km',
      'idlingPercent',
    ],
    widgets: [
      'violationTimeline',
      'etaVsDockSlot',
      'dwellBySite',
      'fuelVsPayload',
      'activeFaultCodes',
    ],
  },
  {
    id: 'longHaul:networkReliability',
    mission: 'longHaul',
    presetKey: 'networkReliability',
    name: 'Network Reliability',
    description: 'Late/early to slot, Queue time, Detention cost.',
    headerKpis: [
      'lateEarlyToSlot',
      'queueTime',
      'detentionCost',
    ],
    widgets: [
      'terminalScorecard',
      'laneReliability',
      'detentionTrend',
    ],
  },

  // Construction & Plant (mixed assets)
  {
    id: 'construction:siteControlUtilization',
    mission: 'construction',
    presetKey: 'siteControlUtilization',
    name: 'Site Control & Utilization',
    description:
      'Sites active, Assets utilized %, PTO hours vs plan, Out-of-hours alerts, Incidents.',
    isDefault: true,
    headerKpis: [
      'activeSites',
      'assetsUtilizedPercent',
      'ptoHoursVsPlan',
      'outOfHoursAlerts',
      'incidentsToday',
    ],
    widgets: [
      'siteBoard',
      'utilizationByClass',
      'ptoVsNonPto',
      'geofenceBreaches',
      'permitProofCompletion',
    ],
  },
  {
    id: 'construction:securityTheft',
    mission: 'construction',
    presetKey: 'securityTheft',
    name: 'Security & Theft',
    description: 'Out-of-hours movements, Recovery rate, Immobilizations.',
    headerKpis: [
      'outOfHoursMovements',
      'recoveryRate',
      'immobilizations',
    ],
    widgets: [
      'alertTimeline',
      'hotspotMap',
      'chainOfCustodyList',
    ],
  },

  // Passenger transport / Shuttle
  {
    id: 'passenger:serviceAdherence',
    mission: 'passenger',
    presetKey: 'serviceAdherence',
    name: 'Service Adherence',
    description:
      'Trips on-schedule %, Early/Late count, Headway deviation, Incidents, Complaints.',
    isDefault: true,
    headerKpis: [
      'onScheduleTripsPercent',
      'earlyLateCount',
      'headwayDeviation',
      'incidents',
      'complaints',
    ],
    widgets: [
      'headwayVariance',
      'earlyLateHeatmap',
      'incidentLog',
      'capacityByTrip',
      'missedBoardings',
    ],
  },
  {
    id: 'passenger:dutyOfCareSafety',
    mission: 'passenger',
    presetKey: 'dutyOfCareSafety',
    name: 'Duty of Care & Safety',
    description: 'Events/1 000 km, Hard braking, Speeding, Training overdue.',
    headerKpis: [
      'eventsPer1000km',
      'hardBraking',
      'speeding',
      'trainingOverdue',
    ],
    widgets: [
      'safetyTrend',
      'driverLeaderboard',
      'trainingCompliance',
    ],
  },

  // Municipal services (waste, sweepers)
  {
    id: 'municipal:coverageQuality',
    mission: 'municipal',
    presetKey: 'coverageQuality',
    name: 'Coverage & Quality',
    description:
      'Coverage %, Missed points, Complaints, Fuel per round, Idling %.',
    isDefault: true,
    headerKpis: [
      'coveragePercent',
      'missedPoints',
      'complaints',
      'fuelPerRound',
      'idlingPercent',
    ],
    widgets: [
      'coverageMap',
      'missedPickupsByStreet',
      'overtimeGauge',
      'fuelEmissionsTrend',
      'repeatComplaintPins',
    ],
  },
  {
    id: 'municipal:costProductivity',
    mission: 'municipal',
    presetKey: 'costProductivity',
    name: 'Cost & Productivity',
    description: 'Cost/round, km/segment, Stops/hr.',
    headerKpis: [
      'costPerRound',
      'kmPerSegment',
      'stopsPerHour',
    ],
    widgets: [
      'routeCostBoard',
      'segmentProductivity',
      'varianceVsPlan',
    ],
  },
];


