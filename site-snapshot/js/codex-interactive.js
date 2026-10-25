/* SBR Codex interactive layer v1: additive. Works on codex.html (index) and codex-*.html (category pages).
   Does not modify existing markup except: adds elements, classes and one id per card. No page reload, no i18n.js dependency. */
(function(){
'use strict';
if(window.__sbrCodexInteractive) return; window.__sbrCodexInteractive=true;

var D={
 RO:{ph:'Cauta o frauda: phishing, QR, CEO, deepfake...',reset:'Reseteaza',all:'Toate',surprise:'Surprinde-ma',
  resCat:'{n} din {t} categorii',resTyp:'{n} din {t} tipologii',empty:'Nicio potrivire. Incearca alt termen sau reseteaza filtrele.',
  view:'Compact',viewX:'Extins',fs:'Marime text',read:'Citeste detaliile',hide:'Ascunde',radar:'Distributia riscului',
  critic:'Critic',ridicat:'Ridicat',mediu:'Mediu',
  th:{digital:'Conturi & digital',ai:'AI & impersonare',money:'Bani & investitii',business:'Business & institutii'},
  toggle:'Deschide sau inchide detaliile'},
 EN:{ph:'Search a fraud: phishing, QR, CEO, deepfake...',reset:'Reset',all:'All',surprise:'Surprise me',
  resCat:'{n} of {t} categories',resTyp:'{n} of {t} typologies',empty:'No match. Try another term or reset the filters.',
  view:'Compact',viewX:'Expanded',fs:'Text size',read:'Read details',hide:'Hide',radar:'Risk distribution',
  critic:'Critical',ridicat:'High',mediu:'Medium',
  th:{digital:'Accounts & digital',ai:'AI & impersonation',money:'Money & investments',business:'Business & institutions'},
  toggle:'Open or close details'}
};
var THEME={'codex-phishing':'digital','codex-account-takeover':'digital','codex-malware':'digital','codex-social-media':'digital','codex-gaming':'digital','codex-date-personale':'digital',
 'codex-ai-attacks':'ai','codex-deepfake':'ai','codex-social-engineering':'ai','codex-romance':'ai',
 'codex-crypto':'money','codex-investitii':'money','codex-ecommerce':'money','codex-infrastructura-financiara':'money',
 'codex-bec':'business','codex-angajare':'business','codex-medical':'business','codex-multi-stage':'business'};
var THEME_ORDER=['digital','ai','money','business'];

function lang(){ var l=''; try{ l=(localStorage.getItem('sbr_lang')||'').toUpperCase(); }catch(e){} return l==='EN'?'EN':'RO'; }
var LANG=lang();
function T(){ return D[LANG]; }
function norm(s){ return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }
function fmt(s,n,t){ return s.replace('{n}',n).replace('{t}',t); }
function el(tag,cls,html){ var e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }
function store(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){} }
var RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* reveal helper */
function reveal(nodes,onEnter){
  nodes.forEach(function(n,i){ n.classList.add('cx-rv'); n.style.transitionDelay=(Math.min(i%12,11)*35)+'ms'; });
  function show(n){ if(n.classList.contains('cx-in')) return; n.classList.add('cx-in'); if(onEnter) onEnter(n); setTimeout(function(){ n.classList.remove('cx-rv','cx-in'); n.style.transitionDelay=''; },1200+(parseInt(n.style.transitionDelay,10)||0)); }
  if(RM||!('IntersectionObserver' in window)){ nodes.forEach(show); return; }
  var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ show(x.target); io.unobserve(x.target); } }); },{threshold:.06});
  nodes.forEach(function(n){ io.observe(n); });
  setTimeout(function(){ nodes.forEach(function(n){ if(!n.classList.contains('cx-in')) show(n); }); },4000);
}

/* hero: ambient background + count-up */
function hero(){
  var h=document.querySelector('.cdx-hero'); if(!h||h.querySelector('.cx-ambient')) return;
  var a=el('div','cx-ambient','<span></span><span></span><span></span>'); a.setAttribute('aria-hidden','true'); h.insertBefore(a,h.firstChild);
  document.querySelectorAll('.cdx-stat b').forEach(function(b){
    var txt=b.textContent.trim(), n=parseInt(txt,10);
    if(!/^\d+\+?$/.test(txt)||n>=1900||n<2||RM) return;
    var suffix=txt.replace(/^\d+/,''), start=null, dur=1100;
    b.textContent='0'+suffix;
    function step(ts){ if(!start) start=ts; var p=Math.min(1,(ts-start)/dur), e=1-Math.pow(1-p,3); b.textContent=Math.round(n*e)+suffix; if(p<1) requestAnimationFrame(step); else b.textContent=txt; }
    requestAnimationFrame(step);
  });
}

/* shared toolbar builder */
function buildBar(opts){
  var bar=el('div','cx-bar'), inner=el('div','cx-bar-in');
  var sw=el('div','cx-search'), input=el('input'); input.type='search'; input.setAttribute('autocomplete','off'); input.id='cx-q'; sw.appendChild(input); inner.appendChild(sw);
  var chips=el('div','cx-chips'); inner.appendChild(chips);
  var extra=el('div','cx-chips'); inner.appendChild(extra);
  bar.appendChild(inner);
  var meta=el('div','cx-meta'), res=el('span'), tools=el('span'); meta.appendChild(res); meta.appendChild(tools);
  var wrap=el('div'); wrap.style.cssText='max-width:1160px;margin:0 auto'; wrap.appendChild(meta); bar.appendChild(wrap);
  return {bar:bar,input:input,chips:chips,extra:extra,res:res,tools:tools};
}
function randomPick(list){ return list.length?list[Math.floor(Math.random()*list.length)]:null; }

/* ================= INDEX PAGE ================= */
function initIndex(){
  var grid=document.querySelector('.cdx-grid'); if(!grid) return;
  var tiles=[].slice.call(grid.querySelectorAll('.cdx-tile')); if(!tiles.length) return;
  tiles.forEach(function(t){
    var slug=(t.getAttribute('href')||'').replace(/\.html.*$/,''); t.dataset.cxTheme=THEME[slug]||'digital';
    t.addEventListener('mousemove',function(e){ var r=t.getBoundingClientRect(); t.style.setProperty('--mx',(e.clientX-r.left)+'px'); t.style.setProperty('--my',(e.clientY-r.top)+'px'); });
  });
  var B=buildBar(), state={theme:'all',q:''};
  var empty=el('div','cx-empty'); empty.setAttribute('role','status');
  grid.parentNode.insertBefore(B.bar,grid); grid.parentNode.insertBefore(empty,grid.nextSibling);
  var chipEls={};
  function mkChip(key,label){ var b=el('button','cx-chip'); b.type='button'; b.dataset.k=key; chipEls[key]=b; B.chips.appendChild(b); return b; }
  mkChip('all'); THEME_ORDER.forEach(function(k){ mkChip(k); });
  var surprise=el('button','cx-btn'); surprise.type='button'; B.extra.appendChild(surprise);
  var reset=el('button','cx-btn'); reset.type='button'; B.extra.appendChild(reset);
  function counts(){ var c={all:tiles.length}; THEME_ORDER.forEach(function(k){ c[k]=tiles.filter(function(t){return t.dataset.cxTheme===k;}).length; }); return c; }
  function label(){
    var t=T(), c=counts();
    B.input.placeholder=t.ph; B.input.setAttribute('aria-label',t.ph);
    chipEls.all.innerHTML=t.all+'<i>'+c.all+'</i>';
    THEME_ORDER.forEach(function(k){ chipEls[k].innerHTML=t.th[k]+'<i>'+c[k]+'</i>'; });
    surprise.textContent=t.surprise; reset.textContent=t.reset; empty.textContent=t.empty;
    apply();
  }
  function apply(){
    var q=norm(state.q).trim(), n=0;
    tiles.forEach(function(t){
      var okT=state.theme==='all'||t.dataset.cxTheme===state.theme, okQ=!q||norm(t.textContent).indexOf(q)>-1;
      var ok=okT&&okQ; t.classList.toggle('cx-off',!ok); if(ok) n++;
    });
    B.res.textContent=fmt(T().resCat,n,tiles.length); empty.classList.toggle('show',n===0);
    Object.keys(chipEls).forEach(function(k){ chipEls[k].classList.toggle('on',k===state.theme); chipEls[k].setAttribute('aria-pressed',k===state.theme?'true':'false'); });
  }
  B.chips.addEventListener('click',function(e){ var b=e.target.closest('.cx-chip'); if(!b) return; state.theme=b.dataset.k; apply(); });
  B.input.addEventListener('input',function(){ state.q=B.input.value; apply(); });
  reset.addEventListener('click',function(){ state.theme='all'; state.q=''; B.input.value=''; apply(); });
  surprise.addEventListener('click',function(){
    state.theme='all'; state.q=''; B.input.value=''; apply();
    var t=randomPick(tiles); if(!t) return; t.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
    t.classList.remove('cx-pulse'); void t.offsetWidth; t.classList.add('cx-pulse'); setTimeout(function(){ t.classList.remove('cx-pulse'); },1600);
  });
  hero(); label(); reveal(tiles);
  window.addEventListener('sbr-cx-lang',label);
}

/* ================= CATEGORY PAGE ================= */
function initCategory(){
  var cards=[].slice.call(document.querySelectorAll('.atlas-card')); if(!cards.length) return;
  var body=document.querySelector('.cdx-body')||cards[0].parentNode;
  var riskInfo={}, order=['CRITIC','RIDICAT','MEDIU'];
  cards.forEach(function(c){
    var r=(c.dataset.risk||'').toUpperCase(); if(!r) return;
    var fill=c.querySelector('.acs-risk-fill'), col=fill?(fill.style.background||fill.style.backgroundColor):'';
    if(!riskInfo[r]) riskInfo[r]={n:0,color:col||'#888'}; riskInfo[r].n++; if(!riskInfo[r].color&&col) riskInfo[r].color=col;
    if(!c.id){ var tok=(c.dataset.search||'').split(' ')[0]; if(/^[a-z]{2,4}-\d+$/.test(tok)) c.id=tok; }
  });
  var risks=Object.keys(riskInfo).sort(function(a,b){ var ia=order.indexOf(a),ib=order.indexOf(b); return (ia<0?9:ia)-(ib<0?9:ib); });
  var B=buildBar(), state={risk:'all',q:'',view:store('sbr_cx_view')==='x'?'x':'c',fs:parseInt(store('sbr_cx_fs')||'0',10)||0};
  if(state.fs<0||state.fs>2) state.fs=0;
  var empty=el('div','cx-empty'); empty.setAttribute('role','status');
  /* risk radar */
  var radar=el('div','cx-radar'); var rt=el('div','cx-radar-t'), rb=el('div','cx-radar-bar'), rl=el('div','cx-radar-leg');
  radar.appendChild(rt); radar.appendChild(rb); radar.appendChild(rl);
  var total=cards.length;
  risks.forEach(function(r){ var b=el('button'); b.type='button'; b.dataset.k=r; b.style.setProperty('--cx-c',riskInfo[r].color); rb.appendChild(b); var s=el('span'); s.style.setProperty('--cx-c',riskInfo[r].color); s.dataset.k=r; rl.appendChild(s); });
  body.parentNode.insertBefore(radar,body); body.parentNode.insertBefore(B.bar,body); body.parentNode.insertBefore(empty,body);
  var chipEls={};
  function mkChip(key){ var b=el('button','cx-chip'); b.type='button'; b.dataset.k=key; chipEls[key]=b; B.chips.appendChild(b); return b; }
  mkChip('all'); risks.forEach(function(r){ mkChip(r); chipEls[r].style.setProperty('--cx-c',riskInfo[r].color); });
  var viewBtn=el('button','cx-btn'); viewBtn.type='button'; B.extra.appendChild(viewBtn);
  var fsWrap=el('span','cx-fs'); var fsBtns=[0,1,2].map(function(i){ var b=el('button','cx-btn'); b.type='button'; b.dataset.i=i; b.style.fontSize=(10+i*2)+'px'; b.textContent='A'; fsWrap.appendChild(b); return b; }); B.extra.appendChild(fsWrap);
  var surprise=el('button','cx-btn'); surprise.type='button'; B.extra.appendChild(surprise);
  var reset=el('button','cx-btn'); reset.type='button'; B.extra.appendChild(reset);

  function riskLabel(r){ var t=T(); return r==='CRITIC'?t.critic:(r==='RIDICAT'?t.ridicat:(r==='MEDIU'?t.mediu:r)); }
  /* per-card preview + toggle */
  cards.forEach(function(c){
    var main=c.querySelector('.ac-main'); if(!main) return;
    var tg=el('button','cx-toggle'); tg.type='button'; tg.setAttribute('aria-expanded','false'); main.insertBefore(tg,main.firstChild);
    var pv=el('p','cx-preview'), more=el('button','cx-more'); more.type='button';
    var d=main.querySelector('.ac-desc'); if(d) d.parentNode.insertBefore(pv,d); if(d) d.parentNode.insertBefore(more,d);
    if(!d){ pv.remove(); more.remove(); }
  });
  function preview(c){
    var pv=c.querySelector('.cx-preview'), d=c.querySelector('.ac-desc'); if(!pv||!d) return;
    var s=d.textContent.replace(/\s+/g,' ').trim(); if(s.length>170){ s=s.slice(0,170); s=s.replace(/\s+\S*$/,'')+'\u2026'; } pv.textContent=s;
  }
  function setOpen(c,open){ c.classList.toggle('cx-open',open); var tg=c.querySelector('.cx-toggle'); if(tg) tg.setAttribute('aria-expanded',open?'true':'false'); var m=c.querySelector('.cx-more'); if(m) m.textContent=open?T().hide:T().read; }
  function applyView(){ cards.forEach(function(c){ c.classList.toggle('cx-c',state.view==='c'); setOpen(c,state.view==='x'); }); }
  function applyFs(){ if(state.fs) document.documentElement.setAttribute('data-cx-fs',String(state.fs)); else document.documentElement.removeAttribute('data-cx-fs'); fsBtns.forEach(function(b){ b.classList.toggle('on',+b.dataset.i===state.fs); b.setAttribute('aria-pressed',+b.dataset.i===state.fs?'true':'false'); }); }
  function label(){
    var t=T();
    B.input.placeholder=t.ph; B.input.setAttribute('aria-label',t.ph);
    chipEls.all.innerHTML=t.all+'<i>'+total+'</i>';
    risks.forEach(function(r){ chipEls[r].innerHTML=riskLabel(r)+'<i>'+riskInfo[r].n+'</i>'; });
    [].slice.call(rl.children).forEach(function(s){ var r=s.dataset.k; s.textContent=riskLabel(r)+' '+riskInfo[r].n; });
    rt.textContent=t.radar; viewBtn.textContent=state.view==='c'?t.viewX:t.view; viewBtn.title=t.toggle;
    fsWrap.setAttribute('aria-label',t.fs); fsWrap.title=t.fs; surprise.textContent=t.surprise; reset.textContent=t.reset; empty.textContent=t.empty;
    cards.forEach(function(c){ preview(c); var tg=c.querySelector('.cx-toggle'); if(tg) tg.setAttribute('aria-label',t.toggle); var m=c.querySelector('.cx-more'); if(m) m.textContent=c.classList.contains('cx-open')?t.hide:t.read; });
    apply();
  }
  function apply(){
    var q=norm(state.q).trim(), n=0;
    cards.forEach(function(c){
      var okR=state.risk==='all'||(c.dataset.risk||'').toUpperCase()===state.risk;
      var hay=norm((c.dataset.search||'')+' '+((c.querySelector('.ac-title')||{}).textContent||'')+' '+((c.querySelector('.ac-desc')||{}).textContent||''));
      var okQ=!q||hay.indexOf(q)>-1, ok=okR&&okQ; c.classList.toggle('hidden',!ok); if(ok) n++;
    });
    B.res.textContent=fmt(T().resTyp,n,total); empty.classList.toggle('show',n===0);
    Object.keys(chipEls).forEach(function(k){ chipEls[k].classList.toggle('on',k===state.risk); chipEls[k].setAttribute('aria-pressed',k===state.risk?'true':'false'); });
    [].slice.call(rb.children).forEach(function(b){ b.style.opacity=(state.risk==='all'||state.risk===b.dataset.k)?'1':'.35'; });
  }
  /* events */
  B.chips.addEventListener('click',function(e){ var b=e.target.closest('.cx-chip'); if(!b) return; state.risk=b.dataset.k; apply(); });
  rb.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; state.risk=(state.risk===b.dataset.k)?'all':b.dataset.k; apply(); });
  B.input.addEventListener('input',function(){ state.q=B.input.value; apply(); });
  reset.addEventListener('click',function(){ state.risk='all'; state.q=''; B.input.value=''; apply(); });
  viewBtn.addEventListener('click',function(){ state.view=state.view==='c'?'x':'c'; store('sbr_cx_view',state.view); applyView(); label(); });
  fsWrap.addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; state.fs=+b.dataset.i; store('sbr_cx_fs',String(state.fs)); applyFs(); });
  body.addEventListener('click',function(e){
    if(e.target.closest('a,input,select,textarea')) return;
    var c=e.target.closest('.atlas-card'); if(!c||c.classList.contains('locked')||!c.classList.contains('cx-c')) return;
    if(window.getSelection&&String(window.getSelection()).length>0) return;
    setOpen(c,!c.classList.contains('cx-open'));
  });
  function openCard(c){ if(!c) return; c.classList.remove('hidden'); if(c.classList.contains('cx-c')) setOpen(c,true); c.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'}); c.classList.remove('cx-pulse'); void c.offsetWidth; c.classList.add('cx-pulse'); setTimeout(function(){ c.classList.remove('cx-pulse'); },1600); }
  surprise.addEventListener('click',function(){
    state.risk='all'; state.q=''; B.input.value=''; apply();
    var pool=cards.filter(function(c){ return !c.classList.contains('locked'); }); openCard(randomPick(pool.length?pool:cards));
  });
  /* init */
  applyView(); applyFs(); label();
  reveal(cards,function(c){ var f=c.querySelector('.acs-risk-fill'); if(f&&f.dataset.h!==undefined){ f.style.height=f.dataset.h; } });
  if(!RM&&'IntersectionObserver' in window) cards.forEach(function(c){ var f=c.querySelector('.acs-risk-fill'); if(f){ f.dataset.h=f.style.height; f.style.height='0'; } });
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ rb.querySelectorAll('button').forEach(function(b){ b.style.width=(riskInfo[b.dataset.k].n/total*100)+'%'; }); }); });
  hero();
  if(location.hash&&location.hash.length>2){ var target=document.getElementById(location.hash.slice(1)); if(target&&target.classList.contains('atlas-card')) setTimeout(function(){ openCard(target); },500); }
  window.addEventListener('sbr-cx-lang',label);
}

/* language changes: relabel in place. Never reloads (i18n.js fires this event on every EN page load). */
function onLang(e){
  var nl=(e&&e.detail&&e.detail.lang)||lang(); nl=String(nl).toUpperCase()==='EN'?'EN':'RO';
  if(nl===LANG) return; LANG=nl;
  setTimeout(function(){ window.dispatchEvent(new Event('sbr-cx-lang')); },60);
}
document.addEventListener('sbr:lang:changed',onLang);
window.addEventListener('storage',function(e){ if(e.key==='sbr_lang') onLang({detail:{lang:e.newValue}}); });

function boot(){ try{ initIndex(); initCategory(); }catch(err){ if(window.console) console.error('SBR codex layer',err); } }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
