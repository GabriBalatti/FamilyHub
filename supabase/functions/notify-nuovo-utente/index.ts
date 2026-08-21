import { createClient } from 'npm:@supabase/supabase-js@2';
import { inviaPushAProfili } from '../_shared/webpush.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  try {
    const { tipo, record } = await req.json();

    const { data: membri, error } = await supabase
      .from('profili')
      .select('id')
      .eq('famiglia_id', record.famiglia_id)
      .neq('id', record.id);

    if (error) throw error;

    if (membri && membri.length > 0) {
      const notifica = tipo === 'uscita'
        ? {
            titolo: 'Un membro ha lasciato la famiglia',
            corpo: `${record.nome} ha lasciato la famiglia`,
            url: '/profilo'
          }
        : {
            titolo: 'Nuovo membro in famiglia',
            corpo: `${record.nome} si è unito alla famiglia`,
            url: '/profilo'
          };

      await inviaPushAProfili(membri.map((m) => m.id), notifica);
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Errore in notify-nuovo-utente:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});