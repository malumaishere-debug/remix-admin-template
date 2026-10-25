/* ─── DOWNLOADS (plan-gated on the server) ───
   No file links live in this page any more. The "paid-download" Supabase
   function checks the plan and returns a link that expires in 2 minutes. */
var DOWNLOADS = { codex: 'codex', afis: 'afis', postfraud: 'postfraud' };

async function sbrDownload(resource, btn) {
  var label = btn ? btn.innerHTML : '';
  if (btn) { btn.innerHTML = 'Se pregătește…'; btn.setAttribute('aria-busy', 'true'); }
  try {
    var res = await window.sbr_db.functions.invoke('paid-download', { body: { resource: resource } });
    if (res.error || !res.data || !res.data.url) throw res.error || new Error('no_url');
    window.location.href = res.data.url;
  } catch (e) {
    alert('Descărcarea nu a pornit. Reîncarcă pagina și încearcă din nou. Dacă problema continuă, scrie-ne la contact@sbr.systems.');
  } finally {
    if (btn) { btn.innerHTML = label; btn.removeAttribute('aria-busy'); }
  }
}
