import { CostDashboard } from '@/components/cost/CostDashboard';
import { getCostDashboardDemoData } from '@/lib/demo/cost';

export const revalidate = 300;

export default function DashboardPage() {
  const data = getCostDashboardDemoData();

  return (
    <div className="space-y-8 p-6">
      <CostDashboard data={data} />
    </div>
  );
}
