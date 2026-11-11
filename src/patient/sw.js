// Service worker dell'app paziente. In cache SOLO i file statici della build (shell): mai risposte del relay né dati clinici (SEC-110, SEC-122).
// Versione ed elenco dei file li scrive la build al posto dei due segnaposto qui sotto (vite.patient.config.js).
const CACHE = 'urbios-paziente-' + '__VERSION__';
const FILES = '__FILES__';

// Nessun skipWaiting: una versione nuova subentra solo alla riapertura, altrimenti cancellerebbe i file in uso a metà allenamento.
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))));

// Nessun clients.claim, per lo stesso motivo. Si tolgono solo le cache vecchie dell'app.
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('urbios-paziente-') && k !== CACHE).map((k) => caches.delete(k))))));

self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  // Altre origini (relay), metodi non GET o fuori scope: non si toccano, vanno in rete.
  if (r.method !== 'GET' || u.origin !== self.location.origin || !u.href.startsWith(self.registration.scope)) return;
  // Pagine: prima la rete (versione più recente), copia in cache solo se manca il campo. ignoreSearch: patient.html?prova trova patient.html.
  if (r.mode === 'navigate' || u.pathname.endsWith('.html')) { e.respondWith(fetch(r).catch(() => caches.match(r, { ignoreSearch: true }).then((m) => m || Response.error()))); return; }
  // Il resto (file con hash): prima la cache. Mai cache.put qui: la cache contiene solo ciò che è stato messo all'installazione.
  e.respondWith(caches.match(r).then((m) => m || fetch(r)));
});
