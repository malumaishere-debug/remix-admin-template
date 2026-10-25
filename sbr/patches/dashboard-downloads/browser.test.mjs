// Browser test for the dashboard download patch (Supabase is faked).
// Run: node sbr/patches/dashboard-downloads/browser.test.mjs
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

// Playwright is pre-installed globally in the work container; require() finds it from any folder.
const { chromium } = createRequire(import.meta.url)('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const block = readFileSync(join(here, 'NEW_downloads_block.js'), 'utf8');
const render = readFileSync(join(here, 'NEW_renderDownloads.js'), 'utf8');

assert.ok(!/mega\.nz|https?:\/\//.test(block + render), 'patch must not contain any file URL');

const page_html = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="dl-grid"></div>
<script>
window.__calls = [];
window.__mode = 'ok';
window.sbr_db = { functions: { invoke: async (name, opts) => {
  window.__calls.push({ name, resource: opts.body.resource });
  if (window.__mode === 'deny') return { data: null, error: new Error('403') };
  return { data: { url: 'https://files.test/signed/' + opts.body.resource }, error: null };
} } };
window.__alerts = [];
window.alert = (m) => window.__alerts.push(m);
</script>
<script>${block}\n${render}</script></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
let navigatedTo = null;
await page.route('https://app.test/', (r) => r.fulfill({ contentType: 'text/html', body: page_html }));
await page.route('https://files.test/**', (r) => { navigatedTo = r.request().url(); r.fulfill({ body: 'pdf' }); });
await page.goto('https://app.test/');

// Essential user (rank 1): Codex + AFIS locked with the correct plan name, Post-Fraud open.
await page.evaluate(() => renderDownloads({}, 1));
const locks = await page.$$eval('.dl-lock', (els) => els.map((e) => e.textContent));
assert.deepEqual(locks, ['🔒 Necesită plan Professional', '🔒 Necesită plan Professional']);
assert.deepEqual(await page.$$eval('[data-dl]', (els) => els.map((e) => e.dataset.dl)), ['postfraud']);

// Denied by server -> friendly alert, no navigation, button label restored.
await page.evaluate(() => { window.__mode = 'deny'; });
await page.click('[data-dl="postfraud"]');
await page.waitForFunction(() => window.__alerts.length === 1);
assert.equal(navigatedTo, null);
assert.match(await page.textContent('[data-dl="postfraud"]'), /Descarcă/);

// Professional user (rank 2): all three buttons; click asks the server, then follows the signed link.
await page.evaluate(() => { window.__mode = 'ok'; renderDownloads({}, 2); });
assert.deepEqual(await page.$$eval('[data-dl]', (els) => els.map((e) => e.dataset.dl)), ['codex', 'afis', 'postfraud']);
await Promise.all([page.waitForURL('https://files.test/signed/codex'), page.click('[data-dl="codex"]')]);
assert.equal(navigatedTo, 'https://files.test/signed/codex');

await browser.close();
console.log('dashboard download patch: all browser checks passed');
