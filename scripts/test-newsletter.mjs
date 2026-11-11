import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { test } from 'node:test';
import { newsletterBuildEnv } from './newsletter-build-config.mjs';
import { newsletterPreviewEnv } from './newsletter-preview-config.mjs';
import { newsletterProductionConfig } from './newsletter-production-config.mjs';
import { newsletterConfig, newsletterEmails } from '../src/lib/newsletter.mjs';
import { signupFormConfig, signupEmbedDocument } from '../src/lib/signup-forms.mjs';

test('unready manifest closes legacy flags on every branch', () => {
  for (const branch of [undefined, 'development', 'codex/jimmy-experiments']) {
    const env = newsletterBuildEnv({ ...newsletterPreviewEnv, GOBK_NEWSLETTER_LAUNCH_APPROVED: 'true', GOBK_EMAIL_PROVIDER_READY: 'true', CF_PAGES_BRANCH: branch }, { production: { ...newsletterProductionConfig, providerReady: false } });
    assert.equal(env.PUBLIC_GOBK_EMAIL_MODE, 'closed');
    assert.deepEqual(signupFormConfig('newsletter', env), { enabled: false, formUrl: '' });
    assert.deepEqual(signupFormConfig('series', env), { enabled: false, formUrl: '' });
  }
});

test('trial mode is explicit and cannot build on Cloudflare', () => {
  assert.equal(newsletterBuildEnv({}, { trial: true }).PUBLIC_GOBK_EMAIL_MODE, 'trial');
  assert.throws(() => newsletterBuildEnv({ CF_PAGES: '1' }, { trial: true }));
  assert.throws(() => newsletterBuildEnv({ CF_PAGES_BRANCH: 'development' }, { trial: true }));
});

test('ready manifest enables only the exact development branch or explicit local live verification', () => {
  const production = { ...newsletterProductionConfig, approved: true, providerReady: true };
  for (const branch of [undefined, 'main', 'codex/jimmy-experiments', 'development-other']) {
    assert.equal(newsletterBuildEnv({ CF_PAGES_BRANCH: branch, ...newsletterPreviewEnv }, { production }).PUBLIC_GOBK_EMAIL_MODE, 'closed');
  }
  assert.equal(newsletterBuildEnv({ CF_PAGES_BRANCH: 'development' }, { production }).PUBLIC_GOBK_EMAIL_MODE, 'live');
  assert.equal(newsletterBuildEnv({}, { production, live: true }).PUBLIC_GOBK_EMAIL_MODE, 'live');
  assert.throws(() => newsletterBuildEnv({ CF_PAGES_BRANCH: 'development' }, { production, live: true }));
  assert.throws(() => newsletterBuildEnv({}, { production, live: true, trial: true }));
  for (const gate of ['approved', 'providerReady']) {
    const blocked = { ...production, [gate]: false };
    assert.equal(newsletterBuildEnv({ CF_PAGES_BRANCH: 'development' }, { production: blocked }).PUBLIC_GOBK_EMAIL_MODE, 'closed');
    assert.throws(() => newsletterBuildEnv({}, { production: blocked, live: true }));
  }
});

test('production subscriptions require distinct valid destinations', () => {
  const signupEnv = { PUBLIC_GOBK_NEWSLETTER_SIGNUP_ENABLED: 'true', PUBLIC_GOBK_NEWSLETTER_FORM_URL: 'https://example.sibforms.com/serve/newsletter' };
  const production = { ...newsletterProductionConfig, approved: true, providerReady: true, signupEnv };
  const build = (forms) => newsletterBuildEnv({ CF_PAGES_BRANCH: 'development' }, { production: { ...production, signupEnv: forms } });
  const live = build(signupEnv);
  assert.equal(signupFormConfig('newsletter', live).enabled, true);
  assert.equal(signupFormConfig('series', live).enabled, false);
  assert.throws(() => build({ ...signupEnv, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true' }));
  assert.throws(() => build({ ...signupEnv, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true', PUBLIC_GOBK_SERIES_FORM_URL: signupEnv.PUBLIC_GOBK_NEWSLETTER_FORM_URL }));
  assert.throws(() => build({ ...signupEnv, PUBLIC_GOBK_SERIES_SIGNUP_ENABLED: 'true', PUBLIC_GOBK_SERIES_FORM_URL: 'https://EXAMPLE.sibforms.com/serve/newsletter/' }));
});

test('provider destinations reject credentials and foreign or unsafe URLs', () => {
  for (const url of ['javascript:alert(1)', 'http://abc.sibforms.com/serve/id', 'https://abc.sibforms.com.evil.example/serve/id', 'https://user:secret@abc.sibforms.com/serve/id', 'https://abc.sibforms.com/serve/id?token=secret']) {
    assert.throws(() => newsletterConfig({ PUBLIC_GOBK_NEWSLETTER_FORM_URL: url }));
  }
});

test('both provider forms retain independent consent and real provider result handling', async () => {
  const markup = await readFile(new URL('../src/lib/brevo-form.html', import.meta.url), 'utf8');
  const env = newsletterBuildEnv({}, { trial: true });
  const destinations = [];
  for (const kind of ['newsletter', 'series']) {
    const { formUrl } = signupFormConfig(kind, env);
    destinations.push(formUrl);
    const html = signupEmbedDocument(markup, kind, formUrl);
    assert.equal([...html.matchAll(/<input\b[^>]*type="email"/g)].length, 1);
    assert.ok(html.includes(`action="${formUrl}"`));
    assert.match(html, /type="checkbox"[^>]*name="OPT_IN" required/);
    assert.doesNotMatch(html, /type="checkbox"[^>]*\bchecked/);
    assert.match(html, /id="error-message" role="alert"/);
    assert.match(html, /id="success-message" role="status"/);
    assert.match(html, /sibforms\.com\/forms\/end-form\/build\/main\.js/);
    assert.match(html, /Confirm your email to begin/);
  }
  assert.notEqual(...destinations);
});

test('default built pages contain no signup fields, test enrollment, or fake endpoint', async () => {
  for (const { slug } of newsletterEmails) {
    await assert.rejects(access(new URL(`../dist/newsletter/${slug}/index.html`, import.meta.url)));
  }
  for (const path of ['library/', 'newsletter/']) {
    const html = await readFile(new URL(`../dist/${path}index.html`, import.meta.url), 'utf8');
    assert.doesNotMatch(html, /\/api\/subscribe|sibforms\.com\/serve\/|type="email"|data-email-signup="/);
    if (path === 'newsletter/') {
      assert.match(html, /The GoBK Guide/);
      assert.match(html, /Bankruptcy Getting Started/);
      assert.match(html, /Subscriptions are not open yet/);
    } else if (path.startsWith('newsletter/')) {
      assert.match(html, /Pending editorial and attorney review/);
    }
  }
});
