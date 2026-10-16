'use client';

import React from 'react';
import { EvaluationScenario, EvaluationReport } from '@/types/api';
import { FlaskConical, AlertOctagon, CheckCircle2, Play, ArrowUpRight } from 'lucide-react';

interface OverviewScenarioHealthProps {
  scenarios: EvaluationScenario[];
  evaluations: EvaluationReport[];
  onRunScenario: (scenarioId: string) => void;
  onNavigateToScenarios: () => void;
}

export const OverviewScenarioHealth: React.FC<OverviewScenarioHealthProps> = ({
  scenarios,
  evaluations,
  onRunScenario,
  onNavigateToScenarios,
}) => {
  return (
    <div
      className="rounded-2xl border p-5 transition-shadow hover:shadow-md"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <FlaskConical size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Scenario Health & Compliance</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Repeated policy breaches & success tracking</p>
          </div>
        </div>

        <button
          onClick={onNavigateToScenarios}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <span>All Scenarios</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="space-y-2.5">
        {scenarios.slice(0, 3).map((scenario) => {
          const scenarioEvals = evaluations.filter((e) => e.scenario_id === scenario.id);
          const failedEvals = scenarioEvals.filter((e) => e.overall_status === 'FAIL');
          const passEvals = scenarioEvals.filter((e) => e.overall_status === 'PASS');
          const hasRepeatedFailures = failedEvals.length > 0;

          return (
            <div
              key={scenario.id}
              className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {scenario.name}
                  </span>
                  {hasRepeatedFailures ? (
                    <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <AlertOctagon size={10} />
                      <span>{failedEvals.length} Failed</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={10} />
                      <span>Passing</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                  {scenario.business_goal}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{passEvals.length} Pass / {failedEvals.length} Fail</span>
                </div>

                <button
                  onClick={() => onRunScenario(scenario.id)}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  <Play size={11} />
                  <span>Test</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
