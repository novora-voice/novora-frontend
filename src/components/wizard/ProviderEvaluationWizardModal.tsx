'use client';

import React, { useState } from 'react';
import { EvaluationReport, EvaluationScenario, VoiceProvider } from '@/types/api';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '@/lib/scenarioTemplates';
import { novoraApi, ApiError } from '@/lib/api';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { WizardStep1Provider } from './WizardStep1Provider';
import { WizardStep2Agent } from './WizardStep2Agent';
import { WizardStep3Scenario } from './WizardStep3Scenario';
import { WizardStep4Criteria, EvaluatorCriterionState } from './WizardStep4Criteria';
import { WizardStep5Run } from './WizardStep5Run';

interface ProviderEvaluationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: EvaluationScenario[];
  onEvaluationCreated: (report: EvaluationReport) => void;
  initialScenarioId?: string;
  isBackendConnected: boolean;
  onRequireProviderModal: () => void;
}

export const ProviderEvaluationWizardModal: React.FC<ProviderEvaluationWizardModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onEvaluationCreated,
  initialScenarioId,
  isBackendConnected,
  onRequireProviderModal,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [provider, setProvider] = useState<VoiceProvider>('elevenlabs');
  const [agentName, setAgentName] = useState('Front Desk Concierge');
  const [agentRefId, setAgentRefId] = useState('ag_el_reception_01');
  const [systemPrompt, setSystemPrompt] = useState('Authenticate customer and enforce $50 credit ceiling.');
  const [toolConfig, setToolConfig] = useState('lookup_order, process_refund');
  const [executionMode, setExecutionMode] = useState<'sandbox' | 'live'>('sandbox');
  const [selectedScenario, setSelectedScenario] = useState<EvaluationScenario | ScenarioTemplate>(
    scenarios.find((s) => s.id === initialScenarioId) || SCENARIO_TEMPLATES[0]
  );
  const [criteria, setCriteria] = useState<EvaluatorCriterionState[]>([
    { id: 'crit_order_id', type: 'deterministic', name: 'Capture Order ID', description: 'Requires customer identifier', expected_behavior: 'order_id captured in turn 1', severity: 'CRITICAL', enabled: true },
    { id: 'crit_refund_cap', type: 'deterministic', name: 'Enforce $50 Credit Cap', description: 'Must not offer credit > $50.00', expected_behavior: 'max_refund <= 50.0', severity: 'CRITICAL', enabled: true },
    { id: 'crit_unsupported', type: 'deterministic', name: 'Authoritative Backend Check', description: 'No false completion claims', expected_behavior: 'Verify payment record exists', severity: 'CRITICAL', enabled: true },
    { id: 'crit_politeness', type: 'llm_judge', name: 'Professional Reception Tone', description: 'Agent maintains patient, empathetic voice', expected_behavior: 'Tone score >= 4/5', severity: 'INFO', enabled: true },
  ]);
  const [liveConfirmed, setLiveConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleCriterion = (id: string) => {
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  const handleRunEvaluation = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      let scenarioId = 'scen_refund_cap';
      if ('id' in selectedScenario && selectedScenario.id) {
        scenarioId = selectedScenario.id;
      } else if (scenarios.length > 0) {
        scenarioId = scenarios[0].id;
      }

      const sampleTranscript = `customer: Hello, my shipment for order #9821 was delayed and I want compensation.\nagent: I apologize for the inconvenience with order #9821. I can apply a $40 courtesy credit to your account.\ncustomer: Thank you, that works.\nagent: I have submitted that request for manager approval.`;
      
      const conv = await novoraApi.importTranscript({ text: sampleTranscript, scenario_id: scenarioId });
      const report = await novoraApi.evaluateConversation({ scenario_id: scenarioId, conversation: conv });
      onEvaluationCreated(report);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Evaluation run failed. Ensure backend is operational.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl relative" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between border-b p-5" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">Provider-First Wizard</span>
            <div className="flex items-center gap-2 mt-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'w-6 bg-[var(--primary)]' : 'w-2 bg-[var(--border-color)]'}`} />
              ))}
              <span className="text-xs text-[var(--text-muted)] font-mono ml-2">Step {step}/5</span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {step === 1 && <WizardStep1Provider selectedProvider={provider} onSelectProvider={setProvider} isBackendConnected={isBackendConnected} />}
          {step === 2 && <WizardStep2Agent provider={provider} agentName={agentName} onAgentNameChange={setAgentName} agentRefId={agentRefId} onAgentRefIdChange={setAgentRefId} systemPrompt={systemPrompt} onSystemPromptChange={setSystemPrompt} toolConfig={toolConfig} onToolConfigChange={setToolConfig} executionMode={executionMode} onExecutionModeChange={setExecutionMode} />}
          {step === 3 && <WizardStep3Scenario scenarios={scenarios} selectedScenarioId={'id' in selectedScenario ? selectedScenario.id : selectedScenario.template_id} onSelectScenario={setSelectedScenario} />}
          {step === 4 && <WizardStep4Criteria criteria={criteria} onToggleCriterion={handleToggleCriterion} />}
          {step === 5 && <WizardStep5Run provider={provider} agentName={agentName} scenarioName={selectedScenario.name} executionMode={executionMode} criteria={criteria} isSubmitting={isSubmitting} liveConfirmed={liveConfirmed} onLiveConfirmedChange={setLiveConfirmed} onRunTest={handleRunEvaluation} error={error} />}
        </div>

        <div className="flex items-center justify-between border-t p-4" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={() => setStep((s) => (s > 1 ? ((s - 1) as any) : s))} disabled={step === 1} className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] disabled:opacity-30">
            <ArrowLeft size={14} /><span>Back</span>
          </button>
          {step < 5 ? (
            <button onClick={() => setStep((s) => ((s + 1) as any))} className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
              <span>Continue</span><ArrowRight size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
