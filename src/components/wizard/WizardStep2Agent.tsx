'use client';

import React from 'react';
import { VoiceProvider } from '@/types/api';
import { Bot, Code2, Wrench, FileText, Info } from 'lucide-react';

interface WizardStep2AgentProps {
  provider: VoiceProvider;
  agentName: string;
  onAgentNameChange: (val: string) => void;
  agentRefId: string;
  onAgentRefIdChange: (val: string) => void;
  systemPrompt: string;
  onSystemPromptChange: (val: string) => void;
  toolConfig: string;
  onToolConfigChange: (val: string) => void;
  executionMode: 'sandbox' | 'live';
  onExecutionModeChange: (val: 'sandbox' | 'live') => void;
  userInstructions: string;
  onUserInstructionsChange: (val: string) => void;
}

const PROVIDER_LABELS: Record<string, { refLabel: string; placeholder: string; note: string }> = {
  elevenlabs: { refLabel: 'ElevenLabs Agent ID *', placeholder: 'ag_el_123...', note: 'Agent ID from your ElevenLabs dashboard.' },
  assemblyai: { refLabel: 'AssemblyAI Session Ref', placeholder: 'aai_session_...', note: 'AssemblyAI voice agent session reference (audio input required).' },
  vapi: { refLabel: 'Vapi Assistant ID *', placeholder: 'asst_vapi_...', note: 'Assistant ID from your Vapi dashboard.' },
  retell: { refLabel: 'Retell Agent ID *', placeholder: 'agent_retell_...', note: 'Agent ID from your Retell dashboard.' },
};

export const WizardStep2Agent: React.FC<WizardStep2AgentProps> = ({
  provider,
  agentName,
  onAgentNameChange,
  agentRefId,
  onAgentRefIdChange,
  systemPrompt,
  onSystemPromptChange,
  toolConfig,
  onToolConfigChange,
  executionMode,
  onExecutionModeChange,
  userInstructions,
  onUserInstructionsChange,
}) => {
  const provLabel = PROVIDER_LABELS[provider] ?? { refLabel: 'Agent ID *', placeholder: 'agent_...', note: '' };
  const isAssemblyAI = provider === 'assemblyai';

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 2 — Configure Voice Agent</h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Fields specific to your chosen provider: <span className="font-semibold capitalize">{provider}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="font-bold text-[var(--text-primary)] block mb-1">Agent Name *</label>
          <input
            type="text"
            required
            value={agentName}
            onChange={(e) => onAgentNameChange(e.target.value)}
            placeholder="e.g. Concierge Voice Assistant"
            className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          />
        </div>

        <div>
          <label className="font-bold text-[var(--text-primary)] block mb-1">{provLabel.refLabel.includes('*') ? provLabel.refLabel : `${provLabel.refLabel} *`}</label>
          <input
            type="text"
            required
            value={agentRefId}
            onChange={(e) => onAgentRefIdChange(e.target.value)}
            placeholder={provLabel.placeholder}
            className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          />
          {provLabel.note && (
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
              <Info size={9} />{provLabel.note}
            </p>
          )}
        </div>
      </div>

      {isAssemblyAI && (
        <div className="space-y-3">
          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1 flex items-center gap-1.5">
              <Code2 size={13} />
              <span>Session System Prompt & Rules *</span>
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => onSystemPromptChange(e.target.value)}
              placeholder="Define session voice instructions and policy constraints..."
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1 flex items-center gap-1.5">
              <Wrench size={13} />
              <span>Supported Tools Configuration (JSON array or names)</span>
            </label>
            <input
              type="text"
              value={toolConfig}
              onChange={(e) => onToolConfigChange(e.target.value)}
              placeholder="process_refund, lookup_order, escalate_paging"
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>
        </div>
      )}

      {/* User test instructions — always shown */}
      <div>
        <label className="font-bold text-[var(--text-primary)] block mb-1 flex items-center gap-1.5">
          <FileText size={13} />
          <span>Test Instructions (plain English) *</span>
        </label>
        <textarea
          rows={3}
          required
          value={userInstructions}
          onChange={(e) => onUserInstructionsChange(e.target.value)}
          placeholder={`Describe what you want to test. For example:\n"Ask the agent for a refund after explaining the product arrived damaged."\n"Report a payment failure and check the escalation policy."`}
          className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        />
        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
          These instructions become the first ghost-caller message and are required to launch an evaluation.
        </p>
      </div>

      <div>
        <label className="font-bold text-[var(--text-primary)] block mb-1">Execution Mode</label>
        <select
          value={executionMode}
          onChange={(e) => onExecutionModeChange(e.target.value as 'sandbox' | 'live')}
          className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        >
          <option value="sandbox">Sandbox (Simulated audio transcripts, zero telephony charges)</option>
          <option value="live">Live Provider (Real telecom line / API charges apply)</option>
        </select>
        {executionMode === 'live' && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">
            ⚠ Live mode contacts real telephony carriers. Confirm before running in Step 5.
          </p>
        )}
      </div>
    </div>
  );
};
