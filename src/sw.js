import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';

// pulizia della cache e registrazione del service worker
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
self.addEventListener('install', () => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// notifiche push
self.addEventListener('push', (event) => {
  const dati = event.data ? event.data.json() : {};
  const titolo = dati.titolo || 'FamilyHub';
  const opzioni = {
    body: dati.corpo || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: dati.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(titolo, opzioni));
});

// click sulla notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});