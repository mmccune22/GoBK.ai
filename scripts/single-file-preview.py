"""Bundle the built site (dist/) into one self-contained HTML file with hash navigation.
Usage: python3 scripts/single-file-preview.py out.html [--switcher]
--switcher adds a small bar to compare homepage variants under /design/."""
import re, os, glob, base64, json, sys
dist='dist'; out=sys.argv[1]; switcher='--switcher' in sys.argv
css=''.join(open(f).read() for f in sorted(glob.glob(f'{dist}/_astro/*.css')))
def font_repl(m):
    b=base64.b64encode(open(os.path.join(dist,'_astro',os.path.basename(m.group(1))),'rb').read()).decode()
    return f'url(data:font/woff2;base64,{b})'
faces=[]
for m in re.finditer(r'@font-face\{[^}]*\}',css):
    blk=m.group(0)
    if re.search(r'-latin-(opsz|wght)',blk):
        blk=re.sub(r'url\(([^)]+\.woff2)\)',font_repl,blk); blk=re.sub(r'url\([^)]+\.woff\)','',blk); faces.append(blk)
css=''.join(faces)+re.sub(r'@font-face\{[^}]*\}','',css)
pages={}
for f in sorted(glob.glob(f'{dist}/**/index.html',recursive=True)):
    rel=os.path.relpath(os.path.dirname(f),dist).replace(os.sep,'/'); url='/' if rel=='.' else '/'+rel
    pages[url]=('home' if rel=='.' else rel.replace('/','--'), f)
def rl(m):
    base=m.group(1).split('?')[0].rstrip('/') or '/'
    return f'href="#{pages[base][0]}"' if base in pages else m.group(0)
sections=[]; titles={}
for url,(pid,f) in pages.items():
    h=open(f).read(); titles[pid]=re.search(r'<title>(.*?)</title>',h).group(1)
    body=re.search(r'<body[^>]*>(.*)</body>',h,re.S).group(1)
    body=re.sub(r'<script\b.*?</script>','',body,flags=re.S)
    body=re.sub(r'href="(/[^"#?]*)(#[^"]*)?"',rl,body).replace('href="#main"','href="#"')
    if pid=='search': body=body.replace('<div class="idle">','<div class="idle"><p><strong>Search runs on the built site, not in this preview.</strong> The links below work.</p>')
    sections.append(f'<div class="pg" id="pg-{pid}" hidden>{body}</div>')
bar=''
if switcher:
    variants=[('home','A: evergreen block'),('design--home-b','B: parchment'),('design--home-c','C: doors in hero')]
    bar='<div class="vbar">Homepage direction: '+' '.join(f'<a href="#{pid}" data-v="{pid}">{lbl}</a>' for pid,lbl in variants)+'</div>'
    bar_css='.vbar{position:sticky;top:0;z-index:50;background:#242826;color:#f7f5ef;font:500 13px/1 Inter Variable,system-ui,sans-serif;padding:10px 16px;display:flex;gap:14px;align-items:center}.vbar a{color:#c9d6cd;text-decoration:none;padding:4px 8px;border-radius:3px}.vbar a.on{background:#173c35;color:#fff}'
else: bar_css=''
fav=base64.b64encode(open('public/favicon.svg','rb').read().replace(b'\r\n',b'\n')).decode()
doc=f'''<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>GoBK preview</title><link rel="icon" href="data:image/svg+xml;base64,{fav}"><style>{css}</style><style>.pg[hidden]{{display:none}}{bar_css}</style></head><body>
{bar}{''.join(sections)}
<script>var titles={json.dumps(titles)};var cur='home';
function show(){{var id=(location.hash||'#home').slice(1);
if(!document.getElementById('pg-'+id)){{
var pg=document.getElementById('pg-'+cur);
var t=pg&&pg.querySelector('[id="'+id.replace(/"/g,'')+'"]');
if(t){{t.scrollIntoView({{behavior:'smooth',block:'start'}});return;}}
id='home';}}
cur=id;
document.querySelectorAll('.pg').forEach(function(p){{p.hidden=p.id!=='pg-'+id}});document.querySelectorAll('.vbar a').forEach(function(a){{a.classList.toggle('on',a.dataset.v===id)}});document.title=titles[id]||'GoBK';window.scrollTo(0,0);}}
addEventListener('hashchange',show);show();
document.addEventListener('submit',function(e){{e.preventDefault();var n=e.target.parentElement&&e.target.parentElement.querySelector('.note');if(n)n.textContent='Signups are not connected in this preview.';}});
</script></body></html>'''
open(out,'w').write(doc); print(out, len(doc)//1024,'KB', len(pages),'pages')
