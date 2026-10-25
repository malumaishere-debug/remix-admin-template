/**
 * nav-auth.js — SBR Auth State Handler
 * Gestionează Login/Dashboard în nav pe baza sesiunii Supabase
 * Funcționează împreună cu nav-universal.js
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://zxonzzojynrkzaiaacte.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0';
  var STORAGE_KEY = 'sbr-auth';

  /* ----------------------------------------------------------------
     Actualizează vizibilitatea elementelor de nav
     data-nav="guest-only"  → vizibil doar când logout
     data-nav="auth-only"   → vizibil doar când logat
  ---------------------------------------------------------------- */
  function updateNavState(isLoggedIn) {
    var guestEls = document.querySelectorAll('[data-nav="guest-only"]');
    var authEls  = document.querySelectorAll('[data-nav="auth-only"]');

    for (var i = 0; i < guestEls.length; i++) {
      guestEls[i].style.display = isLoggedIn ? 'none' : '';
    }
    for (var j = 0; j < authEls.length; j++) {
      authEls[j].style.display = isLoggedIn ? '' : 'none';
    }
  }

  /* ----------------------------------------------------------------
     Verificare rapidă din localStorage (fără request Supabase)
     Evită flash-ul Login→Dashboard la încărcarea paginii
  ---------------------------------------------------------------- */
  function quickCheck() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY + '.auth.token');
      if (!stored) {
        // Cauta sesiune alternativă (Supabase v2 key format)
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf('supabase.auth.token') !== -1) {
            stored = localStorage.getItem(k);
            break;
          }
        }
      }
      if (stored) {
        var parsed = JSON.parse(stored);
        var session = parsed && (parsed.currentSession || parsed);
        if (session && session.access_token && session.expires_at) {
          var expiresAt = session.expires_at;
          var now = Math.floor(Date.now() / 1000);
          if (expiresAt > now) {
            updateNavState(true);
            return true;
          }
        }
      }
    } catch (e) {}
    updateNavState(false);
    return false;
  }

  /* ----------------------------------------------------------------
     Inițializare Supabase și ascultare schimbări auth
  ---------------------------------------------------------------- */
  function initSupabase() {
    if (typeof window.supabase === 'undefined') return;

    try {
      var client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { storageKey: STORAGE_KEY, autoRefreshToken: true, persistSession: true }
      });

      // Verificare sesiune curentă
      client.auth.getSession().then(function (result) {
        var session = result && result.data && result.data.session;
        updateNavState(!!session);
      }).catch(function () {
        updateNavState(false);
      });

      // Ascultă schimbările de stare (login/logout)
      client.auth.onAuthStateChange(function (event, session) {
        updateNavState(!!session);
        // Redirect după logout
        if (event === 'SIGNED_OUT') {
          var protectedPaths = ['/dashboard', '/app/', '/business-dashboard', '/business-platform'];
          var currentPath = window.location.pathname;
          for (var i = 0; i < protectedPaths.length; i++) {
            if (currentPath.indexOf(protectedPaths[i]) !== -1) {
              window.location.href = '/login.html';
              return;
            }
          }
        }
      });

    } catch (e) {
      console.warn('[nav-auth] Supabase init error:', e.message);
      updateNavState(false);
    }
  }

  /* ----------------------------------------------------------------
     Start: quick check imediat, apoi Supabase complet după DOMContentLoaded
  ---------------------------------------------------------------- */
  // Quick check imediat (previne flash)
  quickCheck();

  // Inițializare completă după DOM + Supabase SDK
  function tryInit() {
    if (typeof window.supabase !== 'undefined') {
      initSupabase();
    } else {
      // Supabase SDK nu e încă încărcat — retry
      setTimeout(tryInit, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

})();
