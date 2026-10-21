'use client';

import React from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { X, Calendar, GitCompare } from 'lucide-react';

interface EvaluationDetailHeaderProps {
  report: EvaluationReport;
  onClose: () => void;
  onOpenCompare?: (baselineId: string) => void;
}

export const EvaluationDetailHeader: React.FC<EvaluationDetailHeaderProps> = ({
  report,
  onClose,
  onOpenCompare,
}) => (
  <div
    className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
    style={{ borderColor: 'var(--border-color)' }}
  >
    <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
      <StatusBadge status={report.overall_status} size="lg" />
      <div className="min-w-0 w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="break-all text-sm font-bold text-[var(--text-primary)] sm:text-base">
            Evaluation #{report.id}
          </h3>
          <span className="break-all rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
            {report.scenario_id}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)] sm:text-xs">
          <Calendar size={13} />
          <span>{new Date(report.evaluated_at).toLocaleString()}</span>
          <span aria-hidden="true">·</span>
          <span className="break-all font-mono">ID: {report.id}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-end gap-2">
      {onOpenCompare && (
        <button
          onClick={() => onOpenCompare(report.id)}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <GitCompare size={14} />
          <span>Compare</span>
        </button>
      )}
      <button
        onClick={onClose}
        className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  </div>
);
