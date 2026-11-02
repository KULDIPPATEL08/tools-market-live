import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  TrendingUp,
  MapPin,
  ExternalLink,
  Plus,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  X,
  Target
} from 'lucide-react';
import { api } from '../services/api';
import { Startup } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const StartupRadarPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<'all' | 'india' | 'gujarat' | 'dead' | 'ai'>('all');
  const [search, setSearch] = useState('');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Add Startup
  const [newStartup, setNewStartup] = useState({
    name: '',
    tagline: '',
    description: '',
    website: '',
    stage: 'Seed',
    funding_status: 'Bootstrapped',
    country: 'India',
    city: 'Ahmedabad',
    is_india: true,
    is_gujarat: true,
    industry: 'AI / ML',
    opportunity_score: 85,
  });

  // Query Metrics
  const { data: metrics } = useQuery({
    queryKey: ['startupMetrics'],
    queryFn: () => api.getStartupMetrics(),
  });

  // Query Startups
  const { data: startupData, isLoading } = useQuery({
    queryKey: ['startups', activeFilter, search],
    queryFn: () => {
      let is_india: boolean | undefined = undefined;
      let is_gujarat: boolean | undefined = undefined;
      let is_dead: boolean | undefined = undefined;
      let industry: string | undefined = undefined;

      if (activeFilter === 'india') is_india = true;
      if (activeFilter === 'gujarat') is_gujarat = true;
      if (activeFilter === 'dead') is_dead = true;
      if (activeFilter === 'ai') industry = 'AI';

      return api.getStartups({
        is_india,
        is_gujarat,
        is_dead,
        industry,
        search: search.trim() || undefined,
        limit: 50,
      });
    },
  });

  const startups = startupData?.items || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<Startup>) => api.createStartup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['startups'] });
      queryClient.invalidateQueries({ queryKey: ['startupMetrics'] });
      setIsAddModalOpen(false);
      setNewStartup({
        name: '',
        tagline: '',
        description: '',
        website: '',
        stage: 'Seed',
        funding_status: 'Bootstrapped',
        country: 'India',
        city: 'Ahmedabad',
        is_india: true,
        is_gujarat: true,
        industry: 'AI / ML',
        opportunity_score: 85,
      });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartup.name) return;
    createMutation.mutate(newStartup);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              Venture Intelligence & Post-Mortem Voids
            </span>
            <span className="text-zinc-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-zinc-400">India & Gujarat Ecosystem Tracker</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Startup Radar</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time entity tracking across venture batches, funding rounds, and market voids left by distressed predecessors.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Track Startup Profile</span>
          </Button>
        </div>
      </div>

      {/* Telemetry Row */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-[#0E0E12] border border-zinc-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Total Ventures</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">{metrics.total_startups}</span>
            <span className="text-[10px] font-mono text-zinc-400">Active Pipeline</span>
          </div>
          <div className="bg-[#0E0E12] border border-zinc-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">India Ecosystem</span>
            <span className="text-lg font-bold font-mono text-indigo-400 mt-0.5 block">{metrics.india_startups}</span>
            <span className="text-[10px] font-mono text-zinc-400">Sovereign & Regional</span>
          </div>
          <div className="bg-[#0E0E12] border border-zinc-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Gujarat Hub</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{metrics.gujarat_startups}</span>
            <span className="text-[10px] font-mono text-zinc-400">GIFT City / i-Hub</span>
          </div>
          <div className="bg-[#0E0E12] border border-zinc-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Post-Mortem Voids</span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{metrics.post_mortems}</span>
            <span className="text-[10px] font-mono text-zinc-400">Distressed Opportunities</span>
          </div>
          <div className="bg-[#0E0E12] border border-zinc-800 rounded p-3">
            <span className="text-[10px] font-mono uppercase text-zinc-500 block">Capital Tracked</span>
            <span className="text-lg font-bold font-mono text-zinc-100 mt-0.5 block">
              ${(metrics.total_funding_tracked_usd / 1000000000).toFixed(1)}B+
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Aggregate Disclosed</span>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0E0E12] border border-zinc-800 rounded-lg p-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Ventures' },
            { id: 'india', label: 'India Ecosystem' },
            { id: 'gujarat', label: 'Gujarat & GIFT City' },
            { id: 'dead', label: 'Post-Mortem Voids' },
            { id: 'ai', label: 'AI & Frontier' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded text-xs font-mono transition-colors whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-zinc-800 text-white font-medium border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, founder, city..."
            className="w-full bg-[#141418] border border-zinc-750 focus:border-indigo-500 text-xs text-zinc-200 placeholder-zinc-500 rounded pl-8 pr-3 py-1.5 outline-none font-sans"
          />
        </div>
      </div>

      {/* Startups Table & Matrix */}
      <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-[#121216] text-[11px] font-mono text-zinc-400">
                <th className="py-2.5 px-4 font-medium">VENTURE / ENTITY</th>
                <th className="py-2.5 px-3 font-medium">STAGE & CAPITAL</th>
                <th className="py-2.5 px-3 font-medium">LOCATION</th>
                <th className="py-2.5 px-3 font-medium">SECTOR</th>
                <th className="py-2.5 px-3 font-medium text-center">OPPORTUNITY</th>
                <th className="py-2.5 px-4 font-medium text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                    Loading venture radar records...
                  </td>
                </tr>
              ) : startups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500 font-mono">
                    No startups match the current filter criteria.
                  </td>
                </tr>
              ) : (
                startups.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelectedStartup(s)}
                    className="hover:bg-zinc-850/40 transition-colors cursor-pointer group"
                  >
                    {/* Company Name & Tagline */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors text-sm">
                            {s.name}
                          </span>
                          {s.is_dead && (
                            <span className="text-[9px] font-mono bg-red-950/60 text-red-400 border border-red-800/50 px-1.5 py-0.2 rounded">
                              DEFUNCT / VOID
                            </span>
                          )}
                          {s.is_gujarat && (
                            <span className="text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-1.5 py-0.2 rounded">
                              GUJARAT
                            </span>
                          )}
                          {s.is_india && !s.is_gujarat && (
                            <span className="text-[9px] font-mono bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 px-1.5 py-0.2 rounded">
                              INDIA
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 max-w-md">
                          {s.tagline || s.description}
                        </p>
                      </div>
                    </td>

                    {/* Stage & Capital */}
                    <td className="py-3 px-3 font-mono">
                      <span className="text-zinc-200 block font-medium">{s.stage}</span>
                      <span className="text-[10px] text-zinc-500">{s.funding_status}</span>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <MapPin className="w-3 h-3 text-zinc-500" />
                        <span>{s.city ? `${s.city}, ${s.country}` : s.country}</span>
                      </div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 border border-zinc-750 text-zinc-300">
                        {s.industry}
                      </span>
                    </td>

                    {/* Opportunity Score */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono text-xs font-semibold px-2 py-0.5 rounded ${
                          s.opportunity_score >= 90
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/50'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {s.opportunity_score}/100
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      {s.website ? (
                        <a
                          href={s.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-zinc-500 hover:text-white transition-colors inline-block p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-zinc-600 font-mono text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Startup Profile & Post-Mortem Drawer */}
      {selectedStartup && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-[#0E0E12] border-l border-zinc-800 h-full p-6 space-y-6 overflow-y-auto no-scrollbar shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">{selectedStartup.name}</h2>
                  {selectedStartup.is_dead ? (
                    <span className="text-[10px] font-mono bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
                      SHUT DOWN / POST-MORTEM
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                      ACTIVE VENTURE
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400">{selectedStartup.tagline}</p>
              </div>
              <button
                onClick={() => setSelectedStartup(null)}
                className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#141418] p-4 rounded border border-zinc-800 font-mono">
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Stage & Funding</span>
                <span className="text-zinc-200 font-semibold">{selectedStartup.stage}</span>
                <span className="text-[11px] text-zinc-400 block">{selectedStartup.funding_status}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Headquarters</span>
                <span className="text-zinc-200 font-semibold">
                  {selectedStartup.city ? `${selectedStartup.city}, ` : ''}{selectedStartup.country}
                </span>
                <span className="text-[11px] text-indigo-400 block">
                  {selectedStartup.is_gujarat ? 'Gujarat Ecosystem' : selectedStartup.is_india ? 'India National' : 'Global'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Sector / Industry</span>
                <span className="text-zinc-200 font-semibold">{selectedStartup.industry}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 block uppercase">Founders</span>
                <span className="text-zinc-200">{selectedStartup.founders || 'Undisclosed'}</span>
              </div>
            </div>

            {/* Executive Overview */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">Entity Overview</span>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-[#121216] p-3.5 rounded border border-zinc-800">
                {selectedStartup.description}
              </p>
            </div>

            {/* Post-Mortem & Opportunity Blueprint Section */}
            {selectedStartup.is_dead && (
              <div className="space-y-4 bg-amber-950/20 border border-amber-800/40 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>POST-MORTEM & MARKET VOID ANALYSIS</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Cause of Failure:</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedStartup.dead_reason}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-amber-800/30">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> Market Void Opportunity Blueprint:
                  </span>
                  <p className="text-xs text-emerald-300/90 leading-relaxed font-sans">
                    {selectedStartup.gap_opportunity}
                  </p>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
              {selectedStartup.website && (
                <a
                  href={selectedStartup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>Visit Domain</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStartup(null)}
                className="text-xs ml-auto"
              >
                Close Drawer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Startup Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E12] border border-zinc-800 rounded-lg p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Track New Venture Profile</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newStartup.name}
                  onChange={(e) => setNewStartup({ ...newStartup, name: e.target.value })}
                  placeholder="e.g. Sarvam AI"
                  className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Tagline</label>
                <input
                  type="text"
                  value={newStartup.tagline}
                  onChange={(e) => setNewStartup({ ...newStartup, tagline: e.target.value })}
                  placeholder="Sovereign AI foundational models for Indian languages"
                  className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Stage</label>
                  <select
                    value={newStartup.stage}
                    onChange={(e) => setNewStartup({ ...newStartup, stage: e.target.value })}
                    className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                  >
                    <option value="Pre-seed">Pre-seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B+">Series B+</option>
                    <option value="Growth">Growth</option>
                    <option value="Bootstrap">Bootstrap</option>
                    <option value="Shut Down">Shut Down (Post-Mortem)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Industry</label>
                  <input
                    type="text"
                    value={newStartup.industry}
                    onChange={(e) => setNewStartup({ ...newStartup, industry: e.target.value })}
                    className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">City</label>
                  <input
                    type="text"
                    value={newStartup.city}
                    onChange={(e) => setNewStartup({ ...newStartup, city: e.target.value })}
                    className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Country</label>
                  <input
                    type="text"
                    value={newStartup.country}
                    onChange={(e) => setNewStartup({ ...newStartup, country: e.target.value })}
                    className="w-full bg-[#141418] border border-zinc-750 text-zinc-100 rounded p-2 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStartup.is_india}
                    onChange={(e) => setNewStartup({ ...newStartup, is_india: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-zinc-300">India Ecosystem</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newStartup.is_gujarat}
                    onChange={(e) => setNewStartup({ ...newStartup, is_gujarat: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-zinc-300">Gujarat / GIFT City</span>
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={createMutation.isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {createMutation.isPending ? 'Tracking...' : 'Track Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
