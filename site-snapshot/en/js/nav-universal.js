/**
 * SBR Universal Navigation v13 — Bilingv RO / EN (v11: Verificare gratuită + Prețuri; v12: bara se strânge pe ecrane medii; v13: submeniuri animate, tastatură, iconițe)
 * Modal centrat selectare limbă + motor domestic i18n.js v6
 * Nav text: nativ RO/EN (nu depinde de Google Translate)
 */
(function(){
'use strict';

/* ── Config ──────────────────────────────────────────────── */
var SUPABASE_URL = 'https://zxonzzojynrkzaiaacte.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0';

var LANGS = ['RO', 'EN'];
var FLAGS      = { RO: '🇷🇴', EN: '🇬🇧' };
var FLAG_EMOJI = { RO: '🇷🇴', EN: '🇬🇧' };
var NAMES = { RO: 'Română', EN: 'English' };
var GT    = { RO: '', EN: 'en' };

/* ── Texte nav bilingve ──────────────────────────────────── */
var T = {
  RO: {
    ecosistem:        'Ecosistem',
    institute:        'Institute',
    about:            'Despre noi',
    contact:          'Contact',
    verified_nav:     'SBR Verified',
    sbrai_nav:        'SBR AI',
    costopt_nav:      'Optimizare Costuri',
    lbl_other:        'Alte produse',
    other_title:      'Consultanță Anti-Fraud',
    other_sub:        'Training, audit și advisory pentru companii',
    lbl_ai_tool:      'Instrument',
    lbl_ai_context:   'Context',
    sbrai_tool_title: 'SBR AI',
    sbrai_tool_sub:   'Analist interactiv de risc',
    aiprevent_title:  'AI Fraud Prevention',
    aiprevent_sub:    'Prevenția fraudei asistată de AI',
    aiweapon_title:   'AI în mâna infractorilor',
    aiweapon_sub:     'Cum este exploatată inteligența artificială',
    aiedu_title:      'De ce contează educația anti-fraudă',
    aiedu_sub:        'Rolul educației în prevenția fraudei',
    mob_verified_sub: 'Companii',
    mob_sbrai_sub:    'Analist risc',
    mob_costopt_sub:  'Audit costuri',
    mob_other_sub:    'Consultanță',
    lbl_abonamente:   'Abonamente',
    lbl_cunoastere:   'Cunoaștere',
    lbl_instrumente:  'Instrumente',
    free_tools:       'Verificare gratuită',
    lbl_verificare:   'Suita de verificare',
    lbl_despre_ver:   'Despre verificări',
    tool_link_title:  'Link & Website Checker',
    tool_link_sub:    'Analizează un link înainte de click',
    tool_iban_title:  'IBAN Checker',
    tool_iban_sub:    'Format și cifre de control',
    tool_media_title: 'Deepfake Checker',
    tool_media_sub:   'Proveniență media (C2PA)',
    tool_method_title:'Metodologie',
    tool_method_sub:  'Surse, limite, date',
    dd_free_foot:     'Gratuit, fără cont. IBAN-ul se verifică local, în browserul tău.',
    pricing_nav:      'Prețuri',
    pricing_sub:      'Planuri cu plată unică',
    mob_tools_sub:    'Fără cont',
    personal_title:   'Personal',
    personal_sub:     'Protecție completă persoane fizice',
    business_title:   'Business',
    business_sub:     'Sisteme de control pentru organizații',
    signals_title:    'Signals',
    signals_sub:      'Intelligence lunar actualizat',
    codex_title:      'Codex',
    codex_sub:        '300+ tipologii fraudă documentate',
    afis_title:       'AFIS',
    afis_sub:         'Sistemul defensiv cognitiv',
    score_title:      'SBR Score',
    score_sub:        'Diagnostic vulnerabilitate gratuit',
    postfraud_title:  'Post-Fraud',
    postfraud_sub:    'Protocol urgență post-incident',
    lbl_certificare:  'Certificare',
    lbl_servicii:     'Servicii',
    certif_title:     'Certificări',
    certif_sub:       '3 niveluri, 15 titulaturi',
    research_title:   'Research',
    research_sub:     'Studii fraudă digitală România',
    pub_title:        'Publications',
    pub_sub:          'Codex, Rapoarte, White Papers',
    consult_title:    'Consulting',
    consult_sub:      'Advisory IMM & Corporate',
    login:            'Autentificare',
    dashboard:        'Dashboard',
    diagnostic:       'Diagnostic',
    mob_principal:    'Principal',
    mob_postfraud:    'Post-Fraud',
    mob_planuri:      'Planuri',
    mob_altele:       'Altele',
    mob_limba:        'Limbă',
    mob_home_sub:     'SBR.',
    mob_diag_sub:     'Gratuit',
    mob_codex_sub:    '300+ tipologii',
    mob_afis_sub:     'Framework',
    mob_signals_sub:  'Intelligence feed',
    mob_inst_sub:     'Certificare',
    mob_overview:     'Overview',
    mob_checklist:    'Checklist 72h',
    mob_reclamatii:   'Reclamații',
    mob_chargeback:   'Chargeback',
    mob_personal_sub: '99-449 RON · plată unică',
    mob_business_sub: '99-5.000 EUR · plată unică',
  },
  EN: {
    ecosistem:        'Ecosystem',
    institute:        'Institute',
    about:            'About Us',
    contact:          'Contact',
    verified_nav:     'SBR Verified',
    sbrai_nav:        'SBR AI',
    costopt_nav:      'Cost Optimization',
    lbl_other:        'Other Products',
    other_title:      'Anti-Fraud Advisory',
    other_sub:        'Training, audits and advisory for companies',
    lbl_ai_tool:      'Tool',
    lbl_ai_context:   'Context',
    sbrai_tool_title: 'SBR AI',
    sbrai_tool_sub:   'Interactive risk analyst',
    aiprevent_title:  'AI Fraud Prevention',
    aiprevent_sub:    'AI-assisted fraud prevention',
    aiweapon_title:   'AI in the Hands of Fraudsters',
    aiweapon_sub:     'How artificial intelligence is being exploited',
    aiedu_title:      'Why Anti-Fraud Education Matters',
    aiedu_sub:        'The role of education in fraud prevention',
    mob_verified_sub: 'For companies',
    mob_sbrai_sub:    'Risk analyst',
    mob_costopt_sub:  'Cost audits',
    mob_other_sub:    'Advisory',
    lbl_abonamente:   'Subscriptions',
    lbl_cunoastere:   'Knowledge',
    lbl_instrumente:  'Tools',
    free_tools:       'Free checks',
    lbl_verificare:   'Verification suite',
    lbl_despre_ver:   'About the checks',
    tool_link_title:  'Link & Website Checker',
    tool_link_sub:    'Analyse a link before you click',
    tool_iban_title:  'IBAN Checker',
    tool_iban_sub:    'Format and check digits',
    tool_media_title: 'Deepfake Checker',
    tool_media_sub:   'Media provenance (C2PA)',
    tool_method_title:'Methodology',
    tool_method_sub:  'Sources, limits, data',
    dd_free_foot:     'Free, no account. The IBAN is checked locally, in your browser.',
    pricing_nav:      'Pricing',
    pricing_sub:      'One-time payment plans',
    mob_tools_sub:    'No account',
    personal_title:   'Personal',
    personal_sub:     'Full protection for individuals',
    business_title:   'Business',
    business_sub:     'Control systems for organizations',
    signals_title:    'Signals',
    signals_sub:      'Monthly updated intelligence',
    codex_title:      'Codex',
    codex_sub:        '300+ documented fraud typologies',
    afis_title:       'AFIS',
    afis_sub:         'The cognitive defense system',
    score_title:      'SBR Score',
    score_sub:        'Free vulnerability diagnostic',
    postfraud_title:  'Post-Fraud',
    postfraud_sub:    'Emergency post-incident protocol',
    lbl_certificare:  'Certification',
    lbl_servicii:     'Services',
    certif_title:     'Certifications',
    certif_sub:       '3 levels, 15 titles',
    research_title:   'Research',
    research_sub:     'Digital fraud studies Romania',
    pub_title:        'Publications',
    pub_sub:          'Codex, Reports, White Papers',
    consult_title:    'Consulting',
    consult_sub:      'SME & Corporate Advisory',
    login:            'Login',
    dashboard:        'Dashboard',
    diagnostic:       'Diagnostic',
    mob_principal:    'Main',
    mob_postfraud:    'Post-Fraud',
    mob_planuri:      'Plans',
    mob_altele:       'Other',
    mob_limba:        'Language',
    mob_home_sub:     'SBR.',
    mob_diag_sub:     'Free',
    mob_codex_sub:    '300+ typologies',
    mob_afis_sub:     'Framework',
    mob_signals_sub:  'Intelligence feed',
    mob_inst_sub:     'Certification',
    mob_overview:     'Overview',
    mob_checklist:    'Checklist 72h',
    mob_reclamatii:   'Claims',
    mob_chargeback:   'Chargeback',
    mob_personal_sub: '99-449 RON · one-time',
    mob_business_sub: '99-5,000 EUR · one-time',
  }
};

/* ── translate.goog proxy ────────────────────────────────── */
var _ORIG = 'sbr.systems';
var _GTH  = 'sbr-systems.translate.goog';
var _ON_GT = location.hostname.indexOf('.translate.goog') > -1;

/* Detectare limbă curentă */
var LANG = 'RO';
if (_ON_GT) {
  try {
    var _p  = new URLSearchParams(location.search);
    var _tl = _p.get('_x_tr_tl');
    if (_tl === 'en') { LANG = 'EN'; localStorage.setItem('sbr_lang', 'EN'); }
  } catch(e) {}
} else {
  try { LANG = localStorage.getItem('sbr_lang') || 'RO'; } catch(e) {}
  if (LANG !== 'RO' && LANG !== 'EN') LANG = 'RO';
}

var L = T[LANG] || T.RO;

if (document.getElementById('sbrN')) return;

/* ── Helper: cale corectă ────────────────────────────────── */
function _fixPath(path) {
  if (!path || path === '/') return '/index.html';
  if (!/\.[a-zA-Z]{2,5}$/.test(path)) path = path + '.html';
  return path;
}

function _href(file) {
  if (_ON_GT) {
    return 'https://' + _GTH + '/' + file +
      '?_x_tr_sl=ro&_x_tr_tl=' + (GT[LANG] || 'en') + '&_x_tr_hl=ro&_x_tr_pto=wapp';
  }
  return file;
}

/* ── Ascunde banner Google Translate ─────────────────────── */
var gts = document.createElement('style');
gts.textContent =
  'body{top:0!important;padding-top:58px!important}' +
  '.goog-te-banner-frame,.skiptranslate,.goog-te-gadget{display:none!important;height:0!important}' +
  '#google_translate_element{display:none!important}' +
  '.VIpgJd-yAWNEb-L7lbkb,.VIpgJd-ZVi9od-aZ2wEe{display:none!important}' +
  'body.translated-ltr,body.translated-rtl{margin-top:0!important}';
document.head.appendChild(gts);

/* ── CSS Nav ─────────────────────────────────────────────── */
var css = document.createElement('style');
css.id = 'sbrN-css';
css.textContent = [
  '#sbrN{position:fixed;top:0;left:0;right:0;height:58px;z-index:9500;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(14px,3.5vw,44px);background:rgba(6,6,6,.97);border-bottom:1px solid rgba(255,255,255,.05);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}',
  '#sbrN-logo{font-family:"Bebas Neue",sans-serif;font-size:20px;letter-spacing:5px;color:#fff;text-decoration:none;display:flex;align-items:center;flex-shrink:0}',
  '#sbrN-logo .r{color:#C0392B}',
  '#sbrN-logo .sub{font-family:"IBM Plex Mono",monospace;font-size:7px;letter-spacing:2px;color:#C0392B;margin-left:7px;text-transform:uppercase;align-self:center;margin-top:2px}',
  '#sbrN-links{display:flex;align-items:center;height:58px;margin:0 auto}',
  '.sbrN-item{position:relative;height:58px;display:flex;align-items:center}',
  '.sbrN-btn{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;color:#c4c4c4!important;text-decoration:none!important;padding:0 14px;height:58px;display:flex;align-items:center;gap:5px;transition:color .15s;white-space:nowrap;background:none;border:none;cursor:pointer}',
  '.sbrN-btn:hover{color:#fff!important}',
  '.sbrN-btn{position:relative;--bp:14px}',
  '.sbrN-btn::after{content:"";position:absolute;left:var(--bp);right:var(--bp);bottom:13px;height:1px;background:#E74C3C;transform:scaleX(0);transform-origin:left center;transition:transform .3s cubic-bezier(.2,.7,.2,1)}',
  '.sbrN-item:hover>.sbrN-btn::after,.sbrN-item.open>.sbrN-btn::after{transform:scaleX(1)}',
  '.sbrN-item:hover>.sbrN-btn,.sbrN-item.open>.sbrN-btn{color:#fff!important}',
  '.sbrN-btn:focus-visible,.dd-link:focus-visible{outline:2px solid #E74C3C;outline-offset:-2px}',
  '.sbrN-arr{font-size:8px;opacity:.6;transition:transform .28s cubic-bezier(.2,.7,.2,1),opacity .2s,color .2s;display:inline-block}',
  '.sbrN-item:hover .sbrN-arr,.sbrN-item.open .sbrN-arr{transform:rotate(180deg);opacity:1;color:#E74C3C}',
  /* panel: hidden by default, fades/slides in, closes after a short delay so the pointer can travel from the label into the panel */
  '.sbrN-dd{position:absolute;top:58px;left:0;width:min(560px,calc(100vw - 32px));background:rgba(9,9,9,.985);border:1px solid rgba(255,255,255,.09);border-top:0;box-shadow:0 30px 70px rgba(0,0,0,.92);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);z-index:9600;padding:26px 28px 22px;opacity:0;visibility:hidden;pointer-events:none;transform:translateY(10px);transition:opacity .16s ease .14s,transform .2s ease .14s,visibility 0s linear .34s}',
  '.sbrN-dd::before{content:"";position:absolute;left:-1px;right:-1px;top:-2px;height:2px;background:#C0392B;transform:scaleX(0);transform-origin:left center;transition:transform .5s cubic-bezier(.2,.7,.2,1)}',
  '.sbrN-dd::after{content:"";position:absolute;left:0;right:0;top:-14px;height:14px}',
  '.sbrN-item:hover>.sbrN-dd,.sbrN-item.open>.sbrN-dd{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .18s ease,transform .24s cubic-bezier(.2,.7,.2,1),visibility 0s}',
  '.sbrN-item:hover>.sbrN-dd::before,.sbrN-item.open>.sbrN-dd::before{transform:scaleX(1)}',
  '.sbrN-item.is-esc>.sbrN-dd{opacity:0!important;visibility:hidden!important;pointer-events:none!important}',
  '.sbrN-dd-eco>.sbrN-dd{left:0;width:min(900px,calc(100vw - 32px))}',
  '.sbrN-dd-free>.sbrN-dd{left:0;width:min(620px,calc(100vw - 32px))}',
  '.sbrN-dd-ai>.sbrN-dd,.sbrN-dd-inst>.sbrN-dd{left:auto;right:0;width:min(520px,calc(100vw - 32px))}',
  '.dd-cols{display:grid;gap:8px 30px}',
  '.dd-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}',
  '.dd-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}',
  '.dd-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '.dd-cols>div:nth-child(2){--c:1}.dd-cols>div:nth-child(3){--c:2}.dd-cols>div:nth-child(4){--c:3}',
  '.dd-link:nth-of-type(2){--l:1}.dd-link:nth-of-type(3){--l:2}.dd-link:nth-of-type(4){--l:3}',
  '.dd-col-label{position:relative;font-family:"IBM Plex Mono",monospace;font-size:10px;letter-spacing:3px;color:#E86A5A;text-transform:uppercase;margin-bottom:10px;padding-bottom:9px;border-bottom:1px solid rgba(255,255,255,.08)}',
  '.dd-col-label::after{content:"";position:absolute;left:0;bottom:-1px;height:1px;width:0;background:#E74C3C;transition:width .5s cubic-bezier(.2,.7,.2,1)}',
  '.sbrN-item:hover .dd-col-label::after,.sbrN-item.open .dd-col-label::after{width:34px}',
  '.dd-link{position:relative;display:flex;flex-direction:column;gap:4px;padding:10px 12px 10px 16px;margin-bottom:2px;text-decoration:none!important;transition:background .2s}',
  '.dd-link::before{content:"";position:absolute;left:0;top:8px;bottom:8px;width:2px;background:#E74C3C;transform:scaleY(0);transform-origin:center;transition:transform .22s cubic-bezier(.2,.7,.2,1)}',
  '.dd-link:hover,.dd-link:focus-visible{background:linear-gradient(90deg,rgba(192,57,43,.16),rgba(192,57,43,0) 90%)}',
  '.dd-link:hover::before,.dd-link:focus-visible::before{transform:scaleY(1)}',
  '.sbrN-item:hover .dd-link,.sbrN-item.open .dd-link{animation:sbrDdIn .34s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(70ms + var(--c,0)*50ms + var(--l,0)*40ms)}',
  '@keyframes sbrDdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
  '.dd-link-title{font-family:"Bebas Neue",sans-serif;font-size:21px;letter-spacing:.5px;color:#f0f0f0!important;line-height:1;transition:transform .22s cubic-bezier(.2,.7,.2,1),color .15s}',
  '.dd-link:hover .dd-link-title,.dd-link:focus-visible .dd-link-title{color:#fff!important;transform:translateX(4px)}',
  '.dd-link-sub{font-family:"IBM Plex Mono",monospace;font-size:10.5px;color:#a8a8a8!important;line-height:1.4;transition:transform .22s cubic-bezier(.2,.7,.2,1)}',
  '.dd-link:hover .dd-link-sub,.dd-link:focus-visible .dd-link-sub{transform:translateX(4px)}',
  '.dd-link.has-ic{display:grid;grid-template-columns:36px minmax(0,1fr);column-gap:13px;row-gap:3px;align-items:start}',
  '.dd-link.has-ic .dd-ic{grid-row:1/span 2;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(255,255,255,.12);color:#E74C3C;transition:border-color .2s,background .2s,color .2s}',
  '.dd-link.has-ic:hover .dd-ic,.dd-link.has-ic:focus-visible .dd-ic{border-color:#E74C3C;background:#C0392B;color:#fff}',
  '.dd-link.has-ic .dd-link-title,.dd-link.has-ic .dd-link-sub{grid-column:2}',
  '.dd-foot{grid-column:1/-1;margin-top:10px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);font-family:"IBM Plex Mono",monospace;font-size:10.5px;line-height:1.5;color:#a8a8a8}',
  '@media(prefers-reduced-motion:reduce){.sbrN-dd,.sbrN-dd::before,.dd-link,.dd-link::before,.dd-link-title,.dd-link-sub,.dd-col-label::after,.sbrN-btn::after,.sbrN-arr{transition:none!important;animation:none!important}.sbrN-dd{transform:none!important}.dd-link:hover .dd-link-title,.dd-link:hover .dd-link-sub{transform:none!important}}',
  '#sbrN-right{display:flex;align-items:center;gap:8px;flex-shrink:0}',
  '#sbrN-lang{position:relative;display:inline-flex;align-items:center}',
  /* Buton rotund cu steag */
  '.snl-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);cursor:pointer;font-size:20px;line-height:1;user-select:none;padding:0;outline:none;transition:border-color .2s,background .2s;}',
  '.snl-btn:hover{border-color:rgba(192,57,43,.6);background:rgba(192,57,43,.1);}',
  '.snl-btn.open{border-color:#C0392B;background:rgba(192,57,43,.15);}',
  '.snl-code{display:none}',
  '.snl-dot{display:none}',
  '.snl-arr{display:none}',
  /* Modal centrat selectare limbă */
  '#sbr-lang-modal-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:99999;align-items:center;justify-content:center;backdrop-filter:blur(8px);}',
  '#sbr-lang-modal-overlay.open{display:flex;}',
  '#sbr-lang-modal{background:#111;border:1px solid rgba(255,255,255,.08);padding:48px 40px;min-width:360px;max-width:440px;width:90%;position:relative;box-shadow:0 32px 80px rgba(0,0,0,.9);}',
  '#sbr-lang-modal-title{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:4px;color:rgba(192,57,43,.7);text-transform:uppercase;margin:0 0 32px;text-align:center;}',
  '.sbr-lang-option{display:flex;align-items:center;gap:20px;padding:20px 24px;cursor:pointer;border:1px solid rgba(255,255,255,.06);margin-bottom:12px;transition:all .2s;background:rgba(255,255,255,.02);}',
  '.sbr-lang-option:last-child{margin-bottom:0;}',
  '.sbr-lang-option:hover{border-color:rgba(192,57,43,.5);background:rgba(192,57,43,.06);}',
  '.sbr-lang-option.active{border-color:#C0392B;background:rgba(192,57,43,.1);}',
  '.sbr-lang-flag{font-size:36px;line-height:1;flex-shrink:0;}',
  '.sbr-lang-info{flex:1;}',
  '.sbr-lang-name{font-family:"Bebas Neue",sans-serif;font-size:28px;color:#fff;line-height:1;margin-bottom:4px;}',
  '.sbr-lang-sub{font-family:"IBM Plex Mono",monospace;font-size:8px;letter-spacing:2px;color:#9a9a9a;text-transform:uppercase;}',
  '.sbr-lang-check{font-size:16px;color:#C0392B;opacity:0;transition:opacity .15s;}',
  '.sbr-lang-option.active .sbr-lang-check{opacity:1;}',
  '#sbr-lang-modal-close{position:absolute;top:16px;right:20px;background:none;border:none;color:#444;font-size:18px;cursor:pointer;padding:4px;line-height:1;transition:color .15s;}',
  '#sbr-lang-modal-close:hover{color:#c4c4c4;}',
  '.sbrN-ghost{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;background:transparent;border:1px solid rgba(255,255,255,.1);color:#c4c4c4!important;padding:7px 14px;cursor:pointer;text-decoration:none!important;transition:all .18s;white-space:nowrap;display:inline-flex;align-items:center}',
  '.sbrN-ghost:hover{border-color:rgba(192,57,43,.35);color:#eee!important}',
  '.sbrN-cta{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;text-transform:uppercase;background:#C0392B;color:#fff!important;padding:9px 18px;border:none;cursor:pointer;text-decoration:none!important;transition:background .18s;white-space:nowrap;display:inline-flex;align-items:center}',
  '.sbrN-cta:hover{background:#E74C3C;color:#fff!important}',
  '#sbrN-burger{display:none;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;cursor:pointer;background:none;border:1px solid rgba(255,255,255,.08);padding:10px 9px;transition:border-color .18s;flex-shrink:0}',
  '#sbrN-burger span{display:block;height:1.5px;background:#ccc;border-radius:2px;transition:all .32s cubic-bezier(.4,0,.2,1);transform-origin:center}',
  '#sbrN-burger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg)}',
  '#sbrN-burger.open span:nth-child(2){opacity:0;transform:scaleX(0)}',
  '#sbrN-burger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}',
  '#sbrN-burger:hover{border-color:rgba(192,57,43,.3)}',
  '#sbrN-mob{position:fixed;top:58px;left:0;right:0;bottom:0;z-index:9400;background:rgba(5,5,5,.99);overflow-y:auto;transform:translateX(100%);transition:transform .32s cubic-bezier(.4,0,.2,1);visibility:hidden;pointer-events:none;padding:clamp(18px,4vw,36px) clamp(18px,5vw,40px)}',
  '#sbrN-mob.open{transform:translateX(0);visibility:visible;pointer-events:auto}',
  '.mob-sec{margin-bottom:22px}',
  '.mob-label{font-family:"IBM Plex Mono",monospace;font-size:7px;letter-spacing:4px;color:rgba(192,57,43,.4);text-transform:uppercase;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.04)}',
  '.mob-link{display:flex;align-items:center;justify-content:space-between;padding:11px 0;font-family:"Bebas Neue",sans-serif;font-size:28px;color:#eee!important;text-decoration:none!important;border-bottom:1px solid rgba(255,255,255,.03);transition:color .15s}',
  '.mob-link:hover{color:#C0392B!important}',
  '.mob-link:last-child{border-bottom:none}',
  '.mob-link-sub{font-family:"IBM Plex Mono",monospace;font-size:8px;letter-spacing:2px;color:#8a8a8a;text-transform:uppercase}',
  '.mob-small{display:flex;flex-wrap:wrap;gap:12px;padding:8px 0}',
  '.mob-small-link{font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;color:#9a9a9a!important;text-decoration:none!important;text-transform:uppercase;transition:color .15s}',
  '.mob-small-link:hover{color:#c4c4c4!important}',
  '.mob-auth{display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.04)}',
  '.mob-lang-btn{cursor:pointer;display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border:1px solid rgba(255,255,255,.08);font-family:"IBM Plex Mono",monospace;font-size:9px;letter-spacing:2px;color:#a0a0a0;transition:all .15s}',
  '.mob-lang-btn:hover,.mob-lang-btn.sel{border-color:rgba(192,57,43,.4);color:#eee}',
  '.mob-lang-btn.sel{color:#C0392B;border-color:rgba(192,57,43,.5)}',
  '[data-sbrauth="member"]{display:none}[data-sbrauth="guest"]{display:flex}',
  /* v12: with 10 entries the bar needs ~1560px at full spacing, so it tightens between 1231 and 1560px and uses the menu button below 1230px */
  '@media(max-width:1560px){.sbrN-btn{padding:0 9px;letter-spacing:1.2px;--bp:9px}#sbrN-right{gap:6px}.sbrN-ghost{padding:7px 10px;letter-spacing:1.2px}.sbrN-cta{padding:9px 12px;letter-spacing:1.2px}}',
  '@media(max-width:1440px){.sbrN-btn{padding:0 6px;letter-spacing:.8px;--bp:6px}#sbrN-logo{letter-spacing:4px}#sbrN-logo .sub{display:none}}',
  '@media(max-width:1230px){#sbrN-links{display:none}#sbrN-burger{display:flex}.d-only{display:none!important}}',
  '@media(min-width:1231px){#sbrN-burger{display:none!important}#sbrN-mob{display:none!important}}',
  'nav.sbr-nav,.sbr-nav,#sbr-nav,#snav{display:none!important}'
].join('');
document.head.appendChild(css);

/* ── Build nav ───────────────────────────────────────────── */
var nav = document.createElement('nav');
nav.id = 'sbrN';
nav.className = 'notranslate';
nav.setAttribute('translate', 'no');
nav.innerHTML = '<a href="' + _href('index.html') + '" id="sbrN-logo"><span class="r">SBR</span><span class="r">.</span><span class="sub">Anti-Fraud</span></a>';

var lnk = document.createElement('div');
lnk.id = 'sbrN-links';
lnk.innerHTML =
  '<div class="sbrN-item sbrN-dd-eco"><button class="sbrN-btn" aria-haspopup="true" aria-expanded="false">' + L.ecosistem + ' <span class="sbrN-arr">&#9662;</span></button>' +
  '<div class="sbrN-dd"><div class="dd-cols dd-cols-4">' +
  '<div><div class="dd-col-label">' + L.lbl_abonamente + '</div>' +
  '<a href="' + _href('personal.html') + '" class="dd-link"><span class="dd-link-title">' + L.personal_title + '</span><span class="dd-link-sub">' + L.personal_sub + '</span></a>' +
  '<a href="' + _href('business.html') + '" class="dd-link"><span class="dd-link-title">' + L.business_title + '</span><span class="dd-link-sub">' + L.business_sub + '</span></a>' +
  '<a href="' + _href('signals.html') + '" class="dd-link"><span class="dd-link-title">' + L.signals_title + '</span><span class="dd-link-sub">' + L.signals_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_cunoastere + '</div>' +
  '<a href="' + _href('codex.html') + '" class="dd-link"><span class="dd-link-title">' + L.codex_title + '</span><span class="dd-link-sub">' + L.codex_sub + '</span></a>' +
  '<a href="' + _href('afis.html') + '" class="dd-link"><span class="dd-link-title">' + L.afis_title + '</span><span class="dd-link-sub">' + L.afis_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_instrumente + '</div>' +
  '<a href="' + _href('quiz.html') + '" class="dd-link"><span class="dd-link-title">' + L.score_title + '</span><span class="dd-link-sub">' + L.score_sub + '</span></a>' +
  '<a href="' + _href('postfraud.html') + '" class="dd-link"><span class="dd-link-title">' + L.postfraud_title + '</span><span class="dd-link-sub">' + L.postfraud_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_other + '</div>' +
  '<a href="' + _href('other-products.html') + '" class="dd-link"><span class="dd-link-title">' + L.other_title + '</span><span class="dd-link-sub">' + L.other_sub + '</span></a></div>' +
  '</div></div></div>' +
  '<div class="sbrN-item sbrN-dd-free"><button class="sbrN-btn" aria-haspopup="true" aria-expanded="false">' + L.free_tools + ' <span class="sbrN-arr">&#9662;</span></button>' +
  '<div class="sbrN-dd"><div class="dd-cols dd-cols-2">' +
  '<div><div class="dd-col-label">' + L.lbl_verificare + '</div>' +
  '<a href="' + _href('verificare-link.html') + '" class="dd-link has-ic"><span class="dd-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></span><span class="dd-link-title">' + L.tool_link_title + '</span><span class="dd-link-sub">' + L.tool_link_sub + '</span></a>' +
  '<a href="' + _href('verificare-iban.html') + '" class="dd-link has-ic"><span class="dd-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3 10h18M7 15h4"/></svg></span><span class="dd-link-title">' + L.tool_iban_title + '</span><span class="dd-link-sub">' + L.tool_iban_sub + '</span></a>' +
  '<a href="' + _href('verificare-media.html') + '" class="dd-link has-ic"><span class="dd-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 16l5-5 4 4 3-3 6 5"/><circle cx="16" cy="9.5" r="1.2"/></svg></span><span class="dd-link-title">' + L.tool_media_title + '</span><span class="dd-link-sub">' + L.tool_media_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_despre_ver + '</div>' +
  '<a href="' + _href('verificare.html') + '" class="dd-link"><span class="dd-link-title">' + L.lbl_verificare + '</span><span class="dd-link-sub">' + L.mob_tools_sub + '</span></a>' +
  '<a href="' + _href('metodologie.html') + '" class="dd-link"><span class="dd-link-title">' + L.tool_method_title + '</span><span class="dd-link-sub">' + L.tool_method_sub + '</span></a></div>' +
  '<p class="dd-foot">' + L.dd_free_foot + '</p>' +
  '</div></div></div>' +
  '<div class="sbrN-item"><a href="' + _href('index.html') + '#preturi" class="sbrN-btn">' + L.pricing_nav + '</a></div>' +
  '<div class="sbrN-item"><a href="' + _href('verified.html') + '" class="sbrN-btn">' + L.verified_nav + '</a></div>' +
  '<div class="sbrN-item sbrN-dd-ai"><button class="sbrN-btn" aria-haspopup="true" aria-expanded="false">' + L.sbrai_nav + ' <span class="sbrN-arr">&#9662;</span></button>' +
  '<div class="sbrN-dd"><div class="dd-cols dd-cols-2">' +
  '<div><div class="dd-col-label">' + L.lbl_ai_tool + '</div>' +
  '<a href="' + _href('sbr-ai.html') + '" class="dd-link"><span class="dd-link-title">' + L.sbrai_tool_title + '</span><span class="dd-link-sub">' + L.sbrai_tool_sub + '</span></a>' +
  '<a href="' + _href('ai-fraud-prevention.html') + '" class="dd-link"><span class="dd-link-title">' + L.aiprevent_title + '</span><span class="dd-link-sub">' + L.aiprevent_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_ai_context + '</div>' +
  '<a href="' + _href('ai-in-hands-of-fraudsters.html') + '" class="dd-link"><span class="dd-link-title">' + L.aiweapon_title + '</span><span class="dd-link-sub">' + L.aiweapon_sub + '</span></a>' +
  '<a href="' + _href('anti-fraud-education.html') + '" class="dd-link"><span class="dd-link-title">' + L.aiedu_title + '</span><span class="dd-link-sub">' + L.aiedu_sub + '</span></a></div>' +
  '</div></div></div>' +
  '<div class="sbrN-item"><a href="' + _href('cost-optimization.html') + '" class="sbrN-btn">' + L.costopt_nav + '</a></div>' +
  '<div class="sbrN-item sbrN-dd-inst"><button class="sbrN-btn" aria-haspopup="true" aria-expanded="false">' + L.institute + ' <span class="sbrN-arr">&#9662;</span></button>' +
  '<div class="sbrN-dd"><div class="dd-cols dd-cols-2">' +
  '<div><div class="dd-col-label">' + L.lbl_certificare + '</div>' +
  '<a href="' + _href('institute.html') + '#education" class="dd-link"><span class="dd-link-title">' + L.certif_title + '</span><span class="dd-link-sub">' + L.certif_sub + '</span></a>' +
  '<a href="' + _href('institute.html') + '#research" class="dd-link"><span class="dd-link-title">' + L.research_title + '</span><span class="dd-link-sub">' + L.research_sub + '</span></a></div>' +
  '<div><div class="dd-col-label">' + L.lbl_servicii + '</div>' +
  '<a href="' + _href('institute.html') + '#publications" class="dd-link"><span class="dd-link-title">' + L.pub_title + '</span><span class="dd-link-sub">' + L.pub_sub + '</span></a>' +
  '<a href="' + _href('institute.html') + '#consulting" class="dd-link"><span class="dd-link-title">' + L.consult_title + '</span><span class="dd-link-sub">' + L.consult_sub + '</span></a></div>' +
  '</div></div></div>' +
  '<div class="sbrN-item"><a href="' + _href('about.html') + '" class="sbrN-btn">' + L.about + '</a></div>' +
  '<div class="sbrN-item"><a href="' + _href('contact.html') + '" class="sbrN-btn">' + L.contact + '</a></div>';
nav.appendChild(lnk);

var rgt = document.createElement('div');
rgt.id = 'sbrN-right';

/* Buton flag rotund — deschide modalul centrat */
var ldHtml =
  '<div id="sbrN-lang" class="notranslate" translate="no">' +
  '<button class="snl-btn" id="snl-btn" onclick="sbrNOpenLangModal()" aria-label="Language / Limbă" title="Language / Limbă">' +
  '<span id="snl-flag-icon">' + FLAG_EMOJI[LANG] + '</span>' +
  '</button>' +
  '</div>';

rgt.innerHTML = ldHtml +
  '<a href="' + _href('login.html') + '" class="sbrN-ghost d-only" data-sbrauth="guest" id="sbrN-li">' + L.login + '</a>' +
  '<a href="' + _href('dashboard.html') + '" class="sbrN-ghost d-only" data-sbrauth="member" style="display:none">' + L.dashboard + '</a>' +
  '<a href="' + _href('quiz.html') + '" class="sbrN-cta">' + L.diagnostic + ' &#8594;</a>' +
  '<button id="sbrN-burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>';
nav.appendChild(rgt);

var mob = document.createElement('div');
mob.id = 'sbrN-mob';
mob.className = 'notranslate';
mob.setAttribute('translate', 'no');
mob.setAttribute('role', 'dialog');
mob.innerHTML = [
  '<div class="mob-sec"><div class="mob-label">' + L.mob_principal + '</div>',
  '<a href="' + _href('index.html') + '" class="mob-link" onclick="sbrNCM()"><span>Home</span><span class="mob-link-sub">' + L.mob_home_sub + '</span></a>',
  '<a href="' + _href('quiz.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.diagnostic + '</span><span class="mob-link-sub">' + L.mob_diag_sub + '</span></a>',
  '<a href="' + _href('codex.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.codex_title + '</span><span class="mob-link-sub">' + L.mob_codex_sub + '</span></a>',
  '<a href="' + _href('afis.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.afis_title + '</span><span class="mob-link-sub">' + L.mob_afis_sub + '</span></a>',
  '<a href="' + _href('signals.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.signals_title + '</span><span class="mob-link-sub">' + L.mob_signals_sub + '</span></a>',
  '<a href="' + _href('institute.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.institute + '</span><span class="mob-link-sub">' + L.mob_inst_sub + '</span></a>',
  '<a href="' + _href('verified.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.verified_nav + '</span><span class="mob-link-sub">' + L.mob_verified_sub + '</span></a>',
  '<a href="' + _href('sbr-ai.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.sbrai_nav + '</span><span class="mob-link-sub">' + L.mob_sbrai_sub + '</span></a>',
  '<a href="' + _href('cost-optimization.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.costopt_nav + '</span><span class="mob-link-sub">' + L.mob_costopt_sub + '</span></a>',
  '<a href="' + _href('other-products.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.lbl_other + '</span><span class="mob-link-sub">' + L.mob_other_sub + '</span></a></div>',
  '<div class="mob-sec"><div class="mob-label">' + L.free_tools + '</div>',
  '<a href="' + _href('verificare-link.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.tool_link_title + '</span><span class="mob-link-sub">' + L.mob_tools_sub + '</span></a>',
  '<a href="' + _href('verificare-iban.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.tool_iban_title + '</span><span class="mob-link-sub">' + L.mob_tools_sub + '</span></a>',
  '<a href="' + _href('verificare-media.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.tool_media_title + '</span><span class="mob-link-sub">' + L.mob_tools_sub + '</span></a>',
  '<a href="' + _href('index.html') + '#preturi" class="mob-link" onclick="sbrNCM()"><span>' + L.pricing_nav + '</span><span class="mob-link-sub">' + L.pricing_sub + '</span></a></div>',
  '<div class="mob-sec"><div class="mob-label">' + L.mob_postfraud + '</div>',
  '<a href="' + _href('postfraud.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.mob_overview + '</span><span class="mob-link-sub">Protocol</span></a>',
  '<a href="' + _href('postfraud-checklist.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.mob_checklist + '</span><span class="mob-link-sub">Urgent</span></a>',
  '<a href="' + _href('postfraud-reclamatii.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.mob_reclamatii + '</span><span class="mob-link-sub">DIICOT &middot; ANPC</span></a>',
  '<a href="' + _href('postfraud-chargeback.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.mob_chargeback + '</span><span class="mob-link-sub">Card fraud</span></a></div>',
  '<div class="mob-sec"><div class="mob-label">' + L.mob_planuri + '</div>',
  '<a href="' + _href('personal.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.personal_title + '</span><span class="mob-link-sub">' + L.mob_personal_sub + '</span></a>',
  '<a href="' + _href('business.html') + '" class="mob-link" onclick="sbrNCM()"><span>' + L.business_title + '</span><span class="mob-link-sub">' + L.mob_business_sub + '</span></a></div>',
  '<div class="mob-sec"><div class="mob-label">' + L.mob_altele + '</div><div class="mob-small">',
  '<a href="' + _href('score.html') + '" class="mob-small-link" onclick="sbrNCM()">SBR Score</a>',
  '<a href="' + _href('about.html') + '" class="mob-small-link" onclick="sbrNCM()">' + L.about + '</a>',
  '<a href="' + _href('faq.html') + '" class="mob-small-link" onclick="sbrNCM()">FAQ</a>',
  '<a href="' + _href('contact.html') + '" class="mob-small-link" onclick="sbrNCM()">' + L.contact + '</a>',
  '<a href="' + _href('gdpr.html') + '" class="mob-small-link" onclick="sbrNCM()">GDPR</a>',
  '</div></div>',
  '<div class="mob-sec"><div class="mob-label">' + L.mob_limba + '</div><div class="mob-small">',
  LANGS.map(function(l) {
    return '<span onclick="sbrNSL(\'' + l + '\')" data-l="' + l + '" class="mob-lang-btn' + (l === LANG ? ' sel' : '') + '" title="' + NAMES[l] + '">' +
      FLAGS[l] + '</span>';
  }).join(''),
  '</div></div>',
  '<div class="mob-auth">',
  '<a href="' + _href('login.html') + '" class="sbrN-ghost" data-sbrauth="guest">' + L.login + '</a>',
  '<a href="' + _href('register.html') + '" class="sbrN-ghost" data-sbrauth="guest">Register</a>',
  '<a href="' + _href('dashboard.html') + '" class="sbrN-cta" data-sbrauth="member" style="display:none">' + L.dashboard + '</a></div>'
].join('');

/* ── Modal selectare limbă ───────────────────────────────── */
function buildLangModal() {
  if (document.getElementById('sbr-lang-modal-overlay')) return;
  var overlay = document.createElement('div');
  overlay.id = 'sbr-lang-modal-overlay';
  overlay.className = 'notranslate';
  overlay.setAttribute('translate', 'no');

  var modalHtml =
    '<div id="sbr-lang-modal" role="dialog" aria-modal="true" aria-label="Select Language">' +
    '<button id="sbr-lang-modal-close" onclick="sbrNCloseLangModal()" aria-label="Close">✕</button>' +
    '<p id="sbr-lang-modal-title">Select language / Selectează limba</p>';

  LANGS.forEach(function(l) {
    var isActive = l === LANG;
    var subText = l === 'RO' ? 'Varianta principală' : 'English version';
    modalHtml +=
      '<div class="sbr-lang-option' + (isActive ? ' active' : '') + '" data-l="' + l + '" onclick="sbrNSL(\'' + l + '\')" role="button" tabindex="0">' +
      '<span class="sbr-lang-flag">' + FLAG_EMOJI[l] + '</span>' +
      '<div class="sbr-lang-info">' +
      '<div class="sbr-lang-name">' + NAMES[l] + '</div>' +
      '<div class="sbr-lang-sub">' + subText + '</div>' +
      '</div>' +
      '<span class="sbr-lang-check">✓</span>' +
      '</div>';
  });

  modalHtml += '</div>';
  overlay.innerHTML = modalHtml;
  document.body.appendChild(overlay);

  /* Inchide la click pe overlay */
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) sbrNCloseLangModal();
  });
}

window.sbrNOpenLangModal = function() {
  buildLangModal();
  var overlay = document.getElementById('sbr-lang-modal-overlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
};

window.sbrNCloseLangModal = function() {
  var overlay = document.getElementById('sbr-lang-modal-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
};

/* ── Inject ──────────────────────────────────────────────── */
function doInject() {
  if (document.body.contains(nav)) return;
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(mob, nav.nextSibling);
  document.getElementById('sbrN-burger').addEventListener('click', sbrNTM);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { sbrNCM(); sbrNCloseLangModal(); sbrNCloseDd(true); }
  });
  sbrNInitDd();
  sbrNAuth();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', doInject);
} else {
  doInject();
}

/* ── Dropdown submeniuri (v13): click/atingere, tastatură, Esc ───────── */
function sbrNCloseDd(esc) {
  var any = null;
  document.querySelectorAll('.sbrN-item').forEach(function(it) {
    var b = it.querySelector('button.sbrN-btn');
    if (!b) return;
    var wasOpen = it.classList.contains('open');
    var hovered = it.matches(':hover');
    if (wasOpen) any = b;
    it.classList.remove('open');
    b.setAttribute('aria-expanded', 'false');
    if (esc && (hovered || wasOpen)) it.classList.add('is-esc');
  });
  if (esc && any && document.activeElement && document.activeElement.closest && document.activeElement.closest('.sbrN-dd')) any.focus();
}
function sbrNInitDd() {
  var items = document.querySelectorAll('.sbrN-item');
  items.forEach(function(it) {
    var b = it.querySelector('button.sbrN-btn');
    if (!b || !it.querySelector('.sbrN-dd')) return;
    function setOpen(o) {
      it.classList.toggle('open', o);
      b.setAttribute('aria-expanded', String(o));
      if (o) it.classList.remove('is-esc');
    }
    function closeOthers() {
      items.forEach(function(o) {
        if (o === it) return;
        o.classList.remove('open');
        var ob = o.querySelector('button.sbrN-btn');
        if (ob) ob.setAttribute('aria-expanded', 'false');
      });
    }
    b.addEventListener('click', function() { var o = !it.classList.contains('open'); closeOthers(); setOpen(o); });
    it.addEventListener('mouseenter', function() { it.classList.remove('is-esc'); });
    it.addEventListener('mouseleave', function() { it.classList.remove('is-esc'); it.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); });
    it.addEventListener('focusin', function(e) {
      var t = e.target;
      if (t && t.matches && t.matches(':focus-visible')) { closeOthers(); setOpen(true); }
    });
    it.addEventListener('focusout', function(e) {
      if (!e.relatedTarget || !it.contains(e.relatedTarget)) { it.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
    });
  });
  document.addEventListener('click', function(e) {
    if (!e.target.closest || !e.target.closest('.sbrN-item')) sbrNCloseDd(false);
  });
}

/* ── Mobile toggle ───────────────────────────────────────── */
var _mo = false;
function sbrNTM() {
  _mo = !_mo;
  var m = document.getElementById('sbrN-mob');
  var b = document.getElementById('sbrN-burger');
  if (m) { if (_mo) m.classList.add('open'); else m.classList.remove('open'); }
  if (b) { b.classList.toggle('open', _mo); b.setAttribute('aria-expanded', String(_mo)); }
  document.body.style.overflow = _mo ? 'hidden' : '';
}
function sbrNCM() {
  if (!_mo) return;
  _mo = false;
  var m = document.getElementById('sbrN-mob');
  var b = document.getElementById('sbrN-burger');
  if (m) m.classList.remove('open');
  if (b) { b.classList.remove('open'); b.setAttribute('aria-expanded', 'false'); }
  document.body.style.overflow = '';
}
window.sbrNToggleMob = sbrNTM;
window.sbrNCloseMob  = sbrNCM;

/* ── CORE: schimbare limbă ──────────────────────────────── */
window.sbrNSL = function(lang) {
  if (LANGS.indexOf(lang) === -1) return;

  /* Actualizeaza flag icon in butonul rotund */
  var fi = document.getElementById('snl-flag-icon');
  var sb = document.getElementById('snl-btn');
  if (fi) fi.textContent = FLAG_EMOJI[lang] || lang;
  if (sb) sb.classList.remove('open');

  /* Actualizeaza starea activa in modal */
  document.querySelectorAll('.sbr-lang-option').forEach(function(o) {
    o.classList.toggle('active', o.getAttribute('data-l') === lang);
  });

  /* Actualizeaza butoanele de limba din meniul mobil */
  document.querySelectorAll('.mob-lang-btn').forEach(function(o) {
    o.classList.toggle('sel', o.getAttribute('data-l') === lang);
  });

  /* Inchide modalul si meniul mobil */
  sbrNCloseLangModal();
  sbrNCM();

  /* Saved to localStorage above */

  /* Apeleaza motorul de traducere */
  try { localStorage.setItem('sbr_lang', lang); } catch(e) {}
  if (window.i18n && typeof window.i18n.setLang === 'function') {
    window.i18n.setLang(lang);
    /* Re-apply after short delay for dynamic content */
    setTimeout(function() {
      if (lang === 'EN' && window.i18n && window.i18n.setLang) {
        window.i18n.setLang('EN');
      }
    }, 300);
  } else {
    /* i18n not loaded yet — store and reload */
    location.reload();
  }
};

/* ── Auth ────────────────────────────────────────────────── */
function sbrNAuth() {
  try {
    var db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, storageKey: 'sbr-auth' } });
    db.auth.onAuthStateChange(function(ev, sess) {
      var auth = !!sess;
      document.querySelectorAll('[data-sbrauth]').forEach(function(el) {
        var r = el.getAttribute('data-sbrauth');
        el.style.display = (r === 'member' && auth) || (r === 'guest' && !auth) ? 'flex' : 'none';
      });
    });
  } catch(e) {}
}

window.SBR_LANG = { set: window.sbrNSL, get: function() { return LANG; } };

})();
