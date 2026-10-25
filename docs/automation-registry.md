# Registrul automatizărilor

| Nume | Ce face | Unde rulează | Declanșare | Stare | Teste | Alertă la eșec |
|---|---|---|---|---|---|---|
| `paid-download` | Verifică planul pe server și dă un link de descărcare valabil 2 minute pentru PDF-urile plătite | Supabase Edge Function | clic pe „Descarcă” în dashboard | **construit, nepublicat** | 12 teste Deno + 1 test în browser, toate trec | răspuns 503 + mesaj către client; erorile apar în Supabase → Edge Functions → Logs |
| `daily-check` | Verifică paginile, linkurile Stripe, scurgerile de fișiere și SEO | `node sbr/ops/daily-check.mjs` | manual; zilnic după aprobare (D2) | **construit, rulat manual** (2026-10-25: 85 pagini OK, 7 linkuri Stripe OK, 1 problemă critică = MEGA, 4 fișiere lipsă); verifică și imaginile de previzualizare și CSS-ul; o reîncercare la erori temporare | rulare reală pe site | ieșire cu cod 1 dacă există probleme critice |
| `SBR Daily Metrics (read-only)` (n8n, id `cRriItAANuHrccSf`) | Numără zilnic conturile, planurile și lead-urile din Supabase (doar totaluri) și le salvează în tabelul n8n `sbr_daily_metrics` | n8n Cloud `sbr-antifraud` | **zilnic la 07:41, ora României** | **activ**; testat manual pe 2026-10-25 (execuția #30, succes) | rulare reală | eșecurile apar în n8n → Executions |
| `mirror_site.py` | Copie publică a site-ului în `site-snapshot/` (doar citire) | `python3 sbr/ops/mirror_site.py site-snapshot` | manual | **rulat** 2026-10-25: 217 fișiere, verificat în browser | randare locală în Chromium a 8 pagini | listă în `site-snapshot/SNAPSHOT.md` |
| n8n `webhook/sbr-ai` | Analiza SBR AI (mod demonstrativ) | n8n Cloud `structurabrevisrector` | formular pe `sbr-ai.html` | existent, neinspectat | necunoscut | necunoscut |
| n8n `webhook/sbr-save` | Salvează rezultate (SBR AI / Verified) | n8n Cloud | formular | existent, neinspectat | necunoscut | necunoscut |
| GA4 + `js/risk/analytics.js` | Evenimente: `tool_view`, `scan_*`, `upgrade_cta_clicked`, `pricing_viewed`, `checkout_started`, `purchase_completed` | browser | navigare | existent; acoperire parțială (vezi R3) | n/a | n/a |
| Activare plan după plată | Setează `profiles.plan` după plată | **necunoscut** | plată Stripe | de verificat (B2) | — | — |

## Reguli pentru orice automatizare nouă

- Jurnal pentru fiecare rulare, reîncercări limitate și protecție la duplicate (pentru Stripe: ID-ul evenimentului salvat o singură dată).
- Cercetarea și generarea de conținut sunt separate de verificare și publicare. Nimic nu se publică automat ca fapt verificat.
- Cheile secrete stau doar în setările serviciului (Supabase Secrets, n8n Credentials), niciodată în cod sau în pagini.
