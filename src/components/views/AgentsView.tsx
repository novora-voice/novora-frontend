'use client';

import React, { useState } from 'react';
import { VoiceAgent, EvaluationReport } from '@/types/api';
import { AgentCard } from '../agents/AgentCard';
import { CreateAgentModal } from '../agents/CreateAgentModal';
import { AgentDetailModal } from '../agents/AgentDetailModal';
import { Bot, Plus, Search, Filter, Server, Mic, Play, Sparkles } from 'lucide-react';

interface AgentsViewProps {
  agents: VoiceAgent[];
  evaluations: EvaluationReport[];
  onAddAgent: (agent: VoiceAgent) => void;
  onRunTest: (agent: VoiceAgent) => void;
  onOpenEvaluationDetail: (evalReport: EvaluationReport) => void;
  onSelectInfrastructureProvider?: (provider: 'vapi' | 'retell') => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  evaluations,
  onAddAgent,
  onRunTest,
  onOpenEvaluationDetail,
  onSelectInfrastructureProvider,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultProvider, setCreateDefaultProvider] = useState<'elevenlabs' | 'assemblyai' | 'vapi' | 'retell'>('elevenlabs');
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);

  const filtered = agents.filter((ag) => {
    const matchSearch =
      ag.name.toLowerCase().includes(search.toLowerCase()) ||
      ag.provider.toLowerCase().includes(search.toLowerCase()) ||
      (ag.agent_id_ref && ag.agent_id_ref.toLowerCase().includes(search.toLowerCase()));
    const matchProv = providerFilter === 'all' || ag.provider === providerFilter;
    return matchSearch && matchProv;
  });

  const voiceAgents = filtered.filter((a) => a.provider === 'elevenlabs' || a.provider === 'assemblyai');
  const infraAgents = filtered.filter((a) => a.provider === 'vapi' || a.provider === 'retell');

  const handleLaunchInfraFlow = (prov: 'vapi' | 'retell') => {
    if (onSelectInfrastructureProvider) {
      onSelectInfrastructureProvider(prov);
    } else {
      // Find or create dummy agent and trigger onRunTest
      const existing = agents.find((a) => a.provider === prov);
      if (existing) {
        onRunTest(existing);
      } else {
        const tempAgent: VoiceAgent = {
          id: `ag_${prov}_target`,
          name: prov === 'vapi' ? 'Vapi Assistant Target' : 'Retell Agent Target',
          provider: prov,
          agent_type: 'infrastructure',
          configuration_status: 'ready',
          agent_id_ref: prov === 'vapi' ? 'asst_vapi_default' : 'agent_retell_default',
          created_at: new Date().toISOString(),
        };
        onRunTest(tempAgent);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Voice Agents Catalog</h2>
            <p className="text-xs text-[var(--text-secondary)]">Manage voice agents and target assistants across connected platforms</p>
          </div>
        </div>

        <button
          onClick={() => {
            setCreateDefaultProvider('elevenlabs');
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={15} />
          <span>Configure Agent</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border p-3" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search agents by name or ID..."
            className="w-full rounded-xl border pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
          >
            <option value="all">All Providers</option>
            <option value="elevenlabs">ElevenLabs (Voice Provider)</option>
            <option value="assemblyai">AssemblyAI (Voice Provider)</option>
            <option value="vapi">Vapi (Infrastructure)</option>
            <option value="retell">Retell AI (Infrastructure)</option>
          </select>
        </div>
      </div>

      {/* Section 1: Voice Providers */}
      {(providerFilter === 'all' || providerFilter === 'elevenlabs' || providerFilter === 'assemblyai') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Mic size={16} className="text-[var(--primary)]" />
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Voice Providers</h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)]">
                ElevenLabs • AssemblyAI
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{voiceAgents.length} Agents</span>
          </div>

          {voiceAgents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {voiceAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelectAgent={setSelectedAgent}
                  onRunTest={onRunTest}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border p-6 text-center text-xs text-[var(--text-muted)]" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}>
              No Voice Provider agents configured. Click &quot;Configure Agent&quot; to set up an ElevenLabs or AssemblyAI agent.
            </div>
          )}
        </div>
      )}

      {/* Section 2: Infrastructure Providers */}
      {(providerFilter === 'all' || providerFilter === 'vapi' || providerFilter === 'retell') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Server size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">Infrastructure Providers</h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Vapi • Retell
              </span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{infraAgents.length} Target Configurations</span>
          </div>

          {/* Quick-Start Workflow Launchers for Infrastructure Providers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => handleLaunchInfraFlow('vapi')}
              className="cursor-pointer rounded-2xl border p-4 transition-all hover:border-[var(--primary)] hover:shadow-md flex items-start justify-between"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Vapi Infrastructure Evaluation</span>
                  <span className="text-[9px] font-bold uppercase bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded">Vapi Flow</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Launch the Vapi assistant configuration flow, payload generator, and automated ghost-caller tests.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-[var(--primary)]">
                  <Play size={11} />
                  <span>Start Vapi Evaluation Flow</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleLaunchInfraFlow('retell')}
              className="cursor-pointer rounded-2xl border p-4 transition-all hover:border-[var(--primary)] hover:shadow-md flex items-start justify-between"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-color)' }}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Retell AI Infrastructure Evaluation</span>
                  <span className="text-[9px] font-bold uppercase bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">Retell Flow</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Launch the Retell AI agent configuration flow with dynamic variables and call-analyzed evaluation.
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  <Play size={11} />
                  <span>Start Retell Evaluation Flow</span>
                </div>
              </div>
            </div>
          </div>

          {infraAgents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
              {infraAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelectAgent={setSelectedAgent}
                  onRunTest={onRunTest}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <CreateAgentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onAgentCreated={onAddAgent}
      />

      <AgentDetailModal
        agent={selectedAgent}
        evaluations={evaluations}
        onClose={() => setSelectedAgent(null)}
        onRunTest={onRunTest}
        onOpenEvaluationDetail={onOpenEvaluationDetail}
      />
    </div>
  );
};
