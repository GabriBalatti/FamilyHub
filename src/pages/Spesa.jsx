import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export default function Spesa() {
  const { profilo } = useAuth();
  const [listaId, setListaId] = useState(null);
  const [elementi, setElementi] = useState([]);
  const [nome, setNome] = useState('');
  const [quantita, setQuantita] = useState('');

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!listaId) return;

    caricaElementi();

    const canale = supabase
      .channel('spesa-canale')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'elementi_spesa' },
        () => caricaElementi()
      )
      .subscribe();

    return () => supabase.removeChannel(canale);
  }, [listaId]);

  async function init() {
    // Cerca la lista spesa principale, altrimenti la crea
    let { data: liste } = await supabase
      .from('liste_spesa')
      .select('id')
      .eq('famiglia_id', profilo.famiglia_id)
      .limit(1);

    if (!liste || liste.length === 0) {
      const { data: nuovaLista } = await supabase
        .from('liste_spesa')
        .insert({ famiglia_id: profilo.famiglia_id, nome: 'Spesa' })
        .select()
        .single();
      setListaId(nuovaLista.id);
    } else {
      setListaId(liste[0].id);
    }
  }

  async function caricaElementi() {
    const { data } = await supabase
      .from('elementi_spesa')
      .select('*')
      .eq('lista_id', listaId)
      .order('comprato', { ascending: true })
      .order('created_at', { ascending: false });
    setElementi(data || []);
  }

  async function aggiungi(e) {
    e.preventDefault();
    if (!nome.trim()) return;

    await supabase.from('elementi_spesa').insert({
      lista_id: listaId,
      nome,
      quantita: quantita || null,
      aggiunto_da: profilo.id
    });

    setNome('');
    setQuantita('');
  }

  async function toggleComprato(id, comprato) {
    await supabase
      .from('elementi_spesa')
      .update({ comprato: !comprato })
      .eq('id', id);
  }

  async function elimina(id) {
    await supabase.from('elementi_spesa').delete().eq('id', id);
  }

  async function svuotaComprati() {
    await supabase
      .from('elementi_spesa')
      .delete()
      .eq('lista_id', listaId)
      .eq('comprato', true);
  }

  return (
    <div className="pagina">
      <h2>🛒 Lista della spesa</h2>

      <form onSubmit={aggiungi} className="form-rapido">
        <input
          type="text"
          placeholder="Cosa serve?"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          type="text"
          placeholder="Quantità (es. 2kg)"
          value={quantita}
          onChange={(e) => setQuantita(e.target.value)}
          className="input-piccolo"
        />
        <button type="submit">Aggiungi</button>
      </form>

      <ul className="lista-elementi">
        {elementi.map((el) => (
          <li key={el.id} className={el.comprato ? 'completato' : ''}>
            <input
              type="checkbox"
              checked={el.comprato}
              onChange={() => toggleComprato(el.id, el.comprato)}
            />
            <div className="contenuto">
              <span className="titolo">{el.nome}</span>
              {el.quantita && <span className="meta">{el.quantita}</span>}
            </div>
            <button className="elimina" onClick={() => elimina(el.id)}>✕</button>
          </li>
        ))}
        {elementi.length === 0 && <p className="vuoto">Lista vuota. Aggiungi qualcosa! 🛍️</p>}
      </ul>

      {elementi.some((el) => el.comprato) && (
        <button className="bottone-secondario" onClick={svuotaComprati}>
          Svuota elementi comprati
        </button>
      )}
    </div>
  );
}
