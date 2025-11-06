// Field Service Domain Types

export type JobPriority = 'low' | 'medium' | 'high' | 'critical';
export type JobStatus = 'planned' | 'dispatched' | 'en-route' | 'arrived' | 'in-progress' | 'completed' | 'cancelled';
export type ServiceType = 'installation' | 'repair' | 'maintenance' | 'inspection' | 'emergency';
export type CustomerTier = 'standard' | 'premium' | 'vip';

export interface Customer {
  id: string;
  name: string;
  businessType: string; // Restaurant, Office, Retail, etc.
  tier: CustomerTier;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  accountAge: number; // months as customer
  isRepeatCustomer: boolean;
  accessInstructions?: string;
  preferredContactMethod: 'phone' | 'sms' | 'email';
  businessHours?: string;
}

export interface Job {
  id: string;
  customer: Customer;
  serviceType: ServiceType;
  priority: JobPriority;
  status: JobStatus;

  // Job Details
  title: string; // "Commercial cooler losing temperature"
  description: string; // Customer's reported problem
  diagnosisNotes?: string; // Technician's findings

  // SLA window
  windowStart: Date;
  windowEnd: Date;
  plannedDuration: number; // minutes
  complexity: 'simple' | 'standard' | 'complex';

  // Assignment
  assignedTechId?: string;
  assignedVehicleId?: string;

  // Tracking
  dispatchedAt?: Date;
  arrivedAt?: Date;
  completedAt?: Date;
  estimatedArrival?: Date;

  // Requirements
  requiredSkills: string[];
  requiredParts?: string[];
  equipmentAge?: number; // years, affects failure likelihood

  // Outcome
  outcome?: ServiceOutcome;

  // Communication
  specialInstructions?: string;
  customerNotified?: boolean;

  // Metadata
  createdAt: Date;
  isEmergency: boolean;
  isFollowUp: boolean;
  previousJobId?: string;
}

export interface ServiceOutcome {
  status: 'completed' | 'partial' | 'failed';
  revisitRequired: boolean;
  revisitReason?: string;
  workCompleted: string; // Detailed description
  partsUsed: Array<{ name: string; quantity: number; sku?: string }>;
  failureReason?: string; // If failed: "Customer not home", "Wrong parts", etc.

  // Proof
  photos?: string[];
  signature?: string;
  technicianNotes?: string;
  completedAt: Date;

  // Recommendations
  futureWorkRecommended?: string;
  warrantyInfo?: string;

  // Satisfaction (if available)
  customerSatisfaction?: number; // 1-5 rating
  customerFeedback?: string;
}

export interface Technician {
  id: string;
  name: string;
  skills: string[];
  vehicleId: string;

  // Profile
  experienceLevel: 'junior' | 'senior' | 'master';
  certifications: string[];
  specialization?: string; // Primary area of expertise

  // Performance
  avgCompletionTime: number; // minutes
  customerRating: number; // 1-5
  firstTimeFixRate: number; // percentage

  // Current location
  latitude: number;
  longitude: number;
  currentLocation?: string; // "On-site at customer", "In transit", "At depot"

  // Stats for today
  assignedJobs: string[]; // job IDs
  completedJobs: string[]; // job IDs
  onSiteMinutes: number;
  drivingMinutes: number;
  idleMinutes: number;

  // Status
  status: 'available' | 'busy' | 'offline' | 'break';
  currentJobId?: string;
  statusDetail?: string; // "Stuck in traffic", "Waiting for parts", etc.

  // Schedule
  shiftStart: Date;
  shiftEnd: Date;
  breakTime?: { start: Date; end: Date };
}

export interface Assignment {
  jobId: string;
  techId: string;
  vehicleId: string;
  assignedAt: Date;

  // Route planning
  plannedRouteOrder: number;
  estimatedDriveMinutes: number;
  estimatedArrival: Date;
}

// KPI Aggregations
export interface FieldServiceStats {
  // Header KPIs
  onTimeArrivalPercent: number;
  onTimeArrivalTrend: number; // vs 7-day avg (positive = improvement)

  jobsDone: number;
  jobsPlanned: number;
  jobsForecastEOD: number;

  atRiskCount: number; // jobs with ETA beyond window in next 60min

  firstTimeFixPercent: number;

  wrenchMinutes: number;
  driveMinutes: number;
  wrenchToDriveRatio: number;

  avgResponseTimeMinutes: number;

  // Additional metrics
  repeatRate: number; // % of jobs requiring revisit
  avgJobDuration: number;
  slaBreachCount: number;

  // Hourly breakdown for charts
  onTimeByHour: { hour: number; percent: number }[];
  
  // Weekly breakdown for charts
  onTimeByWeek: OnTimeByWeekData[];

  // Ops funnel
  funnel: {
    planned: number;
    dispatched: number;
    arrived: number;
    completed: number;
  };
}

// Risk assessment
export interface JobRisk {
  jobId: string;
  riskScore: number; // 0-100 (higher = more at risk)
  riskFactors: string[];
  minutesLate: number;
  recommendedAction: 'monitor' | 'reassign' | 'notify' | 'escalate';
}

// Chart data types
export interface OnTimeByHourData {
  hour: number;
  todayPercent: number;
  sevenDayAvg: number;
  targetPercent: number;
}

export interface OnTimeByWeekData {
  week: string;
  weeklyPercent: number;
  sevenDayAvg: number;
  vehicles: Array<{
    week: string;
    weekIndex: number;
    vehicleId: string;
    vehicleName: string;
    onTimePercent: number;
  }>;
}

export interface TechUtilizationData {
  techId: string;
  techName: string;
  wrenchMinutes: number;
  driveMinutes: number;
  idleMinutes: number;
  utilizationPercent: number;
}

export interface DurationBucket {
  bucket: string; // "0-30", "30-60", etc.
  count: number;
  targetCount?: number;
}
