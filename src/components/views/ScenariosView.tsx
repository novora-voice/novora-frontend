'use client';

import React, { useState } from 'react';
import { EvaluationScenario, EvaluationReport } from '@/types/api';
import { ScenarioCard } from '../scenarios/ScenarioCard';
import { ScenarioCriteriaModal } from '../scenarios/ScenarioCriteriaModal';
import { FlaskConical, Plus, Search } from 'lucide-react';

interface ScenariosViewProps {
  scenarios: EvaluationScenario[];
  onOpenNewScenario: () => void;
  onRunScenario: (scenarioId: string) => void;
  onSelectEvaluation?: (report: EvaluationReport) => void;
}

export const ScenariosView: React.FC<ScenariosViewProps> = ({
  scenarios,
  onOpenNewScenario,
  onRunScenario,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCriteriaScenario, setSelectedCriteriaScenario] = useState<EvaluationScenario | null>(null);

  const filtered = scenarios.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.business_goal.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <FlaskConical size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Scenarios Directory</h2>
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

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scen) => (
            <ScenarioCard
              key={scen.id}
              scenario={scen}
              onRun={onRunScenario}
              onViewCriteria={setSelectedCriteriaScenario}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <FlaskConical size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No scenarios found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {search ? 'Try adjusting your search query.' : 'Create your first test scenario or select a template to begin.'}
          </p>
        </div>
      )}

      <ScenarioCriteriaModal
        scenario={selectedCriteriaScenario}
        onClose={() => setSelectedCriteriaScenario(null)}
        onRunTest={onRunScenario}
      />
    </div>
  );
};
