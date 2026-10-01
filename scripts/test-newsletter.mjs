import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { newsletterConfig, newsletterEmails } from '../src/lib/newsletter.mjs';

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
  }
});

test('built preview has working reading paths and cannot collect emails', async () => {
  const { enabled, formUrl } = newsletterConfig(process.env);
  for (const slug of ['', ...newsletterEmails.map((email) => email.slug + '/')]) {
    const html = await readFile(new URL(`../dist/newsletter/${slug}index.html`, import.meta.url), 'utf8');
    assert.match(html, /noindex, nofollow, noarchive/);
    assert.doesNotMatch(html, /<form\b|api\/subscribe|type="email"/);
    if (!enabled) assert.doesNotMatch(html, /data-newsletter-signup/);
    if (enabled && !slug) {
      assert.match(html, /data-newsletter-signup/);
      assert.ok(html.includes(`href="${formUrl}"`), 'Signup must use the configured public Brevo form');
      const privacy = await readFile(new URL('../dist/privacy/index.html', import.meta.url), 'utf8');
      assert.match(privacy, /Brevo processes your email address/);
      assert.doesNotMatch(privacy, /Newsletter subscriptions are not open/);
    }
    if (slug) assert.match(html, /Pending editorial and attorney review/);
    for (const match of html.matchAll(/href="(\/newsletter[^"#]*)/g)) {
      const target = match[1].replace(/\/$/, '');
      await readFile(new URL(`../dist${target}/index.html`, import.meta.url));
    }
  }
});
