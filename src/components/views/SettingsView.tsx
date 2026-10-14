'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { novoraApi } from '@/lib/api';
import {
  Settings,
  Moon,
  Sun,
  Server,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Layers,
} from 'lucide-react';

interface SettingsViewProps {
  isBackendConnected: boolean;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isBackendConnected,
  onRefreshHealth,
}) => {
  const { theme, setTheme } = useTheme();
  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setProbing(true);
    setProbeResult(null);
    const start = performance.now();
    try {
      const res = await novoraApi.checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setProbeResult(`Connected! Service: "${res.service}" (Latency: ${elapsed}ms)`);
      onRefreshHealth();
    } catch (err: unknown) {
      setProbeResult(`Failed: ${err instanceof Error ? err.message : 'Unreachable'}`);
    } finally {
      setProbing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-200">
      {/* Theme Settings */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Moon size={18} className="text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Appearance & Color Scheme
          </h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Select your visual theme. Dark mode uses Novora midnight navy, while light mode pairs a white canvas with gray 200 and gray 300 surfaces.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Mode Card */}
          <div
            onClick={() => setTheme('dark')}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
              theme === 'dark'
                ? 'ring-2 ring-[var(--primary)] border-transparent'
                : 'hover:border-[var(--primary)]'
            }`}
            style={{
              backgroundColor: '#0A0F1E',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-[#0B1F44] border border-[#1E293B] flex items-center justify-center text-blue-400">
                <Moon size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-[#E2E8F0]">Midnight Dark</div>
                <div className="text-[11px] text-[#94A3B8]">Deep Navy #0A0F1E</div>
              </div>
            </div>
            {theme === 'dark' && <CheckCircle2 size={18} className="text-[var(--primary)]" />}
          </div>

          {/* Light Mode Card */}
          <div
            onClick={() => setTheme('light')}
            className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between ${
              theme === 'light'
                ? 'ring-2 ring-[var(--primary)] border-transparent'
                : 'hover:border-[var(--primary)]'
            }`}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="h-8 w-8 rounded-lg border flex items-center justify-center text-amber-500"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <Sun size={16} />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">White &amp; Gray Light</div>
                <div className="text-[11px] text-[var(--text-secondary)]">White base · Gray 200/300 surfaces</div>
              </div>
            </div>
            {theme === 'light' && <CheckCircle2 size={18} className="text-[var(--primary)]" />}
          </div>
        </div>
      </div>

      {/* Backend API Connection */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Server size={18} className="text-[var(--primary)]" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Novora Core API Endpoint
          </h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          FastAPI backend connectivity configuration and health diagnostics.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
              Active Base URL
            </label>
            <input
              type="text"
              readOnly
              value={novoraApi.getBaseUrl()}
              className="w-full rounded-lg border px-3.5 py-2 font-mono text-xs cursor-not-allowed opacity-80"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
            <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
              Configured via <code className="font-mono">NEXT_PUBLIC_API_URL</code> environment variable.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={probing}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw size={13} className={probing ? 'animate-spin' : ''} />
              <span>{probing ? 'Testing Connection...' : 'Ping Backend Health (/health)'}</span>
            </button>
          </div>

          {probeResult && (
            <div
              className={`rounded-lg p-3 text-xs font-medium border flex items-center gap-2 ${
                probeResult.startsWith('Connected')
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {probeResult.startsWith('Connected') ? (
                <CheckCircle2 size={15} />
              ) : (
                <AlertCircle size={15} />
              )}
              <span>{probeResult}</span>
            </div>
          )}
        </div>
      </div>

      {/* Planned Features Notice */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Layers size={18} className="text-[var(--text-muted)]" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Deferred & Planned Capabilities
          </h3>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">
          Per architecture brief, the following modules are deferred to future milestones and not disguised as active.
        </p>

        <div className="space-y-2.5 text-xs text-[var(--text-muted)]">
          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <div>
              <div className="font-semibold text-[var(--text-primary)]">Voxia Managed Voice Agent</div>
              <div className="text-[11px]">Novora runtime live orchestration agent</div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[var(--border-color)]">
              Phase 2
            </span>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <div>
              <div className="font-semibold text-[var(--text-primary)]">LangGraph Agent Workflows</div>
              <div className="text-[11px]">Cyclic graph agent pipelines</div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[var(--border-color)]">
              Deferred
            </span>
          </div>

          <div
            className="flex items-center justify-between p-3 rounded-xl border"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <div>
              <div className="font-semibold text-[var(--text-primary)]">Multi-Tenant Organization RBAC</div>
              <div className="text-[11px]">Isolated customer workspaces and SSO</div>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-[var(--border-color)]">
              Milestone 2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
