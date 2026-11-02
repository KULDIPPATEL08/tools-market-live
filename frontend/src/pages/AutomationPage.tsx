import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cpu, Play, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { AutomationRule } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const AutomationPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isNewRuleModalOpen, setIsNewRuleModalOpen] = useState(false);
  const [runningRuleId, setRunningRuleId] = useState<number | null>(null);

  // Form
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('interval');
  const [interval, setIntervalVal] = useState(60);
  const [actionType, setActionType] = useState('sync_sources');

  const { data: rules, isLoading } = useQuery({
    queryKey: ['automation-rules'],
    queryFn: api.getRules,
  });

  const runRuleMutation = useMutation({
    mutationFn: (id: number) => api.runRule(id),
    onMutate: (id) => setRunningRuleId(id),
    onSettled: () => {
      setRunningRuleId(null);
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      queryClient.invalidateQueries({ queryKey: ['collection-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: (data: Partial<AutomationRule>) => api.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      setIsNewRuleModalOpen(false);
      setName('');
    },
  });

  const deleteRuleMutation = useMutation({
    mutationFn: (id: number) => api.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Automation & Monitoring</span>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Autonomous Scheduler
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure periodic ingestion cycles, automatic gap discovery scans, and background intelligence triggers.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setIsNewRuleModalOpen(true)}
        >
          Create Automation Rule
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={3} />
      ) : rules?.length === 0 ? (
        <EmptyState
          icon={<Cpu className="w-8 h-8" />}
          title="No Automation Rules Configured"
          description="Create recurring schedule rules to periodically ingest fresh primary sources and scan for intelligence gaps."
          actionLabel="Create First Rule"
          onAction={() => setIsNewRuleModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {rules?.map((rule) => {
            const isExecuting = runningRuleId === rule.id;
            return (
              <div
                key={rule.id}
                className="antigravity-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <Badge variant={rule.is_active ? 'emerald' : 'slate'} size="sm" dot>
                      {rule.is_active ? 'ACTIVE' : 'PAUSED'}
                    </Badge>
                    <span className="text-xs font-mono text-sky-400">
                      Trigger: Every {rule.schedule_interval_minutes} minutes
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-100">{rule.name}</h3>

                  <div className="text-xs font-mono text-slate-400">
                    Action Target: <span className="text-slate-200 uppercase font-semibold">{rule.action_type.replace('_', ' ')}</span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    Last Run:{' '}
                    {rule.last_run_at ? new Date(rule.last_run_at).toLocaleString() : 'Never'}
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 self-end sm:self-center">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => runRuleMutation.mutate(rule.id)}
                    isLoading={isExecuting}
                    leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                  >
                    Run Rule Now
                  </Button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete rule "${rule.name}"?`)) {
                        deleteRuleMutation.mutate(rule.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Rule Modal */}
      <Modal
        isOpen={isNewRuleModalOpen}
        onClose={() => setIsNewRuleModalOpen(false)}
        title="Create Automation Rule"
        subtitle="Set up recurring triggers for automatic source ingestion or gap analysis."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createRuleMutation.mutate({
              name,
              trigger_type: triggerType,
              schedule_interval_minutes: Number(interval),
              action_type: actionType,
            });
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Rule Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Daily ArXiv ML Ingestion & Gap Detection"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Trigger Type</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="interval">Time Interval</option>
                <option value="on_demand">On-Demand Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Interval (Minutes)
              </label>
              <input
                type="number"
                min="15"
                value={interval}
                onChange={(e) => setIntervalVal(Number(e.target.value))}
                className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-slate-300 mb-1">Action Type</label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="sync_sources">Sync All Active Sources</option>
              <option value="run_gap_detection">Run Automated Gap Analysis</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewRuleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={createRuleMutation.isPending}>
              Create Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

