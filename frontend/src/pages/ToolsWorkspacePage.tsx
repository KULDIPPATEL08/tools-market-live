import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const ToolsWorkspacePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'url-collector';

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
    } catch (err: any) {
      setImportError(err.message || 'File import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    const q = aiQuestion.trim();
    setAiQuestion('');
    setAiLoading(true);
    try {
      const res = await api.askAI(q, aiMode);
      setAiHistory((prev) => [
        ...prev,
        { q, a: res.answer, citations: res.citations, provider: res.provider },
      ]);
    } catch (err: any) {
      setAiHistory((prev) => [
        ...prev,
        {
          q,
          a: 'Error synthesizing answer. Ensure the backend server is running.',
          citations: [],
          provider: 'system',
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Tools Workspace</span>
            <span className="text-xs font-mono font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
              Intelligence Utilities
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Functional tools for URL extraction, dataset ingestion, duplicate inspection, and AI synthesis.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'url-collector', label: 'URL Collector', icon: Globe },
          { id: 'batch-scraper', label: 'Fast Batch Scraper', icon: Zap },
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
            </button>
          );
        })}
      </div>

      {/* Tab 1: URL Collector */}
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
                  Target URLs (One per line)
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder={"https://news.ycombinator.com\nhttps://techcrunch.com/category/artificial-intelligence/\nhttps://huggingface.co/papers"}
                  value={batchUrlsInput}
                  onChange={(e) => setBatchUrlsInput(e.target.value)}
                  className="w-full bg-space-900 font-mono border border-slate-700/80 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>

              <div className="flex justify-between items-center pt-1">
                <span className="text-[11px] font-mono text-slate-500">
                  Runs with max concurrency of 8 workers with SSRF validation.
                </span>
                <Button variant="primary" size="md" type="submit" isLoading={batchLoading} leftIcon={<Zap className="w-3.5 h-3.5" />}>
                  Start Parallel Scrape
                </Button>
              </div>

              {batchError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{batchError}</span>
                </div>
              )}

              {batchResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Parallel Batch Scraping Succeeded</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-1">
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">SCRAPED URLS</span>
                      <span className="text-slate-100 font-bold">{batchResult.scraped_count}</span>
                    </div>
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-emerald-400 block text-[10px]">SAVED NEW</span>
                      <span className="text-emerald-400 font-bold">+{batchResult.saved_count}</span>
                    </div>
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-amber-400 block text-[10px]">DUPLICATES SKIPPED</span>
                      <span className="text-amber-400 font-bold">{batchResult.duplicates_skipped}</span>
                    </div>
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
          <Card title="CSV / JSON Dataset Ingestion" subtitle="Upload structured files to parse and store into Scoutboard records.">
            <form onSubmit={handleImportFile} className="space-y-4">
              <div className="border-2 border-dashed border-slate-700/80 rounded-xl p-8 text-center bg-space-900/50 hover:bg-space-900 transition-colors">
                <Upload className="w-8 h-8 text-sky-400 mx-auto mb-2" />
                <label className="block text-sm font-semibold text-slate-200 mb-1 cursor-pointer">
                  {selectedFile ? selectedFile.name : 'Select CSV or JSON file'}
                  <input
                    type="file"
                    accept=".csv,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                    }}
                  />
                </label>
                <p className="text-xs text-slate-500">Supports standard CSV with headers or JSON array (up to 10MB)</p>
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <Button variant="primary" size="md" type="submit" isLoading={importLoading}>
                    Process & Import File
                  </Button>
                </div>
              )}

              {importError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    <span>File Ingestion Complete</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">TOTAL ROWS</span>
                      <span className="text-slate-100 font-bold">{importResult.summary?.total_rows || importResult.summary?.total_items}</span>
                    </div>
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-emerald-400 block text-[10px]">SAVED RECORDS</span>
                      <span className="text-emerald-400 font-bold">+{importResult.summary?.saved_to_db}</span>
                    </div>
                    <div className="p-2 bg-space-950 rounded border border-slate-800">
                      <span className="text-amber-400 block text-[10px]">DUPLICATES SKIPPED</span>
                      <span className="text-amber-400 font-bold">{importResult.summary?.duplicates_skipped}</span>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Tab 3: Duplicate Detector */}
      {activeTab === 'data-cleaner' && (
        <div className="space-y-6 max-w-3xl">
          <Card title="Duplicate Detector & Data Integrity" subtitle="Deterministic SHA-256 fingerprint scanning.">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-space-900 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">DUPLICATE GROUPS</span>
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {dupeStats?.potential_duplicate_groups ?? 0}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Identified based on exact title matching</p>
                </div>
                <div className="p-4 rounded-xl bg-space-900 border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">DEDUPLICATION STRATEGY</span>
                  <span className="text-sm font-semibold text-slate-200">SHA-256 + Canonical URL</span>
                  <p className="text-[11px] text-slate-500 mt-1">Strips utm_* tracking and normalizes whitespace</p>
                </div>
              </div>

              {dupeStats?.details && dupeStats.details.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                    Duplicate Title Groups:
                  </span>
                  <div className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-space-900 overflow-hidden">
                    {dupeStats.details.map((d: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium truncate max-w-md">{d.title}</span>
                        <span className="font-mono text-amber-400 font-semibold">{d.count} occurrences</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  Zero duplicate title groups detected! Your intelligence collection base is clean and deduplicated.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 4: AI Research Assistant */}
      {activeTab === 'ai-assistant' && (
        <div className="space-y-6 max-w-3xl">
          <Card
            title="AI Evidence Research Assistant"
            subtitle="Queries only verified primary sources collected in your Scoutboard database with exact citations."
          >
            <div className="space-y-4">
              {/* Mode Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400 uppercase">Mode:</span>
                {[
                  { id: 'collection_aware', label: 'Collection-Aware Q&A' },
                  { id: 'research_assistant', label: 'Research Synthesizer' },
                  { id: 'discovery_assistant', label: 'Gap & Opportunity Finder' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAiMode(m.id)}
                    className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                      aiMode === m.id
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-semibold'
                        : 'bg-space-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="min-h-[220px] max-h-[420px] overflow-y-auto space-y-4 p-4 rounded-xl bg-space-900 border border-slate-800">
                {aiHistory.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">
                    Ask questions like "What are the common challenges in local AI deployment?" or "Summarize recent transformer benchmarks."
                  </div>
                ) : (
                  aiHistory.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-start space-x-2 justify-end">
                        <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs text-purple-200 max-w-lg">
                          {item.q}
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="p-3 bg-space-850 border border-slate-700/80 rounded-xl text-xs text-slate-200 max-w-2xl leading-relaxed whitespace-pre-wrap">
                          {item.a}
                          {item.citations?.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                              <span className="font-semibold text-sky-400 block uppercase">
                                Grounded Citations:
                              </span>
                              {item.citations.map((c, i) => (
                                <a
                                  key={i}
                                  href={c.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-sky-300 hover:underline truncate"
                                >
                                  [{c.record_id}] {c.title} ({c.source})
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {aiLoading && (
                  <div className="text-xs font-mono text-slate-400 p-3 animate-pulse">
                    Synthesizing response from verified evidence...
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleAskAI} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about your collected intelligence..."
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  className="flex-1 bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <Button variant="primary" size="md" type="submit" isLoading={aiLoading} leftIcon={<Send className="w-3.5 h-3.5" />}>
                  Ask AI
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

