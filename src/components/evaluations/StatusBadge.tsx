'use client';

import React from 'react';
import { EvaluationStatus } from '@/types/api';
import { CheckCircle2, XCircle, HelpCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: EvaluationStatus | 'regressed' | 'improved' | 'unchanged' | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const norm = status.toUpperCase();

  let bg = 'var(--status-inconclusive-bg)';
  let color = 'var(--status-inconclusive)';
  let Icon = HelpCircle;
  let label = status;

  if (norm === 'PASS' || norm === 'IMPROVED') {
    bg = 'var(--status-success-bg)';
    color = 'var(--status-success)';
    Icon = CheckCircle2;
    label = norm === 'IMPROVED' ? 'Improved' : 'Pass';
  } else if (norm === 'FAIL' || norm === 'REGRESSED') {
    bg = 'var(--status-error-bg)';
    color = 'var(--status-error)';
    Icon = XCircle;
    label = norm === 'REGRESSED' ? 'Regressed' : 'Fail';
  } else if (norm === 'INCONCLUSIVE') {
    bg = 'var(--status-warning-bg)';
    color = 'var(--status-warning)';
    Icon = AlertCircle;
    label = 'Inconclusive';
  } else if (norm === 'NOT_EVALUATED') {
    bg = 'var(--status-inconclusive-bg)';
    color = 'var(--text-muted)';
    Icon = HelpCircle;
    label = 'Not evaluated';
  } else if (norm === 'UNCHANGED') {
    bg = 'var(--status-inconclusive-bg)';
    color = 'var(--text-muted)';
    Icon = HelpCircle;
    label = 'Unchanged';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider transition-colors ${sizeClasses}`}
      style={{ backgroundColor: bg, color }}
    >
      {showIcon && <Icon size={iconSizes} />}
      <span>{label}</span>
    </span>
  );
};
