import type { PublicResult } from './types.js';
import { hasOnlyKeys, isObject, MAX_INPUT_CENTS, MONEY_FIELDS, parseMoney, URGENT_EVENTS } from './validation.js';
import { classifyInterval } from './metrics.js';
import { READING_URLS, SCOPE_NOTICE } from './content.js';
import { validDate } from './rules.js';

type Check = (value: unknown) => boolean;
const text: Check = value => typeof value === 'string' && value.length <= 4000;
const oneOf = (...choices: readonly unknown[]): Check => value => choices.includes(value);
const arrayOf = (check: Check, max = 32): Check => value => Array.isArray(value) && value.length <= max && value.every(check);
const shape = (fields: Record<string, Check>): Check => value =>
  isObject(value) && Object.keys(value).length === Object.keys(fields).length && hasOnlyKeys(value, Object.keys(fields)) && Object.entries(fields).every(([key, check]) => check(value[key]));
const signedCents: Check = value => typeof value === 'number' && Number.isSafeInteger(value) && Math.abs(value) <= MAX_INPUT_CENTS * 3;
const revision: Check = value => value === null || (typeof value === 'number' && Number.isSafeInteger(value) && value > 0 && value <= 1_000_000);
const money: Check = value => value !== undefined && parseMoney(value) !== null;
const interval: Check = value => value === null || (
  shape({ minCents: signedCents, maxCents: signedCents, precision: oneOf('reported', 'estimate', 'range') })(value)
  && isObject(value) && (value.minCents as number) <= (value.maxCents as number)
  && (value.precision === 'range' || value.minCents === value.maxCents)
);
const allSteps = ['validate_and_preserve_urgency', 'load_capabilities', 'plan_supported_work', 'calculate_snapshot', 'evaluate_reviewed_rules', 'record_legal_limits', 'assemble_findings', 'render_result', 'validate_public_result'];
const context: Check = shape({
  asOfDate: value => typeof value === 'string' && validDate(value),
  implementationVersion: text, capabilityManifestVersion: text, templateVersion: text,
  contentMapVersion: text, locale: oneOf('en-US'), rounding: oneOf('integer-cents'),
});
const publicShape: Check = shape({
  schemaVersion: oneOf('1'), prototype: oneOf(true), contentReview: oneOf('draft_not_attorney_approved'),
  status: oneOf('result', 'needs_input', 'unavailable'), inputRevision: revision, evaluation: context,
  urgency: shape({
    response: oneOf('selected', 'none_reported', 'unknown', 'not_answered'),
    warnings: arrayOf(shape({ id: oneOf(...URGENT_EVENTS), title: text, body: text }), 5),
  }),
  snapshot: shape({
    status: oneOf('assessed', 'insufficient_information', 'unavailable'),
    inputs: shape({ monthlyTakeHome: money, monthlyExpenses: money, additionalDebtPayments: money }),
    beforeAdditionalPayments: interval, afterAdditionalPayments: interval,
    classification: oneOf('shortfall', 'remaining', 'balanced', 'uncertain', 'not_calculated'),
  }),
  findings: arrayOf(shape({ id: text, title: text, body: text, evidenceFields: arrayOf(oneOf(...MONEY_FIELDS), 3), inputRevision: revision })),
  readingTopics: arrayOf(shape({ id: text, title: text, reason: text, url: oneOf(...Object.values(READING_URLS)) }), 5),
  limitations: arrayOf(shape({ id: text, topic: oneOf('snapshot', 'chapter_eligibility', 'asset_protection', 'debt_treatment', 'technical'), status: oneOf('insufficient_information', 'not_supported', 'unavailable'), body: text })),
  nextSteps: arrayOf(text, 12),
  fieldErrors: arrayOf(shape({ field: oneOf(...MONEY_FIELDS, 'additionalPaymentsSeparate', 'urgentEvents', 'debtKinds', 'debtSituation', 'mainGoal', 'incomeRegularity', 'securedArrears', 'priorBankruptcy',
    'maritalStatus', 'spouseFiling', 'householdSize', 'grossMonthlyIncomeBand', 'homeOwnership', 'mortgageStatus', 'homeEquity',
    'vehicleOwnership', 'vehicleLoanStatus', 'vehicleEquity', 'significantAssets', 'priorBankruptcyRecency', '_request'), code: text, message: text }), 24),
  workflow: shape({ engine: oneOf('langgraph', 'core-preview'), steps: arrayOf(oneOf(...allSteps), 12) }),
  scopeNotice: oneOf(SCOPE_NOTICE),
});
/** Strict allowlist. Internal state and arbitrary link targets cannot escape this boundary. */
export function assertPublicResult(value: unknown): asserts value is PublicResult {
  if (!publicShape(value)) throw new Error('Invalid public result contract.');
  const result = value as PublicResult;
  if (result.snapshot.classification !== classifyInterval(result.snapshot.afterAdditionalPayments)) throw new Error('Inconsistent snapshot classification.');
  if (result.snapshot.status === 'assessed' && result.snapshot.afterAdditionalPayments === null) throw new Error('Missing assessed metric.');
  if (result.status === 'unavailable' && (result.snapshot.status !== 'unavailable' || result.snapshot.beforeAdditionalPayments !== null || result.snapshot.afterAdditionalPayments !== null || result.findings.length !== 0)) throw new Error('Unsafe technical failure result.');
  if (result.findings.some(finding => finding.inputRevision !== result.inputRevision)) throw new Error('Stale finding revision.');
  if (new Set(result.findings.map(finding => finding.id)).size !== result.findings.length) throw new Error('Duplicate finding.');
}
