/* "‹ Dashboard"-knop die alleen zichtbaar is voor een ingelogde admin.
   Voor publieke apps (geen login nodig) waar coaches en ouders de knop niet moeten zien.
   Gebruik, ná de Supabase-library:
     <script src="/admin-terug.js" data-plek="header.top" defer></script>
   data-plek = CSS-selector van het element waarin de knop rechts komt te staan.
   Zonder geldige plek komt de knop rechtsboven in beeld te zweven. */
(function () {
  var script = document.currentScript;
  var plek = script && script.getAttribute('data-plek');
  var SB_URL = 'https://hvpooifxqhovskwgzpbr.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cG9vaWZ4cWhvdnNrd2d6cGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzQ1MzQsImV4cCI6MjA5NzAxMDUzNH0.zM3vFf6RB7uE4QoLP2uYdPe2AMI9NPJPFWqxQ_M2A3g';

  function toon() {
    var a = document.createElement('a');
    a.href = '/';
    a.className = 'admin-terug';
    a.textContent = '‹ Dashboard';
    a.setAttribute('aria-label', 'Terug naar het Eikenlaan-dashboard');
    var css = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:999px;' +
      'font:600 13px/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-decoration:none;white-space:nowrap;' +
      'color:inherit;border:1px solid currentColor;opacity:.85;';
    var doel = plek && document.querySelector(plek);
    if (doel) {
      a.style.cssText = css + 'margin-left:auto;flex-shrink:0;';
      doel.appendChild(a);
    } else {
      a.style.cssText = css + 'position:fixed;z-index:50;top:calc(10px + env(safe-area-inset-top));right:12px;' +
        'background:rgba(255,255,255,.92);color:#333;border-color:rgba(0,0,0,.15);box-shadow:0 2px 10px rgba(0,0,0,.12);opacity:1;';
      document.body.appendChild(a);
    }
  }

  async function check() {
    try {
      if (!window.supabase) return;
      var c = window.supabase.createClient(SB_URL, SB_KEY);
      var s = await c.auth.getSession();
      if (!s.data || !s.data.session) return;
      var r = await c.rpc('mijn_rol');
      if (r.data === 'admin') toon();
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
  else check();
})();
