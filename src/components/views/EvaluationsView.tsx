'use client';

import React, { useState } from 'react';
import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { StatusBadge } from '../evaluations/StatusBadge';
import {
  Search,
  Filter,
  GitCompare,
  Plus,
  Calendar,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = evaluations.filter((ev) => {
    if (statusFilter !== 'ALL' && ev.overall_status !== statusFilter) {
      return false;
    }
    if (selectedScenarioId !== 'ALL' && ev.scenario_id !== selectedScenarioId) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = ev.id.toLowerCase().includes(q);
      const matchSummary = ev.summary.toLowerCase().includes(q);
      const matchScen = ev.scenario_id.toLowerCase().includes(q);
      if (!matchId && !matchSummary && !matchScen) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter Bar */}
      <div
        className="rounded-2xl border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'PASS', 'FAIL', 'INCONCLUSIVE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scenario Selector */}
          <select
            value={selectedScenarioId}
            onChange={(e) => setSelectedScenarioId(e.target.value)}
            className="rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="ALL">All Scenarios</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Search box */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or ID..."
              className="w-48 sm:w-60 rounded-lg border pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Compare Button */}
          <button
            onClick={() => onOpenCompare()}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <GitCompare size={14} />
            <span>Compare Runs</span>
          </button>
        </div>
      </div>

      {/* Evaluations Table Container */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Report / Summary</th>
                <th className="px-5 py-3.5">Scenario</th>
                <th className="px-5 py-3.5">Rule Breakdown</th>
                <th className="px-5 py-3.5">Evaluated At</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-[var(--text-muted)]">
                    No evaluations match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((ev) => {
                  const passed = ev.rule_results.filter((r) => r.status === 'PASS').length;
                  const total = ev.rule_results.length;
                  const scen = scenarios.find((s) => s.id === ev.scenario_id);

                  return (
                    <tr
                      key={ev.id}
                      onClick={() => onSelectEvaluation(ev)}
                      className="hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <StatusBadge status={ev.overall_status} size="sm" />
                      </td>
                      <td className="px-5 py-4 max-w-md">
                        <div className="font-bold text-[var(--text-primary)] line-clamp-1">
                          {ev.summary}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                          #{ev.id}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {scen ? scen.name : ev.scenario_id}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-bold text-xs"
                            style={{
                              color:
                                passed === total
                                  ? 'var(--status-success)'
                                  : 'var(--status-error)',
                            }}
                          >
                            {passed}/{total}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)]">
                            passed
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[var(--text-muted)] font-mono text-[11px]">
                        {new Date(ev.evaluated_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                          <span>Inspect</span>
                          <ChevronRight size={14} />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
