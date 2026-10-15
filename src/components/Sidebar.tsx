'use client';

import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/context/ThemeContext';
import {
  LayoutDashboard,
  Bot,
  ClipboardCheck,
  FlaskConical,
  Puzzle,
  BookOpen,
  Settings,
  Sparkles,
  Layers,
  ShieldCheck,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { novoraApi } from '@/lib/api';
import { PlannedFeatureType } from './common/PlannedFeatureModal';

export type ActiveTab =
  | 'overview'
  | 'agents'
  | 'evaluations'
  | 'scenarios'
  | 'integrations'
  | 'knowledge'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPlannedModal: (feature: PlannedFeatureType) => void;
  isBackendConnected: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'evaluations', label: 'Evaluations', icon: ClipboardCheck },
  { id: 'scenarios', label: 'Scenarios', icon: FlaskConical },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ROADMAP_ITEMS: {
  feature: PlannedFeatureType;
  label: string;
  badge: string;
  icon: React.ElementType;
}[] = [
  { feature: 'voxia', label: 'Voxia Runtime', badge: 'Phase 2', icon: Sparkles },
  { feature: 'langgraph', label: 'LangGraph', badge: 'Planned', icon: Layers },
  { feature: 'rbac', label: 'RBAC / Org', badge: 'Planned', icon: ShieldCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenPlannedModal,
  isBackendConnected,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { theme } = useTheme();

  return (
    <>
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-60 flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 backdrop-blur-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex h-16 items-center justify-between border-b px-5" style={{ borderColor: 'var(--border-color)' }}>
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
          <button
            onClick={onCloseMobile}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          <div>
            <div className="mb-2 px-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
              Platform
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      onCloseMobile();
                    }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                    }`}
                    style={isActive ? { background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)' } : {}}
                  >
                    <Icon size={17} className={isActive ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="mb-2 px-3 text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">
              Roadmap (Phase 2)
            </div>
            <div className="space-y-1">
              {ROADMAP_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.feature}
                    onClick={() => onOpenPlannedModal(item.feature)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border-color)' }}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t p-3" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between rounded-xl p-2.5 text-xs" style={{ backgroundColor: 'var(--bg-elevated)' }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isBackendConnected && (
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ backgroundColor: 'var(--status-success)' }} />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: isBackendConnected ? 'var(--status-success)' : 'var(--status-warning)' }} />
              </span>
              <div>
                <div className="font-semibold text-[var(--text-primary)]">{isBackendConnected ? 'Backend Connected' : 'Local Sandbox'}</div>
                <div className="max-w-[130px] truncate text-[10px] text-[var(--text-muted)] font-mono">{novoraApi.getBaseUrl()}</div>
              </div>
            </div>
            {isBackendConnected ? <Wifi size={14} style={{ color: 'var(--status-success)' }} /> : <WifiOff size={14} style={{ color: 'var(--status-warning)' }} />}
          </div>
        </div>
      </aside>
    </>
  );
};
