'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, UserPlus, MessageSquare, Clock, AlertTriangle } from 'lucide-react';
import type { Job, JobRisk } from '@/types/fieldService';
import { useState } from 'react';

interface ExceptionsTableProps {
  jobs: Job[];
  risks: JobRisk[];
  isLoading?: boolean;
}

export function ExceptionsTable({ jobs, risks, isLoading }: ExceptionsTableProps) {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  const handleAction = (action: string, jobId: string, customer: string) => {
    console.log(`[Demo] Action: ${action} for job ${jobId}`);
    setActionFeedback(`${action} initiated for ${customer}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 60) return 'bg-red-50 border-red-200';
    if (riskScore >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-gray-50 border-gray-200';
  };

  const getRiskBadgeVariant = (
    action: JobRisk['recommendedAction']
  ): 'default' | 'destructive' | 'outline' | 'secondary' => {
    if (action === 'escalate') return 'destructive';
    if (action === 'reassign') return 'default';
    if (action === 'notify') return 'outline';
    return 'secondary';
  };

  // Get top 10 at-risk jobs (skip risks with no matching job)
  const atRiskJobs: Array<Job & { risk: JobRisk }> = risks
    .slice(0, 10)
    .flatMap((risk) => {
      const job = jobs.find((j) => j.id === risk.jobId);
      return job ? [{ ...job, risk }] : [];
    });

  if (atRiskJobs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exceptions Queue</CardTitle>
          <CardDescription>No at-risk jobs right now</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              All Jobs On Track
            </h3>
            <p className="text-sm text-gray-500">
              No jobs require immediate attention
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exceptions Queue</CardTitle>
        <CardDescription>
          {atRiskJobs.length} jobs at risk • Sorted by SLA risk score
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionFeedback && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            {actionFeedback}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Job ID</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Customer</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Service Type</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Window End</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Late By</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Risk</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {atRiskJobs.map((job) => {
                const risk = job.risk;
                const windowEnd = new Date(job.windowEnd).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={job.id}
                    className={`border-b border-gray-100 ${getRiskColor(risk.riskScore)}`}
                  >
                    <td className="py-3 px-3 font-mono text-xs">{job.id}</td>
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-medium">{job.customer.name}</div>
                        <div className="text-xs text-gray-500">{job.customer.tier}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 capitalize">{job.serviceType}</td>
                    <td className="py-3 px-3">{windowEnd}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-semibold ${
                          risk.minutesLate > 30
                            ? 'text-red-600'
                            : risk.minutesLate > 0
                            ? 'text-amber-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {risk.minutesLate > 0 ? `+${risk.minutesLate}m` : '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant={getRiskBadgeVariant(risk.recommendedAction)}>
                        {risk.recommendedAction}
                      </Badge>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleAction('Reassign', job.id, job.customer.name)
                          }
                          title="Reassign"
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleAction('Send SMS', job.id, job.customer.name)
                          }
                          title="Send SMS"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleAction('Add Buffer', job.id, job.customer.name)
                          }
                          title="Add Buffer"
                        >
                          <Clock className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() =>
                            handleAction('Escalate', job.id, job.customer.name)
                          }
                          title="Escalate"
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
