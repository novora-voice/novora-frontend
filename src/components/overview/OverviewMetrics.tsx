'use client';

import React from 'react';
import { EvaluationReport, EvaluationStatus } from '@/types/api';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface OverviewMetricsProps {
  evaluations: EvaluationReport[];
  scenarios: { id: string; name: string }[];
}

interface MetricDef {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: 'up' | 'down' | 'flat';
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  evaluations,
  scenarios,
}) => {
  const total = evaluations.length;
  const passed = evaluations.filter((e) => e.overall_status === 'PASS').length;
  const failed = evaluations.filter((e) => e.overall_status === 'FAIL').length;
  const inconclusive = evaluations.filter((e) => e.overall_status === 'INCONCLUSIVE').length;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;

  const metrics: MetricDef[] = [
    {
      label: 'Total Evaluations',
      value: total,
      icon: TrendingUp,
      color: 'var(--primary)',
      bgColor: 'var(--primary-subtle)',
      trend: 'flat',
    },
    {
      label: 'Passed',
      value: passed,
      icon: CheckCircle2,
      color: 'var(--status-success)',
      bgColor: 'var(--status-success-bg)',
      trend: passed > failed ? 'up' : 'flat',
    },
    {
      label: 'Failed',
      value: failed,
      icon: XCircle,
      color: 'var(--status-error)',
      bgColor: 'var(--status-error-bg)',
      trend: failed > 0 ? 'down' : 'flat',
    },
    {
      label: 'Inconclusive',
      value: inconclusive,
      icon: AlertTriangle,
      color: 'var(--status-warning)',
      bgColor: 'var(--status-warning-bg)',
      trend: 'flat',
    },
  ];

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === 'up') return <TrendingUp size={12} style={{ color: 'var(--status-success)' }} />;
    if (trend === 'down') return <TrendingDown size={12} style={{ color: 'var(--status-error)' }} />;
    return <Minus size={12} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="metric-card rounded-2xl border p-5 shadow-sm count-up"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                animationDelay: `${i * 75}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: m.bgColor, color: m.color }}
                >
                  <Icon size={18} />
                </div>
                <TrendIcon trend={m.trend} />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {m.value}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pass Rate + Scenarios Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Pass Rate</h3>
            <span className="text-2xl font-bold" style={{ color: passRate >= 70 ? 'var(--status-success)' : passRate >= 40 ? 'var(--status-warning)' : 'var(--status-error)' }}>
              {passRate}%
            </span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${passRate}%` }} />
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-2">
            {total > 0 ? `${passed} of ${total} evaluations passed` : 'No evaluations yet'}
          </p>
        </div>

        <div
          className="rounded-2xl border p-5 shadow-sm"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">Active Scenarios</h3>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{scenarios.length}</div>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            {scenarios.length > 0
              ? `${scenarios.slice(0, 3).map((s) => s.name).join(', ')}${scenarios.length > 3 ? ` +${scenarios.length - 3} more` : ''}`
              : 'Create your first scenario to start evaluating'}
          </p>
        </div>
      </div>
    </div>
  );
};
