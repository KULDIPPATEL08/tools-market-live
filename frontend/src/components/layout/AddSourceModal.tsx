import React, { useState } from 'react';
import { Radio, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store';
import { api } from '../../services/api';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const AddSourceModal: React.FC<{ onSourceAdded?: () => void }> = ({ onSourceAdded }) => {
  const { activeQuickAction, setActiveQuickAction } = useUIStore();
  const isOpen = activeQuickAction === 'source';
  const [name, setName] = useState('');
  const [type, setType] = useState<'rss' | 'github' | 'hackernews' | 'webpage' | 'reddit' | 'huggingface' | 'technews'>('rss');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Technology');
  const [fetchInterval, setFetchInterval] = useState(60);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setActiveQuickAction(null);
    setName('');
    setUrl('');
    setDescription('');
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const newSource = await api.createSource({
        name: name.trim(),
        type,
        url: url.trim() || undefined,
        category,
        fetch_interval_minutes: Number(fetchInterval),
        description: description.trim() || undefined,
      });

      // Trigger first sync in background
      api.syncSource(newSource.id).catch(() => {});

      if (onSourceAdded) onSourceAdded();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create source');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Intelligence Source"
      subtitle="Configure an RSS feed, GitHub search, Hacker News feed, or website connector."
      maxWidth="md"
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 font-mono">
            Source Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. ArXiv Quantum AI Papers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 font-mono">
              Connector Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              <option value="rss">RSS / Atom Feed</option>
              <option value="reddit">Reddit Subreddit (e.g. LocalLLaMA)</option>
              <option value="huggingface">Hugging Face (Trending Models/Papers)</option>
              <option value="technews">Live Tech News & Outlets</option>
              <option value="github">GitHub Public API</option>
              <option value="hackernews">Hacker News Stories</option>
              <option value="webpage">Public Webpage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 font-mono">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Technology, AI, Security"
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        </div>

        {type !== 'hackernews' && type !== 'technews' && (
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 font-mono">
              {type === 'github'
                ? 'GitHub Query / Repo URL (Optional)'
                : type === 'reddit'
                ? 'Subreddit Name / URL'
                : type === 'huggingface'
                ? 'Hugging Face Filter / URL'
                : 'Source Feed / Web URL'}
            </label>
            <input
              type={type === 'rss' || type === 'webpage' ? 'url' : 'text'}
              required={type === 'rss' || type === 'webpage'}
              placeholder={
                type === 'rss'
                  ? 'https://example.com/rss.xml'
                  : type === 'reddit'
                  ? 'r/LocalLLaMA'
                  : type === 'huggingface'
                  ? 'https://huggingface.co/models'
                  : type === 'github'
                  ? 'topic:machine-learning stars:>5000'
                  : 'https://example.com/article'
              }
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-300 mb-1 font-mono">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Brief purpose of this source..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Create & Trigger Sync
          </Button>
        </div>
      </form>
    </Modal>
  );
};

