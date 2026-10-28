/* Shared top bar for the interactive demos: a clear "Back to portfolio" button on the right, and a calmer notice style. */
(function () {
  try {
    var css = [
      '.demo-bar{position:sticky;top:0;z-index:2147483000;display:flex;justify-content:flex-end;align-items:center;padding:10px 16px;background:rgba(248,250,252,.92);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);border-bottom:1px solid rgba(20,24,31,.08);font:600 14px/1 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}',
      '.demo-bar a{display:inline-flex;align-items:center;gap:.45em;padding:.6em 1.05em;border-radius:999px;background:#2b4062;color:#fff;text-decoration:none;box-shadow:0 1px 2px rgba(20,24,31,.18);transition:background .15s,transform .15s}',
      '.demo-bar a:hover{background:#1f3050;transform:translateX(-1px)}',
      '.demo-bar a:focus-visible{outline:3px solid #8fb2e8;outline-offset:2px}',
      '.banner,.notice{background:#eef2f7!important;color:#3d4a5c!important;border-color:#d5dde8!important}',
      '.banner a,.banner a:visited,a.back{display:none!important}',
      '.banner.is-band,.notice.is-band{display:block!important;box-sizing:border-box!important;width:100%!important;max-width:none!important;margin:0!important;border:0!important;border-bottom:1px solid #d5dde8!important;border-radius:0!important;padding:8px 16px!important;font-size:13px!important;line-height:1.45!important;text-align:center!important}',
      '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .demo-bar{background:rgba(17,20,26,.92);border-bottom-color:rgba(255,255,255,.1)}:root:not([data-theme="light"]) .demo-bar a{background:#dbe6f7;color:#14233d}:root:not([data-theme="light"]) .demo-bar a:hover{background:#fff}:root:not([data-theme="light"]) .banner,:root:not([data-theme="light"]) .notice{background:#1a2230!important;color:#b9c4d4!important;border-color:#2a3446!important}}',
      ':root[data-theme="dark"] .demo-bar{background:rgba(17,20,26,.92);border-bottom-color:rgba(255,255,255,.1)}:root[data-theme="dark"] .demo-bar a{background:#dbe6f7;color:#14233d}:root[data-theme="dark"] .banner,:root[data-theme="dark"] .notice{background:#1a2230!important;color:#b9c4d4!important;border-color:#2a3446!important}'
    ].join('\n');
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    function mount() {
      if (document.querySelector('.demo-bar')) return;
      var bar = document.createElement('nav'); bar.className = 'demo-bar'; bar.setAttribute('aria-label', 'Demo navigation');
      var a = document.createElement('a'); a.href = '/portfolio/'; a.textContent = '← Back to portfolio';
      bar.appendChild(a); document.body.insertBefore(bar, document.body.firstChild);
      // one place for the illustrative-model notice on every piece: a full-width band under the bar
      var n = document.querySelector('.notice, .banner');
      if (n) { n.classList.add('is-band'); bar.parentNode.insertBefore(n, bar.nextSibling); }
    }
    if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
  } catch (e) {}
})();
