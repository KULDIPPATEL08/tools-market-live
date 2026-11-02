import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Compass,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { Gap, GapStatus } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const GapBoardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedGap, setSelectedGap] = useState<Gap | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Dead Startup Gap');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [newEvidence, setNewEvidence] = useState('');
  const [newActions, setNewActions] = useState('');

  const { data: gaps, isLoading } = useQuery({
    queryKey: ['gaps'],
    queryFn: () => api.getGaps(),
  });

  const scanDeadStartupsMutation = useMutation({
    mutationFn: api.scanDeadStartups,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    },
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
      setIsNewModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewEvidence('');
      setNewActions('');
    },
  });

  const filteredGaps = (gaps || []).filter((g) => {
    if (categoryFilter === 'dead_startups') {
      if (!g.category.toLowerCase().includes('dead') && !g.title.toLowerCase().includes('post-mortem')) return false;
    }
    if (categoryFilter === 'developer_needs') {
      if (g.category !== 'Developer Need') return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Startup Radar & Market Voids
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
              {filteredGaps.length} TRACKED OPPORTUNITIES
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Systematic tracking of discontinued products, sunset acquisitions, and recurring developer friction.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="xs"
            leftIcon={<RefreshCw className={`w-3 h-3 ${scanDeadStartupsMutation.isPending ? 'animate-spin' : ''}`} />}
            onClick={() => scanDeadStartupsMutation.mutate()}
            isLoading={scanDeadStartupsMutation.isPending}
          >
            Scan Post-Mortem Voids
          </Button>

          <Button
            variant="primary"
            size="xs"
            leftIcon={<Plus className="w-3 h-3" />}
            onClick={() => setIsNewModalOpen(true)}
          >
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0E0E12] p-2 rounded-lg border border-zinc-800">
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            ALL VOIDS ({gaps?.length || 0})
          </button>
          <button
            onClick={() => setCategoryFilter('dead_startups')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              categoryFilter === 'dead_startups'
                ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            DEAD STARTUPS & SUNSETS
          </button>
          <button
            onClick={() => setCategoryFilter('developer_needs')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors cursor-pointer ${
              categoryFilter === 'developer_needs'
                ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
            }`}
          >
            DEVELOPER NEEDS
          </button>
        </div>

        <div className="relative sm:w-64">
          <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter radar..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-8 pr-3 py-1 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
          />
        </div>
      </div>

      {/* Structured Table Layout (Bloomberg/Linear density) */}
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : (
        <div className="border border-zinc-800 rounded-lg bg-[#0E0E12] overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#121216] text-[10px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-4 font-medium">Opportunity / Target Entity</th>
                <th className="py-2.5 px-3 font-medium hidden md:table-cell">Category</th>
                <th className="py-2.5 px-3 font-medium">Opportunity Index</th>
                <th className="py-2.5 px-3 font-medium hidden lg:table-cell">Priority</th>
                <th className="py-2.5 px-3 font-medium hidden sm:table-cell">Status</th>
                <th className="py-2.5 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredGaps.map((gap) => {
                const isDead = gap.category.toLowerCase().includes('dead') || gap.title.toLowerCase().includes('post-mortem');
                return (
                  <tr
                    key={gap.id}
                    onClick={() => setSelectedGap(gap)}
                    className="hover:bg-zinc-850/60 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-medium text-zinc-100 group-hover:text-white line-clamp-1">
                        {gap.title}
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {gap.description}
                      </div>
                    </td>

                    <td className="py-3 px-3 hidden md:table-cell">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-400 border border-zinc-750">
                        {gap.category}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-semibold text-emerald-400 tabular-nums">
                          {gap.priority === 'critical' ? '96/100' : gap.priority === 'high' ? '89/100' : '75/100'}
                        </span>
                        <div className="w-16 bg-zinc-800 h-1 rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{
                              width: gap.priority === 'critical' ? '96%' : gap.priority === 'high' ? '89%' : '75%'
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 hidden lg:table-cell">
                      <span className={`text-[10px] font-mono font-medium ${
                        gap.priority === 'critical'
                          ? 'text-rose-400'
                          : gap.priority === 'high'
                          ? 'text-amber-400'
                          : 'text-zinc-400'
                      }`}>
                        {gap.priority.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-3 hidden sm:table-cell">
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        {gap.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGap(gap);
                        }}
                        className="text-[11px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 transition-colors"
                      >
                        Inspect Blueprint
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Blueprint & Evidence Drawer Modal */}
      {selectedGap && (
        <Modal
          isOpen={!!selectedGap}
          onClose={() => setSelectedGap(null)}
          title={selectedGap.title}
        >
          <div className="space-y-4 text-xs font-sans max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-zinc-850 text-zinc-300 font-mono text-[11px] border border-zinc-750">
                {selectedGap.category}
              </span>
              <span className="font-mono text-zinc-500">
                Priority: {selectedGap.priority.toUpperCase()}
              </span>
              <span className="font-mono text-emerald-400">
                Opportunity Score: 95/100
              </span>
            </div>

            <div className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
              <span className="font-mono text-[10px] uppercase text-zinc-500 font-semibold block">
                Unmet Customer Pain & Market Vacuum
              </span>
              <p className="text-zinc-200 text-xs leading-relaxed">
                {selectedGap.description}
              </p>
            </div>

            {selectedGap.evidence_summary && (
              <div className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-zinc-500 font-semibold block">
                  Post-Mortem Breakdown & Evidence
                </span>
                <pre className="text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedGap.evidence_summary}
                </pre>
              </div>
            )}

            {selectedGap.suggested_actions && (
              <div className="p-3.5 rounded bg-zinc-900 border border-zinc-800 space-y-1.5">
                <span className="font-mono text-[10px] uppercase text-indigo-400 font-semibold block">
                  Reboot Roadmap & Architectural Blueprint
                </span>
                <pre className="text-[11px] text-zinc-200 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedGap.suggested_actions}
                </pre>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <Button variant="secondary" size="xs" onClick={() => setSelectedGap(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={() => {
                  alert(`Opportunity "${selectedGap.title}" staged into Research Studio.`);
                  setSelectedGap(null);
                }}
              >
                Stage for Research Studio
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New Opportunity Modal */}
      {isNewModalOpen && (
        <Modal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          title="Track New Startup Void or Friction Point"
        >
          <div className="space-y-3 text-xs font-sans">
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Opportunity Headline</label>
              <input
                type="text"
                placeholder="e.g. Pebble Watch Sunset: Clean E-Ink Companion Device Vacuum"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="Dead Startup Gap">Dead Startup Gap</option>
                  <option value="Developer Need">Developer Need</option>
                  <option value="AI Ecosystem Void">AI Ecosystem Void</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Priority</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Unmet Need Description</label>
              <textarea
                rows={3}
                placeholder="What customer pain was left behind?"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Suggested Execution Blueprint</label>
              <textarea
                rows={2}
                placeholder="1. Build local-first prototype. 2. Target specific niche."
                value={newActions}
                onChange={(e) => setNewActions(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-600 font-mono"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-zinc-800">
              <Button variant="secondary" size="xs" onClick={() => setIsNewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="xs"
                onClick={() =>
                  createGapMutation.mutate({
                    title: newTitle,
                    description: newDesc,
                    category: newCategory,
                    priority: newPriority,
                    evidence_summary: newEvidence,
                    suggested_actions: newActions,
                  })
                }
                isLoading={createGapMutation.isPending}
                disabled={!newTitle.trim() || !newDesc.trim()}
              >
                Track Opportunity
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
