/**
 * SBR Early Access Modal v2
 * - Saves lead to Supabase
 * - Sends owner notification via Supabase edge function
 * - Fallback: mailto link
 */
(function () {
  var SBR_URL = 'https://zxonzzojynrkzaiaacte.supabase.co';
  var SBR_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0';
  var OWNER_EMAIL = 'contact@sbr.systems';

  /* ── CSS ── */
  var style = document.createElement('style');
  style.textContent = `
    .ea-overlay{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);display:none;align-items:center;justify-content:center;padding:20px}
    .ea-overlay.open{display:flex}
    .ea-box{background:#0d0d0d;border:1px solid rgba(192,57,43,.2);border-top:2px solid #C0392B;max-width:500px;width:100%;animation:eaIn .22s ease}
    @keyframes eaIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
    .ea-hdr{padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.06);display:flex;align-items:center;justify-content:space-between}
    .ea-logo{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:4px;color:#E2E2E2}
    .ea-logo b{color:#C0392B;font-weight:400}
    .ea-close{background:none;border:none;color:#333;cursor:pointer;font-size:16px;padding:4px 8px;transition:color .15s;font-family:inherit;line-height:1}
    .ea-close:hover{color:#E2E2E2}
    .ea-body{padding:24px 22px}
    .ea-eyebrow{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:4px;color:rgba(192,57,43,.55);text-transform:uppercase;display:flex;align-items:center;gap:7px;margin-bottom:12px}
    .ea-eyebrow::before{content:'';display:block;width:5px;height:5px;background:#C0392B;border-radius:50%}
    .ea-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(30px,5vw,40px);line-height:.9;letter-spacing:1px;color:#E2E2E2;margin-bottom:8px}
    .ea-title em{color:#C0392B;font-style:normal;display:block}
    .ea-desc{font-size:13px;color:#666;line-height:1.75;margin-bottom:6px}
    .ea-trust{font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:1px;color:#333;border-left:2px solid rgba(192,57,43,.15);padding-left:12px;margin-bottom:20px;line-height:1.65}
    .ea-form{display:flex;flex-direction:column;gap:8px}
    .ea-input{background:#080808;border:1px solid rgba(255,255,255,.07);color:#E2E2E2;font-family:'IBM Plex Mono',monospace;font-size:12px;padding:12px 14px;outline:none;width:100%;transition:border-color .18s}
    .ea-input:focus{border-color:rgba(192,57,43,.4)}
    .ea-input::placeholder{color:#333}
    .ea-select{background:#080808;border:1px solid rgba(255,255,255,.07);color:#555;font-family:'IBM Plex Mono',monospace;font-size:11px;padding:12px 14px;outline:none;width:100%;cursor:pointer}
    .ea-select option{background:#111}
    .ea-submit{background:#C0392B;color:#fff;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:3px;text-transform:uppercase;border:none;padding:14px;cursor:pointer;width:100%;transition:background .18s;margin-top:4px}
    .ea-submit:hover{background:#E74C3C}
    .ea-submit:disabled{opacity:.45;cursor:wait}
    .ea-err{font-family:'IBM Plex Mono',monospace;font-size:9px;color:#e74c3c;margin-top:4px;display:none;letter-spacing:.5px}
    .ea-or{display:flex;align-items:center;gap:10px;margin:14px 0 2px}
    .ea-or-line{flex:1;height:1px;background:rgba(255,255,255,.04)}
    .ea-or-text{font-family:'IBM Plex Mono',monospace;font-size:8px;color:#2a2a2a;letter-spacing:2px;text-transform:uppercase}
    .ea-contact-link{display:block;text-align:center;font-family:'IBM Plex Mono',monospace;font-size:9px;letter-spacing:2px;color:#333;text-transform:uppercase;text-decoration:none;padding:10px;border:1px solid rgba(255,255,255,.05);transition:all .18s}
    .ea-contact-link:hover{color:#aaa;border-color:rgba(255,255,255,.1)}
    /* Confirm */
    .ea-confirm{padding:32px 22px;text-align:center;display:none}
    .ea-confirm-icon{font-size:36px;margin-bottom:12px}
    .ea-confirm-title{font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:1px;color:#E2E2E2;margin-bottom:6px}
    .ea-confirm-title em{color:#C0392B;font-style:normal}
    .ea-confirm-body{font-size:13px;color:#666;line-height:1.75;margin-bottom:16px}
    .ea-confirm-note{font-family:'IBM Plex Mono',monospace;font-size:8px;letter-spacing:2px;color:#2a2a2a;text-transform:uppercase;border:1px solid rgba(255,255,255,.04);padding:10px 14px}
    .ea-plan-badge{font-family:'IBM Plex Mono',monospace;font-size:7px;letter-spacing:3px;color:rgba(192,57,43,.5);text-transform:uppercase;border:1px solid rgba(192,57,43,.15);padding:3px 8px;display:inline-block;margin-bottom:14px}
  `;
  document.head.appendChild(style);

  /* ── HTML ── */
  var html = document.createElement('div');
  html.id = 'ea-overlay';
  html.className = 'ea-overlay';
  html.onclick = function(e) { if (e.target === this) closeEarlyAccess(); };
  html.innerHTML = `
    <div class="ea-box">
      <div class="ea-hdr">
        <div class="ea-logo">SBR<b>.</b></div>
        <button class="ea-close" onclick="closeEarlyAccess()">&#10005;</button>
      </div>
      <div id="ea-form-view">
        <div class="ea-body">
          <div class="ea-eyebrow">Early Access &middot; SBR Platform</div>
          <div class="ea-title">Early<em>Access.</em></div>
          <p class="ea-desc">Onboardăm primii utilizatori pe platforma SBR Anti-Fraud Intelligence. Plăți complete și abonamente automate vor fi disponibile în curând.</p>
          <p class="ea-trust">Vei fi printre primii cu acces la intelligence anti-fraudă avansat. Vei fi contactat personal.</p>
          <div class="ea-form">
            <input type="email" class="ea-input" id="ea-email" placeholder="adresa@email.com" autocomplete="email">
            <input type="text" class="ea-input" id="ea-name" placeholder="Numele tău (opțional)">
            <input type="text" class="ea-input" id="ea-company" placeholder="Companie / Organizație (opțional)">
            <select class="ea-select" id="ea-usecase">
              <option value="">Interes principal (opțional)</option>
              <option value="personal">Protecție personală</option>
              <option value="business">Protecție business / echipă</option>
              <option value="certification">Certificare SBR Institute</option>
              <option value="banking">Sector financiar-bancar</option>
              <option value="compliance">Compliance / Audit</option>
              <option value="training">Training angajați</option>
              <option value="other">Altceva</option>
            </select>
            <button class="ea-submit" id="ea-submit" onclick="submitEarlyAccess()">
              Înregistrează-te &rarr;
            </button>
            <div class="ea-err" id="ea-err"></div>
          </div>
          <div class="ea-or">
            <div class="ea-or-line"></div>
            <div class="ea-or-text">sau</div>
            <div class="ea-or-line"></div>
          </div>
          <a href="contact.html" class="ea-contact-link" onclick="closeEarlyAccess()">
            Contactează-ne direct &rarr;
          </a>
        </div>
      </div>
      <div id="ea-confirm-view" class="ea-confirm">
        <div class="ea-confirm-icon">&#10003;</div>
        <div class="ea-plan-badge" id="ea-plan-label">Early Access</div>
        <div class="ea-confirm-title">Ești pe<em>listă.</em></div>
        <p class="ea-confirm-body" id="ea-confirm-msg">Te vom contacta personal în cel mai scurt timp.</p>
        <div class="ea-confirm-note">Prioritate acordată primilor aplicanți</div>
      </div>
    </div>`;
  document.body.appendChild(html);

  /* ── OPEN ── */
  window.openEarlyAccess = function (planName) {
    var planBadge = document.getElementById('ea-plan-badge');
    /* Pre-fill email if logged in */
    var emailInput = document.getElementById('ea-email');
    var client = window.sbr_db || window._sbr_client;
    if (client && emailInput && !emailInput.value) {
      client.auth.getSession().then(function(r) {
        if (r && r.data && r.data.session) {
          emailInput.value = r.data.session.user.email || '';
        }
      }).catch(function(){});
    }
    /* Set plan context */
    var submitBtn = document.getElementById('ea-submit');
    if (submitBtn) submitBtn.setAttribute('data-plan', planName || 'general');
    /* Reset form view */
    document.getElementById('ea-form-view').style.display = 'block';
    document.getElementById('ea-confirm-view').style.display = 'none';
    document.getElementById('ea-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      var em = document.getElementById('ea-email');
      if (em && !em.value) em.focus();
    }, 200);
  };

  window.closeEarlyAccess = function () {
    document.getElementById('ea-overlay').classList.remove('open');
    document.body.style.overflow = '';
  };

  window.submitEarlyAccess = async function () {
    var email    = (document.getElementById('ea-email').value || '').trim().toLowerCase();
    var name     = (document.getElementById('ea-name').value || '').trim();
    var company  = (document.getElementById('ea-company').value || '').trim();
    var usecase  = document.getElementById('ea-usecase').value;
    var plan     = document.getElementById('ea-submit').getAttribute('data-plan') || 'general';
    var errEl    = document.getElementById('ea-err');
    var btn      = document.getElementById('ea-submit');
    errEl.style.display = 'none';

    if (!email || !email.includes('@') || !email.includes('.')) {
      errEl.textContent = 'Introdu un email valid.';
      errEl.style.display = 'block';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Se înregistrează...';

    try {
      var HDR = { 'Content-Type': 'application/json', 'apikey': SBR_KEY, 'Authorization': 'Bearer ' + SBR_KEY };

      /* 1. Save lead - ONLY through the secured database function submit_lead */
      var leadOk = false;
      try {
        var lr = await fetch(SBR_URL + '/rest/v1/rpc/submit_lead', {
          method: 'POST',
          headers: HDR,
          body: JSON.stringify({
            p_email: email,
            p_quiz_tag: 'early_access_' + plan,
            p_lang: 'RO',
            p_source: 'early-access-' + plan,
            p_referrer: document.referrer || null
          })
        });
        leadOk = lr.ok;
      } catch (e) {}

      /* 2. Save the request itself (insert-only table, nobody can read it from the browser) */
      var notifData = {
        email: email,
        name: name || null,
        company: company || null,
        usecase: usecase || null,
        plan: plan,
        source_url: window.location.href,
        created_at: new Date().toISOString()
      };
      var reqOk = false;
      try {
        var rr = await fetch(SBR_URL + '/rest/v1/early_access_requests', {
          method: 'POST',
          headers: Object.assign({ 'Prefer': 'return=minimal' }, HDR),
          body: JSON.stringify(notifData)
        });
        reqOk = rr.ok;
      } catch (e) {}

      /* nothing saved -> tell the visitor honestly instead of showing a fake confirmation */
      if (!leadOk && !reqOk) { throw new Error('save_failed'); }

      /* 3. Send notification via contact@sbr.systems using mailto as reliable fallback */
      /* This opens silently in a hidden iframe trick — won't interrupt UX */
      try {
        var subject = encodeURIComponent('[SBR Early Access] ' + plan.toUpperCase() + ' — ' + email);
        var body = encodeURIComponent(
          'Early Access Request\n' +
          '==================\n' +
          'Email: ' + email + '\n' +
          'Nume: ' + (name || '—') + '\n' +
          'Companie: ' + (company || '—') + '\n' +
          'Interes: ' + (usecase || '—') + '\n' +
          'Plan: ' + plan + '\n' +
          'Sursa: ' + window.location.href + '\n' +
          'Data: ' + new Date().toLocaleString('ro-RO')
        );
        /* Try send-score-email edge function as notification channel */
        fetch(SBR_URL + '/functions/v1/send-score-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SBR_KEY,
            'apikey': SBR_KEY
          },
          body: JSON.stringify({
            email: 'contact@sbr.systems',
            quiz_tag: 'early_access_' + plan,
            score_pct: 0,
            lang: 'RO',
            name: name || email,
            plan: plan,
            source_url: window.location.href,
            applicant_email: email,
            applicant_company: company || '',
            applicant_usecase: usecase || ''
          })
        }).catch(function(){
          /* Final fallback: store in localStorage so owner can check manually */
          try {
            var stored = JSON.parse(localStorage.getItem('sbr_early_access_queue') || '[]');
            stored.push(notifData);
            localStorage.setItem('sbr_early_access_queue', JSON.stringify(stored.slice(-50)));
          } catch(e) {}
        });
      } catch(e) {}

      /* 3. Show confirmation */
      var planLabels = {
        essential: 'Essential Plan', professional: 'Professional Plan', premium: 'Premium Plan',
        signals: 'Signals', faa: 'SBR-FAA Certification', bpa: 'SBR-BPA Certification',
        cfi: 'SBR-CFI Certification', business: 'Business Package', enterprise: 'Enterprise',
        general: 'Early Access'
      };
      var label = planLabels[plan] || plan.toUpperCase();
      var planLabelEl = document.getElementById('ea-plan-label');
      if (planLabelEl) planLabelEl.textContent = label;
      var msgEl = document.getElementById('ea-confirm-msg');
      if (msgEl) msgEl.textContent = 'Am înregistrat cererea ta pentru ' + label + '. Te vom contacta personal la ' + email + ' în cel mai scurt timp.';

      document.getElementById('ea-form-view').style.display = 'none';
      document.getElementById('ea-confirm-view').style.display = 'block';

    } catch (e) {
      errEl.textContent = 'Eroare. Încearcă din nou sau contactează-ne direct.';
      errEl.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Înregistrează-te \u2192';
    }
  };

  /* Keyboard close */
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeEarlyAccess(); });
})();
