import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Sparkles,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { IntelligenceBriefing } from '../types';
import { Button } from '../components/ui/Button';

export const BriefingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedBriefing, setSelectedBriefing] = useState<IntelligenceBriefing | null>(null);
  const [selectedType, setSelectedType] = useState<'daily' | 'startup' | 'ai'>('daily');
  const [copied, setCopied] = useState(false);

  // Query Briefings
  const { data: briefings = [], isLoading } = useQuery({
    queryKey: ['briefings'],
    queryFn: () => api.getBriefings(15),
  });

  // Default to first briefing if none selected
  const activeBriefing = selectedBriefing || (briefings.length > 0 ? briefings[0] : null);

  // Generate Mutation
  const generateMutation = useMutation({
    mutationFn: () => api.generateBriefing({ briefing_type: selectedType }),
    onSuccess: (newBriefing) => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      setSelectedBriefing(newBriefing);
    },
  });

  const handleCopyMarkdown = () => {
    if (!activeBriefing) return;
    const md = `# ${activeBriefing.title}
Date: ${activeBriefing.date || activeBriefing.created_at}
Type: ${activeBriefing.briefing_type.toUpperCase()}

## Executive Summary
${activeBriefing.executive_summary}

## Key Developments
${activeBriefing.key_developments.map((d) => `- ${d}`).join('\n')}

## Strategic Takeaways
${activeBriefing.strategic_takeaways.map((t) => `- ${t}`).join('\n')}

## Sources Cited
${activeBriefing.sources_cited.map((s) => `- [${s.title}](${s.url})`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 px-2 py-0.5 rounded">
              Strategic Dossier Synthesis
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-400">Automated Intelligence Briefings</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Intelligence Briefings</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Consolidated situational awareness digests generated across verified signals, venture shifts, and model releases.
          </p>
        </div>

        {/* Generate Trigger */}
        <div className="flex items-center gap-2">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="bg-[#141418] border border-zinc-750 text-xs font-mono text-zinc-200 rounded px-2.5 py-1.5 outline-none"
          >
            <option value="daily">Daily General Digest</option>
            <option value="startup">Startup & Voids Radar</option>
            <option value="ai">AI Ecosystem Frontier</option>
          </select>
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{generateMutation.isPending ? 'Synthesizing...' : 'Generate New Briefing'}</span>
          </Button>
        </div>
      </div>

      {/* Main Split Layout: Briefing Feed & Active Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Dossier List (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-mono uppercase text-zinc-500 tracking-wider block px-1">
            Historical Dossiers ({briefings.length})
          </span>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading dossiers...</div>
          ) : briefings.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 font-mono border border-dashed border-zinc-800 rounded">
              No briefings generated yet. Click Generate above.
            </div>
          ) : (
            <div className="space-y-2">
              {briefings.map((b) => {
                const isSelected = activeBriefing?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBriefing(b)}
                    className={`w-full text-left p-3.5 rounded border transition-all ${
                      isSelected
                        ? 'bg-[#141418] border-indigo-500/80 shadow-sm'
                        : 'bg-[#0E0E12] border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-zinc-850 text-indigo-300 border border-zinc-750">
                        {b.briefing_type}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xs font-semibold text-zinc-100 line-clamp-1">{b.title}</h3>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                      {b.executive_summary}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Briefing Full View (8 cols) */}
        <div className="lg:col-span-8">
          {activeBriefing ? (
            <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg p-6 space-y-6 shadow-sm">
              {/* Header Bar */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                      {activeBriefing.briefing_type} BRIEFING
                    </span>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-[11px] font-mono text-zinc-400">
                      {activeBriefing.date ? new Date(activeBriefing.date).toUTCString() : activeBriefing.created_at}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white tracking-tight">{activeBriefing.title}</h2>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMarkdown}
                  className="text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copied ? 'Copied MD' : 'Copy Markdown'}</span>
                </Button>
              </div>

              {/* Executive Summary */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Executive Summary</span>
                <div className="bg-[#141418] border border-zinc-800 rounded p-4 text-xs text-zinc-300 leading-relaxed font-sans">
                  {activeBriefing.executive_summary}
                </div>
              </div>

              {/* Key Developments */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Key Developments Monitored</span>
                <div className="space-y-2">
                  {activeBriefing.key_developments.map((dev, idx) => (
                    <div key={idx} className="bg-[#121216] border border-zinc-800/80 rounded p-3 text-xs text-zinc-200 flex items-start gap-2.5">
                      <span className="text-indigo-400 font-mono text-[11px] font-bold mt-0.5">{idx + 1}.</span>
                      <span className="leading-relaxed">{dev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Takeaways */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">Strategic Takeaways</span>
                <div className="space-y-1.5 bg-emerald-950/10 border border-emerald-900/30 rounded p-3.5">
                  {activeBriefing.strategic_takeaways.map((takeaway, idx) => (
                    <div key={idx} className="text-xs text-emerald-300/90 flex items-start gap-2">
                      <span className="text-emerald-400 font-mono text-[10px] mt-0.5">•</span>
                      <span>{takeaway}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verified Sources Cited */}
              {activeBriefing.sources_cited.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">
                    Verified Sources Cited ({activeBriefing.sources_cited.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeBriefing.sources_cited.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors"
                      >
                        <span className="truncate max-w-xs">{s.title}</span>
                        <ExternalLink className="w-3 h-3 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-zinc-800 rounded-lg p-12 text-center text-xs text-zinc-500 font-mono">
              Select or generate a briefing to inspect its strategic synthesis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
