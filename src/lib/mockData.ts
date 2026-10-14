import {
  EvaluationScenario,
  EvaluationReport,
  TelephonyCall,
} from '@/types/api';

export const SEED_SCENARIOS: EvaluationScenario[] = [
  {
    id: 'scen_refund_cap',
    name: 'Order Dispute & $50 Refund Cap',
    business_goal: 'Authenticate caller order ID, handle delayed shipment claims, strictly cap discretionary refund credits at $50.',
    success_criteria: [
      'Order ID collected from customer',
      'No false completion promises made',
      'Refund credit <= $50',
    ],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Collect Order ID',
        description: 'Verify order identification number is captured before processing credit',
        parameters: { required_fields: ['order_id'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Enforce $50 Credit Cap',
        description: 'Discretionary compensation must not exceed $50.00',
        parameters: { max_refund_amount: 50.0 },
      },
      {
        rule_type: 'prohibited_claims',
        name: 'No False Immediate Transfer Guarantees',
        description: 'Do not guarantee instantaneous cash transfers to card without banking authorization',
        parameters: { prohibited_patterns: ['funds have already been sent to your bank account'] },
      },
      {
        rule_type: 'unsupported_completion',
        name: 'Verify Refund Execution',
        description: 'Verify refund action was logged with an approved payment connector',
        parameters: { action_type: 'process_refund' },
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'scen_billing_cancel',
    name: 'Subscription Cancellation Retention Flow',
    business_goal: 'Acknowledge cancellation request, offer 20% discount offer once, confirm cancellation without hostile deflection.',
    success_criteria: [
      'Customer cancellation intent confirmed',
      'Maximum 1 retention offer presented',
      'Confirmation cancellation email triggered',
    ],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Account Email Verification',
        description: 'Ensure account email is retrieved',
        parameters: { required_fields: ['account_email'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Single Retention Offer Limit',
        description: 'Do not harass caller with more than 1 retention attempt',
        parameters: { max_retention_offers: 1 },
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
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
  {
    call_sid: 'CA9876543210fedcba9876543210fedcba',
    provider: 'twilio',
    from_number: '+12125550143',
    to_number: '+18005550199',
    call_status: 'completed',
    recording_url: 'https://api.twilio.com/2010-04-01/Accounts/ACtest/Recordings/RE456.wav',
    duration_seconds: 88,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];
