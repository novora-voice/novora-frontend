export type VoxiaSessionStatus = 'active' | 'ended' | 'error';

export type VoxiaTurnRole = 'user' | 'agent' | 'tool' | 'system';

export interface VoxiaToolCallRecord {
  tool_name: string;
  arguments: Record<string, unknown>;
  requested_at: number;
  executed: boolean;
  result?: unknown;
  error?: string | null;
  executed_at?: number | null;
}

export interface VoxiaTurn {
  id: string;
  role: VoxiaTurnRole;
  content: string;
  audio_provided: boolean;
  latency_ms?: number | null;
  tool_calls: VoxiaToolCallRecord[];
  created_at: number;
  metadata?: Record<string, unknown>;
}

export interface VoxiaEvent {
  id: string;
  session_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: number;
}

export interface VoxiaSession {
  id: string;
  scenario_id?: string | null;
  agent_id?: string | null;
  status: VoxiaSessionStatus;
  turns: VoxiaTurn[];
  events: VoxiaEvent[];
  workflow_state: Record<string, unknown>;
  created_at: number;
  ended_at?: number | null;
  metadata?: Record<string, unknown>;
}

export interface StartSessionPayload {
  scenario_id?: string;
  agent_id?: string;
  metadata?: Record<string, unknown>;
}

export interface StartSessionResponse {
  session_id: string;
  status: VoxiaSessionStatus;
  created_at: number;
}

export interface SubmitTurnPayload {
  text?: string;
  audio_base64?: string;
  audio_mime_type?: string;
}

export interface SubmitTurnResponse {
  session_id: string;
  user_turn: VoxiaTurn;
  agent_turn: VoxiaTurn;
  agent_text: string;
  audio_base64?: string | null;
  audio_content_type?: string;
  events: VoxiaEvent[];
}

export interface EndSessionResponse {
  session_id: string;
  status: VoxiaSessionStatus;
  conversation_id?: string | null;
  turn_count: number;
}

export interface VoxiaStatusResponse {
  active_sessions: number;
  stt_configured: boolean;
  tts_configured: boolean;
  stt_model: string;
  tts_model: string;
  llm_model: string;
}

