import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import type { Answers, EngineState, EvaluationContext, Plan, PublicResult, Snapshot, StepId } from './engine/core/types.js';
import { createStages, initialState } from './engine/core/stages.js';
import { assertPublicResult } from './engine/core/output.js';
import { validateInput } from './engine/core/validation.js';
import { createCheckupGraph } from './engine/langgraph/graph.js';
import { PREPARATION_IDS } from './engine/core/preparation.js';

export interface LabConfig {
  schemaVersion: 1;
  title: string;
  reviewNote: string;
  limitPlacement: 'after_capabilities' | 'before_calculation' | 'after_calculation';
  checkpointPlacement: 'off' | 'after_validation' | 'after_calculation' | 'before_rendering';
  calculationScope: 'full' | 'before_only';
}
export const defaultConfig: Readonly<LabConfig> = Object.freeze({
  schemaVersion: 1,
  title: 'Checkup workflow draft',
  reviewNote: '',
  limitPlacement: 'after_calculation',
  checkpointPlacement: 'off',
  calculationScope: 'full',
});
const configKeys = Object.keys(defaultConfig);
const oneOf = (value: unknown, choices: string[]) => typeof value === 'string' && choices.includes(value);
const safeText = (value: unknown, max: number) => typeof value === 'string' && value.length <= max && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(value);

/** These options change a draft graph. They cannot inject code or enable legal rules. */
export function validateConfig(value: unknown): LabConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The workflow draft must be an object.');
  const config = value as Record<string, unknown>;
  const keys = Object.keys(config);
  if (keys.length !== configKeys.length || keys.some(key => !configKeys.includes(key))) throw new Error('The workflow draft contains missing or unsupported settings.');
  if (config.schemaVersion !== 1) throw new Error('This workflow draft version is not supported.');
  if (!safeText(config.title, 100) || !(config.title as string).trim()) throw new Error('Use a workflow title of 1 to 100 characters.');
  if (!safeText(config.reviewNote, 600)) throw new Error('Use a review note of no more than 600 characters.');
  if (!oneOf(config.limitPlacement, ['after_capabilities', 'before_calculation', 'after_calculation'])) throw new Error('Choose one of the supported positions for legal limits.');
  if (!oneOf(config.checkpointPlacement, ['off', 'after_validation', 'after_calculation', 'before_rendering'])) throw new Error('Choose one of the supported review checkpoint positions.');
  if (!oneOf(config.calculationScope, ['full', 'before_only'])) throw new Error('Choose one of the supported calculation scopes.');
  return { ...config } as unknown as LabConfig;
}
export function importConfig(jsonText: string): LabConfig {
  if (typeof jsonText !== 'string' || jsonText.length > 12_000) throw new Error('The workflow draft file is too large.');
  let value: unknown;
  try { value = JSON.parse(jsonText); } catch { throw new Error('The workflow draft is not valid JSON.'); }
  return validateConfig(value);
}
export function exportConfig(config: unknown): string {
  return JSON.stringify(validateConfig(config), null, 2);
}

export const checkpointId = 'draft_review_checkpoint';
export function buildOrder(value: unknown = defaultConfig): string[] {
  const config = validateConfig(value);
  const order: string[] = ['validate_and_preserve_urgency', 'load_capabilities'];
  if (config.limitPlacement === 'after_capabilities') order.push('record_legal_limits');
  order.push('plan_supported_work');
  if (config.limitPlacement === 'before_calculation') order.push('record_legal_limits');
  order.push('calculate_snapshot');
  if (config.limitPlacement === 'after_calculation') order.push('record_legal_limits');
  order.push('assemble_findings', 'render_result', 'validate_public_result');
  const position = config.checkpointPlacement === 'after_validation' ? order.indexOf('validate_and_preserve_urgency') + 1
    : config.checkpointPlacement === 'after_calculation' ? order.indexOf('calculate_snapshot') + 1
      : config.checkpointPlacement === 'before_rendering' ? order.indexOf('render_result') : -1;
  if (position >= 0) order.splice(position, 0, checkpointId);
  return order;
}

export interface LabStep {
  nodeId: string;
  coreStepIds: StepId[];
  inputRevision: number | null;
  validation: null | { envelopeValid: boolean; errorFields: string[]; urgencyIds: string[] };
  guidanceInputs: null | Pick<Answers,
    'debtKinds' | 'debtSituation' | 'mainGoal' | 'incomeRegularity' | 'securedArrears' | 'priorBankruptcy'
    | 'taxDebt' | 'supportDebt' | 'studentDebt' | 'unsecuredDebt'
    | 'maritalStatus' | 'spouseFiling' | 'householdSize' | 'grossMonthlyIncomeBand'
    | 'homeOwnership' | 'mortgageStatus' | 'homeEquity' | 'vehicleOwnership'
    | 'vehicleLoanStatus' | 'vehicleEquity' | 'significantAssets' | 'priorBankruptcyRecency'>;
  guidance: EngineState['findings'];
  plan: Plan | null;
  snapshot: Snapshot | null;
  findingCount: number;
  result: PublicResult | null;
}
export interface LabObserver {
  before?: (nodeId: string) => void | Promise<void>;
  after?: (step: LabStep) => void | Promise<void>;
}
export interface LabRun {
  engine: 'langgraph';
  result: PublicResult;
  order: string[];
  steps: LabStep[];
  configuration: LabConfig;
  draftNotes: string[];
}

const State = Annotation.Root({
  rawInput: Annotation<EngineState['rawInput']>(),
  context: Annotation<EngineState['context']>(),
  engine: Annotation<EngineState['engine']>(),
  validation: Annotation<EngineState['validation']>(),
  activeRuleIds: Annotation<EngineState['activeRuleIds']>(),
  plan: Annotation<EngineState['plan']>(),
  snapshot: Annotation<EngineState['snapshot']>(),
  findings: Annotation<EngineState['findings']>(),
  limitations: Annotation<EngineState['limitations']>(),
  readingTopics: Annotation<EngineState['readingTopics']>(),
  nodeIds: Annotation<EngineState['nodeIds']>(),
  result: Annotation<EngineState['result']>(),
});

function assertSyntheticEnvelope(raw: unknown): void {
  if (!validateInput(raw).envelopeValid) throw new Error('This lab accepts only the supported invented-example request format.');
}
function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error('The draft run was stopped.');
}
function assertDiagnosticsDisabled(): void {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  for (const key of ['LANGSMITH_TRACING', 'LANGCHAIN_TRACING', 'LANGCHAIN_TRACING_V2', 'LANGCHAIN_VERBOSE']) {
    const value = env[key]?.toLowerCase();
    if (value && value !== 'false' && value !== '0') throw new Error('Tracing and verbose diagnostics must be disabled in the workflow lab.');
  }
}
/** Inspect only a selected projection of fresh synthetic state, never the raw request. */
function project(nodeId: string, state: EngineState): LabStep {
  return structuredClone({
    nodeId,
    coreStepIds: state.nodeIds,
    inputRevision: state.validation?.inputRevision ?? null,
    validation: state.validation ? {
      envelopeValid: state.validation.envelopeValid,
      errorFields: state.validation.errors.map(error => error.field),
      urgencyIds: state.validation.answers.urgentEvents,
    } : null,
    guidanceInputs: state.validation ? {
      debtKinds: state.validation.answers.debtKinds,
      debtSituation: state.validation.answers.debtSituation,
      mainGoal: state.validation.answers.mainGoal,
      incomeRegularity: state.validation.answers.incomeRegularity,
      securedArrears: state.validation.answers.securedArrears,
      priorBankruptcy: state.validation.answers.priorBankruptcy,
      taxDebt: state.validation.answers.taxDebt,
      supportDebt: state.validation.answers.supportDebt,
      studentDebt: state.validation.answers.studentDebt,
      unsecuredDebt: state.validation.answers.unsecuredDebt,
      maritalStatus: state.validation.answers.maritalStatus,
      spouseFiling: state.validation.answers.spouseFiling,
      householdSize: state.validation.answers.householdSize,
      grossMonthlyIncomeBand: state.validation.answers.grossMonthlyIncomeBand,
      homeOwnership: state.validation.answers.homeOwnership,
      mortgageStatus: state.validation.answers.mortgageStatus,
      homeEquity: state.validation.answers.homeEquity,
      vehicleOwnership: state.validation.answers.vehicleOwnership,
      vehicleLoanStatus: state.validation.answers.vehicleLoanStatus,
      vehicleEquity: state.validation.answers.vehicleEquity,
      significantAssets: state.validation.answers.significantAssets,
      priorBankruptcyRecency: state.validation.answers.priorBankruptcyRecency,
    } : null,
    guidance: state.findings.filter(finding => ['attorney_guidance', 'chapter_guidance', 'bankruptcy_discussion', 'compare_alternatives', 'special_debt_questions', 'secured_property_questions', 'guide_household_review', 'guide_property_review', 'guide_prior_timing_review', 'guide_debt_answers_review', ...PREPARATION_IDS].includes(finding.id)),
    plan: state.plan,
    snapshot: state.snapshot,
    findingCount: state.findings.length,
    result: state.result,
  });
}

/** Fresh, actual LangGraph compilation per draft. All eight core safeguards remain. */
export async function runDraft(raw: unknown, context: EvaluationContext, value: unknown = defaultConfig, observer: LabObserver = {}, signal?: AbortSignal): Promise<LabRun> {
  const config = validateConfig(value);
  assertDiagnosticsDisabled();
  assertSyntheticEnvelope(raw);
  assertNotAborted(signal);
  const order = buildOrder(config);
  const stages = createStages();
  const steps: LabStep[] = [];
  const builder = new StateGraph<typeof State, EngineState, Partial<EngineState>, string>(State);
  for (const nodeId of order) {
    builder.addNode(nodeId, async (state: EngineState) => {
      assertNotAborted(signal);
      await observer.before?.(nodeId);
      assertNotAborted(signal);
      let updated = nodeId === checkpointId ? state : stages[nodeId as keyof typeof stages](state);
      if (nodeId === 'plan_supported_work' && config.calculationScope === 'before_only' && updated.plan) {
        updated = { ...updated, plan: {
          ...updated.plan,
          canComputeAfter: false,
          missing: updated.plan.missing.filter(field => field === 'monthlyTakeHome' || field === 'monthlyExpenses'),
        } };
      }
      const step = project(nodeId, updated);
      steps.push(step);
      await observer.after?.(structuredClone(step));
      assertNotAborted(signal);
      return updated;
    });
  }
  const path = [START, ...order, END];
  for (let index = 1; index < path.length; index++) builder.addEdge(path[index - 1], path[index]);
  const graph = builder.compile(); // No model, checkpointer, persistence, or custom legal provider.
  const state = await graph.invoke(initialState(raw, context, 'langgraph'), { callbacks: [], recursionLimit: 24, ...(signal ? { signal } : {}) });
  assertPublicResult(state.result);
  const expectedCoreOrder = order.filter(nodeId => nodeId !== checkpointId);
  if (JSON.stringify(state.result.workflow.steps) !== JSON.stringify(expectedCoreOrder)) throw new Error('The workflow run did not complete the required safeguards.');
  return {
    engine: 'langgraph', result: state.result, order, steps, configuration: config,
    draftNotes: config.calculationScope === 'before_only' ? ['Draft scope: show income minus recurring expenses only. The additional-payment calculation is deliberately disabled for this experiment.'] : [],
  };
}

/** Baseline runs the unchanged production graph source, not the core-only preview. */
export async function runBaseline(raw: unknown, context: EvaluationContext, signal?: AbortSignal): Promise<LabRun> {
  assertDiagnosticsDisabled();
  assertSyntheticEnvelope(raw);
  assertNotAborted(signal);
  const graph = createCheckupGraph();
  const state = await graph.invoke(initialState(raw, context, 'langgraph'), { callbacks: [], recursionLimit: 24, ...(signal ? { signal } : {}) });
  assertPublicResult(state.result);
  return { engine: 'langgraph', result: state.result, order: [...state.result.workflow.steps], steps: [], configuration: validateConfig(defaultConfig), draftNotes: [] };
}
