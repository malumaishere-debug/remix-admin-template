
// SBR Codex category page — access gating (shared)
var PLAN_RANK={'free':0,'essential':1,'professional':2,'premium':3,'pro':2,'basic':1,'codex':2};
var sbr_db=null;
try{sbr_db=supabase.createClient('https://zxonzzojynrkzaiaacte.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4b256em9qeW5ya3phaWFhY3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MTYyMzMsImV4cCI6MjA5MDM5MjIzM30.85AqP2qLdG_4Iufz4nqkrZNQ4E38VavEc1kiNE9XhH0',{auth:{persistSession:true,storageKey:'sbr-auth'}});}catch(e){}
function cdxApply(rank){
  document.querySelectorAll('.atlas-card').forEach(function(card){
    var num=parseInt(card.dataset.num)||0, cn=parseInt(card.dataset.catnum)||0, un=false;
    if(rank>=2) un=true;
    else if(rank===1) un=(num<=50||cn<=2);
    else un=(cn<=2);
    card.classList.toggle('locked',!un);
  });
  var b=document.getElementById('cdx-gate');
  if(b) b.style.display=(rank>=2)?'none':'';
}
(function(){
  if(!sbr_db){cdxApply(0);return;}
  var done=false;
  sbr_db.auth.onAuthStateChange(function(ev,session){
    if(done)return;
    if(!session){cdxApply(0);done=true;return;}
    sbr_db.from('profiles').select('plan').eq('id',session.user.id).single()
      .then(function(r){var p=(r.data&&r.data.plan||'free').toLowerCase();cdxApply(PLAN_RANK[p]||0);done=true;})
      .catch(function(){cdxApply(0);done=true;});
  });
  setTimeout(function(){if(!done)cdxApply(0);},4000);
})();
window.addEventListener('scroll',function(){var h=document.documentElement.scrollHeight-window.innerHeight;var sp=document.getElementById('scroll-progress');if(sp&&h>0)sp.style.width=Math.round(window.scrollY/h*100)+'%';},{passive:true});
