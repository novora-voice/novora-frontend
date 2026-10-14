'use client';

import React from 'react';
import { BookOpen, DatabaseZap, FileSearch, GitBranch, Lock, Sparkles } from 'lucide-react';

/**
 * KnowledgeView — Planned Phase 2 feature.
 *
 * RAG connectors and knowledge-base integrations are deferred to a future milestone.
 * This page clearly communicates that to users rather than showing broken or fake UI.
 */
export const KnowledgeView: React.FC = () => {
  const plannedFeatures = [
    {
      icon: DatabaseZap,
      title: 'Knowledge Base Connectors',
      description:
        'Connect approved data sources such as internal wikis, CRMs, and policy documents. Novora will use these as reference material when evaluating agent responses.',
    },
    {
      icon: FileSearch,
      title: 'Retrieval-Augmented Evaluation',
      description:
        'Evaluation rules will be able to cross-reference agent claims against authorised knowledge sources to detect hallucinations or policy deviations.',
    },
    {
      icon: GitBranch,
      title: 'Source Version Tracking',
      description:
        'Track which knowledge-base version was active at the time of each evaluation so that regressions caused by knowledge updates are detectable.',
    },
    {
      icon: Lock,
      title: 'Scoped Connector Permissions',
      description:
        'Each connector will have narrowly-scoped read-only access. No arbitrary URL fetching. SSRF prevention and network access restrictions will be enforced at the platform layer.',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div
        className="rounded-2xl border p-8 shadow-sm relative overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        {/* Background decoration */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #2563EB 0%, transparent 70%)' }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            <BookOpen size={26} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Knowledge Base Connectors
              </h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}
              >
                Phase 2 — Planned
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              RAG connectors and authorised knowledge-base integrations are deferred to a future milestone.
              This section will allow you to connect trusted data sources that Novora uses when evaluating
              agent responses against verified facts and policy documents.
            </p>
          </div>
        </div>
      </div>

      {/* Planned Features Grid */}
      <div
        className="rounded-2xl border p-6 shadow-sm"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={16} style={{ color: 'var(--primary)' }} />
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            Capabilities Coming in Phase 2
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plannedFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="rounded-xl border p-5"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg mb-3"
                  style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
                >
                  <Icon size={18} />
                </div>
                <h4 className="text-sm font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  {feature.title}
                </h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status note */}
      <div
        className="rounded-2xl border px-5 py-4 flex items-center gap-3"
        style={{
          backgroundColor: 'var(--status-inconclusive-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <Lock size={14} style={{ color: 'var(--text-muted)' }} />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          This feature is not yet implemented. No data is being collected or processed here.
          Contact the Novora team if you need early access to the Phase 2 roadmap.
        </p>
      </div>
    </div>
  );
};
