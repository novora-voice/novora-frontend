import { request } from './apiClient';
import {
  EndSessionResponse,
  StartSessionPayload,
  StartSessionResponse,
  SubmitTurnPayload,
  SubmitTurnResponse,
  VoxiaEvent,
  VoxiaSession,
  VoxiaStatusResponse,
} from '@/types/voxia';

export const voxiaApi = {
  async getStatus(): Promise<VoxiaStatusResponse> {
    return request<VoxiaStatusResponse>('/api/v1/voxia/status');
  },

  async startSession(payload?: StartSessionPayload): Promise<StartSessionResponse> {
    return request<StartSessionResponse>('/api/v1/voxia/sessions', {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  },

  async getSession(sessionId: string): Promise<VoxiaSession> {
    return request<VoxiaSession>(`/api/v1/voxia/sessions/${encodeURIComponent(sessionId)}`);
  },

  async submitTurn(sessionId: string, payload: SubmitTurnPayload): Promise<SubmitTurnResponse> {
    return request<SubmitTurnResponse>(
      `/api/v1/voxia/sessions/${encodeURIComponent(sessionId)}/turns`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async endSession(sessionId: string): Promise<EndSessionResponse> {
    return request<EndSessionResponse>(
      `/api/v1/voxia/sessions/${encodeURIComponent(sessionId)}/end`,
      {
        method: 'POST',
      }
    );
  },

  async getEvents(sessionId: string): Promise<{ session_id: string; events: VoxiaEvent[] }> {
    return request<{ session_id: string; events: VoxiaEvent[] }>(
      `/api/v1/voxia/sessions/${encodeURIComponent(sessionId)}/events`
    );
  },

  async transcribeAudio(
    audioBase64: string,
    mimeType = 'audio/webm'
  ): Promise<{ text: string; model: string; latency_ms: number }> {
    return request<{ text: string; model: string; latency_ms: number }>('/api/v1/voxia/stt', {
      method: 'POST',
      body: JSON.stringify({
        audio_base64: audioBase64,
        audio_mime_type: mimeType,
      }),
    });
  },
};

