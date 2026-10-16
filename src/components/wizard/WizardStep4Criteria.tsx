'use client';

import React, { useState } from 'react';
import { RuleConfig, RuleType } from '@/types/api';
import { ShieldCheck, Scale, Plus, Trash2, Edit3, X, Check, CheckCircle2 } from 'lucide-react';

export interface EvaluatorCriterionState {
  id: string;
  type: 'deterministic' | 'llm_judge';
  name: string;
  description: string;
  expected_behavior: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  enabled: boolean;
  rule_type?: RuleType;
  condition_field?: string;
  failure_message?: string;
  instructions?: string;
  objective?: string;
  failure_conditions?: string;
}

export function getInitialCriteriaForScenario(rules?: RuleConfig[]): EvaluatorCriterionState[] {
  const deterministic: EvaluatorCriterionState[] = (rules || []).map((r, i) => ({
    id: `crit_${i}_${r.rule_type}`,
    type: 'deterministic',
    rule_type: r.rule_type,
    name: r.name || r.rule_type,
    description: r.description || 'Deterministic policy verification',
    expected_behavior: typeof r.parameters === 'object' ? JSON.stringify(r.parameters) : String(r.parameters),
    severity: (r.rule_type === 'unsupported_completion' || r.rule_type === 'policy_compliance') ? 'CRITICAL' : 'WARNING',
    enabled: true,
  }));

  const judge: EvaluatorCriterionState[] = [
    {
      id: 'crit_judge_tone',
      type: 'llm_judge',
      name: 'Professional Voice & Tone',
      description: 'Agent maintains empathetic, patient, and clear tone',
      expected_behavior: 'Tone and professional clarity rubric >= 4/5',
      severity: 'INFO',
      enabled: true,
      instructions: 'Assess if the agent maintained polite, professional customer service language throughout the dialogue.',
      objective: 'Ensure professional tone',
    },
    {
      id: 'crit_judge_goal',
      type: 'llm_judge',
      name: 'Business Outcome Fidelity',
      description: 'Agent aligns dialogue towards the core scenario outcome',
      expected_behavior: 'Goal adherence rubric satisfied',
      severity: 'WARNING',
      enabled: true,
      instructions: 'Evaluate whether the agent resolved the customer request according to the business scenario instructions.',
      objective: 'Verify resolution outcome',
    },
  ];

  return [...deterministic, ...judge];
}

interface WizardStep4CriteriaProps {
  criteria: EvaluatorCriterionState[];
  onToggleCriterion: (id: string) => void;
  onAddCriterion: (criterion: EvaluatorCriterionState) => void;
  onRemoveCriterion: (id: string) => void;
  onUpdateCriterion: (criterion: EvaluatorCriterionState) => void;
}

export const WizardStep4Criteria: React.FC<WizardStep4CriteriaProps> = ({
  criteria,
  onToggleCriterion,
  onAddCriterion,
  onRemoveCriterion,
  onUpdateCriterion,
}) => {
  const deterministicRules = criteria.filter((c) => c.type === 'deterministic');
  const judgeRubrics = criteria.filter((c) => c.type === 'llm_judge');

  // Modal / form states
  const [showAddDeterministic, setShowAddDeterministic] = useState(false);
  const [showAddJudge, setShowAddJudge] = useState(false);
  const [editingCriterion, setEditingCriterion] = useState<EvaluatorCriterionState | null>(null);

  // New Deterministic Rule Form State
  const [detName, setDetName] = useState('');
  const [detDescription, setDetDescription] = useState('');
  const [detRuleType, setDetRuleType] = useState<RuleType>('required_phrase');
  const [detCondition, setDetCondition] = useState('');
  const [detSeverity, setDetSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('WARNING');
  const [detFailureMsg, setDetFailureMsg] = useState('');

  // New Custom LLM Evaluation Form State
  const [judgeName, setJudgeName] = useState('');
  const [judgeInstructions, setJudgeInstructions] = useState('');
  const [judgeObjective, setJudgeObjective] = useState('');
  const [judgeExpectedBehavior, setJudgeExpectedBehavior] = useState('');
  const [judgeFailureConditions, setJudgeFailureConditions] = useState('');
  const [judgeSeverity, setJudgeSeverity] = useState<'CRITICAL' | 'WARNING' | 'INFO'>('WARNING');

  const handleCreateDeterministic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detName.trim()) return;

    const newRule: EvaluatorCriterionState = {
      id: `custom_det_${Date.now()}`,
      type: 'deterministic',
      rule_type: detRuleType,
      name: detName.trim(),
      description: detDescription.trim() || `Verify ${detRuleType} condition`,
      expected_behavior: detCondition.trim() || 'Condition met',
      severity: detSeverity,
      failure_message: detFailureMsg.trim() || undefined,
      enabled: true,
    };

    onAddCriterion(newRule);
    setShowAddDeterministic(false);
    setDetName('');
    setDetDescription('');
    setDetCondition('');
    setDetFailureMsg('');
  };

  const handleCreateJudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judgeName.trim() || !judgeInstructions.trim()) return;

    const newJudge: EvaluatorCriterionState = {
      id: `custom_judge_${Date.now()}`,
      type: 'llm_judge',
      name: judgeName.trim(),
      description: judgeObjective.trim() || judgeName.trim(),
      instructions: judgeInstructions.trim(),
      objective: judgeObjective.trim(),
      expected_behavior: judgeExpectedBehavior.trim() || 'Adheres to criteria',
      failure_conditions: judgeFailureConditions.trim() || undefined,
      severity: judgeSeverity,
      enabled: true,
    };

    onAddCriterion(newJudge);
    setShowAddJudge(false);
    setJudgeName('');
    setJudgeInstructions('');
    setJudgeObjective('');
    setJudgeExpectedBehavior('');
    setJudgeFailureConditions('');
  };

  return (
    <div className="space-y-5 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 4 — Define Evaluation Rules &amp; LLM Criteria</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Deterministic checks verify explicit conditions in code. Custom LLM evaluations assess semantic fidelity in plain English.
        </p>
      </div>

      {/* Layer A: Deterministic Rules */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-blue-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Deterministic Rules ({deterministicRules.filter((r) => r.enabled).length}/{deterministicRules.length} Active)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowAddDeterministic(!showAddDeterministic)}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold text-[var(--primary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--primary)' }}
          >
            <Plus size={13} />
            <span>Add Deterministic Rule</span>
          </button>
        </div>

        {/* In-Line Form for Adding Deterministic Rule */}
        {showAddDeterministic && (
          <form onSubmit={handleCreateDeterministic} className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--primary)' }}>
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-500" />
                <span>Define Deterministic Check (Evaluated in Application Code)</span>
              </h5>
              <button type="button" onClick={() => setShowAddDeterministic(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  value={detName}
                  onChange={(e) => setDetName(e.target.value)}
                  placeholder="e.g. Require Order ID Mention"
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Rule Type</label>
                <select
                  value={detRuleType}
                  onChange={(e) => setDetRuleType(e.target.value as RuleType)}
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <option value="required_phrase">Required phrase or keyword</option>
                  <option value="prohibited_phrase">Forbidden phrase or keyword</option>
                  <option value="expected_tool_call">Required tool/action invocation</option>
                  <option value="policy_compliance">Numeric threshold / Policy limit</option>
                  <option value="required_information">Required structured data</option>
                  <option value="required_closing">Required closing pattern</option>
                  <option value="required_escalation">Required escalation</option>
                  <option value="turn_constraints">Turn count threshold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">
                  Evaluation Condition / Expected Value *
                </label>
                <input
                  type="text"
                  required
                  value={detCondition}
                  onChange={(e) => setDetCondition(e.target.value)}
                  placeholder="e.g. order_id, 50.0, or keyword pattern"
                  className="w-full rounded-xl border p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Severity</label>
                <select
                  value={detSeverity}
                  onChange={(e) => setDetSeverity(e.target.value as 'CRITICAL' | 'WARNING' | 'INFO')}
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <option value="CRITICAL">CRITICAL (Fails entire evaluation if violated)</option>
                  <option value="WARNING">WARNING (Flags regression without hard failure)</option>
                  <option value="INFO">INFO (Advisory note)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-[var(--text-secondary)] block mb-1">Failure Explanation (Optional)</label>
              <input
                type="text"
                value={detFailureMsg}
                onChange={(e) => setDetFailureMsg(e.target.value)}
                placeholder="e.g. Agent completed the call without collecting customer ID"
                className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddDeterministic(false)}
                className="rounded-xl border px-3 py-1.5 text-xs text-[var(--text-muted)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-4 py-1.5 font-bold text-white text-xs"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Save Deterministic Rule
              </button>
            </div>
          </form>
        )}

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

                <div className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    rule.severity === 'CRITICAL'
                      ? 'bg-red-500/10 text-red-500'
                      : rule.severity === 'WARNING'
                      ? 'bg-amber-500/10 text-amber-600'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {rule.severity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveCriterion(rule.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-red-500"
                    title="Remove Rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layer B: Custom LLM Evaluations */}
      <div className="space-y-2.5 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale size={15} className="text-amber-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              Custom LLM Evaluations ({judgeRubrics.filter((r) => r.enabled).length}/{judgeRubrics.length} Active)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => setShowAddJudge(!showAddJudge)}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'rgb(245, 158, 11)' }}
          >
            <Plus size={13} />
            <span>Add LLM Evaluation</span>
          </button>
        </div>

        {/* In-Line Form for Adding LLM Evaluation */}
        {showAddJudge && (
          <form onSubmit={handleCreateJudge} className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'rgb(245, 158, 11)' }}>
            <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                <Scale size={14} className="text-amber-500" />
                <span>Add Plain-English LLM Evaluation Criteria</span>
              </h5>
              <button type="button" onClick={() => setShowAddJudge(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Evaluation Name *</label>
                <input
                  type="text"
                  required
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  placeholder="e.g. Did the agent follow the refund policy?"
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Evaluation Objective</label>
                <input
                  type="text"
                  value={judgeObjective}
                  onChange={(e) => setJudgeObjective(e.target.value)}
                  placeholder="e.g. Enforce $50 refund limit without exceptions"
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[var(--text-secondary)] block mb-1">
                Evaluation Instructions (Plain English for LLM Judge) *
              </label>
              <textarea
                rows={3}
                required
                value={judgeInstructions}
                onChange={(e) => setJudgeInstructions(e.target.value)}
                placeholder="e.g. Check whether the agent asked for the customer verification ID before discussing account balances, and ensure it did not promise an instantaneous bank wire."
                className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Failure Conditions</label>
                <input
                  type="text"
                  value={judgeFailureConditions}
                  onChange={(e) => setJudgeFailureConditions(e.target.value)}
                  placeholder="e.g. Approves refund > $50 or fails to authenticate"
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </div>
              <div>
                <label className="font-semibold text-[var(--text-secondary)] block mb-1">Severity</label>
                <select
                  value={judgeSeverity}
                  onChange={(e) => setJudgeSeverity(e.target.value as 'CRITICAL' | 'WARNING' | 'INFO')}
                  className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <option value="CRITICAL">CRITICAL (Hard failure if rubric fails)</option>
                  <option value="WARNING">WARNING (Quality regression flag)</option>
                  <option value="INFO">INFO (Advisory nuance)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddJudge(false)}
                className="rounded-xl border px-3 py-1.5 text-xs text-[var(--text-muted)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl px-4 py-1.5 font-bold text-white text-xs bg-amber-600 hover:bg-amber-700"
              >
                Save LLM Evaluation
              </button>
            </div>
          </form>
        )}

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
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {rubric.instructions || rubric.description}
                    </p>
                    {rubric.failure_conditions && (
                      <div className="mt-1 text-[10px] text-red-500 font-mono">
                        Fails when: {rubric.failure_conditions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-amber-500/10 text-amber-600">
                    {rubric.severity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveCriterion(rubric.id)}
                    className="p-1 text-[var(--text-muted)] hover:text-red-500"
                    title="Remove Evaluation"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
