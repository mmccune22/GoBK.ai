"""Verify the three Checkup pages in a fresh build and the single-file publication."""
import json
import re
import subprocess
from pathlib import Path


TARGETS = {
    'bankruptcy-checkup-beta-v2',
    'bankruptcy-checkup-beta-workflow',
    'bankruptcy-checkup-beta-workflow-interactive',
}
BASELINE_COMMIT = '7f49908c64aa0109b0b0f6fdfeb0182fd0121310'
QUESTION_TEXTS = (
    'Are you married?',
    'Have you ever filed for bankruptcy before?',
    'How many people live in your household?',
    'What is the total gross household income per month?',
    'Do you own a home?',
    'Do you have a vehicle?',
    'Do you have any other significant assets?',
    'Do you owe any taxes?',
    'Do you owe any child support or alimony?',
    'Do you owe any student loans?',
    'Do you owe credit cards, personal loans, lines of credit, medical bills or other unsecured debt?',
)


def git_file(commit, path):
    return subprocess.check_output(['git', 'show', f'{commit}:{path}']).decode('utf-8').replace('\r\n', '\n')


def sections(html):
    return dict(re.findall(
        r'<div class="pg" id="pg-([^"]+)" hidden>([\s\S]*?)(?=<div class="pg" id="pg-|\n<script>var titles=)',
        html,
    ))


def built_page(page_id):
    path = Path('dist') / page_id / 'index.html'
    assert path.is_file(), f'Missing built page: {path}. Run npm run build first.'
    return path.read_text(encoding='utf-8').replace('\r\n', '\n')


def assert_in_order(body, values):
    positions = [body.index(value) for value in values]
    assert positions == sorted(positions), positions


# Preserve every non-target page while allowing only the three Checkup targets to change.
baseline_html = git_file(BASELINE_COMMIT, 'docs/index.html')
current_docs = Path('docs/index.html').read_text(encoding='utf-8').replace('\r\n', '\n')
baseline = sections(baseline_html)
published = sections(current_docs)
assert len(baseline) == 98, len(baseline)
assert len(published) == len(baseline), (len(published), len(baseline))
assert set(published) == set(baseline)
for page_id, body in baseline.items():
    if page_id not in TARGETS:
        assert body == published[page_id], f'Unexpected published page change: {page_id}'
assert '<meta name="robots" content="noindex, nofollow">' in current_docs
assert 'Signups are not connected in this preview.' in current_docs
assert not any('\\' in page_id for page_id in published)

v2 = built_page('bankruptcy-checkup-beta-v2')
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site/v2' in v2
assert 'data-gobk-checkup-beta-v2' in v2
assert 'Bankruptcy Checkup (Beta V2) eleven-question structured questionnaire' in v2
assert 'No separate goal or income-regularity question is part of this PDF-derived questionnaire.' in v2
assert 'No name, email, phone number' in v2
assert 'does not decide whether to file' in v2
assert 'not a means test' in v2
assert 'does not calculate a waiting period' in v2
assert 'drive.google.com/file/' not in v2
for href in (
    '/bankruptcy-checkup-beta',
    '/bankruptcy-checkup-beta-workflow',
    '/bankruptcy-checkup-beta-workflow-interactive',
):
    assert f'href="{href}"' in v2

frame_source = Path('public/checkup-beta-v2-frame.js').read_text(encoding='utf-8')
assert "getElementById('pg-bankruptcy-checkup-beta-v2')" in frame_source
assert 'iframe[data-gobk-checkup-beta-v2]' in frame_source
assert "const origin = 'https://gobk-checkup-beta.jimmydanol.chatgpt.site'" in frame_source

workflow = built_page('bankruptcy-checkup-beta-workflow')
assert 'From the attached guide to the working beta' in workflow
assert 'The PDF-defined experience and this beta' in workflow
assert len(re.findall(r'class="question-number"', workflow)) == 11
assert workflow.count('PDF branch:') == 11
assert workflow.count('PDF video:') == 11
assert len(re.findall(r'data-workflow-step="[^"]+"', workflow)) == 8
assert_in_order(workflow, QUESTION_TEXTS)
assert 'The six conditional follow-ups belong to Questions 1, 2, 5 and 6.' in workflow
assert 'No separate goal or income-regularity question is part of the PDF-derived V2 questionnaire.' in workflow
assert 'Its only report heading is “ISSUE REPORT?”' in workflow
for boundary in (
    'does not multiply it by twelve, perform a means test',
    'does not establish an exemption',
    'does not calculate a waiting period',
    'There is no language model',
):
    assert boundary in workflow, boundary

lab = built_page('bankruptcy-checkup-beta-workflow-interactive')
structured_control_ids = (
    'lab-main-goal', 'lab-marital-status', 'lab-spouse-filing', 'lab-household-size',
    'lab-gross-monthly-income-band', 'lab-income-regularity', 'lab-home-ownership',
    'lab-mortgage-status', 'lab-home-equity', 'lab-vehicle-ownership',
    'lab-vehicle-loan-status', 'lab-vehicle-equity', 'lab-significant-assets',
    'lab-tax-debt', 'lab-support-debt', 'lab-student-debt', 'lab-unsecured-debt',
    'lab-debt-situation', 'lab-prior-bankruptcy', 'lab-prior-bankruptcy-recency',
    'lab-urgency', 'lab-separate',
)
for element_id in (
    'checkup-workflow-lab', 'lab-checkpoint-placement', 'lab-share', 'lab-next',
    *structured_control_ids,
):
    assert lab.count(f'id="{element_id}"') == 1, element_id
guide_markers = tuple(f'data-guide-question="{number}"' for number in range(1, 12))
assert_in_order(lab, guide_markers)
assert_in_order(lab, QUESTION_TEXTS)
assert len(re.findall(r'data-guide-question="(?:[1-9]|1[01])"', lab)) == 11
assert lab.index('data-graph-context') > lab.index('data-guide-question="11"')
for advanced_id in ('lab-urgency', 'lab-main-goal', 'lab-debt-situation'):
    assert lab.index(f'id="{advanced_id}"') > lab.index('data-graph-context')
assert lab.index('lab-income-regularity') > lab.index('data-graph-context')
assert len(re.findall(r'data-debt-kind', lab)) == 6
assert 'No state exemption rule is enabled.' in lab
assert 'never calculates a filing or discharge waiting period' in lab
assert 'justice.gov/ust/eo/bapcpa' not in v2 + workflow + lab
assert 'nolo.com/legal-encyclopedia/bankruptcy-exemptions-state' not in v2 + workflow + lab

for page_id in TARGETS:
    assert published[page_id], f'Missing published target: {page_id}'
assert 'No separate goal or income-regularity question is part of this PDF-derived questionnaire.' in published['bankruptcy-checkup-beta-v2']
assert_in_order(published['bankruptcy-checkup-beta-workflow'], QUESTION_TEXTS)
assert_in_order(published['bankruptcy-checkup-beta-workflow-interactive'], QUESTION_TEXTS)

built_lab_bundle = Path('dist/checkup-workflow-lab.js')
assert built_lab_bundle.is_file()
assert built_lab_bundle.read_bytes() == Path('public/checkup-workflow-lab.js').read_bytes()

print(json.dumps({
    'passed': True,
    'totalPublishedPagesPreserved': len(published),
    'unchangedPublishedPagesPreserved': len(published) - len(TARGETS),
    'builtPagesVerified': sorted(TARGETS),
    'questionStepsDocumented': len(QUESTION_TEXTS),
    'workflowNodesDocumented': 8,
    'interactiveStructuredControlsPreserved': len(structured_control_ids),
    'interactiveDebtCheckboxesPreserved': 6,
    'actualRuntimeOriginPreserved': True,
    'trackedDocsIndexVerified': True,
    'noindexPreserved': True,
}))
