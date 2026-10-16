'use client';

import React, { useState } from 'react';
import { EvaluationScenario } from '@/types/api';
import { novoraApi } from '@/lib/api';
import { IntegrationCard, IntegrationItem } from '../integrations/IntegrationCard';
import { ConfigureProviderModal } from '../integrations/ConfigureProviderModal';
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
    status: 'connected',
    supportedOperations: ['Post-Call Webhook', 'HMAC Verification', 'Auto-Evaluation'],
    webhookPath: '/api/v1/webhooks/elevenlabs',
    recoveryGuidance: 'Ensure your webhook signing secret matches the backend configuration.',
  },
  {
    id: 'vapi',
    name: 'Vapi',
    category: 'voice_agent',
    purpose: 'Assistant conversation and end-of-call webhook streaming with transcript normalization.',
    logo: '/providers/vapi.svg',
    status: 'connected',
    supportedOperations: ['End-of-Call Webhook', 'Assistant ID Target', 'Tool Call Logs'],
    webhookPath: '/api/v1/webhooks/vapi',
  },
  {
    id: 'retell',
    name: 'Retell AI',
    category: 'voice_agent',
    purpose: 'Direct agent execution and call-analyzed webhook parser with latency metrics.',
    logo: '/providers/retell.svg',
    status: 'connected',
    supportedOperations: ['Call Analyzed Webhook', 'Agent ID Match', 'Disconnection Reason'],
    webhookPath: '/api/v1/webhooks/retell',
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    category: 'transcription',
    purpose: 'Completed transcription parser with speaker diarization and turn normalization.',
    logo: '/providers/assemblyai.svg',
    status: 'connected',
    supportedOperations: ['Speaker Diarization', 'Word Timestamps', 'Utterance Mapping'],
    webhookPath: '/api/v1/webhooks/assemblyai',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'telephony',
    purpose: 'Inbound and outbound voice telephony call tracking with recording URL capture.',
    logo: '/providers/twilio.svg',
    status: 'connected',
    supportedOperations: ['Call Status Tracking', 'Recording URL Capture', 'Telephony Records'],
    webhookPath: '/api/v1/webhooks/twilio',
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
  { id: 'telephony', label: 'Telephony & Calling' },
  { id: 'business_tools', label: 'Business & CRM Tools' },
] as const;

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  scenarios,
  onRefreshAll,
}) => {
  const [selectedItem, setSelectedItem] = useState<IntegrationItem | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTestConnection = async (item: IntegrationItem) => {
    setTestingId(item.id);
    setFeedback(null);
    try {
      if (item.id === 'elevenlabs') {
        await novoraApi.triggerElevenLabsWebhook({ conversation_id: `test_el_${Date.now()}`, messages: [] });
      } else if (item.id === 'twilio') {
        await novoraApi.triggerTwilioWebhook({ CallSid: `CA${Date.now()}`, From: '+15551234567', To: '+18005550199', CallStatus: 'completed' });
      } else if (item.id === 'assemblyai') {
        await novoraApi.triggerAssemblyAIWebhook({ id: `aai_${Date.now()}`, utterances: [] });
      } else if (item.id === 'vapi') {
        await novoraApi.triggerVapiWebhook({ message: { type: 'end-of-call-report', call: { id: `vapi_${Date.now()}` } } });
      } else if (item.id === 'retell') {
        await novoraApi.triggerRetellWebhook({ call: { call_id: `retell_${Date.now()}`, transcript: 'Hello' } });
      }
      setFeedback(`Connection test to ${item.name} succeeded! Backend endpoint validated.`);
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
            <p className="text-xs text-[var(--text-secondary)]">Manage voice runtimes, speech infrastructure, and telephony adapters</p>
          </div>
        </div>

        <button onClick={onRefreshAll} className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]" style={{ borderColor: 'var(--border-color)' }}>
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

      <div className="space-y-8">
        {CATEGORIES.map((cat) => {
          const items = INTEGRATION_CATALOG.filter((i) => i.category === cat.id);
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
                    isTesting={testingId === item.id}
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
        onSave={() => setFeedback('Credentials saved securely.')}
      />
    </div>
  );
};
