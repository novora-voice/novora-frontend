'use client';

import React, { useState } from 'react';
import { VoiceAgent, EvaluationReport } from '@/types/api';
import { AgentCard } from '../agents/AgentCard';
import { CreateAgentModal } from '../agents/CreateAgentModal';
import { AgentDetailModal } from '../agents/AgentDetailModal';
import { Bot, Plus, Search, Filter } from 'lucide-react';

interface AgentsViewProps {
  agents: VoiceAgent[];
  evaluations: EvaluationReport[];
  onAddAgent: (agent: VoiceAgent) => void;
  onRunTest: (agent: VoiceAgent) => void;
  onOpenEvaluationDetail: (evalReport: EvaluationReport) => void;
}

export const AgentsView: React.FC<AgentsViewProps> = ({
  agents,
  evaluations,
  onAddAgent,
  onRunTest,
  onOpenEvaluationDetail,
}) => {
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<VoiceAgent | null>(null);

  const filtered = agents.filter((ag) => {
    const matchSearch =
      ag.name.toLowerCase().includes(search.toLowerCase()) ||
      ag.provider.toLowerCase().includes(search.toLowerCase()) ||
      (ag.agent_id_ref && ag.agent_id_ref.toLowerCase().includes(search.toLowerCase()));
    const matchProv = providerFilter === 'all' || ag.provider === providerFilter;
    return matchSearch && matchProv;
  });

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
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Plus size={15} />
          <span>Configure Agent</span>
        </button>
      </div>

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
            <option value="elevenlabs">ElevenLabs</option>
            <option value="assemblyai">AssemblyAI</option>
            <option value="vapi">Vapi</option>
            <option value="retell">Retell AI</option>
          </select>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onSelectAgent={setSelectedAgent}
              onRunTest={onRunTest}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border p-12 text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <Bot size={36} className="mx-auto text-[var(--text-muted)] mb-3" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">No voice agents found</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
            {search || providerFilter !== 'all' ? 'Try adjusting your search criteria.' : 'Configure your first voice agent to start running tests.'}
          </p>
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
