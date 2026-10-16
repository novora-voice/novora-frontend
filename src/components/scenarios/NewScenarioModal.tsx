'use client';

import React, { useState } from 'react';
import { CreateScenarioPayload, EvaluationScenario, RuleConfig } from '@/types/api';
import { novoraApi, ApiError } from '@/lib/api';
import { ScenarioTemplate } from '@/lib/scenarioTemplates';
import { ScenarioTemplateBar } from './ScenarioTemplateBar';
import { RuleFormSection } from './RuleFormSection';
import { X, FlaskConical, Plus, Loader2 } from 'lucide-react';

interface NewScenarioModalProps {
  onClose: () => void;
  onScenarioCreated: (scenario: EvaluationScenario) => void;
}

export const NewScenarioModal: React.FC<NewScenarioModalProps> = ({
  onClose,
  onScenarioCreated,
}) => {
  const [name, setName] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [rules, setRules] = useState<RuleConfig[]>([
    { rule_type: 'required_information', name: 'Collect ID', description: 'Ensure customer identifier captured', parameters: { required_fields: ['id'] } },
    { rule_type: 'policy_compliance', name: 'Policy Limit Check', description: 'Cap compensation under threshold', parameters: { max_amount: 50.0 } },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = (template: ScenarioTemplate) => {
    setName(template.name);
    setBusinessGoal(template.business_goal);
    setSuccessCriteria(template.success_criteria.join('\n'));
    setRules(template.rules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessGoal.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const payload: CreateScenarioPayload = {
      name: name.trim(),
      business_goal: businessGoal.trim(),
      success_criteria: successCriteria.split('\n').map((s) => s.trim()).filter(Boolean),
      rules,
    };

    try {
      const created = await novoraApi.createScenario(payload);
      onScenarioCreated(created);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to create scenario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <FlaskConical size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">Create Evaluation Scenario</h2>
              <p className="text-xs text-[var(--text-muted)]">Configure business objectives and deterministic verification rules</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Close"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <ScenarioTemplateBar onSelectTemplate={handleSelectTemplate} />

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">Scenario Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Delayed Shipment Compensation Flow"
              className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">Business Goal *</label>
            <textarea
              required
              rows={2}
              value={businessGoal}
              onChange={(e) => setBusinessGoal(e.target.value)}
              placeholder="Describe what the agent must achieve and boundaries to respect..."
              className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">Success Criteria (one per line)</label>
            <textarea
              rows={2}
              value={successCriteria}
              onChange={(e) => setSuccessCriteria(e.target.value)}
              placeholder="Order ID verified&#10;Credit <= $50"
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <RuleFormSection
            rules={rules}
            onAddRule={() => setRules([...rules, { rule_type: 'policy_compliance', name: 'New Rule', description: '', parameters: {} }])}
            onRemoveRule={(i) => setRules(rules.filter((_, idx) => idx !== i))}
            onUpdateRule={(i, field, val) => setRules(rules.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))}
          />

          {error && <div className="rounded-xl border p-3 text-xs bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400">{error}</div>}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">Cancel</button>
            <button type="submit" disabled={isSubmitting || !name.trim()} className="flex items-center gap-1.5 rounded-xl px-5 py-2 font-bold text-white shadow-sm disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>{isSubmitting ? 'Saving...' : 'Create Scenario'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
