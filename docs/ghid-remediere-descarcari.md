# Ghid: securizarea descărcărilor plătite (Codex, AFIS, Post-Fraud)

**Ce rezolvă:** acum, oricine deschide codul sursă al paginii `dashboard.html` (clic dreapta → „Vezi sursa paginii”) vede linkurile MEGA complete și descarcă PDF-urile fără să plătească. După acest ghid, fișierele stau într-un loc privat, iar linkul de descărcare se creează doar pentru clienții cu planul potrivit și expiră după 2 minute.

**Timp:** aproximativ 30–45 de minute. **Cost:** 0 (intră în planul gratuit Supabase).
**Ai nevoie de:** cele 3 fișiere PDF pe calculator, contul Supabase și contul Hostinger. Calculatorul e mai comod decât telefonul pentru acest ghid.

Fă pașii **în ordine**. Pasul 6 (dezactivarea linkurilor vechi) se face abia după ce testul de la pasul 5 a reușit.

---

## Pasul 0: Copie de siguranță (2 minute)

1. Intră pe https://hpanel.hostinger.com și autentifică-te.
2. Click pe **Websites** (Site-uri) → la `sbr.systems` click pe **Manage** (Administrează).
3. În meniul din stânga caută **File Manager** (Manager fișiere) și deschide-l.
4. Intră în folderul `public_html`.
5. Găsește `dashboard.html`, click dreapta → **Download** (Descarcă). Păstrează fișierul pe calculator. Dacă ceva nu merge, îl urci înapoi și totul revine exact cum era.

## Pasul 1: Creezi spațiul privat pentru fișiere în Supabase (5 minute)

1. Intră pe https://supabase.com/dashboard și deschide proiectul tău (adresa lui conține `zxonzzojynrkzaiaacte`).
2. În meniul din stânga: **Storage** (pictograma cu o cutie).
3. Click pe **New bucket**.
4. La **Name** scrie exact: `paid-products`
5. **Public bucket**: lasă comutatorul **OPRIT**. Este cel mai important detaliu din tot ghidul.
6. Click **Save** / **Create bucket**.

## Pasul 2: Urci cele 3 PDF-uri (5 minute)

Numele trebuie să fie **exact** cele de mai jos, cu litere mari și mici identice.

1. Click pe bucket-ul `paid-products`.
2. Click **Create folder** → scrie `codex` → creează. Repetă pentru `afis` și `postfraud`.
3. Pe calculator, redenumește fișierele astfel:
   - PDF-ul Codex → `SBR-Codex.pdf`
   - PDF-ul AFIS → `SBR-AFIS.pdf`
   - PDF-ul Post-Fraud → `SBR-Post-Fraud.pdf`
4. Intră în folderul `codex` → **Upload files** → alege `SBR-Codex.pdf`.
5. La fel: `afis` → `SBR-AFIS.pdf`, apoi `postfraud` → `SBR-Post-Fraud.pdf`.

La final trebuie să ai: `codex/SBR-Codex.pdf`, `afis/SBR-AFIS.pdf`, `postfraud/SBR-Post-Fraud.pdf`.

## Pasul 3: Publici funcția care verifică planul (10 minute)

1. În Supabase, meniul din stânga: **Edge Functions**.
2. Click **Deploy a new function** → alege **Via Editor**.
3. La numele funcției scrie exact: `paid-download`
4. Șterge tot codul de exemplu din editor.
5. Deschide fișierul din GitHub:
   https://github.com/malumaishere-debug/remix-admin-template/blob/claude/sbr-revenue-audit-bog1il/sbr/supabase/functions/paid-download/index.ts
   Click pe butonul **Copy raw file** (pictograma cu două pătrate, dreapta-sus deasupra codului).
6. Lipește în editorul Supabase (Ctrl+V).
7. Click **Deploy function** și așteaptă mesajul de succes.
8. Deschide funcția → tab-ul **Details** / **Settings** → găsește **Enforce JWT verification** (sau „Verify JWT”) și pune-l pe **OPRIT** → **Save**.
   *De ce:* funcția verifică singură dacă utilizatorul e logat (aceasta e partea testată). Cu opțiunea pornită, browserul poate fi blocat la verificarea preliminară (CORS) și descărcarea nu pornește.

Nu trebuie să adaugi chei sau parole: Supabase le dă automat funcției.

## Pasul 4: Modifici `dashboard.html` pe Hostinger (10 minute)

Faci **două înlocuiri** de text în același fișier.

1. Hostinger → **File Manager** → `public_html` → click dreapta pe `dashboard.html` → **Edit** (Editează).
2. Apasă **Ctrl+F** și caută: `var DOWNLOADS = {`

### Înlocuirea A

Vei găsi un bloc de 5 rânduri care începe cu `/* ─── DOWNLOADS (plan-gated) ─── */` și conține trei linkuri `mega.nz`. Selectează **tot** blocul, de la `/* ─── DOWNLOADS (plan-gated) ─── */` până la `};` inclusiv, și înlocuiește-l cu conținutul fișierului:
https://github.com/malumaishere-debug/remix-admin-template/blob/claude/sbr-revenue-audit-bog1il/sbr/patches/dashboard-downloads/NEW_downloads_block.js
(**Copy raw file** → lipești peste selecție.)

### Înlocuirea B

Caută cu Ctrl+F: `function renderDownloads`

Selectează de la rândul `/* ─── DOWNLOADS ─── */` (chiar deasupra) până la acolada `}` care închide funcția, adică rândul de dinainte de `/* ─── LOGOUT ─── */`. Înlocuiește cu conținutul fișierului:
https://github.com/malumaishere-debug/remix-admin-template/blob/claude/sbr-revenue-audit-bog1il/sbr/patches/dashboard-downloads/NEW_renderDownloads.js

3. Verificare: apasă Ctrl+F și caută `mega.nz`. Trebuie să apară **0 rezultate**.
4. Click **Save** (Salvează).
5. Dacă folosești cache Cloudflare sau Hostinger: hPanel → **Performance** → **CDN** / **Cache Manager** → **Purge all** (Golește tot).

## Pasul 5: Testul (5 minute)

Îți trebuie un cont de test (poate fi contul tău).

1. Intră pe https://sbr.systems/login.html cu contul de test.
2. Supabase → **Table Editor** → tabela `profiles` → găsește rândul contului de test → în coloana `plan` scrie `free` → Save.
3. Deschide https://sbr.systems/dashboard.html și reîncarcă pagina.
   - **Așteptat:** Codex PDF și AFIS PDF au lacăt: „Necesită plan Professional”. Post-Fraud PDF are buton.
4. Schimbă `plan` în `professional`, apoi reîncarcă dashboard-ul.
   - Click pe **Descarcă** la Codex PDF. **Așteptat:** butonul scrie „Se pregătește…”, apoi PDF-ul se descarcă.
5. Readu `plan` la valoarea inițială a contului.

Dacă la pasul 4 apare mesajul „Descărcarea nu a pornit”: Supabase → Edge Functions → `paid-download` → **Logs**. Fă o captură de ecran și trimite-mi-o.

## Pasul 6: Dezactivezi linkurile vechi MEGA (5 minute)

Linkurile vechi au putut fi copiate deja, iar ele vor funcționa până le dezactivezi.

1. Intră pe https://mega.nz.
2. Pentru fiecare dintre cele 3 fișiere: click dreapta → **Manage link** / **Gestionează linkul** → **Remove link** (Elimină linkul).
   Fișierele rămân în contul tău MEGA. Doar linkul public dispare.

## Pasul 7: Confirmare

Scrie-mi „am publicat remedierea”. Rulez verificarea automată, care confirmă că niciun link MEGA nu mai apare pe site, și trec R1 în „publicat”.

---

### Cum anulezi totul

Hostinger → File Manager → `public_html` → urci `dashboard.html` de la pasul 0 peste cel nou. Funcția și bucket-ul din Supabase pot rămâne; nu afectează nimic dacă nu sunt folosite.
