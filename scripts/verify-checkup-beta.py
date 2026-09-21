"""Verify the three reworked Checkup pages and preserve every other page."""
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


def git_file(commit, path):
    return subprocess.check_output(['git', 'show', f'{commit}:{path}']).decode('utf-8').replace('\r\n', '\n')


def sections(html):
    return dict(re.findall(
        r'<div class="pg" id="pg-([^"]+)" hidden>([\s\S]*?)(?=<div class="pg" id="pg-|\n<script>var titles=)',
        html,
    ))


baseline_html = git_file(BASELINE_COMMIT, 'docs/index.html')
current = Path('docs/index.html').read_text(encoding='utf-8').replace('\r\n', '\n')
baseline = sections(baseline_html)
new = sections(current)

assert len(baseline) == 98, len(baseline)
assert len(new) == len(baseline), (len(new), len(baseline))
assert set(new) == set(baseline)
for page_id, body in baseline.items():
    if page_id not in TARGETS:
        assert body == new[page_id], f'Unexpected page change: {page_id}'

assert '<meta name="robots" content="noindex, nofollow">' in current
assert 'Signups are not connected in this preview.' in current
assert not any('\\' in page_id for page_id in new)

v2 = new['bankruptcy-checkup-beta-v2']
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site/v2' in v2
assert 'data-gobk-checkup-beta-v2' in v2
assert 'Bankruptcy Checkup (Beta V2) structured questionnaire' in v2
assert 'Start with urgent issues' in v2
assert 'No name, email, phone number' in v2
assert 'does not decide whether to file' in v2
assert 'not a means test' in v2
assert 'does not calculate a waiting period' in v2
assert 'drive.google.com/file/' not in v2
assert 'href="#bankruptcy-checkup-beta"' in v2
assert 'href="#bankruptcy-checkup-beta-workflow"' in v2
assert 'href="#bankruptcy-checkup-beta-workflow-interactive"' in v2

frame_source = Path('public/checkup-beta-v2-frame.js').read_text(encoding='utf-8')
assert frame_source in current
assert "getElementById('pg-bankruptcy-checkup-beta-v2')" in frame_source
assert 'iframe[data-gobk-checkup-beta-v2]' in frame_source
assert "const origin = 'https://gobk-checkup-beta.jimmydanol.chatgpt.site'" in frame_source

workflow = new['bankruptcy-checkup-beta-workflow']
assert 'From ten questions to a starting point' in workflow
assert len(re.findall(r'class="question-number"', workflow)) == 10
assert len(re.findall(r'data-workflow-step="[^"]+"', workflow)) == 8
for boundary in (
    'not a means test',
    'does not establish an exemption',
    'does not calculate a waiting period',
    'There is no language model',
):
    assert boundary in workflow, boundary

lab = new['bankruptcy-checkup-beta-workflow-interactive']
for element_id in (
    'checkup-workflow-lab', 'lab-checkpoint-placement', 'lab-share', 'lab-next',
    'lab-main-goal', 'lab-marital-status', 'lab-spouse-filing', 'lab-household-size',
    'lab-gross-monthly-income-band', 'lab-income-regularity', 'lab-home-ownership',
    'lab-mortgage-status', 'lab-home-equity', 'lab-vehicle-ownership',
    'lab-vehicle-loan-status', 'lab-vehicle-equity', 'lab-significant-assets',
    'lab-debt-situation', 'lab-prior-bankruptcy', 'lab-prior-bankruptcy-recency',
):
    assert f'id="{element_id}"' in lab, element_id
assert len(re.findall(r'data-debt-kind', lab)) == 9
assert Path('public/checkup-workflow-lab.js').read_text(encoding='utf-8').replace('</script', '<\\/script') in current
assert 'No state exemption rule is enabled.' in lab
assert 'never calculates a filing or discharge waiting period' in lab

print(json.dumps({
    'passed': True,
    'totalPages': len(new),
    'unchangedPagesPreserved': len(new) - len(TARGETS),
    'reworkedPages': sorted(TARGETS),
    'questionStepsDocumented': 10,
    'workflowNodesDocumented': 8,
    'interactiveStructuredControls': 14,
    'actualRuntimeOriginPreserved': True,
    'noindexPreserved': True,
}))
