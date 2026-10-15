'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, X, Plug } from 'lucide-react';

interface ProviderRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToIntegrations: () => void;
}

export const ProviderRequiredModal: React.FC<ProviderRequiredModalProps> = ({
  isOpen,
  onClose,
  onNavigateToIntegrations,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="provider-required-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200"
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
              backgroundColor: 'var(--status-warning-bg)',
              color: 'var(--status-warning)',
            }}
          >
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3
              id="provider-required-title"
              className="text-base font-bold text-[var(--text-primary)]"
            >
              Provider Connection Required
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Evaluation Execution Blocked
            </span>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-secondary)] mb-4">
          To run an evaluation, Novora requires a configured provider connector (ElevenLabs, AssemblyAI, Vapi, or Retell) or an active integration to evaluate agent behavior honestly.
        </p>

        <div
          className="rounded-xl border p-3.5 mb-5 text-xs text-[var(--text-muted)] flex items-center gap-2.5"
          style={{
            backgroundColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-color)',
          }}
        >
          <Plug size={16} className="text-[var(--primary)] shrink-0" />
          <span>You can configure API keys, webhook URLs, and test targets in the Integrations Directory.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToIntegrations();
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span>Open Integrations</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
