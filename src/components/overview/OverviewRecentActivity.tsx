'use client';

import React from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from '../evaluations/StatusBadge';
import { ArrowUpRight, Clock, FileText } from 'lucide-react';

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
  const recent = evaluations.slice(0, 5);

  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Recent Evaluation Activity</h3>
          <p className="text-xs text-[var(--text-muted)]">Verified evidence and verdicts from latest test executions</p>
        </div>
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline">
          <span>View All</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      {recent.length > 0 ? (
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {recent.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onSelectEvaluation(ev)}
              className="flex items-center justify-between py-3 cursor-pointer hover:bg-[var(--bg-elevated)] px-2 rounded-xl transition-colors"
            >
              <div className="space-y-1 overflow-hidden pr-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={ev.overall_status} size="sm" />
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-md">
                    {ev.summary || 'Evaluation Run'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>Scenario: {ev.scenario_id}</span>
                  <span>•</span>
                  <span>{ev.rule_results?.length || 0} rules checked</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs text-[var(--text-muted)]">
                <Clock size={12} />
                <span>{new Date(ev.evaluated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-[var(--text-muted)]">
          No evaluations recorded yet. Run your first test case to see evidence here.
        </div>
      )}
    </div>
  );
};
