import type { EvaluationContext, Finding, Limitation, Plan, ReadingTopic, Snapshot, UrgencyWarning, UrgentEvent, Validation } from './types.js';
import { dollars, formatInterval } from './metrics.js';
import { validDate } from './rules.js';

export const SCOPE_NOTICE = 'Internal synthetic-data prototype. Educational financial snapshot only. No Chapter 7 or Chapter 13 eligibility, means test, repayment plan, property protection, or debt discharge determination has been performed. All consumer wording is a draft for review, not attorney-approved guidance.';
export const URGENCY_COPY: Record<UrgentEvent, UrgencyWarning> = {
  foreclosure: { id: 'foreclosure', title: 'You reported a foreclosure concern', body: 'A notice or sale date may need attention before you finish this checkup. Consider contacting a qualified attorney promptly. This tool does not determine or change a deadline.' },
  garnishment: { id: 'garnishment', title: 'You reported a garnishment concern', body: 'Keep any notices and identify dates shown on them. Consider prompt legal help about your situation. Completing this checkup does not stop collection activity.' },
  repossession: { id: 'repossession', title: 'You reported a repossession concern', body: 'The timing of a threatened or completed repossession can matter. Consider contacting a qualified attorney promptly. This checkup does not protect or recover a vehicle.' },
  lawsuit: { id: 'lawsuit', title: 'You reported a debt lawsuit', body: 'Do not rely on this checkup to calculate a response date. Read the court papers and consider prompt legal help. This checkup does not file a response for you.' },
  deadline: { id: 'deadline', title: 'You reported another deadline concern', body: 'Review the notice or court papers and consider getting help promptly. An unfinished financial snapshot should not delay attention to a stated deadline.' },
};
export function contextForDate(asOfDate: string): EvaluationContext {
  if (!validDate(asOfDate)) throw new Error('A valid assessment date is required.');
  return { asOfDate, implementationVersion: '0.1.0', capabilityManifestVersion: 'snapshot-only-1', templateVersion: 'draft-1', contentMapVersion: 'official-reading-draft-1', locale: 'en-US', rounding: 'integer-cents' };
}
export function legalLimitations(): Limitation[] {
  return [
    { id: 'chapter_not_assessed', topic: 'chapter_eligibility', status: 'not_supported', body: 'Chapter eligibility and the bankruptcy means test have not been assessed. Current take-home cash flow is not a substitute for either.' },
    { id: 'property_not_assessed', topic: 'asset_protection', status: 'not_supported', body: 'Home, vehicle, and other property protection has not been assessed. No state exemption rules are enabled.' },
    { id: 'debt_treatment_not_assessed', topic: 'debt_treatment', status: 'not_supported', body: 'No determination has been made about which debts could be discharged, changed, or repaid through a plan.' },
  ];
}
const missingCopy: Record<string, string> = {
  monthlyTakeHome: 'Add a current monthly take-home income amount or range to calculate the monthly difference. Not sure is preserved as unknown.',
  monthlyExpenses: 'Add a monthly recurring expense total. Include each payment once, including housing or vehicle payments already counted here.',
  additionalDebtPayments: 'Add only monthly debt payments not counted in recurring expenses. Enter zero only when there are no additional payments.',
  additionalPaymentsSeparate: 'The additional payment amount may overlap with expenses. Identify only payments not already counted before calculating the final difference.',
};
export function snapshotLimitations(plan: Plan): Limitation[] {
  return plan.missing.map(field => ({ id: `missing_${field}`, topic: 'snapshot', status: 'insufficient_information', body: missingCopy[field] ?? 'Correct the requested input.' }));
}
export function buildFindings(snapshot: Snapshot, validation: Validation): Finding[] {
  const values: Finding[] = [];
  const interval = snapshot.afterAdditionalPayments;
  const qualifier = interval?.precision === 'estimate' ? 'Based on your estimates, ' : 'Based on the amounts you reported, ';
  if (interval) {
    let title = ''; let body = '';
    if (snapshot.classification === 'shortfall') {
      title = 'Listed monthly payments exceed take-home income';
      const amount = interval.minCents === interval.maxCents ? dollars(-interval.minCents) : `${dollars(-interval.maxCents)} to ${dollars(-interval.minCents)}`;
      body = `${qualifier}listed expenses and additional payments exceed take-home income by ${amount} per month. This is a snapshot of the listed amounts, not a bankruptcy recommendation.`;
    } else if (snapshot.classification === 'remaining') {
      title = 'A positive difference remains in the listed budget';
      body = `${qualifier}${formatInterval(interval)} remains after the expenses and additional payments you listed. Unlisted costs or changes may affect that picture. This is not a repayment capacity or eligibility finding.`;
    } else if (snapshot.classification === 'balanced') {
      title = 'The listed monthly amounts balance';
      body = 'The reported income equals the listed expenses and additional debt payments. This does not account for anything omitted or show that every debt is manageable.';
    } else {
      title = 'The range does not support one positive or negative conclusion';
      body = `The calculated monthly difference is ${formatInterval(interval)}. The range includes zero. We have not replaced your range with a midpoint or forced a surplus or shortfall label.`;
    }
    values.push({ id: `monthly_${snapshot.classification}`, title, body, evidenceFields: ['monthlyTakeHome', 'monthlyExpenses', 'additionalDebtPayments'], inputRevision: validation.inputRevision });
  }
  if (snapshot.beforeAdditionalPayments) {
    values.push({ id: 'before_additional_payments', title: 'Before separately listed additional payments', body: `Take-home income minus recurring expenses is ${formatInterval(snapshot.beforeAdditionalPayments)} per month. This comparison does not assume that any payment can be stopped.`, evidenceFields: ['monthlyTakeHome', 'monthlyExpenses'], inputRevision: validation.inputRevision });
  }
  return values;
}
export const READING_URLS = Object.freeze({
  basics: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics',
  alternatives: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics',
  debt_lawsuit: 'https://www.consumerfinance.gov/ask-cfpb/what-should-i-do-if-im-sued-by-a-debt-collector-or-creditor-en-334/',
});
/** Stable, allowlisted references. No guessed GoBK routes or model-generated links. */
export function chooseReading(validation: Validation, snapshot: Snapshot): ReadingTopic[] {
  const topics: ReadingTopic[] = [
    { id: 'bankruptcy_basics', title: 'Understand bankruptcy before drawing a conclusion', reason: 'This snapshot leaves chapter eligibility and property protection unresolved.', url: READING_URLS.basics },
    { id: 'alternatives', title: 'Compare bankruptcy with other approaches', reason: snapshot.classification === 'shortfall' ? 'The listed budget has a shortfall. A broader comparison is needed before choosing a course of action.' : 'Bankruptcy is not the assumed answer. The courts\' Chapter 7 overview also discusses alternatives.', url: READING_URLS.alternatives },
  ];
  if (validation.answers.urgentEvents.includes('lawsuit')) topics.unshift({ id: 'debt_lawsuit', title: 'Responding to a debt lawsuit', reason: 'You selected a debt lawsuit as an immediate concern.', url: READING_URLS.debt_lawsuit });
  if (validation.answers.debtKinds.some(kind => ['student', 'tax', 'support'].includes(kind))) {
    topics.push({ id: 'debt_questions', title: 'Gather details about the debts you selected', reason: 'You selected student loans, taxes, or support. This prototype does not assess their legal treatment.', url: READING_URLS.basics });
  }
  return topics;
}
export function nextStepsFor(validation: Validation, plan: Plan): string[] {
  const steps: string[] = [];
  if (validation.answers.urgentEvents.length) steps.push('Give the reported time-sensitive issue attention without waiting for this questionnaire to be complete.');
  if (validation.errors.length) steps.push('Correct the highlighted answers and run a fresh snapshot.');
  if (plan.missing.length) steps.push('Clarify the specific missing amounts or overlapping payments shown below.');
  else steps.push('Check that each monthly payment is counted once and that the amounts reflect the same current month.');
  steps.push('Compare the educational topics below. Do not treat this snapshot as a decision to file or not file.');
  return steps;
}
