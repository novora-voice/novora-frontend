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
  ChevronRight,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'evaluations' | 'scenarios' | 'integrations' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  isBackendConnected: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isBackendConnected,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { theme } = useTheme();

  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      enabled: true,
    },
    {
      id: 'evaluations' as ActiveTab,
      label: 'Evaluations',
      icon: ClipboardCheck,
      badge: null,
      enabled: true,
    },
    {
      id: 'scenarios' as ActiveTab,
      label: 'Test Cases',
      icon: FlaskConical,
      badge: null,
      enabled: true,
    },
    {
      id: 'integrations' as ActiveTab,
      label: 'Integrations',
      icon: Puzzle,
      badge: '3 Active',
      enabled: true,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
      enabled: true,
    },
  ];

  const plannedItems = [
    {
      label: 'Agents (Voxia)',
      icon: Bot,
      tooltip: 'Runtime orchestration deferred to Milestone 2',
    },
    {
      label: 'Knowledge',
      icon: BookOpen,
      tooltip: 'RAG connectors deferred to Phase 2',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-100 lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Brand Header */}
        <div
          className="flex h-20 items-center justify-between border-b px-6"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-36 overflow-hidden">
              <Image
                src={theme === 'dark' ? '/novora-logo-dark.png' : '/novora-logo-light.png'}
                alt="Novora Logo"
                fill
                priority
                sizes="144px"
                className="object-contain object-left"
              />
            </div>
          </div>
          <span
            className="rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase"
            style={{
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
            }}
          >
            v0.1
          </span>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-2 px-3 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            Platform
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Planned / Roadmap Section */}
          <div className="mt-8 mb-2 px-3 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            Roadmap (Future)
          </div>
          <div className="space-y-1">
            {plannedItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  title={item.tooltip}
                  className="flex items-center justify-between rounded-lg px-3.5 py-2 text-sm text-[var(--text-muted)] opacity-60 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                    Planned
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backend Connectivity Status Footer */}
        <div
          className="border-t p-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div
            className="flex items-center justify-between rounded-lg p-3 text-xs"
            style={{ backgroundColor: 'var(--bg-elevated)' }}
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                {isBackendConnected ? (
                  <>
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ backgroundColor: 'var(--status-success)' }}
                    />
                    <span
                      className="relative inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: 'var(--status-success)' }}
                    />
                  </>
                ) : (
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: 'var(--status-warning)' }}
                  />
                )}
              </span>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">
                  {isBackendConnected ? 'Backend Connected' : 'Local Fallback'}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] font-mono">
                  {isBackendConnected ? 'FastAPI :8000' : 'Offline / Mock'}
                </div>
              </div>
            </div>
            {isBackendConnected ? (
              <Wifi size={15} style={{ color: 'var(--status-success)' }} />
            ) : (
              <WifiOff size={15} style={{ color: 'var(--status-warning)' }} />
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
