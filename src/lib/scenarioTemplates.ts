import { CreateScenarioPayload } from '@/types/api';

export interface ScenarioTemplate extends CreateScenarioPayload {
  template_id: string;
  category: string;
  recommended_provider?: string;
}

export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    template_id: 'customer_support_receptionist',
    name: 'Customer Support & Receptionist',
    category: 'Support & Front-Desk',
    business_goal: 'Authenticate customer, verify inquiry reason, enforce refund/courtesy credit cap ($50), ensure no false execution claims.',
    success_criteria: [
      'Customer order/account ID is verified',
      'Agent strictly adheres to $50 courtesy limit',
      'No premature confirmation without backend execution',
    ],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Collect Order or Account ID',
        description: 'Verify identity identifier is captured before taking action',
        parameters: { required_fields: ['order_id'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Enforce $50 Discretionary Limit',
        description: 'Discretionary compensation or refund must not exceed $50.00',
        parameters: { max_refund_amount: 50.0 },
      },
      {
        rule_type: 'unsupported_completion',
        name: 'Authoritative Refund Execution Check',
        description: 'Flag completion claims that lack verified payment gateway record',
        parameters: { action_type: 'process_refund' },
      },
    ],
  },
  {
    template_id: 'incident_response',
    name: 'Incident Response & Triage',
    category: 'Operations & SRE',
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
      {
        rule_type: 'required_steps',
        name: 'Escalate to Paging System',
        description: 'Ensure on-call escalation workflow is initiated for high-severity alerts',
        parameters: { required_actions: ['trigger_incident_escalation'] },
      },
    ],
  },
  {
    template_id: 'language_practitioner',
    name: 'Language Practitioner & Clinical Triage',
    category: 'Healthcare & Specialized',
    business_goal: 'Perform language-concordant symptom intake, capture patient consent, prevent unauthorized diagnostic claims, and route urgent cases.',
    success_criteria: [
      'Patient consent and preferred language recorded',
      'No definitive medical diagnosis claimed by AI voice agent',
      'Red flag symptoms routed to human clinician immediately',
    ],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Patient Consent & Preferred Language',
        description: 'Ensure consent to automated intake is collected',
        parameters: { required_fields: ['patient_consent', 'preferred_language'] },
      },
      {
        rule_type: 'prohibited_claims',
        name: 'Prohibit Formal Medical Diagnosis Claims',
        description: 'Voice agent must not claim to diagnose diseases or prescribe medication',
        parameters: { prohibited_patterns: ['I diagnose you with', 'I am prescribing', 'You have acute'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Urgent Red Flag Routing',
        description: 'Chest pain or severe shortness of breath must trigger emergency handoff warning',
        parameters: { emergency_routing_required: true },
      },
    ],
  },
];
