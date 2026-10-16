'use client';

import React, { useState } from 'react';
import { RuleResult } from '@/types/api';
import { EvidenceCard } from './EvidenceCard';
import { ShieldCheck, Sparkles, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface CollapsibleRuleSectionProps {
  ruleResults: RuleResult[];
}

export const CollapsibleRuleSection: React.FC<CollapsibleRuleSectionProps> = ({ ruleResults }) => {
  const [deterministicOpen, setDeterministicOpen] = useState(true);
  const [llmJudgeOpen, setLlmJudgeOpen] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'FAIL' | 'PASS'>('ALL');

  // Categorize rules into deterministic vs LLM judge
  const deterministicRules = ruleResults.filter(
    (r) => r.rule_type !== 'llm_judge' && r.rule_type !== 'judge_rubric'
  );
  const llmJudgeRules = ruleResults.filter(
    (r) => r.rule_type === 'llm_judge' || r.rule_type === 'judge_rubric'
  );

  const filterRules = (rules: RuleResult[]) => {
    if (filterStatus === 'ALL') return rules;
    return rules.filter((r) => r.status === filterStatus);
  };

  const filteredDet = filterRules(deterministicRules);
  const filteredJudge = filterRules(llmJudgeRules);

  return (
    <div className="space-y-4">
      {/* Quick Filter */}
      <div className="flex items-center justify-between text-xs pb-1">
        <span className="text-[var(--text-muted)] font-medium">Filter Criteria Checks:</span>
        <div className="flex items-center gap-1.5">
          {(['ALL', 'FAIL', 'PASS'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-lg px-2.5 py-1 font-bold text-[11px] transition-colors ${
                filterStatus === st
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Deterministic Rules Section */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={() => setDeterministicOpen(!deterministicOpen)}
          className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-elevated)] text-left"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  Deterministic Policy Checks
                </span>
                <span className="rounded-full px-2 py-0.2 text-[10px] font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  {deterministicRules.length}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Direct policy limits, required info capture, and verified actions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {deterministicOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {deterministicOpen && (
          <div className="p-4 pt-0 space-y-3 border-t border-[var(--border-color)]">
            {filteredDet.length > 0 ? (
              filteredDet.map((rule, idx) => <EvidenceCard key={idx} rule={rule} />)
            ) : (
              <p className="text-xs text-[var(--text-muted)] py-4 text-center italic">
                No deterministic checks match filter.
              </p>
            )}
          </div>
        )}
      </div>

      {/* LLM-as-Judge Rubrics Section */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <button
          onClick={() => setLlmJudgeOpen(!llmJudgeOpen)}
          className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-elevated)] text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  LLM-as-Judge Criteria & Rubrics
                </span>
                <span className="rounded-full px-2 py-0.2 text-[10px] font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)]">
                  {llmJudgeRules.length || '0 (Default: Deterministic First)'}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">
                Tone, conversational appropriateness, empathy, and qualitative objectives
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {llmJudgeOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </button>

        {llmJudgeOpen && (
          <div className="p-4 pt-0 space-y-3 border-t border-[var(--border-color)]">
            {filteredJudge.length > 0 ? (
              filteredJudge.map((rule, idx) => <EvidenceCard key={idx} rule={rule} />)
            ) : (
              <div className="p-4 rounded-xl border border-dashed text-center text-xs text-[var(--text-muted)] mt-3">
                <span>No custom LLM-as-judge rubrics attached. Primary evaluation completed via deterministic rules.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
