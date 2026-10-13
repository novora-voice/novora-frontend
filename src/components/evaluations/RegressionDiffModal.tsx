'use client';

import React, { useState } from 'react';
import { EvaluationReport, RegressionReport } from '@/types/api';
import { novoraApi } from '@/lib/api';
import { StatusBadge } from './StatusBadge';
import {
  X,
  GitCompare,
  ArrowRight,
  AlertOctagon,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

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
  const [baselineId, setBaselineId] = useState<string>(
    initialBaselineId || (evaluations[0]?.id ?? '')
  );
  const [candidateId, setCandidateId] = useState<string>(
    evaluations[1]?.id || (evaluations[0]?.id ?? '')
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diffReport, setDiffReport] = useState<RegressionReport | null>(null);

  const handleRunDiff = async () => {
    if (!baselineId || !candidateId) {
      setError('Please select both a baseline and a candidate evaluation.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await novoraApi.compareEvaluations(baselineId, candidateId);
      setDiffReport(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compare evaluation runs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <GitCompare size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Regression Diff Comparator
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Detect behavioral drifts and deterministic policy violations across test runs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Comparison Selector Controls */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b p-6"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              1. Baseline Evaluation (Known Benchmark)
            </label>
            <select
              value={baselineId}
              onChange={(e) => setBaselineId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {evaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  [{ev.overall_status}] {ev.id.slice(0, 14)} — {new Date(ev.evaluated_at).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              2. Candidate Evaluation (New Run)
            </label>
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-xs font-mono font-medium focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {evaluations.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  [{ev.overall_status}] {ev.id.slice(0, 14)} — {new Date(ev.evaluated_at).toLocaleTimeString()}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={handleRunDiff}
              disabled={loading || !baselineId || !candidateId}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Analyzing Diff...' : 'Compute Regression Report'}</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            className="m-6 rounded-lg p-3 text-xs font-medium border"
            style={{
              backgroundColor: 'var(--status-error-bg)',
              borderColor: 'var(--status-error)',
              color: 'var(--status-error)',
            }}
          >
            {error}
          </div>
        )}

        {/* Diff Results Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!diffReport && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GitCompare size={36} className="text-[var(--text-muted)] mb-3 opacity-50" />
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                Ready to Compare
              </h4>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mt-1">
                Select a baseline and candidate evaluation run above, then click &ldquo;Compute Regression Report&rdquo; to review status deltas.
              </p>
            </div>
          )}

          {diffReport && (
            <div className="space-y-6">
              {/* Verdict Summary Card */}
              <div
                className="rounded-xl border p-5 flex flex-wrap items-center justify-between gap-4"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Baseline
                    </div>
                    <StatusBadge status={diffReport.baseline_status} size="md" />
                  </div>
                  <ArrowRight size={18} className="text-[var(--text-muted)]" />
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                      Candidate
                    </div>
                    <StatusBadge status={diffReport.candidate_status} size="md" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {diffReport.regression_detected ? (
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: 'var(--status-error-bg)',
                        borderColor: 'var(--status-error)',
                        color: 'var(--status-error)',
                      }}
                    >
                      <AlertOctagon size={16} />
                      <span>Regression Detected</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider border"
                      style={{
                        backgroundColor: 'var(--status-success-bg)',
                        borderColor: 'var(--status-success)',
                        color: 'var(--status-success)',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>No Regression Detected</span>
                    </div>
                  )}
                  <StatusBadge status={diffReport.net_status_change} size="md" />
                </div>
              </div>

              {/* Rule Diffs Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Rule-by-Rule Outcome Comparisons ({diffReport.rule_comparisons.length})
                </h4>

                <div
                  className="rounded-xl border overflow-hidden"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr
                        className="border-b text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        <th className="px-4 py-3">Rule Name</th>
                        <th className="px-4 py-3">Baseline</th>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Delta</th>
                        <th className="px-4 py-3">Explanation Diff</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                      {diffReport.rule_comparisons.map((rule, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[var(--bg-elevated)] transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                            <div>{rule.rule_name}</div>
                            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                              {rule.rule_type}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={rule.baseline_status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={rule.candidate_status} size="sm" />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={rule.change} size="sm" />
                          </td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">
                            {rule.explanation_diff || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="border-t px-6 py-3 flex justify-end"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
