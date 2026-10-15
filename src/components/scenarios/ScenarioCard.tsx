'use client';

import React from 'react';
import { EvaluationScenario } from '@/types/api';
import { FlaskConical, Play, Eye, Copy, CheckCircle2 } from 'lucide-react';

interface ScenarioCardProps {
  scenario: EvaluationScenario;
  onRun: (id: string) => void;
  onViewCriteria: (scenario: EvaluationScenario) => void;
  onDuplicate?: (scenario: EvaluationScenario) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onRun,
  onViewCriteria,
  onDuplicate,
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
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <FlaskConical size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{scenario.name}</h3>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">{scenario.id}</span>
            </div>
          </div>

          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
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

      <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => onViewCriteria(scenario)}
          className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <Eye size={13} />
          <span>Criteria</span>
        </button>

        <div className="flex items-center gap-2">
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(scenario)}
              title="Duplicate Scenario"
              className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            >
              <Copy size={13} />
            </button>
          )}

          <button
            onClick={() => onRun(scenario.id)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-white shadow-sm"
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
