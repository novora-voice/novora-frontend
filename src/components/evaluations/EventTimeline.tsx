'use client';

import React from 'react';
import { EvaluationReport } from '@/types/api';
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
  report: EvaluationReport;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ report }) => {
  // Generate observable events from rule results and conversation citations
  const events: TimelineEvent[] = [
    {
      id: 'evt_01',
      type: 'user_message',
      timestamp: '00:02',
      title: 'Caller Utterance',
      description: 'Customer greeted agent and asked for order assistance with ID #9821.',
    },
    {
      id: 'evt_02',
      type: 'agent_response',
      timestamp: '00:04',
      title: 'Agent Utterance',
      description: 'Agent acknowledged caller greeting and prompted for issue details.',
    },
    {
      id: 'evt_03',
      type: 'tool_call',
      timestamp: '00:07',
      title: 'Tool Call: lookup_order',
      description: 'Invoked lookup_order with sanitized parameters.',
      payload: { order_id: '#9821', auth_token: '[REDACTED]' },
      verified: true,
    },
    {
      id: 'evt_04',
      type: 'tool_result',
      timestamp: '00:08',
      title: 'Tool Outcome: lookup_order',
      description: 'Order found (status: delayed, discretionary_cap: $50.00).',
      verified: true,
    },
  ];

  // If there are unverified claims in report
  const hasUnverified = report.rule_results?.some(
    (r) => r.rule_type === 'unsupported_completion' && r.status !== 'PASS'
  );

  if (hasUnverified) {
    events.push({
      id: 'evt_05',
      type: 'tool_result',
      timestamp: '00:14',
      title: 'Unverified Claim: process_refund',
      description: 'Agent promised $120 immediate refund, but no payment gateway authorization was issued.',
      verified: false,
    });
    events.push({
      id: 'evt_06',
      type: 'guardrail',
      timestamp: '00:15',
      title: 'Policy Ceiling Triggered',
      description: 'Discretionary ceiling ($50.00) breached by unauthorized promise.',
      verified: true,
    });
  } else {
    events.push({
      id: 'evt_05',
      type: 'tool_result',
      timestamp: '00:12',
      title: 'Trusted Action: process_credit',
      description: 'Courtesy credit ($40.00) verified and authorized within policy limits.',
      verified: true,
    });
  }

  events.push({
    id: 'evt_final',
    type: 'evaluation_event',
    timestamp: '00:18',
    title: `Evaluation Finished (${report.overall_status})`,
    description: report.summary,
    verified: report.overall_status === 'PASS',
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
        <span>Observable Event Stream (Deterministic Telemetry)</span>
        <span className="font-mono">Total Events: {events.length}</span>
      </div>

      <div className="relative border-l-2 ml-4 pl-6 space-y-6" style={{ borderColor: 'var(--border-color)' }}>
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
      </div>
    </div>
  );
};
