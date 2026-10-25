# Ciclul zilnic de operare

**Stare: proiectat, NU programat.** Scriptul de verificare există și a rulat cu succes manual pe 2026-10-25. Nu rulează automat până nu aprobi programarea (decizia D2).

## Ce face fiecare rulare

| Pas | Ce face | Unealtă | Necesită |
|---|---|---|---|
| 1. Sănătatea site-ului | Toate paginile din sitemap + paginile de cumpărare răspund? Pagini 404 deghizate? Pagini lente (> 5 s)? | `node sbr/ops/daily-check.mjs` | nimic (date publice) |
| 2. Linkuri de plată | Toate linkurile `buy.stripe.com` găsite pe site răspund | același script | nimic |
| 3. Scurgeri de conținut plătit | Caută linkuri MEGA, Drive sau Dropbox în paginile publice | același script | nimic |
| 4. SEO | Titlu, descriere, `canonical`, un singur `h1` | același script | nimic |
| 5. Venituri | Plăți reușite, rambursări, contestații, abonamente noi sau anulate, plăți eșuate | Stripe API (doar citire) | cheie Stripe restricționată, doar citire (B3) |
| 6. Conversii | Vizitatori → instrument gratuit → `checkout_started` → `purchase_completed` | GA4 Data API | acces GA4 (B3) |
| 7. Raport | Raportul zilnic (mai jos), salvat ca `reports/AAAA-LL-ZZ.md` | commit în acest repository | nimic |

Pașii 1–4 și 7 funcționează **acum**. Pașii 5–6 sunt blocați până primesc acces.

## Formatul raportului zilnic

1. Ce am verificat.
2. Ce am implementat.
3. Ce am testat.
4. Ce s-a schimbat pe site (dacă s-a schimbat ceva).
5. Venit și conversii **măsurate** (sau „nemăsurat”, cu motivul).
6. Blocaje.
7. Erori și riscuri găsite.
8. Primele trei acțiuni următoare.
9. Decizii care îți cer aprobarea.

Rezultatele măsurate sunt separate întotdeauna de estimări.

## Cum se programează (după aprobarea ta)

Varianta recomandată: o **sarcină programată Claude Code** care pornește zilnic la 07:41 (ora României) o sesiune nouă pe acest repository. Sesiunea rulează scriptul, scrie raportul, face commit pe branch și îți trimite rezumatul. Cost: folosește din limita contului tău Claude, nimic în plus.

Alternativă fără Claude: un flux n8n (ai deja n8n Cloud) cu un nod Schedule care apelează paginile și trimite e-mail. Acoperă însă doar verificările simple.
