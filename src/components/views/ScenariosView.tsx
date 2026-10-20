'use client';

import React, { useState } from 'react';
import { EvaluationScenario } from '@/types/api';
import { ScenarioCard } from '../scenarios/ScenarioCard';
import { ScenarioCriteriaModal } from '../scenarios/ScenarioCriteriaModal';
import { ScenarioTemplateBar } from '../scenarios/ScenarioTemplateBar';
import { EditScenarioModal } from '../scenarios/EditScenarioModal';
import { ScenarioTemplate } from '@/lib/scenarioTemplates';
import { FlaskConical, Plus, Search } from 'lucide-react';

interface ScenariosViewProps {
  scenarios: EvaluationScenario[];
  onOpenNewScenario: () => void;
  onRunScenario: (scenarioId: string) => void;
  onDuplicateScenario?: (scenario: EvaluationScenario) => void;
  onUpdateScenario?: (scenario: EvaluationScenario) => void;
  onViewScenarioHistory?: (scenarioId: string) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  scenarios,
  onOpenNewScenario,
  onRunScenario,
  onDuplicateScenario,
  onUpdateScenario,
  onViewScenarioHistory,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCriteriaScenario, setSelectedCriteriaScenario] = useState<EvaluationScenario | null>(null);
  const [editingScenario, setEditingScenario] = useState<EvaluationScenario | null>(null);

  const filtered = scenarios.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.business_goal.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTemplate = (template: ScenarioTemplate) => {
    if (onDuplicateScenario) {
      const newScenario: EvaluationScenario = {
        id: `scen_${template.template_id}_${Date.now().toString().slice(-4)}`,
        name: template.name,
        business_goal: template.business_goal,
        success_criteria: template.success_criteria,
        rules: template.rules,
        created_at: new Date().toISOString(),
      };
      onDuplicateScenario(newScenario);
    } else {
      onOpenNewScenario();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <FlaskConical size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Scenarios Directory
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Deterministic test cases, policy ceilings, and workflow verification suites
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewScenario}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={15} />
          <span>Create Scenario</span>
        </button>
      </div>

      {/* Quick-Start Template Bar */}
      <ScenarioTemplateBar onSelectTemplate={handleSelectTemplate} />

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search scenarios by title or business goal..."
          className="w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        />
      </div>

      {/* Scenarios Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((scen) => (
            <ScenarioCard
              key={scen.id}
              scenario={scen}
              onRun={onRunScenario}
              onViewCriteria={setSelectedCriteriaScenario}
              onDuplicate={onDuplicateScenario}
              onEdit={setEditingScenario}
              onViewHistory={onViewScenarioHistory}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        >
          <FlaskConical size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No scenarios found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search query.' : 'Create your first test scenario or select a template above.'}
          </p>
        </div>
      )}

      {/* Modals */}
      <ScenarioCriteriaModal
        scenario={selectedCriteriaScenario}
        onClose={() => setSelectedCriteriaScenario(null)}
        onRunTest={onRunScenario}
      />

      <EditScenarioModal
        scenario={editingScenario}
        isOpen={Boolean(editingScenario)}
        onClose={() => setEditingScenario(null)}
        onSave={(updated) => {
          onUpdateScenario?.(updated);
          setEditingScenario(null);
        }}
      />
    </div>
  );
};
