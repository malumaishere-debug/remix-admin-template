/* ─── DOWNLOADS ─── */
function renderDownloads(cfg, rank) {
  var grid = document.getElementById('dl-grid');
  grid.innerHTML = '';

  var PLAN_FOR_RANK = { 1: 'Essential', 2: 'Professional', 3: 'Premium' };
  var dls = [
    {
      id:'codex', title:'Codex PDF',
      desc:'300+ tipologii documentate. Atlas complet al fraudelor digitale. Acces offline, printabil.',
      minRank: 2,
    },
    {
      id:'afis', title:'AFIS PDF',
      desc:'Anti-Fraud Intelligence System complet. Framework cognitiv, 9 module, protocoale practice.',
      minRank: 2,
    },
    {
      id:'postfraud', title:'Post-Fraud PDF',
      desc:'Protocol complet de recuperare. Checklist 72h, template-uri, chargeback, investigare.',
      minRank: 0,
    },
  ];

  dls.forEach(function(dl) {
    var hasAccess = rank >= dl.minRank;
    grid.innerHTML += '<div class="dl-card ' + (hasAccess?'':'locked-card') + '">'
      + '<div class="dl-title">' + dl.title + '</div>'
      + '<div class="dl-desc">' + dl.desc + '</div>'
      + (hasAccess
          ? '<button type="button" class="dl-btn" style="cursor:pointer" data-dl="' + dl.id + '">&darr; Descarcă</button>'
          : '<div class="dl-lock">🔒 Necesită plan ' + (PLAN_FOR_RANK[dl.minRank] || 'activ') + '</div>'
        )
      + '</div>';
  });

  grid.querySelectorAll('[data-dl]').forEach(function(b) {
    b.addEventListener('click', function() { sbrDownload(b.getAttribute('data-dl'), b); });
  });
}
