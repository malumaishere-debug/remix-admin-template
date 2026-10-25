# Registrul automatizărilor

| Nume | Ce face | Unde rulează | Declanșare | Stare | Teste | Alertă la eșec |
|---|---|---|---|---|---|---|
| `paid-download` | Verifică planul pe server și dă un link de descărcare valabil 2 minute pentru PDF-urile plătite | Supabase Edge Function | clic pe „Descarcă” în dashboard | **construit, nepublicat** | 12 teste Deno + 1 test în browser, toate trec | răspuns 503 + mesaj către client; erorile apar în Supabase → Edge Functions → Logs |
| `daily-check` | Verifică paginile, linkurile Stripe, scurgerile de fișiere și SEO | `node sbr/ops/daily-check.mjs` | manual; zilnic după aprobare (D2) | **construit, rulat manual o dată** (2026-10-25: 85 pagini OK, 7 linkuri Stripe OK, 1 problemă critică = MEGA) | rulare reală pe site | ieșire cu cod 1 dacă există probleme critice |
| n8n `webhook/sbr-ai` | Analiza SBR AI (mod demonstrativ) | n8n Cloud `structurabrevisrector` | formular pe `sbr-ai.html` | existent, neinspectat | necunoscut | necunoscut |
| n8n `webhook/sbr-save` | Salvează rezultate (SBR AI / Verified) | n8n Cloud | formular | existent, neinspectat | necunoscut | necunoscut |
| GA4 + `js/risk/analytics.js` | Evenimente: `tool_view`, `scan_*`, `upgrade_cta_clicked`, `pricing_viewed`, `checkout_started`, `purchase_completed` | browser | navigare | existent; acoperire parțială (vezi R3) | n/a | n/a |
| Activare plan după plată | Setează `profiles.plan` după plată | **necunoscut** | plată Stripe | de verificat (B2) | — | — |

## Reguli pentru orice automatizare nouă

- Jurnal pentru fiecare rulare, reîncercări limitate și protecție la duplicate (pentru Stripe: ID-ul evenimentului salvat o singură dată).
- Cercetarea și generarea de conținut sunt separate de verificare și publicare. Nimic nu se publică automat ca fapt verificat.
- Cheile secrete stau doar în setările serviciului (Supabase Secrets, n8n Credentials), niciodată în cod sau în pagini.
