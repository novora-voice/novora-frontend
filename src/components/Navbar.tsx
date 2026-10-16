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
import { AuthUser } from '@/types/api';
import { UserMenu } from './navbar/UserMenu';

interface NavbarProps {
  activeTab: ActiveTab;
  onOpenMobile: () => void;
  onNewEvaluation: () => void;
  onNewScenario: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  currentUser: AuthUser;
  isLoading: boolean;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Platform Overview',
    subtitle: 'System health, evaluation throughput, and recent policy results',
  },
  agents: {
    title: 'Voice Agents',
    subtitle: 'Configured provider agents, prompt configurations, and runtime capabilities',
  },
  evaluations: {
    title: 'Evaluations & Evidence',
    subtitle: 'Inspect deterministic rule checks, character citations, and regression diffs',
  },
  scenarios: {
    title: 'Scenarios & Test Cases',
    subtitle: 'Define business objectives, acceptable limits, and verification rules',
  },
  integrations: {
    title: 'Integrations Directory',
    subtitle: 'Voice-agent platforms, transcription, telephony, and business connectors',
  },
  knowledge: {
    title: 'Knowledge Base',
    subtitle: 'Connect authorised data sources for evidence-backed evaluation (Phase 2)',
  },
  settings: {
    title: 'Platform & Developer Settings',
    subtitle: 'Environment checklist, credential security, and provider connection diagnostic',
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenMobile,
  onNewEvaluation,
  onNewScenario,
  onRefresh,
  onLogout,
  currentUser,
  isLoading,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentTabInfo = TAB_TITLES[activeTab] ?? TAB_TITLES.overview;

  return (
    <header className="navbar-glass sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] lg:hidden transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
              {currentTabInfo.title}
            </h1>
            <div
              className="hidden sm:flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium text-[var(--text-secondary)] border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <FolderGit2 size={11} className="text-[var(--primary)]" />
              <span>default</span>
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
            {currentTabInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh Data"
          className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Refresh data"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin text-[var(--primary)]' : ''} />
        </button>

        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
          aria-label="Toggle color theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-indigo-600" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        <button
          onClick={onNewScenario}
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Plus size={13} />
          <span>New Test Case</span>
        </button>

        <button
          onClick={onNewEvaluation}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-98"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
          }}
        >
          <Plus size={13} />
          <span>Run Evaluation</span>
        </button>

        <UserMenu currentUser={currentUser} onLogout={onLogout} />
      </div>
    </header>
  );
};
