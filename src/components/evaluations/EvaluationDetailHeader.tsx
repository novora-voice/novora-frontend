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
}) => {
  return (
    <div
      className="flex items-center justify-between border-b px-6 py-4"
      style={{ borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center gap-3">
        <StatusBadge status={report.overall_status} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Evaluation #{report.id.slice(0, 12)}
            </h3>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
              {report.scenario_id}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
            <Calendar size={13} />
            <span>{new Date(report.evaluated_at).toLocaleString()}</span>
            <span>•</span>
            <span className="font-mono">ID: {report.id.slice(0, 14)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
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
};
