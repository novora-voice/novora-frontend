'use client';

import React from 'react';
import { Puzzle, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

interface OverviewProviderHealthProps {
  onNavigateToIntegrations: () => void;
  isBackendConnected: boolean;
}

interface ProviderSummary {
  id: string;
  name: string;
  category: string;
  status: 'connected' | 'needs_key' | 'healthy';
  errorCount: number;
  logo: string;
}

const PROVIDERS: ProviderSummary[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'Conversational AI',
    status: 'connected',
    errorCount: 0,
    logo: '/providers/elevenlabs.svg',
  },
  {
    id: 'vapi',
    name: 'Vapi',
    category: 'Voice Assistant Orchestration',
    status: 'connected',
    errorCount: 0,
    logo: '/providers/vapi.svg',
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    category: 'Streaming STT & Tools',
    status: 'connected',
    errorCount: 0,
    logo: '/providers/assemblyai.svg',
  },
  {
    id: 'retell',
    name: 'Retell AI',
    category: 'Inbound & Outbound Calling',
    status: 'needs_key',
    errorCount: 1,
    logo: '/providers/retell.svg',
  },
];

export const OverviewProviderHealth: React.FC<OverviewProviderHealthProps> = ({
  onNavigateToIntegrations,
  isBackendConnected,
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
            <Puzzle size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Connected Providers</h3>
            <p className="text-[11px] text-[var(--text-muted)]">Voice engine health & error telemetry</p>
          </div>
        </div>

        <button
          onClick={onNavigateToIntegrations}
          className="flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:underline"
        >
          <span>Integrations</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PROVIDERS.map((p) => {
          const isHealthy = p.errorCount === 0;

          return (
            <div
              key={p.id}
              className="rounded-xl border p-3 flex flex-col justify-between"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="relative h-6 w-6 shrink-0 rounded-md overflow-hidden bg-white/5 flex items-center justify-center border border-[var(--border-color)]">
                  <Image src={p.logo} alt={p.name} width={18} height={18} className="object-contain" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-[var(--text-primary)] block truncate">
                    {p.name}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] block truncate">
                    {p.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-1">
                  {isHealthy ? (
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={12} className="text-amber-500" />
                  )}
                  <span
                    className={`text-[10px] font-bold ${
                      isHealthy
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isHealthy ? 'Connected' : '1 Config Notice'}
                  </span>
                </div>

                <span className="text-[9px] text-[var(--text-muted)] font-mono">
                  {isBackendConnected ? 'LIVE' : 'MOCK'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
