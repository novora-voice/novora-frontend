'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastNotificationProps {
  toast: ToastState | null;
  onDismiss: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toast,
  onDismiss,
}) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
        toast.type === 'success'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : toast.type === 'error'
          ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          : 'border-[var(--primary)]/30 bg-[var(--primary-subtle)] text-[var(--primary)]'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="ml-2 hover:opacity-70" aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
};
