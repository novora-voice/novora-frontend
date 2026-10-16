'use client';

import React from 'react';
import { novoraApi } from '@/lib/api';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface PlatformHealthCardProps {
  isBackendConnected: boolean;
  onRefreshHealth: () => void;
}

export const PlatformHealthCard: React.FC<PlatformHealthCardProps> = ({
  isBackendConnected,
  onRefreshHealth,
}) => {
  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Backend Service Health</h3>
          <p className="text-xs text-[var(--text-muted)]">Real-time status of the Novora Core FastAPI engine</p>
        </div>
        <button onClick={onRefreshHealth} className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border-color)' }}>
          <RefreshCw size={13} />
          <span>Ping Engine</span>
        </button>
      </div>

      <div className="flex items-center justify-between rounded-xl p-3.5" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <div className="flex items-center gap-3">
          {isBackendConnected ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Wifi size={18} />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <WifiOff size={18} />
            </div>
          )}
          <div>
            <div className="text-xs font-bold text-[var(--text-primary)]">
              {isBackendConnected ? 'FastAPI Core Engine Operational' : 'Engine Unreachable / Local Fixtures'}
            </div>
            <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">{novoraApi.getBaseUrl()}</div>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${isBackendConnected ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
          {isBackendConnected ? 'Healthy' : 'Disconnected'}
        </span>
      </div>
    </div>
  );
};
