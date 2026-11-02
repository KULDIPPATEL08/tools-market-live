import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Download, ExternalLink, Trash2, FileText, Check } from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const SavedItemsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: savedRecords, isLoading } = useQuery({
    queryKey: ['saved-records'],
    queryFn: () => api.getRecords({ is_saved: true }),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (id: number) => api.toggleSaveRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-records'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header with Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Saved Intelligence & Export Center</span>
            <span className="text-xs font-mono font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              {savedRecords?.length ?? 0} Records Saved
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated list of bookmarked intelligence records ready for external export or synthesis.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href="/api/v1/export/records/csv?is_saved=true"
            download
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-space-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-sky-400" />
            Export CSV
          </a>
          <a
            href="/api/v1/export/records/json?is_saved=true"
            download
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-space-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            Export JSON
          </a>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : savedRecords?.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No Saved Items"
          description="Bookmark or save records from the Discover page to build your curated research collection."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedRecords?.map((record) => (
            <div
              key={record.id}
              className="antigravity-card rounded-xl p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan">{record.category}</Badge>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    QS: {record.quality_score}
                  </span>
                </div>

                <a
                  href={record.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-slate-100 hover:text-sky-300 block line-clamp-2"
                >
                  {record.title}
                </a>

                {record.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {record.description}
                  </p>
                )}

                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  via {record.source_name || record.source_type} • Saved {new Date(record.collected_at).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <a
                  href={record.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:underline flex items-center space-x-1"
                >
                  <span>Open Primary Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => toggleSaveMutation.mutate(record.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

