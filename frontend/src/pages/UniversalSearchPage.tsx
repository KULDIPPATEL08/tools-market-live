import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Sparkles,
  Globe,
  Database,
  Building,
  Cpu,
  TrendingUp,
  Code,
  ExternalLink,
  BookmarkPlus,
  History,
  Trash2,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { SearchResponse, SearchResultItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

type SearchMode = 'quick' | 'deep' | 'startup' | 'ai' | 'market' | 'technology';

const SEARCH_MODES: { id: SearchMode; label: string; icon: React.FC<{ className?: string }>; desc: string }[] = [
  { id: 'quick', label: 'Quick Search', icon: Search, desc: 'Fast web intelligence synthesis & direct sources' },
  { id: 'deep', label: 'Deep Research', icon: Sparkles, desc: 'Multi-source consensus & key strategic takeaways' },
  { id: 'startup', label: 'Startup Radar', icon: Building, desc: 'Founders, funding stages, and venture momentum' },
  { id: 'ai', label: 'AI Ecosystem', icon: Cpu, desc: 'Models, open weights, benchmarks, and research' },
  { id: 'market', label: 'Market Voids', icon: TrendingUp, desc: 'Industry landscape, competitors, and growth signals' },
  { id: 'technology', label: 'Tech & Architecture', icon: Code, desc: 'Developer tooling, OSS packages, and documentation' },
];

export const UniversalSearchPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [activeMode, setActiveMode] = useState<SearchMode>('quick');
  const [provider, setProvider] = useState<'auto' | 'local' | 'duckduckgo'>('auto');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // Search History Query
  const { data: searchHistory = [] } = useQuery({
    queryKey: ['searchHistory'],
    queryFn: () => api.getSearchHistory(15),
  });

  // Search Mutation
  const searchMutation = useMutation({
    mutationFn: (searchQuery: string) =>
      api.search({
        query: searchQuery,
        mode: activeMode,
        provider: provider === 'auto' ? undefined : provider,
        max_results: activeMode === 'deep' ? 12 : 8,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate(query.trim());
  };

  const clearHistoryMutation = useMutation({
    mutationFn: () => api.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchHistory'] });
    },
  });

  const handleSaveToResearch = async (item: SearchResultItem) => {
    try {
      // Find default project or use project 1
      await api.saveSearchToResearch({
        project_id: 1,
        title: item.title,
        url: item.url,
        snippet: item.snippet,
        source: item.source,
      });
      setSaveSuccessId(item.url);
      setTimeout(() => setSaveSuccessId(null), 2500);
    } catch (_) {}
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
              Universal Intelligence Engine
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-400">Zero-API-Key Free Ingestion</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Universal Web Search</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cross-provider intelligence retrieval with real-time web citations and structured entity synthesis.
          </p>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2">
          {/* Engine Selector */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
            <button
              onClick={() => setProvider('auto')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono ${
                provider === 'auto' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Auto Engine
            </button>
            <button
              onClick={() => setProvider('local')}
              className={`px-2.5 py-1 rounded transition-colors text-[11px] font-mono ${
                provider === 'local' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Internal DB
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="text-xs flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-zinc-400" />
            <span>History ({searchHistory.length})</span>
          </Button>
        </div>
      </div>

      {/* Main Omnibar & Mode Chips */}
      <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg p-3 space-y-3 shadow-sm">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search startups, frontier AI releases, market voids, or tech papers..."
            className="w-full bg-[#141418] border border-zinc-750 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-zinc-100 placeholder-zinc-500 rounded pl-10 pr-24 py-2.5 outline-none font-sans transition-all"
          />
          <div className="absolute right-2 flex items-center gap-2">
            <Button
              type="submit"
              disabled={searchMutation.isPending || !query.trim()}
              size="sm"
              className="text-xs px-3 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              {searchMutation.isPending ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {/* Mode Selector Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          {SEARCH_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700 font-medium'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent'
                }`}
                title={mode.desc}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Layout: Results + History Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Results Stream (3 cols) */}
        <div className={isHistoryOpen ? 'lg:col-span-3 space-y-5' : 'lg:col-span-4 space-y-5'}>
          {/* Loading state */}
          {searchMutation.isPending && (
            <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg p-8 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">
                Executing cross-engine dispatch in <span className="text-white uppercase font-bold">{activeMode}</span> mode...
              </p>
            </div>
          )}

          {/* Results Display */}
          {searchMutation.data && (
            <div className="space-y-4">
              {/* Synthesis Panel */}
              {searchMutation.data.synthesis && (
                <div className="bg-[#121216] border border-zinc-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
                        Executive Synthesis
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Engine: {searchMutation.data.provider.toUpperCase()} • {searchMutation.data.total_results} Sources
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                    {searchMutation.data.synthesis}
                  </p>

                  {/* Bullet Takeaways */}
                  {searchMutation.data.key_takeaways.length > 0 && (
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                        Strategic Takeaways
                      </span>
                      <ul className="space-y-1">
                        {searchMutation.data.key_takeaways.map((point, idx) => (
                          <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                            <span className="text-indigo-400 font-mono text-[10px] mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Citations List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
                    Verified Citations & Sources ({searchMutation.data.results.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {searchMutation.data.results.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#0E0E12] border border-zinc-800 hover:border-zinc-700 transition-colors rounded p-3.5 space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300">
                              {item.source}
                            </span>
                            {item.published_date && (
                              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {item.published_date}
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-emerald-400 ml-auto">
                              Score: {Math.round(item.relevance_score * 100)}%
                            </span>
                          </div>

                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-zinc-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5 group-hover:text-white"
                          >
                            <span>{item.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>

                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {item.snippet}
                          </p>
                        </div>

                        {/* Quick Action Button */}
                        <div className="flex flex-col items-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSaveToResearch(item)}
                            className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Save Citation to Research Studio"
                          >
                            {saveSuccessId === item.url ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <BookmarkPlus className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no search executed yet */}
          {!searchMutation.data && !searchMutation.isPending && (
            <div className="border border-dashed border-zinc-800 rounded-lg p-10 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                <Search className="w-5 h-5 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-zinc-200">Universal Intelligence Dispatch Ready</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Type any company, model, or research query above. Search executes instantly across web sources and your internal intelligence index.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {[
                  'Sarvam AI',
                  'Llama 3.3 70B benchmarks',
                  'Gujarat GIFT City tech startups',
                  'Post-mortem Olive AI healthcare',
                  'Local-first CRDT databases',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      searchMutation.mutate(s);
                    }}
                    className="text-[11px] font-mono px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Drawer (1 col) */}
        {isHistoryOpen && (
          <div className="lg:col-span-1 bg-[#0E0E12] border border-zinc-800 rounded-lg p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200 font-mono">
                <History className="w-3.5 h-3.5 text-zinc-400" />
                <span>SEARCH LOGS</span>
              </div>
              {searchHistory.length > 0 && (
                <button
                  onClick={() => clearHistoryMutation.mutate()}
                  className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {searchHistory.length === 0 ? (
              <p className="text-xs text-zinc-500 py-4 text-center">No search history recorded.</p>
            ) : (
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto no-scrollbar">
                {searchHistory.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setQuery(h.query);
                      setActiveMode((h.mode as SearchMode) || 'quick');
                      searchMutation.mutate(h.query);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-zinc-850/60 border border-transparent hover:border-zinc-800 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-200 truncate group-hover:text-indigo-400 transition-colors font-medium">
                        {h.query}
                      </span>
                      <span className="text-[9px] font-mono uppercase text-zinc-500 px-1 py-0.2 bg-zinc-900 rounded">
                        {h.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 font-mono">
                      <span>{h.provider}</span>
                      <span>•</span>
                      <span>{h.results_count} results</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
