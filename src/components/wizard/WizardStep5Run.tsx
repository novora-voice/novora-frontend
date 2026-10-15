'use client';

import React from 'react';
import { VoiceProvider } from '@/types/api';
import { EvaluatorCriterionState } from './WizardStep4Criteria';
import { Play, AlertTriangle, ShieldCheck, CheckCircle2, Loader2, Bot } from 'lucide-react';

interface WizardStep5RunProps {
  provider: VoiceProvider;
  agentName: string;
  scenarioName: string;
  executionMode: 'sandbox' | 'live';
  criteria: EvaluatorCriterionState[];
  isSubmitting: boolean;
  liveConfirmed: boolean;
  onLiveConfirmedChange: (val: boolean) => void;
  onRunTest: () => void;
  error: string | null;
}

export const WizardStep5Run: React.FC<WizardStep5RunProps> = ({
  provider,
  agentName,
  scenarioName,
  executionMode,
  criteria,
  isSubmitting,
  liveConfirmed,
  onLiveConfirmedChange,
  onRunTest,
  error,
}) => {
  const activeCount = criteria.filter((c) => c.enabled).length;

  return (
    <div className="space-y-4 text-xs">
      <div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">Step 5 — Review & Launch Evaluation</h3>
        <p className="text-xs text-[var(--text-secondary)]">Verify test configuration before initiating evaluation execution</p>
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
        <div className="grid grid-cols-2 gap-3 pb-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Provider</span>
            <span className="text-xs font-bold text-[var(--text-primary)] capitalize">{provider}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Agent Target</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{agentName || 'Default Agent'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Selected Scenario</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{scenarioName}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Active Checks</span>
            <span className="text-xs font-bold text-[var(--text-primary)]">{activeCount} Rules Enabled</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block mb-1">Execution Mode</span>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${executionMode === 'live' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="font-semibold text-[var(--text-primary)] capitalize">{executionMode} Environment</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {executionMode === 'live' ? 'Calls real outbound carrier / phone numbers' : 'Simulated execution test session'}
            </span>
          </div>
        </div>
      </div>

      {executionMode === 'live' && (
        <div className="rounded-xl border p-3 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle size={15} />
            <span>Explicit Confirmation Required for Live Calling</span>
          </div>
          <p className="text-[11px]">
            Live test mode connects to real telephony carriers and provider minutes. Confirm you have authority to run this test.
          </p>
          <label className="flex items-center gap-2 pt-1 cursor-pointer font-semibold">
            <input
              type="checkbox"
              checked={liveConfirmed}
              onChange={(e) => onLiveConfirmedChange(e.target.checked)}
              className="rounded text-amber-600 focus:ring-0"
            />
            <span>I authorize Novora to initiate this live test evaluation</span>
          </label>
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
              <span>Evaluating Against Novora Engine...</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>Execute Evaluation Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
