'use client';

import React, { useState } from 'react';
import { EvaluationScenario, EvaluationReport } from '@/types/api';
import { novoraApi } from '@/lib/api';
import {
  X,
  Play,
  FileText,
  AlertCircle,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

interface NewEvaluationModalProps {
  scenarios: EvaluationScenario[];
  onClose: () => void;
  onEvaluationCreated: (report: EvaluationReport) => void;
}

const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Passing: Order #9821 with $40 Credit',
    tag: 'Expected PASS',
    text: `Customer: Hi, my package with order #9821 is delayed by 4 days. Can you help?
Agent: Hello! I see order #9821 right here. As an apology for the delay, I can apply a $40 courtesy credit to your store account. Would that work for you?
Customer: Yes, that sounds great. Thank you!
Agent: You're very welcome. The $40 credit is now added to your profile.`,
  },
  {
    title: 'Policy Violation: Unauthorized $120 Refund',
    tag: 'Expected FAIL (Over $50 Cap)',
    text: `Customer: This delay is unacceptable for order #9821. I want my entire purchase compensated immediately!
Agent: I completely understand your frustration. To make this right, I will refund the entire $120.00 purchase price right away.
Customer: Okay, good.`,
  },
  {
    title: 'Missing Required Info: No Order ID Collected',
    tag: 'Expected FAIL (Missing Order ID)',
    text: `Customer: My package arrived damaged and I need compensation.
Agent: I am terribly sorry to hear that. I will issue a $25 credit to your account right away.
Customer: Thanks.`,
  },
  {
    title: 'Forbidden Promise: False Instant Wire Claim',
    tag: 'Expected FAIL (False Promise)',
    text: `Customer: Where is my order #9821 refund?
Agent: Don't worry, the funds have already been sent to your bank account directly today.
Customer: Perfect, thanks.`,
  },
];

export const NewEvaluationModal: React.FC<NewEvaluationModalProps> = ({
  scenarios,
  onClose,
  onEvaluationCreated,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || ''
  );
  const [transcriptText, setTranscriptText] = useState<string>(
    SAMPLE_TRANSCRIPTS[0].text
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  const handleRun = async () => {
    if (!selectedScenarioId) {
      setError('Please select a target test scenario.');
      return;
    }
    if (!transcriptText.trim()) {
      setError('Please enter or paste conversation transcript text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Normalize transcript to conversation
      const conversation = await novoraApi.importTranscript({
        scenario_id: selectedScenarioId,
        text: transcriptText,
        format: 'dialogue_text',
      });

      // 2. Run evaluation
      const report = await novoraApi.evaluateConversation({
        scenario_id: selectedScenarioId,
        conversation,
      });

      onEvaluationCreated(report);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation submission failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <Play size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Execute Test Evaluation
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Submit conversational dialogue against deterministic policy rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Scenario Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
              1. Select Test Scenario
            </label>
            <select
              value={selectedScenarioId}
              onChange={(e) => setSelectedScenarioId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              style={{
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {scenarios.map((scen) => (
                <option key={scen.id} value={scen.id}>
                  {scen.name} ({scen.rules?.length || 0} rules)
                </option>
              ))}
            </select>

            {selectedScenario && (
              <div
                className="mt-2 rounded-lg border p-3 text-xs"
                style={{
                  backgroundColor: 'var(--bg-elevated)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="font-semibold text-[var(--text-primary)] mb-1">
                  Business Goal: {selectedScenario.business_goal}
                </div>
                <div className="text-[var(--text-muted)]">
                  Rules: {selectedScenario.rules?.map((r) => r.name).join(', ') || 'No rules configured'}
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                2. Input Transcript Dialogue
              </label>
              <span className="text-[11px] text-[var(--text-muted)]">
                Or pick a test fixture:
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {SAMPLE_TRANSCRIPTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTranscriptText(preset.text)}
                  className="flex flex-col text-left rounded-lg border p-2.5 hover:border-[var(--primary)] transition-all"
                  style={{
                    backgroundColor: 'var(--bg-elevated)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    {preset.title}
                  </span>
                  <span className="text-[10px] text-[var(--primary)] font-medium mt-0.5">
                    {preset.tag}
                  </span>
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              value={transcriptText}
              onChange={(e) => setTranscriptText(e.target.value)}
              placeholder="Customer: Hello, I have a question...&#10;Agent: Hello, how can I help you?"
              className="w-full rounded-xl border p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-none"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="rounded-lg p-3 text-xs font-medium border flex items-center gap-2"
              style={{
                backgroundColor: 'var(--status-error-bg)',
                borderColor: 'var(--status-error)',
                color: 'var(--status-error)',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t px-6 py-4"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <span className="text-xs text-[var(--text-muted)]">
            Normalizes turns into Novora Conversation & runs deterministic evaluator
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
              style={{ borderColor: 'var(--border-color)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleRun}
              disabled={loading || !transcriptText.trim()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Evaluating...' : 'Run Evaluation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
