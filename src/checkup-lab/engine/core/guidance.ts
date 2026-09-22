import type { Finding, Validation } from './types.js';

/** Draft educational routing, not an eligibility rule pack or a filing verdict.
 * Pure, ordered branches run inside the real graph's assemble_findings node.
 * Sources and branch boundaries: reports/DETERMINISTIC_CHAPTER_ATTORNEY_GUIDANCE_RESEARCH.md.
 * Cash-flow sign deliberately never chooses a chapter. No model or network calls.
 */
export function missingDiscussionFacts(validation: Validation): string[] {
  const a = validation.answers;
  return [
    ...(a.incomeRegularity === 'unknown' ? ['whether income is regular'] : []),
    ...(a.securedArrears === 'unknown' ? ['whether home or vehicle payments are past due'] : []),
    ...(a.priorBankruptcy === 'unknown' ? ['whether there was an earlier bankruptcy'] : []),
    ...(a.mainGoal === 'unsure' ? ['the main goal'] : []),
    ...(a.debtKinds.length === 0 ? ['which debt types are involved'] : []),
  ];
}
export function buildDecisionGuidance(validation: Validation): Finding[] {
  const a = validation.answers;
  const special = a.debtKinds.some(kind => ['student', 'tax', 'support', 'other'].includes(kind));
  const missing = missingDiscussionFacts(validation);
  const invalid = !validation.envelopeValid || validation.errors.some(error =>
    ['incomeRegularity', 'securedArrears', 'priorBankruptcy', 'mainGoal', 'debtKinds', 'urgentEvents',
      'taxDebt', 'supportDebt', 'studentDebt', 'unsecuredDebt',
      'maritalStatus', 'spouseFiling', 'householdSize', 'grossMonthlyIncomeBand', 'homeOwnership', 'mortgageStatus', 'homeEquity',
      'vehicleOwnership', 'vehicleLoanStatus', 'vehicleEquity', 'significantAssets', 'priorBankruptcyRecency'].includes(error.field));
  const property = ['keep_home', 'keep_vehicle'].includes(a.mainGoal) ||
    a.debtKinds.some(kind => ['mortgage', 'auto'].includes(kind)) || ['mortgage', 'vehicle', 'both'].includes(a.securedArrears) ||
    a.homeOwnership === 'yes' || a.vehicleOwnership === 'yes' || a.significantAssets === 'yes';
  const matching = (a.mainGoal === 'keep_home' && a.securedArrears === 'mortgage') ||
    (a.mainGoal === 'keep_vehicle' && a.securedArrears === 'vehicle');
  const conflict = (a.urgentEvents.includes('foreclosure') && a.securedArrears === 'none') ||
    (a.urgentEvents.includes('repossession') && a.securedArrears === 'none') ||
    (a.mainGoal === 'keep_home' && a.securedArrears === 'vehicle') ||
    (a.mainGoal === 'keep_vehicle' && a.securedArrears === 'mortgage') || a.securedArrears === 'both';
  const common = ' This is a starting point for a chapter discussion, not a direction to file or a finding that you qualify. A lawyer still needs income history, prior-case dates, property values, liens, state exemptions and the full debt picture. A monthly surplus or shortfall does not select a chapter.';
  let chapterTitle: string; let chapterBody: string;
  if (a.priorBankruptcy === 'yes') {
    chapterTitle = 'Chapter 7 or 13? Review the earlier case first';
    chapterBody = 'You reported an earlier bankruptcy. The chapter, filing and discharge dates, and outcome can affect a new case and its protections. Review that history before choosing a chapter; this tool does not calculate any waiting period.';
  } else if (invalid) {
    chapterTitle = 'Chapter 7 or 13? Correct the discussion inputs';
    chapterBody = 'Some discussion answers or the request format were invalid. Correct the flagged fields before comparing chapters. Valid urgent concerns remain important even when other answers need correction.';
  } else if (missing.length) {
    chapterTitle = 'Chapter 7 or 13? Clarify these facts first';
    chapterBody = `We still need to clarify ${missing.join('; ')}. Not sure or an empty debt list is not treated as no income, no arrears, no prior case or no debts. You can discuss both chapters while gathering these facts.`;
  } else if (special) {
    chapterTitle = 'Chapter 7 or 13? Compare both with debt-specific advice';
    chapterBody = 'You selected student loans, taxes, support or other debts. Their treatment needs separate review, so this short form does not rank a chapter. Ask which debts would remain, which need a separate procedure, and whether bankruptcy or another program addresses the problem.';
  } else if (conflict) {
    chapterTitle = 'Chapter 7 or 13? Compare both before choosing';
    chapterBody = 'The reported property concerns involve both home and vehicle arrears, a different property from the main goal, or an urgent property concern alongside no reported arrears. Review the notices and full property situation with a lawyer before ranking chapters. We do not assume a single-property plan covers the other concern.';
  } else if (a.incomeRegularity === 'regular' && matching) {
    chapterTitle = 'Chapter 13: discuss this option first';
    chapterBody = `You reported regular income, past-due ${a.securedArrears === 'mortgage' ? 'mortgage' : 'vehicle'} payments and a goal of keeping that property, with no earlier bankruptcy reported. Chapter 13 is worth discussing first because a court-supervised plan may offer a way to address arrears. Check eligibility, affordable plan payments and continuing loan payments; regular income alone does not prove a plan will work or that property can be kept.`;
  } else if (a.significantAssets !== 'yes' && a.mainGoal === 'debt_relief' && a.securedArrears === 'none' &&
    a.debtKinds.every(kind => ['credit_card', 'medical', 'personal_loan'].includes(kind))) {
    chapterTitle = 'Chapter 7: discuss this option first';
    chapterBody = 'You reported a debt-relief goal, only credit-card, medical or personal-loan debts, no home or vehicle arrears and no earlier bankruptcy, with income regularity answered. Chapter 7 is worth discussing first because it can discharge certain unsecured debts. This does not establish means-test eligibility or that every debt disappears. Property values and applicable exemptions still need individual review. Compare Chapter 13 and nonbankruptcy options if Chapter 7 does not fit.';
  } else if (a.incomeRegularity === 'no_current_income' && matching) {
    chapterTitle = 'Chapter 7 or 13? Review payment feasibility first';
    chapterBody = 'You want to keep property with past-due payments but reported no current income. Chapter 13 is designed for people with regular income, so first discuss how ongoing payments and any plan could be funded. Also compare Chapter 7 property risks and help for the income gap. No current income does not prove Chapter 7 eligibility or protect property.';
  } else {
    chapterTitle = 'Chapter 7 or 13? Compare both before choosing';
    chapterBody = 'The reported goal, income pattern or property situation does not match one of this form’s limited chapter starting points. Compare Chapter 7 debt relief and property risks with Chapter 13 payment requirements and nonbankruptcy options. Irregular income needs a closer review of whether payments can be sustained; it is not an automatic Chapter 7 recommendation.';
  }
  const reasons = [
    ...(a.urgentEvents.length ? ['a reported collection, property or court deadline concern'] : []),
    ...(a.priorBankruptcy === 'yes' ? ['an earlier bankruptcy'] : []),
    ...(property ? ['a home, vehicle, other property or past-due secured-payment concern'] : []),
    ...(special ? ['debts needing separate treatment review'] : []),
  ];
  let attorneyTitle: string; let attorneyBody: string;
  if (a.urgentEvents.length) {
    attorneyTitle = 'Do I need an attorney? Get prompt legal help';
    attorneyBody = `Professional help is especially important because you reported ${reasons.join('; ')}. Read the notices and contact a qualified local attorney promptly. This checkup and a consultation do not stop collection, file a response or extend deadlines.`;
  } else if (reasons.length) {
    attorneyTitle = 'Do I need an attorney? Professional help is especially important';
    attorneyBody = `Get qualified bankruptcy advice before choosing a chapter because you reported ${reasons.join('; ')}. Chapter 13 is especially difficult to handle without counsel. Ask about representation costs, local legal aid or court referral resources; free help is not guaranteed.`;
  } else if (missing.length || invalid) {
    attorneyTitle = 'Do I need an attorney? Get advice before choosing';
    attorneyBody = 'Some key facts are missing or invalid. A qualified bankruptcy attorney can help clarify your debts, property and earlier cases before you decide. Unknown answers do not establish that a case is simple or that you can safely handle it yourself.';
  } else {
    attorneyTitle = 'Do I need an attorney? Advice is recommended before filing';
    attorneyBody = 'Even with only ordinary unsecured debts reported, consider a qualified bankruptcy consultation before filing. Unasked property, income-history or debt issues may change the outcome. Ask about Chapter 7, Chapter 13, alternatives and representation costs; this short checkup does not certify a case as safe to handle yourself.';
  }
  attorneyBody += ' Individuals may legally file without an attorney, but the U.S. Courts strongly recommends advice from a qualified attorney. This is a recommendation for help, not a legal requirement to hire counsel.';
  return [
    { id: 'attorney_guidance', title: attorneyTitle, body: attorneyBody, evidenceFields: [], inputRevision: validation.inputRevision },
    { id: 'chapter_guidance', title: chapterTitle, body: chapterBody + common, evidenceFields: [], inputRevision: validation.inputRevision },
  ];
}
