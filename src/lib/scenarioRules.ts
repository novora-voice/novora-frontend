import { RuleConfig } from '@/types/api';

export function buildScenarioRules(rules: RuleConfig[]): RuleConfig[] {
  return rules.map((rule) => {
    const hasExplicitCondition = typeof rule.parameters.condition === 'string';
    const condition = String(hasExplicitCondition ? rule.parameters.condition : rule.description ?? '').trim();
    const parameters: Record<string, unknown> = {
      ...rule.parameters,
      condition,
      severity: String(rule.parameters.severity ?? 'high').toLowerCase(),
    };
    const values = condition.split(',').map((value) => value.trim()).filter(Boolean);

    if (hasExplicitCondition && rule.rule_type === 'required_information' && values.length) {
      parameters.required_fields = values;
    } else if (hasExplicitCondition && rule.rule_type === 'policy_compliance' && condition && Number.isFinite(Number(condition))) {
      parameters.max_refund_amount = Number(condition);
    } else if (hasExplicitCondition && rule.rule_type === 'required_steps' && values.length) {
      parameters.steps = values;
    } else if (hasExplicitCondition && rule.rule_type === 'prohibited_claims' && values.length) {
      parameters.prohibited_patterns = values;
    } else if (hasExplicitCondition && rule.rule_type === 'unsupported_completion' && condition) {
      parameters.action_type = condition;
    } else if (hasExplicitCondition && rule.rule_type === 'prohibited_phrase' && values.length) {
      parameters.prohibited_patterns = values;
    } else if (hasExplicitCondition && rule.rule_type === 'required_phrase' && values.length) {
      parameters.phrases = values;
    } else if (hasExplicitCondition && rule.rule_type === 'expected_tool_call' && values.length) {
      parameters.tools = values;
    } else if (hasExplicitCondition && rule.rule_type === 'prohibited_tool_call' && values.length) {
      parameters.forbidden_tools = values;
    } else if (hasExplicitCondition && rule.rule_type === 'required_closing' && values.length) {
      parameters.closing_patterns = values;
    } else if (hasExplicitCondition && rule.rule_type === 'required_escalation' && values.length) {
      parameters.escalation_keywords = values;
    } else if (hasExplicitCondition && rule.rule_type === 'required_question' && values.length) {
      parameters.questions = values;
    } else if (hasExplicitCondition && rule.rule_type === 'turn_constraints' && condition && Number.isFinite(Number(condition))) {
      parameters.max_turns = Number(condition);
    }

    const name = rule.rule_type.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
    return { ...rule, name: rule.name || name, description: condition, parameters };
  });
}
