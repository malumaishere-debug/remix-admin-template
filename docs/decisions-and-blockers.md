# Decizii și blocaje

## Blocaje (ce lipsește ca să pot lucra singur)

| ID | Ce lipsește | De ce contează | Ce trebuie să faci |
|---|---|---|---|
| B1 | Publicarea pe Hostinger e manuală | Am o copie publică a codului (`site-snapshot/`), dar fără fișierele de pe server, iar publicarea o faci tu | 1) Îmi trimiți arhiva originală din Hostinger (File Manager → `public_html` → Compress → Download), ca s-o compar cu copia. 2) Mai târziu conectăm Hostinger → Git Deploy, cu ghid pas cu pas. |
| B2 | Nu știu cum se activează planul după plată | Risc de clienți plătitori fără acces | Îmi spui cum se întâmplă acum (manual? un flux n8n? altceva?) |
| B3 | Acces la date: Stripe și GA4 (ghid complet: `ghid-acces-date.md`; variabile: `STRIPE_READ_KEY`, `GA4_PROPERTY_ID`, `GA4_SA_KEY_JSON`) | Fără ele nu pot măsura venitul și conversia | Nu pot să-mi dau singur acces: ambele cer autentificarea ta. Stripe: creezi o cheie restricționată, doar citire, și o salvezi în setările mediului Claude (meniul mediului din bara de titlu a sesiunii → Edit → Network secrets / API credentials sau variabilă de mediu) cu numele `STRIPE_READ_KEY`; o sesiune nouă o preia. Niciodată în chat. GA4: nu există încă o conexiune Claude pentru GA4; varianta practică e un export programat sau un flux n8n care citește GA4 și salvează rezultatele. |
| B6 | Date despre trafic | Fără trafic real nu știm dacă problema e lipsa vizitatorilor sau blocajul înregistrării | Cloudflare → My Profile → API Tokens → Create Token → șablonul „Read analytics and logs” → zona `sbr.systems`. Apoi îl adaugi în n8n la Credentials, de tip Header Auth: nume `Authorization`, valoare `Bearer <token>`, numele credențialului `SBR Cloudflare analytics`. |
| B4 | Acces Google Search Console | Măsurarea SEO | Adaugi utilizator cu permisiune „Restricted” |
| B5 | Conectorul n8n eșuează la pornirea sesiunii (eroare 404 a serverului MCP) | Nu pot inspecta fluxurile existente | Eu nu-l pot reconecta din sesiune. Din claude.ai → Settings → Connectors: n8n → Disconnect → Connect, apoi pornești o sesiune nouă. |

## Decizii care îți cer aprobarea

| ID | Decizie | Recomandarea mea |
|---|---|---|
| D1 | Premium include Signals pe viață, deși Signals costă 49 RON/lună | Pentru clienții **noi**: Premium include 12 luni de Signals, apoi reînnoire opțională. Clienții existenți își păstrează ce au cumpărat. Termenii se actualizează înainte. |
| D2 | Programarea verificării zilnice | Da: zilnic la 07:41, ora României. Folosește din limita contului tău Claude. |
| D3 | Recuperarea plăților abandonate prin e-mail | Doar cu consimțământ explicit, colectat de Stripe la plată. |

## Jurnal de decizii

| Data | Decizie | Cine |
|---|---|---|
| 2026-10-25 | Am construit remedierea R1 ca funcție Supabase separată, fără să modific tabelele existente (risc minim, ușor de anulat) | Claude |
| 2026-10-25 | Post-Fraud PDF rămâne disponibil pentru orice cont logat, ca acum. Dacă vrei să ceară Essential, se schimbă un singur număr (`minRank`) în funcție | Claude; de confirmat de tine |
| 2026-10-25 | Copia codului s-a făcut doar prin citire de pe site-ul public; nimic nu a fost modificat pe site sau pe Hostinger | Claude |
| 2026-10-25 | Am activat în n8n fluxul `SBR Daily Metrics (read-only)` (doar citire, doar totaluri). Se oprește din n8n → Workflows → Deactivate | Claude |
| 2026-10-25 | Nu am creat cont de test și nu am încercat să modific date în Supabase-ul de producție; am verificat doar că datele nu se pot citi anonim | Claude |

## De verificat de tine în Supabase (2 minute)

Un utilizator logat **nu trebuie** să-și poată schimba singur `plan` din `profiles`. Mergi în Supabase → **SQL Editor**, rulezi interogarea de mai jos și îmi trimiți rezultatul:

```sql
select policyname, cmd, qual, with_check
from pg_policies where tablename = 'profiles';
```

Dacă apare o regulă `UPDATE` care permite utilizatorului să-și modifice propriul rând fără restricție pe coloana `plan`, oricine își poate da singur Premium. Repar asta în sesiunea următoare.
