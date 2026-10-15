'use client';

import React from 'react';
import { VoiceAgent, EvaluationReport } from '@/types/api';
import { X, Bot, Play, ExternalLink, Code2, ShieldCheck, Clock } from 'lucide-react';
import { StatusBadge } from '../evaluations/StatusBadge';

interface AgentDetailModalProps {
  agent: VoiceAgent | null;
  evaluations: EvaluationReport[];
  onClose: () => void;
  onRunTest: (agent: VoiceAgent) => void;
  onOpenEvaluationDetail: (evalReport: EvaluationReport) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  evaluations,
  onClose,
  onRunTest,
  onOpenEvaluationDetail,
}) => {
  if (!agent) return null;

  const agentEvals = evaluations.filter(
    (e) => e.summary?.toLowerCase().includes(agent.name.toLowerCase()) || e.scenario_id.includes(agent.provider)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              <Bot size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">{agent.name}</h2>
              <span className="text-xs text-[var(--text-muted)] font-mono">ID: {agent.id} • {agent.provider.toUpperCase()}</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Status</span>
              <span className="text-xs font-bold capitalize text-[var(--text-primary)] mt-1 block">{agent.configuration_status}</span>
            </div>
            <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Execution Mode</span>
              <span className="text-xs font-bold capitalize text-[var(--text-primary)] mt-1 block">{agent.execution_mode || 'sandbox'}</span>
            </div>
            <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Agent Ref</span>
              <span className="text-xs font-mono text-[var(--text-primary)] mt-1 block truncate">{agent.agent_id_ref || 'Default'}</span>
            </div>
          </div>

          {agent.system_prompt && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-1.5">
                <Code2 size={13} />
                <span>System Prompt & Instructions</span>
              </h3>
              <div className="rounded-xl border p-3.5 text-xs font-mono leading-relaxed" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                {agent.system_prompt}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>Related Evaluation Runs</span>
            </h3>
            {agentEvals.length > 0 ? (
              <div className="space-y-2">
                {agentEvals.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onClose();
                      onOpenEvaluationDetail(ev);
                    }}
                    className="flex items-center justify-between rounded-xl border p-3 cursor-pointer hover:border-[var(--primary)] transition-colors"
                    style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                  >
                    <div>
                      <div className="text-xs font-bold text-[var(--text-primary)] truncate max-w-sm">{ev.summary}</div>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{ev.scenario_id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ev.overall_status} size="sm" />
                      <ExternalLink size={12} className="text-[var(--text-muted)]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border p-4 text-center text-xs text-[var(--text-muted)]" style={{ borderColor: 'var(--border-color)' }}>
                No past evaluation reports recorded for this agent yet.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onRunTest(agent);
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Play size={13} />
            <span>Launch Evaluation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
