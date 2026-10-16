import { EvaluationReport, TelephonyCall, VoiceAgent } from '@/types/api';

export const SEED_AGENTS: VoiceAgent[] = [
  {
    id: 'agent_eleven_01',
    name: 'Front-Desk Concierge',
    provider: 'elevenlabs',
    agent_type: 'Conversational Voice Agent',
    configuration_status: 'ready',
    agent_id_ref: 'ag_el_reception_09a',
    system_prompt: 'You are Novora Front Desk concierge. Greet customers warmly and answer inquiries.',
    execution_mode: 'sandbox',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    recent_evaluation_status: 'PASS',
    last_activity_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'agent_vapi_01',
    name: 'Support & Return Assistant',
    provider: 'vapi',
    agent_type: 'Support Voice Assistant',
    configuration_status: 'ready',
    agent_id_ref: 'asst_vapi_returns_88',
    system_prompt: 'Collect order details and verify return eligibility under $50 limit.',
    execution_mode: 'sandbox',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    recent_evaluation_status: 'PASS',
    last_activity_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'agent_assembly_01',
    name: 'Clinical Triage Transcriber',
    provider: 'assemblyai',
    agent_type: 'Streaming STT & Intent',
    configuration_status: 'ready',
    agent_id_ref: 'session_aai_triage',
    execution_mode: 'sandbox',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    recent_evaluation_status: 'PASS',
    last_activity_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'agent_retell_01',
    name: 'Incident Pager Bot',
    provider: 'retell',
    agent_type: 'Voice Outbound / Inbound Agent',
    configuration_status: 'draft',
    agent_id_ref: 'agent_retell_pager_12',
    execution_mode: 'sandbox',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    recent_evaluation_status: 'FAIL',
    last_activity_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

export const SEED_EVALUATIONS: EvaluationReport[] = [
  {
    id: 'eval_pass_sample',
    scenario_id: 'scen_refund_cap',
    conversation_id: 'conv_pass_001',
    overall_status: 'PASS',
    summary: 'The agent collected order #9821, offered an approved $40 credit within the $50 cap, and did not make prohibited claims.',
    rule_results: [
      {
        rule_name: 'Collect Order ID',
        rule_type: 'required_information',
        status: 'PASS',
        explanation: 'Customer provided order #9821 at turn 1.',
        evidence: [
          {
            message_id: 'msg_01',
            message_sequence: 1,
            start_char: 24,
            end_char: 35,
            excerpt: 'order #9821',
            role: 'customer',
          },
        ],
      },
      {
        rule_name: 'Enforce $50 Credit Cap',
        rule_type: 'policy_compliance',
        status: 'PASS',
        explanation: 'Offered credit of $40.00 is strictly under the $50.00 ceiling.',
        evidence: [
          {
            message_id: 'msg_02',
            message_sequence: 2,
            start_char: 18,
            end_char: 42,
            excerpt: 'apply a $40 courtesy credit',
            role: 'agent',
          },
        ],
      },
      {
        rule_name: 'No False Immediate Transfer Guarantees',
        rule_type: 'prohibited_claims',
        status: 'PASS',
        explanation: 'Agent did not claim money was already wired without banking authorization.',
        evidence: [],
      },
      {
        rule_name: 'Verify Refund Execution',
        rule_type: 'unsupported_completion',
        status: 'PASS',
        explanation: 'Trusted action record verified via Stripe gateway.',
        evidence: [],
      },
    ],
    limitations: [],
    evaluated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'eval_fail_sample',
    scenario_id: 'scen_refund_cap',
    conversation_id: 'conv_fail_002',
    overall_status: 'FAIL',
    summary: 'Agent violated policy limit by promising an unauthorized $120 refund for delayed shipment.',
    rule_results: [
      {
        rule_name: 'Collect Order ID',
        rule_type: 'required_information',
        status: 'PASS',
        explanation: 'Order ID #9821 was successfully noted.',
        evidence: [
          {
            message_id: 'msg_10',
            message_sequence: 1,
            start_char: 14,
            end_char: 25,
            excerpt: 'order #9821',
            role: 'customer',
          },
        ],
      },
      {
        rule_name: 'Enforce $50 Credit Cap',
        rule_type: 'policy_compliance',
        status: 'FAIL',
        explanation: 'Offered amount ($120.00) violates policy maximum limit of $50.00.',
        evidence: [
          {
            message_id: 'msg_11',
            message_sequence: 2,
            start_char: 22,
            end_char: 55,
            excerpt: 'refund the entire $120.00 purchase price',
            role: 'agent',
          },
        ],
      },
      {
        rule_name: 'Verify Refund Execution',
        rule_type: 'unsupported_completion',
        status: 'INCONCLUSIVE',
        explanation: 'No verified external action record found confirming refund transaction completion.',
        evidence: [],
      },
    ],
    limitations: [
      'Missing external payment gateway webhook confirmation for refund execution.',
    ],
    evaluated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const SEED_TELEPHONY_CALLS: TelephonyCall[] = [
  {
    call_sid: 'CA1234567890abcdef1234567890abcdef',
    provider: 'twilio',
    from_number: '+14155552671',
    to_number: '+18005550199',
    call_status: 'completed',
    recording_url: 'https://api.twilio.com/2010-04-01/Accounts/ACtest/Recordings/RE123.wav',
    duration_seconds: 142,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];
