import React, { useState } from 'react';
import { Globe, CheckCircle, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const CollectUrlModal: React.FC = () => {
  const { activeQuickAction, setActiveQuickAction } = useUIStore();
  const isOpen = activeQuickAction === 'url';
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleClose = () => {
    setActiveQuickAction(null);
    setUrl('');
    setError(null);
    setResult(null);
  };

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.collectUrl(url.trim(), true);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to collect URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="On-Demand URL Collector"
      subtitle="Safely fetch, normalize, and index a public webpage into your Scoutboard database."
      maxWidth="md"
    >
      <form onSubmit={handleCollect} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1.5 font-mono">
            Target Public Webpage URL
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="url"
              required
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Strict SSRF protections active: Private RFC1918 subnets, cloud metadata endpoints, and localhost are blocked.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>
                {result.status === 'duplicate' ? 'URL Already Exists in Database' : 'Successfully Collected and Indexed!'}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-medium">
              Title: {result.extracted?.title}
            </div>
            {result.extracted?.description && (
              <p className="text-xs text-slate-400 line-clamp-2">
                {result.extracted.description}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Collect & Index
          </Button>
        </div>
      </form>
    </Modal>
  );
};
