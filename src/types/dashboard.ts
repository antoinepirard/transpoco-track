export type Mission =
  | 'fieldService'
  | 'lastMile'
  | 'longHaul'
  | 'construction'
  | 'passenger'
  | 'municipal';

export type PresetType =
  | 'today'
  | 'reliability30d'
  | 'costEfficiency'
  | 'safetyCompliance'
  | 'customerExperience';

export interface DashboardPreset {
  id: string; // `${mission}:${presetType}`
  mission: Mission;
  presetType: PresetType;
  name: string; // human label
  headerKpis: string[]; // identifiers for KPIs
  widgets: string[]; // identifiers for widgets
  exceptions: string[];
  quickActions: string[];
}


