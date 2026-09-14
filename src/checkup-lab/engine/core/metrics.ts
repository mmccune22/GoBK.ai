import type { Answers, Interval, MoneyAnswer, Plan, Snapshot, Validation } from './types.js';
import { MONEY_FIELDS } from './validation.js';

export function moneyInterval(value: MoneyAnswer): Interval | null {
  if (value.kind === 'range') return { minCents: value.minCents, maxCents: value.maxCents, precision: 'range' };
  if (value.kind === 'exact' || value.kind === 'estimate') return { minCents: value.cents, maxCents: value.cents, precision: value.kind === 'estimate' ? 'estimate' : 'reported' };
  return null;
}
export function subtractIntervals(left: Interval, right: Interval): Interval {
  return {
    minCents: left.minCents - right.maxCents,
    maxCents: left.maxCents - right.minCents,
    precision: left.precision === 'range' || right.precision === 'range' ? 'range'
      : left.precision === 'estimate' || right.precision === 'estimate' ? 'estimate' : 'reported',
  };
}
export function planSupportedWork(validation: Validation): Plan {
  const answers = validation.answers;
  const missing: Plan['missing'] = MONEY_FIELDS.filter(field => moneyInterval(answers[field]) === null);
  const additional = moneyInterval(answers.additionalDebtPayments);
  // An explicit zero creates no overlap. Anything else requires a clear inclusion answer.
  const safeToSubtract = answers.additionalPaymentsSeparate === 'yes' || additional?.maxCents === 0;
  if (additional !== null && !safeToSubtract) missing.push('additionalPaymentsSeparate');
  const before = moneyInterval(answers.monthlyTakeHome) !== null && moneyInterval(answers.monthlyExpenses) !== null && validation.envelopeValid;
  return { missing, canComputeBefore: before, canComputeAfter: before && additional !== null && safeToSubtract };
}
export function classifyInterval(value: Interval | null): Snapshot['classification'] {
  if (value === null) return 'not_calculated';
  if (value.maxCents < 0) return 'shortfall';
  if (value.minCents > 0) return 'remaining';
  if (value.minCents === 0 && value.maxCents === 0) return 'balanced';
  return 'uncertain';
}
export function calculateSnapshot(answers: Answers, plan: Plan): Snapshot {
  const income = moneyInterval(answers.monthlyTakeHome);
  const expenses = moneyInterval(answers.monthlyExpenses);
  const additional = moneyInterval(answers.additionalDebtPayments);
  const before = plan.canComputeBefore && income && expenses ? subtractIntervals(income, expenses) : null;
  const after = plan.canComputeAfter && before && additional ? subtractIntervals(before, additional) : null;
  return {
    status: after ? 'assessed' : 'insufficient_information',
    inputs: { monthlyTakeHome: { ...answers.monthlyTakeHome }, monthlyExpenses: { ...answers.monthlyExpenses }, additionalDebtPayments: { ...answers.additionalDebtPayments } },
    beforeAdditionalPayments: before, afterAdditionalPayments: after, classification: classifyInterval(after),
  };
}
export function dollars(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100);
}
export function formatInterval(value: Interval): string {
  return value.minCents === value.maxCents ? dollars(value.minCents) : `${dollars(value.minCents)} to ${dollars(value.maxCents)}`;
}
