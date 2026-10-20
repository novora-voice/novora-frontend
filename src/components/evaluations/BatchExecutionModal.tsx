'use client';

import React from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { X, Layers, AlertTriangle, ExternalLink } from 'lucide-react';

interface BatchExecutionModalProps {
  selectedReports: EvaluationReport[];
  isOpen: boolean;
  onClose: () => void;
  onInspectReport?: (report: EvaluationReport) => void;
}

export const BatchExecutionModal: React.FC<BatchExecutionModalProps> = ({
  selectedReports,
  isOpen,
  onClose,
  onInspectReport,
}) => {
  if (!isOpen) return null;

  const passCount = selectedReports.filter((report) => report.overall_status === 'PASS').length;
  const failCount = selectedReports.filter((report) => report.overall_status === 'FAIL').length;
  const incompleteCount = selectedReports.filter((report) => report.overall_status === 'INCONCLUSIVE' || report.overall_status === 'NOT_EVALUATED').length;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-2xl relative" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"><X size={18} /></button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Selected Evaluation Results</h2>
            <p className="text-xs text-[var(--text-muted)]">Summary of saved results. This view does not start new provider sessions.</p>
          </div>
        </div>

        {failCount > 0 && (
          <div className="rounded-xl border p-3.5 mb-4 text-xs bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 flex items-start gap-2.5">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Some saved evaluations failed checks</span>
              <p className="text-[11px] mt-0.5">{failCount} of {selectedReports.length} saved results have a Fail verdict. Open each result to see which checks failed.</p>
            </div>
          </div>
        )}

        <div className="rounded-xl border p-3.5 mb-4 grid grid-cols-3 gap-2 text-xs" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <div><span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Selected</span><span className="font-bold text-[var(--text-primary)]">{selectedReports.length} Cases</span></div>
          <div><span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Results</span><span className="font-bold text-[var(--primary)] font-mono">{selectedReports.length}</span></div>
          <div><span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Outcomes</span><span className="font-bold text-[var(--text-primary)]">{passCount} Pass, {failCount} Fail, {incompleteCount} Inconclusive</span></div>
        </div>

        <div className="max-h-52 overflow-y-auto divide-y mb-4" style={{ borderColor: 'var(--border-color)' }}>
          {selectedReports.map((r) => {
            return (
              <div key={r.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div className="min-w-0 pr-2">
                  <span className="truncate font-medium text-[var(--text-primary)] block">{r.summary || r.id}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">Scenario: {r.scenario_id}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.overall_status} size="sm" />
                  {onInspectReport && <button onClick={() => onInspectReport(r)} title="Inspect Report" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded"><ExternalLink size={13} /></button>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">Close</button>
        </div>
      </div>
    </div>
  );
};
