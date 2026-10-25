# SBR Systems: operations code

The live site (https://sbr.systems) is static HTML hosted on Hostinger and is **not** in this repository. This folder holds tested code and patches for it. The rest of this repository is the unrelated Netlify Remix admin template.

| Path | What it is |
|---|---|
| `supabase/functions/paid-download/` | Edge Function: server-side plan check + 2-minute signed download links for paid PDFs |
| `patches/dashboard-downloads/` | Replacement snippets for `dashboard.html` (removes public MEGA links) + browser test |
| `ops/daily-check.mjs` | Read-only daily health check of the public site |
| `ops/mirror_site.py` | Read-only snapshot of the public site into `../site-snapshot/` |

Owner deploy guide: `../docs/ghid-remediere-descarcari.md`. Business docs: `../docs/`.

## Tests

```bash
# Edge Function (needs Deno 2)
cd sbr/supabase/functions/paid-download && SBR_TEST=1 deno test --allow-env && deno check index.ts

# Dashboard patch in a real browser (needs Playwright + Chromium)
node sbr/patches/dashboard-downloads/browser.test.mjs

# Daily check against the live site (exit 1 = critical problem found)
node sbr/ops/daily-check.mjs --out report.md

# Public snapshot of the live site (read-only GET requests, Cloudflare changes reversed)
python3 sbr/ops/mirror_site.py site-snapshot
```
