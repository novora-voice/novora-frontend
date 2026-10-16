'use client';

import React from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from '../evaluations/StatusBadge';
import {
  Clock,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Activity,
} from 'lucide-react';

interface OverviewRecentActivityProps {
  evaluations: EvaluationReport[];
  onSelectEvaluation: (report: EvaluationReport) => void;
  onViewAll: () => void;
}

export const OverviewRecentActivity: React.FC<OverviewRecentActivityProps> = ({
  evaluations,
  onSelectEvaluation,
  onViewAll,
}) => {
  const recent = evaluations.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div
        className="rounded-2xl border p-8 text-center shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <Activity size={36} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
        <h3 className="text-sm font-bold text-[var(--text-primary)]">No recent evaluations</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
          Run your first evaluation to see activity here. Connect a provider and configure a scenario to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex items-center gap-2">
          <BarChart3 size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Evaluation Activity</h3>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
            {evaluations.length} total
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          <span>View All</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {recent.map((ev, idx) => (
          <button
            key={ev.id}
            onClick={() => onSelectEvaluation(ev)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-elevated)] transition-colors animate-in fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <StatusBadge status={ev.overall_status} size="sm" />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-xs">
                  {ev.summary || 'Evaluation Run'}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                  <span>{ev.rule_results?.length || 0} checks</span>
                  <span>·</span>
                  <span>{ev.scenario_id}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-mono">
                <Clock size={10} />
                <span>
                  {new Date(ev.evaluated_at).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <ExternalLink size={12} style={{ color: 'var(--text-muted)' }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
