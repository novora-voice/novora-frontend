'use client';

import React, { useState } from 'react';
import { EvaluationReport, EvaluationScenario, EvaluationStatus } from '@/types/api';
import { EvaluationsFilterBar } from '../evaluations/EvaluationsFilterBar';
import { BatchExecutionModal } from '../evaluations/BatchExecutionModal';
import { StatusBadge } from '../evaluations/StatusBadge';
import { ClipboardCheck, Play, GitCompare, ExternalLink, Clock } from 'lucide-react';

interface EvaluationsViewProps {
  evaluations: EvaluationReport[];
  scenarios: EvaluationScenario[];
  onSelectEvaluation: (report: EvaluationReport) => void;
  onOpenNewEvaluation: () => void;
  onOpenCompare: (baselineId?: string) => void;
}

export const EvaluationsView: React.FC<EvaluationsViewProps> = ({
  evaluations,
  scenarios,
  onSelectEvaluation,
  onOpenNewEvaluation,
  onOpenCompare,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EvaluationStatus | 'ALL'>('ALL');
  const [scenarioFilter, setScenarioFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchOpen, setIsBatchOpen] = useState(false);

  const filtered = evaluations.filter((ev) => {
    const matchSearch =
      ev.summary?.toLowerCase().includes(search.toLowerCase()) ||
      ev.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || ev.overall_status === statusFilter;
    const matchScenario = scenarioFilter === 'ALL' || ev.scenario_id === scenarioFilter;
    return matchSearch && matchStatus && matchScenario;
  });

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const selectedReports = evaluations.filter((e) => selectedIds.includes(e.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <ClipboardCheck size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Evaluations & Reports</h2>
            <p className="text-xs text-[var(--text-secondary)]">Evidence-backed evaluation runs with character-level citations and diffing</p>
          </div>
        </div>

        <button
          onClick={onOpenNewEvaluation}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Play size={14} />
          <span>New Evaluation</span>
        </button>
      </div>

      <EvaluationsFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        scenarioFilter={scenarioFilter}
        onScenarioFilterChange={setScenarioFilter}
        scenarios={scenarios}
        selectedCount={selectedIds.length}
        onStartBatch={() => setIsBatchOpen(true)}
      />

      {filtered.length > 0 ? (
        <div className="rounded-2xl border divide-y overflow-hidden shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          {filtered.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onSelectEvaluation(ev)}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <div className="flex items-start gap-3 overflow-hidden pr-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(ev.id)}
                  onClick={(e) => toggleSelect(ev.id, e)}
                  onChange={() => {}}
                  className="mt-1 rounded text-[var(--primary)] focus:ring-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ev.overall_status} size="sm" />
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate max-w-lg">
                      {ev.summary || 'Evaluation Run'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] font-mono">
                    <span>Scenario: {ev.scenario_id}</span>
                    <span>•</span>
                    <span>{ev.rule_results?.length || 0} checks</span>
                    <span>•</span>
                    <span>ID: {ev.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCompare(ev.id);
                  }}
                  title="Compare with another run"
                  className="rounded-lg border p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <GitCompare size={13} />
                </button>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                  <Clock size={11} />
                  <span>{new Date(ev.evaluated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
                <ExternalLink size={14} className="text-[var(--text-muted)]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <ClipboardCheck size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No evaluations match criteria</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1">Try resetting your filters or run a new evaluation test.</p>
        </div>
      )}

      <BatchExecutionModal
        selectedReports={selectedReports}
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        onRerunReport={onSelectEvaluation}
      />
    </div>
  );
};
