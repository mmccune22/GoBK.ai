import { buildOrder, defaultConfig, exportConfig, importConfig, runBaseline, runDraft, validateConfig } from './model';
import type { LabConfig, LabStep } from './model';
import type { PublicResult } from './engine/core/types';
import { contextForDate } from './engine/core/content';
import { centsFromDollars } from './engine/core/validation';
import { formatInterval } from './engine/core/metrics';
import fixtures from './fixtures.json';
import roadmapFixtures from './roadmap-fixtures.json';
import { PREPARATION_IDS } from './engine/core/preparation';
import { READING_URLS } from './engine/core/content';
const examples = { ...fixtures, ...roadmapFixtures };

// Real LangGraph is bundled here. No preview evaluator, model, cloud tracing,
// storage, or assessment request is used by this separate development sandbox.
const root = document.getElementById('checkup-workflow-lab');
if (root) initialize(root);
function initialize(root: HTMLElement) {
  const el = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#lab-${id}`)!;
  const titles: Record<string, [string, string]> = {
    validate_and_preserve_urgency: ['Check answers and urgency', 'Validate the supported answers. A recognized urgent concern survives an invalid or unknown amount.'],
    load_capabilities: ['Check enabled capabilities', 'The current capabilities are a monthly snapshot and fixed educational guidance. No reviewed legal assessment rules are enabled.'],
    plan_supported_work: ['Plan supported calculations', 'Decide which comparisons have sufficient answers. Do not subtract additional payments twice. The draft scope can stop at the before-debt comparison.'],
    calculate_snapshot: ['Calculate the snapshot', 'Use the existing integer-cent functions. Income minus expenses produces the first comparison; confirmed separate payments produce the second. Ranges keep their lower and upper bounds.'],
    record_legal_limits: ['State the legal limits', 'Record that chapter eligibility, property protection and debt treatment are outside this version. You can move this node without changing those limits.'],
    draft_review_checkpoint: ['Review checkpoint', 'An extra real graph node for your draft review note. In Step through mode execution waits here until you press Next step. The note does not change the calculation.'],
    assemble_findings: ['Build the issue list and discussion path', 'Ordinary TypeScript checks reported concerns, debt types, income regularity, arrears, goals and prior bankruptcy to choose attorney and chapter discussion topics. Marriage, household, broad income, equity and other-property answers add preparation questions without becoming means-test, exemption or waiting-period rules.'],
    render_result: ['Assemble the result', 'Prepare the structured result, including urgent concerns, supported amounts, errors and next steps.'],
    validate_public_result: ['Check the public result', 'The existing strict output validator checks the result contract, amounts, classification and answer revision.'],
  };
  let config: LabConfig = structuredClone(defaultConfig);
  let revision = 1, generation = 0;
  let controller: AbortController | null = null;
  let releaseStep: (() => void) | null = null;
  let waitingNode: string | null = null, selected = 'validate_and_preserve_urgency';
  let steps: LabStep[] = [], baseline: PublicResult | null = null, draft: PublicResult | null = null;
  const fields = Array.from(root.querySelectorAll<HTMLElement>('[data-money-field]'));
  const debtChoices = Array.from(root.querySelectorAll<HTMLInputElement>('[data-debt-kind]'));
  const ordinaryDebtKinds = new Set(['credit_card', 'medical', 'personal_loan']);
  const answerControlIds = [
    'separate', 'urgency', 'main-goal', 'marital-status', 'spouse-filing', 'household-size',
    'gross-monthly-income-band', 'income-regularity', 'home-ownership', 'mortgage-status',
    'home-equity', 'vehicle-ownership', 'vehicle-loan-status', 'vehicle-equity',
    'significant-assets', 'tax-debt', 'support-debt', 'student-debt', 'unsecured-debt',
    'debt-situation', 'prior-bankruptcy', 'prior-bankruptcy-recency',
  ];
  const setStatus = (text: string) => { el('status').textContent = text; };
  const setFileStatus = (text: string) => { el('file-status').textContent = text; };
  const button = (id: string) => el<HTMLButtonElement>(id);
  const getConfig = () => validateConfig({
    schemaVersion: 1, title: el<HTMLInputElement>('title').value,
    reviewNote: el<HTMLTextAreaElement>('review-note').value,
    limitPlacement: el<HTMLSelectElement>('limit-placement').value,
    checkpointPlacement: el<HTMLSelectElement>('checkpoint-placement').value,
    calculationScope: el<HTMLSelectElement>('calculation-scope').value,
  });
  function fillConfig(value: LabConfig) {
    config = validateConfig(value);
    el<HTMLInputElement>('title').value = config.title;
    el<HTMLTextAreaElement>('review-note').value = config.reviewNote;
    el<HTMLSelectElement>('limit-placement').value = config.limitPlacement;
    el<HTMLSelectElement>('checkpoint-placement').value = config.checkpointPlacement;
    el<HTMLSelectElement>('calculation-scope').value = config.calculationScope;
  }
  function syncMoney(field: HTMLElement) {
    const kind = field.querySelector<HTMLSelectElement>('[data-money-kind]')!.value;
    field.querySelector<HTMLElement>('[data-range-row]')!.hidden = kind !== 'range';
    field.querySelector<HTMLElement>('[data-amount-label]')!.textContent = kind === 'range' ? 'Minimum ($)' : 'Amount ($)';
    field.querySelector<HTMLInputElement>('[data-money-amount]')!.disabled = ['unknown', 'not_provided'].includes(kind);
  }
  function syncUnsecuredDetail() {
    const applies = el<HTMLSelectElement>('unsecured-debt').value === 'yes';
    el('unsecured-details').hidden = !applies;
    for (const choice of debtChoices.filter(value => ordinaryDebtKinds.has(value.value))) {
      choice.disabled = !applies;
      if (!applies) choice.checked = false;
    }
  }
  function loadExample(name: string) {
    const example = (examples as Record<string, any>)[name];
    const a = example.answers;
    for (const field of fields) {
      const value = example.answers[field.dataset.moneyField!];
      field.querySelector<HTMLSelectElement>('[data-money-kind]')!.value = value.kind;
      field.querySelector<HTMLInputElement>('[data-money-amount]')!.value = String((value.cents ?? value.minCents ?? 0) / 100);
      field.querySelector<HTMLInputElement>('[data-money-maximum]')!.value = String((value.maxCents ?? value.cents ?? 0) / 100);
      syncMoney(field);
    }
    const set = (id: string, value: string) => { el<HTMLSelectElement>(id).value = value; };
    const kinds = new Set<string>(a.debtKinds ?? []);
    const home = a.homeOwnership ?? (kinds.has('mortgage') || ['mortgage', 'both'].includes(a.securedArrears) || a.mainGoal === 'keep_home' ? 'yes' : 'no');
    const vehicle = a.vehicleOwnership ?? (kinds.has('auto') || ['vehicle', 'both'].includes(a.securedArrears) || a.mainGoal === 'keep_vehicle' ? 'yes' : 'no');
    set('separate', a.additionalPaymentsSeparate ?? 'not_provided');
    set('urgency', a.urgentEvents?.[0] ?? 'none');
    set('main-goal', a.mainGoal ?? 'unsure');
    set('marital-status', a.maritalStatus ?? 'unknown');
    set('spouse-filing', a.spouseFiling ?? (a.maritalStatus === 'married' ? 'unsure' : 'not_applicable'));
    set('household-size', a.householdSize ?? 'unknown');
    set('gross-monthly-income-band', a.grossMonthlyIncomeBand ?? 'unknown');
    set('income-regularity', a.incomeRegularity ?? 'unknown');
    set('home-ownership', home);
    set('mortgage-status', a.mortgageStatus ?? (['mortgage', 'both'].includes(a.securedArrears) ? 'behind' : home === 'yes' ? 'current' : 'not_applicable'));
    set('home-equity', a.homeEquity ?? (home === 'yes' ? 'unknown' : 'not_applicable'));
    set('vehicle-ownership', vehicle);
    set('vehicle-loan-status', a.vehicleLoanStatus ?? (['vehicle', 'both'].includes(a.securedArrears) ? 'behind' : vehicle === 'yes' ? 'current' : 'not_applicable'));
    set('vehicle-equity', a.vehicleEquity ?? (vehicle === 'yes' ? 'unknown' : 'not_applicable'));
    set('significant-assets', a.significantAssets ?? 'unknown');
    set('tax-debt', a.taxDebt ?? (kinds.has('tax') ? 'yes' : 'no'));
    set('support-debt', a.supportDebt ?? (kinds.has('support') ? 'yes' : 'no'));
    set('student-debt', a.studentDebt ?? (kinds.has('student') ? 'yes' : 'no'));
    set('unsecured-debt', a.unsecuredDebt ?? ([...kinds].some(kind => ordinaryDebtKinds.has(kind)) ? 'yes' : 'no'));
    set('debt-situation', a.debtSituation ?? 'unknown');
    set('prior-bankruptcy', a.priorBankruptcy ?? 'unknown');
    set('prior-bankruptcy-recency', a.priorBankruptcyRecency ?? (a.priorBankruptcy === 'yes' ? 'unknown' : 'not_applicable'));
    for (const choice of debtChoices) choice.checked = kinds.has(choice.value);
    syncUnsecuredDetail();
  }
  function readInput() {
    const answers: Record<string, unknown> = {};
    for (const field of fields) {
      const kind = field.querySelector<HTMLSelectElement>('[data-money-kind]')!.value;
      const amount = centsFromDollars(field.querySelector<HTMLInputElement>('[data-money-amount]')!.value.trim());
      const maximum = centsFromDollars(field.querySelector<HTMLInputElement>('[data-money-maximum]')!.value.trim());
      answers[field.dataset.moneyField!] = kind === 'range' ? { kind, minCents: amount, maxCents: maximum } : ['unknown', 'not_provided'].includes(kind) ? { kind } : { kind, cents: amount };
    }
    const separate = el<HTMLSelectElement>('separate').value;
    if (separate !== 'not_provided') answers.additionalPaymentsSeparate = separate;
    answers.urgentEvents = [el<HTMLSelectElement>('urgency').value];
    const taxDebt = el<HTMLSelectElement>('tax-debt').value;
    const supportDebt = el<HTMLSelectElement>('support-debt').value;
    const studentDebt = el<HTMLSelectElement>('student-debt').value;
    const unsecuredDebt = el<HTMLSelectElement>('unsecured-debt').value;
    answers.taxDebt = taxDebt;
    answers.supportDebt = supportDebt;
    answers.studentDebt = studentDebt;
    answers.unsecuredDebt = unsecuredDebt;
    const selectedDebts = debtChoices
      .filter(choice => choice.checked && (!ordinaryDebtKinds.has(choice.value) || unsecuredDebt === 'yes'))
      .map(choice => choice.value);
    if (taxDebt === 'yes') selectedDebts.push('tax');
    if (supportDebt === 'yes') selectedDebts.push('support');
    if (studentDebt === 'yes') selectedDebts.push('student');
    if (unsecuredDebt === 'yes' && !selectedDebts.some(kind => ordinaryDebtKinds.has(kind))) selectedDebts.push('credit_card');
    if (['current', 'behind'].includes(el<HTMLSelectElement>('mortgage-status').value)) selectedDebts.push('mortgage');
    if (['current', 'behind'].includes(el<HTMLSelectElement>('vehicle-loan-status').value)) selectedDebts.push('auto');
    answers.debtKinds = [...new Set(selectedDebts)];
    answers.debtSituation = el<HTMLSelectElement>('debt-situation').value;
    answers.mainGoal = el<HTMLSelectElement>('main-goal').value;
    answers.maritalStatus = el<HTMLSelectElement>('marital-status').value;
    answers.spouseFiling = el<HTMLSelectElement>('spouse-filing').value;
    answers.householdSize = el<HTMLSelectElement>('household-size').value;
    answers.grossMonthlyIncomeBand = el<HTMLSelectElement>('gross-monthly-income-band').value;
    answers.incomeRegularity = el<HTMLSelectElement>('income-regularity').value;
    answers.homeOwnership = el<HTMLSelectElement>('home-ownership').value;
    answers.mortgageStatus = el<HTMLSelectElement>('mortgage-status').value;
    answers.homeEquity = el<HTMLSelectElement>('home-equity').value;
    answers.vehicleOwnership = el<HTMLSelectElement>('vehicle-ownership').value;
    answers.vehicleLoanStatus = el<HTMLSelectElement>('vehicle-loan-status').value;
    answers.vehicleEquity = el<HTMLSelectElement>('vehicle-equity').value;
    answers.significantAssets = el<HTMLSelectElement>('significant-assets').value;
    answers.priorBankruptcy = el<HTMLSelectElement>('prior-bankruptcy').value;
    answers.priorBankruptcyRecency = el<HTMLSelectElement>('prior-bankruptcy-recency').value;
    return { schemaVersion: '1', synthetic: true, inputRevision: revision, answers };
  }
  function stop() {
    ++generation;
    controller?.abort(); controller = null;
    releaseStep = null; waitingNode = null;
    button('next').disabled = true; button('stop').disabled = true;
  }
  function invalidate() {
    stop(); revision = revision % 999999 + 1;
    steps = []; baseline = null; draft = null;
    el('baseline').textContent = 'Answers or workflow changed. Run again to compare.';
    el('draft').textContent = 'The previous result has been cleared.';
    el('difference').textContent = '';
    el('share-result').hidden = true;
    try { config = getConfig(); renderNodes(); renderInspection(); setStatus('Draft changed. Press Run draft or Step through.'); }
    catch { renderNodes(); renderInspection(); setStatus('Give the draft a name before running it.'); }
  }
  function renderNodes() {
    const list = el<HTMLOListElement>('nodes'); list.replaceChildren();
    const order = buildOrder(config);
    for (const [index, id] of order.entries()) {
      const li = document.createElement('li'), node = document.createElement('button');
      node.type = 'button'; node.dataset.nodeId = id;
      node.dataset.state = steps.some(step => step.nodeId === id) ? 'done' : waitingNode === id ? 'waiting' : 'pending';
      node.setAttribute('aria-pressed', String(selected === id));
      const number = document.createElement('span'); number.className = 'lab-node-number'; number.textContent = node.dataset.state === 'done' ? '✓' : String(index + 1);
      const text = document.createElement('span'); text.textContent = titles[id][0];
      const detail = document.createElement('small'); detail.textContent = node.dataset.state === 'done' ? 'Executed in LangGraph' : waitingNode === id ? 'Waiting for Next step' : id === 'draft_review_checkpoint' ? 'Your added node' : 'Existing Checkup node'; text.append(detail);
      node.append(number, text); node.addEventListener('click', () => { selected = id; renderNodes(); renderInspection(); });
      li.append(node); list.append(li);
    }
    el('order-note').textContent = `${order.length} nodes connected in the displayed order. Validation dependencies remain fixed.`;
  }
  function renderInspection() {
    const container = el('inspection'); container.replaceChildren();
    if (!titles[selected]) selected = 'validate_and_preserve_urgency';
    const h = document.createElement('h3'); h.textContent = titles[selected][0];
    const code = document.createElement('code'); code.textContent = selected;
    const desc = document.createElement('p'); desc.textContent = titles[selected][1];
    container.append(h, code, desc);
    if (selected === 'draft_review_checkpoint') { const note = document.createElement('p'); note.textContent = `Review note: ${config.reviewNote || 'No note added.'}`; container.append(note); }
    const step = steps.find(value => value.nodeId === selected);
    const text = document.createElement('p'); text.className = 'lab-small';
    text.textContent = step ? 'State after this node executed in the real graph:' : waitingNode === selected ? 'The graph is waiting before this node. Press Next step to execute it.' : 'This node has not run for the current draft and answers.';
    container.append(text);
    if (step) {
      const pre = document.createElement('pre'); pre.textContent = JSON.stringify({
        inputRevision: step.inputRevision, validation: step.validation, calculationPlan: step.plan,
        guidanceInputs: step.guidanceInputs,
        snapshot: step.snapshot, findingCount: step.findingCount,
        completedCoreSteps: step.coreStepIds, publicResultStatus: step.result?.status ?? null,
        optionsRoadmap: step.guidance,
        nextSteps: step.result?.nextSteps ?? null,
      }, null, 2); container.append(pre);
    }
  }
  function resultView(container: HTMLElement, result: PublicResult) {
    container.replaceChildren();
    for (const warning of result.urgency.warnings) {
      const card = document.createElement('div'), heading = document.createElement('h4'), body = document.createElement('p');
      card.className = 'lab-result-warning'; card.dataset.urgencyId = warning.id;
      heading.textContent = warning.title; body.textContent = warning.body; card.append(heading, body); container.append(card);
    }
    if (result.fieldErrors.length) {
      const errors = document.createElement('ul'); errors.className = 'lab-result-errors';
      for (const error of result.fieldErrors) { const li = document.createElement('li'); li.textContent = error.message; errors.append(li); }
      container.append(errors);
    }
    for (const id of ['attorney_guidance', 'chapter_guidance']) {
      const finding = result.findings.find(value => value.id === id); if (!finding) continue;
      const card = document.createElement('section'), label = document.createElement('p'), heading = document.createElement('h4'), body = document.createElement('p');
      card.className = `lab-decision-card ${id === 'attorney_guidance' ? 'lab-attorney-guidance' : 'lab-chapter-guidance'}`; card.dataset.guidanceId = id;
      label.className = 'lab-guidance-label'; label.textContent = id === 'attorney_guidance' ? 'GETTING ADVICE' : 'WHAT TO DISCUSS FIRST';
      heading.textContent = finding.title; body.textContent = finding.body; card.append(label, heading, body); container.append(card);
    }
    const discussion = result.findings.find(finding => finding.id === 'bankruptcy_discussion');
    if (discussion) {
      const roadmap = document.createElement('section'), heading = document.createElement('h4'), body = document.createElement('p');
      roadmap.className = 'lab-options-roadmap'; roadmap.dataset.guidanceId = discussion.id;
      heading.textContent = 'Is bankruptcy worth exploring?';
      if (discussion.title !== heading.textContent) { const title = document.createElement('p'); title.className = 'lab-guidance-answer'; title.textContent = discussion.title; roadmap.append(heading, title); }
      else roadmap.append(heading);
      body.textContent = discussion.body; roadmap.append(body); container.append(roadmap);
    }
    for (const finding of result.findings.filter(finding => !['bankruptcy_discussion', 'attorney_guidance', 'chapter_guidance', ...PREPARATION_IDS].includes(finding.id))) {
      const card = document.createElement('section'), heading = document.createElement('h4'), body = document.createElement('p');
      card.className = 'lab-result-finding'; card.dataset.guidanceId = finding.id;
      heading.textContent = finding.title; body.textContent = finding.body; card.append(heading, body); container.append(card);
    }
    const snapshotHeading = document.createElement('h4'); snapshotHeading.textContent = 'The monthly snapshot'; container.append(snapshotHeading);
    const dl = document.createElement('dl');
    const values = [
      ['Execution', 'Real LangGraph · on this device'], ['Status', result.status],
      ['Before separate payments', result.snapshot.beforeAdditionalPayments ? formatInterval(result.snapshot.beforeAdditionalPayments) : 'Not calculated'],
      ['After separate payments', result.snapshot.afterAdditionalPayments ? formatInterval(result.snapshot.afterAdditionalPayments) : 'Not calculated'],
      ['After-payment classification', result.snapshot.classification.replaceAll('_', ' ')],
    ];
    for (const [title, value] of values) { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = title; dd.textContent = value; dl.append(dt, dd); }
    container.append(dl);
    if (result.nextSteps.length) {
      const nextHeading = document.createElement('h4'), nextList = document.createElement('ol'); nextHeading.textContent = 'Your next steps';
      for (const next of result.nextSteps) { const li = document.createElement('li'); li.textContent = next; nextList.append(li); }
      container.append(nextHeading, nextList);
      const help = document.createElement('a'); help.textContent = 'Find an attorney or local legal-help resource';
      help.href = READING_URLS.legal_help; help.target = '_blank'; help.rel = 'noopener noreferrer'; container.append(help);
    }
    const preparation = result.findings.filter(finding => PREPARATION_IDS.includes(finding.id));
    if (preparation.length) {
      const heading = document.createElement('h4'); heading.textContent = 'Get ready for a consultation'; container.append(heading);
      for (const finding of preparation) {
        const details = document.createElement('details'), summary = document.createElement('summary'), body = document.createElement('p');
        details.className = 'lab-preparation'; details.dataset.guidanceId = finding.id;
        summary.textContent = finding.title; body.textContent = finding.body; details.append(summary, body); container.append(details);
      }
    }
    if (result.readingTopics.length) {
      const readingHeading = document.createElement('h4'), readingList = document.createElement('ul'); readingHeading.textContent = 'Learn more and find help';
      for (const topic of result.readingTopics) { const li = document.createElement('li'), a = document.createElement('a'); a.textContent = topic.title; a.href = topic.url; a.target = '_blank'; a.rel = 'noopener noreferrer'; const why = document.createElement('p'); why.textContent = topic.reason; li.append(a, why); readingList.append(li); }
      container.append(readingHeading, readingList);
    }
    const details = document.createElement('details'), summary = document.createElement('summary'); summary.textContent = 'Limits and completed steps';
    const p = document.createElement('p'); p.className = 'lab-small'; p.textContent = result.limitations.map(v => v.body).join(' ');
    const code = document.createElement('p'); code.className = 'lab-small'; code.textContent = result.workflow.steps.join(' → '); details.append(summary, p, code); container.append(details);
  }
  function waitForNext(id: string, signal: AbortSignal, token: number) {
    return new Promise<void>((resolve, reject) => {
      if (signal.aborted || token !== generation) return reject(new Error('stopped'));
      const aborted = () => { releaseStep = null; reject(new Error('stopped')); };
      signal.addEventListener('abort', aborted, { once: true });
      releaseStep = () => { signal.removeEventListener('abort', aborted); releaseStep = null; waitingNode = null; button('next').disabled = true; resolve(); };
      waitingNode = id; selected = id; button('next').disabled = false;
      setStatus(`Waiting before: ${titles[id][0]}. Press Next step.`); renderNodes(); renderInspection();
    });
  }
  async function run(manual: boolean) {
    stop(); steps = []; baseline = null; draft = null;
    const token = generation, currentController = new AbortController(); controller = currentController;
    button('stop').disabled = false;
    el('baseline').textContent = 'Running the current Beta default graph locally…'; el('draft').textContent = manual ? 'Step through the draft to produce its result.' : 'Running your draft graph…'; el('difference').textContent = '';
    try {
      config = getConfig(); renderNodes(); renderInspection(); setStatus('Running the actual LangGraph library…');
      const raw = readInput(), context = contextForDate(new Date().toISOString().slice(0, 10));
      const current = await runBaseline(raw, context, currentController.signal);
      if (token !== generation) return;
      baseline = current.result; resultView(el('baseline'), baseline);
      const experiment = await runDraft(raw, context, config, {
        before: async id => { if (manual) await waitForNext(id, currentController.signal, token); },
        after: async step => { if (token !== generation) return; steps.push(step); selected = step.nodeId; renderNodes(); renderInspection(); },
      }, currentController.signal);
      if (token !== generation) return;
      draft = experiment.result; resultView(el('draft'), draft);
      if (experiment.draftNotes.length) { const p = document.createElement('p'); p.className = 'lab-small'; p.textContent = experiment.draftNotes.join(' '); el('draft').append(p); }
      const snapshotSame = JSON.stringify(baseline.snapshot) === JSON.stringify(draft.snapshot);
      const roadmapSame = JSON.stringify([baseline.findings, baseline.nextSteps, baseline.readingTopics]) === JSON.stringify([draft.findings, draft.nextSteps, draft.readingTopics]);
      el('difference').textContent = snapshotSame && roadmapSame ? `Same snapshot and options roadmap as the current Beta. Your draft executed ${experiment.order.length} nodes${config.limitPlacement !== 'after_calculation' ? ' with different connections' : ''}${config.checkpointPlacement !== 'off' ? ' and an added review checkpoint' : ''}.` : 'The draft produces a different snapshot or explanation. Compare the roadmap, amounts and calculation scope above.';
      setStatus(`Complete. Real LangGraph executed ${experiment.order.length} draft nodes and validated the result.`);
    } catch {
      if (token === generation) { steps = []; draft = null; el('draft').textContent = 'The draft could not complete. Check the settings and run again.'; setStatus('Run failed. No draft result is being shown.'); renderNodes(); renderInspection(); }
    } finally {
      if (token === generation) { controller = null; waitingNode = null; releaseStep = null; button('stop').disabled = true; button('next').disabled = true; }
    }
  }
  for (const field of fields) for (const control of field.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select')) control.addEventListener('input', () => { syncMoney(field); invalidate(); });
  for (const choice of debtChoices) choice.addEventListener('change', invalidate);
  for (const id of ['title', 'review-note', 'limit-placement', 'checkpoint-placement', 'calculation-scope', ...answerControlIds]) {
    el(id).addEventListener('input', () => { if (id === 'unsecured-debt') syncUnsecuredDetail(); invalidate(); });
  }
  el('example').addEventListener('change', () => { loadExample(el<HTMLSelectElement>('example').value); invalidate(); });
  button('reset-answers').addEventListener('click', () => { loadExample(el<HTMLSelectElement>('example').value); invalidate(); setStatus('Test answers reset to the selected invented example. Run again to compare.'); });
  button('run').addEventListener('click', () => { void run(false); });
  button('step').addEventListener('click', () => { void run(true); });
  button('next').addEventListener('click', () => { releaseStep?.(); });
  button('stop').addEventListener('click', () => { stop(); steps = []; baseline = null; draft = null; el('baseline').textContent = 'Run stopped. Run again to compare.'; el('draft').textContent = 'Run stopped. No completed draft result.'; el('difference').textContent = ''; setStatus('Stopped. Start a fresh run when ready.'); renderNodes(); renderInspection(); });
  button('reset').addEventListener('click', () => { fillConfig(defaultConfig); invalidate(); setFileStatus('Workflow reset to the current Beta settings.'); });
  button('share').addEventListener('click', () => {
    try {
      const bytes = new TextEncoder().encode(exportConfig(getConfig()));
      const encoded = btoa(Array.from(bytes, byte => String.fromCharCode(byte)).join('')).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
      const url = new URL(location.href); url.searchParams.set('workflowDraft', encoded); url.hash = 'bankruptcy-checkup-beta-workflow-interactive';
      el<HTMLInputElement>('share-url').value = url.href; el<HTMLAnchorElement>('open-share').href = url.href; el('share-result').hidden = false; setFileStatus('Draft link ready. Select and copy the link to share it.');
    } catch { setFileStatus('Give the draft a valid name before sharing.'); }
  });
  button('export').addEventListener('click', () => {
    try { const file = new Blob([exportConfig(getConfig())], { type: 'application/json' }); const url = URL.createObjectURL(file), a = document.createElement('a'); a.href = url; a.download = 'gobk-checkup-workflow-draft.json'; a.click(); URL.revokeObjectURL(url); setFileStatus('Downloaded workflow settings only. Test answers are excluded.'); }
    catch { setFileStatus('Give the draft a valid name before downloading.'); }
  });
  el<HTMLInputElement>('import').addEventListener('change', async () => {
    const file = el<HTMLInputElement>('import').files?.[0]; if (!file) return;
    try { if (file.size > 8192) throw new Error('too large'); const loaded = importConfig(await file.text()); fillConfig(loaded); invalidate(); setFileStatus('Saved draft opened. Run an invented example to test it.'); }
    catch { setFileStatus('This file is not a supported workflow draft. Current settings were kept.'); }
    finally { el<HTMLInputElement>('import').value = ''; }
  });
  button('apply-json').addEventListener('click', () => {
    try { const loaded = importConfig(el<HTMLTextAreaElement>('json').value); fillConfig(loaded); invalidate(); setFileStatus('JSON draft opened. Run an invented example to test it.'); }
    catch { setFileStatus('This JSON is not a supported workflow draft. Current settings were kept.'); }
  });
  fillConfig(defaultConfig); loadExample('shortfall');
  try {
    const encoded = new URL(location.href).searchParams.get('workflowDraft');
    if (encoded) {
      if (encoded.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new Error('invalid link');
      const decoded = atob(encoded.replaceAll('-', '+').replaceAll('_', '/'));
      const bytes = Uint8Array.from(decoded, char => char.charCodeAt(0));
      fillConfig(importConfig(new TextDecoder('utf-8', { fatal: true }).decode(bytes)));
      setFileStatus('Shared draft opened. Amounts use the invented shortfall example.');
    }
  } catch { setFileStatus('Invalid draft link. The current Beta settings were loaded.'); }
  renderNodes(); renderInspection(); void run(false);
}
