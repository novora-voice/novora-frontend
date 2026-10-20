'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { OverviewView } from '@/components/views/OverviewView';
import { AgentsView } from '@/components/views/AgentsView';
import { EvaluationsView } from '@/components/views/EvaluationsView';
import { ScenariosView } from '@/components/views/ScenariosView';
import { IntegrationsView } from '@/components/views/IntegrationsView';
import { KnowledgeView } from '@/components/views/KnowledgeView';
import { SettingsView } from '@/components/views/SettingsView';
import { AuthUser, EvaluationReport, EvaluationScenario, VoiceAgent, VoiceProvider } from '@/types/api';
import { ApiError, novoraApi } from '@/lib/api';
import { EvaluationDetailModal } from '@/components/evaluations/EvaluationDetailModal';
import { ProviderEvaluationWizardModal } from '@/components/wizard/ProviderEvaluationWizardModal';
import { NewScenarioModal } from '@/components/scenarios/NewScenarioModal';
import { RegressionDiffModal } from '@/components/evaluations/RegressionDiffModal';
import { PlannedFeatureModal, PlannedFeatureType } from '@/components/common/PlannedFeatureModal';
import { ProviderRequiredModal } from '@/components/common/ProviderRequiredModal';
import { ToastNotification, ToastState } from '@/components/common/ToastNotification';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [scenarios, setScenarios] = useState<EvaluationScenario[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationReport[]>([]);
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authVerificationFailed, setAuthVerificationFailed] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationReport | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isNewScenarioOpen, setIsNewScenarioOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareBaselineId, setCompareBaselineId] = useState<string | undefined>(undefined);
  const [plannedFeature, setPlannedFeature] = useState<PlannedFeatureType | null>(null);
  const [isProviderRequiredOpen, setIsProviderRequiredOpen] = useState(false);
  const [initialScenarioId, setInitialScenarioId] = useState<string | undefined>();
  const [initialProvider, setInitialProvider] = useState<VoiceProvider | undefined>();
  const [initialAgent, setInitialAgent] = useState<VoiceAgent | undefined>();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast((cur) => (cur?.message === message ? null : cur)), 4000);
  };

  const openNewEvaluation = () => {
    setInitialAgent(undefined);
    setInitialScenarioId(undefined);
    setInitialProvider(undefined);
    setIsWizardOpen(true);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    let connected = false;
    try {
      await novoraApi.checkHealth();
      connected = true;
      setIsBackendConnected(true);
    } catch {
      setIsBackendConnected(false);
    }

    if (connected) {
      try {
        const fetchedScenarios = await novoraApi.listScenarios();
        setScenarios(fetchedScenarios);
        if (fetchedScenarios.length > 0) {
          const evalPromises = fetchedScenarios.map((s) => novoraApi.listEvaluations(s.id));
          const allEvalLists = await Promise.all(evalPromises);
          const flatEvals = allEvalLists.flat().sort((a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime());
          setEvaluations(flatEvals);
        }
      } catch (err: unknown) {
        showToast(`Backend connected but fetch failed: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const user = await novoraApi.getCurrentUser();
        setCurrentUser(user);
        await loadData();
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace('/login');
        } else {
          setAuthVerificationFailed(true);
        }
      } finally {
        setAuthChecked(true);
      }
    };
    void verifySession();
  }, [loadData, router]);

  if (!authChecked || !currentUser) {
    if (authChecked && authVerificationFailed) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--bg-primary)] p-6 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">Unable to verify your session.</p>
          <p className="text-sm text-[var(--text-muted)]">Check the backend connection and try signing in again.</p>
          <button className="text-sm font-semibold text-blue-600" onClick={() => router.replace('/login')}>Go to sign in</button>
        </main>
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)] p-6">
        <p className="text-sm font-medium text-[var(--text-muted)]">Verifying Novora session...</p>
      </main>
    );
  }

  return (
    <div className="dashboard-shell relative isolate h-dvh overflow-hidden">
      <ToastNotification toast={toast} onDismiss={() => setToast(null)} />
      <div className="relative z-10 flex h-full min-h-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenPlannedModal={setPlannedFeature}
          isBackendConnected={isBackendConnected}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main content — pushed right of the 240px sidebar on lg+ */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-60">
          <Navbar
            activeTab={activeTab}
            onOpenMobile={() => setIsMobileSidebarOpen(true)}
            onNewEvaluation={openNewEvaluation}
            onNewScenario={() => setIsNewScenarioOpen(true)}
            onRefresh={loadData}
            onLogout={async () => { await novoraApi.logout().catch(() => {}); router.replace('/login'); }}
            currentUser={currentUser}
            isLoading={isLoading}
          />

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeTab === 'overview' && (
              <OverviewView
                evaluations={evaluations}
                scenarios={scenarios}
                agents={agents}
                isBackendConnected={isBackendConnected}
                onSelectEvaluation={setSelectedEvaluation}
                onOpenNewEvaluation={openNewEvaluation}
                onOpenNewScenario={() => setIsNewScenarioOpen(true)}
                onNavigateTab={setActiveTab}
                onOpenCompare={() => setIsCompareOpen(true)}
                onRunScenario={(id) => { setInitialScenarioId(id); setIsWizardOpen(true); }}
              />
            )}
            {activeTab === 'agents' && (
              <AgentsView
                agents={agents}
                evaluations={evaluations}
                onAddAgent={(ag) => { setAgents([ag, ...agents]); showToast(`Agent "${ag.name}" configured!`, 'success'); }}
                onRunTest={(ag) => {
                  setInitialAgent(ag);
                  setInitialProvider(ag.provider as VoiceProvider);
                  setInitialScenarioId(scenarios[0]?.id);
                  setIsWizardOpen(true);
                }}
                onOpenEvaluationDetail={setSelectedEvaluation}
                onSelectInfrastructureProvider={(prov) => {
                  setInitialAgent(undefined);
                  setInitialProvider(prov);
                  setInitialScenarioId(scenarios[0]?.id);
                  setIsWizardOpen(true);
                }}
              />
            )}
            {activeTab === 'evaluations' && (
              <EvaluationsView
                evaluations={evaluations}
                scenarios={scenarios}
                onSelectEvaluation={setSelectedEvaluation}
                onOpenNewEvaluation={openNewEvaluation}
                onOpenCompare={(baselineId) => { setCompareBaselineId(baselineId); setIsCompareOpen(true); }}
              />
            )}
            {activeTab === 'scenarios' && (
              <ScenariosView
                scenarios={scenarios}
                onOpenNewScenario={() => setIsNewScenarioOpen(true)}
                onRunScenario={(id) => { setInitialScenarioId(id); setIsWizardOpen(true); }}
                onDuplicateScenario={(scen) => { setScenarios([scen, ...scenarios]); showToast(`Scenario "${scen.name}" duplicated!`, 'success'); }}
                onUpdateScenario={(upd) => { setScenarios(scenarios.map((s) => s.id === upd.id ? upd : s)); showToast(`Scenario "${upd.name}" updated!`, 'success'); }}
                onViewScenarioHistory={() => setActiveTab('evaluations')}
              />
            )}
            {activeTab === 'integrations' && <IntegrationsView scenarios={scenarios} onRefreshAll={loadData} />}
            {activeTab === 'knowledge' && <KnowledgeView />}
            {activeTab === 'settings' && <SettingsView isBackendConnected={isBackendConnected} onRefreshHealth={loadData} />}
          </main>
        </div>
      </div>

      <EvaluationDetailModal report={selectedEvaluation} onClose={() => setSelectedEvaluation(null)} onOpenCompare={(id) => { setSelectedEvaluation(null); setCompareBaselineId(id); setIsCompareOpen(true); }} />
      <ProviderEvaluationWizardModal
        key={`${initialScenarioId ?? 'new'}:${initialProvider ?? 'default'}:${initialAgent?.id ?? 'new-agent'}`}
        isOpen={isWizardOpen}
        onClose={(backgroundRun) => {
          setIsWizardOpen(false);
          if (backgroundRun) showToast('Evaluation continues in the background. Its report will open when it finishes.', 'info');
        }}
        scenarios={scenarios}
        initialScenarioId={initialScenarioId}
        initialProvider={initialProvider}
        initialAgent={initialAgent}
        isBackendConnected={isBackendConnected}
        onScenarioCreated={(scenario) => {
          setScenarios((previous) => [scenario, ...previous.filter((item) => item.id !== scenario.id)]);
          showToast(`Scenario "${scenario.name}" saved!`, 'success');
        }}
        onEvaluationCreated={async (rep) => {
          let savedReport = rep;
          try {
            const latest = await novoraApi.getScenarioHistory(rep.scenario_id, 1, 0);
            savedReport = latest.find((item) => item.id === rep.id) ?? await novoraApi.getEvaluation(rep.id);
          } catch {
            // Keep the report returned by the job visible if the follow-up read fails.
          }
          setEvaluations((previous) => [savedReport, ...previous.filter((item) => item.id !== savedReport.id)]);
          setSelectedEvaluation(savedReport);
          showToast(`Evaluation finished! Verdict: ${savedReport.overall_status}`, savedReport.overall_status === 'INCONCLUSIVE' ? 'info' : 'success');
        }}
        onRequireProviderModal={() => setIsProviderRequiredOpen(true)}
      />
      {isNewScenarioOpen && <NewScenarioModal onClose={() => setIsNewScenarioOpen(false)} onScenarioCreated={(scen) => { setScenarios((previous) => [scen, ...previous]); showToast(`Scenario "${scen.name}" created!`, 'success'); }} />}
      {isCompareOpen && <RegressionDiffModal evaluations={evaluations} initialBaselineId={compareBaselineId} onClose={() => setIsCompareOpen(false)} />}
      <PlannedFeatureModal feature={plannedFeature} onClose={() => setPlannedFeature(null)} />
      <ProviderRequiredModal isOpen={isProviderRequiredOpen} onClose={() => setIsProviderRequiredOpen(false)} onNavigateToIntegrations={() => setActiveTab('integrations')} />
    </div>
  );
}
