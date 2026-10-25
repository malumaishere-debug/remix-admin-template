# Ghid: acces la datele Stripe și Google Analytics

Scop: să pot citi vânzările (Stripe) și traficul (GA4) în fiecare sesiune, **doar pentru citire**, fără să-mi dai parole și fără să lipești chei în chat.

Cheile se pun în **setările mediului Claude**. Doar sesiunile Claude le pot citi; nu apar în cod, pe GitHub sau în chat. O cheie adăugată acum e preluată doar de o **sesiune nouă**.

---

## Partea 1: Stripe (10 minute)

### 1.1 Verifici ce cheie ai

- Cheia trebuie să înceapă cu **`rk_live_`** (cheie restricționată). Este cea corectă.
- Dacă începe cu **`sk_live_`**, este cheia secretă completă: poate face rambursări, plăți sau ștergeri. **Nu o folosi.** Creează una restricționată (1.2).

### 1.2 Creezi o cheie restricționată, doar citire (dacă nu ai deja una)

1. Intră pe https://dashboard.stripe.com și verifică să fii în modul **Live** (comutatorul „Test mode” oprit).
2. Click **Developers** (dreapta-sus) → **API keys**.
3. Click **Create restricted key**. Dacă Stripe te întreabă pentru ce o folosești, alege „Providing this key to another website” sau „Building your own integration”.
4. Nume: `Claude read-only`.
5. Lasă toate permisiunile pe **None**, apoi pune **Read** doar la:
   - Charges (and Refunds)
   - Customers
   - Disputes
   - Invoices
   - Payment Intents
   - Prices
   - Products
   - Subscriptions
   - Checkout Sessions
   - Payment Links
   - Balance
6. Click **Create key** și copiază cheia `rk_live_…`. Stripe ți-o arată o singură dată.

### 1.3 O salvezi în mediul Claude

1. În aplicația Claude, deschide **această sesiune** (sau orice sesiune Claude Code din acest proiect).
2. Sus, în bara de titlu, apasă pe **numele mediului** (environment) → **Edit**.
3. Caută secțiunea **Network secrets** (în unele versiuni se numește **API credentials**). Dacă nu există, folosește **Environment variables**.
4. Adaugi:
   - Nume: `STRIPE_READ_KEY`
   - Valoare: cheia `rk_live_…`
5. **Save.**
6. Pornești o **sesiune nouă** pe repository-ul `remix-admin-template` și îmi scrii: „Continuă din docs/ — am pus STRIPE_READ_KEY”.

**Ce fac cu ea:** citesc plățile, rambursările, contestațiile, abonamentele Signals și venitul pe produs pentru raportul zilnic. Cu o cheie doar de citire nu pot modifica nimic.

---

## Partea 2: Google Analytics 4 (20–25 minute)

Pentru GA4 nu există un buton „dă acces lui Claude”. Varianta corectă este un **cont de serviciu Google**: un utilizator-robot care primește în GA4 doar rolul **Viewer** (vizualizare).

### 2.1 Afli ID-ul proprietății GA4

1. Intră pe https://analytics.google.com.
2. Jos-stânga: **Admin** (rotița).
3. În coloana **Property** → **Property details**.
4. Copiază **PROPERTY ID**: un număr de forma `123456789`. **Nu** este `G-9WT1GRKEGB`; acela e ID-ul de măsurare.

### 2.2 Creezi un proiect Google Cloud (gratuit)

1. Intră pe https://console.cloud.google.com cu același cont Google ca la Analytics.
2. Sus, lângă logo: **Select a project** → **New project**.
3. Nume: `sbr-analytics-reader` → **Create**. Așteaptă câteva secunde, apoi selectează proiectul.
4. Dacă îți cere card pentru „free trial”, **nu e necesar**: închide fereastra. API-ul GA4 e gratuit pentru acest volum.

### 2.3 Activezi API-ul

1. Deschide https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com
2. Verifică sus că e selectat proiectul `sbr-analytics-reader`.
3. Click **Enable**.

### 2.4 Creezi contul de serviciu

1. Meniu (☰) → **IAM & Admin** → **Service Accounts**.
2. **+ Create service account**.
3. Nume: `claude-ga4-reader` → **Create and continue**.
4. La „Grant this service account access to project” **nu alege nimic** → **Continue** → **Done**.
5. În listă apare o adresă de forma `claude-ga4-reader@sbr-analytics-reader.iam.gserviceaccount.com`. **Copiaz-o.**

### 2.5 Descarci cheia contului de serviciu

1. Click pe contul `claude-ga4-reader` → tab-ul **Keys**.
2. **Add key** → **Create new key** → **JSON** → **Create**.
3. Se descarcă un fișier `.json`. Păstrează-l privat; e echivalentul unei parole, dar poate doar să citească GA4.
   - Dacă Google afișează „Service account key creation is disabled”, organizația are o regulă care blochează cheile. Scrie-mi și îți dau varianta alternativă.

### 2.6 Îi dai acces de vizualizare în GA4

1. Înapoi în https://analytics.google.com → **Admin**.
2. Coloana **Property** → **Property access management**.
3. **+** (dreapta-sus) → **Add users**.
4. Email: adresa copiată la 2.4 (`claude-ga4-reader@…`).
5. Rol: **Viewer**. Debifează „Notify new users by email”.
6. **Add.**

### 2.7 Salvezi datele în mediul Claude

Ca la Stripe (1.3), în setările mediului adaugi două variabile:

- `GA4_PROPERTY_ID` = numărul de la 2.1.
- `GA4_SA_KEY_JSON` = **tot conținutul** fișierului `.json` de la 2.5. Îl deschizi cu Notepad (Windows) sau TextEdit (Mac), selectezi tot, copiezi și lipești.

**Save**, apoi pornești o sesiune nouă.

**Ce fac cu ele:** citesc vizitatorii, paginile, sursele de trafic și evenimentele pâlniei (`checkout_started`, `purchase_completed` etc.). Rolul Viewer nu poate modifica nimic în Analytics.

---

## Ce NU trebuie făcut

- Nu lipi cheile sau fișierul JSON în chat, pe GitHub sau în e-mail.
- Nu folosi cheia `sk_live_`.
- Nu da contului de serviciu rolul Editor sau Administrator.

## Cum retragi accesul oricând

- **Stripe:** Developers → API keys → cheia `Claude read-only` → **Roll** sau **Delete**.
- **GA4:** Admin → Property access management → elimini `claude-ga4-reader`.
