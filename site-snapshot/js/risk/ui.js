/* SBR Risk Suite — shared UI helpers (no dependencies). Text is always inserted with textContent: results are never parsed as HTML. */
(function () {
  'use strict';
  var RK = (window.RK = window.RK || {});

  RK.lang = function () {
    /* The i18n engine is the authority: it is what actually translates the page. The nav's own LANG variable can lag behind it. */
    try { if (window.i18n && typeof window.i18n.getLang === 'function') return String(window.i18n.getLang()).toLowerCase() === 'en' ? 'en' : 'ro'; } catch (e) {}
    try { var s = localStorage.getItem('sbr_lang'); if (s === 'EN' || s === 'RO') return s === 'EN' ? 'en' : 'ro'; } catch (e) {}
    return String(document.documentElement.lang || 'ro').toLowerCase().indexOf('en') === 0 ? 'en' : 'ro';
  };
  /** t({ro,en}) or t('plain string') */
  RK.t = function (v) { if (v == null) return ''; if (typeof v === 'string') return v; return v[RK.lang()] || v.ro || v.en || ''; };

  var listeners = [];
  RK.onLang = function (fn) { listeners.push(fn); };
  document.addEventListener('sbr:lang:changed', function () { listeners.forEach(function (fn) { try { fn(); } catch (e) {} }); });

  /** h('div', {class:'x', 'data-a':'b'}, ['text', node]) */
  RK.h = function (tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === false || v == null) return;
      if (k === 'text') el.textContent = v; else if (k === 'class') el.className = v; else el.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c == null) return; el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  };
  /** Value handed over by the home page (sessionStorage, same tab only, valid 2 minutes, removed on read). Never put in the URL, never sent to analytics. */
  RK.takePrefill = function (tool) {
    try {
      var raw = sessionStorage.getItem('sbr_prefill'); if (!raw) return '';
      var p = JSON.parse(raw);
      if (!p || p.tool !== tool || typeof p.value !== 'string' || (Date.now() - (+p.t || 0)) > 120000) return '';
      sessionStorage.removeItem('sbr_prefill');
      return p.value.slice(0, 2048);
    } catch (e) { return ''; }
  };
  RK.clear = function (el) { while (el.firstChild) el.removeChild(el.firstChild); };

  // Public project URL and public "anon" key (the same ones every page of the site already ships). The anon key is not a secret;
  // the secrets (Web Risk / URLhaus keys, service role) exist only as Edge Function secrets and never reach the browser.
  RK.endpoint = function () {
    return { url: 'https://zxonzzojynrkzaiaacte.supabase.co/functions/v1/risk-verify', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0' };
  };

  RK.region = function (code) {
    try { var n = new Intl.DisplayNames([RK.lang() === 'en' ? 'en' : 'ro'], { type: 'region' }).of(code); if (n && n !== code) return n; } catch (e) {}
    return code;
  };

  RK.when = function (iso) {
    try { return new Date(iso).toLocaleString(RK.lang() === 'en' ? 'en-GB' : 'ro-RO', { dateStyle: 'medium', timeStyle: 'short' }); } catch (e) { return String(iso || ''); }
  };

  /** chip(kind, label) kind: ok|warn|bad|na */
  RK.chip = function (kind, label) { return RK.h('span', { class: 'rk-chip rk-chip--' + kind, text: label }); };

  /** Move keyboard/screen-reader focus to a result region after it appears. */
  RK.reveal = function (el) { el.hidden = false; if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); try { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); } catch (e) {} };
})();
