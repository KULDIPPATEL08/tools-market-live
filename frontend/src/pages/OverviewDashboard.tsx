import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  Layers,
  Radio,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Sparkles,
  RefreshCw,
  Plus,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useUIStore } from '../store';
import { Card } from '../components/ui/Card';
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
    queryFn: () => api.getRecords({ limit: 6, sort_by: 'recent' }),
  });

  const { data: sources } = useQuery({
    queryKey: ['sources-summary'],
    queryFn: () => api.getSources(),
  });

  const { data: gaps } = useQuery({
    queryKey: ['gaps-summary'],
    queryFn: () => api.getGaps(),
  });

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center space-x-3">
            <span>Tools Market Live</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time multi-source data collection, verification, tools catalog, and market intelligence node.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => refetchMetrics()}
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

      {/* KPI Metrics Cards */}
      {metricsLoading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">TOTAL RECORDS</span>
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {metrics?.total_records.toLocaleString() ?? 0}
            </span>
            <span className="text-[10px] text-emerald-400 block mt-1">Verifiable Evidence</span>
          </Card>

          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">ACTIVE SOURCES</span>
            <span className="text-2xl font-bold font-mono text-sky-400 tracking-tight">
              {metrics?.active_sources ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">RSS, GitHub, HN</span>
          </Card>

          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">COLLECTION JOBS</span>
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {metrics?.total_jobs ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">12-Stage Lifecycle</span>
          </Card>

          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">SUCCESS RATE</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
              {metrics?.collection_success_rate ?? 100}%
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Health Metric</span>
          </Card>

          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">DUPLICATES BLOCKED</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
              {metrics?.duplicate_count ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">SHA-256 Fingerprint</span>
          </Card>

          <Card isFloating className="p-4 border-slate-800/80">
            <span className="text-[11px] font-mono text-slate-400 block mb-1">INTELLIGENCE GAPS</span>
            <span className="text-2xl font-bold font-mono text-purple-400 tracking-tight">
              {metrics?.gaps_count ?? 0}
            </span>
            <span className="text-[10px] text-purple-300 block mt-1">Opportunities</span>
          </Card>
        </div>
      )}

      {/* Intelligence & Strategic Action Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavLink
          to="/gaps"
          className="antigravity-card p-4 rounded-xl border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                VENTURE OPPORTUNITY
              </span>
              <span className="text-xs text-rose-400 font-mono font-semibold">96/100 Index</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-200 transition-colors">
              Dead Startup Graveyard & Voids
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Analyze failed & sunset products (Mint, Skiff, Sunrise, Artifact) to capture stranded customers and market share.
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-rose-500/20 flex items-center justify-between text-xs font-mono text-rose-300">
            <span>Explore Blueprints</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </NavLink>

        <NavLink
          to="/tools?tab=tool-gatherer"
          className="antigravity-card p-4 rounded-xl border-purple-500/30 bg-purple-950/10 hover:border-purple-500/60 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                TOOL HUNTER
              </span>
              <span className="text-xs text-purple-400 font-mono font-semibold">Auto-Enriching</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
              Tool Gathering & Best Tools Hub
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Harvest any GitHub repository or AI model stack. Track live stars, forks, license types, and curate top tools.
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono text-purple-300">
            <span>Gather New Tool</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </NavLink>

        <NavLink
          to="/tools?tab=batch-scraper"
          className="antigravity-card p-4 rounded-xl border-amber-500/30 bg-amber-950/10 hover:border-amber-500/60 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                FAST CRAWLER
              </span>
              <span className="text-xs text-amber-400 font-mono font-semibold">10x Parallel</span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors">
              High-Speed Web Batch Scraper
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              Paste up to 20 URLs and scrape concurrently with async worker pooling, SSRF safeguards, and DOM cleaning.
            </p>
          </div>
          <div className="pt-3 mt-2 border-t border-amber-500/20 flex items-center justify-between text-xs font-mono text-amber-300">
            <span>Launch Batch Scraper</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </NavLink>
      </div>

      {/* Main Grid: Discoveries Feed & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Intelligence Discoveries */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <h2 className="text-lg font-semibold text-white">Recent Discoveries</h2>
            </div>
            <NavLink
              to="/discover"
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center space-x-1"
            >
              <span>Explore all records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {recordsLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-3">
              {recentRecords?.map((record) => (
                <div
                  key={record.id}
                  className="antigravity-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="cyan">{record.category}</Badge>
                      {record.source_name && (
                        <span className="text-xs font-mono text-slate-400">
                          via {record.source_name}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Score {record.quality_score}
                      </span>
                    </div>

                    <a
                      href={record.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-slate-100 hover:text-sky-300 transition-colors block line-clamp-1"
                    >
                      {record.title}
                    </a>

                    {record.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {record.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-500 pt-1">
                      {record.author && <span>By {record.author}</span>}
                      <span>{new Date(record.collected_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0 self-end sm:self-center">
                    <NavLink
                      to={`/discover?q=${encodeURIComponent(record.title)}`}
                      className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Inspect Record"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </NavLink>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Collection Sources & Gap Highlights */}
        <div className="space-y-6">
          {/* Active Connected Sources */}
          <Card title="Connected Sources" subtitle="Monitored streaming & polling feeds">
            <div className="space-y-2.5 divide-y divide-slate-800/80">
              {sources?.slice(0, 4).map((source) => (
                <div key={source.id} className="pt-2.5 first:pt-0 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block truncate max-w-[180px]">
                      {source.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {source.type} • Every {source.fetch_interval_minutes}m
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-sky-400 block">
                      {source.records_count}
                    </span>
                    <Badge variant={source.status === 'active' ? 'emerald' : 'amber'} size="sm" dot>
                      {source.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <NavLink
                to="/sources"
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center justify-center space-x-1"
              >
                <span>Manage all sources</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </Card>

          {/* Intelligence Gap Board Highlights */}
          <Card
            title="Intelligence Gaps"
            subtitle="Automated pattern & developer demand detection"
            className="border-purple-500/20 shadow-purple-500/5"
          >
            <div className="space-y-3">
              {gaps?.slice(0, 2).map((gap) => (
                <div key={gap.id} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="purple" size="sm">
                      {gap.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">{gap.status}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{gap.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{gap.description}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-800/80 mt-4">
              <NavLink
                to="/gaps"
                className="text-xs text-purple-400 hover:text-purple-300 font-medium flex items-center justify-center space-x-1"
              >
                <span>Open Market Gaps & Radar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

