'use client';

import React, { useState } from 'react';
import { EvaluationScenario, EvaluationReport } from '@/types/api';
import { novoraApi } from '@/lib/api';
import { StatusBadge } from '../evaluations/StatusBadge';
import {
  FlaskConical,
  Plus,
  Play,
  History,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ScenariosViewProps {
  scenarios: EvaluationScenario[];
  onOpenNewScenario: () => void;
  onRunScenario: (scenarioId: string) => void;
  onSelectEvaluation: (report: EvaluationReport) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  scenarios,
  onOpenNewScenario,
  onRunScenario,
  onSelectEvaluation,
}) => {
  const [expandedScenarioId, setExpandedScenarioId] = useState<string | null>(null);
  const [historyReports, setHistoryReports] = useState<Record<string, EvaluationReport[]>>({});
  const [loadingHistory, setLoadingHistory] = useState<Record<string, boolean>>({});

  const toggleExpand = async (id: string) => {
    if (expandedScenarioId === id) {
      setExpandedScenarioId(null);
      return;
    }

    setExpandedScenarioId(id);

    // Fetch history if not loaded yet
    if (!historyReports[id]) {
      setLoadingHistory((prev) => ({ ...prev, [id]: true }));
      try {
        const history = await novoraApi.getScenarioHistory(id);
        setHistoryReports((prev) => ({ ...prev, [id]: history }));
      } catch {
        // Fallback or empty if not found
        setHistoryReports((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setLoadingHistory((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div
        className="rounded-2xl border p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">
            Deterministic Test Scenarios ({scenarios.length})
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Define task success boundaries and policy constraints for automated evaluation
          </p>
        </div>
        <button
          onClick={onOpenNewScenario}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-98 self-start sm:self-auto"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={15} />
          <span>New Test Scenario</span>
        </button>
      </div>

      {/* Scenario List Cards */}
      <div className="space-y-4">
        {scenarios.map((scen) => {
          const isExpanded = expandedScenarioId === scen.id;
          const history = historyReports[scen.id] || [];
          const isLoadingHist = loadingHistory[scen.id] || false;

          return (
            <div
              key={scen.id}
              className="rounded-2xl border shadow-sm transition-all overflow-hidden"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              {/* Scenario Card Header */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        #{scen.id}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">•</span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Created {new Date(scen.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      {scen.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onRunScenario(scen.id)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      <Play size={13} />
                      <span>Run Test</span>
                    </button>
                    <button
                      onClick={() => toggleExpand(scen.id)}
                      className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      <History size={13} />
                      <span>History</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Business Goal */}
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                    Business Objective & Goal
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {scen.business_goal}
                  </p>
                </div>

                {/* Success Criteria Pills */}
                {scen.success_criteria && scen.success_criteria.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                      Success Criteria
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scen.success_criteria.map((crit, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border"
                          style={{
                            backgroundColor: 'var(--bg-elevated)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span>{crit}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Configured Rules Grid */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1.5">
                    Deterministic Checks ({scen.rules?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {scen.rules?.map((rule, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border p-3 text-xs flex flex-col justify-between"
                        style={{
                          backgroundColor: 'var(--bg-elevated)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[var(--text-primary)]">
                              {rule.name}
                            </span>
                            <span className="rounded bg-[var(--primary-subtle)] text-[var(--primary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                              {rule.rule_type}
                            </span>
                          </div>
                          {rule.description && (
                            <p className="text-[11px] text-[var(--text-muted)] mb-2">
                              {rule.description}
                            </p>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-[var(--text-muted)] bg-black/5 dark:bg-white/5 p-1.5 rounded border border-[var(--border-color)]">
                          {JSON.stringify(rule.parameters)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* History Drawer if expanded */}
              {isExpanded && (
                <div
                  className="border-t p-6 animate-in slide-in-from-top-2 duration-150"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Historical Evaluation Runs for #{scen.id}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {history.length} run{history.length === 1 ? '' : 's'} recorded
                    </span>
                  </div>

                  {isLoadingHist ? (
                    <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                      Loading run history...
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                      No evaluation runs recorded for this scenario yet. Click &ldquo;Run Test&rdquo; to evaluate an agent conversation.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div
                          key={h.id}
                          onClick={() => onSelectEvaluation(h)}
                          className="flex items-center justify-between rounded-xl border p-3 cursor-pointer hover:border-[var(--primary)] transition-all"
                          style={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-color)',
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <StatusBadge status={h.overall_status} size="sm" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {h.summary.slice(0, 60)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
                            <span>{new Date(h.evaluated_at).toLocaleString()}</span>
                            <span className="text-[var(--primary)] font-bold">&rarr;</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
