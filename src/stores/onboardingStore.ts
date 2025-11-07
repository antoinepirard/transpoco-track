import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  OnboardingData,
  AccountInfo,
  CompanyInfo,
  OnboardingGoal,
} from "@/types/onboarding"

interface OnboardingStore extends OnboardingData {
  // Actions
  setAccountInfo: (info: AccountInfo) => void
  setCompanyInfo: (info: CompanyInfo) => void
  toggleGoal: (goal: OnboardingGoal) => void
  setGoals: (goals: OnboardingGoal[]) => void
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: 1 | 2 | 3) => void
  completeOnboarding: () => void
  markWelcomeAsSeen: () => void
  resetOnboarding: () => void
}

const initialState: OnboardingData = {
  accountInfo: null,
  companyInfo: null,
  goals: [],
  currentStep: 1,
  completedAt: null,
  hasSeenWelcome: false,
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      ...initialState,

      setAccountInfo: (info) =>
        set((state) => ({
          accountInfo: info,
        })),

      setCompanyInfo: (info) =>
        set((state) => ({
          companyInfo: info,
        })),

      toggleGoal: (goal) =>
        set((state) => ({
          goals: state.goals.includes(goal)
            ? state.goals.filter((g) => g !== goal)
            : [...state.goals, goal],
        })),

      setGoals: (goals) =>
        set((state) => ({
          goals,
        })),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(3, state.currentStep + 1) as 1 | 2 | 3,
        })),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(1, state.currentStep - 1) as 1 | 2 | 3,
        })),

      goToStep: (step) =>
        set((state) => ({
          currentStep: step,
        })),

      completeOnboarding: () =>
        set((state) => ({
          completedAt: new Date().toISOString(),
        })),

      markWelcomeAsSeen: () =>
        set((state) => ({
          hasSeenWelcome: true,
        })),

      resetOnboarding: () => set(initialState),
    }),
    {
      name: "onboarding-storage",
    }
  )
)
