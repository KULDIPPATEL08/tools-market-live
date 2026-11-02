import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Bookmark,
  ExternalLink,
  Sparkles,
  Share2,
  Tag,
  SlidersHorizontal,
  FileCheck,
  Check,
  Terminal,
  Cpu,
  Layers,
  Radio,
  Newspaper,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { CollectedRecord } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedSourceType = searchParams.get('type') || '';
  const sortBy = searchParams.get('sort') || 'recent';

  const [aiModalRecord, setAiModalRecord] = useState<CollectedRecord | null>(null);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['records', searchQuery, selectedCategory, selectedSourceType, sortBy],
    queryFn: () =>
      api.getRecords({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        source_type: selectedSourceType || undefined,
        sort_by: sortBy,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });

  const toggleSaveMutation = useMutation({
    mutationFn: (id: number) => api.toggleSaveRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: (id: number) => api.toggleBookmarkRecord(id),
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
    if (cat === selectedCategory || !cat) params.delete('category');
    else params.set('category', cat);
    setSearchParams(params);
  };

  const handleTypeSelect = (type: string) => {
    const params = new URLSearchParams(searchParams);
    if (type === selectedSourceType || !type) params.delete('type');
    else params.set('type', type);
    setSearchParams(params);
  };

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sort);
    setSearchParams(params);
  };

  const handleAskAI = async (record: CollectedRecord) => {
    setAiModalRecord(record);
    setAiAnswer(null);
    setIsAiLoading(true);
    try {
      const res = await api.askAI(
        `Summarize the key intelligence, architectural choices, and practical findings from: ${record.title}`,
        'research_assistant',
        [record.id]
      );
      setAiAnswer(res.answer);
    } catch (err: any) {
      setAiAnswer('Unable to generate summary at this moment.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyLink = (record: CollectedRecord) => {
    navigator.clipboard.writeText(record.original_url);
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sourceHubs = [
    { id: '', label: 'ALL FEEDS', icon: Terminal },
    { id: 'reddit', label: 'REDDIT LIVE', icon: Radio },
    { id: 'huggingface', label: 'HUGGING FACE', icon: Cpu },
    { id: 'technews', label: 'TECH WIRE', icon: Newspaper },
    { id: 'github', label: 'OPEN SOURCE', icon: Layers },
    { id: 'hackernews', label: 'HACKER NEWS', icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header - Retro Cyber Terminal Style */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-mono font-bold tracking-tight text-white uppercase">
              Live Intelligence Terminal
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              [ONLINE // STREAMING]
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time multi-source crawler stream across Reddit, Hugging Face, Tech News, GitHub & HN.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center space-x-2 bg-[#0C111A] p-1.5 rounded-lg border border-slate-800">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 font-mono">SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-[#070A0F] border border-slate-700/80 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-400 cursor-pointer"
          >
            <option value="recent">MOST RECENT</option>
            <option value="quality">HIGHEST QUALITY</option>
            <option value="oldest">OLDEST FIRST</option>
          </select>
        </div>
      </div>

      {/* Primary Dedicated Station Tabs (Reddit, Hugging Face, Tech News) */}
      <div className="flex flex-wrap items-center gap-2 bg-[#090D14] p-2 rounded-xl border border-slate-800">
        {sourceHubs.map((hub) => {
          const Icon = hub.icon;
          const isActive = selectedSourceType === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => handleTypeSelect(hub.id)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-[#121824] border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>[{hub.label}]</span>
            </button>
          );
        })}
      </div>

      {/* Search Input Bar - High-Contrast Monospace */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="SEARCH RAW STREAM (LLMS, PAPERS, VLLM, REPOS, BREAKING TECH)..."
          className="w-full bg-[#090D14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 shadow-inner"
        />
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-500 mr-1 uppercase">TOPIC:</span>
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
            !selectedCategory
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold'
              : 'bg-[#0A0E17] text-slate-400 border-slate-800 hover:border-slate-700'
          }`}
        >
          ALL TOPICS
        </button>
        {categories?.map((c) => (
          <button
            key={c.category}
            onClick={() => handleCategorySelect(c.category)}
            className={`px-2 py-0.5 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
              selectedCategory === c.category
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 font-semibold'
                : 'bg-[#0A0E17] text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            {c.category.toUpperCase()} ({c.count})
          </button>
        ))}
      </div>

      {/* Records Feed */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : records?.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-slate-500" />}
          title="No Intel Records In This Filter"
          description="Click 'ALL FEEDS' or check the live ticker to sync new signals."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {records?.map((record) => {
            const isReddit = record.source_type === 'reddit';
            const isHF = record.source_type === 'huggingface';
            const isTechNews = record.source_type === 'technews';

            return (
              <div
                key={record.id}
                className="bg-[#090D14] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all hover:border-emerald-500/60"
              >
                {/* Header Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isReddit
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : isHF
                          ? 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                          : isTechNews
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        [{(record.source_type || 'web').toUpperCase()}]
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 bg-[#06090E] px-2 py-0.5 rounded border border-slate-800">
                        {record.category}
                      </span>
                    </div>

                    <span
                      title="Quality score based on data completeness"
                      className="text-[10px] font-mono font-bold text-emerald-400 bg-[#06090E] px-2 py-0.5 rounded border border-slate-800"
                    >
                      QS: {record.quality_score}/100
                    </span>
                  </div>

                  {/* Title */}
                  <a
                    href={record.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-100 hover:text-emerald-300 transition-colors block leading-snug line-clamp-2"
                  >
                    {record.title}
                  </a>

                  {/* Description */}
                  {record.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {record.description}
                    </p>
                  )}

                  {/* Tags */}
                  {record.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {record.tags.split(',').slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono text-slate-500 bg-[#06090E] px-1.5 py-0.5 rounded border border-slate-800/80"
                        >
                          #{t.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[10px] font-mono text-slate-500 truncate mr-2">
                    {new Date(record.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {record.source_name || record.source_type}
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleAskAI(record)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-[#121824] rounded border border-slate-800 transition-colors"
                      title="AI Deep Summary"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleBookmarkMutation.mutate(record.id)}
                      className={`p-1.5 rounded border transition-colors ${
                        record.is_bookmarked
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                          : 'text-slate-400 hover:text-white hover:bg-[#121824] border-slate-800'
                      }`}
                      title={record.is_bookmarked ? 'Bookmarked' : 'Add Bookmark'}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleCopyLink(record)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-[#121824] rounded border border-slate-800 transition-colors"
                      title="Copy URL"
                    >
                      {copiedId === record.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <a
                      href={record.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-[#121824] rounded border border-slate-800 transition-colors"
                      title="Open Source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Intelligence Modal */}
      {aiModalRecord && (
        <Modal
          isOpen={!!aiModalRecord}
          onClose={() => setAiModalRecord(null)}
          title={`[AI SYNTHESIS] ${aiModalRecord.title}`}
        >
          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {aiModalRecord.category}
              </span>
              <span className="text-slate-500">Source: {aiModalRecord.original_url}</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#06090E] border border-slate-800 leading-relaxed text-slate-200 whitespace-pre-wrap">
              {isAiLoading ? (
                <div className="flex items-center space-x-2 text-emerald-400 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Synthesizing intelligence from primary source text...</span>
                </div>
              ) : (
                aiAnswer
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setAiModalRecord(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
