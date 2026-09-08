"""Three variations of one layout (clinic clarity + field-guide contents + wayfinding framing) in the BK FastLane palette."""
import base64, sys
NM = 'node_modules/'
def b64(p): return base64.b64encode(open(NM + p, 'rb').read()).decode()
fonts = "@font-face{font-family:'Public Sans';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900;font-display:swap}" % b64('@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2')

DOORS = [
    ("I need help now", "A garnishment, lawsuit, foreclosure, repossession, or bank levy is already happening."),
    ("I need a way out of debt", "Things are not sustainable and you want to understand your options, including ones that are not bankruptcy."),
    ("I'm trying to understand bankruptcy", "You are considering it and want to know what it actually means for your house, car, credit, and daily life."),
    ("I'm just exploring", "You want to learn without committing to anything."),
]
TOPICS = ["Bankruptcy basics","Chapter 7","Chapter 13","Property and assets","Debts","Income and eligibility","Creditor actions","Life after bankruptcy","Alternatives to bankruptcy"]
QS = ["Will I lose my house if I file bankruptcy?","Can bankruptcy stop a wage garnishment?","Can I keep my car?","What is the difference between Chapter 7 and Chapter 13?","Should I stop paying my credit cards?"]
LEDE = "Plain-English answers about bankruptcy, serious debt, and your options, including the ones that aren't bankruptcy. Written by a bankruptcy attorney. Nothing to sign up for."
QUIET = "No pressure. No judgment. Explore privately."

def tiles(): return ''.join(f'<a class="tile" href="#"><b>{t}</b><span>{h}</span></a>' for t, h in DOORS)
def contents(): return ''.join(f'<li><a href="#">{t}</a></li>' for t in TOPICS)
def qlist(): return ''.join(f'<li><a href="#">{q}</a></li>' for q in QS)
def library():
    return f'''<section class="lib"><div class="cols">
  <aside class="toc"><p class="k">The Library</p><ol>{contents()}</ol></aside>
  <div class="main">
    <h2>Common questions</h2>
    <ul class="qs">{qlist()}</ul>
    <div class="ans"><p class="k">A sample answer</p><h3>Can bankruptcy stop a wage garnishment?</h3>
      <p class="short">Yes, in almost every case. Filing triggers an automatic stay that requires most creditors to stop garnishing immediately, usually within one or two pay periods.</p>
      <p class="by">Written by Matt McCune, bankruptcy attorney. Updated September 1, 2026.</p></div>
  </div></div></section>'''
def notes(t, body):
    return f'<div class="notes"><b>{t}</b><p>{body}</p><p class="pal"><i style="background:#7A9C80"></i>Sage #7A9C80 <i style="background:#E7EAE5"></i>Light grey #E7EAE5 <i style="background:#FBFAF7"></i>Off-white #FBFAF7 <i style="background:#434343"></i>Charcoal #434343 <i style="background:#4F6E55"></i>Deep sage #4F6E55 (derived, for small text)</p></div>'

V = []
# 1 QUIET -------------------------------------------------------------------
V.append(('quiet','Quiet', f'''<div class="v v-quiet">
<header class="hd"><a class="wm" href="#"><span>Go</span>BK</a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero"><p class="over">The consumer bankruptcy resource</p><h1>What do you need to understand today?</h1><p class="lede">{LEDE}</p>
<div class="tiles">{tiles()}</div><p class="quiet">{QUIET}</p>
<form class="search"><input placeholder="Or ask a question: can I keep my car? does bankruptcy stop foreclosure?"><button>Search</button></form></section>
{library()}</div>
{notes("Quiet", "Off-white page, charcoal type. Sage appears only where you can act: the wordmark, buttons, links, and the contents numbers. Light grey carries the tiles and the contents column. The calmest of the three; the color is a signal, not a mood.")}'''))
# 2 BAND --------------------------------------------------------------------
V.append(('band','Band', f'''<div class="v v-band">
<header class="hd"><a class="wm" href="#">GoBK</a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero"><p class="over">The consumer bankruptcy resource</p><h1>What do you need to understand today?</h1><p class="lede">{LEDE}</p>
<div class="tiles">{tiles()}</div><p class="quiet">{QUIET}</p></section>
<section class="strip"><form class="search"><input placeholder="Or ask a question: can I keep my car? does bankruptcy stop foreclosure?"><button>Search</button></form></section>
{library()}</div>
{notes("Band", "A sage hero band with off-white cards sitting on it, then a white page below. More presence at the top, and the tiles read as the obvious next step. Text on the sage is kept large so it stays readable; small text lives inside the cards.")}'''))
# 3 PANELS ------------------------------------------------------------------
V.append(('panels','Panels', f'''<div class="v v-panels">
<header class="hd"><a class="wm" href="#">GoBK<i></i></a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero"><div class="cols"><div><p class="over">The consumer bankruptcy resource</p><h1>What do you need to understand today?</h1><p class="lede">{LEDE}</p><p class="quiet">{QUIET}</p>
<form class="search"><input placeholder="Ask a question"><button>Search</button></form></div>
<div class="tiles">{tiles()}</div></div></section>
{library()}</div>
{notes("Panels", "Light grey page with white panels, sage used structurally: the left edge of each tile, the contents column, the short answer. Hero splits promise and entry points side by side so both are above the fold. Feels the most like a tool for finding things.")}'''))

CSS = f'''{fonts}
*{{box-sizing:border-box}} body{{margin:0;background:#3a3a3a;font-family:'Public Sans',system-ui,sans-serif;color:#434343}} input,button{{font:inherit}}
.tabs{{position:sticky;top:0;z-index:10;display:flex;gap:6px;align-items:center;padding:10px 16px;background:#242424;color:#ddd;font-size:13px}} .tabs b{{margin-right:8px;color:#fff}} .tabs a{{color:#bbb;text-decoration:none;padding:6px 10px;border-radius:4px}} .tabs a.on{{background:#fff;color:#111}}
.dir{{display:none}} .dir.on{{display:block}} .frame{{max-width:1180px;margin:24px auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.notes{{background:#f2f2f2;padding:20px 32px;font-size:14px;line-height:1.5}} .notes b{{display:block;margin-bottom:4px}} .notes p{{margin:0 0 8px;max-width:90ch}} .pal i{{display:inline-block;width:14px;height:14px;border-radius:3px;border:1px solid rgba(0,0,0,.15);vertical-align:-2px;margin:0 4px 0 10px}}

.v{{--sage:#7A9C80;--deep:#4F6E55;--grey:#E7EAE5;--off:#FBFAF7;--ink:#434343;--soft:#6B6F6B;--line:#D9DED9;background:var(--off);color:var(--ink);padding-bottom:56px}}
.hd{{display:flex;justify-content:space-between;align-items:center;padding:18px 48px;border-bottom:1px solid var(--line)}}
.wm{{font-weight:700;font-size:26px;letter-spacing:-.02em;color:var(--ink);text-decoration:none}}
nav a{{color:var(--ink);text-decoration:none;margin-left:26px;font-size:16px;font-weight:500}}
.hero{{padding:64px 48px 24px;max-width:1040px}}
.over{{color:var(--soft);font-size:16px;margin:0 0 12px}}
h1{{font-weight:600;font-size:clamp(34px,4.4vw,52px);line-height:1.12;letter-spacing:-.02em;margin:0 0 16px;max-width:20ch}}
.lede{{font-size:19px;line-height:1.5;max-width:56ch;margin:0 0 28px}}
.tiles{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
.tile{{display:block;border-radius:12px;padding:24px 24px 22px;text-decoration:none;color:var(--ink)}} .tile b{{display:block;font-size:22px;font-weight:600;margin-bottom:6px}} .tile span{{color:var(--soft);font-size:16px;line-height:1.45}}
.quiet{{color:var(--soft);font-size:16px;margin:20px 0 0}}
.search{{display:flex;gap:8px;max-width:640px;margin-top:22px}} .search input{{flex:1;min-width:0;border:2px solid var(--line);border-radius:10px;padding:14px 16px;font-size:17px;background:#fff}} .search button{{background:var(--deep);color:#fff;border:0;border-radius:10px;padding:0 22px;font-weight:600}}
.lib{{padding:48px 48px 0}} .cols{{display:grid;grid-template-columns:240px 1fr;gap:48px}}
.k{{font-size:14px;font-weight:600;color:var(--soft);margin:0 0 10px}}
.toc ol{{list-style:none;margin:0;padding:0;counter-reset:c}} .toc li{{counter-increment:c;border-bottom:1px solid var(--line)}} .toc a{{display:flex;gap:12px;padding:10px 0;color:var(--ink);text-decoration:none;font-size:16px}} .toc a::before{{content:counter(c,decimal-leading-zero);color:var(--deep);font-weight:600;min-width:24px}}
h2{{font-size:22px;font-weight:600;margin:0 0 10px}}
.qs{{list-style:none;margin:0 0 32px;padding:0;border-top:1px solid var(--line)}} .qs li{{border-bottom:1px solid var(--line)}} .qs a{{display:block;padding:12px 0;color:var(--ink);text-decoration:none;font-size:19px;font-weight:500}} .qs a:hover{{color:var(--deep)}}
.ans{{max-width:680px}} h3{{font-size:30px;font-weight:600;letter-spacing:-.015em;line-height:1.15;margin:0 0 12px}} .short{{font-size:19px;line-height:1.5;margin:0 0 12px;padding:16px 18px;border-radius:10px}} .by{{color:var(--soft);font-size:14px;margin:0}}

/* QUIET */
.v-quiet .wm span{{color:var(--deep)}} .v-quiet .tile{{background:var(--grey)}} .v-quiet .tile:hover{{outline:2px solid var(--sage)}} .v-quiet .short{{background:var(--grey)}} .v-quiet .toc{{background:var(--grey);padding:18px 20px;border-radius:12px;align-self:start}}

/* BAND */
.v-band .hd{{background:#fff}} .v-band .wm{{background:var(--sage);color:#fff;padding:8px 14px;border-radius:8px}}
.v-band .hero{{background:var(--sage);color:#fff;max-width:none;padding:56px 48px 40px}} .v-band .over{{color:#F1F5F1}} .v-band h1{{color:#fff}} .v-band .lede{{color:#fff;font-size:20px}} .v-band .quiet{{color:#F1F5F1}}
.v-band .tile{{background:var(--off)}} .v-band .tile:hover{{outline:3px solid #fff}} .v-band .strip{{padding:24px 48px 0}} .v-band .search{{margin-top:0}} .v-band .short{{background:var(--grey)}} .v-band .toc a::before{{color:var(--deep)}} .v-band .lib{{background:#fff;margin-top:32px;padding-top:40px}}

/* PANELS */
.v-panels{{background:var(--grey)}} .v-panels .hd{{background:#fff}} .v-panels .wm i{{display:inline-block;width:9px;height:9px;border-radius:50%;background:var(--sage);margin-left:3px}}
.v-panels .hero{{max-width:none;padding:56px 48px 8px}} .v-panels .hero .cols{{grid-template-columns:1.1fr 1fr;gap:48px;align-items:start}}
.v-panels .tiles{{grid-template-columns:1fr;gap:10px}} .v-panels .tile{{background:#fff;border-left:8px solid var(--sage);border-radius:10px;padding:18px 20px}} .v-panels .tile b{{font-size:20px}} .v-panels .tile:hover{{border-left-color:var(--deep)}}
.v-panels .lib{{padding-top:40px}} .v-panels .toc{{background:#fff;padding:18px 20px;border-radius:12px;align-self:start}} .v-panels .main{{background:#fff;border-radius:12px;padding:28px 32px}} .v-panels .short{{background:var(--grey);border-left:6px solid var(--sage)}}

@media(max-width:760px){{.hd,.hero,.lib,.strip{{padding-left:22px!important;padding-right:22px!important}} nav a{{margin-left:14px;font-size:14px}} .tiles,.cols,.v-panels .hero .cols{{grid-template-columns:1fr!important}} .cols{{gap:24px}}}}
'''
tabs = '<div class="tabs"><b>GoBK in the BKFL palette</b>' + ''.join(f'<a href="#{i}" data-d="{i}">{n}</a>' for i,n,_ in V) + '</div>'
body = ''.join(f'<section class="dir" id="dir-{i}"><div class="frame">{h}</div></section>' for i,_,h in V)
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoBK: BKFL palette options</title><style>{CSS}</style></head><body>{tabs}{body}
<script>function s(){{var id=(location.hash||'#quiet').slice(1);if(!document.getElementById('dir-'+id))id='quiet';document.querySelectorAll('.dir').forEach(function(d){{d.classList.toggle('on',d.id==='dir-'+id)}});document.querySelectorAll('.tabs a').forEach(function(a){{a.classList.toggle('on',a.dataset.d===id)}});window.scrollTo(0,0)}}addEventListener('hashchange',s);s();document.addEventListener('submit',function(e){{e.preventDefault()}})</script></body></html>'''
open(sys.argv[1],'w').write(html); print(sys.argv[1], len(html)//1024, 'KB')
