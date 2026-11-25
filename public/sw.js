const CACHE_NAME = 'housekeeping-stock-pwa-v2';
const APP_SHELL = ['/', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => Promise.resolve())); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request; const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(request).then(response => { if (response && response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(request, copy)); } return response; }).catch(async () => { const cached = await caches.match(request); if (cached) return cached; if (request.mode === 'navigate') return caches.match('/'); return Response.error(); }));
});
self.addEventListener('push', event => {
  let data = {}; try { data = event.data ? event.data.json() : {}; } catch (_) { data = { title: 'Housekeeping Stock', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(data.title || 'Housekeeping Stock', { body: data.body || '', icon: '/icons/icon-192.png', data: { url: data.url || '/' } }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close(); const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil((async () => { const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true }); for (const client of clients) { if (client.url === target && 'focus' in client) return client.focus(); } if (self.clients.openWindow) return self.clients.openWindow(target); })());
});
