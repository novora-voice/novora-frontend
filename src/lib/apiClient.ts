import {
  EvaluationReport,
  RegressionReport,
  RuleResult,
  SpeakerRole,
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

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '');

export const API_PROXY_PATH = '/api/backend';

// ─── JWT Token storage ────────────────────────────────────────────────────────

const TOKEN_KEY = 'novora_token';

export function setToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
}


export interface BackendEvidenceReference {
  message_id: string;
  speaker: SpeakerRole;
  sequence: number;
  char_start?: number | null;
  char_end?: number | null;
  snippet: string;
}

export type BackendRuleResult = Omit<RuleResult, 'evidence'> & {
  evidence: BackendEvidenceReference[];
};

export type BackendEvaluationReport = Omit<
  EvaluationReport,
  'evaluated_at' | 'limitations' | 'rule_results'
> & {
  created_at: string;
  rule_results: BackendRuleResult[];
};

export type BackendRegressionReport = Omit<
  RegressionReport,
  'net_status_change'
> & {
  net_status_change: RegressionReport['net_status_change'] | 'neutral';
};

export function toEvaluationReport(report: BackendEvaluationReport): EvaluationReport {
  return {
    ...report,
    evaluated_at: report.created_at,
    limitations: [],
    rule_results: (report.rule_results || []).map((rule) => ({
      ...rule,
      evidence: (rule.evidence || []).map((evidence) => ({
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

export async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_PROXY_PATH}${endpoint}`;

  // Inject JWT token from localStorage
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

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
