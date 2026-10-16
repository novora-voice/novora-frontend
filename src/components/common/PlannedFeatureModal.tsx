'use client';

import React from 'react';
import { X, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export type PlannedFeatureType = 'voxia' | 'langgraph' | 'rbac';

interface PlannedFeatureModalProps {
  feature: PlannedFeatureType | null;
  onClose: () => void;
}

const FEATURE_DETAILS: Record<
  PlannedFeatureType,
  {
    title: string;
    badge: string;
    icon: React.ElementType;
    description: string;
    details: string[];
    timeline: string;
  }
> = {
  voxia: {
    title: 'Voxia Managed Runtime',
    badge: 'Coming in Phase 2',
    icon: Sparkles,
    description:
      'The managed Voxia runtime is Novora’s high-concurrency stateful voice orchestration engine, planned for Milestone 2.',
    details: [
      'Low-latency bidirectional WebSocket streaming',
      'Dynamic interruption handling and barge-in mitigation',
      'Zero-jitter provider failover across ElevenLabs, Retell, and Vapi',
      'Native deterministic policy enforcement before audio synthesis',
    ],
    timeline: 'Targeted for Q2 Platform Rollout',
  },
  langgraph: {
    title: 'LangGraph Orchestration Workflows',
    badge: 'Planned Workflow Engine',
    icon: Layers,
    description:
      'Novora will integrate cyclical state machine testing powered by LangGraph, enabling multi-agent evaluation simulations.',
    details: [
      'Visual cyclical graph representation of agent turns',
      'Stateful checkpointing and rollbacks during simulated calls',
      'Branching scenario test execution',
    ],
    timeline: 'Planned in Architecture Roadmap',
  },
  rbac: {
    title: 'Multi-Tenant Organizations & RBAC',
    badge: 'Enterprise Roadmap',
    icon: ShieldCheck,
    description:
      'Enterprise role-based access control, tenant isolation, audit logging, and single sign-on (SSO) governance.',
    details: [
      'Role hierarchies: Platform Admin, Voice Engineer, QA Reviewer',
      'Isolated scenario directories and private test suites',
      'Audit log exports for compliance and telephony recordings',
    ],
    timeline: 'Phase 2 Enterprise Release',
  },
};

export const PlannedFeatureModal: React.FC<PlannedFeatureModalProps> = ({
  feature,
  onClose,
}) => {
  if (!feature) return null;
  const config = FEATURE_DETAILS[feature];
  const Icon = config.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="planned-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-lg rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor: 'var(--primary-subtle)',
              color: 'var(--primary)',
            }}
          >
            <Icon size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                id="planned-modal-title"
                className="text-lg font-bold text-[var(--text-primary)]"
              >
                {config.title}
              </h3>
            </div>
            <span
              className="inline-block mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
              }}
            >
              {config.badge}
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-4">
          {config.description}
        </p>

        <div
          className="rounded-xl border p-4 mb-5"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">
            Planned Capabilities
          </h4>
          <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
            {config.details.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span
                  className="mt-1 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <span className="font-medium">{config.timeline}</span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 font-bold rounded-lg px-4 py-2 text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span>Understood</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
