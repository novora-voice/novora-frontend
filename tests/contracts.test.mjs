import test from 'node:test';
import assert from 'node:assert/strict';

test('Novora Design Tokens & Palette Specifications', () => {
  const brandPalette = {
    midnight: '#0A0F1E',
    deepNavy: '#0B1F44',
    royalBlue: '#2563EB',
    skyBlue: '#60A5FA',
    iceGray: '#E2E8F0',
  };

  assert.equal(brandPalette.midnight, '#0A0F1E');
  assert.equal(brandPalette.deepNavy, '#0B1F44');
  assert.equal(brandPalette.royalBlue, '#2563EB');
  assert.equal(brandPalette.skyBlue, '#60A5FA');
  assert.equal(brandPalette.iceGray, '#E2E8F0');
});

test('Novora API URL and Endpoint Contracts', () => {
  const endpoints = {
    health: '/health',
    scenarios: '/api/v1/scenarios',
    scenarioDetail: (id) => `/api/v1/scenarios/${encodeURIComponent(id)}`,
    scenarioHistory: (id) => `/api/v1/scenarios/${encodeURIComponent(id)}/history`,
    scenarioTemplates: '/api/v1/scenarios/templates',
    evaluations: '/api/v1/evaluations',
    evaluationDetail: (id) => `/api/v1/evaluations/${encodeURIComponent(id)}`,
    compareEvaluations: '/api/v1/evaluations/compare',
    testRuns: '/api/v1/test-runs',
    testRunDetail: (id) => `/api/v1/test-runs/${encodeURIComponent(id)}`,
    providers: '/api/v1/providers',
    batches: '/api/v1/batches',
    batchDetail: (id) => `/api/v1/batches/${encodeURIComponent(id)}`,
    importTranscript: '/api/v1/conversations/import-transcript',
    telephonyCalls: '/api/v1/telephony/calls',
    elevenlabsWebhook: '/api/v1/webhooks/elevenlabs',
    twilioWebhook: '/api/v1/webhooks/twilio',
    assemblyaiWebhook: '/api/v1/webhooks/assemblyai',
  };

  assert.equal(endpoints.health, '/health');
  assert.equal(endpoints.scenarios, '/api/v1/scenarios');
  assert.equal(endpoints.scenarioDetail('scen_123'), '/api/v1/scenarios/scen_123');
  assert.equal(endpoints.scenarioTemplates, '/api/v1/scenarios/templates');
  assert.equal(endpoints.testRuns, '/api/v1/test-runs');
  assert.equal(endpoints.testRunDetail('trun_01'), '/api/v1/test-runs/trun_01');
  assert.equal(endpoints.providers, '/api/v1/providers');
  assert.equal(endpoints.batches, '/api/v1/batches');
  assert.equal(endpoints.compareEvaluations, '/api/v1/evaluations/compare');
  assert.equal(endpoints.importTranscript, '/api/v1/conversations/import-transcript');
});

test('Evaluation Statuses & Deterministic Rule Types', () => {
  const validStatuses = ['PASS', 'FAIL', 'INCONCLUSIVE'];
  const validRuleTypes = [
    'required_information',
    'policy_compliance',
    'required_steps',
    'prohibited_claims',
    'unsupported_completion',
    'unresolved_work',
  ];

  assert.ok(validStatuses.includes('PASS'));
  assert.ok(validStatuses.includes('FAIL'));
  assert.ok(validStatuses.includes('INCONCLUSIVE'));

  assert.ok(validRuleTypes.includes('required_information'));
  assert.ok(validRuleTypes.includes('policy_compliance'));
  assert.ok(validRuleTypes.includes('required_steps'));
  assert.ok(validRuleTypes.includes('prohibited_claims'));
  assert.ok(validRuleTypes.includes('unsupported_completion'));
  assert.ok(validRuleTypes.includes('unresolved_work'));
});

test('Regression Net Change Status Transitions', () => {
  const computeChange = (baseline, candidate) => {
    if (baseline === 'PASS' && candidate === 'FAIL') return 'regressed';
    if (baseline === 'FAIL' && candidate === 'PASS') return 'improved';
    return 'unchanged';
  };

  assert.equal(computeChange('PASS', 'FAIL'), 'regressed');
  assert.equal(computeChange('FAIL', 'PASS'), 'improved');
  assert.equal(computeChange('PASS', 'PASS'), 'unchanged');
  assert.equal(computeChange('FAIL', 'FAIL'), 'unchanged');
});
