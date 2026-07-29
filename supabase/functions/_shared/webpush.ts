import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface NotificaPush {
  titolo: string;
  corpo: string;
  url?: string;
}

async function inviaConTimeout(sub: { endpoint: string; p256dh: string; auth: string }, payload: string, msTimeout = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), msTimeout);
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      payload,
      { agent: undefined } as never
    );
  } finally {
    clearTimeout(timer);
  }
}

// Invia una notifica push a uno o più profili, ripulendo le sottoscrizioni scadute (404/410)
export async function inviaPushAProfili(profiloIds: string[], notifica: NotificaPush) {
  if (profiloIds.length === 0) return;

  const { data: sottoscrizioni } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('profilo_id', profiloIds);

  if (!sottoscrizioni) return;

  const payload = JSON.stringify(notifica);

  await Promise.all(
    sottoscrizioni.map(async (sub) => {
      try {
        await Promise.race([
          inviaConTimeout(sub, payload),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout invio push')), 8000))
        ]);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Invio push fallito per', sub.id, String(err));
        }
      }
    })
  );
}