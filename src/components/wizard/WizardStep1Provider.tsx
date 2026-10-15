'use client';

import React from 'react';
import Image from 'next/image';
import { VoiceProvider } from '@/types/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface WizardStep1ProviderProps {
  selectedProvider: VoiceProvider;
  onSelectProvider: (provider: VoiceProvider) => void;
  isBackendConnected: boolean;
}

const PROVIDERS: {
  id: VoiceProvider;
  name: string;
  logo: string;
  tagline: string;
  capabilities: string[];
}[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    logo: '/providers/elevenlabs.svg',
    tagline: 'Connect configured conversational voice agents with low latency',
    capabilities: ['Dynamic Webhooks', 'Agent ID Target', 'Real-time Synthesis'],
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    logo: '/providers/assemblyai.svg',
    tagline: 'Configure streaming voice agent sessions, prompts, and tool forms',
    capabilities: ['Speech-to-Text', 'Prompt Editor', 'Structured Tool Calls'],
  },
  {
    id: 'vapi',
    name: 'Vapi',
    logo: '/providers/vapi.svg',
    tagline: 'Connect assistant test targets and evaluate voice call workflows',
    capabilities: ['Assistant End-of-Call', 'Transcripts', 'Tool Result Logs'],
  },
  {
    id: 'retell',
    name: 'Retell AI',
    logo: '/providers/retell.svg',
    tagline: 'Connect agent execution mode and evaluate multi-turn dialogues',
    capabilities: ['Call Analyzed Events', 'Execution Modes', 'Latency Metrics'],
  },
];

export const WizardStep1Provider: React.FC<WizardStep1ProviderProps> = ({
  selectedProvider,
  onSelectProvider,
  isBackendConnected,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 1 — Choose a Voice Provider</h3>
        <p className="text-xs text-[var(--text-secondary)]">Select the voice runtime or infrastructure platform to evaluate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROVIDERS.map((prov) => {
          const isSelected = selectedProvider === prov.id;
          return (
            <div
              key={prov.id}
              onClick={() => onSelectProvider(prov.id)}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                isSelected
                  ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-md'
                  : 'hover:border-[var(--border-color)]'
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative h-9 w-9 rounded-xl border p-1" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                    <Image src={prov.logo} alt={prov.name} width={32} height={32} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)]">{prov.name}</h4>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Supported</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 size={16} className="text-[var(--primary)]" />}
              </div>

              <p className="text-[11px] text-[var(--text-secondary)] mb-3 leading-snug">{prov.tagline}</p>

              <div className="flex flex-wrap gap-1">
                {prov.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold text-[var(--text-secondary)] border"
                    style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
