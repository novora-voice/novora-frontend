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
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Default to backend API at localhost:8000 or custom environment URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      let errorDetail = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
      } catch {
        errorDetail = await res.text();
      }
      throw new ApiError(res.status, errorDetail);
    }

    return (await res.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiError(0, `Cannot reach Novora backend at ${API_BASE_URL}. (${message})`);
  }
}

export const novoraApi = {
  getBaseUrl(): string {
    return API_BASE_URL;
  },

  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  async listScenarios(limit = 50, offset = 0): Promise<EvaluationScenario[]> {
    return request<EvaluationScenario[]>(
      `/api/v1/scenarios?limit=${limit}&offset=${offset}`
    );
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
    return request<EvaluationReport>('/api/v1/evaluations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getEvaluation(id: string): Promise<EvaluationReport> {
    return request<EvaluationReport>(`/api/v1/evaluations/${encodeURIComponent(id)}`);
  },

  async listEvaluations(scenarioId: string, limit = 50, offset = 0): Promise<EvaluationReport[]> {
    return request<EvaluationReport[]>(
      `/api/v1/evaluations?scenario_id=${encodeURIComponent(scenarioId)}&limit=${limit}&offset=${offset}`
    );
  },

  async getScenarioHistory(scenarioId: string, limit = 50, offset = 0): Promise<EvaluationReport[]> {
    return request<EvaluationReport[]>(
      `/api/v1/scenarios/${encodeURIComponent(scenarioId)}/history?limit=${limit}&offset=${offset}`
    );
  },

  async compareEvaluations(baselineId: string, candidateId: string): Promise<RegressionReport> {
    return request<RegressionReport>('/api/v1/evaluations/compare', {
      method: 'POST',
      body: JSON.stringify({
        baseline_evaluation_id: baselineId,
        candidate_evaluation_id: candidateId,
      }),
    });
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
};
