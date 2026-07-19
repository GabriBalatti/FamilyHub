import { createClient } from 'npm:@supabase/supabase-js@2';
import { inviaPushAProfili } from '../_shared/webpush.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req) => {
  const { record } = await req.json(); // la nuova riga di "profili"

  const { data: membri } = await supabase
    .from('profili')
    .select('id')
    .eq('famiglia_id', record.famiglia_id)
    .neq('id', record.id); // esclude chi si è appena unito

  if (membri && membri.length > 0) {
    await inviaPushAProfili(
      membri.map((m) => m.id),
      {
        titolo: 'Nuovo membro in famiglia',
        corpo: `${record.nome} si è unito alla famiglia`,
        url: '/profilo'
      }
    );
  }

  return new Response('ok', { status: 200 });
});