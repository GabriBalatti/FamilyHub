import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Faccende() {
  const { profilo } = useAuth();
  const [faccende, setFaccende] = useState([]);
  const [membri, setMembri] = useState([]);
  const [titolo, setTitolo] = useState('');
  const [assegnatoA, setAssegnatoA] = useState('');
  const [scadenza, setScadenza] = useState('');

  useEffect(() => {
    caricaFaccende();
    caricaMembri();

    // Realtime: aggiorna in automatico quando qualcuno modifica
    const canale = supabase
      .channel('faccende-canale')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faccende' },
        () => caricaFaccende()
      )
      .subscribe();

    return () => supabase.removeChannel(canale);
  }, []);

  async function caricaFaccende() {
    const { data } = await supabase
      .from('faccende')
      .select('*, profili!faccende_assegnato_a_fkey(nome, colore)')
      .order('fatto', { ascending: true })
      .order('scadenza', { ascending: true, nullsFirst: false });
    setFaccende(data || []);
  }

  async function caricaMembri() {
    const { data } = await supabase
      .from('profili')
      .select('id, nome, colore')
      .eq('famiglia_id', profilo.famiglia_id);
    setMembri(data || []);
  }

  async function aggiungiFaccenda(e) {
    e.preventDefault();
    if (!titolo.trim()) return;

    await supabase.from('faccende').insert({
      famiglia_id: profilo.famiglia_id,
      titolo,
      assegnato_a: assegnatoA || null,
      scadenza: scadenza || null,
      created_by: profilo.id
    });

    setTitolo('');
    setAssegnatoA('');
    setScadenza('');
  }

  async function toggleFatto(id, faccendaCorrente) {
    await supabase
      .from('faccende')
      .update({ fatto: !faccendaCorrente })
      .eq('id', id);
  }

  async function elimina(id) {
    await supabase.from('faccende').delete().eq('id', id);
  }

  return (
    <div className="pagina">
      <h2>🧹 Faccende domestiche</h2>

      <form onSubmit={aggiungiFaccenda} className="form-rapido">
        <input
          type="text"
          placeholder="Cosa c'è da fare?"
          value={titolo}
          onChange={(e) => setTitolo(e.target.value)}
        />
        <select value={assegnatoA} onChange={(e) => setAssegnatoA(e.target.value)}>
          <option value="">Chi se ne occupa?</option>
          {membri.map((m) => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <input
          type="date"
          value={scadenza}
          onChange={(e) => setScadenza(e.target.value)}
        />
        <button type="submit">Aggiungi</button>
      </form>

      <ul className="lista-elementi">
        {faccende.map((f) => (
          <li key={f.id} className={f.fatto ? 'completato' : ''}>
            <input
              type="checkbox"
              checked={f.fatto}
              onChange={() => toggleFatto(f.id, f.fatto)}
            />
            <div className="contenuto">
              <span className="titolo">{f.titolo}</span>
              <div className="meta">
                {f.profili && (
                  <span className="badge" style={{ background: f.profili.colore }}>
                    {f.profili.nome}
                  </span>
                )}
                {f.scadenza && <span className="data">📅 {f.scadenza}</span>}
              </div>
            </div>
            <button className="elimina" onClick={() => elimina(f.id)}>✕</button>
          </li>
        ))}
        {faccende.length === 0 && <p className="vuoto">Nessuna faccenda. Tutto fatto! 🎉</p>}
      </ul>
    </div>
  );
}
