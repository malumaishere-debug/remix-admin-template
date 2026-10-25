/* IBAN Checker page. Everything runs in this browser: the IBAN is never sent to any server, never logged, never put in the URL or in analytics. */
(function () {
  'use strict';
  var h = RK.h, t = RK.t;
  var form = document.getElementById('iban-form'), input = document.getElementById('iban-input'), out = document.getElementById('iban-result');
  var last = null;
  var CHECK_LABEL = {
    charset: { ro: 'Doar litere și cifre', en: 'Only letters and digits' },
    prefix: { ro: 'Începe cu 2 litere (țara) și 2 cifre (control)', en: 'Starts with 2 letters (country) and 2 check digits' },
    country: { ro: 'Țara are format IBAN cunoscut', en: 'Country has a known IBAN format' },
    length: { ro: 'Lungimea corespunde țării', en: 'Length matches the country' },
    structure: { ro: 'Structura contului respectă formatul național', en: 'Account structure follows the national format' },
    checkdigits_range: { ro: 'Cifrele de control sunt în interval', en: 'Check digits are in range' },
    mod97: { ro: 'Cifrele de control se potrivesc (MOD 97)', en: 'Check digits match (MOD 97)' }
  };
  var NEXT = [
    { ro: 'Confirmă beneficiarul printr-un canal pe care îl controlezi tu: sună la un număr luat dintr-o sursă oficială, nu din mesajul care conține IBAN-ul.', en: 'Confirm the beneficiary through a channel you control: call a number taken from an official source, not from the message that contains the IBAN.' },
    { ro: 'Dacă IBAN-ul a venit pe neașteptate, sub presiune de timp sau cu „schimbare de cont”, tratează cererea ca suspectă până o confirmi.', en: 'If the IBAN arrived unexpectedly, under time pressure or as an "account change", treat the request as suspect until you confirm it.' },
    { ro: 'Dacă ai plătit deja, anunță banca imediat; primele ore contează.', en: 'If you already paid, tell your bank immediately; the first hours matter.' }
  ];

  function verdictClass(r) { return r.valid ? 'rk-verdict--neutral' : 'rk-verdict--bad'; }

  function render(r) {
    RK.clear(out);
    var v = h('section', { class: 'rk-verdict ' + verdictClass(r), 'aria-live': 'polite' }, [
      RK.chip(r.valid ? 'ok' : 'bad', r.valid ? t({ ro: 'Valid tehnic', en: 'Technically valid' }) : t({ ro: 'Nevalid', en: 'Not valid' })),
      h('h2', { text: t(r.summary) })
    ]);
    if (r.formatted) v.appendChild(h('p', { class: 'rk-mono', text: r.formatted }));
    out.appendChild(v);

    var checks = (r.checks || []).slice();
    if (checks.length) {
      var ul = h('ul', { class: 'rk-list' });
      checks.forEach(function (c) {
        var lab = CHECK_LABEL[c.id] ? t(CHECK_LABEL[c.id]) : c.id;
        if (c.id === 'length' && c.detail && c.detail.expected) lab += ' (' + (c.detail.actual ? c.detail.actual + ' / ' : '') + c.detail.expected + ')';
        ul.appendChild(h('li', {}, [RK.chip(c.passed ? 'ok' : 'bad', c.passed ? t({ ro: 'trece', en: 'pass' }) : t({ ro: 'nu trece', en: 'fail' })), h('span', { text: lab })]));
      });
      var cols = h('div', { class: 'rk-cols' }, [h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Ce am verificat', en: 'What was checked' }) }), ul])]);
      if (r.country && r.country.code) {
        var dl = h('dl', { class: 'rk-dl' }, [
          h('dt', { text: t({ ro: 'Țară', en: 'Country' }) }), h('dd', { text: RK.region(r.country.code) + ' (' + r.country.code + ')' }),
          h('dt', { text: t({ ro: 'Zona SEPA', en: 'SEPA area' }) }), h('dd', { text: r.country.sepa ? t({ ro: 'Da', en: 'Yes' }) : t({ ro: 'Nu / necunoscut', en: 'No / unknown' }) })
        ]);
        if (r.bank && r.bank.identifier) {
          dl.appendChild(h('dt', { text: t({ ro: 'Cod bancă din IBAN', en: 'Bank code in the IBAN' }) }));
          dl.appendChild(h('dd', { class: 'rk-mono', text: r.bank.identifier }));
          dl.appendChild(h('dt', { text: t({ ro: 'Nume bancă', en: 'Bank name' }) }));
          dl.appendChild(h('dd', { text: t({ ro: 'Nu este afișat: nu folosim un set de date verificat și actual pentru această țară.', en: 'Not shown: we do not use a verified, current dataset for this country.' }) }));
        }
        cols.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Detalii', en: 'Details' }) }), dl]));
      }
      out.appendChild(cols);
    }
    out.appendChild(h('div', { class: 'rk-notice' }, [h('strong', { text: t({ ro: 'Ce NU înseamnă acest rezultat. ', en: 'What this result does NOT mean. ' }) })].concat((r.limitations || []).map(function (l) { return h('span', { text: t(l) + ' ' }); }))));
    var nx = h('ol', { class: 'rk-steps-nxt' }, NEXT.map(function (n) { return h('li', { text: t(n) }); }));
    out.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Următorii pași', en: 'Next steps' }) }), nx,
      h('p', { class: 'rk-small rk-muted' }, [t({ ro: 'Fraudele cu schimbarea contului de plată sunt descrise în ', en: 'Payment-redirection frauds are described in ' }),
        h('a', { href: 'codex-bec.html', class: 'rk-link', 'data-upgrade-cta': 'iban_codex_bec', 'data-placement': 'iban_result', text: 'Codex' }), ' · ',
        h('a', { href: 'postfraud.html', class: 'rk-link', 'data-upgrade-cta': 'iban_postfraud', 'data-placement': 'iban_result', text: t({ ro: 'Am fost înșelat: protocol de 72 de ore', en: 'I was scammed: 72-hour protocol' }) })])]));
    RK.reveal(out);
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var T = window.SBRRiskTrack;
    if (!input.value.trim()) { render(SBRRisk.iban.validateIban('')); return; }
    T && T.track('scan_started', { tool: 'iban' });
    var r;
    try { r = SBRRisk.iban.validateIban(input.value); } catch (e) { T && T.track('scan_failed', { tool: 'iban', reason: 'exception' }); out.hidden = false; RK.clear(out); out.appendChild(h('div', { class: 'rk-verdict rk-verdict--neutral' }, [h('h2', { text: t({ ro: 'Verificarea nu a putut rula.', en: 'The check could not run.' }) })])); return; }
    last = r; render(r);
    T && T.track(r.valid ? 'scan_completed' : 'scan_completed', { tool: 'iban', result: r.valid ? 'valid_technical' : String(r.status).replace(/[^a-z_]/g, '') });
  });
  RK.onLang(function () { if (last) render(last); });
  document.querySelectorAll('[data-example]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-example'); input.focus(); }); });
  window.SBRRiskTrack && window.SBRRiskTrack.track('tool_view', { tool: 'iban' });
  var pre = RK.takePrefill && RK.takePrefill('iban');
  if (pre) { input.value = pre; if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }
})();
