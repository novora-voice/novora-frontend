'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ActiveTab } from './Sidebar';
import {
  Sun,
  Moon,
  Menu,
  Plus,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenMobile: () => void;
  onNewEvaluation: () => void;
  onNewScenario: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'System health, evaluation throughput, and recent policy results',
  },
  evaluations: {
    title: 'Evaluations & Evidence',
    subtitle: 'Inspect deterministic rule checks, character citations, and regression diffs',
  },
  scenarios: {
    title: 'Test Cases & Scenarios',
    subtitle: 'Define business objectives, acceptable limits, and verification rules',
  },
  integrations: {
    title: 'Provider Integrations',
    subtitle: 'Real-time telemetry and webhooks from ElevenLabs, Twilio, and AssemblyAI',
  },
  settings: {
    title: 'Platform Settings',
    subtitle: 'Theme preferences, backend connections, and environment configuration',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobile,
  onNewEvaluation,
  onNewScenario,
  onRefresh,
  isLoading,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.overview;

  return (
    <header
      className="sticky top-0 z-30 flex h-20 items-center justify-between border-b px-6 backdrop-blur-md transition-colors"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobile}
          className="flex h-10 w-10 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] lg:hidden"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Tab Title & Context */}
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              {currentTabInfo.title}
            </h1>
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium text-[var(--text-secondary)] border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <FolderGit2 size={12} className="text-[var(--primary)]" />
              <span>Workspace: default</span>
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 hidden sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Data"
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Refresh data"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin text-[var(--primary)]' : ''} />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={15} className="text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={15} className="text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Context-aware action buttons */}
        <button
          onClick={onNewScenario}
          className="hidden md:flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Plus size={14} />
          <span>New Test Case</span>
        </button>

        <button
          onClick={onNewEvaluation}
          className="flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-98"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={14} />
          <span>Run Evaluation</span>
        </button>
      </div>
    </header>
  );
};
