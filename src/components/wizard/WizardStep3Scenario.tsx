'use client';

import React from 'react';
import { EvaluationScenario } from '@/types/api';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '@/lib/scenarioTemplates';
import { FlaskConical, CheckCircle2, Sparkles } from 'lucide-react';

interface WizardStep3ScenarioProps {
  scenarios: EvaluationScenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenario: EvaluationScenario | ScenarioTemplate) => void;
}

export const WizardStep3Scenario: React.FC<WizardStep3ScenarioProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 3 — Choose a Test Scenario</h3>
        <p className="text-xs text-[var(--text-secondary)]">Pick from standard industry templates or your custom scenarios</p>
      </div>

      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Sparkles size={12} className="text-[var(--primary)]" />
          <span>Recommended Templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SCENARIO_TEMPLATES.map((tmpl) => {
            const isSelected = selectedScenarioId === tmpl.template_id;
            return (
              <div
                key={tmpl.template_id}
                onClick={() => onSelectScenario(tmpl)}
                className={`cursor-pointer rounded-2xl border p-3.5 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-md'
                    : 'hover:border-[var(--border-color)]'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{tmpl.name}</span>
                    {isSelected && <CheckCircle2 size={15} className="text-[var(--primary)] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] line-clamp-3 mb-2">{tmpl.business_goal}</p>
                </div>
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{tmpl.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {scenarios.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <FlaskConical size={12} />
            <span>Saved Workspace Scenarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {scenarios.map((scen) => {
              const isSelected = selectedScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => onSelectScenario(scen)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all flex items-center justify-between ${
                    isSelected ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' : 'hover:border-[var(--border-color)]'
                  }`}
                  style={{ backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)', borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)' }}
                >
                  <div className="overflow-hidden">
                    <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{scen.name}</h5>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{scen.business_goal}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={15} className="text-[var(--primary)] shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
