import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, Radio, ArrowRight, Play, Pause, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { CollectedRecord } from '../../types';
import { Badge } from '../ui/Badge';

export const LiveStreamTicker: React.FC = () => {
  const queryClient = useQueryClient();
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: liveRecords } = useQuery({
    queryKey: ['live-stream'],
    queryFn: () => api.getLiveStream(15),
    refetchInterval: isLiveActive ? 4000 : false, // Poll every 4 seconds when live active
  });

  const fastSyncMutation = useMutation({
    mutationFn: api.fastSyncAll,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['live-stream'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });

  // Rotate ticker item every 3.5 seconds
  useEffect(() => {
    if (!liveRecords || liveRecords.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % liveRecords.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [liveRecords]);

  const currentItem: CollectedRecord | undefined = liveRecords?.[currentIndex];

  return (
    <div className="bg-space-950 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs overflow-hidden">
      {/* Left: Live Indicator & Current Incoming Ticker */}
      <div className="flex items-center space-x-3 overflow-hidden flex-1">
        <div className="flex items-center space-x-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            {isLiveActive && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isLiveActive ? 'bg-emerald-500' : 'bg-slate-500'
              }`}
            />
          </span>
          <span className="font-mono text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
            LIVE INTELLIGENCE STREAM
          </span>
        </div>

        {currentItem ? (
          <div className="flex items-center space-x-2 truncate animate-fadeIn">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-space-850 text-sky-400 border border-slate-800 flex-shrink-0">
              {currentItem.category}
            </span>
            <a
              href={currentItem.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white truncate font-medium flex items-center space-x-1"
            >
              <span className="truncate">{currentItem.title}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-500 flex-shrink-0" />
            </a>
            <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">
              via {currentItem.source_name || currentItem.source_type}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 font-mono text-[11px]">
            Connecting to global feed stream...
          </span>
        )}
      </div>

      {/* Right: Controls & Fast Sync Trigger */}
      <div className="flex items-center space-x-2.5 flex-shrink-0 pl-3">
        <button
          onClick={() => setIsLiveActive(!isLiveActive)}
          className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center space-x-1 cursor-pointer"
          title={isLiveActive ? 'Pause live stream' : 'Resume live stream'}
        >
          {isLiveActive ? (
            <>
              <Pause className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">LIVE ON</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">PAUSED</span>
            </>
          )}
        </button>

        <button
          onClick={() => fastSyncMutation.mutate()}
          disabled={fastSyncMutation.isPending}
          className="px-2.5 py-1 text-[11px] font-mono font-semibold rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
          title="Concurrently scrape and ingest all active sources now"
        >
          <Zap className={`w-3 h-3 ${fastSyncMutation.isPending ? 'animate-spin' : 'text-amber-400 fill-amber-400'}`} />
          <span className="hidden sm:inline">
            {fastSyncMutation.isPending ? 'Ingesting Worldwide...' : 'Fast Sync Worldwide'}
          </span>
        </button>
      </div>
    </div>
  );
};

