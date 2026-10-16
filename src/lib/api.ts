import {
  EvaluationScenario,
  EvaluationReport,
  Conversation,
  CreateScenarioPayload,
  ImportTranscriptPayload,
  EvaluateConversationPayload,
  RegressionReport,
  TelephonyCall,
  HealthResponse,
  AuthUser,
  SignupPayload,
  LoginPayload,
} from '@/types/api';
import {
  ApiError,
  API_BASE_URL,
  BackendEvaluationReport,
  BackendRegressionReport,
  request,
  setToken,
  clearToken,
  toEvaluationReport,
} from './apiClient';
import { executionApi } from './executionApi';

export { ApiError };
export * from '@/types/execution';
export { executionApi };

export const novoraApi = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  async signup(payload: SignupPayload): Promise<AuthUser> {
    const resp = await request<{ access_token: string; user: AuthUser }>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(resp.access_token);
    return resp.user;
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    const resp = await request<{ access_token: string; user: AuthUser }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setToken(resp.access_token);
    return resp.user;
  },

  async getCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>('/api/v1/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await request<{ status: string }>('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      clearToken();
    }
  },

  async listScenarios(limit = 50, offset = 0): Promise<EvaluationScenario[]> {
    return request<EvaluationScenario[]>(`/api/v1/scenarios?limit=${limit}&offset=${offset}`);
  },

  async getScenario(id: string): Promise<EvaluationScenario> {
    return request<EvaluationScenario>(`/api/v1/scenarios/${encodeURIComponent(id)}`);
  },

  async createScenario(payload: CreateScenarioPayload): Promise<EvaluationScenario> {
    return request<EvaluationScenario>('/api/v1/scenarios', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async importTranscript(payload: ImportTranscriptPayload): Promise<Conversation> {
    return request<Conversation>('/api/v1/conversations/import-transcript', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async evaluateConversation(payload: EvaluateConversationPayload): Promise<EvaluationReport> {
    const report = await request<BackendEvaluationReport>('/api/v1/evaluations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return toEvaluationReport(report);
  },

  async getEvaluation(id: string): Promise<EvaluationReport> {
    const report = await request<BackendEvaluationReport>(
      `/api/v1/evaluations/${encodeURIComponent(id)}`
    );
    return toEvaluationReport(report);
  },

  async listEvaluations(scenarioId: string, limit = 50, offset = 0): Promise<EvaluationReport[]> {
    const reports = await request<BackendEvaluationReport[]>(
      `/api/v1/evaluations?scenario_id=${encodeURIComponent(scenarioId)}&limit=${limit}&offset=${offset}`
    );
    return reports.map(toEvaluationReport);
  },

  async getScenarioHistory(scenarioId: string, limit = 50, offset = 0): Promise<EvaluationReport[]> {
    const reports = await request<BackendEvaluationReport[]>(
      `/api/v1/scenarios/${encodeURIComponent(scenarioId)}/history?limit=${limit}&offset=${offset}`
    );
    return reports.map(toEvaluationReport);
  },

  async compareEvaluations(baselineId: string, candidateId: string): Promise<RegressionReport> {
    const report = await request<BackendRegressionReport>('/api/v1/evaluations/compare', {
      method: 'POST',
      body: JSON.stringify({
        baseline_evaluation_id: baselineId,
        candidate_evaluation_id: candidateId,
      }),
    });
    return {
      ...report,
      net_status_change: report.net_status_change === 'neutral' ? 'unchanged' : report.net_status_change,
    };
  },

  async listTelephonyCalls(limit = 50, offset = 0): Promise<TelephonyCall[]> {
    return request<TelephonyCall[]>(`/api/v1/telephony/calls?limit=${limit}&offset=${offset}`);
  },

  async triggerElevenLabsWebhook(payload: Record<string, unknown>, scenarioId?: string, autoEvaluate?: boolean): Promise<Record<string, unknown>> {
    let url = '/api/v1/webhooks/elevenlabs';
    const params = new URLSearchParams();
    if (scenarioId) params.append('scenario_id', scenarioId);
    if (autoEvaluate) params.append('auto_evaluate', 'true');
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    return request<Record<string, unknown>>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async triggerTwilioWebhook(payload: Record<string, unknown>): Promise<TelephonyCall> {
    return request<TelephonyCall>('/api/v1/webhooks/twilio', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async triggerAssemblyAIWebhook(payload: Record<string, unknown>, scenarioId?: string): Promise<Conversation> {
    let url = '/api/v1/webhooks/assemblyai';
    if (scenarioId) url += `?scenario_id=${encodeURIComponent(scenarioId)}`;
    return request<Conversation>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async triggerVapiWebhook(payload: Record<string, unknown>, scenarioId?: string): Promise<Conversation> {
    let url = '/api/v1/webhooks/vapi';
    if (scenarioId) url += `?scenario_id=${encodeURIComponent(scenarioId)}`;
    return request<Conversation>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async triggerRetellWebhook(payload: Record<string, unknown>, scenarioId?: string): Promise<Conversation> {
    let url = '/api/v1/webhooks/retell';
    if (scenarioId) url += `?scenario_id=${encodeURIComponent(scenarioId)}`;
    return request<Conversation>(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  ...executionApi,
};
