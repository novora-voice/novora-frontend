'use client';

import React, { useEffect, useState } from 'react';
import { EvaluationReport, EvaluationScenario, VoiceProvider, RuleType } from '@/types/api';
import {
  AgentConfig,
  EvaluationJobResponse,
  TestRunExecutionRequest,
  ProviderManifest,
  PayloadPipelineResult,
} from '@/types/execution';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '@/lib/scenarioTemplates';
import { novoraApi, ApiError } from '@/lib/api';
import { X, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';
import { WizardStep1Provider } from './WizardStep1Provider';
import { WizardStep2Agent } from './WizardStep2Agent';
import { WizardStep3Scenario } from './WizardStep3Scenario';
import { WizardStep4Criteria, EvaluatorCriterionState, getInitialCriteriaForScenario } from './WizardStep4Criteria';
import { WizardStepPayloadConfig } from './WizardStepPayloadConfig';
import { WizardStep5Run } from './WizardStep5Run';

interface ProviderEvaluationWizardModalProps {
  isOpen: boolean;
  onClose: (backgroundRun?: boolean) => void;
  scenarios: EvaluationScenario[];
  onEvaluationCreated: (report: EvaluationReport) => void;
  onScenarioCreated?: (scenario: EvaluationScenario) => void;
  initialScenarioId?: string;
  initialProvider?: VoiceProvider;
  isBackendConnected: boolean;
  onRequireProviderModal: () => void;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export const ProviderEvaluationWizardModal: React.FC<ProviderEvaluationWizardModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onEvaluationCreated,
  onScenarioCreated,
  initialScenarioId,
  initialProvider,
  isBackendConnected,
  onRequireProviderModal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [provider, setProvider] = useState<VoiceProvider>(initialProvider || 'vapi');
  const [selectedScenario, setSelectedScenario] = useState<EvaluationScenario | ScenarioTemplate>(() => {
    return scenarios.find((s) => s.id === initialScenarioId) || SCENARIO_TEMPLATES[0];
  });
  const [agentName, setAgentName] = useState('Front Desk Voice Assistant');
  const [agentRefId, setAgentRefId] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('Authenticate customer and enforce $50 credit ceiling.');
  const [toolConfig, setToolConfig] = useState('lookup_order, process_refund');
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'live'>('sandbox');
  const [userInstructions, setUserInstructions] = useState('');

  // Criteria state
  const [criteria, setCriteria] = useState<EvaluatorCriterionState[]>(() => {
    const initial = scenarios.find((s) => s.id === initialScenarioId) || SCENARIO_TEMPLATES[0];
    return getInitialCriteriaForScenario(initial.rules);
  });

  // Payload config state
  const [payloadJson, setPayloadJson] = useState('');
  const [isPayloadValidated, setIsPayloadValidated] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PayloadPipelineResult | null>(null);

  // Execution states
  const [liveConfirmed, setLiveConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobStatus, setJobStatus] = useState<EvaluationJobResponse['status'] | null>(null);
  const [jobAttempt, setJobAttempt] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [providerManifests, setProviderManifests] = useState<ProviderManifest[]>([]);
  const [missingRequirements, setMissingRequirements] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(isSubmitting);
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isBackendConnected) {
      novoraApi.listProviders().then(setProviderManifests).catch(() => {});
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isBackendConnected, isSubmitting]);

  if (!isOpen) return null;

  const handleSelectScenario = (scen: EvaluationScenario | ScenarioTemplate) => {
    setSelectedScenario(scen);
    setCriteria(getInitialCriteriaForScenario(scen.rules));
  };

  const getMissingRequirements = () => {
    const missing: string[] = [];
    if (!agentName.trim()) missing.push('Agent name');
    if (!agentRefId.trim()) missing.push('Agent ID');
    if (!selectedScenario || !selectedScenario.name.trim()) missing.push('Evaluation scenario');
    if (!userInstructions.trim()) missing.push('Test instructions');
    if (!criteria.some((criterion) => criterion.enabled)) missing.push('At least one enabled evaluation criterion');
    if (executionMode === 'live' && !liveConfirmed) missing.push('Live execution authorization');
    return missing;
  };

  const handleNextStep = () => {
    setStepError(null);

    // Step 2 Validation: Scenario presence
    if (step === 2) {
      if (!selectedScenario || (!('id' in selectedScenario) && !('template_id' in selectedScenario))) {
        setStepError('Please select or create an evaluation scenario to continue.');
        return;
      }
    }

    // Step 3 Validation: Mandatory Agent ID
    if (step === 3) {
      const missing = [
        ...(!agentName.trim() ? ['Agent name'] : []),
        ...(!agentRefId.trim() ? ['Agent ID'] : []),
        ...(!userInstructions.trim() ? ['Test instructions'] : []),
      ];
      if (missing.length) {
        setMissingRequirements(missing);
        return;
      }
    }

    // Step 5 Validation: JSON Payload check
    if (step === 5 && payloadJson.trim()) {
      try {
        const parsedPayload: unknown = JSON.parse(payloadJson);
        if (!isJsonObject(parsedPayload)) {
          setStepError('Provider payload must be a JSON object.');
          return;
        }
      } catch (err: unknown) {
        setStepError(`Malformed payload JSON: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
        return;
      }
      if (!isPayloadValidated) {
        setStepError('Validate the provider JSON before continuing to the test.');
        return;
      }
    }

    setStep((s) => (s < 6 ? ((s + 1) as 1 | 2 | 3 | 4 | 5 | 6) : s));
  };

  const handleRunEvaluation = async () => {
    const missing = getMissingRequirements();
    if (missing.length) {
      setMissingRequirements(missing);
      return;
    }
    setMissingRequirements([]);
    setIsSubmitting(true);
    setStepError(null);
    setJobStatus('queued');
    setJobAttempt(0);

    try {
      const activeDeterministic = criteria.filter((c) => c.type === 'deterministic' && c.enabled);
      const activeJudge = criteria.filter((c) => c.type === 'llm_judge' && c.enabled);

      const scenarioId = ('id' in selectedScenario && selectedScenario.id) ? selectedScenario.id : `scen_${Date.now()}`;

      const scenarioPayload: EvaluationScenario = {
        id: scenarioId,
        name: selectedScenario.name,
        business_goal: selectedScenario.business_goal,
        success_criteria: ('success_criteria' in selectedScenario && selectedScenario.success_criteria) || activeDeterministic.map((r) => r.name),
        rules: activeDeterministic.map((r) => ({
          rule_type: (r.rule_type || (r.id.includes('unsupported') ? 'unsupported_completion' : r.id.includes('cap') ? 'policy_compliance' : r.id.includes('tool') ? 'expected_tool_call' : 'required_information')) as RuleType,
          name: r.name,
          description: r.description,
          parameters: {
            ...(r.parameters || {}),
            condition: r.expected_behavior,
            expected_behavior: r.expected_behavior,
            severity: r.severity,
            failure_message: r.failure_message,
          },
        })),
        created_at: new Date().toISOString(),
      };

      const agentConfig: AgentConfig = {
        provider_name: provider,
        external_agent_id: agentRefId.trim(),
        name: agentName.trim() || `${provider} Agent`,
        system_prompt: systemPrompt || undefined,
        permitted_tools: toolConfig ? toolConfig.split(',').map((t) => t.trim()).filter(Boolean) : [],
        metadata: { execution_mode: executionMode },
      };

      let parsedPayload: Record<string, unknown> | undefined;
      if (payloadJson.trim()) {
        const parsed: unknown = JSON.parse(payloadJson);
        if (!isJsonObject(parsed)) {
          throw new Error('Provider payload must be a JSON object.');
        }
        parsedPayload = parsed;
      }

      const req: TestRunExecutionRequest = {
        scenario: scenarioPayload,
        agent: agentConfig,
        provider_config: {
          execution_mode: executionMode,
          safe_mode: executionMode === 'sandbox',
          custom_payload: parsedPayload,
        },
        enable_llm_judge: activeJudge.length > 0,
        user_instructions: userInstructions.trim() || undefined,
      };

      const queued = await novoraApi.enqueueTestRun(req);
      setJobStatus(queued.status);
      setJobAttempt(queued.attempt);
      const queuedAt = Date.now();

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        let job: EvaluationJobResponse;
        try {
          job = await novoraApi.getEvaluationJob(queued.job_id);
        } catch (pollError: unknown) {
          setStepError(
            `Could not check evaluation progress: ${pollError instanceof Error ? pollError.message : 'Connection lost'}. Retrying status check...`
          );
          continue;
        }

        setJobStatus(job.status);
        setJobAttempt(job.attempt);
        if (job.status === 'completed') {
          if (!job.evaluation_report) {
            throw new Error('Evaluation job completed without returning an evaluation report.');
          }
          onEvaluationCreated(job.evaluation_report);
          onClose();
          return;
        }
        if (job.status === 'failed') {
          if (job.evaluation_report) {
            onEvaluationCreated(job.evaluation_report);
            onClose();
            return;
          }
          setStepError(job.error || 'Evaluation failed after all automatic retries.');
          return;
        }
        if (job.status === 'retrying') {
          setStepError(job.error ? `Evaluation failed and will retry: ${job.error}` : 'Evaluation failed and will retry.');
        } else if (job.status === 'queued' && Date.now() - queuedAt >= 30_000) {
          setStepError(`Evaluation ${queued.job_id} is still queued after 30 seconds. The backend has accepted it, but its Redis worker has not started it yet. Check the backend worker and Redis logs; this page will keep checking for the result.`);
        } else {
          setStepError(null);
        }
      }
    } catch (err: unknown) {
      setJobStatus('failed');
      if (err instanceof ApiError && (err.status === 404 || err.status === 400) && err.message.toLowerCase().includes('provider')) {
        onRequireProviderModal();
      } else {
        setStepError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Evaluation run failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose(isSubmitting);
      }}
    >
      {missingRequirements.length > 0 && (
        <div className="fixed inset-x-0 top-4 z-[70] flex justify-center px-4" role="alertdialog" aria-modal="true" aria-labelledby="missing-requirements-title">
          <div className="w-full max-w-lg rounded-2xl border border-amber-500/40 bg-[var(--bg-surface)] p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="min-w-0 flex-1">
                <h2 id="missing-requirements-title" className="text-sm font-bold text-[var(--text-primary)]">Complete these requirements to run the evaluation</h2>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--text-secondary)]">
                  {missingRequirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <button type="button" onClick={() => setMissingRequirements([])} className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Dismiss">
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                AI Testing Sandbox &amp; Provider Evaluation Engine
              </span>
              <h2 className="mt-0.5 max-w-xl truncate text-sm font-bold text-[var(--text-primary)]" title={selectedScenario.name}>
                {selectedScenario.name}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    step >= s ? 'w-5 bg-[var(--primary)]' : 'w-2 bg-[var(--border-color)]'
                  }`}
                />
              ))}
              <span className="text-xs text-[var(--text-muted)] font-mono ml-2">Step {step}/6</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose(isSubmitting)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
            aria-label={isSubmitting ? 'Close; evaluation will continue in the background' : 'Close'}
            title={isSubmitting ? 'Close; evaluation will continue in the background' : 'Close'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {stepError && (
            <div className="rounded-xl border p-3 mb-4 bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2 text-xs">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          {step === 1 && (
            <WizardStep1Provider
              selectedProvider={provider}
              onSelectProvider={(p) => {
                setProvider(p);
                setAgentRefId('');
                setPayloadJson('');
                setIsPayloadValidated(false);
                setPipelineResult(null);
              }}
              isBackendConnected={isBackendConnected}
              providerManifests={providerManifests}
            />
          )}

          {step === 2 && (
            <WizardStep3Scenario
              scenarios={scenarios}
              selectedScenarioId={'id' in selectedScenario ? selectedScenario.id : selectedScenario.template_id}
              onSelectScenario={handleSelectScenario}
              onScenarioCreated={onScenarioCreated}
            />
          )}

          {step === 3 && (
            <WizardStep2Agent
              provider={provider}
              agentName={agentName}
              onAgentNameChange={setAgentName}
              agentRefId={agentRefId}
              onAgentRefIdChange={(value) => {
                setAgentRefId(value);
                setIsPayloadValidated(false);
                setPipelineResult(null);
              }}
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              toolConfig={toolConfig}
              onToolConfigChange={setToolConfig}
              executionMode={executionMode}
              onExecutionModeChange={setExecutionMode}
              userInstructions={userInstructions}
              onUserInstructionsChange={setUserInstructions}
            />
          )}

          {step === 4 && (
            <WizardStep4Criteria
              criteria={criteria}
              onToggleCriterion={(id) =>
                setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)))
              }
              onAddCriterion={(crit) => setCriteria((prev) => [crit, ...prev])}
              onRemoveCriterion={(id) => setCriteria((prev) => prev.filter((c) => c.id !== id))}
              onUpdateCriterion={(upd) =>
                setCriteria((prev) => prev.map((c) => (c.id === upd.id ? upd : c)))
              }
            />
          )}

          {step === 5 && (
            <WizardStepPayloadConfig
              provider={provider}
              agentId={agentRefId}
              scenarioName={selectedScenario.name}
              scenarioGoal={selectedScenario.business_goal}
              userInstructions={userInstructions}
              payloadJson={payloadJson}
              onPayloadJsonChange={setPayloadJson}
              isValidated={isPayloadValidated}
              onValidationStatusChange={setIsPayloadValidated}
              pipelineResult={pipelineResult}
              onPipelineResultChange={setPipelineResult}
            />
          )}

          {step === 6 && (
            <WizardStep5Run
              provider={provider}
              agentName={agentName}
              agentId={agentRefId}
              scenarioName={selectedScenario.name}
              executionMode={executionMode}
              criteria={criteria}
              userInstructions={userInstructions}
              isSubmitting={isSubmitting}
              jobStatus={jobStatus}
              jobAttempt={jobAttempt}
              liveConfirmed={liveConfirmed}
              onLiveConfirmedChange={setLiveConfirmed}
              onRunTest={handleRunEvaluation}
              error={stepError}
            />
          )}
        </div>

        {/* Modal Navigation Footer */}
        <div className="flex items-center justify-between border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
          <button
            type="button"
            onClick={() => {
              setStepError(null);
              setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5 | 6) : s));
            }}
            disabled={step === 1 || isSubmitting}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] disabled:opacity-30"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span>Continue</span>
              <ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
