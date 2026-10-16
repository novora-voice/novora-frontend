'use client';

import React, { useState } from 'react';
import { EvaluationScenario } from '@/types/api';
import { X, Edit2, Plus, Trash2, Check } from 'lucide-react';

interface EditScenarioModalProps {
  scenario: EvaluationScenario | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: EvaluationScenario) => void;
}

export const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
  scenario,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(scenario?.name || '');
  const [businessGoal, setBusinessGoal] = useState(scenario?.business_goal || '');
  const [criteria, setCriteria] = useState<string[]>(scenario?.success_criteria || []);
  const [newCriterion, setNewCriterion] = useState('');

  if (!isOpen || !scenario) return null;

  const handleAddCriterion = () => {
    if (!newCriterion.trim()) return;
    setCriteria([...criteria, newCriterion.trim()]);
    setNewCriterion('');
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...scenario,
      name,
      business_goal: businessGoal,
      success_criteria: criteria,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <Edit2 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Edit Scenario</h2>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">{scenario.id}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
              Scenario Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-xl border px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
              Business Goal & Policy Ceilings
            </label>
            <textarea
              rows={3}
              value={businessGoal}
              onChange={(e) => setBusinessGoal(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--text-primary)] mb-1">
              Success Criteria Checklist
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newCriterion}
                onChange={(e) => setNewCriterion(e.target.value)}
                placeholder="Add verifiable success criterion..."
                className="flex-1 rounded-xl border px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              />
              <button
                type="button"
                onClick={handleAddCriterion}
                className="rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Plus size={14} />
              </button>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {criteria.map((cr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg border text-xs"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                >
                  <span className="text-[var(--text-primary)] truncate max-w-xs">{cr}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCriterion(idx)}
                    className="text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
