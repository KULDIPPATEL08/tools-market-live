import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Radio, FileText, Database, X, ArrowRight } from 'lucide-react';
import { useUIStore } from '../../store';
import { api } from '../../services/api';
import { CollectedRecord, Source, ResearchProject } from '../../types';

export const GlobalSearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<CollectedRecord[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setRecords([]);
      setSources([]);
      setProjects([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const [recs, srcs, projs] = await Promise.all([
          api.getRecords({ q: query }),
          api.getSources({ q: query }),
          api.getProjects(),
        ]);
        setRecords(recs.slice(0, 5));
        setSources(srcs.slice(0, 3));
        setProjects(
          projs.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
        );
      } catch (_) {}
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-space-800 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-700/80 bg-space-850">
          <Search className="w-5 h-5 text-sky-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search records, sources, research dossiers, topics..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="ml-2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-sm">
          {isLoading && (
            <div className="text-center py-6 text-xs text-slate-400 font-mono">
              Searching intelligence index...
            </div>
          )}

          {!isLoading && !query.trim() && (
            <div className="text-center py-8 text-slate-500 text-xs">
              Search by keyword, tag, or topic across all Scoutboard modules.
            </div>
          )}

          {!isLoading && query.trim() && records.length === 0 && sources.length === 0 && projects.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              No matching intelligence items found for "{query}".
            </div>
          )}

          {/* Records */}
          {records.length > 0 && (
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase text-sky-400 tracking-wider block mb-2 px-2">
                Collected Records ({records.length})
              </span>
              <div className="space-y-1">
                {records.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate(`/discover?q=${encodeURIComponent(r.title)}`);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-700/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Compass className="w-4 h-4 text-slate-400 group-hover:text-sky-400 flex-shrink-0" />
                      <div className="truncate">
                        <span className="text-slate-200 font-medium text-xs block truncate">
                          {r.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.source_name || r.category} • Score: {r.quality_score}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase text-emerald-400 tracking-wider block mb-2 px-2">
                Connected Sources ({sources.length})
              </span>
              <div className="space-y-1">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('/sources');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-700/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <Radio className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-200 font-medium text-xs truncate">
                        {s.name} ({s.type})
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Research Projects */}
          {projects.length > 0 && (
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase text-purple-400 tracking-wider block mb-2 px-2">
                Research Projects ({projects.length})
              </span>
              <div className="space-y-1">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      navigate('/research');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-700/60 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-purple-400 flex-shrink-0" />
                      <span className="text-slate-200 font-medium text-xs truncate">
                        {p.title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

