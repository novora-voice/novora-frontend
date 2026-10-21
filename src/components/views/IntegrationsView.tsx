'use client';

import React, { useEffect, useState } from 'react';
import { EvaluationScenario } from '@/types/api';
import { novoraApi } from '@/lib/api';
import { IntegrationCard, IntegrationItem } from '../integrations/IntegrationCard';
import { ConfigureProviderModal } from '../integrations/ConfigureProviderModal';
import { HttpToolEndpointsPanel } from '../integrations/HttpToolEndpointsPanel';
import { ToolEndpointProvider } from '@/types/execution';
import { Puzzle, ShieldCheck, RefreshCw } from 'lucide-react';

interface IntegrationsViewProps {
  scenarios: EvaluationScenario[];
  onRefreshAll: () => void;
}

const INTEGRATION_CATALOG: IntegrationItem[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: 'voice_agent',
    purpose: 'Conversational agent webhook ingestion with HMAC-SHA256 signature verification.',
    logo: '/providers/elevenlabs.svg',
    status: 'not_connected',
    supportedOperations: ['Post-Call Webhook', 'HMAC Verification', 'Auto-Evaluation'],
    webhookPath: '/api/v1/webhooks/elevenlabs',
    recoveryGuidance: 'Ensure your webhook signing secret matches the backend configuration.',
  },
  {
    id: 'vapi',
    name: 'Vapi',
    category: 'voice_agent',
    purpose: 'Test your application’s Vapi tool-call endpoint and inspect its HTTP contract response.',
    logo: '/providers/vapi.svg',
    status: 'not_connected',
    supportedOperations: ['HTTP Tool Call Contract', 'Endpoint Response Audit', 'Latency Metrics'],
    webhookPath: '/api/v1/webhooks/vapi',
    testActionLabel: 'Test Connection',
  },
  {
    id: 'retell',
    name: 'Retell AI',
    category: 'voice_agent',
    purpose: 'Test your application’s Retell custom-function endpoint with agent call context and response events.',
    logo: '/providers/retell.svg',
    status: 'not_connected',
    supportedOperations: ['Custom Function HTTP', 'Agent Call Context', 'Response Event Log'],
    webhookPath: '/api/v1/webhooks/retell',
    testActionLabel: 'Test Connection',
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    category: 'transcription',
    purpose: 'Completed transcription parser with speaker diarization and turn normalization.',
    logo: '/providers/assemblyai.svg',
    status: 'not_connected',
    supportedOperations: ['Speaker Diarization', 'Word Timestamps', 'Utterance Mapping'],
    webhookPath: '/api/v1/webhooks/assemblyai',
  },
  {
    id: 'zendesk',
    name: 'Zendesk / CRM Bridge',
    category: 'business_tools',
    purpose: 'Ticket lifecycle validation and authoritative refund confirmation verification.',
    logo: '/providers/elevenlabs.svg',
    status: 'unsupported',
    supportedOperations: ['Ticket Status Sync', 'Refund Verification', 'CRM Context'],
  },
];

const CATEGORIES = [
  { id: 'voice_agent', label: 'Voice-Agent Platforms' },
  { id: 'transcription', label: 'Voice & Transcription Infrastructure' },
  { id: 'business_tools', label: 'Business & CRM Tools' },
] as const;

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  scenarios,
  onRefreshAll,
}) => {
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [toolEndpointProvider, setToolEndpointProvider] = useState<ToolEndpointProvider>('vapi');
  const [integrations, setIntegrations] = useState<Awaited<ReturnType<typeof novoraApi.listIntegrations>>>([]);
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true);

  const refreshIntegrations = async () => {
    const saved = await novoraApi.listIntegrations();
    setIntegrations(saved);
  };

  useEffect(() => {
    let active = true;
    novoraApi.listIntegrations()
      .then((saved) => { if (active) setIntegrations(saved); })
      .catch((err: unknown) => {
        if (active) setFeedback(`Could not load provider connections: ${err instanceof Error ? err.message : 'Request failed.'}`);
      })
      .finally(() => { if (active) setIsLoadingIntegrations(false); });
    return () => { active = false; };
  }, []);

  const handleTestConnection = async (item: IntegrationItem) => {
    if (item.id === 'zendesk') return;
    const integration = integrations.find((saved) => saved.provider_name.toLowerCase() === item.id);
    if (!integration) {
      setFeedback(`Configure ${item.name} first. It is disconnected until its credentials are saved.`);
      return;
    }
    setTestingId(item.id);
    setFeedback(null);
    try {
      const health = await novoraApi.testConnectivity(integration.id);
      setFeedback(health.is_healthy
        ? `${item.name} API connection verified (${Math.round(health.latency_ms ?? 0)} ms).`
        : `${item.name} connection failed: ${health.error ?? 'Provider rejected the credentials.'}`);
    } catch (err: unknown) {
      setFeedback(`Connection test failed: ${err instanceof Error ? err.message : 'Endpoint unreachable'}`);
    } finally {
      setTestingId(null);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Puzzle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Integrations Directory</h2>
            <p className="text-xs text-[var(--text-secondary)]">Manage voice runtimes and speech infrastructure</p>
          </div>
        </div>

        <button onClick={() => { void refreshIntegrations().then(onRefreshAll).catch((err: unknown) => setFeedback(err instanceof Error ? err.message : 'Could not refresh integrations.')); }} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border-color)' }}>
          <RefreshCw size={13} />
          <span>Refresh Status</span>
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl border p-3 text-xs bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <ShieldCheck size={15} className="shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <HttpToolEndpointsPanel
        provider={toolEndpointProvider}
        onProviderChange={setToolEndpointProvider}
      />

      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const items = INTEGRATION_CATALOG.filter((i) => i.category === cat.id).map((item) => ({
            ...item,
            status: item.status === 'unsupported'
              ? 'unsupported' as const
              : integrations.some((saved) => saved.provider_name.toLowerCase() === item.id)
                ? 'connected' as const
                : 'not_connected' as const,
          }));
          if (items.length === 0) return null;
          return (
            <div key={cat.id} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b pb-1.5" style={{ borderColor: 'var(--border-color)' }}>
                {cat.label}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item) => (
                  <IntegrationCard
                    key={item.id}
                    item={item}
                    onConfigure={setSelectedItem}
                    onTestConnection={handleTestConnection}
                    isTesting={testingId === item.id || isLoadingIntegrations}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <ConfigureProviderModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSave={async (providerId, values) => {
          if (!values.apiKey.trim()) throw new Error('Enter the provider API key before saving.');
          await novoraApi.createIntegration({ provider_name: providerId, api_key: values.apiKey.trim() });
          await refreshIntegrations();
          setFeedback(`${providerId} credentials saved securely. Connection status is now Connected.`);
        }}
      />
    </div>
  );
};
