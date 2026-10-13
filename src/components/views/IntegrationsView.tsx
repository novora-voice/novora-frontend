'use client';

import React, { useState, useEffect } from 'react';
import { TelephonyCall, EvaluationScenario } from '@/types/api';
import { novoraApi } from '@/lib/api';
import {
  Puzzle,
  PhoneCall,
  Mic,
  Radio,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  RefreshCw,
  Clock,
  Terminal,
} from 'lucide-react';

interface IntegrationsViewProps {
  scenarios: EvaluationScenario[];
  onRefreshAll: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  scenarios,
  onRefreshAll,
}) => {
  const [telephonyCalls, setTelephonyCalls] = useState<TelephonyCall[]>([]);
  const [loadingCalls, setLoadingCalls] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Webhook Simulator State
  const [activeSimulator, setActiveSimulator] = useState<'elevenlabs' | 'twilio' | 'assemblyai' | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simResponse, setSimResponse] = useState<Record<string, unknown> | null>(null);
  const [simError, setSimError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
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

  useEffect(() => {
    fetchCalls();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateElevenLabs = async () => {
    setSimLoading(true);
    setSimError(null);
    setSimResponse(null);
    try {
      const mockPayload = {
        conversation_id: `el_conv_${Date.now()}`,
        transcript: [
          { role: 'user', message: 'Hello, my order #9821 has not arrived yet.' },
          { role: 'agent', message: 'I can help with that. I am issuing a $40 courtesy credit.' },
        ],
      };
      const res = await novoraApi.triggerElevenLabsWebhook(
        mockPayload,
        scenarios[0]?.id,
        true
      );
      setSimResponse(res);
      onRefreshAll();
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'ElevenLabs webhook test failed');
    } finally {
      setSimLoading(false);
    }
  };

  const handleSimulateTwilio = async () => {
    setSimLoading(true);
    setSimError(null);
    setSimResponse(null);
    try {
      const mockPayload = {
        CallSid: `CA${Math.random().toString(36).substring(2, 12)}`,
        From: '+14155550199',
        To: '+18005550123',
        CallStatus: 'completed',
        CallDuration: '65',
        RecordingUrl: 'https://api.twilio.com/mock-recording.wav',
      };
      const res = await novoraApi.triggerTwilioWebhook(mockPayload);
      setSimResponse(res as unknown as Record<string, unknown>);
      fetchCalls();
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'Twilio webhook test failed');
    } finally {
      setSimLoading(false);
    }
  };

  const handleSimulateAssemblyAI = async () => {
    setSimLoading(true);
    setSimError(null);
    setSimResponse(null);
    try {
      const mockPayload = {
        id: `aai_trans_${Date.now()}`,
        text: 'Customer: Where is my order #9821? Agent: Checking order #9821 now.',
        utterances: [
          { speaker: 'A', text: 'Where is my order #9821?' },
          { speaker: 'B', text: 'Checking order #9821 now.' },
        ],
      };
      const res = await novoraApi.triggerAssemblyAIWebhook(mockPayload, scenarios[0]?.id);
      setSimResponse(res as unknown as Record<string, unknown>);
      onRefreshAll();
    } catch (err: unknown) {
      setSimError(err instanceof Error ? err.message : 'AssemblyAI webhook test failed');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div
        className="rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Voice & Audio Provider Integrations
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Webhook ingestion endpoints and live telemetry streams for voice agent evaluation
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

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. ElevenLabs */}
        <div
          className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                <Radio size={20} />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                }}
              >
                Adapter Ready
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)]">
              ElevenLabs Conversational AI
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
              Post-call conversational webhook ingestion with HMAC-SHA256 signature verification and auto-evaluation.
            </p>

            {/* Webhook endpoint box */}
            <div
              className="rounded-xl border p-3 text-xs mb-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Ingestion Webhook URL
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-primary)] break-all">
                <span>{apiBase}/api/v1/webhooks/elevenlabs</span>
                <button
                  onClick={() => copyToClipboard(`${apiBase}/api/v1/webhooks/elevenlabs`, 'el')}
                  className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
                  aria-label="Copy webhook URL"
                >
                  {copiedKey === 'el' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSimulator('elevenlabs');
              handleSimulateElevenLabs();
            }}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Send size={13} />
            <span>Simulate Call Ingestion</span>
          </button>
        </div>

        {/* 2. Twilio Telephony */}
        <div
          className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 text-red-500"
              >
                <PhoneCall size={20} />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                }}
              >
                Adapter Ready
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Twilio Voice Telephony
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
              Call status and recording URL callbacks for inbound/outbound telephony streams.
            </p>

            {/* Webhook endpoint box */}
            <div
              className="rounded-xl border p-3 text-xs mb-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Status Callback URL
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-primary)] break-all">
                <span>{apiBase}/api/v1/webhooks/twilio</span>
                <button
                  onClick={() => copyToClipboard(`${apiBase}/api/v1/webhooks/twilio`, 'tw')}
                  className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
                  aria-label="Copy webhook URL"
                >
                  {copiedKey === 'tw' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSimulator('twilio');
              handleSimulateTwilio();
            }}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Send size={13} />
            <span>Simulate Telephony Event</span>
          </button>
        </div>

        {/* 3. AssemblyAI Speech-to-Text */}
        <div
          className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500"
              >
                <Mic size={20} />
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--status-success-bg)',
                  color: 'var(--status-success)',
                }}
              >
                Adapter Ready
              </span>
            </div>

            <h3 className="text-base font-bold text-[var(--text-primary)]">
              AssemblyAI Speech-to-Text
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4 leading-relaxed">
              Completed transcription webhook parsing with utterance speaker diarization into Novora messages.
            </p>

            {/* Webhook endpoint box */}
            <div
              className="rounded-xl border p-3 text-xs mb-3"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                Transcription Callback URL
              </div>
              <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-primary)] break-all">
                <span>{apiBase}/api/v1/webhooks/assemblyai</span>
                <button
                  onClick={() => copyToClipboard(`${apiBase}/api/v1/webhooks/assemblyai`, 'aai')}
                  className="ml-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0"
                  aria-label="Copy webhook URL"
                >
                  {copiedKey === 'aai' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveSimulator('assemblyai');
              handleSimulateAssemblyAI();
            }}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <Send size={13} />
            <span>Simulate Transcription</span>
          </button>
        </div>
      </div>

      {/* Simulator Response Inspector (If triggered) */}
      {activeSimulator && (
        <div
          className="rounded-2xl border p-6 shadow-sm animate-in fade-in duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-[var(--primary)]" />
              <h4 className="text-sm font-bold text-[var(--text-primary)]">
                Webhook Simulator Response — {activeSimulator.toUpperCase()}
              </h4>
            </div>
            <button
              onClick={() => setActiveSimulator(null)}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              Dismiss
            </button>
          </div>

          {simLoading && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] py-4">
              <RefreshCw size={14} className="animate-spin text-[var(--primary)]" />
              <span>Dispatching webhook payload to FastAPI backend...</span>
            </div>
          )}

          {simError && (
            <div
              className="rounded-lg p-3 text-xs font-medium border flex items-center gap-2 mb-3"
              style={{
                backgroundColor: 'var(--status-error-bg)',
                borderColor: 'var(--status-error)',
                color: 'var(--status-error)',
              }}
            >
              <AlertCircle size={15} />
              <span>{simError}</span>
            </div>
          )}

          {simResponse && (
            <pre
              className="rounded-xl border p-4 text-xs font-mono overflow-x-auto text-[var(--text-primary)]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
              }}
            >
              {JSON.stringify(simResponse, null, 2)}
            </pre>
          )}
        </div>
      )}

      {/* Telephony Call Stream Table */}
      <div
        className="rounded-2xl border shadow-sm overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Twilio Telephony Call Records ({telephonyCalls.length})
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Ingested telephony sessions persisted in Novora repository
            </p>
          </div>
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
                <th className="px-5 py-3">Call SID</th>
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">To</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
              {telephonyCalls.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[var(--text-muted)]">
                    No telephony calls recorded yet. Click &ldquo;Simulate Telephony Event&rdquo; to test ingestion.
                  </td>
                </tr>
              ) : (
                telephonyCalls.map((call) => (
                  <tr key={call.call_sid} className="hover:bg-[var(--bg-elevated)] transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[var(--text-primary)]">
                      {call.call_sid}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)]">
                      {call.from_number}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[var(--text-secondary)]">
                      {call.to_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5 text-[10px] uppercase">
                        {call.call_status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-muted)]">
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
