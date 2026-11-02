import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Layers,
  RotateCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { CollectionJob } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const CollectionJobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ['collection-jobs', filterStatus],
    queryFn: () => api.getJobs({ status: filterStatus || undefined }),
    refetchInterval: 5000, // Poll every 5s for live job state changes
  });

  const retryMutation = useMutation({
    mutationFn: (jobId: number) => api.retryJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="emerald" dot>Completed</Badge>;
      case 'running':
        return <Badge variant="cyan" dot>Running Stage 6/12</Badge>;
      case 'failed':
        return <Badge variant="rose" dot>Failed</Badge>;
      case 'pending':
        return <Badge variant="amber" dot>Pending</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start) return '—';
    const s = new Date(start).getTime();
    const e = end ? new Date(end).getTime() : Date.now();
    const diffSec = Math.max(0, Math.round((e - s) / 1000));
    return `${diffSec}s`;
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Collection Engine Jobs</span>
            <span className="text-xs font-mono font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              12-Stage Lifecycle
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time execution log of ingestion pipelines, deduplication checks, and metadata enrichment.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => refetch()}
          >
            Refresh Jobs
          </Button>
        </div>
      </div>

      {/* Lifecycle Diagram Info Card */}
      <Card className="p-4 bg-space-850 border-slate-800 text-xs text-slate-400 space-y-2">
        <span className="font-mono text-slate-300 font-semibold uppercase block">
          Standard 12-Stage Engine Lifecycle:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">1. Create</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">2. Validate</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">3. Retrieve</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">4. Parse</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">5. Normalize</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-sky-500/40 text-sky-300 font-semibold">6. Deduplicate</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">7. Enrich</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">8. Verify</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">9. Store</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">10. Index</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-slate-700 text-slate-300">11. Analytics</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="px-2 py-0.5 rounded bg-space-900 border border-emerald-500/40 text-emerald-300 font-semibold">12. Complete</span>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <span className="text-xs font-mono text-slate-500 uppercase mr-1">Status:</span>
        {['', 'completed', 'running', 'failed', 'pending'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
              filterStatus === st
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-space-800 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {st ? st.toUpperCase() : 'ALL JOBS'}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : jobs?.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-8 h-8" />}
          title="No Collection Jobs Found"
          description="Collection jobs execute automatically on scheduled intervals or can be triggered manually from the Sources page."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-space-800/60 shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-space-950/80 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Trigger</th>
                <th className="py-3 px-4 text-right">Retrieved</th>
                <th className="py-3 px-4 text-right">Saved New</th>
                <th className="py-3 px-4 text-right">Duplicates</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {jobs?.map((job) => (
                <tr key={job.id} className="hover:bg-slate-750 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-200">
                    #{job.id}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(job.status)}</td>
                  <td className="py-3 px-4 font-mono capitalize text-slate-400">
                    {job.trigger_type}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-200">
                    {job.records_retrieved}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-400">
                    +{job.records_saved}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {job.duplicates_detected}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {calculateDuration(job.started_at, job.completed_at)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    {job.started_at ? new Date(job.started_at).toLocaleTimeString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryMutation.mutate(job.id)}
                      isLoading={retryMutation.isPending && retryMutation.variables === job.id}
                      leftIcon={<RotateCw className="w-3 h-3 text-sky-400" />}
                    >
                      Retry
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

