# SBR Systems: situația de pornire (audit)

Data auditului: 2026-10-25. Sursă: site-ul public https://sbr.systems (85 de pagini descărcate și analizate) și acest repository.
Nu am avut acces la Stripe, Google Analytics, Supabase (ca administrator), Hostinger sau n8n. Tot ce ține de vânzări și trafic **nu a fost măsurat**.

## 1. Unde se află codul

| Element | Ce am găsit |
|---|---|
| Acest repository (`remix-admin-template`) | Șablonul standard Netlify „Remix admin” (o demonstrație cu o tabelă `members`). **Nu este codul site-ului sbr.systems.** |
| Site-ul live | Fișiere HTML statice găzduite la **Hostinger** (hPanel, LiteSpeed), în spatele **Cloudflare**. Codul sursă nu e în niciun repository Git la care am acces. |
| Copie a codului (2026-10-25) | `site-snapshot/`: 217 fișiere (pagini RO și `/en/`, JS, CSS, traduceri, componenta C2PA), descărcate doar prin citire de pe site-ul public cu `sbr/ops/mirror_site.py`, cu modificările Cloudflare eliminate. Lipsesc fișierele care există doar pe server (`.htaccess`, eventual PHP, fișiere nelegate de nicăieri). **Nu se urcă peste site.** |
| Consecință | Pot citi și modifica acum codul în Git, dar publicarea pe Hostinger rămâne manuală până la conectarea Git Deploy (blocajul B1). |

## 2. Componente tehnice identificate

| Componentă | Folosire | Stare verificată |
|---|---|---|
| Supabase (`zxonzzojynrkzaiaacte`) | Conturi utilizatori, tabela `profiles` (plan, `plan_expires_at`), `leads` (scor quiz), `signals_reports_public`, funcția `has_signals_access` | Citirea anonimă a `profiles` și `leads` este blocată (401). Bine. |
| Stripe Payment Links | 7 linkuri `buy.stripe.com` | Toate 7 răspund (200). |
| Google Analytics 4 (`G-9WT1GRKEGB`) | Cu Consent Mode v2 (colectează complet doar după acordul pentru cookie-uri) | Evenimente definite în `js/risk/analytics.js`. |
| n8n Cloud | `structurabrevisrector.app.n8n.cloud/webhook/sbr-ai` și `/webhook/sbr-save`, folosite de SBR AI și SBR Verified | Nu am acces la fluxuri. |
| formsubmit.co | Formularul de contact trimite la contact@sbr.systems prin acest serviciu terț | De verificat dacă e menționat în politica de confidențialitate. |
| Memberstack | Permis în CSP, apare pe o singură pagină | Pare o rămășiță. |
| MEGA (mega.nz) | Livrarea PDF-urilor plătite | **Problemă critică**, vezi secțiunea 5. |

## 3. Produse și prețuri afișate (verificate pe site)

| Produs | Preț | Tip | Link Stripe | Observație |
|---|---|---|---|---|
| Personal Essential | 99 RON | plată unică, acces permanent | `6oUdR8…00` | |
| Personal Professional | 250 RON | plată unică, acces permanent | `aFa7sK…01` | prezentat ca produs principal |
| Personal Premium | 449 RON | plată unică, acces permanent | `14A5kC…02` | include Signals bilunar, **pe viață** |
| Business Basic | 99 EUR | plată unică | `4gM00i…03` | |
| Business Pro | 499 EUR | plată unică | `00w28q…04` | |
| Enterprise | 5.000 EUR | plată unică | `dRm8wO…05` | butonul scrie „Contact Enterprise”, dar duce direct la plată |
| SBR Signals | 49 RON/lună | abonament | `6oU9AS…06` | singurul venit recurent (MRR) |

## 4. Ce funcționează, ce e demonstrativ

| Funcție | Stare |
|---|---|
| Verificare link, IBAN, media (`verificare-*.html`) | Instrumente gratuite live, cu metodologie publică. |
| Quiz de risc (3 variante) | Live; rezultatul trimite spre un plan plătit în funcție de scor. |
| Codex (19 pagini de tipologii), Post-Fraud (7 pagini), ghiduri SEO | Conținut live. |
| Dashboard client (`dashboard.html`) | Live; afișează conținutul după planul din `profiles`. |
| SBR AI (`sbr-ai.html`) | Mod demonstrativ (nu citește PDF-uri sau imagini). |
| SBR Verified (`verified.html`) | Mod demonstrativ, cu exemplu fictiv („Exemplu SRL”) marcat ca ilustrativ. |
| Business Dashboard | Demo. |
| Activarea planului după plată | **Necunoscută.** Linkurile Stripe nu trimit identificatorul contului, iar pe site nu există o pagină de confirmare a plății. Vezi blocajul B2. |

## 5. Cele cinci probleme cu cel mai mare impact asupra veniturilor

1. **Fișierele plătite sunt publice (critic).** `dashboard.html` conține în codul sursă linkurile MEGA complete, cu cheia de decriptare, pentru Codex PDF, AFIS PDF și Post-Fraud PDF. Ascunderea butonului se face doar în browser, deci oricine deschide codul paginii poate descărca produsele de 250–449 RON fără să plătească. **Remedierea e construită și testată** (`sbr/`), dar trebuie publicată de tine (vezi `ghid-remediere-descarcari.md`).
2. **Activarea după plată nu e verificată.** Payment Links nu știu ce cont a plătit (lipsește `client_reference_id`) și nu există un webhook Stripe vizibil. Dacă activarea se face manual sau prin potrivirea e-mailului, un client care plătește cu alt e-mail decât cel al contului poate rămâne fără acces. Asta duce la rambursări și contestații.
3. **Pâlnia de vânzare nu se poate măsura.** Evenimentul `checkout_started` e trimis doar de pe homepage. `personal.html`, `business.html`, `signals.html`, `quiz.html` și `register.html` nu încarcă `analytics.js`. `purchase_completed` apare doar dacă linkurile Stripe redirecționează spre `/dashboard.html?checkout=success&plan=…`, lucru neverificat. În plus, Consent Mode reduce datele. Practic, nu știm care pagină vinde.
4. **Prețurile împiedică venitul recurent.** Premium (449 RON, o singură plată) include Signals pe viață, în timp ce Signals separat costă 49 RON/lună. Echivalentul a nouă luni de Signals cumpără Premium plus tot restul, pentru totdeauna. Signals nu poate deveni o sursă stabilă de venit lunar. **Schimbarea prețurilor cere aprobarea ta** (decizia D1).
5. **Mesaje contradictorii la cumpărare.**
   - `personal.html` scrie „Plăți automate în curând. Deocamdată — Early Access cu onboarding personal.”, chiar lângă butoane de plată Stripe funcționale.
   - Butonul „Contact Enterprise” deschide o plată de 5.000 EUR în loc de formularul de contact.
   - În dashboard, Codex și AFIS (care cer Professional) afișau „Necesită plan Essential”: un client putea cumpăra Essential și să nu primească ce credea. Corectat în patch.

## 6. SEO (verificat automat)

- `sitemap.xml` și `robots.txt` există și funcționează; toate cele 82 de URL-uri din sitemap răspund 200.
- 18 pagini au lipsuri: fără `canonical`, fără `meta description` sau cu un număr greșit de `h1`. Lista completă se generează zilnic de `sbr/ops/daily-check.mjs`.
- 12 pagini legate intern nu sunt în sitemap (`login`, `register`, `dashboard`, `sbr-ai`, `verified`, `codex-page`, `cost-optimization` etc.). Unele trebuie să rămână neindexate (dashboard, login); `sbr-ai` și `verified` sunt candidate pentru sitemap.

## 7. Probleme tehnice găsite la copierea site-ului

- **„Soft 404” pe tot serverul:** orice adresă inexistentă (pagină, CSS, JS, imagine) răspunde cu codul 200 și pagina de eroare. Google raportează asta ca „soft 404”, iar fișierele lipsă nu apar ca erori în niciun monitor obișnuit.
- **Imaginile de previzualizare lipsesc:** `og-image.jpg` (~12 pagini), `og-image.png` (~23 pagini) și `og-sbr.jpg` (~6 pagini) nu există. Linkurile distribuite pe WhatsApp, Facebook sau LinkedIn apar fără imagine, deci primesc mai puține clicuri.
- **`css/codex-interactive.css` lipsește**, deși e folosit de 19 pagini Codex. Partea interactivă a acestor pagini poate fi afișată fără stil.
- Lipsesc și `img/chat-bg.jpg` (pe `sbr-ai.html`) și o captură de ecran folosită pe `resources.html`.

## 8. Date care lipsesc

Vânzări, venit, abonamente, rambursări, trafic real (cele „~200 vizitatori/zi” nu sunt verificate), rată de conversie, listă de e-mailuri, tichete de suport. Toate necesită accesele din `decisions-and-blockers.md`.

## 9. Primele date măsurate (2026-10-25, din Supabase, prin n8n)

Sursă: fluxul n8n `SBR Daily Metrics (read-only)`, care citește doar planul, datele și eticheta quiz-ului, fără nume sau e-mailuri. **Nu am verificat încă în Stripe dacă planurile plătite corespund unor plăți reale.**

| Indicator | Valoare |
|---|---|
| Conturi în total | 15 |
| Conturi noi în ultimele 30 de zile | **0**. Ultimul cont nou: 2026-07-07 |
| Conturi cu plan plătit | 5 (1 Essential, 2 Professional, 2 Premium; niciun plan Business) |
| Lead-uri din quiz (tabela `leads`) | 1 în total, din 2026-04-11 |

**Interpretare:** dacă site-ul are cu adevărat ~200 de vizitatori pe zi, 0 înregistrări în peste 3 luni înseamnă că drumul spre cont e blocat, traficul e în mare parte boți, sau ambele. Prima prioritate este aflarea cauzei (R13).

## 10. Alte constatări (2026-10-25, după-amiază)

- Site-ul a fost actualizat azi la 14:24. Acum există imaginile de previzualizare (`og-image.*`), adresele inexistente răspund cu un 404 corect, iar `/en/*` redirecționează spre paginile RO. R11 (în afară de `codex-interactive.css`) și R12 sunt rezolvate.
- **Quiz-urile tematice `quiz-v1/v2/v3` sunt stricate:** la pasul 3 cer telefonul și un cod SMS, dar funcțiile `send-otp` și `verify-otp` nu există pe server (404). Vizitatorul primește „Eroare SMS.” și nu își vede rezultatul. Paginile au fost scoase din sitemap, dar sunt încă live și pot veni vizitatori din Google.
- `quiz.html` (quiz-ul principal) folosește `submit_lead` și funcția `send-score-email`; funcția există pe server.
- Înregistrarea cere confirmare pe e-mail (`mailer_autoconfirm: false`). Dacă Supabase folosește serverul de e-mail implicit (fără SMTP propriu), e-mailurile de confirmare pot să nu ajungă la vizitatori. **De testat** (R13).
