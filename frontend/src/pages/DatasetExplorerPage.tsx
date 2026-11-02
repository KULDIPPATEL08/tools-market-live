import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Database,
  Search,
  ExternalLink,
  ShieldCheck,
  FileCode,
  HardDrive,
  Tag,
  Download,
} from 'lucide-react';
import { api } from '../services/api';
import { Dataset } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { EmptyState } from '../components/ui/EmptyState';

export const DatasetExplorerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets', search, category],
    queryFn: () => api.getDatasets({ q: search || undefined, category: category || undefined }),
  });

  const categories = [
    'All Categories',
    'NLP',
    'Computer Vision',
    'Code Intelligence',
    'Scientific Research',
    'Audio',
    'Geospatial',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <span>Public Dataset Explorer</span>
            <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified Attribution
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Curated repository of benchmark research datasets with transparent licensing attribution and format specifications.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search datasets by domain, task, format, or keyword..."
            className="w-full bg-space-800/90 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const isSelected = (!category && cat === 'All Categories') || category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat === 'All Categories' ? '' : cat)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold'
                    : 'bg-space-800 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Cards Grid */}
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : datasets?.length === 0 ? (
        <EmptyState
          icon={<Database className="w-8 h-8" />}
          title="No Datasets Found"
          description="Try broadening your search term or selecting 'All Categories'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets?.map((ds) => (
            <div
              key={ds.id}
              className="antigravity-card rounded-xl p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="cyan">{ds.category}</Badge>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                    <HardDrive className="w-3.5 h-3.5 text-sky-400" />
                    <span>{ds.size}</span>
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-100">{ds.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{ds.description}</p>

                {/* Formats and Citations */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] font-mono text-slate-400">Formats:</span>
                  {ds.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2 py-0.5 rounded bg-space-950 text-[10px] font-mono text-slate-300 border border-slate-800"
                    >
                      {fmt}
                    </span>
                  ))}
                  <span className="text-[10px] font-mono text-emerald-400 ml-auto">
                    {ds.downloads_or_citations}
                  </span>
                </div>
              </div>

              {/* License & Source Footer */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2">
                <div className="flex items-start justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Source Institution
                    </span>
                    <span className="text-slate-300 font-medium">{ds.source}</span>
                  </div>

                  <a
                    href={ds.license_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-xs text-sky-400 hover:text-sky-300 font-mono"
                    title="Inspect verified license terms"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[140px]">{ds.license}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
