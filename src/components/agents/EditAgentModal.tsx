'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Save, X } from 'lucide-react';
import { VoiceAgent, VoiceProvider } from '@/types/api';

interface EditAgentModalProps {
  agent: VoiceAgent | null;
  onClose: () => void;
  onSave: (agent: VoiceAgent) => Promise<void>;
}

const INPUT_CLASS = 'w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]';

export const EditAgentModal: React.FC<EditAgentModalProps> = ({ agent, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<VoiceProvider>('elevenlabs');
  const [agentType, setAgentType] = useState('');
  const [configurationStatus, setConfigurationStatus] = useState<VoiceAgent['configuration_status']>('draft');
  const [agentIdRef, setAgentIdRef] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tools, setTools] = useState('');
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'live'>('sandbox');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!agent) return;
    setName(agent.name);
    setProvider(agent.provider);
    setAgentType(agent.agent_type);
    setConfigurationStatus(agent.configuration_status);
    setAgentIdRef(agent.agent_id_ref ?? '');
    setSystemPrompt(agent.system_prompt ?? '');
    setTools(agent.tools?.join(', ') ?? '');
    setExecutionMode(agent.execution_mode ?? 'sandbox');
  }, [agent]);

  if (!agent) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedAgent: VoiceAgent = {
      ...agent,
      name: name.trim(),
      provider,
      agent_type: agentType.trim(),
      configuration_status: configurationStatus,
      agent_id_ref: agentIdRef.trim() || undefined,
      system_prompt: systemPrompt.trim() || undefined,
      tools: tools.split(/[\n,]/).map((tool) => tool.trim()).filter(Boolean),
      execution_mode: executionMode,
      last_activity_at: new Date().toISOString(),
    };
    setSaving(true);
    setError('');
    try {
      await onSave(updatedAgent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this agent.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-agent-title" className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-2xl border shadow-2xl" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}><Bot size={21} /></div>
            <div>
              <h2 id="edit-agent-title" className="text-base font-bold text-[var(--text-primary)]">Edit agent</h2>
              <p className="text-xs text-[var(--text-muted)]">Update this agent&apos;s configuration and instructions.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Close editor"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
            {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-red-600">{error}</p>}
            <div>
              <label htmlFor="edit-agent-name" className="mb-1 block font-bold text-[var(--text-primary)]">Agent name *</label>
              <input id="edit-agent-name" required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} className={INPUT_CLASS} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-agent-provider" className="mb-1 block font-bold text-[var(--text-primary)]">Provider</label>
                <select id="edit-agent-provider" value={provider} onChange={(event) => setProvider(event.target.value as VoiceProvider)} className={INPUT_CLASS} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <option value="elevenlabs">ElevenLabs</option><option value="assemblyai">AssemblyAI</option><option value="vapi">Vapi</option><option value="retell">Retell AI</option>
                  {provider === 'twilio' && <option value="twilio">Twilio Telephony</option>}
                </select>
              </div>
              <div>
                <label htmlFor="edit-agent-type" className="mb-1 block font-bold text-[var(--text-primary)]">Agent type</label>
                <input id="edit-agent-type" value={agentType} onChange={(event) => setAgentType(event.target.value)} className={INPUT_CLASS} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
              </div>
              <div>
                <label htmlFor="edit-agent-status" className="mb-1 block font-bold text-[var(--text-primary)]">Configuration status</label>
                <select id="edit-agent-status" value={configurationStatus} onChange={(event) => setConfigurationStatus(event.target.value as VoiceAgent['configuration_status'])} className={INPUT_CLASS} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <option value="ready">Ready</option><option value="draft">Draft</option><option value="needs_credentials">Needs credentials</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-agent-mode" className="mb-1 block font-bold text-[var(--text-primary)]">Execution mode</label>
                <select id="edit-agent-mode" value={executionMode} onChange={(event) => setExecutionMode(event.target.value as 'sandbox' | 'live')} className={INPUT_CLASS} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
                  <option value="sandbox">Sandbox</option><option value="live">Live</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit-agent-reference" className="mb-1 block font-bold text-[var(--text-primary)]">Provider agent ID / reference</label>
              <input id="edit-agent-reference" value={agentIdRef} onChange={(event) => setAgentIdRef(event.target.value)} className={`${INPUT_CLASS} font-mono`} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
            </div>

            <div>
              <label htmlFor="edit-agent-instructions" className="mb-1 block font-bold text-[var(--text-primary)]">System prompt / instructions</label>
              <textarea id="edit-agent-instructions" rows={6} value={systemPrompt} onChange={(event) => setSystemPrompt(event.target.value)} placeholder="Describe the agent's role, goals, and operating instructions..." className={`${INPUT_CLASS} resize-y font-mono leading-relaxed`} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
            </div>

            <div>
              <label htmlFor="edit-agent-tools" className="mb-1 block font-bold text-[var(--text-primary)]">Permitted tools</label>
              <textarea id="edit-agent-tools" rows={2} value={tools} onChange={(event) => setTools(event.target.value)} placeholder="lookup_order, create_support_ticket" className={`${INPUT_CLASS} resize-y font-mono`} style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }} />
              <p className="mt-1 text-[10px] text-[var(--text-muted)]">Separate tool names with commas or new lines.</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">Cancel</button>
            <button type="submit" disabled={!name.trim() || saving} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}><Save size={13} /><span>{saving ? 'Saving…' : 'Save changes'}</span></button>
          </div>
        </form>
      </div>
    </div>
  );
};
