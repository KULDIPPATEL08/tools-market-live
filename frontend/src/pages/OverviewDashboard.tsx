import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Bookmark,
  RefreshCw,
  Plus,
  Flame,
  Radio,
  FileText
} from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const OverviewDashboard: React.FC = () => {
  const { setActiveQuickAction } = useUIStore();

  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: api.getOverviewMetrics,
  });

  const { data: recentRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['recent-records'],
    queryFn: () => api.getRecords({ limit: 8, sort_by: 'recent' }),
  });

  const { data: sources } = useQuery({
    queryKey: ['sources-summary'],
    queryFn: () => api.getSources(),
  });

  const { data: gaps } = useQuery({
    queryKey: ['gaps-summary'],
    queryFn: () => api.getGaps(),
  });

  const { data: researchProjects } = useQuery({
    queryKey: ['research-projects-overview'],
    queryFn: () => api.getProjects(),
  });

  const trendingTopics = [
    { tag: 'Local LLMs & Weights', count: 34, change: '+18%' },
    { tag: 'Inference Acceleration', count: 28, change: '+24%' },
    { tag: 'Local-First SQLite & CRDTs', count: 19, change: '+12%' },
    { tag: 'Web Scraping & DOM Parsers', count: 16, change: '+9%' },
    { tag: 'Zero-Knowledge Sovereign Workspace', count: 12, change: '+31%' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header - Editorial & Linear Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Intelligence Overview
            </h1>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono text-zinc-500 uppercase">
              Global Feed Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time multi-source crawler stream across Reddit, Hugging Face, Tech News, GitHub & HN.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<RefreshCw className="w-3 h-3 text-zinc-400" />}
            onClick={() => refetchMetrics()}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="xs"
            leftIcon={<Plus className="w-3 h-3" />}
            onClick={() => setActiveQuickAction('source')}
          >
            Add Source
          </Button>
        </div>
      </div>

      {/* Information-Dense Telemetry Strip (Linear/Bloomberg style, no giant cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800 border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden text-xs">
        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Indexed Intel</span>
          <span className="text-base font-semibold font-mono text-white tabular-nums block">
            {metrics?.total_records?.toLocaleString() ?? 0}
          </span>
          <span className="text-[10px] text-zinc-500 block">Verified records</span>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Active Feeds</span>
          <span className="text-base font-semibold font-mono text-white tabular-nums block">
            {metrics?.active_sources ?? 0}
          </span>
          <span className="text-[10px] text-zinc-500 block">Streaming / Polling</span>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Startup Voids</span>
          <span className="text-base font-semibold font-mono text-rose-300 tabular-nums block">
            {gaps?.length ?? 0}
          </span>
          <span className="text-[10px] text-zinc-500 block">Uncovered markets</span>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Pipeline Success</span>
          <span className="text-base font-semibold font-mono text-emerald-400 tabular-nums block">
            {metrics?.collection_success_rate ?? 100}%
          </span>
          <span className="text-[10px] text-zinc-500 block">12-stage engine</span>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Dossiers Staged</span>
          <span className="text-base font-semibold font-mono text-indigo-300 tabular-nums block">
            {researchProjects?.length ?? 0}
          </span>
          <span className="text-[10px] text-zinc-500 block">Research notes</span>
        </div>

        <div className="p-3 space-y-0.5">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block">Retention Cap</span>
          <span className="text-base font-semibold font-mono text-zinc-300 tabular-nums block">
            Rolling 48h
          </span>
          <span className="text-[10px] text-zinc-500 block">Low RAM mode</span>
        </div>
      </div>

      {/* Main Editorial Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Latest Verified Discoveries & Startup Voids */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breaking Discoveries - Editorial Row Layout */}
          <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  Recent Intelligence Discoveries
                </h2>
              </div>
              <NavLink
                to="/discover"
                className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1"
              >
                <span>View all stream</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            {recordsLoading ? (
              <div className="p-4"><LoadingSkeleton rows={4} /></div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {recentRecords?.map((record) => (
                  <div
                    key={record.id}
                    className="p-3.5 hover:bg-zinc-850/50 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap text-[11px] font-mono">
                        <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-medium">
                          {(record.source_type || 'web').toUpperCase()}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">{record.category}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-zinc-500">
                          {new Date(record.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <a
                        href={record.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-100 hover:text-indigo-300 transition-colors block line-clamp-1"
                      >
                        {record.title}
                      </a>

                      {record.description && (
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {record.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0 pt-0.5">
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-850 px-1.5 py-0.5 rounded border border-zinc-750 tabular-nums">
                        QS: {record.quality_score}
                      </span>
                      <a
                        href={record.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-zinc-500 hover:text-zinc-200"
                        title="Open Source URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Startup Radar & Market Opportunities Preview */}
          <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Compass className="w-3.5 h-3.5 text-rose-400" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono">
                  Emerging Startup Opportunities & Market Voids
                </h2>
              </div>
              <NavLink
                to="/gaps"
                className="text-[11px] font-mono text-rose-300 hover:text-rose-200 flex items-center space-x-1"
              >
                <span>Full Radar ({gaps?.length || 0})</span>
                <ArrowRight className="w-3 h-3" />
              </NavLink>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {gaps?.slice(0, 3).map((gap) => (
                <div key={gap.id} className="p-3.5 hover:bg-zinc-850/50 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium">
                      {gap.category}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold tabular-nums">
                      95/100 OPPORTUNITY
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-zinc-100">
                    {gap.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Trending Topics & Active Source Registry */}
        <div className="space-y-6">
          {/* Trending Topics & Velocity */}
          <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                <span>Trending Research Vectors</span>
              </span>
            </div>

            <div className="p-3 divide-y divide-zinc-800/60">
              {trendingTopics.map((topic, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <NavLink
                    to={`/discover?q=${encodeURIComponent(topic.tag)}`}
                    className="text-zinc-300 hover:text-white truncate pr-2 font-medium"
                  >
                    {topic.tag}
                  </NavLink>
                  <div className="flex items-center space-x-2 text-right flex-shrink-0">
                    <span className="font-mono text-zinc-500 tabular-nums">{topic.count}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1 py-0.2 rounded">
                      {topic.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connected Primary Data Sources */}
          <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono flex items-center space-x-1.5">
                <Radio className="w-3.5 h-3.5 text-zinc-400" />
                <span>Active Data Sources</span>
              </span>
              <NavLink
                to="/sources"
                className="text-[11px] font-mono text-zinc-400 hover:text-white"
              >
                Manage
              </NavLink>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {sources?.slice(0, 5).map((src) => (
                <div key={src.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="font-medium text-zinc-200 block truncate">{src.name}</span>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                      {src.type} • Every {src.fetch_interval_minutes}m
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-mono font-medium text-zinc-300 block tabular-nums">
                      {src.records_count}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>LIVE</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Dossiers Staged */}
          <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 font-mono flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-400" />
                <span>Research Studio</span>
              </span>
              <NavLink to="/research" className="text-[11px] font-mono text-zinc-400 hover:text-white">
                Open Studio
              </NavLink>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Compile notes, lock evidence snippets, and generate exportable intelligence briefs in Markdown or HTML.
            </p>
            <NavLink
              to="/research"
              className="inline-flex items-center justify-center w-full py-1.5 rounded bg-zinc-850 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-750 transition-colors"
            >
              Start New Dossier
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
