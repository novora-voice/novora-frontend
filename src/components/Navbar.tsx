'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ActiveTab } from './Sidebar';
import {
  Sun,
  Moon,
  Menu,
  Plus,
  RefreshCw,
  FolderGit2,
  LogOut,
  ChevronDown,
  User,
} from 'lucide-react';
import { AuthUser } from '@/types/api';

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
  knowledge: {
    title: 'Knowledge Base',
    subtitle: 'Connect authorised data sources for evidence-backed evaluation (Phase 2)',
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
  onLogout,
  currentUser,
  isLoading,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentTabInfo = TAB_TITLES[activeTab] ?? TAB_TITLES.overview;
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = currentUser.email
    ? currentUser.email.slice(0, 2).toUpperCase()
    : 'NO';

  return (
    <header
      className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6 backdrop-blur-md"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* ── Left: mobile toggle + page title ── */}
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

      {/* ── Right: Actions ── */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
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

        {/* Theme toggle */}
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

        {/* New test case — desktop */}
        <button
          onClick={onNewScenario}
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <Plus size={13} />
          <span>New Test Case</span>
        </button>

        {/* Run Evaluation — primary CTA */}
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

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex h-8 items-center gap-1.5 rounded-lg border pl-1 pr-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            {/* Avatar */}
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}
            >
              {initials}
            </span>
            <ChevronDown
              size={12}
              className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute right-0 mt-1.5 w-52 rounded-xl border shadow-lg z-50 animate-in slide-in-from-top-2 duration-150"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <div
                className="border-b px-4 py-3"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #60A5FA)' }}
                  >
                    {initials}
                  </span>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {currentUser.email}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      Workspace: default
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { setUserMenuOpen(false); onLogout(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-[var(--status-error)] hover:bg-[var(--status-error-bg)] transition-colors"
                >
                  <LogOut size={13} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
