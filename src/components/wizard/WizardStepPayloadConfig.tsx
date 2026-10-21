'use client';

import React, { useState, useEffect, useRef } from 'react';
import { VoiceProvider } from '@/types/api';
import {
  PayloadPipelineResult,
  PayloadTemplate,
  PayloadJudgeVerdict,
} from '@/types/execution';
import { novoraApi } from '@/lib/api';
import {
  Sparkles,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface WizardStepPayloadConfigProps {
  provider: VoiceProvider;
  agentId: string;
  scenarioName: string;
  scenarioGoal?: string;
  userInstructions: string;
  payloadJson: string;
  onPayloadJsonChange: (val: string) => void;
  isValidated: boolean;
  onValidationStatusChange: (valid: boolean) => void;
  pipelineResult: PayloadPipelineResult | null;
  onPipelineResultChange: (res: PayloadPipelineResult | null) => void;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProviderPayload(value: string): Record<string, unknown> | undefined {
  if (!value.trim()) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (err: unknown) {
    throw new Error(`Invalid JSON syntax: ${err instanceof Error ? err.message : 'Malformed syntax'}`);
  }

  if (!isJsonObject(parsed)) {
    throw new Error('Provider payload must be a JSON object.');
  }
  return parsed;
}

export const WizardStepPayloadConfig: React.FC<WizardStepPayloadConfigProps> = ({
  provider,
  agentId,
  userInstructions,
  payloadJson,
  onPayloadJsonChange,
  isValidated,
  onValidationStatusChange,
  pipelineResult,
  onPipelineResultChange,
}) => {
  const [mode, setMode] = useState<'template' | 'custom'>('template');
  const [templates, setTemplates] = useState<PayloadTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [judgeVerdict, setJudgeVerdict] = useState<PayloadJudgeVerdict | null>(null);
  const [validatedPayload, setValidatedPayload] = useState<Record<string, unknown> | null>(null);
  const payloadJsonRef = useRef(payloadJson);

  useEffect(() => {
    payloadJsonRef.current = payloadJson;
  }, [payloadJson]);

  // Load templates on provider change
  useEffect(() => {
    novoraApi
      .getPayloadTemplates(provider)
      .then((tmpl) => {
        setTemplates(tmpl);
        if (tmpl.length > 0 && !payloadJsonRef.current.trim()) {
          setSelectedTemplateId(tmpl[0].id);
          onPayloadJsonChange(JSON.stringify(tmpl[0].payload, null, 2));
          onValidationStatusChange(true);
        }
      })
      .catch(() => {});
  }, [provider, onPayloadJsonChange, onValidationStatusChange]);

  // Handle template selection
  const handleSelectTemplate = (tmpl: PayloadTemplate) => {
    setSelectedTemplateId(tmpl.id);
    const updated = { ...tmpl.payload };
    if (provider === 'vapi') {
      if (agentId.trim()) updated.assistantId = agentId.trim();
      else delete updated.assistantId;
    } else if (provider === 'retell') {
      if (agentId.trim()) updated.agent_id = agentId.trim();
      else delete updated.agent_id;
    }
    onPayloadJsonChange(JSON.stringify(updated, null, 2));
    onValidationStatusChange(true);
    setValidatedPayload(null);
    setJudgeVerdict(null);
    onPipelineResultChange(null);
    setJsonError(null);
  };

  // Run AI-assisted generation and LLM judge pipeline
  const handleAiGenerateAndValidate = async () => {
    if (!agentId.trim()) {
      setJsonError('Agent ID is required before generating payload.');
      return;
    }

    setIsGenerating(true);
    setJsonError(null);
    setValidatedPayload(null);
    setJudgeVerdict(null);
    onValidationStatusChange(false);

    let parsedCustom: Record<string, unknown> | undefined;
    try {
      parsedCustom = parseProviderPayload(payloadJson);
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid provider JSON.');
      onValidationStatusChange(false);
      return;
    }

    try {
      const res = await novoraApi.generatePayload({
        provider,
        agent_id: agentId.trim(),
        user_instructions: userInstructions.trim() || undefined,
        custom_json: parsedCustom,
      });

      onPipelineResultChange(res);
      setValidatedPayload(res.final_payload);
      if (res.final_payload && Object.keys(res.final_payload).length > 0) {
        onPayloadJsonChange(JSON.stringify(res.final_payload, null, 2));
      }

      if (res.status === 'pass' || res.status === 'revised') {
        onValidationStatusChange(true);
        setJudgeVerdict(res.judge_verdict || null);
      } else {
        onValidationStatusChange(false);
        setJsonError(res.error_message || 'Payload rejected by LLM judge.');
      }
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'AI generation pipeline failed.');
      onValidationStatusChange(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Validate custom JSON
  const handleValidateCustomJson = async () => {
    setJsonError(null);
    setJudgeVerdict(null);
    onValidationStatusChange(false);
    if (!agentId.trim()) {
      setValidatedPayload(null);
      setJsonError('Agent ID is required before validating a provider payload.');
      return;
    }

    let parsed: Record<string, unknown> | undefined;
    try {
      parsed = parseProviderPayload(payloadJson);
    } catch (err: unknown) {
      setValidatedPayload(null);
      setJsonError(err instanceof Error ? err.message : 'Invalid provider JSON.');
      return;
    }
    if (!parsed) {
      setValidatedPayload(null);
      setJsonError('Enter a provider JSON object before validating.');
      return;
    }

    setValidatedPayload(parsed);
    setIsValidating(true);
    try {
      const verdict = await novoraApi.validatePayload({
        provider,
        agent_id: agentId.trim(),
        payload: parsed,
        user_instructions: userInstructions,
      });
      setJudgeVerdict(verdict);
      if (verdict.decision === 'pass') {
        onValidationStatusChange(true);
      } else {
        onValidationStatusChange(false);
        setJsonError(`Judge Verdict [${verdict.decision.toUpperCase()}]: ${verdict.feedback}`);
      }
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Validation request failed.');
      onValidationStatusChange(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 5 — Configure Payload &amp; AI Validation</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Select an authorized template or provide custom JSON. Two-stage AI generation and LLM-as-a-judge validation ensures schema adherence.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
        <button
          type="button"
          onClick={() => setMode('template')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
            mode === 'template'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          <Layers size={13} />
          <span>Option A: Use Provider Template</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('custom')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-bold transition-all ${
            mode === 'custom'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
          }`}
        >
          <Code2 size={13} />
          <span>Option B: Custom JSON &amp; AI Pipeline</span>
        </button>
      </div>

      {/* Mode A: Template Selector */}
      {mode === 'template' && (
        <div className="space-y-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Available {provider.toUpperCase()} Templates ({templates.length})
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {templates.map((tmpl) => {
              const isSelected = selectedTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    isSelected
                      ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 bg-[var(--primary-subtle)]'
                      : 'hover:border-[var(--border-color)]'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--bg-elevated)',
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                  }}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="font-bold text-[var(--text-primary)]">{tmpl.name}</span>
                    {isSelected && <CheckCircle2 size={14} className="text-[var(--primary)] shrink-0" />}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">{tmpl.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI-Assisted Generation & Validation Action Bar */}
      <div className="rounded-xl border p-3 space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[var(--primary)]" />
              <span>Two-Stage AI Generation &amp; LLM-as-a-Judge Validation</span>
            </span>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
              Uses DeepSeek &amp; Llama 3.3 8B Instruct to generate and validate exact provider payload.
            </p>
          </div>

          <button
            type="button"
            disabled={isGenerating || isValidating}
            onClick={handleAiGenerateAndValidate}
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 font-bold text-white text-xs shadow-sm transition-all disabled:opacity-50 shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Generating &amp; Judging...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Generate &amp; Validate with AI</span>
              </>
            )}
          </button>
        </div>

        {pipelineResult && (
          <div className="pt-2 border-t space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
                {pipelineResult.status === 'pass' || pipelineResult.status === 'revised' ? (
                  <CheckCircle2 size={13} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={13} className="text-red-500" />
                )}
                <span>
                  Pipeline Status: <strong className="capitalize">{pipelineResult.status}</strong>
                </span>
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Revision Cycles: {pipelineResult.revision_count}/3
              </span>
            </div>

            {pipelineResult.judge_verdict && (
              <p className="text-[11px] text-[var(--text-secondary)]">
                <strong>LLM Judge ({pipelineResult.judge_verdict.model_used}):</strong> {pipelineResult.judge_verdict.feedback}
              </p>
            )}
          </div>
        )}
      </div>

      {/* JSON Editor and Live Validation Status */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
            <Code2 size={13} />
            <span>Target Provider Payload (JSON)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isValidating}
              onClick={handleValidateCustomJson}
              className="text-[11px] font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
            >
              {isValidating ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
              <span>Validate JSON</span>
            </button>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                isValidated
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {isValidated ? '✓ Validated' : 'Unvalidated'}
            </span>
          </div>
        </div>

        <textarea
          rows={8}
          value={payloadJson}
          onChange={(e) => {
            onPayloadJsonChange(e.target.value);
            onValidationStatusChange(false);
            setValidatedPayload(null);
            setJudgeVerdict(null);
            setJsonError(null);
          }}
          className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
        />
      </div>

      {validatedPayload && (
        <div
          className="rounded-xl border p-3 space-y-2"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <strong className="text-[11px] text-[var(--text-primary)]">
              {provider.toUpperCase()} JSON submitted for validation
            </strong>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Agent ID: {agentId || 'not set'}
            </span>
          </div>
          <pre className="max-h-56 overflow-auto rounded-lg border p-2 text-[11px] font-mono text-[var(--text-primary)] whitespace-pre-wrap break-words"
            style={{ borderColor: 'var(--border-color)' }}
          >
            {JSON.stringify(validatedPayload, null, 2)}
          </pre>
          <p className="text-[10px] text-[var(--text-muted)]">
            The evaluation test targets the provider agent ID above; this exact JSON is attached to the test request.
          </p>
          {judgeVerdict && (
            <p className="text-[11px] text-[var(--text-secondary)]">
              Provider payload validation: <strong className="capitalize">{judgeVerdict.decision}</strong>
              {' — '}{judgeVerdict.feedback}
            </p>
          )}
        </div>
      )}

      {jsonError && (
        <div className="rounded-xl border p-3 bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-start gap-2">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong>Validation Issue:</strong> {jsonError}
          </div>
        </div>
      )}
    </div>
  );
};
