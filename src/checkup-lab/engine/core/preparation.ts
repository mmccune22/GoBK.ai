import type { DebtKind, Finding, Validation } from './types.js';

/** Guide-informed explanations, not eligibility, exemption or discharge rules.
 * The old guide supplies question ideas; current official sources bound the copy.
 * Only allowlisted, validated answers select preparation topics. No records or
 * additional personal facts are collected. See GUIDE_IDEAS_REVIEW.md.
 */
export const QUESTION_GUIDES = Object.freeze({
  income: {
    title: 'Income, marriage and household: why these facts matter',
    body: 'The broad income and household answers organize questions; they are not the legal income or household calculation. For a private consultation, gather income records, note changes, and list who contributes to household expenses and who you support. A spouse’s income and expenses can matter even if only one spouse files. Ask how your household and joint debts should be treated; this form does not calculate the means test.',
  },
  property: {
    title: 'Home, vehicle and other property: what to check',
    body: 'Being current on a loan does not by itself show that property is protected. Bring approximate market values, ownership details, loan balances and past-due amounts to a lawyer. Include paid-off property, retirement accounts, expected tax refunds and other valuables. Ask about liens, applicable exemptions, continuing payments and what each chapter could change. Do not transfer, sell or spend property based on this Checkup.',
  },
  prior: {
    title: 'Earlier bankruptcy: why the dates and outcome matter',
    body: 'Find the earlier case’s chapter, filing date, discharge or dismissal date, and outcome. Filing another case and receiving another discharge are different questions. An earlier case can also affect protections in a new case. Ask a lawyer to review the records; this Checkup does not calculate a waiting period.',
  },
  unsecured: {
    title: 'Credit cards, medical bills and personal loans',
    body: 'These are common reasons to discuss bankruptcy, but the category alone does not guarantee discharge. Bring balances and required monthly payments as separate figures, identify any collateral or co-borrower, and disclose recent borrowing or cash advances privately to a lawyer. Ask which debts would remain and compare the full cost of other debt options.',
  },
  student: {
    title: 'Student loans need their own discussion',
    body: 'Student loans are not automatically erased, but discharge can be possible. For loans held by the U.S. Department of Education, DOJ describes a review process involving a separate court proceeding; the judge decides. Its applicability has not been assessed here. Gather the loan type, holder, servicer, payment status and any repayment-program information privately. Ask whether the attorney handles student-loan discharge proceedings, which process applies to your loans, and what other relief is available.',
  },
  tax: {
    title: 'Taxes: the label or age alone is not enough',
    body: 'Some taxes remain payable. Gather the tax type, tax years, returns, filing history, assessment or collection notices and any lien information for a private consultation. Ask which debts would remain and whether a payment arrangement or bankruptcy could help. This Checkup applies no age-based tax-discharge rule.',
  },
  support: {
    title: 'Child support and alimony need separate planning',
    body: 'Do not assume child support or alimony will go away. Gather the order, current payment amount, past-due balance and enforcement notices privately. Identify any divorce property-settlement obligation separately and ask a lawyer to classify it. Ask how ongoing support and arrears would be handled under each option and what the budget must still cover.',
  },
  other: {
    title: 'Other debts: identify what is actually owed',
    body: 'Write down the type of obligation, who owes it, any collateral and relevant notices for a private consultation. Other is not treated as an ordinary unsecured debt or a debt that will disappear. Ask what bankruptcy and nonbankruptcy options would change.',
  },
});
export type GuideTopic = keyof typeof QUESTION_GUIDES;
export const DEBT_GUIDE_TOPICS: Readonly<Partial<Record<DebtKind, GuideTopic>>> = Object.freeze({
  credit_card: 'unsecured', medical: 'unsecured', personal_loan: 'unsecured',
  mortgage: 'property', auto: 'property', student: 'student', tax: 'tax', support: 'support', other: 'other',
});
export const PREPARATION_IDS = Object.freeze([
  'prepare_income', 'prepare_property', 'prepare_prior', 'prepare_unsecured',
  'prepare_student', 'prepare_tax', 'prepare_support', 'prepare_other',
]);

/** The attached BKFP workflow adds household and property questions. These
 * fixed findings explain what those answers are useful for without applying a
 * means-test table, exemption amount, or waiting-period rule. */
export function buildGuideProfileFindings(validation: Validation): Finding[] {
  const a = validation.answers;
  const findings: Finding[] = [];
  const householdAnswered = [a.maritalStatus, a.householdSize, a.grossMonthlyIncomeBand]
    .some(value => !['not_provided', 'unknown'].includes(value));
  const spouseContext = a.maritalStatus === 'married'
    ? a.spouseFiling === 'yes' ? ' You reported that your spouse may file with you; confirm the filing plan and gather both spouses’ relevant household and debt records.'
      : a.spouseFiling === 'no' ? ' You reported that your spouse may not file with you; a private review should still cover household income, expenses, joint debts and ownership.'
        : a.spouseFiling === 'unsure' ? ' You are not sure whether your spouse would file with you; ask how each option would affect household income, expenses, joint debts and ownership.'
          : ''
    : '';
  if (householdAnswered) findings.push({
    id: 'guide_household_review',
    title: 'Household and income details need a full review',
    body: 'These answers help organize a consultation, but the income band is not a means test. A proper review uses the applicable official forms, the required income period, all included income sources, household facts, and the filing date. A spouse’s income and expenses can matter even when only one spouse may file.' + spouseContext,
    evidenceFields: [], inputRevision: validation.inputRevision,
  });
  const propertyAnswered = [a.homeOwnership, a.vehicleOwnership, a.significantAssets]
    .some(value => value === 'yes');
  if (propertyAnswered) findings.push({
    id: 'guide_property_review',
    title: 'Property values and exemptions need individual review',
    body: 'You reported a home, vehicle, or other significant property. Ownership and a rough equity answer help identify what to gather, but they do not show that property is protected. A lawyer needs values, loan balances, liens, ownership, domicile history, and the exemptions that actually apply.',
    evidenceFields: [], inputRevision: validation.inputRevision,
  });
  if (a.priorBankruptcy === 'yes') findings.push({
    id: 'guide_prior_timing_review',
    title: 'The earlier case needs its exact dates and outcome',
    body: 'The broad more-than-or-less-than-eight-years answer does not determine whether another case can be filed or whether another discharge is available. Gather the earlier chapter, filing date, discharge or dismissal date, and outcome for review.',
    evidenceFields: [], inputRevision: validation.inputRevision,
  });
  const unknownDebtLabels = ([
    ['taxDebt', 'tax debt'],
    ['supportDebt', 'child support or alimony'],
    ['studentDebt', 'student loans'],
    ['unsecuredDebt', 'ordinary unsecured debt'],
  ] as const).filter(([field]) => a[field] === 'unknown').map(([, label]) => label);
  if (unknownDebtLabels.length) findings.push({
    id: 'guide_debt_answers_review',
    title: 'Confirm the debt categories marked not sure',
    body: `You marked ${unknownDebtLabels.join(', ')} as not sure. Confirm those categories before relying on this issue list. This reminder does not classify a debt, decide discharge, or change your stated property goal.`,
    evidenceFields: [], inputRevision: validation.inputRevision,
  });
  return findings;
}

/** Called inside the actual assemble_findings node, with fresh validated state. */
export function buildPreparationFindings(validation: Validation): Finding[] {
  const a = validation.answers;
  const selected: GuideTopic[] = ['income', 'property'];
  if (a.priorBankruptcy === 'yes') selected.push('prior');
  for (const kind of a.debtKinds) {
    const topic = DEBT_GUIDE_TOPICS[kind];
    if (topic && !selected.includes(topic)) selected.push(topic);
  }
  // Fixed order is independent of checkbox order and never selects a chapter.
  return PREPARATION_IDS.filter(id => selected.includes(id.slice(8) as GuideTopic)).map(id => {
    const guide = QUESTION_GUIDES[id.slice(8) as GuideTopic];
    return { id, title: guide.title, body: guide.body, evidenceFields: [], inputRevision: validation.inputRevision };
  });
}
