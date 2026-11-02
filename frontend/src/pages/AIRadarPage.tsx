import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Cpu,
  Sparkles,
  Layers,
  FileText,
  ExternalLink,
  Search,
  Scale,
  DollarSign,
  Zap,
  CheckCircle2,
  Lock,
  Unlock,
  Award,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { AIModel, AIBenchmarkItem, AIPaper } from '../types';
import { Button } from '../components/ui/Button';

export const AIRadarPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'papers' | 'compare'>('matrix');
  const [orgFilter, setOrgFilter] = useState<string>('All');
  const [weightsFilter, setWeightsFilter] = useState<'all' | 'open' | 'closed'>('all');
  const [search, setSearch] = useState('');

  // Queries
  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['aiModels', orgFilter, weightsFilter, search],
    queryFn: () => {
      let is_open: boolean | undefined = undefined;
      if (weightsFilter === 'open') is_open = true;
      if (weightsFilter === 'closed') is_open = false;
      return api.getAIModels({
        organization: orgFilter === 'All' ? undefined : orgFilter,
        is_open_weights: is_open,
        search: search.trim() || undefined,
      });
    },
  });

  const { data: benchmarks = [] } = useQuery({
    queryKey: ['aiBenchmarks'],
    queryFn: () => api.getAIBenchmarks(),
  });

  const { data: papers = [] } = useQuery({
    queryKey: ['aiPapers'],
    queryFn: () => api.getAIPapers(20),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
              Frontier Model Intelligence
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-400">Open-Weights vs Proprietary Benchmark Radar</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">AI Radar & Model Comparisons</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Systematic tracking of frontier reasoning models, ArXiv preprint breakthroughs, and open-weights parameter benchmarks.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-mono ${
              activeTab === 'matrix' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Model Matrix
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-mono ${
              activeTab === 'compare' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Benchmark Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`px-3 py-1 rounded transition-colors text-[11px] font-mono ${
              activeTab === 'papers' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ArXiv & HF Papers ({papers.length})
          </button>
        </div>
      </div>

      {/* Primary Tab: Model Directory Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0E0E12] border border-zinc-800 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
              {['All', 'Anthropic', 'Google DeepMind', 'DeepSeek', 'Meta', 'Mistral AI', 'Alibaba'].map((org) => (
                <button
                  key={org}
                  onClick={() => setOrgFilter(org)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                    orgFilter === org
                      ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                  }`}
                >
                  {org}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded p-0.5 text-xs">
                <button
                  onClick={() => setWeightsFilter('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    weightsFilter === 'all' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setWeightsFilter('open')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    weightsFilter === 'open' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                  }`}
                >
                  Open Weights
                </button>
                <button
                  onClick={() => setWeightsFilter('closed')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    weightsFilter === 'closed' ? 'bg-zinc-800 text-white' : 'text-zinc-400'
                  }`}
                >
                  Proprietary
                </button>
              </div>

              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter models..."
                  className="w-full bg-[#141418] border border-zinc-750 focus:border-indigo-500 text-xs text-zinc-200 placeholder-zinc-500 rounded pl-8 pr-2.5 py-1 outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* Table Matrix */}
          <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-[#121216] text-[11px] font-mono text-zinc-400">
                    <th className="py-2.5 px-4 font-medium">MODEL ARCHITECTURE</th>
                    <th className="py-2.5 px-3 font-medium">ORGANIZATION</th>
                    <th className="py-2.5 px-3 font-medium">WEIGHTS & LICENSE</th>
                    <th className="py-2.5 px-3 font-medium">CONTEXT WINDOW</th>
                    <th className="py-2.5 px-3 font-medium">TOKEN PRICING</th>
                    <th className="py-2.5 px-4 font-medium text-right">SPECS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {modelsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                        Loading AI model intelligence...
                      </td>
                    </tr>
                  ) : models.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                        No AI models match current criteria.
                      </td>
                    </tr>
                  ) : (
                    models.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-850/40 transition-colors group">
                        {/* Name & Overview */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors text-sm">
                              {m.name}
                            </span>
                            <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-sm">
                              {m.overview}
                            </p>
                          </div>
                        </td>

                        {/* Org */}
                        <td className="py-3 px-3">
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300">
                            {m.organization}
                          </span>
                        </td>

                        {/* Weights & License */}
                        <td className="py-3 px-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            {m.is_open_weights ? (
                              <Unlock className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Lock className="w-3 h-3 text-zinc-500" />
                            )}
                            <span className="text-zinc-200">
                              {m.is_open_weights ? 'Open Weights' : 'Proprietary'}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 block">{m.license}</span>
                        </td>

                        {/* Context Window */}
                        <td className="py-3 px-3 font-mono text-zinc-200">
                          <span className="font-medium">
                            {(m.context_window / 1000).toLocaleString()}k
                          </span>{' '}
                          <span className="text-[10px] text-zinc-500">tokens</span>
                        </td>

                        {/* Token Pricing */}
                        <td className="py-3 px-3 font-mono text-xs">
                          {m.pricing_input_per_m !== undefined && m.pricing_input_per_m !== null ? (
                            <div>
                              <span className="text-zinc-200">${m.pricing_input_per_m.toFixed(2)}</span>
                              <span className="text-[10px] text-zinc-500"> / ${m.pricing_output_per_m?.toFixed(2)} 1M</span>
                            </div>
                          ) : (
                            <span className="text-emerald-400 text-[10px]">Free / Self-Host</span>
                          )}
                        </td>

                        {/* External Specs Link */}
                        <td className="py-3 px-4 text-right">
                          {m.external_url && (
                            <a
                              href={m.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-white transition-colors p-1 inline-block"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Two: Benchmark Leaderboard */}
      {activeTab === 'compare' && (
        <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
          <div className="p-3 bg-[#121216] border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-300 font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Standardized Benchmark Performance Leaderboard
            </span>
            <span className="text-[10px] font-mono text-zinc-500">Ranked by LMSYS Arena Elo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-[#141418] text-[11px] font-mono text-zinc-400">
                  <th className="py-2.5 px-4 font-medium">MODEL</th>
                  <th className="py-2.5 px-3 font-medium">DEVELOPER</th>
                  <th className="py-2.5 px-3 font-medium text-center">ARENA ELO</th>
                  <th className="py-2.5 px-3 font-medium text-center">MMLU</th>
                  <th className="py-2.5 px-3 font-medium text-center">HUMANEVAL</th>
                  <th className="py-2.5 px-3 font-medium text-center">MATH</th>
                  <th className="py-2.5 px-3 font-medium">WEIGHTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {benchmarks.map((b, idx) => (
                  <tr key={idx} className="hover:bg-zinc-850/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-zinc-100 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 w-4">{idx + 1}.</span>
                      <span>{b.name}</span>
                    </td>
                    <td className="py-3 px-3 text-zinc-300 font-mono text-[11px]">{b.organization}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-amber-400">{b.arena_elo}</td>
                    <td className="py-3 px-3 text-center font-mono text-zinc-200">{b.mmlu}%</td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">{b.humaneval}%</td>
                    <td className="py-3 px-3 text-center font-mono text-indigo-400">{b.math}%</td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {b.is_open_weights ? (
                        <span className="text-emerald-400">Open ({b.license})</span>
                      ) : (
                        <span className="text-zinc-500">Proprietary</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Three: ArXiv & HF Research Papers */}
      {activeTab === 'papers' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider">
              Recent Preprints & Hugging Face Upvoted Publications ({papers.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {papers.map((p) => (
              <div
                key={p.id}
                className="bg-[#0E0E12] border border-zinc-800 hover:border-zinc-700 transition-colors rounded p-4 space-y-2 group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-indigo-300">
                        Preprint / Research
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">{p.authors}</span>
                    </div>

                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-zinc-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{p.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>

                    <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
                      {p.summary}
                    </p>
                  </div>

                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 bg-indigo-950/20 px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1"
                  >
                    <span>Read Paper</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
