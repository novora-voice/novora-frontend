'use client';

import React, { useState } from 'react';
import { VoiceAgent, VoiceProvider } from '@/types/api';
import { X, Bot, Plus } from 'lucide-react';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: VoiceAgent) => void;
}

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onAgentCreated,
}) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<VoiceProvider>('elevenlabs');
  const [agentIdRef, setAgentIdRef] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'live'>('sandbox');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAgent: VoiceAgent = {
      id: `agent_${Date.now()}`,
      name: name.trim(),
      provider,
      agent_type: provider === 'assemblyai' ? 'Streaming STT & Intent' : 'Conversational Agent',
      configuration_status: 'ready',
      agent_id_ref: agentIdRef.trim() || undefined,
      system_prompt: systemPrompt.trim() || undefined,
      execution_mode: executionMode,
      created_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    };

    onAgentCreated(newAgent);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Bot size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Configure Voice Agent</h2>
            <p className="text-xs text-[var(--text-muted)]">Connect an agent target from your voice provider</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">Agent Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Inbound Receptionist"
              className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Provider *</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as VoiceProvider)}
                className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                <option value="elevenlabs">ElevenLabs</option>
                <option value="assemblyai">AssemblyAI</option>
                <option value="vapi">Vapi</option>
                <option value="retell">Retell AI</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Mode *</label>
              <select
                value={executionMode}
                onChange={(e) => setExecutionMode(e.target.value as 'sandbox' | 'live')}
                className="w-full rounded-xl border p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                <option value="sandbox">Sandbox (No live telecom charges)</option>
                <option value="live">Live Outbound (Explicit Auth Required)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              {provider === 'elevenlabs' ? 'ElevenLabs Agent ID' : provider === 'vapi' ? 'Vapi Assistant ID' : provider === 'retell' ? 'Retell Agent ID' : 'Session Reference'}
            </label>
            <input
              type="text"
              value={agentIdRef}
              onChange={(e) => setAgentIdRef(e.target.value)}
              placeholder="e.g. ag_el_123456"
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">System Prompt / Instructions (Optional)</label>
            <textarea
              rows={3}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a customer service assistant..."
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 font-bold text-white shadow-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Plus size={14} />
              <span>Save Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
