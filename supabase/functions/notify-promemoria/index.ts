import { createClient } from 'npm:@supabase/supabase-js@2';
import { inviaPushAProfili } from '../_shared/webpush.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

async function giaInviate(tipo: string, riferimentoIds: string[]): Promise<Set<string>> {
  if (riferimentoIds.length === 0) return new Set();
  const { data } = await supabase
    .from('notifiche_log')
    .select('riferimento_id')
    .eq('tipo', tipo)
    .in('riferimento_id', riferimentoIds);
  return new Set((data ?? []).map((r) => r.riferimento_id));
}

async function registraInvio(tipo: string, riferimentoId: string, profiloIds: string[]) {
  if (profiloIds.length === 0) return;
  await supabase.from('notifiche_log').insert(
    profiloIds.map((profilo_id) => ({ profilo_id, tipo, riferimento_id: riferimentoId }))
  );
}

Deno.serve(async (_req) => {
  try {
    const ora = Date.now();

    // ---------- Eventi: 24h prima ----------
    const { data: eventi24h } = await supabase
      .from('appuntamenti')
      .select('id, titolo, partecipanti')
      .gte('data_inizio', new Date(ora + 23 * 3600_000).toISOString())
      .lte('data_inizio', new Date(ora + 25 * 3600_000).toISOString());

    const giaFatti24h = await giaInviate('evento_promemoria_24h', (eventi24h ?? []).map((e) => e.id));
    for (const evento of eventi24h ?? []) {
      if (giaFatti24h.has(evento.id)) continue;
      const destinatari: string[] = evento.partecipanti ?? [];
      if (destinatari.length === 0) continue;
      await inviaPushAProfili(destinatari, {
        titolo: 'Promemoria evento',
        corpo: `${evento.titolo} è domani`,
        url: '/calendario'
      });
      await registraInvio('evento_promemoria_24h', evento.id, destinatari);
    }

    // ---------- Eventi: all'orario di inizio ----------
    const { data: eventiInizio } = await supabase
      .from('appuntamenti')
      .select('id, titolo, partecipanti')
      .gte('data_inizio', new Date(ora - 5 * 60_000).toISOString())
      .lte('data_inizio', new Date(ora + 20 * 60_000).toISOString());

    const giaFattiInizio = await giaInviate('evento_promemoria_inizio', (eventiInizio ?? []).map((e) => e.id));
    for (const evento of eventiInizio ?? []) {
      if (giaFattiInizio.has(evento.id)) continue;
      const destinatari: string[] = evento.partecipanti ?? [];
      if (destinatari.length === 0) continue;
      await inviaPushAProfili(destinatari, {
        titolo: 'Evento in corso',
        corpo: `${evento.titolo} inizia ora`,
        url: '/calendario'
      });
      await registraInvio('evento_promemoria_inizio', evento.id, destinatari);
    }

    // ---------- Date di riferimento in ora italiana ----------
    const { data: oggi } = await supabase.rpc('data_locale', { giorni_offset: 0 });
    const { data: domani } = await supabase.rpc('data_locale', { giorni_offset: 1 });

    // ---------- Faccende: scadenza domani ----------
    const { data: faccende24h } = await supabase
      .from('faccende')
      .select('id, titolo, assegnato_a')
      .eq('scadenza', domani)
      .eq('fatto', false)
      .not('assegnato_a', 'is', null);

    const faccendeGiaFatte24h = await giaInviate('faccenda_promemoria_24h', (faccende24h ?? []).map((f) => f.id));
    for (const faccenda of faccende24h ?? []) {
      if (faccendeGiaFatte24h.has(faccenda.id)) continue;
      await inviaPushAProfili([faccenda.assegnato_a], {
        titolo: 'Promemoria faccenda',
        corpo: `${faccenda.titolo} scade domani`,
        url: '/faccende'
      });
      await registraInvio('faccenda_promemoria_24h', faccenda.id, [faccenda.assegnato_a]);
    }

    // ---------- Faccende: scadenza oggi ----------
    const { data: faccendeOggi } = await supabase
      .from('faccende')
      .select('id, titolo, assegnato_a')
      .eq('scadenza', oggi)
      .eq('fatto', false)
      .not('assegnato_a', 'is', null);

    const faccendeGiaFatteOggi = await giaInviate('faccenda_promemoria_giorno', (faccendeOggi ?? []).map((f) => f.id));
    for (const faccenda of faccendeOggi ?? []) {
      if (faccendeGiaFatteOggi.has(faccenda.id)) continue;
      await inviaPushAProfili([faccenda.assegnato_a], {
        titolo: 'Faccenda in scadenza oggi',
        corpo: faccenda.titolo,
        url: '/faccende'
      });
      await registraInvio('faccenda_promemoria_giorno', faccenda.id, [faccenda.assegnato_a]);
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    console.error('Errore in notify-promemoria:', err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});