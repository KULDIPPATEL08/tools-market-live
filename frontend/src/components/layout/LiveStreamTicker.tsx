import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { CollectedRecord } from '../../types';

export const LiveStreamTicker: React.FC = () => {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: liveRecords } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => api.getLiveStream(15),
    refetchInterval: 4000,
  });

  const fastSyncMutation = useMutation({
    mutationFn: api.fastSyncAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['live-stream'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  useEffect(() => {
    if (!liveRecords || liveRecords.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveRecords.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [liveRecords]);

  const currentItem: CollectedRecord | undefined = liveRecords?.[currentIndex];

  return (
    <div className="bg-[#0E0E12] border-b border-zinc-800/80 px-4 py-1.5 flex items-center justify-between text-xs font-sans">
      {/* Current Incoming Intel Item */}
      <div className="flex items-center space-x-3 overflow-hidden flex-1 mr-4">
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
            FEED
          </span>
        </div>

        {currentItem ? (
          <div className="flex items-center space-x-2 truncate">
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-750 flex-shrink-0">
              {(currentItem.source_type || 'web').toUpperCase()}
            </span>
            <a
              href={currentItem.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-200 hover:text-white truncate text-xs font-medium flex items-center space-x-1"
            >
              <span className="truncate">{currentItem.title}</span>
              <ExternalLink className="w-2.5 h-2.5 text-zinc-500 flex-shrink-0" />
            </a>
          </div>
        ) : (
          <span className="text-zinc-500 font-mono text-[11px]">
            Syncing multi-source discovery stream...
          </span>
        )}
      </div>

      {/* Manual Sync Trigger */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button
          onClick={() => fastSyncMutation.mutate()}
          disabled={fastSyncMutation.isPending}
          className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center space-x-1 bg-zinc-850 hover:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-750 transition-colors cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${fastSyncMutation.isPending ? 'animate-spin text-zinc-200' : 'text-zinc-400'}`} />
          <span>{fastSyncMutation.isPending ? 'SYNCING...' : 'SYNC ALL'}</span>
        </button>
      </div>
    </div>
  );
};
