/* SBR landing: small, dependency-free behaviours for the home page variants (audience toggle, journey animations, checker hand-off,
   smart box, tabs, accordion, stepper, carousel). Nothing typed into a field is ever sent anywhere from here: an IBAN is checked in
   this browser; a link or an IBAN is handed to the tool page through sessionStorage (same tab, 2 minutes, removed on read), never in the URL. */
(function () {
  'use strict';
  var root = document.querySelector('.rl');
  if (!root) return;
  var RM = false;
  try { RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) {}
  function $(s, c) { return (c || root).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }
  function lang() { try { if (window.i18n && typeof window.i18n.getLang === 'function') return String(window.i18n.getLang()).toLowerCase() === 'en' ? 'en' : 'ro'; } catch (e) {} return 'ro'; }
  function T(ro, en) { return lang() === 'en' ? en : ro; }
  function track(n, p) { try { if (window.SBRRiskTrack) window.SBRRiskTrack.track(n, p); } catch (e) {} }
  function el(tag, attrs, text) { var n = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text != null) n.textContent = text; return n; }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }

  root.classList.add('rl-js');
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('rl-ready'); }); });

  /* ---- reveal helper: runs cb once when el is on screen (immediately if no observer or reduced motion) ---- */
  function onView(node, cb, th) {
    if (RM || !('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); cb(); } }); }, { threshold: th || 0.25, rootMargin: '0px 0px -6% 0px' });
    io.observe(node);
  }
  function armIo(scope) { $$('[data-io]', scope).forEach(function (n) { onView(n, function () { n.classList.add('is-in'); }, 0.3); }); }
  armIo(root);

  /* ---- audience toggle (individual / business), shared by every toggle on the page ---- */
  var segs = $$('.rl-seg');
  function setAud(a) {
    segs.forEach(function (s) { s.setAttribute('data-on', a); $$('button', s).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-aud') === a ? 'true' : 'false'); }); });
    $$('.rl-aud').forEach(function (p) {
      var on = p.getAttribute('data-aud') === a;
      p.hidden = !on;
      if (on) $$('[data-io]', p).forEach(function (n) { n.classList.remove('is-in'); void n.offsetWidth; onView(n, function () { n.classList.add('is-in'); }, 0.3); });
    });
    if (typeof refreshStories === 'function') refreshStories();
  }
  segs.forEach(function (s) { $$('button', s).forEach(function (b) { b.addEventListener('click', function () { setAud(b.getAttribute('data-aud')); }); }); });
  if (segs.length) setAud('ind');

  /* ---- hand-off to the tool pages ---- */
  function handoff(kind, value) {
    try { sessionStorage.setItem('sbr_prefill', JSON.stringify({ tool: kind, value: String(value).slice(0, 2048), t: Date.now() })); } catch (e) {}
    window.location.href = kind === 'iban' ? 'verificare-iban.html' : 'verificare-link.html';
  }
  var ibanLoading = null;
  function loadIban(cb) {
    if (window.SBRRisk && window.SBRRisk.iban) { cb(); return; }
    if (ibanLoading) { ibanLoading.push(cb); return; }
    ibanLoading = [cb];
    var s = document.createElement('script');
    s.src = 'js/risk/sbr-risk-iban.js?v=1';
    s.onload = function () { var q = ibanLoading || []; ibanLoading = null; q.forEach(function (f) { f(); }); };
    s.onerror = function () { var q = ibanLoading || []; ibanLoading = null; q.forEach(function (f) { f(true); }); };
    document.head.appendChild(s);
  }
  function ibanInline(out, value) {
    var r;
    try { r = window.SBRRisk.iban.validateIban(value); } catch (e) { handoff('iban', value); return; }
    clear(out);
    out.appendChild(el('span', { 'class': 'rk-chip ' + (r.valid ? 'rk-chip--ok' : 'rk-chip--bad') }, r.valid ? T('Valid tehnic', 'Technically valid') : T('Nevalid', 'Not valid')));
    out.appendChild(el('p', {}, (r.summary && (r.summary[lang()] || r.summary.ro)) || ''));
    if (r.valid) out.appendChild(el('p', { 'class': 'rk-hint' }, T('Valid tehnic nu înseamnă legitim: confirmă beneficiarul printr-un alt canal.', 'Technically valid does not mean legitimate: confirm the beneficiary through another channel.')));
    var more = el('button', { type: 'button', 'class': 'rl-out__more' }, T('Vezi detaliile complete', 'See the full details'));
    more.addEventListener('click', function () { handoff('iban', value); });
    out.appendChild(more);
    track('scan_started', { tool: 'iban', placement: 'landing' });
    track('scan_completed', { tool: 'iban', result: r.valid ? 'valid_technical' : String(r.status || 'invalid').replace(/[^a-z_]/g, ''), placement: 'landing' });
  }
  $$('[data-rl-form]').forEach(function (f) {
    var kind = f.getAttribute('data-rl-form'), inp = $('input', f), out = $('.rl-out', f);
    if (!inp) return;
    if (kind === 'iban') inp.addEventListener('focus', function () { loadIban(function () {}); }, { once: true });
    inp.addEventListener('input', function () { if (out) clear(out); });
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = (inp.value || '').trim();
      if (!v) { clear(out); out.appendChild(el('p', {}, T('Lipește mai întâi ce vrei să verifici.', 'Paste what you want to check first.'))); inp.focus(); return; }
      if (kind === 'iban') { loadIban(function (failed) { if (failed) handoff('iban', v); else ibanInline(out, v); }); return; }
      handoff('link', v);
    });
  });

  /* ---- J: smart box ---- */
  var sm = $('[data-rl-smart]');
  if (sm) {
    var sIn = $('input', sm), kinds = $$('[data-kind]', sm), note = $('.rl-smart__note', sm), forced = '';
    var noteT = function (ro, en) { clear(note); note.appendChild(el('span', {}, T(ro, en))); };
    var detect = function (v) {
      v = (v || '').trim(); if (!v) return '';
      var c = v.replace(/[\s\-]/g, '');
      if (!/^https?:/i.test(v) && /^[A-Za-z]{2}\d{2}[A-Za-z0-9]{8,30}$/.test(c)) return 'iban';
      if (/^(https?:\/\/|www\.)/i.test(v) || /^[^\s\/@]+\.[a-z]{2,}([\/?#]\S*)?$/i.test(v)) return 'link';
      return 'unknown';
    };
    var paint = function (k) { kinds.forEach(function (b) { var on = b.getAttribute('data-kind') === k; b.classList.toggle('is-hit', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); };
    sIn.addEventListener('input', function () {
      forced = ''; var k = detect(sIn.value); paint(k === 'unknown' ? '' : k);
      if (k === 'link') noteT('Recunoscut: link. Apasă Verifică.', 'Recognised: a link. Press Check.');
      else if (k === 'iban') noteT('Recunoscut: IBAN. Se verifică local, în browser.', 'Recognised: an IBAN. It is checked locally, in your browser.');
      else if (k === 'unknown') noteT('Nu recunosc formatul. Alege tipul mai jos.', 'I do not recognise the format. Pick the type below.');
      else noteT('Alege un tip sau lipește direct. Nu cerem cont.', 'Pick a type or just paste. No account needed.');
    });
    kinds.forEach(function (b) { b.addEventListener('click', function () {
      var k = b.getAttribute('data-kind');
      if (k === 'media') { window.location.href = 'verificare-media.html'; return; }
      forced = k; paint(k); sIn.focus(); noteT(k === 'iban' ? 'Tip ales: IBAN.' : 'Tip ales: link.', k === 'iban' ? 'Type chosen: IBAN.' : 'Type chosen: link.');
    }); });
    $$('[data-ex]', sm).forEach(function (b) { b.addEventListener('click', function () { sIn.value = b.getAttribute('data-ex'); sIn.dispatchEvent(new Event('input')); sIn.focus(); }); });
    sm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = sIn.value.trim(); if (!v) { noteT('Lipește mai întâi ce vrei să verifici.', 'Paste what you want to check first.'); sIn.focus(); return; }
      var k = forced || detect(v);
      if (k === 'iban' || k === 'link') handoff(k, v); else noteT('Nu recunosc formatul. Alege „Link” sau „IBAN” mai jos.', 'I do not recognise the format. Choose “Link” or “IBAN” below.');
    });
    ['dragenter', 'dragover'].forEach(function (n) { sm.addEventListener(n, function (e) { e.preventDefault(); sm.classList.add('is-drag'); }); });
    ['dragleave', 'drop'].forEach(function (n) { sm.addEventListener(n, function (e) { e.preventDefault(); sm.classList.remove('is-drag'); }); });
    sm.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        paint('media');
        clear(note);
        note.appendChild(el('span', {}, T('Fișierul rămâne pe dispozitivul tău. ', 'The file stays on your device. ')));
        var a = el('a', { href: 'verificare-media.html', 'class': 'rl-out__more' }, T('Deschide verificarea media și alege-l acolo', 'Open the media check and choose it there'));
        note.appendChild(a);
      }
    });
  }

  /* ---- H: console tabs + typing demo ---- */
  var tabsBox = $('[data-rl-tabs]');
  if (tabsBox) {
    var tabs = $$('[role="tab"]', tabsBox);
    var show = function (t, focus) {
      tabs.forEach(function (x) { var on = x === t; x.setAttribute('aria-selected', on ? 'true' : 'false'); x.tabIndex = on ? 0 : -1; var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on; });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length]; else if (e.key === 'ArrowLeft') n = tabs[(i + tabs.length - 1) % tabs.length];
        if (n) { e.preventDefault(); show(n, true); }
      });
    });
  }
  var demo = $('[data-rl-demo]');
  if (demo && !RM) {
    var line = $('.rl-demo__line', demo), full = line.getAttribute('data-text') || line.textContent, k = 0, timer = null;
    demo.classList.add('is-armed'); line.textContent = '';
    var type = function () {
      if (k <= full.length) { line.textContent = full.slice(0, k++); timer = setTimeout(type, 34); } else { demo.classList.add('is-done'); }
    };
    onView(demo, function () { timer = setTimeout(type, 500); }, 0.2);
  }

  /* ---- I: triptych accordion ---- */
  var tri = $('[data-rl-tri]');
  if (tri) {
    var cols = $$('.rl-tri__col', tri), heads = $$('.rl-tri__head', tri), cur = 0, auto = null, wide = function () { return window.matchMedia('(min-width: 981px)').matches; };
    var openCol = function (i) { cur = i; cols.forEach(function (c, j) { c.classList.toggle('is-open', j === i); heads[j].setAttribute('aria-expanded', j === i ? 'true' : 'false'); }); };
    var stop = function () { if (auto) { clearInterval(auto); auto = null; } };
    heads.forEach(function (h, i) {
      h.addEventListener('click', function () { stop(); openCol(i); });
      h.addEventListener('focus', function () { stop(); openCol(i); });
    });
    cols.forEach(function (c, i) { c.addEventListener('mouseenter', function () { if (wide()) { stop(); openCol(i); } }); c.addEventListener('focusin', function () { stop(); openCol(i); }); });
    if (!RM) onView(tri, function () { auto = setInterval(function () { if (wide()) openCol((cur + 1) % cols.length); }, 3600); }, 0.4);
  }

  /* ---- I: subway stations ---- */
  $$('[data-rl-lane]').forEach(function (lane) {
    var sts = $$('.rl-st', lane), ds = $$('.rl-lane__di', lane);
    sts.forEach(function (s) { s.addEventListener('click', function () {
      var i = +s.getAttribute('data-st');
      sts.forEach(function (x) { var on = x === s; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      ds.forEach(function (d) { d.hidden = +d.getAttribute('data-di') !== i; });
    }); });
  });

  /* ---- H: sticky story ---- */
  var refreshStories = null;
  var stories = $$('[data-rl-story]');
  if (stories.length && 'IntersectionObserver' in window) {
    var setStep = function (st, i) {
      var items = $$('.rl-stepper li', st), scenes = $$('.rl-scene', st), fill = $('.rl-stepper', st);
      items.forEach(function (li, j) { li.classList.toggle('is-on', j <= i && j === i); });
      scenes.forEach(function (sc, j) { sc.classList.toggle('is-on', j === i); });
      if (fill) fill.style.setProperty('--p', String(items.length > 1 ? i / (items.length - 1) : 0));
    };
    var watchers = [];
    var wire = function () {
      watchers.forEach(function (w) { w.disconnect(); }); watchers = [];
      stories.forEach(function (st) {
        if (st.offsetParent === null) return;
        var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setStep(st, +e.target.getAttribute('data-i')); }); }, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
        $$('.rl-scene', st).forEach(function (sc) { io.observe(sc); });
        watchers.push(io);
      });
    };
    refreshStories = function () { setTimeout(wire, 0); };
    wire();
  }

  /* ---- H: ecosystem carousel ---- */
  var car = $('[data-rl-car]');
  if (car) {
    var track_ = $('.rl-car__track', car), bar = $('.rl-car__bar span', car);
    var upd = function () { var max = track_.scrollWidth - track_.clientWidth; var w = Math.max(12, (track_.clientWidth / track_.scrollWidth) * 100); bar.style.width = w + '%'; bar.style.left = (max > 0 ? (track_.scrollLeft / max) * (100 - w) : 0) + '%'; };
    track_.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    $$('[data-car]').forEach(function (b) { b.addEventListener('click', function () {
      var tile = $('.rl-eco', track_), step = (tile ? tile.getBoundingClientRect().width : 300) + 14;
      track_.scrollBy({ left: step * (+b.getAttribute('data-car')), behavior: RM ? 'auto' : 'smooth' });
    }); });
  }
})();
