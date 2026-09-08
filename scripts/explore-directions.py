"""Renders five distinct brand/design directions for GoBK as one self-contained HTML file."""
import base64, sys

NM = 'node_modules/'
def b64(p): return base64.b64encode(open(NM + p, 'rb').read()).decode()
def face(family, path, weight='100 900', style='normal', extra=''):
    return f"@font-face{{font-family:'{family}';src:url(data:font/woff2;base64,{b64(path)}) format('woff2');font-weight:{weight};font-style:{style};font-display:swap;{extra}}}"

fonts = ''.join([
    face('Fraunces', '@fontsource-variable/fraunces/files/fraunces-latin-soft-normal.woff2'),
    face('Fraunces', '@fontsource-variable/fraunces/files/fraunces-latin-soft-italic.woff2', style='italic'),
    face('Inter', '@fontsource-variable/inter/files/inter-latin-opsz-normal.woff2'),
    face('Public Sans', '@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2'),
    face('Literata', '@fontsource-variable/literata/files/literata-latin-opsz-normal.woff2'),
    face('Literata', '@fontsource-variable/literata/files/literata-latin-opsz-italic.woff2', style='italic'),
    face('Source Serif 4', '@fontsource-variable/source-serif-4/files/source-serif-4-latin-opsz-normal.woff2'),
    face('Plex Condensed', '@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-500-normal.woff2', weight='500'),
    face('Plex Condensed', '@fontsource/ibm-plex-sans-condensed/files/ibm-plex-sans-condensed-latin-600-normal.woff2', weight='600'),
    face('Atkinson', '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff2', weight='400'),
    face('Atkinson', '@fontsource/atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff2', weight='700'),
])

DOORS = [
    ("I need help now", "A garnishment, lawsuit, foreclosure, repossession, or bank levy is already happening."),
    ("I need a way out of debt", "Things are not sustainable and you want to understand your options, including ones that are not bankruptcy."),
    ("I'm trying to understand bankruptcy", "You are considering it and want to know what it actually means for your house, car, credit, and daily life."),
    ("I'm just exploring", "You want to learn without committing to anything."),
]
ANSWER = dict(
    q="Can bankruptcy stop a wage garnishment?",
    a="Yes, in almost every case. Filing triggers an automatic stay that requires most creditors to stop garnishing immediately, usually within one or two pay periods.",
    by="Written by Matt McCune, bankruptcy attorney. Updated September 1, 2026.",
)
LEDE = "Maybe it's a garnishment, a lawsuit, a question about Chapter 7, or just wanting to know what your options are. Whatever it is, GoBK is built to help you understand it."
QUIET = "No pressure. No judgment. Nothing to sign up for. Explore privately."

def doors(cls='door'):
    return ''.join(f'<a class="{cls}" href="#"><b>{t}</b><span>{h}</span></a>' for t, h in DOORS)

def answer(cls='ans'):
    return f'<div class="{cls}"><p class="ans-k">A sample answer</p><h3>{ANSWER["q"]}</h3><p class="ans-a">{ANSWER["a"]}</p><p class="ans-by">{ANSWER["by"]}</p></div>'

def chips(cols):
    return ''.join(f'<span class="chip"><i style="background:{c}"></i>{c}</span>' for c in cols)

def notes(concept, cols, type_, good, risk):
    return f'''<div class="notes"><div><p class="nk">The idea</p><p>{concept}</p></div>
<div><p class="nk">Color</p><p class="chips">{chips(cols)}</p></div>
<div><p class="nk">Type</p><p>{type_}</p></div>
<div><p class="nk">Good at</p><p>{good}</p></div>
<div><p class="nk">Watch out for</p><p>{risk}</p></div></div>'''

# ---------------------------------------------------------------- directions
D = []

# 1 NIGHT DESK ------------------------------------------------------------
D.append(('night', 'Night desk', f'''
<div class="d-night">
<header class="hd"><a class="wm" href="#">GoBK<i></i></a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero">
  <h1>We got you.</h1>
  <p class="lede">{LEDE} Whatever time it is.</p>
  <form class="search"><input placeholder="Ask a question, like “can I keep my house?”"><button>Search</button></form>
  <p class="quiet">{QUIET}</p>
</section>
<section class="doors"><p class="k">Or start with where you are</p>{doors()}</section>
{answer()}
</div>
{notes("Designed for the hour people actually read it. A dark, warm room instead of a bright office: low glare, ivory text, one amber light for anything you can touch. Nothing on the page shouts.",
 ["#14161F","#1D2030","#F3EBDD","#A9A397","#E8B86D"],
 "Fraunces (soft, high-contrast serif) for headlines and answers; Inter for interface.",
 "Calm at night, feels private, unlike every competitor. The amber accent makes actions obvious without alarm.",
 "Dark interfaces read as “tech” if the type is not warm enough. Needs a light mode for daytime and print, so it is really two designs.")}
'''))

# 2 CLINIC ----------------------------------------------------------------
D.append(('clinic', 'Plain clinic', f'''
<div class="d-clinic">
<header class="hd"><a class="wm" href="#"><span>Go</span>BK</a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero">
  <p class="over">The consumer bankruptcy resource</p>
  <h1>What do you need to understand today?</h1>
  <div class="tiles">{doors('tile')}</div>
  <p class="quiet">{QUIET}</p>
</section>
<section class="strip"><form class="search"><input placeholder="Search GoBK: can I keep my car? does bankruptcy stop foreclosure?"><button>Search</button></form></section>
{answer()}
</div>
{notes("Public-service clarity, like the best health information sites. White space, one typeface, large plain sentences, soft green panels. It looks like it has nothing to sell because it doesn't.",
 ["#FFFFFF","#E6F0EC","#1F2A2E","#5C6B70","#2F5D62"],
 "Public Sans for everything, set large. No serif at all.",
 "Fastest to understand on a phone under stress. Accessible by default. Scales to hundreds of pages without visual noise.",
 "Institutional; can feel like a government site. Little brand personality, so trust has to come entirely from content and Matt.")}
'''))

# 3 LETTER ----------------------------------------------------------------
D.append(('letter', 'The letter', f'''
<div class="d-letter">
<header class="hd"><a class="wm" href="#">GoBK</a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero">
  <h1>Almost nobody wants to file bankruptcy. Most people want to know whether they have to, and what happens if they do.</h1>
  <p class="lede">I've represented people in bankruptcy for more than two decades. I built GoBK so you could find that out for yourself, in plain English, without calling anyone. {QUIET}</p>
  <p class="sig">Matt McCune, bankruptcy attorney</p>
  <p class="k">Tell me where you are.</p>
  <div class="list">{doors()}</div>
</section>
{answer()}
</div>
{notes("A person wrote this to you. One reading column, one serif, ink-blue links like a fountain pen. The hero is a sentence from Matt rather than a slogan; the brand is the voice.",
 ["#FBF9F4","#1A1A1A","#1F3A93","#8A8578","#EDE7D6"],
 "Literata (designed for long reading) for everything, with wide leading.",
 "Most human and most honest-feeling. Articles and homepage share one voice. Cheap to extend: it is mostly typography.",
 "Can read as a personal blog rather than a national resource. Relies on Matt's copy being consistently good. Little visual structure for a large library.")}
'''))

# 4 FIELD GUIDE -----------------------------------------------------------
idx = ["Bankruptcy basics","Chapter 7","Chapter 13","Property and assets","Debts","Income and eligibility","Creditor actions","Life after bankruptcy","Alternatives"]
D.append(('guide', 'Field guide', f'''
<div class="d-guide">
<header class="hd"><a class="wm" href="#">GoBK</a><span class="tag">The consumer bankruptcy resource</span><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<div class="cols">
  <aside class="index"><p class="k">Contents</p><ol>{''.join(f'<li><a href="#">{t}</a></li>' for t in idx)}</ol>
    <form class="search"><input placeholder="Look something up"><button>Go</button></form></aside>
  <section class="main">
    <h1>We got you.</h1>
    <p class="lede">{LEDE}</p>
    <p class="quiet">{QUIET}</p>
    <p class="k">Where are you starting from?</p>
    <div class="list">{doors()}</div>
    {answer()}
  </section>
</div>
</div>
{notes("A reference book you keep on the shelf. Kraft paper, a numbered table of contents always in view, one ochre tab for wayfinding. The structure of the Library becomes the identity.",
 ["#F1E9D6","#2B2A26","#4A5A3A","#C8792E","#CFC4A9"],
 "Source Serif 4 for reading; IBM Plex Sans Condensed for the index, labels, and wordmark.",
 "Makes breadth visible: the whole taxonomy is one glance away on every page. Feels authoritative and durable, like something edited.",
 "Denser than the others; needs discipline on mobile. Can tip into “old-fashioned” if the paper tone is too heavy.")}
'''))

# 5 WAYFINDING ------------------------------------------------------------
D.append(('way', 'Wayfinding', f'''
<div class="d-way">
<header class="hd"><a class="wm" href="#"><span>GoBK</span></a><nav><a href="#">Explore</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>
<section class="hero">
  <p class="here">You are here</p>
  <h1>Serious debt. Not sure what to do.</h1>
  <p class="lede">GoBK is a map of your options, including bankruptcy and the ones that aren't. {QUIET}</p>
</section>
<section class="signs">{doors('sign')}</section>
<section class="strip"><form class="search"><input placeholder="Or ask a question"><button>Search</button></form></section>
{answer()}
</div>
{notes("Signage, not marketing. Big legible type, deep blue and white like a road sign, one yellow marker for “you are here.” Every screen answers: where am I, where can I go, what happens if I go there.",
 ["#F4F6F8","#1C4E80","#FFFFFF","#10202B","#F2C94C"],
 "Atkinson Hyperlegible (made for low vision) for everything.",
 "Strongest sense of agency and direction, which is the emotional job. Very legible on phones. Fits the name: GoBK.",
 "Bold color can feel loud to someone frightened; the blue must stay calm. Least “editorial,” so long articles need extra care.")}
'''))

# ------------------------------------------------------------------ styles
CSS = f'''
{fonts}
*{{box-sizing:border-box}} html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:#3a3a3a;font-family:Inter,system-ui,sans-serif;color:#222}}
.tabs{{position:sticky;top:0;z-index:10;display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding:10px 16px;background:#242424;color:#ddd;font-size:13px}}
.tabs b{{margin-right:8px;font-weight:600;color:#fff}}
.tabs a{{color:#bbb;text-decoration:none;padding:6px 10px;border-radius:4px}}
.tabs a.on{{background:#fff;color:#111}}
.dir{{display:none}} .dir.on{{display:block}}
.frame{{max-width:1180px;margin:24px auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.notes{{background:#f2f2f2;color:#222;padding:22px 32px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1fr;gap:24px;font:14px/1.5 Inter,system-ui,sans-serif}}
.notes p{{margin:0}} .nk{{font-weight:600;margin-bottom:4px!important;color:#555}}
.chips{{display:flex;flex-wrap:wrap;gap:6px}} .chip{{display:inline-flex;align-items:center;gap:5px;font-size:12px}} .chip i{{width:16px;height:16px;border-radius:3px;border:1px solid rgba(0,0,0,.15);display:inline-block}}
@media(max-width:800px){{.notes{{grid-template-columns:1fr 1fr}}}}
input,button{{font:inherit}}

/* ---------- 1 NIGHT ---------- */
.d-night{{--bg:#14161F;--panel:#1D2030;--ink:#F3EBDD;--dim:#A9A397;--lamp:#E8B86D;background:var(--bg);color:var(--ink);font-family:Inter,sans-serif;padding:0 0 56px}}
.d-night .hd{{display:flex;justify-content:space-between;align-items:center;padding:22px 48px;border-bottom:1px solid rgba(243,235,221,.1)}}
.d-night .wm{{font-family:Fraunces,serif;font-size:30px;color:var(--ink);text-decoration:none;letter-spacing:-.01em}} .d-night .wm i{{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--lamp);margin-left:3px;vertical-align:baseline}}
.d-night nav a{{color:var(--dim);text-decoration:none;margin-left:26px;font-size:15px}} .d-night nav a:last-child{{color:var(--lamp)}}
.d-night .hero{{padding:96px 48px 40px;max-width:820px}}
.d-night h1{{font-family:Fraunces,serif;font-weight:400;font-size:clamp(56px,9vw,112px);line-height:.95;letter-spacing:-.02em;margin:0 0 28px;font-variation-settings:'SOFT' 100,'opsz' 144}}
.d-night .lede{{font-size:20px;line-height:1.5;max-width:44ch;margin:0 0 28px;color:var(--ink)}}
.d-night .search{{display:flex;gap:8px;max-width:600px}} .d-night input{{flex:1;background:var(--panel);border:1px solid rgba(243,235,221,.18);border-radius:6px;padding:15px 16px;color:var(--ink);font-size:17px}} .d-night input::placeholder{{color:var(--dim)}} .d-night button{{background:var(--lamp);color:#1a1509;border:0;border-radius:6px;padding:0 20px;font-weight:600}}
.d-night .quiet{{color:var(--dim);font-size:15px;margin-top:16px}}
.d-night .doors{{padding:24px 48px;max-width:820px}} .d-night .k{{color:var(--dim);font-size:14px;margin:0 0 6px}}
.d-night .door{{display:block;text-decoration:none;color:var(--ink);padding:18px 0;border-bottom:1px solid rgba(243,235,221,.12)}} .d-night .door b{{display:block;font-family:Fraunces,serif;font-weight:400;font-size:26px;margin-bottom:4px}} .d-night .door span{{color:var(--dim);font-size:15px}}
.d-night .ans{{margin:56px 48px 0;background:var(--panel);border-radius:10px;padding:32px 36px;max-width:820px}} .d-night .ans-k{{color:var(--lamp);font-size:13px;font-weight:600;margin:0 0 10px}} .d-night h3{{font-family:Fraunces,serif;font-weight:400;font-size:34px;margin:0 0 14px;line-height:1.1}} .d-night .ans-a{{font-family:Fraunces,serif;font-size:21px;line-height:1.45;margin:0 0 14px}} .d-night .ans-by{{color:var(--dim);font-size:14px;margin:0}}

/* ---------- 2 CLINIC ---------- */
.d-clinic{{--bg:#fff;--mint:#E6F0EC;--ink:#1F2A2E;--soft:#5C6B70;--slate:#2F5D62;--line:#D6E0DC;background:var(--bg);color:var(--ink);font-family:'Public Sans',sans-serif;padding-bottom:56px}}
.d-clinic .hd{{display:flex;justify-content:space-between;align-items:center;padding:20px 48px;border-bottom:1px solid var(--line)}}
.d-clinic .wm{{font-weight:700;font-size:26px;color:var(--ink);text-decoration:none;letter-spacing:-.02em}} .d-clinic .wm span{{color:var(--slate)}}
.d-clinic nav a{{color:var(--ink);text-decoration:none;margin-left:26px;font-size:16px;font-weight:500}}
.d-clinic .hero{{padding:72px 48px 24px;max-width:980px}}
.d-clinic .over{{color:var(--soft);font-size:16px;margin:0 0 12px}}
.d-clinic h1{{font-weight:600;font-size:clamp(34px,4.6vw,54px);line-height:1.12;letter-spacing:-.02em;margin:0 0 32px;max-width:20ch}}
.d-clinic .tiles{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
.d-clinic .tile{{display:block;background:var(--mint);border-radius:14px;padding:26px 26px 24px;text-decoration:none;color:var(--ink);border:2px solid transparent}} .d-clinic .tile:hover{{border-color:var(--slate)}} .d-clinic .tile b{{display:block;font-size:22px;font-weight:600;margin-bottom:6px}} .d-clinic .tile span{{color:var(--soft);font-size:16px;line-height:1.45}}
.d-clinic .quiet{{color:var(--soft);font-size:16px;margin:22px 0 0}}
.d-clinic .strip{{padding:24px 48px 0;max-width:980px}} .d-clinic .search{{display:flex;gap:8px;max-width:640px}} .d-clinic input{{flex:1;border:2px solid var(--line);border-radius:10px;padding:15px 16px;font-size:17px}} .d-clinic button{{background:var(--slate);color:#fff;border:0;border-radius:10px;padding:0 22px;font-weight:600}}
.d-clinic .ans{{margin:48px 48px 0;max-width:720px;border-top:1px solid var(--line);padding-top:28px}} .d-clinic .ans-k{{color:var(--soft);font-size:14px;margin:0 0 10px}} .d-clinic h3{{font-size:32px;font-weight:600;letter-spacing:-.015em;margin:0 0 12px;line-height:1.15}} .d-clinic .ans-a{{font-size:20px;line-height:1.5;margin:0 0 12px;background:var(--mint);padding:16px 18px;border-radius:10px}} .d-clinic .ans-by{{color:var(--soft);font-size:14px;margin:0}}
@media(max-width:700px){{.d-clinic .tiles{{grid-template-columns:1fr}}}}

/* ---------- 3 LETTER ---------- */
.d-letter{{--bg:#FBF9F4;--ink:#1A1A1A;--pen:#1F3A93;--faint:#8A8578;--rule:#EDE7D6;background:var(--bg);color:var(--ink);font-family:Literata,serif;padding-bottom:64px}}
.d-letter .hd{{display:flex;justify-content:space-between;align-items:baseline;padding:26px 0;max-width:660px;margin:0 auto;border-bottom:1px solid var(--rule)}}
.d-letter .wm{{font-style:italic;font-size:30px;color:var(--ink);text-decoration:none}}
.d-letter nav a{{color:var(--pen);text-decoration:none;margin-left:22px;font-size:16px}}
.d-letter .hero{{max-width:660px;margin:0 auto;padding:72px 0 0}}
.d-letter h1{{font-weight:400;font-size:clamp(30px,3.6vw,42px);line-height:1.28;margin:0 0 28px;font-variation-settings:'opsz' 36}}
.d-letter .lede{{font-size:20px;line-height:1.65;margin:0 0 18px}}
.d-letter .sig{{color:var(--faint);font-style:italic;font-size:18px;margin:0 0 56px}}
.d-letter .k{{font-size:18px;margin:0 0 6px}} .d-letter .list{{border-top:1px solid var(--rule)}}
.d-letter .door{{display:block;text-decoration:none;color:var(--ink);padding:18px 0;border-bottom:1px solid var(--rule)}} .d-letter .door b{{display:block;font-weight:400;font-size:24px;color:var(--pen);text-decoration:underline;text-underline-offset:.16em;text-decoration-thickness:1px;margin-bottom:4px}} .d-letter .door span{{color:var(--faint);font-size:16px}}
.d-letter .ans{{max-width:660px;margin:64px auto 0}} .d-letter .ans-k{{color:var(--faint);font-size:15px;font-style:italic;margin:0 0 10px}} .d-letter h3{{font-weight:400;font-size:36px;line-height:1.15;margin:0 0 14px}} .d-letter .ans-a{{font-size:22px;line-height:1.5;margin:0 0 12px}} .d-letter .ans-by{{color:var(--faint);font-size:15px;margin:0}}
@media(max-width:720px){{.d-letter .hd,.d-letter .hero,.d-letter .ans{{padding-left:24px;padding-right:24px}}}}

/* ---------- 4 GUIDE ---------- */
.d-guide{{--paper:#F1E9D6;--ink:#2B2A26;--olive:#4A5A3A;--tab:#C8792E;--rule:#CFC4A9;background:var(--paper);color:var(--ink);font-family:'Source Serif 4',serif;padding-bottom:56px}}
.d-guide .hd{{display:flex;align-items:center;gap:20px;padding:18px 40px;border-bottom:2px solid var(--ink)}}
.d-guide .wm{{font-family:'Plex Condensed',sans-serif;font-weight:600;font-size:22px;letter-spacing:.06em;color:var(--paper);background:var(--olive);padding:6px 12px;text-decoration:none}}
.d-guide .tag{{font-family:'Plex Condensed',sans-serif;font-weight:500;color:var(--olive);font-size:16px;letter-spacing:.02em}}
.d-guide nav{{margin-left:auto}} .d-guide nav a{{font-family:'Plex Condensed',sans-serif;font-weight:500;color:var(--ink);text-decoration:none;margin-left:22px;font-size:17px}}
.d-guide .cols{{display:grid;grid-template-columns:230px 1fr;gap:56px;padding:48px 40px 0}}
.d-guide .index{{border-right:1px solid var(--rule);padding-right:24px}} .d-guide .k{{font-family:'Plex Condensed',sans-serif;font-weight:600;font-size:15px;letter-spacing:.04em;color:var(--olive);margin:0 0 10px}}
.d-guide ol{{list-style:none;margin:0 0 24px;padding:0;counter-reset:c}} .d-guide ol li{{counter-increment:c;border-bottom:1px solid var(--rule)}} .d-guide ol a{{display:flex;gap:12px;padding:9px 0;color:var(--ink);text-decoration:none;font-size:16px}} .d-guide ol a::before{{content:counter(c,decimal-leading-zero);font-family:'Plex Condensed',sans-serif;color:var(--tab);font-weight:600;min-width:22px}}
.d-guide .search{{display:flex;gap:6px}} .d-guide input{{flex:1;min-width:0;border:1px solid var(--rule);background:#fff;padding:9px 10px;font-family:'Plex Condensed',sans-serif;font-size:15px}} .d-guide button{{background:var(--ink);color:var(--paper);border:0;padding:0 12px;font-family:'Plex Condensed',sans-serif;font-weight:600}}
.d-guide h1{{font-weight:400;font-size:clamp(56px,7.5vw,96px);line-height:.98;letter-spacing:-.015em;margin:0 0 22px;color:var(--ink)}}
.d-guide .lede{{font-size:21px;line-height:1.5;max-width:46ch;margin:0 0 10px}} .d-guide .quiet{{font-family:'Plex Condensed',sans-serif;color:var(--olive);font-size:16px;margin:0 0 40px}}
.d-guide .main .k{{margin-bottom:0}} .d-guide .list{{border-top:2px solid var(--ink);margin-top:10px}}
.d-guide .door{{display:grid;grid-template-columns:1fr 1.3fr;gap:20px;text-decoration:none;color:var(--ink);padding:16px 0;border-bottom:1px solid var(--rule);align-items:baseline}} .d-guide .door b{{font-weight:400;font-size:26px}} .d-guide .door span{{font-family:'Plex Condensed',sans-serif;color:var(--olive);font-size:16px}}
.d-guide .ans{{margin-top:48px;border-left:6px solid var(--tab);padding-left:22px;max-width:640px}} .d-guide .ans-k{{font-family:'Plex Condensed',sans-serif;font-weight:600;color:var(--tab);font-size:14px;letter-spacing:.04em;margin:0 0 8px}} .d-guide h3{{font-weight:400;font-size:34px;line-height:1.12;margin:0 0 12px}} .d-guide .ans-a{{font-size:20px;line-height:1.5;margin:0 0 10px}} .d-guide .ans-by{{font-family:'Plex Condensed',sans-serif;color:var(--olive);font-size:15px;margin:0}}
@media(max-width:800px){{.d-guide .cols{{grid-template-columns:1fr;gap:28px;padding:32px 24px 0}} .d-guide .index{{border-right:0;padding-right:0}} .d-guide .door{{grid-template-columns:1fr;gap:4px}} .d-guide .tag{{display:none}}}}

/* ---------- 5 WAYFINDING ---------- */
.d-way{{--bg:#F4F6F8;--blue:#1C4E80;--ink:#10202B;--line:#C9D3DB;--yellow:#F2C94C;background:var(--bg);color:var(--ink);font-family:Atkinson,sans-serif;padding-bottom:56px}}
.d-way .hd{{display:flex;justify-content:space-between;align-items:center;padding:18px 48px;background:#fff;border-bottom:1px solid var(--line)}}
.d-way .wm{{text-decoration:none}} .d-way .wm span{{display:inline-block;background:var(--blue);color:#fff;font-weight:700;font-size:22px;padding:8px 14px;border-radius:8px;letter-spacing:.01em}}
.d-way nav a{{color:var(--ink);text-decoration:none;margin-left:26px;font-size:17px;font-weight:700}}
.d-way .hero{{background:var(--blue);color:#fff;padding:64px 48px 56px}}
.d-way .here{{display:inline-block;background:var(--yellow);color:var(--ink);font-weight:700;font-size:15px;padding:6px 12px;border-radius:6px;margin:0 0 22px}}
.d-way h1{{font-weight:700;font-size:clamp(40px,6vw,72px);line-height:1.02;letter-spacing:-.02em;margin:0 0 20px;max-width:16ch}}
.d-way .lede{{font-size:20px;line-height:1.5;max-width:52ch;margin:0;color:#DCE6F0}}
.d-way .signs{{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:28px 48px 0}}
.d-way .sign{{display:block;background:#fff;border:2px solid var(--line);border-left:10px solid var(--blue);border-radius:8px;padding:20px 22px;text-decoration:none;color:var(--ink)}} .d-way .sign:hover{{border-color:var(--blue)}} .d-way .sign b{{display:block;font-size:24px;margin-bottom:6px}} .d-way .sign span{{font-size:16px;line-height:1.45;color:#3E5260}}
.d-way .strip{{padding:20px 48px 0}} .d-way .search{{display:flex;gap:8px;max-width:640px}} .d-way input{{flex:1;border:2px solid var(--line);border-radius:8px;padding:14px 16px;font-size:17px;background:#fff}} .d-way button{{background:var(--ink);color:#fff;border:0;border-radius:8px;padding:0 22px;font-weight:700}}
.d-way .ans{{margin:48px 48px 0;max-width:720px;background:#fff;border:2px solid var(--line);border-radius:10px;padding:28px 30px}} .d-way .ans-k{{color:#3E5260;font-size:14px;font-weight:700;margin:0 0 10px}} .d-way h3{{font-size:32px;font-weight:700;line-height:1.12;margin:0 0 12px;letter-spacing:-.01em}} .d-way .ans-a{{font-size:20px;line-height:1.5;margin:0 0 12px}} .d-way .ans-by{{color:#3E5260;font-size:14px;margin:0}}
@media(max-width:700px){{.d-way .signs{{grid-template-columns:1fr}}}}

@media(max-width:700px){{.hd,.hero,.doors,.ans,.strip,.signs{{padding-left:22px!important;padding-right:22px!important}} nav a{{margin-left:14px!important;font-size:14px!important}} .ans{{margin-left:22px!important;margin-right:22px!important}}}}
'''

tabs = '<div class="tabs"><b>GoBK directions</b>' + ''.join(f'<a href="#{i}" data-d="{i}">{n}</a>' for i, n, _ in D) + '</div>'
body = ''.join(f'<section class="dir" id="dir-{i}"><div class="frame">{h}</div></section>' for i, _, h in D)
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoBK design directions</title><style>{CSS}</style></head>
<body>{tabs}{body}
<script>function s(){{var id=(location.hash||'#night').slice(1);if(!document.getElementById('dir-'+id))id='night';document.querySelectorAll('.dir').forEach(function(d){{d.classList.toggle('on',d.id==='dir-'+id)}});document.querySelectorAll('.tabs a').forEach(function(a){{a.classList.toggle('on',a.dataset.d===id)}});window.scrollTo(0,0)}}addEventListener('hashchange',s);s();document.addEventListener('submit',function(e){{e.preventDefault()}})</script>
</body></html>'''
out = sys.argv[1]
open(out, 'w').write(html)
print(out, len(html) // 1024, 'KB')
