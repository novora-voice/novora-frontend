'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  FlaskConical,
  Puzzle,
  Settings,
  Bot,
  BookOpen,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { novoraApi } from '@/lib/api';

export type ActiveTab =
  | 'overview'
  | 'evaluations'
  | 'scenarios'
  | 'integrations'
  | 'knowledge'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isBackendConnected: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS = [
  { id: 'overview' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'evaluations' as ActiveTab, label: 'Evaluations', icon: ClipboardCheck },
  { id: 'scenarios' as ActiveTab, label: 'Test Cases', icon: FlaskConical },
  { id: 'integrations' as ActiveTab, label: 'Integrations', icon: Puzzle },
  { id: 'knowledge' as ActiveTab, label: 'Knowledge', icon: BookOpen },
  { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
];

const PLANNED_ITEMS = [
  {
    label: 'Agents (Voxia)',
    icon: Bot,
    tooltip: 'Runtime orchestration deferred to Milestone 2',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isBackendConnected,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { theme } = useTheme();

  const handleSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-56 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 bg-transparent backdrop-blur-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          // backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* ── Brand Header ── */}
        <div
          className="flex h-16 items-center justify-between border-b px-5"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-32">
              <Image
                src={theme === 'dark' ? '/novora-logo-dark.png' : '/novora-logo-light.png'}
                alt="Novora Logo"
                fill
                priority
                sizes="128px"
                className="object-contain object-left"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
              }}
            >
              v0.1
            </span>
            {/* Close button — mobile only */}
            <button
              onClick={onCloseMobile}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
              aria-label="Close sidebar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Nav section ── */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-2 px-2 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
            Platform
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                        }
                      : {}
                  }
                >
                  <Icon
                    size={17}
                    className={
                      isActive
                        ? 'text-white'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors'
                    }
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Roadmap section */}
          <div className="mt-6 mb-2 px-2 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
            Roadmap
          </div>
          <div className="space-y-0.5">
            {PLANNED_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  title={item.tooltip}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-[var(--text-muted)] opacity-90 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    Soon
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Backend connectivity footer ── */}
        <div className="border-t p-3" style={{ borderColor: 'var(--border-color)' }}>
          <div
            className="flex items-center justify-between rounded-xl p-3 text-xs"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-2.5">
              {/* Animated status dot */}
              <span className="relative flex h-2 w-2">
                {isBackendConnected ? (
                  <>
                    <span
                      className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
                      style={{ backgroundColor: 'var(--status-success)' }}
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full"
                      style={{ backgroundColor: 'var(--status-success)' }}
                    />
                  </>
                ) : (
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: 'var(--status-warning)' }}
                  />
                )}
              </span>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  {isBackendConnected ? 'Backend Connected' : 'Local Fallback'}
                </div>
                <div
                  className="max-w-[148px] truncate text-[10px] text-[var(--text-muted)] font-mono"
                  title={isBackendConnected ? novoraApi.getBaseUrl() : undefined}
                >
                  {isBackendConnected ? novoraApi.getBaseUrl() : 'Offline / Mock Data'}
                </div>
              </div>
            </div>
            {isBackendConnected ? (
              <Wifi size={14} style={{ color: 'var(--status-success)' }} />
            ) : (
              <WifiOff size={14} style={{ color: 'var(--status-warning)' }} />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
