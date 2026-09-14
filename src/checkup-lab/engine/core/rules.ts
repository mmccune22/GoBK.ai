import type { RulePack, RuleProvider } from './types.js';

export const disabledRuleProvider: RuleProvider = Object.freeze({
  list: () => [],
  evaluate: () => { throw new Error('No legal rules are enabled.'); },
});
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
/** Approval metadata is selected by trusted code, never by request parameters. */
export function packIsEnabled(pack: RulePack, asOfDate: string): boolean {
  return pack.enabled && pack.sourceChecked && pack.attorneyReviewed && pack.editorialReviewed && pack.engineeringVerified
    && validDate(asOfDate) && validDate(pack.effectiveFrom) && validDate(pack.effectiveThrough)
    && pack.effectiveFrom <= asOfDate && asOfDate <= pack.effectiveThrough;
}
