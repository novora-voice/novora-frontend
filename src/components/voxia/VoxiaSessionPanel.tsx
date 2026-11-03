'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Square,
  Play,
  Volume2,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Wrench,
  Bot,
  User,
} from 'lucide-react';
import { EvaluationScenario, VoiceAgent } from '@/types/api';
import {
  VoxiaSession,
  VoxiaTurn,
  VoxiaStatusResponse,
} from '@/types/voxia';
import { voxiaApi } from '@/lib/voxiaApi';

interface VoxiaSessionPanelProps {
  scenarios: EvaluationScenario[];
  agents: VoiceAgent[];
  onEvaluateConversation?: (conversationId: string, scenarioId?: string) => void;
  onToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const VoxiaSessionPanel: React.FC<VoxiaSessionPanelProps> = ({
  scenarios,
  agents,
  onEvaluateConversation,
  onToast,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [session, setSession] = useState<VoxiaSession | null>(null);
  const [statusInfo, setStatusInfo] = useState<VoxiaStatusResponse | null>(null);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioPlayingTurnId, setAudioPlayingTurnId] = useState<string | null>(null);
  const [lastEndedConversationId, setLastEndedConversationId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    voxiaApi
      .getStatus()
      .then(setStatusInfo)
      .catch((err) => console.warn('Could not fetch Voxia status:', err));
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.turns]);

  const handleStartSession = async () => {
    try {
      setIsProcessing(true);
      const res = await voxiaApi.startSession({
        scenario_id: selectedScenarioId || undefined,
        agent_id: selectedAgentId || undefined,
      });
      const activeSession = await voxiaApi.getSession(res.session_id);
      setSession(activeSession);
      setLastEndedConversationId(null);
      onToast?.(`Voxia session ${res.session_id.slice(0, 8)} started!`, 'success');
    } catch (err: unknown) {
      onToast?.(`Failed to start session: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    try {
      setIsProcessing(true);
      const res = await voxiaApi.endSession(session.id);
      const updated = await voxiaApi.getSession(session.id);
      setSession(updated);
      if (res.conversation_id) {
        setLastEndedConversationId(res.conversation_id);
        onToast?.('Session ended and conversation saved to Novora!', 'success');
      } else {
        onToast?.('Session ended.', 'info');
      }
    } catch (err: unknown) {
      onToast?.(`Failed to end session: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudioBase64 = (base64Audio: string, mimeType = 'audio/flac', turnId?: string) => {
    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(url);
      audioPlayerRef.current = audio;
      if (turnId) setAudioPlayingTurnId(turnId);

      audio.onended = () => {
        setAudioPlayingTurnId(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setAudioPlayingTurnId(null);
        URL.revokeObjectURL(url);
      };
      audio.play().catch((err) => console.warn('Audio auto-play blocked or failed:', err));
    } catch (err) {
      console.error('Error decoding/playing audio:', err);
    }
  };

  const handleSubmitTextTurn = async (textToSubmit?: string) => {
    const text = textToSubmit ?? inputText;
    if (!session || !text.trim() || isProcessing) return;

    try {
      setIsProcessing(true);
      setInputText('');
      const res = await voxiaApi.submitTurn(session.id, { text: text.trim() });
      const updated = await voxiaApi.getSession(session.id);
      setSession(updated);

      if (res.audio_base64) {
        playAudioBase64(res.audio_base64, res.audio_content_type || 'audio/flac', res.agent_turn.id);
      }
    } catch (err: unknown) {
      onToast?.(`Turn failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      onToast?.('Microphone access is not supported in this browser.', 'error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioTurn(audioBlob, mediaRecorder.mimeType || 'audio/webm');
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: unknown) {
      onToast?.(`Microphone permission denied: ${err instanceof Error ? err.message : 'Check settings'}`, 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioTurn = async (audioBlob: Blob, mimeType: string) => {
    if (!session) return;
    try {
      setIsProcessing(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        if (!base64Data) {
          onToast?.('Failed to encode audio for inference.', 'error');
          setIsProcessing(false);
          return;
        }

        try {
          const res = await voxiaApi.submitTurn(session.id, {
            audio_base64: base64Data,
            audio_mime_type: mimeType,
          });
          const updated = await voxiaApi.getSession(session.id);
          setSession(updated);

          if (res.audio_base64) {
            playAudioBase64(res.audio_base64, res.audio_content_type || 'audio/flac', res.agent_turn.id);
          }
        } catch (err: unknown) {
          onToast?.(`Audio inference failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (err: unknown) {
      setIsProcessing(false);
      onToast?.(`Could not process recorded audio: ${err instanceof Error ? err.message : 'Unknown'}`, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Remote Inference Badge bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
            <Cpu size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Voxia Remote Inference Architecture
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Remote Only (Zero Local Inference)
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              STT: <span className="font-mono text-purple-300">{statusInfo?.stt_model || 'openai/whisper-large-v3'}</span> |
              LLM: <span className="font-mono text-purple-300">{statusInfo?.llm_model || 'meta-llama/Llama-3.1-8B-Instruct'}</span> |
              TTS: <span className="font-mono text-purple-300">{statusInfo?.tts_model || 'facebook/mms-tts-eng'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                session.status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
              }`}
            >
              Session: {session.status.toUpperCase()} ({session.turns.length} turns)
            </span>
          )}
        </div>
      </div>

      {/* Main interactive panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Session Configuration & Tools */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Session Setup
            </h3>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Evaluation Scenario
              </label>
              <select
                disabled={session?.status === 'active'}
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="w-full text-sm rounded-xl px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] disabled:opacity-50"
              >
                <option value="">None (Standalone Demo)</option>
                {scenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                Target Agent Profile
              </label>
              <select
                disabled={session?.status === 'active'}
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full text-sm rounded-xl px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] disabled:opacity-50"
              >
                <option value="">Default Voxia Agent</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.provider})
                  </option>
                ))}
              </select>
            </div>

            {!session || session.status === 'ended' ? (
              <button
                onClick={handleStartSession}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-purple-600 hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Start Voice Session
              </button>
            ) : (
              <button
                onClick={handleEndSession}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                <Square size={16} />
                End Session
              </button>
            )}

            {lastEndedConversationId && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                  <CheckCircle2 size={14} />
                  Conversation Ready for Evaluation
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Persisted as conversation ID <span className="font-mono text-purple-300">{lastEndedConversationId.slice(0, 12)}</span>
                </p>
                {onEvaluateConversation && (
                  <button
                    onClick={() => onEvaluateConversation(lastEndedConversationId, selectedScenarioId)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-500"
                  >
                    Evaluate with Novora <ArrowRight size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Business Tool Registry Box */}
          <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3">
            <div className="flex items-center gap-2">
              <Wrench size={16} className="text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Authorized Business Tools
              </h4>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-amber-300">
                <span>lookup_order</span>
                <span className="text-[10px] text-zinc-400">order_id: string</span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Retrieves real order fixture records (e.g. <span className="font-mono text-purple-300">ORD-1001</span>, <span className="font-mono text-purple-300">ORD-1002</span>, <span className="font-mono text-purple-300">ORD-1003</span>).
              </p>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Interactive Conversation & Audio Controls */}
        <div className="lg:col-span-2 flex flex-col h-[640px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/50">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                Live Voice Transcript & Evidence
              </span>
            </div>
            {isProcessing && (
              <div className="flex items-center gap-1.5 text-xs text-purple-400">
                <RefreshCw size={13} className="animate-spin" />
                <span>Remote Inference Processing...</span>
              </div>
            )}
          </div>

          {/* Transcript List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4">
            {!session || session.turns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                  <Mic size={24} />
                </div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  Voice Session Ready
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm">
                  Start the session and speak into your microphone or type a message. Speech will be transcribed remotely via Whisper, routed through LangGraph, and spoken back via Hugging Face TTS.
                </p>
              </div>
            ) : (
              session.turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex flex-col ${turn.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 ${
                      turn.role === 'user'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] opacity-75">
                      <div className="flex items-center gap-1.5 font-medium">
                        {turn.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                        <span>{turn.role === 'user' ? 'Customer' : 'Voxia Agent'}</span>
                        {turn.audio_provided && <Volume2 size={12} className="text-emerald-300" />}
                      </div>
                      <span className="font-mono text-[10px]">
                        {new Date(turn.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{turn.content}</p>

                    {/* Tool Calls Execution Evidence Card */}
                    {turn.tool_calls && turn.tool_calls.length > 0 && (
                      <div className="mt-2 p-2.5 rounded-xl bg-black/20 border border-white/10 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                          <Wrench size={13} />
                          <span>Tool Call Executed: {turn.tool_calls[0].tool_name}</span>
                        </div>
                        <div className="font-mono text-[11px] text-zinc-300">
                          args: {JSON.stringify(turn.tool_calls[0].arguments)}
                        </div>
                        {turn.tool_calls[0].result !== undefined && (
                          <div className="p-1.5 rounded bg-black/30 font-mono text-[10px] text-emerald-300 overflow-x-auto">
                            Result: {JSON.stringify(turn.tool_calls[0].result)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Quick Demo Prompts */}
          {session?.status === 'active' && (
            <div className="px-5 py-2 flex flex-wrap gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
              <span className="text-[11px] text-[var(--text-secondary)] self-center">Try:</span>
              <button
                onClick={() => handleSubmitTextTurn('Hi, I need help checking my order.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-purple-500"
              >
                &ldquo;Hi, check my order&rdquo;
              </button>
              <button
                onClick={() => handleSubmitTextTurn('My order number is ORD-1001.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-purple-500"
              >
                &ldquo;Order ORD-1001&rdquo;
              </button>
              <button
                onClick={() => handleSubmitTextTurn('Thank you, that is all I needed.')}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-purple-500"
              >
                &ldquo;Thank you, goodbye&rdquo;
              </button>
            </div>
          )}

          {/* Voice Input & Text Control Bar */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/70 flex items-center gap-3">
            <button
              disabled={!session || session.status !== 'active' || isProcessing}
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center justify-center h-11 w-11 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                  : 'bg-purple-600/10 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-500/20'
              } disabled:opacity-40`}
              title={isRecording ? 'Stop Recording' : 'Speak via Microphone'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <input
              type="text"
              disabled={!session || session.status !== 'active' || isProcessing}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmitTextTurn();
              }}
              placeholder={
                session?.status === 'active'
                  ? isRecording
                    ? 'Listening... Click mic to send audio'
                    : 'Type a message or click mic to speak...'
                  : 'Start a session to talk with Voxia'
              }
              className="flex-1 text-sm rounded-xl px-4 py-2.5 border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />

            <button
              disabled={!session || session.status !== 'active' || !inputText.trim() || isProcessing}
              onClick={() => handleSubmitTextTurn()}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

