'use client';

import React, { useState } from 'react';
import { EvaluationScenario, RuleConfig, RuleType } from '@/types/api';
import { novoraApi } from '@/lib/api';
import {
  X,
  Trash2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

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
  const [successCriteria, setSuccessCriteria] = useState<string[]>([
    'Order ID collected from caller',
    'Offered refund <= $50',
  ]);
  const [newCriterion, setNewCriterion] = useState('');

  const [rules, setRules] = useState<RuleConfig[]>([
    {
      rule_type: 'required_information',
      name: 'Require Order ID',
      description: 'Ensure order_id is obtained from customer before action',
      parameters: { required_fields: ['order_id'] },
    },
    {
      rule_type: 'policy_compliance',
      name: 'Enforce $50 Discretionary Cap',
      description: 'Agent may not issue refund exceeding $50.00',
      parameters: { max_refund_amount: 50.0 },
    },
  ]);

  const [ruleType, setRuleType] = useState<RuleType>('policy_compliance');
  const [ruleName, setRuleName] = useState('');
  const [ruleParamVal, setRuleParamVal] = useState('50');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCriterion = () => {
    if (newCriterion.trim()) {
      setSuccessCriteria([...successCriteria, newCriterion.trim()]);
      setNewCriterion('');
    }
  };

  const handleRemoveCriterion = (idx: number) => {
    setSuccessCriteria(successCriteria.filter((_, i) => i !== idx));
  };

  const handleAddRule = () => {
    if (!ruleName.trim()) return;

    let parameters: Record<string, unknown> = {};
    if (ruleType === 'required_information') {
      parameters = {
        required_fields: ruleParamVal.split(',').map((s) => s.trim()).filter(Boolean),
      };
    } else if (ruleType === 'policy_compliance') {
      parameters = {
        max_refund_amount: parseFloat(ruleParamVal) || ruleParamVal,
      };
    } else if (ruleType === 'prohibited_claims') {
      parameters = {
        prohibited_patterns: ruleParamVal.split(',').map((s) => s.trim()).filter(Boolean),
      };
    } else if (ruleType === 'unsupported_completion') {
      parameters = {
        action_type: ruleParamVal.trim(),
      };
    } else if (ruleType === 'required_steps') {
      parameters = {
        steps: ruleParamVal.split(',').map((s) => s.trim()).filter(Boolean),
      };
    }

    setRules([
      ...rules,
      {
        rule_type: ruleType,
        name: ruleName.trim(),
        description: `Deterministic check for ${ruleType}`,
        parameters,
      },
    ]);

    setRuleName('');
    setRuleParamVal('');
  };

  const handleRemoveRule = (idx: number) => {
    setRules(rules.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Scenario name is required.');
      return;
    }
    if (!businessGoal.trim()) {
      setError('Business goal is required.');
      return;
    }
    if (rules.length === 0) {
      setError('Please add at least one deterministic evaluation rule.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await novoraApi.createScenario({
        name: name.trim(),
        business_goal: businessGoal.trim(),
        success_criteria: successCriteria,
        rules,
      });

      onScenarioCreated(created);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create scenario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Create Test Case Scenario
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Define business goals and explicit deterministic rule bounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div
              className="rounded-lg p-3 text-xs font-medium border flex items-center gap-2"
              style={{
                backgroundColor: 'var(--status-error-bg)',
                borderColor: 'var(--status-error)',
                color: 'var(--status-error)',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Name & Goal */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Scenario Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Inbound Return Verification & Credit Policy"
                className="w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Business Goal & Task Outcome *
              </label>
              <textarea
                rows={2}
                value={businessGoal}
                onChange={(e) => setBusinessGoal(e.target.value)}
                placeholder="e.g. Authenticate caller order id, handle delayed shipment claims, strictly cap discretionary refund credits at $50."
                className="w-full rounded-lg border px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                required
              />
            </div>
          </div>

          {/* Success Criteria */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              Success Criteria
            </label>
            <div className="space-y-2 mb-2">
              {successCriteria.map((crit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border px-3 py-1.5 text-xs"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="text-[var(--text-primary)] font-medium">• {crit}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="text-[var(--text-muted)] hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="Add criteria item (e.g. Confirmation email sent)"
                className="flex-1 rounded-lg border px-3 py-1.5 text-xs focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="rounded-lg border px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                style={{ borderColor: 'var(--border-color)' }}
              >
                Add
              </button>
            </div>
          </div>

          {/* Deterministic Evaluation Rules */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Deterministic Evaluation Rules ({rules.length})
              </label>
              <span className="text-[10px] text-[var(--text-muted)]">
                Tested deterministically without LLM hallucinations
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border p-3 text-xs"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">
                        {rule.name}
                      </span>
                      <span className="rounded bg-[var(--primary-subtle)] text-[var(--primary)] px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        {rule.rule_type}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                      Params: {JSON.stringify(rule.parameters)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveRule(idx)}
                    className="text-[var(--text-muted)] hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Rule Builder Sub-card */}
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="text-xs font-bold text-[var(--text-primary)]">
                + Configure New Deterministic Check
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                    Rule Type
                  </label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value as RuleType)}
                    className="w-full rounded-lg border px-3 py-1.5 text-xs font-medium"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <option value="policy_compliance">policy_compliance (Numeric limit)</option>
                    <option value="required_information">required_information (Fields)</option>
                    <option value="required_steps">required_steps (Workflow order)</option>
                    <option value="prohibited_claims">prohibited_claims (Banned patterns)</option>
                    <option value="unsupported_completion">unsupported_completion (Action verification)</option>
                    <option value="unresolved_work">unresolved_work (Resolution check)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                    Rule Name
                  </label>
                  <input
                    type="text"
                    value={ruleName}
                    onChange={(e) => setRuleName(e.target.value)}
                    placeholder="e.g. Cap Discretionary Refund at $50"
                    className="w-full rounded-lg border px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[11px] text-[var(--text-muted)] mb-1">
                  Parameter Value ({ruleType === 'required_information' ? 'comma-separated field names' : ruleType === 'required_steps' ? 'comma-separated workflow steps' : ruleType === 'prohibited_claims' ? 'comma-separated regex patterns' : ruleType === 'unsupported_completion' ? 'action type (optional)' : ruleType === 'unresolved_work' ? 'uses backend defaults' : 'numeric amount'})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={ruleParamVal}
                    onChange={(e) => setRuleParamVal(e.target.value)}
                    placeholder={
                      ruleType === 'policy_compliance'
                        ? '50.0'
                        : ruleType === 'required_information'
                        ? 'order_id, tracking_number'
                        : ruleType === 'required_steps'
                        ? 'verify identity, confirm eligibility'
                        : ruleType === 'prohibited_claims'
                        ? 'guarantee an instant refund, waive all fees'
                        : ruleType === 'unsupported_completion'
                        ? 'process_refund'
                        : 'Uses built-in resolution patterns'
                    }
                    className="flex-1 rounded-lg border px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddRule}
                    disabled={!ruleName.trim()}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40"
                    style={{ borderColor: 'var(--border-color)' }}
                  >
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t px-6 py-4"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <span className="text-xs text-[var(--text-muted)]">
            Persisted in Novora Scenario Store
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !businessGoal.trim()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Creating...' : 'Save Scenario'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
