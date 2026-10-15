'use client';

import React, { useState } from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { X, Play, Layers, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface BatchExecutionModalProps {
  selectedReports: EvaluationReport[];
  isOpen: boolean;
  onClose: () => void;
  onRerunReport: (report: EvaluationReport) => void;
}

export const BatchExecutionModal: React.FC<BatchExecutionModalProps> = ({
  selectedReports,
  isOpen,
  onClose,
  onRerunReport,
}) => {
  const [running, setRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  if (!isOpen) return null;

  const handleStartBatch = () => {
    setRunning(true);
    setCompletedCount(0);

    selectedReports.forEach((rep, idx) => {
      setTimeout(() => {
        onRerunReport(rep);
        setCompletedCount((c) => c + 1);
        if (idx === selectedReports.length - 1) {
          setRunning(false);
        }
      }, (idx + 1) * 800);
    });
  };

  const passCount = selectedReports.filter((r) => r.overall_status === 'PASS').length;
  const failCount = selectedReports.filter((r) => r.overall_status === 'FAIL').length;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-2xl border p-6 shadow-2xl relative" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <button onClick={onClose} className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"><X size={18} /></button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Layers size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Batch Evaluation Suite</h2>
            <p className="text-xs text-[var(--text-muted)]">Re-evaluate {selectedReports.length} test cases with honesty in partial outcomes</p>
          </div>
        </div>

        <div className="rounded-xl border p-3.5 mb-4 grid grid-cols-2 gap-3 text-xs" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Previous Baseline</span>
            <span className="font-bold text-[var(--text-primary)]">{passCount} Passed, {failCount} Failed</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Progress</span>
            <span className="font-bold text-[var(--primary)]">{completedCount} / {selectedReports.length} Executed</span>
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto divide-y mb-4" style={{ borderColor: 'var(--border-color)' }}>
          {selectedReports.map((r) => (
            <div key={r.id} className="py-2.5 flex items-center justify-between text-xs">
              <span className="truncate max-w-xs font-medium text-[var(--text-primary)]">{r.summary}</span>
              <StatusBadge status={r.overall_status} size="sm" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">Close</button>
          <button
            onClick={handleStartBatch}
            disabled={running}
            className="flex items-center gap-1.5 rounded-xl px-5 py-2 font-bold text-white shadow-sm disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            <span>{running ? 'Evaluating Batch...' : 'Run Entire Batch'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
