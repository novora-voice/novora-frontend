'use client';

import React from 'react';
import { EvaluationScenario } from '@/types/api';
import { X, ShieldCheck, Scale, CheckCircle2 } from 'lucide-react';

interface ScenarioCriteriaModalProps {
  scenario: EvaluationScenario | null;
  onClose: () => void;
  onRunTest: (id: string) => void;
}

export const ScenarioCriteriaModal: React.FC<ScenarioCriteriaModalProps> = ({
  scenario,
  onClose,
  onRunTest,
}) => {
  if (!scenario) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl relative"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">{scenario.name}</h2>
            <span className="text-xs text-[var(--text-muted)] font-mono">Criteria & Rule Configuration</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-1">
              Business Goal
            </span>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{scenario.business_goal}</p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-500" />
              <span>Configured Deterministic Rules ({scenario.rules?.length || 0})</span>
            </h3>
            <div className="space-y-2">
              {scenario.rules?.map((rule, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border p-3 space-y-1"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-primary)]">{rule.name || rule.rule_type}</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--primary-subtle)] text-[var(--primary)] font-semibold">
                      {rule.rule_type}
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-[11px] text-[var(--text-secondary)]">{rule.description}</p>
                  )}
                  {rule.parameters && Object.keys(rule.parameters).length > 0 && (
                    <div className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                      Parameters: {JSON.stringify(rule.parameters)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRunTest(scenario.id);
            }}
            className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Run Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};
