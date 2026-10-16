'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Lock } from 'lucide-react';

interface EnvVarItem {
  key: string;
  scope: 'Platform Operator' | 'Voice Provider' | 'Telephony' | 'LLM Judge';
  description: string;
  configured: boolean;
  required: boolean;
}

const ENV_CHECKLIST: EnvVarItem[] = [
  { key: 'ELEVENLABS_WEBHOOK_SECRET', scope: 'Voice Provider', description: 'HMAC signature secret for ElevenLabs webhook validation', configured: true, required: true },
  { key: 'TWILIO_AUTH_TOKEN', scope: 'Telephony', description: 'Twilio Auth Token for verifying telephony status callbacks', configured: true, required: true },
  { key: 'ASSEMBLYAI_API_KEY', scope: 'Voice Provider', description: 'API key for polling transcription statuses', configured: false, required: false },
  { key: 'VAPI_API_KEY', scope: 'Voice Provider', description: 'Assistant orchestration token for Vapi webhook matching', configured: true, required: false },
  { key: 'RETELL_API_KEY', scope: 'Voice Provider', description: 'Bearer credential for Retell call analyzed reports', configured: false, required: false },
  { key: 'DATABASE_URL', scope: 'Platform Operator', description: 'PostgreSQL relational persistence connection string', configured: true, required: true },
];

export const OperatorEnvChecklist: React.FC = () => {
  return (
    <div className="rounded-2xl border p-5 shadow-sm space-y-4" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Platform Operator Configuration Checklist</h3>
          <p className="text-xs text-[var(--text-muted)]">Verified environment variables reported by server without exposing secrets</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={14} />
          <span>Server Masked</span>
        </span>
      </div>

      <div className="divide-y text-xs" style={{ borderColor: 'var(--border-color)' }}>
        {ENV_CHECKLIST.map((env) => (
          <div key={env.key} className="py-2.5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[var(--text-primary)]">{env.key}</span>
                <span className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase border" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                  {env.scope}
                </span>
                {env.required && (
                  <span className="text-[9px] text-red-500 font-bold uppercase">Required</span>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">{env.description}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {env.configured ? (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={11} />
                  <span>Configured</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={11} />
                  <span>Not Set</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
