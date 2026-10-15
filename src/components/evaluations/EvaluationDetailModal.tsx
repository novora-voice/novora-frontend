'use client';

import React, { useState } from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { EvidenceCard } from './EvidenceCard';
import { X, Calendar, AlertTriangle, GitCompare, Code2, FileCheck2, ShieldAlert } from 'lucide-react';

interface EvaluationDetailModalProps {
  report: EvaluationReport | null;
  onClose: () => void;
  onOpenCompare?: (baselineId: string) => void;
}

export const EvaluationDetailModal: React.FC<EvaluationDetailModalProps> = ({
  report,
  onClose,
  onOpenCompare,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'json'>('evidence');

  if (!report) return null;

  const passedRules = report.rule_results?.filter((r) => r.status === 'PASS').length || 0;
  const totalRules = report.rule_results?.length || 0;
  const unverifiedClaims = report.rule_results?.filter(
    (r) => r.rule_type === 'unsupported_completion' && r.status !== 'PASS'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <StatusBadge status={report.overall_status} size="lg" />
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Evaluation #{report.id.slice(0, 12)}</h3>
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-0.5">
                <Calendar size={13} />
                <span>{new Date(report.evaluated_at).toLocaleString()}</span>
                <span>•</span>
                <span className="font-mono">Scenario: {report.scenario_id}</span>
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
            <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Close"><X size={16} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Executive Verdict</span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">{passedRules} of {totalRules} Rules Passed</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{report.summary}</p>
          </div>

          {unverifiedClaims && unverifiedClaims.length > 0 && (
            <div className="rounded-xl border p-3.5 text-xs bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert size={15} />
                <span>Unverified Agent Claims Detected</span>
              </div>
              <p className="text-[11px]">
                The agent stated an action was executed, but no authoritative backend record confirmed it. Novora does not mark unverified claims as verified.
              </p>
            </div>
          )}

          {report.limitations && report.limitations.length > 0 && (
            <div className="rounded-xl border p-3.5 text-xs bg-amber-500/10 border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle size={15} /><span>Evaluation Limitations</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                {report.limitations.map((lim, idx) => (<li key={idx}>{lim}</li>))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 ${activeTab === 'evidence' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
            >
              <FileCheck2 size={14} /><span>Rule Breakdown & Evidence ({report.rule_results?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 ${activeTab === 'json' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)]'}`}
            >
              <Code2 size={14} /><span>Raw JSON Contract</span>
            </button>
          </div>

          {activeTab === 'evidence' ? (
            <div className="space-y-3">
              {report.rule_results?.map((rule, idx) => (
                <EvidenceCard key={idx} rule={rule} />
              ))}
            </div>
          ) : (
            <pre className="rounded-xl border p-4 text-xs font-mono overflow-x-auto text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              {JSON.stringify(report, null, 2)}
            </pre>
          )}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <span className="text-xs text-[var(--text-muted)] font-mono">Conversation: {report.conversation_id}</span>
          <button onClick={onClose} className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
