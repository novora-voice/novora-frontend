'use client';

import React from 'react';
import { TestRun } from '@/types/execution';
import {
  User,
  Bot,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ZapOff,
  Flame,
  FileCheck2,
} from 'lucide-react';

export type TimelineEventType =
  | 'user_message'
  | 'agent_response'
  | 'tool_call'
  | 'tool_result'
  | 'interruption'
  | 'guardrail'
  | 'provider_error'
  | 'evaluation_event';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
  verified?: boolean;
}

interface EventTimelineProps {
  testRun: TestRun | null;
  loading: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ testRun, loading }) => {
  const events: TimelineEvent[] = (testRun?.events ?? []).map((event) => {
    const payload = event.payload ?? {};
    const kind = event.event_type.toLowerCase();
    const rawType = kind.includes('user') || kind.includes('transcript') ? 'user_message'
      : kind.includes('agent') || kind.includes('response') ? 'agent_response'
      : kind.includes('tool') && (kind.includes('result') || kind.includes('outcome')) ? 'tool_result'
      : kind.includes('tool') ? 'tool_call'
      : kind.includes('guardrail') ? 'guardrail'
      : kind.includes('error') ? 'provider_error'
      : 'evaluation_event';
    const name = String(payload.tool_name ?? payload.name ?? '');
    const content = String(payload.message ?? payload.text ?? payload.agent_response ?? payload.result ?? '');
    const title = name ? `${rawType === 'tool_result' ? 'Tool result' : 'Tool call'}: ${name}`
      : kind.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    return {
      id: event.id,
      type: rawType as TimelineEventType,
      timestamp: new Date(event.timestamp).toLocaleTimeString(),
      title,
      description: content || `Provider event: ${event.event_type}`,
      payload,
    };
  });

  const getEventBadge = (type: TimelineEventType, verified?: boolean) => {
    switch (type) {
      case 'user_message':
        return { icon: User, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' };
      case 'agent_response':
        return { icon: Bot, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
      case 'tool_call':
        return { icon: Wrench, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'tool_result':
        return verified
          ? { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
          : { icon: ShieldAlert, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'guardrail':
        return { icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      case 'interruption':
        return { icon: ZapOff, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' };
      case 'provider_error':
        return { icon: Flame, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
      case 'evaluation_event':
        return { icon: FileCheck2, color: 'text-[var(--primary)] bg-[var(--primary-subtle)] border-[var(--primary)]/20' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Provider Event Stream</span>
        <span className="font-mono">{events.length} captured events</span>
      </div>

      {loading && <p className="text-xs text-[var(--text-muted)]">Loading events from the saved test run…</p>}
      {!loading && !testRun && <p className="rounded-xl border p-4 text-xs text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>No provider test run is linked to this evaluation, so provider events are unavailable.</p>}
      {!loading && testRun?.status === 'FAILED' && <p className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 text-xs text-rose-600">Provider run failed: {testRun.error_message || 'No error details were recorded.'}</p>}

      {events.length > 0 && <div className="relative border-l-2 ml-4 pl-6 space-y-6" style={{ borderColor: 'var(--border-color)' }}>
        {events.map((ev) => {
          const badge = getEventBadge(ev.type, ev.verified);
          const IconComponent = badge.icon;

          return (
            <div key={ev.id} className="relative group">
              <div
                className={`absolute -left-[35px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border ${badge.color}`}
              >
                <IconComponent size={14} />
              </div>

              <div
                className="rounded-xl border p-3.5 transition-all hover:shadow-sm"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{ev.title}</span>
                    {ev.verified === false && (
                      <span className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase bg-rose-500/20 text-rose-500">
                        Unverified Claim
                      </span>
                    )}
                    {ev.verified === true && ev.type === 'tool_result' && (
                      <span className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-500">
                        Verified Action
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{ev.timestamp}</span>
                </div>

                <p className="text-xs text-[var(--text-secondary)]">{ev.description}</p>

                {ev.payload && (
                  <pre
                    className="mt-2 rounded-lg p-2 text-[10px] font-mono overflow-x-auto text-[var(--text-muted)]"
                    style={{ backgroundColor: 'var(--bg-surface)' }}
                  >
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
};
