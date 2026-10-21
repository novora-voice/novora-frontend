'use client';

import React, { useEffect, useState } from 'react';
import { IntegrationItem } from './IntegrationCard';
import { X, Key, Copy, Check, ShieldCheck, Lock } from 'lucide-react';

interface ConfigureProviderModalProps {
  item: IntegrationItem | null;
  onClose: () => void;
  onSave: (providerId: string, values: Record<string, string>) => Promise<void> | void;
}

export const ConfigureProviderModal: React.FC<ConfigureProviderModalProps> = ({
  item,
  onClose,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setApiKey('');
    setWebhookSecret('');
    setSaveError(null);
    setIsSaved(false);
  }, [item?.id]);

  if (!item) return null;

  const fullWebhookUrl = item.webhookPath
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8000'}${item.webhookPath}`
    : '';

  const handleCopyWebhook = () => {
    if (fullWebhookUrl) {
      navigator.clipboard.writeText(fullWebhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(item.id, { apiKey, webhookSecret });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Could not save provider credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
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
          className="absolute top-5 right-5 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Key size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Configure {item.name}</h2>
            <p className="text-xs text-[var(--text-muted)]">Manage secure credentials and webhook endpoints</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {fullWebhookUrl && (
            <div>
              <label className="font-bold text-[var(--text-primary)] block mb-1">Webhook Endpoint URL</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={fullWebhookUrl}
                  className="w-full rounded-xl border p-2 text-xs font-mono text-[var(--text-secondary)] select-all"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="rounded-xl border p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] shrink-0"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">API Key / Token (Masked)</label>
            <div className="relative">
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="••••••••••••••••••••••••"
                className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
              />
              <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Keys are transmitted over HTTPS and never logged in plain text.
            </p>
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">Webhook Signing Secret (Optional)</label>
            <input
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="••••••••••••••••"
              className="w-full rounded-xl border p-2.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>TLS 1.3 In-Flight Encryption</span>
            </span>

            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="rounded-xl px-4 py-2 font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl px-4 py-2 font-bold text-white shadow-sm"
                style={{ backgroundColor: isSaved ? 'var(--status-success)' : 'var(--primary)' }}
              >
                {isSaving ? 'Saving…' : isSaved ? 'Saved!' : 'Save Credentials'}
              </button>
            </div>
          </div>
          {saveError && <p role="alert" className="text-xs text-rose-500">{saveError}</p>}
        </form>
      </div>
    </div>
  );
};
