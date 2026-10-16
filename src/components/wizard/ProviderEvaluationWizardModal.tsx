'use client';

import React, { useEffect, useState } from 'react';
import { EvaluationReport, EvaluationScenario, VoiceProvider, RuleType } from '@/types/api';
import {
  AgentConfig,
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
  onClose: () => void;
  scenarios: EvaluationScenario[];
  onEvaluationCreated: (report: EvaluationReport) => void;
  initialScenarioId?: string;
  initialProvider?: VoiceProvider;
  isBackendConnected: boolean;
  onRequireProviderModal: () => void;
}

export const ProviderEvaluationWizardModal: React.FC<ProviderEvaluationWizardModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onEvaluationCreated,
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
  const [agentRefId, setAgentRefId] = useState('asst_vapi_default');
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
  const [progressStage, setProgressStage] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [providerManifests, setProviderManifests] = useState<ProviderManifest[]>([]);

  useEffect(() => {
    if (initialProvider) {
      setProvider(initialProvider);
      if (initialProvider === 'vapi') setAgentRefId('asst_vapi_default');
      else if (initialProvider === 'retell') setAgentRefId('agent_retell_default');
      else if (initialProvider === 'elevenlabs') setAgentRefId('ag_el_default');
      else if (initialProvider === 'assemblyai') setAgentRefId('aai_stream_default');
    }
  }, [initialProvider]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isBackendConnected) {
      novoraApi.listProviders().then(setProviderManifests).catch(() => {});
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isBackendConnected]);

  if (!isOpen) return null;

  const handleSelectScenario = (scen: EvaluationScenario | ScenarioTemplate) => {
    setSelectedScenario(scen);
    setCriteria(getInitialCriteriaForScenario(scen.rules));
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
      if (!agentRefId.trim()) {
        setStepError('Agent ID is mandatory. Please provide a valid external agent ID for your selected provider.');
        return;
      }
    }

    // Step 5 Validation: JSON Payload check
    if (step === 5 && payloadJson.trim()) {
      try {
        JSON.parse(payloadJson);
      } catch (err: unknown) {
        setStepError(`Malformed payload JSON: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
        return;
      }
    }

    setStep((s) => (s < 6 ? ((s + 1) as 1 | 2 | 3 | 4 | 5 | 6) : s));
  };

  const handleRunEvaluation = async () => {
    setIsSubmitting(true);
    setStepError(null);
    setProgressStage(1);

    const stageTimer1 = setTimeout(() => setProgressStage(2), 400);
    const stageTimer2 = setTimeout(() => setProgressStage(3), 900);
    const stageTimer3 = setTimeout(() => setProgressStage(4), 1600);
    const stageTimer4 = setTimeout(() => setProgressStage(5), 2300);
    const stageTimer5 = setTimeout(() => setProgressStage(6), 3000);
    const stageTimer6 = setTimeout(() => setProgressStage(7), 3700);

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
        try {
          parsedPayload = JSON.parse(payloadJson);
        } catch {
          // ignore
        }
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

      const res = await novoraApi.executeTestRun(req);
      if (res.evaluation_report) {
        onEvaluationCreated(res.evaluation_report);
        onClose();
      } else {
        throw new Error('Test run completed without returning an evaluation report.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 400) && err.message.toLowerCase().includes('provider')) {
        onRequireProviderModal();
      } else {
        setStepError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Evaluation run failed.');
      }
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      clearTimeout(stageTimer5);
      clearTimeout(stageTimer6);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
              AI Testing Sandbox &amp; Provider Evaluation Engine
            </span>
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
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] disabled:opacity-30"
            aria-label="Close"
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
                if (p === 'vapi') setAgentRefId('asst_vapi_default');
                else if (p === 'retell') setAgentRefId('agent_retell_default');
                else if (p === 'elevenlabs') setAgentRefId('ag_el_default');
                else if (p === 'assemblyai') setAgentRefId('aai_stream_default');
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
            />
          )}

          {step === 3 && (
            <WizardStep2Agent
              provider={provider}
              agentName={agentName}
              onAgentNameChange={setAgentName}
              agentRefId={agentRefId}
              onAgentRefIdChange={setAgentRefId}
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
              progressStage={progressStage}
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
