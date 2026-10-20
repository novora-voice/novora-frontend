import {
  TestRunExecutionRequest,
  TestRunResponse,
  TestRun,
  EvaluationJobResponse,
  ProviderManifest,
  ProviderIntegration,
  IntegrationHealth,
  BatchCreateRequest,
  BatchEvaluation,
} from '@/types/execution';
import { EvaluationScenario } from '@/types/api';
import {
  request,
  BackendEvaluationReport,
  toEvaluationReport,
} from './apiClient';

interface BackendTestRunResponse {
  test_run: TestRun;
  evaluation_report?: BackendEvaluationReport | null;
}

export const executionApi = {
  async enqueueTestRun(req: TestRunExecutionRequest): Promise<EvaluationJobResponse> {
    return request<EvaluationJobResponse>('/api/v1/test-runs/jobs', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getEvaluationJob(id: string): Promise<EvaluationJobResponse> {
    const job = await request<Omit<EvaluationJobResponse, 'evaluation_report'> & {
      evaluation_report?: BackendEvaluationReport;
    }>(`/api/v1/test-runs/jobs/${encodeURIComponent(id)}`);
    return {
      ...job,
      evaluation_report: job.evaluation_report ? toEvaluationReport(job.evaluation_report) : undefined,
    };
  },

  async executeTestRun(req: TestRunExecutionRequest): Promise<TestRunResponse> {
    const raw = await request<BackendTestRunResponse>('/api/v1/test-runs', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    return {
      test_run: raw.test_run,
      evaluation_report: raw.evaluation_report
        ? toEvaluationReport(raw.evaluation_report)
        : undefined,
    };
  },

  async getTestRun(id: string): Promise<TestRun> {
    return request<TestRun>(`/api/v1/test-runs/${encodeURIComponent(id)}`);
  },

  async listTestRuns(
    scenarioId?: string,
    limit = 50,
    offset = 0
  ): Promise<TestRun[]> {
    const param = scenarioId
      ? `?scenario_id=${encodeURIComponent(scenarioId)}&limit=${limit}&offset=${offset}`
      : `?limit=${limit}&offset=${offset}`;
    return request<TestRun[]>(`/api/v1/test-runs${param}`);
  },

  async listProviders(): Promise<ProviderManifest[]> {
    return request<ProviderManifest[]>('/api/v1/providers');
  },

  async getScenarioTemplates(): Promise<EvaluationScenario[]> {
    return request<EvaluationScenario[]>('/api/v1/scenarios/templates');
  },

  async createBatch(req: BatchCreateRequest): Promise<BatchEvaluation> {
    return request<BatchEvaluation>('/api/v1/batches', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getBatch(
    id: string
  ): Promise<{ batch: BatchEvaluation; test_run_statuses: Record<string, unknown>[] }> {
    return request<{ batch: BatchEvaluation; test_run_statuses: Record<string, unknown>[] }>(
      `/api/v1/batches/${encodeURIComponent(id)}`
    );
  },

  async testConnectivity(
    integrationId: string
  ): Promise<IntegrationHealth> {
    return request<IntegrationHealth>(
      `/api/v1/integrations/${encodeURIComponent(integrationId)}/test-connectivity`,
      { method: 'POST' }
    );
  },

  async listIntegrations(): Promise<ProviderIntegration[]> {
    return request<ProviderIntegration[]>('/api/v1/integrations');
  },

  async createIntegration(payload: { provider_name: string; api_key: string }): Promise<ProviderIntegration> {
    return request<ProviderIntegration>('/api/v1/integrations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async generatePayload(req: import('@/types/execution').PayloadGenerationRequest): Promise<import('@/types/execution').PayloadPipelineResult> {
    return request<import('@/types/execution').PayloadPipelineResult>('/api/v1/payloads/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async validatePayload(req: import('@/types/execution').PayloadValidationRequest): Promise<import('@/types/execution').PayloadJudgeVerdict> {
    return request<import('@/types/execution').PayloadJudgeVerdict>('/api/v1/payloads/validate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  async getPayloadTemplates(provider?: string): Promise<import('@/types/execution').PayloadTemplate[]> {
    const q = provider ? `?provider=${encodeURIComponent(provider)}` : '';
    return request<import('@/types/execution').PayloadTemplate[]>(`/api/v1/payloads/templates${q}`);
  },
};
