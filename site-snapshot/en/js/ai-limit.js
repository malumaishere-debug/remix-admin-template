/**
 * ai-limit.js — SBR AI message limits (client-side layer)
 * ---------------------------------------------------------------
 * What it does:
 *   - works out which plan the visitor has (not logged in = free)
 *   - counts the messages used in this browser
 *   - after the allowance is used up, shows an upgrade CTA and locks the input
 *
 * IMPORTANT: this layer is for user experience only. A browser can always be
 * reset (clear site data, private window), so the SAME limits must also be
 * enforced on the server (n8n workflow "sbr-ai"). This file sends the user's
 * login token with every AI request (body.auth.token) so the server can do it.
 *
 * To change a limit, edit the LIMITS table below (null = unlimited).
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zxonzzojynrkzaiaacte.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0';   /* public "anon" key — safe in the browser */
  var STORAGE_AUTH = 'sbr-auth';
  var USED_PREFIX  = 'sbr_ai_used_v1:';

  /* Messages allowed per plan (total per account/browser). null = unlimited. */
  var LIMITS = {
    free:         2,      /* visitor / no plan — 2 messages + 2 replies */
    essential:    2,      /* ASSUMPTION: Essential has no AI allowance of its own */
    professional: 10,     /* Personal Professional */
    premium:      20,     /* Personal Premium */
    basic:        10,     /* Business Basic */
    pro:          30,     /* Business Pro */
    enterprise:   null    /* Business Enterprise — unlimited */
  };

  var cache = { plan: 'free', uid: null, at: 0 };

  /* ---------------------------------------------------------- session / plan */
  function readSession() {
    try {
      var raw = localStorage.getItem(STORAGE_AUTH);
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (s && s.currentSession) s = s.currentSession;          /* older supabase-js format */
      if (s && s.access_token && s.user && s.user.id) return { token: s.access_token, uid: s.user.id };
    } catch (e) {}
    return null;
  }

  function normalizePlan(p) {
    var plan = String((p && p.plan) || '').toLowerCase();
    if (!Object.prototype.hasOwnProperty.call(LIMITS, plan) || plan === 'free') return 'free';
    if (p.plan_status === 'cancelled') return 'free';
    if (p.plan_expires_at && new Date(p.plan_expires_at).getTime() < Date.now()) return 'free';
    return plan;
  }

  function fetchPlan(sess) {
    var url = SUPABASE_URL + '/rest/v1/profiles?select=plan,plan_status,plan_expires_at&id=eq.' + encodeURIComponent(sess.uid);
    return fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: 'Bearer ' + sess.token, Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (rows) { return rows && rows[0] ? normalizePlan(rows[0]) : 'free'; });
  }

  /* ---------------------------------------------------------- usage counter */
  function usedKey(uid) { return USED_PREFIX + (uid || 'anon'); }
  function getUsed(uid) {
    try { var n = parseInt(localStorage.getItem(usedKey(uid)) || '0', 10); return isNaN(n) ? 0 : n; } catch (e) { return 0; }
  }
  function setUsed(uid, n) { try { localStorage.setItem(usedKey(uid), String(n)); } catch (e) {} }

  /* ---------------------------------------------------------- public API */
  function check() {
    var sess = readSession();
    var uid = sess ? sess.uid : null;
    var fresh = cache.at && (Date.now() - cache.at < 60000) && cache.uid === uid;
    var planP = fresh ? Promise.resolve(cache.plan)
      : (sess ? fetchPlan(sess).catch(function () { return 'free'; }) : Promise.resolve('free'));
    return planP.then(function (plan) {
      cache = { plan: plan, uid: uid, at: Date.now() };
      var limit = LIMITS[plan];
      var used = getUsed(uid);
      var remaining = (limit === null) ? Infinity : Math.max(0, limit - used);
      return { plan: plan, uid: uid, limit: limit, used: used, remaining: remaining, allowed: remaining > 0, token: sess ? sess.token : null };
    });
  }

  function record(st) { if (st && st.limit !== null) setUsed(st.uid, getUsed(st.uid) + 1); }

  /* Sent with every AI request so the server can verify the plan and count messages itself. */
  function authPayload() {
    var sess = readSession();
    return { v: 1, token: sess ? sess.token : null, client_plan: cache.plan };
  }

  /* ---------------------------------------------------------- upgrade CTA */
  var CSS = '.limit-cta{border:1px solid rgba(192,57,43,.45);background:linear-gradient(180deg,rgba(192,57,43,.10),rgba(192,57,43,.03));border-radius:14px;padding:18px 20px;max-width:560px}'
    + '.limit-cta .lc-tag{font-family:var(--fm,monospace);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--red-l,#E74C3C);margin-bottom:8px}'
    + '.limit-cta .lc-title{font-size:17px;font-weight:600;color:var(--text,#F7F7F7);margin-bottom:6px;line-height:1.35}'
    + '.limit-cta .lc-body{font-size:14.5px;line-height:1.55;color:var(--t2,#D2D2D2);margin-bottom:14px}'
    + '.limit-cta .lc-actions{display:flex;flex-wrap:wrap;gap:10px}'
    + '.limit-cta a{display:inline-block;text-decoration:none;font-size:14px;padding:10px 16px;border-radius:8px;border:1px solid var(--border,rgba(255,255,255,.12));color:var(--text,#F7F7F7)}'
    + '.limit-cta a.lc-primary{background:var(--red,#C0392B);border-color:var(--red,#C0392B);color:#fff;font-weight:600}'
    + '.limit-cta a:hover{filter:brightness(1.12)}';

  function injectCss() {
    if (document.getElementById('sbr-ailimit-css')) return;
    var s = document.createElement('style'); s.id = 'sbr-ailimit-css'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var COPY = {
    RO: {
      tag: 'Limita de mesaje atinsa',
      title: {
        free: function (n) { return 'Ai folosit cele ' + n + ' mesaje gratuite.'; },
        essential: function (n) { return 'Ai folosit cele ' + n + ' mesaje incluse in planul Essential.'; },
        professional: function (n) { return 'Ai folosit cele ' + n + ' mesaje din planul Professional.'; },
        premium: function (n) { return 'Ai folosit cele ' + n + ' mesaje din planul Premium.'; },
        basic: function (n) { return 'Ai folosit cele ' + n + ' mesaje din planul Business Basic.'; },
        pro: function (n) { return 'Ai folosit cele ' + n + ' mesaje din planul Business Pro.'; }
      },
      body: {
        free: 'Pentru a continua analiza si a primi planul de actiune complet, alege un plan SBR. Professional include 10 mesaje, Premium include 20.',
        essential: 'Pentru a continua analiza, treci pe Professional (10 mesaje) sau Premium (20 de mesaje).',
        professional: 'Premium include 20 de mesaje si acces la intelligence in timp real.',
        premium: 'Pentru un volum mai mare de analize, vezi planurile pentru companii sau scrie-ne.',
        basic: 'Business Pro include 30 de mesaje.',
        pro: 'Enterprise include mesaje nelimitate. Scrie-ne si il activam.'
      },
      btn: { plans: 'Vezi planurile', login: 'Am deja cont', biz: 'Planuri pentru companii', contact: 'Scrie-ne', ent: 'Contacteaza-ne pentru Enterprise' }
    },
    EN: {
      tag: 'Message limit reached',
      title: {
        free: function (n) { return 'You have used your ' + n + ' free messages.'; },
        essential: function (n) { return 'You have used the ' + n + ' messages included in your Essential plan.'; },
        professional: function (n) { return 'You have used the ' + n + ' messages in your Professional plan.'; },
        premium: function (n) { return 'You have used the ' + n + ' messages in your Premium plan.'; },
        basic: function (n) { return 'You have used the ' + n + ' messages in your Business Basic plan.'; },
        pro: function (n) { return 'You have used the ' + n + ' messages in your Business Pro plan.'; }
      },
      body: {
        free: 'To keep going and get the full action plan, choose an SBR plan. Professional includes 10 messages, Premium includes 20.',
        essential: 'To keep going, upgrade to Professional (10 messages) or Premium (20 messages).',
        professional: 'Premium includes 20 messages and real-time intelligence.',
        premium: 'For a higher volume of analyses, see the business plans or get in touch.',
        basic: 'Business Pro includes 30 messages.',
        pro: 'Enterprise includes unlimited messages. Get in touch and we will activate it.'
      },
      btn: { plans: 'See plans', login: 'I already have an account', biz: 'Business plans', contact: 'Contact us', ent: 'Contact us about Enterprise' }
    }
  };

  function ctaHtml(st, lang) {
    injectCss();
    var C = COPY[lang === 'EN' ? 'EN' : 'RO'];
    var plan = st && COPY.RO.title[st.plan] ? st.plan : 'free';
    var n = (st && st.limit != null) ? st.limit : LIMITS.free;
    var actions;
    if (plan === 'free' || plan === 'essential') {
      actions = '<a class="lc-primary" href="personal.html">' + C.btn.plans + '</a>'
        + (plan === 'free' && !(st && st.uid) ? '<a href="login.html">' + C.btn.login + '</a>' : '')
        + '<a href="business.html">' + C.btn.biz + '</a>';
    } else if (plan === 'professional') {
      actions = '<a class="lc-primary" href="personal.html">' + C.btn.plans + '</a><a href="business.html">' + C.btn.biz + '</a>';
    } else if (plan === 'premium') {
      actions = '<a class="lc-primary" href="business.html">' + C.btn.biz + '</a><a href="contact.html">' + C.btn.contact + '</a>';
    } else if (plan === 'basic') {
      actions = '<a class="lc-primary" href="business.html">' + C.btn.biz + '</a><a href="contact.html">' + C.btn.contact + '</a>';
    } else {
      actions = '<a class="lc-primary" href="contact.html">' + C.btn.ent + '</a>';
    }
    return '<div class="limit-cta" role="status">'
      + '<div class="lc-tag">' + C.tag + '</div>'
      + '<div class="lc-title">' + C.title[plan](n) + '</div>'
      + '<div class="lc-body">' + C.body[plan] + '</div>'
      + '<div class="lc-actions">' + actions + '</div></div>';
  }

  window.SBR_AILIMIT = { LIMITS: LIMITS, check: check, record: record, authPayload: authPayload, ctaHtml: ctaHtml };
})();
