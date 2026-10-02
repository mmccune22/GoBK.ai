import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { newsletterConfig, newsletterEmails } from '../src/lib/newsletter.mjs';
import { signupFormConfig } from '../src/lib/signup-forms.mjs';

test('signup cannot activate without a real public Brevo destination', () => {
  assert.deepEqual(newsletterConfig(), { enabled: false, formUrl: '' });
  assert.throws(() => newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'true' }));
  const url = 'https://abc123.sibforms.com/serve/PUBLIC_FORM_ID';
  assert.equal(newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_FORM_URL: url }).enabled, false);
  assert.deepEqual(newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_FORM_URL: url, PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'true' }), { formUrl: url, enabled: true });
});

test('reject credentials, non-Brevo hosts and unsafe form destinations', () => {
  for (const url of ['javascript:alert(1)', 'http://abc.sibforms.com/serve/id', 'https://abc.sibforms.com.evil.example/serve/id', 'https://evil.example/serve/id', 'https://user:secret@abc.sibforms.com/serve/id', 'https://abc.sibforms.com:444/serve/id', 'https://abc.sibforms.com/serve/id?api_key=secret', 'https://abc.sibforms.com/']) {
    assert.throws(() => newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_FORM_URL: url }), url);
    assert.throws(() => signupFormConfig('series', { PUBLIC_GOBK_SERIES_FORM_URL: url }), url);
  }
});

test('the series requires its own verified destination and independent activation', () => {
  const newsletterUrl = 'https://example.sibforms.com/serve/newsletter';
  const seriesUrl = 'https://example.sibforms.com/serve/series';
  const newsletterOnly = { PUBLIC_GOBK_NEWSLETTER_FORM_URL: newsletterUrl, PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'true' };
  assert.equal(signupFormConfig('newsletter', newsletterOnly).enabled, true);
  assert.deepEqual(signupFormConfig('series', newsletterOnly), { enabled: false, formUrl: '' });
  assert.throws(() => signupFormConfig('series', { ...newsletterOnly, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true' }));
  const both = { ...newsletterOnly, PUBLIC_GOBK_SERIES_FORM_URL: seriesUrl, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true' };
  assert.equal(signupFormConfig('newsletter', both).formUrl, newsletterUrl);
  assert.deepEqual(signupFormConfig('series', both), { enabled: true, formUrl: seriesUrl });
  assert.equal(signupFormConfig('newsletter', { PUBLIC_GOBK_SERIES_FORM_URL: seriesUrl, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true' }).enabled, false);
});

function decodeAttribute(value) {
  return value.replace(/&quot;/g, '"').replace(/&#(?:39|x27);|&apos;/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

test('the signup page isolates exactly one email field per enabled subscription', async () => {
  const html = await readFile(new URL('../dist/newsletter/index.html', import.meta.url), 'utf8');
  assert.match(html, /noindex, nofollow, noarchive/);
  const outerHtml = html.replace(/<iframe\b(?:[^"'>]|"[^"]*"|'[^']*')*>/g, '');
  assert.doesNotMatch(outerHtml, /<form\b/);
  assert.doesNotMatch(html, /api\/subscribe/);
  const newsletter = signupFormConfig('newsletter', process.env);
  const series = signupFormConfig('series', process.env);
  if (newsletter.enabled && series.enabled) assert.notEqual(newsletter.formUrl, series.formUrl, 'The two subscriptions require distinct provider forms');
  const frames = [...html.matchAll(/<iframe\b((?:[^"'>]|"[^"]*"|'[^']*')*)>/g)].map((match) => ({
    kind: match[1].match(/data-email-signup="([^"]+)"/)?.[1],
    document: decodeAttribute(match[1].match(/srcdoc="([^"]+)"/)?.[1] ?? ''),
  }));
  for (const kind of ['newsletter', 'series']) {
    const config = signupFormConfig(kind, process.env);
    const selected = frames.filter((frame) => frame.kind === kind);
    assert.equal(selected.length, config.enabled ? 1 : 0);
    if (!config.enabled) continue;
    const document = selected[0].document;
    assert.equal([...document.matchAll(/<input\b[^>]*\btype="email"/g)].length, 1);
    assert.ok(document.includes(`action="${config.formUrl}"`), `${kind} must use its own public Brevo destination`);
    assert.match(document, /method="POST"/);
    assert.match(document, /type="checkbox"[^>]*name="OPT_IN" required/);
    assert.doesNotMatch(document, /<input[^>]*type="checkbox"[^>]*\bchecked/);
    assert.match(document, /name="email_address_check"/);
    assert.match(document, /sibforms\.com\/forms\/end-form\/build\/main\.js/);
    assert.match(document, /id="error-message" role="alert"/);
    assert.match(document, /id="success-message" role="status"/);
  }
  assert.equal(frames.length, ['newsletter', 'series'].filter((kind) => signupFormConfig(kind, process.env).enabled).length);
});

test('built reading paths and Brevo-only signup respect activation', async () => {
  const { enabled, formUrl } = newsletterConfig(process.env);
  for (const slug of newsletterEmails.map((email) => email.slug + '/')) {
    const html = await readFile(new URL(`../dist/newsletter/${slug}index.html`, import.meta.url), 'utf8');
    assert.match(html, /noindex, nofollow, noarchive/);
    assert.doesNotMatch(html, /api\/subscribe/);
    if (!enabled) assert.doesNotMatch(html, /<form\b|data-newsletter-signup|type="email"/);
    if (enabled) {
      assert.match(html, /data-newsletter-signup/);
      assert.ok(html.includes(`action="${formUrl}"`), 'Signup must post only to the configured public Brevo form');
      assert.match(html, /method="POST"/);
      assert.match(html, /type="email" id="EMAIL" name="EMAIL"[^>]*required/);
      assert.match(html, /type="checkbox"[^>]*value="1"[^>]*name="OPT_IN" required/);
      assert.match(html, /name="email_address_check"/);
      assert.match(html, /sibforms\.com\/forms\/end-form\/build\/main\.js/);
      const privacy = await readFile(new URL('../dist/privacy/index.html', import.meta.url), 'utf8');
      assert.match(privacy, /directly to Brevo/);
      assert.doesNotMatch(privacy, /Newsletter subscriptions are not open/);
    }
    if (slug) assert.match(html, /Pending editorial and attorney review/);
    for (const match of html.matchAll(/href="(\/newsletter[^"#]*)/g)) {
      const target = match[1].replace(/\/$/, '');
      await readFile(new URL(`../dist${target}/index.html`, import.meta.url));
    }
  }
});
