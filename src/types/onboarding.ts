export type OnboardingGoal =
  | "no-sla-breach"
  | "driver-safety"
  | "fuel-efficiency"
  | "route-optimization"

export type Industry =
  | "utility"
  | "logistics"
  | "construction"
  | "healthcare"
  | "retail"
  | "manufacturing"
  | "telecommunications"
  | "other"

export type VehicleMission =
  | "field-service"
  | "delivery"
  | "transportation"
  | "emergency-services"
  | "maintenance"
  | "other"

export interface AccountInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
}

export interface CompanyInfo {
  name: string
  industry: Industry
  detectedIndustry?: Industry
  vehicleMission: VehicleMission
}

export interface OnboardingData {
  accountInfo: AccountInfo | null
  companyInfo: CompanyInfo | null
  goals: OnboardingGoal[]
  currentStep: 1 | 2 | 3
  completedAt: string | null
  hasSeenWelcome: boolean
}

export interface GoalOption {
  id: OnboardingGoal
  label: string
  description: string
  icon: string
}

export interface CTAAction {
  id: string
  title: string
  description: string
  icon: string
  actionLabel: string
  completed: boolean
}
