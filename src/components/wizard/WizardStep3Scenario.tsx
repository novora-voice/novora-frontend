'use client';

import React, { useState } from 'react';
import { CreateScenarioPayload, EvaluationScenario, RuleConfig, RuleType } from '@/types/api';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '@/lib/scenarioTemplates';
import { buildScenarioRules } from '@/lib/scenarioRules';
import { novoraApi } from '@/lib/api';
import { RuleFormSection } from '../scenarios/RuleFormSection';
import { FlaskConical, CheckCircle2, Sparkles, Plus, Loader2, Search, AlertCircle, Eye } from 'lucide-react';

interface WizardStep3ScenarioProps {
  scenarios: EvaluationScenario[];
  selectedScenarioId: string;
  onSelectScenario: (scenario: EvaluationScenario | ScenarioTemplate) => void;
  onScenarioCreated?: (scenario: EvaluationScenario) => void;
}

export const WizardStep3Scenario: React.FC<WizardStep3ScenarioProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onScenarioCreated,
}) => {
  const [search, setSearch] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [plainEnglishDescription, setPlainEnglishDescription] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [newRules, setNewRules] = useState<RuleConfig[]>([
    { rule_type: 'required_information', name: 'Required Information', description: 'id', parameters: { required_fields: ['id'], condition: 'id', severity: 'CRITICAL' } },
    { rule_type: 'policy_compliance', name: 'Policy Compliance', description: '50', parameters: { max_refund_amount: 50, condition: '50', severity: 'CRITICAL' } },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showSelectedDetails, setShowSelectedDetails] = useState(false);

  const filteredScenarios = scenarios.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.business_goal.toLowerCase().includes(search.toLowerCase())
  );
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId)
    ?? SCENARIO_TEMPLATES.find((scenario) => scenario.template_id === selectedScenarioId);

  const selectScenario = (scenario: EvaluationScenario | ScenarioTemplate) => {
    onSelectScenario(scenario);
    setShowSelectedDetails(false);
  };

  const handleConvertPlainEnglish = () => {
    if (!plainEnglishDescription.trim()) return;
    if (!newName) {
      setNewName(`Evaluation — ${plainEnglishDescription.slice(0, 32)}...`);
    }
    if (!newGoal) {
      setNewGoal(plainEnglishDescription.trim());
    }
    if (!newCriteria) {
      setNewCriteria('Agent follows policy limits\nAgent authenticates caller\nNo misleading guarantees');
    }
  };

  const handleCreateAndSelectScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newGoal.trim()) {
      setCreateError('Please enter a scenario name and business objective.');
      return;
    }

    setIsSaving(true);
    setCreateError(null);

    const rules: RuleConfig[] = [
      {
        rule_type: 'required_information',
        name: 'Authentication Verification',
        description: 'Verify identity or reference number captured',
        parameters: { required_fields: ['id'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Policy Compliance Check',
        description: 'Ensure limits and guidelines are followed',
        parameters: { max_refund_amount: 50.0 },
      },
    ];

    const payload: CreateScenarioPayload = {
      name: newName.trim(),
      business_goal: newGoal.trim(),
      success_criteria: newCriteria.split('\n').map((s) => s.trim()).filter(Boolean),
      rules: buildScenarioRules(newRules),
    };

    try {
      const created = await novoraApi.createScenario(payload);
      if (onScenarioCreated) {
        onScenarioCreated(created);
      }
      selectScenario(created);
      setIsCreatingNew(false);
      setNewName('');
      setNewGoal('');
      setPlainEnglishDescription('');
      setNewCriteria('');
      setNewRules(rules);
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to persist scenario.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 2 — Create or Select a Scenario</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Choose an existing scenario to evaluate your agent, or create a new scenario describing the conversation and behavior you want to test.
        </p>
      </div>

      {/* Action Header: Create New Toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved scenarios..."
            className="w-full rounded-xl border pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          />
        </div>
        <button
          type="button"
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold text-white shadow-sm transition-transform active:scale-95 text-xs shrink-0"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={14} />
          <span>{isCreatingNew ? 'Close Form' : 'Create New Scenario'}</span>
        </button>
      </div>

      {/* In-Line Plain-English Scenario Creator */}
      {isCreatingNew && (
        <form onSubmit={handleCreateAndSelectScenario} className="rounded-2xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--primary)' }}>
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--primary)]" />
              <span>Describe What You Want to Test (Plain English)</span>
            </h4>
            <span className="text-[10px] text-[var(--text-muted)]">Creates persisted scenario</span>
          </div>

          <div>
            <label className="font-semibold text-[var(--text-secondary)] block mb-1">
              Natural Language Description
            </label>
            <textarea
              rows={2}
              value={plainEnglishDescription}
              onChange={(e) => setPlainEnglishDescription(e.target.value)}
              onBlur={handleConvertPlainEnglish}
              placeholder="e.g., I want to test if the front desk agent validates reservation numbers and rejects refund claims exceeding $50 without manager authorization."
              className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            />
            <button
              type="button"
              onClick={handleConvertPlainEnglish}
              className="mt-1 text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              <Sparkles size={11} />
              <span>Auto-populate fields from description</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="font-semibold text-[var(--text-secondary)] block mb-1">Scenario Name *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Refund Policy Boundary Test"
                className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              />
            </div>
            <div>
              <label className="font-semibold text-[var(--text-secondary)] block mb-1">Business Objective *</label>
              <textarea
                rows={5}
                required
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Describe the business objective, expected outcome, and boundaries for the agent..."
                className="w-full resize-y rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[var(--text-secondary)] block mb-1">Success Criteria (one per line)</label>
            <textarea
              rows={2}
              value={newCriteria}
              onChange={(e) => setNewCriteria(e.target.value)}
              placeholder="Customer identifier collected&#10;Refund under threshold&#10;Polite closing"
              className="w-full rounded-xl border p-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <RuleFormSection
            rules={newRules}
            onAddRule={() => setNewRules((previous) => [
              ...previous,
              { rule_type: 'required_information', name: 'Required Information', description: '', parameters: { severity: 'WARNING' } },
            ])}
            onRemoveRule={(index) => setNewRules((previous) => previous.filter((_, idx) => idx !== index))}
            onUpdateRule={(index, field, value) => setNewRules((previous) => previous.map((rule, idx) => {
              if (idx !== index) return rule;
              if (field === 'rule_type') {
                const ruleType = value as RuleType;
                const label = ruleType.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
                return {
                  ...rule,
                  rule_type: ruleType,
                  name: label,
                  description: '',
                  parameters: { severity: rule.parameters.severity ?? 'WARNING', condition: '' },
                };
              }
              if (field === 'condition') {
                return { ...rule, description: String(value), parameters: { ...rule.parameters, condition: String(value) } };
              }
              return { ...rule, parameters: { ...rule.parameters, severity: String(value) } };
            }))}
          />

          {createError && (
            <div className="rounded-xl border p-2.5 bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="rounded-xl border px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 rounded-xl px-4 py-1.5 font-bold text-white shadow-sm text-xs"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
              <span>Save &amp; Select Scenario</span>
            </button>
          </div>
        </form>
      )}

      {/* Saved Workspace Scenarios */}
      {filteredScenarios.length > 0 ? (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
            <FlaskConical size={12} className="text-[var(--primary)]" />
            <span>Saved Workspace Scenarios ({filteredScenarios.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
            {filteredScenarios.map((scen) => {
              const isSelected = selectedScenarioId === scen.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => selectScenario(scen)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all flex items-center justify-between ${
                    isSelected ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-sm' : 'hover:border-[var(--border-color)]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  }}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center gap-1.5">
                      <h5 className="text-xs font-bold text-[var(--text-primary)] truncate">{scen.name}</h5>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{scen.business_goal}</p>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">ID: {scen.id}</span>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-[var(--primary)] shrink-0 ml-2" />}
                </div>
              );
            })}
          </div>
        </div>
      ) : scenarios.length === 0 ? (
        <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <FlaskConical size={28} className="mx-auto text-[var(--text-muted)] mb-2" />
          <h4 className="font-bold text-[var(--text-primary)]">No scenarios found</h4>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            Create your first test scenario describing the conversation and behavior you want to evaluate.
          </p>
          <button
            type="button"
            onClick={() => setIsCreatingNew(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 font-bold text-white text-xs"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Plus size={14} />
            <span>Create Scenario Now</span>
          </button>
        </div>
      ) : null}

      {/* Recommended Templates */}
      <div className="space-y-2 pt-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-500" />
          <span>Standard Industry Templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {SCENARIO_TEMPLATES.map((tmpl) => {
            const isSelected = selectedScenarioId === tmpl.template_id;
            return (
              <div
                key={tmpl.template_id}
                onClick={() => selectScenario(tmpl)}
                className={`cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-sm'
                    : 'hover:border-[var(--border-color)]'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{tmpl.name}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-[var(--primary)] shrink-0" />}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 mb-2">{tmpl.business_goal}</p>
                </div>
                <span className="text-[9px] uppercase font-bold text-[var(--text-muted)]">{tmpl.category}</span>
              </div>
            );
          })}
        </div>
      </div>

      {selectedScenario && (
        <div className="space-y-2 pt-1">
          <div className="flex justify-end">
            <button
              type="button"
              aria-expanded={showSelectedDetails}
              onClick={() => setShowSelectedDetails((shown) => !shown)}
              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <Eye size={13} />
              Show details
            </button>
          </div>
          {showSelectedDetails && (
            <section className="space-y-2 rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Business goal</h4>
                <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{selectedScenario.business_goal}</p>
              </div>
              {selectedScenario.success_criteria.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Success criteria</h4>
                  <ul className="mt-1 list-inside list-disc space-y-1 text-[11px] text-[var(--text-secondary)]">
                    {selectedScenario.success_criteria.map((criterion, index) => <li key={`${index}-${criterion}`}>{criterion}</li>)}
                  </ul>
                </div>
              )}
              {selectedScenario.rules.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Scenario checks</h4>
                  <ul className="mt-1 space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                    {selectedScenario.rules.map((rule, index) => (
                      <li key={`${index}-${rule.name}`}><strong>{rule.name}:</strong> {rule.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
};
