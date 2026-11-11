import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('local trial build clearly labels test email and isolates both forms', async () => {
  const html = await readFile(new URL('../dist/newsletter/index.html', import.meta.url), 'utf8');
  assert.match(html, /Local newsletter trial/);
  assert.match(html, /\[TEST\]/);
  assert.equal([...html.matchAll(/data-email-signup="(?:newsletter|series)"/g)].length, 2);
  assert.match(html, /sibforms\.com\/serve\//);
  assert.doesNotMatch(html, /\/api\/subscribe/);
});
