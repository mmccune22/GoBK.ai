"""Check the new preview without changing any existing article/About/footer body."""
import json, re, subprocess
from pathlib import Path
original=subprocess.check_output(['git','show','7deb7bc3bf0d87496fc123297663eecfc15eafaa:docs/index.html']).decode('utf-8').replace('\r\n','\n')
current=Path('docs/index.html').read_text(encoding='utf-8').replace('\r\n','\n')
def sections(html):
    return dict(re.findall(r'<div class="pg" id="pg-([^"]+)" hidden>([\s\S]*?)(?=<div class="pg" id="pg-|\n<script>var titles=)',html))
old,new=sections(original),sections(current)
assert len(old)==94 and len(new)==96,(len(old),len(new))
assert set(new)-set(old)=={'bankruptcy-checkup-beta','bankruptcy-checkup-beta-workflow'}
for pid,body in old.items():
    trim=lambda value: re.sub(r'<header class="site-header"[\s\S]*?</header>','',value).strip()
    assert trim(body)==trim(new[pid]),f'Unexpected content change in {pid}'
assert '<meta name="robots" content="noindex, nofollow">' in current
assert 'Signups are not connected in this preview.' in current
assert current.count('>Bankruptcy Checkup (Beta)</a>')==96
assert current.count('>Bankruptcy Checkup Beta Workflow</a>')==96
assert 'https://gobk-checkup-beta.jimmydanol.chatgpt.site' in new['bankruptcy-checkup-beta']
assert not any('\\' in pid for pid in new)
beta_baseline=sections(subprocess.check_output(['git','show','f86c0cbdc05c7376b53407f2e97dad0441f00d2c:docs/index.html']).decode('utf-8').replace('\r\n','\n'))
assert trim(beta_baseline['bankruptcy-checkup-beta'])==trim(new['bankruptcy-checkup-beta']),'Existing Beta body changed'
workflow=new['bankruptcy-checkup-beta-workflow']
assert len(re.findall(r'data-workflow-step="[^"]+"',workflow))==8
assert len(re.findall(r'href="https://smith.langchain.com/public/[^"]+"',workflow))==7
assert 'href="#bankruptcy-checkup-beta"' in workflow
print(json.dumps({'passed':True,'originalPagesPreserved':94,'existingBetaBodyPreserved':True,'totalPages':96,'workflowSteps':8,'publicReviewLinks':7,'aboutArticleFooterBodiesUnchanged':True,'noindexPreserved':True,'legacyFormsDisconnected':True}))
