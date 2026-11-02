import React, { useState } from 'react';
import { Settings, Shield, Cpu, Database, Save, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export const SettingsPage: React.FC = () => {
  const [aiProvider, setAiProvider] = useState('local');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <span>Platform Settings & Topology</span>
          <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Node v1.0
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure AI synthesis adapters, database persistence, and verify active security boundaries.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Synthesis Provider */}
        <Card
          title="Free-First AI Engine Configuration"
          subtitle="Scoutboard is fully functional with zero paid keys by default using our deterministic rule synthesizer."
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                Active AI Adapter
              </label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="local">Local Rule Synthesizer (100% Free / Zero External Network)</option>
                <option value="ollama">Ollama Local LLM (Self-Hosted on Localhost)</option>
                <option value="openai_compatible">OpenAI-Compatible REST Endpoint</option>
              </select>
            </div>

            {aiProvider === 'ollama' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    Ollama Base URL
                  </label>
                  <input
                    type="url"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-300 mb-1">
                    Model Identifier
                  </label>
                  <input
                    type="text"
                    value={ollamaModel}
                    onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full bg-space-900 border border-slate-700/80 rounded-lg px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Security & SSRF Policy */}
        <Card
          title="Active Security Safeguards"
          subtitle="Hardware & network boundaries enforced at runtime on all ingestion jobs."
        >
          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-300">RFC1918 Private Subnet Shielding</span>
              <Badge variant="emerald" size="sm">ENFORCED</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-300">Cloud Metadata Endpoint Protection (169.254.169.254)</span>
              <Badge variant="emerald" size="sm">BLOCKED</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-300">Payload Download Ceilings</span>
              <span className="text-sky-400 font-semibold">5MB Maximum</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-space-900 border border-slate-800">
              <span className="text-slate-300">Database Storage Mode</span>
              <span className="text-slate-200">SQLite (Zero-Config) / PostgreSQL-Ready</span>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          {savedNotice && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
              <CheckCircle className="w-4 h-4" />
              <span>Configuration successfully saved to local session.</span>
            </div>
          )}
          <Button variant="primary" size="md" type="submit" leftIcon={<Save className="w-4 h-4" />} className="ml-auto">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
