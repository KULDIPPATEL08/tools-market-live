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
} from 'lucide-react';
import { api } from '../services/api';
import { CollectedRecord } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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

  return (
    <div className="space-y-6">
      {/* Title & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Discovery Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and analyze verified intelligence records collected from primary sources.
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-mono">SORT BY:</span>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="bg-space-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="quality">Highest Quality Score</option>
            <option value="relevance">Relevance Score</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Filter discoveries by keyword, author, tag, or topic..."
          className="w-full bg-space-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner"
        />
      </div>

      {/* Filter Chips: Category & Source Types */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-2 uppercase">Category:</span>
          <button
            onClick={() => handleCategorySelect('')}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
              !selectedCategory
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                : 'bg-space-800 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            All Categories
          </button>
          {categories?.map((c) => (
            <button
              key={c.category}
              onClick={() => handleCategorySelect(c.category)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                selectedCategory === c.category
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                  : 'bg-space-800 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {c.category} ({c.count})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-2 uppercase">Connector:</span>
          {['rss', 'github', 'hackernews', 'webpage', 'file'].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              className={`px-2 py-0.5 text-xs font-mono rounded border uppercase transition-colors cursor-pointer ${
                selectedSourceType === type
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                  : 'bg-space-800 text-slate-500 border-slate-800 hover:border-slate-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Records Feed */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : records?.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No Discoveries Found"
          description="Try broadening your search query or check the Collection and Sources pages to sync additional feeds."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records?.map((record) => (
            <div
              key={record.id}
              className="antigravity-card rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              {/* Header Badges */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="cyan">{record.category}</Badge>
                    <span className="text-[11px] font-mono text-slate-400">
                      via {record.source_name || record.source_type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span
                      title="Quality score based on data completeness"
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      QS: {record.quality_score}
                    </span>
                  </div>
                </div>

                <a
                  href={record.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-slate-100 hover:text-sky-300 transition-colors block leading-snug line-clamp-2"
                >
                  {record.title}
                </a>

                {record.description && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {record.description}
                  </p>
                )}

                {record.tags && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {record.tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono text-slate-400 bg-space-950 px-2 py-0.5 rounded border border-slate-800"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata and Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="font-mono text-[11px]">
                  {record.author ? `By ${record.author} • ` : ''}
                  {new Date(record.collected_at).toLocaleDateString()}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleAskAI(record)}
                    className="p-1.5 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Synthesize with AI Assistant"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleCopyLink(record)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Copy Citation Link"
                  >
                    {copiedId === record.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => toggleBookmarkMutation.mutate(record.id)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      record.is_bookmarked
                        ? 'text-sky-400 bg-sky-500/10'
                        : 'text-slate-400 hover:text-sky-400 hover:bg-slate-800'
                    }`}
                    title={record.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Discovery'}
                  >
                    <Bookmark className="w-4 h-4" fill={record.is_bookmarked ? 'currentColor' : 'none'} />
                  </button>

                  <a
                    href={record.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Open Primary Source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Synthesis Modal */}
      {aiModalRecord && (
        <Modal
          isOpen={!!aiModalRecord}
          onClose={() => setAiModalRecord(null)}
          title="AI Synthesis & Explainer"
          subtitle={`Grounded on: ${aiModalRecord.title}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3 bg-space-900 border border-slate-800 rounded-lg text-xs space-y-1">
              <span className="font-mono text-sky-400 font-semibold block uppercase">
                Primary Source Grounding
              </span>
              <a
                href={aiModalRecord.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-sky-300 flex items-center space-x-1"
              >
                <span className="truncate">{aiModalRecord.title}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>

            {isAiLoading ? (
              <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
                Synthesizing record findings through local intelligence engine...
              </div>
            ) : (
              <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {aiAnswer}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setAiModalRecord(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
