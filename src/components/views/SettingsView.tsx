'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { PlatformHealthCard } from '../settings/PlatformHealthCard';
import { OperatorEnvChecklist } from '../settings/OperatorEnvChecklist';
import { Settings, Sun, Moon, Shield } from 'lucide-react';

interface SettingsViewProps {
  isBackendConnected: boolean;
  onRefreshHealth: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  isBackendConnected,
  onRefreshHealth,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform Settings</h2>
          <p className="text-xs text-[var(--text-secondary)]">Manage developer configuration, operator checklist, and theme preferences</p>
        </div>
      </div>

      <PlatformHealthCard
        isBackendConnected={isBackendConnected}
        onRefreshHealth={onRefreshHealth}
      />

      <div className="rounded-2xl border p-5 shadow-sm space-y-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Theme & Visual Experience</h3>
            <p className="text-xs text-[var(--text-muted)]">Switch between refined enterprise light and deep midnight navy themes</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
            <span>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>
      </div>

      <OperatorEnvChecklist />
    </div>
  );
};
