"""Check the new preview without changing any existing article/About/footer body."""
import json, re, subprocess
from pathlib import Path
original=subprocess.check_output(['git','show','7deb7bc3bf0d87496fc123297663eecfc15eafaa:docs/index.html']).decode('utf-8').replace('\r\n','\n')
current=Path('docs/index.html').read_text(encoding='utf-8').replace('\r\n','\n')
def sections(html):
    return dict(re.findall(r'<div class="pg" id="pg-([^"]+)" hidden>([\s\S]*?)(?=<div class="pg" id="pg-|\n<script>var titles=)',html))
old,new=sections(original),sections(current)
assert len(old)==94 and len(new)==97,(len(old),len(new))
assert set(new)-set(old)=={'bankruptcy-checkup-beta','bankruptcy-checkup-beta-workflow','bankruptcy-checkup-beta-workflow-interactive'}
for pid,body in old.items():
    trim=lambda value: re.sub(r'<header class="site-header"[\s\S]*?</header>','',value).strip()
    assert trim(body)==trim(new[pid]),f'Unexpected content change in {pid}'
assert '<meta name="robots" content="noindex, nofollow">' in current
assert 'Signups are not connected in this preview.' in current
headers=''.join(re.findall(r'<header class="site-header"[\s\S]*?</header>',current))
assert len(re.findall(r'<header class="site-header"',headers))==97
assert headers.count('>Bankruptcy Checkup (Beta)</a>')==97
assert headers.count('>Bankruptcy Checkup Beta Workflow</a>')==97
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site' in new['bankruptcy-checkup-beta']
assert not any('\\' in pid for pid in new)
beta_baseline=sections(subprocess.check_output(['git','show','f86c0cbdc05c7376b53407f2e97dad0441f00d2c:docs/index.html']).decode('utf-8').replace('\r\n','\n'))
assert trim(beta_baseline['bankruptcy-checkup-beta'])==trim(new['bankruptcy-checkup-beta']),'Existing Beta body changed'
previous=sections(subprocess.check_output(['git','show','dcc3de6c274be372ebbba62a3e22e2f7fb4d3224:docs/index.html']).decode('utf-8').replace('\r\n','\n'))
assert len(previous)==96
for pid,body in previous.items():
    assert trim(body)==trim(new[pid]),f'Previous page body changed: {pid}'
assert headers.count('>Bankruptcy Checkup Beta Workflow (Interactive)</a>')==97
lab=new['bankruptcy-checkup-beta-workflow-interactive']
assert 'id="checkup-workflow-lab"' in lab
assert 'id="lab-checkpoint-placement"' in lab
assert 'id="lab-share"' in lab
assert 'id="lab-next"' in lab
assert Path('public/checkup-workflow-lab.js').read_text(encoding='utf-8').replace('</script', '<\\/script') in current
workflow=new['bankruptcy-checkup-beta-workflow']
assert len(re.findall(r'data-workflow-step="[^"]+"',workflow))==8
assert len(re.findall(r'href="https://smith.langchain.com/public/[^"]+"',workflow))==7
assert 'href="#bankruptcy-checkup-beta"' in workflow
print(json.dumps({'passed':True,'originalPagesPreserved':94,'existingBetaBodyPreserved':True,'allPreviousPagesPreserved':96,'interactiveBundleIncluded':True,'totalPages':97,'workflowSteps':8,'publicReviewLinks':7,'aboutArticleFooterBodiesUnchanged':True,'noindexPreserved':True,'legacyFormsDisconnected':True}))
