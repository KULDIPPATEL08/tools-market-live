import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Radio,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
} from 'lucide-react';
import { api } from '../services/api';
import { Source } from '../types';
import { useUIStore } from '../store';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const SourcesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { setActiveQuickAction } = useUIStore();
  const [selectedType, setSelectedType] = useState<string>('');
  const [syncingSourceId, setSyncingSourceId] = useState<number | null>(null);

  const { data: sources, isLoading, refetch } = useQuery({
    queryKey: ['sources', selectedType],
    queryFn: () => api.getSources({ type: selectedType || undefined }),
  });

  const syncMutation = useMutation({
    mutationFn: (id: number) => api.syncSource(id),
    onMutate: (id) => setSyncingSourceId(id),
    onSettled: () => {
      setSyncingSourceId(null);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['collection-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteSource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Sources Management</span>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified Connectors
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage streaming RSS/Atom feeds, GitHub search queries, Hacker News feeds, and public web scrapers.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setActiveQuickAction('source')}
          >
            Add Source
          </Button>
        </div>
      </div>

      {/* Filter by Type */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Filter Type:</span>
        {['', 'rss', 'github', 'hackernews', 'webpage', 'file'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-3 py-1 text-xs rounded-lg border font-mono transition-colors cursor-pointer ${
              selectedType === type
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-space-800 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {type ? type.toUpperCase() : 'ALL SOURCES'}
          </button>
        ))}
      </div>

      {/* Sources Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : sources?.length === 0 ? (
        <EmptyState
          icon={<Radio className="w-8 h-8" />}
          title="No Sources Found"
          description="Add your first RSS feed, GitHub repository query, or Hacker News source to begin automated intelligence ingestion."
          actionLabel="Add New Source"
          onAction={() => setActiveQuickAction('source')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources?.map((source) => {
            const isSyncing = syncingSourceId === source.id;
            return (
              <div
                key={source.id}
                className="antigravity-card rounded-xl p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={source.type === 'github' ? 'blue' : source.type === 'rss' ? 'cyan' : 'emerald'}>
                      {source.type.toUpperCase()}
                    </Badge>
                    <Badge variant={source.status === 'active' ? 'emerald' : 'amber'} dot>
                      {source.status}
                    </Badge>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100 line-clamp-1">
                    {source.name}
                  </h3>

                  {source.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {source.description}
                    </p>
                  )}

                  {source.url && (
                    <div className="pt-1">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-sky-400 hover:text-sky-300 truncate flex items-center space-x-1"
                      >
                        <span className="truncate">{source.url}</span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>COLLECTED RECORDS</span>
                    <span className="text-slate-100 font-bold font-mono">
                      {source.records_count.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>INTERVAL</span>
                    <span>Every {source.fetch_interval_minutes}m</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>LAST SYNCED</span>
                    <span>
                      {source.last_synced_at
                        ? new Date(source.last_synced_at).toLocaleTimeString()
                        : 'Never'}
                    </span>
                  </div>

                  {source.error_message && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded text-[11px] text-rose-400 font-mono line-clamp-2">
                      Error: {source.error_message}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => syncMutation.mutate(source.id)}
                      isLoading={isSyncing}
                      leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      Sync Now
                    </Button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete source "${source.name}"?`)) {
                          deleteMutation.mutate(source.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
