'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TelephonyCall, EvaluationScenario } from '@/types/api';
import { novoraApi } from '@/lib/api';
import {
  PhoneCall,
  Mic,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  Terminal,
  Zap,
  Link2,
  ExternalLink,
} from 'lucide-react';

interface IntegrationsViewProps {
  scenarios: EvaluationScenario[];
  onRefreshAll: () => void;
}

interface ProviderCard {
  id: 'elevenlabs' | 'twilio' | 'assemblyai';
  name: string;
  tagline: string;
  description: string;
  status: 'ready' | 'planned';
  statusLabel: string;
  logoFile: string | null; // filename inside /providers/
  iconFallback: React.ElementType;
  iconBg: string;
  iconColor: string;
  webhookLabel: string;
  webhookPath: string;
  copyKey: string;
  simulateLabel: string;
  capabilities: string[];
}

const PROVIDERS: ProviderCard[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    tagline: 'Conversational AI Voice',
    description:
      'Post-call conversational webhook ingestion with HMAC-SHA256 signature verification and automatic evaluation triggering.',
    status: 'ready',
    statusLabel: 'Adapter Ready',
    logoFile: 'elevenlabs.png',
    iconFallback: Radio,
    iconBg: 'rgba(37, 99, 235, 0.12)',
    iconColor: '#2563EB',
    webhookLabel: 'Ingestion Webhook URL',
    webhookPath: '/api/v1/webhooks/elevenlabs',
    copyKey: 'el',
    simulateLabel: 'Simulate Call Ingestion',
    capabilities: ['HMAC Signature Verification', 'Auto-Evaluation', 'Post-call Webhooks'],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    tagline: 'Voice Telephony Platform',
    description:
      'Call status and recording URL callbacks for inbound/outbound telephony streams with full call metadata capture.',
    status: 'ready',
    statusLabel: 'Adapter Ready',
    logoFile: 'twilio.png',
    iconFallback: PhoneCall,
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#EF4444',
    webhookLabel: 'Status Callback URL',
    webhookPath: '/api/v1/webhooks/twilio',
    copyKey: 'tw',
    simulateLabel: 'Simulate Telephony Event',
    capabilities: ['Call Status Tracking', 'Recording URL Capture', 'Call Metadata'],
  },
  {
    id: 'assemblyai',
    name: 'AssemblyAI',
    tagline: 'Speech-to-Text API',
    description:
      'Completed transcription webhook parsing with utterance speaker diarization — maps speaker A/B turns into Novora conversation messages.',
    status: 'ready',
    statusLabel: 'Adapter Ready',
    logoFile: 'assemblyai.png',
    iconFallback: Mic,
    iconBg: 'rgba(168, 85, 247, 0.12)',
    iconColor: '#A855F7',
    webhookLabel: 'Transcription Callback URL',
    webhookPath: '/api/v1/webhooks/assemblyai',
    copyKey: 'aai',
    simulateLabel: 'Simulate Transcription',
    capabilities: ['Speaker Diarization', 'Utterance Mapping', 'Auto-Import'],
  },
];

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  scenarios,
  onRefreshAll,
}) => {
  const [telephonyCalls, setTelephonyCalls] = useState<TelephonyCall[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [activeSimulator, setActiveSimulator] = useState<'elevenlabs' | 'twilio' | 'assemblyai' | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState<Record<string, unknown> | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});

  const apiBase = novoraApi.getBaseUrl();

  const fetchCalls = async () => {
    setLoadingCalls(true);
    try {
      const calls = await novoraApi.listTelephonyCalls();
      setTelephonyCalls(calls);
    } catch {
      setTelephonyCalls([]);
    } finally {
      setLoadingCalls(false);
    }
  };

  useEffect(() => { fetchCalls(); }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSimulation = async (id: 'elevenlabs' | 'twilio' | 'assemblyai') => {
    setActiveSimulator(id);
    setSimLoading(true);
    setSimError(null);
    setSimResponse(null);
    try {
      let res: Record<string, unknown>;
      if (id === 'elevenlabs') {
        const payload = {
          conversation_id: `el_conv_${Date.now()}`,
          transcript: [
            { role: 'user', message: 'Hello, my order #9821 has not arrived yet.' },
            { role: 'agent', message: 'I can help with that. I am issuing a $40 courtesy credit.' },
          ],
        };
        res = await novoraApi.triggerElevenLabsWebhook(payload, scenarios[0]?.id, true);
        onRefreshAll();
      } else if (id === 'twilio') {
        const payload = {
          CallSid: `CA${Math.random().toString(36).substring(2, 12)}`,
          From: '+14155550199',
          To: '+18005550123',
          CallStatus: 'completed',
          CallDuration: '65',
          RecordingUrl: 'https://api.twilio.com/mock-recording.wav',
        };
        res = await novoraApi.triggerTwilioWebhook(payload) as unknown as Record<string, unknown>;
        fetchCalls();
      } else {
        const payload = {
          id: `aai_trans_${Date.now()}`,
          text: 'Customer: Where is my order #9821? Agent: Checking order #9821 now.',
          utterances: [
            { speaker: 'A', text: 'Where is my order #9821?' },
            { speaker: 'B', text: 'Checking order #9821 now.' },
          ],
        };
        res = await novoraApi.triggerAssemblyAIWebhook(payload, scenarios[0]?.id) as unknown as Record<string, unknown>;
        onRefreshAll();
      }
      setSimResponse(res);
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'Webhook test failed');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── Header ── */}
      <div
        className="rounded-2xl border p-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link2 size={16} className="text-[var(--primary)]" />
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Voice &amp; Audio Provider Integrations
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] pl-6">
              Webhook ingestion endpoints and live telemetry streams for voice agent evaluation.
              Drop provider logos into <code className="font-mono bg-[var(--bg-elevated)] px-1 rounded">/public/providers/</code> to display them here.
            </p>
          </div>
          <button
            onClick={fetchCalls}
            disabled={loadingCalls}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] self-start sm:self-auto"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <RefreshCw size={13} className={loadingCalls ? 'animate-spin' : ''} />
            <span>Refresh Telephony</span>
          </button>
        </div>
      </div>

      {/* ── Provider Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PROVIDERS.map((provider) => {
          const FallbackIcon = provider.iconFallback;
          const logoSrc = `/providers/${provider.logoFile}`;
          const logoErrored = logoErrors[provider.id];

          return (
            <div
              key={provider.id}
              className="rounded-2xl border flex flex-col overflow-hidden transition-all hover:border-[var(--primary)] hover:-translate-y-0.5"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                boxShadow: 'var(--shadow-card)',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Card top */}
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-4">
                  {/* Logo or Icon fallback */}
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl overflow-hidden"
                    style={{ backgroundColor: provider.iconBg }}
                  >
                    {provider.logoFile && !logoErrored ? (
                      <Image
                        src={logoSrc}
                        alt={`${provider.name} logo`}
                        width={32}
                        height={32}
                        className="object-contain"
                        onError={() =>
                          setLogoErrors((prev) => ({ ...prev, [provider.id]: true }))
                        }
                      />
                    ) : (
                      <FallbackIcon size={22} style={{ color: provider.iconColor }} />
                    )}
                  </div>

                  <span
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--status-success-bg)',
                      color: 'var(--status-success)',
                    }}
                  >
                    {provider.statusLabel}
                  </span>
                </div>

                <div className="mb-1">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    {provider.name}
                  </h3>
                  <p className="text-[11px] font-medium text-[var(--primary)]">
                    {provider.tagline}
                  </p>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1.5 mb-4 leading-relaxed">
                  {provider.description}
                </p>

                {/* Capability chips */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {provider.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: 'var(--bg-elevated)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {cap}
                    </span>
                  ))}
                </div>

                {/* Webhook URL box */}
                <div
                  className="rounded-xl border p-3 text-xs"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                    {provider.webhookLabel}
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-primary)] break-all gap-2">
                    <span className="truncate">{apiBase}{provider.webhookPath}</span>
                    <button
                      onClick={() => copyToClipboard(`${apiBase}${provider.webhookPath}`, provider.copyKey)}
                      className="shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      aria-label="Copy webhook URL"
                    >
                      {copiedKey === provider.copyKey
                        ? <Check size={14} className="text-emerald-500" />
                        : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulate button */}
              <div className="px-5 pb-5">
                <button
                  onClick={() => runSimulation(provider.id)}
                  disabled={simLoading && activeSimulator === provider.id}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {simLoading && activeSimulator === provider.id
                    ? <RefreshCw size={13} className="animate-spin text-[var(--primary)]" />
                    : <Send size={13} />}
                  <span>{provider.simulateLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Simulator Response Inspector ── */}
      {activeSimulator && (simLoading || simResponse || simError) && (
        <div
          className="rounded-2xl border p-6 animate-in fade-in duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-[var(--primary)]" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Webhook Simulator — {activeSimulator.toUpperCase()}
              </h4>
              {simLoading && (
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <RefreshCw size={11} className="animate-spin" />
                  Dispatching...
                </span>
              )}
            </div>
            <button
              onClick={() => { setActiveSimulator(null); setSimResponse(null); setSimError(null); }}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Dismiss
            </button>
          </div>

          {simError && (
            <div
              className="rounded-xl p-3 text-xs font-medium border flex items-center gap-2 mb-4"
              style={{
                backgroundColor: 'var(--status-error-bg)',
                borderColor: 'var(--status-error)',
                color: 'var(--status-error)',
              }}
            >
              <AlertCircle size={14} />
              <span>{simError}</span>
            </div>
          )}

          {simResponse && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Webhook accepted by backend
                </span>
              </div>
              <pre
                className="rounded-xl border p-4 text-xs font-mono overflow-x-auto text-[var(--text-primary)] max-h-72"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {JSON.stringify(simResponse, null, 2)}
              </pre>
            </>
          )}
        </div>
      )}

      {/* ── Telephony Call Table ── */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center gap-2">
            <PhoneCall size={16} className="text-[var(--primary)]" />
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Twilio Telephony Call Records
                <span
                  className="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
                >
                  {telephonyCalls.length}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Ingested telephony sessions persisted in Novora repository
              </p>
            </div>
          </div>
          <button
            onClick={fetchCalls}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ExternalLink size={13} />
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr
                className="border-b text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {['Call SID', 'From', 'To', 'Status', 'Duration', 'Timestamp'].map((h) => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {telephonyCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center gap-2">
                      <PhoneCall size={24} className="opacity-30" />
                      <span>
                        No telephony calls recorded yet. Click &ldquo;Simulate Telephony Event&rdquo; to test ingestion.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                telephonyCalls.map((call) => (
                  <tr key={call.call_sid} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[var(--text-primary)] text-[11px]">
                      {call.call_sid}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)] text-[11px]">
                      {call.from_number}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)] text-[11px]">
                      {call.to_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 text-[10px] uppercase">
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)] text-[11px]">
                      {call.duration_seconds ? `${call.duration_seconds}s` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)] font-mono text-[11px]">
                      {new Date(call.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
