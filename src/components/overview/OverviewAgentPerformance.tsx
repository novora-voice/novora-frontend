'use client';

import React from 'react';
import { VoiceAgent, EvaluationReport } from '@/types/api';
import { Bot, CheckCircle2, XCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';

interface OverviewAgentPerformanceProps {
  agents: VoiceAgent[];
  evaluations: EvaluationReport[];
  onSelectAgent?: (agent: VoiceAgent) => void;
  onNavigateToAgents: () => void;
}

const PROVIDER_LOGOS: Record<string, string> = {
  elevenlabs: '/providers/elevenlabs.svg',
  vapi: '/providers/vapi.svg',
  assemblyai: '/providers/assemblyai.svg',
  retell: '/providers/retell.svg',
  twilio: '/providers/twilio.svg',
};

export const OverviewAgentPerformance: React.FC<OverviewAgentPerformanceProps> = ({
  agents,
  evaluations,
  onNavigateToAgents,
}) => {
  return (
    <div
      className="rounded-2xl border p-5 transition-shadow hover:shadow-md"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Agent Performance</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Reliability & policy enforcement by agent</p>
          </div>
        </div>

        <button
          onClick={onNavigateToAgents}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <span>View All</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents.slice(0, 4).map((agent) => {
          const agentEvals = evaluations.filter(
            (evaluation) => Boolean(agent.agent_id_ref) && evaluation.agent_id === agent.agent_id_ref
          ).sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime());
          const lastEvaluation = agentEvals[0];
          const isPassing = lastEvaluation?.overall_status === 'PASS';

          return (
            <div
              key={agent.id}
              className="flex items-center justify-between p-3 rounded-xl border transition-colors hover:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-7 w-7 shrink-0 rounded-lg overflow-hidden border border-[var(--border-color)] bg-white/5 flex items-center justify-center">
                  {PROVIDER_LOGOS[agent.provider] ? (
                    <Image
                      src={assetPath(PROVIDER_LOGOS[agent.provider])}
                      alt={agent.provider}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  ) : (
                    <Bot size={14} className="text-[var(--text-muted)]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {agent.name}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono tracking-wider"
                      style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    >
                      {agent.execution_mode || 'sandbox'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] block truncate">
                    {agent.agent_type}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    {lastEvaluation && (isPassing
                      ? <CheckCircle2 size={13} className="text-emerald-500" />
                      : <XCircle size={13} className="text-rose-500" />)}
                    <span className={`text-xs font-bold ${
                      !lastEvaluation
                        ? 'text-[var(--text-muted)]'
                        : isPassing
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {lastEvaluation?.overall_status ?? 'None'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                    {agentEvals.length} evals
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
