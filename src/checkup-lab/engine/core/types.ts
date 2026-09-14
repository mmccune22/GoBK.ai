/** Reporting precision is not independent verification of a person's finances. */
export type MoneyAnswer =
  | { kind: 'exact' | 'estimate'; cents: number }
  | { kind: 'range'; minCents: number; maxCents: number }
  | { kind: 'unknown' | 'not_provided' };
export type MoneyField = 'monthlyTakeHome' | 'monthlyExpenses' | 'additionalDebtPayments';
export type UrgentEvent = 'foreclosure' | 'garnishment' | 'repossession' | 'lawsuit' | 'deadline';
export type DebtKind = 'credit_card' | 'medical' | 'personal_loan' | 'mortgage' | 'auto' | 'student' | 'tax' | 'support' | 'other';
export type DebtSituation = 'keeping_up' | 'falling_behind' | 'borrowing_for_basics' | 'balances_not_shrinking' | 'unknown';
export type MainGoal = 'debt_relief' | 'keep_home' | 'keep_vehicle' | 'stop_collection' | 'unsure';
export type IncomeRegularity = 'regular' | 'irregular' | 'no_current_income' | 'unknown';
export type SecuredArrears = 'none' | 'mortgage' | 'vehicle' | 'both' | 'unknown';
export type PriorBankruptcy = 'yes' | 'no' | 'unknown';
export type FieldName = MoneyField | 'additionalPaymentsSeparate' | 'urgentEvents' | 'debtKinds' | 'debtSituation' | 'mainGoal' | 'incomeRegularity' | 'securedArrears' | 'priorBankruptcy' | '_request';
export interface FieldError { field: FieldName; code: string; message: string }
export interface Answers {
  monthlyTakeHome: MoneyAnswer;
  monthlyExpenses: MoneyAnswer;
  additionalDebtPayments: MoneyAnswer;
  additionalPaymentsSeparate: 'yes' | 'no' | 'unknown' | 'not_provided';
  urgentEvents: UrgentEvent[];
  urgencyResponse: 'selected' | 'none_reported' | 'unknown' | 'not_answered';
  debtKinds: DebtKind[];
  debtSituation: DebtSituation;
  mainGoal: MainGoal;
  incomeRegularity: IncomeRegularity;
  securedArrears: SecuredArrears;
  priorBankruptcy: PriorBankruptcy;
}
export interface Validation {
  inputRevision: number | null;
  envelopeValid: boolean;
  answers: Answers;
  errors: FieldError[];
}
export interface Interval {
  minCents: number;
  maxCents: number;
  precision: 'reported' | 'estimate' | 'range';
}
export interface Snapshot {
  status: 'assessed' | 'insufficient_information' | 'unavailable';
  inputs: Pick<Answers, MoneyField>;
  beforeAdditionalPayments: Interval | null;
  afterAdditionalPayments: Interval | null;
  classification: 'shortfall' | 'remaining' | 'balanced' | 'uncertain' | 'not_calculated';
}
export interface EvaluationContext {
  asOfDate: string;
  implementationVersion: string;
  capabilityManifestVersion: string;
  templateVersion: string;
  contentMapVersion: string;
  locale: 'en-US';
  rounding: 'integer-cents';
}
export interface UrgencyWarning { id: UrgentEvent; title: string; body: string }
export interface Finding {
  id: string;
  title: string;
  body: string;
  evidenceFields: MoneyField[];
  inputRevision: number | null;
}
export interface Limitation {
  id: string;
  topic: 'snapshot' | 'chapter_eligibility' | 'asset_protection' | 'debt_treatment' | 'technical';
  status: 'insufficient_information' | 'not_supported' | 'unavailable';
  body: string;
}
export interface ReadingTopic { id: string; title: string; reason: string; url: string }
export type StepId =
  | 'validate_and_preserve_urgency' | 'load_capabilities' | 'plan_supported_work'
  | 'calculate_snapshot' | 'evaluate_reviewed_rules' | 'record_legal_limits'
  | 'assemble_findings' | 'render_result' | 'validate_public_result';
export interface PublicResult {
  schemaVersion: '1';
  prototype: true;
  contentReview: 'draft_not_attorney_approved';
  status: 'result' | 'needs_input' | 'unavailable';
  inputRevision: number | null;
  evaluation: EvaluationContext;
  urgency: { response: Answers['urgencyResponse']; warnings: UrgencyWarning[] };
  snapshot: Snapshot;
  findings: Finding[];
  readingTopics: ReadingTopic[];
  limitations: Limitation[];
  nextSteps: string[];
  fieldErrors: FieldError[];
  workflow: { engine: 'langgraph' | 'core-preview'; steps: StepId[] };
  scopeNotice: string;
}
export interface RulePack {
  id: string;
  version: string;
  effectiveFrom: string;
  effectiveThrough: string;
  sourceChecked: boolean;
  attorneyReviewed: boolean;
  editorialReviewed: boolean;
  engineeringVerified: boolean;
  enabled: boolean;
  /** No substantive legal module is supplied in this prototype. */
  purpose: 'synthetic_routing_test';
}
export interface RuleProvider {
  list: () => readonly RulePack[];
  evaluate: (ids: readonly string[], answers: Readonly<Answers>) => void;
}
export interface Plan { missing: FieldName[]; canComputeBefore: boolean; canComputeAfter: boolean }
export interface EngineState {
  rawInput: unknown;
  context: EvaluationContext;
  engine: 'langgraph' | 'core-preview';
  validation: Validation | null;
  activeRuleIds: string[];
  plan: Plan | null;
  snapshot: Snapshot | null;
  findings: Finding[];
  limitations: Limitation[];
  readingTopics: ReadingTopic[];
  nodeIds: StepId[];
  result: PublicResult | null;
}
