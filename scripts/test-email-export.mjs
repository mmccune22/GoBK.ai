import assert from 'node:assert/strict';
import { test } from 'node:test';
import { emailExportConfig } from './email-export-config.mjs';

test('production exports require a mailing address and keep delivery trials distinct', () => {
  for (const address of ['', ' ', '[Company mailing address]', 'configure before use']) {
    assert.throws(() => emailExportConfig({ GOBK_EMAIL_MAILING_ADDRESS: address }));
  }
  const live = emailExportConfig({ GOBK_EMAIL_MAILING_ADDRESS: '123 Example Street, Example City, CO 80000' });
  assert.equal(live.trialNote, '');
  assert.equal(live.baseUrl, 'https://gobk-ai.pages.dev');
  assert.equal(live.address, '123 Example Street, Example City, CO 80000');
  const trial = emailExportConfig({}, { trial: true });
  assert.match(trial.trialNote, /\[TEST\]/);
  assert.match(trial.address, /local trial only/);
});
