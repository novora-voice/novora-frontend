'use client';

import React from 'react';
import { RuleResult } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { Quote, User, Bot } from 'lucide-react';

interface EvidenceCardProps {
  rule: RuleResult;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ rule }) => {
  const formatRuleType = (t: string) => {
    switch (t) {
      case 'required_information':
        return 'Required Information';
      case 'policy_compliance':
        return 'Policy Compliance';
      case 'required_steps':
        return 'Required Workflow Steps';
      case 'prohibited_claims':
        return 'Prohibited Claims';
      case 'unsupported_completion':
        return 'Unsupported Completion';
      case 'unresolved_work':
        return 'Unresolved Work';
      default:
        return t.replace(/_/g, ' ');
    }
  };

  return (
    <div
      className="rounded-xl border p-5 transition-all shadow-sm"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)',
              }}
            >
              {formatRuleType(rule.rule_type)}
            </span>
          </div>
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            {rule.rule_name}
          </h4>
        </div>
        <StatusBadge status={rule.status} size="md" />
      </div>

      {/* Explanation text */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
        {rule.explanation}
      </p>

      {/* Cited Evidence Spans */}
      {rule.evidence && rule.evidence.length > 0 ? (
        <div className="space-y-2.5 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <Quote size={12} />
            <span>Supporting Dialogue Evidence ({rule.evidence.length} citation{rule.evidence.length > 1 ? 's' : ''})</span>
          </div>

          {rule.evidence.map((span, idx) => {
            const isAgent = span.role === 'agent';
            return (
              <div
                key={idx}
                className="rounded-lg p-3 border text-xs"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                        isAgent
                          ? 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                          : 'bg-emerald-500/15 text-emerald-500'
                      }`}
                    >
                      {isAgent ? <Bot size={11} /> : <User size={11} />}
                      <span>{span.role}</span>
                    </span>
                    <span className="text-[11px] font-mono text-[var(--text-muted)]">
                      Turn #{span.message_sequence}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Chars [{span.start_char}..{span.end_char}]
                  </span>
                </div>
                <div className="font-mono text-[var(--text-primary)] bg-black/5 dark:bg-white/5 p-2 rounded border border-[var(--border-color)]">
                  &ldquo;{span.excerpt}&rdquo;
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] italic pt-2">
          <span>No specific text citations returned for this rule check.</span>
        </div>
      )}
    </div>
  );
};
