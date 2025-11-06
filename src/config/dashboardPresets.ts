import type { DashboardPreset } from '@/types/dashboard';

export const PRESETS: DashboardPreset[] = [
  {
    id: 'fieldService:today',
    mission: 'fieldService',
    presetType: 'today',
    name: 'Today: SLA & Productivity',
    headerKpis: [
      'onTimePercent',
      'jobsDonePlanned',
      'atRiskNow',
      'firstTimeFixPercent',
    ],
    widgets: [
      'onTimeByHour',
      'opsFunnel',
      'techUtilization',
      'riskMap',
      'durationVsTarget',
    ],
    exceptions: ['lateWindow', 'noAccess', 'missingParts', 'longSiteOverrun'],
    quickActions: ['swapTech', 'reroute', 'notifyCustomer', 'createFollowUp'],
  },
  {
    id: 'lastMile:today',
    mission: 'lastMile',
    presetType: 'today',
    name: 'Today: Promise & Throughput',
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
    exceptions: ['longDwell', 'clusteredFails', 'capacityOverrun'],
    quickActions: ['splitRoute', 'reSequence', 'dropoffWindowSms'],
  },
];


