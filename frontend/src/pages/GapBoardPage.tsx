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
  const [isNewGapModalOpen, setIsNewGapModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);

  // New gap form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Developer Need');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [evidence, setEvidence] = useState('');
  const [suggestedActions, setSuggestedActions] = useState('');

  const { data: gaps, isLoading, refetch } = useQuery({
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

  const columns: { status: GapStatus; label: string; color: string }[] = [
    { status: 'new', label: 'New / Detected', color: 'border-sky-500/30' },
    { status: 'investigating', label: 'Investigating', color: 'border-amber-500/30' },
    { status: 'in_progress', label: 'Research In Progress', color: 'border-purple-500/30' },
    { status: 'resolved', label: 'Resolved / Published', color: 'border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Intelligence Gap Board</span>
            <span className="text-xs font-mono font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Uncovered Opportunities
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detect recurring unanswered questions, missing tooling, and research opportunities across collected sources.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            onClick={() => detectGapsMutation.mutate()}
            isLoading={detectGapsMutation.isPending}
          >
            Run Automated Gap Scan
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsNewGapModalOpen(true)}
          >
            Add Custom Gap
          </Button>
        </div>
      </div>

      {/* Kanban Board Columns */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colGaps = gaps?.filter((g) => g.status === col.status) || [];
            return (
              <div
                key={col.status}
                className={`flex flex-col rounded-2xl bg-space-850/90 border ${col.color} p-4 min-h-[500px] shadow-sm`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-300">
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-space-950 text-slate-400 border border-slate-800">
                    {colGaps.length}
                  </span>
                </div>

                {/* Cards */}
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

                      {gap.suggested_actions && (
                        <div className="text-[11px] text-purple-300 font-mono bg-purple-500/10 p-2 rounded border border-purple-500/20 line-clamp-2">
                          Next: {gap.suggested_actions}
                        </div>
                      )}

                      {/* Quick Status Advance */}
                      <div className="flex justify-end pt-1">
                        {col.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextStatus: GapStatus =
                                col.status === 'new'
                                  ? 'investigating'
                                  : col.status === 'investigating'
                                  ? 'in_progress'
                                  : 'resolved';
                              updateStatusMutation.mutate({ id: gap.id, status: nextStatus });
                            }}
                            className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                          >
                            <span>Advance</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {colGaps.length === 0 && (
                    <div className="text-center py-12 text-xs text-slate-500 italic">
                      No items in this column
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gap Detail Modal */}
      {selectedGap && (
        <Modal
          isOpen={!!selectedGap}
          onClose={() => setSelectedGap(null)}
          title={selectedGap.title}
          subtitle={`Status: ${selectedGap.status.toUpperCase()} • Priority: ${selectedGap.priority.toUpperCase()}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                Description & Opportunity Context
              </span>
              <p className="text-sm text-slate-200 leading-relaxed bg-space-900 p-3 rounded-lg border border-slate-800">
                {selectedGap.description}
              </p>
            </div>

            {selectedGap.evidence_summary && (
              <div>
                <span className="text-xs font-mono uppercase text-slate-400 font-semibold block mb-1">
                  Synthesized Evidence from Primary Sources
                </span>
                <div className="text-xs text-slate-300 leading-relaxed bg-space-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap font-mono">
                  {selectedGap.evidence_summary}
                </div>
              </div>
            )}

            {selectedGap.suggested_actions && (
              <div>
                <span className="text-xs font-mono uppercase text-purple-400 font-semibold block mb-1">
                  Recommended Action Plan
                </span>
                <div className="text-xs text-purple-200 leading-relaxed bg-purple-500/10 p-3 rounded-lg border border-purple-500/20 whitespace-pre-wrap">
                  {selectedGap.suggested_actions}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">Change Status:</span>
                {(['new', 'investigating', 'in_progress', 'resolved'] as GapStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedGap.id, status: st });
                      setSelectedGap({ ...selectedGap, status: st });
                    }}
                    className={`px-2 py-0.5 text-xs font-mono rounded border capitalize cursor-pointer ${
                      selectedGap.status === st
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                        : 'bg-space-900 text-slate-500 border-slate-800'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <Button variant="secondary" size="sm" onClick={() => setSelectedGap(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Gap Modal */}
      <Modal
        isOpen={isNewGapModalOpen}
        onClose={() => setIsNewGapModalOpen(false)}
        title="Record New Intelligence Gap"
        subtitle="Identify unaddressed questions, missing tooling, or research voids."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createGapMutation.mutate({
              title,
              description,
              category,
              priority,
              evidence_summary: evidence,
              suggested_actions: suggestedActions,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Gap Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Lack of Standardized Benchmarks for Local Agentic Coding"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              required
              placeholder="Explain the recurring friction or missing capability observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Suggested Next Steps</label>
            <input
              type="text"
              placeholder="e.g. Conduct comparative benchmark and publish research dossier"
              value={suggestedActions}
              onChange={(e) => setSuggestedActions(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewGapModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createGapMutation.isPending}>
              Create Gap
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
