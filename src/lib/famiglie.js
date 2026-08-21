import { supabase } from './supabase';

// Cerca una famiglia dato il codice invito. Ritorna null se non esiste.
export async function trovaFamigliaDaCodice(codice) {
  if (!codice) return null;

  const { data, error } = await supabase
    .from('famiglie')
    .select('id, nome, codice_invito')
    .eq('codice_invito', codice.trim().toLowerCase())
    .single();

  if (error || !data) return null;
  return data;
}