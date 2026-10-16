'use client';

import React from 'react';
import { EvaluationScenario } from '@/types/api';
import { FlaskConical, Play, Eye, Copy, Edit2, History, CheckCircle2 } from 'lucide-react';

interface ScenarioCardProps {
  scenario: EvaluationScenario;
  onRun: (id: string) => void;
  onViewCriteria: (scenario: EvaluationScenario) => void;
  onDuplicate?: (scenario: EvaluationScenario) => void;
  onEdit?: (scenario: EvaluationScenario) => void;
  onViewHistory?: (scenarioId: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onRun,
  onViewCriteria,
  onDuplicate,
  onEdit,
  onViewHistory,
}) => {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <FlaskConical size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {scenario.name}
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono truncate block">
                {scenario.id}
              </span>
            </div>
          </div>

          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
          >
            {scenario.rules?.length || 0} Rules
          </span>
        </div>

        <p className="text-xs text-[var(--text-secondary)] mb-3 line-clamp-2">
          {scenario.business_goal}
        </p>

        {scenario.success_criteria && scenario.success_criteria.length > 0 && (
          <div className="mb-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Success Criteria
            </span>
            <ul className="space-y-1 text-xs text-[var(--text-secondary)]">
              {scenario.success_criteria.slice(0, 2).map((sc, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                  <span className="truncate">{sc}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between pt-3 border-t text-xs"
        style={{ borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewCriteria(scenario)}
            className="flex items-center gap-1 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Eye size={13} />
            <span>Criteria</span>
          </button>

          {onViewHistory && (
            <button
              onClick={() => onViewHistory(scenario.id)}
              title="View Scenario History"
              className="flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <History size={13} />
              <span>Runs</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onEdit && (
            <button
              onClick={() => onEdit(scenario)}
              title="Edit Scenario"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              <Edit2 size={13} />
            </button>
          )}

          {onDuplicate && (
            <button
              onClick={() => onDuplicate(scenario)}
              title="Duplicate Scenario"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
            >
              <Copy size={13} />
            </button>
          )}

          <button
            onClick={() => onRun(scenario.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play size={12} />
            <span>Evaluate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
