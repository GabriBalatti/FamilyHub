import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

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