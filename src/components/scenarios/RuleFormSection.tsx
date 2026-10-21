'use client';

import React from 'react';
import { RuleConfig } from '@/types/api';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';

interface RuleFormSectionProps {
  rules: RuleConfig[];
  onAddRule: () => void;
  onRemoveRule: (index: number) => void;
  onUpdateRule: (index: number, field: 'rule_type' | 'condition' | 'severity', value: string) => void;
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_2fr_1fr]">
              <label className="space-y-1">
                <span className="block font-semibold text-[var(--text-secondary)]">Rule</span>
                <input
                  type="text"
                  value={rule.rule_type}
                  onChange={(e) => onUpdateRule(idx, 'rule_type', e.target.value)}
                  placeholder="e.g. required_information"
                  className="w-full rounded-lg border p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </label>
              <label className="space-y-1">
                <span className="block font-semibold text-[var(--text-secondary)]">Condition</span>
                <input
                  type="text"
                  placeholder="e.g. order_id or 50"
                  value={String(rule.parameters.condition ?? rule.description ?? '')}
                  onChange={(e) => onUpdateRule(idx, 'condition', e.target.value)}
                  className="w-full rounded-lg border p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                />
              </label>
              <label className="space-y-1">
                <span className="block font-semibold text-[var(--text-secondary)]">Severity</span>
                <select
                  value={String(rule.parameters.severity ?? 'high').toLowerCase()}
                  onChange={(e) => onUpdateRule(idx, 'severity', e.target.value)}
                  className="w-full rounded-lg border p-1.5 text-xs text-[var(--text-primary)] focus:outline-none"
                  style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
              </label>
              {rules.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveRule(idx)}
                  className="absolute right-2 top-2 p-1 text-red-500 hover:opacity-80"
                  aria-label="Remove rule"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
