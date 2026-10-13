'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ActiveTab } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { OverviewView } from '@/components/views/OverviewView';
import { EvaluationsView } from '@/components/views/EvaluationsView';
import { ScenariosView } from '@/components/views/ScenariosView';
import { IntegrationsView } from '@/components/views/IntegrationsView';
import { SettingsView } from '@/components/views/SettingsView';

import { EvaluationReport, EvaluationScenario } from '@/types/api';
import { novoraApi } from '@/lib/api';
import { SEED_SCENARIOS, SEED_EVALUATIONS } from '@/lib/mockData';

import { EvaluationDetailModal } from '@/components/evaluations/EvaluationDetailModal';
import { NewEvaluationModal } from '@/components/evaluations/NewEvaluationModal';
import { NewScenarioModal } from '@/components/scenarios/NewScenarioModal';
import { RegressionDiffModal } from '@/components/evaluations/RegressionDiffModal';

import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core Data
  const [scenarios, setScenarios] = useState<EvaluationScenario[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationReport[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [selectedEvaluation, setSelectedEvaluation] = useState<EvaluationReport | null>(null);
  const [isNewEvaluationOpen, setIsNewEvaluationOpen] = useState(false);
  const [isNewScenarioOpen, setIsNewScenarioOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareBaselineId, setCompareBaselineId] = useState<string | undefined>(undefined);

  // Notification Banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 4500);
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
        if (fetchedScenarios.length > 0) {
          setScenarios(fetchedScenarios);

          // Fetch all evaluations across scenarios
          const evalPromises = fetchedScenarios.map((s) =>
            novoraApi.listEvaluations(s.id).catch(() => [] as EvaluationReport[])
          );
          const allEvalLists = await Promise.all(evalPromises);
          const flatEvals = allEvalLists.flat();

          // Sort by evaluated_at descending
          flatEvals.sort(
            (a, b) => new Date(b.evaluated_at).getTime() - new Date(a.evaluated_at).getTime()
          );
          setEvaluations(flatEvals);
        } else {
          // Connected but empty scenario store - allow user to seed or create
          setScenarios([]);
          setEvaluations([]);
        }
      } catch (err: unknown) {
        showToast(
          `Connected to backend but failed to fetch data: ${err instanceof Error ? err.message : 'Unknown'}`,
          'error'
        );
      }
    } else {
      // Backend offline: populate seed data so the dashboard is interactive and responsive
      setScenarios(SEED_SCENARIOS);
      setEvaluations(SEED_EVALUATIONS);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers
  const handleEvaluationCreated = (report: EvaluationReport) => {
    setEvaluations((prev) => [report, ...prev]);
    setSelectedEvaluation(report);
    showToast(`Evaluation completed! Verdict: ${report.overall_status}`, 'success');
  };

  const handleScenarioCreated = (scenario: EvaluationScenario) => {
    setScenarios((prev) => [scenario, ...prev]);
    showToast(`Scenario "${scenario.name}" created successfully.`, 'success');
  };

  const handleOpenCompare = (baselineId?: string) => {
    setCompareBaselineId(baselineId);
    setIsCompareOpen(true);
  };

  const handleRunScenario = (scenarioId: string) => {
    setIsNewEvaluationOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 ${
            toast.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : toast.type === 'error'
              ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
              : 'border-[var(--primary)]/30 bg-[var(--primary-subtle)] text-[var(--primary)]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70"
            aria-label="Dismiss toast"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isBackendConnected={isBackendConnected}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar
          activeTab={activeTab}
          onOpenMobile={() => setIsMobileSidebarOpen(true)}
          onNewEvaluation={() => setIsNewEvaluationOpen(true)}
          onNewScenario={() => setIsNewScenarioOpen(true)}
          onRefresh={loadData}
          isLoading={isLoading}
        />

        {/* Backend notice if offline */}
        {!isBackendConnected && !isLoading && (
          <div
            className="border-b px-6 py-2.5 text-xs font-medium flex items-center justify-between"
            style={{
              backgroundColor: 'var(--status-warning-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--status-warning)',
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              <span>
                Backend offline or unreachable at <code className="font-mono">{novoraApi.getBaseUrl()}</code>. Displaying local test fixtures. Start the backend with <code className="font-mono">python -m uvicorn novora.api.main:app</code> to evaluate against the live API.
              </span>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-bold underline hover:opacity-80 shrink-0 ml-4"
            >
              Retry Connection
            </button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'overview' && (
            <OverviewView
              evaluations={evaluations}
              scenarios={scenarios}
              onSelectEvaluation={setSelectedEvaluation}
              onOpenNewEvaluation={() => setIsNewEvaluationOpen(true)}
              onOpenNewScenario={() => setIsNewScenarioOpen(true)}
              onNavigateTab={setActiveTab}
              onOpenCompare={() => handleOpenCompare()}
            />
          )}

          {activeTab === 'evaluations' && (
            <EvaluationsView
              evaluations={evaluations}
              scenarios={scenarios}
              onSelectEvaluation={setSelectedEvaluation}
              onOpenNewEvaluation={() => setIsNewEvaluationOpen(true)}
              onOpenCompare={handleOpenCompare}
            />
          )}

          {activeTab === 'scenarios' && (
            <ScenariosView
              scenarios={scenarios}
              onOpenNewScenario={() => setIsNewScenarioOpen(true)}
              onRunScenario={handleRunScenario}
              onSelectEvaluation={setSelectedEvaluation}
            />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsView
              scenarios={scenarios}
              onRefreshAll={loadData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              isBackendConnected={isBackendConnected}
              onRefreshHealth={loadData}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <EvaluationDetailModal
        report={selectedEvaluation}
        onClose={() => setSelectedEvaluation(null)}
        onOpenCompare={(baselineId) => {
          setSelectedEvaluation(null);
          handleOpenCompare(baselineId);
        }}
      />

      {isNewEvaluationOpen && (
        <NewEvaluationModal
          scenarios={scenarios}
          onClose={() => setIsNewEvaluationOpen(false)}
          onEvaluationCreated={handleEvaluationCreated}
        />
      )}

      {isNewScenarioOpen && (
        <NewScenarioModal
          onClose={() => setIsNewScenarioOpen(false)}
          onScenarioCreated={handleScenarioCreated}
        />
      )}

      {isCompareOpen && (
        <RegressionDiffModal
          evaluations={evaluations}
          initialBaselineId={compareBaselineId}
          onClose={() => setIsCompareOpen(false)}
        />
      )}
    </div>
  );
}
