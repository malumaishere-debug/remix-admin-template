/* Link & Website Checker page. The link is analysed locally first (structure), then sent to the SBR risk-verify function, which asks
   reputation sources WITHOUT query/fragment/username. The server never opens the link. */
(function () {
  'use strict';
  var h = RK.h, t = RK.t;
  var form = document.getElementById('link-form'), input = document.getElementById('link-input'), out = document.getElementById('link-result'), btn = document.getElementById('link-go');
  var lastReport = null, busy = false;
  var T = function (n, p) { window.SBRRiskTrack && window.SBRRiskTrack.track(n, p); };

  var REASON_TXT = {
    empty: { ro: 'Introdu un link.', en: 'Enter a link.' },
    too_long: { ro: 'Linkul este prea lung (maximum 2048 de caractere).', en: 'The link is too long (maximum 2048 characters).' },
    invalid_characters: { ro: 'Linkul conține spații sau caractere de control. Copiază-l din nou, complet.', en: 'The link contains spaces or control characters. Copy it again, in full.' },
    unparseable: { ro: 'Textul nu poate fi interpretat ca adresă web.', en: 'The text cannot be read as a web address.' },
    unsupported_scheme: { ro: 'Sunt acceptate doar adrese http și https.', en: 'Only http and https addresses are supported.' },
    dangerous_scheme: { ro: 'Această adresă nu este un site, ci un cod care s-ar executa în browser (javascript:, data: etc.). Nu o deschide.', en: 'This address is not a site but code that would run in the browser (javascript:, data: etc.). Do not open it.' }
  };
  var STATUS_TXT = {
    malicious: { ro: 'Listat', en: 'Listed', kind: 'bad' },
    clean: { ro: 'Nelistat acum', en: 'Not listed now', kind: 'ok' },
    inconclusive: { ro: 'Neconcludent', en: 'Inconclusive', kind: 'na' },
    unavailable: { ro: 'Indisponibil', en: 'Unavailable', kind: 'warn' }
  };
  var REASON_PROV = {
    disabled: { ro: 'dezactivat', en: 'switched off' }, not_configured: { ro: 'neconfigurat', en: 'not configured' }, timeout: { ro: 'timp depășit', en: 'timed out' },
    network: { ro: 'eroare de rețea', en: 'network error' }, http_error: { ro: 'eroare la sursă', en: 'source error' }, rate_limited: { ro: 'limită de cereri', en: 'rate limited' },
    quota: { ro: 'cotă depășită', en: 'quota exceeded' }, auth: { ro: 'autentificare refuzată', en: 'authentication refused' }, bad_response: { ro: 'răspuns neașteptat', en: 'unexpected response' },
    skipped: { ro: 'nu se aplică', en: 'not applicable' }, deadline: { ro: 'limită totală de timp', en: 'overall time limit' }
  };
  var CONF = { high: { ro: 'încredere ridicată', en: 'high confidence' }, medium: { ro: 'încredere medie', en: 'medium confidence' }, low: { ro: 'încredere scăzută', en: 'low confidence' }, none: { ro: '—', en: '—' } };
  var LEVEL_CLASS = { listed: 'bad', high_risk: 'bad', suspicious: 'warn', no_signals: 'neutral', inconclusive: 'neutral', invalid_input: 'neutral' };
  var SEV = { high: 'bad', medium: 'warn', low: 'na', info: 'na' };
  var SEV_TXT = { high: { ro: 'ridicat', en: 'high' }, medium: { ro: 'mediu', en: 'medium' }, low: { ro: 'scăzut', en: 'low' }, info: { ro: 'info', en: 'info' } };

  function setBusy(on, msg) {
    busy = on; btn.disabled = on;
    if (on) { RK.clear(out); out.hidden = false; out.appendChild(h('div', { class: 'rk-verdict rk-verdict--neutral', role: 'status' }, [h('p', {}, [h('span', { class: 'rk-spinner', 'aria-hidden': 'true' }), msg])])); }
  }

  function localReport(analysis) {
    var s = SBRRisk.url.scoreLink(analysis, []);
    return { ok: true, offline: true, score: s, target: { host: analysis.parsed.host, hostUnicode: analysis.parsed.hostUnicode, registrableDomain: analysis.parsed.registrableDomain || null, isPublic: analysis.parsed.isPublic, hasQuery: analysis.parsed.hasQuery, hasFragment: analysis.parsed.hasFragment, hasUserinfo: analysis.parsed.hasUserinfo, shownWithoutParameters: analysis.providerUrl },
      analysis: { indicators: analysis.indicators, structuralScore: analysis.structuralScore, limitations: analysis.limitations }, providers: [], privacy: { sent: [], note: { ro: 'Nu s-a trimis nimic către terți.', en: 'Nothing was sent to third parties.' } } };
  }

  // Privacy: the full address never leaves the browser. The server gets scheme + host + path only; query and fragment become bare markers
  // (so the "parameters were not shared" note still applies) and a username/password becomes a placeholder that keeps the disguise indicator.
  function transportUrl(a) {
    var p = a.parsed, ui = (a.indicators || []).filter(function (i) { return i.id === 'userinfo_in_url'; })[0];
    var who = p.hasUserinfo ? ((ui && ui.evidence && ui.evidence.userinfoLooksLikeDomain) ? 'x.x@' : 'x@') : '';
    return p.scheme + '://' + who + p.host + (p.port ? ':' + p.port : '') + p.path + (p.hasQuery ? '?_' : '') + (p.hasFragment ? '#_' : '');
  }
  // IBANs and card numbers are never sent: checked here first (the server has the same guard as a second line of defence).
  function looksSensitive(raw) {
    var s = raw.replace(/[\s-]/g, '');
    if (/^[A-Za-z]{2}\d{2}[A-Za-z0-9]{11,30}$/.test(s)) return true;
    if (/^\d{13,19}$/.test(s)) { var sum = 0, dbl = false; for (var i = s.length - 1; i >= 0; i--) { var d = +s.charAt(i); if (dbl) { d *= 2; if (d > 9) d -= 9; } sum += d; dbl = !dbl; } return sum % 10 === 0; }
    return false;
  }

  async function callServer(raw) {
    var ep = RK.endpoint(), ctl = new AbortController(), timer = setTimeout(function () { ctl.abort(); }, 14000);
    try {
      var res = await fetch(ep.url, { method: 'POST', headers: { 'content-type': 'application/json', apikey: ep.key, authorization: 'Bearer ' + ep.key }, body: JSON.stringify({ url: raw }), signal: ctl.signal, credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store' });
      var body = null; try { body = await res.json(); } catch (e) {}
      return { status: res.status, body: body };
    } finally { clearTimeout(timer); }
  }

  function noticeBox(strong, text) { return h('div', { class: 'rk-notice' }, [h('strong', { text: strong + ' ' }), h('span', { text: text })]); }

  function render(rep) {
    RK.clear(out);
    var sc = rep.score, tg = rep.target || {};
    if (!rep.ok) {
      out.appendChild(h('section', { class: 'rk-verdict rk-verdict--neutral', 'aria-live': 'polite' }, [h('h2', { text: t(REASON_TXT[rep.reason] || REASON_TXT.unparseable) })]));
      RK.reveal(out); return;
    }
    var v = h('section', { class: 'rk-verdict rk-verdict--' + (LEVEL_CLASS[sc.level] || 'neutral'), 'aria-live': 'polite' }, [
      h('h2', { text: t(sc.label) }),
      h('p', { text: t(sc.summary) }),
      h('p', { class: 'rk-small rk-muted', text: t({ ro: 'Indice de semnale: ', en: 'Signal index: ' }) + sc.score + '/100 — ' + t(sc.scale) })
    ]);
    out.appendChild(v);
    if (rep.offline) out.appendChild(noticeBox(t({ ro: 'Surse externe indisponibile.', en: 'External sources unavailable.' }), t({ ro: 'Serviciul de reputație nu a răspuns, deci rezultatul de mai jos se bazează doar pe structura adresei și este neconcludent în privința listelor de amenințări.', en: 'The reputation service did not answer, so the result below rests on the address structure only and is inconclusive about threat lists.' })));
    else if (sc.degraded) out.appendChild(noticeBox(t({ ro: 'Verificare parțială.', en: 'Partial check.' }), t({ ro: 'Unele surse nu au putut răspunde. Lipsa unui răspuns nu înseamnă că linkul este curat.', en: 'Some sources could not answer. A missing answer does not mean the link is clean.' })));

    var host = tg.hostUnicode || tg.host;
    var left = h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Ce am citit din adresă', en: 'What we read from the address' }) }),
      h('dl', { class: 'rk-dl' }, [
        h('dt', { text: t({ ro: 'Site-ul real', en: 'The real site' }) }), h('dd', { class: 'rk-mono', text: (tg.registrableDomain || host) }),
        h('dt', { text: t({ ro: 'Adresă verificată', en: 'Address checked' }) }), h('dd', { class: 'rk-mono', text: tg.shownWithoutParameters || '' }),
        h('dt', { text: t({ ro: 'Parametri / fragment / utilizator', en: 'Parameters / fragment / username' }) }), h('dd', { text: (tg.hasQuery || tg.hasFragment || tg.hasUserinfo) ? t({ ro: 'Prezente; nu au fost trimise nimănui', en: 'Present; not sent to anyone' }) : t({ ro: 'Absente', en: 'None' }) })
      ])]);
    var ul = h('ul', { class: 'rk-list' });
    var shown = (rep.analysis.indicators || []).filter(function (i) { return i.weight > 0 || i.severity === 'info'; });
    if (!shown.length) ul.appendChild(h('li', {}, [RK.chip('na', '—'), h('span', { text: t({ ro: 'Nu am găsit indicatori structurali. Asta nu este o garanție.', en: 'No structural indicators found. That is not a guarantee.' }) })]));
    shown.forEach(function (i) { ul.appendChild(h('li', {}, [RK.chip(SEV[i.severity] || 'na', t(SEV_TXT[i.severity] || SEV_TXT.info)), h('span', { text: t(i.title) })])); });
    var right = h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Indicatori găsiți', en: 'Indicators found' }) }), ul]);
    out.appendChild(h('div', { class: 'rk-cols' }, [left, right]));

    // sources
    if (rep.providers && rep.providers.length) {
      var tb = h('tbody');
      rep.providers.forEach(function (p) {
        var st = STATUS_TXT[p.status] || STATUS_TXT.unavailable;
        var detail = p.status === 'unavailable' || p.reason === 'skipped' ? t(REASON_PROV[p.reason] || { ro: '', en: '' }) : t(CONF[p.confidence] || CONF.none);
        var ev = p.evidence && p.evidence.threatTypes ? ' · ' + p.evidence.threatTypes.join(', ') : (p.evidence && p.evidence.ageDays != null ? ' · ' + t({ ro: 'vârstă domeniu: ', en: 'domain age: ' }) + p.evidence.ageDays + t({ ro: ' zile', en: ' days' }) : '');
        tb.appendChild(h('tr', {}, [h('td', { text: p.label }), h('td', {}, [RK.chip(st.kind, t(st))]), h('td', { text: detail + ev }), h('td', { class: 'rk-small', text: RK.when(p.checkedAt) + (p.cached ? ' (' + t({ ro: 'din cache', en: 'cached' }) + ')' : '') })]));
      });
      var tbl = h('table', { class: 'rk-src' }, [h('thead', {}, [h('tr', {}, ['Sursa|Source', 'Rezultat|Result', 'Detalii|Details', 'Verificat|Checked'].map(function (x) { var p = x.split('|'); return h('th', { scope: 'col', text: t({ ro: p[0], en: p[1] }) }); }))]), tb]);
      out.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Surse consultate', en: 'Sources consulted' }) }), h('div', { class: 'rk-tablewrap' }, [tbl]),
        h('p', { class: 'rk-small rk-muted', text: t({ ro: '„Nelistat acum” înseamnă doar că sursa nu are această adresă în listă la momentul verificării.', en: '"Not listed now" only means the source does not have this address in its list at the time of the check.' }) })]));
    }
    // privacy
    var sent = (rep.privacy && rep.privacy.sent) || [];
    var pv = h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Ce s-a trimis și cui', en: 'What was sent, and to whom' }) })]);
    if (sent.length) { var pl = h('ul', { class: 'rk-list' }); sent.forEach(function (s) { pl.appendChild(h('li', {}, [RK.chip('na', s.label), h('span', { text: t(s.what) })])); }); pv.appendChild(pl); }
    pv.appendChild(h('p', { class: 'rk-small rk-muted', text: t(rep.privacy.note) }));
    out.appendChild(pv);

    // limits + steps
    out.appendChild(h('div', { class: 'rk-notice' }, [h('strong', { text: t(sc.notSafeNotice || { ro: 'Un rezultat fără semnale nu este o garanție de siguranță.', en: 'A result without signals is not a guarantee of safety.' }) + ' ' })].concat((rep.analysis.limitations || []).map(function (l) { return h('span', { text: t(l) + ' ' }); }))));
    var steps = (sc.guidance || []).map(function (g) { return h('li', { text: t(g) }); });
    steps.push(h('li', {}, [t({ ro: 'Dacă mesajul cerea date, un IBAN sau un card, ', en: 'If the message asked for data, an IBAN or a card, ' }), h('a', { href: 'verificare-iban.html', class: 'rk-link', text: t({ ro: 'verifică IBAN-ul', en: 'check the IBAN' }) }), '.']));
    out.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Următorii pași', en: 'Next steps' }) }), h('ul', { class: 'rk-steps-nxt' }, steps),
      h('p', { class: 'rk-small rk-muted' }, [t({ ro: 'Cum recunoști astfel de atacuri: ', en: 'How to recognise attacks like this: ' }), h('a', { href: 'codex-phishing.html', class: 'rk-link', 'data-upgrade-cta': 'link_codex_phishing', 'data-placement': 'link_result', text: 'Codex — Phishing & Identity' }), ' · ',
        h('a', { href: 'postfraud.html', class: 'rk-link', 'data-upgrade-cta': 'link_postfraud', 'data-placement': 'link_result', text: t({ ro: 'Dacă ai introdus deja date', en: 'If you already entered data' }) }), ' · ',
        h('a', { href: 'signals.html', class: 'rk-link', 'data-upgrade-cta': 'link_signals', 'data-placement': 'link_result', text: 'Signals' })])]));
    RK.reveal(out);
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    if (busy) return;
    var raw = input.value.trim();
    if (looksSensitive(raw)) {
      RK.clear(out); out.appendChild(h('div', { class: 'rk-verdict rk-verdict--neutral' }, [h('h2', { text: t({ ro: 'Acesta pare un IBAN sau un număr de card.', en: 'This looks like an IBAN or a card number.' }) }), h('p', { text: t({ ro: 'Acestea se verifică doar local, în browser, și nu sunt trimise către server. IBAN-urile se verifică în IBAN Checker.', en: 'Those are checked only locally in your browser and are never sent to the server. IBANs are checked in the IBAN Checker.' }) }), h('p', {}, [h('a', { href: 'verificare-iban.html', class: 'rk-link', text: 'IBAN Checker' })])]));
      T('scan_failed', { tool: 'link', reason: 'sensitive_input' }); RK.reveal(out); return;
    }
    var a = SBRRisk.url.analyzeUrl(raw);
    if (!a.ok) { lastReport = { ok: false, reason: a.reason }; render(lastReport); T('scan_failed', { tool: 'link', reason: a.reason }); return; }
    T('scan_started', { tool: 'link' });
    setBusy(true, t({ ro: 'Analizez adresa și interoghez sursele de reputație…', en: 'Analysing the address and querying reputation sources…' }));
    var rep = null, reasonCode = 'ok';
    try {
      var r = await callServer(transportUrl(a));
      if (r.status === 200 && r.body && r.body.ok) rep = r.body;
      else if (r.status === 422) { out.hidden = false; RK.clear(out); out.appendChild(h('div', { class: 'rk-verdict rk-verdict--neutral' }, [h('h2', { text: t((r.body && r.body.message) || { ro: 'Acest text nu este un link.', en: 'This text is not a link.' }) })])); setBusy(false); busy = false; btn.disabled = false; T('scan_failed', { tool: 'link', reason: 'sensitive_input' }); RK.reveal(out); return; }
      else if (r.status === 429) { reasonCode = 'rate_limited'; }
      else reasonCode = 'server_' + r.status;
    } catch (e) { reasonCode = e && e.name === 'AbortError' ? 'timeout' : 'network'; }
    busy = false; btn.disabled = false;
    if (!rep) {
      rep = localReport(a);
      if (reasonCode === 'rate_limited') rep.rateLimited = true;
      T('scan_failed', { tool: 'link', reason: reasonCode });
    } else T('scan_completed', { tool: 'link', result: rep.score.level, level: rep.score.level });
    if (rep.score.level === 'inconclusive' || rep.offline) T('inconclusive_result', { tool: 'link', reason: rep.offline ? 'offline' : 'no_reputation' });
    lastReport = rep; render(rep);
  });
  RK.onLang(function () { if (lastReport) render(lastReport); });
  document.querySelectorAll('[data-example]').forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-example'); input.focus(); }); });
  T('tool_view', { tool: 'link' });
  var pre = RK.takePrefill && RK.takePrefill('link');
  if (pre) { input.value = pre; if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }
})();
