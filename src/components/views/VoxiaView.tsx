'use client';

import React from 'react';
import { EvaluationScenario, VoiceAgent } from '@/types/api';
import { VoxiaSessionPanel } from '../voxia/VoxiaSessionPanel';
import { Sparkles, Shield, Cpu, ExternalLink } from 'lucide-react';

interface VoxiaViewProps {
  scenarios: EvaluationScenario[];
  agents: VoiceAgent[];
  onEvaluateConversation?: (conversationId: string, scenarioId?: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const VoxiaView: React.FC<VoxiaViewProps> = ({
  scenarios,
  agents,
  onEvaluateConversation,
  onToast,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400"
          >
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Voxia Voice Runtime
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Remote-inference browser voice agent powered by Hugging Face serverless providers &amp; LangGraph
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 font-medium">
            <Shield size={14} /> Zero Local Inference
          </span>
        </div>
      </div>

      {/* Main Voice Panel */}
      <VoxiaSessionPanel
        scenarios={scenarios}
        agents={agents}
        onEvaluateConversation={onEvaluateConversation}
        onToast={onToast}
      />
    </div>
  );
};

