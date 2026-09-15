"""Verify the four Checkup tabs while preserving every earlier site page body."""
import json
import re
import subprocess
from pathlib import Path

ORIGINAL_COMMIT = '7deb7bc3bf0d87496fc123297663eecfc15eafaa'
V1_BASELINE_COMMIT = '27a6f118774b305d13364f2073d6ae5fc3cc54c1'


def git_file(commit, path):
    return subprocess.check_output(['git', 'show', f'{commit}:{path}']).decode('utf-8').replace('\r\n', '\n')


def sections(html):
    return dict(re.findall(
        r'<div class="pg" id="pg-([^"]+)" hidden>([\s\S]*?)(?=<div class="pg" id="pg-|\n<script>var titles=)',
        html,
    ))


def without_header(body):
    return re.sub(r'<header class="site-header"[\s\S]*?</header>', '', body).strip()


original_html = git_file(ORIGINAL_COMMIT, 'docs/index.html')
baseline_html = git_file(V1_BASELINE_COMMIT, 'docs/index.html')
current = Path('docs/index.html').read_text(encoding='utf-8').replace('\r\n', '\n')
original = sections(original_html)
baseline = sections(baseline_html)
new = sections(current)

assert len(original) == 94, len(original)
assert len(baseline) == 97, len(baseline)
assert len(new) == 98, len(new)
assert set(new) - set(baseline) == {'bankruptcy-checkup-beta-v2'}
assert set(baseline) - set(original) == {
    'bankruptcy-checkup-beta',
    'bankruptcy-checkup-beta-workflow',
    'bankruptcy-checkup-beta-workflow-interactive',
}

for page_id, body in baseline.items():
    assert without_header(body) == without_header(new[page_id]), f'Unexpected existing page-body change: {page_id}'
for page_id, body in original.items():
    assert without_header(body) == without_header(new[page_id]), f'Unexpected original page-body change: {page_id}'

assert '<meta name="robots" content="noindex, nofollow">' in current
assert 'Signups are not connected in this preview.' in current
assert not any('\\' in page_id for page_id in new)

headers = ''.join(re.findall(r'<header class="site-header"[\s\S]*?</header>', current))
assert len(re.findall(r'<header class="site-header"', headers)) == 98
for label in (
    'Bankruptcy Checkup (Beta)',
    'Bankruptcy Checkup (Beta V2)',
    'Bankruptcy Checkup Beta Workflow',
    'Bankruptcy Checkup Beta Workflow (Interactive)',
):
    assert headers.count(f'>{label}</a>') == 98, label

v1 = new['bankruptcy-checkup-beta']
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site' in v1
assert 'which chapter should you ask about first' in v1
assert 'not an eligibility finding or an instruction to file' in v1

v2 = new['bankruptcy-checkup-beta-v2']
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site/v2' in v2
assert 'data-gobk-checkup-beta-v2' in v2
assert 'Bankruptcy Checkup (Beta V2) synthetic-data questionnaire' in v2
assert 'up to three relevant videos when the older guide has a match' in v2
assert 'Otherwise, start with its general introduction.' in v2
assert 'The videos do not change the graph result.' in v2
assert 'legal content under review' in v2
assert 'dated or incomplete information' in v2
assert 'currently require a Google account with access' in v2
assert 'Google receives a request only when you play or open a video' in v2
assert 'does not decide eligibility or tell you to file' in v2
assert 'drive.google.com/file/' not in v2
assert 'href="#bankruptcy-checkup-beta"' in v2
assert 'href="#bankruptcy-checkup-beta-workflow"' in v2
assert 'href="#bankruptcy-checkup-beta-workflow-interactive"' in v2

frame_source = Path('public/checkup-beta-frame.js').read_text(encoding='utf-8')
frame_v2_source = Path('public/checkup-beta-v2-frame.js').read_text(encoding='utf-8')
assert frame_source in current
assert frame_v2_source in current
assert "getElementById('pg-bankruptcy-checkup-beta-v2')" in frame_v2_source
assert "iframe[data-gobk-checkup-beta-v2]" in frame_v2_source

lab = new['bankruptcy-checkup-beta-workflow-interactive']
for element_id in (
    'checkup-workflow-lab',
    'lab-checkpoint-placement',
    'lab-share',
    'lab-next',
    'lab-debt-situation',
    'lab-main-goal',
    'lab-income-regularity',
    'lab-secured-arrears',
    'lab-prior-bankruptcy',
):
    assert f'id="{element_id}"' in lab
assert len(re.findall(r'data-debt-kind', lab)) == 9
assert Path('public/checkup-workflow-lab.js').read_text(encoding='utf-8').replace('</script', '<\\/script') in current

workflow = new['bankruptcy-checkup-beta-workflow']
assert len(re.findall(r'data-workflow-step="[^"]+"', workflow)) == 8
assert len(re.findall(r'href="https://smith.langchain.com/public/[^"]+"', workflow)) == 7
assert 'href="#bankruptcy-checkup-beta"' in workflow

print(json.dumps({
    'passed': True,
    'originalPagesPreserved': 94,
    'existingBetaPageBodiesPreserved': 3,
    'newTab': 'bankruptcy-checkup-beta-v2',
    'sharedHeaderNavigationUpdated': 98,
    'interactiveBundleIncluded': True,
    'v2FrameBridgeIncluded': True,
    'totalPages': 98,
    'workflowSteps': 8,
    'publicReviewLinks': 7,
    'aboutArticleFooterBodiesUnchanged': True,
    'noindexPreserved': True,
    'legacyFormsDisconnected': True,
}))
