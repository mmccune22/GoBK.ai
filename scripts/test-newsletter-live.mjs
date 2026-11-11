import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { newsletterProductionConfig } from './newsletter-production-config.mjs';
import { newsletterBuildEnv } from './newsletter-build-config.mjs';
import { newsletterEmails } from '../src/lib/newsletter.mjs';
import { signupFormConfig } from '../src/lib/signup-forms.mjs';

const readPage = (path) => readFile(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');
const decode = (value) => value.replace(/&quot;/g, '"').replace(/&#(?:39|x27);/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('live artifact contains separate provider forms with explicit consent and genuine provider results', async () => {
  assert.equal(newsletterProductionConfig.approved, true);
  assert.equal(newsletterProductionConfig.providerReady, true, 'Complete provider checks before testing the live artifact.');
  const env = newsletterBuildEnv({}, { live: true });
  const html = await readPage('newsletter');
  // srcdoc legitimately contains angle brackets inside a quoted attribute.
  const frames = [...html.matchAll(/<iframe\b(?:[^"'>]|"[^"]*"|'[^']*')*>/g)]
    .map(([tag]) => [tag, tag.match(/data-email-signup="(newsletter|series)"/)?.[1]])
    .filter(([, kind]) => kind);
  assert.equal(frames.length, 2);
  assert.deepEqual(frames.map((match) => match[1]).sort(), ['newsletter', 'series']);
  const destinations = [];
  for (const [tag, kind] of frames) {
    const srcdoc = tag.match(/\bsrcdoc="([^"]*)"/)?.[1];
    assert.ok(srcdoc, `${kind} needs an embedded provider document`);
    const document = decode(srcdoc);
    const { formUrl, enabled } = signupFormConfig(kind, env);
    assert.equal(enabled, true);
    destinations.push(formUrl);
    assert.ok(document.includes(`action="${formUrl}"`));
    assert.equal([...document.matchAll(/<input\b[^>]*type="email"/g)].length, 1);
    assert.match(document, /type="checkbox"[^>]*name="OPT_IN" required/);
    assert.doesNotMatch(document, /type="checkbox"[^>]*\bchecked/);
    assert.match(document, /id="error-message" role="alert"/);
    assert.match(document, /id="success-message" role="status"/);
    assert.match(document, /Confirm your email to begin/);
  }
  assert.notEqual(...destinations);
  assert.match(html, /href="\/newsletter\/where-to-start\/"/);
  assert.doesNotMatch(html, /\[TEST\]|Local newsletter trial|Subscriptions are not open|\/api\/subscribe/);
});

test('live issue destinations exist without test labels or review-pending notices', async () => {
  for (const { slug, nextSlug } of newsletterEmails) {
    const html = await readPage(`newsletter/${slug}`);
    assert.match(html, /Reading this issue does not subscribe you/);
    assert.doesNotMatch(html, /\[TEST\]|Local delivery trial|Pending editorial|awaiting.*review|Issue draft/i);
    if (nextSlug) {
      assert.ok(html.includes(`href="/newsletter/${nextSlug}"`));
      await readPage(`newsletter/${nextSlug}`);
    }
  }
});
