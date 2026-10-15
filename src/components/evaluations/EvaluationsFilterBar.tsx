'use client';

import React from 'react';
import { EvaluationStatus, EvaluationScenario } from '@/types/api';
import { Search, Filter, Layers } from 'lucide-react';

interface EvaluationsFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: EvaluationStatus | 'ALL';
  onStatusFilterChange: (val: EvaluationStatus | 'ALL') => void;
  scenarioFilter: string;
  onScenarioFilterChange: (val: string) => void;
  scenarios: EvaluationScenario[];
  selectedCount: number;
  onStartBatch: () => void;
}

export const EvaluationsFilterBar: React.FC<EvaluationsFilterBarProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  scenarioFilter,
  onScenarioFilterChange,
  scenarios,
  selectedCount,
  onStartBatch,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="relative w-full sm:w-72">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter by summary or ID..."
          className="w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as EvaluationStatus | 'ALL')}
          className="rounded-xl border px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="PASS">PASS Only</option>
          <option value="FAIL">FAIL Only</option>
          <option value="INCONCLUSIVE">INCONCLUSIVE Only</option>
        </select>

        <select
          value={scenarioFilter}
          onChange={(e) => onScenarioFilterChange(e.target.value)}
          className="rounded-xl border px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        >
          <option value="ALL">All Scenarios</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {selectedCount > 0 && (
          <button
            onClick={onStartBatch}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Layers size={13} />
            <span>Batch Run ({selectedCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
