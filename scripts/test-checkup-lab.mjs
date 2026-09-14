import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { browserBundleOptions, thirdPartyNotice } from './build-checkup-lab.mjs';

for (const key of ['LANGSMITH_TRACING', 'LANGCHAIN_TRACING', 'LANGCHAIN_TRACING_V2', 'LANGCHAIN_VERBOSE']) process.env[key] = 'false';
const artifact = path.resolve(`src/checkup-lab/.model-test-${process.pid}-${Date.now()}.mjs`);
const originalFetch = globalThis.fetch;
let networkCalls = 0;
globalThis.fetch = async () => { networkCalls++; throw new Error('Unexpected network operation in the workflow lab.'); };
let checks = 0;
async function check(name, task) {
  await task();
  checks++;
  console.log(`PASS ${name}`);
}
try {
  await build({ entryPoints: ['src/checkup-lab/model.ts'], outfile: artifact, bundle: true, platform: 'node', format: 'esm', target: 'node22', external: ['@langchain/langgraph'], logLevel: 'silent' });
  const { defaultConfig, validateConfig, buildOrder, runDraft, runBaseline, importConfig, exportConfig, checkpointId } = await import(pathToFileURL(artifact));
  const fixtures = JSON.parse(await fs.readFile('src/checkup-lab/fixtures.json', 'utf8'));
  const context = {
    asOfDate: '2026-09-14', implementationVersion: '0.3.1', capabilityManifestVersion: 'snapshot-only-1',
    templateVersion: 'guide-informed-roadmap-draft-4', contentMapVersion: 'official-reading-2026-09-14', locale: 'en-US', rounding: 'integer-cents',
  };
  const normalize = result => ({ ...result, workflow: { ...result.workflow, steps: [] } });
  const originals = {};
  for (const [name, input] of Object.entries(fixtures)) {
    await check(`current default graph equivalence: ${name}`, async () => {
      const baseline = await runBaseline(input, context);
      const draft = await runDraft(input, context);
      assert.equal(baseline.engine, 'langgraph');
      assert.equal(baseline.result.workflow.engine, 'langgraph');
      assert.notEqual(baseline.result.status, 'unavailable');
      assert.deepEqual(draft.result, baseline.result);
      assert.equal(draft.steps.length, 8);
      assert.equal(draft.result.workflow.steps.includes('evaluate_reviewed_rules'), false);
      originals[name] = baseline.result;
    });
  }
  const roadmapFixtures = JSON.parse(await fs.readFile('src/checkup-lab/roadmap-fixtures.json', 'utf8'));
  const roadmapChapters = {ordinary_debt_relief:'Chapter 7: discuss this option first',keep_home_roadmap:'Chapter 13: discuss this option first',debt_specific_review:'Chapter 7 or 13? Compare both with debt-specific advice',earlier_case_review:'Chapter 7 or 13? Review the earlier case first'};
  for (const [name, input] of Object.entries(roadmapFixtures)) {
    await check(`guide-informed roadmap fixture baseline/draft equivalence: ${name}`, async () => {
      const baseline = await runBaseline(input, context), draft = await runDraft(input, context);
      assert.deepEqual(draft.result, baseline.result);
      assert.equal(draft.result.findings.find(x=>x.id==='chapter_guidance').title, roadmapChapters[name]);
      const assembly = draft.steps.find(step=>step.nodeId==='assemble_findings');
      assert.deepEqual(assembly.guidance.filter(x=>x.id.startsWith('prepare_')), draft.result.findings.filter(x=>x.id.startsWith('prepare_')));
    });
  }
  await check('debt-specific consultation questions are fresh and independent of checkbox order', async () => {
    const input = structuredClone(roadmapFixtures.debt_specific_review);
    const first = (await runDraft(input, context)).result;
    const prep = result => result.findings.filter(x=>x.id.startsWith('prepare_'));
    assert.deepEqual(prep(first).map(x=>x.id), ['prepare_income','prepare_property','prepare_student','prepare_tax','prepare_support']);
    input.answers.debtKinds.reverse();
    assert.deepEqual(prep((await runDraft(input, context)).result), prep(first));
    input.inputRevision=22;input.answers.debtKinds=['medical'];
    const fresh = (await runDraft(input, context)).result;
    assert.deepEqual(prep(fresh).map(x=>x.id), ['prepare_income','prepare_property','prepare_unsecured']);
    assert.ok(fresh.findings.every(x=>x.inputRevision===22));
  });
  await check('shortfall arithmetic remains integer cents', async () => {
    assert.equal(originals.shortfall.snapshot.beforeAdditionalPayments.minCents, 55000);
    assert.equal(originals.shortfall.snapshot.afterAdditionalPayments.maxCents, -30000);
    assert.equal(originals.shortfall.snapshot.classification, 'shortfall');
  });
  const guide = result => result.findings.find(item => item.id === 'bankruptcy_discussion').body;
  await check('current graph explains separate-payment shortfall without a filing verdict', async () => {
    assert.match(guide(originals.shortfall), /additional debt payments.*shortfall/);
    assert.match(guide(originals.shortfall), /not proof you should file/);
    assert.equal(originals.shortfall.evaluation.capabilityManifestVersion, 'snapshot-only-1');
  });
  await check('recurring budget gap and balanced month get distinct education', async () => {
    const gap = structuredClone(fixtures.shortfall), balanced = structuredClone(fixtures.shortfall);
    gap.answers.monthlyTakeHome = {kind:'exact', cents:300000};
    balanced.answers.monthlyTakeHome = {kind:'exact', cents:balanced.answers.monthlyExpenses.cents + balanced.answers.additionalDebtPayments.cents};
    assert.match(guide((await runDraft(gap, context)).result), /recurring expenses already exceed/);
    const result = (await runDraft(balanced, context)).result;
    assert.equal(result.snapshot.classification, 'balanced');
    assert.match(guide(result), /total debts are affordable or rule bankruptcy out/);
  });
  await check('all three payment-pressure self-reports guide surplus through the actual graph', async () => {
    for (const debtSituation of ['falling_behind','borrowing_for_basics','balances_not_shrinking']) {
      const input = structuredClone(fixtures.remaining);
      input.answers.debtSituation = debtSituation;
      const baseline = await runBaseline(input, context), draft = await runDraft(input, context);
      assert.deepEqual(draft.result, baseline.result);
      assert.equal(draft.result.snapshot.classification, 'remaining');
      assert.match(guide(draft.result), /because you reported/);
      assert.match(guide(draft.result), /not a conclusion that you should file/);
    }
  });
  await check('incomplete budgets and urgency get helpful non-reassuring discussion guidance', async () => {
    assert.match(guide(originals.uncertain_range), /not reasons to conclude that you should or should not file/);
    assert.match(guide(originals.overlapping_payments), /overlapping payments/);
    assert.match(guide(originals.invalid_income), /do not stop collection or extend a deadline/);
    assert.match(guide(originals.unknown_income), /Get qualified local legal help promptly/);
  });
  await check('debt and property inputs guide questions without enabling legal rules', async () => {
    const input = structuredClone(fixtures.remaining);
    input.answers.debtKinds = ['student','tax','support'];
    input.answers.mainGoal = 'keep_home';
    input.answers.urgentEvents = ['lawsuit'];
    const result = (await runDraft(input, context)).result;
    assert(result.findings.some(x=>x.id==='special_debt_questions'));
    assert(result.findings.some(x=>x.id==='secured_property_questions'));
    assert.equal(result.readingTopics.length,5);
    assert.match(result.readingTopics.find(x=>x.id==='student_loans').title,/Federal student loans/);
    assert.equal(result.workflow.steps.includes('evaluate_reviewed_rules'),false);
    assert(result.nextSteps.some(x=>x.includes('what happens if I do not file')));
  });
  await check('optional context defaults support original fixtures and reject arbitrary selections', async () => {
    const input = structuredClone(fixtures.unknown_income);
    input.answers.debtSituation = 'file_now'; input.answers.mainGoal = 'guaranteed_discharge';
    const result = (await runDraft(input, context)).result;
    assert.equal(result.status,'needs_input');
    assert(result.fieldErrors.some(x=>x.field==='debtSituation'));
    assert(result.fieldErrors.some(x=>x.field==='mainGoal'));
    assert.equal(result.urgency.warnings[0].id,'foreclosure');
    assert.doesNotMatch(JSON.stringify(result),/file_now|guaranteed_discharge/);
  });
  const chapterTitle = result => {
    const finding = result.findings.find(item => item.id === 'chapter_guidance');
    assert(finding, 'The actual graph must return chapter discussion guidance.');
    return finding.title;
  };
  const attorneyTitle = result => {
    const finding = result.findings.find(item => item.id === 'attorney_guidance');
    assert(finding, 'The actual graph must return attorney discussion guidance.');
    return finding.title;
  };
  const discussionInput = overrides => {
    const input = structuredClone(fixtures.shortfall);
    Object.assign(input.answers, {
      debtSituation: 'falling_behind', mainGoal: 'debt_relief', incomeRegularity: 'regular',
      securedArrears: 'none', priorBankruptcy: 'no', ...overrides,
    });
    return input;
  };
  const chapterCases = [
    ['ordinary unsecured debt relief', discussionInput({debtKinds:['credit_card','medical','personal_loan']}), 'Chapter 7: discuss this option first'],
    ['regular income and home arrears', discussionInput({debtKinds:['credit_card','mortgage'],mainGoal:'keep_home',securedArrears:'mortgage'}), 'Chapter 13: discuss this option first'],
    ['regular income and vehicle arrears', discussionInput({debtKinds:['credit_card','auto'],mainGoal:'keep_vehicle',securedArrears:'vehicle'}), 'Chapter 13: discuss this option first'],
    ['prior bankruptcy comes before missing facts', discussionInput({priorBankruptcy:'yes',incomeRegularity:'unknown',securedArrears:'unknown'}), 'Chapter 7 or 13? Review the earlier case first'],
    ['invalid chapter discussion input', discussionInput({incomeRegularity:'guaranteed_eligibility'}), 'Chapter 7 or 13? Correct the discussion inputs'],
    ['special debt comes before a home-arrears priority', discussionInput({debtKinds:['mortgage','student'],mainGoal:'keep_home',securedArrears:'mortgage'}), 'Chapter 7 or 13? Compare both with debt-specific advice'],
    ['no current income and home arrears', discussionInput({monthlyTakeHome:{kind:'exact',cents:0},incomeRegularity:'no_current_income',debtKinds:['mortgage','credit_card'],mainGoal:'keep_home',securedArrears:'mortgage'}), 'Chapter 7 or 13? Review payment feasibility first'],
    ['home goal with both property loans past due', discussionInput({debtKinds:['mortgage','auto','credit_card'],mainGoal:'keep_home',securedArrears:'both'}), 'Chapter 7 or 13? Compare both before choosing'],
    ['home goal with vehicle arrears', discussionInput({debtKinds:['auto','credit_card'],mainGoal:'keep_home',securedArrears:'vehicle'}), 'Chapter 7 or 13? Compare both before choosing'],
    ['foreclosure concern alongside no reported arrears', discussionInput({urgentEvents:['foreclosure']}), 'Chapter 7 or 13? Compare both before choosing'],
    ['repossession concern alongside no reported arrears', discussionInput({urgentEvents:['repossession']}), 'Chapter 7 or 13? Compare both before choosing'],
    ['property goal without secured arrears', discussionInput({mainGoal:'keep_home'}), 'Chapter 7 or 13? Compare both before choosing'],
  ];
  for (const [name, input, expected] of chapterCases) {
    await check(`actual graph chapter discussion priority: ${name}`, async () => {
      const baseline = await runBaseline(input, context), draft = await runDraft(input, context);
      assert.deepEqual(draft.result, baseline.result);
      assert.equal(chapterTitle(draft.result), expected);
      assert.equal(draft.result.workflow.steps.length, 8);
      assert.equal(draft.result.workflow.steps.includes('evaluate_reviewed_rules'), false);
      if (name === 'invalid chapter discussion input') {
        assert.equal(draft.result.status, 'needs_input');
        assert(draft.result.fieldErrors.some(item=>item.field==='incomeRegularity'));
        assert.doesNotMatch(JSON.stringify(draft.result), /guaranteed_eligibility/);
      }
    });
  }
  await check('unknown essential discussion facts do not silently choose a chapter', async () => {
    for (const overrides of [
      {incomeRegularity:'unknown'}, {securedArrears:'unknown'}, {priorBankruptcy:'unknown'},
      {mainGoal:'unsure'}, {debtKinds:[]},
    ]) {
      const result = (await runDraft(discussionInput(overrides), context)).result;
      assert.equal(chapterTitle(result), 'Chapter 7 or 13? Clarify these facts first');
    }
    for (const result of Object.values(originals)) {
      assert.equal(chapterTitle(result), 'Chapter 7 or 13? Clarify these facts first');
    }
  });
  await check('each special or unclassified debt type requires comparing both chapters', async () => {
    for (const kind of ['student','tax','support','other']) {
      const result = (await runDraft(discussionInput({debtKinds:['credit_card',kind]}), context)).result;
      assert.equal(chapterTitle(result), 'Chapter 7 or 13? Compare both with debt-specific advice');
    }
  });
  await check('attorney guidance distinguishes routine, complex and incomplete discussion inputs', async () => {
    assert.equal(attorneyTitle((await runDraft(discussionInput({}), context)).result), 'Do I need an attorney? Advice is recommended before filing');
    const property = discussionInput({debtKinds:['mortgage'],mainGoal:'keep_home',securedArrears:'mortgage'});
    assert.equal(attorneyTitle((await runDraft(property, context)).result), 'Do I need an attorney? Professional help is especially important');
    assert.equal(attorneyTitle((await runDraft(discussionInput({incomeRegularity:'unknown'}), context)).result), 'Do I need an attorney? Get advice before choosing');
  });
  await check('cash-flow sign does not choose the chapter discussion priority', async () => {
    const shortfall = discussionInput({monthlyTakeHome:{kind:'exact',cents:100000}});
    const remaining = discussionInput({monthlyTakeHome:{kind:'exact',cents:800000}});
    const deficit = (await runDraft(shortfall, context)).result, surplus = (await runDraft(remaining, context)).result;
    assert.equal(deficit.snapshot.classification, 'shortfall');
    assert.equal(surplus.snapshot.classification, 'remaining');
    assert.equal(chapterTitle(deficit), 'Chapter 7: discuss this option first');
    assert.equal(chapterTitle(surplus), chapterTitle(deficit));
  });
  await check('urgency strengthens attorney guidance independently of chapter discussion', async () => {
    const input = discussionInput({urgentEvents:['lawsuit']});
    const result = (await runDraft(input, context)).result;
    assert.equal(attorneyTitle(result), 'Do I need an attorney? Get prompt legal help');
    assert.equal(chapterTitle(result), 'Chapter 7: discuss this option first');
    assert.equal(result.urgency.warnings[0].id, 'lawsuit');
    input.answers.incomeRegularity = 'unknown';
    input.answers.priorBankruptcy = 'yes';
    const prior = (await runDraft(input, context)).result;
    assert.equal(attorneyTitle(prior), 'Do I need an attorney? Get prompt legal help');
    assert.equal(chapterTitle(prior), 'Chapter 7 or 13? Review the earlier case first');
  });
  await check('urgent attorney help remains first when money is invalid', async () => {
    const input = discussionInput({monthlyTakeHome:{kind:'exact',cents:-1},urgentEvents:['lawsuit']});
    const baseline = await runBaseline(input, context), draft = await runDraft(input, context);
    assert.deepEqual(draft.result, baseline.result);
    assert.equal(draft.result.status, 'needs_input');
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert(draft.result.fieldErrors.some(item=>item.field==='monthlyTakeHome'));
    assert.equal(draft.result.urgency.warnings[0].id, 'lawsuit');
    assert.equal(attorneyTitle(draft.result), 'Do I need an attorney? Get prompt legal help');
  });
  await check('invalid new selectors stay unknown, report errors and preserve urgency', async () => {
    const input = discussionInput({securedArrears:'erase_mortgage',priorBankruptcy:'ignore_prior_case',urgentEvents:['foreclosure']});
    const draft = await runDraft(input, context);
    assert.equal(draft.result.status, 'needs_input');
    assert(draft.result.fieldErrors.some(item=>item.field==='securedArrears'));
    assert(draft.result.fieldErrors.some(item=>item.field==='priorBankruptcy'));
    assert.equal(draft.steps.find(step=>step.nodeId==='validate_and_preserve_urgency').guidanceInputs.securedArrears, 'unknown');
    assert.equal(draft.steps.find(step=>step.nodeId==='validate_and_preserve_urgency').guidanceInputs.priorBankruptcy, 'unknown');
    assert.equal(draft.result.urgency.warnings[0].id, 'foreclosure');
    assert.equal(chapterTitle(draft.result), 'Chapter 7 or 13? Correct the discussion inputs');
    assert.doesNotMatch(JSON.stringify(draft.result), /erase_mortgage|ignore_prior_case/);
  });
  await check('decision guidance is assembled inside the existing real graph node', async () => {
    const draft = await runDraft(discussionInput({}), context);
    const assembly = draft.steps.find(step=>step.nodeId==='assemble_findings');
    assert.equal(assembly.result, null);
    for (const id of ['attorney_guidance','chapter_guidance']) {
      assert.deepEqual(assembly.guidance.find(item=>item.id===id), draft.result.findings.find(item=>item.id===id));
    }
    assert.equal(assembly.guidanceInputs.incomeRegularity, 'regular');
    assert.equal(assembly.guidanceInputs.securedArrears, 'none');
    assert.equal(assembly.guidanceInputs.priorBankruptcy, 'no');
  });
  await check('same invented answers and context give identical guidance and execution paths', async () => {
    for (const [, input] of chapterCases) {
      const first = await runDraft(input, context), second = await runDraft(structuredClone(input), {...context});
      assert.deepEqual(second.result, first.result);
      assert.deepEqual(second.steps, first.steps);
      assert.deepEqual(second.order, first.order);
    }
  });
  await check('observer copies cannot mutate chapter inputs or assembled advice', async () => {
    const input = discussionInput({});
    const draft = await runDraft(input, context, defaultConfig, {
      after(step) {
        if (step.guidanceInputs) step.guidanceInputs.debtKinds.push('other');
        for (const finding of step.guidance) finding.body = 'This observer attempted to alter guidance.';
      },
    });
    assert.equal(chapterTitle(draft.result), 'Chapter 7: discuss this option first');
    assert.doesNotMatch(JSON.stringify(draft.result), /observer attempted/);
    assert.deepEqual(input.answers.debtKinds, ['credit_card','medical']);
  });
  await check('all 12 safe placement/checkpoint combinations execute actual graph', async () => {
    for (const limitPlacement of ['after_capabilities', 'before_calculation', 'after_calculation']) {
      for (const checkpointPlacement of ['off', 'after_validation', 'after_calculation', 'before_rendering']) {
        const config = { ...defaultConfig, limitPlacement, checkpointPlacement };
        for (const [name, input] of Object.entries(fixtures)) {
          const draft = await runDraft(input, context, config);
          assert.deepEqual(normalize(draft.result), normalize(originals[name]), `${limitPlacement}/${checkpointPlacement}/${name}`);
          assert.deepEqual(draft.steps.map(step => step.nodeId), buildOrder(config));
          assert.deepEqual(draft.result.workflow.steps, buildOrder(config).filter(id => id !== checkpointId));
          assert.equal(draft.result.workflow.steps.length, 8);
          assert.equal(draft.result.workflow.steps.includes(checkpointId), false);
          assert.equal(draft.steps.length, checkpointPlacement === 'off' ? 8 : 9);
        }
      }
    }
  });
  await check('safe draft scope changes output without changing baseline', async () => {
    const draft = await runDraft(fixtures.shortfall, context, { ...defaultConfig, calculationScope: 'before_only' });
    assert.equal(draft.result.snapshot.beforeAdditionalPayments.minCents, 55000);
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert.equal(draft.result.snapshot.classification, 'not_calculated');
    assert.equal(draft.draftNotes.length, 1);
    assert.equal((await runBaseline(fixtures.shortfall, context)).result.snapshot.afterAdditionalPayments.maxCents, -30000);
  });
  await check('before-only draft does not ask for unused debt-payment information', async () => {
    const unknownPayments = structuredClone(fixtures.shortfall);
    unknownPayments.answers.additionalDebtPayments = { kind: 'unknown' };
    unknownPayments.answers.additionalPaymentsSeparate = 'unknown';
    for (const input of [unknownPayments, fixtures.overlapping_payments]) {
      const draft = await runDraft(input, context, { ...defaultConfig, calculationScope: 'before_only' });
      assert.equal(draft.result.snapshot.beforeAdditionalPayments.minCents, 55000);
      assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
      assert.equal(draft.result.status, 'result');
      assert.deepEqual(draft.steps.find(step => step.nodeId === 'plan_supported_work').plan.missing, []);
      assert.equal(draft.result.limitations.some(limit => limit.id.includes('additionalDebtPayments') || limit.id.includes('additionalPaymentsSeparate')), false);
    }
  });
  await check('unknown income stays unknown and urgency is preserved', async () => {
    const draft = await runDraft(fixtures.unknown_income, context, { ...defaultConfig, limitPlacement: 'after_capabilities', checkpointPlacement: 'after_validation' });
    assert.equal(draft.result.snapshot.inputs.monthlyTakeHome.kind, 'unknown');
    assert.equal(draft.result.snapshot.beforeAdditionalPayments, null);
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert.equal(draft.result.urgency.warnings[0].id, 'foreclosure');
  });
  await check('invalid income still preserves recognized foreclosure', async () => {
    const draft = await runDraft(fixtures.invalid_income, context);
    assert.equal(draft.result.status, 'needs_input');
    assert.equal(draft.result.urgency.warnings[0].id, 'foreclosure');
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert(draft.result.fieldErrors.some(error => error.field === 'monthlyTakeHome'));
  });
  await check('overlapping payments cannot be subtracted twice', async () => {
    const draft = await runDraft(fixtures.overlapping_payments, context);
    assert.equal(draft.result.snapshot.beforeAdditionalPayments.minCents, 55000);
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert(draft.steps.find(step => step.nodeId === 'plan_supported_work').plan.missing.includes('additionalPaymentsSeparate'));
  });
  await check('ranges are not collapsed and zero is distinct from unknown', async () => {
    assert.equal(originals.uncertain_range.snapshot.afterAdditionalPayments.minCents, -35000);
    assert.equal(originals.uncertain_range.snapshot.afterAdditionalPayments.maxCents, 35000);
    assert.equal(originals.uncertain_range.snapshot.classification, 'uncertain');
    assert.equal(originals.zero_income.snapshot.inputs.monthlyTakeHome.cents, 0);
    assert.equal(originals.zero_income.snapshot.afterAdditionalPayments.maxCents, -150000);
  });
  await check('fresh state and observer copies cannot contaminate later answers', async () => {
    await runDraft(fixtures.shortfall, context, defaultConfig, { after(step) { if (step.snapshot) step.snapshot.inputs.monthlyTakeHome = { kind: 'exact', cents: 1 }; } });
    const changed = structuredClone(fixtures.remaining);
    changed.inputRevision = 2;
    const second = await runDraft(changed, context);
    assert.equal(second.result.inputRevision, 2);
    assert.equal(second.result.snapshot.afterAdditionalPayments.minCents, 200000);
    assert(second.result.findings.every(finding => finding.inputRevision === 2));
    assert.equal(second.steps.length, 8);
    assert.equal(fixtures.shortfall.answers.monthlyTakeHome.cents, 420000);
  });
  await check('manual stepping actually awaits the next node', async () => {
    let release;
    let announce;
    const arrived = new Promise(resolve => { announce = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    const completed = [];
    const running = runDraft(fixtures.shortfall, context, defaultConfig, {
      async before(id) { if (id === 'calculate_snapshot') { announce(); await gate; } },
      after(step) { completed.push(step.nodeId); },
    });
    await arrived;
    assert.deepEqual(completed, ['validate_and_preserve_urgency', 'load_capabilities', 'plan_supported_work']);
    release();
    const result = await running;
    assert.equal(result.steps.length, 8);
  });
  await check('observer projection excludes raw requests and capability internals', async () => {
    const draft = await runDraft(fixtures.shortfall, context);
    for (const step of draft.steps) {
      assert.equal(Object.hasOwn(step, 'rawInput'), false);
      assert.equal(Object.hasOwn(step, 'activeRuleIds'), false);
      assert.equal(Object.hasOwn(step, 'context'), false);
    }
  });
  await check('configuration imports round-trip only supported bounded settings', async () => {
    const value = { ...defaultConfig, title: 'Matt and Jimmy draft', reviewNote: 'Compare the earlier limits step.' };
    assert.deepEqual(importConfig(exportConfig(value)), value);
    for (const invalid of [
      null, [], {}, { ...value, schemaVersion: 2 }, { ...value, code: 'alert(1)' }, { ...value, title: '' },
      { ...value, title: 'x'.repeat(101) }, { ...value, reviewNote: 'x'.repeat(601) },
      { ...value, limitPlacement: 'before_validation' }, { ...value, checkpointPlacement: 'skip_validation' },
      { ...value, calculationScope: 'chapter_7' }, { ...value, enabledRules: ['exemptions'] },
    ]) assert.throws(() => validateConfig(invalid));
    assert.throws(() => importConfig('{'));
    assert.throws(() => importConfig('x'.repeat(12001)));
    assert.throws(() => importConfig('{"__proto__":{},"schemaVersion":1}'));
  });
  await check('non-synthetic/unsupported requests cannot expose debug state', async () => {
    let observerCalls = 0;
    for (const raw of [null, {}, { ...fixtures.shortfall, synthetic: false }, { ...fixtures.shortfall, consumerName: 'No real person' }]) {
      await assert.rejects(runDraft(raw, context, defaultConfig, { after() { observerCalls++; } }));
      await assert.rejects(runBaseline(raw, context));
    }
    assert.equal(observerCalls, 0);
  });
  await check('ambient tracing is rejected before any graph operation', async () => {
    process.env.LANGSMITH_TRACING = 'true';
    try {
      await assert.rejects(runDraft(fixtures.shortfall, context), /Tracing/);
      await assert.rejects(runBaseline(fixtures.shortfall, context), /Tracing/);
    } finally { process.env.LANGSMITH_TRACING = 'false'; }
  });
  await check('aborted run stops before publishing a result', async () => {
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(runDraft(fixtures.shortfall, context, defaultConfig, {}, controller.signal));
  });
  await check('cancellation during a paused real node clears the unfinished run', async () => {
    const controller = new AbortController();
    const completed = [];
    let announce;
    const arrived = new Promise(resolve => { announce = resolve; });
    const running = runDraft(fixtures.shortfall, context, defaultConfig, {
      before(id) {
        if (id !== 'calculate_snapshot') return;
        announce();
        return new Promise((resolve, reject) => { controller.signal.addEventListener('abort', () => reject(new Error('stopped')), { once: true }); });
      },
      after(step) { completed.push(step.nodeId); },
    }, controller.signal);
    const rejected = assert.rejects(running);
    await arrived;
    controller.abort();
    await rejected;
    assert.deepEqual(completed, ['validate_and_preserve_urgency', 'load_capabilities', 'plan_supported_work']);
    assert.equal((await runDraft(fixtures.remaining, context)).result.snapshot.afterAdditionalPayments.minCents, 200000);
  });
  // Browser package exports, definitions and supported syntax match production.
  // ESM packaging makes exports callable in Node; this is not a Chrome UI test.
  const browserBundle = await build({ ...browserBundleOptions, entryPoints: ['src/checkup-lab/model.ts'], format: 'esm', write: false, metafile: true, logLevel: 'silent' });
  const browserModel = await import(`data:text/javascript;base64,${Buffer.from(browserBundle.outputFiles[0].text).toString('base64')}`);
  const plain = value => JSON.parse(JSON.stringify(value));
  for (const [name, input] of Object.entries(fixtures)) {
    await check(`browser-target bundled code under Node: ${name}`, async () => {
      const baseline = await browserModel.runBaseline(input, context);
      const draft = await browserModel.runDraft(input, context);
      assert.deepEqual(plain(baseline.result), originals[name]);
      assert.deepEqual(plain(draft.result), originals[name]);
      assert.equal(draft.steps.length, 8);
    });
  }
  await check('browser-target actual graph preserves chapter discussion decisions and determinism', async () => {
    for (const [, input, expected] of chapterCases) {
      const first = await browserModel.runDraft(input, context), second = await browserModel.runDraft(structuredClone(input), {...context});
      assert.equal(chapterTitle(first.result), expected);
      assert.deepEqual(plain(second.result), plain(first.result));
      assert.deepEqual(plain(second.steps), plain(first.steps));
      assert.equal(first.steps.find(step=>step.nodeId==='assemble_findings').guidance.some(item=>item.id==='chapter_guidance'), true);
    }
  });
  await check('browser-target bundled draft adds real checkpoint and safe scope', async () => {
    const config = { ...defaultConfig, limitPlacement: 'after_capabilities', checkpointPlacement: 'before_rendering', calculationScope: 'before_only' };
    const draft = await browserModel.runDraft(fixtures.shortfall, context, config);
    assert.equal(draft.steps.length, 9);
    assert(draft.steps.some(step => step.nodeId === checkpointId));
    assert.equal(draft.result.snapshot.beforeAdditionalPayments.minCents, 55000);
    assert.equal(draft.result.snapshot.afterAdditionalPayments, null);
    assert.equal(draft.result.workflow.steps.length, 8);
  });
  await check('bundled third-party copyright and full license notices are retained', async () => {
    const notice = await thirdPartyNotice(browserBundle.metafile);
    assert(notice.packageIds.includes('@langchain/langgraph@1.4.15'));
    assert(notice.packageIds.includes('@langchain/core@1.2.11'));
    assert(notice.text.includes('Copyright'));
    assert(notice.text.includes('Permission is hereby granted'));
    assert(notice.text.includes('THE SOFTWARE IS PROVIDED'));
    assert.equal(notice.text.includes('*/'), false);
  });
  await check('all native and browser-target graph experiments caused zero network calls', async () => { assert.equal(networkCalls, 0); });
  console.log(JSON.stringify({ suite: 'Checkup interactive real LangGraph workflow lab', checks, failures: 0, networkCalls, browserBundledCodeUnderNode: true, browserBundledFixtures: 7 }));
} catch (error) {
  console.error(`FAIL workflow lab regression: ${error.name}: ${error.message}`);
  process.exitCode = 1;
} finally {
  globalThis.fetch = originalFetch;
  await fs.unlink(artifact).catch(error => { if (error.code !== 'ENOENT') throw error; });
}
