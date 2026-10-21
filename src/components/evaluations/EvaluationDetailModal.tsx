'use client';

import React, { useEffect, useState } from 'react';
import { Conversation, EvaluationReport } from '@/types/api';
import { TestRun } from '@/types/execution';
import { executionApi, novoraApi } from '@/lib/api';
import { EvaluationDetailHeader } from './EvaluationDetailHeader';
import { CollapsibleRuleSection } from './CollapsibleRuleSection';
import { EventTimeline } from './EventTimeline';
import { ConversationTranscript } from './ConversationTranscript';
import {
  AlertTriangle,
  Code2,
  FileCheck2,
  ShieldAlert,
  Activity,
  MessageSquare,
} from 'lucide-react';

interface EvaluationDetailModalProps {
  report: EvaluationReport | null;
  onClose: () => void;
  onOpenCompare?: (baselineId: string) => void;
}

type ModalTab = 'evidence' | 'timeline' | 'transcript' | 'json';

export const EvaluationDetailModal: React.FC<EvaluationDetailModalProps> = ({
  report,
  onClose,
  onOpenCompare,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('evidence');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setConversation(null);
    setTestRun(null);
    if (!report) return;
    let active = true;
    setDetailsLoading(true);
    const loads: Promise<unknown>[] = [novoraApi.getConversation(report.conversation_id).then((value) => {
      if (active) setConversation(value);
    })];
    if (report.test_run_id) {
      loads.push(executionApi.getTestRun(report.test_run_id).then((value) => {
        if (active) setTestRun(value);
      }));
    }
    void Promise.allSettled(loads).finally(() => { if (active) setDetailsLoading(false); });
    return () => { active = false; };
  }, [report]);

  if (!report) return null;

  const passedRules = report.rule_results?.filter((r) => r.status === 'PASS').length || 0;
  const totalRules = report.rule_results?.length || 0;
  const failedRules = report.rule_results?.filter((r) => r.status === 'FAIL').length || 0;
  const incompleteRules = report.rule_results?.filter((r) => r.status === 'INCONCLUSIVE' || r.status === 'NOT_EVALUATED').length || 0;
  const unverifiedClaims = report.rule_results?.filter(
    (r) => r.rule_type === 'unsupported_completion' && r.status !== 'PASS'
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <EvaluationDetailHeader report={report} onClose={onClose} onOpenCompare={onOpenCompare} />

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                What this evaluation found
              </span>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {passedRules} passed · {failedRules} failed · {incompleteRules} could not be checked
              </span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">
              {report.summary}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Pass means the agent met the check. Fail means the conversation showed it did not. Inconclusive means there was not enough evidence to decide; it does not count as a pass or a failure.
            </p>
          </div>

          {unverifiedClaims && unverifiedClaims.length > 0 && (
            <div className="rounded-xl border p-3.5 text-xs bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert size={15} />
                <span>Unverified Agent Claims Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                The agent claimed an action was executed, but no authoritative backend record confirmed it. Novora does not mark unverified claims as verified.
              </p>
            </div>
          )}

          {report.limitations && report.limitations.length > 0 && (
            <div className="rounded-xl border p-3.5 text-xs bg-amber-500/10 border-amber-500/30 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle size={15} />
                <span>Evaluation Limitations</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[var(--text-secondary)]">
                {report.limitations.map((lim, idx) => <li key={idx}>{lim}</li>)}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setActiveTab('evidence')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'evidence'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileCheck2 size={13} />
              <span>Check results ({totalRules})</span>
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'timeline'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Activity size={13} />
              <span>Event Timeline</span>
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'transcript'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare size={13} />
              <span>Transcript</span>
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'json'
                  ? 'border-[var(--primary)] text-[var(--primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Code2 size={13} />
              <span>Raw JSON</span>
            </button>
          </div>

          {activeTab === 'evidence' && <CollapsibleRuleSection ruleResults={report.rule_results || []} />}
          {activeTab === 'timeline' && <EventTimeline testRun={testRun} loading={detailsLoading} />}
          {activeTab === 'transcript' && <ConversationTranscript report={report} conversation={conversation} loading={detailsLoading} />}
          {activeTab === 'json' && (
            <pre
              className="rounded-xl border p-4 text-xs font-mono overflow-x-auto text-[var(--text-primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              {JSON.stringify(report, null, 2)}
            </pre>
          )}
        </div>

        <div
          className="flex items-center justify-between border-t px-6 py-3"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        >
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Conversation: {report.conversation_id}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
