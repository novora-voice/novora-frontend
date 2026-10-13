export type SpeakerRole = 'customer' | 'agent' | 'system';

export interface Message {
  id: string;
  role: SpeakerRole;
  content: string;
  sequence: number;
  timestamp?: string;
}

export interface TrustedActionRecord {
  action_type: string;
  status: 'success' | 'failure' | 'pending';
  payload?: Record<string, unknown>;
  verified: boolean;
}

export interface Conversation {
  id: string;
  scenario_id?: string;
  messages: Message[];
  trusted_action_records?: TrustedActionRecord[];
  metadata?: Record<string, unknown>;
}

export type EvaluationStatus = 'PASS' | 'FAIL' | 'INCONCLUSIVE';

export type RuleType =
  | 'required_information'
  | 'policy_compliance'
  | 'forbidden_promises'
  | 'external_action_verification';

export interface EvidenceSpan {
  message_id: string;
  message_sequence: number;
  start_char: number;
  end_char: number;
  excerpt: string;
  role: SpeakerRole;
}

export interface RuleResult {
  rule_name: string;
  rule_type: RuleType | string;
  status: EvaluationStatus;
  explanation: string;
  evidence: EvidenceSpan[];
  metadata?: Record<string, unknown>;
}

export interface EvaluationReport {
  id: string;
  scenario_id: string;
  conversation_id: string;
  overall_status: EvaluationStatus;
  summary: string;
  rule_results: RuleResult[];
  limitations: string[];
  evaluated_at: string;
}

export interface RuleConfig {
  rule_type: RuleType;
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
}

export interface EvaluationScenario {
  id: string;
  name: string;
  business_goal: string;
  success_criteria: string[];
  rules: RuleConfig[];
  created_at: string;
}

export interface CreateScenarioPayload {
  name: string;
  business_goal: string;
  success_criteria: string[];
  rules: RuleConfig[];
}

export interface ImportTranscriptPayload {
  scenario_id?: string;
  text?: string;
  records?: Array<{ role: SpeakerRole; content: string }>;
  format?: 'dialogue_text' | 'records_json';
}

export interface EvaluateConversationPayload {
  scenario_id: string;
  conversation: Conversation;
}

export interface RuleComparison {
  rule_name: string;
  rule_type: string;
  baseline_status: EvaluationStatus;
  candidate_status: EvaluationStatus;
  change: 'regressed' | 'improved' | 'unchanged';
  explanation_diff?: string;
}

export interface RegressionReport {
  scenario_id: string;
  baseline_id: string;
  candidate_id: string;
  baseline_status: EvaluationStatus;
  candidate_status: EvaluationStatus;
  regression_detected: boolean;
  net_status_change: 'regressed' | 'improved' | 'unchanged';
  rule_comparisons: RuleComparison[];
}

export interface TelephonyCall {
  call_sid: string;
  provider: 'twilio';
  from_number: string;
  to_number: string;
  call_status: string;
  recording_url?: string;
  duration_seconds?: number;
  created_at: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}
