'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, Plus, Save, Trash2, Wrench } from 'lucide-react';
import { novoraApi, ApiError } from '@/lib/api';
import {
  HttpToolEndpointConfig,
  HttpToolEvaluationResult,
  ToolEndpointMethod,
  ToolEndpointProvider,
} from '@/types/execution';

const METHODS: ToolEndpointMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const DEFAULT_ARGUMENTS = JSON.stringify({
  customer_email: 'sam@example.com',
  issue_description: 'Laptop screen is broken',
}, null, 2);

interface HttpToolEndpointsPanelProps {
  provider: ToolEndpointProvider;
  onProviderChange: (provider: ToolEndpointProvider) => void;
}

export const HttpToolEndpointsPanel: React.FC<HttpToolEndpointsPanelProps> = ({
  provider,
  onProviderChange,
}) => {
  const [endpoints, setEndpoints] = useState<HttpToolEndpointConfig[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [toolName, setToolName] = useState('create_support_ticket');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [method, setMethod] = useState<ToolEndpointMethod>('POST');
  const [timeoutMs, setTimeoutMs] = useState(3000);
  const [bearerToken, setBearerToken] = useState('');
  const [argumentsJson, setArgumentsJson] = useState(DEFAULT_ARGUMENTS);
  const [agentId, setAgentId] = useState('');
  const [allowWrites, setAllowWrites] = useState(false);
  const [result, setResult] = useState<HttpToolEvaluationResult | null>(null);
  const [history, setHistory] = useState<HttpToolEvaluationResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.id === selectedId) ?? null,
    [endpoints, selectedId]
  );
  const evaluationMethod = selectedEndpoint?.method ?? method;

  const refreshEndpoints = async (selectId?: string) => {
    const saved = await novoraApi.listToolEndpoints();
    setEndpoints(saved);
    if (selectId) setSelectedId(selectId);
    else if (selectedId && saved.some((endpoint) => endpoint.id === selectedId)) {
      setSelectedId(selectedId);
    } else if (saved.length > 0) {
      setSelectedId(saved[0].id);
    } else {
      setSelectedId('');
    }
  };

  useEffect(() => {
    let active = true;
    novoraApi.listToolEndpoints()
      .then((saved) => {
        if (!active) return;
        setEndpoints(saved);
        if (saved.length) setSelectedId(saved[0].id);
        if (saved.length) {
          const first = saved[0];
          onProviderChange(first.provider);
          setName(first.name);
          setToolName(first.tool_name);
          setEndpointUrl(first.endpoint_url);
          setMethod(first.method);
          setTimeoutMs(first.timeout_ms);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load tool endpoints.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [onProviderChange]);

  useEffect(() => {
    if (!selectedEndpoint) return;
    let active = true;
    novoraApi.listToolEndpointEvaluations(selectedEndpoint.id)
      .then((runs) => {
        if (!active) return;
        setHistory(runs);
        setResult(runs[0] ?? null);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load endpoint evaluation history.');
      });
    return () => { active = false; };
  }, [selectedEndpoint]);

  const resetForm = () => {
    setSelectedId('');
    setName('');
    setToolName('create_support_ticket');
    setEndpointUrl('');
    setMethod(provider === 'vapi' ? 'POST' : 'GET');
    setTimeoutMs(3000);
    setBearerToken('');
    setResult(null);
    setHistory([]);
    setError(null);
    setNotice(null);
  };

  const startNewEndpoint = () => {
    resetForm();
    setMethod(provider === 'vapi' ? 'POST' : 'GET');
  };

  const selectProvider = (nextProvider: ToolEndpointProvider) => {
    onProviderChange(nextProvider);
    setMethod(nextProvider === 'vapi' ? 'POST' : 'GET');
    setError(null);
    if (selectedEndpoint?.provider !== nextProvider) {
      setSelectedId('');
      setName('');
      setToolName('create_support_ticket');
      setEndpointUrl('');
      setBearerToken('');
      setResult(null);
      setHistory([]);
      setAllowWrites(false);
    }
  };

  const chooseEndpoint = (endpoint: HttpToolEndpointConfig) => {
    setSelectedId(endpoint.id);
    setName(endpoint.name);
    setToolName(endpoint.tool_name);
    setEndpointUrl(endpoint.endpoint_url);
    onProviderChange(endpoint.provider);
    setMethod(endpoint.method);
    setTimeoutMs(endpoint.timeout_ms);
    setBearerToken('');
    setAllowWrites(false);
    setResult(null);
    setHistory([]);
    setError(null);
    setNotice(null);
  };

  const saveEndpoint = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        name,
        provider,
        tool_name: toolName,
        endpoint_url: endpointUrl,
        method: provider === 'vapi' ? 'POST' as const : method,
        timeout_ms: timeoutMs,
        bearer_token: bearerToken || undefined,
      };
      const saved = selectedId
        ? await novoraApi.updateToolEndpoint(selectedId, payload)
        : await novoraApi.createToolEndpoint(payload);
      await refreshEndpoints(saved.id);
      setBearerToken('');
      setNotice('Endpoint configuration saved. Authentication stays encrypted on the backend.');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Could not save endpoint.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEndpoint = async () => {
    if (!selectedEndpoint) return;
    setIsSaving(true);
    setError(null);
    try {
      await novoraApi.deleteToolEndpoint(selectedEndpoint.id);
      setNotice('Endpoint deleted.');
      resetForm();
      await refreshEndpoints();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete endpoint.');
    } finally {
      setIsSaving(false);
    }
  };

  const runEvaluation = async () => {
    if (!selectedEndpoint) return;
    setIsRunning(true);
    setAllowWrites(false);
    setError(null);
    setNotice(null);
    try {
      const parsed: unknown = JSON.parse(argumentsJson);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Tool arguments must be a JSON object.');
      }
      const evaluation = await novoraApi.evaluateToolEndpoint(selectedEndpoint.id, {
        arguments: parsed as Record<string, unknown>,
        agent_id: agentId || undefined,
        allow_writes: allowWrites,
      });
      setResult(evaluation);
      setHistory((previous) => [evaluation, ...previous.filter((item) => item.id !== evaluation.id)]);
      if (!evaluation.success) setError(evaluation.error ?? 'Endpoint contract evaluation failed.');
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Endpoint evaluation failed.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <section id="developer-tool-endpoints" className="scroll-mt-6 space-y-5 rounded-2xl border p-5" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <Wrench size={16} className="text-[var(--primary)]" />
            Vapi &amp; Retell tool testing
          </h2>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Choose a provider below to open its dedicated endpoint setup and evaluation flow. Your application performs its normal database or CRM operation; Novora records the actual response.
          </p>
        </div>
        <button type="button" onClick={startNewEndpoint} className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>
          <Plus size={13} /> New endpoint
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => selectProvider('vapi')}
          aria-pressed={provider === 'vapi'}
          className="rounded-xl border p-4 text-left transition-colors"
          style={{
            backgroundColor: provider === 'vapi' ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
            borderColor: provider === 'vapi' ? 'var(--primary)' : 'var(--border-color)',
          }}
        >
          <span className="block text-sm font-bold text-[var(--text-primary)]">Vapi HTTP tool-call flow</span>
          <span className="mt-1 block text-[11px] text-[var(--text-secondary)]">POST tool-call envelope · HTTP status · gateway latency · Vapi result contract</span>
        </button>
        <button
          type="button"
          onClick={() => selectProvider('retell')}
          aria-pressed={provider === 'retell'}
          className="rounded-xl border p-4 text-left transition-colors"
          style={{
            backgroundColor: provider === 'retell' ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
            borderColor: provider === 'retell' ? 'var(--primary)' : 'var(--border-color)',
          }}
        >
          <span className="block text-sm font-bold text-[var(--text-primary)]">Retell custom-function flow</span>
          <span className="mt-1 block text-[11px] text-[var(--text-secondary)]">Function request · agent context · HTTP method · event-style response log</span>
        </button>
      </div>

      <div className="rounded-xl border p-3 text-xs text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)' }}>
        {provider === 'vapi'
          ? 'Vapi selected: Novora sends a POST tool-calls envelope and checks that your response includes the matching toolCallId and result.'
          : 'Retell selected: Novora sends a custom-function request with call context and displays the HTTP exchange as a function event log.'}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.8fr)_minmax(400px,1.2fr)]">
        <form onSubmit={saveEndpoint} className="space-y-3 rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)]">{selectedId ? 'Endpoint configuration' : 'Add endpoint'}</h4>
            {selectedEndpoint && (
              <button type="button" onClick={deleteEndpoint} disabled={isSaving} className="flex items-center gap-1 text-[10px] font-semibold text-rose-500 disabled:opacity-50">
                <Trash2 size={12} /> Remove
              </button>
            )}
          </div>
          <div className="rounded-lg border p-2 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
            {provider === 'vapi' ? 'Vapi · HTTP POST contract' : 'Retell · Custom-function HTTP contract'}
          </div>
          <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
            Display name
            <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Support ticket API" className="mt-1 w-full rounded-lg border p-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
          </label>
          <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
            Tool / function name
            <input required pattern="[A-Za-z0-9_-]+" value={toolName} onChange={(event) => setToolName(event.target.value)} placeholder="create_support_ticket" className="mt-1 w-full rounded-lg border p-2 font-mono text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
          </label>
          <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
            Your server endpoint URL
            <input required type="url" value={endpointUrl} onChange={(event) => setEndpointUrl(event.target.value)} placeholder="https://api.example.com/voice-tools/tickets" className="mt-1 w-full rounded-lg border p-2 font-mono text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
            <span className="mt-1 block text-[10px] font-normal">HTTPS is required. Local/private endpoints require explicit backend opt-in.</span>
          </label>
          {provider === 'retell' && (
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              HTTP method
              <select value={method} onChange={(event) => setMethod(event.target.value as ToolEndpointMethod)} className="mt-1 w-full rounded-lg border p-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                {METHODS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Timeout (ms)
              <input type="number" min={100} max={10000} value={timeoutMs} onChange={(event) => setTimeoutMs(Number(event.target.value))} className="mt-1 w-full rounded-lg border p-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
            </label>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Bearer token
              <input type="password" autoComplete="new-password" value={bearerToken} onChange={(event) => setBearerToken(event.target.value)} placeholder={selectedEndpoint?.has_auth ? selectedEndpoint.api_key_masked || 'Saved (leave blank to keep)' : 'Optional'} className="mt-1 w-full rounded-lg border p-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
            </label>
          </div>
          {selectedEndpoint?.has_auth && !bearerToken && <p className="text-[10px] text-emerald-600">A bearer token is saved. Leave blank to keep using it.</p>}
          <button type="submit" disabled={isSaving} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
            {isSaving ? <LoaderCircle size={13} className="animate-spin" /> : <Save size={13} />}
            {selectedId ? 'Save changes' : 'Save endpoint securely'}
          </button>
        </form>

        <div className="space-y-3">
          <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
            <h4 className="text-xs font-bold text-[var(--text-primary)]">Contract evaluation</h4>
            <p className="mt-1 text-[10px] text-[var(--text-secondary)]">
              Sends a deterministic sample tool call to your endpoint. It does not call the live phone agent or use an LLM to invent arguments.
            </p>
            {isLoading ? <p className="mt-3 text-xs text-[var(--text-muted)]">Loading saved endpoints…</p> : (
              <label className="mt-3 block text-[11px] font-semibold text-[var(--text-secondary)]">
                Saved endpoint
                <select value={selectedId} onChange={(event) => {
                  const endpoint = endpoints.find((item) => item.id === event.target.value);
                  if (endpoint) chooseEndpoint(endpoint);
                }} className="mt-1 w-full rounded-lg border p-2 text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
                  <option value="">Select a configured endpoint</option>
                  {endpoints.filter((endpoint) => endpoint.provider === provider).map((endpoint) => <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>)}
                </select>
              </label>
            )}
            {selectedEndpoint && (
              <>
                {provider === 'retell' && (
                  <label className="mt-3 block text-[11px] font-semibold text-[var(--text-secondary)]">
                    Retell agent ID for call context
                    <input value={agentId} onChange={(event) => setAgentId(event.target.value)} placeholder="agent_..." className="mt-1 w-full rounded-lg border p-2 font-mono text-xs text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                  </label>
                )}
                <label className="mt-3 block text-[11px] font-semibold text-[var(--text-secondary)]">
                  Tool arguments (JSON object)
                  <textarea rows={5} value={argumentsJson} onChange={(event) => setArgumentsJson(event.target.value)} spellCheck={false} className="mt-1 w-full rounded-lg border p-2 font-mono text-[11px] text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }} />
                </label>
                {evaluationMethod !== 'GET' && (
                  <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                    <input type="checkbox" checked={allowWrites} onChange={(event) => setAllowWrites(event.target.checked)} className="mt-0.5" />
                    <span><strong>Allow this run to write to my system.</strong> Leave unchecked to record a write-protected evaluation without contacting the endpoint.</span>
                  </label>
                )}
                <button type="button" onClick={runEvaluation} disabled={isRunning} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--primary)' }}>
                  {isRunning ? <LoaderCircle size={13} className="animate-spin" /> : <Wrench size={13} />}
                  {isRunning ? 'Calling your endpoint…' : 'Run contract evaluation'}
                </button>
              </>
            )}
          </div>

          {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400"><AlertTriangle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
          {notice && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-400">{notice}</div>}
          {result && (result.provider === 'vapi' ? <VapiResultPanel result={result} /> : <RetellResultPanel result={result} />)}
          {history.length > 1 && (
            <div className="rounded-xl border p-3" style={{ borderColor: 'var(--border-color)' }}>
              <h5 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Recent saved runs</h5>
              <div className="space-y-1.5">
                {history.slice(0, 5).map((run) => (
                  <button type="button" key={run.id} onClick={() => setResult(run)} className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] hover:bg-[var(--bg-elevated)]">
                    <span className="font-mono text-[var(--text-muted)]">{new Date(run.created_at).toLocaleString()}</span>
                    <span className={run.success && run.performance_pass ? 'text-emerald-600' : 'text-rose-500'}>{run.status_code ?? 'No response'} · {run.latency_ms ?? '—'} ms</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

function VapiResultPanel({ result }: { result: HttpToolEvaluationResult }) {
  return (
    <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">Vapi HTTP tool-call audit</h4>
        <ResultStatus result={result} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Method" value={result.method} />
        <Metric label="HTTP status" value={result.status_code?.toString() ?? 'No response'} />
        <Metric label="Round trip" value={result.latency_ms === null || result.latency_ms === undefined ? '—' : `${result.latency_ms} ms`} />
      </div>
      <p className="break-all font-mono text-[10px] text-[var(--text-muted)]">{result.endpoint_url}</p>
      {result.error && <p className="text-[11px] text-rose-500">{result.error}</p>}
      <Payload label="Exact Vapi request envelope" value={result.request_payload} />
      <Payload label="Your server's response" value={result.response_payload} />
    </div>
  );
}

function RetellResultPanel({ result }: { result: HttpToolEvaluationResult }) {
  const hasResponse = result.status_code !== null && result.status_code !== undefined;
  return (
    <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-xs font-bold text-[var(--text-primary)]">Retell custom-function event log</h4>
        <ResultStatus result={result} />
      </div>
      <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: 'var(--border-color)' }}>
        <LogEvent title="Function request prepared" text={`${result.method} ${result.endpoint_url}`} timestamp={result.created_at} />
        <LogEvent title={hasResponse ? `HTTP response received (${result.status_code})` : 'No HTTP response'} text={result.error ?? `${result.latency_ms ?? '—'} ms round trip`} timestamp={result.created_at} />
        {hasResponse && <LogEvent title="Function result captured" text="Response body saved with this run; credential-like fields are redacted." timestamp={result.created_at} />}
      </div>
      <Payload label="Retell custom-function request" value={result.request_payload} />
      <Payload label="Endpoint response body" value={result.response_payload} />
    </div>
  );
}

function ResultStatus({ result }: { result: HttpToolEvaluationResult }) {
  const passed = result.success && result.performance_pass;
  return <span className={`flex items-center gap-1 text-[10px] font-bold ${passed ? 'text-emerald-600' : 'text-rose-500'}`}>
    {passed ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
    {passed ? 'PASS' : 'FAIL'}
  </span>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
    <span className="block text-[9px] font-semibold uppercase text-[var(--text-muted)]">{label}</span>
    <span className="mt-0.5 block truncate font-mono text-[11px] font-bold text-[var(--text-primary)]">{value}</span>
  </div>;
}

function Payload({ label, value }: { label: string; value: unknown }) {
  return <div>
    <span className="mb-1 block text-[10px] font-bold text-[var(--text-secondary)]">{label}</span>
    <pre className="max-h-48 overflow-auto rounded-lg p-2 text-[10px] text-[var(--text-primary)]" style={{ backgroundColor: 'var(--bg-elevated)' }}>
      {JSON.stringify(value ?? null, null, 2)}
    </pre>
  </div>;
}

function LogEvent({ title, text, timestamp }: { title: string; text: string; timestamp: string }) {
  return <div className="relative pl-3">
    <span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-[var(--primary)]" />
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] font-bold text-[var(--text-primary)]">{title}</span>
      <span className="flex items-center gap-1 whitespace-nowrap font-mono text-[9px] text-[var(--text-muted)]"><Clock3 size={10} />{new Date(timestamp).toLocaleTimeString()}</span>
    </div>
    <p className="mt-0.5 break-all text-[10px] text-[var(--text-secondary)]">{text}</p>
  </div>;
}
