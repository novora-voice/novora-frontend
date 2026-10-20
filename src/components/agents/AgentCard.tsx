'use client';

import React from 'react';
import Image from 'next/image';
import { VoiceAgent, EvaluationStatus } from '@/types/api';
import { Bot, Play, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../evaluations/StatusBadge';

interface AgentCardProps {
  agent: VoiceAgent;
  onSelectAgent: (agent: VoiceAgent) => void;
  onRunTest: (agent: VoiceAgent) => void;
}

const PROVIDER_INFO: Record<string, { label: string; logo: string }> = {
  elevenlabs: { label: 'ElevenLabs', logo: '/providers/elevenlabs.svg' },
  assemblyai: { label: 'AssemblyAI', logo: '/providers/assemblyai.svg' },
  vapi: { label: 'Vapi', logo: '/providers/vapi.svg' },
  retell: { label: 'Retell AI', logo: '/providers/retell.svg' },
  twilio: { label: 'Twilio Telephony', logo: '/providers/twilio.svg' },
};

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onSelectAgent,
  onRunTest,
}) => {
  const provider = PROVIDER_INFO[agent.provider] || {
    label: agent.provider,
    logo: '/providers/elevenlabs.svg',
  };

  return (
    <div
      className="group relative flex flex-col justify-between rounded-2xl border p-5 transition-all hover:shadow-lg"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border p-1" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}>
              <Image src={provider.logo} alt={provider.label} width={36} height={36} className="object-contain" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                {agent.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-[var(--text-muted)] font-medium">{provider.label}</span>
                <span className="text-[10px] text-[var(--text-muted)]">•</span>
                <span className="text-[11px] text-[var(--text-muted)]">{agent.agent_type}</span>
              </div>
            </div>
          </div>

          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
              agent.configuration_status === 'ready'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : agent.configuration_status === 'draft'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'bg-red-500/10 text-red-600 dark:text-red-400'
            }`}
          >
            {agent.configuration_status}
          </span>
        </div>

        {agent.system_prompt && (
          <p className="line-clamp-2 text-xs text-[var(--text-secondary)] mb-4">
            {agent.system_prompt}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 rounded-xl border p-2.5 mb-4 text-xs" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block">Last Verdict</span>
            {agent.recent_evaluation_status ? (
              <div className="mt-0.5">
                <StatusBadge status={agent.recent_evaluation_status} size="sm" />
              </div>
            ) : (
              <span className="text-[11px] text-[var(--text-muted)]">None</span>
            )}
          </div>
          <div>
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase block">Mode</span>
            <span className="text-xs font-semibold text-[var(--text-primary)] capitalize mt-0.5 block">
              {agent.execution_mode || 'sandbox'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t text-xs" style={{ borderColor: 'var(--border-color)' }}>
        <button
          onClick={() => onSelectAgent(agent)}
          className="flex items-center gap-1 font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>Details</span>
          <ExternalLink size={12} />
        </button>

        <button
          onClick={() => onRunTest(agent)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Play size={12} />
          <span>Test Agent</span>
        </button>
      </div>
    </div>
  );
};
