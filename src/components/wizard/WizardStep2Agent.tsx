'use client';

import React from 'react';
import { VoiceProvider } from '@/types/api';
import { Bot, Code2, Wrench } from 'lucide-react';

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
}

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
}) => {
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
          <label className="font-bold text-[var(--text-primary)] block mb-1">
            {provider === 'elevenlabs' ? 'ElevenLabs Agent ID *' : provider === 'vapi' ? 'Vapi Assistant ID *' : provider === 'retell' ? 'Retell Agent ID *' : 'AssemblyAI Session Ref'}
          </label>
          <input
            type="text"
            value={agentRefId}
            onChange={(e) => onAgentRefIdChange(e.target.value)}
            placeholder={provider === 'elevenlabs' ? 'ag_el_123...' : provider === 'vapi' ? 'asst_vapi_...' : 'agent_retell_...'}
            className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          />
        </div>
      </div>

      {provider === 'assemblyai' ? (
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
      ) : (
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
        </div>
      )}
    </div>
  );
};
