'use client';

import React from 'react';
import { Conversation, EvaluationReport } from '@/types/api';
import { User, Bot, Wrench, ShieldCheck, AlertCircle } from 'lucide-react';

interface ConversationTranscriptProps {
  report: EvaluationReport;
  conversation: Conversation | null;
  loading: boolean;
}

interface TranscriptTurn {
  sequence: number;
  speaker: 'customer' | 'agent' | 'system' | 'tool';
  text: string;
  timestamp: string;
  highlightRule?: string;
  isViolation?: boolean;
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({ report, conversation, loading }) => {
  // Collect evidence excerpts to cross-reference with transcript
  const evidenceMap = new Map<number, { excerpt: string; ruleName: string; isViolation: boolean }>();
  report.rule_results?.forEach((rule) => {
    rule.evidence?.forEach((ev) => {
      evidenceMap.set(ev.message_sequence, {
        excerpt: ev.excerpt,
        ruleName: rule.rule_name,
        isViolation: rule.status === 'FAIL',
      });
    });
  });

  const turns: TranscriptTurn[] = (conversation?.messages ?? []).map((message) => ({
    sequence: message.sequence,
    speaker: message.role,
    timestamp: message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Time unavailable',
    text: message.content,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Complete Dialogue Transcript with Rule Citations</span>
        <span className="font-mono">{turns.length} transcript messages</span>
      </div>

      {loading && <p className="text-xs text-[var(--text-muted)]">Loading saved provider transcript…</p>}
      {!loading && !conversation && <p className="rounded-xl border p-4 text-xs text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>The saved conversation transcript could not be loaded.</p>}
      {!loading && conversation && turns.length === 0 && <p className="rounded-xl border p-4 text-xs text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>The provider run did not save any transcript messages.</p>}

      <div className="space-y-3">
        {turns.map((turn) => {
          const isAgent = turn.speaker === 'agent';
          const citation = evidenceMap.get(turn.sequence);

          return (
            <div
              key={turn.sequence}
              className={`rounded-xl border p-4 transition-colors ${
                citation?.isViolation
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : citation
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-[var(--border-color)] bg-[var(--bg-elevated)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md ${
                      isAgent
                        ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                        : 'bg-sky-500/10 text-sky-500'
                    }`}
                  >
                    {isAgent ? <Bot size={13} /> : <User size={13} />}
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] capitalize">
                    {turn.speaker}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    Turn #{turn.sequence}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {citation && (
                    <span
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                        citation.isViolation
                          ? 'bg-rose-500/20 text-rose-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      {citation.isViolation ? <AlertCircle size={10} /> : <ShieldCheck size={10} />}
                      <span>Cited: {citation.ruleName}</span>
                    </span>
                  )}
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{turn.timestamp}</span>
                </div>
              </div>

              <p className="text-xs text-[var(--text-primary)] leading-relaxed pl-8">
                {turn.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
