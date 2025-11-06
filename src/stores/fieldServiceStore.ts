import { create } from 'zustand';
import type {
  Job,
  Technician,
  Customer,
  FieldServiceStats,
  JobRisk,
  TechUtilizationData,
} from '@/types/fieldService';
import { fieldServiceDataGenerator } from '@/lib/demo/fieldServiceDataGenerator';
// Configure demo generator for deterministic, balanced data
fieldServiceDataGenerator.configure({ seed: 'stable-demo-1', balanced: true });

interface FieldServiceState {
  jobs: Job[];
  technicians: Technician[];
  customers: Customer[];
  stats: FieldServiceStats | null;
  isLoading: boolean;
  lastUpdate: Date | null;

  // Actions
  refreshData: () => void;
  getJob: (id: string) => Job | undefined;
  getTechnician: (id: string) => Technician | undefined;
  getAtRiskJobs: () => JobRisk[];
  getTechUtilization: () => TechUtilizationData[];
}

export const useFieldServiceStore = create<FieldServiceState>((set, get) => ({
  jobs: [],
  technicians: [],
  customers: [],
  stats: null,
  isLoading: true,
  lastUpdate: null,

  refreshData: () => {
    set({ isLoading: true });

    // Simulate async data fetch
    setTimeout(() => {
      const jobs = fieldServiceDataGenerator.getJobs();
      const technicians = fieldServiceDataGenerator.getTechnicians();
      const customers = fieldServiceDataGenerator.getCustomers();
      const stats = fieldServiceDataGenerator.getStats();

      set({
        jobs,
        technicians,
        customers,
        stats,
        isLoading: false,
        lastUpdate: new Date(),
      });
    }, 100);
  },

  getJob: (id: string) => {
    const state = get();
    return state.jobs.find(job => job.id === id);
  },

  getTechnician: (id: string) => {
    const state = get();
    return state.technicians.find(tech => tech.id === id);
  },

  getAtRiskJobs: () => {
    const state = get();
    const now = new Date();
    const sixtyMinFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const atRiskJobs = state.jobs
      .filter(job => {
        if (!job.estimatedArrival || job.status === 'completed') return false;
        return (
          job.estimatedArrival > job.windowEnd &&
          job.estimatedArrival < sixtyMinFromNow
        );
      })
      .map(job => {
        const minutesLate = Math.max(
          0,
          Math.floor(
            (job.estimatedArrival!.getTime() - job.windowEnd.getTime()) /
              (60 * 1000)
          )
        );

        const riskFactors: string[] = [];
        if (minutesLate > 30) riskFactors.push('Significantly late');
        if (job.priority === 'critical' || job.priority === 'high')
          riskFactors.push('High priority');
        if (job.customer.tier === 'vip') riskFactors.push('VIP customer');

        const riskScore =
          minutesLate * 2 +
          (job.priority === 'critical' ? 20 : job.priority === 'high' ? 10 : 0) +
          (job.customer.tier === 'vip' ? 15 : job.customer.tier === 'premium' ? 5 : 0);

        const recommendedAction: JobRisk['recommendedAction'] =
          riskScore > 60
            ? 'escalate'
            : riskScore > 40
            ? 'reassign'
            : riskScore > 20
            ? 'notify'
            : 'monitor';

        return {
          jobId: job.id,
          riskScore,
          riskFactors,
          minutesLate,
          recommendedAction,
        };
      })
      .sort((a, b) => b.riskScore - a.riskScore);

    return atRiskJobs;
  },

  getTechUtilization: () => {
    const state = get();

    return state.technicians
      .map(tech => {
        const totalMinutes =
          tech.onSiteMinutes + tech.drivingMinutes + tech.idleMinutes;
        const utilizationPercent =
          totalMinutes > 0 ? (tech.onSiteMinutes / totalMinutes) * 100 : 0;

        return {
          techId: tech.id,
          techName: tech.name,
          wrenchMinutes: tech.onSiteMinutes,
          driveMinutes: tech.drivingMinutes,
          idleMinutes: tech.idleMinutes,
          utilizationPercent,
        };
      })
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent);
  },
}));

// Initialize data on store creation
useFieldServiceStore.getState().refreshData();
