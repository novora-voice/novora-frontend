'use client';

import React, { useState } from 'react';
import { EvaluationReport } from '@/types/api';
import { StatusBadge } from './StatusBadge';
import { EvidenceCard } from './EvidenceCard';
import {
  X,
  Calendar,
  AlertTriangle,
  GitCompare,
  Code2,
  FileCheck2,
  CheckCircle,
} from 'lucide-react';

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

  const passedRules = report.rule_results.filter((r) => r.status === 'PASS').length;
  const totalRules = report.rule_results.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <StatusBadge status={report.overall_status} size="lg" />
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Evaluation Report #{report.id.slice(0, 12)}
              </h3>
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
                className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <GitCompare size={14} />
                <span>Compare</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
              style={{ borderColor: 'var(--border-color)' }}
              aria-label="Close Modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Summary Card */}
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Executive Evaluation Verdict
              </span>
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {passedRules} of {totalRules} Rules Passed
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Limitations Banner if any */}
          {report.limitations && report.limitations.length > 0 && (
            <div
              className="rounded-xl border p-4 text-xs space-y-1.5"
              style={{
                backgroundColor: 'var(--status-warning-bg)',
                borderColor: 'var(--status-warning)',
                color: 'var(--text-primary)',
              }}
            >
              <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--status-warning)' }}>
                <AlertTriangle size={15} />
                <span>Evaluation Caveats & Limitations</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)] pl-1">
                {report.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'evidence'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileCheck2 size={14} />
              <span>Rule Breakdown & Evidence ({report.rule_results.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'json'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 size={14} />
              <span>Raw JSON Contract</span>
            </button>
          </div>

          {/* Content Area */}
          {activeTab === 'evidence' ? (
            <div className="space-y-4">
              {report.rule_results.map((rule, idx) => (
                <EvidenceCard key={idx} rule={rule} />
              ))}
            </div>
          ) : (
            <pre
              className="rounded-xl border p-4 text-xs font-mono overflow-x-auto text-[var(--text-primary)]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              {JSON.stringify(report, null, 2)}
            </pre>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="flex items-center justify-between border-t px-6 py-3"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Conversation: {report.conversation_id}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
