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
    asOfDate: '2026-09-13', implementationVersion: '0.1.0', capabilityManifestVersion: 'snapshot-only-1',
    templateVersion: 'draft-1', contentMapVersion: 'official-reading-draft-1', locale: 'en-US', rounding: 'integer-cents',
  };
  const normalize = result => ({ ...result, workflow: { ...result.workflow, steps: [] } });
  const originals = {};
  for (const [name, input] of Object.entries(fixtures)) {
    await check(`original graph equivalence: ${name}`, async () => {
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
