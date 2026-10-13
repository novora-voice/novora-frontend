import test from 'node:test';
import assert from 'node:assert/strict';

const API_BASE = 'http://127.0.0.1:8000';

test('End-to-End: Health Check', async () => {
  const res = await fetch(`${API_BASE}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'novora-core-api');
});

test('End-to-End: Scenario Creation & Ingestion & Evaluation', async () => {
  // 1. Create a test scenario
  const scenarioPayload = {
    name: 'Discretionary Refund Policy Check',
    business_goal: 'Verify order ID and limit credit to $50',
    success_criteria: ['Order ID present', 'Credit <= $50'],
    rules: [
      {
        rule_type: 'required_information',
        name: 'Collect Order ID',
        parameters: { required_fields: ['order_id'] },
      },
      {
        rule_type: 'policy_compliance',
        name: 'Enforce $50 Credit Cap',
        parameters: { max_refund_amount: 50.0 },
      },
    ],
  };

  const scenRes = await fetch(`${API_BASE}/api/v1/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenarioPayload),
  });
  assert.equal(scenRes.status, 201);
  const scenario = await scenRes.json();
  assert.ok(scenario.id);
  assert.equal(scenario.name, 'Discretionary Refund Policy Check');

  // 2. Import dialogue transcript
  const importRes = await fetch(`${API_BASE}/api/v1/conversations/import-transcript`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenario.id,
      text: 'Customer: Hello, where is my order #9821?\nAgent: I found order #9821. I can issue a $40 courtesy credit.',
      format: 'dialogue_text',
    }),
  });
  assert.equal(importRes.status, 200);
  const conversation = await importRes.json();
  assert.ok(conversation.id);
  assert.equal(conversation.messages.length, 2);

  // 3. Evaluate conversation against scenario
  const evalRes = await fetch(`${API_BASE}/api/v1/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      scenario_id: scenario.id,
      conversation,
    }),
  });
  assert.equal(evalRes.status, 201);
  const report = await evalRes.json();
  assert.ok(report.id);
  assert.equal(report.overall_status, 'PASS');
  assert.equal(report.rule_results.length, 2);
  assert.equal(report.rule_results[0].status, 'PASS');
  assert.equal(report.rule_results[1].status, 'PASS');

  // 4. Retrieve scenario evaluation history
  const historyRes = await fetch(`${API_BASE}/api/v1/scenarios/${scenario.id}/history`);
  assert.equal(historyRes.status, 200);
  const history = await historyRes.json();
  assert.ok(history.length >= 1);
  assert.equal(history[0].id, report.id);
});
