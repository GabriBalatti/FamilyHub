import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function attivaNotifiche(profiloId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Le notifiche push non sono supportate su questo dispositivo/browser.');
  }

  const permesso = await Notification.requestPermission();
  if (permesso !== 'granted') {
    throw new Error('Permesso per le notifiche negato.');
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  const json = subscription.toJSON();

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      profilo_id: profiloId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent
    },
    { onConflict: 'endpoint' }
  );

  if (error) throw error;
  return subscription;
}

export async function disattivaNotifiche() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint);
    await subscription.unsubscribe();
  }
}

export async function notificheAttive(profiloId) {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return false;

  // La sottoscrizione del browser esiste, ma potrebbe essere "orfana"
  // lato database (es. cancellata da un ON DELETE CASCADE dopo
  // l'uscita da una famiglia). Verifichiamo e, se serve, la ripristiniamo.
  const { data } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', subscription.endpoint)
    .eq('profilo_id', profiloId)
    .maybeSingle();

  if (!data) {
    try {
      const json = subscription.toJSON();
      await supabase.from('push_subscriptions').upsert(
        {
          profilo_id: profiloId,
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          user_agent: navigator.userAgent
        },
        { onConflict: 'endpoint' }
      );
    } catch {
      return false;
    }
  }

  return true;
}