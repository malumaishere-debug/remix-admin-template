/* Deepfake Checker page = media provenance check. The file is read ONLY in this browser (C2PA SDK in a Web Worker, WebAssembly);
   it is never uploaded, never stored, never sent to analytics. Only the final category (e.g. "no_provenance") goes to analytics. */
(function () {
  'use strict';
  var h = RK.h, t = RK.t;
  var input = document.getElementById('media-file'), drop = document.getElementById('media-drop'), out = document.getElementById('media-result'), status = document.getElementById('media-status');
  var BASE = 'js/risk/';
  var checker = null, loading = null, last = null, busy = false, previewUrl = null;
  var T = function (n, p) { window.SBRRiskTrack && window.SBRRiskTrack.track(n, p); };

  var LEVEL = {
    verified_trusted: { cls: 'good', label: { ro: 'Credențiale valide, emitent de încredere', en: 'Valid credentials, trusted issuer' } },
    verified_untrusted: { cls: 'warn', label: { ro: 'Credențiale valide tehnic, emitent neverificat', en: 'Technically valid credentials, unverified issuer' } },
    tampered_or_invalid: { cls: 'bad', label: { ro: 'Credențiale invalide sau fișier modificat', en: 'Invalid credentials or modified file' } },
    no_provenance: { cls: 'neutral', label: { ro: 'Fără credențiale de conținut', en: 'No Content Credentials' } },
    unreadable: { cls: 'neutral', label: { ro: 'Neconcludent: credențialele nu au putut fi citite', en: 'Inconclusive: credentials could not be read' } }
  };
  var ERR = {
    empty: { ro: 'Fișierul este gol.', en: 'The file is empty.' },
    too_large: { ro: 'Fișierul depășește 50 MB. Alege unul mai mic.', en: 'The file is over 50 MB. Choose a smaller one.' },
    unsupported_type: { ro: 'Tip de fișier neacceptat. Sunt acceptate imagini (JPEG, PNG, WebP, HEIC/AVIF), video (MP4, MOV), audio (MP3, WAV, M4A) și PDF.', en: 'Unsupported file type. Supported: images (JPEG, PNG, WebP, HEIC/AVIF), video (MP4, MOV), audio (MP3, WAV, M4A) and PDF.' },
    engine: { ro: 'Motorul de verificare nu a putut fi încărcat. Reîncearcă sau folosește alt browser (Chrome, Edge, Firefox sau Safari recente).', en: 'The verification engine could not be loaded. Try again or use another browser (recent Chrome, Edge, Firefox or Safari).' }
  };
  var MODALITY = { image: { ro: 'Imagine', en: 'Image' }, video: { ro: 'Video', en: 'Video' }, audio: { ro: 'Audio', en: 'Audio' }, document: { ro: 'Document', en: 'Document' }, unknown: { ro: 'Necunoscut', en: 'Unknown' } };
  var NEXT = [
    { ro: 'Caută sursa originală: cine a publicat prima dată imaginea sau clipul, și când. Un fișier fără credențiale poate fi totuși autentic.', en: 'Look for the original source: who first published the image or clip, and when. A file without credentials can still be authentic.' },
    { ro: 'Dacă filmul sau mesajul vocal îți cere bani, date sau o decizie urgentă, confirmă prin alt canal, cu un număr pe care îl cunoști deja.', en: 'If the video or voice message asks for money, data or an urgent decision, confirm through another channel, using a number you already know.' },
    { ro: 'Păstrează fișierul original și linkul de unde l-ai primit; sunt dovezi dacă raportezi.', en: 'Keep the original file and the link you got it from; they are evidence if you report it.' }
  ];

  function say(msg) { status.textContent = msg || ''; }

  function loadScript(src) {
    return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('script')); }; document.head.appendChild(s); });
  }
  function engine() {
    if (checker) return Promise.resolve(checker);
    if (loading) return loading;
    loading = loadScript(BASE + 'c2pa/sbr-risk-media.js?v=1').then(function () {
      return window.SBRRisk.media.createMediaChecker({ wasmSrc: BASE + 'c2pa/c2pa_bg.wasm', workerSrc: BASE + 'c2pa/c2pa_worker.js', trustAnchorsUrl: BASE + 'trust/C2PA-TRUST-LIST.pem' });
    }).then(function (c) { checker = c; return c; }).catch(function (e) { loading = null; throw e; });
    return loading;
  }

  function yesNo(v) { return v ? t({ ro: 'Da', en: 'Yes' }) : t({ ro: 'Nu', en: 'No' }); }

  function render(res) {
    RK.clear(out); out.hidden = false;
    if (!res.ok) { out.appendChild(h('section', { class: 'rk-verdict rk-verdict--neutral', 'aria-live': 'polite' }, [h('h2', { text: t(ERR[res.reason] || ERR.engine) })])); RK.reveal(out); return; }
    var r = res.result, lv = LEVEL[r.level] || LEVEL.unreadable;
    var v = h('section', { class: 'rk-verdict rk-verdict--' + lv.cls, 'aria-live': 'polite' }, [h('h2', { text: t(lv.label) }), h('p', { text: t(r.summary) })]);
    if (r.container && r.container.c2paContainer === false && r.level === 'no_provenance') v.appendChild(h('p', { class: 'rk-small rk-muted', text: t({ ro: 'Nu există niciun container de credențiale în structura fișierului.', en: 'There is no credentials container in the file structure.' }) }));
    out.appendChild(v);

    var cols = h('div', { class: 'rk-cols' });
    // file card
    var f = h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Fișierul', en: 'The file' }) })]);
    var dl = h('dl', { class: 'rk-dl' }, [
      h('dt', { text: t({ ro: 'Tip detectat', en: 'Detected type' }) }), h('dd', { class: 'rk-mono', text: (r.mime || '—') + ' · ' + t(MODALITY[r.modality] || MODALITY.unknown) }),
      h('dt', { text: t({ ro: 'Dimensiune', en: 'Size' }) }), h('dd', { text: (res.size / 1048576 >= 1 ? (res.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(res.size / 1024)) + ' KB') })
    ]);
    f.appendChild(dl);
    if (previewUrl) f.appendChild(h('img', { class: 'rk-preview', src: previewUrl, alt: t({ ro: 'Previzualizare locală a fișierului ales', en: 'Local preview of the chosen file' }) }));
    cols.appendChild(f);

    // credentials card
    if (r.signature || r.claims) {
      var c = h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Ce spun credențialele', en: 'What the credentials say' }) })]);
      var d2 = h('dl', { class: 'rk-dl' });
      if (r.signature) {
        d2.appendChild(h('dt', { text: t({ ro: 'Semnat de', en: 'Signed by' }) })); d2.appendChild(h('dd', { text: r.signature.commonName || r.signature.issuer || '—' }));
        if (r.signature.issuer && r.signature.commonName && r.signature.issuer !== r.signature.commonName) { d2.appendChild(h('dt', { text: t({ ro: 'Autoritate', en: 'Issuer' }) })); d2.appendChild(h('dd', { text: r.signature.issuer })); }
        if (r.signature.time) { d2.appendChild(h('dt', { text: t({ ro: 'Data semnării (declarată)', en: 'Signing time (declared)' }) })); d2.appendChild(h('dd', { text: RK.when(r.signature.time) })); }
        d2.appendChild(h('dt', { text: t({ ro: 'Semnătură validă', en: 'Valid signature' }) })); d2.appendChild(h('dd', {}, [RK.chip(r.signature.valid ? 'ok' : 'bad', yesNo(r.signature.valid))]));
        d2.appendChild(h('dt', { text: t({ ro: 'Emitent pe lista de încredere', en: 'Issuer on trust list' }) })); d2.appendChild(h('dd', {}, [RK.chip(r.signature.trusted ? 'ok' : 'warn', yesNo(r.signature.trusted))]));
      }
      if (r.integrity) {
        d2.appendChild(h('dt', { text: t({ ro: 'Neschimbat după semnare', en: 'Unchanged after signing' }) }));
        d2.appendChild(h('dd', {}, [r.integrity.intact === true ? RK.chip('ok', t({ ro: 'Da', en: 'Yes' })) : r.integrity.intact === false ? RK.chip('bad', t({ ro: 'Nu', en: 'No' })) : RK.chip('na', t({ ro: 'Necunoscut', en: 'Unknown' }))]));
      }
      if (r.claims) {
        if (r.claims.generator) { d2.appendChild(h('dt', { text: t({ ro: 'Aplicație declarată', en: 'Declared application' }) })); d2.appendChild(h('dd', { text: r.claims.generator })); }
        d2.appendChild(h('dt', { text: t({ ro: 'Generat cu IA (declarat)', en: 'AI-generated (declared)' }) }));
        d2.appendChild(h('dd', {}, [r.claims.aiGenerated === 'declared' ? RK.chip('warn', t({ ro: 'Declarat', en: 'Declared' })) : RK.chip('na', t({ ro: 'Nedeclarat', en: 'Not declared' }))]));
        if (r.claims.syntheticDeclared) { d2.appendChild(h('dt', { text: t({ ro: 'Conținut sintetic', en: 'Synthetic content' }) })); d2.appendChild(h('dd', {}, [RK.chip('warn', t({ ro: 'Declarat', en: 'Declared' }))])); }
        if (r.claims.aiInHistory) { d2.appendChild(h('dt', { text: t({ ro: 'Istoric', en: 'History' }) })); d2.appendChild(h('dd', { text: t({ ro: 'O versiune anterioară declară generare cu IA.', en: 'An earlier version declares AI generation.' }) })); }
        d2.appendChild(h('dt', { text: t({ ro: 'Versiuni / surse în istoric', en: 'Versions / sources in history' }) })); d2.appendChild(h('dd', { text: String(r.claims.manifestCount || 0) + ' / ' + String(r.claims.ingredientCount || 0) }));
      }
      c.appendChild(d2);
      if (r.claims && r.claims.actions && r.claims.actions.length) {
        var al = h('ul', { class: 'rk-list' });
        r.claims.actions.slice(0, 8).forEach(function (a) { al.appendChild(h('li', {}, [RK.chip('na', t({ ro: 'acțiune', en: 'action' })), h('span', { class: 'rk-mono', text: String(a.action || a.name || '—') + (a.softwareAgent ? ' · ' + a.softwareAgent : '') })])); });
        c.appendChild(h('p', { class: 'rk-small rk-muted', text: t({ ro: 'Acțiuni declarate de cine a semnat:', en: 'Actions declared by the signer:' }) })); c.appendChild(al);
      }
      cols.appendChild(c);
    }
    out.appendChild(cols);

    if (r.statusCodes && r.statusCodes.length) {
      var sl = h('ul', { class: 'rk-list' });
      r.statusCodes.slice(0, 10).forEach(function (s) { sl.appendChild(h('li', {}, [RK.chip('na', 'C2PA'), h('span', {}, [h('span', { class: 'rk-mono', text: s.code }), s.text ? ' — ' + t(s.text) : ''])])); });
      out.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Coduri de validare', en: 'Validation codes' }) }), sl]));
    }
    (r.notes || []).forEach(function (n) { out.appendChild(h('div', { class: 'rk-notice', text: t(n) })); });

    var lim = h('div', { class: 'rk-notice' }, [h('strong', { text: t({ ro: 'Limite. ', en: 'Limits. ' }) })].concat((r.limitations || []).map(function (l) { return h('span', { text: t(l) + ' ' }); })));
    out.appendChild(lim);
    out.appendChild(h('div', { class: 'rk-card' }, [h('h3', { text: t({ ro: 'Următorii pași', en: 'Next steps' }) }), h('ol', { class: 'rk-steps-nxt' }, NEXT.map(function (n) { return h('li', { text: t(n) }); })),
      h('p', { class: 'rk-small rk-muted' }, [t({ ro: 'Cum recunoști înșelăciunile cu conținut fals: ', en: 'How to recognise scams built on fake content: ' }), h('a', { href: 'codex-deepfake.html', class: 'rk-link', 'data-upgrade-cta': 'media_codex_deepfake', 'data-placement': 'media_result', text: 'Codex — Deepfake' }), ' · ',
        h('a', { href: 'postfraud.html', class: 'rk-link', 'data-upgrade-cta': 'media_postfraud', 'data-placement': 'media_result', text: t({ ro: 'Dacă ai plătit deja', en: 'If you already paid' }) })])]));
    RK.reveal(out);
  }

  async function handle(file) {
    if (!file || busy) return;
    busy = true; drop.setAttribute('aria-busy', 'true');
    if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (e) {} previewUrl = null; }
    T('scan_started', { tool: 'media' });
    RK.clear(out); out.hidden = false;
    out.appendChild(h('div', { class: 'rk-verdict rk-verdict--neutral', role: 'status' }, [h('p', {}, [h('span', { class: 'rk-spinner', 'aria-hidden': 'true' }), t({ ro: 'Citesc local credențialele fișierului… (prima dată se încarcă motorul, ≈9 MB)', en: 'Reading the file credentials locally… (the first time the engine loads, ≈9 MB)' })])]));
    var res;
    try {
      var c = await engine();
      res = await c.check(file);
      if (res.ok && res.previewable && /^image\//.test(res.result.mime || '')) { try { previewUrl = URL.createObjectURL(file); } catch (e) {} }
    } catch (e) { res = { ok: false, reason: 'engine' }; }
    busy = false; drop.removeAttribute('aria-busy');
    last = res; render(res);
    if (!res.ok) T('scan_failed', { tool: 'media', reason: res.reason });
    else { T('scan_completed', { tool: 'media', result: res.result.level }); if (res.result.level === 'no_provenance' || res.result.level === 'unreadable') T('inconclusive_result', { tool: 'media', reason: res.result.level }); }
    input.value = '';
  }

  input.addEventListener('change', function () { handle(input.files && input.files[0]); });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) handle(f); });
  RK.onLang(function () { if (last) render(last); });
  window.addEventListener('pagehide', function () { if (previewUrl) { try { URL.revokeObjectURL(previewUrl); } catch (e) {} } if (checker) checker.dispose(); });
  T('tool_view', { tool: 'media' });
})();
