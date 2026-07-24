import { createClient } from 'npm:@supabase/supabase-js@2';
import { inviaPushAProfili } from '../_shared/webpush.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { tipo, record, nuovi_partecipanti } = await req.json();

    if (tipo === 'faccenda') {
      await inviaPushAProfili([record.assegnato_a], {
        titolo: 'Nuova faccenda assegnata',
        corpo: record.titolo,
        url: '/faccende'
      });
    } else if (tipo === 'evento') {
      const destinatari = nuovi_partecipanti ?? [];
      if (destinatari.length > 0) {
        await inviaPushAProfili(destinatari, {
          titolo: 'Sei stato aggiunto a un evento',
          corpo: record.titolo,
          url: '/calendario'
        });
      }
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Errore in notify-assegnazione:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});