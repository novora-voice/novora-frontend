'use client';

import React from 'react';
import { SCENARIO_TEMPLATES, ScenarioTemplate } from '@/lib/scenarioTemplates';
import { Sparkles } from 'lucide-react';

interface ScenarioTemplateBarProps {
  onSelectTemplate: (template: ScenarioTemplate) => void;
}

export const ScenarioTemplateBar: React.FC<ScenarioTemplateBarProps> = ({
  onSelectTemplate,
}) => {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
        <Sparkles size={12} className="text-[var(--primary)]" />
        <span>Quick-Start from Template</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {SCENARIO_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.template_id}
            type="button"
            onClick={() => onSelectTemplate(tmpl)}
            className="rounded-xl border p-2.5 text-left transition-colors hover:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <span className="text-xs font-bold text-[var(--text-primary)] block truncate">{tmpl.name}</span>
            <span className="text-[10px] text-[var(--text-muted)] block mt-0.5 truncate">{tmpl.category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
