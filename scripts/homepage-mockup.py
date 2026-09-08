"""Full homepage mockup, extended from the approved hero mockup. Same header and hero code."""
import base64, sys
NM='node_modules/'
fonts="@font-face{font-family:'Public Sans';src:url(data:font/woff2;base64,%s) format('woff2');font-weight:100 900;font-display:swap}"%base64.b64encode(open(NM+'@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2','rb').read()).decode()
DOORS=[('I need help now', 'A garnishment, lawsuit, foreclosure, repossession, or bank levy is about to happen or already has.'), ('I need a way out of debt', "My finances aren't sustainable and I want to understand my options, including ones that aren't bankruptcy."), ("I'm trying to understand bankruptcy", "I'm considering it and want to know what it actually means for my house, car, credit, and daily life."), ("I'm just exploring", "I'm not ready to decide anything. I just want to understand how bankruptcy and other options work.")]
TOPICS=["Bankruptcy basics","Chapter 7","Chapter 13","Property and assets","Debts","Income and eligibility","Creditor actions","Life after bankruptcy","Alternatives to bankruptcy"]
QS=["What is the difference between Chapter 7 and Chapter 13?","Can bankruptcy stop a wage garnishment?","Will I lose my house if I file bankruptcy?","Can I keep my car if I file bankruptcy?","Should I stop paying my credit cards?","What are my alternatives to bankruptcy?"]
tiles=''.join(f'<a class="tile" href="#"><b>{t}</b><span>{h}</span></a>' for t,h in DOORS)
page=f'''<div class="v">
<header class="hd"><a class="wm" href="#">GoBK</a><span class="desc">The bankruptcy library</span><nav><a href="#">Library</a><a href="#">Checkup</a><a href="#">About</a><a href="#">Search</a></nav></header>

<section class="hero"><h1><span class="q">Wondering if bankruptcy is the right decision?</span><span class="w">We got you.</span></h1>
<p class="lede"><span class="beat">Sometimes it is. Sometimes it isn't.</span>We help you find answers and point you in the right direction (even if it's not bankruptcy).</p>
<p class="quiet">No pressure. No judgment. Browse freely.</p></section>

<section class="doors"><h2>Which of these sounds like you?</h2><div class="tiles">{tiles}</div></section>

<section class="chk"><div class="chkcols"><div><h2>Want help with your specific situation?</h2>
<p class="sub">The Bankruptcy Checkup asks a few questions about your income, expenses, assets, and debts. The Checkup will then show you whether bankruptcy looks like a good fit for you and, if it doesn't, what other options are worth exploring. It takes about five minutes and no email is needed to see your result.</p></div>
<div class="chkact"><a class="btn" href="#">Start the Bankruptcy Checkup</a><ul class="small"><li>Instant results</li><li>Nothing to sign up for</li><li>Not legal advice</li></ul></div></div></section>

<section class="lib"><h2>The GoBK Library</h2><p class="sub">Plain-English answers about bankruptcy, debt, and your options, organized by the questions people actually ask. Everything is free to read.</p>
<div class="cols"><aside class="toc"><p class="k">Browse by topic</p><ol>{''.join(f'<li><a href="#">{t}</a></li>' for t in TOPICS)}</ol></aside>
<div><p class="k">Have a question?</p><form class="search"><input placeholder="Ask a question, like “can I keep my car?”"><button>Search</button></form>
<p class="k qk">Common questions</p><ul class="qs">{''.join(f'<li><a href="#">{q}</a></li>' for q in QS)}</ul><p class="more"><a href="#">See everything in the Library</a></p></div></div></section>

<section class="why"><div class="whycols"><div><h2>A note from Matt</h2>
<p class="note">I've spent 25 years working with people who were struggling with serious debt. Almost none of them wanted to file bankruptcy. Nearly all of them wanted to understand whether they had to, and what would happen if they did.</p>
<p class="note">GoBK exists to answer that question honestly, whether the answer is bankruptcy or something else.</p>
</div>
<a class="video" href="#" aria-label="Watch a short video from Matt"><span class="play"></span><span class="vlabel">A short video from Matt<small>About a minute. Coming soon.</small></span></a></div></section>

<section class="nl"><h2>The GoBK newsletter, in your inbox.</h2><p class="sub">Practical information about bankruptcy and debt options.</p><form class="search"><input placeholder="you@example.com"><button>Sign me up</button></form></section>

<footer class="ft"><div class="ftcols"><div><a class="wm sm" href="#">GoBK</a><p class="tag">The bankruptcy library. General information about bankruptcy and debt options.</p></div>
<ul><li><a href="#">Library</a></li><li><a href="#">About GoBK</a></li><li><a href="mailto:hello@gobk.ai">hello@gobk.ai</a></li></ul></div>
<p class="legal">GoBK provides general educational information about bankruptcy and debt. It is not legal advice and does not create an attorney-client relationship. Bankruptcy law varies by state and by court, and your situation has details a website cannot see. Consider talking with a qualified attorney before making decisions.</p>
<p class="fine"><span>&copy; 2026 GoBK</span><a href="#">Privacy</a></p></footer>
</div>'''
CSS=f'''{fonts}*{{box-sizing:border-box}}body{{margin:0;background:#3a3a3a;font-family:'Public Sans',system-ui,sans-serif;color:#434343}}input,button{{font:inherit}}
.frame{{max-width:1180px;margin:24px auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}}
.v{{--sage:#7A9C80;--deep:#4F6E55;--grey:#E7EAE5;--off:#FBFAF7;--ink:#434343;--soft:#6B6F6B;--line:#D9DED9;background:#fff;color:var(--ink)}}
.hd{{display:flex;align-items:center;gap:16px;padding:16px 48px;border-bottom:1px solid var(--line)}}.wm{{background:var(--sage);color:#fff;font-weight:700;font-size:22px;padding:8px 14px;border-radius:8px;text-decoration:none;letter-spacing:-.01em}}.desc{{color:var(--ink);font-size:19px;font-weight:500}}nav{{margin-left:auto}}nav a{{color:var(--ink);text-decoration:none;margin-left:26px;font-size:16px;font-weight:500}}
.hero{{background:var(--sage);color:#fff;padding:60px 48px 48px}}
h1{{margin:0 0 18px;letter-spacing:-.02em;line-height:1.08;font-weight:600;max-width:22ch}}h1 .q{{display:block;font-size:clamp(26px,3.2vw,38px);font-weight:500;color:#F1F5F1;margin-bottom:6px}}h1 .w{{display:block;font-size:clamp(48px,7vw,84px);font-weight:700;color:#fff;letter-spacing:-.03em}}
.lede{{font-size:20px;line-height:1.5;max-width:none;margin:0 0 12px;color:#fff}}.beat{{display:block;margin-bottom:12px}}.quiet{{color:#fff;font-size:20px;line-height:1.5;font-weight:400;margin:0}}
h2{{font-size:32px;font-weight:600;letter-spacing:-.02em;line-height:1.15;margin:0 0 18px}}
.doors{{background:var(--grey);padding:48px 48px 56px}}.tiles{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}.tile{{display:block;background:var(--off);border:2px solid transparent;border-radius:12px;padding:24px 24px 22px;text-decoration:none;color:var(--ink)}}.tile:hover{{border-color:var(--sage)}}.tile b{{display:block;font-size:22px;font-weight:600;margin-bottom:6px}}.tile span{{color:var(--soft);font-size:16px;line-height:1.45}}
.chk{{padding:56px 48px;border-bottom:1px solid var(--line)}}.chkcols{{display:grid;grid-template-columns:1.5fr 1fr;gap:56px;align-items:center}}.chk .sub{{margin:0}}.chkact{{display:grid;gap:12px;justify-items:start}}.btn{{display:inline-block;background:var(--deep);color:#fff;font-weight:600;font-size:18px;padding:16px 26px;border-radius:10px;text-decoration:none}}.btn:hover{{background:#3F5A44}}.small{{font-size:15px;color:var(--soft);margin:2px 0 0;padding:0;list-style:none;display:grid;gap:4px}}.small li::before{{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--sage);margin:0 10px 2px 2px}}.lib{{padding:64px 48px 48px}}.sub{{font-size:19px;line-height:1.5;max-width:60ch;margin:0 0 22px}}
.search{{display:flex;gap:8px;max-width:none}}.search input{{flex:1;min-width:0;border:2px solid var(--line);border-radius:10px;padding:14px 16px;font-size:17px;background:#fff}}.search button{{background:var(--deep);color:#fff;border:0;border-radius:10px;padding:0 22px;font-weight:600}}
.cols{{display:grid;grid-template-columns:1fr 1.6fr;gap:56px;margin-top:36px;align-items:start}}.k{{font-size:14px;font-weight:600;color:var(--soft);margin:0 0 8px}}.qk{{margin-top:32px}}
.qs{{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}}.qs li{{border-bottom:1px solid var(--line)}}.qs a{{display:block;padding:13px 0;color:var(--ink);text-decoration:none;font-size:19px;font-weight:500}}.qs a:hover{{color:var(--deep)}}.more{{margin:22px 0 0;font-size:16px}}.more a{{color:var(--deep)}}
.toc{{background:var(--grey);border-radius:12px;padding:18px 20px}}.toc ol{{list-style:none;margin:0;padding:0;counter-reset:c}}.toc li{{counter-increment:c;border-bottom:1px solid rgba(67,67,67,.12)}}.toc li:last-child{{border:0}}.toc a{{display:flex;gap:12px;padding:10px 0;color:var(--ink);text-decoration:none;font-size:16px}}.toc a::before{{content:counter(c,decimal-leading-zero);color:var(--deep);font-weight:600;min-width:24px}}
.why{{background:var(--grey);padding:56px 48px}}.whycols{{display:grid;grid-template-columns:1.4fr 1fr;gap:56px;align-items:center}}.note{{font-size:19px;line-height:1.55;margin:0 0 14px;max-width:58ch}}.video{{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;aspect-ratio:16/10;background:var(--off);border:2px dashed #c5cbc5;border-radius:12px;text-decoration:none;color:var(--ink)}}.video:hover{{border-color:var(--sage)}}.play{{width:64px;height:64px;border-radius:50%;background:var(--sage);position:relative}}.play::after{{content:'';position:absolute;left:25px;top:19px;border-style:solid;border-width:13px 0 13px 22px;border-color:transparent transparent transparent #fff}}.vlabel{{text-align:center;font-weight:600;font-size:17px}}.vlabel small{{display:block;font-weight:400;color:var(--soft);font-size:14px;margin-top:4px}}
.nl{{padding:56px 48px 64px;background:var(--sage);color:#fff}}.nl h2{{font-size:26px}}.nl .sub{{font-size:17px;margin-bottom:16px;color:#fff}}.nl .search button{{background:#fff;color:var(--deep)}}.nl .search input{{border-color:#fff}}
.ft{{background:var(--ink);color:#f1f1f1;padding:56px 48px 40px}}.ftcols{{display:grid;grid-template-columns:1.4fr 1fr;gap:40px}}.wm.sm{{font-size:18px;padding:7px 11px}}.tag{{color:#c9cbc9;margin:14px 0 0;max-width:34ch;font-size:15px}}.ft ul{{list-style:none;margin:0;padding:0;display:grid;gap:10px}}.ft ul a{{color:#fff;text-decoration:none;font-size:15px}}.ft ul a:hover{{text-decoration:underline}}.legal{{margin:44px 0 0;padding-top:22px;border-top:1px solid rgba(255,255,255,.15);font-size:13.5px;line-height:1.55;color:#c9cbc9;max-width:80ch}}.fine{{margin:18px 0 0;font-size:13.5px;color:#c9cbc9;display:flex;gap:22px;flex-wrap:wrap}}.fine a{{color:#fff;text-decoration:none}}.fine a:hover{{text-decoration:underline}}
@media(max-width:760px){{.hd,.hero,.doors,.lib,.why,.nl,.ft{{padding-left:22px;padding-right:22px}}.desc{{display:none}}nav a{{margin-left:14px;font-size:14px}}.tiles,.cols,.ftcols,.whycols,.chkcols{{grid-template-columns:1fr}}.cols{{gap:28px}}}}'''
html=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GoBK homepage</title><style>{CSS}</style></head><body><div class="frame">{page}</div><script>document.addEventListener('submit',function(e){{e.preventDefault()}})</script></body></html>'''
open(sys.argv[1],'w').write(html); print('ok')
