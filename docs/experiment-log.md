# Jurnal de experimente

Niciun experiment nu a rulat încă: nu există date de conversie măsurabile (vezi R3). Cu ~200 vizitatori/zi (cifră neverificată), un test A/B pe o pagină de preț are nevoie probabil de câteva săptămâni pentru un rezultat util. Nu vom declara un câștigător fără date suficiente.

## Format

| ID | Ipoteză | Schimbare (una singură) | Pagină | Bază de comparație | Metrică | Perioadă minimă | Rezultat | Decizie |
|---|---|---|---|---|---|---|---|---|

## Propuse (pornesc după R3)

| ID | Ipoteză | Schimbare | Metrică |
|---|---|---|---|
| E1 | Textul „Plăți automate în curând” lângă butoane de plată funcționale reduce încrederea | Eliminăm textul de pe `personal.html` | `checkout_started` / vizualizări `personal.html` |
| E2 | Un pas următor relevant după un IBAN sau link suspect crește interesul pentru planuri | Recomandare contextuală pe pagina de rezultat | `upgrade_cta_clicked` / `scan_completed` |
| E3 | Afișarea prețului ca „echivalent pe lună” pentru Signals clarifică diferența față de Premium | Text nou pe `signals.html` | `checkout_started` (signals) |
