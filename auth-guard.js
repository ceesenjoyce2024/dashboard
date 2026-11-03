/* Toegangscontrole voor alle apps op eikenlaan-webapps.nl
   Gebruik in <head>, direct na de Supabase-library:
     <script src="/auth-guard.js" data-access="familie"></script>   → alleen rol admin of eikenlaan
     <script src="/auth-guard.js" data-access="team"></script>      → iedereen op de whitelist
     <script src="/auth-guard.js" data-access="rekken"></script>    → rol admin, eikenlaan of kind met app 'kuitrekken'
     <script src="/auth-guard.js" data-access="hockeymat"></script> → rol admin, eikenlaan of kind met app 'hockeymat'
   Zonder geldige sessie gaat de bezoeker naar het inlogscherm en na inloggen terug naar deze pagina.
   De echte afscherming zit in de Supabase-regels (RLS); dit script zorgt voor de juiste doorverwijzing. */
(function () {
  var script = document.currentScript;
  var access = (script && script.getAttribute('data-access')) || 'familie';
  var root = document.documentElement;
  root.style.visibility = 'hidden';

  var SB_URL = 'https://hvpooifxqhovskwgzpbr.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cG9vaWZ4cWhvdnNrd2d6cGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzQ1MzQsImV4cCI6MjA5NzAxMDUzNH0.zM3vFf6RB7uE4QoLP2uYdPe2AMI9NPJPFWqxQ_M2A3g';

  function naarLogin() {
    var hier = location.pathname + location.search + location.hash;
    location.replace('/?next=' + encodeURIComponent(hier));
  }
  function geenToegang() { location.replace('/?geentoegang=1'); }
  var nooit = new Promise(function () {});

  window.authReady = (async function () {
    try {
      var client = window.supabase.createClient(SB_URL, SB_KEY);
      var res = await client.auth.getSession();
      var session = res.data && res.data.session;
      if (!session) { naarLogin(); return nooit; }
      var r = await client.rpc('mijn_rol');
      var rol = r.data || null;
      var ouder = rol === 'admin' || rol === 'eikenlaan';
      var app = access === 'rekken' ? 'kuitrekken' : access === 'hockeymat' ? 'hockeymat' : null;
      var ok;
      if (access === 'team') ok = !!rol;
      else if (app) {
        ok = ouder;
        if (!ok && rol === 'kind') {
          var a = await client.rpc('mijn_apps');
          ok = !!(a.data && a.data.indexOf(app) !== -1);
        }
      } else ok = ouder;
      if (!ok) { geenToegang(); return nooit; }
      root.style.visibility = '';
      return { session: session, rol: rol };
    } catch (e) {
      naarLogin(); return nooit;
    }
  })();
})();
