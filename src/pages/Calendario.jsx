import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Trash2, Clock, MapPin, Users } from 'lucide-react';
import IconCalendario from '../assets/icons/calendario.svg?react';

export default function Calendario() {
  const { profilo } = useAuth();
  const [appuntamenti, setAppuntamenti] = useState([]);
  const [membri, setMembri] = useState([]);
  const [titolo, setTitolo] = useState('');
  const [dataInizio, setDataInizio] = useState('');
  const [luogo, setLuogo] = useState('');
  const [partecipanti, setPartecipanti] = useState([]);

  useEffect(() => {
    caricaAppuntamenti();
    caricaMembri();

    const canale = supabase
      .channel('appuntamenti-canale')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appuntamenti' },
        () => caricaAppuntamenti()
      )
      .subscribe();

    return () => supabase.removeChannel(canale);
  }, []);

  async function caricaAppuntamenti() {
    const { data } = await supabase
      .from('appuntamenti')
      .select('*')
      .gte('data_inizio', new Date().toISOString().slice(0, 10))
      .order('data_inizio', { ascending: true });
    setAppuntamenti(data || []);
  }

  async function caricaMembri() {
    const { data } = await supabase
      .from('profili')
      .select('id, nome, colore')
      .eq('famiglia_id', profilo.famiglia_id);
    setMembri(data || []);
  }

  async function aggiungi(e) {
    e.preventDefault();
    if (!titolo.trim() || !dataInizio) return;

    const dataLocale = new Date(dataInizio);

    await supabase.from('appuntamenti').insert({
      famiglia_id: profilo.famiglia_id,
      titolo,
      data_inizio: dataLocale.toISOString(),
      luogo: luogo || null,
      partecipanti,
      created_by: profilo.id
    });

    setTitolo('');
    setDataInizio('');
    setLuogo('');
    setPartecipanti([]);
  }

  async function elimina(id) {
    await supabase.from('appuntamenti').delete().eq('id', id);
  }

  function togglePartecipante(id) {
    setPartecipanti((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function getNomeMembro(id) {
    return membri.find((m) => m.id === id)?.nome || '?';
  }

  function formattaData(iso) {
    return new Date(iso).toLocaleString('it-IT', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  return (
    <div className="pagina">
      <h2><IconCalendario width={22} height={22} /> Appuntamenti</h2>

      <form onSubmit={aggiungi} className="form-rapido form-colonna">
        <label className="campo-label">
          Titolo*
          <input
            type="text"
            placeholder="Visita dal dentista..."
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
          />
        </label>
        <label className="campo-label">
          Data e ora*
          <input
            type="datetime-local"
            value={dataInizio}
            onChange={(e) => setDataInizio(e.target.value)}
          />
        </label>
        <label className="campo-label">
          Luogo
          <input
            type="text"
            placeholder="Gordona..."
            value={luogo}
            onChange={(e) => setLuogo(e.target.value)}
          />
        </label>
        <label className="campo-label">
          Partecipanti
          <div className="selettore-membri">
            {membri.map((m) => (
              <label key={m.id} className="chip">
                <input
                  type="checkbox"
                  checked={partecipanti.includes(m.id)}
                  onChange={() => togglePartecipante(m.id)}
                />
                {m.nome}
              </label>
            ))}
          </div>
        </label>
        <br />
        <button type="submit">Aggiungi appuntamento</button>
      </form>

      <ul className="lista-elementi">
        {appuntamenti.map((a) => (
          <li key={a.id}>
            <div className="contenuto">
              <span className="titolo">{a.titolo}</span>
              <div className="meta">
                <span className="data">
                  <Clock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  {formattaData(a.data_inizio)}
                </span>
                {a.luogo && (
                  <span>
                    <MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    {a.luogo}
                  </span>
                )}
              </div>
              {a.partecipanti?.length > 0 && (
                <div className="meta">
                  <Users size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                  {a.partecipanti.map(getNomeMembro).join(', ')}
                </div>
              )}
            </div>
            <button className="elimina" onClick={() => elimina(a.id)}>
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {appuntamenti.length === 0 && <p className="vuoto">Nessun appuntamento in programma</p>}
      </ul>
    </div>
  );
}