import { EvaluationReport, EvaluationScenario, EvaluationStatus } from './api';

export interface AgentConfig {
  id?: string;
  provider_name: string;
  external_agent_id: string;
  name: string;
  system_prompt?: string;
  permitted_tools?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface ScriptedTurn {
  sequence: number;
  user_message: string;
  expected_response_keywords?: string[];
  expected_tools?: string[];
  pause_after_seconds?: number;
}

export interface TestCase {
  id?: string;
  scenario_id: string;
  name: string;
  description?: string;
  scripted_turns: ScriptedTurn[];
  created_at?: string;
}

export interface ToolCallRecord {
  call_id: string;
  tool_name: string;
  arguments: Record<string, unknown>;
  timestamp: string;
  status: 'requested' | 'executed' | 'forbidden' | 'failed';
  execution_time_ms?: number;
  error?: string;
}

export interface NormalizedProviderEvent {
  id: string;
  provider: string;
  event_type: string;
  sequence: number;
  timestamp: string;
  payload: Record<string, unknown>;
  correlation_id?: string;
}

export interface TestRun {
  id: string;
  scenario_id: string;
  test_case_id?: string;
  provider: string;
  agent_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  events?: NormalizedProviderEvent[];
  tool_calls?: ToolCallRecord[];
  conversation_id?: string;
  evaluation_id?: string;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

export interface TestRunExecutionRequest {
  scenario: EvaluationScenario;
  test_case?: TestCase;
  agent: AgentConfig;
  provider_config?: Record<string, unknown>;
  enable_llm_judge?: boolean;
  /** User's plain-English test instructions */
  user_instructions?: string;
  /** Optional scripted turns if user provided structured turns */
  scripted_turns?: ScriptedTurn[];
}

export interface TestRunResponse {
  test_run: TestRun;
  evaluation_report?: EvaluationReport;
}

export interface BatchCreateRequest {
  name: string;
  scenario: EvaluationScenario;
  agent: AgentConfig;
  test_cases?: TestCase[];
  provider_config?: Record<string, unknown>;
}

export interface BatchEvaluation {
  id: string;
  name: string;
  scenario_id: string;
  test_run_ids: string[];
  total_runs: number;
  passed_runs: number;
  failed_runs: number;
  inconclusive_runs: number;
  status: string;
  created_at: string;
}

/** Enriched provider manifest with group and capability flags */
export interface ProviderManifest {
  provider_name: string;
  display_name: string;
  category: string;
  /** 'voice_provider' | 'infrastructure' | 'telephony' */
  provider_group: string;
  supported_capabilities: string[];
  supports_ghost_caller: boolean;
  supports_webhook_contract_test: boolean;
  requires_audio_input: boolean;
  supports_payload_generation: boolean;
  is_live_verified: boolean;
  documentation_url?: string;
}

export interface PayloadGenerationRequest {
  provider: string;
  agent_id: string;
  scenario?: EvaluationScenario;
  scenario_id?: string;
  template_id?: string;
  user_instructions?: string;
  custom_json?: Record<string, unknown>;
  deterministic_rules?: unknown[];
  llm_evaluations?: unknown[];
}

export interface PayloadJudgeVerdict {
  decision: 'pass' | 'revise' | 'reject';
  feedback: string;
  issues: string[];
  confidence: number;
  model_used: string;
}

export interface PayloadPipelineResult {
  status: 'pass' | 'revised' | 'rejected' | 'error';
  provider: string;
  agent_id: string;
  final_payload: Record<string, unknown>;
  revision_count: number;
  history: Array<{
    iteration: number;
    payload: Record<string, unknown>;
    decision: string;
    feedback: string;
    issues: string[];
    model_used: string;
  }>;
  judge_verdict?: PayloadJudgeVerdict;
  schema_validation?: Record<string, unknown>;
  error_message?: string;
}

export interface PayloadValidationRequest {
  provider: string;
  agent_id: string;
  payload: Record<string, unknown>;
  user_instructions?: string;
  scenario_id?: string;
}

export interface PayloadTemplate {
  id: string;
  provider: string;
  name: string;
  description: string;
  payload: Record<string, unknown>;
}
