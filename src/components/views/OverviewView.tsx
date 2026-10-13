'use client';

import React from 'react';
import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { StatusBadge } from '../evaluations/StatusBadge';
import { ActiveTab } from '../Sidebar';
import {
  CheckCircle2,
  XCircle,
  FlaskConical,
  Activity,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Calendar,
  Play,
  GitCompare,
} from 'lucide-react';

interface OverviewViewProps {
  evaluations: EvaluationReport[];
  scenarios: EvaluationScenario[];
  onSelectEvaluation: (report: EvaluationReport) => void;
  onOpenNewEvaluation: () => void;
  onOpenNewScenario: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCompare: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  evaluations,
  scenarios,
  onSelectEvaluation,
  onOpenNewEvaluation,
  onOpenNewScenario,
  onNavigateTab,
  onOpenCompare,
}) => {
  const totalEvals = evaluations.length;
  const passCount = evaluations.filter((e) => e.overall_status === 'PASS').length;
  const failCount = evaluations.filter((e) => e.overall_status === 'FAIL').length;
  const inconclusiveCount = evaluations.filter((e) => e.overall_status === 'INCONCLUSIVE').length;
  const passRate = totalEvals > 0 ? Math.round((passCount / totalEvals) * 100) : 0;

  const recentEvals = [...evaluations].slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Evaluations */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Evaluations Run
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              {totalEvals}
            </span>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              total sessions
            </span>
          </div>
        </div>

        {/* Task Pass Rate */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Compliance Pass Rate
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              {passRate}%
            </span>
            <span className="text-xs font-semibold text-[var(--status-success)]">
              {passCount} passed
            </span>
          </div>
        </div>

        {/* Policy Violations / Fails */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Detected Breaches
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--status-error-bg)', color: 'var(--status-error)' }}
            >
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              {failCount}
            </span>
            <span className="text-xs font-semibold text-[var(--status-error)]">
              policy violations
            </span>
          </div>
        </div>

        {/* Test Scenarios */}
        <div
          className="rounded-2xl border p-5 shadow-sm transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Active Scenarios
            </span>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
            >
              <FlaskConical size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[var(--text-primary)]">
              {scenarios.length}
            </span>
            <span className="text-xs font-semibold text-[var(--text-muted)]">
              deterministic suites
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Welcome Banner */}
      <div
        className="rounded-2xl border p-6 shadow-sm relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                AI Voice Agent Infrastructure
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Verify Voice Agent Behavior Against Real Business Rules
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              Novora tests conversational agent transcripts with transparent, evidence-backed deterministic checks. Every verdict links back to the exact character span in dialogue turns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewEvaluation}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-98"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Play size={14} />
              <span>Run Evaluation</span>
            </button>
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <GitCompare size={14} />
              <span>Regression Diff</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Evaluations & Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Evaluation Runs (2 cols) */}
        <div
          className="lg:col-span-2 rounded-2xl border p-6 shadow-sm"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recent Evaluation Reports
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Click any report to inspect cited evidence excerpts and speaker turns
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('evaluations')}
              className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {recentEvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert size={36} className="text-[var(--text-muted)] mb-2 opacity-50" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                No evaluations recorded yet
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                Submit an agent conversation transcript or connect a provider webhook to evaluate behavior.
              </p>
              <button
                onClick={onOpenNewEvaluation}
                className="mt-4 rounded-lg px-3.5 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Run First Evaluation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEvals.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvaluation(ev)}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-4 cursor-pointer hover:border-[var(--primary)] transition-all"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={ev.overall_status} size="sm" />
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {ev.summary.slice(0, 75)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
                      <span>ID: #{ev.id.slice(0, 10)}</span>
                      <span>•</span>
                      <span>{new Date(ev.evaluated_at).toLocaleString()}</span>
                      <span>•</span>
                      <span>{ev.rule_results.length} checks</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Scenarios Quick List (1 col) */}
        <div
          className="rounded-2xl border p-6 shadow-sm flex flex-col"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Active Test Suites
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Defined deterministic scenarios
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('scenarios')}
              className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              <span>Manage</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {scenarios.map((scen) => (
              <div
                key={scen.id}
                className="rounded-xl border p-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="font-bold text-[var(--text-primary)] mb-1">
                  {scen.name}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-2">
                  {scen.business_goal}
                </p>
                <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)]">
                  <span>{scen.rules?.length || 0} policy rules</span>
                  <span className="font-mono">{scen.id.slice(0, 12)}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenNewScenario}
            className="mt-4 w-full rounded-xl border py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            + Create New Scenario
          </button>
        </div>
      </div>
    </div>
  );
};
