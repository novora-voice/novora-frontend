'use client';

import React from 'react';
import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';
import { VoiceProvider } from '@/types/api';
import { ProviderManifest } from '@/types/execution';
import { CheckCircle2, AlertCircle, Wifi, WifiOff, Server, Mic } from 'lucide-react';

interface WizardStep1ProviderProps {
  selectedProvider: VoiceProvider;
  onSelectProvider: (provider: VoiceProvider) => void;
  isBackendConnected: boolean;
  providerManifests?: ProviderManifest[];
}

interface ProviderItem {
  id: VoiceProvider;
  name: string;
  group: 'infrastructure' | 'voice';
  logo: string;
  tagline: string;
  capabilities: string[];
}

const STATIC_PROVIDERS: ProviderItem[] = [
  {
    id: 'vapi',
    name: 'Vapi',
    group: 'infrastructure',
    logo: '/providers/vapi.svg',
    tagline: 'Assistant runtime infrastructure with end-of-call webhooks and tool executions',
    capabilities: ['Assistant End-of-Call', 'Transcripts', 'Tool Result Logs'],
  },
  {
    id: 'retell',
    name: 'Retell AI',
    group: 'infrastructure',
    logo: '/providers/retell.svg',
    tagline: 'Direct voice agent infrastructure with dynamic variables and latency metrics',
    capabilities: ['Call Analyzed Events', 'Execution Modes', 'Latency Metrics'],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    group: 'voice',
    logo: '/providers/elevenlabs.svg',
    tagline: 'Connect configured conversational voice agents with low-latency synthesis',
    capabilities: ['Dynamic Webhooks', 'Agent ID Target', 'Real-time Synthesis'],
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    group: 'voice',
    logo: '/providers/assemblyai.svg',
    tagline: 'Configure streaming voice agent sessions, speech models, and prompt editors',
    capabilities: ['Speech-to-Text', 'Prompt Editor', 'Structured Tool Calls'],
  },
];

export const WizardStep1Provider: React.FC<WizardStep1ProviderProps> = ({
  selectedProvider,
  onSelectProvider,
  isBackendConnected,
  providerManifests,
}) => {
  const infraProviders = STATIC_PROVIDERS.filter((p) => p.group === 'infrastructure');
  const voiceProviders = STATIC_PROVIDERS.filter((p) => p.group === 'voice');

  const renderCard = (prov: ProviderItem) => {
    const isSelected = selectedProvider === prov.id;
    const manifest = providerManifests?.find((m) => m.provider_name === prov.id);
    const caps = manifest?.supported_capabilities ?? prov.capabilities;
    const supportsGhost = manifest?.supports_ghost_caller ?? true;

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
              <Image src={assetPath(prov.logo)} alt={prov.name} width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[var(--text-primary)]">{prov.name}</h4>
              {isBackendConnected ? (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Wifi size={9} /> Supported
                </span>
              ) : (
                <span className="text-[10px] text-[var(--text-muted)] font-medium">Catalog</span>
              )}
            </div>
          </div>
          {isSelected ? (
            <CheckCircle2 size={16} className="text-[var(--primary)]" />
          ) : !isBackendConnected ? (
            <AlertCircle size={14} className="text-[var(--text-muted)]" />
          ) : null}
        </div>

        <p className="text-[11px] text-[var(--text-secondary)] mb-2.5 leading-snug">{prov.tagline}</p>

        {supportsGhost && (
          <div className="text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1">
            <span>✓ Automated Ghost-Caller Engine</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {caps.map((cap, i) => (
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
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 1 — Choose Provider</h3>
        <p className="text-xs text-[var(--text-secondary)]">Select the infrastructure platform or voice runtime to evaluate</p>
      </div>

      {!isBackendConnected && (
        <div className="rounded-xl border p-3 bg-amber-500/10 border-amber-500/30 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
          <WifiOff size={14} className="shrink-0" />
          <span>Backend offline — provider capabilities shown from local catalog. Connectivity required to run evaluations.</span>
        </div>
      )}

      {/* Infrastructure Providers Section */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <Server size={14} className="text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Infrastructure Providers
          </h4>
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">(Vapi, Retell)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {infraProviders.map(renderCard)}
        </div>
      </div>

      {/* Voice Providers Section */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-2">
          <Mic size={14} className="text-[var(--primary)]" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Voice Providers
          </h4>
          <span className="text-[10px] font-semibold text-[var(--text-muted)]">(ElevenLabs, AssemblyAI)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {voiceProviders.map(renderCard)}
        </div>
      </div>
    </div>
  );
};
