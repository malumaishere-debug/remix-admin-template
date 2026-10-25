#!/usr/bin/env node
// SBR daily health check — read-only. Uses only public pages; needs no secrets.
// Run:  node sbr/ops/daily-check.mjs [--out report.md]
// Exit code 1 when a revenue-critical check fails (so a scheduler can alert).

import { writeFileSync } from 'node:fs';

const SITE = 'https://sbr.systems';
const CONCURRENCY = 6;
const TIMEOUT_MS = 20000;

// Pages on the path to a purchase. A failure here can cost sales directly.
const CRITICAL_PAGES = ['/', '/personal.html', '/business.html', '/signals.html', '/login.html', '/register.html', '/dashboard.html', '/verificare-link.html', '/verificare-iban.html', '/verificare-media.html'];

// Paid files must never be linked from public pages.
const LEAK_PATTERNS = [/mega\.nz\/(file|folder)\//i, /drive\.google\.com\/file\//i, /dropbox\.com\/s\//i];

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const started = Date.now();
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'SBR-daily-check/1.0' } });
    const body = await res.text();
    return { url, status: res.status, ms: Date.now() - started, body };
  } catch (e) {
    return { url, status: 0, ms: Date.now() - started, body: '', error: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

// One retry after 3 s: Cloudflare can briefly answer 403/429 to many quick requests.
async function getWithRetry(url) {
  const first = await get(url);
  if (first.status === 200) return first;
  await new Promise((r) => setTimeout(r, 3000));
  return get(url);
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

const isSoft404 = (body) => /<title>\s*404\b/i.test(body);
const title = (b) => (b.match(/<title[^>]*>([^<]*)/i) || [])[1]?.trim() || '';
const has = (b, re) => re.test(b);

export async function run() {
  const findings = []; // {level: 'critical'|'warning', text}
  const sm = await get(`${SITE}/sitemap.xml`);
  if (sm.status !== 200) findings.push({ level: 'critical', text: `sitemap.xml returned ${sm.status}` });
  const urls = [...sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const all = [...new Set([...urls, ...CRITICAL_PAGES.map((p) => SITE + p)])];

  const pages = await pool(all, getWithRetry);
  const stripe = new Set();
  const seo = [];
  for (const p of pages) {
    const path = p.url.replace(SITE, '') || '/';
    const critical = CRITICAL_PAGES.includes(path);
    if (p.status !== 200 || isSoft404(p.body)) {
      findings.push({ level: critical ? 'critical' : 'warning', text: `${path} → ${p.status || p.error}${isSoft404(p.body) ? ' (404 page)' : ''}` });
      continue;
    }
    for (const re of LEAK_PATTERNS) if (re.test(p.body)) findings.push({ level: 'critical', text: `${path} contains a public file-sharing link (${re.source}) — paid content may be leaking` });
    for (const m of p.body.matchAll(/https:\/\/buy\.stripe\.com\/[A-Za-z0-9_]+/g)) stripe.add(m[0]);
    if (p.ms > 5000) findings.push({ level: 'warning', text: `${path} slow: ${p.ms} ms` });
    const miss = [];
    if (!title(p.body)) miss.push('title');
    if (!has(p.body, /<meta[^>]+name=["']description["']/i)) miss.push('description');
    if (!has(p.body, /rel=["']canonical["']/i)) miss.push('canonical');
    if ((p.body.match(/<h1[\s>]/gi) || []).length !== 1) miss.push('single h1');
    if (miss.length) seo.push(`${path}: ${miss.join(', ')}`);
  }

  // Share images and stylesheets: the server answers 200 with its 404 page for missing files, so check the body.
  const assets = new Set();
  for (const p of pages) {
    if (p.status !== 200) continue;
    for (const m of p.body.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi)) assets.add(new URL(m[1], p.url).href);
    for (const m of p.body.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)) assets.add(new URL(m[1], p.url).href);
  }
  const ownAssets = [...assets].filter((u) => u.startsWith(SITE + '/'));
  const assetResults = await pool(ownAssets, getWithRetry);
  for (const a of assetResults) {
    if (a.status !== 200 || /^\s*<!doctype html/i.test(a.body.slice(0, 50))) {
      const users = pages.filter((p) => p.body.includes(a.url.replace(SITE + '/', ''))).length;
      findings.push({ level: 'warning', text: `missing file ${a.url.replace(SITE, '')} (used by ~${users} pages; server returns its 404 page)` });
    }
  }

  const stripeResults = await pool([...stripe], getWithRetry);
  for (const s of stripeResults) if (s.status !== 200) findings.push({ level: 'critical', text: `Stripe link ${s.url} → ${s.status || s.error}` });

  const ok = pages.filter((p) => p.status === 200 && !isSoft404(p.body)).length;
  const critical = findings.filter((f) => f.level === 'critical');
  const warnings = findings.filter((f) => f.level === 'warning');
  const now = new Date().toISOString();

  const md = [
    `# SBR daily health check — ${now.slice(0, 10)}`,
    '',
    `Generated ${now}. Source: public website only. **Revenue and analytics were not measured** (no Stripe/GA4 access in this check).`,
    '',
    `- Pages checked: ${pages.length} (${ok} OK)`,
    `- Share images and stylesheets checked: ${ownAssets.length}`,
    `- Stripe payment links found: ${stripe.size} (${stripeResults.filter((s) => s.status === 200).length} reachable)`,
    `- Critical problems: ${critical.length}`,
    `- Warnings: ${warnings.length}`,
    `- Pages with SEO gaps: ${seo.length}`,
    '',
    '## Critical', ...(critical.length ? critical.map((f) => `- ${f.text}`) : ['- none']),
    '', '## Warnings', ...(warnings.length ? warnings.map((f) => `- ${f.text}`) : ['- none']),
    '', '## SEO gaps (missing items)', ...(seo.length ? seo.map((s) => `- ${s}`) : ['- none']),
    '',
  ].join('\n');

  return { md, criticalCount: critical.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { md, criticalCount } = await run();
  const outIdx = process.argv.indexOf('--out');
  if (outIdx > -1 && process.argv[outIdx + 1]) writeFileSync(process.argv[outIdx + 1], md);
  process.stdout.write(md);
  process.exitCode = criticalCount ? 1 : 0;
}
