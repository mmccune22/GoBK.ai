"""Headline candidates in the chosen Band layout."""
import base64, sys
NM='node_modules/'
fonts="@font-face{font-family:'Public Sans';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900;font-display:swap}"%base64.b64encode(open(NM+'@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2','rb').read()).decode()
DOORS=[("I need help now","A garnishment, lawsuit, foreclosure, repossession, or bank levy is already happening."),("I need a way out of debt","Things are not sustainable and you want to understand your options, including ones that are not bankruptcy."),("I'm trying to understand bankruptcy","You are considering it and want to know what it actually means for your house, car, credit, and daily life."),("I'm just exploring","You want to learn without committing to anything.")]
H=[
 ('a',"Wondering if bankruptcy is the right decision?","<span class='beat'>Sometimes it is. Sometimes it isn't.</span>We help you find answers and point you in the right direction (even if it's not bankruptcy)."),
]
LEDE="Plain-English answers about bankruptcy, serious debt, and your options, including the ones that aren't bankruptcy. Written by a bankruptcy attorney. Nothing to sign up for."
tiles=''.join(f'<a class="tile" href="#"><b>{t}</b><span>{h}</span></a>' for t,h in DOORS)
def page(q,lede):
    return f'''<div class="v"><header class="hd"><a class="wm" href="#">GoBK</a><span class="desc">The bankruptcy library</span><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero"><h1><span class="q">{q}</span><span class="w">We got you.</span></h1><p class="lede">{lede}</p><p class="quiet">No pressure. No judgment. Browse freely.</p><div class="tiles">{tiles}</div></section>
<section class="strip"><form class="search"><input placeholder="Or ask a question: can I keep my car? does bankruptcy stop foreclosure?"><button>Search</button></form></section></div>'''
CSS=f'''{fonts}*{{box-sizing:border-box}}body{{margin:0;background:#3a3a3a;font-family:'Public Sans',system-ui,sans-serif;color:#434343}}input,button{{font:inherit}}
.tabs{{position:sticky;top:0;z-index:10;display:flex;gap:6px;align-items:center;padding:10px 16px;background:#242424;color:#ddd;font-size:13px;flex-wrap:wrap}}.tabs b{{margin-right:8px;color:#fff}}.tabs a{{color:#bbb;text-decoration:none;padding:6px 10px;border-radius:4px}}.tabs a.on{{background:#fff;color:#111}}
.dir{{display:none}}.dir.on{{display:block}}.frame{{max-width:1180px;margin:24px auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.v{{--sage:#7A9C80;--deep:#4F6E55;--grey:#E7EAE5;--off:#FBFAF7;--ink:#434343;--soft:#6B6F6B;--line:#D9DED9;background:#fff;color:var(--ink);padding-bottom:40px}}
.hd{{display:flex;align-items:center;gap:16px;padding:16px 48px;border-bottom:1px solid var(--line)}}.wm{{background:var(--sage);color:#fff;font-weight:700;font-size:22px;padding:8px 14px;border-radius:8px;text-decoration:none;letter-spacing:-.01em}}.desc{{color:var(--soft);font-size:15px}}nav{{margin-left:auto}}nav a{{color:var(--ink);text-decoration:none;margin-left:26px;font-size:16px;font-weight:500}}
.hero{{background:var(--sage);color:#fff;padding:60px 48px 40px}}
h1{{margin:0 0 18px;letter-spacing:-.02em;line-height:1.08;font-weight:600;max-width:22ch}}h1 .q{{display:block;font-size:clamp(26px,3.2vw,38px);font-weight:500;color:#F1F5F1;margin-bottom:6px}}h1 .w{{display:block;font-size:clamp(48px,7vw,84px);font-weight:700;color:#fff;letter-spacing:-.03em}}
.lede{{font-size:20px;line-height:1.5;max-width:none;margin:0 0 12px;color:#fff}}
.tiles{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}.tile{{display:block;background:var(--off);border-radius:12px;padding:24px 24px 22px;text-decoration:none;color:var(--ink)}}.tile:hover{{outline:3px solid #fff}}.tile b{{display:block;font-size:22px;font-weight:600;margin-bottom:6px}}.tile span{{color:var(--soft);font-size:16px;line-height:1.45}}
.quiet{{color:#fff;font-size:20px;line-height:1.5;font-weight:400;margin:0 0 28px}}.beat{{display:block;margin-bottom:12px}}
.strip{{padding:24px 48px 0}}.search{{display:flex;gap:8px;max-width:640px}}.search input{{flex:1;min-width:0;border:2px solid var(--line);border-radius:10px;padding:14px 16px;font-size:17px}}.search button{{background:var(--deep);color:#fff;border:0;border-radius:10px;padding:0 22px;font-weight:600}}
@media(max-width:760px){{.hd,.hero,.strip{{padding-left:22px;padding-right:22px}}.desc{{display:none}}nav a{{margin-left:14px;font-size:14px}}.tiles{{grid-template-columns:1fr}}}}'''
tabs='<div class="tabs"><b>Headline</b>'+''.join(f'<a href="#{i}" data-d="{i}">{lbl}</a>' for i,lbl in [('a','Hero copy')])+'</div>'
body=''.join(f'<section class="dir" id="dir-{i}"><div class="frame">{page(q,l)}</div></section>' for i,q,l in H)
html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoBK headlines</title><style>{CSS}</style></head><body>{tabs}{body}<script>function s(){{var id=(location.hash||'#a').slice(1);if(!document.getElementById('dir-'+id))id='a';document.querySelectorAll('.dir').forEach(function(d){{d.classList.toggle('on',d.id==='dir-'+id)}});document.querySelectorAll('.tabs a').forEach(function(a){{a.classList.toggle('on',a.dataset.d===id)}});window.scrollTo(0,0)}}addEventListener('hashchange',s);s();document.addEventListener('submit',function(e){{e.preventDefault()}})</script></body></html>'''
open(sys.argv[1],'w').write(html)
