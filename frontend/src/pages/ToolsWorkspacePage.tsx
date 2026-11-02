import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  Wrench,
  Globe,
  Upload,
  CheckCircle,
  Copy,
  Sparkles,
  Database,
  Layers,
  ArrowRight,
  AlertCircle,
  Send,
  MessageSquare,
  Zap,
  Star,
  GitFork,
  Tag,
  Search,
  ExternalLink,
  ShieldCheck,
  Code2,
  BookmarkPlus
} from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ToolsWorkspacePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tool-gatherer';

  // Tool 0: Tool Gatherer
  const [gatherInput, setGatherInput] = useState('');
  const [gatherCategoryFilter, setGatherCategoryFilter] = useState('All');
  const [gatherLoading, setGatherLoading] = useState(false);
  const [gatherResult, setGatherResult] = useState<any | null>(null);
  const [gatherError, setGatherError] = useState<string | null>(null);

  const { data: curatedTools, isLoading: curatedLoading } = useQuery({
    queryKey: ['curated-tools'],
    queryFn: api.getCuratedTools,
  });

  const handleGatherTool = async (e: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = (customQuery || gatherInput).trim();
    if (!query) return;

    setGatherLoading(true);
    setGatherError(null);
    setGatherResult(null);

    try {
      const res = await api.gatherTool(query);
      setGatherResult(res);
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    } catch (err: any) {
      setGatherError(err.message || 'Failed to gather tool intelligence');
    } finally {
      setGatherLoading(false);
    }
  };

  // Tool 1: URL Collector
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<any | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Tool 2: CSV / JSON Importer
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Tool 3: AI Assistant Interactive Chat
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMode, setAiMode] = useState('collection_aware');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<
    Array<{ q: string; a: string; citations: any[]; provider: string }>
  >([]);

  // Tool 4: Duplicate Stats
  const { data: dupeStats, refetch: refetchDupeStats } = useQuery({
    queryKey: ['duplicate-stats'],
    queryFn: api.getDuplicateStats,
    enabled: activeTab === 'data-cleaner',
  });

  // Tool 5: Fast Batch Scraper
  const [batchUrlsInput, setBatchUrlsInput] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const handleBatchScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const urls = batchUrlsInput
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 5);
    if (urls.length === 0) return;
    setBatchLoading(true);
    setBatchError(null);
    setBatchResult(null);
    try {
      const res = await api.scrapeBatch(urls);
      setBatchResult(res);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (err: any) {
      setBatchError(err.message || 'Batch scrape failed');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleCollectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setUrlLoading(true);
    setUrlError(null);
    setUrlResult(null);
    try {
      const res = await api.collectUrl(urlInput.trim(), true);
      setUrlResult(res);
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (err: any) {
      setUrlError(err.message || 'Failed to collect URL');
    } finally {
      setUrlLoading(false);
    }
  };

  const handleImportFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    setImportLoading(true);
    setImportError(null);
    setImportResult(null);
    try {
      const res = await api.importFile(selectedFile);
      setImportResult(res);
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['records'] });
    } catch (err: any) {
      setImportError(err.message || 'Failed to import file');
    } finally {
      setImportLoading(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    try {
      const res = await api.askAI(aiQuestion.trim(), aiMode);
      setAiHistory((prev) => [
        {
          q: aiQuestion.trim(),
          a: res.answer || (res as any).response || '',
          citations: res.citations || [],
          provider: res.provider || 'Local Deterministic Synthesizer',
        },
        ...prev,
      ]);
      setAiQuestion('');
    } catch (err: any) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const filteredCuratedTools = (curatedTools || []).filter((tool: any) => {
    if (gatherCategoryFilter === 'All') return true;
    return tool.category.toLowerCase().includes(gatherCategoryFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-sky-400" />
            <span>Tools & Gathering Hub</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Active tool harvester, parallel web scraping laboratory, file ingestion, and AI evidence synthesis.
          </p>
        </div>
      </div>

      {/* Distinct Laboratory Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'tool-gatherer', label: 'Tool Gathering Station', icon: Search, badge: 'New' },
          { id: 'batch-scraper', label: 'Fast Batch Scraper', icon: Zap },
          { id: 'url-collector', label: 'Single URL Inspector', icon: Globe },
          { id: 'file-importer', label: 'CSV / JSON Ingestion', icon: Upload },
          { id: 'data-cleaner', label: 'Duplicate Inspector', icon: Database },
          { id: 'ai-assistant', label: 'AI Evidence Assistant', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', tab.id);
                setSearchParams(params);
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-space-800 text-slate-400 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono font-bold bg-purple-500/30 text-purple-200 px-1.5 py-0.2 rounded border border-purple-500/40">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 0: Tool Gathering Station */}
      {activeTab === 'tool-gatherer' && (
        <div className="space-y-6">
          {/* Harvester Input Card */}
          <div className="antigravity-card p-5 rounded-2xl border-purple-500/30 bg-space-900/80 space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-400" />
                <h3 className="text-base font-bold text-white">Active Tool & Repository Harvester</h3>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Auto-Enriching
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter any GitHub repository slug (e.g. <code className="text-sky-300">vllm-project/vllm</code>, <code className="text-sky-300">ollama/ollama</code>) or public product URL. Scoutboard automatically extracts stargazers, forks, tech stack, license, and catalogs it as indexed intelligence.
              </p>
            </div>

            <form onSubmit={handleGatherTool} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. astral-sh/uv or https://github.com/shadcn-ui/ui"
                value={gatherInput}
                onChange={(e) => setGatherInput(e.target.value)}
                className="flex-1 bg-space-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-xs"
              />
              <Button variant="primary" size="md" type="submit" isLoading={gatherLoading} leftIcon={<Sparkles className="w-4 h-4" />}>
                Gather & Catalog Tool
              </Button>
            </form>

            {gatherError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{gatherError}</span>
              </div>
            )}

            {gatherResult && (
              <div className="p-4 bg-purple-950/20 border border-purple-500/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-emerald-300">
                      Tool Cataloged Successfully {gatherResult.is_new ? '(New)' : '(Updated)'}
                    </span>
                  </div>
                  <Badge variant="purple">{gatherResult.tool?.category}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-space-950/80 p-3 rounded-lg border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">TOOL NAME</span>
                    <span className="text-white font-bold">{gatherResult.tool?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GITHUB STARS</span>
                    <span className="text-amber-400 font-bold flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{gatherResult.tool?.stars?.toLocaleString()}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LANGUAGE / STACK</span>
                    <span className="text-sky-300 font-bold">{gatherResult.tool?.language}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">LICENSE</span>
                    <span className="text-emerald-400 font-bold">{gatherResult.tool?.license}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{gatherResult.tool?.description}</p>
              </div>
            )}
          </div>

          {/* Curated Best Tools Gallery */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <span>Curated High-Impact Tools Directory</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-vetted industry benchmark tools across AI, scraping, databases, and developer infrastructure.
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1">
                {['All', 'AI', 'Scraping', 'Databases', 'Productivity', 'UI'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setGatherCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      gatherCategoryFilter === cat
                        ? 'bg-purple-600 text-white'
                        : 'bg-space-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCuratedTools.map((tool: any, idx: number) => (
                <div
                  key={idx}
                  className="antigravity-card p-4 rounded-xl border-slate-800/80 bg-space-900/60 flex flex-col justify-between hover:border-purple-500/40 transition-all space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                        {tool.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{tool.stars.toLocaleString()}</span>
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <span>{tool.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 font-normal">({tool.repo})</span>
                    </h4>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center space-x-1 text-slate-300">
                        <Code2 className="w-3 h-3 text-purple-400" />
                        <span>{tool.language}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{tool.license}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
                    >
                      <span>Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<BookmarkPlus className="w-3.5 h-3.5 text-purple-400" />}
                      onClick={(e) => handleGatherTool(e as any, tool.repo)}
                    >
                      Gather Tool
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Single URL Inspector */}
      {activeTab === 'url-collector' && (
        <div className="space-y-6 max-w-3xl">
          <Card title="Live Webpage Collector" subtitle="Fetch, extract title/description, and index URL directly.">
            <form onSubmit={handleCollectUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Target Public Web URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/article"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                  <Button variant="primary" size="md" type="submit" isLoading={urlLoading}>
                    Collect & Index
                  </Button>
                </div>
              </div>

              <div className="p-3 bg-space-950/60 border border-slate-800 rounded-lg text-xs text-slate-400 space-y-1 font-mono">
                <span className="text-emerald-400 font-semibold block">ACTIVE SECURITY SAFEGUARDS</span>
                <div>• Private IPs (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, loopback) automatically blocked.</div>
                <div>• Cloud metadata endpoints (169.254.169.254, metadata.google.internal) strictly forbidden.</div>
                <div>• Strict 5MB payload limit and 15s timeout enforced.</div>
              </div>

              {urlError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{urlError}</span>
                </div>
              )}

              {urlResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Extraction Succeeded</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-200">{urlResult.extracted?.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{urlResult.extracted?.description}</p>
                  <div className="text-[11px] font-mono text-slate-500 pt-1">
                    Canonical URL: {urlResult.extracted?.original_url}
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Tab 2: Fast Batch Scraper */}
      {activeTab === 'batch-scraper' && (
        <div className="space-y-6 max-w-3xl">
          <Card
            title="Fast Batch Multi-URL Scraper"
            subtitle="Scrape up to 20 websites in parallel with worker pooling, text extraction, and deduplication."
          >
            <form onSubmit={handleBatchScrape} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Target URLs (One per line, up to 20 URLs)
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder={`https://news.ycombinator.com\nhttps://huggingface.co/papers\nhttps://techcrunch.com`}
                  value={batchUrlsInput}
                  onChange={(e) => setBatchUrlsInput(e.target.value)}
                  className="w-full bg-space-900 border border-slate-700/80 rounded-lg p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Runs concurrently with 10 async workers and SSRF validation.
                </span>
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={batchLoading}
                  leftIcon={<Zap className="w-4 h-4 text-amber-300" />}
                >
                  Start Fast Batch Scrape
                </Button>
              </div>

              {batchError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{batchError}</span>
                </div>
              )}

              {batchResult && (
                <div className="p-4 bg-space-900/90 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>
                        Scraped {batchResult.scraped_count} / {batchResult.total_urls} URLs in{' '}
                        {batchResult.duration_seconds}s
                      </span>
                    </span>
                    <Badge variant="emerald">{batchResult.saved_to_db} Saved to DB</Badge>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                    {batchResult.records?.map((rec: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-space-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div className="truncate flex-1 mr-2">
                          <span className="font-semibold text-slate-200 block truncate">{rec.title}</span>
                          <span className="text-[10px] text-slate-400 truncate block">{rec.original_url}</span>
                        </div>
                        <Badge variant="purple" size="sm">
                          {rec.category}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Tab 3: File Ingestion */}
      {activeTab === 'file-importer' && (
        <div className="space-y-6 max-w-3xl">
          <Card
            title="CSV & JSON File Ingestion"
            subtitle="Upload structured data files. System extracts columns, dedupes, and creates records."
          >
            <form onSubmit={handleImportFile} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                  Upload Dataset File (.csv or .json)
                </label>
                <input
                  type="file"
                  accept=".csv, .json"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                />
              </div>

              <Button variant="primary" size="md" type="submit" isLoading={importLoading} disabled={!selectedFile}>
                Upload & Ingest File
              </Button>

              {importError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs">
                  {importError}
                </div>
              )}

              {importResult && (
                <div className="p-4 bg-space-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="text-emerald-400 font-semibold flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4" />
                    <span>File Ingested Successfully</span>
                  </div>
                  <div className="font-mono text-slate-300">
                    Total Rows: {importResult.summary?.total_rows} | Saved:{' '}
                    {importResult.summary?.saved_to_db} | Skipped Duplicates:{' '}
                    {importResult.summary?.duplicates_skipped}
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Tab 4: Duplicate Inspector */}
      {activeTab === 'data-cleaner' && (
        <div className="space-y-6 max-w-3xl">
          <Card
            title="Duplicate & Data Hygiene Inspector"
            subtitle="Scans collected items for title collisions, near-duplicates, and fingerprint conflicts."
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-space-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">Duplicate Groups Found</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {dupeStats?.potential_duplicate_groups || 0}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => refetchDupeStats()}>
                  Rescan Hygiene
                </Button>
              </div>

              {dupeStats?.details && dupeStats.details.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase font-mono">
                    Top Colliding Titles
                  </h4>
                  {dupeStats.details.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-space-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-200 truncate flex-1 mr-2">{d.title}</span>
                      <Badge variant="amber">{d.count} occurrences</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-space-950/40 rounded-xl border border-slate-800">
                  Zero critical duplicate collisions detected in active database records.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: AI Assistant */}
      {activeTab === 'ai-assistant' && (
        <div className="space-y-6 max-w-4xl">
          <Card
            title="AI Evidence & Research Synthesizer"
            subtitle="Ask grounded questions about your collected records. Includes source citations and verification tokens."
          >
            <div className="space-y-4">
              <form onSubmit={handleAskAI} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. What are the key debates in local LLMs or recent AI news?"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="flex-1 bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    isLoading={aiLoading}
                    leftIcon={<Send className="w-4 h-4" />}
                  >
                    Ask Assistant
                  </Button>
                </div>
              </form>

              {/* Chat History */}
              <div className="space-y-4 pt-4">
                {aiHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-space-950 border border-slate-800/80 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                      <span className="font-semibold flex items-center space-x-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Query: {item.q}</span>
                      </span>
                      <Badge variant="slate" size="sm">
                        {item.provider}
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-space-900/60 p-3 rounded-lg border border-slate-800/60">
                      {item.a}
                    </div>

                    {item.citations && item.citations.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-mono uppercase text-slate-400">
                          Grounded Citations:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {item.citations.map((c, cIdx) => (
                            <a
                              key={cIdx}
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-mono text-sky-400 hover:underline bg-space-850 px-2 py-0.5 rounded border border-slate-800 flex items-center space-x-1"
                            >
                              <span>{c.title}</span>
                              <ArrowRight className="w-3 h-3 inline" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {aiHistory.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-500 font-mono">
                    No inquiries yet. Enter a research query above to synthesize insights from collected records.
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
