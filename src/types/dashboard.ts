export type Mission =
  | 'fieldService'
  | 'lastMile'
  | 'longHaul'
  | 'construction'
  | 'passenger'
  | 'municipal';

export type PresetKey =
  // Field Service
  | 'slaProductivity'
  | 'repeatRiskQuality'
  // Last-Mile
  | 'promiseThroughput'
  | 'costPerStop'
  // Long-Haul
  | 'complianceFirstOps'
  | 'networkReliability'
  // Construction
  | 'siteControlUtilization'
  | 'securityTheft'
  // Passenger
  | 'serviceAdherence'
  | 'dutyOfCareSafety'
  // Municipal
  | 'coverageQuality'
  | 'costProductivity';

export interface DashboardPreset {
  id: string; // `${mission}:${presetKey}`
  mission: Mission;
  presetKey: PresetKey;
  name: string; // human label
  description: string;
  isDefault?: boolean;
  headerKpis: string[]; // identifiers for KPIs
  widgets: string[]; // identifiers for widgets
  exceptions?: string[];
  quickActions?: string[];
}


