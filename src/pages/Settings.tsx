import React, { useState } from 'react';
import { Settings as SettingsIcon, Database, Server, Shield, CheckCircle, Flame } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const [minThreshold, setMinThreshold] = useState(10);
  const [autoReorder, setAutoReorder] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-dark-border pb-5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">System Settings & Infrastructure</h1>
        <p className="text-xs text-text-secondary mt-1">
          Configure safety stock thresholds, database connection parameters, and visual theme options.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visual Identity Status */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-3 border-b border-dark-border pb-3">
            <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-500">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Visual Identity Theme</h3>
              <p className="text-xs text-text-muted">Strict Black & Red enterprise palette</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <span className="text-zinc-400">Primary Identity</span>
              <span className="font-bold text-red-500 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 mr-1.5"></span>
                Crimson Red (#DC2626)
              </span>
            </div>
            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <span className="text-zinc-400">Background Tone</span>
              <span className="font-bold text-zinc-300 flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700 mr-1.5"></span>
                Dark Black (#09090B)
              </span>
            </div>
          </div>
        </div>

        {/* Database & Hosting Config */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-3 border-b border-dark-border pb-3">
            <div className="p-2 rounded-lg bg-dark-panel text-zinc-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Deployment Architecture</h3>
              <p className="text-xs text-text-muted">Netlify Serverless & MySQL settings</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Frontend Hosting</div>
                <div className="text-zinc-400 text-[11px]">Netlify SPA Routing (/* redirect rule configured)</div>
              </div>
              <Badge variant="success">Active</Badge>
            </div>

            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">API Layer</div>
                <div className="text-zinc-400 text-[11px]">Netlify Functions (/.netlify/functions/*)</div>
              </div>
              <Badge variant="info">Serverless</Badge>
            </div>

            <div className="p-3 bg-dark-panel border border-dark-border rounded-lg flex items-center justify-between">
              <div>
                <div className="font-semibold text-text-primary">Database Engine</div>
                <div className="text-zinc-400 text-[11px]">MySQL 8.0 / MariaDB (via DB_HOST environment variables)</div>
              </div>
              <Badge variant="warning">Configured</Badge>
            </div>
          </div>
        </div>

        {/* Threshold Rules */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 space-y-4">
          <div className="flex items-center space-x-3 border-b border-dark-border pb-3">
            <div className="p-2 rounded-lg bg-dark-panel text-zinc-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Global Inventory Thresholds</h3>
              <p className="text-xs text-text-muted">Automated reorder alert parameters</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Default Min Stock Threshold</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full bg-dark-base border border-dark-border rounded-lg px-3 py-2 text-xs text-text-primary focus:border-red-600 outline-none"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-panel border border-dark-border rounded-lg mt-5">
              <span className="text-zinc-300 font-medium">Enable Reorder Banner Feed</span>
              <input
                type="checkbox"
                checked={autoReorder}
                onChange={(e) => setAutoReorder(e.target.checked)}
                className="w-4 h-4 accent-red-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          {isSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center">
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Settings updated successfully!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-red-glow transition-all"
          >
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
