'use client';

import React from 'react';
import { RuleConfig, RuleType } from '@/types/api';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

interface RuleFormSectionProps {
  rules: RuleConfig[];
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  onUpdateRule: (index: number, field: string, value: any) => void;
}

export const RuleFormSection: React.FC<RuleFormSectionProps> = ({
  rules,
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-blue-500" />
          <span>Deterministic Rules ({rules.length})</span>
        </h4>
        <button
          type="button"
          onClick={onAddRule}
          className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
        >
          <Plus size={13} />
          <span>Add Rule</span>
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div
            key={idx}
            className="rounded-xl border p-3 text-xs space-y-2 relative"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Rule Name"
                value={rule.name || ''}
                onChange={(e) => onUpdateRule(idx, 'name', e.target.value)}
                className="w-1/2 rounded-lg border p-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              />
              <select
                value={rule.rule_type}
                onChange={(e) => onUpdateRule(idx, 'rule_type', e.target.value as RuleType)}
                className="rounded-lg border p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
              >
                <option value="required_information">required_information</option>
                <option value="policy_compliance">policy_compliance</option>
                <option value="required_steps">required_steps</option>
                <option value="prohibited_claims">prohibited_claims</option>
                <option value="unsupported_completion">unsupported_completion</option>
              </select>
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRule(idx)}
                  className="text-red-500 hover:opacity-80 p-1"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Rule description or verification instructions"
              value={rule.description || ''}
              onChange={(e) => onUpdateRule(idx, 'description', e.target.value)}
              className="w-full rounded-lg border p-1.5 text-xs text-[var(--text-secondary)] focus:outline-none"
              style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
