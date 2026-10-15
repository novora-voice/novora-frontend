'use client';

import React from 'react';
import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { ActiveTab } from '../Sidebar';
import { OverviewMetrics } from '../overview/OverviewMetrics';
import { OverviewRecentActivity } from '../overview/OverviewRecentActivity';
import { Play, Plus, GitCompare, LayoutDashboard } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Platform Overview</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Continuous monitoring of voice agent compliance, execution, and policy outcomes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCompare}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <GitCompare size={14} />
            <span>Regression Diff</span>
          </button>

          <button
            onClick={onOpenNewEvaluation}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play size={13} />
            <span>Run Test</span>
          </button>
        </div>
      </div>

      <OverviewMetrics evaluations={evaluations} scenarios={scenarios} />

      <OverviewRecentActivity
        evaluations={evaluations}
        onSelectEvaluation={onSelectEvaluation}
        onViewAll={() => onNavigateTab('evaluations')}
      />
    </div>
  );
};
