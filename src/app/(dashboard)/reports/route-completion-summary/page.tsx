import BaseReportPage from '@/components/reports/BaseReportPage';

export default function RouteCompletionSummaryReportPage() {
  return (
    <BaseReportPage 
      title="Route Completion Summary Report"
      showJourneyTypeFilter={false}
    />
  );
}