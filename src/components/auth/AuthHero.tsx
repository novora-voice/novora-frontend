'use client';

import React from 'react';
import Image from 'next/image';
import { assetPath } from '@/lib/assetPath';
import { ShieldCheck, Activity, Sparkles, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  { icon: ShieldCheck, title: 'Deterministic Evaluation', desc: 'Evidence-backed rule checks, not opaque AI verdicts' },
  { icon: Activity, title: 'Regression Monitoring', desc: 'Track policy compliance across every agent release' },
  { icon: Sparkles, title: 'Provider Agnostic', desc: 'ElevenLabs, Vapi, Retell, and AssemblyAI built-in' },
];

export const AuthHero: React.FC = () => {
  return (
    <div
      className="relative hidden lg:flex flex-col justify-between w-1/2 p-12 border-r"
      style={{
        backgroundColor: 'var(--brand-midnight)',
        borderColor: 'var(--border-color)',
      }}
    >
      <div className="relative z-10">
        <div className="relative h-10 w-36 mb-12">
          <Image src={assetPath('/novora-logo-light.png')} alt="Novora Logo" fill priority sizes="144px" className="object-contain object-left" />
        </div>

        <div className="max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>AI Voice Agent Infrastructure</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Verify voice agents with deterministic, auditable evidence.
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Continuous compliance testing, policy ceilings, and regression detection for enterprise voice AI runtimes.
          </p>

          <div className="space-y-4">
            {FEATURES.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="flex items-start gap-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 shrink-0 border border-blue-500/20">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-8 border-t border-slate-800">
        <span>© Novora Platform</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span className="text-slate-400">SOC2 Type II Ready Architecture</span>
        </div>
      </div>
    </div>
  );
};
