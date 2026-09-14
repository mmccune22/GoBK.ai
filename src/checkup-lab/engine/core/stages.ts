import type { EngineState, EvaluationContext, PublicResult, RuleProvider, StepId } from './types.js';
import { validateInput, emptyAnswers } from './validation.js';
import { calculateSnapshot, planSupportedWork } from './metrics.js';
import { disabledRuleProvider, packIsEnabled } from './rules.js';
import { buildFindings, chooseReading, legalLimitations, nextStepsFor, snapshotLimitations, SCOPE_NOTICE, URGENCY_COPY } from './content.js';
import { assertPublicResult } from './output.js';

export function initialState(rawInput: unknown, context: EvaluationContext, engine: EngineState['engine']): EngineState {
  return {
    rawInput: structuredClone(rawInput), context: { ...context }, engine, validation: null,
    activeRuleIds: [], plan: null, snapshot: null, findings: [], limitations: [], readingTopics: [], nodeIds: [], result: null,
  };
}
function updated(state: EngineState, node: StepId, update: Partial<EngineState>): EngineState {
  return { ...state, ...update, nodeIds: [...state.nodeIds, node] };
}
function requireValidation(state: EngineState) {
  if (!state.validation) throw new Error('Validation step has not run.');
  return state.validation;
}
function requirePlan(state: EngineState) {
  if (!state.plan) throw new Error('Planning step has not run.');
  return state.plan;
}
function requireSnapshot(state: EngineState) {
  if (!state.snapshot) throw new Error('Snapshot step has not run.');
  return state.snapshot;
}
export function routeAfterSnapshot(state: EngineState): 'evaluate_reviewed_rules' | 'record_legal_limits' {
  return state.activeRuleIds.length > 0 ? 'evaluate_reviewed_rules' : 'record_legal_limits';
}
/** Pure, separately testable stage functions are also the actual LangGraph nodes. */
export function createStages(provider: RuleProvider = disabledRuleProvider) {
  return {
    validate_and_preserve_urgency(state: EngineState): EngineState {
      return updated(state, 'validate_and_preserve_urgency', { validation: validateInput(state.rawInput) });
    },
    load_capabilities(state: EngineState): EngineState {
      // Only a trusted provider can supply metadata. Request fields cannot enable packs.
      const valid = requireValidation(state).envelopeValid;
      const active = valid ? provider.list().filter(pack => packIsEnabled(pack, state.context.asOfDate)).map(pack => pack.id) : [];
      return updated(state, 'load_capabilities', { activeRuleIds: [...new Set(active)] });
    },
    plan_supported_work(state: EngineState): EngineState {
      return updated(state, 'plan_supported_work', { plan: planSupportedWork(requireValidation(state)) });
    },
    calculate_snapshot(state: EngineState): EngineState {
      return updated(state, 'calculate_snapshot', { snapshot: calculateSnapshot(requireValidation(state).answers, requirePlan(state)) });
    },
    evaluate_reviewed_rules(state: EngineState): EngineState {
      // The only supplied nonempty provider is test-only and makes no legal findings.
      provider.evaluate(state.activeRuleIds, requireValidation(state).answers);
      return updated(state, 'evaluate_reviewed_rules', { limitations: legalLimitations() });
    },
    record_legal_limits(state: EngineState): EngineState {
      return updated(state, 'record_legal_limits', { limitations: legalLimitations() });
    },
    assemble_findings(state: EngineState): EngineState {
      const snapshot = requireSnapshot(state); const validation = requireValidation(state);
      return updated(state, 'assemble_findings', {
        findings: buildFindings(snapshot, validation), readingTopics: chooseReading(validation, snapshot),
        limitations: [...legalLimitations(), ...snapshotLimitations(requirePlan(state))],
      });
    },
    render_result(state: EngineState): EngineState {
      const validation = requireValidation(state); const plan = requirePlan(state);
      const nodeIds: StepId[] = [...state.nodeIds, 'render_result'];
      const result: PublicResult = {
        schemaVersion: '1', prototype: true, contentReview: 'draft_not_attorney_approved',
        status: validation.errors.length || plan.missing.length || !validation.envelopeValid ? 'needs_input' : 'result',
        inputRevision: validation.inputRevision, evaluation: { ...state.context },
        urgency: { response: validation.answers.urgencyResponse, warnings: validation.answers.urgentEvents.map(id => ({ ...URGENCY_COPY[id] })) },
        snapshot: requireSnapshot(state), findings: state.findings, readingTopics: state.readingTopics,
        limitations: state.limitations, nextSteps: nextStepsFor(validation, plan), fieldErrors: validation.errors,
        workflow: { engine: state.engine, steps: nodeIds }, scopeNotice: SCOPE_NOTICE,
      };
      return updated(state, 'render_result', { result });
    },
    validate_public_result(state: EngineState): EngineState {
      if (state.result === null) throw new Error('Result step has not run.');
      const nodeIds: StepId[] = [...state.nodeIds, 'validate_public_result'];
      const result = { ...state.result, workflow: { engine: state.engine, steps: nodeIds } };
      assertPublicResult(result);
      return updated(state, 'validate_public_result', { result });
    },
  };
}
/** No caught exception text, stack, original payload, or stale metrics are returned. */
export function unavailableResult(raw: unknown, context: EvaluationContext, engine: EngineState['engine']): PublicResult {
  let validation;
  try { validation = validateInput(raw); } catch { validation = validateInput(null); }
  const answers = emptyAnswers();
  const result: PublicResult = {
    schemaVersion: '1', prototype: true, contentReview: 'draft_not_attorney_approved', status: 'unavailable',
    inputRevision: validation.inputRevision, evaluation: { ...context },
    urgency: { response: validation.answers.urgencyResponse, warnings: validation.answers.urgentEvents.map(id => ({ ...URGENCY_COPY[id] })) },
    snapshot: { status: 'unavailable', inputs: { monthlyTakeHome: answers.monthlyTakeHome, monthlyExpenses: answers.monthlyExpenses, additionalDebtPayments: answers.additionalDebtPayments }, beforeAdditionalPayments: null, afterAdditionalPayments: null, classification: 'not_calculated' },
    findings: [], readingTopics: [], fieldErrors: validation.errors,
    limitations: [{ id: 'technical_unavailable', topic: 'technical', status: 'unavailable', body: 'The assessment could not be completed because of a technical problem. This is not a conclusion about your finances or legal options.' }],
    nextSteps: ['Try again after checking the application. Do not wait on this tool to address a reported urgent issue.'],
    workflow: { engine, steps: [] }, scopeNotice: SCOPE_NOTICE,
  };
  assertPublicResult(result);
  return result;
}
