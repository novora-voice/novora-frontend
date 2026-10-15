'use client';

import React, { useState, useEffect } from 'react';
import { EvaluationReport, RegressionReport } from '@/types/api';
import { novoraApi, ApiError } from '@/lib/api';
import { RegressionDiffRow } from './RegressionDiffRow';
import { StatusBadge } from './StatusBadge';
import { X, GitCompare, ArrowRight, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RegressionDiffModalProps {
  evaluations: EvaluationReport[];
  initialBaselineId?: string;
  onClose: () => void;
}

export const RegressionDiffModal: React.FC<RegressionDiffModalProps> = ({
  evaluations,
  initialBaselineId,
  onClose,
}) => {
  const [baselineId, setBaselineId] = useState<string>(initialBaselineId || evaluations[0]?.id || '');
  const [candidateId, setCandidateId] = useState<string>(evaluations[1]?.id || evaluations[0]?.id || '');
  const [diff, setDiff] = useState<RegressionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCompare = async () => {
    if (!baselineId || !candidateId || baselineId === candidateId) {
      setError('Select two distinct evaluation runs to generate a regression comparison.');
      setDiff(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await novoraApi.compareEvaluations(baselineId, candidateId);
      setDiff(res);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Comparison failed.');
      setDiff(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (baselineId && candidateId && baselineId !== candidateId) {
      void runCompare();
    }
  }, [baselineId, candidateId]);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <GitCompare size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Evaluation Regression Diff</h2>
              <p className="text-xs text-[var(--text-muted)]">Rule-by-rule diff between candidate agent and baseline run</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Baseline Run (Before)</label>
              <select
                value={baselineId}
                onChange={(e) => setBaselineId(e.target.value)}
                className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                {evaluations.map((e) => (
                  <option key={e.id} value={e.id}>{e.id} — {e.overall_status} ({e.scenario_id})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Candidate Run (After)</label>
              <select
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                {evaluations.map((e) => (
                  <option key={e.id} value={e.id}>{e.id} — {e.overall_status} ({e.scenario_id})</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[var(--text-muted)]">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-[var(--primary)]" />
              <span>Analyzing regression differences...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl border p-3 text-xs bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
              {error}
            </div>
          ) : diff ? (
            <div className="space-y-4">
              <div className="rounded-xl border p-3.5 flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                <div>
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Net Verdict</span>
                  <span className="text-xs font-bold text-[var(--text-primary)] capitalize">{diff.net_status_change}</span>
                </div>
                {diff.regression_detected ? (
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400">
                    Regression Detected
                  </span>
                ) : (
                  <span className="rounded-full px-2.5 py-1 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    No Regressions Found
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Rule Comparison Breakdown
                </span>
                {diff.rule_comparisons.map((comp, idx) => (
                  <RegressionDiffRow key={idx} comparison={comp} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
