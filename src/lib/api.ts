import {
  EvaluationScenario,
  EvaluationReport,
  Conversation,
  CreateScenarioPayload,
  ImportTranscriptPayload,
  EvaluateConversationPayload,
  RegressionReport,
  RuleResult,
  SpeakerRole,
  TelephonyCall,
  HealthResponse,
  AuthUser,
  SignupPayload,
  LoginPayload,
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
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '');
const API_PROXY_PATH = '/api/backend';

interface BackendEvidenceReference {
  message_id: string;
  speaker: SpeakerRole;
  sequence: number;
  char_start?: number | null;
  char_end?: number | null;
  snippet: string;
}

type BackendRuleResult = Omit<RuleResult, 'evidence'> & {
  evidence: BackendEvidenceReference[];
};

type BackendEvaluationReport = Omit<
  EvaluationReport,
  'evaluated_at' | 'limitations' | 'rule_results'
> & {
  created_at: string;
  rule_results: BackendRuleResult[];
};

type BackendRegressionReport = Omit<
  RegressionReport,
  'net_status_change'
> & {
  net_status_change: RegressionReport['net_status_change'] | 'neutral';
};

function toEvaluationReport(report: BackendEvaluationReport): EvaluationReport {
  return {
    ...report,
    evaluated_at: report.created_at,
    limitations: [],
    rule_results: report.rule_results.map((rule) => ({
      ...rule,
      evidence: rule.evidence.map((evidence) => ({
        message_id: evidence.message_id,
        message_sequence: evidence.sequence,
        start_char: evidence.char_start ?? 0,
        end_char: evidence.char_end ?? 0,
        excerpt: evidence.snippet,
        role: evidence.speaker,
      })),
    })),
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_PROXY_PATH}${endpoint}`;
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

    const responseText = await res.text();
    if (!res.ok) {
      let errorDetail = `Request failed with status ${res.status}`;
      try {
        const errorJson = JSON.parse(responseText);
        const detail = errorJson.detail || errorJson.message;
        errorDetail =
          typeof detail === 'string'
            ? detail
            : JSON.stringify(detail ?? errorJson);
      } catch {
        if (responseText) errorDetail = responseText;
      }
      throw new ApiError(res.status, errorDetail);
    }

    try {
      return JSON.parse(responseText) as T;
    } catch {
      throw new ApiError(res.status, 'Backend returned an invalid JSON response.');
    }
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

  async signup(payload: SignupPayload): Promise<AuthUser> {
    return request<AuthUser>('/api/v1/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(payload: LoginPayload): Promise<AuthUser> {
    return request<AuthUser>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCurrentUser(): Promise<AuthUser> {
    return request<AuthUser>('/api/v1/auth/me');
  },

  async logout(): Promise<void> {
    await request<{ status: string }>('/api/v1/auth/logout', {
      method: 'POST',
    });
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
      net_status_change:
        report.net_status_change === 'neutral'
          ? 'unchanged'
          : report.net_status_change,
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
};
