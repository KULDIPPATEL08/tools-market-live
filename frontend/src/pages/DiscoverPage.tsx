import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Bookmark,
  ExternalLink,
  Sparkles,
  Share2,
  Check,
  Radio,
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  Building,
  Target,
  ArrowUpRight,
  X,
  Compass,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { CollectedRecord } from '../types';
import { Button } from '../components/ui/Button';

const CORE_CATEGORIES = [
  'All',
  'AI News',
  'Startup Launches',
  'Startup Funding',
  'AI Tools',
  'AI Models',
  'Technology News',
  'Product Launches',
  'Research Papers',
  'Open Source Projects',
  'Developer Tools',
  'Business Opportunities',
  'Market Intelligence',
  'Cybersecurity Updates',
  'India Startup News',
  'Gujarat Startup News',
];

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedSourceType = searchParams.get('type') || '';
  const sortBy = searchParams.get('sort') || 'recent';

  const [selectedRecord, setSelectedRecord] = useState<CollectedRecord | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['records', searchQuery, selectedCategory, selectedSourceType, sortBy],
    queryFn: () =>
      api.getRecords({
        q: searchQuery || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        source_type: selectedSourceType || undefined,
        sort_by: sortBy,
      }),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (id: number) => api.toggleSaveRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });

  const handleSearchChange = (val: string) => {
    const params = new URLSearchParams(searchParams);
    if (val) params.set('q', val);
    else params.delete('q');
    setSearchParams(params);
  };

  const handleCategorySelect = (cat: string) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const handleInspect = async (record: CollectedRecord) => {
    setSelectedRecord(record);
    setAiAnalysis(null);
    setIsAiLoading(true);
    try {
      const res = await api.askAI(
        `Extract strategic takeaways, key technological implications, and actionable signals from: ${record.title}\n\n${record.description || ''}`,
        'research_assistant',
        [record.id]
      );
      setAiAnalysis(res.answer);
    } catch (_) {
      setAiAnalysis('Summary synthesis not available.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyLink = (record: CollectedRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(record.original_url);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Normalized Intelligence Stream
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-400">15 Specialized Taxonomy Channels</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Live Intelligence Feed</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Normalized stream collecting continuous signals across global tech, AI research, Indian startups, and cybersecurity advisories.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-zinc-400">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-zinc-500" />
            <span>SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                params.set('sort', e.target.value);
                setSearchParams(params);
              }}
              className="bg-transparent text-zinc-200 outline-none ml-1 cursor-pointer font-mono"
            >
              <option value="recent">MOST RECENT</option>
              <option value="quality">HIGHEST SCORE</option>
              <option value="oldest">OLDEST FIRST</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Strip (15 Categories) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {CORE_CATEGORIES.map((cat) => {
          const isActive = (selectedCategory === 'All' && cat === 'All') || selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white font-medium border border-zinc-700 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50 border border-transparent'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Filter live stream by keyword, company, model, or research topic..."
          className="w-full bg-[#0E0E12] border border-zinc-800 focus:border-indigo-500 text-xs text-zinc-100 placeholder-zinc-500 rounded pl-10 pr-4 py-2.5 outline-none font-sans"
        />
      </div>

      {/* Feed Stream Editorial Table / List */}
      <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#121216] text-[11px] font-mono text-zinc-400">
                <th className="py-2.5 px-4 font-medium">SIGNAL / TITLE</th>
                <th className="py-2.5 px-3 font-medium">CATEGORY</th>
                <th className="py-2.5 px-3 font-medium">SOURCE & PROVENANCE</th>
                <th className="py-2.5 px-3 font-medium text-center">SCORE</th>
                <th className="py-2.5 px-4 font-medium text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono">
                    Ingesting stream records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500 font-mono">
                    No intelligence records match this taxonomy filter.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isIndiaOrGujarat =
                    r.category.includes('India') ||
                    r.category.includes('Gujarat') ||
                    r.tags?.toLowerCase().includes('gujarat');

                  return (
                    <tr
                      key={r.id}
                      onClick={() => handleInspect(r)}
                      className="hover:bg-zinc-850/40 transition-colors cursor-pointer group"
                    >
                      {/* Title & Description */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors text-sm">
                              {r.title}
                            </span>
                            {isIndiaOrGujarat && (
                              <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                                ECOSYSTEM
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-lg">
                            {r.description || r.content}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300 whitespace-nowrap">
                          {r.category}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 font-mono text-[11px] text-zinc-300">
                        <div className="space-y-0.5">
                          <span className="block truncate max-w-xs">{r.source_name || (r.source_type || 'web').toUpperCase()}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(r.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>

                      {/* Score */}
                      <td className="py-3 px-3 text-center">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {Math.round(r.quality_score * 100)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleSaveMutation.mutate(r.id)}
                            className={`p-1.5 rounded transition-colors ${
                              r.is_saved
                                ? 'text-indigo-400 bg-indigo-950/40'
                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                            title="Save Record"
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={r.original_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                            title="Open Source Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Intelligence Detail Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-[#0E0E12] border-l border-zinc-800 h-full p-6 space-y-6 overflow-y-auto no-scrollbar shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-850 text-indigo-300 border border-zinc-750">
                    {selectedRecord.category}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 border border-emerald-800/40 bg-emerald-950/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED SIGNAL
                  </span>
                </div>
                <h2 className="text-base font-bold text-white tracking-tight mt-1 leading-snug">
                  {selectedRecord.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Strategic Takeaways & Synthesis */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono uppercase text-indigo-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI STRATEGIC SYNTHESIS</span>
              </div>
              <div className="bg-[#121216] border border-zinc-800 rounded p-4 text-xs text-zinc-300 leading-relaxed font-sans min-h-[80px]">
                {isAiLoading ? (
                  <div className="flex items-center gap-2 text-zinc-500 font-mono">
                    <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Extracting strategic intelligence...</span>
                  </div>
                ) : (
                  aiAnalysis || selectedRecord.description
                )}
              </div>
            </div>

            {/* Original Summary */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">Source Content Overview</span>
              <p className="text-xs text-zinc-400 leading-relaxed bg-[#141418] p-3 rounded border border-zinc-800">
                {selectedRecord.content || selectedRecord.description || 'No raw content extracted.'}
              </p>
            </div>

            {/* Provenance Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#141418] p-3.5 rounded border border-zinc-800 font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Source Provider</span>
                <span className="text-zinc-200">{selectedRecord.source_name || selectedRecord.source_type}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Discovered At</span>
                <span className="text-zinc-200">{new Date(selectedRecord.collected_at).toUTCString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Confidence Score</span>
                <span className="text-emerald-400 font-semibold">
                  {Math.round(selectedRecord.quality_score * 100)}% Verified
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Original URL</span>
                <a
                  href={selectedRecord.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 truncate"
                >
                  <span className="truncate max-w-[120px]">{selectedRecord.original_url}</span>
                  <ArrowUpRight className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigate(`/search`);
                }}
                className="text-xs flex items-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Related Web</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => toggleSaveMutation.mutate(selectedRecord.id)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Bookmark className="w-3.5 h-3.5 mr-1" />
                  {selectedRecord.is_saved ? 'Saved' : 'Save to Watchlist'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
