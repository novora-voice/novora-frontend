'use client';

import React from 'react';
import { VoiceProvider } from '@/types/api';
import { EvaluatorCriterionState } from './WizardStep4Criteria';
import { Play, AlertTriangle, Loader2 } from 'lucide-react';

interface WizardStep5RunProps {
  provider: VoiceProvider;
  agentName: string;
  scenarioName: string;
  executionMode: 'sandbox' | 'live';
  criteria: EvaluatorCriterionState[];
  isSubmitting: boolean;
  jobStatus?: string | null;
  jobAttempt?: number;
  liveConfirmed: boolean;
  onLiveConfirmedChange: (val: boolean) => void;
  onRunTest: () => void;
  error: string | null;
  agentId?: string;
  userInstructions?: string;
}

export const WizardStep5Run: React.FC<WizardStep5RunProps> = ({
  provider,
  agentName,
  scenarioName,
  executionMode,
  criteria,
  isSubmitting,
  jobStatus,
  jobAttempt = 0,
  liveConfirmed,
  onLiveConfirmedChange,
  onRunTest,
  error,
  agentId,
  userInstructions,
}) => {
  const deterministicCount = criteria.filter((c) => c.type === 'deterministic' && c.enabled).length;
  const judgeCount = criteria.filter((c) => c.type === 'llm_judge' && c.enabled).length;

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 6 — Review Configuration &amp; Launch Evaluation</h3>
        <p className="text-xs text-[var(--text-secondary)]">Verify test parameters, deterministic checks, and LLM rubrics before execution</p>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
        <div className="grid grid-cols-2 gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Provider Platform</span>
            <span className="text-xs font-bold text-[var(--text-primary)] capitalize">{provider}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Agent Target &amp; ID</span>
            <span className="text-xs font-bold text-[var(--text-primary)] font-mono">{agentId || agentName || 'Default Target'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Evaluation Scenario</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{scenarioName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Dual-Layer Checks</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {deterministicCount} Deterministic • {judgeCount} LLM Rubrics
            </span>
          </div>
        </div>

        {userInstructions && (
          <div className="pb-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-0.5">Plain-English Test Instructions</span>
            <p className="text-[11px] text-[var(--text-secondary)] italic font-serif">&quot;{userInstructions}&quot;</p>
          </div>
        )}

        <div>
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1">Execution Mode</span>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${executionMode === 'live' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="font-semibold text-[var(--text-primary)] capitalize">{executionMode} Environment</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {executionMode === 'live' ? 'Contacts real telephony carrier / minutes' : 'Programmatic ghost caller testing session'}
            </span>
          </div>
        </div>
      </div>

      {executionMode === 'live' && (
        <div className="rounded-xl border p-3 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle size={15} />
            <span>Explicit Confirmation Required for Live Telephony Execution</span>
          </div>
          <p className="text-[11px]">
            Live test mode connects to real telephony lines and provider minutes. Explicit user authorization is required before placing outbound calls.
          </p>
          <label className="flex items-center gap-2 pt-1 cursor-pointer font-semibold">
            <input
              type="checkbox"
              checked={liveConfirmed}
              onChange={(e) => onLiveConfirmedChange(e.target.checked)}
              className="rounded text-amber-600 focus:ring-0"
            />
            <span>I authorize Novora to initiate this live test evaluation against configured provider</span>
          </label>
        </div>
      )}

      {isSubmitting && (
        <div className="rounded-xl border p-3.5 space-y-2.5 bg-[var(--primary-subtle)] border-[var(--primary)]/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--primary)]">
            <span className="flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" />
              <span>
                {jobStatus === 'retrying'
                  ? 'Evaluation retry scheduled'
                  : jobStatus === 'queued'
                  ? 'Evaluation queued'
                  : 'Evaluation running'}
              </span>
            </span>
            {jobAttempt > 0 && <span>Attempt {jobAttempt} / 11</span>}
          </div>
          <p className="text-[10px] text-[var(--text-secondary)]">You can close this window; the evaluation will keep running in the background and its report will open when it finishes.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border p-3 text-xs bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle size={15} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={onRunTest}
          disabled={isSubmitting || (executionMode === 'live' && !liveConfirmed)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>{jobStatus === 'retrying' ? 'Retrying Evaluation...' : 'Evaluation in Progress...'}</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>{jobStatus === 'failed' ? 'Retry Evaluation' : 'Launch Evaluation Run'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
