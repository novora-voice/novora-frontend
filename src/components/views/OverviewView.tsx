'use client';

import React from 'react';
import { EvaluationReport, EvaluationScenario, VoiceAgent } from '@/types/api';
import { ActiveTab } from '../Sidebar';
import { OverviewMetrics } from '../overview/OverviewMetrics';
import { OverviewRecentActivity } from '../overview/OverviewRecentActivity';
import { OverviewAgentPerformance } from '../overview/OverviewAgentPerformance';
import { OverviewProviderHealth } from '../overview/OverviewProviderHealth';
import { OverviewScenarioHealth } from '../overview/OverviewScenarioHealth';
import { Play, GitCompare, LayoutDashboard } from 'lucide-react';

interface OverviewViewProps {
  evaluations: EvaluationReport[];
  scenarios: EvaluationScenario[];
  agents: VoiceAgent[];
  isBackendConnected: boolean;
  onSelectEvaluation: (report: EvaluationReport) => void;
  onOpenNewEvaluation: () => void;
  onOpenNewScenario: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenCompare: () => void;
  onRunScenario: (scenarioId: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  evaluations,
  scenarios,
  agents,
  isBackendConnected,
  onSelectEvaluation,
  onOpenNewEvaluation,
  onNavigateTab,
  onOpenCompare,
  onRunScenario,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Platform Overview
            </h2>
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
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play size={13} />
            <span>Run Test</span>
          </button>
        </div>
      </div>

      <OverviewMetrics evaluations={evaluations} scenarios={scenarios} />

      <OverviewProviderHealth
        onNavigateToIntegrations={() => onNavigateTab('integrations')}
        isBackendConnected={isBackendConnected}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OverviewAgentPerformance
          agents={agents}
          evaluations={evaluations}
          onNavigateToAgents={() => onNavigateTab('agents')}
        />
        <OverviewScenarioHealth
          scenarios={scenarios}
          evaluations={evaluations}
          onRunScenario={onRunScenario}
          onNavigateToScenarios={() => onNavigateTab('scenarios')}
        />
      </div>

      <OverviewRecentActivity
        evaluations={evaluations}
        onSelectEvaluation={onSelectEvaluation}
        onViewAll={() => onNavigateTab('evaluations')}
      />
    </div>
  );
};
