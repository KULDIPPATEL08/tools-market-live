import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Plus,
  Play,
  RotateCw,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Skull,
  TrendingUp,
  Target,
  Zap,
  Layers,
  Compass,
  ExternalLink,
  Flame,
  Rocket
} from 'lucide-react';
import { api } from '../services/api';
import { Gap, GapStatus } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const GapBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'cemetery'>('cemetery');
  const [isNewGapModalOpen, setIsNewGapModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);

  // New gap form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Dead Startup Gap');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [evidence, setEvidence] = useState('');
  const [suggestedActions, setSuggestedActions] = useState('');

  const { data: gaps, isLoading } = useQuery({
    queryKey: ['gaps'],
    queryFn: () => api.getGaps(),
  });

  const detectGapsMutation = useMutation({
    mutationFn: api.detectGaps,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const scanDeadStartupsMutation = useMutation({
    mutationFn: api.scanDeadStartups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
  });

  const createGapMutation = useMutation({
    mutationFn: (data: Partial<Gap>) => api.createGap(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps'] });
      setIsNewGapModalOpen(false);
      setTitle('');
      setDescription('');
      setEvidence('');
      setSuggestedActions('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: number; status: GapStatus }) =>
      api.updateGap(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps'] });
    },
  });

  const deadStartupGaps = gaps?.filter((g) => g.category?.toLowerCase().includes('dead') || g.title?.toLowerCase().includes('dead') || g.title?.toLowerCase().includes('post-mortem')) || [];
  const developerNeedGaps = gaps?.filter((g) => g.category === 'Developer Need') || [];
  const aiGaps = gaps?.filter((g) => g.title.toLowerCase().includes('ai') || g.title.toLowerCase().includes('llm')) || [];

  const filteredGaps = (gaps || []).filter((gap) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'dead_startups') return gap.category?.toLowerCase().includes('dead') || gap.title.toLowerCase().includes('post-mortem');
    if (activeCategoryFilter === 'developer_needs') return gap.category === 'Developer Need';
    if (activeCategoryFilter === 'ai_gaps') return gap.title.toLowerCase().includes('ai') || gap.title.toLowerCase().includes('llm');
    return true;
  });

  const columns: { status: GapStatus; label: string; color: string }[] = [
    { status: 'new', label: 'New / Detected', color: 'border-sky-500/30' },
    { status: 'investigating', label: 'Investigating', color: 'border-amber-500/30' },
    { status: 'in_progress', label: 'Research In Progress', color: 'border-purple-500/30' },
    { status: 'resolved', label: 'Resolved / Published', color: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Compass className="w-6 h-6 text-purple-400" />
              <span>Market Gaps & Dead Startup Radar</span>
            </h1>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Opportunity Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Extract commercial voids from sunset products, dead startups, and recurring developer challenges. Turn market vacuums into high-signal venture blueprints.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Skull className="w-3.5 h-3.5 text-rose-400" />}
            onClick={() => scanDeadStartupsMutation.mutate()}
            isLoading={scanDeadStartupsMutation.isPending}
            className="border-rose-500/30 hover:border-rose-500/60 text-rose-200"
          >
            Scan Dead Startup Voids
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            onClick={() => detectGapsMutation.mutate()}
            isLoading={detectGapsMutation.isPending}
          >
            Run Full Gap Scan
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewGapModalOpen(true)}
          >
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="antigravity-card p-4 rounded-xl flex items-center justify-between border-purple-500/20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Total Gaps Found</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{gaps?.length || 0}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Target className="w-5 h-5" />
          </div>
        </div>

        <div className="antigravity-card p-4 rounded-xl flex items-center justify-between border-rose-500/20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 flex items-center space-x-1">
              <Skull className="w-3 h-3" />
              <span>Dead Startup Voids</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-1">{deadStartupGaps.length}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="antigravity-card p-4 rounded-xl flex items-center justify-between border-amber-500/20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400">Critical Priority</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {gaps?.filter(g => g.priority === 'critical').length || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="antigravity-card p-4 rounded-xl flex items-center justify-between border-emerald-500/20">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Top Opportunity Index</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">96/100</div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Category Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-space-900/60 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategoryFilter === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-800'
            }`}
          >
            All Opportunities ({gaps?.length || 0})
          </button>

          <button
            onClick={() => setActiveCategoryFilter('dead_startups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeCategoryFilter === 'dead_startups'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-800'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-300" />
            <span>Dead Startup Cemetery ({deadStartupGaps.length})</span>
          </button>

          <button
            onClick={() => setActiveCategoryFilter('developer_needs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategoryFilter === 'developer_needs'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-800'
            }`}
          >
            Developer Needs ({developerNeedGaps.length})
          </button>

          <button
            onClick={() => setActiveCategoryFilter('ai_gaps')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCategoryFilter === 'ai_gaps'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-space-800'
            }`}
          >
            AI & LLM Voids ({aiGaps.length})
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-space-950 p-1 rounded-lg border border-slate-800 self-end sm:self-auto">
          <button
            onClick={() => setViewMode('cemetery')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-1.5 ${
              viewMode === 'cemetery' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Opportunity Radar</span>
          </button>
          <button
            onClick={() => setViewMode('board')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium flex items-center space-x-1.5 ${
              viewMode === 'board' ? 'bg-purple-600/40 text-purple-200 border border-purple-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Kanban Pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : viewMode === 'cemetery' ? (
        /* Opportunity Radar / Dead Startup Graveyard Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGaps.map((gap) => {
            const isDeadStartup = gap.category?.toLowerCase().includes('dead') || gap.title.toLowerCase().includes('post-mortem');
            return (
              <div
                key={gap.id}
                onClick={() => setSelectedGap(gap)}
                className={`antigravity-card rounded-2xl p-5 cursor-pointer flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] ${
                  isDeadStartup
                    ? 'border-rose-500/30 bg-rose-950/10 hover:border-rose-500/60'
                    : 'border-purple-500/20 bg-space-900/60 hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={
                        gap.priority === 'critical'
                          ? 'rose'
                          : gap.priority === 'high'
                          ? 'amber'
                          : 'purple'
                      }
                      size="sm"
                    >
                      {gap.priority.toUpperCase()} PRIORITY
                    </Badge>

                    {isDeadStartup ? (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center space-x-1">
                        <Skull className="w-3 h-3" />
                        <span>DEAD STARTUP GAP</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 bg-space-950 px-2 py-0.5 rounded border border-slate-800">
                        {gap.category}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white leading-snug group-hover:text-purple-300">
                    {gap.title}
                  </h3>

                  {/* Description / Problem */}
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {gap.description}
                  </p>

                  {/* Opportunity Score Indicator */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="text-slate-400 flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Opportunity Index</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {gap.priority === 'critical' ? '95/100' : gap.priority === 'high' ? '88/100' : '75/100'}
                      </span>
                    </div>
                    <div className="w-full bg-space-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          gap.priority === 'critical'
                            ? 'bg-gradient-to-r from-amber-500 to-emerald-400 w-[95%]'
                            : gap.priority === 'high'
                            ? 'bg-gradient-to-r from-purple-500 to-sky-400 w-[88%]'
                            : 'bg-slate-500 w-[75%]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">
                    Status: <span className="text-slate-300 uppercase font-semibold">{gap.status.replace('_', ' ')}</span>
                  </span>

                  <span className="text-purple-400 hover:text-purple-300 font-mono font-medium flex items-center space-x-1">
                    <span>Inspect Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colGaps = filteredGaps.filter((g) => g.status === col.status);
            return (
              <div
                key={col.status}
                className={`flex flex-col rounded-2xl bg-space-850/90 border ${col.color} p-4 min-h-[500px] shadow-sm`}
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-300">
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-space-950 text-slate-400 border border-slate-800">
                    {colGaps.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colGaps.map((gap) => (
                    <div
                      key={gap.id}
                      onClick={() => setSelectedGap(gap)}
                      className="antigravity-card rounded-xl p-4 cursor-pointer space-y-2.5 hover:border-purple-500/40"
                    >
                      <div className="flex items-center justify-between">
                        <Badge
                          variant={
                            gap.priority === 'critical' || gap.priority === 'high'
                              ? 'rose'
                              : gap.priority === 'medium'
                              ? 'amber'
                              : 'slate'
                          }
                          size="sm"
                        >
                          {gap.priority.toUpperCase()}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-500">
                          {gap.category}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 line-clamp-2">
                        {gap.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {gap.description}
                      </p>

                      <div className="flex justify-end pt-1">
                        {col.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatusMap: Record<GapStatus, GapStatus> = {
                                new: 'investigating',
                                investigating: 'in_progress',
                                in_progress: 'resolved',
                                resolved: 'resolved',
                                archived: 'archived',
                              };
                              updateStatusMutation.mutate({
                                id: gap.id,
                                status: nextStatusMap[gap.status],
                              });
                            }}
                            className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 bg-space-950 px-2 py-1 rounded border border-slate-800"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gap Detail & Blueprint Modal */}
      {selectedGap && (
        <Modal
          isOpen={!!selectedGap}
          onClose={() => setSelectedGap(null)}
          title={selectedGap.title}
        >
          <div className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={selectedGap.priority === 'critical' ? 'rose' : 'amber'}>
                {selectedGap.priority.toUpperCase()} PRIORITY
              </Badge>
              <Badge variant="purple">{selectedGap.category}</Badge>
              <span className="text-xs font-mono text-slate-500">
                Status: {selectedGap.status.toUpperCase()}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-space-950 border border-slate-800">
              <h4 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Core Unmet Need & Market Void
              </h4>
              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedGap.description}
              </p>
            </div>

            {selectedGap.evidence_summary && (
              <div className="p-4 rounded-xl bg-space-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Post-Mortem Evidence & Moat Breakdown</span>
                </h4>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-space-900/60 p-3 rounded-lg border border-slate-800/80">
                  {selectedGap.evidence_summary}
                </pre>
              </div>
            )}

            {selectedGap.suggested_actions && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <h4 className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Startup Reboot Action Blueprint</span>
                </h4>
                <pre className="text-xs text-purple-200 font-mono whitespace-pre-wrap leading-relaxed bg-purple-950/40 p-3 rounded-lg border border-purple-500/20">
                  {selectedGap.suggested_actions}
                </pre>
              </div>
            )}

            {selectedGap.related_tags && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedGap.related_tags.split(',').map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono text-slate-400 bg-space-850 px-2 py-0.5 rounded border border-slate-800"
                  >
                    #{t.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end space-x-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedGap(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                onClick={() => {
                  alert(`Opportunity "${selectedGap.title}" staged for deep research.`);
                  setSelectedGap(null);
                }}
              >
                Initiate Venture Research
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Gap Modal */}
      {isNewGapModalOpen && (
        <Modal
          isOpen={isNewGapModalOpen}
          onClose={() => setIsNewGapModalOpen(false)}
          title="Log Market Opportunity or Dead Startup Gap"
        >
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Opportunity Title
              </label>
              <input
                type="text"
                placeholder="e.g. Pebble Watch Sunset: Clean E-Ink Companion Device Vacuum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="Dead Startup Gap">Dead Startup Gap</option>
                  <option value="Developer Need">Developer Need</option>
                  <option value="Product Void">Product Void</option>
                  <option value="AI Ecosystem Void">AI Ecosystem Void</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Unmet Need & Description
              </label>
              <textarea
                rows={3}
                placeholder="Why did this product fail, and what customer pain was left behind?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Evidence Summary / Post-Mortem Details
              </label>
              <textarea
                rows={2}
                placeholder="Links to discussions, failure reasons, unit economics..."
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Suggested Startup Actions / Modern Blueprint
              </label>
              <textarea
                rows={2}
                placeholder="1. Build local-first prototype. 2. Target specific niche."
                value={suggestedActions}
                onChange={(e) => setSuggestedActions(e.target.value)}
                className="w-full bg-space-950 border border-slate-800 rounded-lg px-3 py-2 text-white text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <Button variant="secondary" size="sm" onClick={() => setIsNewGapModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  createGapMutation.mutate({
                    title,
                    description,
                    category,
                    priority,
                    evidence_summary: evidence,
                    suggested_actions: suggestedActions,
                  })
                }
                isLoading={createGapMutation.isPending}
                disabled={!title.trim() || !description.trim()}
              >
                Save Opportunity
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
