import type { Answers, DebtKind, FieldError, FieldName, MoneyAnswer, MoneyField, UrgentEvent, Validation } from './types.js';

// Technical input bound, not a legal limit or screening threshold. $1 billion/month.
export const MAX_INPUT_CENTS = 100_000_000_000;
export const MONEY_FIELDS: readonly MoneyField[] = ['monthlyTakeHome', 'monthlyExpenses', 'additionalDebtPayments'];
export const URGENT_EVENTS: readonly UrgentEvent[] = ['foreclosure', 'garnishment', 'repossession', 'lawsuit', 'deadline'];
export const DEBT_KINDS: readonly DebtKind[] = ['credit_card', 'medical', 'personal_loan', 'mortgage', 'auto', 'student', 'tax', 'support', 'other'];
export const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
export function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(key => keys.includes(key));
}
export function validCents(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= MAX_INPUT_CENTS;
}
export function parseMoney(value: unknown): MoneyAnswer | null {
  if (value === undefined) return { kind: 'not_provided' };
  if (!isObject(value)) return null;
  if (value.kind === 'exact' || value.kind === 'estimate') {
    return hasOnlyKeys(value, ['kind', 'cents']) && validCents(value.cents)
      ? { kind: value.kind, cents: value.cents } : null;
  }
  if (value.kind === 'range') {
    return hasOnlyKeys(value, ['kind', 'minCents', 'maxCents']) && validCents(value.minCents) && validCents(value.maxCents) && value.minCents <= value.maxCents
      ? { kind: 'range', minCents: value.minCents, maxCents: value.maxCents } : null;
  }
  if (value.kind === 'unknown' || value.kind === 'not_provided') {
    return hasOnlyKeys(value, ['kind']) ? { kind: value.kind } : null;
  }
  return null;
}
export function emptyAnswers(): Answers {
  return {
    monthlyTakeHome: { kind: 'not_provided' }, monthlyExpenses: { kind: 'not_provided' },
    additionalDebtPayments: { kind: 'not_provided' }, additionalPaymentsSeparate: 'not_provided',
    urgentEvents: [], urgencyResponse: 'not_answered', debtKinds: [],
    debtSituation: 'unknown', mainGoal: 'unsure', incomeRegularity: 'unknown', securedArrears: 'unknown', priorBankruptcy: 'unknown',
  };
}
const moneyError = (field: FieldName): FieldError => ({
  field, code: 'INVALID_MONEY',
  message: 'Use a nonnegative dollar amount with at most two decimal places, a valid low-to-high range, or choose not sure. Amount exceeds this prototype\'s input bound if above $1 billion.',
});

/** Validate readable fields independently. A bad income never deletes valid urgency. */
export function validateInput(raw: unknown): Validation {
  const result: Validation = { inputRevision: null, envelopeValid: true, answers: emptyAnswers(), errors: [] };
  const invalidEnvelope = () => {
    result.envelopeValid = false;
    if (!result.errors.some(error => error.field === '_request')) {
      result.errors.push({ field: '_request', code: 'INVALID_REQUEST', message: 'This internal prototype accepts only the documented synthetic-data request format.' });
    }
  };
  if (!isObject(raw)) { invalidEnvelope(); return result; }
  if (raw.schemaVersion !== '1' || raw.synthetic !== true || !hasOnlyKeys(raw, ['schemaVersion', 'synthetic', 'inputRevision', 'answers'])) invalidEnvelope();
  if (typeof raw.inputRevision === 'number' && Number.isSafeInteger(raw.inputRevision) && raw.inputRevision > 0 && raw.inputRevision <= 1_000_000) result.inputRevision = raw.inputRevision;
  else invalidEnvelope();
  if (!isObject(raw.answers)) { invalidEnvelope(); return result; }
  const source = raw.answers;
  if (!hasOnlyKeys(source, [...MONEY_FIELDS, 'additionalPaymentsSeparate', 'urgentEvents', 'debtKinds', 'debtSituation', 'mainGoal', 'incomeRegularity', 'securedArrears', 'priorBankruptcy'])) invalidEnvelope();
  for (const field of MONEY_FIELDS) {
    const parsed = parseMoney(source[field]);
    if (parsed === null) result.errors.push(moneyError(field));
    else result.answers[field] = parsed;
  }
  const separate = source.additionalPaymentsSeparate;
  if (separate === 'yes' || separate === 'no' || separate === 'unknown') result.answers.additionalPaymentsSeparate = separate;
  else if (separate !== undefined) result.errors.push({ field: 'additionalPaymentsSeparate', code: 'INVALID_SELECTION', message: 'Confirm whether the additional payments are excluded from the expense total.' });
  const urgent = source.urgentEvents;
  if (urgent !== undefined) {
    if (Array.isArray(urgent)) {
      // Inspect a bounded array without accepting arbitrary warning text.
      const selections = urgent.slice(0, 16);
      result.answers.urgentEvents = URGENT_EVENTS.filter(event => selections.includes(event));
      if (result.answers.urgentEvents.length > 0) result.answers.urgencyResponse = 'selected';
      else if (selections.includes('none')) result.answers.urgencyResponse = 'none_reported';
      else if (selections.includes('unknown')) result.answers.urgencyResponse = 'unknown';
      const recognized = selections.every(event => typeof event === 'string' && [...URGENT_EVENTS, 'none', 'unknown'].includes(event));
      const contradictory = (selections.includes('none') || selections.includes('unknown')) && new Set(selections).size > 1;
      if (!recognized || contradictory || urgent.length > 16) result.errors.push({ field: 'urgentEvents', code: 'INVALID_SELECTION', message: 'Choose listed concerns, none of these, or not sure. Do not combine those alternatives.' });
    } else result.errors.push({ field: 'urgentEvents', code: 'INVALID_SELECTION', message: 'Choose concerns from the provided list.' });
  }
  if (source.debtKinds !== undefined) {
    if (Array.isArray(source.debtKinds)) {
      result.answers.debtKinds = DEBT_KINDS.filter(kind => (source.debtKinds as unknown[]).slice(0, 16).includes(kind));
      if (source.debtKinds.length > 16 || source.debtKinds.some(kind => !DEBT_KINDS.includes(kind as DebtKind))) result.errors.push({ field: 'debtKinds', code: 'INVALID_SELECTION', message: 'Choose debt types from the provided list.' });
    } else result.errors.push({ field: 'debtKinds', code: 'INVALID_SELECTION', message: 'Choose debt types from the provided list.' });
  }
  const situations = ['keeping_up', 'falling_behind', 'borrowing_for_basics', 'balances_not_shrinking'] as const;
  if (source.debtSituation !== undefined && source.debtSituation !== 'unknown') {
    if (situations.includes(source.debtSituation as typeof situations[number])) result.answers.debtSituation = source.debtSituation as typeof situations[number];
    else result.errors.push({ field: 'debtSituation', code: 'INVALID_SELECTION', message: 'Choose a payment situation from the list, or not sure.' });
  }
  const goals = ['debt_relief', 'keep_home', 'keep_vehicle', 'stop_collection'] as const;
  if (source.mainGoal !== undefined && source.mainGoal !== 'unsure') {
    if (goals.includes(source.mainGoal as typeof goals[number])) result.answers.mainGoal = source.mainGoal as typeof goals[number];
    else result.errors.push({ field: 'mainGoal', code: 'INVALID_SELECTION', message: 'Choose a goal from the list, or still exploring.' });
  }
  for (const [field, choices] of [
    ['incomeRegularity', ['regular', 'irregular', 'no_current_income', 'unknown']],
    ['securedArrears', ['none', 'mortgage', 'vehicle', 'both', 'unknown']],
    ['priorBankruptcy', ['yes', 'no', 'unknown']],
  ] as const) {
    const value = source[field];
    if (value === undefined) continue;
    if (typeof value === 'string' && (choices as readonly string[]).includes(value)) {
      // The field's allowlisted enum was checked above; unknown stays unknown.
      Object.assign(result.answers, { [field]: value });
    } else result.errors.push({ field, code: 'INVALID_SELECTION', message: 'Choose a listed discussion answer, or not sure.' });
  }
  return result;
}

/** Parse display dollars exactly. Missing or invalid text is never converted to zero. */
export function centsFromDollars(text: string): number | null {
  const cleaned = text.trim().replace(/^\$/, '');
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(cleaned)) return null;
  const [whole = '', decimal = ''] = cleaned.replaceAll(',', '').split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return validCents(cents) ? cents : null;
}
