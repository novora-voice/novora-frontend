'use client';

import React from 'react';
import { RuleConfig } from '@/types/api';
import { CheckSquare, ShieldCheck, Scale, AlertTriangle } from 'lucide-react';

export interface EvaluatorCriterionState {
  id: string;
  type: 'deterministic' | 'llm_judge';
  name: string;
  description: string;
  expected_behavior: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  enabled: boolean;
}

interface WizardStep4CriteriaProps {
  criteria: EvaluatorCriterionState[];
  onToggleCriterion: (id: string) => void;
}

export const WizardStep4Criteria: React.FC<WizardStep4CriteriaProps> = ({
  criteria,
  onToggleCriterion,
}) => {
  const deterministicRules = criteria.filter((c) => c.type === 'deterministic');
  const judgeRubrics = criteria.filter((c) => c.type === 'llm_judge');

  return (
    <div className="space-y-5 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 4 — Configure Evaluation Criteria</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Deterministic checks run with character evidence spans. LLM-as-judge rubrics score conversational nuances.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <ShieldCheck size={14} className="text-blue-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Deterministic Rule Checks ({deterministicRules.filter((r) => r.enabled).length}/{deterministicRules.length} Active)
          </h4>
        </div>
        <div className="space-y-2">
          {deterministicRules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-xl border p-3 transition-colors ${rule.enabled ? 'border-[var(--primary)]/40 bg-[var(--bg-elevated)]' : 'opacity-60 border-[var(--border-color)]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id={rule.id}
                    checked={rule.enabled}
                    onChange={() => onToggleCriterion(rule.id)}
                    className="mt-0.5 rounded text-[var(--primary)] focus:ring-0"
                  />
                  <div>
                    <label htmlFor={rule.id} className="font-bold text-[var(--text-primary)] cursor-pointer block">
                      {rule.name}
                    </label>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{rule.description}</p>
                    <div className="mt-1 text-[10px] text-[var(--text-muted)] font-mono">
                      Expected: {rule.expected_behavior}
                    </div>
                  </div>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-red-500/10 text-red-500">
                  {rule.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Scale size={14} className="text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            LLM-as-Judge Rubrics ({judgeRubrics.filter((r) => r.enabled).length}/{judgeRubrics.length} Active)
          </h4>
        </div>
        <div className="space-y-2">
          {judgeRubrics.map((rubric) => (
            <div
              key={rubric.id}
              className={`rounded-xl border p-3 transition-colors ${rubric.enabled ? 'border-amber-500/40 bg-[var(--bg-elevated)]' : 'opacity-60 border-[var(--border-color)]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id={rubric.id}
                    checked={rubric.enabled}
                    onChange={() => onToggleCriterion(rubric.id)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0"
                  />
                  <div>
                    <label htmlFor={rubric.id} className="font-bold text-[var(--text-primary)] cursor-pointer block">
                      {rubric.name}
                    </label>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{rubric.description}</p>
                    <div className="mt-1 text-[10px] text-[var(--text-muted)] font-mono">
                      Rubric: {rubric.expected_behavior}
                    </div>
                  </div>
                </div>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500/10 text-amber-600">
                  {rubric.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
