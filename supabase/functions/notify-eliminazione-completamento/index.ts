import { createClient } from 'npm:@supabase/supabase-js@2';
import { inviaPushAProfili } from '../_shared/webpush.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { tipo, record } = await req.json();

    if (tipo === 'evento_eliminato') {
      const destinatari: string[] = record.partecipanti ?? [];
      if (destinatari.length > 0) {
        await inviaPushAProfili(destinatari, {
          titolo: 'Evento eliminato',
          corpo: record.titolo,
          url: '/calendario'
        });
      }
    } else if (tipo === 'faccenda_eliminata' && record.assegnato_a) {
      await inviaPushAProfili([record.assegnato_a], {
        titolo: 'Faccenda eliminata',
        corpo: record.titolo,
        url: '/faccende'
      });
    } else if (tipo === 'faccenda_completata' && record.assegnato_a) {
      await inviaPushAProfili([record.assegnato_a], {
        titolo: 'Faccenda completata',
        corpo: record.titolo,
        url: '/faccende'
      });
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Errore in notify-eliminazione-completamento:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});