# Decizii și blocaje

## Blocaje (ce lipsește ca să pot lucra singur)

| ID | Ce lipsește | De ce contează | Ce trebuie să faci |
|---|---|---|---|
| B1 | Codul site-ului nu e în Git | Nu pot publica nimic; fiecare modificare trebuie copiată manual pe Hostinger | Creezi un repository GitHub nou (ex. `sbr-website`), urci fișierele din `public_html` și conectezi Hostinger → Git (îți dau ghid pas cu pas când decizi) |
| B2 | Nu știu cum se activează planul după plată | Risc de clienți plătitori fără acces | Îmi spui cum se întâmplă acum (manual? un flux n8n? altceva?) |
| B3 | Acces la date: Stripe (cheie restricționată, doar citire) și GA4 (rol Viewer) | Fără ele nu pot măsura venitul și conversia | Ghidurile vin când ești gata; **nu-mi trimite niciodată cheia secretă Stripe (`sk_live_…`) în chat** |
| B4 | Acces Google Search Console | Măsurarea SEO | Adaugi utilizator cu permisiune „Restricted” |
| B5 | Serverul n8n nu s-a conectat la această sesiune (eroare 404 la conectare) | Nu pot inspecta fluxurile existente | Reconectezi n8n în setările Claude (Connectors) |

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
| 2026-10-25 | Nu am creat cont de test și nu am încercat să modific date în Supabase-ul de producție; am verificat doar că datele nu se pot citi anonim | Claude |

## De verificat de tine în Supabase (2 minute)

Un utilizator logat **nu trebuie** să-și poată schimba singur `plan` din `profiles`. Mergi în Supabase → **SQL Editor**, rulezi interogarea de mai jos și îmi trimiți rezultatul:

```sql
select policyname, cmd, qual, with_check
from pg_policies where tablename = 'profiles';
```

Dacă apare o regulă `UPDATE` care permite utilizatorului să-și modifice propriul rând fără restricție pe coloana `plan`, oricine își poate da singur Premium. Repar asta în sesiunea următoare.
