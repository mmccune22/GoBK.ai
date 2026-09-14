/**
 * Explicit offline domain/UI preview. This is NOT a LangGraph implementation.
 * It calls the same node functions sequentially so arithmetic/UI can be tested
 * without npm access. The actual workflow lives in src/langgraph/graph.ts.
 */
import type { EvaluationContext, PublicResult, RuleProvider } from './types.js';
import { disabledRuleProvider } from './rules.js';
import { createStages, initialState, routeAfterSnapshot, unavailableResult } from './stages.js';
export function evaluateCorePreview(raw: unknown, context: EvaluationContext, provider: RuleProvider = disabledRuleProvider): PublicResult {
  try {
    const stages = createStages(provider);
    let state = initialState(raw, context, 'core-preview');
    state = stages.validate_and_preserve_urgency(state);
    state = stages.load_capabilities(state);
    state = stages.plan_supported_work(state);
    state = stages.calculate_snapshot(state);
    state = stages[routeAfterSnapshot(state)](state);
    state = stages.assemble_findings(state);
    state = stages.render_result(state);
    state = stages.validate_public_result(state);
    if (!state.result) throw new Error('No result.');
    return state.result;
  } catch {
    return unavailableResult(raw, context, 'core-preview');
  }
}
