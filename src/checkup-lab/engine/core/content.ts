import type { EvaluationContext, Finding, Limitation, Plan, ReadingTopic, Snapshot, UrgencyWarning, UrgentEvent, Validation } from './types.js';
import { dollars, formatInterval } from './metrics.js';
import { validDate } from './rules.js';
import { buildDecisionGuidance, missingDiscussionFacts } from './guidance.js';
import { buildPreparationFindings } from './preparation.js';

export const SCOPE_NOTICE = 'Synthetic-data beta. Educational budget and bankruptcy consultation roadmap. No filing recommendation, Chapter 7 or Chapter 13 eligibility, means test, repayment plan, property protection, or debt discharge determination has been performed. All consumer wording is a draft for review, not attorney-approved guidance.';
export const URGENCY_COPY: Record<UrgentEvent, UrgencyWarning> = {
  foreclosure: { id: 'foreclosure', title: 'You reported a foreclosure concern', body: 'A notice or sale date may need attention before you finish this checkup. Consider contacting a qualified attorney promptly. This tool does not determine or change a deadline.' },
  garnishment: { id: 'garnishment', title: 'You reported a garnishment concern', body: 'Keep any notices and identify dates shown on them. Consider prompt legal help about your situation. Completing this checkup does not stop collection activity.' },
  repossession: { id: 'repossession', title: 'You reported a repossession concern', body: 'The timing of a threatened or completed repossession can matter. Consider contacting a qualified attorney promptly. This checkup does not protect or recover a vehicle.' },
  lawsuit: { id: 'lawsuit', title: 'You reported a debt lawsuit', body: 'Do not rely on this checkup to calculate a response date. Read the court papers and consider prompt legal help. This checkup does not file a response for you.' },
  deadline: { id: 'deadline', title: 'You reported another deadline concern', body: 'Review the notice or court papers and consider getting help promptly. An unfinished financial snapshot should not delay attention to a stated deadline.' },
};
export function contextForDate(asOfDate: string): EvaluationContext {
  if (!validDate(asOfDate)) throw new Error('A valid assessment date is required.');
  return { asOfDate, implementationVersion: '0.3.1', capabilityManifestVersion: 'snapshot-only-1', templateVersion: 'guide-informed-roadmap-draft-4', contentMapVersion: 'official-reading-2026-09-14', locale: 'en-US', rounding: 'integer-cents' };
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
  // Educational discussion topics, not substantive eligibility or filing rules.
  // The two optional context answers are self-reports, never legal conclusions.
  const answers = validation.answers;
  const urgent = answers.urgentEvents.length > 0;
  const pressure = ['falling_behind', 'borrowing_for_basics', 'balances_not_shrinking'].includes(answers.debtSituation);
  let discussion: string;
  if (urgent) {
    discussion = 'Get qualified local legal help promptly about the concern you reported. Ask whether bankruptcy, responding to the case, or another step addresses it. Keep the deadline in your notices: this Checkup and a consultation do not stop collection or extend a deadline. You can discuss options before every budget number is ready.';
  } else if (pressure) {
    const reason = { falling_behind: 'falling behind on payments', borrowing_for_basics: 'borrowing to cover basic living costs', balances_not_shrinking: 'making payments without seeing balances fall' }[answers.debtSituation as 'falling_behind' | 'borrowing_for_basics' | 'balances_not_shrinking'];
    discussion = `Bankruptcy is worth discussing alongside other debt options because you reported ${reason}. A positive monthly difference does not rule it out. Compare what each option would change, what debts would remain, total costs, property concerns, and whether payments are sustainable. This is a reason to seek advice, not a conclusion that you should file.`;
  } else if (snapshot.classification === 'shortfall') {
    const before = snapshot.beforeAdditionalPayments;
    discussion = before && before.maxCents < 0
      ? 'Bankruptcy is worth discussing, but your recurring expenses already exceed take-home income before the separately listed debt payments. Recurring expenses may themselves include debts. Compare debt relief with help for the basic budget gap; erasing some debts would not necessarily make essential living costs affordable. No payment is assumed removable.'
      : before && before.minCents >= 0
        ? 'Bankruptcy is worth discussing alongside affordable repayment options: the additional debt payments you listed turn a budget that balances before those payments into a shortfall. That identifies payment pressure, not proof you should file or that those payments can be eliminated. Ask which debts and property issues each option actually addresses.'
        : 'Your listed payments exceed income. That makes bankruptcy and other debt options worth discussing, especially if the problem persists. The ranges do not establish whether recurring costs or additional debt payments cause the gap. Review what each option could change rather than treating a shortfall as a direction to file.';
  } else if (snapshot.classification === 'remaining' || snapshot.classification === 'balanced') {
    discussion = 'Bankruptcy may still be worth exploring. Having money left this month, or a budget that balances, does not show that total debts are affordable or rule bankruptcy out. If payments are manageable and balances are falling, compare creditor hardship arrangements or nonprofit counseling. If balances keep growing or payments crowd out essentials, ask a bankruptcy lawyer about options. This tool has not measured your full debt burden.';
  } else {
    discussion = 'You can discuss bankruptcy and other options even while some numbers are uncertain. Missing amounts, overlapping payments, or a range crossing zero are not reasons to conclude that you should or should not file. Clarify the gaps and consider whether you are falling behind, borrowing for essentials, or unable to reduce balances. Any actual deadline needs separate attention.';
  }
  const values: Finding[] = [{ id: 'bankruptcy_discussion', title: urgent ? 'Is bankruptcy worth exploring? Get prompt legal help' : 'Is bankruptcy worth exploring?', body: discussion, evidenceFields: urgent || pressure ? [] : ['monthlyTakeHome', 'monthlyExpenses', 'additionalDebtPayments'], inputRevision: validation.inputRevision }];
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
  values.push({ id: 'compare_alternatives', title: 'Compare options by the problem they solve', body: 'Ask creditors about hardship arrangements and compare a reputable nonprofit counselor’s debt management plan with bankruptcy. A payment plan must fit the budget; counseling does not erase debts. Settlement or consolidation can involve fees, interest, collection risk, or a longer repayment period. Compare total cost and written terms before choosing.', evidenceFields: [], inputRevision: validation.inputRevision });
  values.push(...buildDecisionGuidance(validation));
  if (answers.debtKinds.some(kind => ['student', 'tax', 'support'].includes(kind))) values.push({ id: 'special_debt_questions', title: 'Some selected debts need separate review', body: 'You selected student loans, taxes, or support. Their treatment can differ and may require separate procedures or continued payment. Do not assume they will all disappear, or that every student loan is impossible to discharge. Ask a lawyer what would remain in your specific case and whether a nonbankruptcy program could help.', evidenceFields: [], inputRevision: validation.inputRevision });
  if (answers.debtKinds.some(kind => ['mortgage', 'auto'].includes(kind)) || ['keep_home', 'keep_vehicle'].includes(answers.mainGoal)) values.push({ id: 'secured_property_questions', title: 'Bring your home or vehicle goal to the discussion', body: 'If keeping a home or vehicle matters, gather loan balances, past-due amounts, payment notices, and approximate property values for a private consultation. Ask about liens, applicable exemptions, arrears, and affordable ongoing payments. Discharging a personal debt does not by itself remove a lien. This tool does not promise that you can keep property.', evidenceFields: [], inputRevision: validation.inputRevision });
  if (answers.mainGoal === 'stop_collection' && !urgent) values.push({ id: 'collection_goal', title: 'Ask what would address the collection pressure', body: 'You want help with collection. Ask a qualified local lawyer about your rights, any notices or response deadlines, and whether bankruptcy or another step would help. No urgent event was selected, but that is not proof that none exists. This Checkup does not stop collection.', evidenceFields: [], inputRevision: validation.inputRevision });
  values.push(...buildPreparationFindings(validation));
  return values;
}
export const READING_URLS = Object.freeze({
  basics: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics',
  alternatives: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-7-bankruptcy-basics',
  debt_lawsuit: 'https://www.consumerfinance.gov/ask-cfpb/what-should-i-do-if-im-sued-by-a-debt-collector-or-creditor-en-334/',
  chapter13: 'https://www.uscourts.gov/court-programs/bankruptcy/bankruptcy-basics/chapter-13-bankruptcy-basics',
  counseling: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-credit-counseling-and-debt-settlement-debt-consolidation-or-credit-repair-en-1449/',
  student: 'https://www.justice.gov/ust/student-loan-guidance',
  legal_help: 'https://www.consumerfinance.gov/ask-cfpb/how-do-i-find-an-attorney-in-my-state-en-1549/',
});
/** Stable, allowlisted references. No guessed GoBK routes or model-generated links. */
export function chooseReading(validation: Validation, snapshot: Snapshot): ReadingTopic[] {
  const topics: ReadingTopic[] = [
    { id: 'chapter7', title: 'Chapter 7: debt relief and property review', reason: 'Learn the purpose and limits; your monthly budget does not establish eligibility.', url: READING_URLS.alternatives },
    { id: 'chapter13', title: 'Chapter 13: a court-supervised payment plan', reason: 'Learn about regular income, arrears and ongoing payment requirements. No plan has been calculated.', url: READING_URLS.chapter13 },
    { id: 'alternatives', title: 'Counseling, settlement and consolidation compared', reason: 'Compare realistic payments, total cost and risks with bankruptcy.', url: READING_URLS.counseling },
  ];
  if (validation.answers.urgentEvents.includes('lawsuit')) topics.unshift({ id: 'debt_lawsuit', title: 'Responding to a debt lawsuit', reason: 'You selected a debt lawsuit as an immediate concern.', url: READING_URLS.debt_lawsuit });
  if (validation.answers.debtKinds.includes('student')) {
    topics.push({ id: 'student_loans', title: 'Federal student loans: current DOJ bankruptcy guidance', reason: 'DOJ describes a process for federal student-loan discharge requests. Your loan type, applicability and eligibility have not been assessed; ask about private loans separately.', url: READING_URLS.student });
  } else if (validation.answers.debtKinds.some(kind => ['tax', 'support'].includes(kind))) {
    topics.push({ id: 'debt_questions', title: 'Gather details about the debts you selected', reason: 'You selected student loans, taxes, or support. This prototype does not assess their legal treatment.', url: READING_URLS.basics });
  }
  return topics;
}
export function nextStepsFor(validation: Validation, plan: Plan): string[] {
  const a = validation.answers;
  const steps: string[] = [];
  if (a.urgentEvents.length) steps.push('Contact qualified local legal help promptly about the reported concern. Keep the notices and stated dates; do not wait for the budget to be complete. This Checkup does not stop collection or extend a deadline.');
  if (validation.errors.length) steps.push('Correct the highlighted answers and run a fresh snapshot.');
  if (plan.missing.length) steps.push(plan.missing.map(field => missingCopy[field] ?? 'Correct the requested input.').join(' '));
  else steps.push('Check that each monthly payment is counted once and that the amounts reflect the same current month.');
  const discussionGaps = missingDiscussionFacts(validation);
  if (discussionGaps.length) steps.push(`Before ranking chapters, clarify ${discussionGaps.join('; ')}. Unknown answers do not establish that the case is simple. You can seek advice while gathering these facts.`);
  if (a.priorBankruptcy === 'yes') steps.push('Find the earlier case’s chapter, filing date, discharge or dismissal date, and outcome. Have a lawyer review timing and protections; no waiting period is calculated here.');
  if (a.debtKinds.some(kind => ['student', 'tax', 'support', 'other'].includes(kind))) steps.push('Use the debt-specific preparation questions below for the selected student loans, taxes, support or other debts. Ask which obligations would remain and which need a separate procedure.');
  if (a.debtKinds.some(kind => ['mortgage', 'auto'].includes(kind)) || ['keep_home', 'keep_vehicle'].includes(a.mainGoal) || ['mortgage', 'vehicle', 'both'].includes(a.securedArrears)) steps.push('For the home or vehicle concern, gather approximate values, ownership details, loan balances, arrears and notices. Ask what keeping it would require under each option; property protection has not been assessed.');
  steps.push('Compare a bankruptcy consultation with creditor hardship help and reputable nonprofit counseling. Ask what each option solves, what remains, and the total cost; a consultation does not require you to file.');
  steps.push('Prepare a complete debt list with balances and monthly payments kept separate. Include joint debts, income history and a full property list, including paid-off assets and expected refunds, for a private consultation. Do not upload personal records into this beta.');
  steps.push('Ask about representation fees and local legal aid or court referral resources. The legal-help link below explains how to find an attorney; free help depends on availability and eligibility.');
  steps.push('Ask: which debts would remain, could property be at risk, what payments and fees are required, and what happens if I do not file? Do not stop payments or move assets based on this Checkup.');
  return steps;
}
