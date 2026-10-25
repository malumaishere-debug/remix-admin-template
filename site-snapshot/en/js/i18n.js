/*!
 * SBR i18n Engine v5 — Complete Bilingual System
 * Suporta: data-i18n keys + text-node replacement + atribute HTML
 * Nu foloseste Google Translate. Nu redirectioneaza.
 * Incarca /translations/i18n-keys.json (chei structurate) si /translations/en.json (text map)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sbr_lang';
  var DEFAULT     = 'RO';
  var KEYS_URL    = '/translations/i18n-keys.json';
  var DICT_URL    = '/translations/en.json';
  var ASSET_V     = (typeof window.SBR_I18N_V === 'string') ? window.SBR_I18N_V : '5';

  var keysDict    = {};  /* chei structurate: "index.h1.line1" -> "Recognize" */
  var textDict    = {};  /* text map: "Recunoști frauda" -> "Recognize fraud" */
  var keysLoaded  = false;
  var textLoaded  = false;
  var currentLang = DEFAULT;
  var origData    = {};  /* stocheaza originalele pentru fiecare element cu data-i18n */
  var origNodes   = new WeakMap(); /* text node originals */

  /* ---- Anti-FOUC ---- */
  (function () {
    var s = document.createElement('style');
    s.id = 'sbr-i18n-fouc';
    s.textContent = 'html.sbr-loading{opacity:0!important}html.sbr-ready{opacity:1;transition:opacity .25s ease}';
    (document.head || document.documentElement).appendChild(s);
    document.documentElement.classList.add('sbr-loading');
    setTimeout(function () { reveal(); }, 1500);
  })();

  function reveal() {
    document.documentElement.classList.remove('sbr-loading');
    document.documentElement.classList.add('sbr-ready');
  }

  function readStored() {
    try { var v = localStorage.getItem(STORAGE_KEY); return (v === 'EN' || v === 'RO') ? v : DEFAULT; } catch (e) { return DEFAULT; }
  }
  function writeStored(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }
  function fire(name, detail) {
    try { document.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail || {} })); } catch (e) {}
  }

  /* ---- Fetch helper cu retry ---- */
  function fetchJSON(url, retries) {
    function attempt(n) {
      return fetch(url + '?v=' + ASSET_V, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .catch(function (err) {
          if (n > 0) return new Promise(function (res) { setTimeout(res, 400); }).then(function () { return attempt(n - 1); });
          throw err;
        });
    }
    return attempt(retries || 2);
  }

  /* ---- Incarca ambele dictionare ---- */
  function loadDicts() {
    var p1 = keysLoaded ? Promise.resolve(keysDict) :
      fetchJSON(KEYS_URL).then(function (j) { keysDict = j; keysLoaded = true; return j; })
        .catch(function (e) { console.warn('[sbr-i18n] Nu am putut incarca i18n-keys.json:', e); return {}; });

    var p2 = textLoaded ? Promise.resolve(textDict) :
      fetchJSON(DICT_URL).then(function (j) { textDict = j; textLoaded = true; return j; })
        .catch(function (e) { console.warn('[sbr-i18n] Nu am putut incarca en.json:', e); return {}; });

    return Promise.all([p1, p2]);
  }

  /* ================================================================
     METODA 0: data-en / data-ro — cel mai fiabil sistem
     Orice element cu data-en="text EN" este comutat direct.
     Functioneaza si pentru headinguri cu <br>, <em>, <span> etc.
  ================================================================ */
  function applyDataEN(root) {
    root = root || document.body;
    if (!root) return;
    var elements = root.querySelectorAll('[data-en]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var enVal = el.getAttribute('data-en');
      if (!enVal) continue;
      /* Salveaza RO daca nu e deja salvat */
      if (!el.hasAttribute('data-ro')) {
        el.setAttribute('data-ro', el.innerHTML);
      }
      el.innerHTML = enVal;
    }
  }

  function restoreDataRO(root) {
    root = root || document.body;
    if (!root) return;
    var elements = root.querySelectorAll('[data-en][data-ro]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.innerHTML = el.getAttribute('data-ro');
    }
  }

  /* ================================================================
     METODA 1: data-i18n keys
     Cauta toate elementele cu data-i18n="cheie" si seteaza textul EN
  ================================================================ */
  function applyKeys(root) {
    root = root || document.body;
    if (!root || !keysLoaded) return;

    var elements = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      if (!key) continue;

      /* Salveaza originalul RO */
      if (!el.hasAttribute('data-ro-saved')) {
        el.setAttribute('data-ro-saved', el.innerHTML);
      }

      if (Object.prototype.hasOwnProperty.call(keysDict, key)) {
        el.innerHTML = keysDict[key];
      }
    }
  }

  /* ================================================================
     METODA 2: Atribute HTML (placeholder, title, aria-label, alt)
     Cauta elemente cu data-en-placeholder, data-en-title, etc.
     SAU translateaza placeholder/title daca textul e in textDict
  ================================================================ */
  function applyAttributes(root) {
    root = root || document.body;
    if (!root) return;

    var attrs = ['placeholder', 'title', 'aria-label', 'alt', 'data-tooltip'];
    var elements = root.querySelectorAll('[data-en-placeholder],[data-en-title],[data-en-aria-label],[data-en-alt]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var enPh = el.getAttribute('data-en-placeholder');
      var enTi = el.getAttribute('data-en-title');
      var enAl = el.getAttribute('data-en-aria-label');
      var enAt = el.getAttribute('data-en-alt');
      if (enPh) el.setAttribute('placeholder', enPh);
      if (enTi) el.setAttribute('title', enTi);
      if (enAl) el.setAttribute('aria-label', enAl);
      if (enAt) el.setAttribute('alt', enAt);
    }

    /* Translateaza si placeholderele care se potrivesc in textDict */
    if (textLoaded) {
      var inputs = root.querySelectorAll('input[placeholder],textarea[placeholder]');
      for (var j = 0; j < inputs.length; j++) {
        var inp = inputs[j];
        var ph = inp.getAttribute('placeholder');
        if (ph && Object.prototype.hasOwnProperty.call(textDict, ph.trim())) {
          if (!inp.hasAttribute('data-ro-placeholder')) {
            inp.setAttribute('data-ro-placeholder', ph);
          }
          inp.setAttribute('placeholder', textDict[ph.trim()]);
        }
      }
    }
  }

  /* ================================================================
     METODA 3: Text-node replacement (fallback pentru text fara data-i18n)
     Evita noduri cu cod JavaScript (Cloudflare protection)
  ================================================================ */
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, IFRAME: 1, TEXTAREA: 1, CODE: 1, PRE: 1, SVG: 1, MATH: 1 };
  var CF_PATTERN = /window\.__CF|__cf_|cloudflare|getElementsByTagName|document\.createElement|\.innerHTML\s*=|\.appendChild|MTc[A-Za-z0-9+/]{10}|cv\$params/i;

  function shouldSkip(node) {
    if (node.nodeType === 3) {
      var raw = node.nodeValue;
      if (raw && raw.length > 80 && CF_PATTERN.test(raw)) return true;
    }
    var p = node.parentElement;
    while (p) {
      if (SKIP_TAGS[p.tagName]) return true;
      if (p.hasAttribute && (
        p.hasAttribute('data-no-i18n') ||
        p.hasAttribute('data-i18n') ||   /* deja gestionat de Metoda 1 */
        p.hasAttribute('data-cfasync') ||
        p.id === 'cf-challenge-running' ||
        p.id === 'cf-challenge-stage'
      )) return true;
      p = p.parentElement;
    }
    return false;
  }

  function applyTextNodes(root) {
    if (!textLoaded || !Object.keys(textDict).length) return;
    root = root || document.body;
    if (!root) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (shouldSkip(node)) continue;
      var raw = node.nodeValue;
      var rawKey = raw.trim();
      var key = rawKey.replace(/ /g, ' ');
      if (!key) continue;
      if (Object.prototype.hasOwnProperty.call(textDict, key)) {
        if (!origNodes.has(node)) origNodes.set(node, raw);
        var start = raw.indexOf(rawKey);
        node.nodeValue = raw.slice(0, start) + textDict[key] + raw.slice(start + rawKey.length);
      }
    }
  }

  /* ================================================================
     APLICA ENGLEZA — toate cele 3 metode
  ================================================================ */
  function applyEN(root) {
    applyDataEN(root);   /* METODA 0: data-en/data-ro — prima si cea mai fiabila */
    applyKeys(root);
    applyAttributes(root);
    applyTextNodes(root);
    applyPlaceholders(root);
    document.documentElement.lang = 'en';
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.content = 'en_US';
    /* Update html lang attr */
    document.documentElement.setAttribute('lang', 'en');
  }

  /* Extra: translate placeholder attributes */
  function applyPlaceholders(root) {
    root = root || document.body;
    if (!root) return;
    var inputs = root.querySelectorAll('[placeholder],[data-en-placeholder]');
    for (var i = 0; i < inputs.length; i++) {
      var el = inputs[i];
      var enPh = el.getAttribute('data-en-placeholder');
      if (enPh) {
        if (!el.getAttribute('data-ro-placeholder')) {
          el.setAttribute('data-ro-placeholder', el.getAttribute('placeholder') || '');
        }
        el.setAttribute('placeholder', enPh);
      }
    }
  }

  /* ================================================================
     RESTAUREAZA ROMANA
  ================================================================ */
  function restoreRO(root) {
    root = root || document.body;
    if (!root) return;

    /* Restaureaza data-en/data-ro elements */
    restoreDataRO(root);

    /* Restaureaza data-i18n elements */
    var elements = root.querySelectorAll('[data-i18n][data-ro-saved]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.innerHTML = el.getAttribute('data-ro-saved');
    }

    /* Restaureaza placeholderele */
    var inputs = root.querySelectorAll('[data-ro-placeholder]');
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].setAttribute('placeholder', inputs[j].getAttribute('data-ro-placeholder'));
    }

    /* Restaureaza text nodes */
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (origNodes.has(node)) node.nodeValue = origNodes.get(node);
    }

    document.documentElement.lang = 'ro';
    document.documentElement.setAttribute('lang', 'ro');
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.content = 'ro_RO';
    /* Restore placeholders */
    var inputs = root.querySelectorAll('[data-ro-placeholder]');
    for (var _j = 0; _j < inputs.length; _j++) {
      inputs[_j].setAttribute('placeholder', inputs[_j].getAttribute('data-ro-placeholder'));
    }
  }

  /* ================================================================
     API PRINCIPAL: setLang
  ================================================================ */
  var readyResolve;
  var readyPromise = new Promise(function (r) { readyResolve = r; });
  var initialReady = false;

  function setLang(lang) {
    lang = (lang || '').toString().toUpperCase();
    if (lang !== 'RO' && lang !== 'EN') lang = DEFAULT;

    currentLang = lang;
    writeStored(lang);

    if (lang === 'EN') {
      return loadDicts().then(function () {
        applyEN();
        reveal();
        if (!initialReady) { initialReady = true; if (readyResolve) readyResolve(); fire('sbr:lang:ready', { lang: lang }); }
        fire('sbr:lang:changed', { lang: lang });
      });
    } else {
      restoreRO();
      reveal();
      if (!initialReady) { initialReady = true; if (readyResolve) readyResolve(); fire('sbr:lang:ready', { lang: lang }); }
      fire('sbr:lang:changed', { lang: lang });
      return Promise.resolve();
    }
  }

  /* ================================================================
     MUTATION OBSERVER — aplica pe continut adaugat dinamic
  ================================================================ */
  function startObserver() {
    if (!window.MutationObserver || !document.body) return;
    var busy = false;
    new MutationObserver(function (muts) {
      if (currentLang !== 'EN' || busy) return;
      var hasNew = false;
      for (var i = 0; i < muts.length && !hasNew; i++) {
        var nodes = muts[i].addedNodes;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (n.nodeType === 1 && SKIP_TAGS[n.tagName]) continue;
          if (n.nodeType === 3 && n.nodeValue && n.nodeValue.length > 80 && CF_PATTERN.test(n.nodeValue)) continue;
          if (n.nodeType === 1 || n.nodeType === 3) { hasNew = true; break; }
        }
      }
      if (hasNew) {
        busy = true;
        (window.requestAnimationFrame || setTimeout)(function () {
          busy = false;
          if (currentLang === 'EN') applyEN();
        }, 0);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* Sincronizare intre taburi */
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEY && e.newValue && e.newValue !== currentLang && (e.newValue === 'RO' || e.newValue === 'EN')) {
      setLang(e.newValue);
    }
  });

  /* ================================================================
     INITIALIZARE
  ================================================================ */
  function init() {
    var stored = readStored();
    if (stored === 'EN') {
      loadDicts().then(function () {
        currentLang = 'EN';
        applyEN();
        reveal();
        if (!initialReady) { initialReady = true; if (readyResolve) readyResolve(); fire('sbr:lang:ready', { lang: 'EN' }); }
        fire('sbr:lang:changed', { lang: 'EN' });
      }).catch(function () { reveal(); if (!initialReady) { initialReady = true; if (readyResolve) readyResolve(); } });
    } else {
      reveal();
      if (!initialReady) { initialReady = true; if (readyResolve) readyResolve(); fire('sbr:lang:ready', { lang: 'RO' }); }
    }
    if (document.body) startObserver();
    else document.addEventListener('DOMContentLoaded', startObserver);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* ================================================================
     API PUBLIC
  ================================================================ */
  window.i18n = {
    VERSION: '5.0.0',
    LANGS: ['RO', 'EN'],
    setLang: setLang,
    getLang: function () { return currentLang; },
    ready: readyPromise,
    _missing: function () {
      if (!document.body) return [];
      var seen = {}, miss = [];
      /* Verifica data-i18n keys netraduse */
      var els = document.querySelectorAll('[data-i18n]');
      for (var i = 0; i < els.length; i++) {
        var k = els[i].getAttribute('data-i18n');
        if (k && !Object.prototype.hasOwnProperty.call(keysDict, k) && !seen[k]) {
          miss.push('[key] ' + k); seen[k] = 1;
        }
      }
      /* Verifica text nodes netraduse */
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var n;
      while ((n = w.nextNode())) {
        var t = n.nodeValue.trim();
        if (t && t.length > 3 && !seen[t] && !Object.prototype.hasOwnProperty.call(textDict, t)) {
          miss.push(t); seen[t] = 1;
        }
      }
      return miss;
    },
    _keys: function () { return keysDict; },
    _dict: function () { return textDict; }
  };
})();
