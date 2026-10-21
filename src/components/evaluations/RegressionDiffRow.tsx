'use client';

import React from 'react';
import { RuleComparison } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { ArrowRight, AlertTriangle, CheckCircle2, Minus, HelpCircle } from 'lucide-react';

interface RegressionDiffRowProps {
  comparison: RuleComparison;
}

export const RegressionDiffRow: React.FC<RegressionDiffRowProps> = ({ comparison }) => {
  const isRegressed = comparison.change === 'regressed';
  const isImproved = comparison.change === 'improved';
  const isNotEvaluated = comparison.change === 'not_evaluated';
  const isInconclusive = comparison.change === 'inconclusive';

  return (
    <div
      className={`rounded-xl border p-3.5 space-y-2 text-xs transition-colors ${
        isRegressed ? 'border-red-500/30 bg-red-500/5' : isImproved ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--border-color)]'
      }`}
      style={{ backgroundColor: isRegressed ? undefined : isImproved ? undefined : 'var(--bg-elevated)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold text-[var(--text-primary)]">{comparison.rule_name}</span>
          <span className="text-[10px] text-[var(--text-muted)] font-mono ml-2">({comparison.rule_type})</span>
        </div>

        <div className="flex items-center gap-1.5">
          {isRegressed ? (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-red-500/10 text-red-600 dark:text-red-400">
              <AlertTriangle size={10} />
              <span>Regressed</span>
            </span>
          ) : isImproved ? (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={10} />
              <span>Improved</span>
            </span>
          ) : isInconclusive || isNotEvaluated ? (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
              <HelpCircle size={10} />
              <span>{isNotEvaluated ? 'Not evaluated' : 'Inconclusive'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-[var(--text-muted)]">
              <Minus size={10} />
              <span>Unchanged</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold">Baseline:</span>
          <StatusBadge status={comparison.baseline_status} size="sm" />
        </div>
        <ArrowRight size={13} className="text-[var(--text-muted)]" />
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-[var(--text-muted)] font-semibold">Candidate:</span>
          <StatusBadge status={comparison.candidate_status} size="sm" />
        </div>
      </div>

      {comparison.explanation_diff && (
        <p className="text-[11px] text-[var(--text-secondary)] font-mono bg-[var(--bg-surface)] p-2 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
          {comparison.explanation_diff}
        </p>
      )}
    </div>
  );
};
