'use client';

import React from 'react';
import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';
import { CheckCircle2, AlertCircle, Clock, Settings, Play } from 'lucide-react';

export interface IntegrationItem {
  id: string;
  name: string;
  category: 'voice_agent' | 'transcription' | 'telephony' | 'business_tools';
  purpose: string;
  logo: string;
  status: 'connected' | 'not_connected' | 'pending' | 'unsupported';
  supportedOperations: string[];
  webhookPath?: string;
  recoveryGuidance?: string;
  testActionLabel?: string;
}

interface IntegrationCardProps {
  item: IntegrationItem;
  onConfigure: (item: IntegrationItem) => void;
  onTestConnection: (item: IntegrationItem) => void;
  isTesting?: boolean;
}

const STATUS_BADGES: Record<
  IntegrationItem['status'],
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  connected: { label: 'Connected', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', icon: CheckCircle2 },
  not_connected: { label: 'Disconnected', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', icon: AlertCircle },
  pending: { label: 'Pending Check', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', icon: Clock },
  unsupported: { label: 'Roadmap', bg: 'bg-slate-500/10', text: 'text-slate-500', icon: AlertCircle },
};

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  item,
  onConfigure,
  onTestConnection,
  isTesting,
}) => {
  const badge = STATUS_BADGES[item.status];
  const BadgeIcon = badge.icon;

  return (
    <div
      className="flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div
              className="relative h-11 w-11 rounded-xl border p-1 shrink-0"
              style={{
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <Image src={assetPath(item.logo)} alt={item.name} width={38} height={38} className="object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{item.name}</h3>
              <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">{item.purpose}</p>
            </div>
          </div>

          <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badge.bg} ${badge.text}`}>
            <BadgeIcon size={11} />
            <span>{badge.label}</span>
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-3 leading-relaxed">
          {item.purpose}
        </p>

        {item.status === 'not_connected' && item.recoveryGuidance && (
          <div className="mb-3 rounded-lg border p-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20">
            {item.recoveryGuidance}
          </div>
        )}

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
            Supported Operations
          </span>
          <div className="flex flex-wrap gap-1">
            {item.supportedOperations.map((op, idx) => (
              <span
                key={idx}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium border"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => onConfigure(item)}
          className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={13} />
          <span>Configure</span>
        </button>

        {item.status !== 'unsupported' ? (
          <button
            onClick={() => onTestConnection(item)}
            disabled={isTesting}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-white shadow-sm transition-transform active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play size={12} className={isTesting ? 'animate-spin' : ''} />
            <span>{isTesting ? 'Testing...' : item.testActionLabel ?? 'Test Connection'}</span>
          </button>
        ) : (
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">Coming Soon</span>
        )}
      </div>
    </div>
  );
};
