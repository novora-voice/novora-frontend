import { EvaluationScenario } from '@/types/api';

export const SEED_SCENARIOS: EvaluationScenario[] = [
  {
    id: 'scen_refund_cap',
    name: 'Customer Support & $50 Refund Cap',
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
    id: 'scen_incident_response',
    name: 'Incident Response & Triage',
    business_goal: 'Triage reported outage severity, gather affected service details, escalate P1 incidents without delay, and avoid misleading ETA guarantees.',
    success_criteria: [
      'Incident severity and impact scope categorized',
      'Caller contact and service name collected',
      'P1 incidents escalated to on-call paging service',
      'No unverified resolution time commitments',
    ],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Gather Affected Service & Caller Email',
        description: 'Confirm service component and incident reporter contact',
        parameters: { required_fields: ['service_name', 'caller_email'] },
      },
      {
        rule_type: 'prohibited_claims',
        name: 'No Unverified Resolution ETA Guarantees',
        description: 'Prohibit promising exact restoration within minutes before engineer triage',
        parameters: { prohibited_patterns: ['guaranteed fix in 10 minutes', 'will definitely be back up in 5 minutes'] },
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];
