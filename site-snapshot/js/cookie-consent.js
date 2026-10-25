/*!
 * SBR Cookie Consent v1.0
 * GDPR compliant — Romanian + English
 * Se incarca automat pe toate paginile via nav-universal.js sau direct in <head>
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'sbr_cookie_consent';
  var CONSENT_VERSION = '1';

  /* Texte bilingv */
  var T = {
    RO: {
      title: 'Folosim cookie-uri',
      body: 'Folosim cookie-uri esențiale pentru funcționarea site-ului și cookie-uri analitice pentru a înțelege cum îl utilizați. Datele nu sunt vândute terților.',
      accept: 'Accept toate',
      essential: 'Doar esențiale',
      manage: 'Detalii',
      policy: 'Politica Cookies'
    },
    EN: {
      title: 'We use cookies',
      body: 'We use essential cookies for the site to work and analytics cookies to understand how you use it. Data is never sold to third parties.',
      accept: 'Accept all',
      essential: 'Essential only',
      manage: 'Details',
      policy: 'Cookie Policy'
    }
  };

  function getLang() {
    try {
      var v = localStorage.getItem('sbr_lang');
      return (v === 'EN') ? 'EN' : 'RO';
    } catch (e) { return 'RO'; }
  }

  function hasConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return c && c.v === CONSENT_VERSION;
    } catch (e) { return false; }
  }

  function saveConsent(type) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        v: CONSENT_VERSION,
        type: type,
        ts: Date.now()
      }));
    } catch (e) {}
  }

  function removeBanner() {
    var el = document.getElementById('sbr-cookie-banner');
    if (el) {
      el.style.transform = 'translateY(20px)';
      el.style.opacity = '0';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }
  }

  function buildBanner() {
    var lang = getLang();
    var tx = T[lang];

    /* CSS inline — nu depinde de fisiere externe */
    var style = document.createElement('style');
    style.textContent = [
      '#sbr-cookie-banner{',
        'position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(0);',
        'width:calc(100% - 48px);max-width:640px;',
        'background:#111;border:1px solid rgba(255,255,255,.08);',
        'padding:20px 24px;z-index:99999;',
        'font-family:"IBM Plex Mono",monospace;',
        'box-shadow:0 8px 40px rgba(0,0,0,.7);',
        'transition:opacity .3s ease,transform .3s ease;',
        'opacity:0;',
      '}',
      '#sbr-cookie-banner.sbr-cc-visible{opacity:1;}',
      '#sbr-cc-title{',
        'font-size:10px;letter-spacing:2px;text-transform:uppercase;',
        'color:#fff;margin:0 0 8px;',
      '}',
      '#sbr-cc-body{',
        'font-size:11px;line-height:1.7;color:#888;margin:0 0 16px;',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'letter-spacing:0;',
      '}',
      '#sbr-cc-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center;}',
      '.sbr-cc-btn{',
        'font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;',
        'text-transform:uppercase;cursor:pointer;border:1px solid;',
        'padding:8px 16px;transition:all .15s;',
      '}',
      '.sbr-cc-btn-accept{background:#C0392B;border-color:#C0392B;color:#fff;}',
      '.sbr-cc-btn-accept:hover{background:#a93226;border-color:#a93226;}',
      '.sbr-cc-btn-essential{background:transparent;border-color:rgba(255,255,255,.15);color:#666;}',
      '.sbr-cc-btn-essential:hover{border-color:rgba(255,255,255,.3);color:#aaa;}',
      '.sbr-cc-link{',
        'font-family:"IBM Plex Mono",monospace;font-size:8px;letter-spacing:1px;',
        'color:#444;text-decoration:none;margin-left:auto;',
        'text-transform:uppercase;',
      '}',
      '.sbr-cc-link:hover{color:#888;}',
      '@media(max-width:480px){',
        '#sbr-cookie-banner{bottom:0;left:0;right:0;transform:none;width:100%;border-radius:0;}',
        '.sbr-cc-link{margin-left:0;}',
      '}'
    ].join('');
    document.head.appendChild(style);

    var banner = document.createElement('div');
    banner.id = 'sbr-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', tx.title);
    banner.innerHTML = [
      '<p id="sbr-cc-title">' + tx.title + '</p>',
      '<p id="sbr-cc-body">' + tx.body + '</p>',
      '<div id="sbr-cc-actions">',
        '<button class="sbr-cc-btn sbr-cc-btn-accept" id="sbr-cc-accept">' + tx.accept + '</button>',
        '<button class="sbr-cc-btn sbr-cc-btn-essential" id="sbr-cc-essential">' + tx.essential + '</button>',
        '<a class="sbr-cc-link" href="/cookies.html">' + tx.policy + '</a>',
      '</div>'
    ].join('');

    document.body.appendChild(banner);

    /* Forteaza reflow pentru animatie */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.classList.add('sbr-cc-visible');
      });
    });

    document.getElementById('sbr-cc-accept').addEventListener('click', function () {
      saveConsent('all');
      removeBanner();
    });
    document.getElementById('sbr-cc-essential').addEventListener('click', function () {
      saveConsent('essential');
      removeBanner();
    });

    /* Actualizeaza textele daca utilizatorul schimba limba */
    document.addEventListener('sbr:lang:changed', function (e) {
      if (!document.getElementById('sbr-cookie-banner')) return;
      var l = (e.detail && e.detail.lang === 'EN') ? 'EN' : 'RO';
      var t2 = T[l];
      var titleEl = document.getElementById('sbr-cc-title');
      var bodyEl  = document.getElementById('sbr-cc-body');
      var acceptEl = document.getElementById('sbr-cc-accept');
      var essEl   = document.getElementById('sbr-cc-essential');
      if (titleEl)  titleEl.textContent  = t2.title;
      if (bodyEl)   bodyEl.textContent   = t2.body;
      if (acceptEl) acceptEl.textContent = t2.accept;
      if (essEl)    essEl.textContent    = t2.essential;
    });
  }

  function init() {
    if (hasConsent()) return; /* deja acceptat */
    if (document.body) {
      buildBanner();
    } else {
      document.addEventListener('DOMContentLoaded', buildBanner);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* API public */
  window.SBRCookies = {
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      buildBanner();
    },
    getConsent: function () {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { return null; }
    }
  };
})();
