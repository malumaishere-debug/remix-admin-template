/* SBR Risk Suite — privacy-conscious analytics. Uses the site's existing GA4 + Consent Mode (events are cookieless/limited until consent).
   HARD RULES: only the event names and parameters below are ever sent; parameter values must be short codes (a-z 0-9 _ . : -).
   Submitted IBANs, links, file names or file contents can never reach analytics: free text is dropped by the validator. */
(function () {
  'use strict';
  var EVENTS = ['tool_view', 'scan_started', 'scan_completed', 'scan_failed', 'inconclusive_result', 'upgrade_cta_clicked', 'pricing_viewed', 'checkout_started', 'purchase_completed'];
  var PARAMS = ['tool', 'result', 'reason', 'cta', 'plan', 'placement', 'level'];
  var CODE = /^[a-z0-9_.:\-]{1,40}$/i;

  function clean(params) {
    var out = {};
    Object.keys(params || {}).forEach(function (k) {
      if (PARAMS.indexOf(k) < 0) return;
      var v = params[k];
      if (typeof v === 'string' && CODE.test(v)) out[k] = v;
    });
    var l = document.documentElement.lang; out.lang = (window.SBR_LANG && window.SBR_LANG.get && String(window.SBR_LANG.get()).toLowerCase() === 'en') ? 'en' : (l === 'en' ? 'en' : 'ro');
    return out;
  }
  function track(name, params) {
    if (EVENTS.indexOf(name) < 0) return false;
    var p = clean(params);
    try { if (typeof window.gtag === 'function') window.gtag('event', name, p); } catch (e) {}
    return true;
  }
  window.SBRRiskTrack = { track: track, _clean: clean, EVENTS: EVENTS };

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('[data-upgrade-cta],[data-checkout]') : null;
    if (!a) return;
    if (a.hasAttribute('data-checkout')) track('checkout_started', { plan: a.getAttribute('data-checkout'), placement: a.getAttribute('data-placement') || 'page' });
    else track('upgrade_cta_clicked', { cta: a.getAttribute('data-upgrade-cta'), placement: a.getAttribute('data-placement') || 'page' });
  }, true);

  var pr = document.getElementById('preturi');
  var prHead = pr && (pr.querySelector('h2') || pr);     // the heading, not the whole (very tall on phones) section
  if (prHead && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { track('pricing_viewed', { placement: 'home' }); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(prHead);
  }
  // Return from Stripe: the Payment Link must redirect to /dashboard.html?checkout=success&plan=<id> (see docs). Fired once per browser tab.
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('checkout') === 'success' && !sessionStorage.getItem('rk_purchase_sent')) {
      var plan = q.get('plan');
      track('purchase_completed', { plan: plan && CODE.test(plan) ? plan.toLowerCase() : 'unknown' });
      sessionStorage.setItem('rk_purchase_sent', '1');
    }
  } catch (e) {}
})();
