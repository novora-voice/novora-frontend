'use client';

import React from 'react';
import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { CheckCircle2, XCircle, AlertTriangle, Activity, Bot, Puzzle } from 'lucide-react';

interface OverviewMetricsProps {
  evaluations: EvaluationReport[];
  scenarios: EvaluationScenario[];
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  evaluations,
  scenarios,
}) => {
  const total = evaluations.length;
  const passCount = evaluations.filter((e) => e.overall_status === 'PASS').length;
  const failCount = evaluations.filter((e) => e.overall_status === 'FAIL').length;
  const inconclusiveCount = evaluations.filter((e) => e.overall_status === 'INCONCLUSIVE').length;
  const passRate = total > 0 ? Math.round((passCount / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Total Evaluations</span>
          <Activity size={16} className="text-[var(--primary)]" />
        </div>
        <div className="text-2xl font-black tracking-tight text-[var(--text-primary)]">{total}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">Across {scenarios.length} test scenarios</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Pass Rate</span>
          <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
        <div className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">{passRate}%</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">{passCount} passed runs</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Failures & Violations</span>
          <XCircle size={16} className="text-red-500" />
        </div>
        <div className="text-2xl font-black tracking-tight text-red-600 dark:text-red-400">{failCount}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">Policy & deterministic breaches</div>
      </div>

      <div className="rounded-2xl border p-4 shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span className="font-semibold uppercase tracking-wider text-[10px]">Inconclusive</span>
          <AlertTriangle size={16} className="text-amber-500" />
        </div>
        <div className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">{inconclusiveCount}</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">Missing authoritative evidence</div>
      </div>
    </div>
  );
};
