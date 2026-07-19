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
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
      } catch (err) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        }
      }
    })
  );
}