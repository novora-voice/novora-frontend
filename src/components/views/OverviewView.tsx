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
  Play,
  GitCompare,
  TrendingUp,
  Clock,
  AlertTriangle,
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
  const failRate = totalEvals > 0 ? Math.round((failCount / totalEvals) * 100) : 0;
  const inconclusiveRate = totalEvals > 0 ? Math.round((inconclusiveCount / totalEvals) * 100) : 0;

  const recentEvals = [...evaluations].slice(0, 6);

  const metricCards = [
    {
      label: 'Evaluations Run',
      value: totalEvals,
      suffix: 'total',
      icon: Activity,
      iconBg: 'var(--primary-subtle)',
      iconColor: 'var(--primary)',
      trend: null,
    },
    {
      label: 'Compliance Pass Rate',
      value: `${passRate}%`,
      suffix: `${passCount} passed`,
      icon: CheckCircle2,
      iconBg: 'var(--status-success-bg)',
      iconColor: 'var(--status-success)',
      trend: passRate >= 70 ? 'up' : passRate >= 40 ? 'neutral' : 'down',
      progress: passRate,
    },
    {
      label: 'Detected Breaches',
      value: failCount,
      suffix: 'policy violations',
      icon: XCircle,
      iconBg: 'var(--status-error-bg)',
      iconColor: 'var(--status-error)',
      trend: null,
    },
    {
      label: 'Active Scenarios',
      value: scenarios.length,
      suffix: 'test suites',
      icon: FlaskConical,
      iconBg: 'var(--bg-elevated)',
      iconColor: 'var(--text-secondary)',
      trend: null,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="metric-card rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {card.label}
                </span>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.iconBg, color: card.iconColor }}
                >
                  <Icon size={15} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[var(--text-primary)]">
                  {card.value}
                </span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {card.suffix}
                </span>
              </div>
              {/* Progress bar for pass rate */}
              {'progress' in card && typeof card.progress === 'number' && totalEvals > 0 && (
                <div className="mt-3">
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="rounded-2xl border p-6 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2563EB, transparent)' }}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                <Sparkles size={10} />
                AI Voice Agent Infrastructure
              </span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] leading-snug">
              Verify Voice Agent Behavior Against Real Business Rules
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
              Novora tests conversational transcripts with transparent, evidence-backed
              deterministic checks. Every verdict links back to the exact character span in
              dialogue turns — no black-box AI decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewEvaluation}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-98"
              style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              <Play size={14} />
              <span>Run Evaluation</span>
            </button>
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <GitCompare size={14} />
              <span>Regression Diff</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Status Distribution + Recent Evals Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Recent Evaluations (2 cols) */}
        <div
          className="lg:col-span-2 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recent Evaluation Reports
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Click any report to inspect evidence excerpts and speaker turns
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('evaluations')}
              className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline shrink-0"
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="p-4">
            {recentEvals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl mb-3"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                >
                  <ShieldAlert size={26} />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  No evaluations recorded yet
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                  Submit an agent conversation transcript or connect a provider webhook to
                  evaluate behavior.
                </p>
                <button
                  onClick={onOpenNewEvaluation}
                  className="mt-4 rounded-xl px-4 py-2 text-xs font-bold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Run First Evaluation
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentEvals.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvaluation(ev)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 cursor-pointer hover:border-[var(--primary)] transition-all"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <StatusBadge status={ev.overall_status} size="sm" />
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                          {ev.summary}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--text-muted)] font-mono">
                          <span>#{ev.id.slice(0, 10)}</span>
                          <span>·</span>
                          <Clock size={10} />
                          <span>{new Date(ev.evaluated_at).toLocaleString()}</span>
                          <span>·</span>
                          <span>{ev.rule_results.length} checks</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Inspect →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status breakdown + Scenarios (1 col) */}
        <div className="space-y-4">
          {/* Status distribution */}
          {totalEvals > 0 && (
            <div
              className="rounded-2xl border p-5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-4">
                Result Distribution
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'PASS', count: passCount, pct: passRate, color: 'var(--status-success)' },
                  { label: 'FAIL', count: failCount, pct: failRate, color: 'var(--status-error)' },
                  { label: 'INCONCLUSIVE', count: inconclusiveCount, pct: inconclusiveRate, color: 'var(--status-warning)' },
                ].map(({ label, count, pct, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color }}>
                        {label}
                      </span>
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenarios quick list */}
          <div
            className="rounded-2xl border flex flex-col"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Active Test Suites
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {scenarios.length} deterministic scenario{scenarios.length === 1 ? '' : 's'}
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

            <div className="p-4 space-y-2.5 flex-1">
              {scenarios.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                  No scenarios yet.
                </div>
              ) : (
                scenarios.slice(0, 4).map((scen) => (
                  <div
                    key={scen.id}
                    className="rounded-xl border p-3 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="font-bold text-[var(--text-primary)] mb-1 truncate">
                      {scen.name}
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-1.5">
                      {scen.business_goal}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[var(--text-muted)]">
                      <span
                        className="flex items-center gap-1"
                        style={{ color: 'var(--primary)' }}
                      >
                        <FlaskConical size={10} />
                        {scen.rules?.length || 0} rules
                      </span>
                      <span className="font-mono">{scen.id.slice(0, 12)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-4 pb-4">
              <button
                onClick={onOpenNewScenario}
                className="w-full rounded-xl border py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                style={{ borderColor: 'var(--border-color)' }}
              >
                + Create New Scenario
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
